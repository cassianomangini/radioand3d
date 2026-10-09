"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import styles from "./visual-lab.module.css";

type StudyId = "editorial" | "mostruario" | "detalhe";

const studies: ReadonlyArray<{ id: StudyId; number: string; name: string; intent: string }> = [
  { id: "editorial", number: "01", name: "Editorial", intent: "Fotografia e narrativa" },
  { id: "mostruario", number: "02", name: "Mostruário", intent: "Peça em primeiro plano" },
  { id: "detalhe", number: "03", name: "Detalhe", intent: "Precisão e contexto" }
];

function MediaSlot({ size = "large", label }: {
  size?: "large" | "wide" | "portrait";
  label: string;
}) {
  return (
    <figure className={styles.mediaSlot} data-media-status="pending" data-size={size}>
      <div className={styles.mediaWatermark} aria-hidden="true">CM / ESTÚDIO</div>
      <figcaption className={styles.mediaCaption}>
        <span>{label}</span>
        <strong>FOTOGRAFIA REAL PENDENTE</strong>
        <small>Área reservada. Nenhuma peça ou acabamento foi simulado.</small>
      </figcaption>
    </figure>
  );
}

function CopyBlock({ eyebrow, compact = false }: { eyebrow: string; compact?: boolean }) {
  return (
    <div className={compact ? styles.copyCompact : styles.copy}>
      <p className={styles.eyebrow}>{eyebrow}</p>
      <h2>Impressões<span className={styles.punctuation}>.</span></h2>
      <p className={styles.description} data-study-description="true">
        O encontro entre projeto, material e acabamento. Um espaço para
        apresentar peças produzidas de verdade, com contexto e atenção aos detalhes.
      </p>
      <div className={styles.actionPreview}>
        <span>VER IMPRESSÕES</span>
        <span aria-hidden="true">↗</span>
      </div>
      <p className={styles.previewNotice}>Ação ilustrativa — sem navegação nesta experiência.</p>
    </div>
  );
}

function EditorialStudy() {
  return (
    <div className={styles.editorial}>
      <div className={styles.editorialCopy}>
        <span className={styles.sectionNumber}>ESTUDO 01 / COMPOSIÇÃO EDITORIAL</span>
        <CopyBlock eyebrow="CM / ESTÚDIO DE IMPRESSÃO 3D" />
        <div className={styles.editorialFooter}>
          <span className={styles.hairline} aria-hidden="true" />
          <p>Mais espaço para contar a história de uma peça. Menos interface disputando atenção.</p>
        </div>
      </div>
      <MediaSlot label="FOTOGRAFIA PRINCIPAL / 01" />
    </div>
  );
}

function ShowroomStudy() {
  return (
    <div className={styles.showroom}>
      <header className={styles.showroomHeader}>
        <span className={styles.sectionNumber}>ESTUDO 02 / MOSTRUÁRIO</span>
        <span className={styles.showroomTag}>PEÇA COMO PROTAGONISTA</span>
      </header>
      <MediaSlot size="wide" label="ÁREA DE IMAGEM PANORÂMICA / 01" />
      <div className={styles.showroomBottom}>
        <CopyBlock eyebrow="PROJETOS TRANSFORMADOS EM MATÉRIA" compact />
        <div className={styles.showroomNote}>
          <span className={styles.hairline} aria-hidden="true" />
          <p>Uma fotografia dominante, com texto e saída próximos. A composição não depende de cards repetidos.</p>
        </div>
      </div>
    </div>
  );
}

function DetailStudy() {
  return (
    <div className={styles.detail}>
      <div className={styles.detailMedia}>
        <p className={styles.sectionNumber}>ESTUDO 03 / PRECISÃO MATERIAL</p>
        <MediaSlot size="portrait" label="ENQUADRAMENTO VERTICAL / 01" />
      </div>
      <div className={styles.detailCopy}>
        <CopyBlock eyebrow="FORMAS, MATERIAIS, RESULTADOS" />
        <dl className={styles.detailList}>
          <div><dt>O QUE MOSTRAR</dt><dd>Peça real e contexto de uso</dd></div>
          <div><dt>O QUE EXPLICAR</dt><dd>Material, dimensões e acabamento quando documentados</dd></div>
          <div><dt>O QUE NÃO INVENTAR</dt><dd>Foto, disponibilidade ou medidas inexistentes</dd></div>
        </dl>
      </div>
    </div>
  );
}

export function VisualLabClient() {
  const [active, setActive] = useState<StudyId>("editorial");
  const rootRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();

  // The route is server-rendered. Browser tests must not click before hydration
  // has attached React handlers, otherwise an early click can be silently lost.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    root.dataset.labReady = "true";
    return () => { delete root.dataset.labReady; };
  }, []);
  const selected = studies.find((study) => study.id === active) ?? studies[0];

  return (
    <main ref={rootRef} className={styles.lab} data-visual-lab="true">
      <div className={styles.layout}>
        <header className={styles.labHeader}>
          <div>
            <p className={styles.kicker}>CM / EXPERIÊNCIA · 08V</p>
            <h1>Laboratório visual<span>.</span></h1>
          </div>
          <p className={styles.labIntro}>
            Três estudos de uma mesma entrada do Estúdio. Composição antes de
            código de página — e sem fotografia inventada.
          </p>
        </header>

        <div className={styles.toolbar}>
          <div className={styles.studySwitcher} role="group" aria-label="Comparar estudos de Impressões">
            {studies.map((study) => (
              <button
                key={study.id}
                className={styles.studyButton}
                type="button"
                aria-pressed={active === study.id}
                onClick={() => setActive(study.id)}
                data-study-button={study.id}
              >
                <span className={styles.studyNumber}>{study.number}</span>
                <span className={styles.studyLabel}>{study.name}<small>{study.intent}</small></span>
              </button>
            ))}
          </div>
          <p className={styles.labStatus} aria-live="polite">
            VENDO {selected.number} / {selected.name.toUpperCase()}
          </p>
        </div>

        <div className={styles.stage} data-active-study={active}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.section
              key={active}
              data-study={active}
              aria-label={"Estudo " + selected.number + ": " + selected.name}
              initial={reducedMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reducedMotion ? { opacity: 1 } : { opacity: 0, y: -8 }}
              transition={{ duration: reducedMotion ? 0 : 0.26, ease: [0.2, 0.8, 0.2, 1] }}
            >
              {active === "editorial" ? <EditorialStudy /> : null}
              {active === "mostruario" ? <ShowroomStudy /> : null}
              {active === "detalhe" ? <DetailStudy /> : null}
            </motion.section>
          </AnimatePresence>
        </div>

        <footer className={styles.labFooter}>
          <span>AMBIENTE DE DESENVOLVIMENTO · NÃO PUBLICAR</span>
          <p>
            Estas são explorações de composição, não propostas finais de imagem ou produto.
            A mídia E3 e a escolha visual precisam de aprovação específica.
          </p>
        </footer>
      </div>
    </main>
  );
}
