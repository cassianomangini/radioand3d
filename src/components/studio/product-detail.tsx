"use client";

import Image from "next/image";
import { useState } from "react";
import type { StudioImage, StudioProduct } from "@/features/studio/catalog";
import { TrackedShopeeLink } from "@/components/studio/tracked-shopee-link";
import styles from "./product-detail.module.css";

type GalleryMedia =
  | { kind: "image"; image: StudioImage }
  | { kind: "video"; src: string; poster?: string };

function buildGallery(product: StudioProduct): GalleryMedia[] {
  const media: GalleryMedia[] = product.images.map((image) => ({
    kind: "image",
    image
  }));

  if (product.videoUrl) {
    media.push({
      kind: "video",
      src: product.videoUrl,
      poster: product.images[0]?.src
    });
  }

  return media;
}

export function ProductDetail({ product }: { product: StudioProduct }) {
  const gallery = buildGallery(product);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [variantPreview, setVariantPreview] = useState<StudioImage | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);

  const active = variantPreview
    ? ({ kind: "image", image: variantPreview } satisfies GalleryMedia)
    : gallery[galleryIndex] ?? null;

  function chooseGallery(index: number) {
    setVariantPreview(null);
    setGalleryIndex(index);
  }

  function stepGallery(direction: -1 | 1) {
    if (!gallery.length) return;
    const next = (galleryIndex + direction + gallery.length) % gallery.length;
    setVariantPreview(null);
    setGalleryIndex(next);
  }

  function chooseVariant(name: string, image?: StudioImage) {
    setSelectedVariant(name);
    if (image) setVariantPreview(image);
  }

  return (
    <section className={styles.hero} aria-labelledby="product-title">
      <div className={styles.mediaColumn}>
        <div className={styles.gallery}>
          <div className={styles.thumbnails} aria-label="Mídia do produto">
            {gallery.map((media, index) => (
              <button
                key={media.kind === "image" ? media.image.src : media.src}
                type="button"
                className={styles.thumbnail}
                data-active={!variantPreview && galleryIndex === index ? "true" : undefined}
                onClick={() => chooseGallery(index)}
                aria-label={media.kind === "image" ? `Ver foto ${index + 1}` : "Ver vídeo"}
              >
                {media.kind === "image" ? (
                  <Image
                    src={media.image.src}
                    alt=""
                    fill
                    sizes="72px"
                  />
                ) : (
                  <span className={styles.videoThumb}>Vídeo</span>
                )}
              </button>
            ))}
          </div>

          <div className={styles.mainMedia}>
            {active?.kind === "image" ? (
              <Image
                src={active.image.src}
                alt={active.image.alt}
                fill
                priority
                sizes="(max-width: 1179px) 100vw, 58vw"
              />
            ) : active?.kind === "video" ? (
              <video
                key={active.src}
                src={active.src}
                poster={active.poster}
                controls
                playsInline
                preload="metadata"
              >
                Seu navegador não suporta vídeo HTML5.
              </video>
            ) : null}

            {gallery.length > 1 ? (
              <div className={styles.galleryNav} aria-label="Navegação da galeria">
                <button type="button" onClick={() => stepGallery(-1)} aria-label="Mídia anterior">
                  ←
                </button>
                <button type="button" onClick={() => stepGallery(1)} aria-label="Próxima mídia">
                  →
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className={styles.decision}>
        <p className={styles.context}>{product.contextLabel}</p>
        <h1 id="product-title">{product.title}</h1>
        <p className={styles.summary}>{product.summary}</p>

        {product.variants.length ? (
          <div className={styles.variants}>
            <div className={styles.variantHeading}>
              <h2>Variações</h2>
              <span>A opção final é confirmada na Shopee.</span>
            </div>

            <div className={styles.variantGrid}>
              {product.variants.map((variant) => (
                <button
                  key={variant.name}
                  type="button"
                  className={styles.variant}
                  data-selected={selectedVariant === variant.name ? "true" : undefined}
                  onClick={() => chooseVariant(variant.name, variant.image)}
                  aria-pressed={selectedVariant === variant.name}
                >
                  {variant.image ? (
                    <span className={styles.variantImage}>
                      <Image
                        src={variant.image.src}
                        alt=""
                        fill
                        sizes="96px"
                      />
                    </span>
                  ) : (
                    <span className={styles.variantFallback} aria-hidden="true" />
                  )}
                  <span>{variant.name}</span>
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <div className={styles.purchase}>
          {product.shopeeUrl ? (
            <TrackedShopeeLink
              href={product.shopeeUrl}
              productSlug={product.slug}
              className={styles.shopeeButton}
            >
              Comprar na Shopee
            </TrackedShopeeLink>
          ) : (
            <p className={styles.unavailable}>Link de compra ainda não publicado.</p>
          )}
          <p>
            Compra, pagamento, frete, preço e disponibilidade final são confirmados na Shopee.
          </p>
        </div>
      </div>
    </section>
  );
}
