"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { RadioMiniPlayer } from "./radio-mini-player";
import styles from "./site-header.module.css";

function SocialIcon({ name }: { name: "email" | "shopee" | "instagram" }) {
  const common = {
    width: 16,
    height: 16,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.35,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const,
  };
  const glyph: Record<typeof name, ReactNode> = {
    email: (
      <svg {...common}>
        <rect x="3" y="5" width="18" height="14" rx="2.2" />
        <path d="m4 7.5 8 6 8-6" />
      </svg>
    ),
    shopee: (
      <svg {...common}>
        <path d="M3.4 8.4h17.2c.8 0 1.4.7 1.3 1.5l-1 10.4a1.9 1.9 0 0 1-1.9 1.7H5a1.9 1.9 0 0 1-1.9-1.7l-1-10.4c-.1-.8.5-1.5 1.3-1.5Z" />
        <path d="M8.1 8.3c.15-3.3 1.8-5.5 3.9-5.5s3.75 2.2 3.9 5.5" />
        <path d="M15.7 12.6c-.4-1-1.4-1.4-2.8-1.2-1.5.3-2.2 1.2-2 2.1.3 1 1.5 1.4 2.7 1.8 1.2.3 2.1.9 1.9 1.9-.2 1.2-1.2 1.9-2.7 1.8-1.3-.1-2.2-.7-2.5-1.6" />
      </svg>
    ),
    instagram: (
      <svg {...common}>
        <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
        <circle cx="12" cy="12" r="3.6" />
        <circle cx="17.15" cy="6.85" r="0.7" fill="currentColor" stroke="none" />
      </svg>
    ),
  };
  return glyph[name];
}

type SiteHeaderProps = {
  radioOpen?: boolean;
  docked?: boolean;
  onHome?: () => void;
  onOpenRadio?: () => void;
  onRestoreRadio?: () => void;
};

export function SiteHeader({ radioOpen = false, docked = false, onHome, onOpenRadio, onRestoreRadio }: SiteHeaderProps) {
  const pathname = usePathname();
  const studioPage = pathname === "/estudio";
  const orcamentosPage = pathname === "/orcamentos";
  const produtosPage = pathname.startsWith("/produtos");
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!menuOpen) return;

    function handlePointerDown(event: PointerEvent) {
      if (!headerRef.current?.contains(event.target as Node)) setMenuOpen(false);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setMenuOpen(false);
      menuButtonRef.current?.focus();
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  function goHome() {
    setMenuOpen(false);
    onHome?.();
  }

  function openRadio() {
    setMenuOpen(false);
    onOpenRadio?.();
  }

  return (
    <header ref={headerRef} className={styles.header} data-docked={docked ? "true" : undefined}>
      <Link className={styles.brand} href="/" aria-label="CM 3D e Rádio, início" onClick={goHome}>
        <Image
          src="/images/cm-3d-radio-logo.png"
          alt=""
          width={1983}
          height={793}
          priority
          unoptimized
        />
      </Link>
      <button
        ref={menuButtonRef}
        className={styles.menuToggle}
        type="button"
        aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
        aria-controls="site-menu"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((open) => !open)}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <path d={menuOpen ? "M5 5l14 14M19 5 5 19" : "M4 6h16M4 12h16M4 18h16"} />
        </svg>
      </button>
      <div id="site-menu" className={styles.menuContent} data-open={menuOpen ? "true" : undefined}>
        <nav className={styles.nav} aria-label="Navegação principal">
          <Link href="/" aria-current={!radioOpen && pathname === "/" ? "page" : undefined} onClick={goHome}>Início</Link>
          <Link href="/estudio" aria-current={!radioOpen && studioPage ? "page" : undefined} onClick={goHome}>Estúdio</Link>
          <Link href="/produtos" aria-current={!radioOpen && produtosPage ? "page" : undefined} onClick={goHome}>Produtos</Link>
          <Link href="/orcamentos" aria-current={!radioOpen && orcamentosPage ? "page" : undefined} onClick={goHome}>Orçamentos</Link>
          <button type="button" onClick={openRadio} aria-current={radioOpen ? "page" : undefined}>Rádio</button>
        </nav>
        <div className={styles.actions}>
          {docked && onRestoreRadio ? <RadioMiniPlayer onRestore={() => { setMenuOpen(false); onRestoreRadio(); }} /> : null}
          <div className={styles.social} role="group" aria-label="Contato e redes sociais">
            <a href="mailto:casman1986@gmail.com" aria-label="Enviar e-mail para casman1986@gmail.com" title="E-mail: casman1986@gmail.com" onClick={() => setMenuOpen(false)}><SocialIcon name="email" /></a>
            <a href="https://www.instagram.com/cmangini3d/" aria-label="Instagram da CMangini 3D" title="Instagram: @cmangini3d" target="_blank" rel="noopener noreferrer" onClick={() => setMenuOpen(false)}><SocialIcon name="instagram" /></a>
            <a href="https://shopee.com.br/artesopolis" aria-label="Loja Artesopolis na Shopee" title="Shopee: artesopolis" target="_blank" rel="noopener noreferrer" onClick={() => setMenuOpen(false)}><SocialIcon name="shopee" /></a>
          </div>
        </div>
      </div>
    </header>
  );
}
