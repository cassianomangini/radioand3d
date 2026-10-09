# Supabase Infrastructure V1 — CM 3D & Radio

Status: **projeto definitivo confirmado; migration inicial de Orçamento aplicada e validada; Storage/handlers/produção pendentes**  
Revisão: **09/10/2026**  
Região contratada e confirmada: **sa-east-1 (São Paulo)**  
Responsável: **CM Infra / CM Data**

Esta é a arquitetura canônica do backend próprio do site. **Em 09/10/2026, o usuário criou o projeto Supabase definitivo** na organização independente Cmangini3d (Free), em `sa-east-1`. O projeto está `ACTIVE_HEALTHY`; foram aplicadas **oito migrations** versionadas: schema privado, quota, bucket, guards de limpeza, índice de FK, rate limit atômico, confirmação/envio idempotente e validação de tipo de arquivo. São cinco tabelas com RLS, bucket `quote-intake` privado e nenhum dado de clientes. **As quatro rotas HTTP de sessão, init, complete e submit existem no Git, mas continuam DESATIVADAS por flag**; somente as RPCs foram testadas transacionalmente. Upload TUS real, limpeza Storage API, secrets, Cron, E2E e deploy seguem pendentes.

A execução e os checkpoints verificáveis estão em [E2 — Provisionamento Supabase](work/08-supabase-provisioning.md). Detalhes operacionais sobre a infraestrutura de outro sistema ficam fora deste repositório público. **Não** usar este documento como autorização para pausar, limpar, migrar ou modificar um banco existente.

## 1. Decisão principal

O CM 3D & Radio possui **um projeto Supabase próprio na região `sa-east-1`**, e na organização independente Cmangini3d. O backend de Orçamento é isolado do banco do Admin; nenhuma credencial ou dado do ERP será replicado. Criar o projeto não significa ter schema/Storage/rotas prontos.

O banco do Artesopolis Admin continua sendo o responsável pelo domínio operacional de Produtos e Shopee. O CM **não** copia o ERP, custos, estoque, pedidos ou Ads. Seu catálogo público será uma projeção read-only, consumida no servidor; o backend próprio armazena somente os pedidos de Orçamento.

```text
Admin / Shopee (dados operacionais)
  └─ projeção editorial pública allowlisted, somente leitura
       └─ servidor CM -> páginas Produtos e SEO

CM Supabase (projeto novo e limpo)
  ├─ quote_requests
  ├─ quote_attachments
  ├─ quote_events
  ├─ quote_rate_limit_windows
  └─ Storage privado quote-intake

Cloudflare R2 -> catálogo e streaming da Rádio
```

Não usar a mesma credencial ou o mesmo banco para os dois domínios. O visitante não escolhe organização nem recebe segredos privilegiados.

## 2. Produtos Supabase usados na V1

### Usar

- PostgreSQL;
- Storage privado;
- Data API apenas para consumo server-side controlado;
- migrations;
- local development com CLI;
- Security Advisor;
- Performance Advisor;
- Branching quando o plano contratado justificar;
- Edge Function no projeto do Artesopolis Admin para a projeção pública de Produtos.

### Não usar na V1 do projeto CM

- Supabase Auth para visitantes;
- Realtime;
- Vectors;
- Queues;
- banco público acessado diretamente pelo navegador;
- tabelas de analytics;
- banco para músicas;
- Storage para o acervo da Rádio;
- catálogo Shopee duplicado.

A ausência desses produtos é intencional, não dívida.

## 3. Ambientes

### Desenvolvimento local

O schema e os handlers do Orçamento são desenvolvidos sem depender de banco remoto. A estrutura versionada prevista é:

```text
supabase/
├─ config.toml
├─ migrations/
└─ seed.sql
```

Migrations versionadas no Git, dados de seed exclusivamente fictícios e CLI versionada. Nenhum cliente, arquivo ou segredo real em fixtures, logs ou commits.

### Produção

**Projeto CM definitivo criado na organização Cmangini3d em `sa-east-1`.** PostgreSQL 17.11 saudável e SQL funcional. Oito migrations de Orçamento/infra foram aplicadas e registradas no Git, desde [`create_quote_core`](../supabase/migrations/20261009143743_create_quote_core.sql) até [`quote_detected_type_guard`](../supabase/migrations/20261009154035_quote_detected_type_guard.sql). Verificadas cinco tabelas privadas, zero pedidos/objetos/janelas de teste persistidos e ACL/RLS negando acesso anônimo. Security Advisor: cinco observações `INFO` de RLS ativado **sem policies**, negação intencional nesta etapa. A Vercel ainda não tem variáveis CM Supabase. Identificadores/credenciais concretos ficam fora da documentação pública.

A organização CM separada **foi criada e confirmada**: Cmangini3d está no plano Free. O isolamento administrativo/de faturamento por organização está estabelecido, sem alterar a assinatura da organização do Artesopolis Admin. Criar outra organização não aumenta o limite de projetos Free ativos da mesma conta.

### Preview / staging

Usar stack local e fixtures sintéticas enquanto estiver no Free; sem segundo projeto pago por padrão. Se no futuro a assinatura e o fluxo justificarem Supabase Branching, cada branch deve usar credenciais próprias e nunca dados pessoais copiados de produção.

