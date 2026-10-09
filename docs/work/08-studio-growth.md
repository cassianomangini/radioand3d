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
- [ ] pelo menos uma etapa do Orçamento com direção visual final;
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
- backend, storage, upload e retenção foram definidos em [SUPABASE_INFRASTRUCTURE_V1.md](../SUPABASE_INFRASTRUCTURE_V1.md); implementação local pode avançar, enquanto apply/validação remota continuam bloqueados por E2.


## Orçamento — contrato de solicitação backend-neutral — 05/10/2026

- payload público interno versionado com `schemaVersion: 1`;
- tipos de projeto, contato, produção, origem e metadados de anexo têm contrato único;
- o wizard reutiliza os mesmos tipos canônicos, evitando divergência entre UI e futuro adapter server-side;
- validação estrutural cobre coerência do tipo de projeto, arquivos, quantidade, detalhes mínimos e contato;
- classificação inicial separa `ready-for-review`, `needs-information` e `incomplete`;
- nenhuma regra automática marca projeto como “não atendido”; casos fora de escopo continuam decisão humana;
- nenhum arquivo, contato ou solicitação é enviado nesta etapa;
- inspeção de conteúdo, storage, retenção e persistência têm arquitetura Supabase definida; provisionamento remoto, secrets e validação live continuam bloqueados por E2.


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
- checklist de provisionamento/validação remota: [E2](08-supabase-provisioning.md). Banco CM criado e staging pausado pelo usuário; **oito migrations e bucket privado aplicados**, e handlers `session`/`init`/`complete`/`submit` existem na `main` **com flag OFF**; falta validar upload real, retenção, secrets e Cron. Nenhuma publicação.
