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
  const originalRequire = loaded.require.bind(loaded);
  loaded.require = (id) => Object.hasOwn(stubs, id) ? stubs[id] : originalRequire(id);
  loaded._compile(compiled, filename);
  return loaded.exports;
}

const seo = loadTypeScript("src/lib/site-seo.ts");
const contracts = loadTypeScript("src/features/products/catalog-contract.ts");

function loadSitemap(indexable, catalog) {
  return loadTypeScript("src/app/sitemap.ts", {
    "@/lib/site-seo": { ...seo, isIndexableDeployment: () => indexable },
    "@/features/products/catalog-contract": contracts,
    "@/server/products/catalog": { getSiteCatalog: async () => catalog },
  }).default;
}

function loadRobots(indexable) {
  return loadTypeScript("src/app/robots.ts", {
    "@/lib/site-seo": { ...seo, isIndexableDeployment: () => indexable },
  }).default;
}

test("somente o deploy de producao pode ser indexado", () => {
  const original = process.env.VERCEL_ENV;
  try {
    for (const environment of [undefined, "development", "preview"]) {
      if (environment === undefined) delete process.env.VERCEL_ENV;
      else process.env.VERCEL_ENV = environment;
      assert.equal(seo.isIndexableDeployment(), false);
    }
    process.env.VERCEL_ENV = "production";
    assert.equal(seo.isIndexableDeployment(), true);
  } finally {
    if (original === undefined) delete process.env.VERCEL_ENV;
    else process.env.VERCEL_ENV = original;
  }
});

test("previews bloqueiam robos e nao publicam URLs no sitemap", async () => {
  assert.equal(loadRobots(false).rules.disallow, "/");
  assert.deepEqual(await loadSitemap(false, { state: "unavailable", products: [] })(), []);
});

test("producao permite paginas publicas e exclui API e dev", () => {
  const rules = loadRobots(true);
  assert.deepEqual(rules.rules.disallow, ["/api/", "/dev/"]);
  assert.equal(rules.sitemap, "https://cmangini3d.com.br/sitemap.xml");
});

test("sitemap lista apenas produtos publicados e ativos", async () => {
  const catalog = {
    state: "available",
    products: [
      { slug: "caixa-ativa", sourceStatus: "NORMAL", contentUpdatedAt: "2026-11-05T12:00:00.000Z" },
      { slug: "caixa-desativada", sourceStatus: "UNLIST", contentUpdatedAt: "2026-11-05T12:00:00.000Z" },
      { slug: "caixa-excluida", sourceStatus: "SELLER_DELETE", contentUpdatedAt: "2026-11-05T12:00:00.000Z" },
    ],
  };
  const urls = await loadSitemap(true, catalog)();
  assert.equal(urls.length, 5);
  assert.equal(urls[0].url, "https://cmangini3d.com.br/");
  assert.ok(urls.some((item) => item.url.endsWith("/produtos/caixa-ativa")));
  assert.ok(!urls.some((item) => item.url.includes("desativada") || item.url.includes("excluida")));
});

test("falha de catalogo nao fabrica links de produto", async () => {
  const urls = await loadSitemap(true, { state: "unavailable", products: [] })();
  assert.equal(urls.length, 4);
});
