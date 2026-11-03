# Evidência 08V — laboratório renderizado, 09/10/2026

**Escopo restrito:** desenvolvimento, rota `/dev/visual-lab`; sem alterar Home, Estúdio público ou Rádio e sem deploy.  
**CI final:** [37942413229](https://github.com/cassianomangini/radioand3d/actions/runs/37942413229), commit `fcb615b66cbc1360cba58b5a4094bd5b413f90fa`.  
**Capturas e medições:** [artefato cm-visual-diagnostics](https://github.com/cassianomangini/radioand3d/actions/runs/37942413229/artifacts/11622475963) (retido por 7 dias). O comparativo `test-results/visual-lab/comparativo.html` referencia as 12 capturas de browser das três composições × quatro viewports.

## Provas concluídas

- `pnpm lint`, `pnpm typecheck`, `pnpm test` (84 testes) e `pnpm build`: **passaram**.
- **30/30** Playwright da área pública/limite 404 e **16/16** Playwright do laboratório dev: passaram **sem retry** (a suíte do laboratório tem `retries: 0`).
- Em **1440×900, 1024×768, 390×844 e 360×800**: três estudos selecionáveis, `aria-pressed` único, navegação por teclado, captura fullPage, zero overflow horizontal objetivo, sem colisão H2/parágrafo conforme teste de caixas de glifos.
- `/dev/visual-lab` responde **404 em build production** e só abre no servidor `pnpm dev`; artefato isolado de qualquer página comercial.
- Fonte `motion/react` já instalada foi utilizada somente para a troca entre estudos, com suporte a `prefers-reduced-motion`.
- Mídia: somente placeholders marcados `FOTOGRAFIA REAL PENDENTE`; nenhuma peça ou medida fictícia.
- O QA encontrou e permitiu corrigir **sobreposição real de título no Mostruário** e **clique prematuro antes da hidratação**. A correção final foi exercitada sem retries; histórico em [diário de iterações](08v-lab-iterations-2026-10-09.md).

## Inventário de custo no browser (não é benchmark de produção)

Cada captura registra `visual-lab-performance-inventory.json`; foram **12 amostras** medidas no Chromium headless de CI, acessando o **servidor de desenvolvimento**, durante aproximadamente **350 ms** de frames após seleção.

| Métrica | Observação nas 12 amostras | Limite de interpretação |
| --- | --- | --- |
| DOMContentLoaded | 157–512 ms; mediana ~360 ms | Server dev, host da CI, cold cache; **não equivale à Web Vitals de produção** |
| Resource requests classificados como JS | 15 | Compartilha runtime dev do Next; não expressa quantas dependências seriam carregadas no bundle final |
| JS decodedBodySize reportado | ~5,44 MB por captura | Ambiente dev com chunks Next; **não é tamanho de JS de produção** |
| Maior intervalo entre frames da amostra | 17 ms | Amostra de 350 ms fora de interação longa; indica apenas fluidez nesse trecho/headless |
| Intervalos > 50 ms | 0/12 amostras | **Não prova ausência de jank** em dispositivos físicos ou CPU throttled |

**Risco de interpretação:** resultados de Chrome headless e `pnpm dev` são evidência de viabilidade do protótipo, não aprovação de performance final mobile, custo de GPU, taxa de conversão ou qualidade estética. A futura UI final requer build de produção, hardware real e auditoria de bundle por rota.

## Limites pendentes

- **Nenhuma variante selecionada ou aprovada por Cassiano**; `V4.4/V4.5` abertos.
- **Nenhum mock original aprovado** foi convertido em baseline de regressão; `V2.5` aberto.
- **E3** ainda depende de fotografia/peças autorizadas para uma galeria verdadeira.
- **V5** não iniciou implementação de página pública; o laboratório é somente estudo isolado.

**Resultado:** infraestrutura de V4.1–V4.3 demonstrada e verificável; próxima decisão é escolher/refinar uma direção visual sem confundir composição estrutural com fotografia ou design final.
