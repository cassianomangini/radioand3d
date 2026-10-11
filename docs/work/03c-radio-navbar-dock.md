# 03c — Dock reversível da Rádio no cabeçalho

**Estado da entrega:** `in_progress` na implementação I1–I6 do dock real, **expressamente autorizada apesar de D5 visual pendente**. A centralização óptica do player entre menu e sociais continua aberta; nenhuma aprovação final foi presumida.  
**Responsável:** CM Experience (contrato); CM Frontend (implementação após aprovação); CM Review (QA/evidências).  
**Solicitação:** Cassiano, 09/10/2026. Nova capacidade expressamente solicitada; **03b/06 e C1–C8 permanecem aceitas**, com modificação apenas do que esta função exigir.  
**Contrato visual/comportamental:** [CM Rádio — Dock na navbar V1](../design/CM_RADIO_NAVBAR_DOCK_V1.md).  
**Auditoria da marca:** [CM Site Visual Identity Audit V1](../design/CM_SITE_VISUAL_IDENTITY_AUDIT_V1.md).  
**Código inspecionado:** `src/components/studio-radio/studio-radio-shell.tsx`, `studio-radio-shell.module.css`, `radio-panel-drag.ts`, `radio-motion-spine.ts`; `docs/EXPERIENCE.md`, `docs/PROJECT_PLAN.md`, `docs/design/CM_MOTION_EXPERIENCE_PLAN_V1.md`.  
**Arquivos técnicos previstos (ainda não alterados):** shell TSX/CSS, estado de layout, helpers de drag e testes de motion/browser relacionados.  
**Artefato:** `artifact_ref: docs/design/CM_RADIO_NAVBAR_DOCK_V1.md`, `approved_by_visual: null`, `ready_for_frontend: no`.

## Resultado esperado

Em desktop, a Rádio **sai fisicamente da lateral direita, sobe e encaixa como player compacto na navbar** quando o usuário empurra a divisória para a direita além do mínimo e solta. O Estúdio ganha a largura. O player do topo ocupa o espaço **imediatamente antes dos botões de redes sociais, na parte direita da navbar**; **no estado docked**, o menu `Início / Estúdio / Rádio` passa a ficar perto do logo à esquerda, liberando largura para o player; **com Rádio lateral**, o header original permanece intacto. As redes sociais ficam visíveis. O mini mantém a música e permite **restaurar a Rádio lateral** por controle da navbar ou arrastando a borda direita para a esquerda. Este é um terceiro uso do espaço, não uma cópia do player mobile e não substitui fullscreen.

## Checklist de execução (marcar somente após evidência)

### A — Direção e riscos

