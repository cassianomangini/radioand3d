import { PrimaryLink, StudioPageShell, StudioSection } from "@/components/studio/studio-content";
import { buildPublicMetadata } from "@/lib/site-config";

export const metadata = buildPublicMetadata({
  title: "O Estúdio | CM 3D & Radio",
  description: "Conheça o Estúdio CM: impressão 3D, personalização e projetos desenvolvidos com tecnologia e atenção aos detalhes.",
  pathname: "/studio/o-estudio"
});

export default function AboutStudioPage() {
  return (
    <StudioPageShell
      eyebrow="O Estúdio"
      title="Ideias que saem da tela."
      lead="Um espaço dedicado a imprimir peças, desenvolver projetos personalizados e explorar as possibilidades da impressão 3D."
      pathname="/studio/o-estudio"
      breadcrumbLabel="O Estúdio"
    >
      <StudioSection title="O que fazemos">
        <p>Trabalhamos com impressão 3D sob demanda, placas, caixas e peças personalizadas. Cada projeto começa com uma necessidade diferente, seja um arquivo pronto ou uma ideia para desenvolver.</p>
      </StudioSection>
      <StudioSection title="Do arquivo à peça real">
        <p>Preparamos o arquivo, escolhemos material e configuração adequados, acompanhamos a impressão e conferimos o resultado antes de apresentar a peça.</p>
        <PrimaryLink href="/studio/impressoes">Conhecer as impressões</PrimaryLink>
      </StudioSection>
      <StudioSection title="Seu projeto também pode ganhar forma">
        <p>Se você já tem um modelo 3D ou precisa de uma peça sob medida, conte o que procura.</p>
        <PrimaryLink href="/studio/orcamento">Solicitar orçamento</PrimaryLink>
      </StudioSection>
    </StudioPageShell>
  );
}
