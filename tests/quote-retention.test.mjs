import assert from 'node:assert/strict';
import test, { after } from 'node:test';
import { handleQuoteRetention } from '../src/server/quote/retention-handler.ts';
import { createRetentionGateway } from '../src/server/quote/retention-gateway.ts';

const envNames = ['CRON_SECRET', 'CM_SUPABASE_URL', 'CM_SUPABASE_SECRET_KEY'];
const old = Object.fromEntries(envNames.map(key => [key, process.env[key]]));
const SECRET = 'synthetic-retention-secret-only-for-tests-' + 's'.repeat(48);
process.env.CRON_SECRET = SECRET;
after(() => {
  for (const [key, val] of Object.entries(old)) {
    if (val === undefined) delete process.env[key];
    else process.env[key] = val;
  }
});

const requestId = '21a9b45c-37ad-4fc9-87c4-540a08d3fdde';
const attachmentId = 'f8dabaf9-0a1c-49fb-b426-8420993c4612';
const path = requestId + '/' + attachmentId + '.stl';
const auth = () => new Request('https://studio.example/api/internal/quote-retention',
  { method: 'GET', headers: { authorization: 'Bearer ' + SECRET } });
const calls = [];
const stub = {
  async acquire(token) { calls.push(['acquire', token]); return true; },
  async scrubSubmitted(token) { calls.push(['scrub', token]); return 2; },
  async candidates(token) {
    calls.push(['candidates', token]);
    return [{ attachment_id: attachmentId, request_id: requestId, object_path: path }];
  },
  async removeAndConfirm(p) { calls.push(['remove', p]); },
  async finalizeAttachment(token, id) { calls.push(['finalize', id]); return 50_000_000; },
  async sweep() {
    calls.push(['sweep']);
    return { drafts_deleted: 1, submitted_deleted: 1,
      rate_windows_deleted: 2, events_deleted: 3 };
  },
  async finish(token, ok, counts) { calls.push(['finish', ok, counts]); return true; }
};

test('rejects unauthorized, missing CRON_SECRET and wrong HTTP method without hitting backend', async () => {
  calls.length = 0;
  const bad = new Request(auth().url, { method: 'GET', headers: { authorization: 'Bearer wrong' } });
  assert.equal((await handleQuoteRetention(bad, stub)).status, 401);
  const missing = new Request(auth().url, { method: 'GET' });
  assert.equal((await handleQuoteRetention(missing, stub)).status, 401);
  process.env.CRON_SECRET = '';
  try { assert.equal((await handleQuoteRetention(auth(), stub)).status, 401); }
  finally { process.env.CRON_SECRET = SECRET; }
  const head = new Request(auth().url, { method: 'HEAD', headers: auth().headers });
  assert.equal((await handleQuoteRetention(head, stub)).status, 405);
  assert.deepEqual(calls, []);
});

test('retention deletes through Storage before SQL and publishes aggregates only', async () => {
  calls.length = 0;
  const res = await handleQuoteRetention(auth(), stub);
  assert.equal(res.status, 200);
  assert.equal(res.headers.get('cache-control'), 'no-store');
  const result = await res.json();
  assert.equal(result.status, 'ok');
  assert.equal(result.objects, 1);
  assert.equal(result.anonymized, 2);
  assert.equal(result.bytes, 50_000_000);
  assert.equal(result.drafts, 1);
  assert.equal(result.submitted, 1);
  assert.equal(result.rateWindows, 2);
  assert.equal(result.events, 3);
  assert.equal(JSON.stringify(result).includes(path), false);
  assert.equal(JSON.stringify(result).includes(SECRET), false);
  assert.deepEqual(calls.map(([n]) => n),
    ['acquire', 'scrub', 'candidates', 'remove', 'finalize', 'sweep', 'finish']);
  assert.equal(calls[6][1], true);
});

test('concurrent cron does not delete or sweep while lease is owned', async () => {
  calls.length = 0;
  const res = await handleQuoteRetention(auth(), {
    ...stub, async acquire() { calls.push(['busy']); return false; }
  });
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { status: 'already_running' });
  assert.deepEqual(calls.map(([n]) => n), ['busy']);
});

test('Storage failure preserves the attachment, but still scrubs unrelated expired PII', async () => {
  calls.length = 0;
  const res = await handleQuoteRetention(auth(), {
    ...stub, async removeAndConfirm() {
      calls.push(['storage_failure']);
      throw new Error('private path and secret should never be leaked');
    },
  });
  assert.equal(res.status, 503);
  const body = await res.json();
  assert.equal(body.error, 'retention_partial_failure');
  assert.equal(body.failedObjects, 1);
  assert.equal(body.anonymized, 2);
  assert.equal(body.objects, 0);
  assert.equal(JSON.stringify(body).includes(path), false);
  assert.deepEqual(calls.map(([n]) => n),
    ['acquire', 'scrub', 'candidates', 'storage_failure', 'sweep', 'finish']);
  assert.equal(calls.at(-1)[1], false);
  assert.equal(calls.at(-1)[2].failedObjects, 1);
});

