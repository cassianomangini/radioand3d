import {
  MediaPlaceholder,
  PrimaryLink,
  StudioPageShell,
  StudioSection
} from "@/components/studio/studio-content";
import { buildPublicMetadata } from "@/lib/site-config";

export const metadata = buildPublicMetadata({
  title: "Impressões 3D | CM 3D & Radio",
  description:
    "Peças que já saíram das impressoras do Estúdio, apresentadas com contexto real de produção.",
  pathname: "/studio/impressoes"
});

export default function StudioPrintsPage() {
  return (
    <StudioPageShell
      eyebrow="Impressões"
      title="O que já saiu das impressoras."
      lead="Esta área é portfólio e prova de capacidade. Só entram peças realmente produzidas, projetos autorizados ou conceitos claramente identificados como conceito."
    >
      <StudioSection title="Peças reais, sem catálogo inventado">
        <MediaPlaceholder
          kind="user-photo"
          note="Galeria principal de peças realmente impressas. Ideal: fotos próprias, enquadramento consistente e contexto de cada peça."
        />
        <p>
          Cada entrada poderá informar o que é a peça, por que foi produzida, material,
          medidas e acabamento quando essas informações forem úteis e publicáveis.
        </p>
      </StudioSection>

      <StudioSection eyebrow="Serviço" title="Já tem um arquivo 3D pronto?">
        <p>
          Se você já possui o modelo e quer saber se conseguimos fabricar, existe um
          caminho separado para análise do arquivo.
        </p>
        <PrimaryLink href="/studio/impressao-3d-sob-demanda">
          Enviar arquivo para análise
        </PrimaryLink>
      </StudioSection>

      <StudioSection eyebrow="Projeto personalizado" title="Quer algo nessa linha?">
        <p>
          O orçamento coleta o contexto do projeto antes do contato manual e mostra
          somente as perguntas relevantes para o tipo de peça.
        </p>
        <PrimaryLink href="/studio/orcamento">Pedir orçamento</PrimaryLink>
      </StudioSection>
    </StudioPageShell>
  );
}
