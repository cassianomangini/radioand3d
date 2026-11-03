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

test("model input only permits STL and 3MF", () => {
  const { quoteFileRoleAllows } = loadTypeScript("src/features/quote/file-policy.ts");
  assert.equal(quoteFileRoleAllows("model", "piece.stl"), true);
  assert.equal(quoteFileRoleAllows("model", "PIECE.3MF"), true);
  assert.equal(quoteFileRoleAllows("model", "piece.step"), false);
  assert.equal(quoteFileRoleAllows("model", "piece.pdf"), false);
  assert.equal(quoteFileRoleAllows("model", "piece.stl.exe"), false);
});

test("visual inputs only permit images and PDF", () => {
  const { quoteFileRoleAllows } = loadTypeScript("src/features/quote/file-policy.ts");
  for (const role of ["logo", "qr", "boxLogo", "boxQr", "references"]) {
    assert.equal(quoteFileRoleAllows(role, "file.PNG"), true, role);
    assert.equal(quoteFileRoleAllows(role, "file.pdf"), true, role);
    assert.equal(quoteFileRoleAllows(role, "piece.3mf"), false, role);
    assert.equal(quoteFileRoleAllows(role, "file.exe"), false, role);
  }
  assert.equal(quoteFileRoleAllows("unknown", "file.png"), false);
  assert.equal(quoteFileRoleAllows("model", ""), false);
});
