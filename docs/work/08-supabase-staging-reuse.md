# E2 — Reaproveitar o Supabase Staging para o CM 3D & Radio

**Estado:** `in_progress` · **Início:** 09/10/2026 · **Responsável:** CM Infra / CM Data  
**Escopo:** subentrega de `08 — Estúdio público`, dependência `E2` do roadmap.  
**Alvo AUTORIZADO por Cassiano em 09/10/2026:** projeto Supabase existente `auiovzmxvhqlvhtmkavt`, atualmente chamado `Artesopolis Staging`, região `sa-east-1`.  
**Alvo PROIBIDO de mutação nesta entrega:** `ueasdbjuelqwfobcdlww` (`artesopolis-v4`, Artesopolis Admin produção).

> **Condição de segurança:** reaproveitar o projeto, **não** migrar/copiá-lo para o banco de produção do Admin e **não** considerar que um banco de staging com objetos existentes está vazio. Nenhuma limpeza irreversível sem inventário de consumidores, backup recuperável e leitura SQL administrativa funcional. As caixas abaixo só recebem `[x]` após prova.

## Resultado contratado

O projeto `auiovzmxvhqlvhtmkavt` passa a abrigar exclusivamente os dados próprios do CM 3D & Radio. Na V1, isso significa **Orçamento** (PostgreSQL e `quote-intake` privado). Ele não vira uma réplica do ERP nem assume Produtos/Shopee, rádio ou dados operacionais.

- **Admin produção** continua sendo a fonte de verdade de Products/Shopee, com a ponte pública server-to-server definida em [PRODUCT_CATALOG_BRIDGE_PLAN_V1.md](../PRODUCT_CATALOG_BRIDGE_PLAN_V1.md).
- **CM Supabase reutilizado** abriga `quote_requests`, `quote_attachments`, `quote_events`, `quote_rate_limit_windows` e o bucket privado `quote-intake`, conforme [SUPABASE_INFRASTRUCTURE_V1.md](../SUPABASE_INFRASTRUCTURE_V1.md).
- **Rádio** permanece no Cloudflare R2. Nenhuma música, sidecar ou arquivo mestre migra para o Supabase.
- O project ref se mantém, mesmo que o projeto receba nome de exibição `CM 3D & Radio`. Não se cria projeto extra, cobrança nem branch paga por padrão.
- O site **não** habilita envio real de orçamento antes de concluir upload, triagem, rate limit, retenção e os gates de produção definidos no contrato de infraestrutura.

## Evidências iniciais — 09/10/2026

| Fonte / superfície | Observação | Consequência |
| --- | --- | --- |
| Supabase Management | `auiovzmxvhqlvhtmkavt` ativo (`ACTIVE_HEALTHY`), em São Paulo, organização Free Artesopolis | Alvo existente e reutilizável em princípio |
| Supabase Management | `ueasdbjuelqwfobcdlww` ativo, separado, com dados operacionais | NÃO tocar |
| Supabase schema `public` | **186 tabelas**, **17 com linhas estimadas**; exemplo: 2 organizações, 8 produtos, 85 filamentos | Banco não está vazio; não presumir dados dispensáveis |
| Supabase Edge Functions | **17 funções** Shopee implantadas no staging | Exige inventário e retirement antes do uso CM |
| Supabase Logs (últimas 24h) | Job disparado a cada ~15 min gera `23502` (`http_request_queue.url` nulo) | Existe automação legada tentando executar |
| Supabase SQL / migrations MCP | `FATAL 28P01: password authentication failed for user "postgres"` | **Bloqueio real para SQL e migrações remotas**; não atribuir conclusão |
| Security Advisor staging | 20 views `SECURITY DEFINER`, 35 funções com search path mutável e outras recomendações legadas | Só publicar CM após limpeza e advisors próprios |
| Vercel | Projeto `artesopolis-admin-staging` existe; último deploy identificado em **01/09/2026** | Precisa desvinculação/controlada; não é prova de uso zero |
| GitHub Admin | Branch `staging`, runbook e scripts ainda referenciam esse banco | Precisa atualizar/descontinuar a documentação quando houver corte |
| Vercel `radioand3d` | Apenas 6 variáveis R2 presentes; **nenhuma variável CM Supabase** | CM ainda não está conectado à nova base |
| Base do CM | Contrato de infraestrutura já fixou PostgreSQL, bucket privado, signed TUS, retenção e boundary server-only | Não redesenhar o backend do zero |

