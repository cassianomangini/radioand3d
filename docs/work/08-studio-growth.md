# 08 — Estúdio: aquisição, orçamento e produtos

Estado: **in_progress_parallel**  
Plano: [STUDIO_GROWTH_PLAN_V1.md](../STUDIO_GROWTH_PLAN_V1.md)  
Search: [STUDIO_SEARCH_DISCOVERY_V1.md](../STUDIO_SEARCH_DISCOVERY_V1.md)  
Orçamento: [STUDIO_QUOTE_FLOW_V1.md](../STUDIO_QUOTE_FLOW_V1.md)  
Design: [STUDIO_COMMERCE_EXPERIENCE_V1.md](../design/STUDIO_COMMERCE_EXPERIENCE_V1.md)  
Wireframes: [STUDIO_COMMERCE_WIREFRAMES_V1.md](../design/STUDIO_COMMERCE_WIREFRAMES_V1.md)  
Mídia: [STUDIO_MEDIA_INVENTORY_V1.md](../design/STUDIO_MEDIA_INVENTORY_V1.md)

## Objetivo

Transformar `/studio` em uma frente pública capaz de:

1. provar capacidade com Impressões;
2. captar projetos qualificados por Orçamento;
3. levar produtos próprios para compra na Shopee;
4. construir aquisição orgânica mensurável por Search.

Este trabalho corre em paralelo à fila da Rádio e **não pode alterar o motion spine C1** sem coordenação explícita.

## Escopo congelado desta fase

- três pilares: Impressões, Orçamento, Produtos;
- serviço-base: Impressão 3D sob demanda para arquivo pronto;
- especialidades prioritárias: Placas e Caixas;
- Materiais & Cores como conteúdo de apoio;
- páginas próprias para Impressão 3D sob demanda, Placas e Caixas;
- páginas de produto antes do link Shopee;
- Search como requisito transversal;
- preview continua `noindex` até gate de lançamento.

## Bloco S1.0A — Documentação

- [x] plano de crescimento;
- [x] contrato de Search;
- [x] fluxo de orçamento;
- [x] checklist de execução;
- [x] alinhar PROJECT_PLAN;
- [x] alinhar CATALOG_3D;
- [x] alinhar ROADMAP;
- [x] alinhar README;
- [x] criar handoff de experiência do Estúdio.

## Bloco S1.0B — Gate de experiência

Estado atual: **ready_for_frontend: parcial — Produto individual aprovado; demais superfícies visuais ainda pendentes**

Antes de layout visível substancial:

- [x] wireframe do hub `/studio` desktop;
- [x] wireframe do hub `/studio` mobile;
- [x] wireframe da página Placas desktop/mobile;
- [x] wireframe do fluxo completo de Orçamento;
- [x] primeira etapa do Orçamento com direção visual fornecida por Cassiano em 16/10; render local ainda aguarda aceite visual final;
- [x] wireframe da página individual de Produto desktop/mobile;
- [x] inventário de mídia existente;
- [x] lista de mídia a fotografar;
- [x] lista de assets/diagramas a produzir;
- [x] classificar cada bloco como foto / asset / HTML / componente / não existe;
- [x] revisar composição mobile sem simplesmente empilhar desktop;
- [x] aprovar hierarquia do CTA Shopee;
- [x] aprovar conjunto mínimo de componentes;
- [x] revisão estrutural inicial de Cassiano;
- [x] feedback: rejeitar layout com iconografia decorativa/visual de IA;
- [x] incluir serviço explícito de Impressão 3D sob demanda para arquivo pronto;
- [x] revisar wireframe atualizado do hub;
- [x] aprovar mock visual final do hub `/studio` desktop/mobile;
- [x] direção visual final do Produto individual aprovada por Cassiano em 05/10/2026;
- [ ] revisão visual das demais superfícies por Cassiano;
- [ ] mudar o gate global para `yes` somente após aprovação das superfícies restantes.

### Regra S1.0B

Enquanto o gate estiver aberto:

- pode avançar infraestrutura e Search que não cristalizem layout;
- não criar CSS ornamental para substituir mídia ausente;
- não criar componentes genéricos só para preencher tela;
- não implementar filtros, configuradores, sticky CTAs ou cards adicionais sem necessidade aprovada.

