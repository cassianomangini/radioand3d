# Roadmap

## Agora

O site ainda não foi lançado. Em 05/10/2026 Cassiano aceitou a passagem da Rádio, as barras e a entrada do Estúdio que já estava na Home. A fila da Rádio está fechada. C1–C8 não voltam como implementação.

A frente aberta é o Estúdio público: Impressões, Orçamento e Produtos, com Impressão 3D sob demanda, Placas e Caixas. O plano está em [STUDIO_GROWTH_PLAN_V1.md](STUDIO_GROWTH_PLAN_V1.md) e a execução em [08](work/08-studio-growth.md). O hub visual foi aprovado. Em 05/10/2026, Cassiano autorizou explicitamente avançar toda a **estrutura, copy, rotas, estados e SEO que não dependam da mídia final**, usando placeholders neutros. O `ready_for_frontend: no` do handoff agora bloqueia apenas a cristalização visual final/mídia das superfícies ainda pendentes, não o trabalho estrutural já autorizado.

## Próximos passos

1. Fechar o contrato serializável do Orçamento: payload versionado, validação estrutural compartilhável e triagem inicial sem depender de provider remoto.
2. Backend remoto do Orçamento: storage privado, inspeção de conteúdo server-side, retenção, persistência, execução da triagem e confirmação — bloqueado até a escolha explícita do alvo em E2.
3. Conteúdo real de Impressões/Placas/Caixas e revisão visual final ficam para a etapa de mídia, conforme decisão de deixar imagens por último.
4. Publicação continua bloqueada por E2; produção permanece `noindex` até o gate de lançamento.

Letras, Inbox, biblioteca editorial e C2–C8 continuam fora da fila. O Estúdio não altera o motion spine da Rádio.

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
| 08 | Estúdio público: aquisição, orçamento e produtos | in_progress | Hub, orçamento, produtos, impressão sob demanda, Placas, Caixas e Search. [checklist](work/08-studio-growth.md) |
| 09 | Validar marco para lançamento | blocked | Espera o gate do Estúdio e o alvo de publicação (E2) |

## Frente do Estúdio

Contratos: [Search](STUDIO_SEARCH_DISCOVERY_V1.md), [Orçamento](STUDIO_QUOTE_FLOW_V1.md), [Catálogo 3D](CATALOG_3D.md), [wireframes](design/STUDIO_COMMERCE_WIREFRAMES_V1.md) e [mídia](design/STUDIO_MEDIA_INVENTORY_V1.md).

Ordem interna: contrato e gate de experiência, fundação de Search e rotas, hub, Impressões, impressão sob demanda, Placas, Caixas, Orçamento, Produtos, gate de lançamento e crescimento por dados. A origem pública inicial de Produtos está resolvida como projeção editorial controlada do Artesópolis Admin/Shopee; sincronização dinâmica não é requisito desta etapa. Infraestrutura de Search que não cristalize layout pode avançar com o gate visual ainda aberto.

## Bloqueios externos

| Código | Pendência | Quem resolve | O que bloqueia |
| --- | --- | --- | --- |
| E1 | Confirmar repositório privado | Cassiano | Cópia de conteúdo privado |
| E2 | Definir o projeto/backend remoto do CM e o alvo de publicação | Cassiano | Storage/persistência do Orçamento e publicação |
| E3 | Selecionar peça, fotos e permissões | Cassiano | Conteúdo real do Estúdio no lançamento |
| E5 | Definir contato comercial de continuidade | Cassiano | Chamadas comerciais e continuidade após triagem |

## Regras

Este arquivo é a única sequência. O checklist da entrega guarda evidência e não abre outra fila. Um passo fechado não volta como trabalho novo. C1–C8, quando citados no [plano de movimento](design/CM_MOTION_EXPERIENCE_PLAN_V1.md), descrevem qualidade; não autorizam implementação enquanto a Rádio estiver aceita.
