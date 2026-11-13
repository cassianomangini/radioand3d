const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const ts = require("typescript");

function loadTypeScript(relativePath, stubs = {}) {
  const filename = path.join(__dirname, "..", relativePath);
  const compiled = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    fileName: filename,
  }).outputText;
  const loaded = new Module(filename, module);
  loaded.filename = filename;
  loaded.paths = Module._nodeModulePaths(path.dirname(filename));
  const original = loaded.require.bind(loaded);
  loaded.require = (name) => Object.hasOwn(stubs, name) ? stubs[name] : original(name);
  loaded._compile(compiled, filename);
  return loaded.exports;
}

const contract = loadTypeScript("src/features/products/catalog-contract.ts");
const titles = loadTypeScript("src/features/products/editorial-titles.ts");
const source = loadTypeScript("src/features/products/catalog-source-contract.ts");
const editorial = loadTypeScript("src/features/products/catalog-source-editorial.ts", {
  "./editorial-titles": titles,
});
const approval = loadTypeScript("src/features/products/search-approval.ts");
const seeds = require("../src/server/products/published-catalog-snapshot.json");
const now = Date.parse("2026-11-13T12:00:00Z");

function sourceItem(itemId = 9001, overrides = {}) {
  const description = "Caixa organizadora com duas divisórias para acessórios e pequenos objetos. "
    + "O modelo tem duas partes e foi pensado para uso em mesas, gavetas ou estantes. "
    + "Veja o tamanho e as cores no catálogo antes da compra.";
  return {
    itemId, shopId: source.CATALOG_SHOP_ID,
    sourceName: "Caixa Organizadora Personalizada Grande",
    sourceDescription: description, sourceStatus: "NORMAL", sourceSku: "CX",
    sourceCategoryId: null, sourceSyncedAt: "2026-11-13T10:00:00Z",
    sourceUpdatedAt: "2026-11-13T09:00:00Z",
    shopeeUrl: "https://shopee.com.br/product/" + source.CATALOG_SHOP_ID + "/" + itemId,
    imageUrls: ["https://cf.shopee.com.br/file/one", "https://cf.shopee.com.br/file/two"],
    product: {
      id: 222, sourceName: "Caixa interna", sourceDescription: null,
      active: true, status: "active",
      dimensionsCm: { width: 12, height: 8, depth: 5 },
      estimatedWeightG: 80, updatedAt: "2026-11-13T09:30:00Z",
    },
    variations: [{
      modelId: 1, sourceName: "Azul", sourceStatus: "MODEL_NORMAL",
    }, {
      modelId: 2, sourceName: "Deletada", sourceStatus: "MODEL_DELETED",
    }],
    ...overrides,
  };
}

function legacyItem(seed, overrides = {}) {
  return sourceItem(seed.id, {
    sourceName: seed.name,
    sourceDescription: seed.description.slice(0, 8000),
    imageUrls: seed.imageUrls,
    sourceSyncedAt: seed.sourceSyncedAt,
    sourceUpdatedAt: seed.sourceSyncedAt,
    product: null,
    variations: [],
    ...overrides,
  });
}

function page(items, hasMore = false) {
  return {
    version: 1, items, hasMore,
    nextCursor: hasMore ? items.at(-1).itemId : null,
  };
}

test("feed v1 refuses cross-shop, invalid images, wrong links and cursor drift", () => {
  assert.deepEqual(source.parseCatalogSourcePage(page([sourceItem()])),
    { items: [sourceItem()], nextCursor: null, hasMore: false });
  assert.equal(source.parseCatalogSourcePage(page([sourceItem(9001, { shopId: 999 })])), null);
  assert.equal(source.parseCatalogSourcePage(page([sourceItem(9001, {
    imageUrls: ["https://private.example/asset"],
  })])), null);
  assert.equal(source.parseCatalogSourcePage(page([sourceItem(9001, {
    shopeeUrl: "https://shopee.com.br/product/123/789",
  })])), null);
  assert.equal(source.parseCatalogSourcePage(page([sourceItem(9001)]), 10000), null);
  assert.equal(source.parseCatalogSourcePage({
    version: 1, items: [sourceItem()], hasMore: true, nextCursor: 9001,
  }), null);
  assert.equal(source.parseCatalogSourcePage({
    version: 1, items: [sourceItem()], hasMore: false, nextCursor: 9001,
  }), null);
});

