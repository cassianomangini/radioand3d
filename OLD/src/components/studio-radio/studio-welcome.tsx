"use client";

import Link from "next/link";
import { Fragment, type MouseEvent as ReactMouseEvent } from "react";
import styles from "./studio-welcome.module.css";

// A stable Home identity node preserves the transition between Home and Studio.
function revealChars(text: string, startDelayMs: number, stepMs: number) {
  return [...text].map((char, index) => (
    <span
      key={`${startDelayMs}-${index}`}
      className={styles.studioRevealChar}
      style={{ animationDelay: `${startDelayMs + index * stepMs}ms` }}
    >
      {char}
    </span>
  ));
}

function revealPhrase(text: string, startDelayMs: number, stepMs: number) {
  let cursor = 0;
  return text.split(" ").map((word, index, words) => {
    const delay = startDelayMs + cursor * stepMs;
    cursor += word.length + 1;
    return (
      <Fragment key={`${startDelayMs}-word-${index}`}>
        <span className={styles.studioRevealWord}>
          {revealChars(word, delay, stepMs)}
        </span>
        {index < words.length - 1 ? " " : null}
      </Fragment>
    );
  });
}

const homeTitlePrefix = "Conheça nossos produtos, trabalhos e serviços de";
const homeTitleAccent = "impressão 3D.";


export function StudioWelcome({
  route,
  introCycle,
  onNavigate,
  onPrefetchStudio
}: {
  route: "home" | "detail";
  introCycle: number;
  onNavigate: (event: ReactMouseEvent<HTMLAnchorElement>, href: "/" | "/studio") => void;
  onPrefetchStudio: () => void;
}) {
  return (
          <section
            className={styles.studioIdentity}
            aria-labelledby="studio-title"
            data-studio-intro={route === "home" ? "home" : undefined}
          >
            <div className={styles.studioEyebrowStack} aria-live="off">
              <span aria-hidden={route !== "detail"}>ESTÚDIO DE IMPRESSÃO 3D</span>
            </div>

            <p className={styles.studioGreeting} aria-label="Seja muito bem vindo!">
              <span key={introCycle}>
                <span className={styles.studioHomePhrase}>{revealPhrase("Seja muito", 120, 22)}</span>{" "}
                <span className={`${styles.studioHomePhrase} ${styles.studioRevealAccent}`}>bem vindo!</span>
              </span>
            </p>

            <h1 id="studio-title" aria-label="Conheça nossos produtos, trabalhos e serviços de impressão 3D.">
              <span key={introCycle}>
                {revealPhrase(homeTitlePrefix, 500, 11)}{" "}
                <span
                  className={styles.studioRevealAccent}
                  style={{ animationDelay: `${500 + (homeTitlePrefix.length + 1) * 11}ms` }}
                >
                  {homeTitleAccent}
                </span>
              </span>
            </h1>

            <p className={styles.lead} aria-label="Solicite um orçamento para placas personalizadas e caixas sob medida ou envie seu próprio arquivo para avaliarmos a possibilidade de impressão.">
              <span key={introCycle}>
                <strong className={styles.leadLine}>
                  Solicite um <span className={styles.studioRevealAccent}>orçamento</span>{" "}
                  {revealPhrase("para placas personalizadas e caixas sob medida ou envie seu próprio arquivo para avaliarmos a possibilidade de impressão.", 1200, 11)}
                </strong>
              </span>
            </p>

            <p className={styles.lead} aria-label="E, enquanto explora o estúdio, aproveite nossa rádio com músicas 100% autorais!">
              <span key={introCycle}>
                {revealPhrase("E, enquanto explora o estúdio, aproveite nossa rádio com músicas 100% autorais!", 1800, 11)}
              </span>
            </p>

            <div className={styles.studioRouteActions}>
              <Link
                href="/studio"
                className={styles.primaryAction}
                aria-label="Quero conhecer tudo"
                aria-hidden={route !== "home"}
                tabIndex={route === "home" ? 0 : -1}
                onPointerEnter={onPrefetchStudio}
                onClick={(event) => onNavigate(event, "/studio")}
              >
                <span>Quero conhecer tudo</span>
                <span aria-hidden="true">→</span>
              </Link>

              <Link
                href="/studio/orcamento"
                className={`${styles.primaryAction} ${styles.quoteAction}`}
                aria-hidden={route !== "home"}
                tabIndex={route === "home" ? 0 : -1}
              >
                <span>Pedir orçamento</span>
                <span aria-hidden="true">→</span>
              </Link>

              <Link
                href="/"
                className={styles.primaryAction}
                aria-label="Voltar ao início"
                aria-hidden={route !== "detail"}
                tabIndex={route === "detail" ? 0 : -1}
                onClick={(event) => onNavigate(event, "/")}
              >
                <span>Voltar ao início</span>
                <span aria-hidden="true">←</span>
              </Link>
            </div>
          </section>
  );
}
