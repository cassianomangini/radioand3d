import type { Metadata } from "next";
import { connection } from "next/server";
import { requireQuoteEmailConfig } from "@/server/quote/email";
import { requireQuoteEnabled } from "@/server/quote/http";
import { quoteServiceConfig } from "@/server/quote/supabase-gateway";
import { studioPhotoKeyFromId } from "@/features/studio/r2-photos";
import { QuoteFlow } from "./quote-flow";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Orçamentos — CM 3D & Rádio",
};

export default async function OrcamentosPage({
  searchParams,
}: {
  searchParams: Promise<{ referencia?: string | string[] }>;
}) {
  await connection();
  const candidate = (await searchParams).referencia;
  let studioPhotoId: string | null = null;
  if (typeof candidate === "string" && candidate.length <= 260) {
    try {
      if (studioPhotoKeyFromId(candidate)) studioPhotoId = candidate;
    } catch { /* Uma referência indisponível não impede o formulário normal. */ }
  }
  let intakeEnabled = false;
  try {
    requireQuoteEnabled();
    quoteServiceConfig();
    requireQuoteEmailConfig();
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

      <QuoteFlow intakeEnabled={intakeEnabled} studioPhotoId={studioPhotoId} />
    </div>
  );
}