test("site keeps 28 curated slugs and safely reflects a stopped listing", () => {
  const input = seeds.map((seed) => legacyItem(seed));
  input[0] = legacyItem(seeds[0], { sourceStatus: "UNLIST", shopeeUrl: null });
  const rendered = editorial.buildSiteCatalog(input, seeds, { now, autoIndex: true });
  assert.equal(rendered.length, 28);
  assert.deepEqual(rendered.map((p) => p.slug), seeds.map((seed) => seed.slug));
  assert.equal(rendered[0].sourceStatus, "UNLIST");
  assert.equal(rendered[0].shopeeUrl, null);
  assert.equal(approval.isSearchApprovedProduct(rendered[0]), false);
  assert.equal(rendered[1].name, seeds[1].name);
  assert.equal(rendered[1].description, seeds[1].description);
  assert.equal(rendered[1].imageUrls[0], seeds[1].imageUrls[0]);
  assert.equal(approval.searchApprovedProducts(rendered).length, 24);
  assert.ok(contract.parseCatalogResponse({ products: rendered }));
});

test("new generic product receives stable site URL and generated text, without invented material", () => {
  const input = [...seeds.map((seed) => legacyItem(seed)), sourceItem()];
  const rendered = editorial.buildSiteCatalog(input, seeds, { now, autoIndex: true });
  const generated = rendered.find((p) => p.slug === "produto-3d-9001");
  assert.ok(generated);
  assert.equal(generated.autoIndexEligible, true);
  assert.equal(generated.material, null);
  assert.equal(generated.dimensions, "12 × 8 × 5 cm (L × A × P)");
  assert.deepEqual(generated.variations, ["Azul"]);
  assert.ok(generated.description.length > 180);
  assert.equal(approval.isSearchApprovedProduct(generated), true);
  assert.deepEqual(contract.visibleProducts(rendered).length, 29);

  const renamed = sourceItem(9001, { sourceName: "Caixa Organizadora de Mesa" });
  const renamedCatalog = editorial.buildSiteCatalog([...input.slice(0, -1), renamed],
    seeds, { now, autoIndex: true });
  assert.equal(renamedCatalog.at(-1).slug, generated.slug);
});

test("auto indexing is gated; obvious IP, kits, stale status and missing evidence are withheld", () => {
  const original = seeds.map((seed) => legacyItem(seed));
  for (const [suffix, change] of [
    [1, { sourceName: "Caixa Marvel para Avengers" }],
    [2, { sourceName: "Kit Caixa Organizadora com Dois Modelos" }],
    [3, { imageUrls: ["https://cf.shopee.com.br/file/only"] }],
    [4, { sourceSyncedAt: "2026-10-01T10:00:00Z" }],
    [5, { product: { ...sourceItem().product, active: false } }],
    [6, { sourceStatus: "BANNED", shopeeUrl: null }],
    [7, { sourceDescription: "Curta" }],
  ]) {
    const result = editorial.buildSiteCatalog([
      ...original, sourceItem(9100 + suffix, change),
    ], seeds, { now, autoIndex: true });
    assert.equal(result.length, 28, "unsafe candidate " + suffix);
  }
  const preview = editorial.buildSiteCatalog([...original, sourceItem()], seeds,
    { now, autoIndex: false });
  assert.equal(preview.length, 29);
  assert.equal(approval.isSearchApprovedProduct(preview.at(-1)), false);
  assert.equal(approval.searchApprovedProducts(preview).length, 25);
});

test("one missing or unknown legacy item cannot silently deindex a product", () => {
  const all = seeds.map((seed) => legacyItem(seed));
  assert.throws(() => editorial.buildSiteCatalog(
    all.slice(1), seeds, { now, autoIndex: true },
  ), /scope_incomplete/);
  all[0] = legacyItem(seeds[0], { sourceStatus: "UNKNOWN", shopeeUrl: null });
  assert.throws(() => editorial.buildSiteCatalog(
    all, seeds, { now, autoIndex: true },
  ), /unknown_status/);
});

