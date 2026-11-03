# Segurança do CM 3D & Rádio — auditoria e plano de execução

**Data:** 03/11/2026  
**Estado:** revisão estática + leitura da configuração Vercel; não equivale a pentest, teste de invasão ou aprovação para produção.  
**Escopo:** `main` (legado) e `cmc/renew` (aplicação nova publicada), APIs públicas, formulário, upload TUS assinado, armazenamento, e-mail, retenção, dependências e CI.  
**Ambiente:** repositório público. Este documento não contém segredos, dados de clientes, IDs privados de infraestrutura nem instruções exploráveis.

## 1. Resumo executivo

**Decisão:** não considerar o recebimento público de arquivos plenamente endurecido até concluir o bloqueio P0 e demonstrar testes integrados. O risco não é a simples presença de um formulário; é a combinação de backend exposto, tokens de upload, processamento de arquivos não confiáveis e dependências com advisories conhecidos.

A `main` ainda contém a aplicação legada. A produção consultada na Vercel estava associada a um deploy da `cmc/renew`. A branch `cmc/renew` contém a nova aplicação em `cm-3d-radio-novo/`; implementar apenas o legado da `main` não melhora necessariamente a produção atual. Este primeiro PR é direcionado à `cmc/renew`. O alinhamento com a `main` depende da decisão de integração da reconstrução, sem misturar mudanças de layout ou realizar merge automático.

### Achados prioritários

| ID | Severidade | Achado | Evidência / limite | Tratamento |
| --- | --- | --- | --- | --- |
| SEC-01 | Crítica, dependente de pré-condições específicas de exploração | Next.js 16.3.7 listado em intervalos afetados por advisories de segurança; há releases corrigidas. | `package.json` e advisories oficiais. Ter versão afetada não comprova exposição de cada vetor nem invasão. | Atualizar Next + lockfile e validar. |
| SEC-02 | Alta | Proteção antiautomação insuficiente em criação de pedidos/assinaturas. | Rate limit por IP existe, mas não há desafio de humanidade verificado no servidor. | Turnstile, validação server-side e limites em camadas. |
| SEC-03 | Alta | Capacidade global reservada por tokens de upload pode ser esgotada por uso abusivo. | O SQL reserva o tamanho máximo por autorização; há teto global, mas ele também limita a disponibilidade. | Capacidade, concorrência, quotas e observabilidade. |
| SEC-04 | Alta, no processamento de arquivos | Validação estrutural de formatos não substitui antivírus, sandbox e processamento seguro. | Validação de tipo/ZIP implementada; inspeção maliciosa não comprovada. | Quarentena e abertura isolada. |
| SEC-05 | Alta, processo | Workflows antigos estão em `OLD/.github/workflows/`, não ativos para a aplicação nova. | Árvore da `cmc/renew`. | CI no caminho ativo. |
| SEC-06 | Média | Cabeçalhos de segurança globais não estavam definidos na aplicação nova. | `cm-3d-radio-novo/next.config.ts` vazio. | Headers incrementais e teste de regressão. |
| SEC-07 | Média | A autorização inicial aceitava extensões fora do papel do campo (por exemplo, um formato de modelo no campo de referência). | UI restringe papéis, rota `attachments/init` usava allowlist global. | Validar `role` e extensão antes de assinar. |
| SEC-08 | Média | Notificação de e-mail é processada na requisição; a confirmação não é transacional com o envio. | `emailWasSent` → `send` → `recordEmailSent`. | Outbox/fila idempotente e recuperação. |
| SEC-09 | Não verificado remotamente | RLS, bucket privado, Storage TUS, CORS e Cron precisam de read-back do Supabase CM e testes E2E. | Migrations versionadas existem; conexão disponível não incluiu o projeto separado CM. | Verificar projeto certo sem tocar no Artesopolis Admin. |
| SEC-10 | Média, privacidade | Ausência de aviso de privacidade claro no fluxo novo; e-mail replica dados pessoais que podem sobreviver ao expurgo do banco. | Inspeção do fluxo de orçamento e template de e-mail. | Aviso LGPD, minimização e retenção por provedor. |
| SEC-11 | Requer investigação | Turbopack avisa sobre rastreamento do projeto inteiro devido a acesso dinâmico ao sistema de arquivos em código do visualizador de desenvolvimento. | Aviso observado no build Next.js 16.4.4; não há prova de vazamento público. | Inspecionar o artefato de produção e isolar o código de desenvolvimento do bundle. |

