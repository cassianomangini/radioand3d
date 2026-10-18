# 08V | Auditoria do CSS, shell e QA visual da CM 3D & Rádio

**Revisão:** 18/10/2026 (segunda leitura crítica do relatório do PR #34).  
**Código examinado:** [`main@23f25c3`](https://github.com/cassianomangini/radioand3d/commit/23f25c3c2193cddadd6a3e0f014ca7df2fcf5666). Os números abaixo são um retrato deste SHA, não métricas permanentes.  
**Estado:** diagnóstico estático revisado e CI conferido; **sem execução ou inspeção renderizada da Home nesse SHA**.  
**Escopo:** Home, shell Estúdio/Rádio, CSS Module, consumidores de classes, divisor, suíte visual e CI. Não equivale a auditoria de segurança, SEO, Supabase ou todas as jornadas do produto.  
**Natureza deste PR:** exclusivamente documentação. Não corrige a interface nem altera o motor de áudio.  
**Aceite visual da Home atual:** pendente; commit e CI verde não representam aprovação estética.

## 1. Decisão executiva

A mudança enviada à `main` em 18/10 trocou a Home para `cm-home-x1-hd.webp`, centralizou o `object-position` e mudou a composição da copy: no desktop, um painel ancorado no topo e texto ao lado da imagem, inclusive no Estúdio estreito. **É diferente do PR #33, já fechado**. Prints do #33 são evidência histórica, não um diagnóstico do novo render.

Existem **dois bloqueios de evidência imediatos**:

1. O commit atual teve lint, tipos, testes gerais e build verdes, mas os passos visuais do workflow principal foram **ignorados**: o push tinha mensagem `c`, sem `[visual]`. Não existe validação renderizada atual derivada desse CI.
2. `tests/visual/home-hero-responsive.spec.ts` ainda codifica a composição anterior. A mudança de CSS não atualizou o teste; se a suíte visual for executada, suas expectativas entram em conflito com a implementação atual. Isso ainda não é resultado de teste executado, e sim contradição verificável por leitura.

Em paralelo, o shell continua concentrando **5.149 linhas de CSS** e **2.458 linhas de TSX**. Precisa de consolidação por responsabilidade, com testes antes e depois, não de novos patches de CSS no rodapé.

**Ordem:** estabelecer prova visual e resolver a divergência de contrato/teste; corrigir defeitos realmente vistos; depois eliminar CSS legado e modularizar, sempre mantendo player, rota e interações.

## 2. Rastreabilidade e o que foi realmente verificado

| Fonte | Evidência | Limite |
| --- | --- | --- |
| [Commit da nova Home](https://github.com/cassianomangini/radioand3d/commit/23f25c3c2193cddadd6a3e0f014ca7df2fcf5666) | WebP novo, troca do src da imagem, ajustes CSS de crop e posicionamento | Não prova qualidade da imagem no browser |
| [CI principal, run 39151011258](https://github.com/cassianomangini/radioand3d/actions/runs/39151011258) | `lint`, `typecheck`, testes gerais e `build`: success. `Capture visual review` e `Playwright visual diagnostics`: **skipped** | CI verde sem QA visual |
| [Workflow de dock, run 39151011224](https://github.com/cassianomangini/radioand3d/actions/runs/39151011224) | Workflow complementar verde | Não homologou a Home modificada |
| [PR #33](https://github.com/cassianomangini/radioand3d/pull/33) | Capturas antigas de dock, split e mobile | Base visual **substituída** |
| [Contrato de experiência](../../EXPERIENCE.md), [arquitetura](../../ARCHITECTURE.md), [pipeline](../../design/CM_VISUAL_RENDER_PIPELINE_V1.md) | Invariantes de produto e processo | Documentação não substitui interação/render real |
| [Histórico de 17/10](home-x1-responsive-2026-10-17.md) | Decisões e problemas da versão anterior | Marcado como histórico, não especificação vigente |

**Verificado:** código e diff na `main`, estrutura dos componentes, configurações, regras do CSS e os estados reais dos jobs.  
**Estimado por análise estática:** número de candidatos a CSS não utilizado e redefinições de seletor/propriedade. Uma sobrescrita pode ser deliberada; não é automaticamente bug.  
**Não realizado:** `pnpm visual:qa` na versão de 18/10, captura atual do Chrome/CDP, comparação com o mock, medidas de LCP ou layout shift, inspeção de mobile real, a11y integral e escuta contínua. **Não declarar esses itens como passados ou reprovados.**

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

**Evidência:** [`tests/visual/home-hero-responsive.spec.ts`](https://github.com/cassianomangini/radioand3d/blob/23f25c3c2193cddadd6a3e0f014ca7df2fcf5666/tests/visual/home-hero-responsive.spec.ts) exige, no Estúdio estreito, `copyLayout === "relative"`, copy abaixo da imagem e distância vertical mínima. Na [`main` atual](https://github.com/cassianomangini/radioand3d/blob/23f25c3c2193cddadd6a3e0f014ca7df2fcf5666/src/components/studio-radio/studio-radio-shell.module.css#L4950-L5110), a copy mantém `position: absolute`, `left: 52%` no Estúdio estreito e faz composição lateral. Também há divergência no split mais largo: o teste requer o início do título a partir de `40% da largura do Estúdio + 160px`, enquanto a regra geral atual usa `left: 45%` mais padding. **Não chamar de falha observada; o teste não rodou no push.**

**Correção proposta:** reescrever as asserções apenas após registrar a composição que será mantida e conferi-la renderizada; cobrir split inicial, intermediário, máximo, dock, fullscreen, desktop curto, 1024 e mobile. Medir trechos efetivamente renderizados (`Range.getClientRects()` ou caixas dos spans), não apenas `getBoundingClientRect()` do `h1`. Incluir clipping, legibilidade, interseção com imagem e CTA.

**Aceite:** teste falha por palavras cortadas e colisões reais, e passa apenas no layout efetivamente aprovado. Não remover asserts para disfarçar incompatibilidade.

### A03. [P1] Quebras de H1 dependem da largura do Estúdio, não da coluna de texto

**Evidência:** `@container studio (min-width: 60rem)` aplica `white-space: nowrap` a `.studioHomePhrase`. A copy usa aproximadamente a metade direita do Estúdio e muda no dock. O limite de 60rem não demonstra, por si, que cada linha cabe.

**Correção proposta:** dimensionar H1, coluna útil, gaps e quebras conforme a área real da copy e as palavras. Aplicar `nowrap` só com espaço efetivamente suficiente; aceitar fallback intencional nos estados intermediários. Verificar separadamente os quatro grupos de frase, inclusive `do que você imagina.`.

**Aceite:** H1 completo e legível, sem cortar letras, invadir o X1 ou extrapolar o painel nos cinco viewports e estados do divisor. Capturas antigas do PR #33 servem apenas como alerta, não como prova atual.

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

## 5. Plano de execução da frente 08V

A sequência macro permanece em [`docs/ROADMAP.md`](../../ROADMAP.md). O controle dos passos e evidências permanece em [`docs/work/08-visual-quality-evolution.md`](../08-visual-quality-evolution.md). Este relatório **não cria uma segunda fila**.

| Bloco | Entrega futura | Dependência | Saída exigida |
| --- | --- | --- | --- |
| **B0, obter evidência atual** | Rodar captura, `pnpm visual:qa` e interações no último SHA da `main`; separar falhas do teste antigo e defeitos do render | Nenhuma | Capturas, logs, lista priorizada de diferenças reais |
| **B1, reparar gate e suite** | A01, A02, A08 e A09; não encobrir testes incompatíveis | B0 para contrato visual | Checks executados e interpretações corretas de execução/skipped |
| **B2, corrigir Home de forma cirúrgica** | A03/A04 apenas nas divergências confirmadas com referência | B0 e, quando aplicável, B1 | Composição aprovada e QA repetido |
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

- [ ] Executar navegador/Playwright sobre o SHA de Home em avaliação, sem `skipped` oculto.
- [ ] Resolver conflito da suíte do hero com o layout efetivamente aprovado.
- [ ] Testar texto real, crop e arte nos estados de painel relevantes.
- [ ] Tornar o gate confiável; decidir conscientemente entre push direto ou checks requeridos antes do merge.
- [ ] Corrigir ARIA do divisor com o cálculo real.
- [ ] Comprovar antes de excluir CSS potencialmente órfão.
- [ ] Consolidar CSS e extrair responsabilidades sem regressão nem remount do áudio.
- [ ] Avaliar carrossel, motion normal/reduzido e custo de mídia.
- [ ] Registrar aprovação de Cassiano para direção visual final, quando houver modificação perceptual.

**Situação após este PR:** documentação corrigida; as ações de engenharia e a inspeção visual da Home nova continuam pendentes. O relatório é uma análise técnica revisada, **não uma certificação de qualidade do site**.
