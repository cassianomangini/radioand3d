const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');

const originalResolve = Module._resolveFilename;
Module._resolveFilename = function quoteTestResolve(request, parent, isMain, options) {
  const target = request.startsWith('@/') ? path.join(__dirname, '../src', request.slice(2)) : request;
  return originalResolve.call(this, target, parent, isMain, options);
};
require.extensions['.ts'] = (module, filename) => {
  const transpiled = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
    fileName: filename,
  }).outputText;
  module._compile(transpiled, filename);
};

process.env.NODE_ENV = 'development';
process.env.CM_QUOTE_INTAKE_ENABLED = 'true';
process.env.CM_QUOTE_SESSION_SECRET = 'session-secret-for-synthetic-tests-123456';
process.env.CM_QUOTE_RATE_LIMIT_SECRET = 'rate-secret-for-synthetic-tests-1234567';
process.env.CM_QUOTE_TURNSTILE_SITE_KEY = '0x4AAAAAAA_synthetic_site_key';
process.env.CM_QUOTE_TURNSTILE_SECRET_KEY = 'synthetic-server-secret-key-never-used-live';

const { verifyQuoteTurnstile, requireQuoteTurnstileConfig } = require('../src/server/quote/turnstile.ts');
const { handleQuoteSession } = require('../src/server/quote/handlers.ts');

const request = (token = 'synthetic-valid-token') => new Request('http://localhost:3000/api/quote/session', {
  method: 'POST',
  headers: { origin: 'http://localhost:3000', 'content-type': 'application/json' },
  body: JSON.stringify({ projectType: 'caixa', turnstileToken: token }),
});

test('Turnstile refuses absent configuration without contacting upstream', async () => {
  const old = process.env.CM_QUOTE_TURNSTILE_SECRET_KEY;
  delete process.env.CM_QUOTE_TURNSTILE_SECRET_KEY;
  try {
    assert.throws(() => requireQuoteTurnstileConfig(), { code: 'quote_configuration_missing' });
    await assert.rejects(
      verifyQuoteTurnstile(request(), 'synthetic-valid-token', async () => { throw Error('unexpected fetch'); }),
      { code: 'quote_configuration_missing' },
    );
  } finally {
    process.env.CM_QUOTE_TURNSTILE_SECRET_KEY = old;
  }
});

test('Turnstile requires a bounded token and exact action/hostname', async () => {
  let calls = 0;
  const fetcher = async (url, options) => {
    calls++;
    assert.equal(url, 'https://challenges.cloudflare.com/turnstile/v0/siteverify');
    assert.equal(options.method, 'POST');
    assert.equal(options.redirect, 'error');
    const submitted = new URLSearchParams(options.body);
    assert.equal(submitted.get('secret'), process.env.CM_QUOTE_TURNSTILE_SECRET_KEY);
    assert.equal(submitted.get('response'), 'synthetic-valid-token');
    return Response.json({ success: true, hostname: 'localhost', action: 'quote_intake' });
  };
  await verifyQuoteTurnstile(request(), 'synthetic-valid-token', fetcher);
  assert.equal(calls, 1);
  await assert.rejects(verifyQuoteTurnstile(request(), '', fetcher), { code: 'human_verification_required' });
  await assert.rejects(verifyQuoteTurnstile(request(), 'x'.repeat(2049), fetcher), { code: 'human_verification_required' });
  assert.equal(calls, 1);

  for (const payload of [
    { success: false, hostname: 'localhost', action: 'quote_intake' },
    { success: true, hostname: 'other.example', action: 'quote_intake' },
    { success: true, hostname: 'localhost', action: 'login' },
  ]) {
    await assert.rejects(
      verifyQuoteTurnstile(request(), 'synthetic-valid-token', async () => Response.json(payload)),
      { code: 'human_verification_required' },
    );
  }
});

test('Turnstile fails closed on upstream error', async () => {
  await assert.rejects(
    verifyQuoteTurnstile(request(), 'synthetic-valid-token', async () => { throw Error('unreachable'); }),
    { code: 'quote_verification_unavailable', status: 503 },
  );
});

test('session creation requires verification before saving a draft', async () => {
  let created = 0, validated = 0;
  const gateway = {
    consumeRate: async () => true,
    createDraft: async () => { created++; return { id: crypto.randomUUID(), expires_at: new Date(Date.now() + 3600_000).toISOString() }; },
  };
  const verifier = async (_request, token) => {
    validated++;
    assert.equal(token, 'synthetic-valid-token');
  };
  const rejected = await handleQuoteSession(request(''), gateway, verifier);
  assert.equal(rejected.status, 400);
  assert.equal(created, 0);
  const allowed = await handleQuoteSession(request(), gateway, verifier);
  assert.equal(allowed.status, 201);
  assert.equal(validated, 1);
  assert.equal(created, 1);
});

test('rate-limited clients are rejected before verification', async () => {
  let validated = false;
  const response = await handleQuoteSession(request(), {
    consumeRate: async () => false,
    createDraft: async () => { throw Error('should not create draft'); },
  }, async () => { validated = true; });
  assert.equal(response.status, 429);
  assert.equal(validated, false);
});
