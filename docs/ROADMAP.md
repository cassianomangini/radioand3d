# Roadmap

## Agora

O site ainda não foi lançado. Em 05/10/2026 Cassiano aceitou a passagem da Rádio, as barras e a entrada do Estúdio que já estava na Home. A fila da Rádio aceita permanece fechada e C1–C8 não voltam como implementação **exceto a evolução pontual 03c — Dock na navbar, pedida em 09/10/2026, sem substituir os movimentos aceitos**.

A frente aberta é o Estúdio público: Impressões, Orçamento e Produtos, com Impressão 3D sob demanda, Placas e Caixas. O plano está em [STUDIO_GROWTH_PLAN_V1.md](STUDIO_GROWTH_PLAN_V1.md) e a execução em [08](work/08-studio-growth.md). O hub visual foi aprovado. Em 05/10/2026, Cassiano autorizou explicitamente avançar toda a **estrutura, copy, rotas, estados e SEO que não dependam da mídia final**, usando placeholders neutros. O `ready_for_frontend: no` do handoff agora bloqueia apenas a cristalização visual final/mídia das superfícies ainda pendentes, não o trabalho estrutural já autorizado.

## Evolução da qualidade visual — subfrente 08V

O plano de evolução render-first, catálogo de bibliotecas, reuso do QA já existente, laboratório e piloto isolado fica em [08V — Evolução visual](work/08-visual-quality-evolution.md). A auditoria foi concluída; V1 teve contratos/agentes atualizados (importação pessoal da skill pendente), V2 opera capturas e Playwright em cinco perfis, V3 tem catálogo/receitas. **V4.1–V4.3 concluídos tecnicamente:** laboratório isolado em `/dev/visual-lab` com três fixtures de Impressões, quatro viewports comparados, 30 testes públicos e 16 do laboratório no CI (sem retries), ver [evidência](work/evidence/08v-lab-performance-2026-10-09.md). **Em 09/10 Cassiano constatou que os três protótipos não partiam do visual real do site; foram rejeitados como direção de arte.** [Auditoria CM](design/CM_SITE_VISUAL_IDENTITY_AUDIT_V1.md) concluída documentalmente, mas inspeção da rota-alvo/mobile e nova composição contextual ainda pendentes. **V4.4/V4.5 não podem selecionar nenhuma das três variantes antigas.** V2 ainda não tem baselines visuais aprovadas, V5/V6 não começaram. Este documento não reabre a Rádio aceita e não substitui a fila funcional do Estúdio.

## Nova evolução pontual — 03c Rádio para navbar

Em 09/10/2026, Cassiano pediu que arrastar a Rádio lateral **para a direita** faça a superfície **subir para a navbar** e virar um **player compacto**, liberando o Estúdio. A Rádio lateral volta por botão no header ou arrastando da borda direita para a esquerda. **Localização fixada por Cassiano em seguida:** mini imediatamente antes dos ícones sociais existentes, no conjunto de ações da direita, preservando a navegação principal centralizada. Referência verificada: `cassianomangini/artesopolis-landing/src/components/navbar.tsx`. Esse estado será exclusivamente desktop e não duplica o áudio nem o player móvel. [Contrato de direção e movimento](design/CM_RADIO_NAVBAR_DOCK_V1.md) · [Checklist 03c](work/03c-radio-navbar-dock.md).

**Estado:** `in_progress` na fase de aprovação visual. D1–D4 concluídos: contrato + [prévia interativa contextual com shell real](work/evidence/03c-radio-dock-preview-2026-10-09.md), **6 testes Playwright renderizados passaram**, vídeo e screenshots da Rádio lateral, subida ao mini antes das redes sociais e retorno. **D5 (aprovação visual), I1–I6 (integração pública) e Q1–Q7 (QA final) permanecem pendentes.** Isso **não** revoga o aceite anterior da Rádio nem altera a prioridade funcional do Estúdio.

## Próximos passos

1. **Concluído nos PRs #29 e #30:** contrato local/serializável do Orçamento, arquivos reais em memória, política de formatos/limites, payload versionado, validação estrutural compartilhável e triagem inicial backend-neutral.
2. **E2 — infraestrutura de Storage e quota aplicada:** projeto Supabase CM na organização Free Cmangini3d, São Paulo. Nove migrations versionadas; cinco tabelas privadas com RLS, bucket `quote-intake` privado e reserva global de 600 MB. **Handlers em código:** `/api/quote/session`, `/api/quote/attachments/init`, `/api/quote/attachments/complete`, `/api/quote/submit`, com sessão/posse, CSRF, rate limit e validação de assinatura preliminar de arquivo; **flag desligada por padrão**. RPCs complete/submit testadas em SQL com rollback. **Pendente:** validação integral de CI/HTTP, upload TUS real (incluindo URL retomável), Storage API cleanup, secrets/Cron, E2E e ativação comercial. Intake público desativado. [Checklist E2](work/08-supabase-provisioning.md).
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
| 03c | Rádio — dock reversível no header desktop | in_progress | **D1–D4 concluídos, incluindo preview dev-only com vídeo e 6 testes de browser**; mini antes de redes sociais, retorno por botão/arraste. Aprovação estética D5 e implementação pública I1–I6 pendentes. [Checklist](work/03c-radio-navbar-dock.md) |
| 04 | Biblioteca e ingestão | blocked | Fora do caminho atual |
| 05 | Music Inbox | blocked | Fora do caminho atual |
| 06 | Motor de rádio e visualizador | done | Cassiano aceitou as barras em 05/10/2026; [checklist](work/06-radio-engine.md) |
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
| E2 | **Em andamento:** bucket privado, quotas com locks e rate limit SQL testados; quatro rotas (`session`, `init`, `complete`, `submit`) em código com feature flag OFF, correções de TUS/3MF/idempotência aplicadas; ainda sem upload/submit **real** nem secrets na Vercel. [Checklist](work/08-supabase-provisioning.md) | CM Infra / CM Data | Handlers autenticados, signed TUS, inspeção, limpeza Storage API, E2E, smoke e publicação |
| E4 | **Pendente, separado de E2:** integração de Produtos/Shopee Admin → catálogo público CM; 9 registros estáticos em uso até paridade/cutover | CM Products / Integração | Atualização automática e décimo produto sem mudança no `radioand3d` |
| E3 | Selecionar peça, fotos e permissões | Cassiano | Conteúdo real do Estúdio no lançamento |
| E5 | Definir contato comercial de continuidade | Cassiano | Chamadas comerciais e continuidade após triagem |

## Regras

Este arquivo é a única sequência. O checklist da entrega guarda evidência e não abre outra fila. Um passo fechado não volta como trabalho novo. C1–C8, quando citados no [plano de movimento](design/CM_MOTION_EXPERIENCE_PLAN_V1.md), descrevem qualidade; não autorizam implementação enquanto a Rádio estiver aceita.
