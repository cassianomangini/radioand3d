import assert from "node:assert/strict";
import test from "node:test";
import {
  formatQuoteFileSize,
  QUOTE_FILE_POLICY,
  validateQuoteFiles
} from "../src/features/studio/quote-contract.ts";

function fakeFile(name, size) {
  return { name, size, type: "" };
}

test("quote file policy accepts supported 3D, document and image formats", () => {
  const result = validateQuoteFiles([
    fakeFile("modelo.STL", 1024),
    fakeFile("peca.STEP", 2048),
    fakeFile("referencia.pdf", 4096),
    fakeFile("foto.webp", 8192)
  ]);

  assert.deepEqual(result, { ok: true });
});

test("quote file policy rejects unsupported and empty files", () => {
  const unsupported = validateQuoteFiles([fakeFile("pacote.zip", 1024)]);
  assert.equal(unsupported.ok, false);
  assert.equal(unsupported.code, "unsupported-extension");

  const empty = validateQuoteFiles([fakeFile("modelo.3mf", 0)]);
  assert.equal(empty.ok, false);
  assert.equal(empty.code, "empty-file");
});

test("quote file policy enforces exact decimal free-tier limits", () => {
  assert.equal(QUOTE_FILE_POLICY.maxBytesPerFile, 50_000_000);
  assert.equal(QUOTE_FILE_POLICY.maxTotalBytes, 100_000_000);
  assert.deepEqual(validateQuoteFiles([fakeFile("limit.stl", 50_000_000)]), { ok: true });
  const tooLarge = validateQuoteFiles([
    fakeFile("modelo.stl", QUOTE_FILE_POLICY.maxBytesPerFile + 1)
  ]);
  assert.equal(tooLarge.ok, false);
  assert.equal(tooLarge.code, "file-too-large");

  const totalExactly = validateQuoteFiles([
    fakeFile("a.stl", 50_000_000), fakeFile("b.stl", 50_000_000)
  ]);
  assert.deepEqual(totalExactly, { ok: true });

  const totalTooLarge = validateQuoteFiles([
    fakeFile("a.stl", 40 * 1024 * 1024),
    fakeFile("b.stl", 40 * 1024 * 1024),
    fakeFile("c.stl", 40 * 1024 * 1024)
  ]);
  assert.equal(totalTooLarge.ok, false);
  assert.equal(totalTooLarge.code, "total-too-large");

  const tooMany = validateQuoteFiles(
    Array.from({ length: QUOTE_FILE_POLICY.maxFiles + 1 }, (_, index) =>
      fakeFile(`file-${index}.stl`, 1024)
    )
  );
  assert.equal(tooMany.ok, false);
  assert.equal(tooMany.code, "too-many-files");
});

test("quote file size formatting stays readable", () => {
  assert.equal(formatQuoteFileSize(512), "512 B");
  assert.equal(formatQuoteFileSize(1024), "1.0 KB");
  assert.equal(formatQuoteFileSize(10 * 1024 * 1024), "10 MB");
  assert.equal(formatQuoteFileSize(50_000_000), "50 MB");
});
