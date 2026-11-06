import {
  QuoteHttpError, exactKeys, existingSessionToken, issueSessionCookie,
  newQuoteSession, ownerHash, rateLimitHash, readQuoteJson, record,
  requireQuoteEnabled, requireSameOriginJson, responseError, responseJson, uuid,
} from './http';
import { createQuoteGateway, type QuoteGateway, type QuoteProjectType } from './supabase-gateway';
import { quoteFileRoleAllows, validateQuoteFiles } from '../../features/quote/file-policy';
import { detectQuoteFile } from './file-sniffer';
import { validate3mfArchive } from './zip-3mf';
import { parseQuoteAttachments, parseQuoteForm, prepareQuoteForStorage, validateQuoteForm } from './form-contract';
import { quoteEmailMessage, requireQuoteEmailConfig, sendQuoteEmail } from './email';
import { verifyQuoteTurnstile } from './turnstile';
import { studioPhotoKeyFromId } from '@/features/studio/r2-photos';
import { getSiteCatalog } from '@/server/products/catalog';

const TYPES: readonly string[] = ['impressao', 'placa', 'caixa', 'outro'];
/** Starts a new draft; a cookie never grants access to another draft ID. */
export async function handleQuoteSession(
  request: Request, gateway?: QuoteGateway,
  verifier: typeof verifyQuoteTurnstile = verifyQuoteTurnstile,
): Promise<Response> {
  try {
    requireQuoteEnabled();
    requireSameOriginJson(request);
    const data = await readQuoteJson(request);
    if (!record(data) || !exactKeys(data, ['projectType', 'turnstileToken']) ||
      typeof data.projectType !== 'string' || !TYPES.includes(data.projectType) ||
      typeof data.turnstileToken !== 'string' ||
      data.turnstileToken.length < 1 || data.turnstileToken.length > 2048) {
      throw new QuoteHttpError(400, 'invalid_project_type');
    }
    const db = gateway ?? createQuoteGateway();
    if (!await db.consumeRate('create', rateLimitHash(request))) {
      throw new QuoteHttpError(429, 'quote_rate_limited');
    }
    // Rate limit first; invalid/replayed tokens still consume the hourly budget.
    await verifier(request, data.turnstileToken);
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
  let metricGateway: QuoteGateway | undefined;
  try {
    requireQuoteEnabled();
    requireSameOriginJson(request);
    const token = existingSessionToken(request);
    const hash = token && ownerHash(token);
    if (!hash) throw new QuoteHttpError(403, 'quote_session_invalid');
    const body = await readQuoteJson(request);
    if (!record(body) || !exactKeys(body, ['requestId','uploadKey','name','size','type','role']) ||
      !uuid(body.requestId) || !uuid(body.uploadKey) ||
      typeof body.role !== 'string' ||
      typeof body.name !== 'string' || body.name.length < 1 || body.name.length > 255 ||
      /[\u0000-\u001f\u007f]/.test(body.name) ||
      !Number.isSafeInteger(body.size) || (body.size as number) < 1 || (body.size as number) > 50_000_000 ||
      (body.type !== undefined && (typeof body.type !== 'string' || body.type.length > 120))) {
      throw new QuoteHttpError(400, 'invalid_quote_upload');
    }
    const name = body.name as string;
    if (!quoteFileRoleAllows(body.role, name)) {
      throw new QuoteHttpError(400, 'invalid_quote_upload');
    }
    const extension = name.slice(name.lastIndexOf('.')).toLowerCase();
    const policy = validateQuoteFiles([{ name, size: body.size as number }]);
    if (!policy.ok) throw new QuoteHttpError(400, 'invalid_quote_upload');
    const db = gateway ?? createQuoteGateway();
    metricGateway = db;
    if (!await db.consumeRate('upload', rateLimitHash(request))) {
      throw new QuoteHttpError(429, 'quote_rate_limited');
    }
    const reserved = await db.reserveAttachment({
      requestId: body.requestId, ownerHash: hash, uploadKey: body.uploadKey,
      originalName: name, extension,
      reportedMime: typeof body.type === 'string' ? body.type : null,
      sizeBytes: body.size as number,
    });
    // Signed token lives up to 2h, but the TUS upload URL opened at the end
    // of that window may remain valid for another 24h. Reservations last 27h
    // (2h + 24h + 1h margin); never re-sign beyond that safety window.
    const remainingMs = Date.parse(reserved.reservation_expires_at) - Date.now();
    const maximumNewTusLifetimeMs = (2 + 24) * 60 * 60 * 1000 + 5 * 60 * 1000;
    if (!Number.isFinite(remainingMs) || remainingMs < maximumNewTusLifetimeMs) {
      throw new QuoteHttpError(409, 'upload_reservation_expiring');
    }
    const signed = await db.signUpload(reserved.object_path);
    try { await db.recordUploadOutcome?.('accepted', 'signed'); }
    catch { console.error('[quote-observability] upload_metric_unavailable'); }
    return responseJson({
      attachmentId: reserved.attachment_id,
      uploadEndpoint: signed.endpoint,
      uploadPath: reserved.object_path,
      uploadToken: signed.token,
      // Signed TUS uploads send x-signature and MUST NOT send a service key.
      tokenHeader: 'x-signature',
      uploadTokenExpiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      reservationExpiresAt: reserved.reservation_expires_at,
    }, 200, { 'Set-Cookie': issueSessionCookie(token) });
  } catch (error) {
    if (metricGateway && error instanceof QuoteHttpError) {
      // Do not persist repeated rate-limit denials: an attacker could grow
      // quote_events without ever passing the upload rate window.
      const reason = error.code === 'quote_storage_budget_reached' ? 'capacity'
        : error.code === 'quote_file_limit_reached' ? 'request_limit'
        : ['quote_conflict', 'upload_reservation_expiring'].includes(error.code) ? 'reservation'
        : null;
      if (reason) {
        try { await metricGateway.recordUploadOutcome?.('blocked', reason); }
        catch { console.error('[quote-observability] upload_metric_unavailable'); }
      }
    }
    return responseError(error);
  }
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
      return responseJson({ attachmentId: owned.attachment_id, validated: true }, 200,
        { 'Set-Cookie': issueSessionCookie(token) });
    }
    if (!['pending-upload','uploaded'].includes(owned.validation_status)) {
      throw new QuoteHttpError(409, 'quote_file_invalid');
    }

    const actualSize = await db.storageFileSize(owned.storage_path);
    if (actualSize !== owned.reported_size_bytes) {
      throw new QuoteHttpError(409, 'quote_file_size_mismatch');
    }
    // The signed upload URL must not turn an oversized object into a validated attachment.
    if (!validateQuoteFiles([{ name: owned.original_name, size: actualSize }]).ok) {
      throw new QuoteHttpError(409, 'quote_file_invalid');
    }
    const detected = owned.extension === '.3mf'
      ? (await validate3mfArchive(
          actualSize,
          (first, last) => db.readStorageRange(owned.storage_path, first, last),
        ) ? '3mf-zip' : null)
      : detectQuoteFile(
          owned.extension,
          await db.readStorageRange(owned.storage_path, 0,
            Math.min(actualSize, 131_072) - 1),
          actualSize,
        );
    if (!detected) throw new QuoteHttpError(409, 'unsupported_file_content');

    await db.validateAttachment(body.requestId, hash, body.attachmentId, actualSize, detected);
    return responseJson({ attachmentId: owned.attachment_id, validated: true }, 200,
      { 'Set-Cookie': issueSessionCookie(token) });
  } catch (error) { return responseError(error); }
}

