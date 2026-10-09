# 08V — Evolução da produção visual e Visual QA

**Estado:** em execução; auditoria e base de agentes/dependências/QA renderizado verificadas. Baselines aprovadas, QA ampliado, laboratório, piloto e adoção contínua ainda pendentes.  
**Vínculo:** subfrente da entrega 08 (Estúdio público); não é uma nova fila paralela nem reabre C1–C8 da Rádio.  
**Base consultada:** `main` em 09/10/2026, commit `080cbd7d2078848f9d6e66bf33efc154c672b4ed`.  
**Responsáveis por domínio:** CM Experience (direção), CM Frontend (implementação), CM Review (evidência), CM Planning (controle do checklist).  
**Referências:** `AGENTS.md`, `docs/EXPERIENCE.md`, `docs/ARCHITECTURE.md`, `docs/ROADMAP.md`, `docs/design/CM_MOTION_EXPERIENCE_PLAN_V1.md`, `docs/design/STUDIO_COMMERCE_EXPERIENCE_V1.md`, `docs/design/CM_SITE_VISUAL_IDENTITY_AUDIT_V1.md` e pesquisa entregue por Cassiano em 09/10/2026 sobre interfaces render-first.

## Objetivo e definição de sucesso

Deixar de entregar frontend visual apenas porque compila, funciona ou tem os elementos solicitados. Toda **mudança visual substancial autorizada** deverá partir da referência e do contrato aprovado, selecionar conscientemente o meio de renderização, produzir o resultado em navegador real, compará-lo e corrigir diferenças antes de pedir aceite.

Não confundir: (a) CI verde; (b) screenshot gerado; (c) revisão visual do agente; (d) aprovação humana de Cassiano. São quatro evidências distintas.

**Resultado esperado:** um processo reutilizável, leve e verificável para construir interfaces visivelmente melhores, com componentes e técnicas adequados — não um catálogo de dependências instalado sem uso.

### Limites e contratos preservados

- Não alterar a Rádio aceita em 05/10/2026 por causa deste plano; testes servem para prevenir regressões. Qualquer reabertura exige pedido próprio.
- Preservar Home, hub `/studio` e página individual de Produto nos limites já aprovados. Não substituir a hierarquia de três entradas, adicionar carrinho ou mudar o CTA **Comprar na Shopee**.
- O Estúdio continua material, fotográfico, claro e premium; a Rádio conserva o caráter tátil, denso, software-like e áudio-reativo. Não espalhar glow/ícones pela página.
- Não inventar peças, materiais, avaliações, mídias de clientes ou capacidade já executada. Placeholders e fixtures devem ser identificados e não publicados como prova real.
- Não ligar integração, provisionar serviços, publicar em produção, alterar dados remotos nem assumir gasto recorrente. O trabalho é frontend/design/QA, independente de E2/E4.
- Design novo só se torna UI final após aprovação de Cassiano. Screenshots, testes automatizados e autorrevisão não equivalem a essa aprovação.
- Evitar nova documentação repetida: este é o checklist de execução; contratos canônicos continuam em seus arquivos atuais.

## Auditoria inicial — verificações que JÁ aconteceram

- [x] **A0.1** Conferir `package.json`: Next.js 16/React 19/Tailwind 4; sem Motion, GSAP, R3F ou Playwright declarados.
- [x] **A0.2** Conferir `AGENTS.md` e agentes Experience/Frontend/Review: regra atual impede o agente de abrir navegador, capturar screenshot ou executar verificações por conta própria sem pedido explícito.
- [x] **A0.3** Conferir a infraestrutura de captura **já existente**: `.github/workflows/ci.yml` gera PNGs em PR ou commit com `[visual]`; `scripts/capture-radio-states.mjs` usa Chromium/CDP e exercita diversos estados e transições. Portanto, **não** partimos do zero.
- [x] **A0.4** Verificar lacuna por inspeção estática: não há no `package.json` runner Playwright; a captura atual não implementa, por si, comparação automática de baseline/mocks ou crítica perceptual. **Não** afirmar que o QA atual inexiste ou que o script não funciona.
- [x] **A0.5** Ler os gates vigentes: hub do Estúdio aprovado; direção da página de Produto individual aprovada; outras superfícies e mídia final ainda têm pendências; `docs/work/08-studio-growth.md` é o checklist funcional.
- [x] **A0.6** Identificar divergência de fonte: a skill `cm-3d-radio-experience` descreve Rádio à esquerda/Estúdio à direita, enquanto `docs/EXPERIENCE.md`, o pacote de aprovação e o shell no repositório descrevem Estúdio à esquerda/Rádio à direita. Há também orientação diferente sobre seta no divisor. **Não escolher silenciosamente um lado.**
- [x] **A0.7** Revisar a pesquisa render-first: escolha híbrida DOM/CSS/SVG/asset/Canvas/WebGL, receitas visuais, biblioteca de referências, feedback visual e preservação da melhor alternativa.

