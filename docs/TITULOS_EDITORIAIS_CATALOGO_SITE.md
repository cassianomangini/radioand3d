# Títulos editoriais do catálogo no site CMangini3D

**Escopo:** apresentação dos produtos Shopee no site. Não há alterações no Seller Center, no banco, nos preços, nos links de compra ou nos slugs.

## Regra

- O nome bruto recebido do catálogo Shopee permanece intacto no snapshot ou na resposta da API.
- O site usa títulos editoriais por `slug` estável, para card, H1, breadcrumb, galeria e referência de produto no orçamento.
- SEO Title é independente: produto e intenção comercial específica, terminando em `| CMangini3D`.
- Os 27 slugs presentes no snapshot atual têm equivalência explícita em `src/features/products/editorial-titles.ts`. Títulos de exibição têm até 48 caracteres; cards limitam visualmente a 2 linhas.
- Um novo item sem curadoria recebe sugestão de até 48 caracteres: aproveita separadores da Shopee quando úteis ou corta no limite de uma palavra, sem fabricar atributos. **Exige revisão editorial** antes de entrar no índice. O dado de origem continua intacto.
- Se a Shopee mudar o nome de um dos 27 anúncios, a versão editorial se mantém. Quando o produto mudar de natureza, a curadoria deve ser revista.
- O controle de indexação em `search-approval.ts` permanece inalterado: título curto **não** significa aprovação de SEO ou entrada automática no sitemap.

## Limites

O mapeamento fica no repositório como configuração editorial versionada. Uma interface administrativa ou persistência externa de títulos editoriais não faz parte deste PR. A descrição SEO atual continua vinculada ao catálogo, pendente de revisão por produto antes da aprovação para indexação.

## Verificação

`tests/product-editorial-titles.test.cjs` cobre os 27 slugs, títulos únicos e curtos, independência do nome Shopee, comportamento para novos produtos e normalização da marca. O fixture de `tests/quote-multi-model.test.cjs` foi atualizado para refletir a data desejada opcional (`desiredDate: ''`) que o contrato já exige; nenhuma regra de validação de produção foi alterada.

**Antes do merge:** executar `npm test`, `npm run lint`, `npm run typecheck`, `npm run build` e conferir visualmente a listagem e um detalhe no desktop e no mobile. Não confundir presença do código com validação visual ou deploy.
