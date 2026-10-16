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
                aria-label={`Ver projeto ${project.title}, ${project.media.length} ${project.media.length === 1 ? "arquivo" : "arquivos"}`}
              >
                <span className={styles.tileMedia}>
                  {cover.kind === "image" ? (
                    <Image
                      src={cover.src}
                      alt={cover.alt}
                      fill
                      sizes="(max-width: 700px) 30vw, 140px"
                    />
                  ) : (
                    <span className={styles.videoPlaceholder}>VÍDEO · VER PROJETO</span>
                  )}
                  {project.media.some((entry) => entry.kind === "video") ? (
                    <span className={styles.videoBadge}>Vídeo disponível</span>
                  ) : null}
                </span>
                <span className={styles.tileCaption}>
                  <strong>{project.title}</strong>
                  <span>{project.media.length} {project.media.length === 1 ? "registro" : "registros"}</span>
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
        aria-label={currentProject ? `Galeria: ${currentProject.title}` : "Galeria de impressões"}
      >
        {currentProject && currentMedia ? (
          <div className={styles.viewer}>
            <header className={styles.viewerHeader}>
              <div>
                <span>IMPRESSÕES · PROJETO</span>
                <h3>{currentProject.title}</h3>
              </div>
              <button type="button" className={styles.close} onClick={close} aria-label="Fechar visualização">×</button>
            </header>

            <div className={styles.featured}>
              {currentMedia.kind === "image" ? (
                <Image
                  key={currentMedia.src}
                  src={currentMedia.src}
                  alt={currentMedia.alt}
                  fill
                  sizes="(max-width: 900px) 100vw, 75vw"
                />
              ) : (
                // Muted preview: sound from a project video must not start over the Radio.
                <video key={currentMedia.src} controls muted playsInline preload="metadata">
                  <source src={currentMedia.src} type={currentMedia.src.endsWith(".webm") ? "video/webm" : "video/mp4"} />
                </video>
              )}
            </div>

            <div className={styles.viewerFooter}>
              <span className={styles.position}>{selection ? selection.media + 1 : 1} / {currentProject.media.length}</span>
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
            {currentProject.media.length > 1 ? (
              <div className={styles.filmstrip} role="group" aria-label="Outros ângulos e vídeos deste projeto">
                {currentProject.media.map((media, index) => (
                  <button
                    type="button"
                    key={media.id}
                    aria-label={`Ver mídia ${index + 1}`}
                    aria-pressed={selection?.media === index}
                    onClick={() => setSelection((previous) => previous ? { ...previous, media: index } : null)}
                  >
                    {media.kind === "image" ? (
                      <Image src={media.src} alt="" fill sizes="96px" />
                    ) : <span>VÍDEO</span>}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
      </dialog>
    </>
  );
}