**Interpretação cuidadosa:** o uso humano do staging parece interrompido, mas não se comprovou ausência de consumidores automáticos ou credenciais ainda em circulação. O banco contém dados e automação remanescentes; chamar isso de “projeto vazio” seria incorreto.

## Checkpoint P0 — Isolamento e levantamento (em andamento)

- [x] Identificar os dois project refs e a região do staging.
- [x] Confirmar que o projeto de produção do Admin é outro e continua fora do escopo.
- [x] Conferir existência do Vercel staging, GitHub branch e entradas antigas.
- [x] Registrar inventário inicial de tabelas, Edge Functions, erros cron e avisos de segurança.
- [x] Confirmar que o Vercel do Radio ainda não possui secrets Supabase CM.
- [ ] Conferir **quais ambientes Vercel e outros consumidores** realmente apontam para `auiovzmxvhqlvhtmkavt`; os valores de ambiente são protegidos e ainda não provam o destino por simples listagem.
- [ ] Inspecionar autenticações, buckets e conteúdo legado.
- [ ] Inspecionar `cron.job` e mapear todos os jobs/triggers/integradores, não apenas o job visível nos logs.
- [ ] Provar que não há dependência operacional necessária do Admin antes de desligar cada integração.

**Gate P0:** consumidores identificados + evidência de isolamento. Não foi atingido.

## Checkpoint P1 — Recuperar administração e fazer backup (bloqueado pela conexão SQL)

- [x] Reproduzir e registrar a falha `28P01` na conexão de banco via MCP.
- [ ] Reparar **somente a conexão administrativa do staging**: conferir/atualizar senha do banco em Supabase Dashboard/integração, sem expor senha no chat nem em commits.
- [ ] Confirmar `SELECT now()`, leitura de `cron.job` e migrações na ref exata do staging; não aceitar listagem administrativa como substituta de SQL.
- [ ] Exportar schema, dados de demonstração e histórico de migrations para backup privado externo ao Git.
- [ ] Inventariar e, quando necessário, exportar Auth, Storage e configuração/segredos por **nomes**, sem copiar credenciais para docs.
- [ ] Salvar lista de jobs, functions, integrações e destinos antigos.
- [ ] **Verificar restauração do backup**, ou restaurabilidade com evidência equivalente em ambiente isolado; registrar localização privada e responsável, nunca o segredo/backup bruto aqui.

**Gate P1:** backup recuperável + leitura administrativa funcional. Sem ele, nenhuma exclusão de schema, Auth, Storage ou functions.

## Checkpoint P2 — Aposentar dependências antigas (não iniciado)

- [ ] Remover/desabilitar agendamentos concretos em `cron.job` por nome/id após inventário (`cron.unschedule`), sem `DROP EXTENSION` cego.
- [ ] Conferir ausência de novas execuções dos jobs removidos e de chamadas HTTP antigas.
- [ ] Desativar consumidores, webhooks, credenciais Shopee sandbox/teste e integrations do ambiente de staging **apenas após** conferência dos destinos.
- [ ] Desvincular/configurar para arquivo o projeto Vercel `artesopolis-admin-staging`, sem afetar Vercel do Admin de produção.
- [ ] Revisar branch `staging`, scripts e referências no Admin; não apagar branch nem scripts automaticamente.
- [ ] Revogar/rotacionar segredos e chaves legadas do staging, preservando os da produção.
- [ ] Validar que a operação do Admin continua no ref `ueasdbjuelqwfobcdlww`.

**Gate P2:** nenhum caller antigo ativo nem referência de runtime dependente do staging.

## Checkpoint P3 — Limpar staging e proteger a nova identidade (não iniciado)

- [ ] Registrar inventário final e snapshot pré-limpeza, com contagem de schemas, jobs, functions, buckets e usuários.
- [ ] Excluir Edge Functions antigas e configurações de serviço do staging (17 identificadas), com verificação posterior.
- [ ] Remover somente objetos antigos do banco de staging, jobs, tabelas/views/RPCs, grants e dados demo, incluindo objetos fora de `public` que precisem de retirement.
- [ ] Apagar buckets/objetos e identidades Auth antigas, após backup e checagem da finalidade.
- [ ] Conferir que não há objetos órfãos, políticas expostas ou referências a Shopee/Artesopolis Admin.
- [ ] Renomear a **exibição** do projeto para `CM 3D & Radio` se a opção de Dashboard estiver disponível; **preservar ref**.
- [ ] Revisar keys e segredos: nenhum segredo antigo em frontend/commits; novos secrets somente no runtime do CM.

