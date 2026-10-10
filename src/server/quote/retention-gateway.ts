import { QuoteHttpError, uuid } from './http.ts';
import { quoteServiceConfig } from './supabase-gateway.ts';

export type RetentionAttachment = {
  attachment_id: string;
  request_id: string;
  object_path: string;
};

export type RetentionSweep = {
  drafts_deleted: number;
  submitted_deleted: number;
  rate_windows_deleted: number;
  events_deleted: number;
};

export type RetentionGateway = {
  acquire(runToken: string): Promise<boolean>;
  scrubSubmitted(runToken: string, limit: number): Promise<number>;
  candidates(runToken: string, limit: number): Promise<RetentionAttachment[]>;
  removeAndConfirm(path: string): Promise<void>;
  finalizeAttachment(runToken: string, attachmentId: string): Promise<number>;
  sweep(runToken: string, limit: number): Promise<RetentionSweep>;
  finish(runToken: string, success: boolean, counts: Record<string, number>): Promise<boolean>;
};

const PATH = /^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}\/[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}\.(?:stl|3mf|obj|step|stp|pdf|png|jpg|jpeg|webp)$/i;
const UPSTREAM_FAILURE = 'quote_retention_upstream_unavailable';

function unavailable(): never {
  throw new QuoteHttpError(503, UPSTREAM_FAILURE);
}

/** All paths and RPC names are constant. No SQL, metadata or URL from a visitor. */
export function createRetentionGateway(fetcher: typeof fetch = fetch): RetentionGateway {
  const { url, key } = quoteServiceConfig();
  async function call(path: string, method: 'POST' | 'DELETE' | 'GET', body?: unknown): Promise<Response> {
    let response: Response;
    try {
      response = await fetcher(url + path, {
        method,
        headers: {
          apikey: key,
          accept: 'application/json',
          ...(body === undefined ? {} : { 'content-type': 'application/json' }),
        },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
        cache: 'no-store',
        redirect: 'error',
        signal: AbortSignal.timeout(9_000),
      });
    } catch {
      return unavailable();
    }
    return response;
  }

  async function rpc<T>(name: string, body: Record<string, unknown>): Promise<T> {
    const response = await call('/rest/v1/rpc/' + name, 'POST', body);
    if (!response.ok) return unavailable();
    try { return await response.json() as T; }
    catch { return unavailable(); }
  }

  return {
    async acquire(runToken) {
      if (!uuid(runToken)) return unavailable();
      const result = await rpc<boolean>('quote_retention_acquire', { p_token: runToken });
      if (typeof result !== 'boolean') return unavailable();
      return result;
    },
    async scrubSubmitted(runToken, limit) {
      if (!uuid(runToken) || !Number.isInteger(limit) || limit < 1 || limit > 250) {
        return unavailable();
      }
      const count = await rpc<number>('quote_retention_scrub_submitted', {
        p_token: runToken, p_limit: limit,
      });
      if (!Number.isSafeInteger(count) || count < 0 || count > limit) {
        return unavailable();
      }
      return count;
    },
    async candidates(runToken, limit) {
      if (!uuid(runToken) || !Number.isInteger(limit) || limit < 1 || limit > 50) return unavailable();
      const rows = await rpc<RetentionAttachment[]>('quote_retention_candidates', {
        p_token: runToken, p_limit: limit,
      });
      if (!Array.isArray(rows) || rows.length > limit ||
        !rows.every(row => row && uuid(row.attachment_id) && uuid(row.request_id) &&
          typeof row.object_path === 'string' && PATH.test(row.object_path) &&
          row.object_path.startsWith(row.request_id + '/' + row.attachment_id + '.'))) {
        return unavailable();
      }
      return rows;
    },
    async removeAndConfirm(path) {
      if (!PATH.test(path)) return unavailable();
      // Exactly storage-js remove(): DELETE /object/{bucketName} {prefixes}.
      // Never DELETE storage.objects via SQL: bytes would become orphaned.
      const removed = await call('/storage/v1/object/quote-intake', 'DELETE', { prefixes: [path] });
      if (!removed.ok && removed.status !== 404) return unavailable();
      // An object may never have finished uploading. A Storage 404 on a
      // subsequent info request is required before releasing the reservation.
      const check = await call('/storage/v1/object/info/quote-intake/' + path, 'GET');
      if (check.status !== 404) return unavailable();
    },
    async finalizeAttachment(runToken, attachmentId) {
      if (!uuid(runToken) || !uuid(attachmentId)) return unavailable();
      const freed = await rpc<number>('quote_retention_finalize_attachment', {
        p_token: runToken, p_attachment_id: attachmentId,
      });
      if (!Number.isSafeInteger(freed) || freed < 0 || freed > 50_000_000) return unavailable();
      return freed;
    },
    async sweep(runToken, limit) {
      if (!uuid(runToken) || !Number.isInteger(limit) || limit < 1 || limit > 250) return unavailable();
      const result = await rpc<RetentionSweep[]>('quote_retention_sweep', {
        p_token: runToken, p_limit: limit,
      });
      if (!Array.isArray(result) || result.length !== 1 ||
        !['drafts_deleted', 'submitted_deleted', 'rate_windows_deleted', 'events_deleted']
          .every(k => Number.isSafeInteger(result[0]?.[k as keyof RetentionSweep]) &&
            result[0][k as keyof RetentionSweep] >= 0 &&
            result[0][k as keyof RetentionSweep] <= limit)) return unavailable();
      return result[0];
    },
    async finish(runToken, success, counts) {
      if (!uuid(runToken) || typeof success !== 'boolean' ||
        !Object.values(counts).every(n => Number.isSafeInteger(n) && n >= 0)) return unavailable();
      const result = await rpc<boolean>('quote_retention_finish', {
        p_token: runToken, p_ok: success, p_result: counts,
      });
      if (typeof result !== 'boolean') return unavailable();
      return result;
    },
  };
}
