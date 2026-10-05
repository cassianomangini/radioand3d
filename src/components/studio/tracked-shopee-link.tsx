"use client";

import type { ReactNode } from "react";
import { trackPublicEvent } from "@/lib/public-analytics";
import styles from "./studio-content.module.css";

export function TrackedShopeeLink({
  href,
  productSlug,
  children,
  className
}: {
  href: string;
  productSlug: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <a
      className={className ? `${styles.primaryLink} ${className}` : styles.primaryLink}
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
