# 08V | Auditoria do CSS, shell e QA visual da CM 3D & Rádio

**Revisão:** 18/10/2026 (segunda leitura crítica do relatório do PR #34).  
**Código examinado:** [`main@23f25c3`](https://github.com/cassianomangini/radioand3d/commit/23f25c3c2193cddadd6a3e0f014ca7df2fcf5666). Os números abaixo são um retrato deste SHA, não métricas permanentes.  
**Estado:** diagnóstico estático revisado, CI da `main` e primeira execução visual do PR #34 inspecionados. Há **falhas reais de geometria** no render, mas a revisão de todos os estados/interações e a aprovação estética seguem pendentes.  
**Escopo:** Home, shell Estúdio/Rádio, CSS Module, consumidores de classes, divisor, suíte visual e CI. Não equivale a auditoria de segurança, SEO, Supabase ou todas as jornadas do produto.  
**Natureza deste PR:** exclusivamente documentação. Não corrige a interface nem altera o motor de áudio.  
**Aceite visual da Home atual:** pendente; commit e CI verde não representam aprovação estética.

## 1. Decisão executiva

A mudança enviada à `main` em 18/10 trocou a Home para `cm-home-x1-hd.webp`, centralizou o `object-position` e mudou a composição da copy: no desktop, um painel ancorado no topo e texto ao lado da imagem, inclusive no Estúdio estreito. **É diferente do PR #33, já fechado**. Prints do #33 são evidência histórica, não um diagnóstico do novo render.

Existem **dois bloqueios de evidência imediatos**:

1. O commit atual teve lint, tipos, testes gerais e build verdes, mas os passos visuais do workflow principal foram **ignorados**: o push tinha mensagem `c`, sem `[visual]`. Não existe validação renderizada atual derivada desse CI.
2. `tests/visual/home-hero-responsive.spec.ts` ainda codifica a composição anterior. A suíte **foi executada posteriormente**, no PR documental #34, mas falhou antes de avaliar essas expectativas antigas. O conflito entre teste e CSS permanece demonstrável por leitura.
3. O [run visual 39152117452](https://github.com/cassianomangini/radioand3d/actions/runs/39152117452) executou Playwright com o mesmo código da `main` e encontrou **duas falhas reproduzidas em retry**: o `scrollWidth` do Estúdio ultrapassou sua largura em desktop 1440 e 1760 curto.

Em paralelo, o shell continua concentrando **5.149 linhas de CSS** e **2.458 linhas de TSX**. Precisa de consolidação por responsabilidade, com testes antes e depois, não de novos patches de CSS no rodapé.

**Ordem:** estabelecer prova visual e resolver a divergência de contrato/teste; corrigir defeitos realmente vistos; depois eliminar CSS legado e modularizar, sempre mantendo player, rota e interações.

## 2. Rastreabilidade e o que foi realmente verificado

| Fonte | Evidência | Limite |
| --- | --- | --- |
| [Commit da nova Home](https://github.com/cassianomangini/radioand3d/commit/23f25c3c2193cddadd6a3e0f014ca7df2fcf5666) | WebP novo, troca do src da imagem, ajustes CSS de crop e posicionamento | Não prova qualidade da imagem no browser |
| [CI principal, run 39151011258](https://github.com/cassianomangini/radioand3d/actions/runs/39151011258) | `lint`, `typecheck`, testes gerais e `build`: success. `Capture visual review` e `Playwright visual diagnostics`: **skipped** | CI verde sem QA visual |
| [Workflow de dock, run 39151011224](https://github.com/cassianomangini/radioand3d/actions/runs/39151011224) | Workflow complementar verde | Não homologou a Home modificada |
| [PR #34, run 39152117452](https://github.com/cassianomangini/radioand3d/actions/runs/39152117452) | Lint, tipos, testes, build e captura: success; **Playwright: failure**. 75 testes passaram, 2 falharam e 103 foram ignorados nesse run. | Executou código da `main` em PR documental; duas falhas do hero (desktop 1440 e 1760 curto), sem aprovação visual |
| [PR #33](https://github.com/cassianomangini/radioand3d/pull/33) | Capturas antigas de dock, split e mobile | Base visual **substituída** |
| [Contrato de experiência](../../EXPERIENCE.md), [arquitetura](../../ARCHITECTURE.md), [pipeline](../../design/CM_VISUAL_RENDER_PIPELINE_V1.md) | Invariantes de produto e processo | Documentação não substitui interação/render real |
| [Histórico de 17/10](home-x1-responsive-2026-10-17.md) | Decisões e problemas da versão anterior | Marcado como histórico, não especificação vigente |

**Verificado:** código e diff na `main`, estrutura dos componentes, configurações, regras do CSS e os estados reais dos jobs. Foram inspecionadas capturas de falha desktop 1440/1760 e capturas do hero mobile 390/360, extraídas do artefato `cm-visual-diagnostics` do run 39152117452. Captura isolada não é teste de interação nem aceite.  
**Estimado por análise estática:** número de candidatos a CSS não utilizado e redefinições de seletor/propriedade. Uma sobrescrita pode ser deliberada; não é automaticamente bug.  
**Não realizado integralmente:** a suíte `pnpm visual:qa` **rodou no PR #34 e falhou**, interrompendo a inspeção completa; ainda faltam estados de dock/divisor, teste local com movimento normal e browser em aparelho físico, comparação com o mock aprovado, medidas de LCP/layout shift, a11y integral e escuta contínua. O CDP de Rádio da `main` e a captura geral de PR não substituem essas provas.

## 3. Inventário do SHA auditado

| Indicador | Valor | Classificação |
| --- | ---: | --- |
| `src/components/studio-radio/studio-radio-shell.module.css` | **5.149 linhas / 121.001 bytes** | Fato do arquivo |
| `src/components/studio-radio/studio-radio-shell.tsx` | **2.458 linhas** | Fato do arquivo |
| Regras CSS comuns / declarações | **695 / 2.558** | Contagem estática aproximada |
| `@media` / `@container` / `@keyframes` | **40 / 5 / 22** | Contagem estática |
| Grupos de seletor + propriedade + contexto com valores diferentes repetidos | **85** | Candidatos à revisão de cascata |
| Classes não referenciadas diretamente pelos consumidores inspecionados | **21** | Candidatas, não lixo confirmado |
| Blocos / declarações potencialmente órfãos | **72 / 245** | Heurística, não cobertura runtime |
| `public/images/studio/cm-home-x1-hd.webp` | **899.842 bytes** | Fonte atual |
| `public/images/studio/cm-home-x1.png` | **1.921.133 bytes** | Fonte antiga ainda versionada |

**Como reproduzir a triagem:** inspecionar todas as regras do CSS Module, agrupar seletor, propriedade e cadeia de `@media`/`@container`, contar valores distintos e confrontar as classes com as importações efetivas em JSX, inclusive `src/features/radio/radio-lyrics.tsx`. Revisar referências dinâmicas, seletores compostos e computed styles nos estados reais antes de excluir. Os totais não são exatos o bastante para servir como meta de redução de linhas.

## 4. Achados priorizados

### A01. [P0 operacional] CI não executou a revisão visual no último push

**Evidência:** [`.github/workflows/ci.yml`](https://github.com/cassianomangini/radioand3d/blob/23f25c3c2193cddadd6a3e0f014ca7df2fcf5666/.github/workflows/ci.yml) restringe capturas e Playwright a PRs ou commits com `[visual]`. O [run 39151011258](https://github.com/cassianomangini/radioand3d/actions/runs/39151011258) pulou essas etapas. A branch `main` estava **sem proteção** no momento da consulta.

**Correção proposta:** tornar obrigatório o QA apropriado para alterações visuais, com detecção por arquivos e dependências afetadas; registrar `executado / falhou / não executado` por etapa. Manter o CDP existente; não instalar um segundo sistema redundante. Se a intenção for **impedir integração**, usar branch/ruleset/check requerido ou processo pré-push definido com o usuário. **Uma Action que roda após push direto em `main` não bloqueia o commit que já entrou; no máximo detecta e exige correção ou reversão.** Não prometer prevenção sem a regra do repositório correspondente.

**Aceite:** mudança em arte, shell CSS/TSX ou teste visual executa os checks relevantes e disponibiliza screenshots rastreáveis ao SHA; resultado ignorado é explicitamente reportado, nunca celebrado como aprovado.

### A02. [P0 operacional] Teste de Home descreve uma versão anterior

**Evidência:** [`tests/visual/home-hero-responsive.spec.ts`](https://github.com/cassianomangini/radioand3d/blob/23f25c3c2193cddadd6a3e0f014ca7df2fcf5666/tests/visual/home-hero-responsive.spec.ts) exige, no Estúdio estreito, `copyLayout === "relative"`, copy abaixo da imagem e distância vertical mínima. Na [`main` atual](https://github.com/cassianomangini/radioand3d/blob/23f25c3c2193cddadd6a3e0f014ca7df2fcf5666/src/components/studio-radio/studio-radio-shell.module.css#L4950-L5110), a copy mantém `position: absolute`, `left: 52%` no Estúdio estreito e faz composição lateral. Também há divergência no split mais largo: o teste requer o início do título a partir de `40% da largura do Estúdio + 160px`, enquanto a regra geral atual usa `left: 45%` mais padding. **Estado real:** o teste não rodou no push da `main`; no PR #34 rodou, mas abortou primeiro na verificação de `scrollWidth` (A13), portanto essa asserção de composição antiga ainda não foi alcançada.

**Correção proposta:** reescrever as asserções apenas após registrar a composição que será mantida e conferi-la renderizada; cobrir split inicial, intermediário, máximo, dock, fullscreen, desktop curto, 1024 e mobile. Medir trechos efetivamente renderizados (`Range.getClientRects()` ou caixas dos spans), não apenas `getBoundingClientRect()` do `h1`. Incluir clipping, legibilidade, interseção com imagem e CTA.

**Aceite:** teste falha por palavras cortadas e colisões reais, e passa apenas no layout efetivamente aprovado. Não remover asserts para disfarçar incompatibilidade.

### A03. [P1] Quebras de H1 dependem da largura do Estúdio, não da coluna de texto

**Evidência:** `@container studio (min-width: 60rem)` aplica `white-space: nowrap` a `.studioHomePhrase`. A copy usa aproximadamente a metade direita do Estúdio e muda no dock. O limite de 60rem não demonstra, por si, que cada linha cabe.

**Correção proposta:** dimensionar H1, coluna útil, gaps e quebras conforme a área real da copy e as palavras. Aplicar `nowrap` só com espaço efetivamente suficiente; aceitar fallback intencional nos estados intermediários. Verificar separadamente os quatro grupos de frase, inclusive `do que você imagina.`.

**Captura atual:** nos screenshots de falha desktop de 1440/1760 do PR #34, o último grupo do H1 ainda não aparece **no instante da captura**. O CSS usa animações com delays por caractere; a captura pode estar no meio da entrada. **Não concluir que o texto desaparece ao fim da animação sem aguardar seu estado estável.**

**Aceite:** H1 completo e legível em estado estabilizado, sem cortar letras, invadir o X1 ou extrapolar o painel nos cinco viewports e estados do divisor. Capturas antigas do PR #33 servem apenas como alerta, não como prova atual.

### A04. [P1] Asset HD ainda sem política de crop e transferência demonstrada

**Evidência:** [Home TSX](https://github.com/cassianomangini/radioand3d/blob/23f25c3c2193cddadd6a3e0f014ca7df2fcf5666/src/components/studio-radio/studio-radio-shell.tsx#L2199-L2214) usa `next/image` com `fill`, `priority`, `sizes="100vw"` e **`unoptimized`**, apontando para o novo WebP. CSS usa `object-fit: cover` e `object-position: center`.

**Precisão técnica:** com `unoptimized`, o Next entrega o asset diretamente, sem seu `srcset` de variantes redimensionadas; **alterar apenas `sizes` não trará o ganho de download prometido por uma implementação otimizada**. Primeiro comparar arquivo fonte, dimensões/`naturalWidth`, `currentSrc`, bytes realmente transferidos e nitidez. Só depois decidir por variantes responsivas/otimização.

**Correção proposta:** revisar o enquadramento em split, dock, largura mínima, laptop e mobile, observando proporções reais da X1, posição do robô/balão e os **quatro filamentos do AMS**, sem inventar peças ou alterar geometria de referência. Medir LCP e custo de rede. Preservar o asset original autorizado.

**Aceite:** imagem nítida e fiel, sem crop acidental do assunto nem custo de mídia injustificado; revisão visual registrada sobre a imagem nova.

### A05. [P1] Cascata concorrente em CSS de 5 mil linhas

**Evidência:** [CSS Module](https://github.com/cassianomangini/radioand3d/blob/23f25c3c2193cddadd6a3e0f014ca7df2fcf5666/src/components/studio-radio/studio-radio-shell.module.css), com novas camadas que redefinem estilos antigos. Exemplos: `.siteHeader` em trechos iniciais e perto de L2243; `.radioPanel` em L282/L1116/L2837; `.studio` em L149/L2267/L3631. Há contextos válidos e sobreposições que podem ser obsoletas.

**Correção proposta:** inventariar comportamento computado por estado; definir ownership de Header, Studio Home, Hub, Radio, modal e divisor; consolidar base e variantes próximas do seu componente. Remover regras antigas **no mesmo diff** da substituição. **Proibido considerar uma nova regra ao final do arquivo como solução definitiva sem resolver a cascata anterior.**

**Aceite:** diff local compreensível, ausência de regressões perceptuais e menor duplicidade por estado. Não impor meta artificial de tamanho.

### A06. [P1] CSS sem uso aparente e importação cruzada de letras

**Evidência:** varredura das referências em `studio-radio-shell.tsx` e em [`radio-lyrics.tsx`](https://github.com/cassianomangini/radioand3d/blob/23f25c3c2193cddadd6a3e0f014ca7df2fcf5666/src/features/radio/radio-lyrics.tsx). Entre os candidatos estão `brandMark`, `brandSuffix`, `pendingNav`, `hero`, `heroCopy`, `mediaFrame`, `coverFallback`, `heroContent` e `studioProducts`.

**Cuidado importante:** `radio-lyrics.tsx` já importa **dois CSS Modules**: o do shell para `lyricsPanel/lyricsHeader/lyricsScroll` e seu próprio `radio-lyrics.module.css`. O problema não é um CSS de letra inexistente; é o acoplamento entre domínios.

**Correção proposta:** verificar todos os consumidores e estados antes de apagar seletores; onde houver ganho, transferir estilos compartilhados de letras para o módulo **já existente** ou outro dono justificado, corrigindo importações com teste de modal, scroll e sincronização. Inspecionar também `src/app/page.module.css`, aparentemente sem importador na Home atual.

**Aceite:** remoções demonstravelmente seguras. Nunca apagar CSS pelo simples fato de não haver `styles.foo` no shell principal.

### A07. [P1] Shell TSX acopla muitos domínios

**Evidência:** [`studio-radio-shell.tsx`](https://github.com/cassianomangini/radioand3d/blob/23f25c3c2193cddadd6a3e0f014ca7df2fcf5666/src/components/studio-radio/studio-radio-shell.tsx) concentra navbar, Home, hub, full player, gestos, animações, dock e rotas. Já existem extrações válidas como `radio-panel-drag.ts`, `radio-motion-spine.ts` e `radio-navbar-dock.tsx`.

**Correção proposta:** extrair por responsabilidade real, preservando a árvore estável. Separar apresentação de máquina de layout apenas quando reduzir acoplamento, sem reescrever interfaces do áudio ou adicionar abstrações sem uso.

**Invariantes:** manter **um único `RadioProvider` e o mesmo elemento `<audio>`** em `src/app/layout.tsx` / `src/features/radio/radio-provider.tsx`; nenhum remount ao navegar, mudar a divisória, entrar/sair do dock ou fullscreen. A ordem, o tempo, o volume e a faixa devem continuar.

**Aceite:** componentes com contratos claros, diffs revisáveis e teste explícito da identidade/continuidade do elemento de áudio em transições.

### A08. [P1] Valor máximo ARIA do divisor diverge do limite real

**Evidência:** [`studio-radio-shell.tsx`](https://github.com/cassianomangini/radioand3d/blob/23f25c3c2193cddadd6a3e0f014ca7df2fcf5666/src/components/studio-radio/studio-radio-shell.tsx#L2350-L2368) usa `aria-valuemax={MAX_RADIO_WIDTH}`, definido como 1120px. Porém `clampRadioWidth` restringe o máximo também por `shellWidth - MIN_STUDIO_WIDTH - RESIZE_GUTTER`. Em um exemplo com `shellWidth=1440`, isso dá **768px**, não 1120px.

**Correção proposta:** derivar o valor ARIA do mesmo cálculo do arraste; testar `min <= now <= max` em resize por ponteiro, teclado, mudança de viewport e dock. Preservar a política de limites aprovada, corrigir apenas a representação acessível.

**Aceite:** valores ARIA reproduzem a operação real e o controle continua operável por teclado.

### A09. [P1] QA visual atual é parcial mesmo quando executado

**Evidência:** [`playwright.config.ts`](https://github.com/cassianomangini/radioand3d/blob/23f25c3c2193cddadd6a3e0f014ca7df2fcf5666/playwright.config.ts) define `reducedMotion: "reduce"` por padrão e permite **1 retry no CI** para as suites públicas. Captura de estado reduzido não valida animação normal. Uma execução que passa após retry não prova ausência de instabilidade.

**Correção proposta:** manter o cenário determinístico atual, acrescentar cenários dirigidos de `no-preference`, conclusão e interrupção de motion, título/faixa longa e interação real. Reportar retries e flakiness, sem reclassificar como aprovação estética. Esperar fontes, mídia, hidratação e repouso da transição para screenshots finais; gravar, separadamente, o meio da animação.

**Aceite:** evidências por estado e viewport, com falhas/retries visíveis e captura ligada ao SHA. Baseline visual só após curadoria e aprovação do resultado.

### A10. [P2] Carrossel precisa de conferência de legenda, controles e movimento

**Evidência:** [`studio-prints-carousel.module.css`](https://github.com/cassianomangini/radioand3d/blob/23f25c3c2193cddadd6a3e0f014ca7df2fcf5666/src/components/studio-radio/studio-prints-carousel.module.css) possui legenda e transporte na área da imagem. O shell utiliza Motion e animações próprias para outras superfícies.

**Correção proposta:** testar 360/390px com legenda longa, áreas tocáveis e fotos de proporções diferentes. Confirmar cobertura `object-fit` por categoria e ownership de `transform`/`opacity`; não adicionar motor de animação para mascarar montagem inadequada.

**Aceite:** fotos com enquadramento coerente, controles separados do texto, acessibilidade e reduced-motion preservados.

### A11. [P1 documental] Histórico de 17/10 foi mantido como se fosse a Home atual

**Evidência:** [registro de Home de 17/10](home-x1-responsive-2026-10-17.md) descrevia PNG antigo, degradê, copy vertical no compacto e teste de geometria antigo; tudo isso foi substituído, em parte, no commit de 18/10.

**Correção documental neste PR:** marcar esse registro como histórico, registrar a atualização de `main` no [catálogo de referências](../../design/CM_VISUAL_REFERENCE_REGISTER_V1.md) e anotar o trabalho aberto no [checklist 08V](../08-visual-quality-evolution.md) e no [roadmap](../../ROADMAP.md). Não duplicar uma nova especificação visual de Home como se estivesse aprovada.

**Aceite:** nenhum agente usa um estado já substituído como fonte de verdade vigente.

### A12. [P1 processual] Falta separar condição técnica, defeito renderizado e decisão estética

**Risco:** detectar CSS duplicado não prova um defeito visual; por outro lado, CI verde com captura aprovada apenas pela máquina não prova fidelidade ao mock. O inverso também vale: uma regra que contradiz o teste não determina sozinha se o CSS ou o teste representa a intenção certa.

**Correção proposta:** em cada bug, registrar: `SHA / rota / viewport / estado do divisor / dados / motion / imagem / fonte / screenshot / resultado / categoria de evidência / referência aprovada / ação`. Separar: (1) leitura de código; (2) testes executados; (3) inspeção do render; (4) aceite de Cassiano.

**Aceite:** o relatório nunca reutiliza prova antiga de outra branch, nem converte `skipped` em `passed`, nem declara defeito atual a partir de render não inspecionado.

### A13. [P1 confirmado em browser] Conteúdo extrapola a largura do Estúdio no desktop

**Evidência executada:** [PR #34, CI 39152117452](https://github.com/cassianomangini/radioand3d/actions/runs/39152117452), arquivo `tests/visual/home-hero-responsive.spec.ts:37`, cenário `Studio horizontal scroll`. Em 1440px, o teste exigiu `scrollWidth <= 982` e mediu **985px**. No desktop curto 1760px, exigiu `<= 1208` e mediu **1253px**. A falha repetiu na primeira tentativa e no retry; as capturas e traces estão no artifact `cm-visual-diagnostics`. O Playwright reportou **2 falhas, 75 testes aprovados, 103 não executados/ignorados** nesse run.

**Interpretação exata:** foi demonstrado **overflow geométrico do conteúdo** no painel, não necessariamente uma barra de rolagem horizontal visível. O CSS usa `overflow-x: clip`; portanto, extrapolação pode estar sendo **cortada**. Deve-se localizar o elemento causador e inspecionar suas dimensões computadas, especialmente o H1, os `nowrap` e os elementos de animação. Não eliminar o assert apenas para obter verde.

**Leitura das capturas:** nos prints desktop do erro o quarto grupo de texto ainda está oculto durante o carregamento/animação. Nos prints mobile 390/360 o texto aparece; aos **360x800**, o CTA está fora da primeira dobra. A primeira observação **não prova corte permanente**; a segunda é uma condição de composição a avaliar com a referência e uso, não automaticamente um bug funcional.

**Aceite:** `scrollWidth` dentro do esperado e todo o texto visível após o movimento; nenhum corte do conteúdo essencial; screenshots em estado final e estados do divisor, mais QA com `no-preference` e `reduce`.

## 5. Plano de execução da frente 08V

A sequência macro permanece em [`docs/ROADMAP.md`](../../ROADMAP.md). O controle dos passos e evidências permanece em [`docs/work/08-visual-quality-evolution.md`](../08-visual-quality-evolution.md). Este relatório **não cria uma segunda fila**.

| Bloco | Entrega futura | Dependência | Saída exigida |
| --- | --- | --- | --- |
| **B0, completar evidência atual** | **Execução parcial já ocorreu em CI PR #34:** 2 falhas de overflow e screenshots. Reexecutar após diagnóstico, capturar estados do divisor e interações no último SHA da `main` | Nenhuma | Capturas finais estáveis, logs e lista de diferenças reais |
| **B1, reparar gate e suite** | A01, A02, A08 e A09; não encobrir testes incompatíveis | B0 para contrato visual | Checks executados e interpretações corretas de execução/skipped |
| **B2, corrigir Home de forma cirúrgica** | A03/A04/A13 nas divergências demonstradas, preservando as escolhas de arte | B0 e, quando aplicável, B1 | Geometria regular, composição aprovada e QA repetido |
| **B3, limpar a cascata** | A05/A06, remover código morto comprovado e reorganizar ownership de CSS | B1/B2 | Simplificação com comparações antes/depois |
| **B4, modularizar React** | A07, sem mover ou duplicar áudio e sem refatoração cosmética | B3 | Componentes menores e provas de continuidade |
| **B5, acabamento dirigido** | A10, efeito/reduced-motion, custos de mídia e a11y restante | Conforme cada caso | Fluxo, performance e capturas revisadas |

**Critério de sucesso não é ter menos de 2.000 linhas.** O alvo é poder alterar um estado sem quebrar três outros, com fonte de verdade clara e evidência renderizada.

## 6. Matriz mínima de validação

| Viewport | Estados | Inspeções essenciais |
| --- | --- | --- |
| **1440 × 900** | split padrão, intermediário, rádio no limite, dock, fullscreen | texto pintado, corte X1, CTA, resize, continuidade do player |
| **1760 × 824** | split, dock, faixa/título longos | altura curta, alinhamento e espaços úteis |
| **1024 × 768** | layout responsivo de laptop | primeira dobra, CTA, mini-player e scroll |
| **390 × 844** | mini-player, diálogo, hub e carrossel | toque, hierarquia, legibilidade e overflow |
| **360 × 800** | fluxo mobile e textos longos | quebra de linha, botões e imagens |
| **Alternâncias** | tocar/pausar, rotas, foco, teclado, motion normal/reduzido | um áudio, ARIA correto, interação sem regressões |

Checklist de coleta: fontes carregadas, imagem com `naturalWidth > 0`, estado estável, viewport/DPR registrados, elemento de áudio persistente, ausência de clipping nos spans, nenhum scroll horizontal involuntário, screenshots antes/depois no mesmo estado e resultado dos jobs de CI inspecionado. Se o mock do estado não existir ou não estiver aprovado, marcar **comparação descritiva**, nunca “pixel parity”.

## 7. Regras para não repetir a falha

1. **Fonte atual:** consultar HEAD e diff reais antes de reutilizar qualquer auditoria, captura ou teste. Histórico datado não vira contrato atual.
2. **CI por etapa:** conferir `conclusion` de captura e Playwright, não apenas o indicador verde do run. Branch `main` sem proteção não recebe gate pré-merge automático.
3. **CSS:** localizar **todas** as definições, variantes, @container, breakpoints e importadores antes de editar. Remover a regra antiga em vez de acrescentar override compensatório no fim.
4. **Teste e design:** se teste e código divergem, registrar conflito e conferir referência aprovada. Não ajustar só para passar, nem afirmar que a intenção do usuário é dedutível da implementação.
5. **Visual:** conferir imagem real, espaços para o texto, cenário e geometria da X1 com os estados do divisor. Nem build nem screenshot automático são aprovação artística.
6. **Áudio:** preservar `RadioProvider`, instância única de `<audio>`, fila, posição, volume, visualizador, atalhos, dock e navegação.
7. **Escopo:** não refatorar Rádio, Supabase, orçamento ou catálogo para resolver problema de CSS de Home. Alterações remotas/deploy exigem autorização própria.

Estas regras são vinculadas, sem criar nova fonte concorrente, por [AGENTS.md](../../../AGENTS.md), [ARCHITECTURE.md](../../ARCHITECTURE.md), [pipeline de QA](../../design/CM_VISUAL_RENDER_PIPELINE_V1.md) e [08V](../08-visual-quality-evolution.md).

## 8. Definição de pronto e pendências atuais

- [ ] **Completar** QA Playwright/render no SHA de Home em avaliação: a primeira execução no PR #34 falhou com overflow desktop; ainda faltam estados do divisor, animação estabilizada e comparação com mock.
- [ ] Resolver conflito da suíte do hero com o layout efetivamente aprovado.
- [ ] Testar texto real, crop e arte nos estados de painel relevantes.
- [ ] Tornar o gate confiável; decidir conscientemente entre push direto ou checks requeridos antes do merge.
- [ ] Corrigir ARIA do divisor com o cálculo real.
- [ ] Comprovar antes de excluir CSS potencialmente órfão.
- [ ] Consolidar CSS e extrair responsabilidades sem regressão nem remount do áudio.
- [ ] Avaliar carrossel, motion normal/reduzido e custo de mídia.
- [ ] Registrar aprovação de Cassiano para direção visual final, quando houver modificação perceptual.

**Situação após este PR:** documentação corrigida; as ações de engenharia e a inspeção visual da Home nova continuam pendentes. O relatório é uma análise técnica revisada, **não uma certificação de qualidade do site**.

## 8.1. Correção posterior do detector de arquivos em PR

O gatilho por arquivos foi refinado em [`43bcd26`](https://github.com/cassianomangini/radioand3d/commit/43bcd265274c107d373496c47419d0e416f3a224): para a Action executada em `pull_request`, o comparativo usa o **primeiro pai do merge sintético que o próprio CI está testando** (`HEAD^1`), não o `base.sha` do evento, que pode permanecer defasado enquanto a PR está aberta. A falha anterior fazia uma PR somente de documentação parecer modificar `tests/visual` devido a novos commits na `main`, acionando testes visuais indevidamente. Em `push`, o comparativo continua usando `event.before`. A [execução documental 39156230892](https://github.com/cassianomangini/radioand3d/actions/runs/39156230892) confirmou a correção: lint, tipos, testes e build passaram; captura visual, Playwright e coleta de imagens ficaram **skipped de forma justificada** porque a PR só muda documentação. Os caminhos são inspecionados e a seleção não depende da mensagem de commit.

O teste de overflow móvel do hub também motivou [`ddd0ded`](https://github.com/cassianomangini/radioand3d/commit/ddd0ded5182b1c6975cc53513efb376eae433d36): no mobile, `overflow-x: clip; overflow-y: visible` é aplicado somente ao hub `/studio`, sem container aninhado, para impedir que a entrada horizontal dos cards do Motion aumente a largura do documento enquanto o scroll vertical continua livre. A prova integrada desse ajuste ainda depende do [CI 39156314432](https://github.com/cassianomangini/radioand3d/actions/runs/39156314432) neste registro. Não ocultar falha visual permanente com retries.

Uma execução anterior da PR documental ([run 39155820555](https://github.com/cassianomangini/radioand3d/actions/runs/39155820555)) revelou um **overflow móvel transitório de 30px** no teste `impeccable-a11y.spec.ts`, enquanto a execução correspondente da `main` passou. Não declarar regressão permanente sem reproduzir o mesmo cenário após hidratação, imagens e animação estabilizadas. O teste tem de continuar detectando overflow persistente em vez de afrouxar a asserção.

## 9. Execução iniciada na main (18/10/2026)

**Observação:** as seções anteriores auditam o estado original `main@23f25c3`, anterior aos commits abaixo. Os diagnósticos históricos não se tornam automaticamente problemas atuais após a correção.

| Commit | Trabalho efetivamente enviado à main | Validação observada |
| --- | --- | --- |
| [`0bcfd5b`](https://github.com/cassianomangini/radioand3d/commit/0bcfd5b5dd2003d4ac2820d086ae35f72e478275) | Contenção do H1 na largura real da copy e do dock; teste reescrito com medidas de letras/estados; animação desabilitada sob movimento reduzido; `aria-valuemax` calculado pelo limite do divisor | [CI 39154733338](https://github.com/cassianomangini/radioand3d/actions/runs/39154733338): lint, tipos, testes, build, capturas/CDP, **77 Playwright**, 18 testes do lab e 2 do dock, todos verdes |
| [`b792336`](https://github.com/cassianomangini/radioand3d/commit/b792336c4eec4973debd555f2ebf186c08f5dc57) | Gatilho de QA visual por arquivos alterados (não depende apenas de `[visual]`) e ampliação do orçamento de captura CLI | [CI 39155135852](https://github.com/cassianomangini/radioand3d/actions/runs/39155135852): gatilho, lint, tipos, build, Playwright e CDP verdes |
| [`56599fc`](https://github.com/cassianomangini/radioand3d/commit/56599fc3a42e6f9e94a5d4af58a464fa91d33187) | Remoção de **72 blocos CSS órfãos**, previamente triados contra os dois únicos consumidores do módulo; redução de **5.161 para 4.831 linhas**; teste pontual de motion normal e pipeline de screenshots estáveis via Playwright | [CI 39155551092](https://github.com/cassianomangini/radioand3d/actions/runs/39155551092): lint/tipos/testes/build verdes, **falha na inicialização fria do Chromium CDP**, antes do novo teste visual |
| [`32be6b6`](https://github.com/cassianomangini/radioand3d/commit/32be6b6e04e3084a0d92b450426c24188dc9d7b8) | Inicialização robusta do Chrome em runner frio, tratamento de diagnóstico e captura de Home estabilizada a partir do Playwright | [CI 39155705089](https://github.com/cassianomangini/radioand3d/actions/runs/39155705089): **sucesso integral**. Lint, tipos, testes, build, CDP, **79 Playwright (inclui 2 cenários de motion normal)**, 18 testes de lab e 2 de dock verdes, sem falhas |

**Revisão humana dos renders:** foram inspecionadas capturas Playwright geradas pelo commit `0bcfd5b` para split desktop 1440, desktop curto 1760, dock, Rádio intermediária e Rádio máxima, além de screenshots mobile. O H1 ficou completo nos estados inspeccionados e os testes objetivos passaram. **Isso é autorrevisão técnica, não aprovação estética de Cassiano.**

**Problema de captura resolvido:** os PNGs antigos do Chrome CLI continuaram mostrando o H1 no meio da animação, mesmo com orçamento maior. Os PNGs de apresentação agora são **copiados dos testes Playwright após fontes/imagens carregadas e animação concluída**. O [CI 39155705089](https://github.com/cassianomangini/radioand3d/actions/runs/39155705089) comprovou execução da captura CDP e coleta de imagens completas sem falha. O artifact `studio-radio-visual-review` inclui split, dock, Médio, Estúdio mínimo e mobile.

**Autorreview renderizado atualizado:** inspeção das capturas do CI na `main@32be6b6` confirmou H1 completo em split 1440 e dock e enquadramento sem corte de texto nos estados aferidos. **A direção artística final não foi aprovada pelo usuário por este teste.**

**Trabalho ainda aberto:** reduzir redundâncias entre regras **ainda em uso**, modularizar CSS por domínio, extrair o shell React de 2.458 linhas, medir imagem/LCP, rever carrossel e obter aprovação estética do usuário. O CDP e o QA de motion normal já passaram; não marcar B3/B4/B5 como concluídos apenas porque 330 linhas de CSS foram apagadas.

## 10. B4: modularização real do shell e evidências

A primeira revisão deste relatório mapeou 2.458 linhas de TSX e 5.149 linhas de CSS **na base antiga**. O código evoluiu; não reutilizar esses números como estado atual.

| Commit em `main` | Mudança estrutural | Resultado real |
| --- | --- | --- |
| [`d2c9cdb`](https://github.com/cassianomangini/radioand3d/commit/d2c9cdb8c65df465ffac5ca3f397d7c3b4641c0e) | Extração de `RadioContent` para `radio-content.tsx` (528 linhas), tipos de transição para `radio-view-transition.ts`; mesmo DOM e mesmo provider | Falhou primeiro em lint por import ausente do visualizador usado no dock, corrigido no commit seguinte |
| [`6b515a0`](https://github.com/cassianomangini/radioand3d/commit/6b515a040226bbe2ea94389f62bccb8f1e3c6d98) | Import do `RadioVisualizer` mantido no shell para a animação da navbar | Lint, tipos, testes e build verdes; CDP registrou animações ainda em andamento após janela de 1.280ms |
| [`ca4c1f7`](https://github.com/cassianomangini/radioand3d/commit/ca4c1f7e2a51057017f967ef13f14d7420e77940) | Espera CDP baseada em estado real, até 6 segundos, sem enfraquecer `runningLayoutAnimations === 0` e identidade do `audio` | [CI 39160064139](https://github.com/cassianomangini/radioand3d/actions/runs/39160064139): lint, tipos, testes, build, CDP e visual Playwright verdes |
| [`5a50bcd`](https://github.com/cassianomangini/radioand3d/commit/5a50bcd012d675fb7207fd04b076e3ed390332dd) | Extração do asset e 10 regras de `studioHomeArt` para `studio-home-art.tsx` e `studio-home-art.module.css` | [CI 39160412327](https://github.com/cassianomangini/radioand3d/actions/runs/39160412327) verde |
| [`2eb4141`](https://github.com/cassianomangini/radioand3d/commit/2eb41413aa4206355cde869320e9e956401763a8) | Extração de `StudioWelcome` (103 linhas) e `StudioHub` (124 linhas) do shell; Motion, HTML e callbacks preservados | [CI 39160755783](https://github.com/cassianomangini/radioand3d/actions/runs/39160755783) verde |
| [`c4b2d4a`](https://github.com/cassianomangini/radioand3d/commit/c4b2d4a5a118ec9872e46921144ceac6f90697f9) | Lógica pura de largura transferida para `radio-panel-layout.ts` e adicionados três testes unitários | [CI 39161117335](https://github.com/cassianomangini/radioand3d/actions/runs/39161117335): lint, tipos e testes passaram; build falhou uma vez no Turbopack Google font. No retry, build/visual passaram mas dev lab usou cache compartilhado e falhou pelo mesmo motivo. Corrigido no commit seguinte. |
| [`48722be`](https://github.com/cassianomangini/radioand3d/commit/48722bea8b792fd6700fdff1c21979a871623209) | Diretório `.next-visual-lab` isolado para `next dev` na CI, sem mudar produção | [CI 39161703555](https://github.com/cassianomangini/radioand3d/actions/runs/39161703555) **totalmente verde**: lint, tipos, unitários, build, CDP, 79 Playwright, 18 lab e 2 dock. |

**Comparação renderizada objetiva:** artefatos `studio-radio-visual-review` do [CI baseline 39156314432](https://github.com/cassianomangini/radioand3d/actions/runs/39156314432) contra [39160064139](https://github.com/cassianomangini/radioand3d/actions/runs/39160064139): **nove capturas idênticas pixel a pixel** (split 1440/1760, mobile 390, dock, intermédio, Estúdio no mínimo, hub, Radio fullscreen, modal mobile). Após a extração da arte, **6/8 capturas selecionadas idênticas**; as duas demais diferiram muito pouco em regiões de animação (média RGB inferior a 0,025). Após extrair Home/Hub, **7/9 idênticas**, duas com média RGB inferior a 0,025. Isso apoia a preservação de UI, mas **não é aprovação estética**.

**Estado quantitativo do código `main@c4b2d4a`:** `studio-radio-shell.tsx` **1.738 linhas** (antes 2.459), `studio-radio-shell.module.css` **4.791 linhas**, e um CSS Module separado de arte com **93 linhas**. Uma parcela do CSS foi **movida**, não removida. O player, o hub, o welcome e o asset possuem ownership em arquivos próprios; o orquestrador ainda não está plenamente desacoplado. O acoplamento do CSS de `RadioLyrics` permanece.

**Pendente:** novas extrações de Header/dock, ownership do CSS de hub/player, classificação de overrides ativos, estabilização de screenshot das imagens de Produto, medição de LCP/nitidez do WebP, revisão do carrossel e aceite perceptual final do usuário. O CI da geometria já foi revalidado após separar o cache de build/dev. Não chamar B4 de concluído enquanto só parte foi extraída.

## B4, estabilização de CI após extrações (18/10/2026)

A [Action 39161117335](https://github.com/cassianomangini/radioand3d/actions/runs/39161117335) da extração de geometria foi repetida: na primeira execução, `next build` encontrou falha de resolução do font loader interno do Turbopack; na segunda, **build, 79 Playwright e CDP passaram**, mas o dev lab exibiu a mesma falha interna de Outfit ao rodar `pnpm dev` reutilizando o diretório de saída da compilação anterior. Em [`48722be`](https://github.com/cassianomangini/radioand3d/commit/48722bea8b792fd6700fdff1c21979a871623209), `next.config.ts` ganhou o `distDir` isolado `.next-visual-lab` ativado **somente** por `CM_VISUAL_LAB_QA=1`, opção aplicada ao comando de dev lab do CI. O diretório temporário também é ignorado pelo Git.

O [CI 39161703555](https://github.com/cassianomangini/radioand3d/actions/runs/39161703555) comprovou todas as etapas: lint, tipos, testes de unidade, build, CDP, **79 Playwright**, **18 laboratório** e **2 dock** sem falha. Houve também comparação de nove capturas representativas contra a etapa anterior: **7 idênticas**, duas diferenças ínfimas e nenhuma diferença estrutural confirmada. A geometria e o processo de QA da fase B4 estão validados; **a limpeza do CSS ativo, o acoplamento residual do Header/dock/lyrics, a análise de carregamento da mídia de Produtos e o aceite visual seguem abertos**.


## 11. Continuação B3/B4: ownership de Lyrics e depuração da cascata (18/10)

**Base agora verificada:** [`main@69d8ec7`](https://github.com/cassianomangini/radioand3d/commit/69d8ec7712a92a2a92bf25ee9340a28a5468453f), substituindo as métricas históricas do começo do documento. Este PR continua sendo **somente documentação**; os commits de CSS/React/testes estão na `main`.

| Código | Mudança implementada | Evidência executada |
| --- | --- | --- |
| [`aaddc6e`](https://github.com/cassianomangini/radioand3d/commit/aaddc6e62aa64481b20147ddda803219ca871999) | Move 23 regras e a animação de Lyrics para `radio-lyrics.module.css`; troca `shellStyles` por `styles` em `radio-lyrics.tsx`; divide regras mistas da playlist e mantém no shell somente as classes da playlist. Adiciona Playwright de Letras mobile/fullscreen. | [CI 39169804297](https://github.com/cassianomangini/radioand3d/actions/runs/39169804297): lint/tipos/testes/build/CDP, **81 Playwright**, 18 lab e 2 dock verdes |
| [`81a6c26`](https://github.com/cassianomangini/radioand3d/commit/81a6c267424cc083016e235f7aaa9518c3d78a90) | Remove 73 declarações previamente sobrepostas em contextos idênticos. Seleção conservadora: mesmo seletor, mesma cadeia de at-rules, declaração posterior presente e com valor simples/suportado; nenhum `!important`. | [CI 39170157382](https://github.com/cassianomangini/radioand3d/actions/runs/39170157382) integralmente verde |
| [`69d8ec7`](https://github.com/cassianomangini/radioand3d/commit/69d8ec7712a92a2a92bf25ee9340a28a5468453f) | Remove 7 blocos CSS vazios e 213 linhas extras de espaçamento; acrescenta `tests/radio-lyrics-css-ownership.test.mjs`, com dois testes que impedem restaurar acoplamento `RadioLyrics` → shell. | [CI 39170488875](https://github.com/cassianomangini/radioand3d/actions/runs/39170488875) verde: 81 Playwright, 18 lab, 2 dock e checks tradicionais |

**Prova visual:** o fullscreen desktop de Rádio e o diálogo mobile antes/depois da extração de Lyrics ficaram pixel a pixel idênticos nos artefatos comparados. Na limpeza das declarações, **15/30 screenshots** foram idênticos (incluindo estados estáveis da Rádio, Home dockada, mobile e Produto); diferenças restantes concentradas em cenas de Motion capturadas em instantes diferentes. Os testes de letras mediram `display/flex/grid/overflow` reais no navegador e o retorno para a playlist sem duplicar o elemento `audio`.

**Número de linhas deve ser interpretado corretamente:** o arquivo `studio-radio-shell.module.css` está com **4.368 linhas**, contra 4.791 na etapa anterior. O arquivo `radio-lyrics.module.css` cresceu para **297 linhas**, pois recebe regras válidas que antes estavam no shell. Parte da redução no arquivo principal é migração, e 213 linhas são somente espaçamento. O ganho real está em reduzir acoplamento e 73 propriedades sobrepostas, não em perseguir uma contagem artificial.

**Continuidade do trabalho:** preparar extrações do CSS de StudioHub e RadioContent, analisando seletores compartilhados e fallback de media/container; concluir revisão de mídias e fluxo dos produtos. Não criar outro player ou mudar arte, tipografia, motion e áudio para satisfazer a refatoração. Os testes garantem comportamentos técnicos, não aprovação artística final.

## 12. B4: CSS do StudioHub e identidade Home em módulos independentes

A etapa começou na `main@69d8ec7`, após a retirada de declarações sobrescritas, e **não altera o design aprovado**. O CSS do shell foi dividido por componente, sem transferir ownership do player ou usar novos assets.

- [`9f6917de43d5`](https://github.com/cassianomangini/radioand3d/commit/9f6917de43d504c5f30383411f994671c307c4c6) moveu **65 regras** de `studioDetailRail`, `studioDetailCard`, `studioCard*` e foto do orçamento do shell para `studio-hub.module.css` (**475 linhas**), alterou apenas o import do `StudioHub` e introduziu `tests/studio-hub-css-ownership.test.mjs`. Seletores mistos de route header e reduced motion foram divididos sem apagar regras de outros domínios. Contextos do `#studio` agora se referem ao ID/atributos reais, sem dependência de hashes de módulos vizinhos. Shell reduzido de **4.368 para 3.944 linhas**. [CI 39178813791](https://github.com/cassianomangini/radioand3d/actions/runs/39178813791) verde: lint, tipos, testes, build, CDP, **81 Playwright, 18 lab, 2 dock**.
- [`1b4b946f35d1`](https://github.com/cassianomangini/radioand3d/commit/1b4b946f35d168efadef30ffd86c716ad3cbeaed) moveu **70 regras** de `StudioWelcome`, incluindo typography/CTA, condições mobile, desktop, container queries e keyframe `studio-letter-in`, para `studio-welcome.module.css` (**551 linhas**). `srOnly` continua importado do shell como utilitário existente. Seletores que cruzavam `.site` ou `.studio` usam agora `:global([id="top"][data-radio-docked])` e `:global([id="studio"][data-studio-route])`. Foram adicionados dois testes Node. Shell reduzido para **3.471 linhas**. [CI 39179211032](https://github.com/cassianomangini/radioand3d/actions/runs/39179211032) **totalmente verde**, com lint, tipos, unitários, build, CDP, 81 Playwright, 18 testes do laboratório e 2 dock.

**Comparação renderizada independente:** entre os artefatos de [39170488875](https://github.com/cassianomangini/radioand3d/actions/runs/39170488875) e [39178813791](https://github.com/cassianomangini/radioand3d/actions/runs/39178813791), 30 capturas foram confrontadas com Pillow no mesmo viewport e estado: **15 ficaram idênticas em pixels**; telas estáveis do hub `/studio` variaram no máximo pontualmente e cenários de entrada/saída tiveram divergências temporais porque a animação foi fotografada em instantes diferentes. Os testes do hub e continuidade do player passaram. Não declarar paridade de Motion em milissegundos ou aceite visual final somente com esses artefatos.

**Pendências:** separar CSS do `RadioContent` sem quebrar as classes de volume/visualizador compartilhadas com o shell; separar Header/dock por ownership; medir recursos de mídia, LCP e rever catálogo. O QA de Welcome foi confirmado e a comparação visual de 30 capturas da etapa identificou uma imagem B ausente no fixture por timing de decodificação, tratada no commit seguinte.

### 12.1. QA de mídia de carrossel verificado

O PNG `carousel-fixture-second-photo.png` da execução [39179211032](https://github.com/cassianomangini/radioand3d/actions/runs/39179211032) estava **sem fotografia**, apesar do título `Mídia B` e dos botões renderizados. A captura do estado anterior continha a imagem. Este é um problema de sincronização/observabilidade do teste de fixture (o atributo de mídia ativa muda antes de `<img>` carregar/decodificar), **não evidência de regressão causada pela extração do CSS de Welcome**.

[`e6d7c1e`](https://github.com/cassianomangini/radioand3d/commit/e6d7c1eb34ac5eae79d9450b64d1dca5a7fae29b) introduziu verificação explícita de `complete`, `naturalWidth > 0` e `decode()` para a primeira e segunda imagens, congelando o slide B antes de esperar pela mídia e mantendo a prova de avanço, pausa e retomada. [CI 39179656015](https://github.com/cassianomangini/radioand3d/actions/runs/39179656015) **sucesso integral** com 81 Playwright, 18 lab e 2 dock. Foi inspecionado o novo `carousel-fixture-second-photo.png`: a mídia B aparece corretamente, sem o quadro preto que passava despercebido. É um controle de QA, não alteração do carrossel público.

**Leitura das comparações:** `main@1b4b946` tem 14 de 30 snapshots idênticos em relação a `main@9f6917d`. As diferenças temporais no Motion não foram classificadas como regressão por limiar de pixels; o quadro ausente do fixture foi identificado e tratado individualmente. O usuário não aprovou esteticamente os layouts nesta etapa.

## 13. B4: RadioContent CSS independente e contrato completo de visual/aúdio (19/10)

**Base do ciclo:** `main@e6d7c1e`; HEAD após correção: [`main@bcc1196`](https://github.com/cassianomangini/radioand3d/commit/bcc1196a701b7e04d2b222fa1e349aab5c4e102f). O código da aplicação está na `main`, este PR continua sendo exclusivamente documental.

| Código | Alterações | Evidência |
| --- | --- | --- |
| [`b15370f`](https://github.com/cassianomangini/radioand3d/commit/b15370f298157d2b368805d1eebf173e0df08395) | Migração de 229 blocos CSS do full player, 19 regras mistas divididas, 30 classes exclusivas. Novos `radio-content.module.css` e testes `radio-content-css-ownership.test.mjs` + `radio-content-layout.spec.ts`; import de CSS novo em `RadioContent`. Ponte compartilhada para volume/visualizador, 2 keyframes mantidos em namespace local, 10 condições media/container preservadas. | [Run 39225105846](https://github.com/cassianomangini/radioand3d/actions/runs/39225105846): lint, tipos, testes e build passaram; 81 Playwright passaram e 2 **testes novos** falharam por tentar clicar em Volume desativado em Rádio sem músicas publicadas. |
| [`bcc1196`](https://github.com/cassianomangini/radioand3d/commit/bcc1196a701b7e04d2b222fa1e349aab5c4e102f) | Condição dos dois testes ajustada para refletir o contrato do produto: sem mídia, Play e Volume ficam indisponíveis. Só verificar popover via clique quando houver faixa reproduzível. | [Run 39225855957](https://github.com/cassianomangini/radioand3d/actions/runs/39225855957): **verde total**, com lint, TypeScript, unitários, build, CDP, 83 Playwright, 18 laboratório visual e 2 dock. |

**Comparação visual:** arquivo `studio-radio-visual-review` do run 39179656015 versus o mesmo artefato do 39225855957: 30 nomes comuns, resoluções iguais, **todos os 30 PNGs idênticos pixel a pixel**, incluindo estado desktop 1440/1760, foco/fullscreen/retorno da Rádio, dock, Home, mobile 390, diálogo mobile, hub, Produtos, orçamentos e transições temporizadas. Comparação por Pillow `ImageChops.difference`, sem tolerância. Testes de continuidade do `HTMLAudioElement` e navegação também passaram.

**Estado CSS ao fim:** `studio-radio-shell.module.css` com **2.079 linhas** (contra 3.471 na base), `radio-content.module.css` com **1.560 linhas**. Os oito estilos compartilhados (`srOnly`, `volumeMenu`, `volumeTrigger`, `volumePopover`, `muteButton`, `volumeSlider`, `volumeLevel`, `visualizer`) continuam importados do shell pelo full player, deliberadamente, para evitar duplicação do controle que a versão pocket reutiliza. Os elementos Volume e Visualizador recebem simultaneamente suas classes compartilhadas e locais. A redução do shell não é eliminação equivalente do CSS total.

**Pendente:** criar um domínio de styles para o mini-player/controles compartilhados com fonte única; separar Header/dock e orquestração responsiva ainda no shell; preservar CSS global dos view transitions; medir WebP X1, LCP e otimização de mídia do catálogo. Nenhuma aprovação estética foi presumida.

## 14. B4, volume/visualizador compartilhados e Header CSS extraído (19/10/2026)

**Base:** `main@bcc1196`. **Head verificado:** [`main@4977a05`](https://github.com/cassianomangini/radioand3d/commit/4977a053bcf2647fe016433669d98cbdf1396811). Este PR segue exclusivamente documental; todos os arquivos de aplicação e testes estão na `main`.

| Commit | Implementação aplicada | Prova |
| --- | --- | --- |
| [`34e6450`](https://github.com/cassianomangini/radioand3d/commit/34e64504f55aad6831853d2b66d2f8b4fd08957c) | Remove do shell 32 regras comuns de `volumeMenu`, `volumeTrigger`, `volumePopover`, `muteButton`, `volumeSlider`, `volumeLevel` e `visualizer`. Cria `radio-audio-controls.module.css` (242 linhas) consumido por Rádio completa e pocket; preserva regras específicas de fullscreen e pocket via atributos estáveis. Adiciona dois testes Node de ownership e atualiza os testes antigos. | [Run 39228019062](https://github.com/cassianomangini/radioand3d/actions/runs/39228019062): lint, tipos, unitários, build, Playwright e lab executados com sucesso; workflow cancelado antes da publicação final dos artefatos devido ao commit seguinte. A validação definitiva desta mudança está no run do commit seguinte. |
| [`4977a05`](https://github.com/cassianomangini/radioand3d/commit/4977a053bcf2647fe016433669d98cbdf1396811) | Move 49 regras de Header (branding, navegação desktop/mobile, ícones sociais, menu e estados `data-radio-*`) para `site-header.module.css` (346 linhas); separa dez seletores mistos sem apagar regras de shell/divisor. Troca as importações de classes e o seletor de consulta do header no TSX. Acrescenta dois testes Node de ownership. | [Run 39228501457](https://github.com/cassianomangini/radioand3d/actions/runs/39228501457): **verde total**, lint, tipos, unitários, build, CDP, **83 Playwright**, **18 lab** e **2 dock**, nenhum erro de validação. |

**Leitura das capturas reais:** foram comparadas por Pillow 30 imagens antes/depois nas mesmas resoluções, incluindo desktop 1440 e 1760, rádio focus/fullscreen/dock, Home, mobile 390 e páginas do Estúdio. **15 idênticas**; entre as 15 diferentes, as maiores eram capturas cronometradas de Motion (ex.: fullscreen entrando a 140ms e entrada do Studio aos 520ms), que não representam o mesmo instante visual entre runs. As diferenças das duas capturas de foco da Rádio afetaram apenas pequenas áreas de glifos do título da Home (~0,2% dos pixels), sem alteração estrutural observável. As miniaturas da página de Produto renderizaram em estágios diferentes de decodificação. Capturas estáveis de Rádio fullscreen, Home dockada, modal mobile, página mobile e desktop normal permaneceram idênticas. Nenhuma comparação equivale a aceite final de design.

**Indicadores:** `studio-radio-shell.module.css` caiu de **2.079 para 1.594 linhas**; módulos novos ganharam 242 + 346 linhas. O ganho prioritário é eliminar dependências de estilo entre domínios e reduzir sobreposições, não contar apenas linhas. O `studio-radio-shell.tsx` permanece com **1.738 linhas**.

**Trabalho seguinte:** separar a animação dock flight e seus seletores do shell, mantendo continuidade do `RadioProvider`; eventualmente tirar markup do Header do orquestrador; estabilizar thumbnails de Produto em testes e medir LCP/asset X1. Não declarar B4/B5 inteiramente encerrados.

## 15. B4, extração de dock flight e WAAPI (19/10/2026)

Base `main@4977a05`; HEAD final [`main@c021cd2`](https://github.com/cassianomangini/radioand3d/commit/c021cd2e609b980caf58375c0f7ddf2f8f7cb872). **PR #34 somente documental**. Os commits de aplicação estão na `main`.

| Commit | Implementação e limite de alteração | Evidência |
| --- | --- | --- |
| [`0f76bb5`](https://github.com/cassianomangini/radioand3d/commit/0f76bb51e7194ca80dcea7a16e0f77463d9e67fe) | Move 10 blocos CSS do voo e do edge para módulo próprio e divide 1 seletor misto; cria componentes `RadioDockFlight` e `RadioDockRestoreEdge` com a mesma estrutura de DOM, limiar 78px e teclas de restauração. | [CI 39232464719](https://github.com/cassianomangini/radioand3d/actions/runs/39232464719): sucesso total, inclusive teste real de estilo CSS no edge. |
| [`8b81d39`](https://github.com/cassianomangini/radioand3d/commit/8b81d39de7eb45f2e1fa756cedadf5a30dfcf683) | Extrai funções `getRadioDockFlightKeyframes`, `getRadioDockNavShift` e `startRadioDockWaapi` (660ms), com 3 testes unitários. O shell retém o controle de cancelamento e o mesmo player. | Primeiro CI falhou na nullability estrita: parâmetro opcional `HTMLElement | undefined` não era aceito como `HTMLElement | null`. |
| [`c021cd2`](https://github.com/cassianomangini/radioand3d/commit/c021cd2e609b980caf58375c0f7ddf2f8f7cb872) | Corrige as chamadas com `nav ?? null` e `header ?? null` sem modificar movimentos. | [**CI 39233349318**](https://github.com/cassianomangini/radioand3d/actions/runs/39233349318) verde: lint, tipos, testes, build, CDP, **83 Playwright**, **18 lab** e **2 dock**. |

**QA visual verificável:** 30 arquivos PNG correspondentes do run 39228501457 antes e 39233349318 depois foram comparados em RGB por `Pillow.ImageChops`: **14 totalmente idênticos**, incluindo Home dockada (1440), Rádio fullscreen (1760), abertura mobile (390) e mini mobile. Entre os demais estão diferenças de tempo de Motion (principalmente 140ms e 360ms) e carregamento da mídia em Produto. Não atribuir automaticamente todos os pixels diferentes ao código modificado; o contrato testado de comportamento está verde, mas a experiência ainda exige aprovação visual humana.

**Métricas:** shell CSS **1.511 linhas**; shell React **1.669 linhas**. São extrações conservadoras, não reescrita de layout ou criação de player. Próximos pontos de dívida: markup do Header, coordenação de modal/divisor, CSS de View Transition, estabilização de thumbnails e LCP da arte principal X1.