### Ambiente legado

O ambiente de testes do sistema anterior **foi pausado pelo usuário** e está `INACTIVE` no Management API. **Backup externo recuperável e inventário de consumidores não foram comprovados** e permanecem como pendências residuais, sem autorizar alterações destrutivas no projeto antigo. O assistente não executou essa pausa.

## 4. Plano, disponibilidade e faturamento

### Desenvolvimento

Usar Free para schema, integração inicial, fixtures e validação sem coleta pública significativa. A cota atual de projetos Free ativos é **compartilhada entre as organizações das quais o usuário é owner/admin**; projeto pausado não ocupa vaga. A documentação da plataforma prevê uma janela de recuperação por Dashboard de até **um ano** para projetos pausados, mas isso não dispensa backup independente.

### Gate para receber orçamentos reais

O produto adota como **critério de lançamento** revisar backup gerenciado, disponibilidade e contratar Pro para a **organização CM** antes do intake público real. Isso é uma **decisão de operação**, não uma exigência técnica automática do Supabase. Nenhuma assinatura, upgrade ou alteração de cobrança está autorizada por este documento.

O plano é atribuído à **organização**: fazer upgrade da organização onde também vive o Admin poderia alterar seu faturamento. Por isso a organização CM separada é preferida. Reavaliar custo/benefício antes do gate, considerando tráfego, pausa no Free, política de backup e disponibilidade pretendida.

PITR não é obrigatório na V1; reconsiderar quando o RPO diário ou a criticidade do fluxo justificar.

## 5. Backup e recuperação

### Banco

Produção deve usar o backup gerenciado do plano.

Além disso:

- migration continua sendo fonte de schema;
- seed nunca contém produção;
- restaurar backup não substitui migrations corretas.

### Storage

Backup de banco **não protege os objetos do Storage**.

Na V1 isso é aceitável porque `quote-intake` é armazenamento temporário de entrada, não arquivo mestre de produção.

Regra:

> arquivo necessário para fabricar um pedido aceito deve sair do intake e ser materializado no sistema/processo operacional responsável antes de vencer a retenção.

Não tratar `quote-intake` como arquivo permanente.

## 6. Bucket do Orçamento

Bucket:

`quote-intake`

Configuração:

- private;
- sem listagem pública;
- sem public URL;
- file size limit: **50 MB por objeto**;
- máximo lógico por request: **5 arquivos**;
- máximo lógico total: **100 MB**;
- overwrite/upsert: **não permitido**;
- nomes físicos imutáveis.

Formatos V1:

- `.stl`;
- `.3mf`;
- `.obj`;
- `.step`;
- `.stp`;
- `.pdf`;
- `.png`;
- `.jpg`;
- `.jpeg`;
- `.webp`.

Não aceitar:

- ZIP genérico;
- executável;
- G-code;
- script;
- arquivo sem extensão reconhecida.

### Path físico

Não usar nome original como identidade do objeto.

Formato:

```text
requests/<request_uuid>/<attachment_uuid>.<ext>
```

O nome original fica apenas no registro privado de attachment.

Isso evita:

- colisão;
- path injection;
- PII desnecessária em URL/path;
- overwrite acidental.

## 7. Upload de arquivos

Arquivos podem chegar a 50 MB.

Não passar o binário inteiro pelo Server Component ou por Server Action.

Fluxo:

```text
Browser
  ↓
POST /api/quote/attachments/init
  ↓
Next.js server valida metadata + quota
  ↓
Supabase gera signed upload token
  ↓
Browser envia direto para Storage privado
  ↓
TUS resumable upload
  ↓
POST /api/quote/attachments/complete
  ↓
server verifica objeto + conteúdo
```

### Método

Usar **Supabase Storage Resumable Uploads (TUS)**.

O servidor usa `createSignedUploadUrl` para o **path já reservado**, com upsert desabilitado. No TUS, o browser envia **somente o token temporário retornado** no header `x-signature`; não recebe chave de serviço, token de usuário do Admin ou permissão ampla. Validar em integração real o endpoint TUS de Storage, a validade do token, o comportamento de retomada e o bloqueio de path diferente/sobrescrita. A assinatura é autorização de upload para o objeto específico, **não** autorização para ler/alterar a solicitação de Orçamento.

Motivo:

- arquivos podem superar 6 MB;
- rede mobile pode oscilar;
- retomada evita reiniciar 50 MB;
- progresso de upload é possível.

Para upload grande, usar o hostname direto de Storage do projeto.

O browser recebe apenas:

- path permitido;
- token assinado temporário;
- parâmetros necessários ao upload.

O browser nunca recebe:

- secret key;
- service role legado;
- acesso de listagem;
- permissão genérica no bucket.

### Upsert

`false`.

Se upload falhar e precisar reiniciar, gerar novo attachment/path quando necessário.

Não sobrescrever arquivo previamente validado.

## 8. Inspeção de conteúdo

Extensão e MIME do browser são apenas filtro de UX.

Depois do upload:

