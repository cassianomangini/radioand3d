# Sincronização Artesópolis Admin → CMangini3D (site owner do SEO)

Data: 13/11/2026. Implementação proposta no repositório `radioand3d`.

## Decisão de ownership

O Admin é fonte **operacional**: item/loja Shopee, status, link, fotos, variações,
nome/descrição de origem, data de sincronização e dimensões internas quando
verificadas. O site é dono de **slugs, publicação, títulos comerciais,
descrições públicas, conteúdo editorial, indexação, canonical e sitemap**.
Nenhum dado editorial precisa ser cadastrado ou gravado no Artesópolis Admin.

Contrato de origem: `GET /api/internal/site-catalog` do Artesópolis Admin,
versão **1**, criado pelo PR #545. Este endpoint é **incompatível** com o
antigo retorno `{ products: [...] }` esperado no site antes desta mudança.

## Comportamento implementado

1. O servidor do site lê todas as páginas do feed, 50 itens por consulta,
   seguindo o cursor `after`, com validação de versão, loja, IDs, URL da
   Shopee, imagens e dados de origem. Cada consulta tem timeout; o ciclo deve
   terminar sem erro para a projeção ser aceita.
2. A cada **15 minutos**, o Next.js revalida a fonte (intervalo configurado
   no `fetch`). Isso não aumenta a frequência da coleta Shopee do Admin:
   somente reflete o último snapshot **observado** pelo Admin.
3. Os **28 produtos editoriais existentes** continuam com os mesmos slugs,
   títulos e textos curados. O catálogo usa os dados da fonte para refletir
   fotografias, variações, status e dimensões completas verificadas.
4. Um anúncio marcado `UNLIST`, `BANNED`, `SELLER_DELETE`, `STALE`
   ou ligado a produto interno arquivado perde o botão de compra, sai dos
   cards e do sitemap e recebe `noindex`. A URL editorial pode continuar
   disponível para quem já a conhece, exceto exclusão Shopee confirmada.
5. Produtos novos são identificados pelo `shopId + itemId`. Para não
   quebrar URLs após uma mudança de nome, recebem slug automático estável
   `produto-3d-<itemId>`, título e descrição elaborados pelo site a partir
   de dados de origem. A apresentação pública **não inventa** material,
   preço, estoque, licença, característica de fabricação ou personalização.
6. Um item novo só entra no catálogo se estiver ativo, apresentar nome de
   categoria genérica, pelo menos **duas fotos**, descrição de origem útil
   (mínimo 130 caracteres com conteúdo descritivo), fonte sincronizada há no
   máximo **14 dias** e não acionar os filtros de marcas/personagens,
   `kit` ambíguo ou alegações editoriais arriscadas.
7. Mesmo quando o item novo entra no catálogo, o `noindex` fica ativo até
   `CM_SITE_AUTO_INDEX_ENABLED=true`. Quando ligado, somente itens que já
   passaram por esses gates recebem indexação/sitemap. Os 25 produtos
   previamente aprovados mantêm sua liberação independente dessa flag.
8. Os três legados pendentes continuam sem indexação até revisão humana:
   `kit-porta-figurinhas-3d`, `dummy-13-boneco-articulado`,
   `fita-cassete-retro`.
9. Se o feed estiver inacessível, parcial, inválido, com cursor
   truncado, status desconhecido ou faltar **qualquer** um dos 28 itens
   editoriais, o site ativa um **fallback local completo** para os
   28 produtos existentes. As URLs públicas e as 25 aprovações SEO
   permanecem disponíveis. O erro é registrado em log sem credenciais.
   Nunca responder 5xx, catálogo vazio ou sitemap truncado devido apenas
   a uma falha de integração com o Admin.
10. Mesmo com configuração parcial, token ausente ou URL inválida, o
    site continua servindo o snapshot editorial, sem aguardar a API.
    **Limitação do fallback:** o snapshot é histórico, não comprova
    disponibilidade atual na Shopee. O site deve monitorar falhas para
    restabelecer a atualização dos status e fotos.
11. Um item marcado explicitamente como `SELLER_DELETE` deixa de
    oferecer compra e indexação, mas sua URL editorial antiga responde
    200, com o texto preservado, em vez de virar um 404 inesperado.