**Proteções já presentes no código:** token de sessão opaco, cookie HttpOnly/Secure/SameSite Strict, verificação de Origin, JSON limitado, rate-limit atômico por IP, reserva de capacidade, URLs de upload assinadas, validação de tamanho/formato, bucket privado definido no SQL, RLS sem acesso anônimo e submissão idempotente. Essas proteções devem ser preservadas e verificadas em produção; não reinventá-las.

## 2. Backlog completo, por prioridade

Status usados: **[IMPLEMENTADO NO PR]** = código/documento proposto, sem validação de deploy; **[PENDENTE]** = não concluído; **[VERIFICAR]** = existe código, falta evidência real. Critérios abaixo são necessários antes de marcar `done`.

### P0 — Bloqueios antes de considerar o upload seguro

- [x] **01 · Dependências críticas (IMPLEMENTADO NO PR, NÃO PUBLICADO):** atualizado `next` e `eslint-config-next` de 16.3.7 para **16.4.4**, com `pnpm-lock.yaml` gerado pelo próprio pnpm num runner isolado. Lint, typecheck, 9 testes, build e `pnpm audit --prod --audit-level=high` passaram no CI. **Ainda faltam QA em preview e deploy controlado.** A release de segurança de novembro foi anunciada para 04/11/2026; atualizar novamente quando sair.
- [ ] **02 · Publicação/branch:** escolher a branch de produção após a reconstrução, bloquear deploy de código não revisado e aplicar proteção de branch/revisão. A alteração de branch, merge e produção exige decisão explícita.
- [x] **03 · CI ativo (IMPLEMENTADO NO PR):** adicionar workflow próprio da nova aplicação, sem secrets, para lint, typecheck, testes e build em PRs. **Workflow executado com sucesso no commit `8217d29` em 03/11/2026.**
- [ ] **04 · Antirrobô — CÓDIGO NO PR / NÃO ATIVADO:** Turnstile com validação server-side antes de criar sessão, verificação de ação/hostname e falha fechada, mais widget na última etapa. **Faltam credenciais Cloudflare na Vercel, deploy controlado e teste real**; sem chaves, o intake fica indisponível.
- [ ] **05 · Abuso em camadas:** manter rate limit transacional e adicionar limites de concorrência, por sessão/identificador de pedido e na borda, com métricas e política de bloqueio; preservar usuários legítimos em NAT compartilhado.
- [ ] **06 · Capacidade e custo — MIGRATION PREPARADA / NÃO APLICADA:** guarda transacional limita a 2 reservas ainda não validadas por proprietário de sessão, preservando a quota global já existente. **Faltam aplicar SQL na instância CM, verificação live, métricas e mitigação por IP/borda**. A reserva de 27h continua necessária.
- [ ] **07 · Quarentena — SCHEMA/WORKER PREPARADOS / NÃO ATIVADOS:** tabela de vereditos inicia tudo como pendente, view de liberação exige scan clean, worker isolado ClamAV com tamanho, tempo e SHA-256, rejeição de infectados e erro fechado. **Faltam migration no CM, host isolado, assinatura atualizada, agendamento, QA e gate de qualquer futuro download administrativo.** A inspeção não é sandbox completa.

### P1 — Proteção funcional, dados e operação

