# 08 — Estúdio: aquisição, orçamento e produtos

Estado: **in_progress_parallel**  
Plano: [STUDIO_GROWTH_PLAN_V1.md](../STUDIO_GROWTH_PLAN_V1.md)  
Search: [STUDIO_SEARCH_DISCOVERY_V1.md](../STUDIO_SEARCH_DISCOVERY_V1.md)  
Orçamento: [STUDIO_QUOTE_FLOW_V1.md](../STUDIO_QUOTE_FLOW_V1.md)

## Objetivo

Transformar `/studio` em uma frente pública capaz de:

1. provar capacidade com Impressões;
2. captar projetos qualificados por Orçamento;
3. levar produtos próprios para compra na Shopee;
4. construir aquisição orgânica mensurável por Search.

Este trabalho corre em paralelo à fila da Rádio e **não pode alterar o motion spine C1** sem coordenação explícita.

## Escopo congelado desta fase

- três pilares: Impressões, Orçamento, Produtos;
- prioridade comercial: Placas e Caixas;
- Materiais & Cores como conteúdo de apoio;
- páginas próprias para Placas e Caixas;
- páginas de produto antes do link Shopee;
- Search como requisito transversal;
- preview continua `noindex` até gate de lançamento.

## Bloco S1.0 — Documentação

- [x] plano de crescimento;
- [x] contrato de Search;
- [x] fluxo de orçamento;
- [x] checklist de execução;
- [ ] alinhar PROJECT_PLAN;
- [ ] alinhar CATALOG_3D;
- [ ] alinhar ROADMAP;
- [ ] alinhar README.

## Bloco S1.1 — Fundação de rotas e Search

- [ ] criar estrutura persistente para `/studio/*`;
- [ ] preservar continuidade da Rádio em todas as rotas públicas do Estúdio;
- [ ] separar comportamento de indexação por ambiente;
- [ ] criar `robots.ts`;
- [ ] criar `sitemap.ts`;
- [ ] definir origem única para base URL/canonical;
- [ ] metadata específica por rota;
- [ ] Open Graph por superfície estratégica;
- [ ] breadcrumbs quando fizer sentido;
- [ ] validar links HTML rastreáveis;
- [ ] garantir conteúdo principal renderizável sem interação;
- [ ] revisar impacto de `connection()`/dinamismo da Rádio nas páginas comerciais.

### Aceite S1.1

- produção pode ser indexável sem afetar preview;
- todas as URLs estratégicas têm canonical;
- sitemap contém somente URLs publicáveis;
- `/studio/*` não quebra áudio persistente;
- nenhuma página estratégica retorna vazio;
- conteúdo comercial existe no HTML inicial/servidor de forma adequada.

## Bloco S1.2 — Hub do Estúdio

- [ ] substituir entrada Materiais por Orçamento;
- [ ] renomear Loja Shopee para Produtos na hierarquia principal;
- [ ] manter material/cores dentro do conteúdo de apoio;
- [ ] três caminhos visualmente distintos;
- [ ] prova visual real;
- [ ] links para Impressões, Orçamento e Produtos;
- [ ] links contextuais para Placas e Caixas sem transformar o topo em menu de keywords.

### Aceite S1.2

Visitante frio entende em poucos segundos:

- o que o Estúdio faz;
- que existem trabalhos reais;
- como pedir algo personalizado;
- onde comprar produto pronto.

## Bloco S1.3 — Impressões

- [ ] rota própria;
- [ ] dataset editorial mínimo;
- [ ] status: produzido / conceito / produto / cliente;
- [ ] foto real como conteúdo;
- [ ] alt/contexto;
- [ ] filtros somente se houver volume que justifique;
- [ ] CTA contextual para orçamento;
- [ ] respeitar IP e permissões.

## Bloco S1.4 — Placas personalizadas

- [ ] conteúdo específico;
- [ ] pelo menos uma prova real forte;
- [ ] usos reais;
- [ ] opções e limitações;
- [ ] CTA para orçamento;
- [ ] ligações para projetos relacionados;
- [ ] metadata/canonical/OG;
- [ ] schema somente se aplicável.

## Bloco S1.5 — Caixas personalizadas

- [ ] conteúdo específico;
- [ ] foco em função e medida;
- [ ] pelo menos uma prova real suficiente para lançamento;
- [ ] CTA para orçamento;
- [ ] metadata/canonical/OG.

## Bloco S1.6 — Orçamento

- [ ] wizard progressivo;
- [ ] perguntas por tipo;
- [ ] anexos privados;
- [ ] persistência;
- [ ] estados de erro;
- [ ] confirmação;
- [ ] triagem;
- [ ] analytics sem PII;
- [ ] mobile/teclado/acessibilidade.

## Bloco S1.7 — Produtos

- [ ] catálogo interno;
- [ ] páginas individuais;
- [ ] fotos/medidas/material/opções reais;
- [ ] CTA Shopee no produto;
- [ ] indisponível/sob consulta sem mentira;
- [ ] metadata;
- [ ] dados estruturados aplicáveis;
- [ ] nenhum produto fake para preencher grade.

## Bloco S1.8 — Gate de lançamento

- [ ] domínio definitivo;
- [ ] produção sem `noindex`;
- [ ] preview ainda `noindex`;
- [ ] Search Console;
- [ ] sitemap enviado;
- [ ] inspeção das URLs prioritárias;
- [ ] Rich Results Test onde aplicável;
- [ ] validação mobile;
- [ ] CWV/performance básica;
- [ ] imagens rastreáveis;
- [ ] links internos;
- [ ] analytics de orçamento e saída para Shopee;
- [ ] revisão de privacidade de anexos;
- [ ] nenhuma promessa comercial não confirmada.

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
