"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { quoteApi, uploadSignedFile } from "@/features/quote/client-upload";
import { QuoteTurnstile } from "@/features/quote/quote-turnstile";
import { validModelLink } from "@/features/quote/model-link";
import { formatDesiredDate, saoPauloToday, validDesiredDate } from "@/features/quote/desired-date";
import { PRINT_RIGHTS_TEXT, PRINT_RIGHTS_VERSION } from "@/features/quote/print-rights";
import { validModelItems, restorableModelItems, modelUnits, MODEL_ITEM_LIMIT, MODEL_LINK_MAX_LENGTH, MODEL_NOTES_MAX_LENGTH, MODEL_TITLE_MAX_LENGTH, type ModelItem } from "@/features/quote/model-items";
import { QUOTE_FILE_POLICY, validateQuoteFiles, quoteFilePolicyLabel, quoteFileRoleAllows } from "@/features/quote/file-policy";
import styles from "./page.module.css";

const projectOptions = [
  { value: "caixa", title: "Caixa personalizada", description: "Caixas sob medida, no formato que você imaginar.", image: "/api/orcamentos/photos/caixa" },
  { value: "placa", title: "Placa / Logo personalizado", description: "Nomes, logotipos, QR Codes e decoração.", image: "/api/orcamentos/photos/placa" },
  { value: "arquivo", title: "Imprimir meu arquivo 3D", description: "Já tenho um modelo e quero imprimir.", image: "/images/orcamentos/orcamento_4.png" },
  { value: "outro", title: "Outro projeto", description: "Tenho uma ideia para transformar em peça 3D.", image: "/images/orcamentos/orcamento_5.png" },
] as const;

const boxShapeOptions = [
  { label: "Redonda", image: "/images/orcamentos/caixa-redonda.png" },
  { label: "Quadrada", image: "/images/orcamentos/caixa-quadrada.png" },
  { label: "Retangular", image: "/images/orcamentos/caixa-retangular.png" },
  { label: "Outro formato", image: "/images/orcamentos/outro-formato.png" },
] as const;

// Paleta temporária: será substituída pelas cores dos filamentos disponíveis.
const colorOptions = [
  { name: "Branco", rgb: "#f5f5f1" },
  { name: "Marfim", rgb: "#e9dfc7" },
  { name: "Bege", rgb: "#cdb99b" },
  { name: "Amarelo claro", rgb: "#f9e78c" },
  { name: "Amarelo", rgb: "#f0cb42" },
  { name: "Laranja", rgb: "#ee8b39" },
  { name: "Vermelho", rgb: "#df4545" },
  { name: "Vermelho escuro", rgb: "#9d303a" },
  { name: "Rosa claro", rgb: "#f5b9d1" },
  { name: "Rosa", rgb: "#e886ae" },
  { name: "Rosa escuro", rgb: "#bd5184" },
  { name: "Roxo claro", rgb: "#b89bd8" },
  { name: "Roxo", rgb: "#9366bf" },
  { name: "Roxo escuro", rgb: "#613b86" },
  { name: "Azul claro", rgb: "#8acbf0" },
  { name: "Azul", rgb: "#3578d4" },
  { name: "Azul escuro", rgb: "#244a88" },
  { name: "Turquesa", rgb: "#45b9bb" },
  { name: "Verde claro", rgb: "#a5d68a" },
  { name: "Verde", rgb: "#43a66b" },
  { name: "Verde escuro", rgb: "#2c6949" },
  { name: "Marrom", rgb: "#805740" },
  { name: "Cinza claro", rgb: "#c7ccd0" },
  { name: "Cinza", rgb: "#9299a1" },
  { name: "Cinza escuro", rgb: "#505760" },
  { name: "Preto", rgb: "#252525" },
] as const;

type ProjectType = (typeof projectOptions)[number]["value"];
type RequestMode = "" | "quick" | "detailed";
type QrSource = "" | "content" | "file";
type FileField = "model" | "logo" | "qr" | "boxLogo" | "boxQr" | "references";
type Dimensions = { width: string; depth: string; height: string };
type ColorChoice = { name: string; rgb: string };
type FieldError = { field: string; message: string; focusId?: string } | null;
type ReviewEditArea = "details" | "contact" | "delivery";
export type Draft = {
  type: ProjectType | null;
  studioPhotoId?: string | null;
  productSlug?: string | null;
  boxMode: RequestMode;
  boxQuickDescription: string;
  boxShape: string;
  boxShapeOther: string;
  boxDividers: "" | "com" | "sem" | "nao-sei";
  boxDividerCount: string;
  boxDimensions: Dimensions;
  boxUnknown: boolean;
  boxBasis: string;
  boxNoPersonalization: boolean;
  boxPersonalization: string[];
  boxText: string;
  boxQrSource: QrSource;
  boxQrContent: string;
  plateMode: RequestMode;
  plateQuickDescription: string;
  plateContents: string[];
  plateContentUnknown: boolean;
  plateText: string;
  plateQrSource: QrSource;
  plateQrContent: string;
  plateUse: string;
  plateUseUnknown: boolean;
  plateFixation: string;
  plateFixationUnknown: boolean;
  plateDimensions: Dimensions;
  plateUnknown: boolean;
  modelScale: string;
  modelSource: "file" | "link";
  modelScaleUnknown: boolean;
  modelDimensions: Dimensions;
  modelLink: string;
  modelNotes: string;
  modelItems: ModelItem[];
  otherDescription: string;
  otherSize: string;
  colorMode: "" | "tenho" | "indeciso";
  colors: ColorChoice[];
  quantity: number;
  name: string;
  contactMethod: "whatsapp" | "email";
  contact: string;
  delivery: "" | "retirada" | "envio";
  cep: string;
  desiredDate: string;
  printRightsAccepted: boolean;
  printRightsVersion: string;
};

type SelectedFiles = Record<FileField, File[]>;

const emptyDimensions = (): Dimensions => ({ width: "", depth: "", height: "" });
const initialDraft: Draft = {
  type: null,
  studioPhotoId: null,
  productSlug: null,
  boxMode: "",
  boxQuickDescription: "",
  boxShape: "",
  boxShapeOther: "",
  boxDividers: "",
  boxDividerCount: "",
  boxDimensions: emptyDimensions(),
  boxUnknown: false,
  boxBasis: "",
  boxNoPersonalization: false,
  boxPersonalization: [],
  boxText: "",
  boxQrSource: "",
  boxQrContent: "",
  plateMode: "",
  plateQuickDescription: "",
  plateContents: [],
  plateContentUnknown: false,
  plateText: "",
  plateQrSource: "",
  plateQrContent: "",
  plateUse: "",
  plateUseUnknown: false,
  plateFixation: "",
  plateFixationUnknown: false,
  plateDimensions: emptyDimensions(),
  plateUnknown: false,
  modelScale: "",
  modelSource: "file",
  modelScaleUnknown: false,
  modelDimensions: emptyDimensions(),
  modelLink: "",
  modelNotes: "",
  modelItems: [],
  otherDescription: "",
  otherSize: "",
  colorMode: "",
  colors: [{ name: "", rgb: "" }],
  quantity: 1,
  name: "",
  contactMethod: "whatsapp",
  contact: "",
  delivery: "",
  cep: "",
  desiredDate: "",
  printRightsAccepted: false,
  printRightsVersion: "",
};

const allowedExtensions: Record<FileField, string[]> = {
  model: ["stl", "3mf"],
  logo: ["png", "jpg", "jpeg", "webp", "pdf"],
  qr: ["png", "jpg", "jpeg", "webp", "pdf"],
  boxLogo: ["png", "jpg", "jpeg", "webp", "pdf"],
  boxQr: ["png", "jpg", "jpeg", "webp", "pdf"],
  references: ["png", "jpg", "jpeg", "webp", "pdf"],
};

function fileIdentity(file: File) {
  return `${file.name}:${file.size}:${file.lastModified}`;
}

// File metadata is enough to avoid duplicate picks in the list, but not to
// decide whether an uploaded binary may be reused after replacement.
const uploadFileIds = new WeakMap<File, string>();
function uploadFileIdentity(file: File) {
  let id = uploadFileIds.get(file);
  if (!id) {
    id = crypto.randomUUID();
    uploadFileIds.set(file, id);
  }
  return id;
}

function uploadEntryKey(entry: { role: FileField; file: File; modelItemId?: string }) {
  return `${entry.role}:${entry.modelItemId ?? ""}:${uploadFileIdentity(entry.file)}`;
}

type UploadedFile = { id: string; role: FileField; name: string; size: number; type: string; modelItemId?: string };
type PendingUpload = { uploadKey: string; attachmentId?: string; complete?: boolean };
type PendingSubmission = {
  signature: string;
  requestId: string;
  submissionKey: string;
  uploads: Map<string, PendingUpload>;
};
type PendingConfirmation = { requestId: string; submissionKey: string; draft: Draft; attachments: UploadedFile[] };
const DRAFT_STORAGE_KEY = "cm-quote-draft-v1";
const DRAFT_TTL_MS = 24 * 60 * 60 * 1000;

function restorableDraft(value: unknown): value is Draft {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const candidate = value as Record<string, unknown>;
  if (candidate.type !== null && !projectOptions.some((option) => option.value === candidate.type)) return false;
  if (candidate.modelSource !== "file" && candidate.modelSource !== "link") return false;
  if (candidate.modelItems === undefined) candidate.modelItems = [];
  if (candidate.desiredDate === undefined) candidate.desiredDate = "";
  if (candidate.printRightsAccepted === undefined) candidate.printRightsAccepted = false;
  if (candidate.printRightsVersion === undefined) candidate.printRightsVersion = "";
  if (candidate.printRightsAccepted && candidate.printRightsVersion !== PRINT_RIGHTS_VERSION) {
    candidate.printRightsAccepted = false;
    candidate.printRightsVersion = "";
  }
  return Object.entries(initialDraft).every(([key, template]) => {
    const field = candidate[key];
    if (Array.isArray(template)) {
      if (!Array.isArray(field)) return false;
      if (key === "modelItems") return restorableModelItems(field);
      if (field.length > 12) return false;
      return key === "colors" ? field.every((color) => color && typeof color.name === "string" && typeof color.rgb === "string")
        : field.every((item) => typeof item === "string");
    }
    if (template && typeof template === "object") return field !== null && typeof field === "object" &&
      Object.keys(template).every((part) => typeof (field as Record<string, unknown>)[part] === "string");
    return template === null ? field === null || typeof field === "string" : typeof field === typeof template;
  });
}

function restorableConfirmation(value: unknown): value is PendingConfirmation {
  if (!value || typeof value !== "object") return false;
  const pending = value as Partial<PendingConfirmation>;
  return typeof pending.requestId === "string" && /^[0-9a-f-]{36}$/i.test(pending.requestId) &&
    typeof pending.submissionKey === "string" && /^[0-9a-f-]{36}$/i.test(pending.submissionKey) &&
    restorableDraft(pending.draft) && Array.isArray(pending.attachments) && pending.attachments.length <= 5 &&
    pending.attachments.every((file) => file && typeof file.id === "string" && typeof file.role === "string" &&
      typeof file.name === "string" && typeof file.size === "number" && typeof file.type === "string");
}

function visibleFileEntries(files: SelectedFiles, draft: Draft, modelFiles: Record<string, File> = {}): Array<{ role: FileField; file: File; modelItemId?: string }> {
  if (draft.type === "arquivo" && draft.modelItems?.length) {
    return draft.modelItems.flatMap((item) => item.source === "file" && modelFiles[item.id]
      ? [{ role: "model" as const, file: modelFiles[item.id], modelItemId: item.id }] : []);
  }
  return activeFileRoles(draft).flatMap((role) => files[role].map((file) => ({ role, file })));
}

function visibleFiles(files: SelectedFiles, draft: Draft, modelFiles: Record<string, File> = {}): File[] {
  return visibleFileEntries(files, draft, modelFiles).map(({ file }) => file);
}

function activeFileRoles(draft: Draft): FileField[] {
  if (draft.type === "arquivo") return ["model"];
  if (draft.type === "caixa") return draft.boxMode === "quick" ? ["references"] : [
    ...(!draft.boxNoPersonalization && draft.boxPersonalization.includes("Logotipo") ? ["boxLogo" as const] : []),
    ...(!draft.boxNoPersonalization && draft.boxPersonalization.includes("QR Code") && draft.boxQrSource === "file" ? ["boxQr" as const] : []),
    ...(!draft.boxNoPersonalization && draft.boxPersonalization.includes("Imagem ou desenho") ? ["references" as const] : []),
  ];
  if (draft.type === "placa") return draft.plateMode === "quick" ? ["references"] : [
    ...(!draft.plateContentUnknown && draft.plateContents.includes("Logotipo") ? ["logo" as const] : []),
    ...(!draft.plateContentUnknown && draft.plateContents.includes("QR Code") && draft.plateQrSource === "file" ? ["qr" as const] : []),
    "references",
  ];
  return draft.type === "outro" ? ["references"] : [];
}

function newModelItem(source: ModelItem["source"], value: string): ModelItem {
  return {
    id: crypto.randomUUID(), source,
    link: source === "link" ? value : "", fileName: source === "file" ? value : "", title: "",
    quantity: 1, colorMode: "indeciso", colors: [],
    scale: "original", dimensions: emptyDimensions(), notes: "",
  };
}

function modelLinkIssue(link: string): string | null {
  if (link.length > MODEL_LINK_MAX_LENGTH) return `excede ${MODEL_LINK_MAX_LENGTH} caracteres.`;
  if (/\s|[\u0000-\u001f\u007f]/.test(link)) return "contém espaços ou caracteres inválidos.";
  let url: URL;
  try { url = new URL(link); }
  catch { return "não é uma URL válida."; }
  if (url.protocol !== "https:") return "use um link HTTPS.";
  if (url.username || url.password || url.port) return "remova login, senha ou porta do link.";
  if (!["makerworld.com", "www.makerworld.com", "share.bambulab.com"].includes(url.hostname)) {
    return "o domínio deve ser MakerWorld ou Bambu Handy.";
  }
  if (!validModelLink(link)) return "o endereço não aponta para uma página de modelo válida.";
  return null;
}

function modelItemIssue(item: ModelItem): { message: string; focusId: string } | null {
  if (item.source === "link") {
    const issue = modelLinkIssue(item.link.trim());
    if (issue) return { message: `Corrija o link: ${issue}`, focusId: `model-url-${item.id}` };
  }
  if (!Number.isSafeInteger(item.quantity) || item.quantity < 1 || item.quantity > 10000) {
    return { message: "Informe uma quantidade entre 1 e 10.000.", focusId: `model-quantity-${item.id}` };
  }
  if (item.colorMode === "tenho" && (!item.colors.length || item.colors.length > 4 ||
      item.colors.some(color => !color.name.trim() && !color.rgb))) {
    const missingColor = item.colors.findIndex(color => !color.name.trim() && !color.rgb);
    return { message: "Preencha de uma a quatro cores ou escolha Ainda não decidi.",
      focusId: missingColor < 0 ? `model-colors-${item.id}` : `model-color-${item.id}-${missingColor}` };
  }
  if (item.scale === "alterar" && (!Object.values(item.dimensions).some(value => value.trim()) ||
      Object.values(item.dimensions).some(value => value.trim() && !validDimension(value)))) {
    const invalid = (['width', 'depth', 'height'] as const).find(key =>
      item.dimensions[key].trim() && !validDimension(item.dimensions[key]));
    return { message: "Informe ao menos uma medida válida em cm ou escolha outro tamanho.",
      focusId: `model-${item.id}-${invalid ?? 'width'}` };
  }
  return null;
}

function dimensionsText(dimensions: Dimensions, unknown = false, depth = false) {
  if (unknown) return "Medidas ainda não definidas";
  const parts = [dimensions.width, ...(depth ? [dimensions.depth] : []), dimensions.height];
  return parts.some((part) => part.trim()) ? `${parts.map((part) => part.trim() || "?").join(" × ")} cm` : "Medidas não informadas";
}

