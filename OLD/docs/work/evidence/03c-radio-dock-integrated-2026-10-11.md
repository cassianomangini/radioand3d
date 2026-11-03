# 03c — Rádio dock integrada ao shell público (11/10/2026)

**Status:** integração funcional na `main` (sem deploy manual); **espaçamento óptico final entre menu / player / redes ainda não aprovado**. A integração foi autorizada explicitamente por Cassiano apesar dessa pendência: “o espaçamento a gente corrige depois ... pode seguir”. **D5 permanece em aberto.**

## Alterações verificadas

- `src/components/studio-radio/radio-motion-spine.ts` agora suporta o estado explícito `docked`, mutuamente exclusivo com fullscreen/focus/custom/split. O modo `fullscreen` conserva prioridade e seu retorno pode restaurar `docked`.
- `radio-panel-drag.ts` diferencia `compact` (largura física da lateral) de `docked` (empurrar **além** do mínimo em 96 px), usando largura solicitada **antes** de clamp; cancelamento não faz dock.
- `studio-radio-shell.tsx` integra gesto, teclado, borda direita de retorno, botão restaurar, navegação Home↔Estúdio, painel lateral preservado e inerte quando oculto, um único `useRadio` para todos os modos. O motor e a fila não foram reinstanciados.
- `radio-navbar-dock.tsx` + CSS: player compacto somente em `docked`, imediatamente antes dos ícones sociais, marca CM RÁDIO, faixa/capa, anterior/play/próxima, **13 bandas do visualizador real** e restaurar. A análise visual do painel oculto deixa de animar.
- `studio-radio-shell.module.css`: o header/Estúdio crescem; o menu se aproxima do logo apenas em `docked`; o player e redes ficam à direita. **A composição ainda não está centralizada visualmente como Cassiano deseja** e será ajustada depois.
- Transição lateral ↔ navbar usa uma superfície cinematográfica de imagem + título com WAAPI, FLIP no menu, interrupção com token/cancelamento, duração-base de 660ms e fallback para `prefers-reduced-motion`.
- `/dev/radio-dock` não mantém um segundo mock com drag independente: reutiliza o shell integrado, para evitar duas fontes de estado. Rota 404 no build de produção.

## Evidência técnica do navegador

