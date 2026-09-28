# Entrega 02: fundação executável

## Identificação

ID do roadmap: 02. Responsável principal: CM Infra, com CM Frontend na base de estilos. Branch: `feat/bootstrap-foundation`. Base: `bf7886ee427d4a43eef51dc8ba6b965fc2f1c4ff`.

Contratos lidos: [arquitetura](../ARCHITECTURE.md), [experiência](../EXPERIENCE.md), [plano](../PROJECT_PLAN.md) e [roadmap](../ROADMAP.md).

## Resultado e limites

Criar uma aplicação Next.js mínima, reproduzível e verificável, sem antecipar o design final nem conectar dados, áudio, storage, autenticação ou produção.

Incluído:

- Next.js App Router + React + TypeScript estrito;
- Tailwind CSS 4;
- tokens semânticos provisórios para validar a arquitetura de estilos;
- uma primitiva Button real para provar consumo de tokens;
- rota `/dev/foundation` indisponível em produção;
- lint, typecheck, build e CI;
- lockfile e comandos reais no README.

Fora de escopo: identidade final, Motion, 3D, player, biblioteca musical, banco, autenticação, R2, Vercel e qualquer ativo privado.

## Checklist de execução

- [x] Branch criada a partir da `main`.
- [x] Stack local registrada e sem dependências de domínio prematuras.
- [x] App Router e configuração TypeScript/Tailwind preparados.
- [x] Tokens semânticos separados de componentes.
- [x] Uma primitiva real consome tokens sem valores visuais locais.
- [x] Vitrine de desenvolvimento protegida de produção.
- [x] Workflow de CI preparado para lint, typecheck e build.
- [x] Instalação e build confirmados pelo GitHub Actions.
- [x] CI do PR #1 verde: install, lint, typecheck e build.
- [x] Diff revisado nesta etapa; o roadmap permanece `in_progress` até o PR ser aceito/mergeado.

## Evidência

| Critério | Evidência | Estado |
| --- | --- | --- |
| Estrutura | arquivos de configuração + `src/app` | preparado |
| Tokens | `src/styles/tokens.css` | preparado |
| Primitiva | `src/components/ui/button.tsx` + CSS Module | preparado |
| Vitrine | `/dev/foundation` com `notFound()` em produção | preparado |
| Qualidade | GitHub Actions run 36424337283 | success |
| Build local | ambiente atual sem acesso ao registry npm | não executado; substituído por CI reproduzível |

## Retomada

Próxima ação: revisão/merge do PR #1. O CI está verde; corrigir apenas achados técnicos desta fundação. A direção visual final continua bloqueada pela aprovação da entrega 03 e não deve ser inventada neste PR.
