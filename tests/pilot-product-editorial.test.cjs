const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const { pathToFileURL } = require('node:url');

const editorial = import(pathToFileURL(resolve('src/features/products/pilot-product-editorial.ts')).href);
const snapshot = JSON.parse(readFileSync(resolve('src/server/products/published-catalog-snapshot.json'), 'utf8'));
const candidates = [
  'caixa-organizadora-dois-compartimentos',
  'porta-controles-de-mesa',
  'porta-curativos-compacto',
  'casinha-porta-iscas-formiga',
  'porta-figurinhas-3d',
];

test('piloto tem cinco produtos reais com descricoes individuais, diferentes do anuncio bruto', async () => {
  const { pilotProductEditorial, getPilotProductEditorial } = await editorial;
  assert.deepEqual(Object.keys(pilotProductEditorial).sort(), [...candidates].sort());
  assert.equal(new Set(Object.values(pilotProductEditorial).map(item => item.metaDescription)).size, 5);
  for (const slug of candidates) {
    const row = snapshot.find(item => item.slug === slug);
    const item = getPilotProductEditorial(slug);
    assert.ok(row);
    assert.ok(item);
    assert.notEqual(item.metaDescription, row.name);
    assert.ok(item.metaDescription.length >= 90 && item.metaDescription.length <= 170);
    assert.equal(item.paragraphs.length, 3);
    assert.ok(item.paragraphs.every(text => text.length >= 80));
    assert.ok(!item.paragraphs.join(' ').includes('Artesopolis'));
  }
  assert.equal(getPilotProductEditorial('item-nao-revisado'), null);
});

test('o piloto registra distincao critica das variacoes e os cuidados relevantes', async () => {
  const { getPilotProductEditorial } = await editorial;
  const caixa = getPilotProductEditorial('caixa-organizadora-dois-compartimentos');
  assert.match(caixa.paragraphs.join(' '), /sem divisória/);
  const curativos = getPilotProductEditorial('porta-curativos-compacto');
  assert.match(curativos.paragraphs.join(' '), /não deve ser usado para armazenar comprimidos soltos/);
  const iscas = getPilotProductEditorial('casinha-porta-iscas-formiga');
  assert.match(iscas.paragraphs.join(' '), /sem isca, formicida, gel, inseticida/);
});

test('nenhum produto fica automaticamente elegivel a indexacao pelo piloto', async () => {
  const approval = await import(pathToFileURL(resolve('src/features/products/search-approval.ts')).href);
  assert.equal(approval.hasSearchApprovedProducts(), false);
  for (const slug of candidates) {
    assert.equal(approval.isSearchApprovedProduct({slug,sourceStatus:'NORMAL'}), false);
  }
});
