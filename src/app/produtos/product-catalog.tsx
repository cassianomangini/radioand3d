"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { productCategories, type ProductCategory } from "./categories";
import styles from "./products.module.css";

type ProductCard = {
  slug: string;
  name: string;
  subtitle: string | null;
  imageUrl: string;
  category: ProductCategory | null;
};

const filters: ReadonlyArray<{ id: ProductCategory | null; label: string; icon: string }> = [
  { id: null, label: "Todas", icon: "/images/categories/todas.png" },
  ...productCategories,
];

export function ProductCatalog({ products }: { products: ProductCard[] }) {
  const [activeCategory, setActiveCategory] = useState<ProductCategory | null>(null);
  const visible = activeCategory === null
    ? [...products].sort((first, second) => first.name.localeCompare(second.name, "pt-BR", { sensitivity: "base" }))
    : products.filter((product) => product.category === activeCategory);

  return (
    <>
      <div className={styles.sectionHeading}>
        <h2 id="catalog-heading">Peças no catálogo</h2>
        <span aria-live="polite">{visible.length} {visible.length === 1 ? "peça" : "peças"}</span>
      </div>
      <div className={styles.catalogFilters}>
        <nav className={styles.categories} aria-label="Filtrar produtos por categoria">
          <ul>
            {filters.map((filter) => (
              <li key={filter.id ?? "todas"}>
                <button
                  className={styles.categoryButton}
                  type="button"
                  aria-pressed={activeCategory === filter.id}
                  onClick={() => setActiveCategory(filter.id)}
                >
                  <Image className={styles.categoryIcon} src={filter.icon} alt="" width={56} height={56} />
                  <span className={styles.categoryLabel}>{filter.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      {visible.length > 0 ? (
        <div className={styles.grid}>
          {visible.map((product) => (
            <Link className={styles.card} href={`/produtos/${product.slug}`} key={product.slug}>
              <span className={styles.cardImage}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={product.imageUrl} alt={product.name} width="600" height="750" loading="lazy" />
              </span>
              <span className={styles.cardBody}>
                <strong>{product.name}</strong>
                {product.subtitle && <span className={styles.cardSubtitle}>{product.subtitle}</span>}
                <span className={styles.cardAction}>Ver detalhes <span aria-hidden="true">↗</span></span>
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <p className={styles.categoryEmpty}>Ainda não há produtos nesta categoria.</p>
      )}
    </>
  );
}
