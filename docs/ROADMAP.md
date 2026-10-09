# Roadmap

## Agora

O site ainda não foi lançado. Em 05/10/2026 Cassiano aceitou a passagem da Rádio, as barras e a entrada do Estúdio que já estava na Home. A fila da Rádio está fechada. C1–C8 não voltam como implementação.

A frente aberta é o Estúdio público: Impressões, Orçamento e Produtos, com Impressão 3D sob demanda, Placas e Caixas. O plano está em [STUDIO_GROWTH_PLAN_V1.md](STUDIO_GROWTH_PLAN_V1.md) e a execução em [08](work/08-studio-growth.md). O hub visual foi aprovado. Em 05/10/2026, Cassiano autorizou explicitamente avançar toda a **estrutura, copy, rotas, estados e SEO que não dependam da mídia final**, usando placeholders neutros. O `ready_for_frontend: no` do handoff agora bloqueia apenas a cristalização visual final/mídia das superfícies ainda pendentes, não o trabalho estrutural já autorizado.

## Evolução da qualidade visual — subfrente 08V

O plano de evolução render-first, catálogo de bibliotecas, reuso do QA já existente, laboratório e piloto isolado fica em [08V — Evolução visual](work/08-visual-quality-evolution.md). A auditoria foi concluída; V1 teve contratos/agentes atualizados (importação pessoal da skill pendente), V2 opera capturas e Playwright em cinco perfis, V3 tem catálogo/receitas. **V4.1–V4.3 concluídos:** laboratório isolado em `/dev/visual-lab` com três alternativas de Impressões, quatro viewports comparados, 30 testes públicos e 16 do laboratório no CI (sem retries), ver [evidência](work/evidence/08v-lab-performance-2026-10-09.md). **V4.4/V4.5 esperam seleção/aprovação de Cassiano.** V2 ainda não tem baselines visuais aprovadas, V5/V6 não começaram. Este documento não reabre a Rádio aceita e não substitui a fila funcional do Estúdio.

## Próximos passos

1. **Concluído nos PRs #29 e #30:** contrato local/serializável do Orçamento, arquivos reais em memória, política de formatos/limites, payload versionado, validação estrutural compartilhável e triagem inicial backend-neutral.
2. **E2 — projeto Supabase definitivo verificado:** usuário criou **Cmangini3d** (organização Free) e o projeto CM limpo em **São Paulo (`sa-east-1`)**. SQL acessível, nenhuma tabela/migration de negócio; staging legado inativo. **Próxima etapa:** migrations versionadas, RLS/grants, Storage privado, backend e segurança; não publicar fluxo antes do gate. [Checklist E2](work/08-supabase-provisioning.md).
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
| E2 | **Em andamento:** projeto CM novo verificado em São Paulo/organização independente; banco ainda sem schema, Storage ou segredos. [Checklist](work/08-supabase-provisioning.md) | CM Infra / CM Data | Versionar e validar migrations/RLS, aplicar no alvo, bucket privado, handlers, smoke e publicação |
| E4 | **Pendente, separado de E2:** integração de Produtos/Shopee Admin → catálogo público CM; 9 registros estáticos em uso até paridade/cutover | CM Products / Integração | Atualização automática e décimo produto sem mudança no `radioand3d` |
| E3 | Selecionar peça, fotos e permissões | Cassiano | Conteúdo real do Estúdio no lançamento |
| E5 | Definir contato comercial de continuidade | Cassiano | Chamadas comerciais e continuidade após triagem |

## Regras

Este arquivo é a única sequência. O checklist da entrega guarda evidência e não abre outra fila. Um passo fechado não volta como trabalho novo. C1–C8, quando citados no [plano de movimento](design/CM_MOTION_EXPERIENCE_PLAN_V1.md), descrevem qualidade; não autorizam implementação enquanto a Rádio estiver aceita.