**Limite da auditoria:** leitura de código, documentação, skill e CI; não houve execução local do app, inspeção dos PNGs atuais, teste de interação real ou aprovação visual. Uma run recente de CI bem-sucedida não comprova que a etapa condicional de captura executou.

## A1 — Auditoria visual real do CM (correção de rota em 09/10/2026)

Em 09/10/2026, Cassiano identificou que a primeira rodada do laboratório **não havia estudado realmente as telas existentes, cores e composição da marca**. Essa crítica invalida a apresentação das três variantes V1 como opções de produto, embora os testes e a infraestrutura continuem úteis.

- [x] **A1.1** Inspecionar as seis referências fornecidas (Home split, Rádio em foco, banner e selo CMANGINI 3D, X1, caso Placa Personalizada), separando marca global, subidentidade do Estúdio, UI da Rádio e mídia de peça.
- [x] **A1.2** Confrontar screenshots com `tokens.css`, `layout.tsx`, shell/stylesheet do site, `EXPERIENCE`, `CM_VISUAL_SYSTEM` e handoffs comerciais; registrar paleta verdadeira, gradientes efetivos, tipografia e tratamento de mídia.
- [x] **A1.3** Registrar hierarquia e gramática por superfície: Home integrada, Rádio focada, hub 3 entradas, galeria Impressões, produto, orçamento, responsivo; identificar precisamente por que o laboratório V1 não pertence ao mesmo universo.
- [x] **A1.4** Suspender aprovação artística das três variantes V1 e manter somente seu valor como harness de QA. Criar gate obrigatório de **contexto do site existente antes do design**.
- [ ] **A1.5** Inspecionar capturas reais da rota-alvo Impressões e fluxo mobile completo nas condições representativas; adquirir versão verificável de referência visual aprovada para comparação de precisão quando disponível.
- [ ] **A1.6** Produzir nova proposta de Impressões **inserida no shell CM** e submeter direção/identidade visual a Cassiano antes de experimentar implementação de página pública.