## Bloco S1.1 — Fundação de rotas e Search

- [x] criar estrutura persistente para `/studio/*`;
- [x] preservar continuidade da Rádio em todas as rotas públicas do Estúdio;
- [x] separar comportamento de indexação por ambiente;
- [x] criar `robots.ts`;
- [x] criar `sitemap.ts`;
- [x] definir origem única para base URL/canonical;
- [x] metadata específica por rota;
- [x] Open Graph textual por superfície estratégica; imagem OG específica fica para a etapa final de mídia;
- [x] breadcrumbs visíveis nas rotas internas + `BreadcrumbList` condicional quando existe URL pública;
- [x] links HTML rastreáveis validados no QA renderizado, incluindo navegação interna com o mesmo elemento de áudio;
- [x] garantir conteúdo principal das páginas comerciais em Server Components;
- [x] revisar impacto de `connection()`/dinamismo da Rádio nas páginas comerciais — conteúdo comercial segue SSR/rastreável, mas o root continua dinâmico por catálogo/seed da Rádio; otimização exige gate separado para não alterar o contrato de áudio.

### Aceite S1.1

- produção pode ser indexável sem afetar preview;
- todas as URLs estratégicas têm canonical;
- sitemap contém somente URLs publicáveis;
- `/studio/*` não quebra áudio persistente;
- nenhuma página estratégica retorna vazio;
- conteúdo comercial existe no HTML inicial/servidor de forma adequada.

## Bloco S1.2 — Hub do Estúdio

Dependência visual: **S1.0B aprovado**.

- [x] substituir entrada Materiais por Orçamento;
- [x] renomear Loja Shopee para Produtos na hierarquia principal;
- [x] manter material/cores dentro do conteúdo de apoio, sem virar quarto pilar nem grid fictício;
- [x] Estúdio + Impressões ocupam a superfície grande da esquerda;
- [x] Orçamento e Produtos ficam empilhados à direita;
- [x] exatamente três entradas visuais;
- [x] não usar três cards idênticos;
- [ ] prova visual real;
- [x] links para Impressões, Orçamento e Produtos;
- [x] links contextuais para Impressão 3D sob demanda, Placas e Caixas nas rotas apropriadas, não como cards extras na home;
- [x] não criar segunda seção abaixo dos três blocos;
- [x] não repetir hero gigante da Home;
- [ ] substituir placeholders neutros pelas fotografias/assets aprovados na última etapa de mídia.

### Aceite S1.2

Visitante frio entende em poucos segundos:

- o que o Estúdio faz;
- que existem trabalhos reais;
- como pedir algo personalizado;
- onde comprar produto pronto.

## Bloco S1.3 — Impressões

- [x] rota própria;
- [ ] dataset editorial mínimo;
- [x] contrato editorial suporta status produzido / conceito / produto / cliente; dataset real continua pendente;
- [ ] foto real como conteúdo;
- [ ] alt/contexto;
- [x] nenhum filtro implementado enquanto não houver volume que justifique;
- [x] CTA contextual para orçamento;
- [x] contrato exige `canPublish` e permite nota de propriedade intelectual; seleção/permissão das peças reais continua pendente.

## Bloco S1.3B — Impressão 3D sob demanda

- [x] rota própria;
- [x] copy “Já tem o arquivo? Envie para análise”;
- [x] branch de orçamento `tipo=impressao`;
- [x] seleção local de arquivo como ação principal; upload remoto continua bloqueado até storage privado;
- [x] quantidade/material/cor/escala com opção “não sei”;
- [x] explicar que produção depende de análise;
- [x] sem iconografia decorativa;
- [ ] foto real de processo/peça quando disponível;
- [x] metadata/canonical/OG textual.

## Bloco S1.4 — Placas personalizadas

- [x] conteúdo específico;
- [ ] pelo menos uma prova real forte;
- [ ] usos reais;
- [x] opções e limitações;
- [x] CTA para orçamento;
- [ ] ligações para projetos relacionados;
- [x] metadata/canonical/OG textual;
- [ ] schema somente se aplicável.

## Bloco S1.5 — Caixas personalizadas

