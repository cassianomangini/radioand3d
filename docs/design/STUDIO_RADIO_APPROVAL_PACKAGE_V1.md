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
Header
┌──────────────────────────────────────────────┬─────────────────┐
│ ESTÚDIO DE IMPRESSÃO 3D                     │ CM RÁDIO        │
│ Ideias que ganham forma.                    │ full player     │
│ copy + CTA                                  │ biblioteca      │
│ mídia real / placeholder editorial           │ visualizador    │
│                                              │ resize/expand   │
├──────────────────────────────────────────────┤                 │
│ Do arquivo ao objeto real.                  │                 │
│ conteúdo 3D real quando existir              │                 │
└──────────────────────────────────────────────┴─────────────────┘
```

Não existe mini player no desktop.

### Mobile

```text
Header
MiniPlayer
ESTÚDIO DE IMPRESSÃO 3D
Ideias que ganham forma.
mídia
Do arquivo ao objeto real.
conteúdo 3D real quando existir
```

A Rádio completa abre sob demanda.

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

`ready_for_frontend: no`

`approved_by: null`

`artifact_ref: docs/design/STUDIO_RADIO_APPROVAL_PACKAGE_V1.md`

Quando aprovado, atualizar os três campos no mesmo PR ou em um PR curto de gate antes de iniciar a implementação.
