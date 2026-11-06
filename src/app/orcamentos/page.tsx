import type { Metadata } from "next";
import { connection } from "next/server";
import { requireQuoteEmailConfig } from "@/server/quote/email";
import { requireQuoteEnabled } from "@/server/quote/http";
import { quoteServiceConfig } from "@/server/quote/supabase-gateway";
import { requireQuoteTurnstileConfig } from "@/server/quote/turnstile";
import { studioPhotoKeyFromId } from "@/features/studio/r2-photos";
import { getSiteCatalog } from "@/server/products/catalog";
import { QuoteFlow } from "./quote-flow";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Orçamentos — CM 3D & Rádio",
};

export default async function OrcamentosPage({
  searchParams,
}: {
  searchParams: Promise<{ referencia?: string | string[]; produto?: string | string[] }>;
}) {
  await connection();
  const query = await searchParams;
  const candidate = query.referencia;
  let studioPhotoId: string | null = null;
  if (typeof candidate === "string" && candidate.length <= 260) {
    try {
      if (studioPhotoKeyFromId(candidate)) studioPhotoId = candidate;
    } catch { /* Uma referência indisponível não impede o formulário normal. */ }
  }
  let productReference: { slug: string; name: string; imageUrl: string } | null = null;
  if (!studioPhotoId && typeof query.produto === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(query.produto)) {
    const catalog = await getSiteCatalog();
    const product = catalog.products.find((entry) => entry.slug === query.produto);
    if (product?.sourceStatus === "NORMAL") {
      productReference = { slug: product.slug, name: product.name, imageUrl: product.imageUrls[0] };
    }
  }
  let intakeEnabled = false;
  let turnstileSiteKey: string | null = null;
  try {
    requireQuoteEnabled();
    quoteServiceConfig();
    requireQuoteEmailConfig();
    turnstileSiteKey = requireQuoteTurnstileConfig().siteKey;
    intakeEnabled = true;
  } catch { /* A interface continua disponível enquanto o envio é configurado. */ }
  return (
    <div className={styles.page}>
      <header className={styles.banner}>
        <div className={styles.bannerContent}>
          <h1>Orçamentos</h1>
          <p>Conte sua ideia e receba uma proposta sob medida.</p>
        </div>
      </header>

      <QuoteFlow intakeEnabled={intakeEnabled} studioPhotoId={studioPhotoId} productReference={productReference} turnstileSiteKey={turnstileSiteKey} multiModelEnabled={process.env.CM_QUOTE_MULTIMODEL_ENABLED === 'true'} />
    </div>
  );
}
