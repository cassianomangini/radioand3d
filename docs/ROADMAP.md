# Roadmap

## Agora

O site ainda não foi lançado. Em 05/10/2026 Cassiano aceitou a passagem da Rádio, as barras e a entrada do Estúdio que já estava na Home. A fila da Rádio aceita permanece fechada e C1–C8 não voltam como implementação **exceto a evolução pontual 03c — Dock na navbar, pedida em 09/10/2026, sem substituir os movimentos aceitos**.

A frente aberta é o Estúdio público: Impressões, Orçamento e Produtos, com Impressão 3D sob demanda, Placas e Caixas. Em 12/10 foi integrado à `main` o hub fotográfico com carrossel de Impressões, galeria por projeto e CTAs CM para Orçamento; a cor laranja continua reservada a Produtos/Shopee. O CI 38252416649 passou. As fotos do usuário continuam somente na pasta local ignorada `output/Fotos Impressoes`, aguardando `pnpm studio:media` e revisão final de mídia. O plano está em [STUDIO_GROWTH_PLAN_V1.md](STUDIO_GROWTH_PLAN_V1.md) e a execução em [08](work/08-studio-growth.md). O hub visual foi aprovado. Em 05/10/2026, Cassiano autorizou explicitamente avançar toda a **estrutura, copy, rotas, estados e SEO que não dependam da mídia final**, usando placeholders neutros. O `ready_for_frontend: no` do handoff agora bloqueia apenas a cristalização visual final/mídia das superfícies ainda pendentes, não o trabalho estrutural já autorizado.

Em 16/10 Cassiano forneceu o mock da primeira etapa de Orçamento e pediu a adequação da página, mantendo as quatro imagens das opções para gerar depois. A direção mais recente remove a explicação e os três passos com ícones: “Conte o que você precisa.” fica em uma linha e o painel começa logo abaixo. A etapa 1 avança pelo clique no card, sem ações redundantes no rodapé; o cenário usa escala contida e o título tem camada escura própria. Com Rádio recolhida, a etapa deve caber em 1250 × 542 px; com Rádio lateral, a grade 2×2 permanece até o Estúdio chegar perto de metade da largura. A implementação e a autorrevisão local estão no recorte da entrega 08; aceite final do render e integração de envio continuam pendentes.

## Evolução da qualidade visual — subfrente 08V

O plano de evolução render-first, catálogo de bibliotecas, reuso do QA já existente, laboratório e piloto isolado fica em [08V — Evolução visual](work/08-visual-quality-evolution.md). A auditoria foi concluída; V1 teve contratos/agentes atualizados (importação pessoal da skill pendente), V2 opera capturas e Playwright em cinco perfis, V3 tem catálogo/receitas. **V4.1–V4.3 concluídos tecnicamente:** laboratório isolado em `/dev/visual-lab` com três fixtures de Impressões, quatro viewports comparados, 30 testes públicos e 16 do laboratório no CI (sem retries), ver [evidência](work/evidence/08v-lab-performance-2026-10-09.md). **Em 09/10 Cassiano constatou que os três protótipos não partiam do visual real do site; foram rejeitados como direção de arte.** [Auditoria CM](design/CM_SITE_VISUAL_IDENTITY_AUDIT_V1.md) concluída documentalmente, mas inspeção da rota-alvo/mobile e nova composição contextual ainda pendentes. **V4.4/V4.5 não podem selecionar nenhuma das três variantes antigas.** V2 ainda não tem baselines visuais aprovadas, V5/V6 não começaram. Este documento não reabre a Rádio aceita e não substitui a fila funcional do Estúdio.

## Nova evolução pontual — 03c Rádio para navbar

Em 09/10/2026, Cassiano pediu que arrastar a Rádio lateral **para a direita** faça a superfície **subir para a navbar** e virar um **player compacto**, liberando o Estúdio. A Rádio lateral volta por botão no header ou arrastando da borda direita para a esquerda. **Localização fixada por Cassiano em seguida:** mini imediatamente antes dos ícones sociais existentes, no conjunto de ações da direita, e, após a V2, **a navegação Início/Estúdio/Rádio foi aproximada do logo somente no modo docked para liberar mais largura ao player**. O menu lateral original permanece intacto. Referência verificada: `cassianomangini/artesopolis-landing/src/components/navbar.tsx`. Esse estado será exclusivamente desktop e não duplica o áudio nem o player móvel. [Contrato de direção e movimento](design/CM_RADIO_NAVBAR_DOCK_V1.md) · [Checklist 03c](work/03c-radio-navbar-dock.md).

