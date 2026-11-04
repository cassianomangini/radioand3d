const test = require('node:test');
const assert = require('node:assert/strict');
const { pathToFileURL } = require('node:url');
const { resolve } = require('node:path');

const contract = import(pathToFileURL(resolve('src/features/products/catalog-contract.ts')).href);

function product(overrides = {}) {
  return {
    slug: 'porta-figurinhas',
    name: 'Porta figurinhas',
    summary: 'Caixa para guardar figurinhas.',
    description: 'Caixa impressa em 3D para organizar a coleção.',
    categorySlug: null,
    seoTitle: 'Porta figurinhas',
    seoDescription: 'Conheça o porta figurinhas.',
    shopeeUrl: 'https://shopee.com.br/Porta-Figurinhas-i.1433140862.58206080464',
    imageUrls: ['https://cf.shopee.com.br/file/abc'],
    material: null,
    dimensions: null,
    customizable: false,
    variations: [],
    sourceStatus: 'NORMAL',
    sourceSyncedAt: '2026-11-04T05:31:00Z',
    contentUpdatedAt: '2026-11-04T12:00:00Z',
    ...overrides,
  };
}

test('keeps only the public contract and lists active items', async () => {
  const { parseCatalogResponse, visibleProducts } = await contract;
  const parsed = parseCatalogResponse({ products: [product({ private_cost: 100 })] });
  assert.equal(parsed.length, 1);
  assert.equal('private_cost' in parsed[0], false);
  assert.equal(visibleProducts(parsed).length, 1);
});

test('keeps an inactive detail without a purchase link or listing card', async () => {
  const { parseCatalogResponse, visibleProducts } = await contract;
  const parsed = parseCatalogResponse({ products: [product({ sourceStatus: 'UNLIST', shopeeUrl: null })] });
  assert.equal(parsed.length, 1);
  assert.equal(visibleProducts(parsed).length, 0);
});

test('rejects a private image host, a wrong status link, and duplicate slugs', async () => {
  const { parseCatalogResponse } = await contract;
  assert.equal(parseCatalogResponse({ products: [product({ imageUrls: ['https://other.example/file/x'] })] }), null);
  assert.equal(parseCatalogResponse({ products: [product({ sourceStatus: 'UNLIST' })] }), null);
  assert.equal(parseCatalogResponse({ products: [product(), product()] }), null);
});
