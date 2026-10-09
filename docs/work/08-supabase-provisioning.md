# E2 — Provisionamento seguro do Supabase CM

Estado: **in_progress** (10 migrations; retenção SQL/HTTP implementada/testada sinteticamente; TUS/Storage reais, secrets/Cron e deploy pendentes)  
Atualização: **09/10/2026**  
Owner: **CM Infra / CM Data**  
Contrato: [Supabase Infrastructure V1](../SUPABASE_INFRASTRUCTURE_V1.md)  
Contexto: [Estúdio público](08-studio-growth.md) e [Roadmap](../ROADMAP.md)

## Decisão vigente

Em **09/10/2026**, o usuário criou um projeto Supabase **novo e limpo**, na organização independente **Cmangini3d** (plano Free), na região contratada **`sa-east-1` (São Paulo)**. O nome de exibição atual é `cassianomangini's Project`. Identificadores de projeto, URLs administrativas e segredos ficam fora deste Git público.

**Conferência inicial (09/10/2026):** projeto `ACTIVE_HEALTHY`, PostgreSQL 17.11, criado vazio e sem migrations. **Estado posterior:** dez migrations, seis tabelas privadas com RLS, bucket privado e nenhuma solicitação/objeto real; read-back e advisor executados após as alterações. O projeto anterior criado em região dos EUA **não é mais o alvo**; a ferramenta devolveu erro de permissão ao consultar aquela referência antiga, logo a exclusão é informada pelo usuário, mas não auditada de forma independente.

O projeto CM agora corresponde à decisão arquitetural: **banco separado, organização separada, região São Paulo**. A V1 armazena somente dados privados de Orçamento; os produtos e a Shopee continuam no Artesopolis Admin, com ponte editorial read-only independente; músicas e sidecars continuam no R2.

O ambiente antigo de testes do Admin segue `INACTIVE`, pausa efetuada pelo usuário. A existência de backup recuperável e a ausência de consumidores do staging **continuam não verificadas**. Não reativar, limpar nem tocar o Supabase de produção do Admin sem necessidade e autorização específicas.

Nenhum gasto, plano Pro, migração de dados antigos, configuração Vercel, ativação do formulário público ou deploy está autorizado implicitamente pelo simples provisionamento.

## Como registrar evidência

Uma caixa `[x]` significa que o artefato e a prova foram verificados, não apenas planejados. Registrar no checkpoint correspondente a evidência de link/commit, teste ou observação remota; não publicar identificadores, credenciais, inventários internos ou logs de outros sistemas neste repositório público.

## P0 — Contratos e documentação pública

- [x] Definir a alternativa **novo projeto limpo**, sem declarar provisionamento inexistente.
- [x] Sanitizar do estado público os identificadores e o inventário operacional do ambiente legado.
- [x] Alinhar contrato de Orçamento anônimo com posse de sessão e quotas.
- [x] Especificar Vercel Cron com GET, `CRON_SECRET`, reconciliação e retenção.
- [x] Conciliar roadmap, arquitetura e checklist.
- [x] Auditoria **focal** dos três commits públicos que introduziram o inventário legado: identificadores e detalhes técnicos ainda aparecem no histórico, mas não foram encontrados padrões evidentes de credenciais nos diffs inspecionados. **Não** houve reescrita de histórico. Evidência: comparação dos commits de 09/10/2026 com o HEAD sanitizado.
- [ ] Avaliar posteriormente necessidade real de mitigação adicional do histórico; não reescrever `main`/force-push nem invalidar clones só por identificadores que não são segredos. Esse residual **não autoriza publicar segredos nem bloqueia o inventário read-only**.

Gate: contratos sincronizados com o estado real de implementação; detalhes de desativação legada mantidos fora da documentação pública.

## P1 — Liberar vaga Free sem afetar o Admin