1. confirmar que o objeto existe;
2. conferir tamanho observado no Storage;
3. conferir extensão contratada;
4. ler apenas os ranges necessários para content sniffing;
5. validar assinatura/estrutura mínima segura;
6. marcar attachment como `validated` ou `rejected`.

Não executar:

- STL;
- OBJ;
- STEP;
- 3MF;
- PDF;
- imagem.

Não renderizar automaticamente.

Não chamar slicer.

Não extrair macros/scripts de PDF.

### Validação mínima por formato

A implementação deve usar parser/sniffer seguro e limitado.

Exemplos de evidência:

- PNG: assinatura PNG;
- JPEG: SOI/estrutura mínima;
- WebP: RIFF + WEBP;
- PDF: `%PDF-`;
- STEP/STP: header esperado ISO-10303-21;
- OBJ: texto estrutural plausível, sem execução;
- STL: binário/ASCII plausível;
- 3MF: container OPC/ZIP com estrutura 3MF reconhecível.

Arquivo duvidoso:

`rejected`

ou

`manual_review`

Nunca inferir que extensão correta significa arquivo seguro.

## 9. Schema do Orçamento

### `quote_requests`

Responsabilidade: lifecycle da solicitação, conteúdo canônico, contato, triagem, **posse da sessão anônima** e retenção.

Campos mínimos:

```text
id uuid primary key
schema_version smallint not null default 1
lifecycle_status text not null
triage_status text null
project_type text not null

owner_session_hash text not null
source_origin text null
source_reference text null
starting_points text[] not null default '{}'
no_file boolean not null default false

production jsonb not null
project jsonb not null

contact_method text null
contact_name text null
contact_value text null

submission_key uuid unique
submitted_at timestamptz null
last_activity_at timestamptz not null
expires_at timestamptz not null
created_at timestamptz not null
updated_at timestamptz not null
```

`owner_session_hash` é calculado no servidor a partir de um segredo de sessão aleatório; **nunca** persistir cookie/token em texto puro. A mesma sessão pode possuir mais de um draft (abas diferentes). Consultas e writes sempre verificam **ID do draft E digest da sessão** no servidor, antes de realizar qualquer operação com chave privilegiada.

### Lifecycle

```text
draft
submitted
reviewing
closed
expired
```

### Triage

```text
ready-for-review
needs-information
incomplete
```

Triagem não é lifecycle.

### JSON fechado

`production` e `project` representam o contrato versionado do frontend: validar `schemaVersion` antes de persistir; closed shape; chaves inesperadas falham; tamanho máximo; sem HTML; strings normalizadas. Contato deve ser gravado apenas com o mínimo necessário e protegido de logs/analytics.

### Invariantes de posse

- A criação do primeiro draft estabelece uma sessão anônima emitida pelo servidor, com **256 bits aleatórios**, associada por digest/HMAC aos drafts.
- Cookie host-only `__Host-cm-quote-session`: `Secure`, `HttpOnly`, `SameSite=Strict`, `Path=/`, expiração alinhada à retenção de drafts (24h). Em localhost HTTP usar convenção de desenvolvimento separada, sem enfraquecer produção.
- Idempotência e posse devem ser protegidas no banco/serviço: não existe caminho de write baseado **somente** em UUID, slug ou sessão fornecida no body.
- Validar `Origin` da aplicação e rejeitar métodos/`Content-Type` inesperados nas rotas que mutam estado, além do cookie. Revisar CSRF nos fluxos de upload assinado.
- Depois que o cookie expirar/perder-se, não oferecer recuperação por ID isolado: o draft entra em expiração; solicitar novo preenchimento sem divulgar dados antigos.
- A sessão anônima não cria usuário Supabase Auth nem permite leitura direta da Data API.

## 10. `quote_attachments`

Campos mínimos:

```text
id uuid primary key
quote_request_id uuid not null
storage_bucket text not null
storage_path text not null unique

original_name text not null
extension text not null
reported_mime text null
detected_type text null
size_bytes bigint not null
validated_size_bytes bigint null
upload_key uuid not null
accounted_bytes bigint not null
quota_released_at timestamptz null
grant_expires_at timestamptz not null

validation_status text not null
validation_code text null

uploaded_at timestamptz null
validated_at timestamptz null
expires_at timestamptz not null

created_at timestamptz not null
updated_at timestamptz not null
```

### Validation status

```text
pending-upload
uploaded
validated
rejected
expired
```

Não persistir URL pública. A FK do anexo para a solicitação impede exclusão do request enquanto existir objeto a remover. O servidor usa `upload_key` idempotente por request; `accounted_bytes` reserva capacidade conservadora e `quota_released_at` só pode ser gravado depois que o grant TUS expirou e não houver metadado do objeto no Storage. Triggers negam exclusão de linha reservada e redução prematura de `grant_expires_at`.

As funções server-only `quote_reserve_attachment` e `quote_release_attachment` operam com `service_role`, sem `EXECUTE` para `anon`/`authenticated`. Mesmo no servidor, a sessão e o ID precisam ser validados. **Ausência da linha em `storage.objects` não prova, por si, que o conteúdo binário foi removido**: antes de liberar quota, a rotina deve confirmar a exclusão pela Storage API e só então chamar a função idempotente.

## 11. `quote_events`

