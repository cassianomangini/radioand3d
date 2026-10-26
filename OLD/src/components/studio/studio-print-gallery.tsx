"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { studioPrintMedia, type StudioPrintMedia } from "@/features/studio/prints-media";
import styles from "./studio-print-gallery.module.css";

type PrintProject = {
  id: string;
  title: string;
  media: StudioPrintMedia[];
};

function groupProjects(media: StudioPrintMedia[]): PrintProject[] {
  const projects = new Map<string, PrintProject>();
  for (const entry of media) {
    const existing = projects.get(entry.project);
    if (existing) existing.media.push(entry);
    else projects.set(entry.project, { id: entry.project, title: entry.title, media: [entry] });
  }
  return [...projects.values()];
}

export function StudioPrintGallery() {
  const projects = useMemo(() => groupProjects(studioPrintMedia), []);
  const [selection, setSelection] = useState<{ project: number; media: number } | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const currentProject = selection ? projects[selection.project] : null;
  const currentMedia = selection ? currentProject?.media[selection.media] : null;

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (!hash) return;
    let id = hash;
    try { id = decodeURIComponent(hash); } catch { /* Invalid fragment: ignore it. */ }
    const project = projects.findIndex((entry) => entry.media.some((media) => media.id === id));
    if (project === -1) return;
    const media = projects[project].media.findIndex((entry) => entry.id === id);
    const frame = window.requestAnimationFrame(() => setSelection({ project, media }));
    return () => window.cancelAnimationFrame(frame);
  }, [projects]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (selection && !dialog.open) dialog.showModal();
    if (!selection && dialog.open) dialog.close();
  }, [selection]);

  const close = () => {
    setSelection(null);
    if (window.location.hash) {
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    }
  };

  const shift = (amount: number) => {
    setSelection((previous) => {
      if (!previous) return null;
      const length = projects[previous.project].media.length;
      return { ...previous, media: (previous.media + amount + length) % length };
    });
  };

  return (
    <>
      {projects.length ? (
        <div className={styles.grid} data-studio-print-gallery="true">
          {projects.map((project, index) => {
            const cover = project.media.find((entry) => entry.kind === "image") ?? project.media[0];
            return (
              <button
                key={project.id}
                type="button"
                className={styles.tile}
                onClick={() => setSelection({
                  project: index,
                  media: Math.max(0, project.media.findIndex((entry) => entry.id === cover.id))
                })}
                aria-label={`Ampliar ${project.title}`}
              >
                <span className={styles.tileMedia}>
                  {cover.kind === "image" ? (
                    <Image
                      src={cover.src}
                      alt={cover.alt}
                      fill
                      sizes="(max-width: 420px) 30vw, (max-width: 650px) 23vw, 130px"
                    />
                  ) : (
                    <span className={styles.videoPlaceholder}>VÍDEO · VER PROJETO</span>
                  )}
                  {project.media.some((entry) => entry.kind === "video") ? (
                    <span className={styles.videoBadge}>Vídeo disponível</span>
                  ) : null}
                </span>
              </button>
            );
          })}
        </div>
      ) : (
        <div className={styles.empty} data-studio-print-gallery="empty">
          <span>FOTOGRAFIAS EM PREPARAÇÃO</span>
          <p>Os trabalhos aparecerão aqui com suas fotos e vídeos reais, sem imagens de demonstração.</p>
        </div>
      )}

      <dialog
        ref={dialogRef}
        className={styles.dialog}
        onClose={() => setSelection(null)}
        onCancel={(event) => { event.preventDefault(); close(); }}
        onClick={(event) => { if (event.target === event.currentTarget) close(); }}
        onKeyDown={(event) => {
          if (event.key === "ArrowRight") { event.preventDefault(); shift(1); }
          if (event.key === "ArrowLeft") { event.preventDefault(); shift(-1); }
        }}
        aria-label="Foto ampliada da galeria de impressões"
      >
        {currentProject && currentMedia ? (
          <div className={styles.viewer}>
            <div className={styles.featured}>
              {currentMedia.kind === "image" ? (
                // The bucket manifest has no dimensions; intrinsic sizing keeps the dialog fitted to each photo.
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={currentMedia.src}
                  src={currentMedia.src}
                  alt={currentMedia.alt}
                />
              ) : (
                // Muted preview: sound from a project video must not start over the Radio.
                <video key={currentMedia.src} controls muted playsInline preload="metadata">
                  <source src={currentMedia.src} type={currentMedia.src.endsWith(".webm") ? "video/webm" : "video/mp4"} />
                </video>
              )}
              <button type="button" className={styles.close} onClick={close} aria-label="Fechar visualização">
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <div className={styles.viewerFooter}>
              {currentProject.media.length > 1 ? (
                <div className={styles.viewerNavigation}>
                  <button type="button" onClick={() => shift(-1)} aria-label="Foto ou vídeo anterior">←</button>
                  <button type="button" onClick={() => shift(1)} aria-label="Próxima foto ou vídeo">→</button>
                </div>
              ) : null}
              <Link className={styles.request} href="/studio/orcamento?tipo=outro&origem=galeria">
                Quero algo parecido <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        ) : null}
      </dialog>
    </>
  );
}