- [x] conteúdo específico;
- [x] foco em função e medida;
- [ ] pelo menos uma prova real suficiente para lançamento;
- [x] CTA para orçamento;
- [x] metadata/canonical/OG textual.

## Bloco S1.6 — Orçamento

- [x] experiência de conversa guiada;
- [x] começar pela intenção — arquivo pronto / placa / caixa / outro — e não por contato;
- [x] wizard progressivo;
- [x] perguntas por tipo;
- [x] opção “não sei”/“preciso de ajuda” quando aplicável;
- [x] contato somente no final;
- [x] seletor nativo em mobile e drag-and-drop apenas como melhoria desktop;
- [x] seleção mantém os objetos `File` reais no estado local, não apenas nomes;
- [x] política V1 de arquivo: STL/3MF/OBJ/STEP/STP/PDF/PNG/JPG/JPEG/WebP; até 5 arquivos, 50 MB por arquivo e 100 MB no total;
- [x] validação local de extensão/tamanho/quantidade com erro acessível;
- [x] contrato serializável `schemaVersion: 1` para a solicitação, sem dependência de provider;
- [x] parser seguro de `unknown` para o payload versionado antes da validação de negócio;
- [x] validação estrutural do payload reutilizável no runtime server;
- [x] wizard monta o payload canônico e o valida antes de entrar na etapa de revisão;
- [x] observação da peça e preferência declarada de material/acabamento são preservadas no payload e na revisão;
- [x] classificação inicial determinística: pronto para revisão / faltam informações / incompleto, sem recusa automática;
- [ ] anexos privados no backend remoto;
- [ ] inspeção server-side do conteúdo real do arquivo antes da persistência;
- [ ] persistência;
- [x] estados de erro e validação local;
- [ ] confirmação sem CTA forçado para WhatsApp;
- [ ] execução/persistência da triagem no backend remoto;
- [x] eventos do funil instrumentados por contrato local sem PII; adaptador para provedor real fica no gate de lançamento;
- [x] labels, foco por etapa, teclado e composição mobile validados estruturalmente no CI; auditoria final de lançamento continua em S1.8.

### Recorte visual da primeira etapa — 16/10/2026

- **Responsável:** CM Frontend. **Estado:** `in_progress`; implementação e autorrevisão local concluídas, aceite visual de Cassiano e mídia das opções pendentes.
- **Objetivo e limite:** manter `/studio/orcamento` próximo do mock, com a última direção de Cassiano: título em uma linha e painel logo abaixo, sem explicação nem lista de passos. Não inventar as quatro imagens nem alterar o motor de áudio, o contrato de arquivos ou o envio remoto. Na recuperação da `main`, restabelecer a largura de 30% da Rádio já definida em 15/10.
- **Contratos lidos:** plano do produto, roadmap, fluxo de Orçamento, handoff e wireframes comerciais, checklist 08 e auditoria visual CM.
- [x] Remover a abertura em duas colunas, a explicação e os três passos com ícones. Deixar “Conte o que você precisa.” em uma linha, com o painel diretamente abaixo.
- [x] Fixar a escala do fundo pela altura do viewport, sem ampliá-lo para preencher a largura ou acompanhar o crescimento do conteúdo.
- [x] Manter camada escura própria atrás do título para preservar contraste sobre o cenário.
- [x] Manter áreas de mídia neutras nas quatro opções, progresso segmentado, foco e avanço direto ao selecionar o card; remover o rodapé de navegação da etapa 1.
- [x] Manter 2×2 com Rádio lateral e reduzir escala interna dos cards conforme a largura útil; mudar para cards em lista quando o Estúdio chega a cerca de metade da janela.
- [x] Preservar o painel mais alto nas janelas comuns e compactar somente a etapa 1 em janela muito curta. Suavizar a borda visível do fundo atual à direita até chegar a nova arte panorâmica.
- [x] Autorrevisão em Chrome via Playwright sobre build local: capturas `output/playwright/quote-fit-1250x542.png`, `quote-split-1280x605.png`, `quote-fit-1904x1008.png` e `quote-fit-mobile-390.png`. Em 1250 × 542 px, título em uma linha e painel até 508 px, sem rolagem vertical ou horizontal; com Rádio lateral em 1280 × 605 px, opções 2×2 e painel até 591 px; em desktop largo, painel até 942 px de 1008 px; mobile 390 sem overflow horizontal. O teste de clique no card abriu a etapa 2 e “Voltar” retornou à etapa 1. A captura anterior com Estúdio efetivo de 650 px mostrou cards em lista perto da metade da janela.
- [x] Recuperação na `main`: código e três imagens de fundo/card do Orçamento já estavam no commit `27c374b`; a prévia local na porta 3000 ainda servia build antigo. Rebuild e reinício mostraram a versão atual. Contrato, roadmap e este checklist foram reconciliados com o código.
- [x] Restaurar a largura padrão e mínima de 30% da Rádio sem perder dock, teclado ou áudio. Em Chrome, 1440 px → 432 px e 1904 px → 571 px; dock por teclado passou. A identidade invisível da Home deixou de acrescentar rolagem à rota estável de detalhe: em 1250 × 542 px com Rádio recolhida, a página mede 1250 × 542 px e o painel cabe inteiro.
- [x] Após a recuperação, `pnpm build`, `pnpm typecheck`, `pnpm lint`, ESLint dirigido, `pnpm test` (125/125), `git diff --check`, 7 testes visuais de Orçamento/divisor e 2 testes do hub/dock passaram. A primeira execução visual encontrou build antigo; a segunda aguardou a hidratação pelo foco do wizard e passou na build atual.
- [x] `d24eb80` enviado para `origin/main`; CI `38964637606` passou. A prévia do Rádio `38964637617` encontrou um teste antigo que procurava o divisor de tela cheia como `separator`; a interface atual o expõe como botão “Restaurar o Estúdio”. O teste foi corrigido e passou localmente em Chrome (desktop 1440); nova execução remota pendente.
- [ ] Cassiano aprovar o render visual após ver a página atualizada no próprio navegador.
- [ ] Inserir e revisar as quatro imagens quando Cassiano as gerar; não declarar a mídia concluída antes disso.
- [ ] Substituir o fundo atual pela arte panorâmica após Cassiano gerá-la; revisar `cover`, posição focal e recortes desktop/mobile no navegador.

