"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent
} from "react";
import { trackPublicEvent } from "@/lib/public-analytics";
import styles from "./quote-wizard.module.css";

type ProjectType = "impressao" | "placa" | "caixa" | "outro";
type ContactMethod = "whatsapp" | "email";
type MaterialChoice = "" | "nao-sei" | "tenho-preferencia";

const labels: Record<ProjectType, string> = {
  impressao: "Imprimir um arquivo 3D que já tenho",
  placa: "Criar uma placa personalizada",
  caixa: "Criar uma caixa sob medida",
  outro: "Outro projeto"
};

const startingPointOptions = [
  "Tenho logo, desenho ou arte",
  "Tenho foto ou referência",
  "Tenho as medidas",
  "Tenho apenas a ideia",
  "Já tenho arquivo 3D"
] as const;

const plateContents = ["Logo", "Texto", "QR Code", "Combinação / outro"] as const;
const boxFeatures = ["Tampa", "Divisórias", "Encaixe", "Furo / passagem de cabo", "Outro"] as const;

function toggleValue(list: string[], value: string) {
  return list.includes(value)
    ? list.filter((item) => item !== value)
    : [...list, value];
}

function fileNames(fileList: FileList | null) {
  if (!fileList) return [];
  return Array.from(new Set(Array.from(fileList).map((file) => file.name)));
}

