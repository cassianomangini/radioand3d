"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { RadioIcon } from "@/components/radio-icons";
import styles from "./page.module.css";

export type StudioSlide = {
  src: string;
  alt: string;
  title: string;
  category: StudioCategory;
};

type StudioCategory = "decoracao" | "outros" | "natal" | "brinquedos" | "caixas" | "cores";

const categories: ReadonlyArray<{ id: StudioCategory | null; label: string }> = [
  { id: null, label: "Todas" },
  { id: "natal", label: "Peças Natalinas" },
  { id: "decoracao", label: "Organização e Decoração" },
  { id: "brinquedos", label: "Peças Sensoriais" },
  { id: "caixas", label: "Porta Objetos" },
  { id: "cores", label: "Cores" },
  { id: "outros", label: "Outros" },
];

function CategoryMenu({ value, onChange }: { value: StudioCategory | null; onChange: (category: StudioCategory | null) => void }) {
  return (
    <label className={styles.categoryMenu}>
      <span>Categoria</span>
      <select
        value={value ?? ""}
        onChange={(event) => onChange(event.currentTarget.value ? event.currentTarget.value as StudioCategory : null)}
      >
        {categories.map((category) => (
          <option key={category.id ?? "todas"} value={category.id ?? ""}>{category.label}</option>
        ))}
      </select>
    </label>
  );
}

