"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type MouseEvent as ReactMouseEvent, type RefObject } from "react";
import { RadioNavbarDock } from "./radio-navbar-dock";
import headerStyles from "./site-header.module.css";

type SocialIconName = "email" | "instagram" | "shopee";

const socialIcons = [
  { label: "Email", name: "email" },
  { label: "Instagram", name: "instagram" },
  { label: "Shopee", name: "shopee" }
] as const satisfies ReadonlyArray<{ label: string; name: SocialIconName }>;

function SocialGlyph({ name }: { name: SocialIconName }) {
  const common = {
    width: 16,
    height: 16,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.35,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const
  };

  if (name === "email") {
    return (
      <svg {...common}>
        <rect x="3" y="5" width="18" height="14" rx="2.2" />
        <path d="m4 7.5 8 6 8-6" />
      </svg>
    );
  }

  if (name === "instagram") {
    return (
      <svg {...common}>
        <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
        <circle cx="12" cy="12" r="3.6" />
        <circle cx="17.15" cy="6.85" r="0.7" fill="currentColor" stroke="none" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <path d="M3.4 8.4h17.2c.8 0 1.4.7 1.3 1.5l-1 10.4a1.9 1.9 0 0 1-1.9 1.7H5a1.9 1.9 0 0 1-1.9-1.7l-1-10.4c-.1-.8.5-1.5 1.3-1.5Z" />
      <path d="M8.1 8.3c.15-3.3 1.8-5.5 3.9-5.5s3.75 2.2 3.9 5.5" />
      <path d="M15.7 12.6c-.4-1-1.4-1.4-2.8-1.2-1.5.3-2.2 1.2-2 2.1.3 1 1.5 1.4 2.7 1.8 1.2.3 2.1.9 1.9 1.9-.2 1.2-1.2 1.9-2.7 1.8-1.3-.1-2.2-.7-2.5-1.6" />
    </svg>
  );
}

function SocialIcons() {
  return (
    <div className={headerStyles.socialIcons} role="group" aria-label="Contato e redes sociais">
      {socialIcons.map(({ label, name }) => (
        <span className={headerStyles.socialIcon} key={label} title={label} data-icon={name}>
          <SocialGlyph name={name} />
        </span>
      ))}
    </div>
  );
}

type SiteHeaderProps = {
  activeNav: "home" | "studio" | "radio" | "quote";
  radioDocked: boolean;
  radioDockMotion: "docking" | "restoring" | null;
  radioFullscreen: boolean;
  radioNavRef: RefObject<HTMLAnchorElement | null>;
  dockMiniRef: RefObject<HTMLDivElement | null>;
  onNavigate: (event: ReactMouseEvent<HTMLAnchorElement>, href: "/" | "/studio") => void;
  onPrefetchStudio: () => void;
  onOpenRadioFullscreen: () => void;
  onOpenMobileRadio: () => void;
  onRestoreDock: () => void;
};

export function SiteHeader({
  activeNav,
  radioDocked,
  radioDockMotion,
  radioFullscreen,
  radioNavRef,
  dockMiniRef,
  onNavigate,
  onPrefetchStudio,
  onOpenRadioFullscreen,
  onOpenMobileRadio,
  onRestoreDock
}: SiteHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  function closeMobileMenu() {
    setMobileMenuOpen(false);
  }

  return (
    <header className={headerStyles.siteHeader}>
      <Link
        className={headerStyles.brand}
        href="/"
        aria-label="CM 3D e Rádio, início"
        onClick={(event) => onNavigate(event, "/")}
      >
        <Image src="/images/cm-3d-radio-logo.png" alt="" width={1983} height={793} priority unoptimized />
      </Link>

      <nav className={headerStyles.desktopNav} aria-label="Navegação principal">
        <Link
          href="/"
          aria-current={activeNav === "home" ? "page" : undefined}
          onClick={(event) => onNavigate(event, "/")}
        >
          Início
        </Link>
        <Link
          href="/studio"
          aria-current={activeNav === "studio" ? "page" : undefined}
          onPointerEnter={onPrefetchStudio}
          onClick={(event) => onNavigate(event, "/studio")}
        >
          Estúdio
        </Link>
        <Link href="/studio/orcamento" aria-current={activeNav === "quote" ? "page" : undefined}>
          Orçamentos
        </Link>
        <a ref={radioNavRef} href="#radio" aria-current={activeNav === "radio" ? "page" : undefined} onClick={(event) => { event.preventDefault(); onOpenRadioFullscreen(); }}>Rádio</a>
      </nav>

      <div className={headerStyles.headerActions} data-radio-dock-actions="true">
        <RadioNavbarDock
          miniRef={dockMiniRef}
          visible={radioDocked && !radioDockMotion && !radioFullscreen}
          animating={radioDockMotion !== null}
          onRestore={onRestoreDock}
        />
        <SocialIcons />
      </div>

      <button
        type="button"
        className={headerStyles.menuButton}
        onClick={() => setMobileMenuOpen((open) => !open)}
        aria-expanded={mobileMenuOpen}
        aria-controls="mobile-navigation"
      >
        Menu
      </button>

      {mobileMenuOpen ? (
        <nav
          id="mobile-navigation"
          className={headerStyles.mobileNav}
          aria-label="Navegação mobile"
        >
          <Link
            href="/"
            aria-current={activeNav === "home" ? "page" : undefined}
            onClick={(event) => {
              closeMobileMenu();
              onNavigate(event, "/");
            }}
          >
            Início
          </Link>
          <Link
            href="/studio"
            aria-current={activeNav === "studio" ? "page" : undefined}
            onClick={(event) => {
              closeMobileMenu();
              onNavigate(event, "/studio");
            }}
          >
            Estúdio
          </Link>
          <Link
            href="/studio/orcamento"
            aria-current={activeNav === "quote" ? "page" : undefined}
            onClick={closeMobileMenu}
          >
            Orçamentos
          </Link>
          <button
            type="button"
            aria-current={activeNav === "radio" ? "page" : undefined}
            onClick={() => {
              closeMobileMenu();
              onOpenMobileRadio();
            }}
          >
            Rádio
          </button>
          <button type="button" disabled title="Página do Estúdio em breve">
            Sobre
          </button>
          <SocialIcons />
        </nav>
      ) : null}
    </header>
  );
}