function FilePicker({
  files,
  noFile,
  onFilesChange,
  onNoFileChange,
  required
}: {
  files: string[];
  noFile: boolean;
  onFilesChange: (files: string[]) => void;
  onNoFileChange: (value: boolean) => void;
  required?: boolean;
}) {
  function addFiles(nextFiles: string[]) {
    onFilesChange(Array.from(new Set([...files, ...nextFiles])));
    if (nextFiles.length) onNoFileChange(false);
  }

  function handleInput(event: ChangeEvent<HTMLInputElement>) {
    addFiles(fileNames(event.target.files));
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    addFiles(fileNames(event.dataTransfer.files));
  }

  return (
    <div className={styles.filePicker}>
      <div
        className={styles.fileDrop}
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleDrop}
      >
        <label htmlFor="quote-files">
          {required ? "Arquivo para análise" : "Fotos, arte, PDF ou referência"}
        </label>
        <input
          id="quote-files"
          type="file"
          multiple
          onChange={handleInput}
          aria-describedby="quote-files-help"
        />
        <small id="quote-files-help">
          No celular, use o seletor nativo. No desktop, você também pode arrastar arquivos.
          Nesta prévia, nada é enviado para o servidor.
        </small>
      </div>

      {files.length ? (
        <ul className={styles.fileList} aria-label="Arquivos selecionados">
          {files.map((file) => (
            <li key={file}>
              <span>{file}</span>
              <button
                type="button"
                onClick={() => onFilesChange(files.filter((item) => item !== file))}
              >
                Remover
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {!required ? (
        <label className={styles.checkChoice}>
          <input
            type="checkbox"
            checked={noFile}
            onChange={(event) => {
              onNoFileChange(event.target.checked);
              if (event.target.checked) onFilesChange([]);
            }}
          />
          <span>Não tenho arquivo ou referência agora</span>
        </label>
      ) : null}
    </div>
  );
}

export function QuoteWizard({
  initialType,
  initialReference,
  initialOrigin
}: {
  initialType?: ProjectType;
  initialReference?: string;
  initialOrigin?: string;
}) {
  const [step, setStep] = useState(initialType ? 2 : 1);
  const [type, setType] = useState<ProjectType | null>(initialType ?? null);
  const [startingPoints, setStartingPoints] = useState<string[]>([]);
  const [files, setFiles] = useState<string[]>([]);
  const [noFile, setNoFile] = useState(false);

  const [details, setDetails] = useState("");
  const [quantity, setQuantity] = useState("");
  const [sizeScale, setSizeScale] = useState("");
  const [material, setMaterial] = useState<MaterialChoice>("");
  const [color, setColor] = useState("");
  const [deadline, setDeadline] = useState("");

  const [plateUse, setPlateUse] = useState("");
  const [plateContent, setPlateContent] = useState<string[]>([]);
  const [plateSize, setPlateSize] = useState("");
  const [plateLighting, setPlateLighting] = useState("");

  const [boxContents, setBoxContents] = useState("");
  const [boxDimensions, setBoxDimensions] = useState("");
  const [boxMeasurementBasis, setBoxMeasurementBasis] = useState("");
  const [boxSelectedFeatures, setBoxSelectedFeatures] = useState<string[]>([]);

  const [contactMethod, setContactMethod] = useState<ContactMethod>("whatsapp");
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [error, setError] = useState("");

  const headingRef = useRef<HTMLHeadingElement>(null);
  const analyticsStartedRef = useRef(false);
  const totalSteps = type === "impressao" ? 5 : 6;

  const stepTitle = useMemo(() => {
    if (step === 1) return "O que você precisa?";

    if (type === "impressao") {
      return [
        "",
        "",
        "Envie o arquivo para análise.",
        "Como você quer produzir?",
        "Como podemos falar com você?",
        "Revise o pedido."
      ][step] ?? "Seu projeto";
    }

    if (step === 2) return "De onde estamos começando?";
    if (step === 3 && type === "placa") return "Como essa placa precisa funcionar?";
    if (step === 3 && type === "caixa") return "O que essa caixa precisa resolver?";
    if (step === 3) return "Conte o que precisa ser resolvido.";
    if (step === 4) return "Mostre o que você já tem.";
    if (step === 5) return "Como podemos falar com você?";
    return "Revise o pedido.";
  }, [step, type]);

  useEffect(() => {
    headingRef.current?.focus();
  }, [step]);

  function validateStep() {
    if (step === 1 && !type) return "Escolha o tipo de projeto para continuar.";

    if (type === "impressao") {
      if (step === 2 && files.length === 0) {
        return "Selecione pelo menos um arquivo para a análise local desta prévia.";
      }
      if (step === 3 && !quantity.trim()) {
        return "Informe a quantidade ou escreva uma estimativa.";
      }
      if (step === 4) {
        if (!name.trim()) return "Informe seu nome.";
        if (!contact.trim()) return "Informe o contato escolhido.";
        if (contactMethod === "email" && !contact.includes("@")) {
          return "Confira o endereço de e-mail.";
        }
        if (contactMethod === "whatsapp" && contact.replace(/\D/g, "").length < 8) {
          return "Confira o número de WhatsApp.";
        }
      }
      return "";
    }

    if (step === 2 && startingPoints.length === 0) {
      return "Marque pelo menos um ponto de partida.";
    }

    if (step === 3 && type === "placa") {
      if (!plateUse) return "Informe onde a placa será usada.";
      if (plateContent.length === 0) return "Marque o que a placa precisa mostrar.";
    }

    if (step === 3 && type === "caixa" && !boxContents.trim()) {
      return "Explique o que precisa caber ou ser protegido.";
    }

    if (step === 3 && type === "outro" && !details.trim()) {
      return "Explique brevemente o que a peça precisa fazer.";
    }

    if (step === 4) {
      if (!quantity.trim()) return "Informe a quantidade ou uma estimativa.";
      if (!files.length && !noFile) {
        return "Selecione uma referência ou marque que ainda não tem arquivo.";
      }
    }

    if (step === 5) {
      if (!name.trim()) return "Informe seu nome.";
      if (!contact.trim()) return "Informe o contato escolhido.";
      if (contactMethod === "email" && !contact.includes("@")) {
        return "Confira o endereço de e-mail.";
      }
      if (contactMethod === "whatsapp" && contact.replace(/\D/g, "").length < 8) {
        return "Confira o número de WhatsApp.";
      }
    }

    return "";
  }

  function next() {
    const validationError = validateStep();
    if (validationError) {
      setError(validationError);
      return;
    }

    if (type) {
      trackPublicEvent("quote_step_completed", {
        projectType: type,
        step,
        origin: initialOrigin,
        reference: initialReference
      });
    }

    setError("");
    setStep((current) => Math.min(totalSteps, current + 1));
  }

  function back() {
    setError("");
    setStep((current) => Math.max(1, current - 1));
  }

  function edit(targetStep: number) {
    setError("");
    setStep(targetStep);
  }

  function renderProjectDetails() {
    if (type === "placa") {
      return (
        <>
          <div className={styles.fieldGroup}>
            <label htmlFor="plate-use">Onde a placa será usada?</label>
            <select id="plate-use" value={plateUse} onChange={(event) => setPlateUse(event.target.value)}>
              <option value="">Selecione</option>
              <option value="balcao">Balcão</option>
              <option value="parede">Parede</option>
              <option value="mesa">Mesa</option>
              <option value="outro">Outro uso</option>
              <option value="nao-sei">Não sei ainda</option>
            </select>
          </div>

          <fieldset className={styles.choiceFieldset}>
            <legend>O que a placa precisa mostrar?</legend>
            <div className={styles.choiceGrid}>
              {plateContents.map((option) => (
                <label className={styles.checkChoice} key={option}>
                  <input
                    type="checkbox"
                    checked={plateContent.includes(option)}
                    onChange={() => setPlateContent(toggleValue(plateContent, option))}
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className={styles.fieldGroup}>
            <label htmlFor="plate-size">Tamanho aproximado</label>
            <input
              id="plate-size"
              value={plateSize}
              onChange={(event) => setPlateSize(event.target.value)}
              placeholder="Ex.: 18 × 12 cm, ou não sei ainda"
            />
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="plate-lighting">Iluminação</label>
            <select
              id="plate-lighting"
              value={plateLighting}
              onChange={(event) => setPlateLighting(event.target.value)}
            >
              <option value="">Não informado</option>
              <option value="nao">Não preciso</option>
              <option value="avaliar">Gostaria de avaliar se é possível</option>
              <option value="nao-sei">Não sei ainda</option>
            </select>
          </div>
        </>
      );
    }

    if (type === "caixa") {
      return (
        <>
          <div className={styles.fieldGroup}>
            <label htmlFor="box-contents">O que precisa caber ou ser protegido?</label>
            <textarea
              id="box-contents"
              value={boxContents}
              onChange={(event) => setBoxContents(event.target.value)}
              placeholder="Descreva o objeto e a função da caixa."
            />
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="box-measurement-basis">As medidas são internas ou externas?</label>
            <select
              id="box-measurement-basis"
              value={boxMeasurementBasis}
              onChange={(event) => setBoxMeasurementBasis(event.target.value)}
            >
              <option value="">Selecione</option>
              <option value="internas">Internas</option>
              <option value="externas">Externas</option>
              <option value="nao-sei">Não sei ainda</option>
            </select>
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="box-dimensions">Medidas conhecidas</label>
            <input
              id="box-dimensions"
              value={boxDimensions}
              onChange={(event) => setBoxDimensions(event.target.value)}
              placeholder="Comprimento × largura × altura, ou não sei ainda"
            />
          </div>

          <fieldset className={styles.choiceFieldset}>
            <legend>Precisa de algum destes recursos?</legend>
            <div className={styles.choiceGrid}>
              {boxFeatures.map((option) => (
                <label className={styles.checkChoice} key={option}>
                  <input
                    type="checkbox"
                    checked={boxSelectedFeatures.includes(option)}
                    onChange={() => setBoxSelectedFeatures(toggleValue(boxSelectedFeatures, option))}
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          </fieldset>
        </>
      );
    }

    return (
      <div className={styles.fieldGroup}>
        <label htmlFor="project-details">O que a peça precisa fazer?</label>
        <textarea
          id="project-details"
          value={details}
          onChange={(event) => setDetails(event.target.value)}
          placeholder="Explique o uso, medidas conhecidas e o que precisa ser resolvido."
        />
      </div>
    );
  }

  const contactStep = type === "impressao" ? 4 : 5;
  const reviewStep = totalSteps;

  return (
    <section
      className={styles.wizard}
      aria-labelledby="quote-question"
      data-quote-type={type ?? undefined}
      data-quote-step={step}
    >
      <div className={styles.progress}>
        <span>Orçamento</span>
        <span>Etapa {step} de {totalSteps}</span>
      </div>

      <h2 className={styles.question} id="quote-question" ref={headingRef} tabIndex={-1}>
        {stepTitle}
      </h2>

      {initialReference || initialOrigin ? (
        <p className={styles.contextNote}>
          Contexto preservado deste acesso: {initialReference ? `referência ${initialReference}` : "sem referência específica"}
          {initialOrigin ? ` · origem ${initialOrigin}` : ""}.
        </p>
      ) : null}

      {error ? (
        <p className={styles.error} role="alert">{error}</p>
      ) : null}

      {step === 1 ? (
        <>
          <p className={styles.help}>
            Começamos pela intenção para não fazer você responder perguntas que não têm relação com o projeto.
          </p>
          <div className={styles.options}>
            {(Object.keys(labels) as ProjectType[]).map((option) => (
              <button
                className={styles.option}
                key={option}
                type="button"
                aria-pressed={type === option}
                onClick={() => {
                  if (!analyticsStartedRef.current) {
                    analyticsStartedRef.current = true;
                    trackPublicEvent("quote_start", {
                      projectType: option,
                      origin: initialOrigin,
                      reference: initialReference
                    });
                  }
                  setType(option);
                  trackPublicEvent("quote_type_selected", {
                    projectType: option,
                    origin: initialOrigin,
                    reference: initialReference
                  });
                }}
              >
                <span>{labels[option]}</span>
                <span aria-hidden="true">→</span>
              </button>
            ))}
          </div>
        </>
      ) : null}

      {step === 2 && type === "impressao" ? (
        <>
          <p className={styles.help}>
            O arquivo é o ponto de partida. A seleção abaixo é somente local até o backend privado estar definido.
          </p>
          <FilePicker
            files={files}
            noFile={false}
            onFilesChange={(nextFiles) => {
              if (nextFiles.length > files.length) {
                trackPublicEvent("quote_file_added", {
                  projectType: "impressao",
                  step,
                  origin: initialOrigin,
                  reference: initialReference
                });
              }
              setFiles(nextFiles);
            }}
            onNoFileChange={() => undefined}
            required
          />
          <div className={styles.fieldGroup}>
            <label htmlFor="print-notes">Exigência importante da peça</label>
            <textarea
              id="print-notes"
              value={details}
              onChange={(event) => setDetails(event.target.value)}
              placeholder="Função, tamanho obrigatório, encaixe, resistência ou outra observação."
            />
          </div>
        </>
      ) : null}

      {step === 2 && type !== "impressao" ? (
        <>
          <p className={styles.help}>
            Pode marcar mais de uma opção. Isso evita perguntas desnecessárias nas próximas etapas.
          </p>
          <div className={styles.choiceGrid}>
            {startingPointOptions.map((option) => (
              <label className={styles.checkChoice} key={option}>
                <input
                  type="checkbox"
                  checked={startingPoints.includes(option)}
                  onChange={() => setStartingPoints(toggleValue(startingPoints, option))}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        </>
      ) : null}

      {step === 3 && type !== "impressao" ? renderProjectDetails() : null}

      {step === 3 && type === "impressao" ? (
        <>
          <div className={styles.fieldGroup}>
            <label htmlFor="quantity">Quantidade</label>
            <input
              id="quantity"
              inputMode="numeric"
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
              placeholder="Ex.: 2"
            />
          </div>
          <div className={styles.fieldGroup}>
            <label htmlFor="size-scale">Tamanho ou escala obrigatórios</label>
            <input
              id="size-scale"
              value={sizeScale}
              onChange={(event) => setSizeScale(event.target.value)}
              placeholder="Ex.: 120 mm de altura, 100%, ou não sei"
            />
          </div>
          <div className={styles.fieldGroup}>
            <label htmlFor="material">Material</label>
            <select id="material" value={material} onChange={(event) => setMaterial(event.target.value as MaterialChoice)}>
              <option value="">Não informado</option>
              <option value="nao-sei">Não sei, preciso de orientação</option>
              <option value="tenho-preferencia">Tenho uma preferência</option>
            </select>
          </div>
          <div className={styles.fieldGroup}>
            <label htmlFor="color">Cor ou acabamento desejado</label>
            <input
              id="color"
              value={color}
              onChange={(event) => setColor(event.target.value)}
              placeholder="Opcional"
            />
          </div>
          <div className={styles.fieldGroup}>
            <label htmlFor="deadline">Prazo desejado</label>
            <input
              id="deadline"
              value={deadline}
              onChange={(event) => setDeadline(event.target.value)}
              placeholder="Opcional; não representa prazo garantido"
            />
          </div>
        </>
      ) : null}

      {step === 4 && type !== "impressao" ? (
        <>
          <FilePicker
            files={files}
            noFile={noFile}
            onFilesChange={(nextFiles) => {
              if (nextFiles.length > files.length && type) {
                trackPublicEvent("quote_file_added", {
                  projectType: type,
                  step,
                  origin: initialOrigin,
                  reference: initialReference
                });
              }
              setFiles(nextFiles);
            }}
            onNoFileChange={setNoFile}
          />
          <div className={styles.fieldGroup}>
            <label htmlFor="quantity">Quantidade</label>
            <input
              id="quantity"
              inputMode="numeric"
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
              placeholder="Ex.: 2"
            />
          </div>
          <div className={styles.fieldGroup}>
            <label htmlFor="material">Material ou cor</label>
            <select id="material" value={material} onChange={(event) => setMaterial(event.target.value as MaterialChoice)}>
              <option value="">Não informado</option>
              <option value="nao-sei">Não sei, preciso de orientação</option>
              <option value="tenho-preferencia">Tenho uma preferência e explico no pedido</option>
            </select>
          </div>
        </>
      ) : null}

      {step === contactStep ? (
        <>
          <div className={styles.options} role="group" aria-label="Canal de contato">
            <button
              className={styles.option}
              type="button"
              aria-pressed={contactMethod === "whatsapp"}
              onClick={() => setContactMethod("whatsapp")}
            >
              WhatsApp
            </button>
            <button
              className={styles.option}
              type="button"
              aria-pressed={contactMethod === "email"}
              onClick={() => setContactMethod("email")}
            >
              E-mail
            </button>
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="name">Nome</label>
            <input id="name" value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" />
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="contact">{contactMethod === "whatsapp" ? "WhatsApp" : "E-mail"}</label>
            <input
              id="contact"
              value={contact}
              onChange={(event) => setContact(event.target.value)}
              type={contactMethod === "email" ? "email" : "tel"}
              autoComplete={contactMethod === "email" ? "email" : "tel"}
            />
          </div>
        </>
      ) : null}

      {step === reviewStep ? (
        <>
          <dl className={styles.summary}>
            <div>
              <dt>Projeto</dt>
              <dd>{type ? labels[type] : "Não informado"}</dd>
              <button type="button" onClick={() => edit(1)}>Editar</button>
            </div>

            {type !== "impressao" ? (
              <div>
                <dt>Ponto de partida</dt>
                <dd>{startingPoints.length ? startingPoints.join(" · ") : "Não informado"}</dd>
                <button type="button" onClick={() => edit(2)}>Editar</button>
              </div>
            ) : null}

            {type === "placa" ? (
              <div>
                <dt>Placa</dt>
                <dd>
                  {plateUse || "uso não informado"} · {plateContent.join(" + ") || "conteúdo não informado"}
                  {plateSize ? ` · ${plateSize}` : ""}
                  {plateLighting ? ` · iluminação: ${plateLighting}` : ""}
                </dd>
                <button type="button" onClick={() => edit(3)}>Editar</button>
              </div>
            ) : null}

            {type === "caixa" ? (
              <div>
                <dt>Caixa</dt>
                <dd>
                  {boxContents || "função não informada"}
                  {boxDimensions ? ` · ${boxDimensions}` : ""}
                  {boxMeasurementBasis ? ` · medidas ${boxMeasurementBasis}` : ""}
                  {boxSelectedFeatures.length ? ` · ${boxSelectedFeatures.join(", ")}` : ""}
                </dd>
                <button type="button" onClick={() => edit(3)}>Editar</button>
              </div>
            ) : null}

            {type === "outro" ? (
              <div>
                <dt>Descrição</dt>
                <dd>{details || "Não informada"}</dd>
                <button type="button" onClick={() => edit(3)}>Editar</button>
              </div>
            ) : null}

            {type === "impressao" ? (
              <>
                <div>
                  <dt>Arquivo</dt>
                  <dd>{files.length ? files.join(", ") : "Nenhum arquivo selecionado"}</dd>
                  <button type="button" onClick={() => edit(2)}>Editar</button>
                </div>
                <div>
                  <dt>Produção</dt>
                  <dd>
                    {quantity || "quantidade não informada"}
                    {sizeScale ? ` · ${sizeScale}` : ""}
                    {material === "nao-sei" ? " · precisa de orientação de material" : ""}
                    {material === "tenho-preferencia" ? " · tem preferência de material" : ""}
                    {color ? ` · ${color}` : ""}
                    {deadline ? ` · prazo desejado: ${deadline}` : ""}
                  </dd>
                  <button type="button" onClick={() => edit(3)}>Editar</button>
                </div>
              </>
            ) : (
              <div>
                <dt>Referências e produção</dt>
                <dd>
                  {files.length ? files.join(", ") : "sem arquivo agora"} · {quantity || "quantidade não informada"}
                  {material === "nao-sei" ? " · precisa de orientação" : ""}
                  {material === "tenho-preferencia" ? " · tem preferência de material/cor" : ""}
                </dd>
                <button type="button" onClick={() => edit(4)}>Editar</button>
              </div>
            )}

            {initialReference || initialOrigin ? (
              <div>
                <dt>Origem</dt>
                <dd>{initialReference ? `Referência: ${initialReference}` : "Sem referência específica"}{initialOrigin ? ` · ${initialOrigin}` : ""}</dd>
                <span aria-hidden="true" />
              </div>
            ) : null}

            <div>
              <dt>Contato</dt>
              <dd>{name || "Nome não informado"} · {contactMethod} · {contact || "não informado"}</dd>
              <button type="button" onClick={() => edit(contactStep)}>Editar</button>
            </div>
          </dl>

          <p className={styles.notice}>
            A interface e a revisão estão prontas, mas o envio permanece desligado até definirmos armazenamento privado,
            validação de arquivos, retenção e destino da triagem. Nenhum dado desta prévia é enviado.
          </p>
        </>
      ) : null}

      <div className={styles.actions}>
        <button type="button" onClick={back} disabled={step === 1}>Voltar</button>
        {step < reviewStep ? (
          <button className={styles.primary} type="button" onClick={next}>
            Continuar →
          </button>
        ) : (
          <button className={styles.primary} type="button" disabled>
            Enviar projeto para análise
          </button>
        )}
      </div>
    </section>
  );
}