function Chevron({ direction }: { direction: "previous" | "next" }) {
  return (
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path
        d={direction === "previous" ? "m14.5 5-7 7 7 7" : "m9.5 5 7 7-7 7"}
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function NavigationArrow({
  direction,
  label,
  className,
  onClick,
}: {
  direction: "previous" | "next";
  label: string;
  className: string;
  onClick: () => void;
}) {
  return (
    <button className={`${styles.arrow} ${className}`} type="button" aria-label={label} onClick={onClick}>
      <Chevron direction={direction} />
    </button>
  );
}

function PlaybackSymbol({ playing }: { playing: boolean }) {
  return playing ? (
    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <rect x="6" y="4.5" width="4.2" height="15" rx="1" />
      <rect x="13.8" y="4.5" width="4.2" height="15" rx="1" />
    </svg>
  ) : (
    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M7.5 4.75a1 1 0 0 1 1.52-.85l10.1 6.83a1.55 1.55 0 0 1 0 2.57l-10.1 6.83a1 1 0 0 1-1.52-.86V4.75Z" />
    </svg>
  );
}

const slideDurationMs = 4800;
const galleryPageSize = 12;

export function StudioCarousel({ slides }: { slides: readonly StudioSlide[] }) {
  const [activeCategory, setActiveCategory] = useState<StudioCategory | null>(null);
  const [index, setIndex] = useState(0);
  const [galleryPage, setGalleryPage] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [documentVisible, setDocumentVisible] = useState(true);
  const [inViewport, setInViewport] = useState(true);
  const rootRef = useRef<HTMLElement>(null);
  const galleryRef = useRef<HTMLElement>(null);
  const viewerRef = useRef<HTMLDialogElement>(null);
  const remainingRef = useRef(slideDurationMs);
  const timedIndexRef = useRef(0);
  const transitionRef = useRef<{ skipTransition: () => void } | null>(null);
  const visibleSlides = activeCategory === null ? slides : slides.filter((slide) => slide.category === activeCategory);
  const current = visibleSlides[index];
  const currentPhotoId = current?.src.startsWith("/api/studio/photos/")
    ? current.src.slice("/api/studio/photos/".length) : null;
  const canNavigate = visibleSlides.length > 1;
  const previousIndex = canNavigate ? (index - 1 + visibleSlides.length) % visibleSlides.length : 0;
  const nextIndex = canNavigate ? (index + 1) % visibleSlides.length : 0;
  const previousSlide = canNavigate ? visibleSlides[previousIndex] : null;
  const nextSlide = canNavigate ? visibleSlides[nextIndex] : null;
  const dotCount = Math.min(5, visibleSlides.length);
  const firstDot = Math.max(0, Math.min(index - 2, visibleSlides.length - dotCount));
  const visibleDots = Array.from({ length: dotCount }, (_, offset) => firstDot + offset);
  const galleryPageCount = Math.ceil(visibleSlides.length / galleryPageSize);
  const galleryStart = galleryPage * galleryPageSize;
  const gallerySlides = visibleSlides.slice(galleryStart, galleryStart + galleryPageSize);
  const advancing = canNavigate && playing && documentVisible && inViewport && !viewerOpen;

  const transitionTo = useCallback((requested: number, revealInGallery = true) => {
    if (!canNavigate) return;
    const destination = (requested + visibleSlides.length) % visibleSlides.length;
    if (destination === index) return;
    const update = () => {
      setIndex(destination);
      if (revealInGallery) setGalleryPage(Math.floor(destination / galleryPageSize));
    };
    if (
      viewerRef.current?.open ||
      !document.startViewTransition ||
      window.matchMedia("(max-width: 1023px)").matches ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      update();
      return;
    }
    transitionRef.current?.skipTransition();
    transitionRef.current = document.startViewTransition(() => flushSync(update));
  }, [canNavigate, index, visibleSlides.length]);

  useEffect(() => {
    const update = () => setDocumentVisible(!document.hidden);
    update();
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);

  useEffect(() => {
    const element = rootRef.current;
    if (!element || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => setInViewport(entry.isIntersecting && entry.intersectionRatio >= 0.2),
      { threshold: [0, 0.2] }
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (timedIndexRef.current !== index) {
      timedIndexRef.current = index;
      remainingRef.current = slideDurationMs;
    }
    if (!advancing) return;

    const started = performance.now();
    const timer = window.setTimeout(() => {
      remainingRef.current = slideDurationMs;
      transitionTo(index + 1, false);
    }, remainingRef.current);

    return () => {
      window.clearTimeout(timer);
      remainingRef.current = Math.max(0, remainingRef.current - (performance.now() - started));
    };
  }, [activeCategory, advancing, index, transitionTo]);

  function chooseCategory(category: StudioCategory | null) {
    transitionRef.current?.skipTransition();
    setPlaying(true);
    setActiveCategory(category);
    setIndex(0);
    setGalleryPage(0);
    remainingRef.current = slideDurationMs;
    timedIndexRef.current = -1;
  }

  function goTo(requested: number, revealInGallery = true) {
    transitionTo(requested, revealInGallery);
  }

  function showGalleryPage(page: number) {
    setGalleryPage(page);
    galleryRef.current?.scrollIntoView({ block: "start" });
  }

  function openViewer() {
    const dialog = viewerRef.current;
    if (!dialog || dialog.open) return;
    dialog.showModal();
    setViewerOpen(true);
  }

  return (
    <>
      <div className={styles.showcase}>
      <div className={styles.categoryColumn}>
        <CategoryMenu value={activeCategory} onChange={chooseCategory} />
        <aside className={styles.categories} aria-label="Categorias do estúdio">
          <ul>
            {categories.map((category) => (
              <li key={category.id ?? "todas"}>
                <button
                  className={styles.categoryButton}
                  type="button"
                  aria-pressed={activeCategory === category.id}
                  onClick={() => chooseCategory(category.id)}
                >
                  {category.label}
                </button>
              </li>
            ))}
          </ul>
        </aside>
      </div>
      <div className={styles.carouselPane}>
        {previousSlide && visibleSlides.length > 2 ? (
          <button
            key={previousSlide.src}
            className={`${styles.preview} ${styles.previewPrevious}`}
            style={{ viewTransitionName: `studio-photo-${previousIndex}` }}
            type="button"
            aria-label={`Mostrar foto anterior: ${previousSlide.title}`}
            onClick={() => goTo(index - 1)}
          >
            <Image src={previousSlide.src} alt="" fill sizes="24vw" />
          </button>
        ) : null}
        <section
          ref={rootRef}
          className={styles.carousel}
          style={{ viewTransitionName: current ? `studio-photo-${index}` : "none" }}
          aria-label="Trabalhos reais de impressão 3D"
          aria-roledescription="carrossel"
        >
          {current ? (
            <button
              key={current.src}
              className={styles.photoTrigger}
              type="button"
              aria-label={`Ampliar imagem: ${current.title}`}
              onClick={openViewer}
            >
              <Image
                className={styles.photo}
                src={current.src}
                alt={current.alt}
                fill
                sizes="(max-width: 480px) 58vw, 27vw"
                loading="eager"
                fetchPriority="high"
              />
            </button>
          ) : null}
        </section>
        {canNavigate ? (
          <div className={styles.controls}>
            <NavigationArrow direction="previous" label="Impressão anterior" className={styles.previous} onClick={() => goTo(index - 1)} />
            <button
              className={styles.pause}
              type="button"
              aria-label={playing ? "Pausar apresentação" : "Reproduzir apresentação"}
              aria-pressed={playing}
              onClick={() => setPlaying((value) => !value)}
            >
              <PlaybackSymbol playing={playing} />
            </button>
            <button className={styles.expand} type="button" aria-label="Ampliar imagem" onClick={openViewer}>
              <RadioIcon name="expand" />
            </button>
            <NavigationArrow direction="next" label="Próxima impressão" className={styles.next} onClick={() => goTo(index + 1)} />
            <div className={styles.slideDots} role="group" aria-label="Selecionar foto do carrossel">
              {visibleDots.map((slideIndex) => (
                <button
                  key={slideIndex}
                  className={styles.slideDot}
                  type="button"
                  aria-label={`Mostrar foto ${slideIndex + 1} de ${visibleSlides.length}`}
                  aria-current={slideIndex === index ? "true" : undefined}
                  onClick={() => goTo(slideIndex)}
                />
              ))}
            </div>
          </div>
        ) : null}
        {nextSlide ? (
          <button
            key={nextSlide.src}
            className={`${styles.preview} ${styles.previewNext}`}
            style={{ viewTransitionName: `studio-photo-${nextIndex}` }}
            type="button"
            aria-label={`Mostrar próxima foto: ${nextSlide.title}`}
            onClick={() => goTo(index + 1)}
          >
            <Image src={nextSlide.src} alt="" fill sizes="24vw" />
          </button>
        ) : null}
        <dialog
          ref={viewerRef}
          className={styles.viewer}
          aria-label={current ? `Imagem ampliada: ${current.title}` : "Imagem ampliada"}
          onClose={() => setViewerOpen(false)}
          onClick={(event) => {
            if (event.target === event.currentTarget) event.currentTarget.close();
          }}
          onKeyDown={(event) => {
            if (event.key === "ArrowLeft") {
              event.preventDefault();
              goTo(index - 1);
            } else if (event.key === "ArrowRight") {
              event.preventDefault();
              goTo(index + 1);
            }
          }}
        >
          <div className={styles.viewerFrame}>
            {current && viewerOpen ? <Image className={styles.viewerPhoto} src={current.src} alt={current.alt} fill sizes="(max-width: 760px) 90vw, 75vh" loading="eager" /> : null}
            {canNavigate ? (
              <>
                {previousSlide ? <NavigationArrow direction="previous" label="Imagem anterior" className={styles.viewerPrevious} onClick={() => goTo(index - 1)} /> : null}
                {nextSlide ? <NavigationArrow direction="next" label="Próxima imagem" className={styles.viewerNext} onClick={() => goTo(index + 1)} /> : null}
              </>
            ) : null}
            <button className={styles.viewerClose} type="button" aria-label="Fechar imagem ampliada" onClick={() => viewerRef.current?.close()}>
              <span aria-hidden="true">×</span>
            </button>
          </div>
          {currentPhotoId ? (
            <div className={styles.viewerFooter}>
              <Link
                className={styles.viewerQuoteAction}
                href={`/orcamentos?referencia=${encodeURIComponent(currentPhotoId)}`}
                onClick={() => viewerRef.current?.close()}
              >
                Quero um orçamento
              </Link>
            </div>
          ) : null}
        </dialog>
      </div>
      </div>
      <section
        ref={galleryRef}
        className={styles.mediaStrip}
        aria-label="Fotos do estúdio"
      >
        <div className={styles.stripHeader}>
          <h2>Fotos do estúdio</h2>
          <CategoryMenu value={activeCategory} onChange={chooseCategory} />
          <nav className={`${styles.categories} ${styles.galleryCategories}`} aria-label="Filtrar fotos do estúdio por categoria">
            <ul>
              {categories.map((category) => (
                <li key={category.id ?? "todas"}>
                  <button
                    className={styles.categoryButton}
                    type="button"
                    aria-pressed={activeCategory === category.id}
                    onClick={() => chooseCategory(category.id)}
                  >
                    {category.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className={styles.stripItems}>
          {gallerySlides.map((slide, offset) => {
            const step = galleryStart + offset;
            return (
              <button
                className={styles.thumbnail}
                key={slide.src}
                type="button"
                aria-label={`Mostrar imagem: ${slide.title}`}
                aria-pressed={step === index}
                onClick={() => {
                  goTo(step);
                  openViewer();
                }}
              >
                <Image src={slide.src} alt="" fill sizes="(max-width: 760px) 46vw, 23vw" />
              </button>
            );
          })}
        </div>
        {galleryPageCount > 1 ? (
          <nav className={styles.pagination} aria-label="Páginas das fotos do estúdio">
            <button
              className={styles.pageStep}
              type="button"
              aria-label="Página anterior de fotos"
              disabled={galleryPage === 0}
              onClick={() => showGalleryPage(galleryPage - 1)}
            >
              <Chevron direction="previous" />
            </button>
            <span aria-live="polite">{galleryPage + 1} / {galleryPageCount}</span>
            <button
              className={styles.pageStep}
              type="button"
              aria-label="Próxima página de fotos"
              disabled={galleryPage === galleryPageCount - 1}
              onClick={() => showGalleryPage(galleryPage + 1)}
            >
              <Chevron direction="next" />
            </button>
          </nav>
        ) : null}
      </section>
    </>
  );
}