- [x] **08 · Política por papel de arquivo (IMPLEMENTADO NO PR):** validar no servidor a extensão permitida de `model` (STL/3MF) ou campos de imagem/referência (PNG/JPG/JPEG/WebP/PDF) **antes** da assinatura. Validar conteúdo real continua obrigatório; testes de rejeição e autorização permitida passaram no CI (não substituem E2E real).
- [ ] **09 · Processadores/visualizadores seguros:** limites de arquivo, memória, CPU e decompression ratio; sanitização/reencodificação de imagens e PDFs quando aplicável; parsing de STL/3MF em ambiente isolado; nunca executar instruções enviadas por clientes.
- [ ] **09b · Revisão do rastreamento de arquivos na build:** investigar aviso de Turbopack em `src/features/radio/local-visualizer-analysis.ts`, causado por `existsSync` com caminho variável. Inspecionar o bundle Vercel e manter conteúdo e ferramentas de desenvolvimento fora da função de produção. O aviso **não prova** que arquivos internos estejam publicamente acessíveis.
- [ ] **10 · Download/admin:** autenticação, autorização por pedido, acesso temporário, `Content-Disposition` e `nosniff`, auditoria de acesso e proibição de expor credenciais privilegiadas no navegador.
- [ ] **11 · Firewall/WAF:** verificar regras da Vercel e criar proteções por rota, taxa e sinais de abuso; lembrar que upload TUS é direto ao Supabase e escapa do WAF da Vercel após a emissão da assinatura.
- [x] **12 · Headers básicos (IMPLEMENTADO NO PR):** `frame-ancestors`, `object-src`, `base-uri`, XFO, nosniff, HSTS sem `includeSubDomains`, Referrer/Permissions-Policy. **Falta QA HTTP/browser.** CSP completa (`script-src`, `connect-src`, `media-src`) deve ser implementada depois com teste da rádio e do upload TUS.
- [ ] **13 · Auditoria Supabase CM:** conferir instância correta, RLS, grants, RPCs, bucket privado, assinaturas, Data API, CORS, tokens e isolamento entre duas sessões. Proibir writes e mudanças no Artesopolis Admin.
- [ ] **14 · Outbox para notificações:** transação que registra intenção de envio, worker com idempotência, retentativas e alarme; evitar duplicidade decorrente de concorrência e falha depois do envio externo.
- [ ] **15 · Minimização do e-mail:** evitar replicar toda a descrição e contato em mensagens persistentes; preferir aviso com ID opaco e acesso administrativo protegido.
- [ ] **16 · Retenção/limpeza:** confirmar Cron autenticado, janela de grant TUS, exclusão física pela Storage API, falhas parciais, limites de lote, logs sem PII e alertas. Validar prazos e necessidade dos dados.
- [ ] **17 · Monitoramento:** contagem de 403/413/429, explosão de sessões, falhas TUS, storage reservado, erros no e-mail/Cron, consumo financeiro; não registrar segredos/PII.
- [ ] **18 · Aviso LGPD:** informar finalidade, dados coletados, fornecedores, base legal, prazos, canais para exercício de direitos e política de retenção; não presumir consentimento obrigatório em toda hipótese.

### P2 — Higiene técnica e resposta

- [ ] **19 · Testes adversariais:** cruzamento de sessões, payloads inválidos, arquivo adulterado, concorrência, expiração, replay, requisições sem Origin e limites de corpo.
- [ ] **20 · E2E real:** testar com arquivos sintéticos e ambiente CM autorizado, inclusive TUS em múltiplos blocos, falhas parciais, isolamento e limpeza completa.
- [ ] **21 · Dependências contínuas:** auditoria no CI após sanear as CVEs conhecidas, atualizações automatizadas direcionadas à branch ativa e revisão de advisories.
- [ ] **22 · Gestão de segredos:** scanning na história e novos commits, credenciais com menor privilégio, rotação, ausência de chaves em logs/clientes.
- [ ] **23 · Contas e acessos:** MFA, revisão de integrantes e tokens GitHub/Vercel/Supabase/R2/e-mail; revisão periódica.
- [ ] **24 · Backup e restauração:** estratégia de backup do banco, recuperação testada e escopo de dados anexados.
- [ ] **25 · Custos:** budget/alertas e controles de consumo para Supabase, Vercel e provedores externos.
- [ ] **26 · Resposta a incidentes:** runbook curto para suspender intake, revogar credenciais, preservar evidência, notificar e recuperar.
- [ ] **27 · Revisão periódica:** checagem em cada release significativa, revisão trimestral de acessos e configuração, alertas automatizados.
- [ ] **28 · Aceite de segurança:** revisão independente e testes controlados com evidência, seguida de validação do responsável antes de abrir upload irrestrito.

## 3. Ordem de implementação e aceite

| Bloco | Entrega revisável | Requisitos de aceite |
| --- | --- | --- |
| A — Fundamentos | Atualização de dependências, CI, branch de deploy, headers, validação por papel | CI verde; versão corrigida; deploy controlado; sem regressão no formulário/rádio. |
| B — Antiautomação e armazenamento | Challenge validado no servidor, limites de taxa/concorrência, capacidade, isolamento | Abuso sintético limitado sem bloquear usuários legítimos; Storage não satura facilmente. |
| C — Arquivos não confiáveis | Quarentena, AV, sanitização/sandbox e download autenticado | Arquivos suspeitos rejeitados, isolados e não acessíveis operacionalmente. |
| D — Dados, comunicações e privacidade | Auditoria de grants, outbox, retenção, LGPD e backups | Sem acesso cruzado, sem perda/duplicação silenciosa, dados expirados efetivamente eliminados. |
| E — Operação e aceite | Alertas, testes E2E e revisão de segurança | Evidência de testes reais, runbook funcional, aprovação humana para publicar. |

## 4. Limites da auditoria