- [x] Registrar inspeção inicial read-only do staging e de seus consumidores declarados (Vercel de testes, sandbox, funções e cron); detalhes internos permaneceram fora do Git.
- [x] Confirmar via Management API que o projeto antigo de testes foi pausado pelo usuário (`INACTIVE`) e que o Admin de produção permaneceu ativo.
- [x] Confirmar existência da organização independente **Cmangini3d / Free** para o projeto CM.
- [ ] Arquivar comprovação de backup externo recuperável do staging (DB + Storage relevante) em local privado; não tratar a pausa como backup.
- [ ] Comprovar que não há consumidores legados necessários; não alterar scripts/credenciais do Admin sem avaliação explícita.
- [ ] Executar verificação de fluxo operacional do Admin após pausa, com evidência separada.

**Gate P1:** vaga liberada e projeto CM criado; **pendências residuais de backup/consumidores do staging não foram artificialmente marcadas como concluídas**. Não são motivo para operar no banco do Admin; registrar riscos sem misturá-los ao CM.

## P2 — Criar e validar projeto CM limpo

- [x] **Projeto definitivo criado pelo usuário** na organização **Cmangini3d**, separado da organização Artesopolis.
- [x] **Região correta `sa-east-1`** verificada via Management API; a divergência US East anterior foi encerrada por substituição do projeto, não por migração.
- [x] Verificar banco PostgreSQL acessível por SQL read-only, sem tabelas de negócio ou migrations remotas existentes (base inicial limpa).
- [x] Security Advisor inicial sem lints no banco novo (reexecutar **depois** de migrations).
- [x] Confirmar plano **Free** e que a Vercel do Radio ainda não recebeu variáveis CM Supabase (apenas configuração R2).
- [ ] Confirmar MFA e permissões mínimas da conta/organização no Dashboard; ferramenta conectada não comprova esse estado.
- [ ] Instalar/configurar Supabase CLI e ambiente local com `config.toml` e seed sintético. **Bloqueio do runner:** CLI, Docker/Postgres não disponíveis; tentativa `npx --offline supabase --version` retornou `ENOTCACHED`.
- [ ] Testes locais com CLI/Postgres permanecem **BLOCKED** por falta de runtime; **substituição parcial verificada**: migration executada em transação com `ROLLBACK` no projeto vazio, verificação de tabelas ausentes após rollback e read-back SQL após apply.
- [x] Conferir alvo definitivo, executar SQL integral em transação com `ROLLBACK`, comprovar ausência de objetos após dry-run e aplicar migration **não destrutiva** `create_quote_core` no projeto CM de São Paulo; versionamento Git com timestamp **retornado pelo histórico remoto**, não inventado. Commit `aa7450f5`; quatro tabelas conferidas.
- [ ] Validar Data API, políticas de backup e quotas após o provisionamento de schema/Storage.

**Gate P2 parcial:** projeto/região/organização, schema e **bucket remoto privado comprovados**. CLI/local stack, configuração Data API, fluxos reais de upload/Storage API e validação integrada **não concluídos**; sem segredos no Git/browser.

## P3 — Orçamento privado com posse de sessão

**Preparação local independente de P1/P2:** é permitido desenvolver/validar primitivas sem criar banco ou habilitar acesso público. Isso **não** avança o gate remoto fora de ordem.

