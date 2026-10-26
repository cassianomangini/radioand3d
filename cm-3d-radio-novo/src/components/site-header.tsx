import Link from "next/link";
import styles from "./site-header.module.css";

const links = [
  { href: "/", label: "Início" },
  { href: "/studio", label: "Estúdio" },
  { href: "/studio/orcamento", label: "Orçamentos" },
  { href: "/radio", label: "Rádio" },
] as const;

export function SiteHeader() {
  return (
    <header className={styles.header}>
      <Link className={styles.brand} href="/" aria-label="CM 3D e Rádio, início">
        CM 3D & Rádio
      </Link>
      <nav className={styles.nav} aria-label="Navegação principal">
        <ul>
          {links.map((link) => (
            <li key={link.href}>
              <Link href={link.href} aria-current={link.href === "/" ? "page" : undefined}>
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
