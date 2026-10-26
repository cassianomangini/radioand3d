# CM 3D & Rádio

Fundação do projeto novo. O contrato de execução é o [plano mestre](docs/PLANO_MESTRE.md). O código antigo fica em `../OLD` e não é copiado por pasta.

## Ambiente

- Node.js 22
- pnpm 10
- Next.js 16.3.7
- React 19.2.4

```bash
pnpm install
pnpm dev
```

Verificações desta etapa:

```bash
pnpm lint
pnpm typecheck
pnpm build
```

## PR-00

CSS Modules, `src/styles/tokens.css` e duas fontes: Outfit nos títulos, Manrope no texto. Sem Tailwind, sem biblioteca de ícones e sem suíte de testes.

A rota `/` é a página técnica da fundação. Ela fica `noindex`. A Home, o shell e o motor da Rádio são as próximas entregas do plano.

O repositório remoto proposto é `cassianomangini/cm-3d-radio-v2`. Preview e domínio de produção não fazem parte desta etapa local.