Audit trail sem conteúdo sensível.

Campos mínimos:

```text
id bigint generated
quote_request_id uuid null
event_type text not null
event_status text not null
metadata jsonb not null default '{}'
created_at timestamptz not null
```

Pode registrar:

- draft_created;
- upload_token_issued;
- attachment_uploaded;
- attachment_validated;
- attachment_rejected;
- submit_success;
- submit_rejected;
- retention_delete;
- retention_error.

### Proibido em logs/events

- telefone;
- e-mail;
- nome;
- descrição completa do projeto;
- conteúdo do arquivo;
- original filename quando desnecessário;
- secret;
- signed URL/token.

Usar IDs internos. A FK opcional de `quote_events` para `quote_requests` usa comportamento equivalente a `ON DELETE SET NULL`, preservando eventos não pessoais depois da limpeza do request sem impedir exclusão do contato.

## 12. Rate limiting e capacidade de Storage

**Implementado no banco:** `quote_consume_rate_limit` consome janelas atômicas em `quote_rate_limit_windows`, persistindo somente **HMAC(secret, IP normalizado)**, jamais IP bruto. Limites atuais: criar request **5/h**, iniciar upload **25/h**, submit **5/h** por hash; registros expiram em 24h. Teste SQL remoto sintético (rollback) comprovou 5 permitidas/6ª negada e separação por ação/hash. As quatro rotas Next implementadas chamam a RPC quando aplicável, incluindo submit (5/h). O intake continua desativado por feature flag; sem end-to-end público. Na Vercel, ler IP de cabeçalho normalizado pelo proxy; fora da Vercel, produção não pode confiar cegamente em `X-Forwarded-For` fornecido pelo visitante.

### Capacidade global

O bucket **privado** `quote-intake` existe desde 09/10/2026, com limite de **50.000.000 bytes/objeto** no Supabase Free. A aplicação aceita **5 arquivos por pedido**, até **50.000.000 bytes por arquivo** e **100.000.000 bytes por pedido**. Isso corrige a antiga divergência de `50 * 1024 * 1024` (52,4 milhões de bytes) na validação do browser.

O orçamento global está persistido no singleton `quote_upload_limits.max_bytes = 600000000`, não na palavra de um cliente. `CM_QUOTE_STORAGE_BUDGET_BYTES`, na configuração do servidor, **deve coincidir** com esse limite e nunca sobrescrevê-lo silenciosamente. Capacidade geral do Supabase Free não deve ser interpretada como limite exclusivo deste bucket.

**Regra conservadora indispensável:** antes de emitir uma URL TUS, a RPC `quote_reserve_attachment` reserva **50.000.000 bytes inteiros por arquivo ainda não verificado**, e não o tamanho declarado pelo browser, pois um token de upload não está restrito ao número informado no `init`. Isso restringe o número de uploads pendentes simultâneos (em geral dois por pedido); arquivos pequenos devem ser enviados e verificados em sequência para liberar capacidade.

O trigger `quote_attachment_capacity_guard` serializa inserts/updates pelo lock da linha de limite global, compara a soma de reservas com 600 MB e também aplica 5 anexos/100 MB contabilizados por solicitação, inclusive sob concorrência. Somente depois de verificar que um objeto existe, seu tamanho real no Storage e seu conteúdo permitido, o backend poderá reduzir `accounted_bytes` ao tamanho efetivo. O banco confere metadados `storage.objects`; inspeção de tipo/conteúdo permanece responsabilidade da camada server-side.

Reserva pendente, upload rejeitado ou upload órfão **continuam ocupando orçamento** até expiração do grant e remoção/ausência confirmada pela Storage API. O processo de limpeza é idempotente e protegido por `quote_release_attachment`; **a execução real da limpeza ainda não está implementada**. As validações SQL com dados sintéticos foram executadas dentro de transações desfeitas por `ROLLBACK`; testes end-to-end de TUS e concorrência em conexões simultâneas seguem pendentes.

Quando teto/quota acabar, devolver erro acionável de capacidade sem emitir novos tokens; alertar operação. Não depender de uma única quota por visitante, de `Content-Length` informado pelo browser ou de remoção manual.

## 13. Persistência, autorização e idempotência

1. `POST /api/quote/session`: servidor emite/reutiliza cookie opaco de sessão, cria draft e vincula `owner_session_hash`. IDs são gerados no servidor.
2. `POST /api/quote/attachments/init`: valida cookie, Origin, draft `id`, posse, lifecycle, quantidade, tamanho e **reserva de quota** antes de emitir um token temporário para path único; token não autoriza listar o bucket nem substituir objeto.
3. `POST /api/quote/attachments/complete`: valida a mesma posse, inspeciona objeto real, conteúdo e bytes, confirma/rejeita e atualiza reservas sem write parcial perdido.
4. `POST /api/quote/submit`: valida posse, payload, contato, anexos e status; persiste uma única transição terminal vinculada a `submission_key` única.
5. Repetição da mesma submissão retorna resultado consistente e **não cria dois leads**. Repetição de init/complete deve ter semântica explícita de retry, com idempotency key/attachment ID e reconciliação.
6. Requests de outra sessão, cookies expirados e anexos de outro request recebem rejeição **sem retornar dados privados**. Não conceder poderes extras pela presença de uma Supabase secret key no servidor.

