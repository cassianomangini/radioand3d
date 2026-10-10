# E2 — Prova de Storage isolada (runbook)

Estado: **ready_for_manual_smoke** (script e mocks no Git; **sem prova de chamada real ao Storage**).  
Parent: [Checklist E2](08-supabase-provisioning.md) · [Infraestrutura](../SUPABASE_INFRASTRUCTURE_V1.md)

## Objetivo e fronteiras

Validar, no **Supabase CM isolado**, os contratos HTTP reais de upload assinado TUS, offset/retomada, leitura parcial autenticada, bloqueio de leitura anônima e remoção física. Usar exclusivamente dados **sintéticos e gerados em memória**, sem foto, peça do cliente, contato ou SKU. A prova cria um **bucket privado temporário aleatório**, separado do `quote-intake`, e tenta eliminá-lo no `finally`.

Esta prova **não envia nem submete um orçamento**, não valida a autorização entre duas sessões de visitante, não exercita a retenção agendada e não substitui o E2E final com as quatro rotas Next e os procedimentos de privacidade.

## Preparação (somente pelo operador autorizado)

1. Conferir no Supabase que o projeto selecionado é o **CM 3D & Radio**, em `sa-east-1`, e não o banco do Artesopolis Admin. Confirmar bucket `quote-intake` privado e estado saudável.
2. No repositório GitHub, configurar o **Environment `cm-storage-qa`** com *required reviewer* e estes três **environment secrets**, nunca em `.env.example`, commit, chat, issue ou log:
   - `CM_SUPABASE_URL`: URL HTTPS do projeto CM.
   - `CM_SUPABASE_SECRET_KEY`: chave moderna `sb_secret_` desse **mesmo** projeto.
   - `CM_STORAGE_SMOKE_PROJECT_REF`: referência de 20 caracteres do projeto CM, usada para rejeitar qualquer URL de outro projeto.
3. Abrir [Actions → isolated-quote-storage-smoke](https://github.com/cassianomangini/radioand3d/actions/workflows/quote-storage-smoke.yml) e selecionar **Run workflow** na `main`, com confirmação explícita `RUN_ISOLATED_SUPABASE_STORAGE_SMOKE`.
4. Executar primeiro `mode=small` (STL de 134 bytes). Depois, **se a limpeza passar**, executar `mode=resume` (STL sintético de 6 MiB + 128 bytes: PATCH inicial de 6 MiB, HEAD e segundo PATCH).
5. Após cada execução, conferir `PASS`, remoção bem-sucedida e inexistência de bucket de teste residual. Resultado redigido no log contém somente indicadores técnicos e tamanho, **sem chave, token, URL assinada ou nome de contato**.

Também é possível executar `pnpm quote:storage:smoke` localmente com as mesmas variáveis server-only e com `CM_STORAGE_SMOKE_CONFIRM=RUN_ISOLATED_SUPABASE_STORAGE_SMOKE`; nunca compartilhar a saída de `.env.local`. Um comando sem a confirmação falha antes de abrir conexões.

## Critérios de aceite (um resultado real por modo)

- [ ] Assinatura de upload foi obtida para um caminho aleatório e **não reutilizável**; nenhum segredo de serviço chegou ao payload TUS.
- [ ] TUS cria upload (201), HEAD indica offset correto, PATCH progride (204). Em `resume`, HEAD confirma 6 MiB antes do segundo PATCH.
- [ ] Storage `info.size` corresponde exatamente ao tamanho físico do STL.
- [ ] GET com `Range` retorna 206, `Content-Range` consistente e bytes idênticos no início e no final do arquivo.
- [ ] GET sem autenticação para bucket privado não retorna 2xx.
- [ ] Storage remove arquivo e bucket aleatório; inspeção posterior mostra **zero** buckets `cm-storage-qa-*` órfãos.
- [ ] Evidência da execução real (link para Action, sem segredo) registrada no [E2](08-supabase-provisioning.md).

## Falhas e reconciliação

Se retornar `storage_smoke_cleanup_required_cm-storage-qa-...`, o bucket aleatório da execução não foi comprovadamente removido. **Não** mexer em `quote-intake`, não assumir que o Storage foi limpo, e não liberar o site. Inspecionar somente o bucket temporário mencionado e fazer a remoção pela interface/API Storage autorizada; documentar o resultado. Falhas anteriores à criação do bucket não deixam dados de teste.

Se houver 401/403 na assinatura ou endpoints TUS, conferir primeiro **URL/ref/chave do projeto CM**, configuração do API gateway e comportamento do `apikey` moderno. Se `Range` não retornar 206, corrigir o contrato do gateway (não promover `complete` como validado). Repetir o modo pequeno antes da prova de retomada.

## Estado de promoção

Só depois dos dois testes reais aprovados: preparar **Preview** controlado e executar quatro rotas reais (`session`, `attachments/init`, `attachments/complete`, `submit`) com duas sessões, arquivo 3MF da Bambu autorizado, negações cruzadas, idempotência e limpeza. O Cron Vercel, o intake público e o deploy de produção continuam **OFF** até esses gates adicionais e validação de backup/retention/custos.
