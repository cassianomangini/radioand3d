import { QuoteHttpError, uuid } from './http.ts';

export type QuoteAction = 'create' | 'upload' | 'submit';
export type QuoteProjectType = 'impressao' | 'placa' | 'caixa' | 'outro';
export type DraftCreated = { id: string; expires_at: string };
export type UploadReservation = {
  attachment_id: string;
  object_path: string;
  reservation_expires_at: string;
};
export type UploadInput = {
  requestId: string;
  ownerHash: string;
  uploadKey: string;
  originalName: string;
  extension: string;
  reportedMime: string | null;
  sizeBytes: number;
};

export type OwnedQuoteAttachment = {
  attachment_id: string;
  storage_path: string;
  original_name: string;
  extension: string;
  reported_size_bytes: number;
  validation_status: string;
  validated_size_bytes: number | null;
};
export type QuoteSubmitInput = {
  requestId: string;
  ownerHash: string;
  submissionKey: string;
  projectType: QuoteProjectType;
  noFile: boolean;
  startingPoints: string[];
  sourceOrigin: string | null;
  sourceReference: string | null;
  production: Record<string, unknown>;
  project: Record<string, unknown>;
  contactMethod: 'whatsapp' | 'email';
  contactName: string;
  contactValue: string;
  triageStatus: 'ready-for-review' | 'needs-information';
  attachmentIds: string[];
};

export type QuoteGateway = {
  consumeRate(action: QuoteAction, keyHash: string): Promise<boolean>;
  createDraft(ownerSessionHash: string, projectType: QuoteProjectType): Promise<DraftCreated>;
  reserveAttachment(input: UploadInput): Promise<UploadReservation>;
  signUpload(path: string): Promise<{ token: string; endpoint: string }>;
  ownedAttachment(requestId: string, ownerHash: string, attachmentId: string): Promise<OwnedQuoteAttachment>;
  storageFileSize(path: string): Promise<number>;
  readStorageRange(path: string, first: number, last: number): Promise<Uint8Array>;
  validateAttachment(requestId: string, ownerHash: string, attachmentId: string,
    sizeBytes: number, detectedType: string): Promise<void>;
  submissionReceipt(requestId: string, ownerHash: string, submissionKey: string):
    Promise<{ request_id: string; submission_time: string } | null>;
  submitQuote(input: QuoteSubmitInput): Promise<{ request_id: string; submission_time: string }>;
};

export function quoteServiceConfig(): { url: string; key: string } {
  const url = process.env.CM_SUPABASE_URL?.trim() || '';
  const key = process.env.CM_SUPABASE_SECRET_KEY?.trim() || '';
  let parsed: URL;
  try { parsed = new URL(url); }
  catch { throw new QuoteHttpError(503, 'quote_configuration_missing'); }
  if (parsed.protocol !== 'https:' || !/^[a-z0-9-]+\.supabase\.co$/.test(parsed.hostname) ||
    parsed.pathname !== '/' || parsed.search || parsed.hash || !key.startsWith('sb_secret_') || key.length < 30) {
    throw new QuoteHttpError(503, 'quote_configuration_missing');
  }
  return { url: parsed.origin, key };
}

function makeSupabaseRequest(fetcher: typeof fetch) {
  const { url, key } = quoteServiceConfig();
  async function api<T>(path: string, body: unknown, headers: Record<string, string> = {}): Promise<T> {
    // Only callers in this module supply paths. Never let user content choose a URL.
    let response: Response;
    try {
      response = await fetcher(`${url}${path}`, {
        method: 'POST',
        headers: { apikey: key, 'content-type': 'application/json', accept: 'application/json', ...headers },
        body: JSON.stringify(body),
        cache: 'no-store',
        redirect: 'error',
        signal: AbortSignal.timeout(9000),
      });
    } catch { throw new QuoteHttpError(503, 'quote_upstream_unavailable'); }
    if (!response.ok) {
      // Never return raw Supabase errors, which can contain object paths and metadata.
      let errorCode: unknown;
      try { errorCode = (await response.json() as {code?: unknown}).code; } catch { /* ignore */ }
      if (errorCode === '23514' || errorCode === '23505') throw new QuoteHttpError(409, 'quote_conflict');
      if (errorCode === 'P0001') throw new QuoteHttpError(404, 'quote_not_found');
      if (errorCode === '22023') throw new QuoteHttpError(400, 'invalid_quote_upload');
      throw new QuoteHttpError(response.status === 429 ? 429 : 503, 'quote_upstream_unavailable');
    }
    try { return await response.json() as T; }
    catch { throw new QuoteHttpError(503, 'quote_upstream_unavailable'); }
  }
  async function fileApi(path: string, headers: Record<string, string> = {}): Promise<Response> {
    let response: Response;
    try {
      response = await fetcher(`${url}${path}`, {
        method: 'GET',
        headers: { apikey: key, accept: '*/*', ...headers },
        cache: 'no-store',
        redirect: 'error',
        signal: AbortSignal.timeout(12_000),
      });
    } catch { throw new QuoteHttpError(503, 'quote_upstream_unavailable'); }
    if (!response.ok) {
      if (response.status === 404) throw new QuoteHttpError(409, 'quote_file_missing');
      throw new QuoteHttpError(503, 'quote_upstream_unavailable');
    }
    return response;
  }
  return { api, url, fileApi };
}

