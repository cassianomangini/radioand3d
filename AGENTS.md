# CM 3D & Rádio

O contrato vigente é [docs/PLANO_MESTRE.md](docs/PLANO_MESTRE.md). `../projeto.md` não manda nesta construção.

- Executar a entrega atual do plano. Agora é o PR-00. Não abrir Home, shell completo, páginas comerciais nem motor da Rádio antes da etapa correspondente.
- Não copiar `src/` de `../OLD`. O código antigo serve para recuperar lógica e dados, na etapa indicada.
- Fontes: Outfit e Manrope. Tokens: somente os do plano. Sem Tailwind e sem terceira fonte.
- Preview permanece `noindex`. Sem deploy de produção e sem trocar o domínio.

## Guia obrigatório: Supabase deste projeto

- O Supabase do **CM 3D & Rádio** tem project ref `rhuypfcvkhfwvaxuorfr`. Antes de qualquer consulta remota, conferir que `supabase/.temp/project-ref` contém esse ref e que o host de `CM_SUPABASE_URL` em `.env.local` é `rhuypfcvkhfwvaxuorfr.supabase.co`. Mostrar apenas o ref; nunca imprimir a URL com credenciais nem chaves.
- **É proibido usar o conector/MCP Supabase neste repositório**, inclusive para listar projetos, consultar SQL, verificar migrations ou aplicar alterações. A conexão Supabase disponível pertence ao Artesopolis, não ao CM. A ausência do CM nessa conexão não informa nada sobre o estado do CM.
- Para verificar o CM, usar somente o **Supabase CLI vinculado ao ref conferido**. Descobrir os comandos com `supabase --help` e `supabase migration --help` antes de usar; para migrations, comparar a lista local/remota pelo CLI. Se o CLI estiver bloqueado por sandbox, telemetria ou autenticação, registrar **não verificado** e parar a consulta. Nunca trocar para o conector Supabase como fallback.
- O proprietário aplica migrations e faz push/deploy neste fluxo; não executar writes remotos sem instrução explícita. Relato do proprietário de que uma migration foi aplicada deve ser registrado como **informado por ele** até haver leitura pelo CLI do CM. Não pedir para reaplicar uma migration já informada como aplicada.
- O conector da **Vercel está permitido para leitura**. Ao conferir publicação, comparar o SHA do deploy `READY` com o commit desejado; `READY` de um commit anterior não prova que o código atual foi publicado.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
