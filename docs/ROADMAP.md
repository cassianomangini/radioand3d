# Roadmap

## Agora

O site ainda não foi lançado. Em 05/10/2026 Cassiano aceitou os três passos que estavam abertos: a passagem da Rádio no desktop, as barras numa faixa real e a entrada do Estúdio em `/studio`. Não há correção de movimento, visualizador ou Estúdio na fila.

## Próximos passos

Não há passo de produto aberto. Publicar espera Cassiano definir o alvo (E2). Conteúdo novo do Estúdio entra quando ele entregar peça e fotos (E3). Letras, Inbox, biblioteca editorial e C2–C8 continuam fora da fila.

## Sequência

| ID | Entrega | Estado | Situação |
| --- | --- | --- | --- |
| 00 | Organizar documentação | done | Contratos e perfis separados |
| 01 | Base técnica e material piloto | blocked | Stack local fechada. Privacidade, serviços remotos, origem dos dados 3D e material de lançamento continuam com Cassiano; não travam a Home local |
| 02 | Aplicação e verificações mínimas | done | App, lockfile, lint, tipos, build e CI na `main` |
| 03 | Contrato visual Estúdio + Rádio | done | Aprovado por Cassiano; pacote em [STUDIO_RADIO_APPROVAL_PACKAGE_V1.md](design/STUDIO_RADIO_APPROVAL_PACKAGE_V1.md) |
| 03b | Base visual compartilhada | done | Cassiano aceitou a passagem da Rádio em 05/10/2026; [checklist](work/03b-frontend-foundation.md) |
| 04 | Biblioteca e ingestão | blocked | Fora do caminho atual |
| 05 | Music Inbox | blocked | Fora do caminho atual |
| 06 | Motor de rádio e visualizador | done | Cassiano aceitou as barras em 05/10/2026; [checklist](work/06-radio-engine.md) |
| 06b | Letras sincronizadas | blocked | Painel e pipeline existem. Uma faixa real só quando Cassiano pedir; [checklist](work/06b-synced-lyrics.md) |
| 07 | Rádio pronta na interface | dropped | A Rádio visível é a da Home, nas entregas 03b e 06. Não há uma segunda construção |
| 08 | Entrada do Estúdio | done | Cassiano aceitou a entrada atual em 05/10/2026. Peça e fotos novas esperam E3 |
| 09 | Validar marco para lançamento | blocked | Espera o alvo de publicação (E2) |

## Bloqueios externos

| Código | Pendência | Quem resolve | O que bloqueia |
| --- | --- | --- | --- |
| E1 | Confirmar repositório privado | Cassiano | Cópia de conteúdo privado |
| E2 | Aprovar alvo, autenticação e orçamento | Cassiano | Escritas remotas e publicação |
| E3 | Selecionar peça, fotos e permissões | Cassiano | Conteúdo real do Estúdio no lançamento |
| E5 | Definir origem dos dados 3D e o contato | Cassiano | Catálogo 3D e chamadas comerciais |

## Regras

Este arquivo é a única sequência. O checklist da entrega guarda evidência e não abre outra fila. Um passo fechado não volta como trabalho novo. C1–C8, quando citados no [plano de movimento](design/CM_MOTION_EXPERIENCE_PLAN_V1.md), descrevem qualidade; não autorizam implementação enquanto esta fila estiver vazia.
