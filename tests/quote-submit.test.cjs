const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');

const originalResolve = Module._resolveFilename;
Module._resolveFilename = function resolve(request, parent, isMain, options) {
  const target = request.startsWith('@/') ? path.join(__dirname, '../src', request.slice(2)) : request;
  return originalResolve.call(this, target, parent, isMain, options);
};
require.extensions['.ts'] = (module, filename) => {
  const source = fs.readFileSync(filename, 'utf8');
  const output = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
    fileName: filename,
  }).outputText;
  module._compile(output, filename);
};

const { handleQuoteSubmit } = require('../src/server/quote/handlers.ts');
const { newQuoteSession, issueSessionCookie } = require('../src/server/quote/http.ts');
const { parseQuoteForm, parseQuoteAttachments, validateQuoteForm } = require('../src/server/quote/form-contract.ts');
const { studioPhotoSrc } = require('../src/features/studio/r2-photos.ts');
const { createQuoteGateway } = require('../src/server/quote/supabase-gateway.ts');
const { quoteEmailText, quoteEmailMessage } = require('../src/server/quote/email.ts');
const { uploadSignedFile } = require('../src/features/quote/client-upload.ts');

process.env.NODE_ENV = 'development';
process.env.CM_QUOTE_INTAKE_ENABLED = 'true';
process.env.CM_QUOTE_SESSION_SECRET = 'session-secret-for-synthetic-tests-123456';
process.env.CM_QUOTE_RATE_LIMIT_SECRET = 'rate-secret-for-synthetic-tests-1234567';
process.env.RESEND_API_KEY = 're_synthetic_test_key_123456789';
process.env.CM_QUOTE_EMAIL_FROM = 'CM 3D <pedidos@example.com>';
process.env.R2_S3_ENDPOINT = 'https://example.r2.cloudflarestorage.com';
process.env.R2_ACCESS_KEY_ID = 'synthetic-access-key';
process.env.R2_SECRET_ACCESS_KEY = 'synthetic-r2-secret-for-photo-reference-tests';
process.env.CM_SUPABASE_URL = 'https://synthetic.supabase.co';
process.env.CM_SUPABASE_SECRET_KEY = 'sb_secret_synthetic_quote_reference_123456789';

function quickBoxDraft() {
  return {
    type: 'caixa', boxMode: 'quick', boxQuickDescription: 'Caixa azul para presente',
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
    quantity: 2, name: 'Cliente Teste', contactMethod: 'whatsapp', contact: '11999999999',
    delivery: 'retirada', cep: '',
  };
}

test('contrato recusa payload incompleto e arquivo incompatível com o papel', () => {
  const draft = quickBoxDraft();
  assert.ok(parseQuoteForm(draft));
  assert.equal(parseQuoteForm({ ...draft, quantity: -1 }), null);
  assert.equal(parseQuoteForm({ ...draft, contactMethod: 'fax' }), null);
  assert.equal(parseQuoteAttachments([{ id: crypto.randomUUID(), role: 'model', name: 'foto.png', size: 12, type: 'image/png' }]), null);
});

