# 03c — D4.3: navegação junto ao logo, player mais largo (11/10/2026)

**Solicitação de Cassiano:** gostou da prévia V2 e dos controles, mas o menu `Início / Estúdio / Rádio` estava longe do logo e apertava o espaço do mini-player. **Estado:** D4.3 concluída **apenas no laboratório isolado**; **D5 ainda depende de avaliação visual explícita**. A Rádio pública não foi alterada.

## Mudança executada

- Exclusivamente quando a Rádio está em `docked`, o header passa a usar a composição de **logo + menu lado a lado à esquerda**, seguido por **player largo**, seguido por **redes sociais à extrema direita**. Não deslocar o menu permanentemente: modo lateral/normal, foco/fullscreen e mobile permanecem com o cabeçalho atual.
- A área do mini deixa de usar `clamp(19rem, calc(50vw - 16.5rem), 34rem)` e passa a `clamp(25rem, calc(100vw - 40.5rem), 56rem)`. Pela formulação de CSS, a largura-alvo cresce aproximadamente **326→532px a 1180**, **456→792px a 1440**, **544→896px a 1760**; o navegador testa que ela realmente ultrapassa 500/740/830px respectivamente. Isso dá espaço à capa, faixa, anterior/play/próxima, 13 barras reais e retorno, sem remover transportes para caber.
- A movimentação do menu ao lado do logo usa uma **FLIP/WAAPI** transitória no protótipo para não teletransportar os links durante a subida/volta da Rádio. Mantém o mesmo mecanismo de áudio/sidecars e 660 ms do protótipo, com tratamento de `prefers-reduced-motion`.
- O mini continua posicionado **imediatamente antes de SocialIcons** e esses botões continuam visíveis; não foi criado segundo player nem outro motor de áudio.

## Testes e revisão de navegador

- **[QA 03c 38138854501](https://github.com/cassianomangini/radioand3d/actions/runs/38138854501): 9 testes Playwright passaram / 23 skips planejados**, sem retries; [capturas e vídeos no artefato](https://github.com/cassianomangini/radioand3d/actions/runs/38138854501/artifacts/11701664463). Esse workflow executou lint do protótipo e dos testes.
- **[CI geral 38138902620](https://github.com/cassianomangini/radioand3d/actions/runs/38138902620): verde**, com lint, TypeScript, testes e build em `main`. Os jobs/browser dessa CI geral seguem seus gatilhos próprios; o QA interativo de dock é o workflow 03c acima.
- Cenários de 1180/1440/1760: screenshots reais, menu a **16–52px** do limite do logo, player mais largo, espaço entre nav e mini, ausência de colisão com redes sociais, longa faixa truncada sem cortar os controles e ausência de overflow horizontal.
- Lateral → dock → lateral por controle, drag à direita e retorno por borda esquerda, reprodução/pause/visualização de 13 bandas com WAV sintético, fila next/previous com prova de teclado, 1024 e 390 sem mini duplicado.
- **Defeito corrigido durante QA:** um teste de fila ocasionalmente lia `innerText()` vazio durante a troca de visibilidade de CSS, embora o nó já tivesse `textContent` real. O teste agora lê `textContent` e exige título de fixture válida, evitando aprovação por repetição de teste.
- **Autorrevisão visual:** foram inspecionadas capturas de 1180/1440/1760 e uma etapa intermediária da subida. O novo menu fica próximo do monograma; a amplitude extra do mini está visível sem espremer os controles. Captura não equivale a aprovação estética de Cassiano.

## Gate seguinte

**D5:** solicitar avaliação do alinhamento agora ajustado. **Não** marcar `ready_for_frontend: yes` nem alterar `StudioRadioShell` público até o aceite do usuário. Implementação I1–I6, persistência ao navegar, interrupções e teste com músicas R2 continuam pendentes. Todo este ajuste ocorreu somente em `src/app/dev/radio-dock`, `tests/visual/radio-dock-preview.spec.ts` e documentação.
