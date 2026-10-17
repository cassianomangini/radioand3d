# Home X1 responsiva — integração de 17/10/2026

**Escopo:** Home de `radioand3d`, mantendo a Rádio e o divisor existentes.

- A imagem original continua em `docs/fundo_geral_site_estudio.png`. O mesmo blob foi exposto em `public/images/studio/cm-home-x1.png`, preservando pixels e texto do balão; o Next/Image pode produzir WebP/AVIF automaticamente conforme suporte do navegador.
- O X1 está em uma camada de arte independente dos textos. O H1 não tem linhas fixas; somente “muito mais” tem gradiente.
- Layout e tamanho do texto são controlados pela largura real do painel `studio` via `@container studio`; no compacto a composição é vertical. O painel pode rolar sem deslocar o player lateral.
- A saudação está visualmente apenas na imagem e existe uma alternativa HTML para leitor de tela.
- Fonte do H1/CTA: Outfit; descrição: Plus Jakarta Sans. Link do CTA segue para `/studio`.

## Escopo explicitamente preservado

Sem alteração de `RadioProvider`, áudio, playlist, equalizador, navbar, dock, mini-player, rotas ou cálculos do divisor.

## Verificação e limites

O teste Playwright `tests/visual/home-hero-responsive.spec.ts` verifica texto, arte carregada, CTA, overflow, enquadramento do título e resize do divisor no desktop. A CI `[visual]` gera capturas e executa testes no navegador. Registrar o resultado real da CI antes de considerar a entrega validada.

**Observação:** o código preexistente do divisor limita o Estúdio a cerca de 640 px no desktop; por isso a proporção 30% Estúdio / 70% Rádio pode não ser atingível em algumas larguras. Essa regra foi preservada para não reabrir comportamento já aprovado.

**Estado de aceite estético:** pendente de conferência das capturas reais por Cassiano. Capturas automáticas não constituem aprovação final.

## Correção visual — 17/10/2026 (captura enviada pelo usuário)

A captura evidenciou um erro na primeira implementação: a imagem ficava restrita a uma faixa de aproximadamente 40% do painel e a altura máxima de ~25rem, deixando grandes áreas lisas acima e abaixo.

**Correção:** no desktop, a arte agora ocupa 100% da largura e toda a altura do Estúdio abaixo da navbar, sem `mask` que corte a borda. A legibilidade do texto passa a depender de um gradiente contínuo sobre a cena, não de um card retangular. A posição `object-position` foi ajustada para priorizar X1 e balão; o texto permanece independente da imagem. Em painel estreito (divisor), o fundo continua preenchendo a área e a copy passa a composição vertical. Em laptop, a arte deixa de ficar limitada à faixa central de 36rem.

**Regressão adicionada:** o Playwright verifica largura, topo e base do asset em relação ao painel real do Estúdio, inclusive após a expansão da Rádio. Resultado e aceite visual dependem da CI e inspeção da renderização.

## Posicionamento responsivo revisado — 17/10/2026

As três capturas fornecidas mostram colisões concretas: balão atrás do H1 no dock, balão/braços atrás do título na posição padrão e X1 inteiro sob a copy quando a Rádio é expandida. A causa é a coluna começar aos 38% e mudar bruscamente para layout vertical já aos 54rem de largura **do Estúdio**.

A correção reserva os 54% esquerdos do Estúdio ao X1 e balão nos painéis a partir de 43rem, usando fonte dimensionada pela largura real do painel (container query). O gradiente protege a leitura sem criar um card. Somente abaixo de 43rem a composição fica vertical; nesse limite o balão é preservado em cima e a copy vem abaixo da área fotográfica, com degradê escuro. Em alturas muito curtas, a copy se alinha abaixo da navbar para não ficar cortada.

QA adicionada: testes de geometria da copy e capturas de split padrão, Rádio intermediária, Rádio máxima e dock. A revisão visual final continua dependendo de inspeção da captura renderizada e aceite do usuário; testes isolados não representam aprovação estética.

Escopo preservado: nenhuma alteração na Rádio, player, comportamento de arraste, navegação, produção musical ou roteamento.
