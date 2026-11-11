# Piloto de indexação de 5 produtos Shopee (11/11/2026)

**Objetivo:** captar pesquisas de produtos no Google com páginas próprias do CMangini3D e encaminhar o interessado ao anúncio específico da Shopee. O posicionamento do anúncio **dentro da Shopee** é outro processo, não uma consequência garantida desta liberação.

## Produtos da primeira onda

| Slug / produto | Item Shopee | Intenção pesquisável candidata (sem volume aferido) |
|---|---:|---|
| `caixa-organizadora-dois-compartimentos` — Caixa com dois compartimentos | 58265650998 | caixa organizadora 2 compartimentos com tampa deslizante |
| `porta-curativos-compacto` — Porta-curativos compacto | 23198719725 | porta curativos compacto para bolsa |
| `porta-controles-de-mesa` — Porta-controles de mesa | 22398887031 | porta controles de mesa com duas divisórias |
| `casinha-porta-iscas-formiga` — Casinha porta-iscas | 58264337332 | casinha para isca de formiga com telhado |
| `caixa-organizadora-grande` — Caixa grande deslizante | 58258025838 | caixa organizadora grande com tampa deslizante |

**Evidência conferida antes da liberação:**

- Leitura da **Shopee live via CM ORBE OS** em 11/11/2026: os cinco itens estavam ativos, `NORMAL`, com estoque observado e ID de anúncio vinculado à loja correta. Não significa garantia futura de estoque de cada variante.
- Catálogo público do repositório contém slugs estáveis, os identificadores Shopee, variantes e **5 a 9 imagens por item** no CDN oficial do respectivo anúncio. Páginas apontam à URL do item real, sem checkout próprio.
- Os cinco têm título SEO editorial, meta description, apresentação, texto complementar, atributos e ressalvas próprios em `catalog-product-editorial.ts` e `editorial-titles.ts`. Não publicar preço, review ou promessa de disponibilidade não observada.
- Busca qualitativa preliminar por termos de organizadores e porta-controles mostrou concorrentes comerciais; **não foi feita medição do volume de busca ou dificuldade de ranqueamento**.

**Liberação técnica:** `search-approval.ts` aprova exatamente esses slugs, desde que status `NORMAL`, e somente em `VERCEL_ENV=production`. Em produção, cada um entra no `sitemap.xml` e a página deixa de receber `noindex`. As outras páginas de produtos continuam visíveis ao visitante, mas com `noindex`. A trilha `BreadcrumbList` utiliza somente URLs canônicas e nomes reais, sem alegações de preço/avaliação.

## Pós-deploy e limitações

- [ ] Confirmar publicação do commit em `Production` na Vercel.
- [ ] Inspecionar visualmente as imagens no site e confirmar HTTP 200, título, descrição, canonical, `index` e botão que abre o anúncio correto para cada uma das cinco páginas.
- [ ] Testar em ambiente preview: os mesmos detalhes continuam `noindex`.
- [ ] Verificar `/sitemap.xml`: 4 páginas principais + exatamente 5 URLs de produtos (se todos os cinco seguirem `NORMAL`). O sitemap não garante que o Google indexe.
- [ ] Inspecionar as cinco URLs no Search Console; solicitar indexação uma vez por URL se aparecerem elegíveis.
- [ ] Acompanhar indexação, consultas, impressões, cliques e CTR. Depois avaliar ampliação do piloto e resultados comerciais sem inferir causalidade automática.

**Limitação de verificação:** nesta execução, a resposta HTTP pública do domínio e o carregamento do CDN de imagens não puderam ser acessados externamente pelas ferramentas; há **proveniência de URLs por anúncio**, mas **não há inspeção visual dos cinco conjuntos de fotos**. O gate de qualidade precisa dessa revisão pós-deploy. Sem ela, não declarar que o resultado visual está validado.

O piloto **não altera anúncios, preço, Ads, estoque nem checkout da Shopee**.
