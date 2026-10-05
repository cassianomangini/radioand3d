import { QuoteWizard } from "@/components/studio/quote-wizard";
import { StudioPageShell, StudioSection } from "@/components/studio/studio-content";
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

  return (
    <StudioPageShell
      eyebrow="Orçamento"
      title="Conte o que você precisa."
      lead="O formulário começa pelo projeto, não pelo seu telefone. Você responde somente o que faz sentido para o tipo de peça e revisa tudo antes do envio."
    >
      <QuoteWizard initialType={initialType} />

      <StudioSection eyebrow="Como funciona" title="Análise antes de contato">
        <p>
          O objetivo é receber contexto suficiente para avaliar o projeto antes de abrir
          uma conversa manual. Enviar uma solicitação não significa aceite automático,
          prazo garantido ou produção imediata.
        </p>
      </StudioSection>
    </StudioPageShell>
  );
}
