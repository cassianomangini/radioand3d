const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const { pathToFileURL } = require('node:url');

const editorial = import(pathToFileURL(resolve('src/features/products/editorial-titles.ts')).href);
const snapshot = JSON.parse(readFileSync(resolve('src/server/products/published-catalog-snapshot.json'), 'utf8'));

test('os 27 anuncios do snapshot tem titulo editorial unico e curto', async () => {
  const { curatedProductTitles, getProductDisplayTitle, getProductSeoTitle } = await editorial;
  assert.equal(snapshot.length, 27);
  assert.equal(Object.keys(curatedProductTitles).length, 27);
  assert.deepEqual(new Set(Object.keys(curatedProductTitles)), new Set(snapshot.map((row) => row.slug)));
  const titles = snapshot.map((row) => getProductDisplayTitle({ slug: row.slug, name: row.name }));
  assert.equal(new Set(titles).size, snapshot.length);
  assert.ok(titles.every((title) => title.length >= 12 && title.length <= 48));
  assert.ok(snapshot.every((row) => getProductSeoTitle({ slug: row.slug, name: row.name, seoTitle: row.name }).endsWith(' | CMangini3D')));
  assert.ok(titles.every((title) => !title.includes(' | ') && !title.includes('Artesópolis')));
});

test('nome da Shopee permanece inalterado atraves de edicoes na origem', async () => {
  const { getProductDisplayTitle, getProductSeoTitle } = await editorial;
  const item = snapshot.find((row) => row.slug === 'porta-curativos-compacto');
  const original = item.name;
  const first = { slug: item.slug, name: item.name, seoTitle: item.name };
  assert.equal(getProductDisplayTitle(first), 'Porta-Curativos Compacto');
  assert.equal(getProductSeoTitle(first), 'Porta-Curativos Compacto para Bolsa e Viagem | CMangini3D');
  assert.equal(item.name, original);
  assert.equal(getProductDisplayTitle({ ...first, name: 'Anuncio alterado no Seller Center' }), 'Porta-Curativos Compacto');
});

test('produto novo sem curadoria recebe sugestao conservadora sem alterar a origem', async () => {
  const { getProductDisplayTitle, getProductSeoTitle, suggestProductDisplayTitle } = await editorial;
  const product = { slug: 'novo-produto-teste', name: 'Organizador para Mesa | Impressão 3D' };
  assert.equal(getProductDisplayTitle(product), 'Organizador para Mesa');
  assert.equal(product.name, 'Organizador para Mesa | Impressão 3D');
  assert.equal(getProductSeoTitle(product), 'Organizador para Mesa | CMangini3D');
  assert.equal(suggestProductDisplayTitle('Caixa especial transparente com mecanismo bem especifico'), 'Caixa especial transparente com mecanismo bem especifico');
});

test('seo editorial de produto novo e preservado e a marca fica normalizada', async () => {
  const { getProductSeoTitle } = await editorial;
  assert.equal(getProductSeoTitle({
    slug: 'produto-futuro', name: 'Nome bruto da Shopee', seoTitle: 'Estojo de viagem para acessorios | CMangini 3D',
  }), 'Estojo de viagem para acessorios | CMangini3D');
});