- [x] **D1** Interpretar o gesto solicitado e distingui-lo de resize normal, `focus` e `fullscreen`, preservando a direção do arraste: **direita = dock superior**, **esquerda = abrir/expandir Rádio**.
- [x] **D2** Inspecionar o shell/handle/state/FLIP existentes, nav desktop, invariantes de áudio e breakpoints; identificar conflitos com o limite mínimo da Rádio e com `restoreInitialRadioLayout`.
- [x] **D3** Documentar a proposta inicial de estados, posição no header, ações acessíveis, conteúdo mínimo, direção do movimento, reversibilidade e regressões de layout/áudio.
- [x] **D3.1** Conferir referência `cassianomangini/artesopolis-landing` (`master`, `src/components/navbar.tsx` e `mini-player.tsx`) e registrar correção de Cassiano: dock **imediatamente antes dos ícones sociais**, preservando a nav CM centralizada. A landing usava mini na coluna central e sociais na última coluna; reaproveitar a relação e o comportamento, não sua paleta/código.
- [x] **D3.2** Reestudar **integralmente a referência Artesópolis Landing**: navbar, mini-player completo, botões, barras reativas/engine, camadas de acabamento e padrões documentados; confrontar com a prévia CM atual. [Contrato de direção atualizado](../design/CM_RADIO_NAVBAR_DOCK_V1.md). Resultado: o primeiro mini CM perdeu controles e identidade sonora; referência não foi bem traduzida.
- [x] **D4 (prova técnica apenas)** Criar e renderizar prévia com `StudioRadioShell` real em `/dev/radio-dock`, demonstrando gesto/posição/transição; [vídeo e teste browser](evidence/03c-radio-dock-preview-2026-10-09.md). **Os 6 testes não demonstram fidelidade visual à Landing**; não apresentar esse mock como direção de arte.
- [x] **D4.1 (correção obrigatória)** Mini-player da prévia refeito com capa, etiqueta CM RÁDIO, título/artista, **anterior + play/pause + próxima**, `RadioVisualizer` real de 13 barras e restaurar, usando a mesma fila e áudio. Não foi adotado novo engine de animação ou DJ legado. [Evidência V2](evidence/03c-radio-dock-legacy-informed-v2-2026-10-11.md).
- [x] **D4.2** Capturas reais **1180/1440/1760**, faixa longa com ellipsis, pausa/reprodução (WAV sintético de QA), visualização de barras por Web Audio (não fake), teclado/fila anterior/próxima, vídeo reversível, mobile 390, laptop 1024, reduced-motion e sem colisão horizontal. Corrigida a **legenda enorme/cortada em pleno voo** usando CSS container units. [Run 38137954780 (9 passed / 23 skipped deliberados)](https://github.com/cassianomangini/radioand3d/actions/runs/38137954780) · [relatório visual](evidence/03c-radio-dock-legacy-informed-v2-2026-10-11.md). **Revisão estética do agente, não aprovação de Cassiano.**

- [x] **D4.3** Feedback de 11/10 incorporado **somente no modo docked**: nav ao lado do logo, player mais largo antes das redes, header lateral intacto. Capturas reais **1180/1440/1760**, título longo e QA de colisão/overflow; gesto ida/volta, teclado, Web Audio sintético e mobile. [QA 38138854501: 9/9 testes aplicáveis](https://github.com/cassianomangini/radioand3d/actions/runs/38138854501), [CI 38138902620 verde](https://github.com/cassianomangini/radioand3d/actions/runs/38138902620) e [revisão visual do agente](evidence/03c-radio-dock-menu-beside-logo-2026-10-11.md). **Ainda não é aprovação estética por Cassiano.**

- [x] **D5f — autorização funcional com ressalva:** em 11/10 Cassiano disse **“o espaçamento a gente corrige depois porque ainda está errado; não está centralizado entre os botões de Início/Estúdio/Rádio e os botões sociais; pode seguir”**. Autorizou continuar **I1–I6 (interação real)**, sem aprovar a geometria final nem encerrar D5.
- [ ] **D5 — geometria/acabamento final:** refinar o **equilíbrio real do espaço entre a nav e o grupo social** após os gestos/estado funcionarem no shell público, e obter aceite explícito. Não marcar essa aprovação só porque CI passou.

### B — Implementação restrita à capacidade nova

- [ ] **I1** Acrescentar layout `docked` à máquina de estados, sem transformar `compact` atual em dock e sem reimplementar `fullscreen`.
- [ ] **I2** Reconhecer overshoot para direita **antes de clamp**; preview, limiar de confirmação, cancelamento, magnet, reversão e restauro de largura anterior.
- [ ] **I3** Header ocupar toda a largura quando `docked`; Estúdio fazer reflow; integrar player mais largo **ANTES de SocialIcons**, ambos no grupo à direita, somente com lateral oculta; **não esconder ícones sociais** e aproximar a nav do logo **somente no dock**. Restaurar header original quando lateral.
- [ ] **I4** Criar botão **Abrir Rádio lateral** no dock e uma zona acessível de arraste na borda direita; preservar o link **Rádio** que abre fullscreen.
- [ ] **I5** Coreografar lateral → topo → lateral com spine WAAPI/FLIP único, interrupção segura, tempos de assinatura e fallback reduced-motion.
- [ ] **I6** Preservar `useRadio`/um único áudio, faixa/tempo/playlist/fila, navegação de rotas, teclado/foco e mini-player mobile sem duplicação.

### C — Prova e aprovação

- [ ] **Q1** Testes unitários de estado e limites (dock vs resize e fullscreen), incluindo cancel/velocity/snap.
- [ ] **Q2** Navegador: drag desktop 1440, 1180 e desktop curto; trocar rota durante dock; trigger por botão; reversão durante a animação; um áudio; nenhum overflow; **player largo antes de sociais, nav aproximada do logo em dock, e header lateral inalterado**.
- [ ] **Q3** Mobile 390/360, zoom/teclado/touch, long titles, músicas sem capa, sem catálogo, error/buffering e reduced-motion.
- [ ] **Q4** Evidência de continuidade perceptível (vídeo/sequência real) da transformação para o header e retorno; comparação com interface CM existente.
- [ ] **Q5** Lint, typecheck, unit, build e browser QA executados de verdade; analisar/registrar falhas e reexecutar após ajustes.
- [ ] **Q6** Cassiano conferir e aprovar a transformação final. Não confundir CI verde com aprovação visual.
- [ ] **Q7** Atualizar evidências e roadmap, sem reabrir C1–C8 para refazer elementos aceitos.

## Matriz mínima de estados (a testar)

| Origem | Ação | Destino | Invariante |
| --- | --- | --- | --- |
| `split/custom/focus` | Arrastar divisória à direita além do mínimo e soltar | `docked` | Música não para; Estúdio recupera espaço |
| `split/custom/focus` | Arraste pequeno e soltar | `split/custom/focus` | Não recolhe involuntariamente |
| `docked` | Botão **Abrir Rádio lateral** | lateral anterior | Mesma faixa, tempo, fila e largura útil restaurada |
| `docked` | Puxar borda direita para esquerda | lateral anterior | Mesmo retorno espacial, sem segunda instância |
| `docked` | Link Rádio da navbar | `fullscreen` | Semântica atual do link preservada |
| `fullscreen` | Retornar por gesto/botão existente | Estado anterior coerente | Não alterar coreografia aceita |
| `docked` | Navegar `/` ↔ `/studio` ↔ Produto | `docked` | Header/player persistentes |
| Qualquer desktop | Entrar no breakpoint mobile | mini mobile atual | Um único áudio, sem dock duplicado |

## Evidências verificadas

- **09/10/2026 — leitura estática:** o shell usa `radioWidth` com valor mínimo, layout `split/custom/focus/fullscreen`, header desktop com `right: calc(var(--radio-width) + var(--rail-width))`, drag dividido entre ida a fullscreen e retorno; não há `docked` implementado na base lida. O clique `Rádio` da navbar abre fullscreen. Estilo/motor/produção **não modificados** por D1–D3.
- **09/10/2026 — user intent:** descrição expressa de animação que sobe para navbar ao empurrar à direita, com player compacto e retorno por botão ou novo arraste. Nenhum render do dock ainda existe.

- **09/10/2026 — correção de Cassiano + comparação legado:** `cassianomangini/artesopolis-landing/src/components/navbar.tsx` (`master`) dispunha mini-player e ícones sociais na navbar, com mini central e sociais à direita. No **CM atual**, Cassiano especificou mini **imediatamente antes do grupo social** no canto direito, mantendo a nav central. Posição considerada definida; acabamento e movimento seguem sem aprovação visual.

- **09/10/2026 — D4 renderizado:** [execução Playwright 37976670382](https://github.com/cassianomangini/radioand3d/actions/runs/37976670382), 6 testes browser passados (14 casos ignorados propositalmente), screenshots e vídeo do lado/voo/mini/retorno. O mini usa o mesmo `RadioProvider` do shell real e aparece **antes dos ícones sociais** mantendo menu centralizado. [Detalhes dos defeitos corrigidos e limites](evidence/03c-radio-dock-preview-2026-10-09.md). Nenhuma alteração de layout/estado na Rádio pública. `D5` permanece pendente.

- **09/10/2026 — auditoria complementar da referência:** primeiro estudo inspecionou os arquivos mas não traduziu a **densidade funcional** e **expressão sonora** da Landing. Leitura adicional de `control-button.tsx`, `social-icons.tsx`, `globals.css`, `player-context.tsx` e `docs/frontend-patterns.md` demonstrou a omissão de botões anterior/próxima e barras reais no protótipo. Novas etapas D4.1/D4.2 abertas; **D5 não pode seguir com o mock anterior**.

- **11/10/2026 — D4.1/D4.2 concluídos:** [CI 38137954780](https://github.com/cassianomangini/radioand3d/actions/runs/38137954780) (9 testes de navegador, 23 skips por cenário), [CI geral 38137954786](https://github.com/cassianomangini/radioand3d/actions/runs/38137954786) verde. Comparativo em 1180/1440/1760, áudio sintético realmente controla 13 barras e pausa relaxa, retorno por tecla, fluxo de gestos, e clipping do texto durante o voo corrigido. [Relatório](evidence/03c-radio-dock-legacy-informed-v2-2026-10-11.md). D5 pendente.

- **11/10/2026 — ajuste solicitado:** Cassiano gostou da V2 (transportes, barras e caráter do mini), mas considerou **menu central longe do logo**, deixando o player espremido. Nova composição definida: **logo e nav juntos à esquerda em dock → mini mais largo → redes**, mantendo shell lateral original. D4.3 aberta; D5 continua pendente.

- **11/10/2026 — D4.3 validado no navegador:** layout `logo + menu à esquerda | mini largo | redes à direita` em 1180/1440/1760, sem overlap; vídeo/screenshot da subida e retorno revistos. Um teste foi corrigido para consultar `textContent` em vez de `innerText` durante fase ocultada por CSS. [9 testes passaram](https://github.com/cassianomangini/radioand3d/actions/runs/38138854501), [CI verde](https://github.com/cassianomangini/radioand3d/actions/runs/38138902620), [registro detalhado](evidence/03c-radio-dock-menu-beside-logo-2026-10-11.md). Aprovação visual D5 pendente.

## Retomada

**Último ponto comprovado:** D1–D4.3 concluídos no laboratório dev-only. A correção do alinhamento/nav mais próxima ao logo e mini mais largo foi renderizada e inspecionada em 1180/1440/1760, mantendo gesto/áudio/fila e mobile. [Evidência](evidence/03c-radio-dock-menu-beside-logo-2026-10-11.md). [Playwright 38138854501](https://github.com/cassianomangini/radioand3d/actions/runs/38138854501) 9 passaram, 23 skips planejados, sem retry; [CI 38138902620](https://github.com/cassianomangini/radioand3d/actions/runs/38138902620) verde.  
**Próxima atividade:** **D5 — Cassiano conferir a prévia corrigida do mini e do menu junto ao logo**. Nenhuma implementação pública sem aprovação explícita.  
**Deploy:** nenhum. **Produção:** inalterada. **Prova musical:** somente fixture WAV sintética de 8s; ainda não prova reprodução R2 real. **Aprovação visual:** não obtida.  
**Não fazer:** não reabrir Rádio inteira, não instalar outro engine de animação por reflexo, não criar dois áudio players, não trocar o comportamento do link Rádio existente.