/** Finalize an owned draft atomically; browser never selects triage classification. */
export async function handleQuoteSubmit(
  request: Request, gateway?: QuoteGateway, mailer: typeof sendQuoteEmail = sendQuoteEmail,
  catalogReader: typeof getSiteCatalog = getSiteCatalog,
): Promise<Response> {
  try {
    requireSameOriginJson(request);
    requireQuoteEmailConfig();
    const token = existingSessionToken(request);
    const hash = token && ownerHash(token);
    if (!hash) throw new QuoteHttpError(403, 'quote_session_invalid');
    const data = await readQuoteJson(request);
    if (!record(data) || !exactKeys(data, ['requestId','submissionKey','draft','attachments']) ||
      !uuid(data.requestId) || !uuid(data.submissionKey) ||
      !record(data.draft) || !Array.isArray(data.attachments)) {
      throw new QuoteHttpError(400, 'invalid_quote_submit');
    }
    const db = gateway ?? createQuoteGateway();
    // A completed operation with the same ownership + submission key is
    // a replay. Read the stored request for its email, even if flags, catalog
    // availability or form validation rules have changed since submission.
    const replay = await db.submissionReceipt(data.requestId, hash, data.submissionKey);
    let receipt = replay;
    if (!receipt) {
      requireQuoteEnabled();
      const draft = parseQuoteForm(data.draft);
      const attachments = parseQuoteAttachments(data.attachments);
      if (!draft || !attachments || !validateQuoteForm(draft, attachments)) {
        throw new QuoteHttpError(400, 'invalid_quote_submit');
      }
      if (draft.type === 'arquivo' && draft.modelItems?.length &&
          process.env.CM_QUOTE_MULTIMODEL_ENABLED !== 'true') {
        throw new QuoteHttpError(503, 'quote_multimodel_unavailable');
      }
      if (draft.studioPhotoId) {
        let photoKey: string | null;
        try { photoKey = studioPhotoKeyFromId(draft.studioPhotoId); }
        catch { throw new QuoteHttpError(503, 'studio_reference_unavailable'); }
        if (!photoKey) throw new QuoteHttpError(400, 'invalid_quote_submit');
      }
      if (draft.productSlug) {
        if (draft.type !== 'outro') throw new QuoteHttpError(400, 'invalid_quote_submit');
        const catalog = await catalogReader();
        if (catalog.state === 'unavailable') throw new QuoteHttpError(503, 'product_reference_unavailable');
        const product = catalog.products.find((entry) => entry.slug === draft.productSlug);
        if (product?.sourceStatus !== 'NORMAL') {
          throw new QuoteHttpError(400, 'invalid_quote_submit');
        }
      }
      const prepared = prepareQuoteForStorage(draft, attachments);
      if (!await db.consumeRate('submit', rateLimitHash(request))) {
        throw new QuoteHttpError(429, 'quote_rate_limited');
      }
      receipt = await db.submitQuote({
        requestId: data.requestId,
        ownerHash: hash,
        submissionKey: data.submissionKey,
        ...prepared,
      });
    }
    try {
      if (!await db.emailWasSent(receipt.request_id)) {
        const notification = await db.notificationData(receipt.request_id, hash);
        await mailer(receipt.request_id, quoteEmailMessage(receipt.request_id, notification, new URL(request.url).origin));
        await db.recordEmailSent(receipt.request_id);
      }
    } catch {
      return responseJson({
        error: 'quote_email_pending', requestId: receipt.request_id,
        submittedAt: receipt.submission_time,
      }, 202);
    }
    return responseJson({ requestId: receipt.request_id, submittedAt: receipt.submission_time }, 201);
  } catch (error) { return responseError(error); }
}