- [x] Adicionar a primitiva criptográfica server-only de sessão opaca, HMAC de posse e política de cookie em [`session-token.ts`](../../src/server/quote/session-token.ts); teste focal em [`studio-quote-session.test.mjs`](../../tests/studio-quote-session.test.mjs). Em 09/10/2026, **5/5 testes passaram** com Node 22 e os arquivos foram comparados aos blobs da `main` pelo SHA Git. **Somente primitiva**, não houve escrita no banco.
- [x] Versionar e aplicar a primeira migration de `quote_requests`, `quote_attachments`, `quote_events`, `quote_rate_limit_windows`, com hash de posse, FKs, índices, estados e constraints: [`20261009143743_create_quote_core.sql`](../../supabase/migrations/20261009143743_create_quote_core.sql). Verificada no projeto correto; sem dados pessoais inseridos.
- [x] Implementar **código** para `POST /api/quote/session`: cookie `__Host-` host-only, `Secure`, `HttpOnly`, `SameSite=Strict`, 256 bits e HMAC no write server-only. [Handler](../../src/server/quote/handlers.ts) · [Route](../../src/app/api/quote/session/route.ts) · [Testes](../../tests/quote-backend-handlers.test.mjs). **Integração SQL via HTTP real não verificada; flag desligada.**
- [ ] Validar criação/retomada real de sessão e draft no projeto CM com credenciais server-only configuradas, sem exposição no browser.
- [x] Implementar no código de `attachments/init` a extração/validação da sessão, cálculo de hash, verificação SQL `requestId + ownerSessionHash` na RPC `quote_reserve_attachment`, rate limit e geração de assinatura exclusiva do objeto. [Gateway](../../src/server/quote/supabase-gateway.ts) e [rota](../../src/app/api/quote/attachments/init/route.ts). **Só testes mockados na camada HTTP, sem TUS real.**
- [x] **Implementar em código** `attachments/complete` e `submit` com sessão + hash de posse + ID. SQL de `quote_owned_attachment`, `quote_validate_attachment` e `quote_submit` como RPCs SECURITY INVOKER exclusivas `service_role`. [Migration](../../supabase/migrations/20261009153821_quote_validate_submit_boundaries.sql) · [Handler](../../src/server/quote/handlers.ts). **Não é prova de acesso HTTP/E2E real.**
- [ ] Validar as quatro rotas em um processo Next real com secrets controlados, duas sessões, expiração e falhas; o envio público continua desativado.
- [x] Adicionar e testar boundary HTTP de `Origin` same-origin, `Sec-Fetch-Site`, `Content-Type` JSON, corpo limitado a 16 KiB, cookie duplicado rejeitado, IP confiável na Vercel e falha segura fora de proxy confiável. [http.ts](../../src/server/quote/http.ts) · [testes](../../tests/quote-backend-handlers.test.mjs).
- [ ] Testar esses controles em ambiente Next real, incluindo expiração, troca de cookie e tentativa de cross-session; bloqueios atuais permanecem `BLOCKED` por ausência de secrets/integração E2E.
- [x] Habilitar RLS e negar privilégios diretos `anon`/`authenticated` **nas seis tabelas** de Orçamento/limites/retencao; SQL live confirmou leitura anônima negada e EXECUTE anônimo negado nas RPCs. **Bucket `quote-intake` privado**, sem policies para `storage.objects`; Security Advisor mantém 6 avisos `INFO` intencionais de RLS sem policies. Ainda falta prova HTTP real de negação anônima.
- [x] Prova SQL transacional de `quote_submit`: envio sem arquivo permitido somente para tipos compatíveis, primeira transição e replay com mesma key devolvem o mesmo recibo, key diferente/requisição de outra sessão rejeitadas, sem duplicar evento; `impressao` sem arquivo validado rejeitada; `anon` sem EXECUTE nas RPCs. [Teste SQL](../../tests/sql/quote-validation-submit.sql). Zero contatos ou arquivos persistidos após rollback.
- [ ] Testes HTTP/Storage E2E de posse cruzada, concorrência real entre conexões e upload de arquivo efetivo (os testes SQL não substituem isso).

Gate: não há acesso horizontal por adivinhar/obter ID de orçamento.

## P4 — Anexos, limite global e retenção

