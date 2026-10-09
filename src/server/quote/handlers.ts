import {
  QuoteHttpError, exactKeys, existingSessionToken, issueSessionCookie,
  newQuoteSession, ownerHash, rateLimitHash, readQuoteJson, record,
  requireQuoteEnabled, requireSameOriginJson, responseError, responseJson, uuid,
} from './http.ts';
import { createQuoteGateway, type QuoteGateway, type QuoteProjectType } from './supabase-gateway.ts';

const TYPES: readonly string[] = ['impressao', 'placa', 'caixa', 'outro'];
const EXTENSIONS: readonly string[] = [
  '.stl', '.3mf', '.obj', '.step', '.stp', '.pdf', '.png', '.jpg', '.jpeg', '.webp',
];

/** Starts a new draft; a cookie never grants access to another draft ID. */
export async function handleQuoteSession(request: Request, gateway?: QuoteGateway): Promise<Response> {
  try {
    requireQuoteEnabled();
    requireSameOriginJson(request);
    const data = await readQuoteJson(request);
    if (!record(data) || !exactKeys(data, ['projectType']) ||
      typeof data.projectType !== 'string' || !TYPES.includes(data.projectType)) {
      throw new QuoteHttpError(400, 'invalid_project_type');
    }
    const db = gateway ?? createQuoteGateway();
    if (!await db.consumeRate('create', rateLimitHash(request))) {
      throw new QuoteHttpError(429, 'quote_rate_limited');
    }
    const previous = existingSessionToken(request);
    const { token, hash } = previous
      ? { token: previous, hash: ownerHash(previous) }
      : newQuoteSession();
    if (!hash) throw new QuoteHttpError(403, 'quote_session_invalid');
    const draft = await db.createDraft(hash, data.projectType as QuoteProjectType);
    return responseJson({ requestId: draft.id, expiresAt: draft.expires_at }, 201, {
      'Set-Cookie': issueSessionCookie(token),
    });
  } catch (error) { return responseError(error); }
}

/** Reserve object path+quota before issuing a time-limited, path-scoped TUS signature. */
export async function handleQuoteAttachmentInit(
  request: Request, gateway?: QuoteGateway
): Promise<Response> {
  try {
    requireQuoteEnabled();
    requireSameOriginJson(request);
    const token = existingSessionToken(request);
    const hash = token && ownerHash(token);
    if (!hash) throw new QuoteHttpError(403, 'quote_session_invalid');
    const body = await readQuoteJson(request);
    if (!record(body) || !exactKeys(body, ['requestId','uploadKey','name','size','type']) ||
      !uuid(body.requestId) || !uuid(body.uploadKey) ||
      typeof body.name !== 'string' || body.name.length < 1 || body.name.length > 255 ||
      /[\u0000-\u001f\u007f]/.test(body.name) ||
      !Number.isSafeInteger(body.size) || (body.size as number) < 1 || (body.size as number) > 50_000_000 ||
      (body.type !== undefined && (typeof body.type !== 'string' || body.type.length > 120))) {
      throw new QuoteHttpError(400, 'invalid_quote_upload');
    }
    const name = body.name as string;
    const extension = name.slice(name.lastIndexOf('.')).toLowerCase();
    if (!EXTENSIONS.includes(extension)) throw new QuoteHttpError(400, 'unsupported_file_type');
    const db = gateway ?? createQuoteGateway();
    if (!await db.consumeRate('upload', rateLimitHash(request))) {
      throw new QuoteHttpError(429, 'quote_rate_limited');
    }
    const reserved = await db.reserveAttachment({
      requestId: body.requestId, ownerHash: hash, uploadKey: body.uploadKey,
      originalName: name, extension,
      reportedMime: typeof body.type === 'string' ? body.type : null,
      sizeBytes: body.size as number,
    });
    const signed = await db.signUpload(reserved.object_path);
    return responseJson({
      attachmentId: reserved.attachment_id,
      uploadEndpoint: signed.endpoint,
      uploadPath: reserved.object_path,
      uploadToken: signed.token,
      // Signed TUS uploads send x-signature and MUST NOT send a service key.
      tokenHeader: 'x-signature',
      expiresAt: reserved.reservation_expires_at,
    }, 200);
  } catch (error) { return responseError(error); }
}
