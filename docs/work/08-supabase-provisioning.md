# E2 — Provisionamento seguro do Supabase CM

Estado: **in_progress** (projeto CM definitivo validado em São Paulo e organização Free própria; schema/deploy pendentes)  
Atualização: **09/10/2026**  
Owner: **CM Infra / CM Data**  
Contrato: [Supabase Infrastructure V1](../SUPABASE_INFRASTRUCTURE_V1.md)  
Contexto: [Estúdio público](08-studio-growth.md) e [Roadmap](../ROADMAP.md)

## Decisão vigente

Em **09/10/2026**, o usuário criou um projeto Supabase **novo e limpo**, na organização independente **Cmangini3d** (plano Free), na região contratada **`sa-east-1` (São Paulo)**. O nome de exibição atual é `cassianomangini's Project`. Identificadores de projeto, URLs administrativas e segredos ficam fora deste Git público.

**Conferência live (Supabase Management + SQL, 09/10/2026):** projeto `ACTIVE_HEALTHY`, banco PostgreSQL 17.11, `public` sem tabelas, histórico de migrations vazio, consulta SQL funcional, Security Advisor inicial sem achados. O projeto anterior criado em região dos EUA **não é mais o alvo**; a ferramenta devolveu erro de permissão ao consultar aquela referência antiga, logo a exclusão é informada pelo usuário, mas não auditada de forma independente.

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
- [ ] Configurar e versionar ambiente local do Supabase CLI, `config.toml`, migrations e seed sintético sem dados pessoais.
- [ ] Executar testes de schema e regras/RLS/grants localmente com CLI/Postgres; se ambiente local indisponível, registrar `BLOCKED`, não `PASS`.
- [ ] Conferir alvo definitivo e dry-run antes de **apply remoto** de migrations, com histórico versionado e revisão SQL.
- [ ] Validar Data API, políticas de backup e quotas após o provisionamento de schema/Storage.

**Gate P2:** identidade, região, organização e banco limpo **confirmados**. Preparação CLI, migrations, segurança pós-DDL e integração remota **ainda não concluídas**; nenhum segredo deve aparecer no Git ou no browser.

## P3 — Orçamento privado com posse de sessão

**Preparação local independente de P1/P2:** é permitido desenvolver/validar primitivas sem criar banco ou habilitar acesso público. Isso **não** avança o gate remoto fora de ordem.

- [x] Adicionar a primitiva criptográfica server-only de sessão opaca, HMAC de posse e política de cookie em [`session-token.ts`](../../src/server/quote/session-token.ts); teste focal em [`studio-quote-session.test.mjs`](../../tests/studio-quote-session.test.mjs). Em 09/10/2026, **5/5 testes passaram** com Node 22 e os arquivos foram comparados aos blobs da `main` pelo SHA Git. **Somente primitiva**, não houve escrita no banco.
- [ ] Versionar migrations de `quote_requests`, `quote_attachments`, `quote_events` e `quote_rate_limit_windows`, incluindo vínculo de posse de sessão e índices/constraints.
- [ ] Implementar sessão anônima opaca por cookie `Secure`, `HttpOnly`, `SameSite=Strict`, com segredo aleatório forte e vínculo persistido **apenas por digest/HMAC** no banco.
- [ ] Em toda operação sobre request ou anexo, conferir a **posse por sessão + ID** no servidor antes de usar credencial privilegiada. UUID não é autorização.
- [ ] Impor Origin/CSRF, allowlist de métodos e `Content-Type`, expiração de sessão e fluxo previsível após expiração.
- [ ] Habilitar RLS e grants restritos; `anon` e `authenticated` sem acesso direto a tabelas ou bucket.
- [ ] Verificar isolamento entre duas sessões, tentativas cruzadas, retries, concorrência e submit idempotente.

Gate: não há acesso horizontal por adivinhar/obter ID de orçamento.

## P4 — Anexos, limite global e retenção

- [ ] Criar `quote-intake` privado e limites por arquivo/pedido conforme contrato.
- [ ] Emitir token de upload **somente** após validar posse da sessão, quota, caminho imutável e reserva de capacidade.
- [ ] Validar upload TUS/resume e assinatura do conteúdo; impedir upsert e submissão com objeto inválido.
- [ ] Definir/medir teto **agregado** de bytes reservados + objetos existentes, com reserva transacional e compensação de falhas/expiração.
- [ ] Implementar rota autenticada `GET /api/internal/quote-retention` com `CRON_SECRET`; agendar **diariamente**, quando a rota e os segredos estiverem operacionais.
- [ ] Implementar varredura idempotente: Storage API exclui objetos antes de confirmar eliminação de metadados; falhas parciais permanecem recuperáveis.
- [ ] Provar exclusão de uploads órfãos, drafts, anexos submetidos e contatos nos prazos contratados; observar falhas do job e execução manual autenticada.

Gate: retenção e consumo medidos, testados e recuperáveis diante de interrupção/duplicidade.

## P5 — Integrar ao site sem antecipar publicação

- [ ] Criar configuração `CM_SUPABASE_URL`, `CM_SUPABASE_SECRET_KEY`, `CM_QUOTE_BUCKET`, `CM_QUOTE_RATE_LIMIT_SECRET`, `CM_QUOTE_SESSION_SECRET` e `CRON_SECRET` **somente no servidor** e nos ambientes apropriados.
- [ ] Implementar Route Handlers de sessão, init/complete do anexo e submit; validar erros, ausência de segredo e ambiente não provisionado.
- [ ] Manter `vercel.json` **sem** `crons` até existir rota pronta: agendar caminho inexistente gera invocação e erro.
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
- **P2:** projeto definitivo na organização separada **Cmangini3d**, **região São Paulo**, ativo, banco acessível, vazio e sem migrations. Security Advisor inicial sem achados. A referência antiga nos EUA não é o alvo.
- **P3 local:** token opaco, HMAC de posse e testes focais já versionados. Isso não é fluxo persistente funcionando.
- **Supabase CM remoto:** **criado pelo usuário**; sem schema de negócio, bucket `quote-intake` validado, secrets, rotas ou cron aplicados.
- **Vercel:** projeto Radio mantém somente variáveis R2; não foi alterado.
- **Próximo passo:** preparar migrations e testes de dados **versionados**, conferir Data API e RLS/grants, executar dry-run e somente então aplicar no projeto CM definitivo. O formulário público permanece desabilitado até o gate de privacidade/lançamento.
