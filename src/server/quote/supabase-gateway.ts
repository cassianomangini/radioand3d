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

export type QuoteGateway = {
  consumeRate(action: QuoteAction, keyHash: string): Promise<boolean>;
  createDraft(ownerSessionHash: string, projectType: QuoteProjectType): Promise<DraftCreated>;
  reserveAttachment(input: UploadInput): Promise<UploadReservation>;
  signUpload(path: string): Promise<{ token: string; endpoint: string }>;
};

function config(): { url: string; key: string } {
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
  const { url, key } = config();
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
  return { api, url };
}

/** Server-only service transport: modern sb_secret key stays in apikey header. */
export function createQuoteGateway(fetcher: typeof fetch = fetch): QuoteGateway {
  const { api, url } = makeSupabaseRequest(fetcher);
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
        !new RegExp(`^${input.requestId}/[0-9a-f-]{36}\\${input.extension}$`, 'i').test(row.object_path) ||
        !Number.isFinite(Date.parse(row.reservation_expires_at))) {
        throw new QuoteHttpError(503, 'quote_upstream_unavailable');
      }
      return row;
    },
    async signUpload(path) {
      if (!/^[0-9a-f-]{36}\/[0-9a-f-]{36}\.(?:stl|3mf|obj|step|stp|pdf|png|jpg|jpeg|webp)$/i.test(path)) {
        throw new QuoteHttpError(503, 'quote_upstream_unavailable');
      }
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
  };
}
