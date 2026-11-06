"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { quoteApi, uploadSignedFile } from "@/features/quote/client-upload";
import { QuoteTurnstile } from "@/features/quote/quote-turnstile";
import { validModelLink } from "@/features/quote/model-link";
import { validModelItems, modelUnits, MODEL_ITEM_LIMIT, MODEL_LINK_MAX_LENGTH, MODEL_NOTES_MAX_LENGTH, type ModelItem } from "@/features/quote/model-items";
import { validateQuoteFiles, quoteFilePolicyLabel } from "@/features/quote/file-policy";
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
type FieldError = { field: string; message: string } | null;
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
  return Object.entries(initialDraft).every(([key, template]) => {
    const field = candidate[key];
    if (Array.isArray(template)) {
      if (!Array.isArray(field) || field.length > 12) return false;
      if (key === "modelItems") return field.length === 0 || validModelItems(field);
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
  const activeRoles: FileField[] = draft.type === "arquivo" ? ["model"]
    : draft.type === "caixa" ? [
      ...(draft.boxMode === "detailed" && !draft.boxNoPersonalization && draft.boxPersonalization.includes("Logotipo") ? ["boxLogo" as const] : []),
      ...(draft.boxMode === "detailed" && !draft.boxNoPersonalization && draft.boxPersonalization.includes("QR Code") && draft.boxQrSource === "file" ? ["boxQr" as const] : []),
      ...(draft.boxMode === "quick" || (draft.boxMode === "detailed" && !draft.boxNoPersonalization && draft.boxPersonalization.includes("Imagem ou desenho")) ? ["references" as const] : []),
    ] : draft.type === "placa" ? [
      ...(draft.plateMode === "detailed" && !draft.plateContentUnknown && draft.plateContents.includes("Logotipo") ? ["logo" as const] : []),
      ...(draft.plateMode === "detailed" && !draft.plateContentUnknown && draft.plateContents.includes("QR Code") && draft.plateQrSource === "file" ? ["qr" as const] : []),
      "references",
    ] : ["references"];
  return activeRoles.flatMap((role) => files[role].map((file) => ({ role, file })));
}

function visibleFiles(files: SelectedFiles, draft: Draft, modelFiles: Record<string, File> = {}): File[] {
  return visibleFileEntries(files, draft, modelFiles).map(({ file }) => file);
}

function newModelItem(source: ModelItem["source"], value: string): ModelItem {
  return {
    id: crypto.randomUUID(), source,
    link: source === "link" ? value : "", fileName: source === "file" ? value : "",
    quantity: 1, colorMode: "indeciso", colors: [],
    scale: "original", dimensions: emptyDimensions(), notes: "",
  };
}

function dimensionsText(dimensions: Dimensions, unknown = false, depth = false) {
  if (unknown) return "Medidas ainda não definidas";
  const parts = [dimensions.width, ...(depth ? [dimensions.depth] : []), dimensions.height];
  return parts.some((part) => part.trim()) ? `${parts.map((part) => part.trim() || "?").join(" × ")} cm` : "Medidas não informadas";
}

function validDimension(value: string) {
  const normalized = value.trim().replace(",", ".");
  return /^\d+(?:\.\d+)?$/.test(normalized) && Number(normalized) > 0;
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

function QuantityPicker({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  return (
    <div className={styles.field}>
      <label htmlFor="quote-quantity">Quantas unidades você precisa?</label>
      <div className={styles.quantity}>
        <button type="button" aria-label="Diminuir quantidade" disabled={value <= 1} onClick={() => onChange(Math.max(1, value - 1))}>−</button>
        <input id="quote-quantity" type="number" min="1" inputMode="numeric" value={value} onChange={(event) => onChange(Math.max(1, Math.floor(Number(event.target.value) || 1)))} />
        <button type="button" aria-label="Aumentar quantidade" onClick={() => onChange(value + 1)}>+</button>
      </div>
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
            <input id={`${id}-${measure.key}`} type="text" inputMode="decimal" placeholder="Ex.: 12" value={value[measure.key]} disabled={unknown} aria-invalid={error?.field === `${id}Dimensions`} onChange={(event) => onChange(measure.key, event.target.value)} />
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
        onChange={(event) => {
          onAdd(id, Array.from(event.target.files ?? []));
          event.target.value = "";
        }}
      />
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
          setStep(typeof stored.step === "number" && [1, 2, 3].includes(stored.step) ? stored.step : 1);
          setBoxDetailStep(typeof stored.boxDetailStep === "number" ? Math.min(4, Math.max(0, stored.boxDetailStep)) : 0);
          setPlateDetailStep(typeof stored.plateDetailStep === "number" ? Math.min(3, Math.max(0, stored.plateDetailStep)) : 0);
          setReviewing(stored.reviewing === true);
          if (stored.savedContacts && typeof stored.savedContacts === "object") {
            const contacts = stored.savedContacts as Record<string, unknown>;
            setSavedContacts({ whatsapp: typeof contacts.whatsapp === "string" ? contacts.whatsapp : "", email: typeof contacts.email === "string" ? contacts.email : "" });
          }
          const missing = Array.isArray(stored.fileRoles) ? stored.fileRoles.filter((role): role is FileField =>
            typeof role === "string" && Object.hasOwn(allowedExtensions, role)) : [];
          setFileReattach(savedDraft.modelItems.some(item => item.source === "file") ?
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
        step, reviewing, boxDetailStep, plateDetailStep, draft, savedContacts,
        fileRoles: [...new Set([...fileReattach, ...(Object.keys(modelFiles).length ? ["model" as FileField] : []),
          ...Object.entries(files).filter(([, selected]) => selected.length).map(([role]) => role as FileField)])],
        pendingConfirmation,
      }));
    } catch { /* Storage may be disabled or full. */ }
  }, [hydrated, receiptId, studioPhotoId, productReference?.slug, step, reviewing, boxDetailStep, plateDetailStep, draft, savedContacts, files, modelFiles, fileReattach, pendingConfirmation]);

  useEffect(() => { headingRef.current?.focus(); }, [step, reviewing, reviewEdit, draft.boxMode, draft.plateMode]);
  useEffect(() => {
    if (step === 2 && ((draft.type === "caixa" && draft.boxMode === "detailed") || (draft.type === "placa" && draft.plateMode === "detailed"))) formStepRef.current?.scrollIntoView({ block: "start" });
  }, [boxDetailStep, plateDetailStep, draft.boxMode, draft.plateMode, draft.type, step]);
  useEffect(() => {
    if (error) document.querySelector(`.${styles.fieldError}`)?.scrollIntoView({ block: "center" });
  }, [error]);

  function update<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
    setError(null);
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
    const lines = modelLinksInput.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
    if (!lines.length) return setError({ field: "modelLinks", message: "Cole um ou mais links, um por linha." });
    const invalid = lines.filter(link => link.length > MODEL_LINK_MAX_LENGTH || !validModelLink(link));
    const valid = lines.filter(link => link.length <= MODEL_LINK_MAX_LENGTH && validModelLink(link));
    const capacity = MODEL_ITEM_LIMIT - draft.modelItems.length;
    const accepted = valid.slice(0, capacity);
    if (accepted.length) update("modelItems", [...draft.modelItems, ...accepted.map(link => newModelItem("link", link))]);
    setModelLinksInput(invalid.join("\n"));
    if (invalid.length || valid.length > capacity) setError({ field: "modelLinks",
      message: `${accepted.length} link(s) adicionado(s). ${invalid.length} inválido(s), ${Math.max(0, valid.length - capacity)} excederam o limite de ${MODEL_ITEM_LIMIT} modelos.` });
  }

  function addModelFiles(incoming: File[]) {
    if (!incoming.length) return;
    const capacity = MODEL_ITEM_LIMIT - draft.modelItems.length;
    if (incoming.length > capacity) return setError({ field: "modelFiles", message: `Máximo de ${MODEL_ITEM_LIMIT} modelos no orçamento.` });
    const currently = Object.values(modelFiles);
    const result = validateQuoteFiles([...currently, ...incoming]);
    if (!result.ok) return setError({ field: "modelFiles", message: result.message });
    const additions = incoming.map(file => ({ item: newModelItem("file", file.name), file }));
    setModelFiles(current => ({ ...current, ...Object.fromEntries(additions.map(({ item, file }) => [item.id, file])) }));
    update("modelItems", [...draft.modelItems, ...additions.map(({ item }) => item)]);
    setFileReattach(current => current.filter(role => role !== "model"));
  }

  function replaceModelFile(id: string, file: File) {
    const result = validateQuoteFiles([...Object.entries(modelFiles)
      .filter(([key]) => key !== id).map(([, existing]) => existing), file]);
    if (!result.ok) return setError({ field: "modelFiles", message: result.message });
    if (!/\.(stl|3mf)$/i.test(file.name)) return setError({ field: "modelFiles", message: "Escolha STL ou 3MF." });
    setModelFiles(current => ({ ...current, [id]: file }));
    setDraft(current => ({ ...current, modelItems: current.modelItems.map(item =>
      item.id === id ? { ...item, fileName: file.name } : item) }));
    setFileReattach(current => current.filter(role => role !== "model"));
    setError(null);
  }

  function removeModelItem(id: string) {
    setDraft(current => ({ ...current, modelItems: current.modelItems.filter(item => item.id !== id) }));
    setModelFiles(current => Object.fromEntries(Object.entries(current).filter(([key]) => key !== id)));
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
    if (stage === 3 && draft.boxShape === "Outro formato" && !draft.boxShapeOther.trim() && !draft.boxPersonalization.includes("Imagem ou desenho")) return { field: "boxPersonalization", message: "Descreva o formato no passo anterior ou escolha Imagem ou desenho para enviar uma referência." };
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
    const activeFiles = visibleFiles(files, draft, modelFiles);
    const fileCheck = validateQuoteFiles(activeFiles);
    if (!fileCheck.ok) return { field: draft.type === "arquivo" ? "modelFiles" : "references", message: fileCheck.message };
    if (draft.type === "arquivo" && multiModelEnabled) {
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
    if (draft.type === "caixa" && draft.boxMode === "detailed") {
      for (let stage = 0; stage <= 4; stage += 1) {
        const validation = validateBoxDetail(stage);
        if (validation) {
          setBoxDetailStep(stage);
          setError(validation);
          return false;
        }
      }
    }
    if (draft.type === "placa" && draft.plateMode === "detailed") {
      for (let stage = 0; stage <= 3; stage += 1) {
        const validation = validatePlateDetail(stage);
        if (validation) {
          setPlateDetailStep(stage);
          setError(validation);
          return false;
        }
      }
    }
    const validation = validateDetails();
    if (validation) {
      if (draft.type === "caixa" && draft.boxMode === "detailed" && validation.field === "references") setBoxDetailStep(3);
      if (draft.type === "placa" && draft.plateMode === "detailed" && validation.field === "references") setPlateDetailStep(3);
      setError(validation);
      return false;
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
    else if (draft.contactMethod === "whatsapp" && !/^\d{10,13}$/.test(draft.contact.replace(/\D/g, ""))) validation = { field: "contact", message: "Confira o número de WhatsApp com DDD." };
    else if (draft.contactMethod === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.contact.trim())) validation = { field: "contact", message: "Confira o endereço de e-mail." };
    else if (!draft.delivery) validation = { field: "delivery", message: "Escolha como prefere receber o pedido." };
    else if (draft.delivery === "envio" && draft.cep.replace(/\D/g, "").length !== 8) validation = { field: "cep", message: "Informe um CEP com 8 números." };
    return validation;
  }

  function reviewRequest() {
    const validation = validateContact();
    if (validation) return setError(validation);
    setError(null);
    setReviewing(true);
  }

  async function confirmQuote(confirmation: PendingConfirmation) {
    setSubmissionLocked(true);
    setPendingConfirmation(confirmation);
    // Save before the request: a refresh during an uncertain response must retry the same key.
    try {
      sessionStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify({
        savedAt: Date.now(), reference: studioPhotoId ?? productReference?.slug ?? null,
        step: 3, reviewing: true, boxDetailStep, plateDetailStep, draft: confirmation.draft,
        savedContacts, fileRoles: [...new Set([...fileReattach, ...(Object.keys(modelFiles).length ? ["model" as FileField] : []),
          ...Object.entries(files).filter(([, selected]) => selected.length).map(([role]) => role as FileField)])],
        pendingConfirmation: confirmation,
      }));
    } catch { /* The in-memory idempotency key still protects this page. */ }
    const response = await fetch("/api/quote/submit", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(confirmation), cache: "no-store",
    });
    const result = await response.json().catch(() => null) as { requestId?: string; error?: string } | null;
    if (response.status === 202 && result?.error === "quote_email_pending") {
      setEmailPending(true);
      setSubmissionError("O pedido foi salvo no banco, mas o aviso por e-mail ainda não foi confirmado. Tente novamente.");
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
    if (!intakeEnabled || sending || !draft.type) return;
    if (!pendingConfirmation) {
      if (!validateProject()) return;
      const contactError = validateContact();
      if (contactError) return setError(contactError);
    }
    setSubmissionError("");
    setSending(true);
    try {
      if (pendingConfirmation) {
        await confirmQuote(pendingConfirmation);
        return;
      }
      const entries = visibleFileEntries(files, draft, modelFiles);
      const signature = JSON.stringify(draft) + JSON.stringify(entries.map(({ role, file, modelItemId }) => [role, modelItemId, fileIdentity(file)]));
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
        const key = `${role}:${modelItemId ?? ""}:${fileIdentity(file)}`;
        const upload = pending.uploads.get(key) ?? { uploadKey: crypto.randomUUID() };
        pending.uploads.set(key, upload);
        if (!upload.complete && upload.attachmentId) {
          try {
            await quoteApi("/api/quote/attachments/complete", {
              requestId: pending.requestId, attachmentId: upload.attachmentId,
            });
            upload.complete = true;
          } catch { /* Upload may still be incomplete; resume below. */ }
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
        const uploaded = pending!.uploads.get(`${role}:${modelItemId ?? ""}:${fileIdentity(file)}`);
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
      if (["quote_not_found", "quote_conflict", "upload_reservation_expiring", "quote_session_invalid"].includes(code)) {
        pendingSubmission.current = null;
        setPendingConfirmation(null);
        setSubmissionLocked(false);
      }
      if (code === "invalid_quote_submit") { setPendingConfirmation(null); setSubmissionLocked(false); }
      setSubmissionError(code === "human_verification_required" ? "Confirme a verificação de segurança para enviar o orçamento."
        : code === "human_verification_expired" ? "A verificação expirou. Tente novamente no quadro de segurança."
        : code === "quote_verification_unavailable" ? "A verificação está temporariamente indisponível. Tente novamente sem refazer o pedido."
        : code === "quote_rate_limited" ? "Muitas tentativas em pouco tempo. Aguarde e tente novamente."
        : code === "quote_upload_unavailable" ? "Não foi possível enviar um arquivo. Confira sua conexão e tente novamente."
        : code === "invalid_quote_submit" ? "Algum dado do pedido precisa ser revisto antes do envio."
        : "Não foi possível concluir o envio. Seu pedido permanece nesta página para tentar novamente.");
    } finally {
      setSending(false);
    }
  }

  function beginReviewEdit(area: ReviewEditArea, detailStage = 0) {
    reviewSnapshot.current = { draft, files, modelFiles, savedContacts };
    setReviewEdit(area);
    setReviewing(false);
    setError(null);
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
        if (reviewEdit === "contact" && ["delivery", "cep"].includes(validation.field)) setReviewEdit("delivery");
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
  const currentQuantity = draft.type === "arquivo" && multiModelEnabled ? modelUnits(draft.modelItems) : draft.quantity;
  const quantitySummary = `${currentQuantity} ${currentQuantity === 1 ? "unidade" : "unidades"}`;
  const colorsSummary = draft.colorMode === "indeciso" ? "Cores a decidir" : draft.colors.map(colorText).filter(Boolean).join(", ") || "Cores não informadas";
  const activeFiles = visibleFiles(files, draft, modelFiles);
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

      {fileReattach.length > 0 && !pendingConfirmation && step > 1 ? (
        <p className={styles.pendingNotice} role="status">O rascunho foi recuperado. Arquivos selecionados antes da atualização precisam ser anexados novamente.</p>
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
              <input type="radio" name="quote-project-type" value={option.value} checked={draft.type === option.value} onClick={() => { update("type", option.value); update("productSlug", null); setStep(2); }} onChange={() => { update("type", option.value); update("productSlug", null); setStep(2); }} />
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
              {!draft.boxMode ? <div className={styles.boxModeChoices} role="group" aria-label="Como prefere descrever sua caixa?">
                <button type="button" onClick={() => chooseBoxMode("quick")}>
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
              {draft.boxMode === "quick" ? (
                <>
                  <FilePicker id="references" label="Envie uma foto de referência, se tiver" accept=".png,.jpg,.jpeg,.webp,.pdf" files={files.references} multiple onAdd={addFiles} onRemove={removeFile} error={error} />
                  <div className={styles.field}>
                    <label htmlFor="box-quick-description">O que você quer criar ou mudar?</label>
                    <textarea id="box-quick-description" className={styles.quickDescription} value={draft.boxQuickDescription} aria-invalid={error?.field === "boxQuickDescription"} onChange={(event) => update("boxQuickDescription", event.target.value)} placeholder="Ex.: quero essa caixa em preto e vermelho, com meu QR Code." />
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
                      {draft.boxShape === "Outro formato" ? <><input type="text" aria-label="Descreva o formato da caixa" value={draft.boxShapeOther} aria-invalid={error?.field === "boxShapeOther"} onChange={(event) => update("boxShapeOther", event.target.value)} placeholder="Descreva o formato ou envie uma imagem na personalização" /><InlineError error={error} field="boxShapeOther" /></> : null}
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
                          <input id="box-divider-count" type="text" inputMode="numeric" value={draft.boxDividerCount} aria-invalid={error?.field === "boxDividerCount"} onChange={(event) => update("boxDividerCount", event.target.value.replace(/\D/g, "").replace(/^0+/, ""))} placeholder="Ex.: 2" />
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
                      {!draft.boxNoPersonalization && draft.boxPersonalization.includes("Nome ou frase") ? <div className={styles.field}><label htmlFor="box-text">Qual texto vai na caixa?</label><input id="box-text" type="text" value={draft.boxText} aria-invalid={error?.field === "boxText"} onChange={(event) => update("boxText", event.target.value)} placeholder="Nome, frase ou outra ideia" /><InlineError error={error} field="boxText" /></div> : null}
                      {!draft.boxNoPersonalization && draft.boxPersonalization.includes("Logotipo") ? <FilePicker id="boxLogo" label="Envie seu logotipo, se já tiver" accept=".png,.jpg,.jpeg,.webp,.pdf" files={files.boxLogo} onAdd={addFiles} onRemove={removeFile} error={error} /> : null}
                      {!draft.boxNoPersonalization && draft.boxPersonalization.includes("Imagem ou desenho") ? <FilePicker id="references" label="Envie uma imagem ou desenho da caixa" accept=".png,.jpg,.jpeg,.webp,.pdf" files={files.references} multiple onAdd={addFiles} onRemove={removeFile} error={error} /> : null}
                      {!draft.boxNoPersonalization && draft.boxPersonalization.includes("QR Code") ? (
                        <>
                          <QrSourcePicker name="box" value={draft.boxQrSource} onChange={(value) => update("boxQrSource", value)} error={error} />
                          {draft.boxQrSource === "content" ? <div className={styles.field}><label htmlFor="box-qr">O que o QR Code deve exibir?</label><input id="box-qr" type="text" value={draft.boxQrContent} aria-invalid={error?.field === "boxQrContent"} onChange={(event) => update("boxQrContent", event.target.value)} placeholder="Link ou texto" /><InlineError error={error} field="boxQrContent" /></div> : null}
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
              {!draft.plateMode ? <div className={`${styles.boxModeChoices} ${styles.plateModeChoices}`} role="group" aria-label="Como prefere descrever sua placa?">
                <button type="button" onClick={() => choosePlateMode("quick")}>
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
              {draft.plateMode === "quick" ? (
                <>
                  <FilePicker id="references" label="Envie uma foto de referência, se tiver" accept=".png,.jpg,.jpeg,.webp,.pdf" files={files.references} multiple onAdd={addFiles} onRemove={removeFile} error={error} />
                  <div className={styles.field}>
                    <label htmlFor="plate-quick-description">O que você quer criar?</label>
                    <textarea id="plate-quick-description" className={styles.quickDescription} value={draft.plateQuickDescription} aria-invalid={error?.field === "plateQuickDescription"} onChange={(event) => update("plateQuickDescription", event.target.value)} placeholder="Ex.: quero uma placa azul com meu logotipo e QR Code." />
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
                      {!draft.plateContentUnknown && draft.plateContents.includes("Nome ou frase") ? <div className={styles.field}><label htmlFor="plate-text">Qual texto vai na placa?</label><input id="plate-text" type="text" value={draft.plateText} aria-invalid={error?.field === "plateText"} onChange={(event) => update("plateText", event.target.value)} placeholder="Digite o nome ou a frase" /><InlineError error={error} field="plateText" /></div> : null}
                      {!draft.plateContentUnknown && draft.plateContents.includes("Logotipo") ? <FilePicker id="logo" label="Envie seu logotipo, se já tiver" accept=".png,.jpg,.jpeg,.webp,.pdf" files={files.logo} onAdd={addFiles} onRemove={removeFile} error={error} /> : null}
                      {!draft.plateContentUnknown && draft.plateContents.includes("QR Code") ? (
                        <>
                          <QrSourcePicker name="plate" value={draft.plateQrSource} onChange={(value) => update("plateQrSource", value)} error={error} />
                          {draft.plateQrSource === "content" ? <div className={styles.field}><label htmlFor="plate-qr">O que o QR Code deve exibir?</label><input id="plate-qr" type="text" value={draft.plateQrContent} aria-invalid={error?.field === "plateQrContent"} onChange={(event) => update("plateQrContent", event.target.value)} placeholder="Link ou texto" /><InlineError error={error} field="plateQrContent" /></div> : null}
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
                        <input id="plate-fixation" type="text" value={draft.plateFixation} disabled={draft.plateFixationUnknown} aria-invalid={error?.field === "plateFixation"} onChange={(event) => update("plateFixation", event.target.value)} placeholder="Apoiada, pendurada, fixada..." />
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
                    placeholder={"https://makerworld.com/pt/models/12345\nhttps://makerworld.com/pt/models/67890"}
                    aria-invalid={error?.field === "modelLinks"} />
                  <button className={styles.modelAddAction} type="button" disabled={!modelLinksInput.trim() || draft.modelItems.length >= MODEL_ITEM_LIMIT}
                    onClick={addModelLinks}>Adicionar links à lista</button>
                  <InlineError error={error} field="modelLinks" />
                </div>
                <div className={styles.field}>
                  <label htmlFor="quote-model-files">Ou adicione arquivos STL/3MF</label>
                  <input id="quote-model-files" className={styles.fileInput} type="file" accept=".stl,.3mf" multiple
                    disabled={draft.modelItems.length >= MODEL_ITEM_LIMIT}
                    onChange={event => { addModelFiles(Array.from(event.target.files ?? [])); event.target.value = ""; }} />
                  <p className={styles.fieldHint}>Até 5 arquivos no pedido inteiro. Arquivos 3D: 30 MB cada. Total de anexos: 50 MB. Os links não ocupam armazenamento.</p>
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
                            <span>{item.source === "link" ? "Link do modelo" : item.fileName}</span>
                          </div>
                          <button type="button" className={styles.modelRemove} aria-label={`Remover modelo ${index + 1}`}
                            onClick={() => removeModelItem(item.id)}>Remover</button>
                        </div>
                        {item.source === "link" ? (
                          <div className={styles.field}>
                            <label htmlFor={`model-url-${item.id}`}>Link</label>
                            <input id={`model-url-${item.id}`} type="url" value={item.link} maxLength={MODEL_LINK_MAX_LENGTH}
                              onChange={event => changeModelItem(item.id, { link: event.target.value })} />
                            {validModelLink(item.link) ? <a href={item.link} target="_blank" rel="noopener noreferrer" className={styles.modelExternal}>Abrir modelo em outra aba</a> : <small>Confira o link HTTPS do MakerWorld/Bambu Handy.</small>}
                            {draft.modelItems.filter(other => other.id !== item.id && other.source === "link" && other.link === item.link).length > 0 ? <small>Este link também aparece em outro item. Você pode manter configurações diferentes.</small> : null}
                          </div>
                        ) : !modelFiles[item.id] ? (
                          <div className={styles.field}>
                            <label htmlFor={`model-reupload-${item.id}`}>Anexe novamente {item.fileName}</label>
                            <input id={`model-reupload-${item.id}`} type="file" className={styles.fileInput} accept=".stl,.3mf"
                              onChange={event => { const file = event.target.files?.[0]; if (file) replaceModelFile(item.id, file); event.target.value = ""; }} />
                            <small>O navegador não preserva arquivos após recarregar a página.</small>
                          </div>
                        ) : null}
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
                              onChange={event => changeModelItem(item.id, {
                                colorMode: event.target.value as ModelItem["colorMode"],
                                colors: event.target.value === "tenho" ? item.colors.length ? item.colors : [{ name: "", rgb: "" }] : [],
                              })}>
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
                                <input id={`model-${item.id}-${dimension}`} type="text" inputMode="decimal"
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
                                <input type="text" list="quote-model-color-suggestions" maxLength={48}
                                  aria-label={`Modelo ${index + 1}, cor ${colorIndex + 1}`}
                                  value={color.name} placeholder={`Cor ${colorIndex + 1}, ex.: branco`}
                                  onChange={event => changeModelItem(item.id, { colors: item.colors.map((current, i) =>
                                    i === colorIndex ? { name: event.target.value, rgb: "" } : current) })} />
                                <button type="button" aria-label={`Remover cor ${colorIndex + 1} do modelo ${index + 1}`}
                                  onClick={() => changeModelItem(item.id, { colors: item.colors.filter((_, i) => i !== colorIndex) })}>×</button>
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
                  <input id="model-link" type="url" value={draft.modelLink} onChange={event => update("modelLink", event.target.value)} placeholder="https://makerworld.com/en/models/..." />
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
              <div className={styles.field}><label htmlFor="model-notes">Alguma exigência importante? <small>Opcional</small></label><textarea id="model-notes" value={draft.modelNotes} onChange={event => update("modelNotes", event.target.value)} placeholder="Ex.: encaixe, resistência ou outra observação." /></div>
            </>
          ) : null}

          {draft.type === "outro" ? (
            <>
              <div className={styles.field}>
                <label htmlFor="other-description">{draft.studioPhotoId || draft.productSlug ? "O que você quer mudar nesta peça?" : "O que você gostaria de criar?"}</label>
                <textarea
                  id="other-description"
                  value={draft.otherDescription}
                  aria-invalid={error?.field === "otherDescription"}
                  onChange={(event) => update("otherDescription", event.target.value)}
                  placeholder={draft.studioPhotoId || draft.productSlug ? "Ex.: quero esta peça em outra medida ou com meu nome." : "Pode explicar do seu jeito, sem termos técnicos."}
                />
                <InlineError error={error} field="otherDescription" />
              </div>
              <div className={styles.field}><label htmlFor="other-size">Sabe o tamanho aproximado? <small>Opcional</small></label><input id="other-size" type="text" value={draft.otherSize} onChange={(event) => update("otherSize", event.target.value)} placeholder="Escreva o que souber" /></div>
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
                      <input type="text" aria-label={`Cor ${index + 1} por nome`} value={color.name} disabled={draft.colorMode === "indeciso"} aria-invalid={error?.field === "colors" && !hasColor(color)} onChange={(event) => updateColor(index, { name: event.target.value, rgb: "" })} placeholder={`Cor ${index + 1}: ex. preto ou vermelho`} />
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
          {showingQuantity ? <QuantityPicker value={draft.quantity} onChange={(value) => update("quantity", value)} /> : null}
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
          <div className={styles.field}><label htmlFor="quote-name">Qual é o seu nome?</label><input id="quote-name" type="text" autoComplete="name" value={draft.name} aria-invalid={error?.field === "name"} onChange={(event) => update("name", event.target.value)} placeholder="Seu nome" /><InlineError error={error} field="name" /></div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Como prefere que a gente entre em contato?</span>
            <div className={styles.choiceButtons} role="group" aria-label="Canal de contato">
              <button type="button" aria-pressed={draft.contactMethod === "whatsapp"} onClick={() => chooseContactMethod("whatsapp")}>WhatsApp</button>
              <button type="button" aria-pressed={draft.contactMethod === "email"} onClick={() => chooseContactMethod("email")}>E-mail</button>
            </div>
          </div>
          <div className={styles.field}><label htmlFor="quote-contact">Seu {draft.contactMethod === "whatsapp" ? "WhatsApp" : "e-mail"}</label><input id="quote-contact" type={draft.contactMethod === "email" ? "email" : "tel"} inputMode={draft.contactMethod === "email" ? "email" : "tel"} autoComplete={draft.contactMethod === "email" ? "email" : "tel"} value={draft.contact} aria-invalid={error?.field === "contact"} onChange={(event) => changeContact(event.target.value)} placeholder={draft.contactMethod === "email" ? "voce@exemplo.com" : "(00) 00000-0000"} /><InlineError error={error} field="contact" /></div>
          </> : null}
          {reviewEdit !== "contact" ? <>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Como prefere receber seu pedido?</span>
            <div className={styles.choiceButtons} role="group" aria-label="Entrega do pedido">
              <button type="button" aria-pressed={draft.delivery === "retirada"} onClick={() => update("delivery", "retirada")}>Retirar em São Caetano do Sul</button>
              <button type="button" aria-pressed={draft.delivery === "envio"} onClick={() => update("delivery", "envio")}>Receber no meu endereço pela Shopee</button>
            </div>
            <InlineError error={error} field="delivery" />
          </div>
          {draft.delivery === "envio" ? <div className={styles.field}><label htmlFor="quote-cep">Qual é o seu CEP?</label><input id="quote-cep" type="text" inputMode="numeric" autoComplete="postal-code" value={draft.cep} aria-invalid={error?.field === "cep"} onChange={(event) => update("cep", event.target.value)} placeholder="00000-000" /><small>Depois do orçamento, combinaremos os detalhes do envio pela Shopee.</small><InlineError error={error} field="cep" /></div> : null}
          </> : null}
          {reviewEdit ? (
            <div className={styles.actions}><button type="button" className={styles.secondaryAction} onClick={cancelReviewEdit}>Cancelar alteração</button><button type="button" className={styles.primaryAction} onClick={saveReviewEdit}>Salvar e voltar ao resumo</button></div>
          ) : <div className={styles.actions}><button type="button" className={styles.secondaryAction} onClick={() => edit(2)}><span aria-hidden="true">←</span> Voltar</button><button type="button" className={styles.primaryAction} onClick={reviewRequest}>Conferir pedido <span aria-hidden="true">→</span></button></div>}
        </div>
      ) : null}

      {step === 3 && reviewing ? (
        <div className={styles.formPanel}>
          <section className={styles.reviewSection} aria-labelledby="review-details-title" inert={sending || submissionLocked}>
            <h3 id="review-details-title">Sua peça</h3>
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
              {draft.type === "arquivo" && multiModelEnabled ? <>
                <SummaryRow label="Total" value={`${draft.modelItems.length} modelos · ${quantitySummary}`} onEdit={() => beginReviewEdit("details")} />
                {draft.modelItems.map((item, index) => (
                  <div className={styles.modelReviewEntry} key={item.id}>
                    <SummaryRow label={`Modelo ${String(index + 1).padStart(2, "0")}`}
                      value={item.source === "link" ? item.link :
                        modelFiles[item.id]?.name ??
                          pendingConfirmation?.attachments.find(file => file.modelItemId === item.id)?.name ??
                          `${item.fileName} (reanexar arquivo)`}
                      url={item.source === "link" && validModelLink(item.link) ? item.link : undefined}
                      onEdit={() => beginReviewEdit("details")} />
                    <SummaryRow label="Configuração"
                      value={`${item.quantity} un. · ${item.colorMode === "indeciso" ? "cores a definir" : item.colors.map(colorText).join(", ")} · ${item.scale === "nao-sei" ? "tamanho a definir" : item.scale === "alterar" ? dimensionsText(item.dimensions, false, true) : "tamanho original"}${item.notes.trim() ? ` · ${item.notes.trim()}` : ""}`}
                      onEdit={() => beginReviewEdit("details")} />
                  </div>
                ))}
              </> : null}
              {draft.type === "arquivo" && !multiModelEnabled ? <>
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
              {!quickRequest && !(draft.type === "arquivo" && multiModelEnabled) ? <SummaryRow label="Cores" value={colorsSummary} onEdit={() => beginReviewEdit("details", draft.type === "caixa" ? 4 : draft.type === "placa" ? 3 : 0)} /> : null}
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
              <SummaryRow label="Entrega" value={draft.delivery === "retirada" ? "Retirada em São Caetano do Sul" : `Receber no meu endereço pela Shopee · CEP ${draft.cep}`} onEdit={() => beginReviewEdit("delivery")} />
            </dl>
          </section>
          {intakeEnabled && turnstileSiteKey && !submissionLocked ? (
            <QuoteTurnstile key={turnstileResetKey} siteKey={turnstileSiteKey} onToken={setTurnstileToken} />
          ) : null}
          <p className={styles.privacyNote}>Seus dados serão usados para analisar esta solicitação e retornar pelo contato escolhido. A verificação de segurança utiliza Cloudflare Turnstile.</p>
          {!intakeEnabled ? <p className={styles.pendingNotice} role="status">O envio está em configuração. Nenhuma informação ou arquivo foi transmitido.</p> : null}
          {submissionError ? <p className={emailPending || !sending ? styles.pendingNotice : styles.submissionStatus} role={sending ? "status" : "alert"}>{submissionError}</p> : null}
          <div className={styles.actions}><button type="button" className={styles.secondaryAction} disabled={sending || submissionLocked} onClick={() => setReviewing(false)}><span aria-hidden="true">←</span> Voltar</button><button type="button" className={styles.primaryAction} disabled={!intakeEnabled || sending} onClick={submitQuote}>{sending ? "Enviando..." : submissionLocked ? "Tentar confirmar envio" : "Solicitar orçamento"}</button></div>
        </div>
      ) : null}
    </section>
  );
}
