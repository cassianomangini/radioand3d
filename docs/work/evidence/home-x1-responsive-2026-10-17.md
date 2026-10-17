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