## Bloco S1.7 — Produtos

- [x] contrato de catálogo interno criado e deliberadamente vazio até existirem itens reais;
- [x] sem filtros/ordenação enquanto o volume não justificar;
- [x] preview preparado para mídia fotográfica real, sem item sintético quando catálogo está vazio;
- [x] rota individual `/studio/produtos/[slug]` preparada;
- [x] direção visual final da página individual aprovada em 05/10/2026 e documentada em `docs/design/STUDIO_PRODUCT_PAGE_VISUAL_V1.md`;
- [x] primeiro recorte com fotos/medidas/material/opções reais do Admin/Shopee;
- [x] galeria real com suporte a vídeo quando o produto tiver mídia útil;
- [x] diagrama visual de dimensões para produtos em que medida externa/interna muda a decisão;
- [x] CTA comercial definido como **Comprar na Shopee**;
- [x] sem carrinho, sem checkout próprio e sem botão “Adicionar ao carrinho”;
- [x] explicar que finalização/pagamento acontecem na Shopee;
- [x] não duplicar preço/estoque sem sincronização confiável;
- [x] contrato de disponibilidade: disponível / sob consulta / indisponível, com data e origem de verificação;
- [x] ponte “precisa de outra medida?” → orçamento;
- [x] metadata individual preparada;
- [x] `ItemList` no catálogo sem inventar oferta/preço;
- [x] `Product` rich-result markup adiado enquanto não houver `Offer`, review ou aggregate rating real e visível;
- [x] nenhum produto fake para preencher grade;
- [x] QA renderizado desktop/mobile da implementação visual aprovada no PR #27.

## Bloco S1.8 — Gate de lançamento

- [ ] domínio definitivo;
- [ ] produção sem `noindex`;
- [x] preview/ambiente sem flag explícita continua `noindex` por padrão;
- [ ] Search Console;
- [ ] sitemap enviado;
- [ ] inspeção das URLs prioritárias;
- [ ] Rich Results Test onde aplicável;
- [ ] validação mobile;
- [ ] CWV/performance básica;
- [x] imagens de Produto renderizadas como HTML/Next Image;
- [ ] image sitemap de Produto após migrar mídia para host controlado/verificável pela CM;
- [x] links internos das jornadas estruturais validados no CI;
- [ ] analytics de orçamento e saída para Shopee;
- [x] contrato de privacidade/limites dos anexos definido;
- [ ] revisão final da implementação remota de anexos;
- [x] copy evita prometer aceite, prazo, preço ou disponibilidade não confirmados.