test('a failed object does not prevent the rest of its bounded batch being removed', async () => {
  calls.length = 0;
  const sibling = '55f4a510-295c-468c-b337-31089e79b07a';
  const siblingPath = requestId + '/' + sibling + '.pdf';
  const result = await handleQuoteRetention(auth(), {
    ...stub,
    async candidates() {
      calls.push(['candidates']);
      return [
        {attachment_id: attachmentId, request_id: requestId, object_path: path},
        {attachment_id: sibling, request_id: requestId, object_path: siblingPath},
      ];
    },
    async removeAndConfirm(p) {
      calls.push(['remove', p]);
      if (p === path) throw new Error('synthetic object storage failure');
    },
  });
  assert.equal(result.status, 503);
  const body = await result.json();
  assert.equal(body.failedObjects, 1);
  assert.equal(body.objects, 1);
  assert.equal(body.bytes, 50_000_000);
  assert.deepEqual(calls.map(([n]) => n),
    ['acquire', 'scrub', 'candidates', 'remove', 'remove', 'finalize', 'sweep', 'finish']);
  assert.equal(calls.at(-1)[1], false);
});

test('PII scrub executes before file cleanup and uses only the dedicated service RPC', async () => {
  process.env.CM_SUPABASE_URL = 'https://example-project.supabase.co';
  process.env.CM_SUPABASE_SECRET_KEY = 'sb_secret_' + 'S'.repeat(48);
  const sent = [];
  const gateway = createRetentionGateway(async (url, opts) => {
    sent.push({ url, opts });
    return Response.json(3);
  });
  const run = 'bd931601-b4f8-4b0a-8a16-7e99b0d2fe0d';
  assert.equal(await gateway.scrubSubmitted(run, 50), 3);
  assert.equal(sent.length, 1);
  assert.equal(sent[0].url.endsWith('/rest/v1/rpc/quote_retention_scrub_submitted'), true);
  assert.deepEqual(JSON.parse(sent[0].opts.body), { p_token:run, p_limit:50 });
  assert.equal(sent[0].opts.headers.Authorization, undefined);
  await assert.rejects(gateway.scrubSubmitted(run, 251));
  assert.equal(sent.length, 1);
});

test('service gateway uses DELETE prefixes then GET info 404 with only apikey', async () => {
  process.env.CM_SUPABASE_URL = 'https://example-project.supabase.co';
  process.env.CM_SUPABASE_SECRET_KEY = 'sb_secret_' + 'S'.repeat(48);
  const sent = [];
  const fetcher = async (url, options) => {
    sent.push({ url, options });
    if (options.method === 'DELETE') return Response.json([{ name: path }]);
    if (options.method === 'GET') return Response.json({ message: 'Not Found' }, { status: 404 });
    return Response.json(null, { status: 503 });
  };
  const gw = createRetentionGateway(fetcher);
  await gw.removeAndConfirm(path);
  assert.equal(sent.length, 2);
  assert.equal(sent[0].options.method, 'DELETE');
  assert.equal(sent[0].url, 'https://example-project.supabase.co/storage/v1/object/quote-intake');
  assert.deepEqual(JSON.parse(sent[0].options.body), { prefixes: [path] });
  assert.equal(sent[1].options.method, 'GET');
  assert.equal(sent[1].url.endsWith('/storage/v1/object/info/quote-intake/' + path), true);
  for (const s of sent) {
    assert.match(s.options.headers.apikey, /^sb_secret_/);
    assert.equal(s.options.headers.Authorization, undefined);
    assert.equal(s.options.redirect, 'error');
    assert.equal(s.options.cache, 'no-store');
  }
});

test('service gateway fails closed on Storage 503, object still present, and path escape', async () => {
  process.env.CM_SUPABASE_URL = 'https://example-project.supabase.co';
  process.env.CM_SUPABASE_SECRET_KEY = 'sb_secret_' + 'S'.repeat(48);
  const observed = [];
  const gw = createRetentionGateway(async (url, options) => {
    observed.push(options.method);
    return options.method === 'DELETE'
      ? Response.json([])
      : Response.json({ size: 12 }, { status: 200 });
  });
  await assert.rejects(gw.removeAndConfirm(path));
  assert.deepEqual(observed, ['DELETE', 'GET']);
  observed.length = 0;
  await assert.rejects(gw.removeAndConfirm('../another-bucket/private.txt'));
  assert.deepEqual(observed, []);
});