**Run confirmado:** [03c Playwright 38140243922](https://github.com/cassianomangini/radioand3d/actions/runs/38140243922) — **8 testes passaram**, 20 skips deliberados por perfil, sem retries, com lint restrito e vídeo. [Artefato com screenshots/vídeos](https://github.com/cassianomangini/radioand3d/actions/runs/38140243922/artifacts/11703125315).

**CI global:** [38140584046](https://github.com/cassianomangini/radioand3d/actions/runs/38140584046) — lint, typecheck, testes e build verdes com implementação integrada e os novos testes versionados.

**Conferência renderizada do agente:** capturas reais `01-lateral-original.png`, `02-dock-in-real-navbar.png` e `03-restored-lateral.png` em **1440×900 e 1760×824**, mais mobile 390. A sequência do vídeo mostra o painel lateral refluindo à direita enquanto a superfície da arte sobe e se contrai para o cabeçalho. Na fase docked o logo/nav ficam à esquerda, mini ocupa a maior parte da região seguinte, redes permanecem visíveis à direita; na volta reaparecem painel/playlist/divisor, sem segundo player desktop. A revisão visual **não substitui** aprovação de Cassiano.

**Cenários automáticos confirmados:** overshoot 1440/1760, dock e retorno por botão, mesmo áudio/estado global, navegação `/`→`/studio` com `docked` persistente, fullscreen a partir de dock e retorno, teclado e arraste da borda direita, reduced motion, ausência de segundo mini em 1024 e 390, sem overflow detectado. **Prova de continuidade do áudio com música R2 real ainda pendente.** A CI emprega amostras WAV sintéticas de desenvolvimento, não o catálogo privado completo.

## QA complementar concluída (11/10/2026)

**[Execução 38140803545 — 11 testes Playwright passaram, 29 skips deliberados](https://github.com/cassianomangini/radioand3d/actions/runs/38140803545)**, zero retries; [artefato com vídeo, screenshots e traces](https://github.com/cassianomangini/radioand3d/actions/runs/38140803545/artifacts/11702562521). Foram adicionadas provas diretamente na **Home/Estúdio integrados**, não somente na rota de protótipo:

- Arraste curto para a direita **não** faz dock; cancelamento de gesto com `pointercancel` não comita dock ou resize.
- **Interrupção do voo:** começar a recolher a Rádio e restaurá-la imediatamente pela borda antes do fim da WAAPI não deixa overlay fantasma; sidebar/divisor tornam a ficar visíveis.
- **Reprodução WAV real no navegador:** tocar o áudio de desenvolvimento, confirmar avanço de `position`, recolher para a navbar sem pausar, confirmar `playing` e que a posição prossegue mesmo com painel lateral `aria-hidden`/`inert`; as **13 barras** reagem à análise do sinal. Navegar para `/studio` mantém mini/estado e permite pausar.
- Correção genuína de QA: um teste tentou localizar o input de posição por `getByRole('slider')` após a sidebar ficar `aria-hidden` e recebeu timeout — **comportamento de acessibilidade correto**. O teste foi ajustado para ler o `input` DOM retido, sem remover `inert`. Após a correção, a suíte fechou verde.
- Lint/typecheck/unit/build já estavam verdes na [CI geral 38140689340](https://github.com/cassianomangini/radioand3d/actions/runs/38140689340) com o mesmo código funcional. Nenhum vídeo ou teste sintético equivale à homologação de uma música R2 real.

**Conclusão técnica do escopo autorizado:** I1–I6 implementados e verificados em navegador com amostras técnicas. **O projeto ainda não tem aceite de composição/centralização final (D5 e Q6).** O teste com acervo R2 real e casos de 1180/360/zoom e falhas de mídia permanecem no gate QA complementar.

## QA responsiva final da etapa funcional

**[Playwright 38141001848](https://github.com/cassianomangini/radioand3d/actions/runs/38141001848): 12 testes aplicáveis passaram, 32 skips planejados, sem retries**, incluindo mais um teste exclusivo da integração `1180px → 390px → 1440px`. [Screenshots de dock 1180, mobile 390 e vídeo](https://github.com/cassianomangini/radioand3d/actions/runs/38141001848/artifacts/11703211996). O teste verifica que, **a 1180**, nav, mini e redes não colidem nem provocam overflow; ao cruzar para **390**, volta a existir apenas o mini mobile original, o dock/edge desaparecem e o contexto de áudio não é duplicado; no retorno a **1440**, a Rádio lateral original fica novamente operável.

**[CI geral 38141001879](https://github.com/cassianomangini/radioand3d/actions/runs/38141001879): lint, TypeScript, testes e build verdes** no mesmo código da entrega funcional e dos testes novos.

**Critério Q2:** cumprido tecnicamente para 1180/1440/1760, mudanças de rota, fullscreen, ida/volta, cancelamento e reversão durante animação, sem colisão funcional. **Essa validação NÃO significa aprovação óptica:** o espaçamento entre menu, mini e redes continua errado segundo Cassiano e será ajustado quando ele pedir (D5/Q6).

## Pendências / gate honesto

- **D5 (obrigatória):** acertar alinhamento/centralização espacial do mini **entre o fim do menu Início/Estúdio/Rádio e o começo dos botões sociais**, mesmo em larguras intermediárias. Pedido para deixar para depois; não fazer ajuste cosmético arbitrário agora.
- **Q complementar:** interrupção/cancelamento, continuidade de áudio WAV e resize desktop↔mobile/1180 estão comprovados acima. Ainda testar acervo real R2/sidecar, 360/zoom e mídia ausente/erro/buffering, além da avaliação estética D5.
- **Q6:** aceite visual final por Cassiano não foi dado; sem marcar entrega completa. **Sem deploy autorizado nesta etapa.**

**Fonte de verdade dos próximos passos:** [03c checklist](../03c-radio-navbar-dock.md), [contrato visual](../../design/CM_RADIO_NAVBAR_DOCK_V1.md).