- [x] Criar e verificar o bucket **privado** `quote-intake`, `public=false`, limite real de **50.000.000 bytes/objeto** e ausência de policies públicas no Storage. Browser alinhado a **50 MB por arquivo, 100 MB por pedido**, com teste de fronteira versionado. **Não afirmar que upload TUS foi exercitado.**
- [x] Aplicar migration de limites globais: `quote_upload_limits=600000000` e reserva conservadora **50 MB/arquivo pendente**, serialização por lock de linha, no máximo 5 anexos/100 MB contabilizados por pedido; `quote_reserve_attachment` idempotente exige hash de posse do draft. [Migration](../../supabase/migrations/20261009144734_quote_private_bucket_and_capacity.sql) · [Teste SQL](../../tests/sql/quote-private-storage.sql).
- [x] Proteger integridade do descarte: impedir `DELETE` de anexo ainda reservado/armazenado; `quote_release_attachment` exige hash, grant expirado e ausência de `storage.objects`; bloquear redução prematura do prazo TUS. [Cleanup](../../supabase/migrations/20261009145055_quote_attachment_safe_release.sql) · [Expiração](../../supabase/migrations/20261009145125_guard_quote_upload_grant_expiry.sql) · [Teste SQL](../../tests/sql/quote-safe-release.sql).
- [x] Aplicar `quote_consume_rate_limit` como RPC atômica por janela/hora (`create=5/h`, `upload=25/h`, `submit=5/h`), armazenando apenas hash HMAC do IP. SQL remoto com `BEGIN/ROLLBACK` comprovou quinta chamada permitida, sexta negada, isolamento por ação/hash e bloqueio de `EXECUTE` para `anon`/`authenticated`. **Zero janelas de teste persistidas**. [Migration](../../supabase/migrations/20261009152128_quote_rate_limit_atomic.sql) · [Teste SQL versionado e executado](../../tests/sql/quote-rate-limit.sql).
- [x] Após o Performance Advisor identificar uma FK sem índice (`quote_events.quote_request_id`), aplicar [migration de índice](../../supabase/migrations/20261009145751_index_quote_events_request_fk.sql) e confirmar o desaparecimento do alerta. Permanecem avisos `INFO` de índices ainda não usados, esperados em banco sem dados de negócio; não removê-los sem workload.
- [x] Executar testes sintéticos SQL com `BEGIN/ROLLBACK`: idempotência, sessão incorreta, conflito de chave, cota por pedido/global, impedimento de manipulação, impedimento de liberar grant ativo e limpeza repetível; **read-back de zero requests/anexos/objetos**. Não foram realizados uploads reais nem teste de corrida com duas conexões.
- [x] Implementar **fluxo de código** `attachments/init`: valida metadados com [política canônica de arquivos](../../src/features/studio/quote-contract.ts), verifica sessão + quota na RPC e solicita assinatura Storage `createSignedUploadUrl` por path imutável via API. Usa `apikey` moderno somente no servidor; retorna token `x-signature` sem service key. **Bloqueio de reemissão** quando uma nova assinatura de 2h permitiria iniciar uma URL TUS de até 24h após a reserva de 27h (margem de segurança de 1h). Corrigido após revisão, com [nona migration](../../supabase/migrations/20261009185555_quote_tus_ttl_touch_and_replay.sql). [Handler](../../src/server/quote/handlers.ts) · [Gateway](../../src/server/quote/supabase-gateway.ts).
- [x] Corrigir `acceptedPath` (regex de UUID/path) e substituir o match dinâmico por comparação exata. Erro de sintaxe confirmado e removido em `supabase-gateway.ts`; CI de lint/typecheck/build deve confirmar integração final.
- [x] Corrigir o contrato de upload retomável: token assinado 2h, URL TUS até 24h, reserva conservadora de **27h**, renovação de TTL do draft/anexo em operações autenticadas e renovação de cookie em init/complete. SQL transacional atualizado e executado com `ROLLBACK` em 09/10/2026; sem arquivos reais.
- [x] Implementar recuperação de recibo idempotente **antes** de consumir outra tentativa de rate limit: RPC owner-bound `quote_submission_receipt`, método no gateway e teste mockado de replay com rate esgotado. Teste SQL de posse/replay com `ROLLBACK` passou; sem prova HTTP real.
- [x] Substituir detecção 3MF por marcadores textual por verificação ZIP/OPC com limites de memória, CRC, EOCD, diretório central e cabeçalhos locais; **4 testes Node 22 locais passaram**, incluindo ZIPs válidos e forjados. Não é parser geométrico/antivírus nem substitui teste em 3MF real da Bambu.
- [ ] Executar assinatura TUS **real** (permissões, tempo, CORS, retentativa, sem upsert) no Supabase com secrets configurados; respostas 409/429/503 foram exercitadas apenas em testes mockados.
- [x] **Implementar validação no código** de `attachments/complete`: RPC owner-bound retorna o path, Storage API verifica tamanho real, leitura parcial limitada compara assinatura PDF/PNG/JPEG/WebP/STL/OBJ/STEP e estrutura ZIP/OPC 3MF com diretório central, EOCD, cabeçalhos locais, CRC de manifestos, limites e detecção de nomes adulterados; RPC transacional exige tamanho real igual ao declarado e consistência de tipo/extensão. [Validador de formatos](../../src/server/quote/file-sniffer.ts) · [Parser 3MF](../../src/server/quote/zip-3mf.ts) · [Teste ZIP local](../../tests/quote-3mf.test.mjs) · [Migration de compatibilidade de tipo](../../supabase/migrations/20261009154035_quote_detected_type_guard.sql). **A estrutura 3MF não é um parser CAD completo e não faz antivírus.**
- [ ] Executar upload TUS real, retomar interrupção, validar `Range` da Storage API, 3MF de impressora real, inspeção de conteúdo e isolamento; sem credenciais server-only configuradas não é possível promover esta prova.
- [ ] Testar corrida real em duas conexões/duas sessões e recuperação de falha parcial; os locks estão implementados, mas essa prova ainda não foi executada.
- [x] Implementar **em código e SQL** limpeza segura: lease global de 10min, seleção de anexos vencidos **somente após 27h TUS**, exclusão via Storage API DELETE seguida de GET info 404, e RPC final que revalida vencimento/ausência e libera quota. Reinício após falha mantém os registros para retry. [Migration](../../supabase/migrations/20261009232648_quote_retention_service_lease_and_cleanup.sql) · [Gateway](../../src/server/quote/retention-gateway.ts) · [Handler](../../src/server/quote/retention-handler.ts). **Ainda sem deleção real: código com mocks e SQL remoto com ROLLBACK apenas.**
- [ ] Validar **Storage real**: remoção física, falha parcial, repetição, retomada e chamadas paralelas; só isso fecha o gate de limpeza.
- [x] Criar `GET /api/internal/quote-retention` com `CRON_SECRET` (Bearer, comparação temporal segura, no-store e 401 sem credencial), execução mesmo com intake OFF e testes mockados de sucesso, concorrência e falha. [Rota](../../src/app/api/internal/quote-retention/route.ts) · [Teste JS](../../tests/quote-retention.test.mjs).
- [ ] Configurar `CRON_SECRET` na Vercel, testar rota HTTP com secret real em ambiente controlado e só então **agendar** execução diária no `vercel.json`.
- [x] Executar [teste SQL sintético](../../tests/sql/quote-retention.sql) com `BEGIN/ROLLBACK` para TUS ainda ativo, arquivos vencidos, limpeza 90d, requests/contato 180d, rate limit 24h, eventos 365d, lease exclusivo e grants; banco permaneceu sem registros reais.
- [ ] Comprovar retenção com objetos reais, falhas/duplicidade, execução autenticada na Vercel e alertas de ausência/falha do Cron.

