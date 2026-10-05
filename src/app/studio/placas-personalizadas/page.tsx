import {
  MediaPlaceholder,
  PrimaryLink,
  StudioPageShell,
  StudioSection,
  TextList
} from "@/components/studio/studio-content";
import { buildPublicMetadata } from "@/lib/site-config";

export const metadata = buildPublicMetadata({
  title: "Placas personalizadas em impressão 3D | CM 3D & Radio",
  description:
    "Placas personalizadas com logo, texto, QR Code e outras combinações, avaliadas de acordo com o uso e o projeto.",
  pathname: "/studio/placas-personalizadas"
});

export default function CustomSignsPage() {
  return (
    <StudioPageShell
      eyebrow="Placas personalizadas"
      title="Uma placa feita para o espaço, a marca e a função."
      lead="Logo, texto, QR Code, apoio de mesa, balcão ou parede entram como partes do projeto — não como um modelo genérico com preço escondido."
      pathname="/studio/placas-personalizadas"
      breadcrumbLabel="Placas personalizadas"
    >
      <PrimaryLink href="/studio/orcamento?tipo=placa">Pedir orçamento de placa</PrimaryLink>

      <StudioSection title="Projeto real principal">
        <MediaPlaceholder
          kind="user-photo"
          note="Foto principal de uma placa realmente produzida. O projeto Mano Jotta é um candidato se a publicação estiver autorizada."
        />
      </StudioSection>

      <StudioSection eyebrow="Possibilidades" title="O que pode mudar de uma placa para outra">
        <TextList>
          <li>Tamanho e formato conforme o espaço de uso.</li>
          <li>Apoio, fixação ou posição de uso.</li>
          <li>Logo, texto, QR Code ou combinação entre eles.</li>
          <li>Cores compatíveis com o projeto e a produção.</li>
          <li>Iluminação somente quando fizer parte do serviço realmente oferecido.</li>
        </TextList>
      </StudioSection>

      <StudioSection title="Detalhes do projeto">
        <MediaPlaceholder
          kind="user-photo"
          note="Foto de detalhe/acabamento ou segunda vista do mesmo projeto real."
        />
        <p>
          Aqui entram contexto, medidas, material e o que foi personalizado, desde que
          essas informações possam ser publicadas.
        </p>
      </StudioSection>

      <StudioSection eyebrow="Antes de pedir" title="Ajuda ter estas informações">
        <TextList>
          <li>Logo, arte, texto ou QR Code.</li>
          <li>Tamanho aproximado ou espaço disponível.</li>
          <li>Referência visual, se existir.</li>
          <li>Quantidade desejada.</li>
          <li>Onde a placa será usada.</li>
        </TextList>
        <PrimaryLink href="/studio/orcamento?tipo=placa">
          Pedir orçamento de placa
        </PrimaryLink>
      </StudioSection>
    </StudioPageShell>
  );
}
