# Catálogo Shopee com SEO — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task by task. Use the checkboxes to track execution.

**Goal:** Publicar páginas próprias para produtos reais da loja Shopee, com conteúdo editorial, SEO verificável e caminhos para comprar o anúncio específico ou solicitar orçamento.

**Architecture:** O Artesopolis Admin continua responsável por observar a Shopee. Uma projeção aprovada, com campos comerciais explícitos, separa os snapshots operacionais do catálogo do site. O Next.js consome essa projeção somente no servidor, com cache e política de publicação independente do status do anúncio.

**Tech Stack:** Next.js 16, React 19, TypeScript, CSS Modules, integração Shopee existente no Artesopolis Admin e sua infraestrutura de dados atual. Nenhum checkout próprio.

**Spec:** Requisitos e decisões deste arquivo, derivados da proposta “Implementação: Catálogo de produtos Shopee com SEO” enviada pelo proprietário em 04/11/2026.

## Global Constraints

- Usar `main` atual de `cassianomangini/radioand3d` e `cassianomangini/artesopolis-admin` como referência antes de criar branches e PRs separados por repositório.
- Preservar Home, Estúdio, Orçamentos e Rádio. Não reiniciar o áudio ao navegar pelo catálogo.
- Reaproveitar o sincronizador Shopee; nunca consultar a Shopee a cada visita ao site.
- Não expor credenciais, `service_role`, payloads brutos, custos, margens, clientes ou pedidos.
- Dados ausentes permanecem ausentes. Não inventar preço, estoque, medidas, material, benefícios ou avaliações.
- O preview permanece `noindex`. Não fazer merge, deploy de produção, troca de domínio ou abertura de indexação automaticamente.
- Não instalar biblioteca, criar serviço ou alterar upload/orçamento sem necessidade demonstrada.

## Review Focus

1. **Loja ou organização errada:** a projeção deve falhar fechada se `organization_id`, `shop_id` ou `environment` não forem os autorizados; cobrir no PR 1.
2. **Sync parcial ou falho:** ausência de item em leitura incompleta não despublica produto; cobrir no PR 1.
3. **URL ou imagem Shopee inválida:** produto não entra no piloto até haver destino de compra e mídia verificáveis; cobrir nos PRs 1 e 2.
4. **Mudança de nome e colisão de slug:** URL publicada permanece estável, e conflitos não sobrescrevem outra página; cobrir no PR 1.
5. **Preview e conteúdo não aprovado:** nunca entram no sitemap nem recebem metadados indexáveis; cobrir no PR 3.

---

## Contrato do produto

### Resultado para o visitante

- `/produtos` lista somente produtos publicados, com imagem real, nome claro e acesso à página individual.
- `/produtos/[slug]` mostra atributos confirmados, galeria, categoria, botão para o anúncio específico da Shopee e link de orçamento quando a personalização faz sentido.
- `/produtos/categoria/[slug]` só existe para uma categoria editorial com produtos e conteúdo suficientes. Não transformar automaticamente categorias da Shopee em URLs.
- Cada categoria publicada deve ter texto próprio, links para os produtos e navegação para categorias pertinentes; produtos relacionados no detalhe devem ser reais e relevantes.
- O site não vende diretamente, não exibe preço ou estoque como atuais sem garantia de atualização e não cria páginas de cada cor ou tamanho.
- No formulário existente `/orcamentos`, uma referência pública de produto pode dar contexto ao pedido. O contrato atual de `referencia` identifica foto do Estúdio; a integração de produto deve usar parâmetro próprio e validação própria.

### Estados distintos

| Situação | Comportamento público |
|---|---|
| Anúncio `NORMAL`, conteúdo aprovado e dados mínimos válidos | Pode aparecer na lista, no detalhe e no sitemap; pode ter CTA de compra. |
| Anúncio `NORMAL`, conteúdo em rascunho ou incompleto | Não publicar nem indexar. |
| Anúncio sem estoque confirmado | Manter página publicada, sem afirmar disponibilidade; revisar CTA conforme o anúncio real. |
| Anúncio `UNLIST` ou `BANNED` confirmado | Retirar de listagens e sitemap, retirar CTA de compra e aplicar `noindex` ao detalhe existente até decisão editorial. |
| Anúncio `SELLER_DELETE` confirmado | Redirecionar apenas para substituto real; caso contrário usar resposta HTTP apropriada e remover do sitemap. |
| Falha ou varredura incompleta da sincronização | Manter último snapshot válido, registrar falha e não inferir exclusão. |

