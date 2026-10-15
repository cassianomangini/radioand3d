import styles from "./quote-page.module.css";
import { QuoteWizard } from "@/components/studio/quote-wizard";
import { StudioPageShell } from "@/components/studio/studio-content";
import { buildPublicMetadata } from "@/lib/site-config";

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
    <StudioPageShell
      eyebrow="Orçamento"
      title="Conte o que você precisa."
      lead="Precisamos apenas de algumas informações para avaliar seu projeto e entender como podemos realizá-lo."
      pathname="/studio/orcamento"
      breadcrumbLabel="Orçamento"
    >
      <QuoteWizard
        initialType={initialType}
        initialReference={initialReference}
        initialOrigin={initialOrigin}
      />

      <aside className={styles.processNote} aria-labelledby="quote-process-title">
        <span className={styles.processEyebrow}>Como funciona</span>
        <div>
          <h2 id="quote-process-title">Você conta a ideia. Nós analisamos os detalhes.</h2>
          <p>
            Cada projeto é avaliado individualmente para entender as possibilidades de produção.
            Depois, combinamos os próximos passos — sem prometer aceite ou prazo antes da análise.
          </p>
        </div>
      </aside>
    </StudioPageShell>
  );
}
