"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent
} from "react";
import styles from "./studio-radio-shell.module.css";

const DEFAULT_RADIO_WIDTH = 390;
const MIN_RADIO_WIDTH = 320;
const MAX_RADIO_WIDTH = 720;
const MIN_STUDIO_WIDTH = 640;
const RESIZE_GUTTER = 16;

const previewTrack = {
  title: "Limite Elástico",
  artist: "CM",
  duration: "3:52"
} as const;

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

function getExpandedWidth(shellWidth: number) {
  return clampRadioWidth(shellWidth, shellWidth * 0.48);
}

interface RadioContentProps {
  expanded?: boolean;
  mobile?: boolean;
  visualPlaying: boolean;
  onToggleVisualPlaying: () => void;
  onExpand?: () => void;
  onClose?: () => void;
}

function RadioContent({
  expanded = false,
  mobile = false,
  visualPlaying,
  onToggleVisualPlaying,
  onExpand,
  onClose
}: RadioContentProps) {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLocaleLowerCase("pt-BR");
  const trackVisible =
    normalizedQuery.length === 0 ||
    previewTrack.title.toLocaleLowerCase("pt-BR").includes(normalizedQuery);

  return (
    <div className={styles.radioContent}>
      <div className={styles.radioHeader}>
        <div>
          <span className={styles.radioKicker}>PRÉVIA VISUAL</span>
          <h2>CM RÁDIO</h2>
        </div>

        {mobile ? (
          <button
            type="button"
            className={styles.iconButton}
            onClick={onClose}
            aria-label="Fechar rádio"
          >
            Fechar
          </button>
        ) : (
          <button
            type="button"
            className={styles.iconButton}
            onClick={onExpand}
            aria-label={expanded ? "Recolher rádio" : "Expandir rádio"}
          >
            {expanded ? "Recolher" : "Expandir"}
          </button>
        )}
      </div>

      <div className={styles.coverFallback} aria-label="Capa provisória CM">
        <span>CM</span>
        <small>CAPA ENTRA COM O ACERVO</small>
      </div>

      <div className={styles.nowPlaying}>
        <div>
          <span className={styles.nowLabel}>FAIXA DE REFERÊNCIA</span>
          <strong>{previewTrack.title}</strong>
          <span>{previewTrack.artist}</span>
        </div>
        <span className={styles.duration}>{previewTrack.duration}</span>
      </div>

      <div className={styles.progressBlock}>
        <div
          className={styles.progressTrack}
          role="progressbar"
          aria-label="Posição visual da faixa de referência"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={36}
        >
          <span className={styles.progressFill} />
        </div>
        <div className={styles.progressTimes}>
          <span>1:22</span>
          <span>{previewTrack.duration}</span>
        </div>
      </div>

      <div className={styles.transport} aria-label="Controles de prévia da rádio">
        <button type="button" disabled aria-label="Faixa anterior indisponível">
          Anterior
        </button>
        <button
          type="button"
          className={styles.playButton}
          onClick={onToggleVisualPlaying}
          aria-pressed={visualPlaying}
          aria-label={
            visualPlaying
              ? "Pausar estado visual de reprodução"
              : "Ativar estado visual de reprodução"
          }
        >
          {visualPlaying ? "Pausar" : "Tocar"}
        </button>
        <button type="button" disabled aria-label="Próxima faixa indisponível">
          Próxima
        </button>
      </div>

      <div className={styles.visualizer} aria-label="Fallback estático do visualizador">
        <span style={{ height: "28%" }} />
        <span style={{ height: "52%" }} />
        <span style={{ height: "38%" }} />
        <span style={{ height: "72%" }} />
        <span style={{ height: "46%" }} />
        <span style={{ height: "82%" }} />
        <span style={{ height: "58%" }} />
        <span style={{ height: "67%" }} />
        <span style={{ height: "42%" }} />
        <span style={{ height: "76%" }} />
        <span style={{ height: "54%" }} />
        <span style={{ height: "34%" }} />
      </div>
      <p className={styles.visualizerNote}>
        Visualizador estático nesta etapa. O áudio real entra no motor da Rádio.
      </p>

      <div className={styles.libraryHeader}>
        <strong>Biblioteca</strong>
        <span>1 faixa de referência</span>
      </div>

      <label className={styles.searchField}>
        <span className={styles.srOnly}>Buscar música na prévia</span>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar música..."
        />
      </label>

      <div className={styles.trackList}>
        {trackVisible ? (
          <button
            type="button"
            className={styles.trackRow}
            aria-current="true"
            onClick={onToggleVisualPlaying}
          >
            <span className={styles.trackFallback}>CM</span>
            <span className={styles.trackMeta}>
              <strong>{previewTrack.title}</strong>
              <small>{previewTrack.artist}</small>
            </span>
            <span className={styles.trackState}>
              {visualPlaying ? "em prévia" : "selecionada"}
            </span>
            <span className={styles.duration}>{previewTrack.duration}</span>
          </button>
        ) : (
          <p className={styles.emptyState}>Nenhuma faixa de prévia encontrada.</p>
        )}
      </div>
    </div>
  );
}

