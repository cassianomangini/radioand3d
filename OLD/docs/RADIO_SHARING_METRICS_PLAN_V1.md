# CM Rádio — links por música, compartilhamento e audiência

**Estado:** direção funcional de 06c-A/B aprovada por Cassiano em 17/10/2026; implementação local e QA técnico/visual do agente realizados em 17/10/2026. Aprovação visual final de Cassiano e publicação remota pendentes. 06c-C/D seguem planejadas, sem autorização de ativação remota. [Evidências](work/06c-radio-sharing-links.md).
**Escopo:** Rádio pública do `radioand3d`; não modifica Estúdio, Artesopolis Admin ou layout aceito da Rádio.
**Fontes relacionadas:** [Rádio](RADIO.md), [Biblioteca](MUSIC_PIPELINE.md), [Experiência](EXPERIENCE.md), [Roadmap](ROADMAP.md).

## Objetivo

Permitir que alguém compartilhe **uma música específica** (não apenas a Home), que o destinatário chegue à **Home real do CM 3D & Radio com a Rádio contextualizada pela faixa** e consiga ouvi-la, e que Cassiano acompanhe quais faixas são mais ouvidas. Separar métricas de reprodução real de cliques, aberturas e tentativas de compartilhamento. Sem cadastro de ouvintes na V1.

## Estado verificado no código (17/10/2026)

- O player usa `RadioProvider` global e um único `audio`; qualquer nova rota deve preservar áudio/fila/volume e a continuidade nas transições.
- O manifesto 06c-A contém **343 gravações atuais aprovadas por Cassiano**, cada uma com ID editorial, slug permanente, versão principal e chave R2. O motor mantém a chave do objeto como ID interno (`r2-catalog-core.ts`); novas chaves do bucket não entram automaticamente no catálogo. Homônimas permanecem faixas distintas até decisão editorial de agrupamento.
- `/musica/[slug]` reutiliza a Home e o player existentes. O catálogo em memória evita listagem S3 por abertura e o compartilhamento não consulta Supabase. Metadados canônicos usam `SITE_URL` quando configurada; na ausência dela, usam a origem da requisição. `SITE_INDEXABLE` permanece desativado antes do lançamento.
- `src/lib/public-analytics.ts` apenas emite eventos no navegador para orçamento/produtos; **não envia métricas a backend** e não mede audições da Rádio.
- O catálogo editorial `tracks`/`track_versions` e o Music Inbox ainda não são a fonte da Rádio; a evolução não pode fingir que já existem em produção.

## 1. Decisão funcional aprovada — link abre a Home contextualizada

**A rota individual existe para metadados e compartilhamento, mas a página VISÍVEL é a Home original, não uma landing de música nem um redirecionamento para `/`.** Exemplo: `/musica/limite-elastico` renderiza a mesma experiência Estúdio + Rádio da Home, reutilizando seu shell e player. Não duplicar o markup visual da Home, o provider, o elemento `audio` nem manter segunda implementação de controles.

1. **Identidade/estado editorial (06c-A):** cada faixa publicada tem ID editorial estável, slug canônico criado uma vez e mapeamento para a versão principal e chave atual do R2. As chaves R2 permanecem operacionais para áudio, letras e sidecars de análise; a fila não deve quebrar com a identidade pública. Música retirada/rascunho não gera página pública. Publicação é a **mesma fonte de verdade** do catálogo, links e sitemap; não expor automaticamente todos os objetos do bucket.
2. **URL estável:** manter o primeiro slug publicado como canônico, mesmo se o título mudar. Músicas homônimas recebem slugs únicos. Se a versão principal for substituída intencionalmente, o mesmo link reproduz a nova principal. Aliases/redirecionamentos são evolução opcional apenas quando se decidir alterar um slug já distribuído.
3. **Entrada externa / nova aba sem sessão tocando na mesma instância:** carregar a Home; selecionar a faixa compartilhada; colocá-la **na primeira posição da ordem REAL da fila e da playlist visível**, com as restantes embaralhadas sem duplicatas; tentar `play()` apenas uma vez como melhor esforço. Se o navegador bloquear autoplay, deixar faixa selecionada e mostrar o CTA `▶ Ouvir [Título]`; mostrar `playing` apenas quando o motor confirmar. Depois do fim, continuar na fila embaralhada normalmente.
4. **Navegação interna com B já tocando e link para A:** **não interromper B, nem reordenar a fila na chegada**. Apresentar A como contexto de compartilhamento, com CTA `Ouvir A`, sem falsificar o Now Playing. Somente após o clique selecionar A, colocá-la em primeiro na sequência ativa e iniciar a reprodução. Preservar áudio, progresso e modos até essa ação. Isso vale também se B estiver pausada com contexto de escuta ativo; decidir pela ação explícita para evitar substituição inesperada.
   Quando a navegação interna parte da Home com o player `idle` ou `ended`, tratar o link como entrada sem sessão ativa: selecionar A, colocá-la no topo e tentar reproduzir.
