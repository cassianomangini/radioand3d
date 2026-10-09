# Supabase Infrastructure V1 — CM 3D & Radio

Status: **contrato definido · projeto CM remoto não provisionado**  
Revisão: **09/10/2026**  
Região planejada: **sa-east-1 (São Paulo)**  
Responsável: **CM Infra / CM Data**

Esta é a arquitetura canônica do backend próprio do site. A decisão vigente é **criar um projeto Supabase novo e limpo**, preferencialmente em organização CM separada, após liberar uma vaga Free de forma segura. Nenhum novo projeto, migration, bucket, segredo, cron ou deploy do Orçamento foi provisionado.

A execução e os checkpoints verificáveis estão em [E2 — Provisionamento Supabase](work/08-supabase-provisioning.md). Detalhes operacionais sobre a infraestrutura de outro sistema ficam fora deste repositório público. **Não** usar este documento como autorização para pausar, limpar, migrar ou modificar um banco existente.

## 1. Decisão principal

O CM 3D & Radio terá **um projeto Supabase novo e independente**, na região `sa-east-1`, para os dados próprios do site.

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

**Um novo projeto Supabase CM em `sa-east-1`, ainda não criado.** Seu identificador concreto, segredos, URL e inventário de administração serão guardados em local privado, nunca neste documento.

A organização CM separada é a preferência de governança para que um eventual plano pago do CM não mude o plano de faturamento do Admin. Isso **não** aumenta o limite gratuito de projetos ativos da conta.

### Preview / staging

Usar stack local e fixtures sintéticas enquanto estiver no Free; sem segundo projeto pago por padrão. Se no futuro a assinatura e o fluxo justificarem Supabase Branching, cada branch deve usar credenciais próprias e nunca dados pessoais copiados de produção.

### Ambiente legado

O ambiente de testes do sistema anterior não será convertido em produção CM. Antes de **pausá-lo** para liberar uma vaga Free: conferir consumidores/dependências, criar backup externo recuperável e obter autorização específica. Pausa preserva a necessidade de backup. Nenhuma desativação foi executada nesta entrega.

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

Responsabilidade:

- lifecycle da solicitação;
- payload canônico;
- contato;
- triagem;
- retenção.

Campos mínimos:

```text
id uuid primary key
schema_version smallint not null default 1
lifecycle_status text not null
triage_status text null
project_type text not null

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

### Lifecycle

Valores V1:

```text
draft
submitted
reviewing
closed
expired
```

### Triage

Valores V1:

```text
ready-for-review
needs-information
incomplete
```

Triagem não é lifecycle.

### JSON fechado

`production` e `project` continuam representando o contrato versionado do frontend, mas:

- schemaVersion precisa ser validado antes da persistência final;
- formato é closed shape;
- chaves inesperadas falham;
- tamanho do JSON tem teto;
- nenhum HTML é necessário;
- strings são normalizadas.

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

Não persistir URL pública.

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

Usar IDs internos.

## 12. Rate limiting

Tabela:

`quote_rate_limit_windows`

Não armazenar IP bruto.

O servidor calcula:

```text
HMAC(server_secret, normalized_ip)
```

e persiste apenas o hash temporário.

Threshold inicial configurável:

- criar request: **5 por hora** por hash;
- iniciar upload: **25 tokens por hora** por hash;
- submit: **5 por hora** por hash.

Esses valores ficam em configuração, não espalhados no código.

Retenção do rate-limit hash:

**24 horas**.

Se tráfego real provar falso positivo/abuso, ajustar por evidência.

## 13. Persistência e idempotência

### Request

ID criado no servidor.

### Attachment

ID criado no servidor antes do signed upload token.

### Submit

`submission_key` idempotente.

Retry do submit com a mesma key:

- não duplica lead;
- retorna o mesmo resultado terminal quando seguro.

### Regra

O registro `submitted` só existe quando:

- payload canônico válido;
- contato válido;
- anexos exigidos presentes;
- attachments referenciados pertencem ao request;
- attachments concluídos estão `validated`;
- contagem/tamanho obedecem à política.

## 14. RLS, grants e Data API

Todas as tabelas acima ficam com:

- RLS habilitado;
- sem SELECT/INSERT/UPDATE/DELETE para `anon`;
- sem SELECT/INSERT/UPDATE/DELETE para `authenticated`;
- sem policy pública;
- acesso da aplicação somente por backend server-side autorizado.

Não usar browser → table.

Não usar browser → RPC de negócio.

A secret key Supabase fica somente no servidor.

O frontend não precisa de `NEXT_PUBLIC_SUPABASE_*` na V1.

### Storage

Bucket privado.

Nenhuma policy de list/read pública.

Upload direto ocorre por signed upload token específico.

Download para análise/review futura ocorre por signed URL curto gerado no servidor.

## 15. Supabase Auth

**Não usado na V1 pública.**

Visitante não cria conta.

Não usar anonymous sign-in apenas para permitir upload.

Isso criaria sessão/identidade sem necessidade.

Se uma área privada de gestão do CM surgir futuramente, Auth será decidido como capacidade separada.

## 16. Server boundary do Next.js

O site usa Route Handlers server-side.

Rotas propostas:

```text
POST /api/quote/session
POST /api/quote/attachments/init
POST /api/quote/attachments/complete
POST /api/quote/submit
GET  /api/quote/<public-result-id>   (somente se futuramente necessário)
```

Na V1 a confirmação pode vir diretamente do submit; não é obrigatório criar GET público.

### Secret key

Vercel Production:

`CM_SUPABASE_URL`

`CM_SUPABASE_SECRET_KEY`

`CM_QUOTE_BUCKET=quote-intake`

`CM_QUOTE_RATE_LIMIT_SECRET`

Nenhuma dessas variáveis usa prefixo `NEXT_PUBLIC_`.

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

## 18. Job de retenção

Cleanup não deve deletar diretamente metadados internos de `storage.objects` por SQL.

Exclusão de objeto deve usar Storage API.

Estratégia V1:

```text
Vercel Cron / server scheduled route
        ↓
