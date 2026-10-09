# Evidência 08V — Visual QA de preparação (09/10/2026)

**Execução observada:** [CI run 37936816995](https://github.com/cassianomangini/radioand3d/actions/runs/37936816995), commit `a7c46712fe56d6c13b1df28ad17958f965ec6a2f`. **Resultado:** pipeline CI verde; 25/25 testes Playwright passaram. Lint, typecheck, 84 testes unitários e build também passaram na execução. Nenhuma página pública foi alterada neste recorte.

**Artefatos de CI:** [diagnósticos Playwright](https://github.com/cassianomangini/radioand3d/actions/runs/37936816995/artifacts/11618678490) (20 screenshots das páginas + inventário Axe de 5 viewports) e [captura/estados CDP](https://github.com/cassianomangini/radioand3d/actions/runs/37936816995/artifacts/11618995570) (23 imagens). Artefatos expiram após 7 dias; o registro textual persiste.

## Escopo realmente executado

- Playwright avaliou Home, hub Estúdio, página de Orçamento e Produto `/studio/produtos/porta-curativos-compacto`.
- Cinco projetos: desktop 1440×900, desktop 1024×768, desktop curto 1760×824, mobile 390×844 e mobile estreito 360×800. Os dois mobiles usam `isMobile`/`hasTouch`.
- Testou retorno HTTP menor que 400, presença de título no DOM, captura viewport e medição `documentElement.scrollWidth` versus `clientWidth`.
- Nenhum caso emitiu anotação `observed-overflow` nos quatro caminhos medidos. Essa medição **não** garante ausência de scroll desnecessário ou falhas em interações.
- Axe executado em `/studio` nos cinco viewports como inventário **não bloqueante**: 2 violações moderadas em 1440 e desktop curto; 1 violação moderada em 1024, 390 e 360.
- O script CDP existente capturou foco/fullscreen/transições, estados de entrada/saída de rotas e Rádio mobile e preservou suas verificações de contrato.

## Problemas observados, NÃO corrigidos (páginas ainda fora de escopo)

| Origem | Achado | Decisão |
| --- | --- | --- |
| Axe em `/studio`, cinco viewports | `page-has-heading-one`: há heading no DOM, mas o documento não expõe H1 adequado à árvore de acessibilidade nas condições verificadas | Investigar e corrigir em entrega de UI/semântica autorizada. Passagem 25/25 não elimina esse problema. |
| Axe em `/studio` desktop amplo e curto | `region`: handle/divisor está fora de landmarks semânticos reconhecidos | Investigar sem prejudicar funcionalidade da divisória aceita. |
| Screenshots desktop `/studio` | Três superfícies seguem usando placeholders de fotos reais pendentes; grandes áreas vazias refletem E3/mídia não finalizada | Não criar imagem/peça falsa nem improvisar ornamento CSS. |
| Captura Home mobile 390 | A primeira dobra dá muito peso ao fundo X1; headline principal só começa após a arte | Observação visual para próxima revisão aprovada; não modificar a Home nesta preparação. |
| Captura Rádio CI | Playlist aparece vazia no ambiente de captura, pois a fixture pública sem catálogo R2 não simula as 343 faixas reais | Não declarar QA de reprodução musical real a partir dessa imagem. Testes CDP cobrem estados técnicos, não escuta de faixa real. |

## Limites do aceite

A suíte ainda **não** contém uma referência aprovada renderizada para pixel-diff ou comparação perceptual confiável. Também não certifica estética, a11y completa, GPU, performance, dados dinâmicos reais, áudio em reprodução, qualidade de figuras ou mobile em hardware físico. O primeiro erro do novo Playwright foi `EADDRINUSE` porque o CDP anterior deixou o mesmo servidor na porta 3000; configuração corrigida com `reuseExistingServer: true`, seguida da execução verde citada.

**Conclusão:** visual harness **funciona e gera evidência repetível** no CI, mas a revisão visual artística e as correções da UI continuam abertas. Não confundir infra validada com produto visual concluído.