O status da Shopee nunca publica uma página por si só. A aprovação editorial é uma decisão separada. A primeira publicação deve ser um piloto de aproximadamente 10 produtos reais, se houver 10 aptos; qualidade prevalece sobre quantidade.

### Dados e identidade

Chave de origem: `organization_id + environment + shop_id + item_id`. A ligação com `products.id` do Admin é opcional e não deve ser inferida por semelhança de título. Slug público é estável e único. Separar campos sincronizados (nome de origem, descrição de origem, imagens, variações, status, URL do anúncio e `last_synced_at`) de campos editoriais (nome público, texto próprio, categoria, título/descrição SEO, publicação, slug e redirects). A sincronização não sobrescreve esses últimos.

O contrato público deve devolver apenas campos necessários à página. URLs de compra devem apontar ao item exato e ser validadas antes da publicação. Imagens devem corresponder ao item real; a proporção do quadro pode ser 4:5, com a peça íntegra e sem recorte enganoso.

### SEO e ambiente

- A página publicada precisa ter HTML inicial com conteúdo útil, `title` e description próprios, canonical absoluta, Open Graph e imagem real.
- Nas rotas dinâmicas, gerar metadados a partir do registro publicado. `lastModified` do sitemap deve refletir mudança relevante de conteúdo, não toda execução da sincronização.
- Usar `Product` e `BreadcrumbList` apenas com propriedades verificáveis. Não inventar `Offer`, preço, estoque, avaliação ou classificação.
- `robots.ts` e `sitemap.ts` devem refletir o ambiente e o estado editorial. Preview fica `noindex`; sitemap de preview não anuncia páginas de produto.
- A base da canonical deve vir do domínio público aprovado, nunca da URL do preview. A decisão de liberar indexação em produção fica para o lançamento.
- Alterações de slug publicado exigem redirect permanente; produtos excluídos exigem substituto real ou status HTTP apropriado.
- Conteúdo editorial deve acrescentar utilidade ao anúncio da Shopee. Categorias e palavras-chave são definidas com produtos reais e pesquisa, não por geração massiva de páginas semelhantes.

## Arquitetura a fechar no PR 1

O código local do Admin contém `shopee-sync-catalog`, `shopee_item_links`, `shopee_model_links` e runs de sincronização. Seu contrato `shopee-channel` identifica snapshots por organização, ambiente e loja; esses snapshots **não** são uma interface pública pronta. Antes de implementar a projeção, confirmar em leitura no ambiente correto:

1. organização, loja e ambiente autorizados, sem registrar segredos no plano ou no PR;
2. quantidade real de itens `NORMAL`, imagens, URLs, variações e lacunas por item;
3. frequência e completude das varreduras, inclusive o significado de falhas e de `focal` versus `full`;
4. existência de projeção reutilizável e lugar adequado para estado editorial e redirects;
5. método de consumo autenticado servidor a servidor, cache e invalidação.

A primeira atualização pode ser agendada sobre o sincronizador existente; não criar fluxo em tempo real sem evidência de necessidade. O site não deve chamar o Admin em cada renderização. Registrar duração de cache, prazo de tolerância a falhas e forma de renovação no contrato do PR 1.

**Decisão de desenho:** o Admin deve entregar a projeção sanitizada e manter o controle editorial persistente; o site não lê tabelas operacionais diretamente. Se já houver interface segura equivalente, reutilizá-la. Registrar no PR 1 o contrato de resposta, as permissões, a atualização e a estratégia de falha antes de iniciar o PR 2. Não transformar uma hipótese de tabela, view ou endpoint em migration sem essa auditoria.

## Mapa de arquivos do site

Os caminhos abaixo são o destino proposto para os PRs do site; o PR 1 fixa o contrato antes de criar os módulos de leitura.

| Caminho | Responsabilidade |
|---|---|
| `src/features/products/catalog-contract.ts` | Tipos e validação do registro público; nenhum campo privado. |
| `src/server/products/catalog.ts` | Leitura autenticada somente no servidor, cache e fallback ao último snapshot válido. |
| `src/app/produtos/page.tsx` | Listagem publicada. |
| `src/app/produtos/[slug]/page.tsx` | Detalhe, metadados e resposta para slug. |
| `src/app/produtos/categoria/[slug]/page.tsx` | Categoria editorial qualificada. |
| `src/app/sitemap.ts` e `src/app/robots.ts` | URLs indexáveis e política por ambiente. |
| `src/app/orcamentos/page.tsx` e contrato do fluxo de orçamento | Referência pública de produto, sem interferir na referência de foto existente. |
| `src/app/layout.tsx` | Remover o bloqueio global apenas quando a política por ambiente e por página estiver completa. |

