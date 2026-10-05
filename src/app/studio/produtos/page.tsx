import {
  MediaPlaceholder,
  PrimaryLink,
  StudioPageShell,
  StudioSection
} from "@/components/studio/studio-content";
import { buildPublicMetadata } from "@/lib/site-config";

export const metadata = buildPublicMetadata({
  title: "Produtos do Estúdio | CM 3D & Radio",
  description:
    "Produtos próprios do Estúdio apresentados com fotos, medidas, materiais e informações antes da compra na Shopee.",
  pathname: "/studio/produtos"
});

export default function StudioProductsPage() {
  return (
    <StudioPageShell
      eyebrow="Produtos"
      title="Conheça aqui. Compre na Shopee."
      lead="O nosso domínio explica cada peça. Quando o produto estiver publicado, a Shopee entra somente no passo de finalizar a compra, pagamento e disponibilidade."
    >
      <StudioSection title="Catálogo sem produto fictício">
        <MediaPlaceholder
          kind="user-photo"
          note="Fotografia real do primeiro produto publicado no site. Não criaremos cards vazios para simular variedade."
        />
        <p>
          Cada produto real terá página própria com fotos, medidas, material, opções e
          contexto suficiente para a pessoa decidir se faz sentido antes de sair do site.
        </p>
      </StudioSection>

      <StudioSection eyebrow="Compra externa" title="Preço e disponibilidade ficam onde são confiáveis">
        <p>
          Enquanto não existir sincronização segura de preço e estoque, o site não replica
          números que podem ficar desatualizados. A página do produto usa “Ver preço e
          disponibilidade na Shopee”.
        </p>
      </StudioSection>

      <StudioSection title="Precisa de outra medida ou de algo personalizado?">
        <p>
          Produto pronto e projeto sob medida são jornadas diferentes. Uma necessidade
          específica segue pelo orçamento, sem obrigar a pessoa a procurar outro canal.
        </p>
        <PrimaryLink href="/studio/orcamento">Pedir algo personalizado</PrimaryLink>
      </StudioSection>
    </StudioPageShell>
  );
}
