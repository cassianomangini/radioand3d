import { randomUUID, timingSafeEqual } from 'node:crypto';
import { responseJson } from './http.ts';
import { createRetentionGateway, type RetentionGateway } from './retention-gateway.ts';

const MAX_RUN_MS = 25_000;
const PER_BATCH = 12;
const MAX_BATCHES = 4;
const SWEEP_LIMIT = 200;

function authorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret || Buffer.byteLength(secret, 'utf8') < 32) return false;
  const expected = Buffer.from('Bearer ' + secret);
  const provided = Buffer.from(request.headers.get('authorization') || '');
  return provided.length === expected.length && timingSafeEqual(provided, expected);
}

/**
 * Internal authenticated GET, never controlled by the public quote feature
 * flag. Expired personal data must still be purged when intake is disabled.
 */
export async function handleQuoteRetention(request: Request, gateway?: RetentionGateway): Promise<Response> {
  if (request.method !== 'GET') return responseJson({ error: 'method_not_allowed' }, 405);
  if (!authorized(request)) return responseJson({ error: 'unauthorized' }, 401);

  const start = Date.now();
  const token = randomUUID();
  let acquired = false;
  let finished = false;
  const counters = {
    objects: 0,
    failedObjects: 0,
    bytes: 0,
    drafts: 0,
    submitted: 0,
    rateWindows: 0,
    events: 0,
  };

  let db: RetentionGateway | undefined;
  try {
    db = gateway ?? createRetentionGateway();
    acquired = await db.acquire(token);
    if (!acquired) return responseJson({ status: 'already_running' });

    let backlogMayRemain = false;
    for (let batch = 0; batch < MAX_BATCHES; batch++) {
      if (Date.now() - start >= MAX_RUN_MS) {
        backlogMayRemain = true;
        break;
      }
      const due = await db.candidates(token, PER_BATCH);
      if (!due.length) break;
      for (const object of due) {
        // Finish the current transaction boundary, but don't begin another
        // Storage deletion once the function is close to its runtime budget.
        if (Date.now() - start >= MAX_RUN_MS) {
          backlogMayRemain = true;
          break;
        }
        try {
          await db.removeAndConfirm(object.object_path);
          // The RPC rechecks age, reservation expiry and storage.objects
          // under a transaction. A failed call never releases capacity.
          const released = await db.finalizeAttachment(token, object.attachment_id);
          counters.objects++;
          counters.bytes += released;
        } catch {
          // One inaccessible Storage object must not prevent unrelated
          // expired customer contact and rate-limit records being purged.
          // Do not retry the same failing page repeatedly within one run.
          counters.failedObjects++;
          backlogMayRemain = true;
        }
      }
      if (backlogMayRemain) break;
      if (due.length < PER_BATCH) break;
      if (batch === MAX_BATCHES - 1) backlogMayRemain = true;
    }

    const result = await db.sweep(token, SWEEP_LIMIT);
    counters.drafts += result.drafts_deleted;
    counters.submitted += result.submitted_deleted;
    counters.rateWindows += result.rate_windows_deleted;
    counters.events += result.events_deleted;
    // Per-table sweep is bounded. A full batch means further expired rows
    // may exist and will be processed on the next authenticated invocation.
    backlogMayRemain ||= Object.values(result).some(n => n === SWEEP_LIMIT);

    const fullySuccessful = counters.failedObjects === 0;
    finished = await db.finish(token, fullySuccessful, {
      objects: counters.objects, failedObjects: counters.failedObjects,
      bytes: counters.bytes, drafts: counters.drafts,
      submitted: counters.submitted, rateWindows: counters.rateWindows,
      events: counters.events,
    });
    if (!finished) throw Error('retention_lease_expired');
    if (!fullySuccessful) {
      return responseJson({ error: 'retention_partial_failure', ...counters,
        backlogMayRemain: true }, 503);
    }
    return responseJson({ status: 'ok', ...counters, backlogMayRemain });
  } catch {
    // Never expose paths, contact details, SQL messages or secrets.
    if (acquired && db && !finished) {
      try { await db.finish(token, false, {
        objects: counters.objects, bytes: counters.bytes,
      }); } catch { /* Lease expiry is repaired by the next run. */ }
    }
    return responseJson({ error: 'retention_unavailable' }, 503);
  }
}
