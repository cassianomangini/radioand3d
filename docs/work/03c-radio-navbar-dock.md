# 03c — Dock reversível da Rádio no cabeçalho

**Estado da entrega:** `in_progress` em **QA complementar e aprovação visual D5**. **I1–I6 concluídos funcionalmente no shell público** após autorização expressa de Cassiano, com 11 testes de browser verdes. A centralização óptica do player entre menu e sociais continua aberta e músicas R2 não foram homologadas; nenhuma aprovação final foi presumida.  
**Responsável:** CM Experience (contrato); CM Frontend (implementação após aprovação); CM Review (QA/evidências).  
**Solicitação:** Cassiano, 09/10/2026. Nova capacidade expressamente solicitada; **03b/06 e C1–C8 permanecem aceitas**, com modificação apenas do que esta função exigir.  
**Contrato visual/comportamental:** [CM Rádio — Dock na navbar V1](../design/CM_RADIO_NAVBAR_DOCK_V1.md).  
**Auditoria da marca:** [CM Site Visual Identity Audit V1](../design/CM_SITE_VISUAL_IDENTITY_AUDIT_V1.md).  
**Código inspecionado:** `src/components/studio-radio/studio-radio-shell.tsx`, `studio-radio-shell.module.css`, `radio-panel-drag.ts`, `radio-motion-spine.ts`; `docs/EXPERIENCE.md`, `docs/PROJECT_PLAN.md`, `docs/design/CM_MOTION_EXPERIENCE_PLAN_V1.md`.  
**Arquivos técnicos já alterados:** shell TSX/CSS, estado de layout e helpers de drag, novo player navbar, testes de unidade + E2E do shell. **Escopo visual pendente:** centralização/respiração entre nav, mini e redes (D5).  
**Artefato:** `artifact_ref: docs/design/CM_RADIO_NAVBAR_DOCK_V1.md`, `approved_by_visual: null`, `ready_for_frontend: yes` **somente para função expressamente autorizada**; D5 óptico não aprovado.

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

