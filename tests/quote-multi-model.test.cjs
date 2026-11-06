const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');

const resolveOriginal = Module._resolveFilename;
Module._resolveFilename = function(request, parent, isMain, options) {
  const target = request.startsWith('@/') ? path.join(__dirname, '../src', request.slice(2)) : request;
  return resolveOriginal.call(this, target, parent, isMain, options);
};
require.extensions['.ts'] = (module, filename) => {
  const source = fs.readFileSync(filename, 'utf8');
  module._compile(ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
    fileName: filename,
  }).outputText, filename);
};

const { validModelItems, restorableModelItems, modelUnits } = require('../src/features/quote/model-items.ts');
const { parseQuoteForm, parseQuoteAttachments, validateQuoteForm, prepareQuoteForStorage } = require('../src/server/quote/form-contract.ts');
const { validateQuoteFiles } = require('../src/features/quote/file-policy.ts');
const { quoteEmailMessage } = require('../src/server/quote/email.ts');

function model(source, identifier) {
  return {
    id: crypto.randomUUID(), source,
    link: source === 'link' ? 'https://makerworld.com/pt/models/' + identifier : '',
    fileName: source === 'file' ? identifier + '.stl' : '',
    quantity: 1, colorMode: 'indeciso', colors: [], scale: 'original',
    dimensions: { width: '', depth: '', height: '' }, notes: '',
  };
}
function draft(modelItems) {
  return {
    type: 'arquivo', boxMode: '', boxQuickDescription: '', boxShape: '', boxShapeOther: '',
    boxDividers: '', boxDividerCount: '', boxDimensions: { width: '', depth: '', height: '' },
    boxUnknown: false, boxBasis: '', boxNoPersonalization: false,
    boxPersonalization: [], boxText: '', boxQrSource: '', boxQrContent: '',
    plateMode: '', plateQuickDescription: '', plateContents: [], plateContentUnknown: false,
    plateText: '', plateQrSource: '', plateQrContent: '', plateUse: '',
    plateUseUnknown: false, plateFixation: '', plateFixationUnknown: false,
    plateDimensions: { width: '', depth: '', height: '' }, plateUnknown: false,
    modelScale: '', modelSource: 'file', modelLink: '', modelScaleUnknown: false,
    modelDimensions: { width: '', depth: '', height: '' }, modelNotes: '', modelItems,
    otherDescription: '', otherSize: '', colorMode: '', colors: [{ name: '', rgb: '' }],
    quantity: 1, name: 'Cliente', contactMethod: 'whatsapp', contact: '11999999999',
    delivery: 'retirada', cep: '',
  };
}

test('20 links valid and 21 blocked; each model has its own quantity, color and size', () => {
  const items = Array.from({ length: 20 }, (_, i) => model('link', 20000 + i));
  items[0].quantity = 5;
  items[0].colorMode = 'tenho';
  items[0].colors = [{ name: 'Vermelho', rgb: '' }];
  items[0].scale = 'alterar';
  items[0].dimensions.width = '12';
  assert.equal(validModelItems(items), true);
  assert.equal(modelUnits(items), 24);
  assert.equal(validateQuoteForm(draft(items), []), true);
  const stored = prepareQuoteForStorage(draft(items), []);
  assert.equal(stored.project.items.length, 20);
  assert.equal(stored.project.modelLink, items[0].link);
  assert.equal(stored.production.quantity, 24);
  assert.equal(validModelItems([...items, model('link', 999)]), false);
  assert.equal(validModelItems([...items.slice(0, 19), { ...items[0], id: items[1].id }]), false);
});

test('mixed link plus two STL are associated by modelId, never by filename index', () => {
  const first = model('link', 12345);
  const second = model('file', 'arvore');
  const third = model('file', 'estrela');
  const files = [second, third].map((item) => ({
    id: crypto.randomUUID(), role: 'model', modelItemId: item.id,
    name: item.fileName, size: 150_000, type: 'application/octet-stream',
  }));
  const parsed = parseQuoteAttachments(files);
  assert.ok(parsed);
  assert.equal(validateQuoteForm(draft([first, second, third]), parsed), true);
  const stored = prepareQuoteForStorage(draft([first, second, third]), parsed);
  assert.equal(stored.project.modelLink, null);
  assert.equal(stored.project.items[1].attachmentId, files[0].id);
  assert.equal(stored.project.items[2].attachmentId, files[1].id);
  assert.equal(validateQuoteForm(draft([first, second, third]), [{ ...files[0], modelItemId: first.id }, files[1]]), false);
  assert.equal(validateQuoteForm(draft([first, second, third]), files.slice(0, 1)), false);
  assert.equal(validateQuoteForm(draft([first, second, third]), [...files, files[0]]), false);
});