`submitted` somente quando payload/contato válidos, anexos pertencentes ao draft e `validated`, quantidade e capacidade dentro da política. Garantir transação/locking nas alterações que disputem estado do draft.

## 14. RLS, grants e Data API

Todas as tabelas de Orçamento ficam com **RLS habilitado** e sem SELECT/INSERT/UPDATE/DELETE para `anon` e `authenticated`, sem policy pública. O browser **nunca** chama Data API/RPC de negócio; o servidor é o único consumidor privilegiado.

A chave Supabase do servidor **não substitui autorização**: antes de executar leitura, upload, complete, submit ou emissão de URL assinada, verificar sessão e posse do draft. `owner_session_hash` não é fornecido pelo cliente. Limitar campos retornados: contato, filenames e dados de projetos não aparecem em resposta para IDs alheios, em logs nem em analytics. Auditoria e testes negativos cobrem grants, views, RPCs e políticas do Storage.

### Storage

O bucket `quote-intake` é privado. Não permitir list/read públicos nem upsert. O servidor emite token de upload restrito a um path físico novo **somente** após autorizar o request e reservar capacidade. A URL ou token assinado não é persistido; expira. Downloads futuros usam URL temporária curta criada pelo backend depois de autorizar acesso interno.

## 15. Supabase Auth

**Não usado para visitantes na V1.** Não criar anonymous sign-in como atalho para acesso ao bucket. Sessão do Orçamento é um vínculo de posse específico e não uma conta de usuário. Área privada de gestão, se existir no futuro, terá contrato Auth/autorização separado.

## 16. Server boundary do Next.js

Routes server-side **contratadas** (estado em 09/10/2026: quatro endpoints de sessão, init, complete e submit implementados em código, **sem deploy nem testes HTTP reais**; `quote-retention` ainda pendente):

```text
POST /api/quote/session
POST /api/quote/attachments/init
POST /api/quote/attachments/complete
POST /api/quote/submit
GET  /api/internal/quote-retention   (cron autenticado; nunca navegador público)
```

Confirmação da V1 vem do submit; não criar GET público por ID de solicitação. Se futuramente necessário, GET também deve exigir posse de sessão e não expor contato por ID.

Cookie de sessão: criado somente por servidor; HttpOnly, host-only, Secure em produção, SameSite Strict, Path=/, TTL até 24h. Para cada mutação, checar Origin same-origin e método/`Content-Type`, além de posse, rate-limit e estado. Separar a lógica de autorização do cliente Supabase `service_role`.

Config server-only: `CM_SUPABASE_URL`, `CM_SUPABASE_SECRET_KEY`, `CM_QUOTE_BUCKET`, `CM_QUOTE_RATE_LIMIT_SECRET`, `CM_QUOTE_SESSION_SECRET`, `CM_QUOTE_STORAGE_BUDGET_BYTES`. Não usar prefixo `NEXT_PUBLIC_` para credenciais, nem publicar cookies/tokens/assinaturas.

## 17. Retenção

Política inicial fechada:

### Draft sem submit

**24 horas após última atividade**

Excluir:

- row;
- attachments;
- objetos.

### Upload órfão

**24 horas**

Mesmo que request nunca seja concluído.

### Request submetido — arquivos

**90 dias após submit**

Se o projeto virar trabalho real, o arquivo necessário precisa ser copiado para o owner operacional antes disso.

### Request submetido — conteúdo e contato

**180 dias após última atividade**

Depois:

- apagar contato;
- apagar conteúdo do intake;
- manter somente evento técnico não-PII quando necessário.

### Eventos técnicos

**365 dias**

Desde que metadata não contenha PII.

### Rate limit

**24 horas**.

## 18. Retenção automatizada e Vercel Cron

Não excluir registros de `storage.objects` diretamente por SQL. Usar a **Storage API** para apagar os objetos reais e somente depois concluir a exclusão dos registros de Orçamento correspondentes.

**Contrato HTTP vigente: `GET /api/internal/quote-retention`**. Vercel Cron faz GET para a URL de **produção**. A rota verifica `Authorization: Bearer <CRON_SECRET>` contra a variável server-only `CRON_SECRET`, rejeita segredo ausente/incorreto (`401`) e não expõe métricas ou PII a chamadas não autorizadas. User-Agent e `x-vercel-cron-schedule` não são autenticação. Resposta com `Cache-Control: no-store`, handler dinâmico e nenhuma exposição de PII; GET é permitido **somente** por ser uma rota interna autenticada do scheduler.

