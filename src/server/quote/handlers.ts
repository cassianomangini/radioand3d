import {
  QuoteHttpError, exactKeys, existingSessionToken, issueSessionCookie,
  newQuoteSession, ownerHash, rateLimitHash, readQuoteJson, record,
  requireQuoteEnabled, requireSameOriginJson, responseError, responseJson, uuid,
} from './http.ts';
import { createQuoteGateway, type QuoteGateway, type QuoteProjectType } from './supabase-gateway.ts';
import { validateQuoteFiles } from '../../features/studio/quote-contract.ts';
import {
  classifyQuoteRequestDraft, parseQuoteRequestDraft, validateQuoteRequestDraft,
} from '../../features/studio/quote-request-contract.ts';
import { detectQuoteFile } from './file-sniffer.ts';

const TYPES: readonly string[] = ['impressao', 'placa', 'caixa', 'outro'];
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
    const policy = validateQuoteFiles([{ name, size: body.size as number }]);
    if (!policy.ok) throw new QuoteHttpError(400, 'invalid_quote_upload');
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
    // Supabase upload signatures live for 2 hours. A retry must not mint a
    // signature that outlives the database reservation (3 hours from init).
    const remainingMs = Date.parse(reserved.reservation_expires_at) - Date.now();
    if (!Number.isFinite(remainingMs) || remainingMs < 2 * 60 * 60 * 1000 + 5 * 60 * 1000) {
      throw new QuoteHttpError(409, 'upload_reservation_expiring');
    }
    const signed = await db.signUpload(reserved.object_path);
    return responseJson({
      attachmentId: reserved.attachment_id,
      uploadEndpoint: signed.endpoint,
      uploadPath: reserved.object_path,
      uploadToken: signed.token,
      // Signed TUS uploads send x-signature and MUST NOT send a service key.
      tokenHeader: 'x-signature',
      uploadTokenExpiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      reservationExpiresAt: reserved.reservation_expires_at,
    }, 200);
  } catch (error) { return responseError(error); }
}

/** Confirm Storage existence + bounded signature read before a database transition. */
export async function handleQuoteAttachmentComplete(
  request: Request, gateway?: QuoteGateway
): Promise<Response> {
  try {
    requireQuoteEnabled();
    requireSameOriginJson(request);
    const token = existingSessionToken(request);
    const hash = token && ownerHash(token);
    if (!hash) throw new QuoteHttpError(403, 'quote_session_invalid');
    const body = await readQuoteJson(request);
    if (!record(body) || !exactKeys(body, ['requestId','attachmentId']) ||
      !uuid(body.requestId) || !uuid(body.attachmentId)) {
      throw new QuoteHttpError(400, 'invalid_quote_attachment');
    }

    const db = gateway ?? createQuoteGateway();
    if (!await db.consumeRate('upload', rateLimitHash(request))) {
      throw new QuoteHttpError(429, 'quote_rate_limited');
    }
    const owned = await db.ownedAttachment(body.requestId, hash, body.attachmentId);
    if (owned.validation_status === 'validated' &&
      owned.validated_size_bytes !== null) {
      return responseJson({ attachmentId: owned.attachment_id, validated: true });
    }
    if (!['pending-upload','uploaded'].includes(owned.validation_status)) {
      throw new QuoteHttpError(409, 'quote_file_invalid');
    }

    const actualSize = await db.storageFileSize(owned.storage_path);
    if (actualSize !== owned.reported_size_bytes) {
      throw new QuoteHttpError(409, 'quote_file_size_mismatch');
    }
    const head = await db.readStorageRange(owned.storage_path, 0,
      Math.min(actualSize, 131_072) - 1);
    // 3MF requires a bounded check of the ZIP central directory; a generic
    // ZIP magic prefix must never be enough to approve a 3D manufacturing file.
    const tail = owned.extension === '.3mf'
      ? await db.readStorageRange(owned.storage_path,
        Math.max(0, actualSize - 65_536), actualSize - 1)
      : undefined;
    const detected = detectQuoteFile(owned.extension, head, actualSize, tail);
    if (!detected) throw new QuoteHttpError(409, 'unsupported_file_content');

    await db.validateAttachment(body.requestId, hash, body.attachmentId, actualSize, detected);
    return responseJson({ attachmentId: owned.attachment_id, validated: true });
  } catch (error) { return responseError(error); }
}

/** Finalize an owned draft atomically; browser never selects triage classification. */
export async function handleQuoteSubmit(
  request: Request, gateway?: QuoteGateway
): Promise<Response> {
  try {
    requireQuoteEnabled();
    requireSameOriginJson(request);
    const token = existingSessionToken(request);
    const hash = token && ownerHash(token);
    if (!hash) throw new QuoteHttpError(403, 'quote_session_invalid');
    const data = await readQuoteJson(request);
    if (!record(data) || !exactKeys(data, ['requestId','submissionKey','draft','attachmentIds']) ||
      !uuid(data.requestId) || !uuid(data.submissionKey) ||
      !Array.isArray(data.attachmentIds) || data.attachmentIds.length > 5 ||
      !data.attachmentIds.every(uuid) ||
      new Set(data.attachmentIds).size !== data.attachmentIds.length) {
      throw new QuoteHttpError(400, 'invalid_quote_submit');
    }
    const parsed = parseQuoteRequestDraft(data.draft);
    if (!parsed.ok) throw new QuoteHttpError(400, 'invalid_quote_submit');
    const draft = parsed.draft;
    const valid = validateQuoteRequestDraft(draft);
    if (!valid.ok || draft.attachments.length !== data.attachmentIds.length ||
      draft.startingPoints.length > 12 ||
      draft.startingPoints.some(point => point.length > 160) ||
      draft.source.origin && draft.source.origin.length > 160 ||
      draft.source.reference && draft.source.reference.length > 300 ||
      draft.contact.name.length > 160 || draft.contact.value.length > 320) {
      throw new QuoteHttpError(400, 'invalid_quote_submit');
    }
    const triage = classifyQuoteRequestDraft(draft);
    if (triage.status === 'incomplete') throw new QuoteHttpError(400, 'invalid_quote_submit');
    const db = gateway ?? createQuoteGateway();
    if (!await db.consumeRate('submit', rateLimitHash(request))) {
      throw new QuoteHttpError(429, 'quote_rate_limited');
    }
    const receipt = await db.submitQuote({
      requestId: data.requestId,
      ownerHash: hash,
      submissionKey: data.submissionKey,
      projectType: draft.projectType,
      noFile: draft.noFile,
      startingPoints: draft.startingPoints,
      sourceOrigin: draft.source.origin ?? null,
      sourceReference: draft.source.reference ?? null,
      production: { ...draft.production },
      project: { ...draft.project },
      contactMethod: draft.contact.method,
      contactName: draft.contact.name.trim(),
      contactValue: draft.contact.value.trim(),
      triageStatus: triage.status,
      attachmentIds: data.attachmentIds,
    });
    return responseJson({ requestId: receipt.request_id, submittedAt: receipt.submission_time }, 201);
  } catch (error) { return responseError(error); }
}