- [x] **I1** Estado `docked` integrado em `radio-motion-spine.ts` e no shell público, mutuamente exclusivo de compact/focus/fullscreen; precedência de fullscreen testada em CI. [Evidência](evidence/03c-radio-dock-integrated-2026-10-11.md).
- [x] **I2** Overshoot direito detectado **antes do clamp**, limiar de 96px, affordance do divisor, snap compact separado e width/mode originais restaurados; cancelamento sem dock. E2E de arraste e unit tests no [relatório](evidence/03c-radio-dock-integrated-2026-10-11.md).
- [x] **I3 (funcional, não art approval)** Header/Estúdio refluem, mini antes dos botões sociais somente em dock, nav junto ao logo somente neste modo, sidebar original restaurada. **Centralização óptica fina explicitamente pendente em D5**. Capturas 1440/1760 no [relatório](evidence/03c-radio-dock-integrated-2026-10-11.md).
- [x] **I4** Retorno pelo botão do mini, pela borda direita e via teclado; link **Rádio** abre fullscreen e retorna ao dock quando apropriado. E2E 03c no [relatório](evidence/03c-radio-dock-integrated-2026-10-11.md).
- [x] **I5 (funcional)** Voo WAAPI/FLIP único entre lateral e navbar, retorno inverso, duração-base 660ms, token de cancelamento, fallback reduced-motion e reversão durante animação verificada no [E2E 38140803545](https://github.com/cassianomangini/radioand3d/actions/runs/38140803545). Refinamento estético D5 separado.
- [x] **I6 (funcional, fixture de desenvolvimento)** Mesmo `useRadio`, posição do áudio avançando durante dock, visualizador de 13 bandas lendo WAV real, manutenção de reprodução ao navegar para Estúdio, fullscreen com retorno ao dock, teclado/foco e mini mobile preservado; [E2E com 11 testes verdes](https://github.com/cassianomangini/radioand3d/actions/runs/38140803545). **Faixas R2 privadas ainda não homologadas.**

### C — Prova e aprovação

- [x] **Q1** Cobertura unitária de modo `docked`, precedência fullscreen, limites de overshoot, compact snap, velocidade/width e cancelamento de gesto; lint/typecheck/unit/build [verdes](https://github.com/cassianomangini/radioand3d/actions/runs/38140584046).
- [x] **Q2 (funcional)** E2E integrado nas larguras **1180/1440/1760**, retorno por botão/borda, interrupção da animação e `pointercancel`, navegação Estúdio/fullscreen, áudio WAV preservado, sem segundo mini nem scroll horizontal; [12 testes Playwright passaram na CI 38141001848](https://github.com/cassianomangini/radioand3d/actions/runs/38141001848). **Centragem óptica ainda pendente em D5.**
- [ ] **Q3** Mobile 390/360, zoom/teclado/touch, long titles, músicas sem capa, sem catálogo, error/buffering e reduced-motion.
- [x] **Q4 (revisão técnica, não aprovação estética)** [Vídeo e screenshots reais](https://github.com/cassianomangini/radioand3d/actions/runs/38140243922/artifacts/11703125315) de lateral → sobreposição em voo → navbar → lateral em shell público 1440/1760, incluindo mobile original 390. O espaço ainda não foi homologado por Cassiano.
- [x] **Q5** [CI geral 38141001879](https://github.com/cassianomangini/radioand3d/actions/runs/38141001879) verde em lint/TypeScript/testes/build e [Playwright 38141001848](https://github.com/cassianomangini/radioand3d/actions/runs/38141001848) com **12 passaram, 32 skips deliberados, sem retries**, incluindo 1180→390→1440, áudio e interrupção; falhas anteriores dos testes corrigidas e revalidadas.
- [ ] **Q6** Cassiano conferir e aprovar a transformação final. Não confundir CI verde com aprovação visual.
- [x] **Q7** Contrato 03c, evidência integrada, roadmap e README atualizados; C1–C8 e a Rádio lateral preexistente preservados. **D5/Q6 e QA complementar não homologados.**

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

- **11/10/2026 — integração funcional comprovada:** [CI Playwright 38140243922](https://github.com/cassianomangini/radioand3d/actions/runs/38140243922) (8 cenários aplicáveis, capturas e vídeos reais) e [CI global 38140584046](https://github.com/cassianomangini/radioand3d/actions/runs/38140584046) verde. Marcados I1–I4 e Q1/Q4; I5/I6 e Q2/Q3/Q5 ainda exigem validações complementares (incluindo áudio durante rota). [Relatório](evidence/03c-radio-dock-integrated-2026-10-11.md). D5/Q6 mantidos em aberto pela falta de espaçamento central.

- **11/10/2026 — integração I1–I6 e Q5 verificadas:** [Playwright 38140803545](https://github.com/cassianomangini/radioand3d/actions/runs/38140803545) **11 passaram** (29 skips planejados); interruptibilidade do voo, pointercancel, áudio WAV em reprodução contínua entre dock e rota, 13 barras reais, fullscreen e responsive. [CI global](https://github.com/cassianomangini/radioand3d/actions/runs/38140689340) verde. [Evidência ampliada](evidence/03c-radio-dock-integrated-2026-10-11.md). Q2/Q3 adicionais e D5/Q6 ficam pendentes.

- **11/10/2026 — Q2 responsiva concluída:** [CI visual 38141001848](https://github.com/cassianomangini/radioand3d/actions/runs/38141001848) 12 passaram/32 skips por perfil, cobrindo `1180→390→1440` e comprovando único mini no mobile; [CI geral 38141001879](https://github.com/cassianomangini/radioand3d/actions/runs/38141001879) verde; [registro](evidence/03c-radio-dock-integrated-2026-10-11.md). **Não** marcar Q3/D5/Q6: estética centralizada ainda pendente.

## Retomada

**Último ponto comprovado:** **I1–I6 completos na integração funcional**, não apenas em dev-only. [Run 38140803545](https://github.com/cassianomangini/radioand3d/actions/runs/38140803545) = 11 testes aplicáveis passaram, 29 skips por perfil, zero retry; inclusive cancelamento, interrupção em pleno voo e reprodução **WAV realmente avançando** durante dock/navegação, bandas reais e pausa. [CI 38140689340](https://github.com/cassianomangini/radioand3d/actions/runs/38140689340) global verde; [screenshots/vídeo da integração](https://github.com/cassianomangini/radioand3d/actions/runs/38140243922/artifacts/11703125315). [Relatório completo](evidence/03c-radio-dock-integrated-2026-10-11.md).  
**Próxima atividade:** **Q3 complementar** (360/zoom, mídia ausente/erros/buffering e R2 real quando disponível) e **D5**: Cassiano revisar a **centralização exata do mini no espaço entre a nav e os botões sociais**, deferida explicitamente. **Q6** ainda não aprovado. Q2 funcional agora passou em 1180/1440/1760 e mudança 1180→390→1440.  
**Deploy:** nenhum solicitado. **Código público na main:** sim, integração funcional sem mudança do catálogo/motor. **Prova musical:** somente fixture WAV sintética real de 8s; ainda não prova reprodução com o acervo R2. **Aprovação visual final:** não obtida.  
**Não fazer:** não reabrir Rádio inteira, não instalar outro engine de animação por reflexo, não criar dois áudio players, não trocar o comportamento do link Rádio existente.
