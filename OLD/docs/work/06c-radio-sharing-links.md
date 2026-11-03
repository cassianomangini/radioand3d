# Entrega 06c-A/B: links individuais da CM Rádio

## Identificação

ID do roadmap: 06c-A/B. Responsável: Codex (CM Frontend, com catálogo editorial mínimo). Branch/base/HEAD: `main`, `c0acdb4` após fast-forward em 17/10/2026. Contratos lidos: [plano 06c](../RADIO_SHARING_METRICS_PLAN_V1.md), [Rádio](../RADIO.md), [Biblioteca](../MUSIC_PIPELINE.md), [plano do produto](../PROJECT_PLAN.md). Dependências: todas as faixas atuais do R2 aprovadas por Cassiano para links individuais nesta conversa; domínio público e publicação remota ainda pendentes. O stash `06c local review before c0acdb4` preserva a revisão documental local anterior ao commit aprovado.

## Resultado e limites

Objetivo observável: `/musica/[slug]` apresenta a Home real com a faixa compartilhada no topo da fila/playlist em uma visita nova; a pessoa consegue ouvi-la no mesmo player, inclusive após bloqueio de autoplay. Navegação interna preserva a faixa atual até a escolha explícita. Mobile abre a Rádio expandida.

Incluído: catálogo editorial estável para o conjunto R2 aprovado, rota e metadados por faixa, ação de compartilhar/copiar, adaptação pontual da fila e QA desktop/mobile. Fora de escopo: Supabase, métricas 06c-C/D, Music Inbox, deploy e redesign da Rádio. Arquivos/áreas: `src/features/radio/`, `src/components/studio-radio/`, rota `/musica`, sitemap, testes e este checklist; não tocar no Artesopolis Admin nem no landing antigo. Autorização externa: publicação/deploy não incluídos no pedido.

## Checklist de execução

- [x] Base `main`/HEAD e dependências verificadas; diff local salvo em stash antes do fast-forward.
- [x] Direção funcional e critérios de aceite definidos no contrato 06c; aprovação das faixas atuais confirmada.
- [x] 06c-A: inventário R2 reconciliado com catálogo editorial de IDs/slugs/versões, mantendo chaves internas para áudio/letras/visualizador.
- [x] 06c-B: Home reutilizada na rota, fila real e playlist sincronizadas, autoplay com fallback, estado mobile e share.
- [x] Testes técnicos, navegador real desktop/mobile e escuta com mídia autorizada executados; resultados registrados.
- [x] Diff revisado; contratos/roadmap atualizados; pendências reais registradas.
- [ ] Cassiano aprova o resultado visual final e confirma alvo de publicação quando desejar disponibilizar os links externamente.

## Evidência

| Critério | Comando, cenário ou artefato | Resultado observado |
| --- | --- | --- |
| Identidade e publicação | Inventário R2 de leitura, comparação de chaves e `tests/radio-publications.test.mjs` | 343 chaves atuais = 343 gravações publicadas; nenhuma chave do inventário ficou sem manifesto, IDs e slugs únicos; novas chaves dependem de edição editorial. Homônimas têm links distintos. |
| Fila e continuidade | `tests/radio-queue.test.mjs`; navegador Chrome desktop 1440 × 900 em `localhost:3001` | Entrada por `2-17-am` mostrou a faixa em primeiro. Próxima avançou para a segunda linha. Durante reprodução de B, navegação interna por `Link` para A preservou `src`, tempo e único `<audio>`; CTA mudou para A, reordenou fila/playlist, e Próxima seguiu a segunda linha. Navegação com B pausada preservou `src` e `paused`. Navegação interna a partir da Home `idle` selecionou e tocou A no topo; o caso falhava antes do ajuste. |
| Browser desktop | [Captura da Home compartilhada](evidence/06c-desktop.png) | Home original com Estúdio e Rádio, faixa em destaque, áudio real R2 tocando, visualizador ativo; autorrevisão visual do agente sem alteração da composição aprovada. |
| Browser mobile | [Rádio aberta](evidence/06c-mobile-open.png), [Home após recolher](evidence/06c-mobile-home.png) | Em 390 × 844, dialog abre na entrada; após fechar, mini-player e Home aparecem, mesma instância de áudio permanece tocando. |
| Acabamento visual do compartilhamento após feedback de Cassiano | [Desktop 1440 × 900](evidence/06c-share-circle-desktop.png), [mobile 390 × 844](evidence/06c-share-circle-mobile.png); Chrome local em `/musica/gravity-for-the-dreamers-1` | A ação ficou circular no canto inferior direito da capa, com espaço reservado para o título. Cassiano fará a validação visual; nenhuma aprovação estética foi presumida. Servidor local 3001 encerrado a pedido dele. |
| Ação única de compartilhar | Browser mobile: `navigator.share` interceptado apenas para verificar o payload; fallback com `navigator.share` indisponível e leitura do clipboard | API de compartilhamento recebeu título e URL da faixa; fallback anunciou “Link da música copiado”, mostrou ✓ no botão e copiou `/musica/2-17-am`. O navegador manteve um único `<audio>`. A folha nativa do sistema não foi homologada por este teste. |
| Autoplay bloqueado e título longo | Chrome com `play()` inicial rejeitado por `NotAllowedError` em contexto isolado: [bloqueio](evidence/06c-mobile-autoplay-blocked.png), [título longo em 360 px](evidence/06c-mobile-long-title-blocked.png) | Uma tentativa na entrada; estado `blocked`, faixa selecionada e CTA visível. Clique produziu segunda tentativa e reprodução `playing`. Título longo não criou rolagem horizontal. |
| Metadados e compartilhamento | HTTP/HTML de `/musica/2-17-am`, imagem [Open Graph](evidence/06c-og.png), navegador `Copiar link` | HTTP 200, canonical e OG com título/imagem específicos, `noindex` local; imagem PNG 1200 × 630. Clipboard recebeu URL exata. Slug desconhecido devolveu HTTP 404. Prévia real do WhatsApp depende de domínio publicado. |
| Lint, typecheck, testes, build | `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`, `git diff --check`; repetidos após o ajuste visual | Todos passaram; suíte unitária final: 130/130 testes, incluindo troca de versão principal com ID/slug preservados. Build gerou as rotas dinâmicas `/musica/[slug]` e sua imagem social. |

## Retomada

Último ponto verificado: 06c-A/B implementadas na `main` sobre `c0acdb4`, com acabamento local do botão de compartilhamento revisto após feedback de Cassiano; sem push, PR ou deploy. O stash `06c local review before c0acdb4` continua preservado; não reaplicar automaticamente porque descreve decisão anterior incompatível. Pendências: aprovação visual final de Cassiano, domínio público/`SITE_URL` configurado para canonical estável em produção, teste de prévia no WhatsApp após publicação autorizada e etapas 06c-C/D futuras. Próximo passo: apresentar as novas capturas para aceite visual, depois publicar apenas com alvo confirmado. A autorrevisão técnica e visual acima foi feita pelo agente, não é aprovação humana.
