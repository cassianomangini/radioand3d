import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { test } from "node:test";

const root = process.cwd();
const cssRoot = path.join(root, "src");
const prefixes = ["-webkit-", "-moz-", "-ms-", "-o-"];

// Nomes padrão que o validador do editor exige quando o prefixo aparece sozinho.
const standardProperties = new Set([
  "animation",
  "animation-delay",
  "animation-direction",
  "animation-duration",
  "animation-fill-mode",
  "animation-iteration-count",
  "animation-name",
  "animation-play-state",
  "animation-timing-function",
  "appearance",
  "backdrop-filter",
  "backface-visibility",
  "background-clip",
  "background-origin",
  "behavior",
  "border-image",
  "box-sizing",
  "break-after",
  "break-before",
  "break-inside",
  "column-count",
  "column-gap",
  "column-rule",
  "column-rule-color",
  "column-rule-style",
  "column-rule-width",
  "column-span",
  "column-width",
  "columns",
  "filter",
  "flex",
  "flex-direction",
  "flex-flow",
  "flex-wrap",
  "font-feature-settings",
  "grid-column",
  "grid-row",
  "hyphenate-limit-chars",
  "hyphens",
  "line-break",
  "line-clamp",
  "mask",
  "mask-clip",
  "mask-composite",
  "mask-image",
  "mask-origin",
  "mask-position",
  "mask-repeat",
  "mask-size",
  "object-fit",
  "object-position",
  "perspective",
  "perspective-origin",
  "scroll-snap-type",
  "scrollbar-3dlight-color",
  "scrollbar-arrow-color",
  "scrollbar-base-color",
  "scrollbar-darkshadow-color",
  "scrollbar-face-color",
  "scrollbar-highlight-color",
  "scrollbar-shadow-color",
  "scrollbar-track-color",
  "tab-size",
  "text-align-last",
  "text-autospace",
  "text-decoration-color",
  "text-decoration-line",
  "text-decoration-style",
  "text-justify",
  "text-overflow",
  "text-underline-position",
  "touch-action",
  "transform",
  "transform-origin",
  "transform-style",
  "transition",
  "transition-delay",
  "transition-duration",
  "transition-property",
  "transition-timing-function",
  "user-select",
  "word-break",
  "word-wrap",
  "writing-mode",
  "zoom",
]);

async function cssFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await cssFiles(fullPath)));
    } else if (entry.name.endsWith(".css")) {
      files.push(fullPath);
    }
  }
  return files;
}

function missingStandardProperties(css) {
  const source = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const missing = [];
  const stack = [];
  let buffer = "";

  function recordDeclaration(declaration) {
    const block = stack.at(-1);
    const name = declaration.slice(0, declaration.indexOf(":")).trim().toLowerCase();
    if (block && name) block.properties.add(name);
  }

  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    if (character === '"' || character === "'") {
      const quote = character;
      buffer += character;
      index += 1;
      while (index < source.length && source[index] !== quote) {
        buffer += source[index];
        if (source[index] === "\\") {
          index += 1;
          buffer += source[index] ?? "";
        }
        index += 1;
      }
      buffer += source[index] ?? "";
      continue;
    }

    if (character === "{") {
      stack.push({ prelude: buffer, properties: new Set() });
      buffer = "";
      continue;
    }

    if (character === "}") {
      const block = stack.pop();
      if (block) missing.push(...auditBlock(block));
      buffer = "";
      continue;
    }

    if (character === ";") {
      const declaration = buffer.trim();
      buffer = "";
      if (declaration.includes(":") && !declaration.startsWith("@")) {
        recordDeclaration(declaration);
      }
      continue;
    }

    buffer += character;
  }

  return missing;
}

function auditBlock(block) {
  const missing = [];
  for (const name of block.properties) {
    const prefix = prefixes.find((item) => name.startsWith(item));
    if (!prefix) continue;
    const standard = name.slice(prefix.length);
    if (!standardProperties.has(standard) || block.properties.has(standard)) continue;
    if (block.prelude.includes(`::${prefix}`)) continue;
    missing.push(`${name} sem ${standard}`);
  }
  return missing;
}

test("CSS prefixado declara a propriedade padrão no mesmo bloco", async () => {
  const files = await cssFiles(cssRoot);
  const failures = [];
  for (const file of files) {
    const css = await readFile(file, "utf8");
    for (const problem of missingStandardProperties(css)) {
      failures.push(`${path.relative(root, file)}: ${problem}`);
    }
  }
  assert.deepEqual(failures, []);
});
