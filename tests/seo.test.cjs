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
const approval = loadTypeScript("src/features/products/search-approval.ts");

function loadSitemap(indexable, catalog, approvedSlugs = []) {
  const approved = new Set(approvedSlugs);
  return loadTypeScript("src/app/sitemap.ts", {
    "@/lib/site-seo": { ...seo, isIndexableDeployment: () => indexable },
    "@/features/products/search-approval": {
      hasSearchApprovedProducts: () => approved.size > 0,
      searchApprovedProducts: (products) =>
        products.filter((item) => item.sourceStatus === "NORMAL" && approved.has(item.slug)),
    },
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

test("indexacao exige whitelist explicita e status NORMAL (25 aprovados)", () => {
  const snapshot = require("../src/server/products/published-catalog-snapshot.json");
  const pending = new Set([
    "dummy-13-boneco-articulado",
    "fita-cassete-retro",
    "kit-porta-figurinhas-3d",
  ]);
  assert.equal(snapshot.length, 28);
  const eligible = snapshot.filter(p => !pending.has(p.slug)).map(p => p.slug);
  assert.equal(eligible.length, 25);
  assert.equal(approval.hasSearchApprovedProducts(), true);
  for (const p of snapshot) {
    assert.equal(approval.isSearchApprovedProduct({ slug: p.slug, sourceStatus: "NORMAL" }),
      !pending.has(p.slug), p.slug);
    for (const sourceStatus of ["UNLIST", "BANNED", "SELLER_DELETE"]) {
      assert.equal(approval.isSearchApprovedProduct({ slug: p.slug, sourceStatus }), false,
        "inactive item " + p.slug);
    }
  }
  assert.equal(approval.isSearchApprovedProduct({ slug: "produto-futuro", sourceStatus: "NORMAL" }), false);
  assert.deepEqual(
    new Set(approval.searchApprovedProducts(snapshot.map(p => ({ slug: p.slug, sourceStatus: "NORMAL" })))
      .map(p => p.slug)),
    new Set(eligible),
  );
});

test("previews bloqueiam todos os rastreadores e nao publicam sitemap", async () => {
  assert.equal(loadRobots(false)().rules.disallow, "/");
  assert.deepEqual(await loadSitemap(false, { state: "available", products: [] }, ["exemplo"])(), []);
});

test("producao nao bloqueia fotos publicas", () => {
  const robots = loadRobots(true)();
  assert.deepEqual(robots.rules.disallow, ["/api/", "/dev/"]);
  assert.ok(robots.rules.allow.includes("/api/studio/photos/"));
  assert.ok(robots.rules.allow.includes("/api/orcamentos/photos/"));
  assert.equal(robots.sitemap, "https://cmangini3d.com.br/sitemap.xml");
});

test("headers noindex nao cobrem imagens publicas", async () => {
  const config = loadTypeScript("next.config.ts").default;
  const routes = await config.headers();
  const blocked = routes.filter((route) => route.headers.some((header) =>
    header.key.toLowerCase() === "x-robots-tag"));
  assert.ok(blocked.some((route) => route.source === "/api/quote/:path*"));
  assert.ok(blocked.some((route) => route.source === "/api/internal/:path*"));
  assert.ok(blocked.some((route) => route.source === "/dev/:path*"));
  assert.ok(!blocked.some((route) => route.source === "/api/:path*"));
  assert.ok(!blocked.some((route) => route.source.includes("/api/studio/photos")));
  assert.ok(!blocked.some((route) => route.source.includes("/api/orcamentos/photos")));
});

test("sem revisao editorial sitemap lista apenas quatro paginas publicas", async () => {
  const sitemap = loadSitemap(true, { state: "available", products: [
    { slug: "produto-normal", sourceStatus: "NORMAL" },
  ] });
  const urls = await sitemap();
  assert.deepEqual(urls.map((item) => item.url), [
    "https://cmangini3d.com.br/",
    "https://cmangini3d.com.br/estudio",
    "https://cmangini3d.com.br/produtos",
    "https://cmangini3d.com.br/orcamentos",
  ]);
  assert.ok(urls.every((item) => !Object.hasOwn(item, "priority") && !Object.hasOwn(item, "changeFrequency")));
});

test("somente produtos ativos e editorialmente aprovados entram no sitemap", async () => {
  const catalog = {
    state: "available",
    products: [
      { slug: "caixa-ativa", sourceStatus: "NORMAL" },
      { slug: "caixa-nao-revisada", sourceStatus: "NORMAL" },
      { slug: "caixa-desativada", sourceStatus: "UNLIST" },
      { slug: "caixa-excluida", sourceStatus: "SELLER_DELETE" },
    ],
  };
  const urls = await loadSitemap(true, catalog, [
    "caixa-ativa", "caixa-desativada", "caixa-excluida",
  ])();
  assert.equal(urls.length, 5);
  assert.ok(urls.some((item) => item.url.endsWith("/produtos/caixa-ativa")));
  assert.ok(!urls.some((item) => item.url.includes("nao-revisada")
    || item.url.includes("desativada") || item.url.includes("excluida")));
});

test("com produtos aprovados uma falha de catalogo nao entrega sitemap truncado", async () => {
  await assert.rejects(
    () => loadSitemap(true, { state: "unavailable", products: [] }, ["caixa-ativa"])(),
    /site_catalog_unavailable_for_sitemap/,
  );
});


test("produtos indexaveis tem conteudo editorial, fotos e item Shopee", () => {
  const snapshot = require("../src/server/products/published-catalog-snapshot.json");
  const editorials = loadTypeScript("src/features/products/catalog-product-editorial.ts");
  const titles = loadTypeScript("src/features/products/editorial-titles.ts");
  const approved = approval.searchApprovedProducts(snapshot.map((row) => ({
    slug: row.slug,
    sourceStatus: "NORMAL",
  })));
  assert.equal(approved.length, 25);
  for (const item of approved) {
    const p = snapshot.find((row) => row.slug === item.slug);
    assert.ok(p);
    assert.ok(Number.isSafeInteger(p.id));
    assert.ok(p.imageUrls.length >= 2, "insufficient images for " + item.slug);
    assert.ok(p.imageUrls.every((url) => url.startsWith("https://cf.shopee.com.br/file/")));
    const editorial = editorials.getCatalogProductEditorial(item.slug);
    assert.ok(editorial && editorial.lead && editorial.body && editorial.metaDescription);
    assert.ok(titles.getProductSeoTitle({ slug: p.slug, name: p.name }).endsWith("| CMangini3D"));
  }
});

test("sitemap tem 4 paginas e 25 detalhes ativos, sem aprovacoes pendentes", async () => {
  const snapshot = require("../src/server/products/published-catalog-snapshot.json");
  const catalog = {
    state: "available",
    products: snapshot.map((row) => ({ slug: row.slug, sourceStatus: "NORMAL" })),
  };
  const sitemap = loadTypeScript("src/app/sitemap.ts", {
    "@/lib/site-seo": { ...seo, isIndexableDeployment: () => true },
    "@/features/products/search-approval": approval,
    "@/server/products/catalog": { getSiteCatalog: async () => catalog },
  }).default;
  const urls = (await sitemap()).map((page) => page.url);
  assert.equal(urls.length, 29);
  assert.equal(new Set(urls).size, urls.length);
  const pending = new Set([
    "dummy-13-boneco-articulado",
    "fita-cassete-retro",
    "kit-porta-figurinhas-3d",
  ]);
  for (const p of snapshot) {
    assert.equal(urls.includes("https://cmangini3d.com.br/produtos/" + p.slug),
      !pending.has(p.slug), p.slug);
  }
  catalog.products[0].sourceStatus = "UNLIST";
  const newUrls = (await sitemap()).map((p) => p.url);
  if (!pending.has(catalog.products[0].slug)) {
    assert.ok(!newUrls.includes("https://cmangini3d.com.br/produtos/" + catalog.products[0].slug));
  }
});

test("BreadcrumbList aponta URLs canonicas, sem precos ou avaliacao inventados", () => {
  const data = loadTypeScript("src/features/products/product-breadcrumb-jsonld.ts", {
    "@/lib/site-seo": seo,
  }).productBreadcrumbJsonLd({
    slug: "porta-curativos-compacto",
    name: "Porta-Curativos Compacto",
  });
  assert.equal(data["@type"], "BreadcrumbList");
  assert.equal(data.itemListElement[1].item, "https://cmangini3d.com.br/produtos/porta-curativos-compacto");
  assert.ok(!JSON.stringify(data).includes("offers"));
  assert.ok(!JSON.stringify(data).includes("aggregateRating"));
});
