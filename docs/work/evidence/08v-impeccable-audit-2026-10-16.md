# 08V — Auditoria técnica Impeccable do site público (16/10/2026)

**Natureza:** autorrevisão técnica, somente leitura, seguindo `.agents/skills/impeccable/reference/audit.md`. O comando `impeccable detect` foi executado; a skill não gera automaticamente este relatório. Nenhuma correção, aprovação visual, publicação ou alteração remota foi realizada.

**Base local:** `main@4ddd121f018357a97c7dcb8ec340a599b3807302`, quatro commits atrás de `origin/main`, com alterações locais preexistentes. Este relatório descreve o estado local observado, não uma versão publicada.

## Escopo e método

- Oito URLs representativas das superfícies públicas: `/`, `/studio`, impressão sob demanda, placas personalizadas, caixas personalizadas, orçamento, lista de produtos e um produto individual (`porta-curativos-compacto`). A rota `/studio/impressoes` redireciona para `/studio#impressoes`, conforme a implementação atual.
- 16 varreduras com Axe no Google Chrome: 1440 × 900 desktop e 390 × 844 mobile. Para `/studio`, também foram conferidos 360 × 800, texto a 200%, toque sintetizado e interação por teclado.
- Inspeção estática de componentes, CSS, tokens, assets e detector Impeccable. Verificações: `pnpm typecheck`, `pnpm lint` e `pnpm exec eslint src`.
- A primeira tentativa com `127.0.0.1:3001` foi **descartada**: nessa origem, a hidratação não se completou e os cartões ficaram no estado inicial invisível. A varredura válida usou `localhost:3001`, onde a hidratação foi confirmada.

O teste de toque foi sintetizado pelo Chrome, não realizado em aparelho físico. O servidor era `next dev`; os números de carregamento e fluidez não representam uma build de produção. Estados como Rádio fullscreen, todos os passos do orçamento e todos os produtos não receberam varredura Axe própria nesta rodada.

## Veredito de integridade

**Passa quanto à identidade do produto, com ressalva no gate técnico.** A composição Estúdio + Rádio, os estados do player, a mídia real e os acentos comerciais formam um sistema específico da CM. O detector encontrou cinco avisos: quatro de texto em gradiente e um de borda lateral. O gradiente faz parte da linguagem documentada; a borda indica a faixa ativa. Esses avisos não foram promovidos a defeitos sem evidência visual ou funcional. O gate `pnpm lint`, porém, falha no estado local pelos scripts distribuídos com a skill.

## Pontuação de saúde

| Dimensão | Nota (0–4) | Evidência principal |
| --- | ---: | --- |
| Acessibilidade | 2 | Controles abaixo da meta de 44 × 44 px; hub sem `h1` acessível; semântica inicial do divisor incompleta |
| Desempenho | 3 | Dicas `will-change` permanentes em elementos grandes; desempenho de produção ainda não medido |
| Temas e tokens | 3 | Tokens globais e identidade escura coerentes; cores locais intencionais coexistem com tokens |
| Responsividade | 3 | Sem overflow estável nos perfis testados; áreas acionáveis pequenas no mobile |
| Integridade da implementação | 3 | Detector sem desvio de identidade confirmado; lint global bloqueado por scripts da skill |
| **Total** | **14/20 — bom** | **0 P0, 2 P1, 3 P2, 0 P3** |

As notas representam esta amostra de rotas e estados. A ausência de alerta Axe não certifica conformidade completa com WCAG.

## Achados por prioridade

### P1 — Controles frequentes menores que a meta de toque

