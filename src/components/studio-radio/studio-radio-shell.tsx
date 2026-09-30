"use client";

import Image from "next/image";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent
} from "react";
import styles from "./studio-radio-shell.module.css";
import { RadioVisualizer } from "@/features/radio/radio-visualizer";
import { useRadio } from "@/features/radio/radio-provider";

const DEFAULT_RADIO_WIDTH = 480;
const MIN_RADIO_WIDTH = 400;
const MAX_RADIO_WIDTH = 720;
const MIN_STUDIO_WIDTH = 640;
const RESIZE_GUTTER = 68;

const previewTrack = {
  title: "Limite Elástico",
  artist: "CM",
  duration: "3:52"
} as const;

type IconName = "expand" | "close" | "heart" | "more" | "shuffle" | "previous" | "play" | "pause" | "next" | "repeat" | "search" | "bars" | "volume";

function Icon({ name }: { name: IconName }) {
  const common = { width: 20, height: 20, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true as const };
  const paths: Record<IconName, ReactNode> = {
    expand: <><path d="M8 4H4v4M16 4h4v4M4 16v4h4M20 16v4h-4" /><path d="m4 4 5 5m11-5-5 5M4 20l5-5m11 5-5-5" /></>,
    close: <><path d="M5 5l14 14M19 5 5 19" /></>,
    heart: <path d="M20.8 8.6c0 4.2-8.8 10-8.8 10s-8.8-5.8-8.8-10a4.6 4.6 0 0 1 8.8-1.8 4.6 4.6 0 0 1 8.8 1.8Z" />,
    more: <><circle cx="12" cy="5" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="12" cy="19" r="1" /></>,
    shuffle: <><path d="M4 7h3c4 0 6 10 10 10h3m-3-3 3 3-3 3M4 17h3c1.7 0 3-1.7 4.3-3.7M16 7h4m-3-3 3 3-3 3" /></>,
    previous: <><path d="M5 5v14M19 5 7 12l12 7V5Z" fill="currentColor" stroke="none" /></>,
    play: <path d="m8 5 11 7-11 7V5Z" fill="currentColor" stroke="none" />,
    pause: <><rect x="7" y="5" width="3.5" height="14" rx=".6" fill="currentColor" stroke="none" /><rect x="13.5" y="5" width="3.5" height="14" rx=".6" fill="currentColor" stroke="none" /></>,
    next: <><path d="M19 5v14M5 5l12 7-12 7V5Z" fill="currentColor" stroke="none" /></>,
    repeat: <><path d="M18 7H7a3 3 0 0 0-3 3v2m0-5 3-3M4 7 1 4m5 13h11a3 3 0 0 0 3-3v-2m0 5-3 3m3-3 3 3" /></>,
    search: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></>,
    bars: <><path d="M4 19v-5m4 5V9m4 10V5m4 14V8m4 11v-7" /></>,
    volume: <><path d="M4 9v6h4l5 4V5L8 9H4Z" /><path d="M16 9a4 4 0 0 1 0 6m2-9a8 8 0 0 1 0 12" /></>
  };
  return <svg {...common}>{paths[name]}</svg>;
}

function clampRadioWidth(shellWidth: number, requested: number) {
  const availableMaximum = Math.max(
    MIN_RADIO_WIDTH,
    shellWidth - MIN_STUDIO_WIDTH - RESIZE_GUTTER
  );

  return Math.min(
    Math.max(requested, MIN_RADIO_WIDTH),
    Math.min(MAX_RADIO_WIDTH, availableMaximum)
  );
}

function getDefaultWidth(shellWidth: number) {
  return clampRadioWidth(
    shellWidth,
    Math.min(DEFAULT_RADIO_WIDTH, Math.round(shellWidth / 3))
  );
}

function getExpandedWidth(shellWidth: number) {
  return clampRadioWidth(shellWidth, shellWidth * 0.48);
}

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const rounded = Math.floor(seconds);
  return `${Math.floor(rounded / 60)}:${String(rounded % 60).padStart(2, "0")}`;
}

function formatTrackDuration(seconds?: number) {
  return seconds && Number.isFinite(seconds) && seconds > 0 ? formatTime(seconds) : "—";
}

