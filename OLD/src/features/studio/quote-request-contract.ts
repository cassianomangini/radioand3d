import {
  type QuoteFileLike,
  validateQuoteFiles
} from "./quote-contract.ts";

export type QuoteProjectType = "impressao" | "placa" | "caixa" | "outro";
export type QuoteContactMethod = "whatsapp" | "email";
export type QuoteMaterialChoice = "" | "nao-sei" | "tenho-preferencia";

export type QuoteAttachmentMetadata = QuoteFileLike & {
  lastModified?: number;
};

export type QuoteRequestDraft = {
  schemaVersion: 1;
  projectType: QuoteProjectType;
  source: {
    origin?: string;
    reference?: string;
  };
  startingPoints: string[];
  noFile: boolean;
  attachments: QuoteAttachmentMetadata[];
  production: {
    quantity: string;
    sizeScale: string;
    material: QuoteMaterialChoice;
    materialPreference: string;
    color: string;
    deadline: string;
  };
  project:
    | {
        kind: "impressao";
        notes: string;
      }
    | {
        kind: "placa";
        use: string;
        contents: string[];
        size: string;
        lighting: string;
      }
    | {
        kind: "caixa";
        contents: string;
        dimensions: string;
        measurementBasis: string;
        features: string[];
      }
    | {
        kind: "outro";
        details: string;
      };
  contact: {
    method: QuoteContactMethod;
    name: string;
    value: string;
  };
};

export type QuoteRequestParseCode =
  | "malformed-request"
  | "unsupported-schema-version";

export type QuoteRequestParseResult =
  | {
      ok: true;
      draft: QuoteRequestDraft;
    }
  | {
      ok: false;
      code: QuoteRequestParseCode;
      message: string;
    };

export type QuoteRequestValidationCode =
  | "invalid-project-contract"
  | "invalid-reference-state"
  | "missing-attachment"
  | "missing-starting-point"
  | "missing-project-details"
  | "missing-quantity"
  | "missing-material-preference"
  | "missing-contact-name"
  | "missing-contact-value"
  | "invalid-contact"
  | "invalid-files";

export type QuoteRequestValidationResult =
  | { ok: true }
  | {
      ok: false;
      code: QuoteRequestValidationCode;
      message: string;
    };

export type QuoteTriageStatus =
  | "ready-for-review"
  | "needs-information"
  | "incomplete";

export type QuoteTriageResult = {
  status: QuoteTriageStatus;
  reasons: string[];
};

const PROJECT_TYPES = ["impressao", "placa", "caixa", "outro"] as const;
const CONTACT_METHODS = ["whatsapp", "email"] as const;
const MATERIAL_CHOICES = ["", "nao-sei", "tenho-preferencia"] as const;

