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
| [`c4b2d4a`](https://github.com/cassianomangini/radioand3d/commit/c4b2d4a5a118ec9872e46921144ceac6f90697f9) | Lógica pura de largura transferida para `radio-panel-layout.ts` e adicionados três testes unitários | [CI 39161117335](https://github.com/cassianomangini/radioand3d/actions/runs/39161117335) **em verificação nesta atualização** |

**Comparação renderizada objetiva:** artefatos `studio-radio-visual-review` do [CI baseline 39156314432](https://github.com/cassianomangini/radioand3d/actions/runs/39156314432) contra [39160064139](https://github.com/cassianomangini/radioand3d/actions/runs/39160064139): **nove capturas idênticas pixel a pixel** (split 1440/1760, mobile 390, dock, intermédio, Estúdio no mínimo, hub, Radio fullscreen, modal mobile). Após a extração da arte, **6/8 capturas selecionadas idênticas**; as duas demais diferiram muito pouco em regiões de animação (média RGB inferior a 0,025). Após extrair Home/Hub, **7/9 idênticas**, duas com média RGB inferior a 0,025. Isso apoia a preservação de UI, mas **não é aprovação estética**.

**Estado quantitativo do código `main@c4b2d4a`:** `studio-radio-shell.tsx` **1.738 linhas** (antes 2.459), `studio-radio-shell.module.css` **4.791 linhas**, e um CSS Module separado de arte com **93 linhas**. Uma parcela do CSS foi **movida**, não removida. O player, o hub, o welcome e o asset possuem ownership em arquivos próprios; o orquestrador ainda não está plenamente desacoplado. O acoplamento do CSS de `RadioLyrics` permanece.

**Pendente:** resultado final do CI de geometria, novas extrações de Header/dock, ownership do CSS de hub/player, classificação de overrides ativos, medição de LCP/nitidez do WebP, revisão do carrossel, e aceite perceptual final de Cassiano. Não chamar B4 de concluído enquanto só parte foi extraída.
