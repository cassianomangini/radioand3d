import { createHmac } from 'node:crypto';
import { isIP } from 'node:net';
import {
  QUOTE_SESSION_COOKIE_NAME,
  QUOTE_SESSION_TTL_SECONDS,
  issueQuoteSessionToken,
  quoteSessionOwnerHash,
} from './session-token.ts';

export class QuoteHttpError extends Error {
  readonly status: number;
  readonly code: string;
  constructor(status: number, code: string) {
    super(code);
    this.status = status;
    this.code = code;
  }
}

const BODY_LIMIT = 16_384;
const NO_CACHE = { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' };

export function responseJson(value: unknown, status = 200, extra?: HeadersInit): Response {
  const headers = new Headers(NO_CACHE);
  if (extra) new Headers(extra).forEach((value, name) => headers.set(name, value));
  return Response.json(value, { status, headers });
}

export function responseError(error: unknown): Response {
  if (error instanceof QuoteHttpError) return responseJson({ error: error.code }, error.status);
  // Internal errors intentionally reveal no DB messages, tokens or request data.
  return responseJson({ error: 'quote_unavailable' }, 503);
}

export function requireQuoteEnabled(): void {
  if (process.env.CM_QUOTE_INTAKE_ENABLED !== 'true') {
    throw new QuoteHttpError(503, 'quote_not_available');
  }
}

export function requireSameOriginJson(request: Request): void {
  const origin = request.headers.get('origin');
  const requestOrigin = new URL(request.url).origin;
  if (!origin || origin !== requestOrigin ||
      request.headers.get('sec-fetch-site') === 'cross-site') {
    throw new QuoteHttpError(403, 'invalid_request_origin');
  }
  const type = request.headers.get('content-type')?.split(';', 1)[0]?.trim().toLowerCase();
  if (type !== 'application/json') throw new QuoteHttpError(415, 'invalid_content_type');
  const length = request.headers.get('content-length');
  if (length && (!/^\d+$/.test(length) || Number(length) > BODY_LIMIT)) {
    throw new QuoteHttpError(413, 'request_too_large');
  }
}

export async function readQuoteJson(request: Request): Promise<unknown> {
  const reader = request.body?.getReader();
  if (!reader) throw new QuoteHttpError(400, 'invalid_json');
  let size = 0;
  const chunks: Uint8Array[] = [];
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > BODY_LIMIT) throw new QuoteHttpError(413, 'request_too_large');
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const buffer = new Uint8Array(size);
  let position = 0;
  for (const chunk of chunks) { buffer.set(chunk, position); position += chunk.length; }
  try { return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(buffer)); }
  catch { throw new QuoteHttpError(400, 'invalid_json'); }
}

export function record(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

export function exactKeys(value: Record<string, unknown>, keys: readonly string[]): boolean {
  return Object.keys(value).every(k => keys.includes(k));
}

export function uuid(value: unknown): value is string {
  return typeof value === 'string' &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function requiredSecret(name: string): string {
  const value = process.env[name];
  if (!value || Buffer.byteLength(value, 'utf8') < 32) {
    throw new QuoteHttpError(503, 'quote_configuration_missing');
  }
  return value;
}

export function ownerHash(token: unknown): string | null {
  const secret = requiredSecret('CM_QUOTE_SESSION_SECRET');
  return quoteSessionOwnerHash(token, secret);
}

export function sessionCookieName(): string {
  return process.env.NODE_ENV === 'development' ? 'cm-quote-session-dev' : QUOTE_SESSION_COOKIE_NAME;
}

export function existingSessionToken(request: Request): string | null {
  const name = sessionCookieName();
  const values = (request.headers.get('cookie') ?? '').split(';')
    .map(kv => kv.trim()).filter(kv => kv.startsWith(`${name}=`));
  // Duplicate cookies are ambiguous: fail closed instead of choosing a token.
  if (values.length !== 1) return null;
  const token = values[0].slice(name.length + 1);
  return ownerHash(token) ? token : null;
}

export function issueSessionCookie(token: string): string {
  const name = sessionCookieName();
  const secure = process.env.NODE_ENV === 'development' ? '' : '; Secure';
  return `${name}=${token}; Max-Age=${QUOTE_SESSION_TTL_SECONDS}; Path=/; HttpOnly; SameSite=Strict${secure}`;
}

export function newQuoteSession(): { token: string; hash: string } {
  const token = issueQuoteSessionToken();
  const hash = ownerHash(token);
  if (!hash) throw new QuoteHttpError(503, 'quote_configuration_missing');
  return { token, hash };
}

function clientIp(request: Request): string {
  if (process.env.VERCEL === '1') {
    const forwarded = request.headers.get('x-vercel-forwarded-for')
      || request.headers.get('x-forwarded-for');
    const first = forwarded?.split(',', 1)[0]?.trim() || '';
    if (!isIP(first)) throw new QuoteHttpError(503, 'quote_network_unavailable');
    return first;
  }
  if (process.env.NODE_ENV === 'development') return 'development-loopback';
  // No trustworthy reverse proxy identity: disable public intake instead of
  // trusting an arbitrary visitor-provided X-Forwarded-For value.
  throw new QuoteHttpError(503, 'quote_network_unavailable');
}

export function rateLimitHash(request: Request): string {
  const key = requiredSecret('CM_QUOTE_RATE_LIMIT_SECRET');
  return createHmac('sha256', key).update('cm-quote-ip:v1\0').update(clientIp(request)).digest('hex');
}