function RadioContent({ mobile = false, onClose }: { mobile?: boolean; onClose?: () => void }) {
  const radio = useRadio();
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"upcoming" | "library">("upcoming");
  const normalizedQuery = query.trim().toLocaleLowerCase("pt-BR");
  const libraryTracks = radio.tracks.filter((track) =>
    `${track.title} ${track.artist}`.toLocaleLowerCase("pt-BR").includes(normalizedQuery)
  );
  const displayTrack = radio.currentTrack ?? previewTrack;
  const canPlay = Boolean(radio.currentTrack);
  const playing = radio.status === "playing";
  const pending = radio.status === "loading" || radio.status === "buffering";
  const currentArtwork = radio.currentTrack?.artwork ?? "/images/cm-radio-preview-art.png";
  const listTracks = activeTab === "upcoming" ? radio.upcomingTracks : libraryTracks;
  const progress = radio.duration > 0 ? Math.min(100, radio.position / radio.duration * 100) : 0;
  const repeatLabel = radio.repeat === "one" ? "uma faixa" : radio.repeat === "all" ? "todas" : "desligada";

  return (
    <div className={styles.radioContent}>
      <div className={styles.radioHeader}>
        <h2><span>CM</span> RÁDIO</h2>

        {mobile ? (
          <button
            type="button"
            className={styles.iconButton}
            onClick={onClose}
            aria-label="Fechar rádio"
          >
            <Icon name="close" />
          </button>
        ) : null}
      </div>

      <div className={styles.coverArt}>
        <Image src={currentArtwork} alt="Arte visual da CM Rádio" fill sizes="(min-width: 1180px) 720px, 100vw" priority unoptimized />
      </div>

      <div className={styles.nowPlaying}>
        <span className={styles.trackThumb}><Image src={currentArtwork} alt="" fill sizes="48px" unoptimized /></span>
        <div className={styles.nowMeta}>
          <strong>{displayTrack.title}</strong>
          <span>{displayTrack.artist}</span>
        </div>
        <span className={styles.previewBadge}>{radio.currentTrack?.fixture ? "TESTE" : radio.currentTrack ? "CM RÁDIO" : "PRÉVIA"}</span>
        <button type="button" className={styles.smallIcon} disabled aria-label="Favoritos indisponíveis nesta prévia" title="Favoritos indisponíveis nesta prévia"><Icon name="heart" /></button>
        <button type="button" className={styles.smallIcon} disabled aria-label="Mais opções indisponíveis nesta prévia" title="Mais opções indisponíveis nesta prévia"><Icon name="more" /></button>
      </div>

      <div className={styles.progressBlock}>
        <input
          className={styles.progressSeek}
          type="range"
          min={0}
          max={radio.duration || 1}
          step={0.1}
          value={Math.min(radio.position, radio.duration || 1)}
          onChange={(event) => radio.seek(Number(event.target.value))}
          disabled={!canPlay || radio.duration === 0}
          aria-label="Posição da música"
          style={{ "--seek-progress": `${progress}%` } as CSSProperties}
        />
        <div className={styles.progressTimes}>
          <span>{formatTime(radio.position)}</span>
          <span>{canPlay ? formatTrackDuration(radio.duration) : previewTrack.duration}</span>
        </div>
      </div>

      <div className={styles.transport} aria-label="Controles da rádio">
        <button type="button" onClick={radio.toggleShuffle} disabled={radio.tracks.length < 2} aria-pressed={radio.shuffle} aria-label="Embaralhar"><Icon name="shuffle" /></button>
        <button type="button" onClick={radio.previous} disabled={!canPlay} aria-label="Faixa anterior"><Icon name="previous" /></button>
        <button
          type="button"
          className={styles.playButton}
          onClick={radio.toggle}
          disabled={!canPlay}
          aria-label={pending ? "Cancelar reprodução" : playing ? "Pausar" : "Tocar"}
        >
          <Icon name={playing || pending ? "pause" : "play"} />
        </button>
        <button type="button" onClick={radio.next} disabled={!canPlay || radio.upcomingTracks.length === 0 || radio.tracks.length < 2} aria-label="Próxima faixa"><Icon name="next" /></button>
        <button type="button" onClick={radio.cycleRepeat} disabled={!canPlay} aria-label={`Repetição: ${repeatLabel}`} title={`Repetição: ${repeatLabel}`} aria-pressed={radio.repeat !== "off"}><Icon name="repeat" />{radio.repeat === "one" ? <span className={styles.repeatOne}>1</span> : null}</button>
      </div>

      <div className={styles.volumeControl}>
        <Icon name="volume" />
        <input type="range" min={0} max={1} step={0.01} value={radio.volume} onChange={(event) => radio.setVolume(Number(event.target.value))} disabled={!canPlay} aria-label="Volume" />
        <span>{Math.round(radio.volume * 100)}%</span>
      </div>

      <RadioVisualizer className={styles.visualizer} />

      <div className={styles.libraryHeader}>
        <button type="button" className={activeTab === "upcoming" ? styles.activeTab : undefined} aria-pressed={activeTab === "upcoming"} onClick={() => setActiveTab("upcoming")}>A seguir <span>{radio.upcomingTracks.length}</span></button>
        <button type="button" className={activeTab === "library" ? styles.activeTab : undefined} aria-pressed={activeTab === "library"} onClick={() => setActiveTab("library")}>Biblioteca <span>{radio.tracks.length}</span></button>
      </div>

      <label className={styles.searchField}>
        <span className={styles.srOnly}>Buscar música na biblioteca</span>
        <Icon name="search" />
        <input
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            if (event.target.value) setActiveTab("library");
          }}
          placeholder="Buscar na biblioteca..."
        />
      </label>

      <ol className={styles.trackList} aria-label={activeTab === "upcoming" ? "Próximas músicas na ordem de reprodução" : "Biblioteca de músicas"}>
        {listTracks.map((track, index) => (
          <li key={`${activeTab}-${track.id}-${index}`}>
            <button type="button" className={styles.trackRow} onClick={() => radio.select(track.id)} aria-current={activeTab === "library" && track.id === radio.currentTrack?.id ? "true" : undefined}>
              <span className={styles.trackThumb}><Image src={track.artwork ?? "/images/cm-radio-preview-art.png"} alt="" fill sizes="48px" unoptimized /></span>
              <span className={styles.trackMeta}><strong>{track.title}</strong><small>{track.artist}</small></span>
              <span className={styles.trackState}>{activeTab === "upcoming" ? String(index + 1).padStart(2, "0") : track.id === radio.currentTrack?.id ? <Icon name="bars" /> : null}</span>
              <span className={styles.duration}>{formatTrackDuration(track.durationSeconds ?? (track.id === radio.currentTrack?.id ? radio.duration : undefined))}</span>
            </button>
          </li>
        ))}
        {activeTab === "library" && radio.tracks.length === 0 && previewTrack.title.toLocaleLowerCase("pt-BR").includes(normalizedQuery) ? (
          <li className={styles.emptyState}>“{previewTrack.title}” aguarda áudio autorizado para reprodução.</li>
        ) : null}
        {listTracks.length === 0 && (activeTab === "upcoming" || radio.tracks.length > 0 || normalizedQuery.length > 0) ? (
          <li className={styles.emptyState}>{activeTab === "upcoming" ? "Não há próximas músicas nesta fila." : "Nenhuma música encontrada."}</li>
        ) : null}
      </ol>
      {radio.error ? <p className={styles.playerMessage} role="alert">{radio.error} <button type="button" onClick={radio.retry}>Tentar novamente</button></p> : null}
      {!radio.error && radio.currentTrack?.fixture ? <p className={styles.playerMessage}>Áudio sintético para teste local. Nenhuma música foi publicada.</p> : null}
    </div>
  );
}

