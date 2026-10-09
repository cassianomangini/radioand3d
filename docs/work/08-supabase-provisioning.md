# E2 — Provisionamento seguro do Supabase CM

Estado: **in_progress** (contratos revisados; **projeto remoto CM não provisionado**)  
Atualização: **09/10/2026**  
Owner: **CM Infra / CM Data**  
Contrato: [Supabase Infrastructure V1](../SUPABASE_INFRASTRUCTURE_V1.md)  
Contexto: [Estúdio público](08-studio-growth.md) e [Roadmap](../ROADMAP.md)

## Decisão vigente

Criar **um projeto Supabase novo e limpo** para os dados próprios do CM 3D & Radio, em `sa-east-1`, em vez de apagar e reaproveitar o banco de testes de outro sistema.

- Preferir uma **organização CM separada** para isolar faturamento e administração. A cota Free de dois projetos ativos considera os projetos do proprietário/administrador entre organizações; criar uma nova organização **não cria outra vaga grátis**.
- Antes de criar o projeto, inventariar e preservar o ambiente legado em documentação e acesso **privados**. Pausá-lo **somente depois** de comprovar que não existem consumidores necessários, registrar backup externo e validar a capacidade de recuperação.
- Projeto pausado não conta para a cota de dois projetos Free ativos; a documentação atual do Supabase prevê até **um ano** para restaurar pelo Dashboard. **Não** usar a pausa como único backup nem como justificativa para desligar dependências não investigadas.
- O Supabase operacional do Artesopolis Admin **não** é alvo de qualquer migração ou limpeza deste trabalho.
- Nenhuma alteração de plano, custo, exclusão, pausa, mudança de organização ou deploy remoto é implícita nesta documentação.

A V1 do projeto CM contém apenas dados de **Orçamento**. Produtos/Shopee permanecem sob o sistema operacional de origem, por uma ponte read-only server-to-server independente. A Rádio e seus sidecars continuam no R2.

## Como registrar evidência

Uma caixa `[x]` significa que o artefato e a prova foram verificados, não apenas planejados. Registrar no checkpoint correspondente a evidência de link/commit, teste ou observação remota; não publicar identificadores, credenciais, inventários internos ou logs de outros sistemas neste repositório público.

## P0 — Contratos e documentação pública

- [x] Definir a alternativa **novo projeto limpo**, sem declarar provisionamento inexistente.
- [x] Sanitizar do estado público os identificadores e o inventário operacional do ambiente legado.
- [x] Alinhar contrato de Orçamento anônimo com posse de sessão e quotas.
- [x] Especificar Vercel Cron com GET, `CRON_SECRET`, reconciliação e retenção.
- [x] Conciliar roadmap, arquitetura e checklist.
- [ ] Eventual auditoria do **histórico público do Git** concluída por procedimento separado, sem force push automático.

Gate: contratos sincronizados com o estado real de implementação; detalhes de desativação legada mantidos fora da documentação pública.

## P1 — Pré-requisitos para liberar vaga Free

- [ ] Inventariar, em área **privada**, consumidores, scripts, credenciais, endpoints, usuários e agendamentos do ambiente antigo.
- [ ] Confirmar que sua pausa não interrompe rotinas, testes necessários ou algum consumidor ainda utilizado.
- [ ] Exportar backup completo de banco e objetos necessários, com local de guarda privado, e comprovar possibilidade de recuperação.
- [ ] Conferir a cota real do proprietário/organização e a opção de pausar disponível no Dashboard.
- [ ] Pausar o ambiente legado **somente após** o gate anterior, verificar seu estado e verificar que a aplicação operacional continua funcionando.

Gate: vaga livre e backup recuperável; **não deletar** o projeto legado. Sem prova, P1 continua bloqueado.

## P2 — Criar o projeto CM limpo

- [ ] Preparar a organização CM separada, quando permitido pela cota e sem gerar contratação automática.
- [ ] Criar um projeto novo em `sa-east-1`; manter o identificador real apenas no inventário de infraestrutura privado.
- [ ] Habilitar MFA e restrições de acesso adequadas.
- [ ] Configurar desenvolvimento local (Supabase CLI, `config.toml`, migrations e seed sintético) no repo `radioand3d`.
- [ ] Conferir vínculo CLI/projeto e fazer **dry-run** antes de aplicar qualquer migration remota.
- [ ] Verificar as configurações de Data API, logs, plano/quotas e backups do projeto novo.

Gate: projeto independente, vazio de legado operacional, com acesso e alvo comprovados.

## P3 — Orçamento privado com posse de sessão

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

- **Documentação:** alternativa de projeto novo, cron, sessão anônima, arquitetura e roadmap reconciliados na `main`.
- **Supabase CM remoto:** **não criado**; migrations, bucket, segredos, rotas e cron **não aplicados**.
- **Ambiente legado:** não pausado, não apagado e não reconfigurado por esta entrega.
- **Vercel:** nenhum cron habilitado nem mudança de deploy aplicada nesta entrega.
- **Próxima execução:** inventário e backup do legado por meios privados; implementação local pode avançar sem aguardar o projeto remoto.
