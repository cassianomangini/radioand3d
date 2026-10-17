# CM Rádio — links por música, compartilhamento e audiência

**Estado:** proposta de produto/arquitetura, registrada em 17/10/2026. **Sem autorização de implementação ou publicação.**
**Escopo:** Rádio pública do `radioand3d`; não modifica Estúdio, Artesopolis Admin ou layout aceito da Rádio.
**Fontes relacionadas:** [Rádio](RADIO.md), [Biblioteca](MUSIC_PIPELINE.md), [Experiência](EXPERIENCE.md), [Roadmap](ROADMAP.md).

## Objetivo

Permitir que alguém compartilhe **uma música específica** (não apenas a Home), que o destinatário a encontre e a reproduza em um clique consciente, e que Cassiano acompanhe quais faixas são mais ouvidas. Separar métricas de reprodução real de cliques, aberturas e tentativas de compartilhamento. Sem cadastro de ouvintes na V1.

## Estado verificado no código (17/10/2026)

- O player usa `RadioProvider` global e um único `audio`; qualquer nova rota deve preservar áudio/fila/volume e a continuidade nas transições.
- O catálogo de teste em R2 usa **a chave do objeto como ID de faixa** (`r2-catalog-core.ts`). Não usar essa chave nem um slug derivado apenas do nome do arquivo como identidade pública permanente.
- `src/lib/public-analytics.ts` apenas emite eventos no navegador para orçamento/produtos; **não envia métricas a backend** e não mede audições da Rádio.
- O catálogo editorial `tracks`/`track_versions` e o Music Inbox ainda não são a fonte da Rádio; a evolução não pode fingir que já existem em produção.

## 1. Compartilhamento e destino do link

1. URL pública individual canônica: `/musica/[slug]`, com slug legível e **identificador editorial persistente**, imune a mudanças de nome/objeto. Colisões de títulos têm sufixo estável. Alterações futuras de slug mantêm redirecionamento.
2. A página tem título, artista, capa real ou fallback CM, botão **Ouvir esta música**, botão **Compartilhar**, retorno à Rádio e metadados server-side (`title`, descrição, canonical, Open Graph e imagem social). Respeitar o `noindex` global antes do lançamento.
3. Recebedor do link: o servidor identifica a faixa publicada e renderiza a página corretamente mesmo sem JavaScript para bots de prévia. A reprodução **não começa automaticamente**; tocar no CTA seleciona a faixa pelo provider existente.
4. Navegação interna: abrir uma página de música **não troca ou reinicia automaticamente** o que já estiver tocando. Só a ação explícita `Ouvir` seleciona/toca a faixa do link. Não criar segundo `audio`.
5. Música arquivada/retirada: nunca tocar arquivo retirado. Apresentar indisponibilidade clara e link à Rádio; retirar também a fonte pública conforme o contrato editorial. Não deixar link quebrado retornar outra faixa aleatória.
6. Botão de compartilhar: no mobile usar `navigator.share` com gesto do usuário quando suportado; nos demais casos oferecer **Copiar link** com confirmação, e eventualmente atalhos de WhatsApp/Telegram se agregarem valor. Não presumir que chamar o share sheet prova envio concluído.
7. Desktop: ação discreta junto a título/Now Playing e, depois, no menu contextual de cada faixa da playlist. Mobile: ação dentro da Rádio expandida/detalhe, sem aumentar a altura do mini-player persistente. Não alterar a ordem de controles de transporte aprovada.

## 2. Significado dos contadores

**Reprodução qualificada (`qualified_play`)** é a métrica principal: uma tentativa da mesma faixa que acumulou ao menos **30 segundos de reprodução efetiva**; para áudios abaixo de 30 s, ao menos **50% da duração**. Somar intervalos reais em estado `playing`, sem transformar saltos de `seek` ou carregamento em tempo ouvido. Uma tentativa gera **no máximo um** evento qualificado. Pausa e retomada mantêm a tentativa; troca de música inicia outra; repetir a faixa só pode contar novo evento quando houver nova execução efetiva.

Medidas separadas, sem misturar conceitos:

| Métrica | Interpretação |
| --- | --- |
| `qualified_plays` | Execuções que atingiram o limiar de escuta, não pessoas únicas |
| `completions` | Execuções que chegaram ao fim **com escuta acumulada suficiente**, não saltos diretos para o final |
| `share_clicks` | Intenção de compartilhar; não confirma que o link foi enviado |
| `link_copies` | Cópia confirmada pela interface |
| `track_page_opens` | Aberturas da página da faixa; não equivalem a plays |
| `plays_from_track_page` | Execuções qualificadas iniciadas pelo CTA da página compartilhável |

