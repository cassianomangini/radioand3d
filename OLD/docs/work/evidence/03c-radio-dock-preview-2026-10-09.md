# 03c — Evidência de prévia renderizada do dock (09/10/2026)

**Estado:** protótipo visual isolado **renderizado e revisado tecnicamente**; direção final pendente do aceite de Cassiano.  
**Base:** pedido de mover Rádio lateral para a navbar antes das redes sociais; reverter pelo botão do mini-player ou pela borda direita.  
**Contrato:** [CM Radio Navbar Dock V1](../../design/CM_RADIO_NAVBAR_DOCK_V1.md).  
**Código do experimento:** `src/app/dev/radio-dock/page.tsx`, `radio-dock-preview.tsx`, `radio-dock-preview.module.css`.  
**Teste:** `tests/visual/radio-dock-preview.spec.ts`; [workflow isolado](../../../.github/workflows/radio-dock-preview.yml).

**Reexecução adicional após validação de código:** [CI 37977126467](https://github.com/cassianomangini/radioand3d/actions/runs/37977126467) — lint **dos arquivos deste protótipo** passou; **6/6 casos aplicáveis** de browser passaram, 14 skips planejados por viewport, sem retries. [Capturas e vídeos da reexecução](https://github.com/cassianomangini/radioand3d/actions/runs/37977126467/artifacts/11639167693). A CI global continua falhando em código de orçamento não alterado por 03c, conforme ressalva abaixo.

## Evidência de navegador

- **[CI de referência: 37976670382](https://github.com/cassianomangini/radioand3d/actions/runs/37976670382)** — sucesso, **6 cenários efetivamente executados**, 14 skips deliberados por viewport/ambiente, sem retry. [Artefato de screenshots/vídeos/traces](https://github.com/cassianomangini/radioand3d/actions/runs/37976670382/artifacts/11638314730).
- Capturas do navegador **1440×900** para **lateral → etapa de voo → mini antes das redes sociais → lateral restaurada**, produzidas pela mesma UI do CM, logo, nav, hero X1, divisor e Rádio reais. Contexto de áudio: fixture sintética `Amostra técnica` do ambiente de QA — não prova de reprodução de faixa R2.
- Vídeo gravado pelo Playwright/Chromium do gesto/click desktop; a criação de vídeos exigiu instalar `ffmpeg` no ambiente de testes. Outro cenário passou com overshoot do mouse à direita e retorno arrastando a borda direita para a esquerda.
- Layout `docked`: navegação horizontal centralizada, **dock player à esquerda imediata do grupo `SocialIcons`**, grupo social visível à direita; Estúdio ocupa área antes pertencente à Rádio. Cenário mede posicionamento real dos bounding boxes; não depende só de screenshot.
- `prefers-reduced-motion: reduce`: mudança de estado e retorno sem voo longo. Cenário mobile/laptop: mini compacta preexistente preservada, sem novo dock e sem overflow horizontal detectado.
- O protótipo **importa `StudioRadioShell` e `useRadio()` reais**, mas **não altera** nem reinstala a máquina de estados C1–C8. As classes do CSS Modules do shell são marcadas temporariamente apenas nesta rota de desenvolvimento para o preview manipular geometria e criar uma sobreposição FLIP/WAAPI.
- Erro corrigido durante QA: CSS do preview inicialmente tentou selecionar os nomes não compilados das classes do shell; o screenshot de erro mostrou que a Rádio permanecia lateral. Corrigido usando `data-preview-*` aplicados exclusivamente no DOM do experimento; o CI de referência confirmou o dock renderizado.
- Alterações finais ainda pendentes: arte refinada/aceite do movimento de 660ms, integração real de `docked` na state machine, retorno exato da largura da Rádio depois do gesto, continuidade de reprodução real após navegação, teclado/foco em painel oculto, resiliência em interrupção e reentrada.

## Limitações — não marcar implementação real como pronta

**A interface pública não foi modificada.** `/dev/radio-dock` é bloqueada em produção por `notFound()`. Na prévia existe um botão auxiliar *03C · PRÉVIA INTERATIVA* e um mini injetado para avaliação; nenhum desses elementos autoriza criar nova UI pública sem D5.

A CI principal já estava **vermelha por falhas em arquivos de orçamento fora da entrega 03c** quando esta prévia foi criada: erro de parsing em `src/server/quote/supabase-gateway.ts:124` e parâmetro não utilizado em `tests/quote-backend-handlers.test.mjs:171`. Não misturar correção de backend com animação da Rádio. Por isso foi criado um **workflow independente** para testar/registrar o experimento isolado; a aprovação da CI inteira, lint completo/typecheck/build continuam gates futuros.

**Correção após revisão mais completa da referência:** este experimento permaneceu aquém do visual e conteúdo do mini da Landing Artesópolis: não implementou faixa anterior/próxima, barras reativas e volume de informação equivalente. Os 6 testes comprovam apenas posição, gesto e técnica. **Não pedir aprovação estética deste protótipo**; a próxima entrega deve refazer a mini-interface em D4.1 e passar pelo comparativo D4.2 antes do gate humano D5.
