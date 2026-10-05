import {
  PrimaryLink,
  StudioPageShell,
  StudioSection
} from "@/components/studio/studio-content";

export default function ProductNotFound() {
  return (
    <StudioPageShell
      eyebrow="Produtos"
      title="Esse produto não está publicado."
      lead="A URL não corresponde a um produto disponível no catálogo público do Estúdio."
      pathname="/studio/produtos"
      breadcrumbLabel="Produto não encontrado"
    >
      <StudioSection title="Veja somente o que está realmente publicado">
        <p>
          O catálogo não cria itens de demonstração. Quando um produto real estiver
          disponível, ele aparece na lista com fotos e informações próprias.
        </p>
        <PrimaryLink href="/studio/produtos">Voltar aos produtos</PrimaryLink>
      </StudioSection>
    </StudioPageShell>
  );
}
