# Piloto SEO editorial - cinco produtos da Shopee

**Estado:** textos comerciais reescritos e organizados no código, **sem autorização para indexação**; revisão de dados, fotos e visual ainda obrigatória.
**Projeto:** CMangini3D, frente de produtos do repositório `radioand3d`.
**Fonte dos atributos:** `src/server/products/published-catalog-snapshot.json`, sincronizado em **04/11/2026**. São informações fornecidas pelos próprios anúncios, não testes laboratoriais nem confirmação atual de estoque, cor ou medidas.

## O que este PR realmente entrega

- Metadescrições únicas para cinco páginas prioritárias, sem simplesmente repetir o título bruto da Shopee.
- Texto comercial por produto: benefício inicial, explicação curta, fatos em campos legíveis e uma ressalva objetiva. Linguagem natural, sem expressões como "o anúncio informa".
- Nenhuma alteração no anúncio, banco, sincronização, preço, link de compra ou slug.
- **Nenhuma alteração no `search-approval.ts` ou no sitemap.** As cinco páginas continuam `noindex` até uma revisão posterior explícita.
- Os títulos curtos do **PR #45** já foram integrados à `main`; esta revisão ajusta apenas a apresentação e as descrições comerciais do piloto.

## Candidatos e hipóteses a investigar

| Slug | Intenção principal (hipótese, não volume medido) | Verificação necessária antes da indexação |
| --- | --- | --- |
| `caixa-organizadora-dois-compartimentos` | caixa organizadora com duas divisórias / tampa deslizante | **Há uma variação anunciada sem divisória.** Conferir foto e conteúdo por variante, medidas e SKU escolhido |
| `porta-controles-de-mesa` | suporte ou porta-controles remotos de mesa | Conferir medidas por acabamento, formato dos compartimentos e imagens |
| `porta-curativos-compacto` | estojo porta-curativos para bolsa/viagem | Conferir dimensões internas, compatibilidade de embalagens e texto sobre medicamentos |
| `casinha-porta-iscas-formiga` | suporte casinha para isca de formigas | Confirmar que é **somente o recipiente vazio**; não sugerir proteção infantil ou eficácia do produto químico |
| `porta-figurinhas-3d` | porta-figurinhas com tampa deslizante | Confirmar medidas, compatibilidade com cards e distinção do kit vendido em outro anúncio |

**Excluídos deste primeiro grupo:** Chaveiro Mureta de Santos necessita avaliação de propriedade intelectual e proposta de conteúdo, e os demais produtos podem seguir em outra onda. Seleção não comprova demanda, margem nem prioridade real de vendas.

## Gate para aprovar no Google

1. Confirmar ao vivo o ID do anúncio específico, status `NORMAL`, link de saída, fotos e variações.
2. Comparar as medidas e as funcionalidades deste texto com o produto físico ou cadastro comercial revisado. Remover qualquer afirmação que não possa ser sustentada.
3. Conferir página real em preview (desktop, mobile, imagens 4:5, CTA Shopee e H1), metadados, canonical, links e ausência de overflow. Até lá, o visual **não está aprovado**.
4. Comparar linguagem das consultas e concorrentes no Google Search Console/SERP. Palavras-chave da tabela são **hipóteses**.
5. Avaliar riscos de marcas, personagens e promessas; não fabricar `Offer`, preço, estoque, avaliação ou JSON-LD de produto não validado.
6. Somente depois de aprovação editorial/visual e testes, adicionar explicitamente cada slug ao gate de indexação, verificar HTML e sitemap em produção. Não fazer liberação em massa.

A boa metadescrição pode ajudar na apresentação da página, mas o Google não garante que a use. O texto próprio também não garante ranking ou vendas.
