"use client";

import { useEffect, useRef, useState } from "react";
import shellStyles from "@/components/studio-radio/studio-radio-shell.module.css";
import styles from "./radio-lyrics.module.css";
import { useRadio } from "./radio-provider";
import {
  getActiveLyricLineIndex,
  getActiveLyricWordIndex,
  getStartedLyricWordIndex,
  type GeneratedSyncedLyrics
} from "./synced-lyrics";

interface LyricsResponse {
  lyrics: string | null;
  syncedLyrics: GeneratedSyncedLyrics | null;
}

interface LyricsResult extends LyricsResponse {
  trackId: string;
  failed: boolean;
}

export function RadioLyrics({ trackId, title, headingId = "radio-lyrics-title", active = true, onClose }: { trackId?: string; title?: string; headingId?: string; active?: boolean; onClose?: () => void }) {
  const radio = useRadio();
  const [result, setResult] = useState<LyricsResult | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const lineRefs = useRef<Array<HTMLParagraphElement | null>>([]);

  useEffect(() => {
    if (!trackId) return;

    const controller = new AbortController();
    fetch(`/api/radio/lyrics?id=${encodeURIComponent(trackId)}`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("Lyrics request failed");
        return response.json() as Promise<LyricsResponse>;
      })
      .then(({ lyrics, syncedLyrics }) => setResult({ trackId, lyrics, syncedLyrics, failed: false }))
      .catch((error: unknown) => {
        if (error instanceof Error && error.name === "AbortError") return;
        setResult({ trackId, lyrics: null, syncedLyrics: null, failed: true });
      });

    return () => controller.abort();
  }, [trackId]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
    lineRefs.current = [];
  }, [trackId]);

  const current = result?.trackId === trackId ? result : null;
  const activeLine = current?.syncedLyrics
    ? getActiveLyricLineIndex(current.syncedLyrics.lines, radio.position)
    : -1;

  useEffect(() => {
    if (!active || activeLine < 0) return;
    const scroller = scrollRef.current;
    const line = lineRefs.current[activeLine];
    if (!scroller || !line) return;

    const scrollerBox = scroller.getBoundingClientRect();
    const lineBox = line.getBoundingClientRect();
    const target = scroller.scrollTop + lineBox.top - scrollerBox.top - (scroller.clientHeight - lineBox.height) / 2;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    scroller.scrollTo({ top: Math.max(0, target), behavior: reduceMotion ? "auto" : "smooth" });
  }, [active, activeLine]);

  return (
    <section className={shellStyles.lyricsPanel} aria-labelledby={headingId}>
      <div className={shellStyles.lyricsHeader}>
        <h3 id={headingId}>Letra</h3>
        <span title={title}>{title}</span>
        {onClose ? <button type="button" className={shellStyles.lyricsClose} onClick={onClose} aria-label="Fechar letra">×</button> : null}
      </div>
      <div
        ref={scrollRef}
        className={shellStyles.lyricsScroll}
        role="region"
        aria-label={`Letra de ${title ?? "música atual"}`}
        tabIndex={0}
      >
        {!trackId ? <p className={shellStyles.lyricsStatus}>Selecione uma faixa para ver a letra.</p> : null}
        {trackId && !current ? <p className={shellStyles.lyricsStatus} role="status">Carregando letra…</p> : null}
        {current?.failed ? <p className={shellStyles.lyricsStatus} role="alert">Não foi possível carregar a letra.</p> : null}
        {current && !current.failed && !current.lyrics ? <p className={shellStyles.lyricsStatus}>Letra ainda não disponível para esta faixa.</p> : null}
        {current?.syncedLyrics ? (
          <div className={styles.syncedLyrics}>
            {current.syncedLyrics.lines.map((line, lineIndex) => {
              if (line.kind === "section") {
                return (
                  <p
                    key={`${lineIndex}-${line.text}`}
                    className={`${styles.section} ${line.breakBefore ? styles.breakBefore : ""}`}
                  >
                    {line.text}
                  </p>
                );
              }

              const lineActive = lineIndex === activeLine;
              const activeWord = lineActive ? getActiveLyricWordIndex(line, radio.position) : -1;
              const startedWord = lineActive ? getStartedLyricWordIndex(line, radio.position) : -1;
              const lineDistance = activeLine >= 0
                ? Math.max(-2, Math.min(2, lineIndex - activeLine))
                : null;
              return (
                <p
                  key={`${lineIndex}-${line.text}`}
                  ref={(node) => { lineRefs.current[lineIndex] = node; }}
                  className={`${styles.line} ${line.breakBefore ? styles.breakBefore : ""} ${lineActive ? styles.activeLine : ""}`}
                  data-lyric-distance={lineDistance === null ? undefined : String(lineDistance)}
                  aria-current={lineActive ? "true" : undefined}
                  aria-label={line.text}
                >
                  {line.words.map((word, wordIndex) => {
                    const completed = lineActive && (
                      activeWord >= 0
                        ? wordIndex < activeWord
                        : wordIndex <= startedWord
                    );
                    return (
                      <span key={`${wordIndex}-${word.text}`} aria-hidden="true">
                        {wordIndex > 0 ? " " : ""}
                        <span
                          className={`${styles.word} ${completed ? styles.completedWord : ""} ${wordIndex === activeWord ? styles.activeWord : ""}`}
                        >
                          {word.text}
                        </span>
                      </span>
                    );
                  })}
                </p>
              );
            })}
          </div>
        ) : current?.lyrics ? (
          <p className={shellStyles.lyricsText}>{current.lyrics}</p>
        ) : null}
      </div>
    </section>
  );
}