## Bloco S1.9 — Crescimento

Não abrir páginas novas por impulso.

Usar:

- Search Console;
- conversões;
- leads recebidos;
- projetos reais;
- produtos reais.

para decidir a próxima expansão.

## Riscos

1. **Rádio dominando o custo da página comercial.**
2. **Conteúdo visual forte mas sem texto/contexto indexável.**
3. **Criar páginas demais sem prova real.**
4. **WhatsApp voltar a ser porta de entrada universal.**
5. **Shopee engolir a descoberta e deixar o domínio sem valor próprio.**
6. **Preview acidentalmente indexável ou produção ainda noindex.**
7. **Schema inventando preço, estoque, avaliação ou presença local.**
8. **Projeto/conceito tratado como peça realmente produzida.**

## Evidência exigida

Para cada bloco implementado registrar:

- commit/PR;
- rotas alteradas;
- screenshots desktop/mobile quando visual;
- resultado de lint/typecheck/build;
- teste de navegação com áudio persistente;
- validação de metadata;
- validação de Search quando aplicável;
- pendências reais.

## Regra de não interferência

S1 pode avançar em paralelo à Rádio apenas quando não muda:

- estado do motion spine;
- física do divisor;
- semântica do pipeline de áudio;
- contratos de visualizer.

Se precisar tocar nessas áreas, pausar e coordenar com o gate atual da Rádio.


## Atualização 05/10/2026 — implementação sem mídia final

Implementado na branch `feat/studio-foundation-content`:

- fundação de `/studio/*` mantendo a Rádio persistente;
- indexação por ambiente, canonical, robots e sitemap;
- metadata textual por rota;
- hub aprovado com exatamente Impressões + Orçamento + Produtos;
- rotas de Impressões, Impressão 3D sob demanda, Placas, Caixas, Orçamento e Produtos;
- wizard de orçamento com branching e revisão local;
- placeholders neutros classificados por origem da mídia;
- inventário final em [STUDIO_MEDIA_LAST_MILE.md](../design/STUDIO_MEDIA_LAST_MILE.md).

Continua pendente e **não deve ser marcado como pronto**:

- fotos/prova real;
- catálogo/dataset de Impressões;
- armazenamento privado e validação de upload;
- persistência/triagem do orçamento;
- envio final do orçamento;
- decisões operacionais de logística/cobertura/modelagem;
- validação renderizada desktop/mobile;
- retirada do `noindex` em produção.


## Evidência — PRs #23 e #24

### PR #23 — fundação estrutural

- merge: `668fa7a27b6c8e6e419eee8febec79a347e9353a`;
- rotas públicas e Search base;
- hub com três entradas;
- placeholders neutros;
- primeiro wizard;
- CI verde em lint, typecheck, testes, build e captura visual.

### PR #24 — orçamento/search/catalog contracts

- merge: `9aeb80fe236e40acfabad217a1687f137a9cb2f7`;
- breadcrumbs + `BreadcrumbList`;
- branching específico de arquivo/placa/caixa/outro;
- revisão editável;
- contrato vazio de Impressões/Produtos sem dados fake;
- rota `/studio/produtos/[slug]`;
- sitemap inclui produtos somente quando eles realmente existirem;
- QA confirmou `/studio → /studio/impressoes → /studio` e `/studio → /studio/orcamento` preservando o mesmo `<audio>`;
- capturas desktop/mobile e CI completamente verdes.

## Evidência — PR #25

- Materiais & Cores adicionados como apoio nas páginas de serviço, sem catálogo fictício;
- contrato de analytics browser-only sem PII;
- funil de orçamento instrumentado sem nome, contato, descrição, arquivo ou parâmetros livres;
- saída futura para Shopee instrumentada por slug interno do produto;
- disponibilidade de Produto modelada com estado, origem e data de verificação;
- roadmap/handoff reconciliados com a autorização de implementação estrutural de 05/10/2026.