/** Server-only service transport: modern sb_secret key stays in apikey header. */
export function createQuoteGateway(fetcher: typeof fetch = fetch): QuoteGateway {
  const { api, url, fileApi } = makeSupabaseRequest(fetcher);
  const acceptedPath = /^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}\/[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}\.(?:stl|3mf|obj|step|stp|pdf|png|jpg|jpeg|webp)$/i;
  const assertPath = (path: string) => {
    if (!acceptedPath.test(path)) throw new QuoteHttpError(503, 'quote_upstream_unavailable');
  };
  return {
    async consumeRate(action, keyHash) {
      const result = await api<boolean>('/rest/v1/rpc/quote_consume_rate_limit',
        { p_action: action, p_key_hash: keyHash });
      if (typeof result !== 'boolean') throw new QuoteHttpError(503, 'quote_upstream_unavailable');
      return result;
    },
    async createDraft(ownerSessionHash, projectType) {
      const result = await api<DraftCreated[]>('/rest/v1/quote_requests?select=id,expires_at',
        { owner_session_hash: ownerSessionHash, project_type: projectType },
        { Prefer: 'return=representation' });
      if (!Array.isArray(result) || result.length !== 1 || !uuid(result[0]?.id) ||
        !Number.isFinite(Date.parse(result[0].expires_at))) {
        throw new QuoteHttpError(503, 'quote_upstream_unavailable');
      }
      return result[0];
    },
    async reserveAttachment(input) {
      const result = await api<UploadReservation[]>('/rest/v1/rpc/quote_reserve_attachment', {
        p_request_id: input.requestId,
        p_owner_session_hash: input.ownerHash,
        p_upload_key: input.uploadKey,
        p_original_name: input.originalName,
        p_extension: input.extension,
        p_reported_mime: input.reportedMime,
        p_size_bytes: input.sizeBytes,
      });
      const row = result?.[0];
      if (!Array.isArray(result) || result.length !== 1 || !uuid(row?.attachment_id) ||
        typeof row.object_path !== 'string' ||
        row.object_path !== `${input.requestId}/${row.attachment_id}${input.extension}` ||
        !Number.isFinite(Date.parse(row.reservation_expires_at))) {
        throw new QuoteHttpError(503, 'quote_upstream_unavailable');
      }
      return row;
    },
    async signUpload(path) {
      assertPath(path);
      // storage-js createSignedUploadUrl uses this same Storage API endpoint.
      const data = await api<{url: string}>(`/storage/v1/object/upload/sign/quote-intake/${path}`, {});
      if (!data || typeof data.url !== 'string' ||
        !data.url.startsWith(`/object/upload/sign/quote-intake/${path}?`)) {
        throw new QuoteHttpError(503, 'quote_upstream_unavailable');
      }
      const token = new URL(data.url, `${url}/storage/v1/`).searchParams.get('token');
      if (!token || token.length < 16 || token.length > 4096) {
        throw new QuoteHttpError(503, 'quote_upstream_unavailable');
      }
      // Direct Storage hostname is recommended for resumable TUS uploads.
      const host = new URL(url).hostname.replace('.supabase.co', '.storage.supabase.co');
      return { token, endpoint: `https://${host}/storage/v1/upload/resumable` };
    },
    async ownedAttachment(requestId, ownerHash, attachmentId) {
      const rows = await api<OwnedQuoteAttachment[]>('/rest/v1/rpc/quote_owned_attachment', {
        p_request_id: requestId, p_owner_session_hash: ownerHash, p_attachment_id: attachmentId,
      });
      if (!Array.isArray(rows) || rows.length !== 1) {
        throw new QuoteHttpError(404, 'quote_attachment_not_found');
      }
      const row = rows[0];
      if (!uuid(row.attachment_id) || !acceptedPath.test(row.storage_path) ||
        typeof row.extension !== 'string' ||
        !Number.isSafeInteger(row.reported_size_bytes)) {
        throw new QuoteHttpError(503, 'quote_upstream_unavailable');
      }
      return row;
    },
    async storageFileSize(path) {
      assertPath(path);
      const response = await fileApi(`/storage/v1/object/info/quote-intake/${path}`);
      let info: unknown;
      try { info = await response.json(); }
      catch { throw new QuoteHttpError(503, 'quote_upstream_unavailable'); }
      const size = (info as { size?: unknown } | null)?.size;
      if (!Number.isSafeInteger(size) || (size as number) < 1 || (size as number) > 50_000_000) {
        throw new QuoteHttpError(409, 'quote_file_invalid');
      }
      return size as number;
    },
    async readStorageRange(path, first, last) {
      assertPath(path);
      if (!Number.isSafeInteger(first) || !Number.isSafeInteger(last) ||
        first < 0 || last < first || last - first >= 131_072) {
        throw new QuoteHttpError(400, 'invalid_quote_range');
      }
      const response = await fileApi(`/storage/v1/object/quote-intake/${path}`, {
        Range: `bytes=${first}-${last}`,
      });
      if (response.status !== 206 || !response.body) {
        throw new QuoteHttpError(503, 'quote_range_unavailable');
      }
      const reader = response.body.getReader();
      const chunks: Uint8Array[] = [];
      let length = 0;
      try {
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          length += value.length;
          if (length > last - first + 1) throw new QuoteHttpError(503, 'quote_range_unavailable');
          chunks.push(value);
        }
      } finally { await reader.cancel().catch(() => {}); reader.releaseLock(); }
      if (length !== last - first + 1) throw new QuoteHttpError(503, 'quote_range_unavailable');
      const bytes = new Uint8Array(length);
      let offset = 0;
      for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
      return bytes;
    },
    async validateAttachment(requestId, ownerHash, attachmentId, sizeBytes, detectedType) {
      const result = await api<boolean>('/rest/v1/rpc/quote_validate_attachment', {
        p_request_id: requestId, p_owner_session_hash: ownerHash,
        p_attachment_id: attachmentId, p_actual_size_bytes: sizeBytes,
        p_detected_type: detectedType,
      });
      if (result !== true) throw new QuoteHttpError(503, 'quote_upstream_unavailable');
    },
    async submissionReceipt(requestId, ownerHash, submissionKey) {
      const rows = await api<Array<{ request_id: string; submission_time: string }>>(
        '/rest/v1/rpc/quote_submission_receipt', {
          p_request_id: requestId,
          p_owner_session_hash: ownerHash,
          p_submission_key: submissionKey,
        });
      if (!Array.isArray(rows) || rows.length > 1) {
        throw new QuoteHttpError(503, 'quote_upstream_unavailable');
      }
      if (rows.length === 0) return null;
      const receipt = rows[0];
      if (!uuid(receipt.request_id) || !Number.isFinite(Date.parse(receipt.submission_time))) {
        throw new QuoteHttpError(503, 'quote_upstream_unavailable');
      }
      return receipt;
    },
    async submitQuote(input) {
      const result = await api<Array<{ request_id: string; submission_time: string }>>(
        '/rest/v1/rpc/quote_submit', {
          p_request_id: input.requestId,
          p_owner_session_hash: input.ownerHash,
          p_submission_key: input.submissionKey,
          p_project_type: input.projectType,
          p_no_file: input.noFile,
          p_starting_points: input.startingPoints,
          p_source_origin: input.sourceOrigin,
          p_source_reference: input.sourceReference,
          p_production: input.production,
          p_project: input.project,
          p_contact_method: input.contactMethod,
          p_contact_name: input.contactName,
          p_contact_value: input.contactValue,
          p_triage_status: input.triageStatus,
          p_attachment_ids: input.attachmentIds,
        });
      if (!Array.isArray(result) || result.length !== 1 ||
        !uuid(result[0]?.request_id) ||
        !Number.isFinite(Date.parse(result[0]?.submission_time))) {
        throw new QuoteHttpError(503, 'quote_upstream_unavailable');
      }
      return result[0];
    },
  };
}
