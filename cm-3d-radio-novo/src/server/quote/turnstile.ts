import { QuoteHttpError } from './http';

const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
const TEST_SECRET_PREFIX = /^[123]x0{20,}/;

export function requireQuoteTurnstileConfig(): { siteKey: string; secretKey: string } {
  const siteKey = process.env.CM_QUOTE_TURNSTILE_SITE_KEY?.trim() || '';
  const secretKey = process.env.CM_QUOTE_TURNSTILE_SECRET_KEY?.trim() || '';
  if (!/^[A-Za-z0-9_-]{10,100}$/.test(siteKey) || secretKey.length < 20 ||
      (process.env.NODE_ENV === 'production' && TEST_SECRET_PREFIX.test(secretKey))) {
    // An unconfigured challenge must never silently disable bot protection.
    throw new QuoteHttpError(503, 'quote_configuration_missing');
  }
  return { siteKey, secretKey };
}

/** A token is short-lived and single-use; verification belongs on the server. */
export async function verifyQuoteTurnstile(
  request: Request, token: unknown, fetcher: typeof fetch = fetch,
): Promise<void> {
  const { secretKey } = requireQuoteTurnstileConfig();
  if (typeof token !== 'string' || token.length < 1 || token.length > 2048) {
    throw new QuoteHttpError(403, 'human_verification_required');
  }

  let result: Response;
  try {
    result = await fetcher(VERIFY_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret: secretKey, response: token }),
      redirect: 'error',
      cache: 'no-store',
      signal: AbortSignal.timeout(6_000),
    });
  } catch {
    throw new QuoteHttpError(503, 'quote_verification_unavailable');
  }
  if (!result.ok) throw new QuoteHttpError(503, 'quote_verification_unavailable');

  let body: unknown;
  try { body = await result.json(); }
  catch { throw new QuoteHttpError(503, 'quote_verification_unavailable'); }

  const payload = body as { success?: unknown; action?: unknown; hostname?: unknown } | null;
  if (!payload || payload.success !== true || payload.action !== 'quote_intake' ||
      payload.hostname !== new URL(request.url).hostname) {
    throw new QuoteHttpError(403, 'human_verification_required');
  }
}
