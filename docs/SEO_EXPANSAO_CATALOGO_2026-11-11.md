# Expansão de indexação de produtos Shopee — 11/11/2026

**Projeto:** CMangini3D (`radioand3d`). **Objetivo:** páginas de produto próprias no Google → clique para anúncio exato na Shopee. Esta decisão não altera anúncios, estoque, Ads ou o ranking de buscas interno da Shopee.

## Resultado da revisão

- **28 produtos no snapshot do site.** Os 23 que ainda não estavam liberados foram consultados individualmente na Shopee por `shopee_item_drilldown`, ambiente `live`, em 11/11/2026.
- **23 anúncios restantes:** todos retornaram `external_item_status=NORMAL`, `product_active=true`, `identity_status=resolved` e `catalog_freshness_status=fresh` na loja 1433140862. A leitura de estoque foi numérica em 22; o anúncio de soldados trouxe estoque não confirmado (`null`). Isso é uma observação pontual, não monitoramento permanente.
- **18 produtos liberados na primeira expansão**, somados aos 5 iniciais, e **mais 2 produtos liberados na etapa seguinte**: **25/28** páginas elegíveis para indexação em produção. **3 permanecem bloqueados** até verificações específicas.
- Os textos e títulos SEO de cada slug já estão separados da cópia bruta da Shopee. Verificações automatizadas garantem a existência de meta description, lead, texto, atributos, imagens ligadas ao item e CTA por ID. Isso **não substitui** leitura visual das fotografias nem comprova demanda de busca.

## Liberados nesta expansão

| Slug | Item Shopee | Estado na leitura live |
| --- | ---: | --- |
| `porta-figurinhas-3d` | 58206080464 | NORMAL / ativo |
| `caixa-organizadora-quadrada` | 22299445645 | NORMAL / ativo |
| `caixinha-organizadora-pequena` | 23994354406 | NORMAL / ativo |
| `estojo-duplo-compacto` | 22499019708 | NORMAL / ativo |
| `porta-lapis-cachepo` | 23994442959 | NORMAL / ativo |
| `suporte-celular-articulado` | 23198860379 | NORMAL / ativo |
| `chaveiro-mureta-santos` | 23194376258 | NORMAL / ativo |
| `capa-botao-descarga` | 58204546948 | NORMAL / ativo |
| `dinossauro-articulado-t-rex` | 23899132982 | NORMAL / ativo |
| `imas-frases-veganas-2` | 23999130369 | NORMAL / ativo |
| `imas-frases-veganas-4` | 58200563741 | NORMAL / ativo |
| `bolinhas-basquete-sensoriais` | 22594391508 | NORMAL / ativo |
| `kit-porta-curativos` | 58202517766 | NORMAL / ativo |
| `mini-arvore-pinheiro` | 23599182683 | NORMAL / ativo |
| `nave-espacial-espiral` | 22094423435 | NORMAL / ativo |
| `porta-controle-good-vibes` | 23698986383 | NORMAL / ativo |
| `porta-remedios-semanal` | 23094376171 | NORMAL / ativo |
| `trio-estrelas-decorativas` | 22799021123 | NORMAL / ativo |
| `martelo-thor-rotativo` | 23598985651 | NORMAL / ativo; 20 unidades observadas |
| `kit-soldados-verdes-dedo-do-meio` | 58222566967 | NORMAL / ativo; estoque da Shopee não confirmado |

## Três produtos aguardando validação (sem indexação automática)

| Slug | Evidência atual | Motivo para segurar |
| --- | --- | --- |
| `kit-porta-figurinhas-3d` | NORMAL; 97 unidades observadas; 8 imagens | O nome diz **kit**, mas a descrição do anúncio descreve essencialmente um único estojo e não identifica quantas peças compõem o kit. Confirmar conteúdo e ajustar título e descrição antes de anunciar no Google. |
| `dummy-13-boneco-articulado` | NORMAL; 5 unidades; 4 imagens | Confirmar qual versão do modelo é realmente usada e documentar a licença e a **atribuição correta**. O Dummy 13 original de soozafone é CC BY 4.0 e permite venda com atribuição; remixes podem ter outras condições. Fonte do autor: https://www.lucky13toys.com/faq |
| `fita-cassete-retro` | NORMAL; 2 unidades; **1 imagem** | Pouca prova visual e o anúncio usa alusão a uma série conhecida (`Stranger T`). Confirmar se a imagem e a peça são genéricas/autorais, acrescentar fotos reais e então liberar. |

## Como funciona no código

- `src/features/products/search-approval.ts`: whitelist **explícita** de 25 slugs. Novos anúncios **não** entram automaticamente só por constarem na Shopee.
- `src/app/produtos/[slug]/page.tsx`: índice liberado apenas se o ambiente Vercel é Production, o slug foi aprovado e a origem do catálogo está `NORMAL`.
- `src/app/sitemap.ts`: publicará **4 URLs principais + até 25 detalhes**, somente para os aprovados com status `NORMAL`. Produtos pendentes continuam navegáveis no site, mas com `noindex`, e ausentes do sitemap.
- `src/app/produtos/product-catalog.tsx`: cada produto aparece com um link HTML para a página de detalhes; a listagem já é indexada, ajudando na descoberta.
- **Risco operacional conhecido:** `CM_SITE_CATALOG_API_URL` e `CM_SITE_CATALOG_TOKEN` não estão configuradas na Vercel de produção. O código usa **snapshot** versionado, cujo estado `NORMAL` é fixado no carregamento. Portanto, se o anúncio mudar de status na Shopee após esta auditoria, o site não o refletirá sozinho. Revalidar/atualizar manualmente até existir feed seguro e atualizado; não confundir status do snapshot com status atual da Shopee.
- Não são exibidos preços, estoques ou avaliações sem dados seguros e consistentes; o checkout permanece na Shopee.

