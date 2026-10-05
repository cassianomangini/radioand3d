"use client";

import { useMemo, useState } from "react";
import styles from "./quote-wizard.module.css";

type ProjectType = "impressao" | "placa" | "caixa" | "outro";
type ContactMethod = "whatsapp" | "email";

const labels: Record<ProjectType, string> = {
  impressao: "Imprimir um arquivo 3D que já tenho",
  placa: "Criar uma placa personalizada",
  caixa: "Criar uma caixa sob medida",
  outro: "Outro projeto"
};

export function QuoteWizard({ initialType }: { initialType?: ProjectType }) {
  const [step, setStep] = useState(initialType ? 2 : 1);
  const [type, setType] = useState<ProjectType | null>(initialType ?? null);
  const [startingPoint, setStartingPoint] = useState("");
  const [details, setDetails] = useState("");
  const [quantity, setQuantity] = useState("");
  const [material, setMaterial] = useState("");
  const [contactMethod, setContactMethod] = useState<ContactMethod>("whatsapp");
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [files, setFiles] = useState<string[]>([]);

  const totalSteps = type === "impressao" ? 5 : 6;

  const stepTitle = useMemo(() => {
    if (step === 1) return "O que você precisa?";
    if (type === "impressao") {
      return [
        "",
        "",
        "Envie o arquivo e conte o básico.",
        "Como você quer produzir?",
        "Como podemos falar com você?",
        "Revise o pedido."
      ][step] ?? "Seu projeto";
    }

    return [
      "",
      "",
      "De onde estamos começando?",
      "Conte o que precisa ser resolvido.",
      "Mostre o que você já tem.",
      "Como podemos falar com você?",
      "Revise o pedido."
    ][step] ?? "Seu projeto";
  }, [step, type]);

  function next() {
    setStep((current) => Math.min(totalSteps, current + 1));
  }

  function back() {
    setStep((current) => Math.max(1, current - 1));
  }

  return (
    <section className={styles.wizard} aria-labelledby="quote-question">
      <div className={styles.progress}>
        <span>Orçamento</span>
        <span>Etapa {step} de {totalSteps}</span>
      </div>

      <h2 className={styles.question} id="quote-question">{stepTitle}</h2>

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
                onClick={() => setType(option)}
              >
                <span>{labels[option]}</span>
                <span aria-hidden="true">→</span>
              </button>
            ))}
          </div>
        </>
      ) : null}

      {step === 2 && type !== "impressao" ? (
        <>
          <p className={styles.help}>Marque o ponto de partida mais próximo. Você poderá explicar o restante na próxima etapa.</p>
          <div className={styles.options}>
            {["Tenho logo, desenho ou arte", "Tenho foto ou referência", "Tenho as medidas", "Tenho apenas a ideia", "Já tenho arquivo 3D"].map((option) => (
              <button
                className={styles.option}
                key={option}
                type="button"
                aria-pressed={startingPoint === option}
                onClick={() => setStartingPoint(option)}
              >
                <span>{option}</span>
              </button>
            ))}
          </div>
        </>
      ) : null}

      {((type === "impressao" && step === 2) || (type !== "impressao" && step === 3)) ? (
        <>
          <div className={styles.fieldGroup}>
            <label htmlFor="project-details">
              {type === "impressao" ? "Arquivo 3D e observações" : "O que a peça precisa fazer?"}
            </label>
            <textarea
              id="project-details"
              value={details}
              onChange={(event) => setDetails(event.target.value)}
              placeholder={type === "impressao" ? "Explique tamanho obrigatório, função da peça ou qualquer exigência importante." : "Explique o uso, medidas conhecidas e o que precisa ser personalizado."}
            />
          </div>

          {type === "impressao" ? (
            <div className={styles.fieldGroup}>
              <label htmlFor="quote-files">Arquivo para análise</label>
              <input
                className={styles.fileInput}
                id="quote-files"
                type="file"
                multiple
                onChange={(event) => setFiles(Array.from(event.target.files ?? []).map((file) => file.name))}
              />
            </div>
          ) : null}
        </>
      ) : null}

      {((type === "impressao" && step === 3) || (type !== "impressao" && step === 4)) ? (
        <>
          {type !== "impressao" ? (
            <div className={styles.fieldGroup}>
              <label htmlFor="quote-files">Fotos, arte, PDF ou referência</label>
              <input
                className={styles.fileInput}
                id="quote-files"
                type="file"
                multiple
                onChange={(event) => setFiles(Array.from(event.target.files ?? []).map((file) => file.name))}
              />
            </div>
          ) : null}
          <div className={styles.fieldGroup}>
            <label htmlFor="quantity">Quantidade</label>
            <input id="quantity" inputMode="numeric" value={quantity} onChange={(event) => setQuantity(event.target.value)} placeholder="Ex.: 2" />
          </div>
          <div className={styles.fieldGroup}>
            <label htmlFor="material">Material ou cor</label>
            <select id="material" value={material} onChange={(event) => setMaterial(event.target.value)}>
              <option value="">Selecione</option>
              <option value="nao-sei">Não sei, preciso de orientação</option>
              <option value="tenho-preferencia">Tenho uma preferência e explico no pedido</option>
            </select>
          </div>
        </>
      ) : null}

      {((type === "impressao" && step === 4) || (type !== "impressao" && step === 5)) ? (
        <>
          <div className={styles.options} role="group" aria-label="Canal de contato">
            <button className={styles.option} type="button" aria-pressed={contactMethod === "whatsapp"} onClick={() => setContactMethod("whatsapp")}>WhatsApp</button>
            <button className={styles.option} type="button" aria-pressed={contactMethod === "email"} onClick={() => setContactMethod("email")}>E-mail</button>
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

      {step === totalSteps ? (
        <>
          <dl className={styles.summary}>
            <div><dt>Projeto</dt><dd>{type ? labels[type] : "Não informado"}</dd></div>
            {startingPoint ? <div><dt>Ponto de partida</dt><dd>{startingPoint}</dd></div> : null}
            <div><dt>Descrição</dt><dd>{details || "Não informada"}</dd></div>
            <div><dt>Arquivos</dt><dd>{files.length ? files.join(", ") : "Nenhum arquivo selecionado"}</dd></div>
            <div><dt>Quantidade</dt><dd>{quantity || "Não informada"}</dd></div>
            <div><dt>Material/cor</dt><dd>{material === "nao-sei" ? "Precisa de orientação" : material === "tenho-preferencia" ? "Preferência informada no pedido" : "Não informado"}</dd></div>
            <div><dt>Contato</dt><dd>{name || "Nome não informado"} · {contactMethod} · {contact || "não informado"}</dd></div>
          </dl>
          <p className={styles.notice}>
            A interface do orçamento está pronta, mas o envio ainda permanece desligado até definirmos armazenamento privado, validação de arquivos e destino da triagem. Seus dados não serão enviados por esta prévia.
          </p>
        </>
      ) : null}

      <div className={styles.actions}>
        <button type="button" onClick={back} disabled={step === 1}>Voltar</button>
        {step < totalSteps ? (
          <button
            className={styles.primary}
            type="button"
            onClick={next}
            disabled={step === 1 && !type}
          >
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