test('referência de produto só é aceita para peça publicada e personalizável', async () => {
  const { token } = newQuoteSession();
  const requestId = crypto.randomUUID();
  const draft = {
    ...quickBoxDraft(), type: 'outro', boxMode: '', boxQuickDescription: '',
    otherDescription: 'Quero outra medida', colorMode: 'indeciso', productSlug: 'porta-figurinhas',
  };
  assert.equal(parseQuoteForm({ ...draft, productSlug: '../admin' }), null);
  let saved = null;
  const gateway = {
    submissionReceipt: async () => null,
    consumeRate: async () => true,
    submitQuote: async (input) => {
      saved = input;
      return { request_id: requestId, submission_time: '2026-11-04T12:00:00Z' };
    },
    emailWasSent: async () => true,
  };
  const request = () => new Request('http://localhost:3000/api/quote/submit', {
    method: 'POST',
    headers: { origin: 'http://localhost:3000', 'content-type': 'application/json', cookie: issueSessionCookie(token) },
    body: JSON.stringify({ requestId, submissionKey: crypto.randomUUID(), draft, attachments: [] }),
  });
  const denied = await handleQuoteSubmit(request(), gateway, async () => {}, async () => ({
    state: 'available', products: [{ slug: 'porta-figurinhas', customizable: false, sourceStatus: 'NORMAL' }],
  }));
  assert.equal(denied.status, 400);
  assert.equal(saved, null);

  const accepted = await handleQuoteSubmit(request(), gateway, async () => {}, async () => ({
    state: 'available', products: [{ slug: 'porta-figurinhas', customizable: true, sourceStatus: 'NORMAL' }],
  }));
  assert.equal(accepted.status, 201);
  assert.equal(saved.sourceOrigin, 'site/produtos');
  assert.equal(saved.sourceReference, '/produtos/porta-figurinhas');
});

test('pedido é salvo uma vez e o e-mail pendente é reenviado a partir do banco', async () => {
  const requestId = crypto.randomUUID();
  const submissionKey = crypto.randomUUID();
  const { token } = newQuoteSession();
  let stored = null;
  let emailSent = false;
  let submitCount = 0;
  let mailCount = 0;
  const gateway = {
    submissionReceipt: async () => stored && ({ request_id: requestId, submission_time: '2026-11-03T12:00:00Z' }),
    consumeRate: async () => true,
    submitQuote: async (input) => {
      submitCount++;
      stored = input;
      return { request_id: requestId, submission_time: '2026-11-03T12:00:00Z' };
    },
    emailWasSent: async () => emailSent,
    notificationData: async () => ({
      projectType: stored.projectType, project: stored.project, production: stored.production,
      contactMethod: stored.contactMethod, contactName: stored.contactName,
      contactValue: stored.contactValue, attachments: [],
    }),
    recordEmailSent: async () => { emailSent = true; },
  };
  const request = () => new Request('http://localhost:3000/api/quote/submit', {
    method: 'POST',
    headers: { origin: 'http://localhost:3000', 'content-type': 'application/json', cookie: issueSessionCookie(token) },
    body: JSON.stringify({ requestId, submissionKey, draft: quickBoxDraft(), attachments: [] }),
  });
  const mailer = async (_id, message) => {
    mailCount++;
    assert.match(message.text, /Caixa azul para presente/);
    assert.match(message.html, /Caixa azul para presente/);
    if (mailCount === 1) throw Error('synthetic email failure');
  };
  const first = await handleQuoteSubmit(request(), gateway, mailer);
  assert.equal(first.status, 202);
  assert.equal((await first.json()).error, 'quote_email_pending');
  assert.equal(submitCount, 1);
  const retry = await handleQuoteSubmit(request(), gateway, mailer);
  assert.equal(retry.status, 201);
  assert.equal(submitCount, 1);
  assert.equal(mailCount, 2);
  const replay = await handleQuoteSubmit(request(), gateway, mailer);
  assert.equal(replay.status, 201);
  assert.equal(submitCount, 1);
  assert.equal(mailCount, 2);
});