## Sobre a inspeção do Google (URL não reconhecida)

Em 11/11/2026, o Search Console informou, para `/produtos/caixa-organizadora-dois-compartimentos`, **`O URL não está no Google: O Google não reconhece o URL`**, com `Último rastreamento: N/D` e indexação já solicitada. **Isso significa que a página não tem registro de rastreamento concluído; não comprova bloqueio técnico ou punição.**

O campo `Nenhum sitemap de referência detectado` pode aparecer antes do Google processar a URL e associá-la ao sitemap. Não há motivo para reenviar repetidamente o mesmo sitemap nem solicitar indexação várias vezes.

## Validação pós-publicação

- [ ] Confirmar SHA de produção na Vercel e `READY`.
- [ ] Verificar no domínio público `/sitemap.xml`, presença dos **25 URLs de produtos aprovados** e ausência dos 3 pendentes; conferir 200/robots/canonical e resposta 200 dos detalhes.
- [ ] Conferir carregamento e correspondência das fotos reais de cada item, antes de considerar validação visual concluída.
- [ ] No Search Console, **Inspeção de URL > Testar URL publicado** em amostras (incluindo `/caixa-organizadora-dois-compartimentos`) e verificar acessibilidade, indexação permitida e canonical. Se já houver solicitação, **não repetir**.
- [ ] Conferir se `Sitemaps` está com processamento `Sucesso`; a descoberta pode demorar e não garante indexação/posicionamento.
- [ ] Acompanhar páginas rastreadas/indexadas, impressões, consultas, CTR e cliques para a Shopee. Não presumir melhora do ranking dentro da plataforma.

**Aceite:** whitelist e testes aprovados + build e deploy validados. Não usar `Google não reconhece URL` como motivo para habilitar itens sem qualidade; separar problemas de descoberta de decisões editoriais.

## Verificação pública e atualização das fotos em 11/11/2026

- GitHub Actions [SEO public runtime smoke](https://github.com/cassianomangini/radioand3d/actions/runs/43007747332): **sucesso**, 27 URLs no sitemap (4 principais + 23 produtos), 28 páginas de produtos verificadas, canonical, robots/noindex, CTA de compra por ID e 28 imagens principais respondendo como imagens. Zero erros e zero avisos CDN. Isto verifica HTTP/HTML, **não a aparência visual real das fotos**.
- Leitura `view_shopee_item_images` da Shopee live identificou 1 divergência de 28 anúncios: quatro URLs secundárias de `caixa-organizadora-grande` foram substituídas na Shopee; a imagem principal permaneceu igual. A atualização do snapshot substitui **apenas** essas quatro referências, sem alterar nomes, preço, estoque ou outras imagens.
- Na data da auditoria original, 5 pendências editoriais e de origem permaneciam bloqueadas. A etapa posterior liberou martelo e soldados, mantendo 3 pendentes; o teste HTTP não substitui autorização de direitos do modelo ou conferência de kits.

## Liberação dos produtos Martelo Nórdico e Soldados Verdes (11/11/2026)

- **Martelo nórdico:** item 23598985651, Shopee live `NORMAL`, ativo, vínculo confirmado, 20 unidades observadas; duas imagens correspondem exatamente às referências atuais do anúncio. A página do site já apresenta título genérico “Martelo Nórdico Rotativo”, medidas, mecanismo rotativo e ressalva de uso decorativo, sem alegar licença de personagem.
- **Kit 3 Soldados Verdes:** item 58222566967, Shopee live `NORMAL`, ativo, vínculo confirmado, quatro imagens correspondem às referências atuais do anúncio. Conteúdo e material descritos pela ficha do produto. **A quantidade disponível na Shopee não foi confirmada pela integração** (retorno `null`); o Admin registra 10 unidades no produto e 0 no SKU migrado. O site não informa quantidade em estoque. Isso exige conciliação operacional independente, mas não impede que a página institucional do produto seja descoberta e rastreada enquanto o anúncio permanecer ativo.
- **SEO:** ambos entram na whitelist e sitemap apenas quando status de catálogo for `NORMAL`; permanecem `noindex` em previews. Não usar nomes “Toy Story”, “Disney”, “Pixar” ou “Marvel” para atrair visitas sem prova de associação ou licenciamento. A procedência dos arquivos de impressão não foi auditada, e a liberação do SEO não representa parecer de propriedade intelectual.
- **Resultado esperado após deploy:** 4 páginas gerais + 25 produtos = **29 URLs** no sitemap. Continuam pendentes somente `kit-porta-figurinhas-3d`, `dummy-13-boneco-articulado` e `fita-cassete-retro`.
- Verificação pós-deploy obrigatória: HTTP 200, canonical, ausência de `noindex`, CTA do anúncio correspondente, imagem principal acessível e presença das duas URLs no `sitemap.xml`. Indexação efetiva depende do rastreamento posterior pelo Google.
