# 03c — Dock reversível da Rádio no cabeçalho

**Estado da entrega:** `in_progress` **somente na fase de definição**; aplicação e testes ainda não iniciados.  
**Responsável:** CM Experience (contrato); CM Frontend (implementação após aprovação); CM Review (QA/evidências).  
**Solicitação:** Cassiano, 09/10/2026. Nova capacidade expressamente solicitada; **03b/06 e C1–C8 permanecem aceitas**, com modificação apenas do que esta função exigir.  
**Contrato visual/comportamental:** [CM Rádio — Dock na navbar V1](../design/CM_RADIO_NAVBAR_DOCK_V1.md).  
**Auditoria da marca:** [CM Site Visual Identity Audit V1](../design/CM_SITE_VISUAL_IDENTITY_AUDIT_V1.md).  
**Código inspecionado:** `src/components/studio-radio/studio-radio-shell.tsx`, `studio-radio-shell.module.css`, `radio-panel-drag.ts`, `radio-motion-spine.ts`; `docs/EXPERIENCE.md`, `docs/PROJECT_PLAN.md`, `docs/design/CM_MOTION_EXPERIENCE_PLAN_V1.md`.  
**Arquivos técnicos previstos (ainda não alterados):** shell TSX/CSS, estado de layout, helpers de drag e testes de motion/browser relacionados.  
**Artefato:** `artifact_ref: docs/design/CM_RADIO_NAVBAR_DOCK_V1.md`, `approved_by_visual: null`, `ready_for_frontend: no`.

## Resultado esperado

Em desktop, a Rádio **sai fisicamente da lateral direita, sobe e encaixa como player compacto na navbar** quando o usuário empurra a divisória para a direita além do mínimo e solta. O Estúdio ganha a largura. O player do topo ocupa o espaço **imediatamente antes dos botões de redes sociais, na parte direita da navbar**; o logo permanece à esquerda e `Início / Estúdio / Rádio` continua centralizado. As redes sociais ficam visíveis. O mini mantém a música e permite **restaurar a Rádio lateral** por controle da navbar ou arrastando a borda direita para a esquerda. Este é um terceiro uso do espaço, não uma cópia do player mobile e não substitui fullscreen.

## Checklist de execução (marcar somente após evidência)

### A — Direção e riscos

- [x] **D1** Interpretar o gesto solicitado e distingui-lo de resize normal, `focus` e `fullscreen`, preservando a direção do arraste: **direita = dock superior**, **esquerda = abrir/expandir Rádio**.
- [x] **D2** Inspecionar o shell/handle/state/FLIP existentes, nav desktop, invariantes de áudio e breakpoints; identificar conflitos com o limite mínimo da Rádio e com `restoreInitialRadioLayout`.
- [x] **D3** Documentar a proposta inicial de estados, posição no header, ações acessíveis, conteúdo mínimo, direção do movimento, reversibilidade e regressões de layout/áudio.
- [x] **D3.1** Conferir referência `cassianomangini/artesopolis-landing` (`master`, `src/components/navbar.tsx` e `mini-player.tsx`) e registrar correção de Cassiano: dock **imediatamente antes dos ícones sociais**, preservando a nav CM centralizada. A landing usava mini na coluna central e sociais na última coluna; reaproveitar a relação e o comportamento, não sua paleta/código.
- [ ] **D4** Preparar referência visual/animação de protótipo contextualizada **com o header CM real e split**, sem alterar Home/Rádio aceitas. Posição já decidida: **[logo CM] | [nav central] | [mini Rádio] [redes sociais]**. Validar dimensões, título longo, controles, permanência dos ícones e equilíbrio do header.
- [ ] **D5** Cassiano aprovar a direção da transição e as dimensões do player do topo. Somente então mudar `ready_for_frontend` para `yes` com referência de aprovação verdadeira.

### B — Implementação restrita à capacidade nova

- [ ] **I1** Acrescentar layout `docked` à máquina de estados, sem transformar `compact` atual em dock e sem reimplementar `fullscreen`.
- [ ] **I2** Reconhecer overshoot para direita **antes de clamp**; preview, limiar de confirmação, cancelamento, magnet, reversão e restauro de largura anterior.
- [ ] **I3** Header ocupar toda a largura quando `docked`; Estúdio fazer reflow; integrar player compacto **ANTES de SocialIcons**, ambos no grupo à direita, somente com lateral oculta; **não esconder ícones sociais** e manter navegação realmente centralizada.
- [ ] **I4** Criar botão **Abrir Rádio lateral** no dock e uma zona acessível de arraste na borda direita; preservar o link **Rádio** que abre fullscreen.
- [ ] **I5** Coreografar lateral → topo → lateral com spine WAAPI/FLIP único, interrupção segura, tempos de assinatura e fallback reduced-motion.
- [ ] **I6** Preservar `useRadio`/um único áudio, faixa/tempo/playlist/fila, navegação de rotas, teclado/foco e mini-player mobile sem duplicação.

### C — Prova e aprovação

- [ ] **Q1** Testes unitários de estado e limites (dock vs resize e fullscreen), incluindo cancel/velocity/snap.
- [ ] **Q2** Navegador: drag desktop 1440, 1180 e desktop curto; trocar rota durante dock; trigger por botão; reversão durante a animação; um áudio; nenhum overflow; **player antes de sociais e todos os ícones sociais preservados com navegação centrada**.
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

## Retomada

**Último ponto comprovado:** D1–D3 (especificação e análise do código atual).  
**Próxima atividade:** D4, protótipo contextualizado com marca/posição de navbar reais para aprovação do movimento. **Implementação pública bloqueada em D5**, mas o estudo isolado/dev pode prosseguir.  
**Deploy:** não solicitado. **Testes do dock:** não executados. **Aprovação visual:** não obtida.  
**Não fazer:** não reabrir Rádio inteira, não instalar outro engine de animação por reflexo, não criar dois áudio players, não trocar o comportamento do link Rádio existente.