function trimmed(value: string) {
  return value.trim();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isProjectType(value: unknown): value is QuoteProjectType {
  return typeof value === "string" &&
    PROJECT_TYPES.includes(value as QuoteProjectType);
}

function isContactMethod(value: unknown): value is QuoteContactMethod {
  return typeof value === "string" &&
    CONTACT_METHODS.includes(value as QuoteContactMethod);
}

function isMaterialChoice(value: unknown): value is QuoteMaterialChoice {
  return typeof value === "string" &&
    MATERIAL_CHOICES.includes(value as QuoteMaterialChoice);
}

function parseOptionalString(
  record: Record<string, unknown>,
  key: string
): string | undefined | null {
  const value = record[key];
  if (value === undefined) return undefined;
  return typeof value === "string" ? value : null;
}

function parseAttachment(value: unknown): QuoteAttachmentMetadata | null {
  if (!isRecord(value)) return null;

  const { name, size, type, lastModified } = value;

  if (typeof name !== "string" || typeof size !== "number" || !Number.isFinite(size)) {
    return null;
  }

  if (type !== undefined && typeof type !== "string") {
    return null;
  }

  if (
    lastModified !== undefined &&
    (typeof lastModified !== "number" || !Number.isFinite(lastModified))
  ) {
    return null;
  }

  return {
    name,
    size,
    ...(typeof type === "string" ? { type } : {}),
    ...(typeof lastModified === "number" ? { lastModified } : {})
  };
}

function parseProject(value: unknown): QuoteRequestDraft["project"] | null {
  if (!isRecord(value) || typeof value.kind !== "string") {
    return null;
  }

  if (value.kind === "impressao") {
    return typeof value.notes === "string"
      ? { kind: "impressao", notes: value.notes }
      : null;
  }

  if (value.kind === "placa") {
    if (
      typeof value.use !== "string" ||
      !isStringArray(value.contents) ||
      typeof value.size !== "string" ||
      typeof value.lighting !== "string"
    ) {
      return null;
    }

    return {
      kind: "placa",
      use: value.use,
      contents: value.contents,
      size: value.size,
      lighting: value.lighting
    };
  }

  if (value.kind === "caixa") {
    if (
      typeof value.contents !== "string" ||
      typeof value.dimensions !== "string" ||
      typeof value.measurementBasis !== "string" ||
      !isStringArray(value.features)
    ) {
      return null;
    }

    return {
      kind: "caixa",
      contents: value.contents,
      dimensions: value.dimensions,
      measurementBasis: value.measurementBasis,
      features: value.features
    };
  }

  if (value.kind === "outro") {
    return typeof value.details === "string"
      ? { kind: "outro", details: value.details }
      : null;
  }

  return null;
}

export function parseQuoteRequestDraft(input: unknown): QuoteRequestParseResult {
  if (!isRecord(input)) {
    return {
      ok: false,
      code: "malformed-request",
      message: "A solicitação recebida não possui um formato válido."
    };
  }

  if (input.schemaVersion !== 1) {
    return {
      ok: false,
      code: "unsupported-schema-version",
      message: "A versão da solicitação não é suportada."
    };
  }

  if (
    !isProjectType(input.projectType) ||
    !isRecord(input.source) ||
    !isStringArray(input.startingPoints) ||
    typeof input.noFile !== "boolean" ||
    !Array.isArray(input.attachments) ||
    !isRecord(input.production) ||
    !isRecord(input.contact)
  ) {
    return {
      ok: false,
      code: "malformed-request",
      message: "A solicitação recebida está incompleta ou malformada."
    };
  }

  const origin = parseOptionalString(input.source, "origin");
  const reference = parseOptionalString(input.source, "reference");

  if (origin === null || reference === null) {
    return {
      ok: false,
      code: "malformed-request",
      message: "A origem da solicitação possui dados inválidos."
    };
  }

  const attachments = input.attachments.map(parseAttachment);
  if (attachments.some((item) => item === null)) {
    return {
      ok: false,
      code: "malformed-request",
      message: "Os metadados dos anexos possuem formato inválido."
    };
  }

  const production = input.production;
  if (
    typeof production.quantity !== "string" ||
    typeof production.sizeScale !== "string" ||
    !isMaterialChoice(production.material) ||
    typeof production.materialPreference !== "string" ||
    typeof production.color !== "string" ||
    typeof production.deadline !== "string"
  ) {
    return {
      ok: false,
      code: "malformed-request",
      message: "Os dados de produção possuem formato inválido."
    };
  }

  const project = parseProject(input.project);
  if (!project) {
    return {
      ok: false,
      code: "malformed-request",
      message: "Os detalhes do projeto possuem formato inválido."
    };
  }

  if (
    !isContactMethod(input.contact.method) ||
    typeof input.contact.name !== "string" ||
    typeof input.contact.value !== "string"
  ) {
    return {
      ok: false,
      code: "malformed-request",
      message: "Os dados de contato possuem formato inválido."
    };
  }

  return {
    ok: true,
    draft: {
      schemaVersion: 1,
      projectType: input.projectType,
      source: {
        ...(origin !== undefined ? { origin } : {}),
        ...(reference !== undefined ? { reference } : {})
      },
      startingPoints: input.startingPoints,
      noFile: input.noFile,
      attachments: attachments as QuoteAttachmentMetadata[],
      production: {
        quantity: production.quantity,
        sizeScale: production.sizeScale,
        material: production.material,
        materialPreference: production.materialPreference,
        color: production.color,
        deadline: production.deadline
      },
      project,
      contact: {
        method: input.contact.method,
        name: input.contact.name,
        value: input.contact.value
      }
    }
  };
}

function isValidContact(method: QuoteContactMethod, value: string) {
  const contact = trimmed(value);
  if (!contact) return false;

  if (method === "email") {
    const at = contact.indexOf("@");
    const dot = contact.lastIndexOf(".");
    return at > 0 && dot > at + 1 && dot < contact.length - 1;
  }

  return contact.replace(/\D/g, "").length >= 8;
}

function projectMatchesType(draft: QuoteRequestDraft) {
  return draft.project.kind === draft.projectType;
}

export function validateQuoteRequestDraft(
  draft: QuoteRequestDraft
): QuoteRequestValidationResult {
  if (!projectMatchesType(draft)) {
    return {
      ok: false,
      code: "invalid-project-contract",
      message: "O tipo do projeto não corresponde aos detalhes enviados."
    };
  }

  const fileValidation = validateQuoteFiles(draft.attachments);
  if (!fileValidation.ok) {
    return {
      ok: false,
      code: "invalid-files",
      message: fileValidation.message
    };
  }

  if (draft.projectType === "impressao") {
    if (draft.noFile) {
      return {
        ok: false,
        code: "invalid-reference-state",
        message: "Um pedido de impressão com arquivo pronto não pode ser marcado como sem arquivo."
      };
    }

    if (draft.attachments.length === 0) {
      return {
        ok: false,
        code: "missing-attachment",
        message: "A impressão a partir de arquivo pronto exige pelo menos um arquivo."
      };
    }
  } else {
    if (draft.startingPoints.length === 0) {
      return {
        ok: false,
        code: "missing-starting-point",
        message: "Informe pelo menos um ponto de partida para o projeto."
      };
    }

    if (
      (draft.noFile && draft.attachments.length > 0) ||
      (!draft.noFile && draft.attachments.length === 0)
    ) {
      return {
        ok: false,
        code: "invalid-reference-state",
        message: "Informe uma referência ou marque que ainda não possui arquivo."
      };
    }
  }

  if (draft.project.kind === "placa") {
    if (!trimmed(draft.project.use) || draft.project.contents.length === 0) {
      return {
        ok: false,
        code: "missing-project-details",
        message: "Informe o uso e o conteúdo principal da placa."
      };
    }
  }

  if (draft.project.kind === "caixa" && !trimmed(draft.project.contents)) {
    return {
      ok: false,
      code: "missing-project-details",
      message: "Explique o que a caixa precisa acomodar ou proteger."
    };
  }

  if (draft.project.kind === "outro" && !trimmed(draft.project.details)) {
    return {
      ok: false,
      code: "missing-project-details",
      message: "Explique brevemente o que a peça precisa fazer."
    };
  }

  if (!trimmed(draft.production.quantity)) {
    return {
      ok: false,
      code: "missing-quantity",
      message: "Informe a quantidade ou uma estimativa."
    };
  }

  if (
    draft.production.material === "tenho-preferencia" &&
    !trimmed(draft.production.materialPreference)
  ) {
    return {
      ok: false,
      code: "missing-material-preference",
      message: "Descreva a preferência de material ou acabamento."
    };
  }

  if (!trimmed(draft.contact.name)) {
    return {
      ok: false,
      code: "missing-contact-name",
      message: "Informe o nome para contato."
    };
  }

  if (!trimmed(draft.contact.value)) {
    return {
      ok: false,
      code: "missing-contact-value",
      message: "Informe o contato escolhido."
    };
  }

  if (!isValidContact(draft.contact.method, draft.contact.value)) {
    return {
      ok: false,
      code: "invalid-contact",
      message: "Confira o contato informado."
    };
  }

  return { ok: true };
}

export function classifyQuoteRequestDraft(
  draft: QuoteRequestDraft
): QuoteTriageResult {
  const validation = validateQuoteRequestDraft(draft);

  if (!validation.ok) {
    return {
      status: "incomplete",
      reasons: [validation.code]
    };
  }

  const reasons: string[] = [];

  if (draft.production.material === "nao-sei") {
    reasons.push("material-guidance-needed");
  }

  if (
    draft.project.kind === "placa" &&
    (!trimmed(draft.project.size) || draft.project.lighting === "nao-sei")
  ) {
    reasons.push("plate-specification-open");
  }

  if (
    draft.project.kind === "caixa" &&
    (!trimmed(draft.project.dimensions) ||
      !trimmed(draft.project.measurementBasis) ||
      draft.project.measurementBasis === "nao-sei")
  ) {
    reasons.push("box-measurement-open");
  }

  if (draft.project.kind !== "impressao" && draft.noFile) {
    reasons.push("reference-not-provided");
  }

  return reasons.length
    ? { status: "needs-information", reasons }
    : { status: "ready-for-review", reasons: [] };
}

export function toQuoteAttachmentMetadata(
  file: QuoteFileLike & { lastModified?: number }
): QuoteAttachmentMetadata {
  return {
    name: file.name,
    size: file.size,
    type: file.type,
    lastModified: file.lastModified
  };
}
