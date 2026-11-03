// Manual integration check. Never run from the regular test suite.
// CM_QUOTE_LIVE_SMOKE=1 node scripts/quote-live-smoke.cjs
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');

if (process.env.CM_QUOTE_LIVE_SMOKE !== '1') {
  throw new Error('Set CM_QUOTE_LIVE_SMOKE=1 to send a synthetic quote and email.');
}

const envPath = path.join(__dirname, '../.env.local');
for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
  const match = line.match(/^\s*([A-Z][A-Z0-9_]*)\s*=\s*(.*?)\s*$/);
  if (match && !process.env[match[1]]) {
    process.env[match[1]] = match[2].replace(/^(["'])|(["'])$/g, '');
  }
}
process.env.NODE_ENV = 'development';
process.env.CM_QUOTE_INTAKE_ENABLED = 'true';

const originalResolve = Module._resolveFilename;
Module._resolveFilename = function resolve(request, parent, isMain, options) {
  const target = request.startsWith('@/') ? path.join(__dirname, '../src', request.slice(2)) : request;
  return originalResolve.call(this, target, parent, isMain, options);
};
require.extensions['.ts'] = (module, filename) => {
  const output = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
    fileName: filename,
  }).outputText;
  module._compile(output, filename);
};

const { handleQuoteSession, handleQuoteSubmit } = require('../src/server/quote/handlers.ts');
const projectUrl = process.env.CM_SUPABASE_URL;
const key = process.env.CM_SUPABASE_SECRET_KEY;
const serverHeaders = { apikey: key, 'user-agent': 'cm3d-quote-smoke/1' };

function request(route, body, cookie) {
  return new Request(`http://localhost:3000/api/quote/${route}`, {
    method: 'POST',
    headers: {
      origin: 'http://localhost:3000', 'content-type': 'application/json',
      ...(cookie ? { cookie } : {}),
    },
    body: JSON.stringify(body),
  });
}

function draft() {
  return {
    type: 'caixa', boxMode: 'quick',
    boxQuickDescription: 'TESTE TÉCNICO de integração. Ignorar; não é pedido de cliente.',
    boxShape: '', boxShapeOther: '', boxDividers: '', boxDividerCount: '',
    boxDimensions: { width: '', depth: '', height: '' }, boxUnknown: false,
    boxBasis: '', boxNoPersonalization: false, boxPersonalization: [],
    boxText: '', boxQrSource: '', boxQrContent: '',
    plateMode: '', plateQuickDescription: '', plateContents: [], plateContentUnknown: false,
    plateText: '', plateQrSource: '', plateQrContent: '', plateUse: '', plateUseUnknown: false,
    plateFixation: '', plateFixationUnknown: false,
    plateDimensions: { width: '', depth: '', height: '' }, plateUnknown: false,
    modelScale: '', modelScaleUnknown: false,
    modelDimensions: { width: '', depth: '', height: '' }, modelNotes: '',
    otherDescription: '', otherSize: '', colorMode: '', colors: [{ name: '', rgb: '' }],
    quantity: 1, name: 'TESTE TÉCNICO - IGNORAR', contactMethod: 'email',
    contact: 'casman1986@gmail.com', delivery: 'retirada', cep: '',
  };
}

async function readRows(table, filter) {
  const response = await fetch(`${projectUrl}/rest/v1/${table}?${filter}`, { headers: serverHeaders });
  assert.equal(response.status, 200, `${table} read failed: ${response.status}`);
  return response.json();
}

async function removeRows(table, filter) {
  const response = await fetch(`${projectUrl}/rest/v1/${table}?${filter}`, {
    method: 'DELETE', headers: serverHeaders,
  });
  assert.equal(response.status, 204, `${table} cleanup failed: ${response.status}`);
}

(async () => {
  const session = await handleQuoteSession(request('session', { projectType: 'caixa' }));
  const sessionBody = await session.json();
  assert.equal(session.status, 201, `session failed: ${sessionBody.error}`);
  const requestId = sessionBody.requestId;
  const cookie = session.headers.get('set-cookie').split(';')[0];
  const submitted = await handleQuoteSubmit(request('submit', {
    requestId, submissionKey: crypto.randomUUID(), draft: draft(), attachments: [],
  }, cookie));
  const result = await submitted.json();
  assert.equal(submitted.status, 201, `submission failed: ${result.error} request=${requestId}`);
  assert.equal(result.requestId, requestId);

  const quotes = await readRows('quote_requests', `id=eq.${requestId}&select=id,lifecycle_status`);
  const sent = await readRows('quote_events',
    `quote_request_id=eq.${requestId}&event_type=eq.email&event_status=eq.sent&select=id`);
  assert.equal(quotes.length, 1);
  assert.equal(quotes[0].lifecycle_status, 'submitted');
  assert.equal(sent.length, 1);

  await removeRows('quote_events', `quote_request_id=eq.${requestId}`);
  await removeRows('quote_requests', `id=eq.${requestId}`);
  const remaining = await readRows('quote_requests', `id=eq.${requestId}&select=id`);
  assert.equal(remaining.length, 0);
  console.log(JSON.stringify({ submitted: true, emailRecorded: true, syntheticRequestRemoved: true }));
})().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});
