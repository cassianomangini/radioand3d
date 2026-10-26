import assert from "node:assert/strict";
import test from "node:test";
import {
  classifyQuoteRequestDraft,
  parseQuoteRequestDraft,
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
      materialPreference: "",
      color: "",
      deadline: ""
    },
    project: {
      kind: "impressao",
      notes: "Precisa encaixar em outra peça."
    },
    contact: {
      method: "email",
      name: "Cassiano",
      value: "cassiano@example.com"
    },
    ...overrides
  };
}

test("request contract accepts and classifies a complete ready-file request", () => {
  const draft = baseDraft();

  assert.deepEqual(validateQuoteRequestDraft(draft), { ok: true });
  assert.deepEqual(classifyQuoteRequestDraft(draft), {
    status: "ready-for-review",
    reasons: []
  });
});

test("runtime parser turns an untrusted payload into the versioned contract", () => {
  const input = structuredClone(baseDraft());
  const parsed = parseQuoteRequestDraft(input);

  assert.equal(parsed.ok, true);
  assert.equal(parsed.draft.schemaVersion, 1);
  assert.equal(parsed.draft.project.kind, "impressao");
  assert.equal(parsed.draft.project.notes, "Precisa encaixar em outra peça.");
});

test("runtime parser rejects unsupported versions and malformed nested values without throwing", () => {
  const unsupported = parseQuoteRequestDraft({
    ...baseDraft(),
    schemaVersion: 2
  });

  assert.equal(unsupported.ok, false);
  assert.equal(unsupported.code, "unsupported-schema-version");

  const malformed = parseQuoteRequestDraft({
    ...baseDraft(),
    production: null
  });

  assert.equal(malformed.ok, false);
  assert.equal(malformed.code, "malformed-request");

  const malformedAttachment = parseQuoteRequestDraft({
    ...baseDraft(),
    attachments: [{ name: "modelo.stl", size: "1024" }]
  });

  assert.equal(malformedAttachment.ok, false);
  assert.equal(malformedAttachment.code, "malformed-request");
});

test("ready-file request requires a file and cannot claim to have no file", () => {
  const missing = validateQuoteRequestDraft(baseDraft({ attachments: [] }));
  assert.equal(missing.ok, false);
  assert.equal(missing.code, "missing-attachment");

  const contradictory = validateQuoteRequestDraft(baseDraft({ noFile: true }));
  assert.equal(contradictory.ok, false);
  assert.equal(contradictory.code, "invalid-reference-state");
});

test("custom request must choose between attached reference and explicit no-file state", () => {
  const draft = baseDraft({
    projectType: "placa",
    startingPoints: ["Tenho logo, desenho ou arte"],
    attachments: [],
    noFile: false,
    project: {
      kind: "placa",
      use: "balcao",
      contents: ["Logo"],
      size: "18 x 12 cm",
      lighting: "nao"
    }
  });

  const result = validateQuoteRequestDraft(draft);
  assert.equal(result.ok, false);
  assert.equal(result.code, "invalid-reference-state");
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
      materialPreference: "",
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

test("declared material preference must include the actual preference", () => {
  const draft = baseDraft({
    production: {
      quantity: "2",
      sizeScale: "",
      material: "tenho-preferencia",
      materialPreference: "",
      color: "",
      deadline: ""
    }
  });

  const result = validateQuoteRequestDraft(draft);
  assert.equal(result.ok, false);
  assert.equal(result.code, "missing-material-preference");
});

test("request contract rejects mismatched project payloads", () => {
  const draft = baseDraft({
    projectType: "caixa",
    startingPoints: ["Tenho as medidas"],
    project: { kind: "impressao", notes: "" }
  });

  const result = validateQuoteRequestDraft(draft);
  assert.equal(result.ok, false);
  assert.equal(result.code, "invalid-project-contract");

  assert.deepEqual(classifyQuoteRequestDraft(draft), {
    status: "incomplete",
    reasons: ["invalid-project-contract"]
  });
});