## Revisão de renderização da Rádio

O `RootLayout` ainda chama `connection()`, lê o catálogo da Rádio e gera um seed por request. Isso faz o shell público continuar dinâmico mesmo quando o conteúdo comercial é Server Component.

Decisão desta fase:

- **não remover `connection()` por impulso**;
- **não mover seed/catalog para cliente dentro do trabalho do Estúdio**, porque isso altera lifecycle, fila e comportamento percebido da Rádio;
- o conteúdo comercial já chega como HTML útil e rastreável;
- otimização de custo/cache da Rádio deve ser um recorte separado, com QA de continuidade de áudio e fila.



## Implementação Produto individual — branch `feat/studio-product-detail-v1`

- primeiro recorte público derivado do catálogo live do Artesópolis Admin/Shopee;
- somente campos úteis ao visitante: mídia, medidas, material, variações, descrição e link comercial;
- custos, SKU, quantidade de estoque e dados operacionais não são publicados;
- galeria navegável e preview de variações usam mídia real do anúncio;
- dimensões aparecem como informação técnica de primeira classe;
- CTA comercial único: **Comprar na Shopee**;
- sem carrinho, checkout, frete ou seletor de quantidade local;
- metadata recebe imagem real do produto;
- catálogo gera `ItemList` quando a URL pública está configurada;
- markup `Product` incompleto foi removido no PR #28;
- QA renderizado desktop/mobile e CI foram concluídos antes do merge do PR #27.


## SEO técnico pós-Produto — 05/10/2026

- markup `Product` incompleto removido para não gerar falsa expectativa/erro de rich result;
- `WebSite` estruturado somente quando a produção estiver indexável e houver URL pública;
- sitemap usa `lastVerifiedAt` real nas URLs de Produto;
- image sitemap deliberadamente adiado enquanto os ativos estiverem apenas no CDN da Shopee;
- nenhuma avaliação, oferta, preço, estoque ou presença local foi inventada para satisfazer schema.


## Orçamento — contrato local de arquivos — 05/10/2026

- o wizard mantém os objetos `File` reais em memória para um upload futuro;
- formatos e limites V1 foram congelados em `src/features/studio/quote-contract.ts`;
- seleção inválida é rejeitada antes de avançar no fluxo;
- nenhuma mídia é enviada ou persistida nesta etapa;
- a mesma política deverá rodar no servidor, somada à inspeção do conteúdo;
- backend, storage, upload e retenção seguem o contrato [SUPABASE_INFRASTRUCTURE_V1.md](../SUPABASE_INFRASTRUCTURE_V1.md); schema, bucket e quatorze migrations já foram aplicadas no Supabase CM, enquanto **TUS real, limpeza e E2E ainda bloqueiam ativação pública**.


## Orçamento — contrato de solicitação backend-neutral — 05/10/2026

- payload público interno versionado com `schemaVersion: 1`;
- tipos de projeto, contato, produção, origem e metadados de anexo têm contrato único;
- o wizard reutiliza os mesmos tipos canônicos, evitando divergência entre UI e futuro adapter server-side;
- validação estrutural cobre coerência do tipo de projeto, arquivos, quantidade, detalhes mínimos e contato;
- classificação inicial separa `ready-for-review`, `needs-information` e `incomplete`;
- nenhuma regra automática marca projeto como “não atendido”; casos fora de escopo continuam decisão humana;
- nenhum arquivo, contato ou solicitação é enviado nesta etapa;
- persistência e Storage privado já existem no Supabase CM; verificação 3MF e worker de retenção foram implementados e CI passou, mas secrets, TUS real, limpeza Storage física, Cron agendado e smoke live **ainda não foram validados**.


## Revisão pós-PRs #29/#30 — contrato do Orçamento — 05/10/2026

- validação server-side não depende mais de um objeto já tipado por TypeScript: existe parser de entrada `unknown`;
- `schemaVersion` é verificado em runtime antes de aceitar o payload;
- estados contraditórios de referência/anexo são rejeitados;
- a observação do branch de arquivo pronto não se perde mais entre UI, revisão e payload;
- “tenho preferência” exige registrar qual preferência de material/acabamento;
- o wizard valida o mesmo contrato canônico antes da tela final de revisão;
- `manual-review` não é um status automático: revisão humana de escopo permanece decisão operacional posterior.