**Não declarar ouvintes únicos, envios concluídos nem alcance em WhatsApp** sem uma medição realmente capaz de prová-los. `play()`, `timeupdate` e carregamento de URL de áudio não devem incrementar contador indiscriminadamente.

Visões desejadas: **últimos 7 dias, 30 dias e total histórico**, ranking por reproduções qualificadas, tendência por dia, relação abertura do link → audição, e compartilhamentos por faixa. A contagem pública poderá aparecer discretamente ao lado da faixa em destaque; ranking público `Mais ouvidas` é expansão posterior, com dados reais e sem reordenar a playlist aleatória por padrão.

## 3. Identidade, persistência e segurança

- Estabelecer primeiro um **ID editorial imutável** para cada música publicada. Se a biblioteca 04 ainda não estiver pronta, criar camada mínima e reconciliável de IDs/slug ↔ chave R2 **sem criar uma identidade paralela descartável**. Futuras versões de uma mesma música agregam no `track_id`; `version_id` pode detalhar versões, sem misturar músicas distintas com o mesmo título.
- Armazenar contagens no **Supabase próprio do CM 3D & Radio** (sem conexão com Artesopolis Admin). Estrutura sugerida: identidade pública da faixa, **contadores totais por faixa**, **agregados diários compactos** (uma linha por faixa/dia, com colunas de contadores) e chaves temporárias mínimas de idempotência; **não** manter histórico bruto de cada audição; confirmar nomes/esquema na implementação da frente Data.
- Uma API Next.js server-side recebe evento compacto `POST /api/radio/events` e expõe estatísticas públicas somente agregadas via `GET /api/radio/stats` (cache adequado). Checagem de elegibilidade, idempotência por tentativa/evento, transação, rate limit e expiração curta dos tokens de deduplicação. Nenhum log bruto permanente.
- Navegador **não recebe credencial privilegiada**, não escreve diretamente nas tabelas de métricas e não envia dados pessoais desnecessários. Aplicar grants/RLS adequados e não persistir IP ou fingerprint nos dados analíticos. Antiabuso precisa tornar contagens úteis, **não** alegar prevenção perfeita contra manipulação.
- Telemetria é **best effort**: falha, bloqueio de rede ou fila de métricas nunca travam áudio, visualizador, navegação ou CTA de compartilhamento. Não postar evento a cada segundo/tempo do visualizador. Consultar contagens em lote, sem uma consulta por linha da playlist.
- Painel de proprietário: primeira versão pode ser uma consulta/relatório restrito confiável sobre agregados; criar dashboard próprio apenas se necessário, sem instituir login para ouvintes.

## 4. Orçamento obrigatório: Supabase Free-first (decisão de restrição, 17/10/2026)

**Requisito prioritário de Cassiano: não exceder a capacidade gratuita disponível do projeto CM.** A implementação **não está autorizada** a ativar métricas sem conferir a ocupação real do banco e da organização. O conector disponível nesta revisão não expõe o projeto CM 3D & Radio, portanto **não há medição atual verificada**. Não confundir esta restrição com uma garantia absoluta de que o Free nunca sofre limites.

Limites oficiais consultados em 17/10/2026: Supabase Free oferece **500 MB de Database Size por projeto**, **1 GB de Storage** e **5 GB de egress por organização**, sujeitos à política Fair Use. Acima de 500 MB de banco, o projeto Free pode entrar em **read-only**. Fontes: https://supabase.com/pricing, https://supabase.com/docs/guides/platform/database-size e https://supabase.com/docs/guides/platform/billing-faq. Medir e revisar as quotas atuais antes do desenvolvimento.

### Arquitetura econômica obrigatória