export function StudioRadioShell() {
  const radio = useRadio();
  const shellRef = useRef<HTMLDivElement>(null);
  const mobileDialogRef = useRef<HTMLDialogElement>(null);
  const customWidthRef = useRef(false);
  const dragOffsetRef = useRef(0);
  const dragStartXRef = useRef(0);
  const pointerActiveRef = useRef(false);
  const pointerMovedRef = useRef(false);
  const [radioWidth, setRadioWidth] = useState<number | null>(null);
  const [radioExpanded, setRadioExpanded] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [mobileRadioOpen, setMobileRadioOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const shellStyle = useMemo(
    () =>
      (radioWidth === null
        ? {}
        : { "--radio-width": `${radioWidth}px` }) as CSSProperties,
    [radioWidth]
  );

  useEffect(() => {
    const dialog = mobileDialogRef.current;
    if (!dialog) {
      return;
    }

    if (mobileRadioOpen && !dialog.open) {
      dialog.showModal();
    }

    if (!mobileRadioOpen && dialog.open) {
      dialog.close();
    }
  }, [mobileRadioOpen]);

  useEffect(() => {
    const shell = shellRef.current;
    if (!shell) {
      return;
    }

    const observer = new ResizeObserver(() => {
      const width = shell.getBoundingClientRect().width;
      setRadioWidth((current) =>
        radioExpanded
          ? getExpandedWidth(width)
          : customWidthRef.current
            ? clampRadioWidth(width, current ?? getDefaultWidth(width))
            : getDefaultWidth(width)
      );
    });

    observer.observe(shell);
    return () => observer.disconnect();
  }, [radioExpanded]);

  function updateRadioWidth(requested: number) {
    const shell = shellRef.current;
    if (!shell) {
      return;
    }

    const next = clampRadioWidth(shell.getBoundingClientRect().width, requested);
    setRadioWidth(next);
  }

  function toggleRadioExpanded() {
    const shell = shellRef.current;
    if (!shell) {
      return;
    }

    const shellWidth = shell.getBoundingClientRect().width;
    customWidthRef.current = false;

    if (radioExpanded) {
      setRadioWidth(getDefaultWidth(shellWidth));
      setRadioExpanded(false);
      return;
    }

    setRadioWidth(getExpandedWidth(shellWidth));
    setRadioExpanded(true);
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    const shell = shellRef.current;
    if (!shell) {
      return;
    }

    const rect = shell.getBoundingClientRect();
    dragOffsetRef.current = rect.right - event.clientX - (radioWidth ?? getDefaultWidth(rect.width));
    dragStartXRef.current = event.clientX;
    pointerActiveRef.current = true;
    pointerMovedRef.current = false;
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragging(true);
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (!pointerActiveRef.current || Math.abs(event.clientX - dragStartXRef.current) < 4) {
      return;
    }

    const shell = shellRef.current;
    if (!shell) {
      return;
    }

    const rect = shell.getBoundingClientRect();
    const requested = rect.right - event.clientX - dragOffsetRef.current;
    pointerMovedRef.current = true;
    customWidthRef.current = true;
    updateRadioWidth(requested);
    setRadioExpanded(false);
  }

  function stopDragging(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    const shouldToggle = event.type === "pointerup" && pointerActiveRef.current && !pointerMovedRef.current;
    pointerActiveRef.current = false;
    setDragging(false);
    if (shouldToggle) {
      toggleRadioExpanded();
    }
  }

  function handleResizeKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    const shell = shellRef.current;
    if (!shell) {
      return;
    }

    const step = event.shiftKey ? 48 : 16;

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggleRadioExpanded();
      return;
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      customWidthRef.current = true;
      updateRadioWidth((radioWidth ?? getDefaultWidth(shell.getBoundingClientRect().width)) + step);
      setRadioExpanded(false);
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      customWidthRef.current = true;
      updateRadioWidth((radioWidth ?? getDefaultWidth(shell.getBoundingClientRect().width)) - step);
      setRadioExpanded(false);
    }

    if (event.key === "Home") {
      event.preventDefault();
      customWidthRef.current = true;
      updateRadioWidth(MIN_RADIO_WIDTH);
      setRadioExpanded(false);
    }

    if (event.key === "End") {
      event.preventDefault();
      customWidthRef.current = false;
      setRadioWidth(getExpandedWidth(shell.getBoundingClientRect().width));
      setRadioExpanded(true);
    }
  }

  function closeMobileMenu() {
    setMobileMenuOpen(false);
  }

  return (
    <div id="top" className={styles.site} style={shellStyle} data-radio-expanded={radioExpanded ? "true" : undefined} data-radio-dragging={dragging ? "true" : undefined}>
      <header className={styles.siteHeader}>
        <a className={styles.brand} href="#top" aria-label="CM 3D e Rádio, início">
          <Image src="/images/cm-3d-radio-logo.png" alt="" width={1983} height={793} priority unoptimized />
        </a>

        <nav className={styles.desktopNav} aria-label="Navegação principal">
          <a href="#top">Início</a>
          <a href="#studio">Estúdio</a>
          <a href="#radio">Rádio</a>
          <button type="button" className={styles.pendingNav} disabled title="Página do Estúdio em breve">
            Sobre
          </button>
        </nav>

        <span className={styles.headerBalance} aria-hidden="true" />

        <button
          type="button"
          className={styles.menuButton}
          onClick={() => setMobileMenuOpen((open) => !open)}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-navigation"
        >
          Menu
        </button>

        {mobileMenuOpen ? (
          <nav
            id="mobile-navigation"
            className={styles.mobileNav}
            aria-label="Navegação mobile"
          >
            <a href="#top" onClick={closeMobileMenu}>
              Início
            </a>
            <a href="#studio" onClick={closeMobileMenu}>
              Estúdio
            </a>
            <button
              type="button"
              onClick={() => {
                closeMobileMenu();
                setMobileRadioOpen(true);
              }}
            >
              Rádio
            </button>
            <button type="button" disabled title="Página do Estúdio em breve">
              Sobre
            </button>
          </nav>
        ) : null}
      </header>

      <div className={styles.mobileMiniPlayer}>
        <span className={styles.miniCover}><Image src={radio.currentTrack?.artwork ?? "/images/cm-radio-preview-art.png"} alt="" fill sizes="44px" unoptimized /></span>
        <span className={styles.miniMeta}>
          <strong>{radio.currentTrack?.title ?? previewTrack.title}</strong>
          <small>{radio.currentTrack?.artist ?? previewTrack.artist}</small>
        </span>
        <div className={styles.miniControls}>
          <button type="button" className={styles.miniStep} onClick={radio.previous} disabled={!radio.currentTrack} aria-label="Faixa anterior"><Icon name="previous" /></button>
          <button
            type="button"
            className={styles.miniPlay}
            onClick={radio.toggle}
            disabled={!radio.currentTrack}
            aria-label={radio.status === "loading" || radio.status === "buffering" ? "Cancelar reprodução" : radio.status === "playing" ? "Pausar" : "Tocar"}
          >
            <Icon name={radio.status === "playing" || radio.status === "loading" || radio.status === "buffering" ? "pause" : "play"} />
          </button>
          <button type="button" className={styles.miniStep} onClick={radio.next} disabled={!radio.currentTrack || radio.upcomingTracks.length === 0 || radio.tracks.length < 2} aria-label="Próxima faixa"><Icon name="next" /></button>
        </div>
        <button
          type="button"
          className={styles.miniOpen}
          onClick={() => setMobileRadioOpen(true)}
          aria-label="Abrir rádio completa"
        >
          Abrir
        </button>
        <span className={styles.miniProgress} aria-hidden="true">
          <span style={{ width: radio.duration > 0 ? `${radio.position / radio.duration * 100}%` : "0%" }} />
        </span>
      </div>

      <div
        ref={shellRef}
        className={styles.desktopShell}
        data-dragging={dragging ? "true" : undefined}
      >
        <main id="studio" className={styles.studio}>
          <section className={styles.hero} aria-labelledby="studio-title">
            <div className={styles.heroContent}>
              <h1 id="studio-title" aria-label="Ideias que ganham forma.">Ideias que<br />ganham <span>forma.</span></h1>
              <p className={styles.lead}>
                Descubra mais sobre nosso estúdio, peças, materiais, cores e
                muito mais para voce explorar..
              </p>
              <button
                type="button"
                className={styles.primaryAction}
                disabled
                title="Página do Estúdio em breve"
                aria-label="Conheça mais sobre — página do Estúdio em breve"
              >
                <span>Conheça mais</span>
                <span aria-hidden="true">→</span>
              </button>
            </div>
          </section>
        </main>

        <div
          className={styles.resizeHandle}
          role="separator"
          aria-label="Redimensionar ou expandir CM Rádio"
          aria-orientation="vertical"
          aria-valuemin={MIN_RADIO_WIDTH}
          aria-valuemax={MAX_RADIO_WIDTH}
          aria-valuenow={Math.round(radioWidth ?? DEFAULT_RADIO_WIDTH)}
          tabIndex={0}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={stopDragging}
          onPointerCancel={stopDragging}
          onKeyDown={handleResizeKeyDown}
          title="Clique para expandir ou recolher; arraste para ajustar a largura"
        />

        <aside id="radio" className={styles.radioPanel} aria-label="CM Rádio">
          <RadioContent />
        </aside>
      </div>

      <dialog
        ref={mobileDialogRef}
        className={styles.mobileDialog}
        onCancel={(event) => {
          event.preventDefault();
          setMobileRadioOpen(false);
        }}
        onClose={() => setMobileRadioOpen(false)}
        aria-label="CM Rádio completa"
      >
        <RadioContent mobile onClose={() => setMobileRadioOpen(false)} />
      </dialog>
    </div>
  );
}
