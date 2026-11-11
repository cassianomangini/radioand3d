const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const { pathToFileURL } = require('node:url');

const editorial = import(pathToFileURL(resolve('src/features/products/editorial-titles.ts')).href);
const snapshot = JSON.parse(readFileSync(resolve('src/server/products/published-catalog-snapshot.json'), 'utf8'));

test('os 28 anuncios do snapshot tem titulo editorial unico e curto', async () => {
  const { curatedProductTitles, getProductDisplayTitle, getProductSeoTitle } = await editorial;
  assert.equal(snapshot.length, 28);
  assert.equal(Object.keys(curatedProductTitles).length, 28);
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
  assert.equal(suggestProductDisplayTitle('Caixa especial transparente com mecanismo bem especifico'), 'Caixa especial transparente com mecanismo');
  assert.equal(getProductDisplayTitle({ slug: 'item-longo', name: 'Caixa organizadora para acessórios de escritório com tampa e compartimentos diversos' }), 'Caixa organizadora para acessórios de escritório');
  assert.equal(getProductSeoTitle({ slug: 'item-longo', name: 'Caixa organizadora para acessórios de escritório com tampa e compartimentos diversos' }), 'Caixa organizadora para acessórios de escritório | CMangini3D');
  const longToken = 'Super' + 'a'.repeat(75);
  const shortened = suggestProductDisplayTitle(longToken);
  assert.equal(shortened.length, 48);
  assert.ok(shortened.endsWith('…'), 'palavra sem espaços deve sinalizar truncamento');
  assert.equal(longToken.length, 80, 'o nome recebido não foi alterado');
});

test('os titulos de produtos por categoria correspondem a sua funcao', async () => {
  const { getProductDisplayTitle, getProductSeoTitle } = await editorial;
  assert.equal(getProductDisplayTitle({ slug: 'porta-controle-good-vibes', name: 'Nome bruto' }), 'Vaso Decorativo Good Vibes Only');
  assert.equal(getProductSeoTitle({ slug: 'capa-botao-descarga', name: 'Nome bruto' }), 'Capa para Botão de Descarga de Vaso Sanitário | CMangini3D');
  assert.equal(getProductDisplayTitle({ slug: 'kit-soldados-verdes-dedo-do-meio', name: 'Nome bruto' }), 'Kit 3 Soldados Verdes Dedo do Meio');
  assert.equal(getProductSeoTitle({ slug: 'kit-soldados-verdes-dedo-do-meio', name: 'Nome bruto' }), 'Kit 3 Soldados Verdes Dedo do Meio | CMangini3D');
  assert.equal(getProductSeoTitle({ slug: 'martelo-thor-rotativo', name: 'Nome bruto' }), 'Mini Martelo Nórdico Rotativo em 3D | CMangini3D');
});

test('seo editorial de produto novo e preservado e a marca fica normalizada', async () => {
  const { getProductSeoTitle } = await editorial;
  assert.equal(getProductSeoTitle({
    slug: 'produto-futuro', name: 'Nome bruto da Shopee', seoTitle: 'Estojo de viagem para acessorios | CMangini 3D',
  }), 'Estojo de viagem para acessorios | CMangini3D');
});
