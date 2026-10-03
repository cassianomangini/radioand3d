# CM 3D & Radio — implementation log — 03/10/2026

Este arquivo registra **o que realmente existe na `main`**. Não equivale a aprovação visual de Cassiano.

## Head deste fechamento

Base antes deste commit: `d0149d99cfd727435141a4bcff7a3be3fcd10d10`.

## Rádio — interação e composição

- split desktop com divisor arrastável;
- snap/magnetismo/flick e settle do divisor;
- focus workstation intermediário;
- fullscreen preservando a mesma instância do player;
- **FLIP/WAAPI split/focus -> fullscreen** medindo e animando os elementos reais;
- elementos com movimento próprio: header, capa/Now Playing, progresso, visualizer, shuffle, repeat, anterior, play/pause, próxima, volume, favorito, cabeçalho da fila e fila;
- movimento inverso no retorno;
- reduced-motion sem viagem animada;
- seleção playlist -> Now Playing com continuidade espacial;
- próxima/anterior com direção visual;
- fila preservando identidade ao reordenar;
- loading/buffering derivados do estado real do player;
- seek e volume táteis;
- resposta mecânica dos controles;
- atalhos globais de teclado;
- mini player mobile -> Rádio completa com continuidade espacial.

## Visualizer

- sidecars v3;
- regiões `bass/drums/other/voice`;
- voz central preservada no reamostramento;
- attack/release por papel;
- fallback live com dinâmica por frequência;
- continuidade fallback -> sidecar;
- relaxamento ao pausar;
- contraste espacial somente sobre diferenças reais;
- cadence reduzida em `prefers-reduced-motion`;
- ferramenta `pnpm visualizer:inspect -- <sidecar>`.

## Letras

- foco temporal da linha ativa;
- contexto de palavras concluídas preservado em microintervalos.

## Estúdio / rota

- rota pública `/studio`;
- shell público e RadioProvider persistentes;
- playback/volume/fila não são recriados pela navegação;
- transformação física persistente do mundo do Estúdio implementada;
- esse trabalho permanece na `main`, mas **não substitui o gate atual da transição da Rádio**.

## QA existente

- lint;
- typecheck;
- testes;
- build;
- sintaxe dos scripts do visualizer;
- capturas wide desktop, short desktop e mobile;
- captura da Rádio em fullscreen;
- captura da Rádio mobile aberta;
- capturas intermediárias de motion;
- gate do FLIP exige múltiplas animações reais simultâneas no painel.

## Estado de aprovação

- C1: `in_progress`;
- C2-C7: possuem implementação adiantada, mas não devem ser tratados como concluídos;
- C8: não iniciado como gate integrado final;
- aprovação perceptiva de Cassiano: **pendente**.

## Regra de entrega

`CI verde`, screenshot e commit na `main` não significam `done`. Uma frente só fecha quando o comportamento prometido existe ponta a ponta e passa pela revisão perceptiva correspondente.
