import {
  MediaPlaceholder,
  PrimaryLink,
  StudioMaterialGuidance,
  StudioPageShell,
  StudioSection,
  TextList
} from "@/components/studio/studio-content";
import { buildPublicMetadata } from "@/lib/site-config";

export const metadata = buildPublicMetadata({
  title: "Impressão 3D sob demanda | CM 3D & Radio",
  description:
    "Já tem um arquivo 3D? Envie para análise de viabilidade, material, tamanho e quantidade.",
  pathname: "/studio/impressao-3d-sob-demanda"
});

export default function OnDemandPrintingPage() {
  return (
    <StudioPageShell
      eyebrow="Impressão 3D sob demanda"
      title="Já tem o arquivo 3D?"
      lead="Envie para análise e verificamos se conseguimos produzir a peça. O envio não significa aceite automático: primeiro avaliamos a viabilidade do modelo e as condições do pedido."
      pathname="/studio/impressao-3d-sob-demanda"
      breadcrumbLabel="Impressão 3D sob demanda"
    >
      <PrimaryLink href="/studio/orcamento?tipo=impressao">
        Enviar arquivo para análise
      </PrimaryLink>

      <StudioSection title="Uma foto real entra aqui antes do lançamento">
        <MediaPlaceholder
          kind="user-photo"
          note="Processo de impressão ou peça produzida a partir de arquivo recebido. Não usar render sintético como prova."
        />
      </StudioSection>

      <StudioSection eyebrow="Como funciona" title="Arquivo primeiro. Análise depois.">
        <TextList>
          <li>Você envia o arquivo e informa a quantidade desejada.</li>
          <li>Se houver tamanho ou escala obrigatórios, isso entra junto do pedido.</li>
          <li>Material e cor podem ser informados ou deixados como “não sei”.</li>
          <li>Avaliamos orientação, suporte, dimensões e compatibilidade com o processo.</li>
          <li>Se for viável, o projeto segue para orçamento e produção.</li>
        </TextList>
      </StudioSection>

      <StudioSection title="O que não prometemos antes da análise">
        <p>
          Nem todo arquivo é automaticamente imprimível nas condições disponíveis.
          Também não presumimos prazo, material, acabamento ou necessidade de ajustes
          sem verificar o modelo e o pedido.
        </p>
        <PrimaryLink href="/studio/orcamento?tipo=impressao">
          Começar análise
        </PrimaryLink>
      </StudioSection>
      <StudioMaterialGuidance />
    </StudioPageShell>
  );
}