**Categoria:** acessibilidade e responsividade. **Locais:** [mini player da Rádio](../../../src/components/studio-radio/studio-radio-shell.module.css#L885) e [controles do carrossel](../../../src/components/studio-radio/studio-prints-carousel.module.css#L259).

No Chrome mobile, controles da Rádio mediram aproximadamente 30 × 30 px, o Play/Pausa 39 × 39 px, marcadores do carrossel 18 × 34 px e Pausar apresentação 32 × 32 px. A [meta do projeto](../../EXPERIENCE.md) é 44 × 44 CSS px para controles frequentes. Alvos pequenos aumentam o risco de toque errado, especialmente quando se repetem lado a lado. O resultado não foi rotulado automaticamente como violação WCAG: tamanho, espaçamento e exceções precisam ser avaliados juntos.

**Ação:** aumentar a área acionável sem precisar ampliar o ícone, preservando a composição e verificando espaçamento entre alvos. **Comando sugerido:** `$impeccable adapt`.

### P1 — `pnpm lint` falha ao analisar os scripts da skill

**Categoria:** integridade da implementação. **Local:** [configuração ESLint](../../../eslint.config.mjs#L7) e `.agents/skills/impeccable/scripts/`.

`pnpm lint` terminou com 31 erros e 78 avisos. A segunda execução em formato JSON localizou os 31 erros apenas em `live-browser.js` (29) e `modern-screenshot.umd.js` (2), arquivos distribuídos com a skill e ainda não rastreados pelo Git. `pnpm exec eslint src` passou. O gate geral fica vermelho mesmo sem erro detectado no código de `src`, o que reduz sua utilidade antes de uma entrega.

**Ação:** excluir os scripts empacotados da varredura global ou restringir o lint aos arquivos próprios do projeto, mantendo o código do aplicativo coberto. **Comando sugerido:** `$impeccable harden`.

### P2 — Hub `/studio` sem título de nível 1 acessível

**Categoria:** acessibilidade. **Locais:** [regra que oculta a identidade da Home](../../../src/components/studio-radio/studio-radio-shell.module.css#L4083) e [página do hub](../../../src/app/studio/page.tsx).

O Axe encontrou `page-has-heading-one` no hub em desktop e mobile. Há um `h1` no DOM, mas a seção que o contém fica invisível na rota do Estúdio; o hub apresenta seus títulos visíveis como `h2`. Pessoas que navegam por níveis de título perdem o ponto de entrada da página. Esta regra do Axe é uma boa prática estrutural; o relatório não a apresenta como reprovação WCAG AA isolada.

**Ação:** introduzir um `h1` próprio e acessível no hub, integrado à composição aprovada. **Comando sugerido:** `$impeccable harden`.

### P2 — Divisor da Rádio fora dos landmarks e com valor inicial ausente

**Categoria:** acessibilidade. **Local:** [divisor redimensionável](../../../src/components/studio-radio/studio-radio-shell.tsx#L2282).

O Axe marcou `region` para o divisor nas oito rotas desktop, pois ele fica fora de `header`, `main` e `aside`. Em dois carregamentos diretos, também marcou `aria-required-attr`: o `role="separator"` estava visível sem `aria-valuenow` enquanto `radioWidth` era `null`. Em uma nova visita à Home, o valor apareceu após a inicialização; portanto, o segundo alerta é **transitório**, não uma falha persistente do estado hidratado. A navegação por teclado funcionou: `Home` e `ArrowRight` ativaram o dock.

**Ação:** fornecer semântica inicial válida ao controle e revisar sua posição em um landmark sem alterar a geometria. **Comando sugerido:** `$impeccable harden`.

### P2 — Dicas permanentes para propriedades caras de animar

**Categoria:** desempenho. **Local:** [camadas da Home](../../../src/components/studio-radio/studio-radio-shell.module.css#L3567) e [cartões do hub](../../../src/components/studio-radio/studio-radio-shell.module.css#L4783).

`will-change` permanece aplicado a `width`, `clip-path`, `top`, `left`, `transform` e `opacity` mesmo em repouso, conforme o seletor. Isso pode manter trabalho e memória gráfica reservados sem benefício contínuo. Nenhuma queda de quadros foi medida nesta auditoria. Os PNGs originais da Home/Rádio também são grandes (`x1_fundo_2.png` 1,84 MiB; arte da Rádio 1,68 MiB; logo 0,55 MiB); o contrato atual pede preservá-los sem recompressão na Home.

**Ação:** fazer perfil em build de produção, então limitar `will-change` às transições que realmente precisem dele. Preservar as decisões aprovadas sobre os assets. **Comando sugerido:** `$impeccable optimize`.

## Padrões e pontos positivos

- O problema de alvos pequenos repete-se no mini player e nos controles de apresentação; vale corrigir a regra de área acionável como padrão, não apenas um botão.
- Após hidratação em `localhost`, as oito rotas retornaram HTTP 200, sem overflow horizontal em 1440/390 px e sem imagens quebradas detectadas. O hub também ficou sem overflow em 360 px e com texto ampliado a 200%.
- Nos estados iniciais examinados, o Axe não relatou problemas de contraste. `pnpm typecheck` e `pnpm exec eslint src` passaram.
- Em Chrome com toque sintetizado, Próxima impressão trocou a mídia; a galeria abriu por toque e fechou com Escape. O dock desktop respondeu ao teclado. Essas verificações não substituem teste em aparelho físico.
- A implementação identifica mídias pendentes como placeholders e mantém os controles do carrossel disponíveis durante a apresentação.

## Próximas ações

1. **P1 — `$impeccable adapt`:** corrigir as áreas acionáveis da Rádio mobile e do carrossel.
2. **P1/P2 — `$impeccable harden`:** restaurar o gate de lint e corrigir títulos e semântica do divisor.
3. **P2 — `$impeccable optimize`:** medir a build de produção e tratar `will-change` onde houver benefício demonstrado.
4. **Final — `$impeccable polish`:** revisão final após as correções.

Reexecutar `$impeccable audit` após as mudanças para comparar os resultados. A avaliação estética e a aprovação visual final continuam com Cassiano.
