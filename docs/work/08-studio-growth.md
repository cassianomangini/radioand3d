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

Estado atual: **ready_for_frontend: no**

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
- [ ] revisão visual das próximas superfícies por Cassiano;
- [ ] mudar `ready_for_frontend` para `yes` somente após aprovação.

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
- [x] resumo editável antes do envio;
- [ ] anexos privados;
- [ ] persistência;
- [x] estados de erro e validação local;
- [ ] confirmação sem CTA forçado para WhatsApp;
- [ ] triagem;
- [x] eventos do funil instrumentados por contrato local sem PII; adaptador para provedor real fica no gate de lançamento;
- [x] labels, foco por etapa, teclado e composição mobile validados estruturalmente no CI; auditoria final de lançamento continua em S1.8.

## Bloco S1.7 — Produtos

- [x] contrato de catálogo interno criado e deliberadamente vazio até existirem itens reais;
- [x] sem filtros/ordenação enquanto o volume não justificar;
- [x] preview preparado para mídia fotográfica real, sem item sintético quando catálogo está vazio;
- [x] rota individual `/studio/produtos/[slug]` preparada;
- [ ] fotos/medidas/material/opções reais;
- [x] CTA externo preparado no nível do produto como “Ver preço e disponibilidade na Shopee” quando houver URL real;
- [x] explicar que finalização/pagamento acontecem na Shopee;
- [x] não duplicar preço/estoque sem sincronização confiável;
- [x] contrato de disponibilidade: disponível / sob consulta / indisponível, com data e origem de verificação;
- [x] ponte “precisa de outra medida?” → orçamento;
- [x] metadata individual preparada;
- [ ] dados estruturados aplicáveis;
- [x] nenhum produto fake para preencher grade.

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
- [ ] imagens rastreáveis;
- [x] links internos das jornadas estruturais validados no CI;
- [ ] analytics de orçamento e saída para Shopee;
- [ ] revisão de privacidade de anexos;
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
- produtos reais e páginas individuais;
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