5. **Desktop:** abrir Home com Rádio lateral visível quando a sessão for nova; não forçar alterações destrutivas de layout durante uma navegação interna. **Mobile:** na chegada externa abrir Rádio completa/expandida mostrando a faixa; ao fechar, voltar à Home com o mini-player persistente. Não introduzir mini-player duplicado no desktop nem aumentar indevidamente o dock na navbar.
6. **Compartilhamento:** botão discreto junto à faixa atual/playlist completa e acesso na página contextual. Usar `navigator.share` após gesto quando disponível e fallback `Copiar link` com feedback. Não assumir que abrir share sheet prova envio concluído. Sem alterar a ordem aprovada do transporte.
7. **Metadados do link:** `/musica/[slug]` tem `title`, descrição, canonical, Open Graph/Twitter e imagem social apropriados, gerados no servidor para prévia sem executar JS. Antes do lançamento respeitar `noindex`/robots; testar a prévia novamente em domínio público liberado. Sitemap apenas para músicas explicitamente publicadas.
8. **Desempenho:** manifesto/editorial estável ou catálogo cacheado, com estratégia de invalidação na publicação/retirada; **não listar todas as páginas do R2 em cada acesso ao link**. Compartilhar não grava no Supabase e música permanece no R2.

### Aceite mínimo da fila e da navegação

- URL externa de A → A visível em primeiro **tanto na playlist quanto na ordem de próximos avanços**; B/C/... embaralhadas; A não se repete por acidente; após fim de A vem a próxima faixa elegível.
- URL de A aberta internamente enquanto B toca → B continua, controles mostram B, A é apresentada como seleção opcional; somente o CTA muda para A.
- Bloqueio de autoplay → CTA visível, nenhuma indicação falsa de som, reprodução após clique sem montar outro áudio.
- Abertura, refresh e mudança rápida de rota não repetem inicialização, não recompõem a fila por `useEffect`/Strict Mode em loop, não desmontam o provider nem deixam controles ocultos na rota `/musica/...`.
- Título alterado e versão principal substituída preservam URL; rascunho/retirada dão estado indisponível sem selecionar outra música silenciosamente.
- Render igual à Home aprovada, em desktop e mobile; nova rota não duplica a Home nem interrompe a experiência de Estúdio.

## 2. Significado dos contadores

**Reprodução qualificada observada pelo player (`qualified_play`)** é a única métrica de reprodução da V1: uma tentativa da mesma faixa que acumulou ao menos **o menor valor entre 30 segundos e 50% da duração** de reprodução efetiva. Somar intervalos reais em estado `playing`, sem transformar saltos de `seek` ou carregamento em tempo ouvido. Uma tentativa gera **no máximo um** evento qualificado. Pausa e retomada mantêm a tentativa; troca de música inicia outra; repetir a faixa só pode contar novo evento quando houver nova execução efetiva.

Métricas conceitualmente separadas (na **V1 somente `qualified_plays`** e relatório privado; demais indicadores são evoluções que exigem especificação/controle adicional):

| Métrica | Interpretação |
| --- | --- |
| `qualified_plays` | Execuções que atingiram o limiar de escuta, não pessoas únicas |
| `completions` | Execuções que chegaram ao fim **com escuta acumulada suficiente**, não saltos diretos para o final |
| `share_clicks` | Intenção de compartilhar; não confirma que o link foi enviado |
| `link_copies` | Cópia confirmada pela interface |
| `track_page_opens` | Aberturas da página da faixa; não equivalem a plays |
| `plays_from_track_page` | Execuções qualificadas iniciadas pelo CTA da página compartilhável |

**Sem login, os eventos são declarações do navegador, não prova independente de escuta humana.** Não declarar ouvintes únicos, envios concluídos nem alcance em WhatsApp sem medição adequada. `play()`, `timeupdate` e carregamento de URL de áudio não devem incrementar contador indiscriminadamente.