## Infra Supabase do Estúdio — contrato revisado em 09/10/2026

- projeto Supabase CM criado pelo usuário na organização independente **Cmangini3d**, isolado do banco operacional; migrations base/quota e bucket privado agora **aplicados e verificados**;
- região contratada **e confirmada**: `sa-east-1` (São Paulo);
- staging antigo pausado pelo usuário; backup do legado ainda sem comprovação;
- Supabase do Artesopolis Admin continua owner da ponte Produtos/Shopee;
- novo projeto CM não espelha catálogo, estoque ou ERP;
- Orçamento: PostgreSQL + bucket privado `quote-intake`;
- upload: signed resumable/TUS direto para Storage;
- nenhum secret Supabase no browser;
- Route Handlers Next server-side **deverão** fazer sessão anônima protegida por cookie e posse do draft, init/complete de attachment e submit; UUID não concede autorização;
- limites globais de Storage e reservas concorrentes, além dos limites por request;
- retenção: draft/órfão 24 h, arquivos submetidos 90 d, conteúdo/contato 180 d, eventos técnicos 365 d; Cron `GET` + `CRON_SECRET` e idempotência na Vercel (somente depois de implementado);
- produção real exige migrations/bucket, secrets server-side, testes de segurança e validação live;
- documento canônico de infra: [SUPABASE_INFRASTRUCTURE_V1.md](../SUPABASE_INFRASTRUCTURE_V1.md);
- checklist de provisionamento/validação remota: [E2](08-supabase-provisioning.md). Banco CM criado e staging pausado pelo usuário; **quatorze migrations e bucket privado aplicados**, e handlers `session`/`init`/`complete`/`submit` existem na `main` **com flag OFF**; worker de retenção já existe (não agendado); falta validar upload, remoção real, secrets e Cron. Nenhuma publicação.


## Hub 12/10/2026 — carrossel e cores (em execução)

Origem: imagem do site em modo Rádio docked + mock visual contextual aprovado para implementação no hub. O escopo é local ao Estúdio; não reabrir o player.

- [x] Contrato visual fixado: três entradas, Impressões dominante, Orçamento e Produtos empilhados.
- [x] Fotos/vídeos tratadas como conteúdo real; não inventar material, medidas, nomes, avaliações ou imagens.
- [x] Implementar componente de carrossel próprio com navegação, pausa, indicador e navegação para galeria.
- [x] Separar controles do carrossel de links para evitar interações aninhadas.
- [x] Substituir laranja do Orçamento pela borda ciano/azul/violeta; reservar laranja/coral para Produtos.
- [x] Preparar importação da pasta local `output/Fotos Impressoes` e manifesto JSON sem falsificar arquivos.
- [x] Preparar galeria editorial por projeto, fotos/vídeos e visualização ampliada quando existirem mídias reais.
- [ ] Executar `pnpm studio:media` no ambiente com a pasta local real do usuário; os arquivos não estão no Git nem foram anexados aqui.
- [ ] Validar media reais: nomes, recorte, autorização de uso, compressão, poster de vídeo e peso de rede.
- [ ] Executar e inspecionar CI/Playwright e navegador com mídia real em docked/lateral/mobile antes de aceite visual.
- [ ] Registrar aceite de Cassiano no render final, sem confundi-lo com a aprovação do mock.

Risco prioritário: sem as fotos na infraestrutura do site, o hub exibe fallback neutro; isso não é demonstração do resultado artístico final.

### QA renderizada do hub — 12/10/2026

- CI `38252416649` em `69f670a`: lint, typecheck, unit, build, captura CDP, Playwright em cinco perfis e laboratório visual **PASS**.
- Novo teste `tests/visual/studio-hub.spec.ts`: três entradas e acentos cromáticos (orçamento CM vs Produtos Shopee), navegação preservando a instância do elemento `audio` — passou em 1440, 1024, desktop curto, 390 e 360.
- Capturas inspecionadas de `/studio` lateral desktop 1440 e mobile 390, ainda **sem as fotos do usuário**: hierarquia correta, CTA orçamento ciano/violeta e Produtos laranja.
- Defeito mobile descoberto durante QA: Home anterior continha heading não quebrável mais largo que o viewport (390: 476px; 360: 440px). O font-size mobile foi ajustado com escala fluida, e o gate horizontal subsequente passou.
- **Atenção:** sem execução do importador contra `output/Fotos Impressoes`, não há evidência de crop real, reprodução de vídeo, transição com foto nem aprovação estética final. Não marcar E3 ou mídia final como concluídos.


