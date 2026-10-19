"use client";

import Link from "next/link";
import { Fragment, type MouseEvent as ReactMouseEvent } from "react";
import styles from "./studio-welcome.module.css";
import shellStyles from "./studio-radio-shell.module.css";

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
            {route === "home" ? <span className={shellStyles.srOnly}>Seja muito bem-vindo!</span> : null}
            <div className={styles.studioEyebrowStack} aria-live="off">
              <span aria-hidden={route !== "detail"}>ESTÚDIO DE IMPRESSÃO 3D</span>
            </div>

            <h1 id="studio-title" aria-label="Impressão 3D, música e muito mais do que você imagina.">
              <span key={introCycle}>
                <span className={styles.studioHomePhrase}>{revealPhrase("Impressão 3D,", 120, 22)}</span>{" "}
                <span className={styles.studioHomePhrase}>{revealPhrase("música e", 380, 22)}</span>{" "}
                <span className={`${styles.studioHomePhrase} ${styles.studioRevealAccent}`}>muito mais</span>{" "}
                <span className={styles.studioHomePhrase}>{revealPhrase("do que você imagina.", 880, 22)}</span>
              </span>
            </h1>

            <p className={styles.lead} aria-label="Um estúdio cheio de possibilidades, produtos para descobrir, seus projetos transformados em peças reais e uma rádio para deixar tudo ainda melhor.">
              <span key={introCycle}>
                {revealPhrase("Um estúdio cheio de possibilidades, produtos para descobrir, seus projetos transformados em peças reais e uma rádio para deixar tudo ainda melhor.", 1100, 11)}
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
