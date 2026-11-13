const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const ts = require("typescript");
const { createHash } = require("node:crypto");

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
const store = loadTypeScript("src/server/products/catalog-snapshot-store.ts", {
  "@/features/products/catalog-contract": contract,
});

const item = {
  slug: "caixa-organizadora-grande",
  name: "Caixa Organizadora Grande",
  summary: "Caixa personalizada para pequenos objetos.",
  description: "Caixa 3D para organização doméstica.",
  categorySlug: null,
  seoTitle: "Caixa Organizadora Grande",
  seoDescription: "Caixa impressa em 3D para organização.",
  shopeeUrl: "https://shopee.com.br/product/1433140862/58258025838",
  imageUrls: ["https://cf.shopee.com.br/file/product-image"],
  material: null,
  dimensions: null,
  customizable: false,
  variations: [],
  sourceStatus: "NORMAL",
  sourceSyncedAt: "2026-11-13T10:00:00Z",
  contentUpdatedAt: "2026-11-13T10:00:00Z",
};
const etag = '"' + "a".repeat(32) + '"';

function withR2Env(callback) {
  const keys = ["R2_S3_ENDPOINT", "R2_BUCKET", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY",
    "VERCEL_ENV", "VERCEL_GIT_COMMIT_REF"];
  const originals = Object.fromEntries(keys.map((key) => [key, process.env[key]]));
  process.env.R2_S3_ENDPOINT = "https://abc123.r2.cloudflarestorage.com";
  process.env.R2_BUCKET = "musicas";
  process.env.R2_ACCESS_KEY_ID = "test-access-id";
  process.env.R2_SECRET_ACCESS_KEY = "test-signing-secret";
  process.env.VERCEL_ENV = "production";
  delete process.env.VERCEL_GIT_COMMIT_REF;
  return Promise.resolve().then(callback).finally(() => {
    for (const key of keys) {
      if (originals[key] === undefined) delete process.env[key];
      else process.env[key] = originals[key];
    }
  });
}

test("R2 snapshot returns null only for 404 and signs GET requests privately", async () => {
  await withR2Env(async () => {
    let requestUrl;
    let requestOptions;
    const result = await store.readStoredCatalog(async (url, options) => {
      requestUrl = url;
      requestOptions = options;
      return new Response(null, { status: 404 });
    });
    assert.equal(result, null);
    assert.equal(requestUrl,
      "https://abc123.r2.cloudflarestorage.com/musicas/cmangini3d/site-catalog/production-v1.json");
    assert.equal(requestOptions.cache, "no-store");
    assert.match(requestOptions.headers.authorization, /AWS4-HMAC-SHA256/);
    assert.equal(JSON.stringify(requestOptions).includes("test-signing-secret"), false);
  });
});

test("R2 writer uses conditional create, hashes body and never stores private Admin fields", async () => {
  await withR2Env(async () => {
    let captured;
    const result = await store.writeStoredCatalog([item], null, async (url, options) => {
      captured = { url, options };
      return new Response(null, { status: 200 });
    });
    assert.equal(result, "written");
    assert.equal(captured.options.method, "PUT");
    assert.equal(captured.options.headers["if-none-match"], "*");
    assert.equal(captured.options.headers["content-type"], "application/json");
    assert.equal(captured.options.headers["x-amz-content-sha256"],
      createHash("sha256").update(captured.options.body).digest("hex"));
    assert.match(captured.options.headers.authorization, /SignedHeaders=content-type;host;if-none-match;x-amz-content-sha256;x-amz-date/);
    const data = JSON.parse(captured.options.body);
    assert.equal(data.version, 1);
    assert.deepEqual(data.products, [item]);
    assert.equal("raw_source_payload" in data.products[0], false);
    assert.equal("serviceRoleKey" in data.products[0], false);
  });
});

test("R2 reader validates the public snapshot and rejects malformed body or missing etag", async () => {
  await withR2Env(async () => {
    const body = JSON.stringify({
      version: 1, savedAt: "2026-11-13T10:00:00Z", products: [item],
    });
    const valid = await store.readStoredCatalog(async () =>
      new Response(body, { status: 200, headers: { etag } }));
    assert.equal(valid.products.length, 1);
    assert.equal(valid.products[0].slug, "caixa-organizadora-grande");
    assert.equal(valid.etag, etag);
    await assert.rejects(
      () => store.readStoredCatalog(async () =>
        new Response(body, { status: 200 })), /missing_etag/);
    await assert.rejects(
      () => store.readStoredCatalog(async () =>
        new Response(JSON.stringify({ version: 1, savedAt: "2026-11-13T10:00:00Z",
          products: [{ ...item, imageUrls: ["https://private.local/file"] }] }),
        { status: 200, headers: { etag } })), /invalid_snapshot/);
  });
});

test("R2 uses atomic If-Match for updates, with conflict preserving another version", async () => {
  await withR2Env(async () => {
    const result = await store.writeStoredCatalog([item], etag, async (_url, options) => {
      assert.equal(options.headers["if-match"], etag);
      assert.equal(options.headers["if-none-match"], undefined);
      return new Response(null, { status: 412 });
    });
    assert.equal(result, "conflict");
    await assert.rejects(
      () => store.writeStoredCatalog([item], '"bad"'), /invalid_etag/);
  });
});

test("R2 never accepts a non-Cloudflare endpoint or emits plaintext credentials", async () => {
  await withR2Env(async () => {
    process.env.R2_S3_ENDPOINT = "https://example.com";
    await assert.rejects(
      () => store.readStoredCatalog(async () => new Response(null, { status: 404 })),
      /invalid_endpoint/);
  });
});


test("preview branch cannot read or overwrite the production R2 snapshot", async () => {
  await withR2Env(async () => {
    const productionUrls = [];
    await store.readStoredCatalog(async (url) => {
      productionUrls.push(url);
      return new Response(null, { status: 404 });
    });
    process.env.VERCEL_ENV = "preview";
    process.env.VERCEL_GIT_COMMIT_REF = "feat/cm3d-site-catalog-source-sync";
    const previewUrls = [];
    await store.readStoredCatalog(async (url) => {
      previewUrls.push(url);
      return new Response(null, { status: 404 });
    });
    process.env.VERCEL_GIT_COMMIT_REF = "another-feature-branch";
    await store.readStoredCatalog(async (url) => {
      previewUrls.push(url);
      return new Response(null, { status: 404 });
    });
    assert.equal(productionUrls.length, 1);
    assert.equal(previewUrls.length, 2);
    assert.match(productionUrls[0], /production-v1\.json$/);
    assert.match(previewUrls[0], /preview-[a-f0-9]{16}-v1\.json$/);
    assert.notEqual(previewUrls[0], previewUrls[1]);
    assert.notEqual(previewUrls[0], productionUrls[0]);
  });
});