**Gate P4 ainda aberto:** worker de retenção versionado e testado sinteticamente; TUS real, deleção física real e cron/alertas ainda bloqueiam produção.

## P5 — Integrar ao site sem antecipar publicação

- [ ] Configurar na Vercel (ainda NÃO realizado): `CM_SUPABASE_URL`, `CM_SUPABASE_SECRET_KEY`, `CM_QUOTE_BUCKET`, `CM_QUOTE_RATE_LIMIT_SECRET`, `CM_QUOTE_SESSION_SECRET` e `CRON_SECRET`. As rotas de desenvolvimento exigem ainda `CM_QUOTE_INTAKE_ENABLED=true` **somente em ambiente controlado**, depois dos testes de complete/submit/cleanup; por padrão segue `false`.
- [x] Criar `POST /api/quote/session` e `POST /api/quote/attachments/init` (runtime Node, cache desativado) e testar isolamento/mock HTTP. **Flag `CM_QUOTE_INTAKE_ENABLED` desabilitada por padrão** em `.env.example`; nenhuma credencial nova ou deploy.
- [x] Implementar rotas `POST /api/quote/attachments/complete` e `POST /api/quote/submit` no Git com feature gate OFF; `submit` reutiliza parser/validação/triagem canônicos, exige attachment IDs e submissionKey únicos, chama RPC SQL idempotente com lock por draft e rate limit no banco. [Rotas](../../src/app/api/quote/submit/route.ts) · [Gateway](../../src/server/quote/supabase-gateway.ts). Teste SQL positivo para no-file e negativos passaram com rollback; [testes JS foram escritos](../../tests/quote-complete-submit.test.mjs) **mas o CI completo não foi confirmado**.
- [x] **CI real verificado em main:** workflow `ci` execução [37977555280](https://github.com/cassianomangini/radioand3d/actions/runs/37977555280), commit `e4f352e351a36ae51912e8622466091662448491`: **lint PASS, typecheck PASS, 103/103 testes PASS, build Next PASS (26 páginas estáticas)**. O erro anterior do mock foi corrigido e a execução final completa passou.
- [ ] Testar smoke HTTP/Storage com secrets server-only controladas, TUS real, `Range`, isolamento de sessão e cenário de token expirado; **suite CI verde não substitui E2E remoto**.
- [x] Manter `vercel.json` **sem `crons`**, embora a rota agora exista: falta configurar secrets e comprovar remoção real antes do agendamento.
- [ ] Respeitar `git.deploymentEnabled: false`: preparar deploy **explícito**; não presumir autodeploy.
- [ ] Confirmar que a Rádio permanece independente do Supabase CM, e que a ponte pública de Produtos continua em entrega distinta.
- [ ] Rodar smoke real de submit, tentativa de acesso indevido, upload interrompido, limpeza, advisor e monitoramento.

Gate: ponta a ponta comprovado em ambiente correto, com todos os dados privados protegidos.

## P6 — Decisão de lançamento e operações

- [ ] Revisar plano, política de backup, uso de quota e custo **da organização CM**, sem alterar faturamento do Admin.
- [ ] Reavaliar a decisão de usar Pro **antes** de aceitar orçamentos reais, conforme o contrato: nenhuma compra automática.
- [ ] Confirmar domínio/HTTPS, contato de continuidade, tratamento de dados e validação do responsável.
- [ ] Habilitar envio público **somente após** conclusão comprovada dos gates de produção.
- [ ] Atualizar evidência em [08 — Estúdio](08-studio-growth.md) e [Roadmap](../ROADMAP.md).

## Limites e entregas relacionadas

A **ponte de Produtos/Shopee** tem plano e gate próprios em [Product Catalog Bridge](../PRODUCT_CATALOG_BRIDGE_PLAN_V1.md). **Não** é construída neste banco nem deve ser considerada `done` pelo sucesso de E2.

A limpeza/pausa de recursos do ambiente legado exige inventário **privado** e operação explicitamente confirmada. Esta documentação pública registra só os gates e não deve servir como runbook destrutivo.

## Retomada verificada em 09/10/2026

- **P0:** contratos documentados e HEAD público sanitizado; histórico antigo tem material técnico residual sem credenciais detectadas na auditoria focal.
- **P1:** staging legado pausado pelo usuário e `INACTIVE`; backup restaurável e inexistência de consumidores **não comprovados**; Admin produção segue `ACTIVE_HEALTHY`, sem testes operacionais completos de regressão.
- **P2:** projeto definitivo na organização separada **Cmangini3d**, **região São Paulo**, ativo; dez migrations versionadas, seis tabelas privadas, bucket privado. Security Advisor: seis avisos `INFO` de RLS sem policies (negação deliberada). A referência antiga nos EUA não é o alvo.
- **P3 local:** token opaco, HMAC de posse e testes focais já versionados. Isso não é fluxo persistente funcionando.
- **Supabase CM remoto:** dez migrations versionadas (incluindo retenção server-only), seis tabelas privadas, quota e bucket privado. RPCs de envio idempotente e posse testadas com rollback. **Nenhum pedido, contato, anexo ou janela de teste persistiu.** As quatro rotas de intake existem só no Git, com flag false; a rota interna de retenção exige CRON_SECRET. Sem secrets, upload TUS real, remoção Storage real ou Cron agendado.
- **Vercel:** projeto Radio mantém somente variáveis R2; não foi alterado.
- **CI fechado e verificado:** `ci` em `e4f352e`, 103/103 testes + lint/typecheck/build verdes. **Próximo passo:** validar TUS e Storage `Range` com arquivos sintéticos e 3MF real; testar remoção Storage real, configurar secret/cron e fazer smoke end-to-end. O worker foi implementado mas não está agendado. **Não habilitar intake público até gate de retenção, backup e custos.**
