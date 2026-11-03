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
  title: "Caixas personalizadas em impressão 3D | CM 3D & Radio",
  description:
    "Caixas sob medida pensadas a partir do que precisa caber, proteger, organizar ou encaixar.",
  pathname: "/studio/caixas-personalizadas"
});

export default function CustomBoxesPage() {
  return (
    <StudioPageShell
      eyebrow="Caixas personalizadas"
      title="A caixa começa pelo que precisa caber."
      lead="Medidas, tampa, encaixe, divisórias, passagem de cabo e função vêm antes da aparência. A proposta é resolver o objeto, não apenas imprimir um formato de caixa."
      pathname="/studio/caixas-personalizadas"
      breadcrumbLabel="Caixas personalizadas"
    >
      <PrimaryLink href="/studio/orcamento?tipo=caixa">Pedir orçamento de caixa</PrimaryLink>

      <StudioSection title="Prova real antes do lançamento">
        <MediaPlaceholder
          kind="user-photo"
          note="Foto de uma caixa realmente produzida, preferencialmente mostrando o objeto interno ou a função que ela resolve."
        />
      </StudioSection>

      <StudioSection eyebrow="O projeto" title="O que precisamos entender">
        <TextList>
          <li>O que precisa caber ou ser protegido.</li>
          <li>Se as medidas importantes são internas ou externas.</li>
          <li>Se precisa de tampa, encaixe ou divisórias.</li>
          <li>Se precisa de furo, passagem de cabo ou apoio.</li>
          <li>Quantidade necessária.</li>
        </TextList>
      </StudioSection>

      <StudioSection title="Medidas podem ganhar um diagrama simples">
        <MediaPlaceholder
          kind="diagram"
          note="Diagrama funcional de comprimento, largura, altura, área útil e encaixes. Sem render de produto falso."
        />
      </StudioSection>

      <StudioSection title="Não sabe definir tudo sozinho?">
        <p>
          O fluxo de orçamento permite informar o que você sabe e marcar quando precisa
          de orientação. Não é necessário dominar termos técnicos para iniciar.
        </p>
        <PrimaryLink href="/studio/orcamento?tipo=caixa">
          Descrever a caixa
        </PrimaryLink>
      </StudioSection>
      <StudioMaterialGuidance />
    </StudioPageShell>
  );
}
