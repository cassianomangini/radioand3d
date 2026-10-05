"use client";

import type { ReactNode } from "react";
import { trackPublicEvent } from "@/lib/public-analytics";
import styles from "./studio-content.module.css";

export function TrackedShopeeLink({
  href,
  productSlug,
  children
}: {
  href: string;
  productSlug: string;
  children: ReactNode;
}) {
  return (
    <a
      className={styles.primaryLink}
      href={href}
      onClick={() => {
        trackPublicEvent("product_shopee_exit", { productSlug });
      }}
    >
      <span>{children}</span>
      <span aria-hidden="true">→</span>
    </a>
  );
}
