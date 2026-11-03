const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const Module = require("node:module");
const ts = require("typescript");

function loadTypeScript(relativePath) {
  const filename = path.join(__dirname, "..", relativePath);
  const compiled = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    fileName: filename,
  }).outputText;
  const loaded = new Module(filename, module);
  loaded.filename = filename;
  loaded.paths = Module._nodeModulePaths(path.dirname(filename));
  loaded._compile(compiled, filename);
  return loaded.exports;
}

test("public responses set minimum security headers", async () => {
  const config = loadTypeScript("next.config.ts").default;
  assert.equal(typeof config.headers, "function");
  const rules = await config.headers();
  const global = rules.find(rule => rule.source === "/:path*");
  assert.ok(global);
  const headers = new Map(global.headers.map(({ key, value }) => [key.toLowerCase(), value]));
  assert.equal(headers.get("x-content-type-options"), "nosniff");
  assert.equal(headers.get("x-frame-options"), "DENY");
  assert.equal(headers.get("referrer-policy"), "strict-origin-when-cross-origin");
  assert.match(headers.get("content-security-policy"), /frame-ancestors 'none'/);
  assert.match(headers.get("content-security-policy"), /base-uri 'self'/);
  assert.match(headers.get("content-security-policy"), /object-src 'none'/);
  assert.match(headers.get("strict-transport-security"), /^max-age=\d+/);
  assert.match(headers.get("permissions-policy"), /camera=\(\)/);
  assert.match(headers.get("permissions-policy"), /microphone=\(\)/);
});
