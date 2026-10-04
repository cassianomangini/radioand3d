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
- [ ] revisar wireframe atualizado do hub;
- [ ] revisão do mock visual final por Cassiano;
- [ ] mudar `ready_for_frontend` para `yes` somente após aprovação.

### Regra S1.0B

Enquanto o gate estiver aberto:

- pode avançar infraestrutura e Search que não cristalizem layout;
- não criar CSS ornamental para substituir mídia ausente;
- não criar componentes genéricos só para preencher tela;
- não implementar filtros, configuradores, sticky CTAs ou cards adicionais sem necessidade aprovada.

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

Dependência visual: **S1.0B aprovado**.

- [ ] substituir entrada Materiais por Orçamento;
- [ ] renomear Loja Shopee para Produtos na hierarquia principal;
- [ ] manter material/cores dentro do conteúdo de apoio;
- [ ] Impressões com maior peso visual que Orçamento e Produtos;
- [ ] não usar três cards idênticos;
- [ ] prova visual real;
- [ ] links para Impressões, Orçamento e Produtos;
- [ ] links contextuais para Impressão 3D sob demanda, Placas e Caixas sem transformar o topo em menu de keywords;
- [ ] não repetir hero gigante da Home;
- [ ] usar fotografia/asset aprovado em vez de CSS decorativo quando mídia for a resposta correta.

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

## Bloco S1.3B — Impressão 3D sob demanda

- [ ] rota própria;
- [ ] copy “Já tem o arquivo? Envie para análise”;
- [ ] branch de orçamento `tipo=impressao`;
- [ ] upload como ação principal;
- [ ] quantidade/material/cor/escala com opção “não sei”;
- [ ] explicar que produção depende de análise;
- [ ] sem iconografia decorativa;
- [ ] foto real de processo/peça quando disponível;
- [ ] metadata/canonical/OG.

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

- [ ] experiência de conversa guiada;
- [ ] começar pela intenção — arquivo pronto / placa / caixa / outro — e não por contato;
- [ ] wizard progressivo;
- [ ] perguntas por tipo;
- [ ] opção “não sei”/“preciso de ajuda” quando aplicável;
- [ ] contato somente no final;
- [ ] upload nativo em mobile e drag-and-drop apenas como melhoria desktop;
- [ ] resumo editável antes do envio;
- [ ] anexos privados;
- [ ] persistência;
- [ ] estados de erro;
- [ ] confirmação sem CTA forçado para WhatsApp;
- [ ] triagem;
- [ ] analytics sem PII;
- [ ] mobile/teclado/acessibilidade.

## Bloco S1.7 — Produtos

- [ ] catálogo interno;
- [ ] sem filtros/ordenação enquanto o volume não justificar;
- [ ] preview principalmente fotográfico;
- [ ] páginas individuais;
- [ ] fotos/medidas/material/opções reais;
- [ ] CTA explícito “Comprar na Shopee” no produto;
- [ ] explicar que finalização/pagamento acontecem na Shopee;
- [ ] não duplicar preço/estoque sem sincronização confiável;
- [ ] indisponível/sob consulta sem mentira;
- [ ] ponte “precisa de outra medida?” → orçamento;
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
