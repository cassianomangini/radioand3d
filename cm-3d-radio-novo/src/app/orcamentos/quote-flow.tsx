"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import styles from "./page.module.css";

const projectOptions = [
  { value: "caixa", title: "Caixa personalizada", description: "Caixas sob medida, no formato que você imaginar.", image: "/api/orcamentos/photos/caixa" },
  { value: "placa", title: "Placa / Logo personalizado", description: "Nomes, logotipos, QR Codes e decoração.", image: "/api/orcamentos/photos/placa" },
  { value: "arquivo", title: "Imprimir meu arquivo 3D", description: "Já tenho um modelo e quero imprimir.", image: "/images/orcamentos/orcamento_4.png" },
  { value: "outro", title: "Outro projeto", description: "Tenho uma ideia para transformar em peça 3D.", image: "/images/orcamentos/orcamento_5.png" },
] as const;

const boxClosureOptions = [
  { value: "deslizar", label: "De deslizar" },
  { value: "encaixar", label: "De encaixar" },
  { value: "rosquear", label: "De rosquear" },
  { value: "sem-tampa", label: "Sem tampa" },
] as const;

const boxShapeOptions = [
  { label: "Redonda", image: "/images/orcamentos/caixa-redonda.png" },
  { label: "Quadrada", image: "/images/orcamentos/caixa-quadrada.png" },
  { label: "Retangular", image: "/images/orcamentos/caixa-retangular.png" },
  { label: "Outro formato", image: "/images/orcamentos/outro-formato.png" },
] as const;

