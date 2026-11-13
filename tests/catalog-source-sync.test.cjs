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


function catalogReaderWithStore(store, scheduled) {
  return loadTypeScript("src/server/products/catalog.ts", {
    "next/server": { after: (callback) => scheduled.push(callback) },
    "@/features/products/catalog-contract": contract,
    "@/features/products/catalog-source-contract": source,
    "@/features/products/catalog-source-editorial": editorial,
    "./catalog-snapshot-store": store,
    "./published-catalog-snapshot.json": { default: seeds },
  });
}

async function withCatalogRuntime(testBody) {
  const original = {
    url: process.env.CM_SITE_CATALOG_API_URL,
    token: process.env.CM_SITE_CATALOG_TOKEN,
    auto: process.env.CM_SITE_AUTO_INDEX_ENABLED,
    fetch: global.fetch,
    now: Date.now,
  };
  process.env.CM_SITE_CATALOG_API_URL = "https://admin.example/api/internal/site-catalog";
  process.env.CM_SITE_CATALOG_TOKEN = "site-source-secret-token-at-least-32-chars";
  process.env.CM_SITE_AUTO_INDEX_ENABLED = "false";
  Date.now = () => now;
  try { await testBody(); }
  finally {
    global.fetch = original.fetch;
    Date.now = original.now;
    for (const [key, value] of [
      ["CM_SITE_CATALOG_API_URL", original.url],
      ["CM_SITE_CATALOG_TOKEN", original.token],
      ["CM_SITE_AUTO_INDEX_ENABLED", original.auto],
    ]) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
}

test("first live sync persists before exposing a new page; Admin outage keeps its URL", async () => {
  await withCatalogRuntime(async () => {
    let saved = null;
    const writes = [];
    const scheduled = [];
    const store = {
      readStoredCatalog: async () => saved,
      writeStoredCatalog: async (products, etag) => {
        writes.push(etag);
        saved = { products, savedAt: new Date(now).toISOString(),
          etag: '"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"' };
        return "written";
      },
    };
    const reader = catalogReaderWithStore(store, scheduled);
    const all = [...seeds.map((seed) => legacyItem(seed)), sourceItem(9001)]
      .sort((a, b) => a.itemId - b.itemId);
    global.fetch = async (url, options) => {
      assert.equal(String(url), "https://admin.example/api/internal/site-catalog");
      assert.equal(options.cache, "no-store");
      assert.equal(options.headers.Authorization, "Bearer site-source-secret-token-at-least-32-chars");
      return { ok: true, json: async () => page(all) };
    };
    const first = await reader.getSiteCatalog();
    assert.equal(first.state, "available");
    assert.equal(first.products.length, 29);
    assert.equal(writes.length, 1);
    assert.equal(writes[0], null);
    assert.ok(first.products.some((p) => p.slug === "produto-3d-9001"));
    assert.equal(approval.searchApprovedProducts(first.products).length, 25);

    // A cold-start request on another instance reads the same persisted data.
    global.fetch = async () => { throw new Error("upstream not reachable"); };
    const secondReader = catalogReaderWithStore(store, scheduled);
    const second = await secondReader.getSiteCatalog();
    assert.equal(second.state, "available");
    assert.equal(second.products.length, 29);
    assert.ok(second.products.some((p) => p.slug === "produto-3d-9001"));
    assert.equal(scheduled.length, 0);

    // Once the saved data ages, the update runs after the response without
    // affecting a new product URL or the 25 approved SEO pages.
    Date.now = () => now + 20 * 60_000;
    const old = await secondReader.getSiteCatalog();
    assert.equal(old.state, "available");
    assert.equal(old.degraded, true);
    assert.equal(old.products.length, 29);
    assert.equal(scheduled.length, 1);
    const consoleError = console.error;
    console.error = () => {};
    try { await scheduled[0](); }
    finally { console.error = consoleError; }
    const afterFailure = await reader.getSiteCatalog();
    assert.equal(afterFailure.products.length, 29);
    assert.ok(afterFailure.products.some((p) => p.slug === "produto-3d-9001"));
    assert.equal(writes.length, 1);
  });
});

test("70-item feed is persisted in full across two pages; page-two failure cannot erase it", async () => {
  await withCatalogRuntime(async () => {
    const scheduled = [];
    let saved = null;
    const reader = catalogReaderWithStore({
      readStoredCatalog: async () => saved,
      writeStoredCatalog: async (products) => {
        saved = { products, savedAt: new Date(now).toISOString(),
          etag: '"bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"' };
        return "written";
      },
    }, scheduled);
    const all = [
      ...seeds.map((seed) => legacyItem(seed)),
      ...Array.from({ length: 42 }, (_, index) => sourceItem(60000000000 + index)),
    ].sort((a, b) => a.itemId - b.itemId);
    const cursor = all[49].itemId;
    const seen = [];
    global.fetch = async (url) => {
      const after = new URL(url).searchParams.get("after");
      seen.push(after);
      return { ok: true, json: async () => after === null
        ? page(all.slice(0, 50), true) : page(all.slice(50)) };
    };

    const first = await reader.getSiteCatalog();
    assert.equal(first.state, "available");
    assert.equal(first.products.length, 70);
    assert.deepEqual(seen, [null, String(cursor)]);

    Date.now = () => now + 20 * 60_000;
    const current = await reader.getSiteCatalog();
    assert.equal(current.products.length, 70);
    assert.equal(scheduled.length, 1);
    global.fetch = async (url) => {
      if (new URL(url).searchParams.has("after")) return { ok: false, status: 503 };
      return { ok: true, json: async () => page(all.slice(0, 50), true) };
    };
    const consoleError = console.error;
    console.error = () => {};
    try { await scheduled[0](); }
    finally { console.error = consoleError; }
    const stillAvailable = await reader.getSiteCatalog();
    assert.equal(stillAvailable.state, "available");
    assert.equal(stillAvailable.products.length, 70);
    assert.equal(approval.searchApprovedProducts(stillAvailable.products).length, 25);
  });
});

test("initial failure, missing credentials and invalid endpoint preserve 28 legacy pages", async () => {
  await withCatalogRuntime(async () => {
    const scheduled = [];
    const reader = catalogReaderWithStore({
      readStoredCatalog: async () => null,
      writeStoredCatalog: async () => { throw new Error("R2 is write-protected"); },
    }, scheduled);
    const originalConsole = console.error;
    console.error = () => {};
    try {
      global.fetch = async () => { throw new Error("upstream unavailable"); };
      const sourceDown = await reader.getSiteCatalog();
      assert.equal(sourceDown.state, "available");
      assert.equal(sourceDown.products.length, 28);
      assert.equal(approval.searchApprovedProducts(sourceDown.products).length, 25);

      const configs = [
        { endpoint: "https://admin.example/api/internal/site-catalog", token: undefined },
        { endpoint: undefined, token: "site-source-secret-token-at-least-32-chars" },
        { endpoint: "https://admin.example/bad-path", token: "site-source-secret-token-at-least-32-chars" },
      ];
      for (const config of configs) {
        if (config.endpoint === undefined) delete process.env.CM_SITE_CATALOG_API_URL;
        else process.env.CM_SITE_CATALOG_API_URL = config.endpoint;
        if (config.token === undefined) delete process.env.CM_SITE_CATALOG_TOKEN;
        else process.env.CM_SITE_CATALOG_TOKEN = config.token;
        const result = await reader.getSiteCatalog();
        assert.equal(result.products.length, 28);
        assert.equal(approval.searchApprovedProducts(result.products).length, 25);
      }
    } finally { console.error = originalConsole; }
  });
});

test("a stored snapshot cannot bypass the site-owned auto-index rollout or editorial changes", async () => {
  await withCatalogRuntime(async () => {
    const scheduled = [];
    const sourceData = [...seeds.map((seed) => legacyItem(seed)), sourceItem(9001)];
    const cached = editorial.buildSiteCatalog(sourceData, seeds, { now, autoIndex: true });
    cached[0].name = "NAME FROM AN OLD STORAGE REVISION";
    const reader = catalogReaderWithStore({
      readStoredCatalog: async () => ({
        savedAt: new Date(now).toISOString(),
        products: cached, etag: '"cccccccccccccccccccccccccccccccc"',
      }),
      writeStoredCatalog: async () => { throw new Error("unexpected write"); },
    }, scheduled);
    const result = await reader.getSiteCatalog();
    assert.equal(result.state, "available");
    assert.equal(result.products.length, 29);
    assert.equal(result.products[0].name, seeds[0].name);
    assert.equal(approval.searchApprovedProducts(result.products).length, 25);
    const newItem = result.products.find((p) => p.slug === "produto-3d-9001");
    assert.equal(newItem.autoIndexEligible, false);
  });
});

test("no new product URL is published when durable storage refuses the first write", async () => {
  await withCatalogRuntime(async () => {
    const scheduled = [];
    const sourceData = [...seeds.map((seed) => legacyItem(seed)), sourceItem(9001)]
      .sort((a, b) => a.itemId - b.itemId);
    const reader = catalogReaderWithStore({
      readStoredCatalog: async () => null,
      writeStoredCatalog: async () => { throw new Error("durability write failed"); },
    }, scheduled);
    global.fetch = async () => ({ ok: true, json: async () => page(sourceData) });
    const originalConsole = console.error;
    console.error = () => {};
    try {
      const result = await reader.getSiteCatalog();
      assert.equal(result.state, "available");
      assert.equal(result.degraded, true);
      assert.equal(result.products.length, 28);
      assert.equal(result.products.some((p) => p.slug === "produto-3d-9001"), false);
    } finally { console.error = originalConsole; }
  });
});