**Gate P3:** ambiente antigo efetivamente aposentado e base isolada, sem perder a possibilidade de recuperação.

## Checkpoint P4 — Provisionar backend CM (não iniciado)

- [ ] Criar migrations versionadas no repositório `radioand3d` usando a Supabase CLI (sem inventar migration version).
- [ ] Implementar `quote_requests`, `quote_attachments`, `quote_events` e `quote_rate_limit_windows` com constraints, índices necessários e idempotência.
- [ ] Habilitar RLS e revisar `GRANT`/ACL em todas as superfícies expostas; bloquear leitura/escrita para `anon` e `authenticated` nas tabelas de Orçamento.
- [ ] Criar bucket **privado** `quote-intake` (50 MB por objeto; até 5 arquivos/100 MB por pedido).
- [ ] Implementar signed resumable upload/TUS e confirmação server-side com inspeção segura do conteúdo.
- [ ] Implementar Route Handlers de sessão, init/complete e submit idempotente.
- [ ] Implementar HMAC de rate limit, audit trail sem PII e limpeza via Storage API para retenções de 24 h / 90 d / 180 d / 365 d.
- [ ] Executar testes SQL/security focais e revisão dos advisors; registrar o que foi aplicado remotamente.

**Gate P4:** migrations e Storage aplicados no alvo correto; funcionalidades e segurança comprovadas.

## Checkpoint P5 — Conectar site e validar (não iniciado)

- [ ] Configurar no Vercel `radioand3d` somente secrets server-side `CM_SUPABASE_URL`, `CM_SUPABASE_SECRET_KEY`, `CM_QUOTE_BUCKET`, `CM_QUOTE_RATE_LIMIT_SECRET` e `QUOTE_RETENTION_CRON_SECRET`.
- [ ] Confirmar que nenhum segredo CM Supabase usa `NEXT_PUBLIC_` nem chega ao navegador.
- [ ] Validar isolamento: música continua no R2 e o catálogo público continua vindo da boundary **do Admin produção**.
- [ ] Testar formulário real com arquivo válido/inválido, TUS interrompido/retomado, duplicação de submit, ACL anônima negada e listagem privada negada.
- [ ] Testar rotina de retenção com expiração de dados e **exclusão conjunta** de Storage e linhas.
- [ ] Verificar logs/monitoramento, Security Advisor e Performance Advisor sem achados materiais introduzidos.
- [ ] Cumprir gate de **plano de produção e backup** do contrato canônico: Free serve desenvolvimento; o contrato vigente exige Pro antes de intake público real. Upgrade pago requer autorização específica.
- [ ] Só depois liberar envio final de Orçamento; prévia permanece sem publicação prematura.

**Gate P5:** `infra_ready` somente com todos os critérios relevantes do contrato de infraestrutura satisfeitos.

## Critério de encerramento

- [ ] Administração do CM não compartilha banco/credenciais/tenants com a produção do Admin.
- [ ] Staging velho não recebe novas chamadas nem mantém jobs/functions/credenciais ativas.
- [ ] Não há dados de demonstração, URLs Shopee ou funções do ERP sob a identidade CM.
- [ ] Novos schema, Storage, APIs, segurança e retenção foram validados remotamente.
- [ ] Vercel Radio consome o Supabase CM apenas pelo servidor; Rádio permanece no R2.
- [ ] O catálogo de Produtos não foi copiado para o Supabase CM.
- [ ] Estado de documentação/roadmap e runbook antigo foram conciliados.
- [ ] Não há pendência material ou `NOT_VERIFIED` reclassificada como conclusão.

## Retomada após esta sessão (09/10/2026)

**Feito:** inspeção do alvo e dos principais consumidores declarados; evidência de legado (186 tabelas, 17 funções, job com erro a cada ~15 minutos); bloqueio SQL `28P01` confirmado; plano/checklist aberto no repositório.  
**Não feito:** qualquer exclusão, revogação, alteração de schema/bucket, renomeação, alteração Vercel, migração ou deploy remoto. **Produção do Admin não foi tocada.**  
**Próximo passo objetivo:** corrigir a conexão administrativa SQL da ref `auiovzmxvhqlvhtmkavt`, completar inventário de `cron.job`/Auth/Storage, produzir backup recuperável e então aposentadoria controlada de P2. Não há autorização implícita para upgrade pago.
