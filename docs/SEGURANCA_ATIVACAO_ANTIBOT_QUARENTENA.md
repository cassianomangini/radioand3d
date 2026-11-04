# Implantação segura: bot, reserva de arquivos e antimalware

**Status em 03/11/2026:** código proposto no PR #37. **NÃO HABILITADO EM PRODUÇÃO.**
A aplicação está em `cm-3d-radio-novo/`, com PR direcionado a `cmc/renew`.
As instruções abaixo são um plano operacional de ativação, não um registro de ações já executadas.

## 1. Ordem obrigatória

1. Validar e aprovar o PR e o CI, incluindo teste de migração em banco PostgreSQL descartável.
2. Confirmar que o destino é a **instância Supabase do CM 3D & Rádio**, distinta da Artesopolis; efetuar backup e verificar grants/bucket/migrations existentes.
3. Aplicar com revisão humana a migration `supabase/migrations/20261103202500_quote_owner_quota_and_quarantine.sql` **somente no Supabase CM**. Ela não é aplicada pelo CI ou pelo PR.
4. Provisionar o scanner isolado com ClamAV e atualizar as assinaturas via `freshclam`. O worker e o arquivo de upload não devem ser servidos por uma URL pública.
5. Configurar Turnstile em cada ambiente e informar as credenciais na Vercel via Secrets/Environment Variables, sem incluí-las no código nem em logs.
6. Publicar **em deploy controlado**, testar o formulário, o envio TUS, a consulta de status do scan e a retenção. Só então manter `CM_QUOTE_INTAKE_ENABLED=true`.

**Se o site for publicado sem as variáveis Turnstile, o formulário fica indisponível e a API não cria drafts.** Essa falha fechada é proposital; não usar modo de bypass para restaurar o serviço.

## 2. Turnstile: Cloudflare

Criar widget com `action=quote_intake` e restrição aos hostnames reais (domínio de produção e preview se necessário). Variáveis **no servidor Vercel**:

- `CM_QUOTE_TURNSTILE_SITE_KEY`: chave **pública** do widget, passada para a página pelo servidor.
- `CM_QUOTE_TURNSTILE_SECRET_KEY`: chave **privada**, usada apenas no Siteverify server-side.

O servidor exige token não vazio, chama `https://challenges.cloudflare.com/turnstile/v0/siteverify`, valida `success=true`, `action=quote_intake` e `hostname` do pedido e só então grava um draft. Cada token é de uso único e expira em cinco minutos. Falha na comunicação rejeita a criação. Chaves de teste não podem estar em produção.

Não publicar a chave privada nem o hash de sessão no navegador. Monitorar falhas de validação sem registrar tokens ou IPs em claro. O widget aparece apenas na etapa final para não atrapalhar a montagem do orçamento.

Referências: https://developers.cloudflare.com/turnstile/get-started/ e https://developers.cloudflare.com/turnstile/get-started/server-side-validation/

## 3. Capacidade e concorrência

A capacidade já vinha com: **50 MB por arquivo**, **5 anexos** e **100 MB por pedido**, reserva pessimista de 50 MB por assinatura TUS e **600 MB** globais. Tokens/reservas podem persistir até **27h** para cobrir o tempo do upload retomável.

A nova migration limita a **2 uploads ainda não verificados por proprietário de cookie**, contando todos os drafts daquele proprietário e de forma transacional (bloqueio da linha global de quota). Uma pessoa pode enviar até 5 arquivos, desde que o envio/validação de cada um avance antes de abrir mais reservas. O limite não dispensa proteção por IP/borda: um agente distribuído pode criar várias identidades.

**Recomendado, ainda não configurado:** na Vercel Firewall, começar com regras por rota em modo log, analisar falsos positivos em IPs compartilhados e só depois habilitar mitigação. Evitar limites globais agressivos que interrompam clientes legítimos. O TUS segue direto ao Supabase Storage e não passa pela WAF da Vercel.

Nunca liberar a reserva quando um token ou uma URL TUS ainda puder escrever ou quando o objeto existir; seguir a política SQL de liberação segura já versionada.

## 4. Quarentena privada e ClamAV