No Admin, os caminhos exatos da projeção e do armazenamento editorial serão documentados após auditar as convenções existentes. Alterações ali seguem PR próprio.

## Entrega por PRs

### PR 1 — Contrato e projeção segura

**Repositório:** Admin, com eventual arquivo de contrato tipado no site em PR separado. **Aceite:** um consumidor autenticado obtém somente produtos comerciais aprovados, com origem, loja e atualização rastreáveis.

- [ ] Auditar `main`, worker, snapshots, permissões e loja real; anexar relatório sem credenciais.
- [ ] Fixar contrato tipado, estados de publicação, slug estável, redirects e campos editoriais separados.
- [ ] Implementar projeção mínima sanitizada e atualização idempotente, reutilizando infraestrutura adequada.
- [ ] Provar isolamento de organização/loja/ambiente e ausência de colunas privadas no corpo retornado.
- [ ] Testar item ativo, inativo, variações, sync parcial/falho, slug duplicado, URL inválida e ausência de imagem.
- [ ] Registrar resultados e falhas de sincronização; ausência em varredura incompleta não despublica.

### PR 2 — Catálogo e páginas

**Repositório:** site. **Aceite:** visitante encontra produto real, lê informações confirmadas e abre o anúncio exato da Shopee; a Rádio mantém faixa e progresso ao navegar.

- [ ] Implementar consumo servidor a servidor do contrato do PR 1, com cache e tratamento de indisponibilidade.
- [ ] Criar `/produtos`, detalhe por slug e somente categorias editoriais qualificadas.
- [ ] Usar imagens reais, quadro 4:5 sem distorção, galeria acessível e informações verificadas.
- [ ] Priorizar somente a imagem principal, carregar as demais sob demanda e paginar listagens quando o volume exigir.
- [ ] Apontar CTA principal ao anúncio específico; não mostrar preço/estoque presumidos.
- [ ] Adicionar referência pública de produto ao orçamento, mantendo válido o fluxo atual de fotos e upload.
- [ ] Conferir desktop amplo, desktop com Rádio lateral e mobile; testar navegação com áudio em execução.

### PR 3 — SEO e política de indexação

**Repositório:** site. **Aceite:** HTML e metadados corretos para produtos publicados em ambiente de produção; preview, APIs e páginas não aprovadas fora do índice.

- [ ] Implementar política de robots por ambiente e qualificação, sem liberar o site inteiro por acidente.
- [ ] Implementar `generateMetadata` por produto/categoria, canonical absoluta e Open Graph.
- [ ] Criar `sitemap.ts` e `robots.ts` com exclusão de rascunhos, desativados e URLs duplicadas.
- [ ] Adicionar dados estruturados verificáveis e breadcrumbs.
- [ ] Cobrir redirects e respostas para produto retirado ou excluído.
- [ ] Inspecionar HTML renderizado e metadados em preview e em configuração simulada de produção.

### PR 4 — Operação e piloto

**Repositórios:** site e/ou Admin, em PRs separados conforme o dono do código. **Aceite:** piloto auditável, com itens publicados e motivos legíveis para os não publicados.

- [ ] Selecionar cerca de 10 produtos aptos; conferir manualmente imagens, medidas, variações, conteúdo e links.
- [ ] Registrar contagens de importados, aptos, publicados, desativados e incompletos.
- [ ] Medir cliques de compra/orçamento sem nomes, contato, arquivos ou detalhes de pedido.
- [ ] Executar `pnpm lint`, `pnpm typecheck`, `pnpm test` e `pnpm build` onde existirem, mais testes focados no risco alterado de cada repositório.
- [ ] Validar navegação, acessibilidade, desempenho, desktop/mobile e continuidade da Rádio.
- [ ] Preparar Search Console e checklist de lançamento; registrar que URL publicada não equivale a URL indexada.

## Lançamento e entrega

Os PRs devem informar arquivos alterados, contrato efetivo, origem dos dados, testes realmente executados, capturas e riscos. O piloto só segue para produção depois de validação do proprietário de conteúdo, fotos, links, domínio/canonical e política de indexação. Merge, deploy, domínio e ativação definitiva de indexação permanecem decisões separadas.

Ao encerrar, informar PRs e repositórios, quantidade real de produtos importados/publicados, rotas, mecanismo de sincronização, resultados de testes, evidência visual, pendências e limitações. Nunca declarar funcionamento ou indexação em produção sem observação real.
