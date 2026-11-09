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

test('cinco produtos reais tem copy de site, beneficios e meta descriptions proprias', async () => {
  const { pilotProductEditorial, getPilotProductEditorial } = await editorial;
  assert.deepEqual(Object.keys(pilotProductEditorial).sort(), [...candidates].sort());
  assert.equal(new Set(Object.values(pilotProductEditorial).map(item => item.metaDescription)).size, 5);
  assert.equal(new Set(Object.values(pilotProductEditorial).map(item => item.lead)).size, 5);
  for (const slug of candidates) {
    const row = snapshot.find(item => item.slug === slug);
    const item = getPilotProductEditorial(slug);
    assert.ok(row, slug);
    assert.ok(item, slug);
    assert.notEqual(item.metaDescription, row.name);
    assert.ok(item.metaDescription.length >= 90 && item.metaDescription.length <= 160, slug);
    assert.ok(item.lead.length >= 65 && item.body.length >= 65, slug);
    assert.ok(Array.isArray(item.facts) && item.facts.length >= 2, slug);
    assert.equal(new Set(item.facts.map(fact => fact.label)).size, item.facts.length, slug);
    assert.ok(item.facts.every(fact => fact.label.trim() && fact.value.trim()), slug);
    assert.ok(item.note && item.note.length >= 50, slug);
    const whole = [item.lead, item.body, item.note].join(' ');
    assert.doesNotMatch(whole, /o an[uú]ncio informa|confira as medidas [uú]teis|do Artesopolis|do Artes[oó]polis/iu, slug);
  }
  assert.equal(getPilotProductEditorial('item-nao-revisado'), null);
});

test('informacoes cruciais permanecem visiveis sem tom burocratico', async () => {
  const { getPilotProductEditorial } = await editorial;
  const caixa = getPilotProductEditorial('caixa-organizadora-dois-compartimentos');
  assert.match(caixa.body, /sem divisória/);
  assert.match(caixa.metaDescription, /sem divisória/);
  assert.match(caixa.note, /medidas internas/);
  const curativos = getPilotProductEditorial('porta-curativos-compacto');
  assert.match(curativos.note, /Curativos não inclusos/);
  assert.match(curativos.facts.map(f => f.value).join(' '), /10 × 3,2 × 1,8/);
  const iscas = getPilotProductEditorial('casinha-porta-iscas-formiga');
  assert.match(iscas.note, /não acompanham/);
  assert.match(iscas.note, /crianças e animais/);
  const figurinhas = getPilotProductEditorial('porta-figurinhas-3d');
  assert.match(figurinhas.note, /kit é vendido em outro anúncio/);
  const controles = getPilotProductEditorial('porta-controles-de-mesa');
  assert.match(controles.note, /dimensões variam/);
});

test('novo texto do piloto nao libera indexacao automaticamente', async () => {
  const approval = await import(pathToFileURL(resolve('src/features/products/search-approval.ts')).href);
  assert.equal(approval.hasSearchApprovedProducts(), false);
  for (const slug of candidates) {
    assert.equal(approval.isSearchApprovedProduct({ slug, sourceStatus: 'NORMAL' }), false);
  }
});
