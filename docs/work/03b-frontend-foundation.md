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
- [ ] CI: lint.
- [ ] CI: typecheck.
- [ ] CI: build.
- [ ] Render real em 1440 px.
- [ ] Render real com Rádio expandida.
- [ ] Render real em ~390 px.
- [ ] Revisão visual independente/Cassiano.

## Limite desta entrega

O transporte da Rádio neste PR demonstra estado visual. O motor de áudio, biblioteca real, storage e visualizador conectado ao áudio pertencem às entregas 04/06/07.

A Home continua `noindex` enquanto o marco integrado não estiver pronto.

## Aceite

Não considerar esta entrega concluída apenas por CI verde. O merge visual exige render real e aprovação da experiência.

`experience_review_status: incomplete`

`reviewed_by: null`