1. **Primeiro entregar o link compartilhável sem depender de analytics:** IDs e slugs permanentes podem começar em manifesto pequeno, versionado e reconciliável com a futura biblioteca editorial. **Compartilhar links não escreve no banco**. As músicas continuam sendo servidas pelo Cloudflare R2, nunca copiadas ao Supabase Storage.
2. **No máximo um envio por reprodução qualificada**, nunca um request por segundo, barra do visualizador, `timeupdate`, render de componente ou mero play/pause. Eventos de link/cópia são opcionais e de baixa prioridade; usar agregados, não tabelas de clicks individuais.
3. Persistir **1 linha por faixa para contadores totais** e **no máximo 1 linha por faixa/dia** para estatísticas recentes. Conservar **até 90 dias** de agregados diários para 7d/30d; expurgar os mais antigos e preservar o total histórico. Para 343 faixas, o teto lógico teórico dos últimos 90 dias é **30.870 linhas diárias**, mesmo com muitos plays por faixa. Isso não equivale a uma medida real de bytes; índices, vacuum e tabelas já existentes consomem espaço adicional.
4. Tokens temporários de idempotência em tabela separada (por exemplo, prazo de **até 24 horas**), expurgados em lote. **Jamais reter um registro de cada play permanentemente**, IP ou fingerprint do visitante. Carga anormal: aplicar rate limit e suspender *apenas* os contadores opcionais para proteger orçamento e áudio.
5. **Leitura em cache** (por exemplo, 5–15 minutos) e recuperação em lote; nada de Supabase Realtime, polling por segundo, uma consulta para cada item da playlist, Edge Function por interação ou dashboard sempre conectado. Preferir API Next.js atual + operação atômica no Postgres com privilégios internos restritos.
6. **Limite operacional inicial proposto:** até **25 MB** de espaço de banco consumido pelas estruturas de analytics (aprox. 5% dos 500 MB); aviso interno a **15 MB**, desabilitar novas gravações de métricas ao se aproximar do teto até otimizar, e manter links/player operando. É uma **meta interna**, não quota oferecida pelo Supabase e não se pode garantir tamanho de tabelas sem medição.
7. **Proteger o projeto inteiro:** medir `Database Size`, `Storage` e `Egress` reais antes de ativar. Alerta operacional quando Database Size chegar a **350 MB**; **bloquear novos writes de analytics** perto de **400 MB** para preservar margem das funcionalidades essenciais. O orçamento de Orçamento/anexos continua independente das métricas de Rádio. A API deve falhar aberta para o usuário: música e compartilhamento continuam funcionando quando estatísticas estiverem desativadas.
8. Quotas Free **não devem disparar upgrade automático** no produto. Ao exceder limites, o Supabase pode restringir serviço; aceitar perda temporária das métricas é melhor que comprometer orçamento, armazenamento ou reprodução. Revisar consumo real mensalmente e sempre após pico de tráfego.

**Gate de aceite financeiro:** nenhuma tabela/evento de analytics em produção sem observação do projeto CM, teste de carga/rotinas de expurgo, cálculo medido do espaço e chave de desligamento independente das demais funcionalidades. Todo limite no código deve ser configurável e testado; não prometer 0 MB exatos de overhead.

## 5. Sequência de execução proposta (frente independente)

| Bloco | Entrega | Dependência | Aceite verificável |
| --- | --- | --- | --- |
| **06c-A** | Identidade pública persistente + mapeamento seguro do catálogo R2 | Definição de IDs/versões e domínio público | Faixas com títulos iguais têm URLs distintas; renomear objeto ou título não quebra URL; retirada tratada |
| **06c-B** | Rota individual, SEO/OG e ações Compartilhar/Copiar link | A | Link enviado abre a música correta; prévia social correta; play só com gesto; áudio atual preservado na navegação |
| **06c-C** | Evento de reprodução qualificada, deduplicação, agregação e contadores | A + banco CM e endpoint com proteção | Cliques, seeks, autoplay bloqueado e retry não inflam plays; repetição legítima contada por nova execução; erro de API não interfere na Rádio |
| **06c-D** | Visão das músicas mais ouvidas e do desempenho dos links | C, período suficiente de dados reais | Ranking 7d/30d/total, auditoria de agregados e distinção entre compartilhamentos e plays |

**Não bloquear o Estúdio atual nem exigir todo o Music Inbox antes de 06c-A**, mas fazer a identidade já compatível com o contrato editorial 04. Não promover uma decisão de design final sem validação do layout/fluxo.

## 6. Handoff de experiência e QA

**Superfícies:** player completo desktop e mobile, playlist, página individual da faixa. Mini-player mobile/dock desktop mantêm sua altura e função atuais. **Variação 4/10; movimento 3/10; densidade 7/10** para esta adição localizada.

**Verificar:** desktop amplo/estreito; mobile 390px; músicas curtas e títulos longos; 0/1/muitas faixas; aba nova com link; refresh; mudanças de rota; faixa removida; URL desconhecida; navegador sem Web Share; fallback de clipboard; teclado e leitor de tela; `prefers-reduced-motion`; Open Graph em HTML sem executar JS; métricas com seek, pause, repetição, buffering e abas simultâneas; sem dupla reprodução ou rerender contínuo.

**Não inventar:** números iniciais de plays, curtidas do coração (hoje indisponível), origem de ouvintes, prova de envio no WhatsApp, artwork não autorizado ou ranking automático baseado em cargas de página.

`ready_for_frontend: no` — requer decisão sobre identidade/página e aceite visual antes da alteração da interface.
`approved_by: pendente` — proposta em discussão, não decisão final de Cassiano.
`artifact_ref: docs/RADIO_SHARING_METRICS_PLAN_V1.md`