Depois de implementar a rota, configurar em `vercel.json` **preservando `git.deploymentEnabled: false`**:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "git": { "deploymentEnabled": false },
  "crons": [
    { "path": "/api/internal/quote-retention", "schedule": "0 3 * * *" }
  ]
}
```

`0 3 * * *` = diariamente, **03:00 UTC**, com possível variação conforme plano. No Hobby, Vercel permite no máximo uma execução diária por cron; o deploy falha ao tentar cadência superior. **Não adicionar `crons` enquanto a rota não existir, não estiver autenticada/testada e o secret não estiver provisionado**: caso contrário haverá invocações 404.

### Semântica de execução

- Vercel **não retenta automaticamente** invocações com erro. Entrega pode falhar, repetir ou sobrepor runs: reconciliar **todos os pendentes** em toda execução, não apenas a data corrente.
- Usar lock/lease no banco + paginação/lotes para evitar duas execuções deletando a mesma solicitação simultaneamente.
- Estados idempotentes e reconciliáveis, por anexo e solicitação: `pending_delete` / `storage_deleted` / `row_deleted`; erro de Storage mantém metadata e entra na próxima varredura.
- Depois de apagar objetos via Storage API, remover/anonimizar metadados e contato conforme os períodos de retenção; registrar evento **sem PII**. Se o processo morrer entre as operações, próximo run recomeça com segurança.
- Logs: timestamp, duração, número de candidatos/processados, bytes liberados, erros e atraso do último sucesso, sempre sem contato/nome de arquivo/token.
- Criar monitoramento/alerta para ausência de execução, falha recorrente e risco de quota esgotada. Testar falha/duplicidade/invocação manual autenticada e URL não autorizada.

O objetivo continua o contrato de 24h para draft/órfão, 90 dias para arquivos submetidos, 180 dias para contato/conteúdo e 365 dias para eventos técnicos sem PII. A rotina é diária e, portanto, a exclusão deve ter **tolerância operacional até a próxima execução**; não prometer remoção no segundo exato do prazo.

Se mudar de hospedagem, preservar o comportamento e trocar somente o scheduler.

Fontes: [Vercel Cron](https://vercel.com/docs/cron-jobs), [segurança e entrega](https://vercel.com/docs/cron-jobs/manage-cron-jobs) e [limites de agendamento](https://vercel.com/docs/cron-jobs/usage-and-pricing).

## 19. Produtos/Shopee — Supabase do Artesopolis Admin

A ponte de Produtos **não usa o novo projeto CM**.

Ela é implementada no projeto Supabase do Artesopolis Admin:

```text
product_cm_publications
+
Shopee observed catalog
+
Products
        ↓
