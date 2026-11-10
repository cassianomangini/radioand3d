# Catálogo comercial CMangini3D — textos para 27 produtos

**Estado do código:** os 27 slugs presentes no snapshot publicado têm descrição comercial própria, sem edição de anúncios da Shopee.
**Origem:** `src/server/products/published-catalog-snapshot.json`, correspondente aos itens anteriormente sincronizados para o site.
**Implementação:** `src/features/products/catalog-product-editorial.ts`, lida pela página `src/app/produtos/[slug]/page.tsx`.

## O que foi implementado

- Preservados os cinco produtos já revisados. Os 22 restantes receberam abertura de benefício, explicação curta, fatos verificáveis, nota objetiva e metadescrição independente.
- A seção de características é estruturada e acessível; não depende da cópia integral da descrição original da Shopee.
- Produtos com medidas conflitantes não receberam números não confirmados nas características editoriais.
- Títulos, IDs, preços, imagens, slugs e links da Shopee continuam vindo do catálogo original; o conteúdo do site é uma camada editorial separada.
- Não foram adicionados preços, avaliações, garantias, estoque, promessas de cura/ansiedade, certificação de material nem alegações ambientais.
- Nenhum item foi adicionado a `search-approval.ts`. **As páginas continuam com `noindex` e o sitemap não foi ampliado.**

## Verificações de dados pendentes antes da indexação

1. **Caixinha organizadora pequena:** `dimensions` apresenta `8x6x1,5`, enquanto a descrição lista `8,8 × 6,2 × 1,5 cm`. O texto do site não especifica dimensões até corrigir/confirmar.
2. **Estojo duplo compacto:** `dimensions` indica comprimento de 11 cm e a descrição, 11,5 cm. Não publicar número como certo até conferir a peça.
3. **Suporte de celular:** a ficha tem `21x12x13` sem ordem de dimensões. Conferir altura/largura/profundidade antes de exibir medidas detalhadas.
4. **Good Vibes Only:** descrição menciona tamanhos P e M, mas a ficha do site não lista variações. Não prometer tamanho selecionável sem verificar o anúncio.
5. **Kit porta-figurinhas:** o nome inclui “kit”, mas a descrição não especifica a quantidade de caixas. Confirmar conteúdo exato do kit.
6. **Porta-remédios semanal:** não prometer eficácia para prevenir erros de dose ou segurança de contato direto com medicamentos sem documentação apropriada.
7. **Itens com referências de terceiros:** não associar produtos do estúdio a marcas, personagens ou franquias sem autorização; revisar fotos/arte, sobretudo fita cassete, martelo e peças colecionáveis.

## Diferença entre Shopee e site (10/11/2026)

Na consulta de leitura à Shopee, havia **28 anúncios NORMAL**. O snapshot publicado contém **27 itens**. O anúncio novo `58222566967` (“Kit 3 Miniaturas Decorativas Soldado Verde Dedo do Meio”) estava sem `product_id` vinculado na view da loja, portanto **não existe como produto válido no catálogo do site**. Não fabricar uma 28ª página automaticamente; vincular e sincronizar antes, pelo fluxo comercial apropriado.

## Critérios para aprovar SEO depois

Conferir cada anúncio ativo, foto real, dimensões, variações, direitos aplicáveis, canonical, destino do CTA Shopee, HTML gerado e experiência desktop/mobile. Validar metadados e a ausência de texto desatualizado. Só depois aprovar slugs específicos no gate de indexação e confirmar HTML/robots/sitemap da produção. **Nenhuma melhora de posição, CTR ou vendas é garantida pelo texto.**