function validDimension(value: string) {
  const normalized = value.trim().replace(",", ".");
  const number = Number(normalized);
  return normalized.length <= 24 && /^\d+(?:\.\d+)?$/.test(normalized) &&
    Number.isFinite(number) && number > 0;
}

function colorText(color: ColorChoice) {
  if (color.name.trim()) return color.name.trim();
  if (!color.rgb) return "";
  const channels = [1, 3, 5].map((start) => parseInt(color.rgb.slice(start, start + 2), 16));
  return `RGB(${channels.join(", ")})`;
}

function hasColor(color: ColorChoice) {
  return Boolean(color.name.trim() || color.rgb);
}

function boxShapeText(draft: Draft) {
  return draft.boxShape === "Outro formato" ? draft.boxShapeOther.trim() || "Outro formato" : draft.boxShape;
}

function boxDividersText(draft: Draft) {
  if (draft.boxDividers === "com") {
    const count = draft.boxDividerCount.trim();
    return count ? `Com ${count} ${Number(count) === 1 ? "divisória" : "divisórias"}` : "Com divisórias";
  }
  if (draft.boxDividers === "sem") return "Sem divisórias";
  return "Divisórias a definir";
}

function boxPersonalizationText(draft: Draft) {
  if (draft.boxNoPersonalization) return "Sem personalização";
  const parts = [...draft.boxPersonalization];
  if (draft.boxPersonalization.includes("Nome ou frase") && draft.boxText.trim()) parts.push(draft.boxText.trim());
  if (draft.boxPersonalization.includes("QR Code") && draft.boxQrSource === "content" && draft.boxQrContent.trim()) parts.push(`QR: ${draft.boxQrContent.trim()}`);
  return parts.join(" · ");
}

function boxClosureText(shape: string) {
  const closureByShape: Record<string, string> = {
    Redonda: "Tampa de rosquear",
    Quadrada: "Tampa de encaixe",
    Retangular: "Tampa de deslizar",
  };
  return closureByShape[shape] ?? "Fechamento a definir";
}

function plateContentsText(draft: Draft) {
  if (draft.plateContentUnknown) return "Conteúdo a decidir";
  const parts = [...draft.plateContents];
  if (!draft.plateContentUnknown && draft.plateContents.includes("Nome ou frase") && draft.plateText.trim()) parts.push(draft.plateText.trim());
  if (!draft.plateContentUnknown && draft.plateContents.includes("QR Code") && draft.plateQrSource === "content" && draft.plateQrContent.trim()) parts.push(`QR: ${draft.plateQrContent.trim()}`);
  return parts.join(" · ");
}

function InlineError({ error, field }: { error: FieldError; field: string }) {
  return error?.field === field ? <p className={styles.fieldError} role="alert">{error.message}</p> : null;
}

function QuantityPicker({ value, onChange, error }: { value: number; onChange: (value: number) => void; error: FieldError }) {
  return (
    <div className={styles.field}>
      <label htmlFor="quote-quantity">Quantas unidades você precisa?</label>
      <div className={styles.quantity}>
        <button type="button" aria-label="Diminuir quantidade" disabled={value <= 1} onClick={() => onChange(Math.max(1, value - 1))}>−</button>
        <input id="quote-quantity" type="number" min="1" max="10000" inputMode="numeric" value={value} aria-invalid={error?.field === "quantity"} onChange={(event) => onChange(Math.max(1, Math.min(10000, Math.floor(Number(event.target.value) || 1))))} />
        <button type="button" aria-label="Aumentar quantidade" disabled={value >= 10000} onClick={() => onChange(Math.min(10000, value + 1))}>+</button>
      </div>
      <InlineError error={error} field="quantity" />
    </div>
  );
}

function DimensionFields({
  value, onChange, unknown, onUnknown, depth, allowUnknown = true, id, error = null,
}: {
  value: Dimensions;
  onChange: (dimension: keyof Dimensions, value: string) => void;
  unknown: boolean;
  onUnknown: (value: boolean) => void;
  depth?: boolean;
  allowUnknown?: boolean;
  id: string;
  error?: FieldError;
}) {
  const measures: Array<{ key: keyof Dimensions; label: string; help: string }> = [
    { key: "width", label: "Largura", help: "De um lado ao outro" },
  ];
  if (depth) measures.push({ key: "depth", label: "Profundidade", help: "Da frente até o fundo" });
  measures.push({ key: "height", label: "Altura", help: "De baixo até em cima" });

  return (
    <fieldset className={`${styles.fieldSet} ${unknown ? styles.fieldSkipped : ""}`}>
      <legend className={styles.visuallyHidden}>Qual tamanho você precisa?</legend>
      <div className={styles.fieldHeading}>
        <span className={styles.fieldLabel}>Qual tamanho você precisa?</span>
        {allowUnknown ? (
          <button className={styles.skipButton} type="button" aria-pressed={unknown} onClick={() => onUnknown(!unknown)}>
            Não sei as medidas
          </button>
        ) : null}
      </div>
      <p className={styles.fieldHint}>Pode informar medidas aproximadas, em centímetros.</p>
      <details className={styles.measureHelp}>
        <summary>Como medir?</summary>
        <p>Largura: de um lado ao outro. {depth ? "Profundidade: da frente até o fundo. " : ""}Altura: de baixo até em cima.</p>
      </details>
      <div className={styles.measureGrid}>
        {measures.map((measure) => (
          <div className={styles.field} key={measure.key}>
            <label htmlFor={`${id}-${measure.key}`}>{measure.label} <span>cm</span></label>
            <input id={`${id}-${measure.key}`} type="text" inputMode="decimal" maxLength={24} placeholder="Ex.: 12" value={value[measure.key]} disabled={unknown} aria-invalid={error?.field === `${id}Dimensions`} onChange={(event) => onChange(measure.key, event.target.value)} />
            <small>{measure.help}</small>
          </div>
        ))}
      </div>
      <InlineError error={error} field={`${id}Dimensions`} />
    </fieldset>
  );
}

function QrSourcePicker({ name, value, onChange, error = null }: { name: "box" | "plate"; value: QrSource; onChange: (value: QrSource) => void; error?: FieldError }) {
  return (
    <div className={styles.field}>
      <span id={`${name}-qr-source-label`} className={styles.fieldLabel}>Como você quer informar o QR Code?</span>
      <div className={styles.qrSourceChoices} role="radiogroup" aria-labelledby={`${name}-qr-source-label`} aria-invalid={error?.field === `${name}QrSource`}>
        <label>
          <input type="radio" name={`${name}-qr-source`} value="content" checked={value === "content"} onChange={() => onChange("content")} />
          <span>Informar link ou texto</span>
        </label>
        <label>
          <input type="radio" name={`${name}-qr-source`} value="file" checked={value === "file"} onChange={() => onChange("file")} />
          <span>Anexar QR Code pronto</span>
        </label>
      </div>
      <InlineError error={error} field={`${name}QrSource`} />
    </div>
  );
}

function FilePicker({
  id, label, accept, files, multiple, onAdd, onRemove, error,
}: {
  id: FileField;
  label: string;
  accept: string;
  files: File[];
  multiple?: boolean;
  onAdd: (field: FileField, files: File[]) => void;
  onRemove: (field: FileField, index: number) => void;
  error: FieldError;
}) {
  return (
    <div className={styles.field}>
      <label htmlFor={`quote-${id}`}>{label}</label>
      <input
        id={`quote-${id}`}
        className={styles.fileInput}
        type="file"
        accept={accept}
        multiple={multiple}
        aria-invalid={error?.field === id}
        onChange={(event) => {
          onAdd(id, Array.from(event.target.files ?? []));
          event.target.value = "";
        }}
      />
      {id === "references" || id === "logo" || id === "boxLogo" ?
        <small>Envie fotos ou imagens que você tenha autorização para compartilhar.</small> : null}
      {files.length > 0 ? (
        <ul className={styles.fileList} aria-label="Arquivos selecionados">
          {files.map((file, index) => (
            <li key={fileIdentity(file)}>
              <span>{file.name}</span>
              <button type="button" onClick={() => onRemove(id, index)} aria-label={`Remover ${file.name}`}>Remover</button>
            </li>
          ))}
        </ul>
      ) : null}
      <InlineError error={error} field={id} />
    </div>
  );
}

function SummaryRow({ label, value, url, onEdit }: { label: string; value: string; url?: string; onEdit?: () => void }) {
  return (
    <div className={styles.summaryRow}>
      <dt>{label}</dt>
      <dd>
        {url ? <a href={url} target="_blank" rel="noopener noreferrer">{value}</a> : <span>{value}</span>}
        {onEdit ? <button type="button" aria-label={`Editar ${label.toLowerCase()}`} onClick={onEdit}>Editar</button> : null}
      </dd>
    </div>
  );
}