A migration cria `quote_attachment_scans` com estado inicial **pending** para todos os arquivos, inclusive os anteriores à migração. A validação de assinatura/formato `validated` **não** é uma prova antimalware.

O único caminho SQL proposto para elegibilidade de download administrativo é a view
`public.quote_clean_attachments`, que devolve apenas objetos estruturalmente válidos e marcados como **clean** pelo scanner. Mesmo assim, **a aplicação administrativa deverá autenticar e autorizar cada pedido antes de gerar links ou baixar arquivos**. Não existe rota de download administrativo neste PR.

O worker `scripts/quote-malware-scan-worker.mjs` deve rodar **fora da Vercel**, em ambiente isolado, com Node.js 22+ e `clamscan` instalado, banco de assinaturas atualizado por `freshclam`, limites de CPU/memória e volume temporário privado. Ele:

1. Busca **um único** objeto em estado pendente mediante RPC com lease de 15 minutos.
2. Faz download **privado**, com tamanho e caminho verificados, diretamente para um diretório temporário com permissão restrita.
3. Executa ClamAV sem shell, com limite de execução, anti-bomba de archive e SHA-256.
4. Grava o veredito por RPC com lease: `clean`, `infected` ou `error` (falha fechada). Arquivo contaminado vira **rejected**; erro não é confundido com sucesso.
5. Remove o arquivo temporário. Não envia amostras para VirusTotal ou outro serviço externo.

Para executar manualmente **somente no host isolado, com credenciais já configuradas por mecanismo seguro**:

```bash
CM_QUOTE_SCAN_WORKER_ENABLED=true node scripts/quote-malware-scan-worker.mjs
```

Agendar execuções recorrentes no host escolhido e monitorar status `pending`/`error`, quantidade de tentativas, versão/idade das assinaturas, falhas de download e o tempo de retenção. Sem worker ativo, **nenhum anexo será marcado como clean**. A aplicação ainda pode registrar o orçamento, mas o arquivo deve permanecer indisponível à operação humana.

Referências: https://docs.clamav.net/ e https://github.com/Cisco-Talos/clamav/blob/main/docs/man/clamscan.1.in

## 5. Aceite e alertas

Antes de publicar, demonstrar com arquivos **sintéticos**:

- Formulário sem arquivo: challenge válido, inválido, expirado, repetido e indisponível.
- Até cinco anexos, fluxo sequencial, upload retomável, expiração de grant e tentativa de reserva concorrente acima de duas.
- Arquivo aguardando scan: não pode aparecer na view de liberação.
- Arquivo reconhecido pelo teste antivírus padronizado **EICAR** apenas em staging: deve ser classificado como infectado e nunca liberado.
- Erro ou travamento do scanner: permanece bloqueado, retenta de acordo com a política de lease, sem produzir veredito clean.
- URLs/identificadores de outro usuário não permitem acesso, submissão nem download.
- Retenção: objetos e dados são removidos após o prazo aplicável, sem liberar quotas antes da exclusão efetiva.
- Normalidade: envio de PDF, imagem, STL e 3MF legítimos, desktop e celular, sem regressão na Rádio.

**Risco residual:** ClamAV não é sandbox completa e pode não identificar novos exploits em PDF/3MF/CAD. Visualização/conversão futura exige parser atualizado, timeouts e isolamento adicional. A view de segurança é uma allowlist de backend, não uma autorização de usuário.

## 6. Estado da entrega

| Controle | Código no PR | Executado em produção |
| --- | --- | --- |
| Turnstile backend + widget | Sim | Não. Faltam sitekey/secret e teste real. |
| Quota de reservas pendentes por proprietário | Migration preparada | Não. Falta aplicar no **Supabase CM**. |
| Quarentena pendente e view de liberação limpa | Migration preparada | Não. Falta aplicar e validar. |
| Worker ClamAV isolado | Script preparado | Não. Falta host/assinaturas/agendamento. |
| Rate limit por IP e quotas preexistentes | Sim, com melhoria do header confiável | Conferir no deployment existente. |
| WAF por rota / alerta de abuso | Instruções apenas | Não configurado por este PR. |
