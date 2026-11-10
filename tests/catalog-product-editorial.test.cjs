const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const { pathToFileURL } = require('node:url');

const editorial = import(pathToFileURL(resolve('src/features/products/catalog-product-editorial.ts')).href);
const snapshot = JSON.parse(readFileSync(resolve('src/server/products/published-catalog-snapshot.json'), 'utf8'));
const previousPilot = [
  'caixa-organizadora-dois-compartimentos',
  'porta-controles-de-mesa',
  'porta-curativos-compacto',
  'casinha-porta-iscas-formiga',
  'porta-figurinhas-3d',
];

test('todo o catalogo publicado tem copy propria, sem alterar os dados da Shopee', async () => {
  const { catalogProductEditorial, getCatalogProductEditorial } = await editorial;
  const slugs = Object.keys(catalogProductEditorial);
  assert.equal(snapshot.length, 28);
  assert.deepEqual(new Set(slugs), new Set(snapshot.map(product => product.slug)));
  assert.equal(slugs.length - previousPilot.length, 23);
  assert.equal(new Set(Object.values(catalogProductEditorial).map(item => item.metaDescription)).size, 28);
  assert.equal(new Set(Object.values(catalogProductEditorial).map(item => item.lead)).size, 28);
  for (const product of snapshot) {
    const content = getCatalogProductEditorial(product.slug);
    assert.ok(content, product.slug);
    assert.notEqual(content.metaDescription, product.name);
    assert.ok(content.metaDescription.length >= 90 && content.metaDescription.length <= 170, product.slug);
    assert.ok(content.lead.length >= 70 && content.body.length >= 65, product.slug);
    assert.ok(content.note.length >= 45, product.slug);
    assert.ok(content.facts.length >= 2 && content.facts.length <= 5, product.slug);
    assert.equal(new Set(content.facts.map(fact => fact.label)).size, content.facts.length, product.slug);
    assert.ok(content.facts.every(fact => fact.label.trim() && fact.value.trim()), product.slug);
    const visibleCopy = [content.lead, content.body, content.note].join(' ');
    assert.doesNotMatch(visibleCopy, /o an[uú]ncio informa|informa aproximadamente|do Artes[oó]polis|confira as medidas [uú]teis/iu, product.slug);
  }
  assert.equal(getCatalogProductEditorial('nao-vinculado-ao-catalogo'), null);
});

test('informacoes decisivas e limites de variacoes seguem claros', async () => {
  const { getCatalogProductEditorial: get } = await editorial;
  assert.match(get('caixa-organizadora-dois-compartimentos').body, /sem divisória/);
  assert.match(get('caixinha-organizadora-pequena').body, /sem divisória/);
  assert.doesNotMatch(JSON.stringify(get('caixinha-organizadora-pequena').facts), /8,8|8 × 6/);
  assert.doesNotMatch(JSON.stringify(get('estojo-duplo-compacto').facts), /11,5|11 ×/);
  assert.match(get('kit-porta-figurinhas-3d').note, /quantidade de peças incluídas no kit/);
  assert.match(get('fita-cassete-retro').note, /não reproduz áudio/);
  assert.match(get('dummy-13-boneco-articulado').facts[0].value, /2 cartelas/);
  assert.match(get('capa-botao-descarga').note, /não substitui o botão/);
  assert.match(get('porta-controle-good-vibes').note, /Não há indicação de impermeabilização/);
  assert.match(get('porta-remedios-semanal').note, /Respeite a dose/);
  assert.match(get('bolinhas-basquete-sensoriais').note, /Não indicado para crianças pequenas/);
  assert.match(get('kit-porta-curativos').note, /não acompanham o kit/);
  assert.match(get('casinha-porta-iscas-formiga').note, /crianças e animais/);
  const soldados = get('kit-soldados-verdes-dedo-do-meio');
  assert.match(soldados.lead, /dedo do meio/i);
  assert.match(soldados.facts[0].value, /3 miniaturas/);
  assert.match(soldados.facts[1].value, /6 × 3,5 × 2 cm/);
  assert.match(soldados.facts[2].value, /Verde Oliva/);
  assert.doesNotMatch(soldados.metaDescription, /Toy Story|Disney|Pixar/i);
});

test('texto editorial nao libera indexacao e manteve os cinco primeiros', async () => {
  const { getCatalogProductEditorial: get } = await editorial;
  const approval = await import(pathToFileURL(resolve('src/features/products/search-approval.ts')).href);
  assert.equal(approval.hasSearchApprovedProducts(), false);
  for (const product of snapshot) {
    assert.equal(approval.isSearchApprovedProduct({ slug: product.slug, sourceStatus: 'NORMAL' }), false);
  }
  assert.deepEqual(new Set(previousPilot).size, 5);
  assert.match(get('porta-curativos-compacto').lead, /Chega de curativos espalhados/);
  assert.match(get('porta-figurinhas-3d').note, /kit é vendido em outro anúncio/);
});

test('revisao editorial preserva escala, informacoes claras e alerta de partes soltas', async () => {
  const { getCatalogProductEditorial: get } = await editorial;
  const cassete = get('fita-cassete-retro');
  assert.doesNotMatch(cassete.lead, /miniatura/i);
  assert.match(cassete.lead, /formato de fita cassete/i);
  assert.match(get('dinossauro-articulado-t-rex').note, /partes que podem se soltar/);
  for (const slug of ['caixa-organizadora-grande', 'caixa-organizadora-quadrada']) {
    const facts = get(slug).facts;
    assert.ok(facts.some((fact) => fact.label === 'Medidas (fechada)'), slug);
    assert.ok(facts.every((fact) => fact.label !== 'Dimensões fechada'), slug);
  }
});

test('titulos dos cards continuam visualmente limitados a duas linhas', () => {
  const css = readFileSync(resolve('src/app/produtos/products.module.css'), 'utf8');
  const rule = css.match(/\.cardBody strong \{([^}]+)\}/u)?.[1];
  assert.ok(rule, 'regra de nome do card');
  assert.match(rule, /-webkit-line-clamp:\s*2\s*;/);
  assert.match(rule, /overflow:\s*hidden\s*;/);
});