## S1.2 — revisão 12/10: altura, carrossel e motion na entrada

Solicitação: print real de `/studio` com 13 fotografias importadas localmente. Na captura o hub termina acima da borda inferior da Rádio, e o carrossel parece parado com o ponteiro sobre a imagem.

- [x] Diagnóstico da diferença de altura: o seletor `.studio[data-studio-route="detail"]` ainda usava `height: calc(100dvh - var(--header-height))`, enquanto a Rádio lateral usa `100dvh`.
- [x] Corrigir altura do **hub desktop** para `100dvh`, sem impedir scroll das rotas internas e sem alterar o player.
- [x] Retirar a pausa causada pelo mouse sobre a fotografia inteira; manter pausa intencional/foco, proteção de abas inativas e quando fora de visão.
- [x] Fazer fotos girarem sozinhas (4,8 s), prévias de vídeo (9 s) e transição crossfade sem zoom/crop da mídia principal; progressão comandada por Motion com barra temporal visível.
- [x] Entrada progressiva Impressões → Orçamento → Produtos por variants/staggerChildren do **Motion for React**, removendo CSS keyframes anteriores; não alterar o motor de animação da Rádio.
- [x] Implementar preferência de movimento reduzido com cortes instantâneos e sem coreografia; a galeria permanece ligada por padrão conforme pedido, com botão de pausa sempre disponível.
- [x] Acrescentar testes Playwright para geometria do hub, escalonamento e ambiente de fixture do carrossel.
- [x] Executar CI, lint/typecheck/build e QA renderizada em desktop 1440/1760, mobile 390/360, split/docked, redução de movimento e transições, **com placeholder/fixture**; execução `38258489403` (PASS).
- [x] Testar autoplay com duas mídias de laboratório (não fotografia de peça): foto muda automaticamente mesmo com o cursor sobre a imagem, pausa explícita funciona e movimento reduzido permite navegação manual; `tests/visual/studio-carousel-motion.spec.ts` (PASS).
- [ ] Revisar e testar autoplay, enquadramentos e vídeos **com as 13 fotos reais locais** de Cassiano no navegador dele.
- [ ] Validar o recorte das 13 fotos originais em ambiente local, que não existem no Git.
- [ ] Aceite final de Cassiano após visualizar os modos e conteúdo real.

**Nota de prova:** a mídia observada está apenas na captura de tela. A fixture usa assets de desenvolvimento do projeto e não comprova enquadramento das fotografias reais.


### Evidências consolidadas (12/10/2026)

- `792ae5d` — correção da checagem da keyframe para aceitar o nome escopado por CSS Modules.
- `1c0ac3d` — inclusão de `studio-carousel-motion.spec.ts` no job de laboratório, em `.github/workflows/ci.yml`.
- GitHub Actions `38258489403`: lint, typecheck, testes unitários, build, captura visual, Playwright visual (55 PASS), laboratório de desenvolvimento (18 PASS) e preview integrado Rádio (2 PASS).
- Em desktop 1440 e 1760, geometria automatizada confirmou o fim do hub alinhado ao limite inferior da Rádio (diferença de altura menor que 2px); seção por seção apresenta delays de entrada distintos; a Rádio segue com o mesmo elemento `audio`.
- O teste da fixture demonstrou avanço de `fixture-alpha` para `fixture-beta` **sem tirar o cursor da fotografia**, pausa explícita, retomada e navegação manual em `prefers-reduced-motion`. São artes do próprio projeto usadas apenas como fixture de desenvolvimento, não mídia de produto real.
- Screenshots de CI representam layout sem as fotografias importadas localmente; **o resultado com as 13 fotos e quaisquer vídeos permanece sem inspeção**. Isso limita a aceitação estética e impede marcar mídia final como concluída.