cm-public-catalog Edge Function
```

### Edge Function

`cm-public-catalog`

Deploy com JWT verification desabilitado **somente porque terá autenticação própria server-to-server**.

Header:

`X-CM-Catalog-Token`

Secret na function:

`CM_CATALOG_READ_TOKEN`

O mesmo valor fica na Vercel Production do `radioand3d`.

Esse token:

- autoriza apenas essa boundary;
- não é Supabase secret key;
- não dá acesso ao banco;
- não vai para o browser.

### Organização

Secret/config da function:

`CM_PUBLIC_ORGANIZATION_ID`

Visitor nunca escolhe organization.

### Vercel

`ARTESOPOLIS_CATALOG_URL`

`ARTESOPOLIS_CATALOG_TOKEN`

Server-only.

## 20. Cache do catálogo público

V1:

**15 minutos**.

O catálogo é lido no servidor.

Falha transitória:

- manter cache válido existente quando o mecanismo do Next permitir;
- sem cache válido, falhar explicitamente;
- não cair para catálogo hardcoded.

A API pública de Produtos e o backend do Orçamento são independentes.

Falha em um não pode derrubar o outro.

## 21. Variáveis, chaves e secrets

Não commitar credenciais nem números/IDs internos de outros sistemas em documentos públicos. Usar `.env.example` com campos vazios e validação de variáveis obrigatórias no servidor.

### Vercel — apenas server-side, quando o projeto CM definitivo e sua região estiverem aprovados

- `CM_SUPABASE_URL` — URL do **projeto novo**;
- `CM_SUPABASE_SECRET_KEY` — chave privilegiada do projeto CM, nunca em frontend;
- `CM_QUOTE_BUCKET=quote-intake`;
- `CM_QUOTE_RATE_LIMIT_SECRET` — HMAC de IP;
- `CM_QUOTE_SESSION_SECRET` — derivação/associação da sessão opaca;
- `CM_QUOTE_STORAGE_BUDGET_BYTES` — configuração não secreta para teto global;
- `CRON_SECRET` — segredo reconhecido e enviado automaticamente pelo Vercel Cron;
- `ARTESOPOLIS_CATALOG_URL` / `ARTESOPOLIS_CATALOG_TOKEN` — somente para o consumidor da ponte pública server-to-server, **separados** do projeto Supabase CM.

`CRON_SECRET` substitui a antiga proposta de variável dedicada ao Cron; não manter nomes concorrentes.

### Sistema operacional de origem

A função de catálogo mantém identidade/configuração e autenticação **próprias**, administradas no ambiente privado correspondente. Jamais reutilizar a secret key do Supabase CM para autorizar leitura do Admin, nem transportar credenciais de um projeto para outro.

## 22. CORS

### Quote

Browser não chama Data API diretamente.

Browser recebe token de upload pelo domínio CM e fala somente com endpoint de Storage necessário ao TUS.

Configurar/validar CORS somente para os origins CM que realmente precisam fazer upload.

### Product catalog

Não é endpoint browser-side.

Consumer é o servidor do Next.

Não habilitar CORS amplo por conveniência.

## 23. Segurança de produção

Antes de habilitar tráfego real:

- MFA na conta Supabase;
- RLS em todas as tabelas expostas;
- grants auditados;
- SSL enforcement;
- Security Advisor sem finding material não aceito;
- Performance Advisor revisado;
- secret keys somente server-side;
- bucket private;
- nenhum public signup necessário;
- logs sem PII;
- rate limit ativo;
- retention job ativo;
- teste de arquivo rejeitado;
- teste de upload interrompido;
- teste de submit duplicado;
- teste de acesso anon direto ao banco = negado;
- teste de listagem pública do bucket = negado.

Network Restrictions para acesso direto ao banco devem ser habilitadas quando forem compatíveis com a forma real de operação/CI; não bloquear migration/recuperação sem um caminho administrativo comprovado.

## 24. Observabilidade

Fontes V1:

### Vercel

- Route Handler errors;
- request latency;
- cron execution;
- quote submit result.

### Supabase

- Postgres logs;
- Storage errors;
- API errors;
- database advisors.

### Event table

`quote_events` dá auditoria funcional.

Não criar stack nova de observabilidade antes de necessidade medida.

## 25. Métricas operacionais permitidas

Sem PII:

- requests criados;
- submits;
- falhas de upload;
- anexos rejeitados;
- triage status;
- bytes recebidos;
- tempo até submit;
- cleanup executado/falhado.

Analytics público continua sem receber nome, contato, descrição ou arquivo.

## 26. Migrations

Quando a implementação começar:

1. iniciar Supabase local;
2. criar migration via CLI;
3. iterar localmente;
4. rodar testes SQL focais;
5. revisar RLS/grants;
6. rodar Security Advisor;
7. rodar Performance Advisor;
8. revisar diff;
9. commit da migration;
10. só depois considerar apply remoto.

Migration no Git != produção atualizada.

## 27. CI

Sem conta remota, CI deve conseguir provar:

- TypeScript;
- parser;
- contratos;
- migration syntax quando tooling local estiver disponível;
- tests do adapter;
- fixture do catálogo.

Quando Supabase remoto existir, não fazer CI depender da produção.

Preview branch/staging é o alvo apropriado para E2E de schema.

## 28. Provisionamento remoto — novo projeto CM

Plano detalhado e checklist: [E2 — Provisionamento Supabase](work/08-supabase-provisioning.md).

1. Conferir em ambiente **privado** dependências do ambiente de teste legado, gerar backup externo recuperável e somente depois autorizar/realizar a pausa, sem excluir.
2. **Concluído pelo usuário e validado:** projeto CM novo, em organização independente, região São Paulo, acessível via SQL e sem migrations. Ver [checklist E2](work/08-supabase-provisioning.md). Identificadores e secrets ficam fora do Git público.
3. **Parcial concluído:** migrations versionadas no Git e alvo remoto confirmado antes de cada apply via Supabase MCP; dry-run SQL por transação com rollback e read-back. CLI/Docker de desenvolvimento local continuam sem validação end-to-end neste ambiente.
4. **Aplicado e verificado:** schema base, índices, RLS/grants, reserva global transacional e rate limit RPC. Handler de sessão/draft e init/signed-TUS foi implementado, mas **somente testado com gateway mockado**; RPCs de complete/submit aplicadas e testadas com rollback; sua execução por HTTP/Storage real ainda está pendente.
5. **Bucket privado criado:** `quote-intake` com limite de 50 milhões de bytes, sem políticas anônimas. **Pendente:** signed TUS, inspeção de conteúdo, limpeza Storage API e testes de upload efetivo.
6. Configurar variáveis server-side na Vercel e implementar handlers; validar que a Rádio permanece no R2.
7. **Só após a rota protegida estar operacional:** ativar o GET diário do Vercel Cron, fazer read-back e observar falha/duplicidade.
8. Executar testes negativos de acesso cruzado, quota, Storage, retenção, advisors e backup; cumprir o gate de plano/produção antes do intake real.

A ponte de Produtos **não depende** da base CM. No ambiente operacional da origem, seu plano independente prevê persistência/publicação editorial, uma projeção allowlisted server-to-server, migração dos produtos curados e remoção do catálogo estático somente após provas. Contrato: [Product Catalog Bridge V1](PRODUCT_CATALOG_BRIDGE_PLAN_V1.md). Não inferir que a ponte esteja implantada pelo provisionamento do CM.

## 29. O que pode avançar sem Supabase remoto

**Desbloqueado em código local:** migrations, schema, grants/RLS, parsers, contrato de sessão anônima, handlers, validação de conteúdo, quota, rate limit, idempotência, scheduler, fixtures e testes. Esse código local **não** significa que upload, submit ou cron estejam funcionando na produção.

**Já verificado:** projeto CM definitivo em São Paulo e organização independente; migrations de schema e quota aplicadas e versionadas; bucket privado; read-back SQL/RLS/grants e testes transacionais sintéticos de reserva/negação. Banco sem dados reais; staging antigo pausado pelo usuário. **Ainda pendente:** CLI/Postgres local completos, suite/CI da aplicação, secrets Vercel, signed TUS real, validação de Range/arquivos reais, limpeza de uploads via Storage API, smoke E2E e release. O backup do legado segue sem comprovação.

## 30. Gate de infraestrutura pronta

Só marcar `infra_ready` quando todas as provas relevantes existirem:

- [x] Supabase **novo** CM em `sa-east-1`, organização independente; nenhum dado legado foi migrado.
- [x] Migrations de schema inicial, bucket privado e quota aplicadas, versionadas e verificadas **na ref correta**. Próximas migrations continuarão sujeitas ao mesmo gate.
- [ ] `quote-intake` privado, limites 50MB/objeto e 5/100MB por request e quota **global** confirmados.
- [ ] RLS/grants/Storage negam acesso direto `anon`/`authenticated`; nenhum privilégio no browser.
- [ ] Cookie de sessão anônima, vínculo por HMAC/digest, Origin/CSRF e expiração funcionam.
- [ ] Duas sessões não conseguem ler, completar upload ou enviar orçamento uma da outra.
- [ ] Signed TUS, retomada, content sniffing e falha parcial validados sem upsert.
- [ ] Submit idempotente e reservas de bytes concorrentes respeitam invariantes.
- [ ] Rate limiting, respostas de quota esgotada e limpeza de órfãos funcionam.
- [ ] Vercel Cron **GET** autenticado por `CRON_SECRET` foi agendado **após** rota pronta e verificado em execução real.
- [ ] Falha/duplicidade/ausência de Cron têm reconciliação e alerta; Storage excluído antes do row/PII.
- [ ] Duração de retenção e rotinas de expurgo de dados pessoais testadas.
- [ ] Segredos Vercel só server-side; deploy é **explícito** enquanto `git.deploymentEnabled: false`.
- [ ] Política de backup e de plano da organização CM avaliadas; upgrade pago somente com autorização.
- [ ] Security Advisor, Performance Advisor, logs e observabilidade sem riscos introduzidos.
- [ ] Ponte de Produtos continua **fora** do Supabase CM e seu status não foi promovido artificialmente.
- [ ] Documentação pública não inclui identificadores operacionais privados; ausência de pendências materiais escondidas.

## 31. Referências oficiais consultadas

- [Free projects e organização](https://supabase.com/docs/guides/platform/billing-faq)
- [Pausa e restauração de projeto](https://supabase.com/docs/guides/platform/free-project-pausing)
- [Vercel Cron GET](https://vercel.com/docs/cron-jobs)
- [Vercel Cron Auth e retries](https://vercel.com/docs/cron-jobs/manage-cron-jobs)
- [Limites Cron por plano](https://vercel.com/docs/cron-jobs/usage-and-pricing)

- Supabase Deployment & Branching: https://supabase.com/docs/guides/deployment
- Supabase Branching: https://supabase.com/docs/guides/deployment/branching
- Production Checklist: https://supabase.com/docs/guides/deployment/going-into-prod
- Database overview/backups: https://supabase.com/docs/guides/database/overview
- Database Backups/PITR: https://supabase.com/docs/guides/platform/backups
- Edge Functions: https://supabase.com/docs/guides/functions
- Edge Function auth: https://supabase.com/docs/guides/functions/auth
- Edge Function secrets: https://supabase.com/docs/guides/functions/secrets
- Storage resumable uploads: https://supabase.com/docs/guides/storage/uploads/resumable-uploads
- Cron: https://supabase.com/docs/guides/cron/quickstart

## 32. Retomada — 09/10/2026

- **Projeto CM definitivo validado** na organização Free independente Cmangini3d e região São Paulo. Migration inicial `create_quote_core` aplicada e versionada, quatro tabelas verificadas e vazias, com RLS/grants restritos.
- O ambiente de testes legado permanece **inalterado**; pausa depende de inventário, backup e gate próprio.
- **Oito migrations aplicadas e versionadas**: schema base, bucket/reserva de quota, proteção de limpeza, validade TUS, índice de FK, rate limit atômico, RPCs de complete/submit e verificação de tipo/extensão. Bucket privado confirmado; dados de clientes: zero. SQL sintético testado com rollback. **Quatro rotas HTTP em código com flag `CM_QUOTE_INTAKE_ENABLED=false`**; testes JS de complete/submit versionados, mas suite CI completa não confirmada. Sem TUS real, segredos Vercel, Cron, limpeza Storage API ou deploy.
- Fonte de verdade para passos e evidências: [E2 — Provisionamento Supabase](work/08-supabase-provisioning.md).
- Product bridge: contrato próprio aprovado para implementação, mas integração automática e cutover live **não concluídos**.
- O Performance Advisor apontou FK de `quote_events` sem índice, corrigida na migration `index_quote_events_request_fk`; o novo read-back eliminou esse aviso. Sete avisos `INFO` de índices não utilizados são esperados enquanto não existe workload real.
- Próximo gate: handlers com autenticação de sessão, emissão de token TUS por path, verificação do objeto/tipo real, rate limit e limpeza Storage API. A quota SQL funciona de maneira conservadora, mas **não equivale à validação E2E de concorrência ou upload real**. CLI/Docker locais indisponíveis neste ambiente; manter o intake público desativado.