**Estado:** `in_progress`: após D4.1–D4.3 Cassiano **autorizou a integração funcional**, mantendo **D5 visual em aberto** porque o mini ainda não está bem centralizado entre o menu e os botões sociais. O estado `docked`, WAAPI/FLIP, mini com 13 barras reais, overshoot e retorno por botão/edge, navegação e fullscreen foram integrados na Home/Estúdio. [E2E integrado 38141001848](https://github.com/cassianomangini/radioand3d/actions/runs/38141001848): **12 testes passaram**, cobrindo áudio WAV, 13 bandas, cancelamento, interrupção de voo, rotas, fullscreen e `1180→390→1440`. [CI 38141001879](https://github.com/cassianomangini/radioand3d/actions/runs/38141001879): lint/typecheck/unit/build verdes. [Relatório](work/evidence/03c-radio-dock-integrated-2026-10-11.md). **I1–I6 e Q1/Q2/Q4/Q5/Q7 completos funcionalmente; Q3 complementar, D5 e Q6 pendentes.** Não houve deploy manual.

## Evolução — 06c Compartilhar músicas e métricas

**Estado: 06c-A/B implementadas e verificadas localmente; revisão visual final de Cassiano e publicação remota pendentes.** [Plano de compartilhamento e audiência](RADIO_SHARING_METRICS_PLAN_V1.md) e [checklist/evidências](work/06c-radio-sharing-links.md). As 343 gravações atuais aprovadas têm ID, slug e versão principal explícitos; `/musica/[slug]` reutiliza a Home, mantém o player único, prioriza a faixa na fila e gera prévia social. 06c-C contadores econômicos e 06c-D análise/ranking continuam posteriores, sem implementação de Supabase nesta entrega. Não reabrir a interface aceita da Rádio nem bloquear a frente 08 do Estúdio.

## Próximos passos

1. **Concluído nos PRs #29 e #30:** contrato local/serializável do Orçamento, arquivos reais em memória, política de formatos/limites, payload versionado, validação estrutural compartilhável e triagem inicial backend-neutral.
2. **E2 — infraestrutura de Storage e quota aplicada:** projeto Supabase CM na organização Free Cmangini3d, São Paulo. Quatorze migrations versionadas; seis tabelas privadas com RLS, bucket `quote-intake` privado e reserva global de 600 MB. **Handlers em código:** `/api/quote/session`, `/api/quote/attachments/init`, `/api/quote/attachments/complete`, `/api/quote/submit`, com sessão/posse, CSRF, rate limit e validação de assinatura preliminar de arquivo; **flag desligada por padrão**. RPCs complete/submit testadas em SQL com rollback. **CI do E2 passou (lint/typecheck, 124 testes e build)**; retenção HTTP/SQL e expurgo de dados privados implementados; **smoke TUS/Storage físico `small` passou em 12/10/2026**, [Action #38233821447](https://github.com/cassianomangini/radioand3d/actions/runs/38233821447): rota assinada `/resumable/sign`, STL de 134 bytes, HEAD/PATCH, Range 206, negação anônima e teardown confirmado. **Ainda faltam** `resume` multichunk, integração do orçamento owner-bound, validação de 3MF/retention, secrets Vercel/Cron e ativação comercial. Intake público desativado. [Checklist E2](work/08-supabase-provisioning.md).
3. **E4 — ponte de Produtos independente e pendente:** o catálogo atual é uma curadoria estática; o consumidor read-only do Admin e o cutover live ainda devem ser executados conforme [Product Catalog Bridge V1](PRODUCT_CATALOG_BRIDGE_PLAN_V1.md).
4. **Próximo bloco de conteúdo depende de E3:** dataset/fotos reais de Impressões, Placas e Caixas e revisão visual final das superfícies restantes.
5. **Gate de lançamento:** domínio/alvo público, retirada controlada do `noindex`, Search Console e validações finais continuam depois de E2/E3.

Letras, Inbox, biblioteca editorial e C2–C8 continuam fora da fila. O Estúdio não altera o motion spine da Rádio.

## Sequência

| ID | Entrega | Estado | Situação |
| --- | --- | --- | --- |
| 00 | Organizar documentação | done | Contratos e perfis separados |
| 01 | Base técnica e material piloto | blocked | Stack local fechada. Privacidade, serviços remotos, origem dos dados 3D e material de lançamento continuam com Cassiano; não travam a Home local |
| 02 | Aplicação e verificações mínimas | done | App, lockfile, lint, tipos, build e CI na `main` |
| 03 | Contrato visual Estúdio + Rádio | done | Aprovado por Cassiano; pacote em [STUDIO_RADIO_APPROVAL_PACKAGE_V1.md](design/STUDIO_RADIO_APPROVAL_PACKAGE_V1.md) |
| 03b | Base visual compartilhada | done | Cassiano aceitou a passagem da Rádio em 05/10/2026; [checklist](work/03b-frontend-foundation.md) |
| 03c | Rádio — dock reversível no header desktop | in_progress | **Dock funcional integrado na Home/Estúdio (WAAPI, visualizador/gestos/fullscreen/rotas)**; [12 browser tests + CI verde](work/evidence/03c-radio-dock-integrated-2026-10-11.md). **Q3 complementar + D5 (espaçamento central do mini) e Q6 (aceite visual final) em aberto.** [Checklist](work/03c-radio-navbar-dock.md) |
| 04 | Biblioteca e ingestão | blocked | Fora do caminho atual |
| 05 | Music Inbox | blocked | Fora do caminho atual |
| 06 | Motor de rádio e visualizador | done | Cassiano aceitou as barras em 05/10/2026; [checklist](work/06-radio-engine.md) |
| 06c-A/B | Identidade e links individuais da Rádio | in_progress | Implementação e QA local concluídos; aceite visual final de Cassiano e publicação remota pendentes. [Checklist](work/06c-radio-sharing-links.md) |
| 06b | Letras sincronizadas | blocked | Painel e pipeline existem. Uma faixa real só quando Cassiano pedir; [checklist](work/06b-synced-lyrics.md) |
| 07 | Rádio pronta na interface | dropped | A Rádio visível é a da Home, nas entregas 03b e 06. Não há uma segunda construção |
| 08 | Estúdio público: aquisição, orçamento e produtos | in_progress | Hub, orçamento, produtos, impressão sob demanda, Placas, Caixas e Search. [checklist](work/08-studio-growth.md) |
| 09 | Validar marco para lançamento | blocked | Espera o gate do Estúdio e o alvo de publicação (E2) |

## Frente do Estúdio

Contratos: [Search](STUDIO_SEARCH_DISCOVERY_V1.md), [Orçamento](STUDIO_QUOTE_FLOW_V1.md), [Supabase](SUPABASE_INFRASTRUCTURE_V1.md), [Catálogo 3D](CATALOG_3D.md), [ponte de Produtos](PRODUCT_CATALOG_BRIDGE_PLAN_V1.md), [wireframes](design/STUDIO_COMMERCE_WIREFRAMES_V1.md) e [mídia](design/STUDIO_MEDIA_INVENTORY_V1.md).

Ordem interna: contrato e gate de experiência, fundação de Search e rotas, hub, Impressões, impressão sob demanda, Placas, Caixas, Orçamento, Produtos, gate de lançamento e crescimento por dados. A **arquitetura** de Produtos está contratada como projeção editorial controlada do Artesópolis Admin/Shopee, mas a integração live **não está implantada**; o snapshot estático atual é transitório até o cutover definido em [PRODUCT_CATALOG_BRIDGE_PLAN_V1.md](PRODUCT_CATALOG_BRIDGE_PLAN_V1.md). Infraestrutura de Search e Supabase que não cristalize layout pode avançar com o gate visual ainda aberto.

## Bloqueios externos

| Código | Pendência | Quem resolve | O que bloqueia |
| --- | --- | --- | --- |
| E1 | Confirmar repositório privado | Cassiano | Cópia de conteúdo privado |
| E2 | **Em andamento:** bucket privado, quotas com locks e rate limit SQL testados; quatro rotas (`session`, `init`, `complete`, `submit`) em código com feature flag OFF, correções TUS/3MF/idempotência e rota privada de retenção implementadas (CI/SQL mockados verdes); primeiro teste físico 10/10 FAIL (rota JWT incorreta), **reteste `small` 12/10 PASS** (TUS assinado, Range e cleanup), ainda **sem `resume` multichunk e sem E2E de orçamento**, secrets Vercel ou publicação. [Checklist](work/08-supabase-provisioning.md) | CM Infra / CM Data | Handlers autenticados, signed TUS, inspeção, limpeza Storage API, E2E, smoke e publicação |
| E4 | **Pendente, separado de E2:** integração de Produtos/Shopee Admin → catálogo público CM; 9 registros estáticos em uso até paridade/cutover | CM Products / Integração | Atualização automática e décimo produto sem mudança no `radioand3d` |
| E3 | Selecionar peça, fotos e permissões | Cassiano | Conteúdo real do Estúdio no lançamento |
| E5 | Definir contato comercial de continuidade | Cassiano | Chamadas comerciais e continuidade após triagem |

## Regras

Este arquivo é a única sequência. O checklist da entrega guarda evidência e não abre outra fila. Um passo fechado não volta como trabalho novo. C1–C8, quando citados no [plano de movimento](design/CM_MOTION_EXPERIENCE_PLAN_V1.md), descrevem qualidade; não autorizam implementação enquanto a Rádio estiver aceita.