type ProjectType = (typeof projectOptions)[number]["value"];
type BoxMode = "" | "quick" | "detailed";
type QrSource = "" | "content" | "file";
type FileField = "model" | "logo" | "qr" | "boxLogo" | "boxQr" | "references";
type Dimensions = { width: string; depth: string; height: string };
type ColorChoice = { name: string; rgb: string };
type FieldError = { field: string; message: string } | null;
type Draft = {
  type: ProjectType | null;
  boxMode: BoxMode;
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
  boxClosure: "" | "deslizar" | "encaixar" | "rosquear" | "sem-tampa" | "nao-sei";
  plateContents: string[];
  plateContentUnknown: boolean;
  plateText: string;
  plateQrSource: QrSource;
  plateQrContent: string;
  plateUse: string;
  plateFixation: string;
  plateDimensions: Dimensions;
  plateUnknown: boolean;
  modelScale: string;
  modelScaleUnknown: boolean;
  modelDimensions: Dimensions;
  modelNotes: string;
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
  boxClosure: "",
  plateContents: [],
  plateContentUnknown: false,
  plateText: "",
  plateQrSource: "",
  plateQrContent: "",
  plateUse: "",
  plateFixation: "",
  plateDimensions: emptyDimensions(),
  plateUnknown: false,
  modelScale: "",
  modelScaleUnknown: false,
  modelDimensions: emptyDimensions(),
  modelNotes: "",
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

function visibleFiles(files: SelectedFiles, draft: Draft) {
  if (draft.type === "arquivo") return files.model;
  if (draft.type === "caixa") return [
    ...(draft.boxMode === "detailed" && !draft.boxNoPersonalization && draft.boxPersonalization.includes("Logotipo") ? files.boxLogo : []),
    ...(draft.boxMode === "detailed" && !draft.boxNoPersonalization && draft.boxPersonalization.includes("QR Code") && draft.boxQrSource === "file" ? files.boxQr : []),
    ...files.references,
  ];
  if (draft.type === "placa") return [
    ...(!draft.plateContentUnknown && draft.plateContents.includes("Logotipo") ? files.logo : []),
    ...(!draft.plateContentUnknown && draft.plateContents.includes("QR Code") && draft.plateQrSource === "file" ? files.qr : []),
    ...files.references,
  ];
  return files.references;
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
  if (!color.rgb) return color.name.trim();
  const channels = [1, 3, 5].map((start) => parseInt(color.rgb.slice(start, start + 2), 16));
  const rgb = `RGB(${channels.join(", ")})`;
  return color.name.trim() ? `${color.name.trim()} (${rgb})` : rgb;
}

function hasColor(color: ColorChoice) {
  return Boolean(color.name.trim() || color.rgb);
}

function boxSummary(draft: Draft) {
  if (draft.boxMode === "quick") return draft.boxQuickDescription.trim() || "Pedido descrito pela foto de referência";
  const parts: string[] = [];
  if (draft.boxShape) parts.push(draft.boxShape === "Outro formato" ? draft.boxShapeOther.trim() || "Outro formato" : draft.boxShape);
  if (draft.boxDividers === "com") {
    const count = draft.boxDividerCount.trim();
    parts.push(count ? `Com ${count} ${Number(count) === 1 ? "divisória" : "divisórias"}` : "Com divisórias");
  }
  if (draft.boxDividers === "sem") parts.push("Sem divisórias");
  if (draft.boxDividers === "nao-sei") parts.push("Divisórias a definir");
  parts.push(dimensionsText(draft.boxDimensions, draft.boxUnknown, true));
  if (!draft.boxUnknown && Object.values(draft.boxDimensions).some((value) => value.trim()) && draft.boxBasis) {
    parts.push(draft.boxBasis === "nao-sei" ? "Medidas internas/externas a definir" : `Medidas ${draft.boxBasis}`);
  }
  if (draft.boxNoPersonalization) parts.push("Sem personalização");
  else {
    if (draft.boxPersonalization.length) parts.push(draft.boxPersonalization.join(", "));
    if (draft.boxPersonalization.includes("Nome ou frase") && draft.boxText.trim()) parts.push(draft.boxText.trim());
    if (draft.boxPersonalization.includes("QR Code") && draft.boxQrSource === "content" && draft.boxQrContent.trim()) parts.push(`QR: ${draft.boxQrContent.trim()}`);
  }
  if (draft.boxClosure && (draft.boxClosure !== "rosquear" || draft.boxShape === "Redonda")) {
    const closureLabels: Record<Exclude<Draft["boxClosure"], "">, string> = {
      deslizar: "Tampa de deslizar",
      encaixar: "Tampa de encaixar",
      rosquear: "Tampa de rosquear",
      "sem-tampa": "Sem tampa",
      "nao-sei": "Fechamento a definir",
    };
    parts.push(closureLabels[draft.boxClosure]);
  }
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

function SummaryRow({ label, value, onEdit }: { label: string; value: string; onEdit: () => void }) {
  return (
    <div className={styles.summaryRow}>
      <div><dt>{label}</dt><dd>{value}</dd></div>
      <button type="button" onClick={onEdit}>Editar</button>
    </div>
  );
}

export function QuoteFlow() {
  const [step, setStep] = useState(1);
  const [reviewing, setReviewing] = useState(false);
  const [boxDetailStep, setBoxDetailStep] = useState(0);
  const [draft, setDraft] = useState<Draft>(initialDraft);
  const [savedContacts, setSavedContacts] = useState({ whatsapp: "", email: "" });
  const [files, setFiles] = useState<SelectedFiles>({ model: [], logo: [], qr: [], boxLogo: [], boxQr: [], references: [] });
  const [error, setError] = useState<FieldError>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const boxDetailRef = useRef<HTMLDivElement>(null);

  useEffect(() => { headingRef.current?.focus(); }, [step, reviewing, draft.boxMode]);
  useEffect(() => {
    if (step === 2 && draft.type === "caixa" && draft.boxMode === "detailed") boxDetailRef.current?.scrollIntoView({ block: "start" });
  }, [boxDetailStep, draft.boxMode, draft.type, step]);
  useEffect(() => {
    if (error) document.querySelector(`.${styles.fieldError}`)?.scrollIntoView({ block: "center" });
  }, [error]);

  function update<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
    setError(null);
  }

  function chooseBoxMode(mode: Exclude<BoxMode, "">) {
    setBoxDetailStep(0);
    update("boxMode", mode);
  }

  function chooseBoxShape(shape: string) {
    setDraft((current) => ({
      ...current,
      boxShape: shape,
      boxClosure: shape !== "Redonda" && current.boxClosure === "rosquear" ? "" : current.boxClosure,
    }));
    setError(null);
  }

  function updateDimension(key: "boxDimensions" | "plateDimensions" | "modelDimensions", dimension: keyof Dimensions, value: string) {
    setDraft((current) => ({ ...current, [key]: { ...current[key], [dimension]: value } }));
    setError(null);
  }

  function addFiles(field: FileField, incoming: File[]) {
    if (!incoming.length) return;
    const unique = new Map([...files.references, ...incoming].map((file) => [fileIdentity(file), file]));
    const next = { ...files, [field]: field === "references" ? [...unique.values()] : incoming.slice(0, 1) };
    const active = visibleFiles(next, draft);
    const invalid = incoming.find((file) => !allowedExtensions[field].includes(file.name.split(".").pop()?.toLowerCase() ?? ""));
    if (invalid) return setError({ field, message: `Formato não aceito: ${invalid.name}.` });
    if (active.length > 5) return setError({ field, message: "Selecione no máximo 5 arquivos por pedido." });
    if (active.some((file) => file.size > 50 * 1024 * 1024)) return setError({ field, message: "Cada arquivo pode ter até 50 MB." });
    if (active.reduce((total, file) => total + file.size, 0) > 100 * 1024 * 1024) return setError({ field, message: "O pedido pode ter até 100 MB de arquivos." });
    setFiles(next);
    setError(null);
  }

  function removeFile(field: FileField, index: number) {
    setFiles((current) => ({ ...current, [field]: current[field].filter((_, fileIndex) => fileIndex !== index) }));
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
    setDraft((current) => ({
      ...current,
      colorMode: "tenho",
      colors: current.colors.length < 4 ? [...current.colors, { name: "", rgb: "" }] : current.colors,
    }));
    setError(null);
  }

  function removeColor(index: number) {
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
    if (stage === 3 && draft.boxShape === "Outro formato" && !draft.boxShapeOther.trim() && files.references.length === 0) return { field: "references", message: "Envie uma imagem do formato ou volte e descreva como ele será." };
    if (stage === 3 && !draft.boxNoPersonalization && draft.boxPersonalization.includes("Imagem ou desenho") && files.references.length === 0) return { field: "references", message: "Envie a imagem ou desenho para a personalização." };
    if (stage === 4 && !draft.boxClosure) return { field: "boxClosure", message: "Escolha o fechamento ou marque Ainda não sei." };
    if (stage === 5 && draft.colorMode !== "indeciso" && (draft.colors.length === 0 || draft.colors.length > 4 || !draft.colors.every(hasColor))) return { field: "colors", message: "Preencha cada cor adicionada ou marque Ainda não decidi." };
    return null;
  }

  function validateDetails(): FieldError {
    const activeFiles = visibleFiles(files, draft);
    if (activeFiles.length > 5 || activeFiles.reduce((total, file) => total + file.size, 0) > 100 * 1024 * 1024) {
      return { field: draft.type === "arquivo" ? "model" : "references", message: "Revise os arquivos: máximo de 5 e 100 MB no total." };
    }
    if (draft.type === "caixa" && draft.boxMode === "quick" && !draft.boxQuickDescription.trim() && files.references.length === 0) return { field: "boxQuickDescription", message: "Descreva sua ideia ou envie uma foto de referência." };
    if (draft.type === "placa" && !draft.plateContentUnknown && draft.plateContents.length === 0) return { field: "plateContents", message: "Escolha o que vai na placa." };
    if (draft.type === "placa" && !draft.plateContentUnknown && draft.plateContents.includes("Nome ou frase") && !draft.plateText.trim()) return { field: "plateText", message: "Digite o texto que vai na placa." };
    if (draft.type === "placa" && !draft.plateContentUnknown && draft.plateContents.includes("QR Code") && !draft.plateQrSource) return { field: "plateQrSource", message: "Escolha como quer informar o QR Code." };
    if (draft.type === "placa" && !draft.plateContentUnknown && draft.plateContents.includes("QR Code") && draft.plateQrSource === "content" && !draft.plateQrContent.trim()) return { field: "plateQrContent", message: "Informe o link ou texto do QR Code." };
    if (draft.type === "placa" && !draft.plateContentUnknown && draft.plateContents.includes("QR Code") && draft.plateQrSource === "file" && files.qr.length === 0) return { field: "qr", message: "Anexe o QR Code pronto." };
    if (draft.type === "placa" && !draft.plateUnknown && ![draft.plateDimensions.width, draft.plateDimensions.height].every(validDimension)) return { field: "plateDimensions", message: "Informe largura e altura em cm, ou marque Não sei as medidas." };
    if (draft.type === "arquivo" && files.model.length === 0) return { field: "model", message: "Selecione um arquivo STL ou 3MF para análise." };
    if (draft.type === "arquivo" && !draft.modelScaleUnknown && !draft.modelScale) return { field: "modelScale", message: "Escolha como quer definir o tamanho." };
    if (draft.type === "arquivo" && !draft.modelScaleUnknown && draft.modelScale === "alterar" && (!Object.values(draft.modelDimensions).some((value) => value.trim()) || Object.values(draft.modelDimensions).some((value) => value.trim() && !validDimension(value)))) return { field: "modelDimensions", message: "Informe pelo menos uma medida válida em cm para alterar o tamanho." };
    if (draft.type === "outro" && !draft.otherDescription.trim() && files.references.length === 0) return { field: "otherDescription", message: "Descreva a ideia ou anexe uma referência." };
    if (!(draft.type === "caixa" && draft.boxMode === "quick") && draft.colorMode !== "indeciso" && (draft.colors.length === 0 || draft.colors.length > 4 || !draft.colors.every(hasColor))) return { field: "colors", message: "Preencha cada cor adicionada ou marque Ainda não decidi." };
    return null;
  }

  function continueToContact() {
    if (draft.type === "caixa" && draft.boxMode === "detailed") {
      for (let stage = 0; stage <= 5; stage += 1) {
        const validation = validateBoxDetail(stage);
        if (validation) {
          setBoxDetailStep(stage);
          setError(validation);
          return;
        }
      }
    }
    const validation = validateDetails();
    if (validation) {
      if (draft.type === "caixa" && draft.boxMode === "detailed" && validation.field === "references") setBoxDetailStep(3);
      return setError(validation);
    }
    setError(null);
    setStep(3);
  }

  function advanceBoxDetail() {
    const validation = validateBoxDetail(boxDetailStep);
    if (validation) return setError(validation);
    if (boxDetailStep < 5) {
      setError(null);
      setBoxDetailStep(boxDetailStep + 1);
    } else continueToContact();
  }

  function reviewRequest() {
    let validation: FieldError = null;
    if (!draft.name.trim()) validation = { field: "name", message: "Informe seu nome." };
    else if (draft.contactMethod === "whatsapp" && !/^\d{10,13}$/.test(draft.contact.replace(/\D/g, ""))) validation = { field: "contact", message: "Confira o número de WhatsApp com DDD." };
    else if (draft.contactMethod === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.contact.trim())) validation = { field: "contact", message: "Confira o endereço de e-mail." };
    else if (!draft.delivery) validation = { field: "delivery", message: "Escolha como prefere receber o pedido." };
    else if (draft.delivery === "envio" && draft.cep.replace(/\D/g, "").length !== 8) validation = { field: "cep", message: "Informe um CEP com 8 números." };
    if (validation) return setError(validation);
    setError(null);
    setReviewing(true);
  }

  function edit(target: number) {
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

  const title = step === 1 ? "O que vamos criar para você?"
    : step === 2 ? ({ caixa: "Vamos montar sua caixa!", placa: "Vamos criar sua placa!", arquivo: "Vamos imprimir seu projeto!", outro: "Conte sua ideia!" } as const)[draft.type ?? "outro"]
    : reviewing ? "Confira seu pedido" : "Estamos quase lá!";
  const showingBoxForm = step === 2 && draft.type === "caixa" && draft.boxMode !== "";
  const quantitySummary = `${draft.quantity} ${draft.quantity === 1 ? "unidade" : "unidades"}`;
  const colorQuantitySummary = `${draft.colorMode === "indeciso" ? "Cores a decidir" : draft.colors.map(colorText).filter(Boolean).join(", ") || "Cores não informadas"} · ${quantitySummary}`;

  return (
    <section className={styles.step} aria-labelledby="quote-step-title">
      <div className={styles.progressMeta}><span>Etapa {step} de 3</span><span>{["", "Escolher", "Personalizar", "Enviar"][step]}</span></div>
      <div className={styles.progress} role="progressbar" aria-label="Progresso do orçamento" aria-valuemin={1} aria-valuemax={3} aria-valuenow={step}>
        {[1, 2, 3].map((item) => <span key={item} className={item <= step ? styles.progressActive : undefined} />)}
      </div>
      {showingBoxForm ? (
        <h2 className={styles.visuallyHidden} id="quote-step-title" ref={headingRef} tabIndex={-1}>
          {draft.boxMode === "quick" ? "Pedido rápido da caixa" : "Detalhes da caixa"}
        </h2>
      ) : (
        <div className={styles.stepHeading}>
          <h2 id="quote-step-title" ref={headingRef} tabIndex={-1}>{title}</h2>
          <p>{step === 1 ? "Escolha uma opção para começar." : step === 2 ? "Responda do seu jeito. Você pode voltar e ajustar depois." : reviewing ? "Veja se está tudo certo antes de solicitar o orçamento." : "Só precisamos dos seus dados para preparar o pedido."}</p>
        </div>
      )}

      {step === 1 ? (
        <fieldset className={styles.options}>
          <legend className={styles.visuallyHidden}>Tipo de projeto</legend>
          {projectOptions.map((option, index) => (
            <label className={styles.option} key={option.value}>
              <input type="radio" name="quote-project-type" value={option.value} checked={draft.type === option.value} onClick={() => { update("type", option.value); setStep(2); }} onChange={() => { update("type", option.value); setStep(2); }} />
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
        <div className={styles.formPanel} ref={boxDetailRef}>
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
                      {(!draft.boxNoPersonalization && draft.boxPersonalization.includes("Imagem ou desenho")) || (draft.boxShape === "Outro formato" && !draft.boxShapeOther.trim()) ? <FilePicker id="references" label="Envie uma imagem ou desenho da caixa" accept=".png,.jpg,.jpeg,.webp,.pdf" files={files.references} multiple onAdd={addFiles} onRemove={removeFile} error={error} /> : null}
                      {!draft.boxNoPersonalization && draft.boxPersonalization.includes("QR Code") ? (
                        <>
                          <QrSourcePicker name="box" value={draft.boxQrSource} onChange={(value) => update("boxQrSource", value)} error={error} />
                          {draft.boxQrSource === "content" ? <div className={styles.field}><label htmlFor="box-qr">O que o QR Code deve exibir?</label><input id="box-qr" type="text" value={draft.boxQrContent} aria-invalid={error?.field === "boxQrContent"} onChange={(event) => update("boxQrContent", event.target.value)} placeholder="Link ou texto" /><InlineError error={error} field="boxQrContent" /></div> : null}
                          {draft.boxQrSource === "file" ? <FilePicker id="boxQr" label="Anexe seu QR Code pronto" accept=".png,.jpg,.jpeg,.webp,.pdf" files={files.boxQr} onAdd={addFiles} onRemove={removeFile} error={error} /> : null}
                        </>
                      ) : null}
                    </>
                  ) : null}
                  {boxDetailStep === 4 ? (
                    <div className={`${styles.field} ${draft.boxClosure === "nao-sei" ? styles.fieldSkipped : ""}`}>
                      <div className={styles.fieldHeading}>
                        <span className={styles.fieldLabel}>Como você quer o fechamento da caixa?</span>
                        <button className={styles.skipButton} type="button" aria-pressed={draft.boxClosure === "nao-sei"} onClick={() => update("boxClosure", draft.boxClosure === "nao-sei" ? "" : "nao-sei")}>Ainda não sei</button>
                      </div>
                      <div className={styles.choiceButtons} role="group" aria-label="Tipo de fechamento da caixa">
                        {boxClosureOptions.filter((option) => option.value !== "rosquear" || draft.boxShape === "Redonda").map((option) => (
                          <button type="button" key={option.value} disabled={draft.boxClosure === "nao-sei"} aria-pressed={draft.boxClosure === option.value} onClick={() => update("boxClosure", option.value)}>{option.label}</button>
                        ))}
                      </div>
                      <InlineError error={error} field="boxClosure" />
                    </div>
                  ) : null}
                </>
              ) : null}
            </>
          ) : null}

          {draft.type === "placa" ? (
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
              {!draft.plateContentUnknown && draft.plateContents.includes("Nome ou frase") ? (
                <div className={styles.field}><label htmlFor="plate-text">Qual texto vai na placa?</label><input id="plate-text" type="text" value={draft.plateText} aria-invalid={error?.field === "plateText"} onChange={(event) => update("plateText", event.target.value)} placeholder="Digite o nome ou a frase" /><InlineError error={error} field="plateText" /></div>
              ) : null}
              {!draft.plateContentUnknown && draft.plateContents.includes("Logotipo") ? <FilePicker id="logo" label="Envie seu logotipo, se já tiver" accept=".png,.jpg,.jpeg,.webp,.pdf" files={files.logo} onAdd={addFiles} onRemove={removeFile} error={error} /> : null}
              {!draft.plateContentUnknown && draft.plateContents.includes("QR Code") ? (
                <>
                  <QrSourcePicker name="plate" value={draft.plateQrSource} onChange={(value) => update("plateQrSource", value)} error={error} />
                  {draft.plateQrSource === "content" ? <div className={styles.field}><label htmlFor="plate-qr">O que o QR Code deve exibir?</label><input id="plate-qr" type="text" value={draft.plateQrContent} aria-invalid={error?.field === "plateQrContent"} onChange={(event) => update("plateQrContent", event.target.value)} placeholder="Link ou texto" /><InlineError error={error} field="plateQrContent" /></div> : null}
                  {draft.plateQrSource === "file" ? <FilePicker id="qr" label="Anexe seu QR Code pronto" accept=".png,.jpg,.jpeg,.webp,.pdf" files={files.qr} onAdd={addFiles} onRemove={removeFile} error={error} /> : null}
                </>
              ) : null}
              <div className={styles.field}>
                <label htmlFor="plate-use">Onde a placa será usada?</label>
                <select id="plate-use" value={draft.plateUse} onChange={(event) => update("plateUse", event.target.value)}><option value="">Selecione, se souber</option><option value="Balcão">Balcão</option><option value="Mesa">Mesa</option><option value="Parede">Parede</option><option value="Outro lugar">Outro lugar</option></select>
              </div>
              <div className={styles.field}><label htmlFor="plate-fixation">Como pretende colocar a placa? <small>Opcional</small></label><input id="plate-fixation" type="text" value={draft.plateFixation} onChange={(event) => update("plateFixation", event.target.value)} placeholder="Apoiada, pendurada, fixada..." /></div>
              <DimensionFields id="plate" value={draft.plateDimensions} onChange={(dimension, value) => updateDimension("plateDimensions", dimension, value)} unknown={draft.plateUnknown} onUnknown={(value) => update("plateUnknown", value)} error={error} />
            </>
          ) : null}

          {draft.type === "arquivo" ? (
            <>
              <FilePicker id="model" label="Envie seu arquivo 3D" accept=".stl,.3mf" files={files.model} onAdd={addFiles} onRemove={removeFile} error={error} />
              <div className={`${styles.field} ${draft.modelScaleUnknown ? styles.fieldSkipped : ""}`}>
                <div className={styles.fieldHeading}>
                  <span className={styles.fieldLabel}>Quer alterar o tamanho?</span>
                  <button className={styles.skipButton} type="button" aria-pressed={draft.modelScaleUnknown} onClick={() => update("modelScaleUnknown", !draft.modelScaleUnknown)}>Não sei</button>
                </div>
                <div className={styles.choiceButtons} role="group" aria-label="Tamanho da impressão">
                  {[["original", "Manter original"], ["alterar", "Informar outro tamanho"]].map(([value, label]) => <button type="button" key={value} disabled={draft.modelScaleUnknown} aria-pressed={draft.modelScale === value} onClick={() => update("modelScale", value)}>{label}</button>)}
                </div>
                <InlineError error={error} field="modelScale" />
              </div>
              {!draft.modelScaleUnknown && draft.modelScale === "alterar" ? <DimensionFields id="model" value={draft.modelDimensions} onChange={(dimension, value) => updateDimension("modelDimensions", dimension, value)} unknown={false} onUnknown={() => undefined} allowUnknown={false} depth error={error} /> : null}
              <div className={styles.field}><label htmlFor="model-notes">Alguma exigência importante? <small>Opcional</small></label><textarea id="model-notes" value={draft.modelNotes} onChange={(event) => update("modelNotes", event.target.value)} placeholder="Ex.: encaixe, resistência ou outra observação." /></div>
            </>
          ) : null}

          {draft.type === "outro" ? (
            <>
              <div className={styles.field}><label htmlFor="other-description">O que você gostaria de criar?</label><textarea id="other-description" value={draft.otherDescription} aria-invalid={error?.field === "otherDescription"} onChange={(event) => update("otherDescription", event.target.value)} placeholder="Pode explicar do seu jeito, sem termos técnicos." /><InlineError error={error} field="otherDescription" /></div>
              <div className={styles.field}><label htmlFor="other-size">Sabe o tamanho aproximado? <small>Opcional</small></label><input id="other-size" type="text" value={draft.otherSize} onChange={(event) => update("otherSize", event.target.value)} placeholder="Escreva o que souber" /></div>
            </>
          ) : null}

          {draft.type === "placa" || draft.type === "outro" ? <FilePicker id="references" label="Tem fotos, desenhos ou referências? (opcional)" accept=".png,.jpg,.jpeg,.webp,.pdf" files={files.references} multiple onAdd={addFiles} onRemove={removeFile} error={error} /> : null}

          {draft.type !== "caixa" || (draft.boxMode === "detailed" && boxDetailStep === 5) ? (
            <div className={`${styles.field} ${draft.colorMode === "indeciso" ? styles.fieldSkipped : ""}`}>
              <div className={styles.fieldHeading}>
                <span className={styles.fieldLabel}>Quais cores você prefere?</span>
                <button className={styles.skipButton} type="button" aria-pressed={draft.colorMode === "indeciso"} onClick={() => update("colorMode", draft.colorMode === "indeciso" ? (draft.colors.some(hasColor) ? "tenho" : "") : "indeciso")}>Ainda não decidi</button>
              </div>
              <p className={styles.fieldHint}>Adicione até 4 cores pelo nome ou pelo círculo RGB. A disponibilidade será confirmada no orçamento.</p>
              <div className={styles.colorsList}>
                {draft.colors.map((color, index) => (
                  <div className={styles.colorEntry} key={index}>
                    <div className={styles.colorRow}>
                      <input type="text" aria-label={`Cor ${index + 1} por nome`} value={color.name} disabled={draft.colorMode === "indeciso"} aria-invalid={error?.field === "colors" && !hasColor(color)} onChange={(event) => updateColor(index, { name: event.target.value })} placeholder={`Cor ${index + 1}: ex. preto ou vermelho`} />
                      <label className={styles.rgbPicker} title={`Escolher a cor ${index + 1} no seletor RGB`}>
                        <span className={styles.rgbPickerSwatch} style={color.rgb ? { background: color.rgb } : undefined} aria-hidden="true" />
                        <input type="color" aria-label={`Selecionar RGB da cor ${index + 1}`} value={color.rgb || "#8055ff"} disabled={draft.colorMode === "indeciso"} onChange={(event) => updateColor(index, { rgb: event.target.value })} />
                      </label>
                      {index > 0 && draft.colorMode !== "indeciso" ? <button className={styles.colorRemove} type="button" aria-label={`Remover cor ${index + 1}`} onClick={() => removeColor(index)}>×</button> : null}
                      {index === draft.colors.length - 1 && draft.colors.length < 4 && draft.colorMode !== "indeciso" ? <button className={styles.colorAdd} type="button" aria-label="Adicionar outra cor" onClick={addColor}>+</button> : null}
                    </div>
                    {color.rgb && draft.colorMode !== "indeciso" ? <small className={styles.rgbValue}>{colorText({ name: "", rgb: color.rgb })}</small> : null}
                  </div>
                ))}
              </div>
              <InlineError error={error} field="colors" />
            </div>
          ) : null}

          {draft.type !== "caixa" || draft.boxMode === "quick" || (draft.boxMode === "detailed" && boxDetailStep === 5) ? <QuantityPicker value={draft.quantity} onChange={(value) => update("quantity", value)} /> : null}
          {draft.type !== "caixa" || draft.boxMode ? <p className={styles.filePolicy}>Arquivos selecionados ficam neste navegador. Limite: 5 arquivos, até 50 MB cada e 100 MB no total.</p> : null}
          {draft.type === "caixa" ? (
            <div className={styles.actions}>
              <button type="button" className={styles.secondaryAction} onClick={() => { if (draft.boxMode === "detailed" && boxDetailStep > 0) setBoxDetailStep(boxDetailStep - 1); else if (draft.boxMode) update("boxMode", ""); else edit(1); }}><span aria-hidden="true">←</span> Voltar</button>
              {draft.boxMode ? <button type="button" className={styles.primaryAction} onClick={draft.boxMode === "detailed" ? advanceBoxDetail : continueToContact}>Continuar <span aria-hidden="true">→</span></button> : null}
            </div>
          ) : <div className={styles.actions}><button type="button" className={styles.secondaryAction} onClick={() => edit(1)}><span aria-hidden="true">←</span> Voltar</button><button type="button" className={styles.primaryAction} onClick={continueToContact}>Continuar <span aria-hidden="true">→</span></button></div>}
        </div>
      ) : null}

      {step === 3 && !reviewing ? (
        <div className={styles.formPanel}>
          <div className={styles.field}><label htmlFor="quote-name">Qual é o seu nome?</label><input id="quote-name" type="text" autoComplete="name" value={draft.name} aria-invalid={error?.field === "name"} onChange={(event) => update("name", event.target.value)} placeholder="Seu nome" /><InlineError error={error} field="name" /></div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Como prefere que a gente entre em contato?</span>
            <div className={styles.choiceButtons} role="group" aria-label="Canal de contato">
              <button type="button" aria-pressed={draft.contactMethod === "whatsapp"} onClick={() => chooseContactMethod("whatsapp")}>WhatsApp</button>
              <button type="button" aria-pressed={draft.contactMethod === "email"} onClick={() => chooseContactMethod("email")}>E-mail</button>
            </div>
          </div>
          <div className={styles.field}><label htmlFor="quote-contact">Seu {draft.contactMethod === "whatsapp" ? "WhatsApp" : "e-mail"}</label><input id="quote-contact" type={draft.contactMethod === "email" ? "email" : "tel"} inputMode={draft.contactMethod === "email" ? "email" : "tel"} autoComplete={draft.contactMethod === "email" ? "email" : "tel"} value={draft.contact} aria-invalid={error?.field === "contact"} onChange={(event) => changeContact(event.target.value)} placeholder={draft.contactMethod === "email" ? "voce@exemplo.com" : "(00) 00000-0000"} /><InlineError error={error} field="contact" /></div>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Como prefere receber seu pedido?</span>
            <div className={styles.choiceButtons} role="group" aria-label="Entrega do pedido">
              <button type="button" aria-pressed={draft.delivery === "retirada"} onClick={() => update("delivery", "retirada")}>Retirar em São Caetano do Sul</button>
              <button type="button" aria-pressed={draft.delivery === "envio"} onClick={() => update("delivery", "envio")}>Receber no meu endereço pela Shopee</button>
            </div>
            <InlineError error={error} field="delivery" />
          </div>
          {draft.delivery === "envio" ? <div className={styles.field}><label htmlFor="quote-cep">Qual é o seu CEP?</label><input id="quote-cep" type="text" inputMode="numeric" autoComplete="postal-code" value={draft.cep} aria-invalid={error?.field === "cep"} onChange={(event) => update("cep", event.target.value)} placeholder="00000-000" /><small>Depois do orçamento, combinaremos os detalhes do envio pela Shopee.</small><InlineError error={error} field="cep" /></div> : null}
          <div className={styles.actions}><button type="button" className={styles.secondaryAction} onClick={() => edit(2)}><span aria-hidden="true">←</span> Voltar</button><button type="button" className={styles.primaryAction} onClick={reviewRequest}>Conferir pedido <span aria-hidden="true">→</span></button></div>
        </div>
      ) : null}

      {step === 3 && reviewing ? (
        <div className={styles.formPanel}>
          <dl className={styles.summary}>
            <SummaryRow label="Projeto" value={projectOptions.find((option) => option.value === draft.type)?.title ?? "Não informado"} onEdit={() => edit(1)} />
            {draft.type === "caixa" ? <SummaryRow label="Caixa" value={boxSummary(draft)} onEdit={() => edit(2)} /> : null}
            {draft.type === "placa" ? <SummaryRow label="Placa" value={`${draft.plateContentUnknown ? "Conteúdo a decidir" : draft.plateContents.join(", ")}${!draft.plateContentUnknown && draft.plateContents.includes("Nome ou frase") && draft.plateText ? ` · ${draft.plateText}` : ""}${!draft.plateContentUnknown && draft.plateContents.includes("QR Code") && draft.plateQrSource === "content" && draft.plateQrContent ? ` · QR: ${draft.plateQrContent}` : ""} · ${dimensionsText(draft.plateDimensions, draft.plateUnknown)}${draft.plateUse ? ` · Uso: ${draft.plateUse}` : ""}${draft.plateFixation ? ` · Fixação: ${draft.plateFixation}` : ""}`} onEdit={() => edit(2)} /> : null}
            {draft.type === "arquivo" ? <SummaryRow label="Impressão" value={`${draft.modelScaleUnknown ? "Tamanho a definir" : draft.modelScale === "alterar" ? dimensionsText(draft.modelDimensions, false, true) : "Tamanho original"}${draft.modelNotes ? ` · ${draft.modelNotes}` : ""}`} onEdit={() => edit(2)} /> : null}
            {draft.type === "outro" ? <SummaryRow label="Ideia" value={`${draft.otherDescription || "Descrita pela referência"}${draft.otherSize ? ` · ${draft.otherSize}` : ""}`} onEdit={() => edit(2)} /> : null}
            <SummaryRow label={draft.type === "caixa" && draft.boxMode === "quick" ? "Quantidade" : "Cor e quantidade"} value={draft.type === "caixa" && draft.boxMode === "quick" ? quantitySummary : colorQuantitySummary} onEdit={() => edit(2)} />
            {visibleFiles(files, draft).length ? <SummaryRow label="Arquivos" value={visibleFiles(files, draft).map((file) => file.name).join(", ")} onEdit={() => edit(2)} /> : null}
            <SummaryRow label="Contato" value={`${draft.name} · ${draft.contactMethod === "email" ? "E-mail" : "WhatsApp"}: ${draft.contact}`} onEdit={() => edit(3)} />
            <SummaryRow label="Entrega" value={draft.delivery === "retirada" ? "Retirada em São Caetano do Sul" : `Receber no meu endereço pela Shopee · CEP ${draft.cep}`} onEdit={() => edit(3)} />
          </dl>
          <p className={styles.privacyNote}>Seus dados serão usados para analisar esta solicitação e retornar pelo contato escolhido.</p>
          <p className={styles.pendingNotice} role="status">O envio ainda não está disponível. Nenhuma informação ou arquivo foi transmitido.</p>
          <div className={styles.actions}><button type="button" className={styles.secondaryAction} onClick={() => setReviewing(false)}><span aria-hidden="true">←</span> Voltar</button><button type="button" className={styles.primaryAction} disabled>Solicitar orçamento</button></div>
        </div>
      ) : null}
    </section>
  );
}
