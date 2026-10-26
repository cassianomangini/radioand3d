import Image from "next/image";
import Link from "next/link";
import styles from "./site-header.module.css";

type SiteHeaderProps = {
  onOpenSplit: () => void;
};

export function SiteHeader({ onOpenSplit }: SiteHeaderProps) {
  return (
    <header className={styles.header}>
      <Link className={styles.brand} href="/" aria-label="CM 3D e Rádio, início">
        <Image
          src="/images/cm-3d-radio-logo.png"
          alt=""
          width={1983}
          height={793}
          priority
          unoptimized
        />
      </Link>
      <button type="button" className={styles.splitButton} onClick={onOpenSplit}>
        70/30
      </button>
    </header>
  );
}