export function StudioRadioShell() {
  const shellRef = useRef<HTMLDivElement>(null);
  const mobileDialogRef = useRef<HTMLDialogElement>(null);
  const [radioWidth, setRadioWidth] = useState(DEFAULT_RADIO_WIDTH);
  const [radioExpanded, setRadioExpanded] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [mobileRadioOpen, setMobileRadioOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [visualPlaying, setVisualPlaying] = useState(false);

  const shellStyle = useMemo(
    () => ({ "--radio-width": `${radioWidth}px` }) as CSSProperties,
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

    if (radioExpanded) {
      updateRadioWidth(DEFAULT_RADIO_WIDTH);
      setRadioExpanded(false);
      return;
    }

    setRadioWidth(getExpandedWidth(shellWidth));
    setRadioExpanded(true);
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragging(true);
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (!dragging) {
      return;
    }

    const shell = shellRef.current;
    if (!shell) {
      return;
    }

    const rect = shell.getBoundingClientRect();
    const requested = rect.right - event.clientX;
    updateRadioWidth(requested);
    setRadioExpanded(false);
  }

  function stopDragging(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setDragging(false);
  }

  function handleResizeKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    const shell = shellRef.current;
    if (!shell) {
      return;
    }

    const step = event.shiftKey ? 48 : 16;

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      updateRadioWidth(radioWidth + step);
      setRadioExpanded(false);
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      updateRadioWidth(radioWidth - step);
      setRadioExpanded(false);
    }

    if (event.key === "Home") {
      event.preventDefault();
      updateRadioWidth(MIN_RADIO_WIDTH);
      setRadioExpanded(false);
    }

    if (event.key === "End") {
      event.preventDefault();
      setRadioWidth(getExpandedWidth(shell.getBoundingClientRect().width));
      setRadioExpanded(true);
    }
  }

  function closeMobileMenu() {
    setMobileMenuOpen(false);
  }

  return (
    <div id="top" className={styles.site}>
      <header className={styles.siteHeader}>
        <a className={styles.brand} href="#top" aria-label="CM 3D e Rádio, início">
          <span className={styles.brandMark}>CM</span>
          <span className={styles.brandSuffix}>
            <strong>3D</strong>
            <small>&amp; RADIO</small>
          </span>
        </a>

        <nav className={styles.desktopNav} aria-label="Navegação principal">
          <a href="#top">Início</a>
          <a href="#studio">Estúdio</a>
          <a href="#radio">Rádio</a>
          <a href="#studio-about">Sobre</a>
        </nav>

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
            <a href="#studio-about" onClick={closeMobileMenu}>
              Sobre
            </a>
          </nav>
        ) : null}
      </header>

      <div className={styles.mobileMiniPlayer}>
        <span className={styles.miniCover}>CM</span>
        <span className={styles.miniMeta}>
          <strong>{previewTrack.title}</strong>
          <small>{previewTrack.artist}</small>
        </span>
        <button
          type="button"
          className={styles.miniPlay}
          onClick={() => setVisualPlaying((playing) => !playing)}
          aria-pressed={visualPlaying}
        >
          {visualPlaying ? "Pausar" : "Tocar"}
        </button>
        <button
          type="button"
          className={styles.miniOpen}
          onClick={() => setMobileRadioOpen(true)}
        >
          Abrir rádio
        </button>
        <span className={styles.miniProgress} aria-hidden="true">
          <span />
        </span>
      </div>

      <div
        ref={shellRef}
        className={styles.desktopShell}
        style={shellStyle}
        data-dragging={dragging ? "true" : undefined}
      >
        <main id="studio" className={styles.studio}>
          <section className={styles.hero} aria-labelledby="studio-title">
            <div className={styles.heroCopy}>
              <p className={styles.eyebrow}>ESTÚDIO DE IMPRESSÃO 3D</p>
              <h1 id="studio-title">Ideias que ganham forma.</h1>
              <p className={styles.lead}>
                Peças úteis, decorativas e personalizadas, criadas do projeto à
                impressão com atenção ao acabamento.
              </p>
              <div className={styles.heroActions}>
                <a className={styles.primaryAction} href="#studio-about">
                  Conhecer o estúdio
                </a>
              </div>
            </div>

            <div className={styles.mediaFrame} aria-label="Mídia do estúdio ainda não publicada">
              <div>
                <span>MÍDIA DO ESTÚDIO</span>
                <strong>Foto real entra aqui.</strong>
                <p>
                  A estrutura já reserva o enquadramento principal sem inventar um
                  produto para preencher a tela.
                </p>
              </div>
            </div>
          </section>

          <section
            id="studio-about"
            className={styles.aboutStudio}
            aria-labelledby="about-studio-title"
          >
            <p className={styles.sectionLabel}>O ESTÚDIO</p>
            <h2 id="about-studio-title">
              Do arquivo ao <span>objeto real.</span>
            </h2>
            <p>
              Cada peça passa por decisões de formato, material, impressão e
              acabamento até virar algo físico, pronto para uso.
            </p>
            <div className={styles.futureContent}>
              <span>PRÓXIMAS ENTRADAS</span>
              <p>
                Produtos, materiais, fotos e trabalhos aparecem aqui conforme o
                conteúdo real for publicado.
              </p>
            </div>
          </section>
        </main>

        <div
          className={styles.resizeHandle}
          role="separator"
          aria-label="Redimensionar CM Rádio"
          aria-orientation="vertical"
          aria-valuemin={MIN_RADIO_WIDTH}
          aria-valuemax={MAX_RADIO_WIDTH}
          aria-valuenow={Math.round(radioWidth)}
          tabIndex={0}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={stopDragging}
          onPointerCancel={stopDragging}
          onKeyDown={handleResizeKeyDown}
        >
          <span aria-hidden="true" />
        </div>

        <aside id="radio" className={styles.radioPanel} aria-label="CM Rádio">
          <RadioContent
            expanded={radioExpanded}
            visualPlaying={visualPlaying}
            onToggleVisualPlaying={() =>
              setVisualPlaying((playing) => !playing)
            }
            onExpand={toggleRadioExpanded}
          />
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
        <RadioContent
          mobile
          visualPlaying={visualPlaying}
          onToggleVisualPlaying={() => setVisualPlaying((playing) => !playing)}
          onClose={() => setMobileRadioOpen(false)}
        />
      </dialog>
    </div>
  );
}