test('model source and values are validated server-side, no silent bad URLs', () => {
  const link = model('link', 12345);
  assert.equal(validModelItems([link]), true);
  assert.equal(validModelItems([{ ...link, link: 'http://localhost/admin' }]), false);
  assert.equal(validModelItems([{ ...link, link: 'https://evil.com/models/123' }]), false);
  assert.equal(validModelItems([{ ...link, quantity: 0 }]), false);
  assert.equal(validModelItems([{ ...link, notes: 'x'.repeat(141) }]), false);
  assert.equal(validModelItems([{ ...link, colorMode: 'tenho', colors: [] }]), false);
  assert.equal(parseQuoteForm({ ...draft([link]), modelItems: Array(21).fill(link) }), null);
});

test('limits: up to five files, 5 MB reference, 30 MB model, 50 MB combined', () => {
  assert.equal(validateQuoteFiles([{ name: 'foto.jpg', size: 5_000_000 }]).ok, true);
  assert.equal(validateQuoteFiles([{ name: 'foto.jpg', size: 5_000_001 }]).ok, false);
  assert.equal(validateQuoteFiles([{ name: 'arvore.3mf', size: 30_000_000 }]).ok, true);
  assert.equal(validateQuoteFiles([{ name: 'arvore.3mf', size: 30_000_001 }]).ok, false);
  assert.equal(validateQuoteFiles([{ name: 'a.stl', size: 30_000_000 }, { name: 'b.stl', size: 30_000_000 }]).ok, false);
  assert.equal(validateQuoteFiles(Array.from({ length: 6 }, (_, i) => ({ name: i + '.png', size: 1_000_000 }))).ok, false);
});

test('email lists each model with link, quantity and mapped private file', () => {
  const link = model('link', 12345);
  const file = model('file', 'estrela');
  const attachmentId = crypto.randomUUID();
  const saved = prepareQuoteForStorage(draft([link, file]), [{
    id: attachmentId, role: 'model', modelItemId: file.id, name: file.fileName, size: 1234, type: 'application/octet-stream',
  }]);
  const message = quoteEmailMessage(crypto.randomUUID(), {
    projectType: 'impressao', sourceReference: null,
    production: saved.production, project: saved.project,
    contactMethod: 'whatsapp', contactName: 'Cliente', contactValue: '11999999999',
    attachments: [{ id: attachmentId, name: file.fileName, url: 'https://example.com/private?token=a&download=b' }],
  }, 'https://radioand3d.vercel.app');
  assert.match(message.text, /Modelo 01/);
  assert.match(message.text, /Modelo 02/);
  assert.match(message.text, /makerworld.com\/pt\/models\/12345/);
  assert.match(message.text, /estrela.stl: https:\/\/example.com\/private/);
  assert.match(message.html, /token=a&amp;download=b/);
  assert.ok(message.text.indexOf('Modelo 01') < message.text.indexOf('Modelo 02'));
});

test('legacy single-model quote still passes validation without modelItems', () => {
  const legacy = draft([]);
  delete legacy.modelItems;
  legacy.modelSource = 'link';
  legacy.modelLink = 'https://makerworld.com/pt/models/12345';
  legacy.colorMode = 'indeciso';
  legacy.modelScale = 'original';
  assert.ok(parseQuoteForm(legacy));
  assert.equal(validateQuoteForm(legacy, []), true);
});

test('incomplete model changes are restorable but not submittable', () => {
  const item = model('link', 12345);
  item.link = 'https://makerworld.com/pt/models/';
  item.colorMode = 'tenho';
  item.colors = [{ name: '', rgb: '' }];
  item.scale = 'alterar';
  item.dimensions.width = '';
  assert.equal(restorableModelItems([item]), true);
  assert.equal(validModelItems([item]), false);
  assert.equal(restorableModelItems(Array.from({ length: 21 }, () => item)), false);
  assert.equal(restorableModelItems([{ ...item, id: 'bad-id' }]), false);
});
