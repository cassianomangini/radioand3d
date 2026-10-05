import {
  type QuoteFileLike,
  validateQuoteFiles
} from "./quote-contract";

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
    color: string;
    deadline: string;
  };
  project:
    | {
        kind: "impressao";
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

export type QuoteRequestValidationCode =
  | "invalid-project-contract"
  | "missing-attachment"
  | "missing-starting-point"
  | "missing-project-details"
  | "missing-quantity"
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
  | "incomplete"
  | "manual-review";

export type QuoteTriageResult = {
  status: QuoteTriageStatus;
  reasons: string[];
};

function trimmed(value: string) {
  return value.trim();
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

  if (draft.projectType === "impressao" && draft.attachments.length === 0) {
    return {
      ok: false,
      code: "missing-attachment",
      message: "A impressão a partir de arquivo pronto exige pelo menos um arquivo."
    };
  }

  if (
    draft.projectType !== "impressao" &&
    draft.startingPoints.length === 0
  ) {
    return {
      ok: false,
      code: "missing-starting-point",
      message: "Informe pelo menos um ponto de partida para o projeto."
    };
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
    const incompleteCodes = new Set<QuoteRequestValidationCode>([
      "invalid-project-contract",
      "missing-attachment",
      "missing-starting-point",
      "missing-project-details",
      "missing-quantity",
      "missing-contact-name",
      "missing-contact-value",
      "invalid-contact",
      "invalid-files"
    ]);

    return {
      status: incompleteCodes.has(validation.code)
        ? "incomplete"
        : "manual-review",
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
