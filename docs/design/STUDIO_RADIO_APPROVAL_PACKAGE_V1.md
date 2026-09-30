# Pacote de aprovação V1: Estúdio + Rádio

Este é o ponto de decisão antes de liberar frontend visual final.

## Artefatos canônicos

1. [STUDIO_RADIO_HANDOFF_V1.md](STUDIO_RADIO_HANDOFF_V1.md)
   - grid;
   - split desktop;
   - resize;
   - ordem mobile;
   - crescimento progressivo do 3D.

2. [CM_VISUAL_SYSTEM_V1.md](CM_VISUAL_SYSTEM_V1.md)
   - tipografia;
   - paleta;
   - superfícies;
   - espaçamento;
   - motion.

3. [CM_COMPONENT_STATES_V1.md](CM_COMPONENT_STATES_V1.md)
   - Header;
   - Buttons;
   - StudioHero;
   - MiniPlayer mobile;
   - FullPlayer;
   - TrackRow;
   - Transport;
   - Search;
   - ResizeHandle;
   - estados vazios/loading/error.

4. [STUDIO_RADIO_COPY_V1.md](STUDIO_RADIO_COPY_V1.md)
   - orientação pública;
   - hero;
   - bloco editorial;
   - texto da Rádio;
   - estados sem conteúdo.

## Composição que será implementada após aprovação

### Desktop

```text
┌──────────────────────────────────────────────┬─────────────────┐
│ Header do Estúdio                            │ CM RÁDIO        │
├──────────────────────────────────────────────┤ desde o topo   │
│ logo + ESTÚDIO DE IMPRESSÃO 3D & MÚSICAS    │ da tela        │
│ Ideias que ganham forma.                    │ full player     │
│ ESTÚDIO 3D + texto fornecido                │ biblioteca      │
│ mídia real quando autorizada                 │ visualizador    │
│                                              │ resize/expand   │
└──────────────────────────────────────────────┴─────────────────┘
```

Não existe mini player no desktop.

Ajuste de Cassiano em 29/09/2026: a Rádio ocupa a altura inteira desde o topo do viewport e fica parada durante a rolagem do Estúdio. O header não atravessa a área da Rádio.

### Mobile

```text
Header
MiniPlayer
Logo + ESTÚDIO DE IMPRESSÃO 3D & MÚSICAS
Ideias que ganham forma.
mídia
ESTÚDIO 3D + texto fornecido
```

A Rádio completa abre sob demanda.

Revisão de Cassiano em 29/09/2026: logo fornecido na navbar em escala pequena e no hero em escala moderada; frase única centralizada logo abaixo da imagem, fundo próximo do preto e palavra colorida no título. Entre Estúdio e Rádio há somente a borda fina da Rádio, com área de arraste transparente. O marcador e o lead do hero agora são “ESTÚDIO 3D” e o texto fornecido por Cassiano. Os blocos inferiores saíram da home; o botão “Conheça mais sobre” e o item “Sobre” permanecem visíveis, desativados até existir a página do Estúdio.

## Decisões que ficam congeladas com a aprovação

- mini player somente mobile;
- Rádio completa acoplada no desktop;
- resize + botão de expandir/recolher;
- sem cards genéricos de benefícios;
- sem produtos/materiais/categorias fictícios;
- Estúdio cresce conforme conteúdo real aparece;
- TrackRow continua linha, não card;
- conteúdo visual vem de mídia real, não de decoração CSS;
- Manrope + IBM Plex Mono como proposta tipográfica;
- paleta matte escura com azul/ciano/violeta controlados;
- hero orienta explicitamente “Estúdio de Impressão 3D”.

## O que ainda pode mudar depois sem reabrir toda a direção

- fotos reais;
- quantidade de produtos;
- materiais disponíveis;
- lista de músicas;
- texto de contato;
- conteúdo editorial adicional abaixo da primeira experiência.

Essas mudanças devem respeitar grid, tokens e gramática aprovados.

## Critério de liberação

Frontend visual final só pode começar depois de uma manifestação explícita de Cassiano aprovando este pacote ou pedindo ajustes concretos.

Enquanto isso:

`ready_for_frontend: yes`

`approved_by: Cassiano`

`artifact_ref: docs/design/STUDIO_RADIO_APPROVAL_PACKAGE_V1.md`

Aprovado por Cassiano na conversa em 29/09/2026 para seguir à implementação visual do primeiro recorte.