export function QuoteFlow({ intakeEnabled, studioPhotoId, productReference, turnstileSiteKey, multiModelEnabled }: { intakeEnabled: boolean; studioPhotoId: string | null; productReference: { slug: string; name: string; imageUrl: string } | null; turnstileSiteKey: string | null; multiModelEnabled: boolean }) {
  const [step, setStep] = useState(studioPhotoId || productReference ? 2 : 1);
  const [reviewing, setReviewing] = useState(false);
  const [boxDetailStep, setBoxDetailStep] = useState(0);
  const [plateDetailStep, setPlateDetailStep] = useState(0);
  const [draft, setDraft] = useState<Draft>(() => ({
    ...initialDraft,
    type: studioPhotoId || productReference ? "outro" : null,
    studioPhotoId,
    productSlug: productReference?.slug ?? null,
  }));
  const [savedContacts, setSavedContacts] = useState({ whatsapp: "", email: "" });
  const [files, setFiles] = useState<SelectedFiles>({ model: [], logo: [], qr: [], boxLogo: [], boxQr: [], references: [] });
  const [modelFiles, setModelFiles] = useState<Record<string, File>>({});
  const [modelLinksInput, setModelLinksInput] = useState("");
  const [error, setError] = useState<FieldError>(null);
  const [openColorMenu, setOpenColorMenu] = useState<number | null>(null);
  const [openModelColorMenu, setOpenModelColorMenu] = useState<string | null>(null);
  const [reviewEdit, setReviewEdit] = useState<ReviewEditArea | null>(null);
  const [sending, setSending] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileResetKey, setTurnstileResetKey] = useState(0);
  const [submissionError, setSubmissionError] = useState("");
  const [emailPending, setEmailPending] = useState(false);
  const [submissionLocked, setSubmissionLocked] = useState(false);
  const [receiptId, setReceiptId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [fileReattach, setFileReattach] = useState<FileField[]>([]);
  const [pendingConfirmation, setPendingConfirmation] = useState<PendingConfirmation | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const formStepRef = useRef<HTMLElement>(null);
  const colorPickerButtons = useRef<(HTMLButtonElement | null)[]>([]);
  const reviewSnapshot = useRef<{ draft: Draft; files: SelectedFiles; modelFiles: Record<string, File>; savedContacts: Record<"whatsapp" | "email", string> } | null>(null);
  const reviewModelFocus = useRef<string | null>(null);
  const pendingSubmission = useRef<PendingSubmission | null>(null);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      try {
        const raw = sessionStorage.getItem(DRAFT_STORAGE_KEY);
        const stored = raw ? JSON.parse(raw) as Record<string, unknown> : null;
        const reference = studioPhotoId ?? productReference?.slug ?? null;
        if (stored && stored.reference === reference && typeof stored.savedAt === "number" &&
            Date.now() - stored.savedAt >= 0 && Date.now() - stored.savedAt < DRAFT_TTL_MS && restorableDraft(stored.draft)) {
          const savedDraft = stored.draft as Draft;
          if (!Array.isArray(savedDraft.modelItems)) savedDraft.modelItems = [];
          setDraft(savedDraft);
          if (typeof stored.modelLinksInput === "string" && stored.modelLinksInput.length <= 8000) {
            setModelLinksInput(stored.modelLinksInput);
          }
          setStep(typeof stored.step === "number" && [1, 2, 3].includes(stored.step) ? stored.step : 1);
          setBoxDetailStep(typeof stored.boxDetailStep === "number" ? Math.min(4, Math.max(0, stored.boxDetailStep)) : 0);
          setPlateDetailStep(typeof stored.plateDetailStep === "number" ? Math.min(3, Math.max(0, stored.plateDetailStep)) : 0);
          setReviewing(stored.reviewing === true);
          if (stored.savedContacts && typeof stored.savedContacts === "object") {
            const contacts = stored.savedContacts as Record<string, unknown>;
            setSavedContacts({ whatsapp: typeof contacts.whatsapp === "string" ? contacts.whatsapp : "", email: typeof contacts.email === "string" ? contacts.email : "" });
          }
          const hasModelItemsWithFiles = savedDraft.type === "arquivo" &&
            savedDraft.modelItems.some(item => item.source === "file");
          const needsModelFile = savedDraft.type === "arquivo" &&
            (savedDraft.modelItems.length ? hasModelItemsWithFiles : savedDraft.modelSource === "file");
          const missing = Array.isArray(stored.fileRoles) ? stored.fileRoles.filter((role): role is FileField =>
            typeof role === "string" && Object.hasOwn(allowedExtensions, role) &&
            (role !== "model" || needsModelFile)) : [];
          setFileReattach(hasModelItemsWithFiles ?
            [...new Set([...missing, "model" as FileField])] : missing);
          if (restorableConfirmation(stored.pendingConfirmation)) {
            setPendingConfirmation(stored.pendingConfirmation);
            setSubmissionLocked(true);
            setStep(3);
            setReviewing(true);
            setSubmissionError("O envio pode já ter sido registrado. Use Tentar confirmar envio para verificar o mesmo pedido.");
          }
        } else if (raw) sessionStorage.removeItem(DRAFT_STORAGE_KEY);
      } catch { /* Storage may be unavailable; the form remains usable. */ }
      setHydrated(true);
    });
    return () => { cancelled = true; };
  }, [studioPhotoId, productReference?.slug]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      if (receiptId) {
        sessionStorage.removeItem(DRAFT_STORAGE_KEY);
        return;
      }
      sessionStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify({
        savedAt: Date.now(), reference: studioPhotoId ?? productReference?.slug ?? null,
        step, reviewing, boxDetailStep, plateDetailStep, draft, modelLinksInput, savedContacts,
        fileRoles: [...new Set([...fileReattach, ...(Object.keys(modelFiles).length ? ["model" as FileField] : []),
          ...Object.entries(files).filter(([, selected]) => selected.length).map(([role]) => role as FileField)])],
        pendingConfirmation,
      }));
    } catch { /* Storage may be disabled or full. */ }
  }, [hydrated, receiptId, studioPhotoId, productReference?.slug, step, reviewing, boxDetailStep, plateDetailStep, draft, modelLinksInput, savedContacts, files, modelFiles, fileReattach, pendingConfirmation]);

  useEffect(() => { headingRef.current?.focus(); }, [step, reviewing, reviewEdit, draft.boxMode, draft.plateMode]);
  useEffect(() => {
    if (step !== 2 || reviewEdit !== "details" || !reviewModelFocus.current) return;
    document.getElementById(reviewModelFocus.current)?.focus();
    reviewModelFocus.current = null;
  }, [step, reviewEdit]);
  useEffect(() => {
    if (step === 2 && ((draft.type === "caixa" && draft.boxMode === "detailed") || (draft.type === "placa" && draft.plateMode === "detailed"))) formStepRef.current?.scrollIntoView({ block: "start" });
  }, [boxDetailStep, plateDetailStep, draft.boxMode, draft.plateMode, draft.type, step]);
  useEffect(() => {
    if (!error) return;
    const message = document.querySelector(`.${styles.fieldError}`);
    const field = message?.closest(`.${styles.field}, .${styles.fieldSet}`);
    const invalid = field?.querySelector<HTMLElement>('[aria-invalid="true"]');
    const control = (error.focusId ? document.getElementById(error.focusId) : null) ??
      (invalid?.matches('input, textarea, select, button') ? invalid :
      invalid?.querySelector<HTMLElement>('input, textarea, select, button') ??
      field?.querySelector<HTMLElement>('input, textarea, select, button'));
    control?.focus({ preventScroll: true });
    message?.scrollIntoView({ block: "center" });
  }, [error]);

  function update<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
    setError(null);
    setSubmissionError("");
  }

  function selectProjectType(type: ProjectType) {
    setDraft((current) => ({ ...current, type, productSlug: null,
      printRightsAccepted: current.type === type ? current.printRightsAccepted : false,
      printRightsVersion: current.type === type ? current.printRightsVersion : "" }));
    setError(null);
    setStep(2);
  }

  function changePrintRights(accepted: boolean) {
    setDraft((current) => ({ ...current, printRightsAccepted: accepted,
      printRightsVersion: accepted ? PRINT_RIGHTS_VERSION : "" }));
    setError(null);
    setSubmissionError("");
  }

  function chooseBoxMode(mode: Exclude<RequestMode, "">) {
    setBoxDetailStep(0);
    update("boxMode", mode);
  }

  function choosePlateMode(mode: Exclude<RequestMode, "">) {
    setPlateDetailStep(0);
    update("plateMode", mode);
  }

  function chooseBoxShape(shape: string) {
    update("boxShape", shape);
  }

  function updateDimension(key: "boxDimensions" | "plateDimensions" | "modelDimensions", dimension: keyof Dimensions, value: string) {
    setDraft((current) => ({ ...current, [key]: { ...current[key], [dimension]: value } }));
    setError(null);
  }

  function addFiles(field: FileField, incoming: File[]) {
    if (!incoming.length) return;
    const unique = new Map([...files.references, ...incoming].map((file) => [fileIdentity(file), file]));
    const next = { ...files, [field]: field === "references" ? [...unique.values()] : incoming.slice(0, 1) };
    const active = visibleFiles(next, draft, modelFiles);
    const invalid = incoming.find((file) => !allowedExtensions[field].includes(file.name.split(".").pop()?.toLowerCase() ?? ""));
    if (invalid) return setError({ field, message: `Formato não aceito: ${invalid.name}.` });
    if (active.some((file) => file.size <= 0)) return setError({ field, message: "O arquivo está vazio. Escolha outro arquivo." });
    if (active.length > 5) return setError({ field, message: "Selecione no máximo 5 arquivos por pedido." });
    const check = validateQuoteFiles(active);
    if (!check.ok) return setError({ field, message: check.message });
    setFiles(next);
    setFileReattach((current) => current.filter((role) => role !== field));
    setError(null);
  }

  function removeFile(field: FileField, index: number) {
    setFiles((current) => ({ ...current, [field]: current[field].filter((_, fileIndex) => fileIndex !== index) }));
    setError(null);
  }

  function addModelLinks() {
    const lines = modelLinksInput.split(/\r?\n/).map((value, index) => ({
      number: index + 1, link: value.trim(),
    })).filter(line => line.link);
    if (!lines.length) return setError({ field: "modelLinks", message: "Cole um ou mais links, um por linha." });
    const checked = lines.map(line => ({ ...line, issue: modelLinkIssue(line.link) }));
    const invalid = checked.filter(line => line.issue);
    const valid = checked.filter(line => !line.issue);
    const capacity = MODEL_ITEM_LIMIT - draft.modelItems.length;
    const accepted = valid.slice(0, capacity);
    const overflow = valid.slice(capacity);
    if (accepted.length) update("modelItems", [...draft.modelItems, ...accepted.map(({ link }) => newModelItem("link", link))]);
    setModelLinksInput(checked.filter(line => invalid.includes(line) || overflow.includes(line))
      .map(({ link }) => link).join("\n"));
    if (invalid.length || overflow.length) setError({ field: "modelLinks", message: [
      `${accepted.length} link(s) adicionado(s).`,
      ...invalid.map(({ number, issue }) => `Linha ${number}: ${issue}`),
      ...overflow.map(({ number }) => `Linha ${number}: excede o limite de ${MODEL_ITEM_LIMIT} modelos.`),
    ].join("\n") });
  }

  function addModelFiles(incoming: File[]) {
    if (!incoming.length) return;
    const capacity = MODEL_ITEM_LIMIT - draft.modelItems.length;
    if (incoming.length > capacity) return setError({ field: "modelFiles", message: `Máximo de ${MODEL_ITEM_LIMIT} modelos no orçamento.` });
    if (draft.modelItems.filter(item => item.source === "file").length + incoming.length > QUOTE_FILE_POLICY.maxFiles) {
      return setError({ field: "modelFiles", message: `Envie no máximo ${QUOTE_FILE_POLICY.maxFiles} arquivos por pedido, incluindo os que precisam ser reenviados.` });
    }
    const invalid = incoming.find(file => !quoteFileRoleAllows("model", file.name));
    if (invalid) return setError({ field: "modelFiles", message: `Escolha STL ou 3MF para o modelo “${invalid.name}”.` });
    const currently = Object.values(modelFiles);
    const result = validateQuoteFiles([...currently, ...incoming]);
    if (!result.ok) return setError({ field: "modelFiles", message: result.message });
    const additions = incoming.map(file => ({ item: newModelItem("file", file.name), file }));
    setModelFiles(current => ({ ...current, ...Object.fromEntries(additions.map(({ item, file }) => [item.id, file])) }));
    update("modelItems", [...draft.modelItems, ...additions.map(({ item }) => item)]);
    if (draft.modelItems.filter(item => item.source === "file").every(item => modelFiles[item.id])) {
      setFileReattach(current => current.filter(role => role !== "model"));
    }
  }

  function replaceModelFile(id: string, file: File) {
    const result = validateQuoteFiles([...Object.entries(modelFiles)
      .filter(([key]) => key !== id).map(([, existing]) => existing), file]);
    if (!result.ok) return setError({ field: "modelFiles", message: result.message });
    if (!quoteFileRoleAllows("model", file.name)) return setError({ field: "modelFiles", message: "Escolha STL ou 3MF." });
    setModelFiles(current => ({ ...current, [id]: file }));
    setDraft(current => ({ ...current, modelItems: current.modelItems.map(item =>
      item.id === id ? { ...item, fileName: file.name } : item) }));
    if (draft.modelItems.filter(item => item.source === "file")
      .every(item => item.id === id || modelFiles[item.id])) {
      setFileReattach(current => current.filter(role => role !== "model"));
    }
    setError(null);
  }

  function removeModelItem(id: string) {
    setDraft(current => ({ ...current, modelItems: current.modelItems.filter(item => item.id !== id) }));
    setModelFiles(current => Object.fromEntries(Object.entries(current).filter(([key]) => key !== id)));
    if (draft.modelItems.filter(item => item.id !== id && item.source === "file")
      .every(item => modelFiles[item.id])) {
      setFileReattach(current => current.filter(role => role !== "model"));
    }
    setError(null);
  }

  function moveModelItem(id: string, direction: -1 | 1) {
    setDraft(current => {
      const index = current.modelItems.findIndex(item => item.id === id);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= current.modelItems.length) return current;
      const modelItems = [...current.modelItems];
      [modelItems[index], modelItems[target]] = [modelItems[target], modelItems[index]];
      return { ...current, modelItems };
    });
    setError(null);
  }

  function changeModelItem(id: string, patch: Partial<ModelItem>) {
    setDraft(current => ({ ...current, modelItems: current.modelItems.map(item =>
      item.id === id ? { ...item, ...patch } : item) }));
    setError(null);
  }

  function applyModelDefaults() {
    const colors = draft.colorMode === "tenho" ? draft.colors : [];
    if (draft.colorMode === "tenho" && (!colors.length || !colors.every(hasColor))) {
      return setError({ field: "colors", message: "Preencha as cores padrão antes de aplicá-las." });
    }
    if (!draft.modelScaleUnknown && draft.modelScale === "alterar" &&
      (!Object.values(draft.modelDimensions).some(value => value.trim()) ||
       Object.values(draft.modelDimensions).some(value => value.trim() && !validDimension(value)))) {
      return setError({ field: "modelDimensions", message: "Informe ao menos uma medida válida para aplicar." });
    }
    setDraft(current => ({ ...current, modelItems: current.modelItems.map(item => ({
      ...item, colorMode: current.colorMode === "tenho" ? "tenho" as const : "indeciso" as const,
      colors: current.colorMode === "tenho" ? current.colors.map(color => ({ ...color })) : [],
      scale: current.modelScaleUnknown ? "nao-sei" as const :
        current.modelScale === "alterar" ? "alterar" as const : "original" as const,
      dimensions: { ...current.modelDimensions },
    })) }));
    setError(null);
  }

  function toggleList(key: "boxPersonalization" | "plateContents", item: string) {
    setDraft((current) => {
      const items = current[key];
      const next = items.includes(item) ? items.filter((value) => value !== item) : [...items, item];
      return { ...current, [key]: next };
    });
    setError(null);
  }

  function toggleBoxNoPersonalization() {
    const noPersonalization = !draft.boxNoPersonalization;
    setDraft((current) => ({
      ...current,
      boxNoPersonalization: noPersonalization,
      ...(noPersonalization ? { boxPersonalization: [], boxText: "", boxQrSource: "", boxQrContent: "" } : {}),
    }));
    if (noPersonalization) setFiles((current) => ({ ...current, boxLogo: [], boxQr: [] }));
    setError(null);
  }

  function updateColor(index: number, change: Partial<ColorChoice>) {
    setDraft((current) => ({
      ...current,
      colorMode: "tenho",
      colors: current.colors.map((color, colorIndex) => colorIndex === index ? { ...color, ...change } : color),
    }));
    setError(null);
  }

  function addColor() {
    setOpenColorMenu(null);
    setDraft((current) => ({
      ...current,
      colorMode: "tenho",
      colors: current.colors.length < 4 ? [...current.colors, { name: "", rgb: "" }] : current.colors,
    }));
    setError(null);
  }

  function removeColor(index: number) {
    setOpenColorMenu(null);
    setDraft((current) => ({ ...current, colors: current.colors.filter((_, colorIndex) => colorIndex !== index) }));
    setError(null);
  }

  function validateBoxDetail(stage: number): FieldError {
    if (stage === 0 && !draft.boxShape) return { field: "boxShape", message: "Escolha o formato da caixa para continuar." };
    if (stage === 1 && !draft.boxDividers) return { field: "boxDividers", message: "Escolha com ou sem divisórias, ou marque Ainda não sei." };
    if (stage === 1 && draft.boxDividers === "com" && !draft.boxDividerCount.trim()) return { field: "boxDividerCount", message: "Informe quantas divisórias a caixa terá." };
    if (stage === 2 && !draft.boxUnknown && !Object.values(draft.boxDimensions).every(validDimension)) return { field: "boxDimensions", message: "Informe largura, profundidade e altura em cm, ou marque Não sei as medidas." };
    if (stage === 2 && !draft.boxUnknown && !draft.boxBasis) return { field: "boxBasis", message: "Indique se as medidas são internas ou externas, ou selecione Não sei." };
    if (stage === 3 && !draft.boxNoPersonalization && draft.boxPersonalization.length === 0) return { field: "boxPersonalization", message: "Escolha uma personalização ou marque Não quero." };
    if (stage === 3 && !draft.boxNoPersonalization && draft.boxPersonalization.includes("Nome ou frase") && !draft.boxText.trim()) return { field: "boxText", message: "Digite o texto que vai na caixa." };
    if (stage === 3 && !draft.boxNoPersonalization && draft.boxPersonalization.includes("QR Code") && !draft.boxQrSource) return { field: "boxQrSource", message: "Escolha como quer informar o QR Code." };
    if (stage === 3 && !draft.boxNoPersonalization && draft.boxPersonalization.includes("QR Code") && draft.boxQrSource === "content" && !draft.boxQrContent.trim()) return { field: "boxQrContent", message: "Informe o link ou texto do QR Code." };
    if (stage === 3 && !draft.boxNoPersonalization && draft.boxPersonalization.includes("QR Code") && draft.boxQrSource === "file" && files.boxQr.length === 0) return { field: "boxQr", message: "Anexe o QR Code pronto." };
    if (stage === 3 && draft.boxShape === "Outro formato" && !draft.boxShapeOther.trim() &&
        (draft.boxNoPersonalization || !draft.boxPersonalization.includes("Imagem ou desenho"))) return { field: "boxPersonalization", message: "Descreva o formato no passo anterior ou escolha Imagem ou desenho para enviar uma referência." };
    if (stage === 3 && !draft.boxNoPersonalization && draft.boxPersonalization.includes("Imagem ou desenho") && files.references.length === 0) return { field: "references", message: "Envie a imagem ou desenho para a personalização." };
    if (stage === 4 && draft.colorMode !== "indeciso" && (draft.colors.length === 0 || draft.colors.length > 4 || !draft.colors.every(hasColor))) return { field: "colors", message: "Preencha cada cor adicionada ou marque Ainda não decidi." };
    return null;
  }

  function validatePlateDetail(stage: number): FieldError {
    if (stage === 0 && !draft.plateContentUnknown && draft.plateContents.length === 0) return { field: "plateContents", message: "Escolha o que vai na placa ou marque Ainda não decidi." };
    if (stage === 0 && !draft.plateContentUnknown && draft.plateContents.includes("Nome ou frase") && !draft.plateText.trim()) return { field: "plateText", message: "Digite o texto que vai na placa." };
    if (stage === 0 && !draft.plateContentUnknown && draft.plateContents.includes("QR Code") && !draft.plateQrSource) return { field: "plateQrSource", message: "Escolha como quer informar o QR Code." };
    if (stage === 0 && !draft.plateContentUnknown && draft.plateContents.includes("QR Code") && draft.plateQrSource === "content" && !draft.plateQrContent.trim()) return { field: "plateQrContent", message: "Informe o link ou texto do QR Code." };
    if (stage === 0 && !draft.plateContentUnknown && draft.plateContents.includes("QR Code") && draft.plateQrSource === "file" && files.qr.length === 0) return { field: "qr", message: "Anexe o QR Code pronto." };
    if (stage === 1 && !draft.plateUseUnknown && !draft.plateUse) return { field: "plateUse", message: "Escolha onde a placa será usada ou marque Ainda não sei." };
    if (stage === 1 && !draft.plateFixationUnknown && !draft.plateFixation.trim()) return { field: "plateFixation", message: "Descreva como pretende colocar a placa ou marque Ainda não sei." };
    if (stage === 2 && !draft.plateUnknown && ![draft.plateDimensions.width, draft.plateDimensions.height].every(validDimension)) return { field: "plateDimensions", message: "Informe largura e altura em cm, ou marque Não sei as medidas." };
    if (stage === 3 && draft.colorMode !== "indeciso" && (draft.colors.length === 0 || draft.colors.length > 4 || !draft.colors.every(hasColor))) return { field: "colors", message: "Preencha cada cor adicionada ou marque Ainda não decidi." };
    return null;
  }

  function validateDetails(): FieldError {
    if ((draft.type !== "arquivo" || !multiModelEnabled) &&
        (!Number.isSafeInteger(draft.quantity) || draft.quantity < 1 || draft.quantity > 10000)) {
      return { field: "quantity", message: "Informe uma quantidade entre 1 e 10.000." };
    }
    const activeFiles = visibleFiles(files, draft, modelFiles);
    const fileCheck = validateQuoteFiles(activeFiles);
    if (!fileCheck.ok) return { field: draft.type === "arquivo" ? "modelFiles" : "references", message: fileCheck.message };
    if (draft.type === "arquivo" && multiModelEnabled) {
      let units = 0;
      for (const [index, item] of draft.modelItems.entries()) {
        units += item.quantity;
        const issue = modelItemIssue(item) ??
          (units > 10000 ? { message: "O pedido ultrapassa o limite de 10.000 unidades.",
            focusId: `model-quantity-${item.id}` } : null);
        if (issue) return { field: `model-${item.id}`,
          message: `Modelo ${String(index + 1).padStart(2, "0")}: ${issue.message}`, focusId: issue.focusId };
      }
      if (!validModelItems(draft.modelItems)) return { field: "modelItems", message: `Adicione de 1 a ${MODEL_ITEM_LIMIT} modelos válidos e confira suas preferências.` };
      if (draft.modelItems.some(item => item.source === "file" && !modelFiles[item.id])) {
        return { field: "modelFiles", message: "Anexe novamente os arquivos pendentes antes de continuar." };
      }
      return null;
    }
    if (draft.type === "caixa" && draft.boxMode === "quick" && !draft.boxQuickDescription.trim() && files.references.length === 0) return { field: "boxQuickDescription", message: "Descreva sua ideia ou envie uma foto de referência." };
    if (draft.type === "placa" && draft.plateMode === "quick" && !draft.plateQuickDescription.trim() && files.references.length === 0) return { field: "plateQuickDescription", message: "Descreva sua ideia ou envie uma foto de referência." };
    if (draft.type === "arquivo" && !multiModelEnabled) {
      if (draft.modelSource === "file" && files.model.length === 0) return { field: "model", message: "Selecione um arquivo STL ou 3MF." };
      if (draft.modelSource === "link" && !validModelLink(draft.modelLink)) return { field: "modelLink", message: "Informe um link HTTPS válido do MakerWorld ou Bambu Handy." };
      if (!draft.modelScaleUnknown && !draft.modelScale) return { field: "modelScale", message: "Escolha como definir o tamanho." };
      if (!draft.modelScaleUnknown && draft.modelScale === "alterar" &&
        (!Object.values(draft.modelDimensions).some(value => value.trim()) ||
         Object.values(draft.modelDimensions).some(value => value.trim() && !validDimension(value)))) return { field: "modelDimensions", message: "Informe uma medida válida." };
    }
    if (draft.type === "outro" && draft.studioPhotoId && !draft.otherDescription.trim()) return { field: "otherDescription", message: "Descreva o que você quer mudar na foto de referência." };
    if (draft.type === "outro" && !draft.otherDescription.trim() && files.references.length === 0) return { field: "otherDescription", message: "Descreva a ideia ou anexe uma referência." };
    if (!(draft.type === "caixa" && draft.boxMode === "quick") && !(draft.type === "placa" && draft.plateMode === "quick") && !(draft.type === "arquivo" && multiModelEnabled) && draft.colorMode !== "indeciso" && (draft.colors.length === 0 || draft.colors.length > 4 || !draft.colors.every(hasColor))) return { field: "colors", message: "Preencha cada cor adicionada ou marque Ainda não decidi." };
    return null;
  }

  function validateProject() {
    function showProjectError(validation: NonNullable<FieldError>, stage = 0) {
      if (reviewing) beginReviewEdit("details", stage, validation.focusId, validation);
      else {
        if (draft.type === "caixa" && draft.boxMode === "detailed") setBoxDetailStep(stage);
        if (draft.type === "placa" && draft.plateMode === "detailed") setPlateDetailStep(stage);
        setError(validation);
      }
      return false;
    }

    if (draft.type === "caixa" && !draft.boxMode) {
      return showProjectError({ field: "boxMode", message: "Escolha pedido rápido ou montar passo a passo.",
        focusId: "quote-box-quick-mode" });
    }
    if (draft.type === "placa" && !draft.plateMode) {
      return showProjectError({ field: "plateMode", message: "Escolha pedido rápido ou montar passo a passo.",
        focusId: "quote-plate-quick-mode" });
    }
    if (draft.type === "caixa" && draft.boxMode === "detailed") {
      for (let stage = 0; stage <= 4; stage += 1) {
        const validation = validateBoxDetail(stage);
        if (validation) return showProjectError(validation, stage);
      }
    }
    if (draft.type === "placa" && draft.plateMode === "detailed") {
      for (let stage = 0; stage <= 3; stage += 1) {
        const validation = validatePlateDetail(stage);
        if (validation) return showProjectError(validation, stage);
      }
    }
    const validation = validateDetails();
    if (validation) {
      const stage = validation.field === "quantity" && draft.type === "caixa" && draft.boxMode === "detailed" ? 4
        : validation.field === "quantity" && draft.type === "placa" && draft.plateMode === "detailed" ? 3
        : validation.field === "references" && draft.type === "caixa" && draft.boxMode === "detailed" ? 3
        : validation.field === "references" && draft.type === "placa" && draft.plateMode === "detailed" ? 3 : 0;
      return showProjectError(validation, stage);
    }
    setError(null);
    return true;
  }

  function continueToContact() {
    if (!validateProject()) return;
    setStep(3);
  }

  function advanceBoxDetail() {
    const validation = validateBoxDetail(boxDetailStep);
    if (validation) return setError(validation);
    if (boxDetailStep < 4) {
      setError(null);
      setBoxDetailStep(boxDetailStep + 1);
    } else continueToContact();
  }

  function advancePlateDetail() {
    const validation = validatePlateDetail(plateDetailStep);
    if (validation) return setError(validation);
    if (plateDetailStep < 3) {
      setError(null);
      setPlateDetailStep(plateDetailStep + 1);
    } else continueToContact();
  }

  function validateContact(): FieldError {
    let validation: FieldError = null;
    if (!draft.name.trim()) validation = { field: "name", message: "Informe seu nome." };
    else if (draft.name.length > 160) validation = { field: "name", message: "Use até 160 caracteres no nome." };
    else if (draft.contact.length > 320) validation = { field: "contact", message: "Use até 320 caracteres no contato." };
    else if (draft.contactMethod === "whatsapp" && !/^\d{10,13}$/.test(draft.contact.replace(/\D/g, ""))) validation = { field: "contact", message: "Confira o número de WhatsApp com DDD." };
    else if (draft.contactMethod === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.contact.trim())) validation = { field: "contact", message: "Confira o endereço de e-mail." };
    else if (!draft.delivery) validation = { field: "delivery", message: "Escolha como prefere receber o pedido." };
    else if (draft.delivery === "envio" && draft.cep.replace(/\D/g, "").length !== 8) validation = { field: "cep", message: "Informe um CEP com 8 números." };
    else if (!validDesiredDate(draft.desiredDate)) validation = { field: "desiredDate", message: "Escolha uma data válida a partir de hoje ou deixe sem data." };
    return validation;
  }

  function reviewRequest() {
    const validation = validateContact();
    if (validation) return setError(validation);
    setError(null);
    setReviewing(true);
  }

  function openContactError(validation: NonNullable<FieldError>) {
    const area = ["name", "contact"].includes(validation.field) ? "contact" : "delivery";
    beginReviewEdit(area, 0, undefined, validation);
  }

  async function confirmQuote(confirmation: PendingConfirmation) {
    setSubmissionLocked(true);
    setPendingConfirmation(confirmation);
    // Save before the request: a refresh during an uncertain response must retry the same key.
    try {
      sessionStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify({
        savedAt: Date.now(), reference: studioPhotoId ?? productReference?.slug ?? null,
        step: 3, reviewing: true, boxDetailStep, plateDetailStep, draft: confirmation.draft,
        modelLinksInput, savedContacts, fileRoles: [...new Set([...fileReattach, ...(Object.keys(modelFiles).length ? ["model" as FileField] : []),
          ...Object.entries(files).filter(([, selected]) => selected.length).map(([role]) => role as FileField)])],
        pendingConfirmation: confirmation,
      }));
    } catch { /* The in-memory idempotency key still protects this page. */ }
    const response = await fetch("/api/quote/submit", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(confirmation), cache: "no-store",
    });
    const result = await response.json().catch(() => null) as {
      requestId?: string; error?: string; notificationStatus?: string;
    } | null;
    if (response.status === 202 && result?.error === "quote_email_pending") {
      setEmailPending(true);
      setSubmissionError(result.notificationStatus === "sending"
        ? "O pedido foi salvo e o aviso por e-mail está em andamento. Aguarde um pouco e tente confirmar novamente."
        : "O pedido foi salvo no banco, mas o aviso por e-mail ainda não foi confirmado. Tente novamente.");
      return;
    }
    if (!response.ok || !result?.requestId) throw new Error(result?.error || "quote_unavailable");
    setEmailPending(false);
    setSubmissionError("");
    setPendingConfirmation(null);
    pendingSubmission.current = null;
    setReceiptId(result.requestId);
  }

  async function submitQuote() {
    if ((!intakeEnabled && !pendingConfirmation) || sending || !draft.type) return;
    if (!pendingConfirmation) {
      if (!validateProject()) return;
      const contactError = validateContact();
      if (contactError) return openContactError(contactError);
      if (draft.type === "arquivo" && (!draft.printRightsAccepted || draft.printRightsVersion !== PRINT_RIGHTS_VERSION)) {
        return setError({ field: "printRightsAccepted", message: "Confirme a declaração para solicitar a impressão." });
      }
    }
    setSubmissionError("");
    setSending(true);
    try {
      if (pendingConfirmation) {
        await confirmQuote(pendingConfirmation);
        return;
      }
      const entries = visibleFileEntries(files, draft, modelFiles);
      // The draft's text may change while an upload is being retried. Reuse
      // its reservation unless the project type or actual selected files change.
      const signature = JSON.stringify([draft.type, entries.map(uploadEntryKey).sort()]);
      let pending = pendingSubmission.current;
      if (!pending || pending.signature !== signature) {
        pendingSubmission.current = null;
        if (!turnstileToken) throw new Error("human_verification_required");
        const session = await quoteApi<{ requestId: string }>("/api/quote/session", {
          projectType: draft.type === "arquivo" ? "impressao" : draft.type,
          turnstileToken,
        });
        setTurnstileToken("");
        if (!/^[0-9a-f-]{36}$/i.test(session.requestId)) throw new Error("quote_unavailable");
        pending = { signature, requestId: session.requestId, submissionKey: crypto.randomUUID(), uploads: new Map() };
        pendingSubmission.current = pending;
      }
      for (let index = 0; index < entries.length; index += 1) {
        const { role, file, modelItemId } = entries[index];
        const key = uploadEntryKey({ role, file, modelItemId });
        const upload = pending.uploads.get(key) ?? { uploadKey: crypto.randomUUID() };
        pending.uploads.set(key, upload);
        if (!upload.complete && upload.attachmentId) {
          try {
            await quoteApi("/api/quote/attachments/complete", {
              requestId: pending.requestId, attachmentId: upload.attachmentId,
            });
            upload.complete = true;
          } catch (cause) {
            // Only a missing object can be uploaded again with this grant.
            // A transient validation/rate error must keep the same request and
            // attachment ID for the next confirmation attempt.
            if (!(cause instanceof Error) || cause.message !== "quote_file_missing") throw cause;
          }
        }
        if (!upload.complete) {
          const authorization = await quoteApi<{
            attachmentId: string; uploadEndpoint: string; uploadPath: string; uploadToken: string;
          }>("/api/quote/attachments/init", {
            requestId: pending.requestId, uploadKey: upload.uploadKey,
            name: file.name, size: file.size, type: file.type, role,
          });
          upload.attachmentId = authorization.attachmentId;
          setSubmissionError(`Enviando arquivo ${index + 1} de ${entries.length}: ${file.name}`);
          await uploadSignedFile(file, authorization);
          await quoteApi("/api/quote/attachments/complete", {
            requestId: pending.requestId, attachmentId: upload.attachmentId,
          });
          upload.complete = true;
        }
      }
      setSubmissionError("Registrando pedido e enviando e-mail...");
      const attachments: UploadedFile[] = entries.map(({ role, file, modelItemId }) => {
        const uploaded = pending!.uploads.get(uploadEntryKey({ role, file, modelItemId }));
        if (!uploaded?.attachmentId || !uploaded.complete) throw new Error("quote_upload_unavailable");
        return { id: uploaded.attachmentId, role, name: file.name, size: file.size, type: file.type,
          ...(modelItemId ? { modelItemId } : {}) };
      });
      await confirmQuote({ requestId: pending.requestId, submissionKey: pending.submissionKey, draft, attachments });
    } catch (cause) {
      const code = cause instanceof Error ? cause.message : "quote_unavailable";
      if (!pendingSubmission.current && !pendingConfirmation) {
        setTurnstileToken("");
        setTurnstileResetKey((key) => key + 1);
      }
      if (["quote_not_found", "quote_attachment_not_found", "quote_conflict",
        "upload_reservation_expiring", "quote_session_invalid"].includes(code)) {
        pendingSubmission.current = null;
        setPendingConfirmation(null);
        setSubmissionLocked(false);
      }
      if (["invalid_quote_submit", "request_too_large", "quote_print_rights_required", "quote_print_rights_outdated"].includes(code)) {
        setPendingConfirmation(null);
        setSubmissionLocked(false);
      }
      if (code === "invalid_quote_submit") {
        // A date can become invalid while the summary stays open overnight.
        // Return to the field if the client can identify the rejected answer.
        if (!validateProject()) return;
        const contactError = validateContact();
        if (contactError) return openContactError(contactError);
      }
      if (code === "quote_print_rights_required") {
        setError({ field: "printRightsAccepted", message: "Confirme a declaração para solicitar a impressão." });
      }
      setSubmissionError(code === "human_verification_required" ? "Confirme a verificação de segurança para enviar o orçamento."
        : code === "human_verification_expired" ? "A verificação expirou. Tente novamente no quadro de segurança."
        : code === "quote_verification_unavailable" ? "A verificação está temporariamente indisponível. Tente novamente sem refazer o pedido."
        : code === "quote_rate_limited" ? "Muitas tentativas em pouco tempo. Aguarde e tente novamente."
        : code === "quote_multimodel_unavailable" ? "O envio de múltiplos modelos está pausado. Seu pedido permanece salvo nesta página para tentar novamente quando o serviço voltar."
        : code === "quote_not_available" ? "O recebimento de novos pedidos está pausado. Se este pedido já foi registrado, tente confirmar novamente mais tarde."
        : code === "quote_upload_unavailable" ? "Não foi possível enviar um arquivo. Confira sua conexão e tente novamente."
        : code === "quote_file_missing" ? "O arquivo ainda não chegou ao armazenamento. Tente enviar novamente."
        : code === "quote_file_size_mismatch" ? "O tamanho do arquivo recebido é diferente do selecionado. Escolha outro arquivo."
        : code === "unsupported_file_content" || code === "quote_file_invalid" ? "O conteúdo do arquivo não corresponde a um formato aceito. Escolha outro arquivo STL, 3MF, PDF ou imagem."
        : code === "quote_attachment_not_found" ? "Um arquivo do pedido não está mais disponível. Selecione os arquivos novamente para enviar."
        : code === "quote_storage_budget_reached" ? "O envio de arquivos está temporariamente indisponível por limite de armazenamento. Você pode remover os arquivos e enviar links dos modelos ou solicitar ajuda pelo contato do Estúdio."
        : code === "quote_file_limit_reached" ? "Os anexos ultrapassam os limites permitidos. Remova ou substitua alguns arquivos."
        : code === "request_too_large" ? "O texto do pedido ultrapassa o limite de envio. Reduza as descrições e tente novamente."
        : code === "quote_print_rights_required" ? "Confirme a declaração de impressão e tente novamente."
        : code === "quote_print_rights_outdated" ? "A declaração de impressão foi atualizada. Atualize a página, leia o texto atual e confirme novamente."
        : code === "invalid_quote_submit" ? "Algum dado do pedido precisa ser revisto antes do envio."
        : "Não foi possível concluir o envio. Seu pedido permanece nesta página para tentar novamente.");
    } finally {
      setSending(false);
    }
  }

  function beginReviewEdit(area: ReviewEditArea, detailStage = 0, modelFieldId?: string, initialError: FieldError = null) {
    reviewSnapshot.current = { draft, files, modelFiles, savedContacts };
    reviewModelFocus.current = modelFieldId ?? null;
    setReviewEdit(area);
    setReviewing(false);
    setError(initialError);
    setSubmissionError("");
    if (area === "details") {
      if (draft.type === "caixa" && draft.boxMode === "detailed") setBoxDetailStep(detailStage);
      if (draft.type === "placa" && draft.plateMode === "detailed") setPlateDetailStep(detailStage);
      setStep(2);
    } else setStep(3);
  }

  function cancelReviewEdit() {
    if (reviewSnapshot.current) {
      setDraft(reviewSnapshot.current.draft);
      setFiles(reviewSnapshot.current.files);
      setModelFiles(reviewSnapshot.current.modelFiles);
      setSavedContacts(reviewSnapshot.current.savedContacts);
    }
    reviewSnapshot.current = null;
    setReviewEdit(null);
    setError(null);
    setStep(3);
    setReviewing(true);
  }

  function saveReviewEdit() {
    if (reviewEdit === "details" && !validateProject()) return;
    if (reviewEdit === "contact" || reviewEdit === "delivery") {
      const validation = validateContact();
      if (validation) {
        if (reviewEdit === "delivery" && ["name", "contact"].includes(validation.field)) setReviewEdit("contact");
        if (reviewEdit === "contact" && ["delivery", "cep", "desiredDate"].includes(validation.field)) setReviewEdit("delivery");
        return setError(validation);
      }
    }
    reviewSnapshot.current = null;
    setReviewEdit(null);
    setError(null);
    setStep(3);
    setReviewing(true);
  }

  function edit(target: number) {
    reviewSnapshot.current = null;
    setReviewEdit(null);
    setReviewing(false);
    setError(null);
    setStep(target);
  }

  function chooseContactMethod(method: Draft["contactMethod"]) {
    if (method === draft.contactMethod) return;
    setDraft((current) => ({ ...current, contactMethod: method, contact: savedContacts[method] }));
    setError(null);
  }

  function changeContact(value: string) {
    update("contact", value);
    setSavedContacts((current) => ({ ...current, [draft.contactMethod]: value }));
  }

  const title = reviewEdit === "contact" ? "Editar contato"
    : reviewEdit === "delivery" ? "Editar entrega"
    : step === 1 ? "O que vamos criar para você?"
    : step === 2 ? ({ caixa: "Vamos montar sua caixa!", placa: "Vamos criar sua placa!", arquivo: "Vamos imprimir seu projeto!", outro: "Conte sua ideia!" } as const)[draft.type ?? "outro"]
    : reviewing ? "Confira seu pedido" : "Estamos quase lá!";
  const showingGuidedForm = step === 2 && ((draft.type === "caixa" && draft.boxMode !== "") || (draft.type === "placa" && draft.plateMode !== ""));
  const showingColorChoices = (draft.type === "caixa" && draft.boxMode === "detailed" && boxDetailStep === 4)
    || (draft.type === "placa" && draft.plateMode === "detailed" && plateDetailStep === 3)
    || draft.type === "outro" || (draft.type === "arquivo" && (!multiModelEnabled || draft.modelItems.length > 1));
  const showingQuantity = (draft.type !== "arquivo" || !multiModelEnabled) && (showingColorChoices || (draft.type === "caixa" && draft.boxMode === "quick") || (draft.type === "placa" && draft.plateMode === "quick"));
  const showingFilePolicy = draft.type === "caixa" ? Boolean(draft.boxMode) : draft.type === "placa" ? Boolean(draft.plateMode) : !multiModelEnabled;
  const reviewingMultiModel = draft.type === "arquivo" &&
    (multiModelEnabled || (submissionLocked && Boolean(pendingConfirmation?.draft.modelItems?.length)));
  const currentQuantity = reviewingMultiModel ? modelUnits(draft.modelItems) : draft.quantity;
  const quantitySummary = `${currentQuantity} ${currentQuantity === 1 ? "unidade" : "unidades"}`;
  const colorsSummary = draft.colorMode === "indeciso" ? "Cores a decidir" : draft.colors.map(colorText).filter(Boolean).join(", ") || "Cores não informadas";
  const activeFiles = visibleFiles(files, draft, modelFiles);
  const missingFileRoles = fileReattach.filter(role => activeFileRoles(draft).includes(role) &&
    (role === "model" ? draft.modelItems.length
      ? draft.modelItems.some(item => item.source === "file" && !modelFiles[item.id])
      : draft.modelSource === "file" && files.model.length === 0
      : files[role].length === 0));
  const quickRequest = (draft.type === "caixa" && draft.boxMode === "quick") || (draft.type === "placa" && draft.plateMode === "quick");

  if (receiptId) return (
    <section className={styles.step} aria-labelledby="quote-receipt-title">
      <div className={styles.stepHeading}>
        <h2 id="quote-receipt-title">Pedido recebido</h2>
        <p>Recebemos sua solicitação. Vamos analisar seu projeto e retornar pelo contato escolhido.</p>
      </div>
      <div className={styles.receiptCard}>
        <strong>Número da solicitação</strong>
        <span>{receiptId}</span>
        <p>Enviamos os detalhes para o e-mail de atendimento.</p>
      </div>
      <Link className={styles.receiptAction} href="/">Voltar ao início</Link>
    </section>
  );

  return (
    <section className={styles.step} ref={formStepRef} aria-labelledby="quote-step-title">
      <div className={styles.progressMeta}><span>Etapa {step} de 3</span><span>{["", "Escolher", "Personalizar", "Enviar"][step]}</span></div>
      <div className={styles.progress} role="progressbar" aria-label="Progresso do orçamento" aria-valuemin={1} aria-valuemax={3} aria-valuenow={step}>
        {[1, 2, 3].map((item) => <span key={item} className={item <= step ? styles.progressActive : undefined} />)}
      </div>
      {showingGuidedForm ? (
        <h2 className={styles.visuallyHidden} id="quote-step-title" ref={headingRef} tabIndex={-1}>
          {draft.type === "caixa" ? (draft.boxMode === "quick" ? "Pedido rápido da caixa" : "Detalhes da caixa") : (draft.plateMode === "quick" ? "Pedido rápido da placa" : "Detalhes da placa")}
        </h2>
      ) : (
        <div className={styles.stepHeading}>
          <h2 id="quote-step-title" ref={headingRef} tabIndex={-1}>{title}</h2>
          <p>{reviewEdit ? "Altere o que precisar e volte diretamente ao resumo." : step === 1 ? "Escolha uma opção para começar." : step === 2 ? "Responda do seu jeito. Você pode voltar e ajustar depois." : reviewing ? "Veja se está tudo certo antes de solicitar o orçamento." : "Só precisamos dos seus dados para preparar o pedido."}</p>
        </div>
      )}

      {missingFileRoles.length > 0 && !pendingConfirmation && step > 1 ? (
        <p className={styles.pendingNotice} role="status">O rascunho foi recuperado. Reanexe os arquivos locais que quiser enviar; eles não são preservados após atualizar a página.</p>
      ) : null}

      {draft.studioPhotoId && step > 1 ? (
        <div className={styles.studioReference} role="group" aria-label="Foto de referência do Estúdio">
          <Image
            className={styles.studioReferenceImage}
            src={`/api/studio/photos/${draft.studioPhotoId}`}
            alt="Foto escolhida no Estúdio como referência"
            width={88}
            height={88}
          />
          <div>
            <strong>Foto do Estúdio selecionada como referência</strong>
            <p>Descreva o que você quer manter ou mudar nesta peça.</p>
          </div>
        </div>
      ) : null}
      {productReference && draft.productSlug && step > 1 ? (
        <div className={styles.studioReference} role="group" aria-label="Produto de referência">
          {/* Imagem do catálogo validada no servidor antes de chegar ao formulário. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className={styles.studioReferenceImage}
            src={productReference.imageUrl}
            alt={`Imagem do produto ${productReference.name} selecionado como referência`}
            width="88"
            height="88"
          />
          <div>
            <strong>Produto de referência: {productReference.name}</strong>
            <p>Descreva a personalização ou medida diferente que você procura.</p>
          </div>
        </div>
      ) : null}

      {step === 1 ? (
        <fieldset className={styles.options}>
          <legend className={styles.visuallyHidden}>Tipo de projeto</legend>
          {projectOptions.map((option, index) => (
            <label className={styles.option} key={option.value}>
              <input type="radio" name="quote-project-type" value={option.value} checked={draft.type === option.value} onClick={() => selectProjectType(option.value)} onChange={() => selectProjectType(option.value)} />
              <span className={styles.optionCopy}>
                <span className={styles.optionNumber}>{String(index + 1).padStart(2, "0")}</span>
                <strong>{option.title}</strong>
                <span className={styles.optionDescription}>{option.description}</span>
                <span className={styles.optionArrow} aria-hidden="true">→</span>
              </span>
              <span className={styles.optionMedia} aria-hidden="true"><Image src={option.image} alt="" fill sizes="88px" /></span>
            </label>
          ))}
        </fieldset>
      ) : null}

      {step === 2 ? (
        <div className={`${styles.formPanel} ${showingGuidedForm ? styles.guidedFormPanel : ""}`}>
          {draft.type === "caixa" ? (
            <>
              {!draft.boxMode ? <div className={styles.boxModeChoices} role="group" aria-label="Como prefere descrever sua caixa?" data-invalid={error?.field === "boxMode"}>
                <button id="quote-box-quick-mode" type="button" onClick={() => chooseBoxMode("quick")}>
                  <span className={styles.boxModeCopy}>
                    <span>01 · Pedido rápido</span>
                    <strong>Foto ou descrição</strong>
                    <small>Envie uma foto, descreva o pedido ou faça os dois.</small>
                  </span>
                  <span className={styles.boxModeMedia} aria-hidden="true">
                    <Image src="/images/orcamentos/pedido-rapido.png" alt="" fill sizes="88px" />
                  </span>
                </button>
                <button type="button" onClick={() => chooseBoxMode("detailed")}>
                  <span className={styles.boxModeCopy}>
                    <span>02 · Mais detalhes</span>
                    <strong>Montar passo a passo</strong>
                    <small>Defina formato, divisórias, medidas e personalização em sequência.</small>
                  </span>
                  <span className={styles.boxModeMedia} aria-hidden="true">
                    <Image src="/images/orcamentos/mais-detalhes.png" alt="" fill sizes="88px" />
                  </span>
                </button>
              </div> : null}
              {!draft.boxMode ? <InlineError error={error} field="boxMode" /> : null}
              {draft.boxMode === "quick" ? (
                <>
                  <FilePicker id="references" label="Envie uma foto de referência, se tiver" accept=".png,.jpg,.jpeg,.webp,.pdf" files={files.references} multiple onAdd={addFiles} onRemove={removeFile} error={error} />
                  <div className={styles.field}>
                    <label htmlFor="box-quick-description">O que você quer criar ou mudar?</label>
                    <textarea id="box-quick-description" className={styles.quickDescription} maxLength={2000} value={draft.boxQuickDescription} aria-invalid={error?.field === "boxQuickDescription"} onChange={(event) => update("boxQuickDescription", event.target.value)} placeholder="Ex.: quero essa caixa em preto e vermelho, com meu QR Code." />
                    <small>Pode escrever do seu jeito. Uma foto ou uma descrição já basta para continuar.</small>
                    <InlineError error={error} field="boxQuickDescription" />
                  </div>
                </>
              ) : null}
              {draft.boxMode === "detailed" ? (
                <>
                  {boxDetailStep === 0 ? (
                    <div className={styles.field}>
                      <div className={styles.fieldHeading}>
                        <span className={styles.fieldLabel}>Qual formato você imagina?</span>
                      </div>
                      <div className={styles.shapeChoices} role="group" aria-label="Formato da caixa">
                        {boxShapeOptions.map(({ label, image }) => (
                          <button className={styles.shapeOption} type="button" key={label} aria-pressed={draft.boxShape === label} onClick={() => chooseBoxShape(label)}>
                            <Image src={image} alt="" width={1122} height={1402} sizes="112px" />
                            <span>{label}</span>
                          </button>
                        ))}
                      </div>
                      <InlineError error={error} field="boxShape" />
                      {draft.boxShape === "Outro formato" ? <><input type="text" maxLength={2000} aria-label="Descreva o formato da caixa" value={draft.boxShapeOther} aria-invalid={error?.field === "boxShapeOther"} onChange={(event) => update("boxShapeOther", event.target.value)} placeholder="Descreva o formato ou envie uma imagem na personalização" /><InlineError error={error} field="boxShapeOther" /></> : null}
                    </div>
                  ) : null}
                  {boxDetailStep === 1 ? (
                    <div className={`${styles.field} ${draft.boxDividers === "nao-sei" ? styles.fieldSkipped : ""}`}>
                      <div className={styles.fieldHeading}>
                        <span className={styles.fieldLabel}>Sua caixa será com ou sem divisórias?</span>
                        <button className={styles.skipButton} type="button" aria-pressed={draft.boxDividers === "nao-sei"} onClick={() => update("boxDividers", draft.boxDividers === "nao-sei" ? "" : "nao-sei")}>Ainda não sei</button>
                      </div>
                      <div className={styles.choiceButtons} role="group" aria-label="Divisórias da caixa">
                        {[["com", "Com divisórias"], ["sem", "Sem divisórias"]].map(([value, label]) => <button type="button" key={value} disabled={draft.boxDividers === "nao-sei"} aria-pressed={draft.boxDividers === value} onClick={() => update("boxDividers", value as Draft["boxDividers"])}>{label}</button>)}
                      </div>
                      <InlineError error={error} field="boxDividers" />
                      {draft.boxDividers === "com" ? (
                        <div className={styles.field}>
                          <label htmlFor="box-divider-count">Quantas divisórias serão?</label>
                          <input id="box-divider-count" type="text" inputMode="numeric" maxLength={2000} value={draft.boxDividerCount} aria-invalid={error?.field === "boxDividerCount"} onChange={(event) => update("boxDividerCount", event.target.value.replace(/\D/g, "").replace(/^0+/, ""))} placeholder="Ex.: 2" />
                          <InlineError error={error} field="boxDividerCount" />
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                  {boxDetailStep === 2 ? (
                    <>
                      <DimensionFields id="box" value={draft.boxDimensions} onChange={(dimension, value) => updateDimension("boxDimensions", dimension, value)} unknown={draft.boxUnknown} onUnknown={(value) => update("boxUnknown", value)} depth error={error} />
                      {!draft.boxUnknown && Object.values(draft.boxDimensions).some((value) => value.trim()) ? (
                        <div className={styles.field}>
                          <label htmlFor="box-basis">As medidas são internas ou externas?</label>
                          <select id="box-basis" value={draft.boxBasis} aria-invalid={error?.field === "boxBasis"} onChange={(event) => update("boxBasis", event.target.value)}><option value="">Selecione uma opção</option><option value="internas">Internas</option><option value="externas">Externas</option><option value="nao-sei">Não sei</option></select>
                          <InlineError error={error} field="boxBasis" />
                        </div>
                      ) : null}
                    </>
                  ) : null}
                  {boxDetailStep === 3 ? (
                    <>
                      <div className={`${styles.field} ${draft.boxNoPersonalization ? styles.fieldSkipped : ""}`}>
                        <div className={styles.fieldHeading}>
                          <span className={styles.fieldLabel}>Quer personalizar a caixa?</span>
                          <button className={styles.skipButton} type="button" aria-pressed={draft.boxNoPersonalization} onClick={toggleBoxNoPersonalization}>Não quero</button>
                        </div>
                        <p className={styles.fieldHint}>Pode escolher mais de uma opção.</p>
                        <div className={styles.choiceButtons} role="group" aria-label="Personalização da caixa">
                          {["Nome ou frase", "Logotipo", "QR Code", "Imagem ou desenho"].map((item) => <button type="button" key={item} disabled={draft.boxNoPersonalization} aria-pressed={draft.boxPersonalization.includes(item)} onClick={() => toggleList("boxPersonalization", item)}>{item}</button>)}
                        </div>
                        <InlineError error={error} field="boxPersonalization" />
                      </div>
                      {!draft.boxNoPersonalization && draft.boxPersonalization.includes("Nome ou frase") ? <div className={styles.field}><label htmlFor="box-text">Qual texto vai na caixa?</label><input id="box-text" type="text" maxLength={2000} value={draft.boxText} aria-invalid={error?.field === "boxText"} onChange={(event) => update("boxText", event.target.value)} placeholder="Nome, frase ou outra ideia" /><InlineError error={error} field="boxText" /></div> : null}
                      {!draft.boxNoPersonalization && draft.boxPersonalization.includes("Logotipo") ? <FilePicker id="boxLogo" label="Envie seu logotipo, se já tiver" accept=".png,.jpg,.jpeg,.webp,.pdf" files={files.boxLogo} onAdd={addFiles} onRemove={removeFile} error={error} /> : null}
                      {!draft.boxNoPersonalization && draft.boxPersonalization.includes("Imagem ou desenho") ? <FilePicker id="references" label="Envie uma imagem ou desenho da caixa" accept=".png,.jpg,.jpeg,.webp,.pdf" files={files.references} multiple onAdd={addFiles} onRemove={removeFile} error={error} /> : null}
                      {!draft.boxNoPersonalization && draft.boxPersonalization.includes("QR Code") ? (
                        <>
                          <QrSourcePicker name="box" value={draft.boxQrSource} onChange={(value) => update("boxQrSource", value)} error={error} />
                          {draft.boxQrSource === "content" ? <div className={styles.field}><label htmlFor="box-qr">O que o QR Code deve exibir?</label><input id="box-qr" type="text" maxLength={2000} value={draft.boxQrContent} aria-invalid={error?.field === "boxQrContent"} onChange={(event) => update("boxQrContent", event.target.value)} placeholder="Link ou texto" /><InlineError error={error} field="boxQrContent" /></div> : null}
                          {draft.boxQrSource === "file" ? <FilePicker id="boxQr" label="Anexe seu QR Code pronto" accept=".png,.jpg,.jpeg,.webp,.pdf" files={files.boxQr} onAdd={addFiles} onRemove={removeFile} error={error} /> : null}
                        </>
                      ) : null}
                    </>
                  ) : null}
                </>
              ) : null}
            </>
          ) : null}

          {draft.type === "placa" ? (
            <>
              {!draft.plateMode ? <div className={`${styles.boxModeChoices} ${styles.plateModeChoices}`} role="group" aria-label="Como prefere descrever sua placa?" data-invalid={error?.field === "plateMode"}>
                <button id="quote-plate-quick-mode" type="button" onClick={() => choosePlateMode("quick")}>
                  <span className={styles.boxModeCopy}>
                    <span>01 · Pedido rápido</span>
                    <strong>Foto ou descrição</strong>
                    <small>Envie uma referência, descreva a placa ou faça os dois.</small>
                  </span>
                </button>
                <button type="button" onClick={() => choosePlateMode("detailed")}>
                  <span className={styles.boxModeCopy}>
                    <span>02 · Mais detalhes</span>
                    <strong>Montar passo a passo</strong>
                    <small>Defina conteúdo, uso, medidas, cores e quantidade em sequência.</small>
                  </span>
                </button>
              </div> : null}
              {!draft.plateMode ? <InlineError error={error} field="plateMode" /> : null}
              {draft.plateMode === "quick" ? (
                <>
                  <FilePicker id="references" label="Envie uma foto de referência, se tiver" accept=".png,.jpg,.jpeg,.webp,.pdf" files={files.references} multiple onAdd={addFiles} onRemove={removeFile} error={error} />
                  <div className={styles.field}>
                    <label htmlFor="plate-quick-description">O que você quer criar?</label>
                    <textarea id="plate-quick-description" className={styles.quickDescription} maxLength={2000} value={draft.plateQuickDescription} aria-invalid={error?.field === "plateQuickDescription"} onChange={(event) => update("plateQuickDescription", event.target.value)} placeholder="Ex.: quero uma placa azul com meu logotipo e QR Code." />
                    <small>Pode escrever do seu jeito. Uma foto ou uma descrição já basta para continuar.</small>
                    <InlineError error={error} field="plateQuickDescription" />
                  </div>
                </>
              ) : null}
              {draft.plateMode === "detailed" ? (
                <>
                  {plateDetailStep === 0 ? (
                    <>
                      <div className={`${styles.field} ${draft.plateContentUnknown ? styles.fieldSkipped : ""}`}>
                        <div className={styles.fieldHeading}>
                          <span className={styles.fieldLabel}>O que vai na placa?</span>
                          <button className={styles.skipButton} type="button" aria-pressed={draft.plateContentUnknown} onClick={() => update("plateContentUnknown", !draft.plateContentUnknown)}>Ainda não decidi</button>
                        </div>
                        <p className={styles.fieldHint}>Pode escolher mais de uma opção.</p>
                        <div className={styles.choiceButtons} role="group" aria-label="Conteúdo da placa">
                          {["Nome ou frase", "Logotipo", "QR Code"].map((item) => <button type="button" key={item} disabled={draft.plateContentUnknown} aria-pressed={draft.plateContents.includes(item)} onClick={() => toggleList("plateContents", item)}>{item}</button>)}
                        </div>
                        <InlineError error={error} field="plateContents" />
                      </div>
                      {!draft.plateContentUnknown && draft.plateContents.includes("Nome ou frase") ? <div className={styles.field}><label htmlFor="plate-text">Qual texto vai na placa?</label><input id="plate-text" type="text" maxLength={2000} value={draft.plateText} aria-invalid={error?.field === "plateText"} onChange={(event) => update("plateText", event.target.value)} placeholder="Digite o nome ou a frase" /><InlineError error={error} field="plateText" /></div> : null}
                      {!draft.plateContentUnknown && draft.plateContents.includes("Logotipo") ? <FilePicker id="logo" label="Envie seu logotipo, se já tiver" accept=".png,.jpg,.jpeg,.webp,.pdf" files={files.logo} onAdd={addFiles} onRemove={removeFile} error={error} /> : null}
                      {!draft.plateContentUnknown && draft.plateContents.includes("QR Code") ? (
                        <>
                          <QrSourcePicker name="plate" value={draft.plateQrSource} onChange={(value) => update("plateQrSource", value)} error={error} />
                          {draft.plateQrSource === "content" ? <div className={styles.field}><label htmlFor="plate-qr">O que o QR Code deve exibir?</label><input id="plate-qr" type="text" maxLength={2000} value={draft.plateQrContent} aria-invalid={error?.field === "plateQrContent"} onChange={(event) => update("plateQrContent", event.target.value)} placeholder="Link ou texto" /><InlineError error={error} field="plateQrContent" /></div> : null}
                          {draft.plateQrSource === "file" ? <FilePicker id="qr" label="Anexe seu QR Code pronto" accept=".png,.jpg,.jpeg,.webp,.pdf" files={files.qr} onAdd={addFiles} onRemove={removeFile} error={error} /> : null}
                        </>
                      ) : null}
                    </>
                  ) : null}
                  {plateDetailStep === 1 ? (
                    <>
                      <div className={`${styles.field} ${draft.plateUseUnknown ? styles.fieldSkipped : ""}`}>
                        <div className={styles.fieldHeading}>
                          <span className={styles.fieldLabel}>Onde a placa será usada?</span>
                          <button className={styles.skipButton} type="button" aria-pressed={draft.plateUseUnknown} onClick={() => update("plateUseUnknown", !draft.plateUseUnknown)}>Ainda não sei</button>
                        </div>
                        <div className={styles.choiceButtons} role="group" aria-label="Uso da placa">
                          {["Balcão", "Mesa", "Parede", "Outro lugar"].map((value) => <button type="button" key={value} disabled={draft.plateUseUnknown} aria-pressed={draft.plateUse === value} onClick={() => update("plateUse", value)}>{value}</button>)}
                        </div>
                        <InlineError error={error} field="plateUse" />
                      </div>
                      <div className={`${styles.field} ${draft.plateFixationUnknown ? styles.fieldSkipped : ""}`}>
                        <div className={styles.fieldHeading}>
                          <label htmlFor="plate-fixation">Como pretende colocar a placa?</label>
                          <button className={styles.skipButton} type="button" aria-pressed={draft.plateFixationUnknown} onClick={() => update("plateFixationUnknown", !draft.plateFixationUnknown)}>Ainda não sei</button>
                        </div>
                        <input id="plate-fixation" type="text" maxLength={2000} value={draft.plateFixation} disabled={draft.plateFixationUnknown} aria-invalid={error?.field === "plateFixation"} onChange={(event) => update("plateFixation", event.target.value)} placeholder="Apoiada, pendurada, fixada..." />
                        <InlineError error={error} field="plateFixation" />
                      </div>
                    </>
                  ) : null}
                  {plateDetailStep === 2 ? <DimensionFields id="plate" value={draft.plateDimensions} onChange={(dimension, value) => updateDimension("plateDimensions", dimension, value)} unknown={draft.plateUnknown} onUnknown={(value) => update("plateUnknown", value)} error={error} /> : null}
                </>
              ) : null}
            </>
          ) : null}

          {draft.type === "arquivo" && multiModelEnabled ? (
            <>
              <div className={styles.modelCollection}>
                <div className={styles.modelCollectionHeading}>
                  <div>
                    <h3>Adicione seus modelos</h3>
                    <p>Envie vários links do MakerWorld/Bambu Handy ou arquivos STL/3MF no mesmo pedido. Cada modelo pode ter uma cor, tamanho e quantidade diferente.</p>
                  </div>
                  <span className={styles.modelCounter}>{draft.modelItems.length} de {MODEL_ITEM_LIMIT} modelos</span>
                </div>
                <div className={styles.field}>
                  <label htmlFor="quote-model-links">Cole links dos modelos, um por linha</label>
                  <textarea id="quote-model-links" className={styles.modelLinksInput} rows={3}
                    value={modelLinksInput} onChange={event => setModelLinksInput(event.target.value)}
                    maxLength={8000}
                    placeholder={"https://makerworld.com/pt/models/12345\nhttps://makerworld.com/pt/models/67890"}
                    aria-invalid={error?.field === "modelLinks"} />
                  <button className={styles.modelAddAction} type="button" disabled={!modelLinksInput.trim() || draft.modelItems.length >= MODEL_ITEM_LIMIT}
                    onClick={addModelLinks}>Adicionar links à lista</button>
                  <InlineError error={error} field="modelLinks" />
                </div>
                <div className={styles.field}>
                  <label htmlFor="quote-model-files">Ou adicione arquivos STL/3MF</label>
                  <input id="quote-model-files" className={styles.fileInput} type="file" accept=".stl,.3mf" multiple
                    disabled={draft.modelItems.length >= MODEL_ITEM_LIMIT ||
                      draft.modelItems.filter(item => item.source === "file").length >= QUOTE_FILE_POLICY.maxFiles}
                    onChange={event => { addModelFiles(Array.from(event.target.files ?? [])); event.target.value = ""; }} />
                  <p className={styles.fieldHint}>Até 5 arquivos no pedido inteiro. Arquivos 3D: 30 MB cada. Total de anexos: 50 MB. Os links não ocupam armazenamento. Se precisar enviar mais arquivos ou maiores, fale com o Estúdio para uma análise manual.</p>
                  <InlineError error={error} field="modelFiles" />
                  <InlineError error={error} field="modelItems" />
                </div>
                {draft.modelItems.length ? (
                  <ol className={styles.modelList} aria-label="Modelos do orçamento">
                    {draft.modelItems.map((item, index) => (
                      <li className={styles.modelItem} key={item.id}>
                        <div className={styles.modelItemHeader}>
                          <div>
                            <strong>Modelo {String(index + 1).padStart(2, "0")}</strong>
                            {item.title?.trim() ? <span>{item.title.trim()}</span> : null}
                            <span>{item.source === "link" ? "Link do modelo" : item.fileName}</span>
                          </div>
                          <div className={styles.modelItemActions}>
                            <button type="button" className={styles.modelMove} aria-label={`Mover modelo ${index + 1} para cima`}
                              disabled={index === 0} onClick={() => moveModelItem(item.id, -1)}>↑</button>
                            <button type="button" className={styles.modelMove} aria-label={`Mover modelo ${index + 1} para baixo`}
                              disabled={index === draft.modelItems.length - 1} onClick={() => moveModelItem(item.id, 1)}>↓</button>
                            <button type="button" className={styles.modelEdit} aria-label={`Editar modelo ${index + 1}`}
                              onClick={() => document.getElementById(item.source === "link" ? `model-url-${item.id}` : `model-quantity-${item.id}`)?.focus()}>Editar</button>
                            <button type="button" className={styles.modelRemove} aria-label={`Remover modelo ${index + 1}`}
                              onClick={() => removeModelItem(item.id)}>Remover</button>
                          </div>
                        </div>
                        {item.source === "link" ? (
                          <div className={styles.field}>
                            <label htmlFor={`model-url-${item.id}`}>Link</label>
                            <input id={`model-url-${item.id}`} type="url" value={item.link} maxLength={MODEL_LINK_MAX_LENGTH}
                              aria-invalid={error?.field === `model-${item.id}`}
                              onChange={event => changeModelItem(item.id, { link: event.target.value })} />
                            {validModelLink(item.link) ? <a href={item.link.trim()} target="_blank" rel="noopener noreferrer" className={styles.modelExternal}>Abrir modelo em outra aba</a> : <small>Confira o link HTTPS do MakerWorld/Bambu Handy.</small>}
                            {draft.modelItems.filter(other => other.id !== item.id && other.source === "link" && other.link.trim() === item.link.trim()).length > 0 ? <small>Este link também aparece em outro item. Você pode manter configurações diferentes.</small> : null}
                          </div>
                        ) : (
                          <div className={styles.field}>
                            <label htmlFor={`model-reupload-${item.id}`}>
                              {modelFiles[item.id] ? `Substituir arquivo ${item.fileName}` : `Anexe novamente ${item.fileName}`}
                            </label>
                            <input id={`model-reupload-${item.id}`} type="file" className={styles.fileInput} accept=".stl,.3mf"
                              onChange={event => { const file = event.target.files?.[0]; if (file) replaceModelFile(item.id, file); event.target.value = ""; }} />
                            {!modelFiles[item.id] ? <small>O navegador não preserva arquivos após recarregar a página.</small> : null}
                          </div>
                        )}
                        <div className={styles.field}>
                          <label htmlFor={`model-title-${item.id}`}>Nome do modelo (opcional)</label>
                          <input id={`model-title-${item.id}`} type="text" maxLength={MODEL_TITLE_MAX_LENGTH}
                            value={item.title ?? ""} onChange={event => changeModelItem(item.id, { title: event.target.value })}
                            placeholder="Ex.: suporte da luminária" />
                        </div>
                        <div className={styles.modelItemGrid}>
                          <div className={styles.field}>
                            <label htmlFor={`model-quantity-${item.id}`}>Quantidade</label>
                            <input id={`model-quantity-${item.id}`} type="number" min={1} max={10000} inputMode="numeric"
                              value={item.quantity} onChange={event => changeModelItem(item.id,
                                { quantity: Math.max(1, Math.min(10000, Math.floor(Number(event.target.value) || 1))) })} />
                          </div>
                          <div className={styles.field}>
                            <label htmlFor={`model-scale-${item.id}`}>Tamanho</label>
                            <select id={`model-scale-${item.id}`} value={item.scale}
                              onChange={event => changeModelItem(item.id, { scale: event.target.value as ModelItem["scale"] })}>
                              <option value="original">Tamanho original</option>
                              <option value="alterar">Alterar medidas</option>
                              <option value="nao-sei">Ainda não sei</option>
                            </select>
                          </div>
                          <div className={styles.field}>
                            <label htmlFor={`model-colors-${item.id}`}>Cores</label>
                            <select id={`model-colors-${item.id}`} value={item.colorMode}
                              onChange={event => {
                                setOpenModelColorMenu(null);
                                changeModelItem(item.id, {
                                  colorMode: event.target.value as ModelItem["colorMode"],
                                  colors: event.target.value === "tenho" ? item.colors.length ? item.colors : [{ name: "", rgb: "" }] : [],
                                });
                              }}>
                              <option value="indeciso">Ainda não decidi</option>
                              <option value="tenho">Escolher cores</option>
                            </select>
                          </div>
                        </div>
                        {item.scale === "alterar" ? (
                          <div className={styles.modelItemGrid}>
                            {(["width", "depth", "height"] as const).map((dimension) => (
                              <div className={styles.field} key={dimension}>
                                <label htmlFor={`model-${item.id}-${dimension}`}>{dimension === "width" ? "Largura" : dimension === "depth" ? "Profundidade" : "Altura"} (cm)</label>
                                <input id={`model-${item.id}-${dimension}`} type="text" inputMode="decimal" maxLength={24}
                                  value={item.dimensions[dimension]} onChange={event => changeModelItem(item.id,
                                    { dimensions: { ...item.dimensions, [dimension]: event.target.value } })} placeholder="Ex.: 12" />
                              </div>
                            ))}
                          </div>
                        ) : null}
                        {item.colorMode === "tenho" ? (
                          <div className={styles.modelColorList}>
                            {item.colors.map((color, colorIndex) => (
                              <div className={styles.modelColorEntry} key={colorIndex}>
                                <input id={`model-color-${item.id}-${colorIndex}`} type="text" list="quote-model-color-suggestions" maxLength={48}
                                  aria-label={`Modelo ${index + 1}, cor ${colorIndex + 1}`}
                                  value={color.name} placeholder={`Cor ${colorIndex + 1}, ex.: branco`}
                                  onChange={event => changeModelItem(item.id, { colors: item.colors.map((current, i) =>
                                    i === colorIndex ? { name: event.target.value, rgb: "" } : current) })} />
                                <div className={styles.modelColorPicker}
                                  onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setOpenModelColorMenu(null); }}
                                  onKeyDown={event => {
                                    if (event.key === "Escape" && openModelColorMenu === `${item.id}:${colorIndex}`) {
                                      setOpenModelColorMenu(null);
                                      document.getElementById(`model-color-picker-${item.id}-${colorIndex}`)?.focus();
                                    }
                                  }}>
                                  <button id={`model-color-picker-${item.id}-${colorIndex}`} className={styles.colorPickerButton}
                                    type="button" aria-label={`Escolher cor ${colorIndex + 1} do modelo ${index + 1}`}
                                    aria-expanded={openModelColorMenu === `${item.id}:${colorIndex}`}
                                    aria-controls={openModelColorMenu === `${item.id}:${colorIndex}` ? `model-color-menu-${item.id}-${colorIndex}` : undefined}
                                    onClick={() => setOpenModelColorMenu(openModelColorMenu === `${item.id}:${colorIndex}` ? null : `${item.id}:${colorIndex}`)}>
                                    <span className={styles.colorPickerPreview} style={color.rgb ? { background: color.rgb } : undefined} aria-hidden="true" />
                                  </button>
                                  {openModelColorMenu === `${item.id}:${colorIndex}` ? (
                                    <div className={styles.colorMenu} id={`model-color-menu-${item.id}-${colorIndex}`}
                                      role="group" aria-label={`Cores para o modelo ${index + 1}, cor ${colorIndex + 1}`}>
                                      <span className={styles.colorMenuTitle}>Escolha uma cor</span>
                                      <div className={styles.colorMenuGrid}>
                                        {colorOptions.map(option => (
                                          <button key={option.name} className={styles.colorMenuOption} type="button"
                                            title={option.name} aria-label={`Selecionar ${option.name} para o modelo ${index + 1}, cor ${colorIndex + 1}`}
                                            aria-pressed={color.rgb === option.rgb}
                                            onClick={() => {
                                              changeModelItem(item.id, { colors: item.colors.map((current, i) =>
                                                i === colorIndex ? { name: option.name, rgb: option.rgb } : current) });
                                              setOpenModelColorMenu(null);
                                              document.getElementById(`model-color-picker-${item.id}-${colorIndex}`)?.focus();
                                            }}>
                                            <span className={styles.colorSwatch} style={{ backgroundColor: option.rgb }} aria-hidden="true" />
                                            <span>{option.name}</span>
                                          </button>
                                        ))}
                                      </div>
                                    </div>
                                  ) : null}
                                </div>
                                {item.colors.length > 1 ? <button type="button" aria-label={`Remover cor ${colorIndex + 1} do modelo ${index + 1}`}
                                  onClick={() => {
                                    setOpenModelColorMenu(null);
                                    changeModelItem(item.id, { colors: item.colors.filter((_, i) => i !== colorIndex) });
                                  }}>×</button> : null}
                              </div>
                            ))}
                            {item.colors.length < 4 ? <button type="button" className={styles.modelTextAction} onClick={() =>
                              changeModelItem(item.id, { colors: [...item.colors, { name: "", rgb: "" }] })}>+ Outra cor</button> : null}
                          </div>
                        ) : null}
                        <div className={styles.field}>
                          <label htmlFor={`model-note-${item.id}`}>Observações deste modelo (opcional)</label>
                          <input id={`model-note-${item.id}`} type="text" maxLength={MODEL_NOTES_MAX_LENGTH}
                            value={item.notes} onChange={event => changeModelItem(item.id, { notes: event.target.value })}
                            placeholder="Ex.: precisa encaixar em outra peça" />
                        </div>
                        <InlineError error={error} field={`model-${item.id}`} />
                      </li>
                    ))}
                  </ol>
                ) : <p className={styles.modelEmpty}>Seus modelos aparecerão aqui. Pode colar 10 ou 15 links de uma vez.</p>}
                <datalist id="quote-model-color-suggestions">{colorOptions.map(color => <option key={color.name} value={color.name} />)}</datalist>
              </div>
              {draft.modelItems.length > 1 ? (
                <div className={styles.modelDefaults}>
                  <h3>Aplicar as mesmas preferências a todos</h3>
                  <p>Use as escolhas de tamanho e cores abaixo como padrão. Cada modelo poderá ser editado individualmente depois.</p>
                  <div className={styles.choiceButtons} role="group" aria-label="Tamanho padrão">
                    {[["original", "Manter tamanho original"], ["alterar", "Informar medidas"]].map(([value, label]) =>
                      <button type="button" key={value} aria-pressed={!draft.modelScaleUnknown && draft.modelScale === value}
                        onClick={() => { update("modelScale", value); update("modelScaleUnknown", false); }}>{label}</button>)}
                    <button type="button" aria-pressed={draft.modelScaleUnknown} onClick={() => update("modelScaleUnknown", !draft.modelScaleUnknown)}>Não sei</button>
                  </div>
                  {draft.modelScale === "alterar" && !draft.modelScaleUnknown ?
                    <DimensionFields id="model" value={draft.modelDimensions} onChange={(dimension, value) =>
                      updateDimension("modelDimensions", dimension, value)} unknown={false}
                      onUnknown={() => undefined} allowUnknown={false} depth error={error} /> : null}
                </div>
              ) : null}
            </>
          ) : null}

          {draft.type === "arquivo" && !multiModelEnabled ? (
            <>
              <div className={styles.field}>
                <span id="model-source-label" className={styles.fieldLabel}>Como quer enviar o modelo?</span>
                <div className={styles.qrSourceChoices} role="radiogroup" aria-labelledby="model-source-label">
                  <label><input type="radio" name="model-source" checked={draft.modelSource === "file"} onChange={() => { update("modelSource", "file"); update("modelLink", ""); }} /><span>Enviar arquivo 3D</span></label>
                  <label><input type="radio" name="model-source" checked={draft.modelSource === "link"} onChange={() => { update("modelSource", "link"); setFiles(current => ({ ...current, model: [] })); }} /><span>Informar link do modelo</span></label>
                </div>
              </div>
              {draft.modelSource === "file" ? <FilePicker id="model" label="Envie seu arquivo 3D" accept=".stl,.3mf" files={files.model} onAdd={addFiles} onRemove={removeFile} error={error} /> :
                <div className={styles.field}>
                  <label htmlFor="model-link">Link do modelo no MakerWorld ou Bambu Handy</label>
                  <input id="model-link" type="url" maxLength={2000} value={draft.modelLink} aria-invalid={error?.field === "modelLink"} onChange={event => update("modelLink", event.target.value)} placeholder="https://makerworld.com/en/models/..." />
                  <InlineError error={error} field="modelLink" />
                </div>}
              <div className={styles.field}>
                <div className={styles.fieldHeading}>
                  <span className={styles.fieldLabel}>Quer alterar o tamanho?</span>
                  <button className={styles.skipButton} type="button" aria-pressed={draft.modelScaleUnknown} onClick={() => update("modelScaleUnknown", !draft.modelScaleUnknown)}>Não sei</button>
                </div>
                <div className={styles.choiceButtons} role="group" aria-label="Tamanho da impressão">
                  {[["original", "Manter original"], ["alterar", "Informar outro tamanho"]].map(([value, label]) =>
                    <button type="button" key={value} disabled={draft.modelScaleUnknown} aria-pressed={draft.modelScale === value} onClick={() => update("modelScale", value)}>{label}</button>)}
                </div>
                <InlineError error={error} field="modelScale" />
              </div>
              {!draft.modelScaleUnknown && draft.modelScale === "alterar" ? <DimensionFields id="model" value={draft.modelDimensions} onChange={(dimension, value) => updateDimension("modelDimensions", dimension, value)} unknown={false} onUnknown={() => undefined} allowUnknown={false} depth error={error} /> : null}
              <div className={styles.field}><label htmlFor="model-notes">Alguma exigência importante? <small>Opcional</small></label><textarea id="model-notes" maxLength={2000} value={draft.modelNotes} onChange={event => update("modelNotes", event.target.value)} placeholder="Ex.: encaixe, resistência ou outra observação." /></div>
            </>
          ) : null}

          {draft.type === "outro" ? (
            <>
              <div className={styles.field}>
                <label htmlFor="other-description">{draft.studioPhotoId || draft.productSlug ? "O que você quer mudar nesta peça?" : "O que você gostaria de criar?"}</label>
                <textarea
                  id="other-description"
                  maxLength={2000}
                  value={draft.otherDescription}
                  aria-invalid={error?.field === "otherDescription"}
                  onChange={(event) => update("otherDescription", event.target.value)}
                  placeholder={draft.studioPhotoId || draft.productSlug ? "Ex.: quero esta peça em outra medida ou com meu nome." : "Pode explicar do seu jeito, sem termos técnicos."}
                />
                <InlineError error={error} field="otherDescription" />
              </div>
              <div className={styles.field}><label htmlFor="other-size">Sabe o tamanho aproximado? <small>Opcional</small></label><input id="other-size" type="text" maxLength={2000} value={draft.otherSize} onChange={(event) => update("otherSize", event.target.value)} placeholder="Escreva o que souber" /></div>
            </>
          ) : null}

          {(draft.type === "placa" && draft.plateMode === "detailed" && plateDetailStep === 3) || draft.type === "outro" ? <FilePicker id="references" label="Tem fotos, desenhos ou referências? (opcional)" accept=".png,.jpg,.jpeg,.webp,.pdf" files={files.references} multiple onAdd={addFiles} onRemove={removeFile} error={error} /> : null}

          {showingColorChoices ? (
            <div className={`${styles.field} ${draft.colorMode === "indeciso" ? styles.fieldSkipped : ""}`}>
              <div className={styles.fieldHeading}>
                <span className={styles.fieldLabel}>{draft.type === "arquivo" ? "Quais cores quer aplicar em todos os modelos?" : "Quais cores você prefere?"}</span>
                <button className={styles.skipButton} type="button" aria-pressed={draft.colorMode === "indeciso"} onClick={() => { setOpenColorMenu(null); update("colorMode", draft.colorMode === "indeciso" ? (draft.colors.some(hasColor) ? "tenho" : "") : "indeciso"); }}>Ainda não decidi</button>
              </div>
              <p className={styles.fieldHint}>Escolha até 4 cores no menu ao lado de cada campo ou escreva o nome. A disponibilidade será confirmada no orçamento.</p>
              <div className={styles.colorsList}>
                {draft.colors.map((color, index) => (
                  <div className={styles.colorEntry} key={index}>
                    <div className={styles.colorRow}>
                      <input type="text" maxLength={80} aria-label={`Cor ${index + 1} por nome`} value={color.name} disabled={draft.colorMode === "indeciso"} aria-invalid={error?.field === "colors" && !hasColor(color)} onChange={(event) => updateColor(index, { name: event.target.value, rgb: "" })} placeholder={`Cor ${index + 1}: ex. preto ou vermelho`} />
                      {index > 0 && draft.colorMode !== "indeciso" ? <button className={styles.colorRemove} type="button" aria-label={`Remover cor ${index + 1}`} onClick={() => removeColor(index)}>×</button> : null}
                      <div
                        className={styles.colorPicker}
                        onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setOpenColorMenu(null); }}
                        onKeyDown={(event) => {
                          if (event.key === "Escape" && openColorMenu === index) {
                            setOpenColorMenu(null);
                            colorPickerButtons.current[index]?.focus();
                          }
                        }}
                      >
                        <button
                          ref={(node) => { colorPickerButtons.current[index] = node; }}
                          className={styles.colorPickerButton}
                          type="button"
                          aria-label={`Escolher a cor ${index + 1}`}
                          aria-expanded={openColorMenu === index}
                          aria-controls={openColorMenu === index ? `color-menu-${index}` : undefined}
                          disabled={draft.colorMode === "indeciso"}
                          title="Abrir cores"
                          onClick={() => setOpenColorMenu(openColorMenu === index ? null : index)}
                        >
                          <span className={styles.colorPickerPreview} style={color.rgb ? { background: color.rgb } : undefined} aria-hidden="true" />
                        </button>
                        {openColorMenu === index ? (
                          <div className={styles.colorMenu} id={`color-menu-${index}`} role="group" aria-label={`Cores para a cor ${index + 1}`}>
                            <span className={styles.colorMenuTitle}>Escolha uma cor</span>
                            <div className={styles.colorMenuGrid}>
                              {colorOptions.map((option) => (
                                <button
                                  key={option.name}
                                  className={styles.colorMenuOption}
                                  type="button"
                                  title={option.name}
                                  aria-label={`Selecionar ${option.name} para a cor ${index + 1}`}
                                  aria-pressed={color.rgb === option.rgb}
                                  onClick={() => {
                                    updateColor(index, { name: option.name, rgb: option.rgb });
                                    setOpenColorMenu(null);
                                    colorPickerButtons.current[index]?.focus();
                                  }}
                                >
                                  <span className={styles.colorSwatch} style={{ backgroundColor: option.rgb }} aria-hidden="true" />
                                  <span>{option.name}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        ) : null}
                      </div>
                      {index === draft.colors.length - 1 && draft.colors.length < 4 && draft.colorMode !== "indeciso" ? <button className={styles.colorAdd} type="button" aria-label="Adicionar outra cor" onClick={addColor}>+</button> : null}
                    </div>
                  </div>
                ))}
              </div>
              <InlineError error={error} field="colors" />
            </div>
          ) : null}

          {draft.type === "arquivo" && draft.modelItems.length > 1 ? (
            <div className={styles.modelDefaultsAction}>
              <button className={styles.modelAddAction} type="button" onClick={applyModelDefaults}>Aplicar tamanho e cores a todos os modelos</button>
              <p>Esta ação substitui as preferências individuais atuais. Você pode alterar cada modelo depois.</p>
            </div>
          ) : null}
          {showingQuantity ? <QuantityPicker value={draft.quantity} onChange={(value) => update("quantity", value)} error={error} /> : null}
          {showingFilePolicy ? <p className={styles.filePolicy}>Os arquivos permanecem privados e precisam ser reenviados se a página for atualizada. {quoteFilePolicyLabel()}.</p> : null}
          {reviewEdit === "details" ? (
            <div className={styles.actions}>
              <button type="button" className={styles.secondaryAction} onClick={cancelReviewEdit}>Cancelar alteração</button>
              <button type="button" className={styles.primaryAction} onClick={saveReviewEdit}>Salvar e voltar ao resumo</button>
            </div>
          ) : draft.type === "caixa" ? (
            <div className={styles.actions}>
              <button type="button" className={styles.secondaryAction} onClick={() => { if (draft.boxMode === "detailed" && boxDetailStep > 0) setBoxDetailStep(boxDetailStep - 1); else if (draft.boxMode) update("boxMode", ""); else edit(1); }}><span aria-hidden="true">←</span> Voltar</button>
              {draft.boxMode ? <button type="button" className={styles.primaryAction} onClick={draft.boxMode === "detailed" ? advanceBoxDetail : continueToContact}>Continuar <span aria-hidden="true">→</span></button> : null}
            </div>
          ) : draft.type === "placa" ? (
            <div className={styles.actions}>
              <button type="button" className={styles.secondaryAction} onClick={() => { if (draft.plateMode === "detailed" && plateDetailStep > 0) setPlateDetailStep(plateDetailStep - 1); else if (draft.plateMode) update("plateMode", ""); else edit(1); }}><span aria-hidden="true">←</span> Voltar</button>
              {draft.plateMode ? <button type="button" className={styles.primaryAction} onClick={draft.plateMode === "detailed" ? advancePlateDetail : continueToContact}>Continuar <span aria-hidden="true">→</span></button> : null}
            </div>
          ) : <div className={styles.actions}><button type="button" className={styles.secondaryAction} onClick={() => edit(1)}><span aria-hidden="true">←</span> Voltar</button><button type="button" className={styles.primaryAction} onClick={continueToContact}>Continuar <span aria-hidden="true">→</span></button></div>}
        </div>
      ) : null}

      {step === 3 && !reviewing ? (
        <div className={styles.formPanel}>
          {reviewEdit !== "delivery" ? <>
          <div className={styles.field}><label htmlFor="quote-name">Qual é o seu nome?</label><input id="quote-name" type="text" autoComplete="name" maxLength={160} value={draft.name} aria-invalid={error?.field === "name"} onChange={(event) => update("name", event.target.value)} placeholder="Seu nome" /><InlineError error={error} field="name" /></div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Como prefere que a gente entre em contato?</span>
            <div className={styles.choiceButtons} role="group" aria-label="Canal de contato">
              <button type="button" aria-pressed={draft.contactMethod === "whatsapp"} onClick={() => chooseContactMethod("whatsapp")}>WhatsApp</button>
              <button type="button" aria-pressed={draft.contactMethod === "email"} onClick={() => chooseContactMethod("email")}>E-mail</button>
            </div>
          </div>
          <div className={styles.field}><label htmlFor="quote-contact">Seu {draft.contactMethod === "whatsapp" ? "WhatsApp" : "e-mail"}</label><input id="quote-contact" type={draft.contactMethod === "email" ? "email" : "tel"} inputMode={draft.contactMethod === "email" ? "email" : "tel"} autoComplete={draft.contactMethod === "email" ? "email" : "tel"} maxLength={320} value={draft.contact} aria-invalid={error?.field === "contact"} onChange={(event) => changeContact(event.target.value)} placeholder={draft.contactMethod === "email" ? "voce@exemplo.com" : "(00) 00000-0000"} /><InlineError error={error} field="contact" /></div>
          </> : null}
          {reviewEdit !== "contact" ? <>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Como prefere receber seu pedido?</span>
            <div className={styles.choiceButtons} role="group" aria-label="Entrega do pedido">
              <button type="button" aria-pressed={draft.delivery === "retirada"} onClick={() => update("delivery", "retirada")}>Retirar em São Caetano do Sul</button>
              <button type="button" aria-pressed={draft.delivery === "envio"} onClick={() => update("delivery", "envio")}>Receber em casa</button>
            </div>
            <InlineError error={error} field="delivery" />
          </div>
          {draft.delivery === "envio" ? <div className={styles.field}><label htmlFor="quote-cep">Qual é o seu CEP?</label><input id="quote-cep" type="text" inputMode="numeric" autoComplete="postal-code" value={draft.cep} aria-invalid={error?.field === "cep"} onChange={(event) => update("cep", event.target.value)} placeholder="00000-000" /><small>Depois de analisar o pedido, combinaremos a forma de envio.</small><InlineError error={error} field="cep" /></div> : null}
          <div className={styles.field}>
            <label htmlFor="quote-desired-date">Precisa para alguma data?</label>
            <div className={styles.choiceButtons} role="group" aria-label="Prazo desejado">
              <button type="button" aria-pressed={!draft.desiredDate} onClick={() => update("desiredDate", "")}>Não tenho data</button>
            </div>
            <input id="quote-desired-date" type="date" min={saoPauloToday()} value={draft.desiredDate} aria-invalid={error?.field === "desiredDate"} onChange={(event) => update("desiredDate", event.target.value)} />
            <small>Vamos verificar se conseguimos atender essa data junto com o orçamento. Para envio, considere a data em que deseja receber.</small>
            <InlineError error={error} field="desiredDate" />
          </div>
          </> : null}
          {reviewEdit ? (
            <div className={styles.actions}><button type="button" className={styles.secondaryAction} onClick={cancelReviewEdit}>Cancelar alteração</button><button type="button" className={styles.primaryAction} onClick={saveReviewEdit}>Salvar e voltar ao resumo</button></div>
          ) : <div className={styles.actions}><button type="button" className={styles.secondaryAction} onClick={() => edit(2)}><span aria-hidden="true">←</span> Voltar</button><button type="button" className={styles.primaryAction} onClick={reviewRequest}>Conferir pedido <span aria-hidden="true">→</span></button></div>}
        </div>
      ) : null}

      {step === 3 && reviewing ? (
        <div className={styles.formPanel}>
          <section className={styles.reviewSection} aria-labelledby="review-details-title" inert={sending || submissionLocked}>
            <h3 id="review-details-title">{reviewingMultiModel ? "Seus modelos" : "Sua peça"}</h3>
            <dl className={styles.summary}>
              <SummaryRow label="Tipo" value={projectOptions.find((option) => option.value === draft.type)?.title ?? "Não informado"} onEdit={() => edit(1)} />
              {draft.type === "caixa" && draft.boxMode === "quick" ? <SummaryRow label="Descrição" value={draft.boxQuickDescription.trim() || "Descrita pela referência"} onEdit={() => beginReviewEdit("details")} /> : null}
              {draft.type === "caixa" && draft.boxMode === "detailed" ? <>
                <SummaryRow label="Formato" value={boxShapeText(draft)} onEdit={() => beginReviewEdit("details", 0)} />
                <SummaryRow label="Divisórias" value={boxDividersText(draft)} onEdit={() => beginReviewEdit("details", 1)} />
                <SummaryRow label="Medidas" value={`${dimensionsText(draft.boxDimensions, draft.boxUnknown, true)}${!draft.boxUnknown && draft.boxBasis ? ` · ${draft.boxBasis === "nao-sei" ? "Internas/externas a definir" : `Medidas ${draft.boxBasis}`}` : ""}`} onEdit={() => beginReviewEdit("details", 2)} />
                <SummaryRow label="Personalização" value={boxPersonalizationText(draft)} onEdit={() => beginReviewEdit("details", 3)} />
                <SummaryRow label="Fechamento" value={boxClosureText(draft.boxShape)} />
              </> : null}
              {draft.type === "placa" && draft.plateMode === "quick" ? <SummaryRow label="Descrição" value={draft.plateQuickDescription.trim() || "Descrita pela referência"} onEdit={() => beginReviewEdit("details")} /> : null}
              {draft.type === "placa" && draft.plateMode === "detailed" ? <>
                <SummaryRow label="Conteúdo" value={plateContentsText(draft)} onEdit={() => beginReviewEdit("details", 0)} />
                <SummaryRow label="Uso" value={draft.plateUseUnknown ? "A definir" : draft.plateUse} onEdit={() => beginReviewEdit("details", 1)} />
                <SummaryRow label="Colocação" value={draft.plateFixationUnknown ? "A definir" : draft.plateFixation.trim()} onEdit={() => beginReviewEdit("details", 1)} />
                <SummaryRow label="Medidas" value={dimensionsText(draft.plateDimensions, draft.plateUnknown)} onEdit={() => beginReviewEdit("details", 2)} />
              </> : null}
              {reviewingMultiModel ? <>
                <SummaryRow label="Total" value={`${draft.modelItems.length} modelos · ${quantitySummary}`} onEdit={() => beginReviewEdit("details")} />
                {draft.modelItems.map((item, index) => (
                  <div className={styles.modelReviewEntry} key={item.id}>
                    {item.title?.trim() ? <SummaryRow label="Nome" value={item.title.trim()}
                      onEdit={() => beginReviewEdit("details", 0, `model-title-${item.id}`)} /> : null}
                    <SummaryRow label={`Modelo ${String(index + 1).padStart(2, "0")}`}
                      value={item.source === "link" ? item.link :
                        modelFiles[item.id]?.name ??
                          pendingConfirmation?.attachments.find(file => file.modelItemId === item.id)?.name ??
                          `${item.fileName} (reanexar arquivo)`}
                      url={item.source === "link" && validModelLink(item.link) ? item.link : undefined}
                      onEdit={() => beginReviewEdit("details", 0, item.source === "link" ? `model-url-${item.id}` : `model-reupload-${item.id}`)} />
                    <SummaryRow label="Configuração"
                      value={`${item.quantity} un. · ${item.colorMode === "indeciso" ? "cores a definir" : item.colors.map(colorText).join(", ")} · ${item.scale === "nao-sei" ? "tamanho a definir" : item.scale === "alterar" ? dimensionsText(item.dimensions, false, true) : "tamanho original"}${item.notes.trim() ? ` · ${item.notes.trim()}` : ""}`}
                      onEdit={() => beginReviewEdit("details", 0, `model-quantity-${item.id}`)} />
                  </div>
                ))}
              </> : null}
              {draft.type === "arquivo" && !reviewingMultiModel ? <>
                {draft.modelSource === "link" && validModelLink(draft.modelLink) ? <SummaryRow label="Link do modelo" value={draft.modelLink.trim()} url={draft.modelLink.trim()} onEdit={() => beginReviewEdit("details")} /> :
                  <SummaryRow label="Arquivo 3D" value={files.model[0]?.name ?? pendingConfirmation?.attachments.find(file => file.role === "model")?.name ?? "Pendente de anexo"} onEdit={() => beginReviewEdit("details")} />}
                <SummaryRow label="Tamanho" value={draft.modelScaleUnknown ? "A definir" : draft.modelScale === "alterar" ? dimensionsText(draft.modelDimensions, false, true) : "Tamanho original"} onEdit={() => beginReviewEdit("details")} />
                {draft.modelNotes.trim() ? <SummaryRow label="Observações" value={draft.modelNotes.trim()} onEdit={() => beginReviewEdit("details")} /> : null}
              </> : null}
              {draft.type === "outro" ? <>
                <SummaryRow label="Ideia" value={draft.otherDescription.trim() || "Descrita pela referência"} onEdit={() => beginReviewEdit("details")} />
                {draft.studioPhotoId ? <SummaryRow label="Referência" value="Foto do Estúdio selecionada" /> : null}
                {productReference && draft.productSlug ? <SummaryRow label="Referência" value={productReference.name} /> : null}
                {draft.otherSize.trim() ? <SummaryRow label="Tamanho aproximado" value={draft.otherSize.trim()} onEdit={() => beginReviewEdit("details")} /> : null}
              </> : null}
            </dl>
          </section>

          <section className={styles.reviewSection} aria-labelledby="review-preferences-title" inert={sending || submissionLocked}>
            <h3 id="review-preferences-title">{quickRequest ? (activeFiles.length ? "Quantidade e arquivos" : "Quantidade") : (activeFiles.length ? "Cores, quantidade e arquivos" : "Cores e quantidade")}</h3>
            <dl className={styles.summary}>
              {!quickRequest && !reviewingMultiModel ? <SummaryRow label="Cores" value={colorsSummary} onEdit={() => beginReviewEdit("details", draft.type === "caixa" ? 4 : draft.type === "placa" ? 3 : 0)} /> : null}
              <SummaryRow label="Quantidade" value={quantitySummary} onEdit={() => beginReviewEdit("details", draft.type === "caixa" ? 4 : draft.type === "placa" ? 3 : 0)} />
              {draft.type !== "placa" && draft.type !== "arquivo" && activeFiles.length ? <SummaryRow label="Arquivos" value={activeFiles.map((file) => file.name).join(", ")} onEdit={() => beginReviewEdit("details", draft.type === "caixa" ? 3 : 0)} /> : null}

              {draft.type === "placa" && draft.plateMode === "quick" && activeFiles.length ? <SummaryRow label="Referências" value={activeFiles.map((file) => file.name).join(", ")} onEdit={() => beginReviewEdit("details")} /> : null}
              {draft.type === "placa" && draft.plateMode === "detailed" && !draft.plateContentUnknown && draft.plateContents.includes("Logotipo") && files.logo.length ? <SummaryRow label="Logotipo anexado" value={files.logo.map((file) => file.name).join(", ")} onEdit={() => beginReviewEdit("details", 0)} /> : null}
              {draft.type === "placa" && draft.plateMode === "detailed" && !draft.plateContentUnknown && draft.plateContents.includes("QR Code") && draft.plateQrSource === "file" && files.qr.length ? <SummaryRow label="QR anexado" value={files.qr.map((file) => file.name).join(", ")} onEdit={() => beginReviewEdit("details", 0)} /> : null}
              {draft.type === "placa" && draft.plateMode === "detailed" && files.references.length ? <SummaryRow label="Referências" value={files.references.map((file) => file.name).join(", ")} onEdit={() => beginReviewEdit("details", 3)} /> : null}
            </dl>
          </section>

          <section className={styles.reviewSection} aria-labelledby="review-contact-title" inert={sending || submissionLocked}>
            <h3 id="review-contact-title">Contato e entrega</h3>
            <dl className={styles.summary}>
              <SummaryRow label="Nome" value={draft.name.trim()} onEdit={() => beginReviewEdit("contact")} />
              <SummaryRow label="Contato" value={`${draft.contactMethod === "email" ? "E-mail" : "WhatsApp"}: ${draft.contact}`} onEdit={() => beginReviewEdit("contact")} />
              <SummaryRow label="Entrega" value={draft.delivery === "retirada" ? "Retirar em São Caetano do Sul" : `Receber em casa · CEP ${draft.cep}`} onEdit={() => beginReviewEdit("delivery")} />
              <SummaryRow label="Data desejada" value={draft.desiredDate ? formatDesiredDate(draft.desiredDate) ?? draft.desiredDate : "Não tenho data"} onEdit={() => beginReviewEdit("delivery")} />
            </dl>
          </section>
          {draft.type === "arquivo" && !pendingConfirmation ? (
            <div className={`${styles.field} ${styles.printRightsField}`}>
              <label htmlFor="quote-print-rights">
                <input id="quote-print-rights" type="checkbox" checked={draft.printRightsAccepted}
                  disabled={sending || submissionLocked} aria-invalid={error?.field === "printRightsAccepted"}
                  onChange={(event) => changePrintRights(event.target.checked)} />
                <span>{PRINT_RIGHTS_TEXT}</span>
              </label>
              <Link href="/orcamentos/condicoes" target="_blank" rel="noopener noreferrer">Leia as condições do serviço</Link>
              <InlineError error={error} field="printRightsAccepted" />
            </div>
          ) : null}
          {intakeEnabled && turnstileSiteKey && !submissionLocked ? (
            <QuoteTurnstile key={turnstileResetKey} siteKey={turnstileSiteKey} onToken={setTurnstileToken} />
          ) : null}
          <p className={styles.privacyNote}>Vamos analisar viabilidade técnica, valor e prazo antes de retornar pelo contato escolhido. Seus dados serão usados para esta solicitação. A verificação de segurança utiliza Cloudflare Turnstile.</p>
          {!intakeEnabled && !pendingConfirmation ? <p className={styles.pendingNotice} role="status">O envio está em configuração. Nenhuma informação ou arquivo foi transmitido.</p> : null}
          {submissionError ? <p className={emailPending || !sending ? styles.pendingNotice : styles.submissionStatus} role={sending ? "status" : "alert"}>{submissionError}</p> : null}
          <div className={styles.actions}><button type="button" className={styles.secondaryAction} disabled={sending || submissionLocked} onClick={() => setReviewing(false)}><span aria-hidden="true">←</span> Voltar</button><button type="button" className={styles.primaryAction} disabled={(!intakeEnabled && !pendingConfirmation) || sending} onClick={submitQuote}>{sending ? "Enviando..." : submissionLocked ? "Tentar confirmar envio" : "Solicitar orçamento"}</button></div>
        </div>
      ) : null}
    </section>
  );
}
