# Entrega 03b: base visual compartilhada Estúdio + Rádio

## Objetivo

Implementar a primeira superfície real a partir do pacote visual aprovado por Cassiano, sem reabrir composição no código.

Artefato aprovado: `docs/design/STUDIO_RADIO_APPROVAL_PACKAGE_V1.md`.

## Escopo deste PR

- [x] Registrar `ready_for_frontend: yes` e `approved_by: Cassiano`.
- [x] Promover tokens CM aprovados para `src/styles/tokens.css`.
- [x] Aplicar Manrope + IBM Plex Mono no layout.
- [x] Substituir a tela de bootstrap pela Home do Estúdio + Rádio.
- [x] Desktop sem mini player.
- [x] Rádio desktop acoplada à direita.
- [x] Resize por pointer e teclado.
- [x] Botão expandir/recolher.
- [x] Mobile com header -> mini player -> Estúdio.
- [x] Rádio completa mobile em superfície dedicada.
- [x] Usar somente a faixa real de referência `Limite Elástico`, identificada como prévia.
- [x] Usar placeholder editorial para mídia 3D ainda não publicada.
- [x] Não criar produtos, materiais ou categorias fictícios.
- [x] CI: lint.
- [x] CI: typecheck.
- [x] CI: build.
- [x] Render real em 1440 px.
- [ ] Render real com Rádio expandida.
- [x] Render real em ~390 px.
- [ ] Revisão visual independente/Cassiano.

## Limite desta entrega

O transporte da Rádio neste PR demonstra estado visual. O motor de áudio, biblioteca real, storage e visualizador conectado ao áudio pertencem às entregas 04/06/07.

A Home continua `noindex` enquanto o marco integrado não estiver pronto.

## Aceite

Não considerar esta entrega concluída apenas por CI verde. O merge visual exige render real e aprovação da experiência.

`experience_review_status: incomplete`

`reviewed_by: implementação + captura automatizada; aguardando Cassiano/independente`


## Revisão humana de 29/09/2026

Cassiano revisou o front real em desktop e encontrou dois defeitos de fidelidade/implementação:

- a CM Rádio lateral não cabia inteira na altura útil e exigia scroll do painel;
- a navegação desktop ficou deslocada para a extrema direita, deixando a navbar visualmente desequilibrada.

Correção aberta em `fix/desktop-radio-fit-navbar`:

- [x] centralizar a navegação desktop dentro da navbar;
- [x] remover scroll do painel lateral da Rádio;
- [x] adaptar capa, gaps, controles e visualizador à altura útil do viewport;
- [x] manter eventual overflow futuro restrito à lista de faixas, não ao player inteiro;
- [x] validar captura desktop em altura curta próxima ao caso reportado (1760x824);
- [ ] receber nova revisão de Cassiano.

`experience_review_status: changes_required`

`reviewed_by: Cassiano`
