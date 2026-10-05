import assert from "node:assert/strict";
import test from "node:test";
import {
  classifyQuoteRequestDraft,
  validateQuoteRequestDraft
} from "../src/features/studio/quote-request-contract.ts";

function baseDraft(overrides = {}) {
  return {
    schemaVersion: 1,
    projectType: "impressao",
    source: {},
    startingPoints: [],
    noFile: false,
    attachments: [{ name: "modelo.stl", size: 1024, type: "model/stl" }],
    production: {
      quantity: "2",
      sizeScale: "",
      material: "",
      color: "",
      deadline: ""
    },
    project: {
      kind: "impressao"
    },
    contact: {
      method: "email",
      name: "Cassiano",
      value: "cassiano@example.com"
    },
    ...overrides
  };
}

test("request contract accepts a complete ready-file request", () => {
  const draft = baseDraft();
  assert.deepEqual(validateQuoteRequestDraft(draft), { ok: true });
  assert.deepEqual(classifyQuoteRequestDraft(draft), {
    status: "ready-for-review",
    reasons: []
  });
});

test("ready-file request requires a file", () => {
  const draft = baseDraft({ attachments: [] });
  const result = validateQuoteRequestDraft(draft);

  assert.equal(result.ok, false);
  assert.equal(result.code, "missing-attachment");
});

test("plate request can be valid but still need human follow-up", () => {
  const draft = baseDraft({
    projectType: "placa",
    startingPoints: ["Tenho logo, desenho ou arte"],
    noFile: true,
    attachments: [],
    production: {
      quantity: "1",
      sizeScale: "",
      material: "nao-sei",
      color: "",
      deadline: ""
    },
    project: {
      kind: "placa",
      use: "balcao",
      contents: ["Logo"],
      size: "",
      lighting: "nao-sei"
    }
  });

  assert.deepEqual(validateQuoteRequestDraft(draft), { ok: true });

  const triage = classifyQuoteRequestDraft(draft);
  assert.equal(triage.status, "needs-information");
  assert.deepEqual(triage.reasons, [
    "material-guidance-needed",
    "plate-specification-open",
    "reference-not-provided"
  ]);
});

test("request contract rejects mismatched project payloads", () => {
  const draft = baseDraft({
    projectType: "caixa",
    startingPoints: ["Tenho as medidas"],
    project: { kind: "impressao" }
  });

  const result = validateQuoteRequestDraft(draft);
  assert.equal(result.ok, false);
  assert.equal(result.code, "invalid-project-contract");
});
