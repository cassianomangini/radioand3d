"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
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
  { id: "decoracao", label: "Organização e Decoração" },
  { id: "outros", label: "Outros" },
  { id: "natal", label: "Peças Natalinas" },
  { id: "brinquedos", label: "Brinquedos Sensoriais" },
  { id: "caixas", label: "Porta Objetos" },
  { id: "cores", label: "Cores" },
];

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

export function StudioCarousel({ slides }: { slides: readonly StudioSlide[] }) {
  const galleryPageSize = 12;
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
  const visibleSlides = activeCategory === null ? slides : slides.filter((slide) => slide.category === activeCategory);
  const activeCategoryLabel = categories.find((category) => category.id === activeCategory)?.label ?? "Todas";
  const current = visibleSlides[index];
  const canNavigate = visibleSlides.length > 1;
  const previousSlide = index > 0 ? visibleSlides[index - 1] : null;
  const nextSlide = index < visibleSlides.length - 1 ? visibleSlides[index + 1] : null;
  const galleryPageCount = Math.ceil(visibleSlides.length / galleryPageSize);
  const galleryStart = galleryPage * galleryPageSize;
  const gallerySlides = visibleSlides.slice(galleryStart, galleryStart + galleryPageSize);
  const advancing = canNavigate && playing && documentVisible && inViewport && !viewerOpen;

  useEffect(() => {
    const update = () => setDocumentVisible(!document.hidden);
    update();
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      if (media.matches) setPlaying(false);
    };
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
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
      setIndex((currentIndex) => (currentIndex + 1) % visibleSlides.length);
    }, remainingRef.current);

    return () => {
      window.clearTimeout(timer);
      remainingRef.current = Math.max(0, remainingRef.current - (performance.now() - started));
    };
  }, [activeCategory, advancing, index, visibleSlides.length]);

  function chooseCategory(category: StudioCategory | null) {
    setActiveCategory(category);
    setIndex(0);
    setGalleryPage(0);
    remainingRef.current = slideDurationMs;
    timedIndexRef.current = -1;
  }

  function goTo(requested: number, revealInGallery = true) {
    if (!canNavigate || requested < 0 || requested >= visibleSlides.length) return;
    const nextIndex = requested;
    setIndex(nextIndex);
    if (revealInGallery) setGalleryPage(Math.floor(nextIndex / galleryPageSize));
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
      <div className={styles.categoryColumn}>
        <aside className={styles.categories} aria-label="Categorias do estúdio">
          <h2>Categorias</h2>
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
        {previousSlide ? (
          <button
            className={`${styles.preview} ${styles.previewPrevious}`}
            type="button"
            aria-label={`Mostrar foto anterior: ${previousSlide.title}`}
            onClick={() => goTo(index - 1)}
          >
            <Image src={previousSlide.src} alt="" fill sizes="10vw" />
          </button>
        ) : null}
        <section
          ref={rootRef}
          className={styles.carousel}
          aria-label="Trabalhos reais de impressão 3D"
          aria-roledescription="carrossel"
        >
          {current ? (
            <button
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
                sizes="(max-width: 760px) 80vw, (max-width: 1200px) 45vw, 35vw"
                loading="eager"
                fetchPriority="high"
              />
            </button>
          ) : null}
        {canNavigate ? (
          <div className={styles.controls}>
            {previousSlide ? <NavigationArrow direction="previous" label="Impressão anterior" className={styles.previous} onClick={() => goTo(index - 1)} /> : null}
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
            {nextSlide ? <NavigationArrow direction="next" label="Próxima impressão" className={styles.next} onClick={() => goTo(index + 1)} /> : null}
          </div>
        ) : null}
        </section>
        {nextSlide ? (
          <button
            className={`${styles.preview} ${styles.previewNext}`}
            type="button"
            aria-label={`Mostrar próxima foto: ${nextSlide.title}`}
            onClick={() => goTo(index + 1)}
          >
            <Image src={nextSlide.src} alt="" fill sizes="10vw" />
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
        </dialog>
      </div>
      <section
        ref={galleryRef}
        className={styles.mediaStrip}
        aria-label="Fotos do estúdio"
      >
        <div className={styles.stripHeader}>
          <h2>Fotos do estúdio</h2>
          {activeCategory !== null ? (
            <button
              className={styles.clearCategory}
              type="button"
              aria-label={`Remover a categoria ${activeCategoryLabel} e mostrar todas as fotos`}
              onClick={() => chooseCategory(null)}
            >
              <span>{activeCategoryLabel}</span>
              <span className={styles.clearCategoryIcon} aria-hidden="true">×</span>
            </button>
          ) : null}
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