## Configuração no deploy

No runtime **do Admin**, configurar as três variáveis que o PR #545 exige:

- `CM_SITE_CATALOG_TOKEN` (segredo de alta entropia, >=32 caracteres)
- `CM_SITE_CATALOG_ORGANIZATION_ID` (organização autorizada)
- `CM_SITE_CATALOG_SHOP_ID` (loja Shopee autorizada)

No runtime **do site**:

- `CM_SITE_CATALOG_API_URL=https://<dominio-admin>/api/internal/site-catalog`
- `CM_SITE_CATALOG_TOKEN` (o **mesmo** segredo configurado no Admin)
- `CM_SITE_AUTO_INDEX_ENABLED=false` na primeira publicação; mudar para
  `true` **somente após** validar dados, fotos, slugs, robots e sitemap.

Segredos não devem usar prefixo `NEXT_PUBLIC_`. Não imprimir tokens em
logs nem em URLs. A organização e a loja são fixadas no Admin e não são
escolhidas pelo site por parâmetro da requisição.

## Critérios de validação antes de ativar

- Admin 200 com token autorizado; 403 sem token; nenhum payload de custo,
  estoque, dados privados ou editoração SEO.
- Todos os 28 IDs editoriais encontrados na fonte, com slug estável e
  título/descrição preservados. Conferir especialmente produtos com kits,
  direitos de terceiros e anúncios atualizados recentemente.
- Anúncio suspenso/inativo **confirmado pelo feed** perde CTA e `index`;
  falha de comunicação ativa o snapshot, preservando URLs e SEO, mas sem
  alegar verificação atual de disponibilidade.
- Novos produtos comuns aparecem com página própria e `noindex` enquanto
  auto-indexação estiver desligada. Ativar somente após revisar uma amostra
  de textos e fotos reais.
- Conferir `/produtos`, `/produtos/<slug>`, `/sitemap.xml` e Search
  Console em produção. Exigir 200/canonical/robots/foto principal/CTA
  condizentes com status; não prometer inclusão imediata no Google.
- Não mexer no módulo Rádio, checkout, anúncios, preços, estoque ou
  cadastros do Admin. A publicação não dispara writes na Shopee.

## Limites e próximos aprimoramentos

- A URL automática usa identidade estável, não palavras-chave; trocar por
  um slug descritivo exige **persistência editorial própria do site** e
  redirecionamentos 301/308. Não regenerar slugs a cada sincronização.
- Textos de novos produtos são **composição determinística do site** baseada
  nos dados observados; não existe integração com IA nem revisão jurídica
  automática. Os filtros detectam riscos óbvios, não comprovam licença de
  modelo 3D nem titularidade de imagem. O modo de indexação automática deve
  ser tratado como rollout controlado e auditado.
- O conteúdo editorial manual dos 28 produtos não é sobrescrito por alterações
  no Admin. Em contrapartida, fatos fixos em textos antigos (ex.: medidas
  descritas manualmente) ainda precisam de um auditor editorial específico
  quando a origem mudar, para não ficarem desatualizados.
- O feed Admin v1 não fornece material físico nem flags reais de
  personalização; o site não deve inferir essas propriedades para novos
  itens. A sincronização de imagens internas de `product_media` não faz
  parte deste contrato.
- Uma queda do feed mantém páginas **antigas**, mas não garante
  continuidade de URLs **novas e ainda não editoradas**. Por isso
  `CM_SITE_AUTO_INDEX_ENABLED` permanece `false` até existir uma
  persistência de último estado válido sob ownership do site.
- Esta versão não possui um banco editorial próprio com UI de revisão.
  A curadoria histórica permanece no repositório do site, e os novos itens
  recebem texto inicial com regras. Uma camada editorial persistente pode
  evoluir **somente no site**, sem escrever campos de SEO no Admin.
- O intervalo de 15 minutos cobre o cache do site, mas não garante que a
  Shopee já tenha sido sincronizada no Admin.

**Estado de entrega:** código de leitura e projeção em PR; não prova de deploy
ou integração live até testes, configuração e leitura real serem executados.