test('foto do Estúdio acompanha a ideia até o banco e o e-mail, e referência adulterada é recusada', async () => {
  const photoId = studioPhotoSrc({ key: 'Caixas/caixa-azul.png', revision: 'a'.repeat(32) }).split('/').at(-1);
  const draft = {
    ...quickBoxDraft(), type: 'outro', boxMode: '', boxQuickDescription: '',
    otherDescription: 'Quero esta caixa com o meu logo', colorMode: 'indeciso', studioPhotoId: photoId,
  };
  const requestId = crypto.randomUUID();
  const { token } = newQuoteSession();
  let saved;
  let email = '';
  let html = '';
  const gateway = {
    submissionReceipt: async () => null,
    consumeRate: async () => true,
    submitQuote: async (input) => {
      saved = input;
      return { request_id: requestId, submission_time: '2026-11-03T12:00:00Z' };
    },
    emailWasSent: async () => false,
    notificationData: async () => ({
      projectType: saved.projectType, project: saved.project, production: saved.production,
      contactMethod: saved.contactMethod, contactName: saved.contactName,
      contactValue: saved.contactValue, attachments: [], sourceReference: saved.sourceReference,
    }),
    recordEmailSent: async () => {},
  };
  const makeRequest = (photoDraft) => new Request('http://localhost:3000/api/quote/submit', {
    method: 'POST',
    headers: { origin: 'http://localhost:3000', 'content-type': 'application/json', cookie: issueSessionCookie(token) },
    body: JSON.stringify({ requestId, submissionKey: crypto.randomUUID(), draft: photoDraft, attachments: [] }),
  });
  const response = await handleQuoteSubmit(makeRequest(draft), gateway, async (_id, message) => {
    email = message.text;
    html = message.html;
  });
  assert.equal(response.status, 201);
  assert.equal(saved.sourceOrigin, 'site/estudio');
  assert.equal(saved.sourceReference, `/api/studio/photos/${photoId}`);
  assert.match(email, new RegExp(`http://localhost:3000/api/studio/photos/${photoId.replaceAll('.', '\\.')}\\b`));
  assert.match(html, />Foto de referência do Estúdio<\/a>/);
  assert.doesNotMatch(html, />http:\/\/localhost:3000\/api\/studio\/photos\//);
  assert.match(email, /Quero esta caixa com o meu logo/);

  const extraReference = { id: crypto.randomUUID(), role: 'references', name: 'logo.png', size: 100, type: 'image/png' };
  assert.equal(validateQuoteForm({ ...draft, otherDescription: '' }, [extraReference]), false);

  const alteredId = `${photoId.slice(0, -1)}${photoId.endsWith('a') ? 'b' : 'a'}`;
  const rejected = await handleQuoteSubmit(makeRequest({ ...draft, studioPhotoId: alteredId }), gateway, async () => {});
  assert.equal(rejected.status, 400);
});

test('notificação lê a foto de referência gravada no pedido', async () => {
  const requestId = crypto.randomUUID();
  const sourceReference = '/api/studio/photos/foto-assinada';
  const requests = [];
  const gateway = createQuoteGateway(async (url) => {
    requests.push(url);
    if (url.includes('/quote_requests?')) return Response.json([{
      project_type: 'outro', source_reference: sourceReference, no_file: true,
      production: { quantity: 1, colorMode: 'indeciso', delivery: 'retirada' },
      project: { description: 'Quero personalizar esta peça' },
      contact_method: 'email', contact_name: 'Cliente', contact_value: 'cliente@example.com',
    }]);
    return Response.json([]);
  });
  const notification = await gateway.notificationData(requestId, 'a'.repeat(64));
  assert.equal(notification.sourceReference, sourceReference);
  assert.ok(requests[0].includes('source_reference'));
  assert.equal(requests.length, 2);
});

test('e-mail traz links diretos para cada arquivo privado do pedido', async () => {
  const requestId = crypto.randomUUID();
  const firstId = crypto.randomUUID();
  const secondId = crypto.randomUUID();
  const paths = [`${requestId}/${firstId}.jpeg`, `${requestId}/${secondId}.pdf`];
  const calls = [];
  const gateway = createQuoteGateway(async (url, options) => {
    calls.push({ url, options });
    if (url.includes('/quote_requests?')) return Response.json([{
      project_type: 'outro', source_reference: null, no_file: false,
      production: { quantity: 1, colorMode: 'indeciso', delivery: 'retirada' },
      project: { description: 'Peça personalizada' },
      contact_method: 'email', contact_name: 'Cliente', contact_value: 'cliente@example.com',
    }]);
    if (url.includes('/quote_attachments?')) return Response.json([
      { original_name: '1.jpeg', storage_path: paths[0] },
      { original_name: 'planta.pdf', storage_path: paths[1] },
    ]);
    if (url.endsWith('/storage/v1/object/sign/quote-intake')) {
      const body = JSON.parse(options.body);
      assert.deepEqual(body.paths, paths);
      assert.equal(body.expiresIn, 90 * 24 * 60 * 60);
      return Response.json(paths.map((path) => ({ path, signedURL: `/object/sign/quote-intake/${path}?token=synthetic` })));
    }
    throw Error(`unexpected request: ${url}`);
  });
  const notification = await gateway.notificationData(requestId, 'a'.repeat(64));
  assert.equal(calls.length, 3);
  const email = quoteEmailText(requestId, notification, 'https://radioand3d.vercel.app');
  assert.match(email, /1\.jpeg: https:\/\/synthetic\.supabase\.co\/storage\/v1\/object\/sign\/quote-intake\//);
  assert.match(email, /planta\.pdf: https:\/\/synthetic\.supabase\.co\/storage\/v1\/object\/sign\/quote-intake\//);
  assert.doesNotMatch(email, /este e-mail não contém anexos/);
  const message = quoteEmailMessage(requestId, notification, 'https://radioand3d.vercel.app');
  assert.equal(message.text, email);
  assert.match(message.html, /<a href="https:\/\/synthetic\.supabase\.co\/storage\/v1\/object\/sign\/quote-intake\/[^\"]+">1\.jpeg<\/a>/);
  assert.match(message.html, />planta\.pdf<\/a>/);
  assert.doesNotMatch(message.html, />https:\/\/synthetic\.supabase\.co/);
  const unsafe = quoteEmailMessage(requestId, {
    ...notification, attachments: [{ name: '<img src=x>.jpeg', url: 'https://example.com/file?token=a&download=x' }],
  }, 'https://radioand3d.vercel.app');
  assert.match(unsafe.html, /&lt;img src=x&gt;\.jpeg/);
  assert.match(unsafe.html, /token=a&amp;download=x/);
  assert.doesNotMatch(unsafe.html, /<img/);
});

test('notificação recusa arquivo de outro pedido e link assinado adulterado', async () => {
  const requestId = crypto.randomUUID();
  const otherRequestId = crypto.randomUUID();
  const attachmentId = crypto.randomUUID();
  const ownedPath = `${requestId}/${attachmentId}.jpeg`;
  const quoteRow = {
    project_type: 'outro', source_reference: null, no_file: false,
    production: { quantity: 1 }, project: { description: 'Peça' },
    contact_method: 'email', contact_name: 'Cliente', contact_value: 'cliente@example.com',
  };
  let signed = false;
  const wrongOwner = createQuoteGateway(async (url) => {
    if (url.includes('/quote_requests?')) return Response.json([quoteRow]);
    if (url.includes('/quote_attachments?')) return Response.json([
      { original_name: 'imagem.jpeg', storage_path: `${otherRequestId}/${attachmentId}.jpeg` },
    ]);
    signed = true;
    throw Error('signing must not happen');
  });
  await assert.rejects(() => wrongOwner.notificationData(requestId, 'a'.repeat(64)));
  assert.equal(signed, false);

  const wrongLink = createQuoteGateway(async (url) => {
    if (url.includes('/quote_requests?')) return Response.json([quoteRow]);
    if (url.includes('/quote_attachments?')) return Response.json([
      { original_name: 'imagem.jpeg', storage_path: ownedPath },
    ]);
    return Response.json([{ path: ownedPath, signedURL: `/object/sign/quote-intake/${otherRequestId}/${attachmentId}.jpeg?token=synthetic` }]);
  });
  await assert.rejects(() => wrongLink.notificationData(requestId, 'a'.repeat(64)));
});

test('upload privado retoma após perda da resposta de um bloco', async () => {
  const file = new File([new Uint8Array(6 * 1024 * 1024 + 10)], 'modelo.stl', { type: 'application/octet-stream' });
  let offset = 0;
  let patches = 0;
  let metadata = '';
  const endpoint = 'https://cmtest.storage.supabase.co/storage/v1/upload/resumable/sign';
  const fetcher = async (url, options) => {
    assert.ok(url.startsWith('https://cmtest.storage.supabase.co/'));
    if (options.method === 'POST') {
      metadata = options.headers['Upload-Metadata'];
      return new Response(null, { status: 201, headers: { location: '/storage/v1/upload/resumable/sign/upload-1' } });
    }
    if (options.method === 'HEAD') {
      return new Response(null, { status: 200, headers: { 'upload-offset': String(offset) } });
    }
    assert.equal(options.method, 'PATCH');
    assert.equal(Number(options.headers['Upload-Offset']), offset);
    patches++;
    offset += options.body.size;
    if (patches === 1) throw Error('response lost after the server accepted the block');
    return new Response(null, { status: 204, headers: { 'upload-offset': String(offset) } });
  };
  await uploadSignedFile(file, { uploadEndpoint: endpoint, uploadPath: `${crypto.randomUUID()}/${crypto.randomUUID()}.stl`, uploadToken: 'a.b.c' }, fetcher);
  assert.equal(offset, file.size);
  assert.equal(patches, 2);
  assert.match(metadata, /bucketName cXVvdGUtaW50YWtl/);
});

test('upload init rejects mismatched roles before touching storage', async () => {
  const { handleQuoteAttachmentInit } = require('../src/server/quote/handlers.ts');
  const { token } = newQuoteSession();
  const makeRequest = (role, name) => new Request('http://localhost:3000/api/quote/attachments/init', {
    method: 'POST',
    headers: { origin: 'http://localhost:3000', 'content-type': 'application/json', cookie: issueSessionCookie(token) },
    body: JSON.stringify({
      requestId: crypto.randomUUID(), uploadKey: crypto.randomUUID(),
      role, name, size: 100, type: 'application/octet-stream',
    }),
  });
  const forbiddenGateway = { consumeRate: async () => { throw Error('invalid input reached the database'); } };
  for (const [role, name] of [
    ['logo', 'model.stl'], ['model', 'image.pdf'], ['references', 'piece.3mf'],
    ['unknown', 'image.png'], [undefined, 'model.stl'],
  ]) {
    const response = await handleQuoteAttachmentInit(makeRequest(role, name), forbiddenGateway);
    assert.equal(response.status, 400, `${role}: ${name}`);
    assert.equal((await response.json()).error, 'invalid_quote_upload');
  }
});

test('upload init still signs an allowed model in its own field', async () => {
  const { handleQuoteAttachmentInit } = require('../src/server/quote/handlers.ts');
  const { token } = newQuoteSession();
  let reserved = false;
  const gateway = {
    consumeRate: async () => true,
    reserveAttachment: async input => {
      reserved = true;
      assert.equal(input.extension, '.stl');
      return {
        attachment_id: crypto.randomUUID(),
        object_path: 'private/synthetic/model.stl',
        reservation_expires_at: new Date(Date.now() + 27 * 60 * 60 * 1000).toISOString(),
      };
    },
    signUpload: async () => ({
      endpoint: 'https://cmtest.storage.supabase.co/storage/v1/upload/resumable/sign',
      token: 'synthetic-signature',
    }),
  };
  const response = await handleQuoteAttachmentInit(new Request('http://localhost:3000/api/quote/attachments/init', {
    method: 'POST',
    headers: { origin: 'http://localhost:3000', 'content-type': 'application/json', cookie: issueSessionCookie(token) },
    body: JSON.stringify({
      requestId: crypto.randomUUID(), uploadKey: crypto.randomUUID(),
      role: 'model', name: 'model.stl', size: 100, type: 'application/octet-stream',
    }),
  }), gateway);
  assert.equal(response.status, 200);
  assert.equal(reserved, true);
  assert.equal((await response.json()).tokenHeader, 'x-signature');
});
