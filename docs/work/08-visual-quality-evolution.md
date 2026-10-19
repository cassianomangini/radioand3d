# 08V — Evolução da produção visual e Visual QA

**Estado:** em execução; auditoria e base de agentes/dependências/QA renderizado verificadas. Baselines aprovadas, QA ampliado, laboratório, piloto e adoção contínua ainda pendentes.  
**Vínculo:** subfrente da entrega 08 (Estúdio público); não é uma nova fila paralela nem reabre C1–C8 da Rádio.  
**Base da auditoria inicial (histórica):** `main` em 09/10/2026, commit `080cbd7d2078848f9d6e66bf33efc154c672b4ed`. A revisão adicional de 18/10 utiliza `main@23f25c3c2193cddadd6a3e0f014ca7df2fcf5666`.  
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

## A2. Auditoria complementar de CSS e Home sobre a main atual (18/10/2026)

**Documento de evidência:** [08V, revisão crítica do shell CSS/TSX e QA](evidence/08v-css-shell-architecture-audit-2026-10-18.md), atualizado no PR #34. Esta é uma subfrente operacional do 08V, não um novo roadmap. O diagnóstico de 09/10 acima continua histórico e não se aplica automaticamente à Home de 18/10.

- [x] **A2.1, verificação estática:** confirmar `main@23f25c3c2193cddadd6a3e0f014ca7df2fcf5666`, novo WebP, regras atuais de copy, 5.149 linhas de CSS/2.458 TSX e classe de importação compartilhada com as letras. Contagens de overrides/classes órfãs são **heurísticas**, não remoções autorizadas.
- [x] **A2.2, CI de fato:** verificar [run 39151011258](https://github.com/cassianomangini/radioand3d/actions/runs/39151011258), no qual lint/typecheck/unit/build passaram e as etapas de captura e Playwright foram `skipped`. O [workflow 39151011224](https://github.com/cassianomangini/radioand3d/actions/runs/39151011224) da prévia de Radio não cobre essa validação da Home.
- [x] **A2.3, conflito contrato/teste:** documentar que `tests/visual/home-hero-responsive.spec.ts` espera copy relativa/vertical no Estúdio estreito, mas o CSS novo a torna absoluta/lateral; há também requisitos do início de H1 obsoletos no split. **Falha runtime não alegada**, pois a suíte visual não rodou no push atual.
- [ ] **A2.4, B0 parcial:** o [CI 39152117452](https://github.com/cassianomangini/radioand3d/actions/runs/39152117452) do PR documental #34 **executou** `pnpm visual:qa` sobre o código da `main`: 75 passaram, 2 falharam, 103 ficaram ignorados. Falhas objetivas de `scrollWidth` no Estúdio: desktop 1440 (985px > limite 982px) e desktop curto 1760 (1253px > limite 1208px), reproduzidas em retry. Capturas de falha e mobiles 390/360 foram inspecionadas, mas faltam estados do divisor, render estabilizado e validação de composição com mock. Registrar o causador do overflow antes de ajustar teste.
- [x] **A2.5, B1 (implementação técnica):** corrigidas as asserções da Home para a composição lateral existente, verificadas caixas e letras renderizadas por estado e ajustado o teto ARIA; CI agora seleciona QA visual pela alteração real de arquivos. [Runs 39154733338](https://github.com/cassianomangini/radioand3d/actions/runs/39154733338) e [39155135852](https://github.com/cassianomangini/radioand3d/actions/runs/39155135852) verdes. **Isso não cria proteção de branch nem aprova a direção artística.**
- [ ] **A2.6, B2/B3 parcial:** corrigido overflow do título no desktop/dock e removidas 72 regras CSS órfãs após triagem dos importadores; de 5.161 para **4.831 linhas** em [56599fc](https://github.com/cassianomangini/radioand3d/commit/56599fc3a42e6f9e94a5d4af58a464fa91d33187). Ainda faltam consolidação dos estilos usados, QA visual completo após remoção e otimização medida de mídia.
- [ ] **A2.7, B4/B5 parcial:** limite `aria-valuemax` do divisor corrigido/testado em [0bcfd5b](https://github.com/cassianomangini/radioand3d/commit/0bcfd5b5dd2003d4ac2820d086ae35f72e478275). Shell de 2.458 linhas ainda não modularizado; teste adicional de motion normal/CI de screenshot estável enviado, aguardando verificação após ajuste da inicialização fria do CDP. Preservar o mesmo `<audio>` no layout.

**Nova evidência visual de 18/10:** o primeiro PR #34, ainda sem qualquer mudança em código de aplicação, reexecutou o QA que o push direto da `main` havia ignorado. As duas falhas em `home-hero-responsive.spec.ts:37` são **medidas de overflow geométrico**, não prova de scrollbar visível, porque o Estúdio usa `overflow-x: clip`. As capturas de falha desktop mostram uma frase ainda em animação, não necessariamente invisível ao fim; mobile 360 requer revisão de primeira dobra. [Relato técnico detalhado](evidence/08v-css-shell-architecture-audit-2026-10-18.md#A13-P1-confirmado-em-browser-conteúdo-extrapola-a-largura-do-estúdio-no-desktop).

**Gate A2:** não declarar a Home ou a limpeza CSS como concluídas até haver prova renderizada na implementação atual, testes coerentes com a direção escolhida e aceite visual separado de CI verde. Não reabrir a Rádio aceita; dock continua no 03c.

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

## Evidência complementar, 18/10/2026

| Data | IDs | Evidência | Resultado / próximo passo |
| --- | --- | --- | --- |
| 18/10/2026 | A2.1–A2.3 | [Auditoria 08V CSS/shell](evidence/08v-css-shell-architecture-audit-2026-10-18.md), [commit `23f25c3`](https://github.com/cassianomangini/radioand3d/commit/23f25c3c2193cddadd6a3e0f014ca7df2fcf5666), [run 39151011258](https://github.com/cassianomangini/radioand3d/actions/runs/39151011258) | Leitura e estados dos jobs verificados; CI verde **sem** Playwright visual. Render atual, correções de código e aceite humano **não** realizados. Próximo A2.4 (B0) e A2.5 (B1). |

## Retomada do recorte inicial de 09/10 (histórico)

**Último ponto verificado:** auditoria A0; V1.1–V1.4/V1.6; V2.1/V2.3/V2.4; V3.1–V3.4; V4.1–V4.3. [CI 37942413229](https://github.com/cassianomangini/radioand3d/actions/runs/37942413229) verde, laboratório renderizado 3×4, custos dev registrados e defeitos de texto/hidratação corrigidos.  
**Pendências:** V1.5 (importação da skill pessoal); V2 (fixtures/baselines aprovadas, checks integrais), V3.5 (adoção de efeitos após seleção), **V4.4/V4.5 (escolha e aceite visual)**, V5/V6 não iniciados. Dados visuais reais E3 permanecem ausentes.  
**Próxima ação exata:** A1.5 — verificar a rota real `/studio/impressoes` e o mobile do CM no navegador; A1.6 — refazer a direção de Impressões dentro da composição existente, com paleta/tipografia/marca documentadas. **Não** solicitar escolha entre os três estudos iniciais rejeitados.  
**Deploy e alteração de páginas públicas:** nenhum. **Código alterado:** apenas laboratório isolado de desenvolvimento, testes, scripts, CI e documentação; Home, Estúdio público, Produto e Rádio preservados.

**Atualização da retomada após o primeiro CI do PR #34:** [run 39152117452](https://github.com/cassianomangini/radioand3d/actions/runs/39152117452) falhou no Playwright por dois excessos de `scrollWidth`, com capturas disponíveis. A2.4 permanece aberto: a captura de erro não equivale à validação completa dos estados e não dispensa a correção de prova/bug. A2.5 também continua aberto.

## Retomada atual, 18/10/2026

O foco imediato da frente 08V no shell é [A2.4, B0](evidence/08v-css-shell-architecture-audit-2026-10-18.md): capturar e interagir com a **nova** Home no SHA mais recente, separar falhas da suíte desatualizada dos defeitos renderizados e confirmar a referência vigente. Em seguida, A2.5/B1 repara o gate de CI/teste. Só após evidência e contrato estável entram ajustes visuais, limpeza de CSS e extração do TSX. Não tratar checks já concluídos em 09/10 como execução de 18/10. Nenhuma modificação de UI ou player foi realizada pelo PR documental.

## Registro de implementação de 18/10/2026

Os blocos A2.4/A2.5/A2.6/A2.7 não devem ser confundidos com aprovação visual:

- [`0bcfd5b`](https://github.com/cassianomangini/radioand3d/commit/0bcfd5b5dd2003d4ac2820d086ae35f72e478275): correções do H1, atualização do teste de Home, `prefers-reduced-motion` e ARIA. [CI 39154733338](https://github.com/cassianomangini/radioand3d/actions/runs/39154733338) verde em todos os checks.
- [`b792336`](https://github.com/cassianomangini/radioand3d/commit/b792336c4eec4973debd555f2ebf186c08f5dc57): gatilho de QA visual por arquivos. [CI 39155135852](https://github.com/cassianomangini/radioand3d/actions/runs/39155135852) verde.
- [`56599fc`](https://github.com/cassianomangini/radioand3d/commit/56599fc3a42e6f9e94a5d4af58a464fa91d33187): 72 regras órfãs retiradas, captura canônica migrada para Playwright, teste de motion normal. [CI 39155551092](https://github.com/cassianomangini/radioand3d/actions/runs/39155551092) falhou **antes do Playwright** por timeout ao iniciar CDP sem o aquecimento anterior do Chrome.
- [`32be6b6`](https://github.com/cassianomangini/radioand3d/commit/32be6b6e04e3084a0d92b450426c24188dc9d7b8): prazo maior e log de stderr para detectar falha fria do CDP. [CI 39155705089](https://github.com/cassianomangini/radioand3d/actions/runs/39155705089) **sucesso completo**: lint, tipos, testes, build, CDP, 79 Playwright, 18 lab e 2 dock. A arte final continua pendente de aceite de Cassiano.

**Retomada operacional:** (1) conferir a composição aprovada com as capturas finais da `main@32be6b6` e registrar apenas diferenças visuais concretas; (2) consolidar os overrides ainda vivos e extrair CSS/TSX por domínio em commits pequenos; (3) medir custo de mídia, carrossel e áudio persistente após cada etapa. A aprovação estética continua de Cassiano.

## B4 parcial: extrações versionadas na main (18/10/2026)

A modularização foi executada em commits pequenos, diretamente na `main`, com QA de cada fronteira. Histórico de SHA, arquivo e resultado: [auditoria consolidada](evidence/08v-css-shell-architecture-audit-2026-10-18.md#10-b4-modularizacao-real-do-shell-e-evidencias).

- [x] Player completo extraído para `radio-content.tsx`; tipos comuns em `radio-view-transition.ts`. A importação do visualizador da animação de dock foi restaurada após falha objetiva de lint. O teste CDP de reversão espera **condição observada**, não um tempo fixo, sem relaxar verificação de animações ou continuidade do áudio. [CI 39160064139](https://github.com/cassianomangini/radioand3d/actions/runs/39160064139) verde.
- [x] Primeira fronteira CSS isolada: `studio-home-art.tsx` + `studio-home-art.module.css`, com recorte/máscara originais preservados. [CI 39160412327](https://github.com/cassianomangini/radioand3d/actions/runs/39160412327) verde.
- [x] `StudioWelcome` e `StudioHub` independentes, sem alterar o DOM renderizado nem criar novo player. [CI 39160755783](https://github.com/cassianomangini/radioand3d/actions/runs/39160755783) verde.
- [x] Limites do divisor extraídos para `radio-panel-layout.ts` e **três testes unitários adicionais** em [c4b2d4a](https://github.com/cassianomangini/radioand3d/commit/c4b2d4a5a118ec9872e46921144ceac6f90697f9). O CI original [39161117335](https://github.com/cassianomangini/radioand3d/actions/runs/39161117335) teve falhas intermitentes de `next/font/google` durante build/laboratório, **não de lint, tipos, testes ou Playwright**. O isolamento do compilador em [48722be](https://github.com/cassianomangini/radioand3d/commit/48722bea8b792fd6700fdff1c21979a871623209) resultou em [CI 39161703555](https://github.com/cassianomangini/radioand3d/actions/runs/39161703555) totalmente verde, incluindo **79 Playwright, 18 lab, 2 dock**.
- [ ] Continuar ownership de CSS e extrair somente outros blocos com limites reais, sobretudo Header, dock e identidade Home. A refatoração **não** está pronta enquanto o shell ainda mantém estados acoplados e o CSS principal não possui domínio claro.
- [ ] Avaliar performance/crop da imagem com dados de rede, LCP e comparação perceptiva aprovada; aprovar aparência com Cassiano, separado de pixels idênticos.

**Evidência visual automatizada:** entre a base anterior e a extração do player, **9 de 9 screenshots representativas ficaram pixel a pixel idênticas**. Após a extração da arte, **6 de 8 capturas comparadas ficaram idênticas**, com alterações mínimas em dois estados transitórios. Após a separação Hub/Welcome, **7 de 9 capturas ficaram idênticas** e duas apresentaram diferenças muito pequenas (efeitos transitórios). A comparação foi por Pillow/ImageChops em PNGs dos artefatos CI; não substitui aprovação artística.

**Métricas do arquivo monolítico (main@48722be):** `studio-radio-shell.tsx` caiu de **2.459 para 1.738 linhas**; o principal CSS Module caiu para **4.791 linhas**, incluindo a saída da arte para outro módulo. Não confundir diminuição do arquivo principal com eliminação equivalente de CSS total: regras vivas migraram.

**Comparação da etapa de geometria:** 7 de 9 capturas selecionadas antes/depois ficaram pixel a pixel idênticas. As duas diferenças restantes tiveram intensidade média por canal de **0,016** e **0,0007** em 0 a 255, compatíveis com variabilidade da captura; não indicam alteração comprovada na composição. Uma comparação ampla de 30 imagens também revelou que a foto principal de Produto pode aparecer ausente em captura realizada antes de seu carregamento assíncrono. **Fica aberta a estabilização das imagens de Produto antes do screenshot CDP.** Não aceitar correspondência pixel como substituto da revisão de mídia efetivamente carregada.



## B3/B4: letras da Rádio e eliminação de overrides mortos (18/10/2026)

- [x] [`aaddc6e`](https://github.com/cassianomangini/radioand3d/commit/aaddc6e62aa64481b20147ddda803219ca871999) isolou 23 regras de layout e animação de `RadioLyrics` em `src/features/radio/radio-lyrics.module.css`. O JSX deixou de importar o CSS Module do shell. Os estados mobile, playlist/letras, fullscreen, container query e reduced motion são selecionados pelos atributos `data-*` do DOM, sem dependência de nomes de classes CSS gerados em outros módulos. **Foram adicionados dois testes Playwright** de aparência/alternância/continuidade do áudio. [CI 39169804297](https://github.com/cassianomangini/radioand3d/actions/runs/39169804297) totalmente verde, **81 Playwright**, 18 lab, 2 dock.
- [x] [`81a6c26`](https://github.com/cassianomangini/radioand3d/commit/81a6c267424cc083016e235f7aaa9518c3d78a90) eliminou **73 declarações comprovadamente sobrepostas** por declarações posteriores de mesmo seletor e mesma condição de media/container, conservando os valores finais. Fallbacks com valores posteriores avançados foram intencionalmente preservados. [CI 39170157382](https://github.com/cassianomangini/radioand3d/actions/runs/39170157382) totalmente verde.
- [x] [`69d8ec7`](https://github.com/cassianomangini/radioand3d/commit/69d8ec7712a92a2a92bf25ee9340a28a5468453f) retirou **7 regras vazias** e 213 linhas excedentes de espaçamento do módulo legado e adicionou **dois testes Node de ownership de Letras** para impedir a reintrodução do acoplamento. [CI 39170488875](https://github.com/cassianomangini/radioand3d/actions/runs/39170488875) **integralmente verde**: lint, tipos, testes, build, CDP, **81 Playwright, 18 lab, 2 dock**.
- [x] **B4, StudioHub com ownership CSS:** [`9f6917d`](https://github.com/cassianomangini/radioand3d/commit/9f6917de43d504c5f30383411f994671c307c4c6) isolou 65 regras `studio-hub.module.css` (475 linhas), incluindo split de seletores mistas para não alterar o shell. Teste Node garante oito classes próprias e estados de rota. [CI 39178813791](https://github.com/cassianomangini/radioand3d/actions/runs/39178813791) integralmente verde: 81 Playwright, 18 lab, 2 dock.
- [x] **B4, StudioWelcome com ownership CSS:** [`1b4b946`](https://github.com/cassianomangini/radioand3d/commit/1b4b946f35d168efadef30ffd86c716ad3cbeaed) isolou 70 regras, tipografia, CTAs, responsividade e keyframe `studio-letter-in` em `studio-welcome.module.css` (551 linhas). A classe acessível `srOnly` permanece compartilhada, sem duplicação. Dois testes Node adicionais de ownership/estados. [CI 39179211032](https://github.com/cassianomangini/radioand3d/actions/runs/39179211032) **integralmente verde** com 81 Playwright, 18 lab, 2 dock.
- [x] **B4, CSS do RadioContent independente:** [`b15370f`](https://github.com/cassianomangini/radioand3d/commit/b15370f298157d2b368805d1eebf173e0df08395) moveu **229 regras** para `radio-content.module.css` (1.560 linhas), mantendo os 8 utilitários compartilhados no shell e duas pontes locais de `volumeTrigger` / `visualizer`. [`bcc1196`](https://github.com/cassianomangini/radioand3d/commit/bcc1196a701b7e04d2b222fa1e349aab5c4e102f) corrigiu dois testes novos que assumiam incorretamente uma faixa carregada. [CI 39225855957](https://github.com/cassianomangini/radioand3d/actions/runs/39225855957) **integralmente verde**: 83 Playwright, 18 laboratório e 2 dock. **30/30 PNGs do artefato visual ficaram idênticos pixel a pixel** frente à `main@e6d7c1e`.
- [x] **B4, controles e Header com CSS por domínio:** [`34e6450`](https://github.com/cassianomangini/radioand3d/commit/34e64504f55aad6831853d2b66d2f8b4fd08957c) extraiu 32 regras comuns de volume/visualizador para módulo compartilhado; [`4977a05`](https://github.com/cassianomangini/radioand3d/commit/4977a053bcf2647fe016433669d98cbdf1396811) extraiu 49 regras de Header, dividindo dez grupos de seletores mistos. [CI 39228501457](https://github.com/cassianomangini/radioand3d/actions/runs/39228501457) totalmente verde. O CSS legado tem **1.594 linhas** após a rodada.
- [x] **B4, dock flight/edge e WAAPI próprios:** [`0f76bb5`](https://github.com/cassianomangini/radioand3d/commit/0f76bb51e7194ca80dcea7a16e0f77463d9e67fe) extraiu overlay, estilo e gesto; [`8b81d39`](https://github.com/cassianomangini/radioand3d/commit/8b81d39de7eb45f2e1fa756cedadf5a30dfcf683) extraiu movimento testável; [`c021cd2`](https://github.com/cassianomangini/radioand3d/commit/c021cd2e609b980caf58375c0f7ddf2f8f7cb872) resolveu nullability TypeScript. [**CI 39233349318**](https://github.com/cassianomangini/radioand3d/actions/runs/39233349318) verde com 83 Playwright, 18 laboratório e 2 dock.
- [x] **B4, separação da UI e dos estados do shell:** Header em `site-header.tsx`, FLIP em `radio-flip-motion.ts`, modal em `use-mobile-radio-dialog.ts` e sessão do divisor em `use-radio-divider.ts`. A coordenação global de layouts e o áudio continuam no shell. [CI 39241597826](https://github.com/cassianomangini/radioand3d/actions/runs/39241597826) e [preview 39241597819](https://github.com/cassianomangini/radioand3d/actions/runs/39241597819) verdes; a aceitação estética segue separada.
- [ ] **Próximo passo B5:** medir o WebP X1 (imagem entregue sem variantes por `unoptimized`), conferir LCP, melhorar screenshot e comparação de mídia em Produtos e realizar revisão perceptual com o usuário. Nada foi alterado na direção visual nesta fase.

**Métricas verificadas na `main@69d8ec7`:** CSS do shell de **4.791 para 4.368 linhas** (parte movida, parte removida); CSS de Letras **297 linhas** e sem import do shell. O TSX orquestrador permanece em **1.738 linhas**, não está totalmente desacoplado.

**Comparação das capturas:** entre [CI 39169804297](https://github.com/cassianomangini/radioand3d/actions/runs/39169804297) e [39170157382](https://github.com/cassianomangini/radioand3d/actions/runs/39170157382), **15 de 30 capturas selecionadas ficaram byte/pixel idênticas**, incluindo Rádio fullscreen e modal mobile; as demais variaram sobretudo em estados de transição e tempo de captura. A comparação automatizada não é aceite estético e não autoriza sacrificar motion ou áudio.


## B4: extrações CSS de StudioHub e StudioWelcome (18/10/2026)

| SHA na main | Blocos isolados | CSS do shell após commit | CI |
| --- | ---: | ---: | --- |
| [`9f6917d`](https://github.com/cassianomangini/radioand3d/commit/9f6917de43d504c5f30383411f994671c307c4c6) | 65 regras de cards e responsividade | **3.944** linhas | [39178813791](https://github.com/cassianomangini/radioand3d/actions/runs/39178813791): verde |
| [`1b4b946`](https://github.com/cassianomangini/radioand3d/commit/1b4b946f35d168efadef30ffd86c716ad3cbeaed) | 70 regras de boas-vindas e reveal + 1 keyframe | **3.471** linhas | [39179211032](https://github.com/cassianomangini/radioand3d/actions/runs/39179211032): **verde**, com lint, tipos, unitários, build, CDP, 81 Playwright, 18 lab e 2 dock |

**Prova renderizada da primeira extração:** as 30 imagens Playwright foram comparadas contra a `main@69d8ec7`. Os estados estáveis do Estúdio, Rádio fullscreen, Rádio dockada, mobile e modal não revelaram desvio estrutural; cenas capturadas em instantes de Motion diferentes mostraram variação temporal, não uma aprovação estética automática. O teste de `StudioHub` de três entradas, cores, audio persistente e animação escalonada continua verde.

**Regra de progresso:** CSS principal **3.471** em vez de 4.368 linhas, porém +475 em `studio-hub.module.css` e +551 em `studio-welcome.module.css`. Não apresentar a redução do monólito como 897 linhas apagadas. CSS ainda ativo da Rádio e Header permanece no monólito, e imagem/LCP continuam pendentes.

## B5 parcial: o QA não pode salvar uma fotografia vazia (18/10/2026)

A auditoria comparativa das capturas revelou uma falha **no teste de apresentação**, não uma mudança intencional da arte do site: o carrossel de fixture técnico mostrava a mídia B selecionada, porém a imagem ainda não estava decodificada na hora do PNG. Isso também evidencia por que um CI verde sem inspeção da mídia não é garantia visual.

- [x] [`e6d7c1e`](https://github.com/cassianomangini/radioand3d/commit/e6d7c1eb34ac5eae79d9450b64d1dca5a7fae29b) em `tests/visual/studio-carousel-motion.spec.ts`: espera por `HTMLImageElement.complete` + `naturalWidth > 0` e `decode()`; a apresentação pausa **após selecionar a mídia B** para não trocar de faixa enquanto espera a imagem, preservando os testes de pausa/retomada e avanço automático.
- [x] [CI 39179656015](https://github.com/cassianomangini/radioand3d/actions/runs/39179656015) **integralmente verde**: lint, tipos, testes, build, CDP, 81 Playwright, 18 laboratório, 2 dock. O artefato final `carousel-fixture-second-photo.png` foi aberto e confirmou **a mídia B visível**, ao contrário da captura anterior vazia.
- [ ] Não confundir a correção do screenshot de fixture com a otimização de mídia real. Fotografia de Produto, LCP e carga de arte X1 permanecem em aberto até medição e revisão perceptiva.

**Marco arquitetural atualizado:** o CSS principal do shell está em **3.471 linhas**; `StudioWelcome` e `StudioHub` têm ownership próprio sem modificar o design estabelecido. O próximo domínio é `RadioContent`, com fronteiras compartilhadas do visualizador, volume e mobile.

## B4: player completo com CSS próprio (19/10/2026)

O `RadioContent` já tinha sido extraído em componente, mas suas trinta classes próprias ainda vinham do CSS monolítico. O commit [`b15370f`](https://github.com/cassianomangini/radioand3d/commit/b15370f298157d2b368805d1eebf173e0df08395) transferiu **229 regras** preservando seus contextos de `@media`, `@container`, estados do `#top` e `data-radio-surface`. As **19 regras com seletores mistos** foram divididas, deixando estilos do mini-player, dock e sistema de volume no shell. Os keyframes `playback-state-orbit` e `c1-cover-caption-enter` foram copiados para o módulo novo porque os nomes são escopados por CSS Modules.

O primeiro CI passou lint, tipos, unitários e build, mas **dois testes Playwright recém-adicionados** tentaram clicar no botão Volume enquanto ele estava corretamente desativado, pois não havia faixa publicada/carregada. **Não foi uma regressão de áudio nem uma falha de CSS.** O commit [`bcc1196`](https://github.com/cassianomangini/radioand3d/commit/bcc1196a701b7e04d2b222fa1e349aab5c4e102f) corrigiu a condição de teste: habilitação do Volume deve coincidir com a do Play; somente clicar quando houver mídia reproduzível. O [CI 39225855957](https://github.com/cassianomangini/radioand3d/actions/runs/39225855957) ficou **totalmente verde** com **83 Playwright**, 18 lab e 2 dock, além de CDP, build e verificações tradicionais.

**Paridade renderizada comprovada nesta etapa:** as 30 capturas do artefato `studio-radio-visual-review` do [CI anterior 39179656015](https://github.com/cassianomangini/radioand3d/actions/runs/39179656015) foram comparadas por Pillow/ImageChops com os 30 arquivos de [39225855957](https://github.com/cassianomangini/radioand3d/actions/runs/39225855957), em todos os viewports e estados: **30/30 idênticas pixel a pixel**. Isso comprova a invariância dessas capturas e não equivale a aceite estético ou prova sobre cada hardware real.

**Métricas reais:** o shell CSS caiu de **3.471 para 2.079 linhas**; foi criado `radio-content.module.css` com **1.560 linhas**. Parte da diferença é cópia de keyframes e `:global` de contexto, não redução absoluta de CSS. O orquestrador React segue com 1.738 linhas; Header e dock ainda precisam de ownership e testes próprios.

## B4: primitivos de áudio e Header (19/10/2026)

| SHA na main | Movimento | CSS do shell | Provas |
| --- | --- | ---: | --- |
| [`34e6450`](https://github.com/cassianomangini/radioand3d/commit/34e64504f55aad6831853d2b66d2f8b4fd08957c) | 32 regras comuns para `radio-audio-controls.module.css` (242 linhas), com pontes de DOM estáveis para volume da pocket e visualizador fullscreen | **1.861 linhas** | Lint, tipos, unitários, build, Playwright e lab passaram no run 39228019062, porém o run foi **cancelado ao atualizar a main novamente**; não registrar como CI concluído. |
| [`4977a05`](https://github.com/cassianomangini/radioand3d/commit/4977a053bcf2647fe016433669d98cbdf1396811) | 49 blocos de Header para `site-header.module.css` (346 linhas), 10 seletores mistos divididos, referências TSX e consulta DOM migradas | **1.594 linhas** | [CI 39228501457](https://github.com/cassianomangini/radioand3d/actions/runs/39228501457) **totalmente verde**: lint, tipos, unitários, build, CDP, 83 Playwright, 18 lab e 2 dock. |

**Comparação visual auditada:** 30 PNGs do run [39225855957](https://github.com/cassianomangini/radioand3d/actions/runs/39225855957) e 30 PNGs do [39228501457](https://github.com/cassianomangini/radioand3d/actions/runs/39228501457) foram comparados com `Pillow.ImageChops`, mesmas dimensões e nomes. **15/30 idênticos**. Divergências de transições a 140ms e 360ms e de entrada/saída do Estúdio mudaram principalmente por fase temporal do Motion; estados estáveis de fullscreen, dock, 390px e Home foram equivalentes. A imagem da página de Produto teve diferenças nas miniaturas ainda carregando na captura. Não atribuir as diferenças temporais automaticamente à refatoração e não usar resultados verdes como aprovação estética.

**Próximas pendências:** ownership do dock flight, eventual extração JSX do Header e redução do orquestrador; QA determinístico de miniaturas de Produto e medição LCP/qualidade WebP da arte X1; revisão perceptual final pelo usuário.

## B4: dock flight, edge e WAAPI em módulos próprios (19/10/2026)

A `main` recebeu três commits: [`0f76bb5`](https://github.com/cassianomangini/radioand3d/commit/0f76bb51e7194ca80dcea7a16e0f77463d9e67fe), [`8b81d39`](https://github.com/cassianomangini/radioand3d/commit/8b81d39de7eb45f2e1fa756cedadf5a30dfcf683) e [`c021cd2`](https://github.com/cassianomangini/radioand3d/commit/c021cd2e609b980caf58375c0f7ddf2f8f7cb872). Foram extraídos **10 blocos CSS** (um seletor misto dividido), JSX/gesto de arraste do dock com limiar de 78px, e geometria/animação WAAPI para utilitário testável (660ms, mesma curva e destino). O estado, o cancelamento, os timers, os refs de painel/navbar, foco e `RadioProvider` continuam preservados pelo shell.

**Resultado medido:** CSS legado **1.594 → 1.511 linhas**; TSX do shell **1.741 → 1.669 linhas**. Novos arquivos: `radio-dock-flight.module.css` (97 linhas), `radio-dock-flight.tsx` (77), `radio-dock-flight-motion.ts` (87). Linhas foram principalmente **movidas**, não excluídas.

**Verificação:** [CI 39232464719](https://github.com/cassianomangini/radioand3d/actions/runs/39232464719) verde para extração visual/edge. A primeira versão do helper de animação falhou no typecheck de elementos opcionais `HTMLElement | undefined`; o erro foi corrigido com `?? null` e [**CI 39233349318**](https://github.com/cassianomangini/radioand3d/actions/runs/39233349318) encerrou verde: lint, tipos, testes, build, CDP, **83 Playwright**, **18 laboratório** e **2 dock**, sem erros.

**Paridade de capturas:** comparados 30 PNGs de [39228501457](https://github.com/cassianomangini/radioand3d/actions/runs/39228501457) com 30 de [39233349318](https://github.com/cassianomangini/radioand3d/actions/runs/39233349318), com RGB/Pillow sem tolerância. **14/30 exatamente idênticos**. Entre esses estão `home-radio-docked-1440.png`, `desktop-radio-fullscreen-1760x824.png`, `mobile-390.png` e `mobile-radio-open-390x844.png`. Diferenças não exatas apareceram especialmente em capturas temporizadas de Motion e miniaturas ainda carregando em Produto. Testes reais de voo, interrupção, retorno por arraste, teclado e continuidade da música passaram. Nenhum aceite estético foi inferido.

**Aberto:** extração controlada do JSX do Header, estados do divisor/modal no shell; estabilização de todas as fotos nas capturas de Produtos, LCP/WebP do X1 e revisão estética do usuário.

## B4/B5: Header, FLIP fullscreen e mídia da página de Produto (19/10/2026)

| Main | Alteração | Prova efetiva |
| --- | --- | --- |
| [`db0ea2d`](https://github.com/cassianomangini/radioand3d/commit/db0ea2d0e42c0a300bc9fb1beadeee675b7ce992) | Remove **26 contextos `@media`/`@container`/`@supports` vazios**, extrai `SiteHeader`/menu mobile mantendo as mesmas referências de dock e navegação; testa menu e Rádio mobile. | [CI 39236389458](https://github.com/cassianomangini/radioand3d/actions/runs/39236389458) verde, com lint, tipos, unitários, build e QA renderizado executado. |
| [`3bd1fd7`](https://github.com/cassianomangini/radioand3d/commit/3bd1fd74bb3848471d649e1c4f7c9c1de667da59) | Extrai FLIP fullscreen em `radio-flip-motion.ts`, mantém geometria/timings/easing, adiciona três testes de movimento; remove `.coverFallback` e `.studioProducts`, que não tinham consumidor. | [CI 39237182602](https://github.com/cassianomangini/radioand3d/actions/runs/39237182602) e preview [39237182614](https://github.com/cassianomangini/radioand3d/actions/runs/39237182614) verdes. |
| [`2a05d81`](https://github.com/cassianomangini/radioand3d/commit/2a05d81783d731e0be116a374b89212995a05994) | QA aguarda até 9 s pelas miniaturas/variantes *visíveis* do Produto, anota mídias indisponíveis sem tratar falha externa como erro de CSS; Home decodifica X1 e registra métricas de recurso. Nenhuma alteração de UI. | [CI 39237991854](https://github.com/cassianomangini/radioand3d/actions/runs/39237991854) verde; o PNG do Produto desktop foi inspecionado com 6 miniaturas e 5 variantes preenchidas após espera. |
| [`33856a6`](https://github.com/cassianomangini/radioand3d/commit/33856a65a3b29e7d3b99d52bcb5ea938e05b66a5) | Salva explicitamente métricas de X1 e prontidão das fotos nos artefatos Playwright, sem modificar a aplicação. | [CI 39238651048](https://github.com/cassianomangini/radioand3d/actions/runs/39238651048) verde; cinco relatórios JSON em cada conjunto confirmados no ZIP. |

**Métricas conferidas:** `studio-radio-shell.module.css` **1.511 → 1.394 linhas**; `studio-radio-shell.tsx` **1.669 → 1.426 linhas**. Os arquivos vivos `site-header.tsx` (198 linhas) e `radio-flip-motion.ts` (102 linhas) passam a possuir seus domínios. O resto da redução em CSS decorre de 26 contextos vazios e dos seletores mortos, não de descarte de comportamento.

**Comparação visual independentemente reproduzida:** 30 PNGs de [39236389458](https://github.com/cassianomangini/radioand3d/actions/runs/39236389458) contra [39237182602](https://github.com/cassianomangini/radioand3d/actions/runs/39237182602) em RGB/Pillow: **16 idênticos pixel a pixel**. Entre eles Home desktop/mobile, dock de 1440, fullscreen de 1760, menu/modal mobile e Orçamento 390. Diferenças das outras imagens incluem instantes diferentes de Motion e miniaturas externas de Produto. Prova técnica de paridade dos estados estáveis, não aceite estético de Cassiano.

**B5, medição real no Chromium do CI:** X1 WebP tem **2.508 × 2.508 px**, **899.842 bytes** codificados e **900.142 bytes** transferidos. Tanto em 390px quanto em desktop 1440px recebe o arquivo inteiro, com `optimized: false`; no mobile 390px é exibido em cerca de **390 × 207px**. Evidência: cinco `home-x1-media-diagnostic.json` preservados no artefato de [CI 39238651048](https://github.com/cassianomangini/radioand3d/actions/runs/39238651048). Os tempos do runner não provam o LCP real. No mesmo CI, cinco `product-visible-media-readiness.json` mostram `allReady: true` após a espera por mídias visíveis (12 em desktop 1440/curto, seis em mobile e uma em desktop 1024). As fotos continuam oriundas da Shopee e a dependência externa segue como risco. Não alterar compressão/fidelidade visual sem avaliação.

**Pendências vivas:** B4, domínio de estado do divisor e modal, foi concluído tecnicamente. B5 precisa de LCP real, otimização de imagem sem perda de fidelidade, verificação da mídia Shopee e aceite visual humano. O ajuste óptico da pocket na navbar (03c D5) permanece aberto. Não abrir redesenho para uma refatoração.

## B4: organização concluída dos estados do divisor e do modal (19/10/2026)

**Execução na `main`:** [`3321bb5`](https://github.com/cassianomangini/radioand3d/commit/3321bb5843bce833cfc352aacad28aff570440f8) extraiu para `use-mobile-radio-dialog.ts` os estados de abertura, View Transition, `dialog.showModal`/`close`, focus-return e ciclo do modal, preservando o mesmo `RadioProvider` e um único áudio. Correções intermediárias de dependência ESLint e compartilhamento do guard de Motion ficaram em [`a9a42dd`](https://github.com/cassianomangini/radioand3d/commit/a9a42dd62e0f7044b649a4cf87cecc11be5eb121) e [`e687082`](https://github.com/cassianomangini/radioand3d/commit/e687082370a2a5ff28b8e99ad741640edde6b2bb).

[`4878b7e`](https://github.com/cassianomangini/radioand3d/commit/4878b7ec7ffc736904e4c525e539e47245dd1ab1) moveu para `use-radio-divider.ts` os 20 refs de drag, três estados locais, callbacks de ponteiro/teclado, Snap, preview, cancelamento e timer de settle. O shell segue proprietário das transições interdomínio dock/fullscreen e expõe os refs estritamente necessários. O hook não recria motor, fila ou visualizador. Corrigiu-se dependência de `customWidthRef` no efeito de resize em [`4f8423f`](https://github.com/cassianomangini/radioand3d/commit/4f8423fa2ebe28952ac84b201ee6bc7df090c31d).

**Teste real:** o cenário adicional de `pointercancel` exigiu aguardar hidratação observável antes de simular drag. [`0acd890`](https://github.com/cassianomangini/radioand3d/commit/0acd890a4ec178e8e3f66ef6b067da0d36595c68) fez o handshake por teclado, testando o rollback após alteração efetiva de largura; sem `waitForTimeout` arbitrário. Novo teste mobile exercita abertura, Escape, retorno de foco, botão de fechar e ausência de segundo áudio.

**Gates efetivamente verdes:** [CI principal 39241597826](https://github.com/cassianomangini/radioand3d/actions/runs/39241597826) com lint, TypeScript, unitários, build, CDP, 83 Playwright públicos, 18 laboratório e 2 testes de dock isolado; [preview 39241597819](https://github.com/cassianomangini/radioand3d/actions/runs/39241597819) com **15 passed e 41 skipped** segundo seleção por viewport. As tentativas anteriores falharam em ESLint, TypeScript e sincronização do teste de `pointercancel`; erros corrigidos, não ocultados.

**Paridade visual calculada independentemente:** 30 screenshots PNG do último CI verde antes da extração ([39238651048](https://github.com/cassianomangini/radioand3d/actions/runs/39238651048)) contra [39241597826](https://github.com/cassianomangini/radioand3d/actions/runs/39241597826). Comparação pixel a pixel, mesma dimensão e cores RGB via Pillow/NumPy: **16 PNGs idênticos**. Entre eles `desktop-radio-fullscreen-1760x824.png`, `home-radio-docked-1440.png`, `home-radio-medium-1440.png`, `mobile-390.png`, `mobile-radio-open-390x844.png` e `product-mobile-390.png`. As maiores diferenças são capturas temporizadas do Motion (`desktop-studio-route-enter-180ms.png` e `mobile-studio-route-transition-390x844.png`). Não atribuir divergências dinâmicas automaticamente à refatoração. A comparação mostra preservação da composição em estados estáveis, mas **não é aprovação estética**.

**Números atuais:** shell React **1.426 → 974 linhas**; novos hooks **122** (modal) e **414** (divisor) linhas; CSS permanece em **1.394 linhas**. Redução é reatribuição de responsabilidades e não eliminação equivalente de comportamento. B4 concluído tecnicamente para estados de divisor/modal. B5 e D5 seguem independentes.
