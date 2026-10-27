"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
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

  return (
    <header className={styles.header} data-docked={docked ? "true" : undefined}>
      <Link className={styles.brand} href="/" aria-label="CM 3D e Rádio, início" onClick={onHome}>
        <Image
          src="/images/cm-3d-radio-logo.png"
          alt=""
          width={1983}
          height={793}
          priority
          unoptimized
        />
      </Link>
      <nav className={styles.nav} aria-label="Navegação principal">
        <Link href="/" aria-current={!radioOpen && !studioPage ? "page" : undefined} onClick={onHome}>Início</Link>
        <Link href="/estudio" aria-current={!radioOpen && studioPage ? "page" : undefined} onClick={onHome}>Estúdio</Link>
        <span>Orçamentos</span>
        <button type="button" onClick={onOpenRadio} aria-current={radioOpen ? "page" : undefined}>Rádio</button>
      </nav>
      <div className={styles.actions}>
        {docked && onRestoreRadio ? <RadioMiniPlayer onRestore={onRestoreRadio} /> : null}
        <div className={styles.social} role="group" aria-label="Contato e redes sociais">
          <span title="Email" aria-label="Email"><SocialIcon name="email" /></span>
          <span title="Instagram" aria-label="Instagram"><SocialIcon name="instagram" /></span>
          <span title="Shopee" aria-label="Shopee"><SocialIcon name="shopee" /></span>
        </div>
      </div>
    </header>
  );
}