**Conferência renderizada adicional:** foram inspecionados os screenshots do próprio CI [37942413229](https://github.com/cassianomangini/radioand3d/actions/runs/37942413229) para Home/hub/Produto/Orçamento, desktop 1440 e mobile 390. A foto de Produto, as miniaturas, o CTA Shopee sólido, o mini-player e a hierarquia colorida ciano/violeta/coral dos três pilares reforçam a diferença em relação ao lab genérico. **A1.5 permanece aberta** especificamente porque falta QA da galeria `/studio/impressoes` com mídia apropriada, não porque nenhum mobile tenha sido visto.

**Artefato de estudo:** [CM — Auditoria da identidade visual aplicada ao site](../design/CM_SITE_VISUAL_IDENTITY_AUDIT_V1.md). **Gate:** V4.4/V4.5 e V5 estão bloqueados até A1.5/A1.6, conforme pertinência da tela. Não pedir que o usuário escolha entre três propostas que compartilham um erro de identidade. **A implementação pública continua intocada.**

## Sequência de execução — marcar somente com evidência

### V1 — Governança e fontes de verdade

**Objetivo:** agentes aptos a trabalhar render-first sem quebrar aprovações.

- [x] **V1.1** Confirmar qual lado do split é o aprovado atualmente; reconciliar a skill `cm-3d-radio-experience`, suas referências e os contratos versionados, preservando o layout vigente até confirmação.
- [x] **V1.2** Reconciliar indicação/ausência de seta no divisor e outras divergências visuais sem reabrir funcionalidade aceita por padrão.
- [x] **V1.3** Ajustar `AGENTS.md`: tarefas visuais autorizadas podem e devem ter renderização/captura **local** e verificações pertinentes; registrar quando o ambiente impedir. Separar isso de deploy/ações remotas e da aprovação final por Cassiano.
- [x] **V1.4** Atualizar CM Experience (reference → visual spec → escolha do renderer), CM Frontend (implementação + evidência) e CM Review (comparação visual, divergências, funcionalidade, performance e a11y).
- [ ] **V1.5** Reconciliar instruções da skill fora do repositório com os agentes GitHub; a edição do `AGENTS.md` não atualiza automaticamente skills instaladas.
- [x] **V1.6** Validar consistência com `EXPERIENCE`, `ARCHITECTURE`, plano de motion e aprovação do Estúdio; documentar o resultado e o commit.

**Gate V1:** fonte de verdade inequívoca, permissão operacional limitada e nenhum design aceito alterado sem autorização.

### V2 — Captura e avaliação visual executáveis

**Objetivo:** ampliar o sistema que já existe, sem descartar o CDP ou substituir todas as capturas de uma vez.

- [x] **V2.1** Rodar e inspecionar as capturas atuais em ambiente controlado; registrar quais telas, estados e viewports realmente passam ou falham.
- [ ] **V2.2** Definir fixtures/dados determinísticos, esperas por fontes e mídia, controle de transições e tratamento de conteúdo dinâmico (faixa aleatória, tempo e arte), sem depender de credenciais privadas no navegador.
- [x] **V2.3** Introduzir Playwright Test onde trouxer ganho verificável para jornadas, emulação mobile e comparação visual; conservar o script CDP da Rádio até haver paridade, sem duas suítes duplicadas indefinidamente.
- [x] **V2.4** Capturar ao menos 1440×900, 1024×768, desktop curto 1760×824, mobile 390×844 e mobile estreito ~360 px conforme a superfície; testar mobile com emulação real, não apenas largura de screenshot desktop.
- [ ] **V2.5** Criar comparação com baselines **curadas e aprovadas**, diffs/artifacts e triagem visual das cinco maiores diferenças. Pixel diff detecta regressão; não é nota automática de beleza nem aprovação de mock.
- [ ] **V2.6** Cobrir overflow horizontal/scroll involuntário, hierarquia, foco/teclado, touch, títulos longos, loading/error, `prefers-reduced-motion`, áudio único/persistente e estados de entrada/saída/interrupção.
- [ ] **V2.7** Registrar acessibilidade e performance em cenários representativos; orçamento de GPU/bundle é avaliado antes de 3D/Canvas/efeitos permanentes.
- [ ] **V2.8** Integrar resultados ao CI com artefatos e falha por regressão objetiva. Manter imagens de usuários/dados privados fora de baselines públicas e logs.

**Gate V2:** outra pessoa/agente consegue reproduzir a captura, comparar resultado e ver evidência, sem confundir screenshot com aceite estético.

### V3 — Pesquisa de bibliotecas e receitas, orientada por necessidade

**Objetivo:** explorar tecnologia avançada em vez de reconstruir efeitos por inércia.

- [x] **V3.1** Criar registro enxuto de candidatos por problema: Motion (layout/gestos), GSAP (timeline/SVG), React Bits/Codrops (referências/experimentos), R3F + Drei (3D real), SVG/Canvas (iluminação/partículas), Rive (animação stateful).
- [x] **V3.2** Para cada opção usada: verificar licença de uso **e redistribuição**, manutenção, acessibilidade, Next/React/SSR, custo de bundle, desempenho mobile, fallback e complexidade de atualização. React Bits não é MIT irrestrito: possui condição Commons Clause.
- [x] **V3.3** Montar referências aprovadas e receitas **apenas para os efeitos que tenham consumidor real**; especificar camadas, iluminação, movimento, estados e antipatrones. Não criar dez componentes abstratos vazios.
- [x] **V3.4** Formalizar regra de escolha: DOM/CSS para texto/controles, SVG para geometria/filtros, asset para cenário artístico estático, Motion/GSAP quando a coreografia justificar, Canvas/WebGL apenas se necessário. Não animar o mesmo elemento com múltiplos motores concorrentes.
- [ ] **V3.5** Registrar decisões `adotar` / `avaliar depois` / `rejeitar` com justificativa e exemplo renderizado; instalar dependência só após experimento aprovado.

**Gate V3:** cada nova ferramenta tem caso concreto, licença revisada e ganho perceptivo demonstrado.

### V4 — Laboratório visual (sem segunda infraestrutura desnecessária)

**Objetivo:** comparar alternativas antes de introduzi-las nas páginas reais.

- [x] **V4.1** Reaproveitar `/dev/foundation` e evoluí-la com experimentos isolados; criar rota nova somente se houver incompatibilidade real. Garantir indisponibilidade no build público, não apenas `noindex`.
- [x] **V4.2** Montar um experimento com até 3 alternativas visuais da **mesma superfície**, usando composição, mídia/fixtures honestas e critérios equivalentes.
- [x] **V4.3** Renderizar e comparar lado a lado desktop/mobile; registrar componentes, técnica gráfica, estados e custo de desempenho, sem selecionar a primeira alternativa por padrão.
- [ ] **V4.4** Congelar a melhor variante e sua evidência; não sobrescrever a referência vencedora durante iterações.
- [ ] **V4.5** Apresentar o resultado à aprovação de Cassiano. Não publicar experimento diretamente.

**Gate V4:** parcialmente atingido **apenas na infraestrutura**. Os experimentos V1 são **rejeitados como direção de arte** após a auditoria A1, porque não partem do sistema visual do site. Nenhuma alternativa vencedora selecionada; V4.4/V4.5 somente após nova proposta contextual e aprovação explícita de Cassiano.

**Evidência V4.1–V4.3:** rota isolada `/dev/visual-lab` criada separadamente de `/dev/foundation` porque experimentos compositivos com Motion não devem alterar a vitrine de primitivas/tokens já existente. Em produção, rota 404; no dev, três composições do mesmo conteúdo com placeholders honestos. Playwright comparou 1440/1024/390/360 e gerou `comparativo.html`; inclui troca com teclado, colisões de texto, scroll e inventário de custo de JS/frames do servidor dev. [Relatório de execução e limites](evidence/08v-lab-performance-2026-10-09.md) e [diário de defeitos corrigidos](evidence/08v-lab-iterations-2026-10-09.md).

### V5 — Piloto de evolução real no Estúdio

**Objetivo:** provar melhoria perceptível em produção, não apenas criar ferramentas de QA.

- [ ] **V5.1** Escolher uma superfície de **design ainda não fechado**. Candidata: experiência de Impressões; se E3 (mídia real) impedir avaliação final, validar primeiro mecânica isolada ou uma etapa do Orçamento, sem fingir prova real.
- [ ] **V5.2** Elaborar composição desktop/mobile e mapa por camada (HTML, foto, asset, SVG, motion), com requisitos de conteúdo e `ready_for_frontend`.
- [ ] **V5.3** Submeter a direção visual a Cassiano antes de cristalizar a UI final.
- [ ] **V5.4** Implementar a variante aprovada usando as bibliotecas escolhidas, **sem tocar o motion spine da Rádio** e sem recriar navegação/player.
- [ ] **V5.5** Executar comparação, fluxos reais, responsividade e testes; corrigir diferenças observadas e apresentar novos screenshots. Pelo menos uma iteração de correção documentada.
- [ ] **V5.6** Registrar aprovação perceptiva de Cassiano, commits, evidência e limites; somente então marcar o piloto concluído.

**Gate V5:** um trecho do Estúdio significativamente melhor, utilizável, aprovado visualmente e sem regressões no player ou nos contratos comerciais.

### V6 — Reuso e adoção contínua

- [ ] **V6.1** Extrair somente as primitivas/receitas de qualidade já comprovada em V5; integrar tokens e documentação canônica sem duplicar o design system.
- [ ] **V6.2** Tornar análise de referência, escolha do renderer, captura e crítica visual checklist padrão para próximas entregas visuais substanciais.
- [ ] **V6.3** Medir custo de dependências/efeitos no bundle, fluidez mobile e regressões antes de expandir para outras superfícies; não reabrir a Rádio automaticamente.
- [ ] **V6.4** Revisar instruções e CI depois do piloto e eliminar scripts, templates e regras redundantes que não agreguem valor.

**Gate V6:** o próximo agente consegue repetir a prática sem refazer a pesquisa, depender de memória de conversa ou aceitar frontend que apenas compila.

## Execução parcial de preparação — 09/10/2026

- **V1.1–V1.4 / V1.6:** contratos e agentes reconciliados; split desktop **Estúdio à esquerda / Rádio à direita**; seta contextual permitida, não permanente; `AGENTS.md` agora autoriza QA local de tarefas visuais aprovadas sem confundir isso com deploy ou aceite humano. `EXPERIENCE`, `ARCHITECTURE` e `README` passaram a apontar para o processo canônico.
- **Skill:** fonte versionada em `.github/skills/cm-3d-radio-experience`, referência nova `visual-workflow.md`, ZIP criado e validado via skill-creator. **A versão carregada na biblioteca pessoal ChatGPT não é automaticamente sobrescrita** por essa publicação; V1.5 permanece aberto até ativação do ZIP.
- **V2 em preparação:** `playwright.config.ts`, `tests/visual/public-pages.spec.ts` e CI novo foram adicionados. Playwright captura cinco perfis de viewport e inventaria Axe, mas **a revisão do resultado e as baselines curadas não foram concluídas**. Capturas e inventário a11y não implicam correção das páginas nem nota de excelência estética.
- **Dependências efetivamente instaladas e travadas:** `motion@^12.43.0`, `@playwright/test@^1.64.0`, `@axe-core/playwright@^4.13.0`; manifest/lock atualizados pelo runner com `pnpm add` e sucesso de lint/typecheck/test/build antes do commit. GSAP, R3F/Drei, React Bits e demais ferramentas não foram instalados porque ainda não existe caso renderizado que justifique o custo.
- **V3.1/V3.3/V3.4:** biblioteca/candidatos, estratégia de renderer e cinco receitas específicas em `docs/design/CM_VISUAL_RENDER_PIPELINE_V1.md` e `CM_VISUAL_RECIPES_V1.md`. São receitas de direção e QA, não componentes implementados ou UX final aprovada.
- **Nenhuma página pública modificada** por V1–V3. Rádio, hub e Produto permanecem sujeitos aos contratos atuais.

**Pendente nesta rodada:** executar e inspecionar Playwright na CI condicional `[visual]`, tratar eventuais falhas de tooling, validar o contrato de baseline e aprovar o primeiro protótipo antes de iniciar UI pública.

## QA renderizada realmente executada

**CI [visual] inicial validada:** [run 37936816995](https://github.com/cassianomangini/radioand3d/actions/runs/37936816995): lint, typecheck, 84 testes unitários e build passaram; **25/25** testes Playwright passaram, com cinco perfis de tela, 20 capturas e 5 auditorias Axe. O CDP existente capturou mais 23 imagens de estados e navegação. Foram inspecionados exemplos desktop/mobile da Home, do Estúdio e dos estados da Rádio. Detalhes e resultados não resolvidos estão no [relatório de evidência](evidence/08v-visual-qa-audit-2026-10-09.md).

**A11y diagnosticou problemas moderados, não corrigidos:** `page-has-heading-one` no hub em todos os perfis e `region` para o divisor em desktops amplos. O cenário sem R2 real mostra playlist vazia. O CI verde comprova o harness técnico, **não** comprova design 2040, áudio verdadeiro em reprodução ou aceitação das páginas. V2.2, V2.5, V2.6, V2.7 e V2.8 continuam abertos na parte ainda não coberta.

## Comparação isolada do laboratório (V4)

**CI final do Visual Lab:** [run 37942413229](https://github.com/cassianomangini/radioand3d/actions/runs/37942413229), commit `fcb615b66cbc1360cba58b5a4094bd5b413f90fa`. **30/30** testes Playwright públicos/404 e **16/16** testes do laboratório em quatro viewports passaram sem retries; 84 testes unitários, lint, tipos e build verdes. Foram produzidas **12 capturas reais** e comparativo HTML da mesma superfície **Impressões** em três composições. [Relatório de QA + medições de desempenho (ambiente dev)](evidence/08v-lab-performance-2026-10-09.md).

A inspeção dos PNGs apontou inicialmente sobreposição de texto no **Mostruário**; depois o QA detectou clique anterior à hidratação React. Ambos foram corrigidos e verificados por cenário automatizado sem retry. **Não significa que os estudos sejam arte final.** Original da referência aprovada, fotografia real E3, seleção de variante e baselines pixel-diff continuam pendentes. Página pública/Rádio não foram modificadas.

## Critérios do Visual QA (para cada tela)

1. **Fidelidade:** hierarquia, proporções, imagem, tipografia e composição conferidas contra o artefato aprovado; o que era asset não foi aproximado com decoração improvisada.
2. **Qualidade de material:** luz/profundidade/contraste adequados ao conceito da superfície; não impor orbs/neon como estilo universal.
3. **Comportamento:** hover, touch, foco, teclado, cancelamento, transição interrompida e estados honestos funcionam.
4. **Responsividade:** testar desktop amplo/curto e mobile emulado com scroll, safe area e alvos táteis, sem compressão ou overflow acidental.
5. **Segurança e verdade:** sem mídia inventada como prova, sem dados privados, sem operações remotas não autorizadas.
6. **Desempenho e acessibilidade:** efeitos dispensáveis suspendem em offscreen/inatividade; modo reduzido válido; conteúdo e CTAs permanecem legíveis.
7. **Estado de aprovação:** aprovado pelo agente (autorrevisão), testado tecnicamente e aprovado por Cassiano são registros distintos.

**Não instituir score 85/100, LPIPS/CLIP ou critic de IA automático como aprovação mágica.** São candidatos opcionais, dependentes de avaliação de custo, viés, falsos positivos e capacidade real de execução. Começar com diffs, diagnóstico explícito e aceite humano.

## Evidência e atualização dos checks

Um `[x]` exige um resultado **efetivamente observado** e localização da prova. Para execução de código: commit SHA, arquivos, comandos/testes com resultado, cenários renderizados, screenshots/diffs, aprovação humana quando a etapa exigir e pendências. Um bloqueio permanece `[ ]` com motivo; não marcar concluído só porque o código existe.

| Data | IDs | Evidência | Resultado / próximo passo |
| --- | --- | --- | --- |
| 09/10/2026 | A0.1–A0.7 | Leitura de `main@080cbd7`, agentes, CI, script CDP, contratos do Estúdio e skill de experiência; pesquisa fornecida | Auditoria documental/estática feita. **Nenhum** item V1–V6 executado. Próximo: confirmar lado do split e aprovar mudanças no processo de QA. |
| 09/10/2026 | V1.1–V1.4, V1.6, V3.1, V3.3, V3.4 | `AGENTS.md`, três perfis GitHub, `EXPERIENCE.md`, `ARCHITECTURE.md`, fonte da skill, `CM_VISUAL_RENDER_PIPELINE_V1.md`, `CM_VISUAL_RECIPES_V1.md` | Ajustes realizados sem alteração de página pública; skill empacotada, instalação na biblioteca ChatGPT ainda externa. |
| 09/10/2026 | Preparação técnica V2 / dependências | `playwright.config.ts`, `tests/visual/public-pages.spec.ts`, `.github/workflows/ci.yml`, `package.json`, `pnpm-lock.yaml` | Bibliotecas instaladas e verificações estáticas/build verdes no runner; Playwright/browser visual ainda exige execução e inspeção. |
| 09/10/2026 | V2.1/V2.3/V2.4 e V3.2 | [run 37936816995](https://github.com/cassianomangini/radioand3d/actions/runs/37936816995), [evidência observada](evidence/08v-visual-qa-audit-2026-10-09.md) | 25/25 Playwright, 23 capturas CDP; 5 perfis e Axe com 1–2 violações moderadas por viewport. Baseline perceptual/aceite humano pendentes. |

| 09/10/2026 | V4.1–V4.3 | [CI 37942413229](https://github.com/cassianomangini/radioand3d/actions/runs/37942413229), [evidência V4](evidence/08v-lab-performance-2026-10-09.md) | Rota protegida 404 em produção, 3 estudos × 4 viewports, 16 testes dev sem retry, comparação HTML e inventário de custos. V4.4/V4.5 aguardam escolha/aprovação. |

| 09/10/2026 | A1.1–A1.4 | [Auditoria visual real do site](../design/CM_SITE_VISUAL_IDENTITY_AUDIT_V1.md), seis imagens do usuário, tokens/CSS/TSX e contratos aceitos | Erro de identidade dos 3 conceitos V1 reconhecido; descartados como proposta artística, mantidos somente para QA. A1.5/A1.6 abertos. |

## Retomada

**Último ponto verificado:** auditoria A0; V1.1–V1.4/V1.6; V2.1/V2.3/V2.4; V3.1–V3.4; V4.1–V4.3. [CI 37942413229](https://github.com/cassianomangini/radioand3d/actions/runs/37942413229) verde, laboratório renderizado 3×4, custos dev registrados e defeitos de texto/hidratação corrigidos.  
**Pendências:** V1.5 (importação da skill pessoal); V2 (fixtures/baselines aprovadas, checks integrais), V3.5 (adoção de efeitos após seleção), **V4.4/V4.5 (escolha e aceite visual)**, V5/V6 não iniciados. Dados visuais reais E3 permanecem ausentes.  
**Próxima ação exata:** A1.5 — verificar a rota real `/studio/impressoes` e o mobile do CM no navegador; A1.6 — refazer a direção de Impressões dentro da composição existente, com paleta/tipografia/marca documentadas. **Não** solicitar escolha entre os três estudos iniciais rejeitados.  
**Deploy e alteração de páginas públicas:** nenhum. **Código alterado:** apenas laboratório isolado de desenvolvimento, testes, scripts, CI e documentação; Home, Estúdio público, Produto e Rádio preservados.