**[VERIFICADO]** Código e histórico do repositório acessíveis; projeto Vercel e deploys consultados em modo leitura.  
**[VERIFICADO]** A nova aplicação e a `main` ainda são árvores diferentes; o PR não modifica a produção por si só.  
**[NÃO VERIFICADO]** Ambiente Supabase CM e estado real de RLS/Cron/Storage (organização independente indisponível à conexão usada).  
**[NÃO EXECUTADO]** Pentest, upload malicioso, alteração de produção, rotação de credenciais, migration ou teste de recuperação.  
**[NO PR]** Dependências 16.4.4 e lockfile gerado pelo pnpm, CI ativo, política por papel e headers. **CI verde** no commit `8217d29`: 9 testes, lint, typecheck, build e audit de produção com limiar alto. **Faltam revisão humana, QA renderizado e teste integrado de Supabase/Vercel.**

## 5. Evidências da primeira execução

- **Pull request:** https://github.com/cassianomangini/radioand3d/pull/37 (rascunho, base `cmc/renew`).
- **CI verificado no commit `8217d29869c3aeaf4e0f7ca123d55e032d9595ae`:** https://github.com/cassianomangini/radioand3d/actions/runs/41709256714. `pnpm install --frozen-lockfile`, ESLint, `next typegen`, `tsc --noEmit`, **9/9 testes**, `next build` e `pnpm audit --prod --audit-level=high` passaram. O auditor não reportou vulnerabilidades conhecidas no limiar configurado.
- **Aviso da build:** o acesso dinâmico de `local-visualizer-analysis.ts` provoca rastreamento amplo de arquivos pelo Turbopack. Exige análise do artefato; não está classificado como vazamento confirmado.
- **Sem validação live:** não foram realizados upload TUS externo, teste de ataque, varredura antimalware, leitura da instância Supabase CM ou deploy. O código em PR não protege a produção até ser aprovado, integrado e publicado.

## 6. Incremento de segurança (03/11/2026)

O PR #37 recebeu implementação adicional, sem ativação remota:

- **Cloudflare Turnstile:** `src/server/quote/turnstile.ts`, novo componente de verificação final, teste de token e fail-closed quando faltam credenciais. A API só registra draft após Siteverify; chaves privadas nunca vão ao navegador.
- **Rate limit IP:** a identidade no Vercel passa a depender de `x-vercel-forwarded-for`, sem fallback em `x-forwarded-for` potencialmente sobrescrito por proxies.
- **Proteção de quota:** `supabase/migrations/20261103202500_quote_owner_quota_and_quarantine.sql` adiciona limite transacional de 2 autorizações pendentes por sessão e filas de scan. **Arquivo de migração não é estado de banco aplicado.**
- **Quarentena:** `quote_attachment_scans` e `quote_clean_attachments` separam validação estrutural de liberação após antimalware. Estado inicial `pending` também para dados anteriores. O fluxo recebe o orçamento mesmo enquanto o anexo permanece isolado; nenhuma rota administrativa de download foi criada.
- **Worker:** `scripts/quote-malware-scan-worker.mjs` prepara o uso de ClamAV fora da Vercel, com lease, leitura de Storage privado, limites, subprocesso sem segredos em ambiente, SHA-256 e veredito. **Ainda não está hospedado nem agendado.**
- **Testes adicionais:** casos de verificação de desafio, código de saída do scanner, isolamento de segredos e script SQL de quota/scan executado contra um PostgreSQL descartável no CI. Verificar o estado do último workflow antes de declarar o bloco tecnicamente aprovado.

**Rollout obrigatório:** `docs/SEGURANCA_ATIVACAO_ANTIBOT_QUARENTENA.md`. Não modificar o Artesopolis Admin; a conexão Supabase disponível anteriormente não era a do CM e não pode ser usada para aplicar esta migração.

### Referências primárias

- GitHub Advisory GHSA-673q-mjm6-r5xr: https://github.com/vercel/next.js/security/advisories/GHSA-673q-mjm6-r5xr
- GitHub Advisory GHSA-p3m5-59mp-jv5r: https://github.com/vercel/next.js/security/advisories/GHSA-p3m5-59mp-jv5r
- Releases estáveis do Next.js: https://github.com/vercel/next.js/releases
- OWASP File Upload Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html
- Supabase Resumable Uploads: https://supabase.com/docs/guides/storage/uploads/resumable-uploads
- Vercel Firewall: https://vercel.com/docs/vercel-firewall
- ANPD — segurança da informação para agentes de pequeno porte: https://www.gov.br/anpd/pt-br

> Critério de honestidade: `IMPLEMENTADO NO PR` não significa `TESTADO EM PRODUÇÃO` nem `PR APROVADO`. Nenhuma alteração neste documento autoriza deploy, migração ou desabilitação de serviços.
