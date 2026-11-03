import { QuoteWizard } from "@/components/studio/quote-wizard";
import { buildPublicMetadata } from "@/lib/site-config";
import styles from "./quote-page.module.css";

export const metadata = buildPublicMetadata({
  title: "Orçamento de impressão 3D | CM 3D & Radio",
  description:
    "Descreva um projeto de impressão 3D em etapas, com perguntas específicas para arquivo pronto, placa, caixa ou outro projeto.",
  pathname: "/studio/orcamento"
});

type ProjectType = "impressao" | "placa" | "caixa" | "outro";

function parseProjectType(value: string | string[] | undefined): ProjectType | undefined {
  const normalized = Array.isArray(value) ? value[0] : value;
  return normalized === "impressao" ||
    normalized === "placa" ||
    normalized === "caixa" ||
    normalized === "outro"
    ? normalized
    : undefined;
}

export default async function StudioQuotePage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const initialType = parseProjectType(params.tipo);
  const initialReference = Array.isArray(params.referencia) ? params.referencia[0] : params.referencia;
  const initialOrigin = Array.isArray(params.origem) ? params.origem[0] : params.origem;

  return (
    <article className={styles.quotePage}>
      <div className={styles.quoteHero}>
        <header className={styles.quoteIntro}>
          <h1>
            Conte o <span>que você precisa.</span>
          </h1>
        </header>

        <div className={styles.quoteForm}>
          <QuoteWizard
            initialType={initialType}
            initialReference={initialReference}
            initialOrigin={initialOrigin}
          />
        </div>
      </div>
    </article>
  );
}