test("site source reader fetches the full feed and preserves legacy pages when source fails", async () => {
  const original = {
    url: process.env.CM_SITE_CATALOG_API_URL,
    token: process.env.CM_SITE_CATALOG_TOKEN,
    auto: process.env.CM_SITE_AUTO_INDEX_ENABLED,
    fetch: global.fetch,
  };
  process.env.CM_SITE_CATALOG_API_URL = "https://admin.example/api/internal/site-catalog";
  process.env.CM_SITE_CATALOG_TOKEN = "site-source-secret-token-at-least-32-chars";
  process.env.CM_SITE_AUTO_INDEX_ENABLED = "true";
  const requests = [];
  global.fetch = async (url, options) => {
    requests.push({ url: String(url), options });
    const all = [...seeds.map((seed) => legacyItem(seed)), sourceItem(9001)]
      .sort((a, b) => a.itemId - b.itemId);
    return { ok: true, json: async () => page(all) };
  };
  try {
    const catalog = loadTypeScript("src/server/products/catalog.ts", {
      "@/features/products/catalog-contract": contract,
      "@/features/products/catalog-source-contract": source,
      "@/features/products/catalog-source-editorial": editorial,
      "./published-catalog-snapshot.json": { default: seeds },
    });
    // Reader uses Date.now(); ensure this fixture's November 2026 gate is stable.
    const originalNow = Date.now;
    Date.now = () => now;
    try {
      const result = await catalog.getSiteCatalog();
      assert.equal(result.state, "available");
      assert.equal(result.products.length, 29);
      assert.equal(result.products.at(-1).autoIndexEligible, true);
      assert.equal(requests.length, 1);
      assert.equal(requests[0].url,
        "https://admin.example/api/internal/site-catalog");
      assert.equal(requests[0].options.cache, "force-cache");
      assert.equal(requests[0].options.headers.Authorization,
        "Bearer site-source-secret-token-at-least-32-chars");
    } finally {
      Date.now = originalNow;
    }

    global.fetch = async () => ({ ok: false, status: 503 });
    const failed = await catalog.getSiteCatalog();
    assert.equal(failed.state, "available");
    assert.equal(failed.degraded, true);
    assert.equal(failed.products.length, 28);
    assert.deepEqual(failed.products.map((p) => p.slug), seeds.map((p) => p.slug));
    assert.equal(approval.searchApprovedProducts(failed.products).length, 25);
  } finally {
    global.fetch = original.fetch;
    for (const [key, value] of [
      ["CM_SITE_CATALOG_API_URL", original.url],
      ["CM_SITE_CATALOG_TOKEN", original.token],
      ["CM_SITE_AUTO_INDEX_ENABLED", original.auto],
    ]) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
});

test("reads a 70-item catalog with a real second cursor and rejects a partial page", async () => {
  const previous = {
    url: process.env.CM_SITE_CATALOG_API_URL,
    token: process.env.CM_SITE_CATALOG_TOKEN,
    auto: process.env.CM_SITE_AUTO_INDEX_ENABLED,
    fetch: global.fetch,
  };
  process.env.CM_SITE_CATALOG_API_URL = "https://admin.example/api/internal/site-catalog";
  process.env.CM_SITE_CATALOG_TOKEN = "site-source-secret-token-at-least-32-chars";
  process.env.CM_SITE_AUTO_INDEX_ENABLED = "false";

  const all = [
    ...seeds.map((seed) => legacyItem(seed)),
    ...Array.from({ length: 42 }, (_, index) => sourceItem(60000000000 + index)),
  ].sort((a, b) => a.itemId - b.itemId);
  const cursor = all[49].itemId;
  const seen = [];
  let secondPageShouldFail = false;
  global.fetch = async (url) => {
    const requestUrl = new URL(url);
    const after = requestUrl.searchParams.get("after");
    seen.push(after);
    if (after === null) {
      return { ok: true, json: async () => page(all.slice(0, 50), true) };
    }
    assert.equal(after, String(cursor));
    if (secondPageShouldFail) return { ok: false, status: 503 };
    return { ok: true, json: async () => page(all.slice(50)) };
  };

  try {
    const catalog = loadTypeScript("src/server/products/catalog.ts", {
      "@/features/products/catalog-contract": contract,
      "@/features/products/catalog-source-contract": source,
      "@/features/products/catalog-source-editorial": editorial,
      "./published-catalog-snapshot.json": { default: seeds },
    });
    const originalNow = Date.now;
    Date.now = () => now;
    try {
      const response = await catalog.getSiteCatalog();
      assert.equal(response.state, "available");
      assert.equal(response.products.length, 70);
      assert.deepEqual(seen, [null, String(cursor)]);
      assert.equal(approval.searchApprovedProducts(response.products).length, 25);

      secondPageShouldFail = true;
      const failed = await catalog.getSiteCatalog();
      assert.equal(failed.state, "available");
      assert.equal(failed.degraded, true);
      assert.deepEqual(failed.products.map((p) => p.slug), seeds.map((p) => p.slug));
      assert.equal(approval.searchApprovedProducts(failed.products).length, 25);
    } finally {
      Date.now = originalNow;
    }
  } finally {
    global.fetch = previous.fetch;
    for (const [key, value] of [
      ["CM_SITE_CATALOG_API_URL", previous.url],
      ["CM_SITE_CATALOG_TOKEN", previous.token],
      ["CM_SITE_AUTO_INDEX_ENABLED", previous.auto],
    ]) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
});


test("broken or incomplete API credentials never cause product or sitemap outage", async () => {
  const original = {
    url: process.env.CM_SITE_CATALOG_API_URL,
    token: process.env.CM_SITE_CATALOG_TOKEN,
  };
  const reader = loadTypeScript("src/server/products/catalog.ts", {
    "@/features/products/catalog-contract": contract,
    "@/features/products/catalog-source-contract": source,
    "@/features/products/catalog-source-editorial": editorial,
    "./published-catalog-snapshot.json": { default: seeds },
  });
  try {
    for (const config of [
      { url: "https://admin.example/api/internal/site-catalog", token: undefined },
      { url: undefined, token: "site-source-secret-token-at-least-32-chars" },
      { url: "https://admin.example/broken", token: "site-source-secret-token-at-least-32-chars" },
    ]) {
      if (config.url === undefined) delete process.env.CM_SITE_CATALOG_API_URL;
      else process.env.CM_SITE_CATALOG_API_URL = config.url;
      if (config.token === undefined) delete process.env.CM_SITE_CATALOG_TOKEN;
      else process.env.CM_SITE_CATALOG_TOKEN = config.token;

      const result = await reader.getSiteCatalog();
      assert.equal(result.state, "available");
      assert.equal(result.degraded, true);
      assert.equal(result.products.length, 28);
      assert.equal(approval.searchApprovedProducts(result.products).length, 25);
    }
  } finally {
    for (const [key, value] of [
      ["CM_SITE_CATALOG_API_URL", original.url],
      ["CM_SITE_CATALOG_TOKEN", original.token],
    ]) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
});

test("deleted Shopee listing keeps an editorial detail URL without a purchase CTA", () => {
  const all = seeds.map((seed) => legacyItem(seed));
  all[0] = legacyItem(seeds[0], { sourceStatus: "SELLER_DELETE", shopeeUrl: null });
  const rendered = editorial.buildSiteCatalog(all, seeds, { now, autoIndex: false });
  assert.equal(rendered[0].slug, seeds[0].slug);
  assert.equal(rendered[0].sourceStatus, "SELLER_DELETE");
  assert.equal(rendered[0].shopeeUrl, null);
  assert.equal(approval.isSearchApprovedProduct(rendered[0]), false);
  const detailPage = fs.readFileSync(path.join(__dirname, "..", "src/app/produtos/[slug]/page.tsx"), "utf8");
  assert.match(detailPage, /if \(!product\) notFound\(\)/);
  assert.doesNotMatch(detailPage, /product\.sourceStatus\s*===\s*"SELLER_DELETE"\)\s*notFound/);
});
