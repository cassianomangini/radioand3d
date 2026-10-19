import { PrimaryLink, StudioMaterialGuidance, StudioPageShell, StudioSection } from "@/components/studio/studio-content";
import { buildPublicMetadata } from "@/lib/site-config";

export const metadata = buildPublicMetadata({
  title: "Materiais e cores | CM 3D & Radio",
  description: "Conheça como escolhemos materiais, cores e acabamentos para os projetos de impressão 3D.",
  pathname: "/studio/materiais"
});

export default function StudioMaterialsPage() {
  return (
    <StudioPageShell
      eyebrow="Materiais"
      title="A escolha certa para cada ideia."
      lead="Cores, acabamentos e materiais fazem diferença no resultado. Vamos escolher conforme a função, o projeto e a disponibilidade real."
      pathname="/studio/materiais"
      breadcrumbLabel="Materiais"
    >
      <StudioMaterialGuidance />
      <StudioSection title="Tem uma ideia ou um arquivo para imprimir?">
        <p>Conte o que precisa. O material e o acabamento podem ser definidos durante a análise do projeto.</p>
        <PrimaryLink href="/studio/orcamento">Pedir orçamento</PrimaryLink>
      </StudioSection>
    </StudioPageShell>
  );
}