**V1:** relatório privado por faixa com reproduções qualificadas observadas pelo player nos **últimos 7 dias, 30 dias e total histórico**. **Depois:** tendência por dia, aberturas e compartilhamentos e relação agregada de abertura → reprodução, sem apresentar essa razão como conversão comprovada de pessoas. A contagem pública poderá aparecer discretamente ao lado da faixa em destaque; ranking público `Mais ouvidas` é expansão posterior, com dados reais e sem reordenar a playlist aleatória por padrão.

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
2. **V1: no máximo um envio por tentativa de reprodução qualificada**, nunca um request por segundo, barra do visualizador, `timeupdate`, render de componente ou mero play/pause. **Não instrumentar `completion` nesta versão:** seria impossível inferir conclusão a partir do evento dos 30 segundos. Eventos de link/cópia são posteriores e opcionais; usar agregados, não tabelas de clicks individuais.
3. Persistir **1 linha por faixa para contadores totais** e **no máximo 1 linha por faixa/dia** para estatísticas recentes. Conservar **até 90 dias** de agregados diários para 7d/30d; expurgar os mais antigos e preservar o total histórico. Para 343 faixas, o teto lógico teórico dos últimos 90 dias é **30.870 linhas diárias**, mesmo com muitos plays por faixa. Isso não equivale a uma medida real de bytes; índices, vacuum e tabelas já existentes consomem espaço adicional.
4. Tokens temporários de idempotência em tabela separada (por exemplo, prazo de **até 24 horas**), expurgados em lote. **Jamais reter um registro de cada play permanentemente**, IP ou fingerprint do visitante. Carga anormal: aplicar rate limit e suspender *apenas* os contadores opcionais para proteger orçamento e áudio.
5. **Leitura em cache** (por exemplo, 5–15 minutos) e recuperação em lote; nada de Supabase Realtime, polling por segundo, uma consulta para cada item da playlist, Edge Function por interação ou dashboard sempre conectado. Preferir API Next.js atual + operação atômica no Postgres com privilégios internos restritos.
6. **Limite operacional inicial proposto:** até **25 MB** de espaço de banco consumido pelas estruturas de analytics (aprox. 5% dos 500 MB); aviso interno a **15 MB**, desabilitar novas gravações de métricas ao se aproximar do teto até otimizar, e manter links/player operando. É uma **meta interna**, não quota oferecida pelo Supabase e não se pode garantir tamanho de tabelas sem medição.
7. **Proteger o projeto inteiro:** medir `Database Size`, `Storage` e `Egress` reais antes de ativar. Alerta operacional quando Database Size chegar a **350 MB**; **bloquear novos writes de analytics** perto de **400 MB** para preservar margem das funcionalidades essenciais. O orçamento de Orçamento/anexos continua independente das métricas de Rádio. A API deve falhar aberta para o usuário: música e compartilhamento continuam funcionando quando estatísticas estiverem desativadas.
8. Quotas Free **não devem disparar upgrade automático** no produto. Ao exceder limites, o Supabase pode restringir serviço; aceitar perda temporária das métricas é melhor que comprometer orçamento, armazenamento ou reprodução. Revisar consumo real mensalmente e sempre após pico de tráfego.

**Gate de aceite financeiro:** nenhuma tabela/evento de analytics em produção sem observação do projeto CM, teste de carga/rotinas de expurgo, cálculo medido do espaço, rotina de exportação/recuperação dos totais e chave de desligamento independente das demais funcionalidades. Projeto Free não substitui backup próprio para histórico relevante. Todo limite no código deve ser configurável e testado; não prometer 0 MB exatos de overhead.

## 5. Sequência de execução proposta (frente independente)

| Bloco | Entrega | Dependência | Aceite verificável |
| --- | --- | --- | --- |
| **06c-A** | Identidade pública persistente + catálogo de publicação explícito + mapeamento de ID editorial para R2/sidecars | Definição de IDs/versões e política editorial | Homônimas possuem URLs distintas; mudança de título/versão não quebra link; rascunho e retirada não aparecem no catálogo público |
| **06c-B** | Rota individual com **Home real contextualizada**, SEO/OG e Compartilhar/Copiar link, adaptação pontual do controlador de fila | A | Entrada externa põe A na primeira posição e tenta tocar; autoplay bloqueado mostra CTA; mobile expande Rádio; navegação interna preserva B até seleção; um só player |
| **06c-C** | Apenas reproduções qualificadas observadas e relatório privado, com deduplicação, agregados e baixo custo | A + banco CM e endpoint com proteção | Cliques, seeks, autoplay bloqueado e retry não inflam plays; repetição legítima contada por nova execução; falha de API não interfere na Rádio; orçamento Free respeitado |
| **06c-D** | Ranking público e métricas extras de links somente após dados reais | C, período suficiente de dados reais | Ranking coerente; métricas de link separadas das reproduções; custo e privacidade auditados |

**Não bloquear o Estúdio atual nem exigir todo o Music Inbox antes de 06c-A**, mas fazer a identidade já compatível com o contrato editorial 04. Não promover uma decisão de design final sem validação do layout/fluxo.

## 6. Handoff de experiência e QA

**Superfícies:** Home reaproveitada pela rota individual, player completo desktop e mobile, playlist e CTA contextual. Mini-player mobile/dock desktop mantêm sua altura e função atuais. **Variação 4/10; movimento 3/10; densidade 7/10** para esta adição localizada.

**Verificar:** desktop amplo/estreito; mobile 390px; músicas curtas e títulos longos; 0/1/muitas faixas; link externo e navegação interna com B tocando; refresh; rota nova e troca rápida; fila real e playlist sincronizadas; faixa removida; URL desconhecida; navegador sem Web Share; fallback de clipboard; teclado e leitor de tela; `prefers-reduced-motion`; Open Graph em HTML sem executar JS; métricas com seek, pause, repetição, buffering e abas simultâneas; sem dupla reprodução ou rerender contínuo.

**Não inventar:** números iniciais de plays, curtidas do coração (hoje indisponível), origem de ouvintes, prova de envio no WhatsApp, artwork não autorizado ou ranking automático baseado em cargas de página.

`ready_for_frontend: yes (apenas 06c-A/B, reaproveitando Home aprovada; qualquer redesign substancial exige aceite visual específico)`.
`approved_by: Cassiano — comportamento funcional Home contextualizada e fila compartilhada, 17/10/2026; QA visual final pendente`.
`artifact_ref: docs/RADIO_SHARING_METRICS_PLAN_V1.md`