server secret
        ↓
lista requests/attachments expirados
        ↓
Storage API delete
        ↓
delete/expire rows
        ↓
quote_events
```

Rota interna proposta:

`POST /api/internal/quote-retention`

Protegida por secret próprio de cron.

Executar diariamente.

Não usar Edge Function adicional no CM apenas para duplicar uma função que o runtime Next/Vercel já consegue executar.

Se no futuro o site sair da Vercel, mover o scheduler sem alterar o contrato de dados.

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

## 21. Secrets

### Git

Nunca commitados.

Criar somente arquivos example sem valores:

`.env.example`

### Vercel — Production

Server-only:

- `CM_SUPABASE_URL`;
- `CM_SUPABASE_SECRET_KEY`;
- `CM_QUOTE_BUCKET`;
- `CM_QUOTE_RATE_LIMIT_SECRET`;
- `QUOTE_RETENTION_CRON_SECRET`;
- `ARTESOPOLIS_CATALOG_URL`;
- `ARTESOPOLIS_CATALOG_TOKEN`.

### Supabase Admin project

Edge Function secret:

- `CM_PUBLIC_ORGANIZATION_ID`;
- `CM_CATALOG_READ_TOKEN`.

Não usar prefixo `SUPABASE_` para secrets custom da Edge Function.

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

## 28. Provisionamento — reutilização autorizada em 09/10/2026

O projeto CM **não será criado do zero**: reutilizar `auiovzmxvhqlvhtmkavt` na organização gratuita já conectada. Sequência completa, com checklist verificável e gates para evitar perda de dados, no [trabalho E2](work/08-supabase-staging-reuse.md).

1. Inventariar consumidores legados (Vercel, branch, crons, functions, Storage, Auth, segredos) e proteger a produção do Admin `ueasdbjuelqwfobcdlww`.
2. Recuperar conexão SQL administrativa do projeto de staging (erro `28P01`), produzir e validar backup externo recuperável.
3. Desativar/aposentar integrações, automações e dados de demonstração somente depois de provar que ninguém depende desse staging.
4. Conservar a project ref e alterar apenas o nome de exibição para CM, quando o ambiente estiver isolado.
5. Aplicar migrations do Orçamento; criar bucket privado `quote-intake`, ACL/RLS, handlers, uploads, rate limit e retenção.
6. Configurar secrets server-side no Vercel do Radio e validar casos de segurança/falha.
7. Habilitar intake público real somente após o gate de backup/plano de produção previsto aqui; upgrade pago não está autorizado implicitamente.

**Em 09/10/2026:** alvo identificado, mas P0/P1 ainda não passaram; nenhum apply/cleanup remoto executado.

### Produto bridge

Separadamente, no Supabase já usado pelo Artesopolis Admin:

1. aplicar migration da publicação CM;
2. deploy `cm-public-catalog`;
3. configurar `CM_PUBLIC_ORGANIZATION_ID`;
4. configurar `CM_CATALOG_READ_TOKEN`;
5. configurar URL/token no Vercel;
6. migrar os 9 produtos;
7. cortar o catálogo estático.

## 29. O que não depende da conta ainda

Pode ser implementado antes do projeto remoto existir:

- migrations;
- schema;
- RLS/grants;
- adapters;
- signed-upload contract;
- Route Handlers;
- content sniffing;
- rate-limit RPC/table;
- retention logic;
- tests;
- fixture;
- product bridge no código;
- documentação.

Fica bloqueado até a conta/projeto existir:

- link remoto;
- criação real do bucket;
- secret keys;
- apply migration remoto;
- upload real;
- advisors remotos;
- deploy production;
- validação live.

## 30. Gate de infraestrutura pronta

Só marcar `infra_ready` quando:

- [ ] projeto CM existe em `sa-east-1`;
- [ ] plano de produção adequado está ativo antes do intake real;
- [ ] migrations aplicadas no alvo correto;
- [ ] bucket privado existe;
- [ ] direct anon table access falha;
- [ ] upload assinado funciona;
- [ ] TUS resume funciona;
- [ ] content validation funciona;
- [ ] submit idempotente funciona;
- [ ] rate limit funciona;
- [ ] retention funciona;
- [ ] delete remove Storage + row;
- [ ] DB backup policy conferida;
- [ ] nenhum arquivo do intake é tratado como backup de produção;
- [ ] secrets estão fora do Git/browser;
- [ ] Security Advisor revisado;
- [ ] Performance Advisor revisado;
- [ ] produto bridge está no Supabase do Admin, não duplicado no CM;
- [ ] nenhuma pendência material está escondida como “depois”.

## 31. Referências oficiais consultadas

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

## 32. Retomada

Estado em 05/10/2026:

- arquitetura Supabase: **definida**;
- conta existente Artesopolis Free: **conectada**;
- projeto CM: **ref de staging existente identificada para reaproveitamento, não saneada**;
- project ref: **`auiovzmxvhqlvhtmkavt`**;
- migration quote: **não implementada**;
- bucket: **não criado**;
- Vercel secrets: **não configurados**;
- Produto bridge Admin Supabase: **planejado, não implementado**;
- Orçamento Supabase CM: **planejado, não implementado**.

Próxima ação técnica sem depender de conta:

> implementar localmente o schema/migrations do Orçamento e os adapters server-side seguindo este contrato.
