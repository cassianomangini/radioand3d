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
  const requireOriginal = loaded.require.bind(loaded);
  loaded.require = (id) => Object.hasOwn(stubs, id) ? stubs[id] : requireOriginal(id);
  loaded._compile(compiled, filename);
  return loaded.exports;
}

const secret = "cron-secret-mock-over-32-characters-long";

async function withSecret(callback) {
  const old = process.env.CRON_SECRET;
  process.env.CRON_SECRET = secret;
  try { await callback(); }
  finally {
    if (old === undefined) delete process.env.CRON_SECRET;
    else process.env.CRON_SECRET = old;
  }
}

test("catalog refresh endpoint is unreachable without a valid cron authorization", async () => {
  await withSecret(async () => {
    let called = 0;
    const route = loadTypeScript("src/app/api/internal/site-catalog-refresh/route.ts", {
      "@/server/products/catalog": {
        syncSiteCatalog: async () => { called++; return { state: "available", products: [] }; },
      },
    });
    for (const header of [undefined, "Bearer wrong", "Bearer " + secret + "other"]) {
      const request = new Request("https://cmangini3d.com.br/api/internal/site-catalog-refresh", {
        headers: header ? { authorization: header } : {},
      });
      const response = await route.GET(request);
      assert.equal(response.status, 403);
      assert.equal(response.headers.get("cache-control"), "private, no-store");
    }
    assert.equal(called, 0);
    const valid = await route.GET(new Request("https://cmangini3d.com.br/api/internal/site-catalog-refresh", {
      headers: { authorization: "Bearer " + secret },
    }));
    assert.equal(valid.status, 200);
    assert.deepEqual(await valid.json(), { ok: true, count: 0 });
    assert.equal(called, 1);
  });
});

test("catalog refresh returns 503 without exposing provider errors or credentials", async () => {
  await withSecret(async () => {
    const route = loadTypeScript("src/app/api/internal/site-catalog-refresh/route.ts", {
      "@/server/products/catalog": {
        syncSiteCatalog: async () => {
          throw new Error("private token " + secret);
        },
      },
    });
    const prev = console.error;
    console.error = () => {};
    try {
      const result = await route.GET(new Request("https://cmangini3d.com.br/api/internal/site-catalog-refresh", {
        headers: { authorization: "Bearer " + secret },
      }));
      assert.equal(result.status, 503);
      const serialized = await result.text();
      assert.equal(serialized.includes(secret), false);
      assert.equal(serialized.includes("private token"), false);
    } finally { console.error = prev; }
  });
});
