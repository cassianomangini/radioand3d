# Auditoria de reaproveitamento

## Escopo e evidência

Referência: `cassianomangini/artesopolis-landing`, snapshot `546af1c5b3b18e6b03a72a658e843864e69d8f8d`. Revisão estática, sem executar build, player ou serviços externos. Não representa auditoria de todas as branches nem certificação de funcionamento em produção.

O landing antigo permanece somente leitura. A visibilidade e autorização do destino devem ser conferidas antes de copiar código ou ativos. Não registrar credenciais, endereços privados de mídia ou dados de clientes nesta documentação.

## Conclusões corrigidas

| Área observada | O que a leitura sustenta | Decisão para CM |
| --- | --- | --- |
| Provider e layout | Intenção de reprodução global, controles, histórico e recuperação de falhas | Preservar requisitos, reconstruir fronteiras e testar; não copiar provider inteiro |
| Visualização | Análise real por Meyda com normalização/suavização e renderização de barras acoplada ao provider | Separar análise e renderer; avaliar reaproveitamento isolado com testes |
| Identidade das faixas | Modelo enxuto baseado em nome de arquivo, com agrupamento inferido | Biblioteca com IDs e versões explícitas |
| Manifesto local | Lista e rotina local de geração existem; isso não comprova sincronização completa do storage | Usar, se autorizado, apenas como entrada de migração |
| Mídia remota | Código referencia R2; disponibilidade, CORS, custo e operação não foram testados | Tratar fornecedor como candidato, não infraestrutura CM já pronta |
| Controles e imagens | Há componentes genéricos e apresentação específica da marca antiga | Avaliar primitivas pequenas; redesenhar a identidade CM |
| Página de impressões | No snapshot revisado, é uma apresentação de em breve | Catálogo, materiais e disponibilidade precisam de implementação própria |

Meyda, RMS, suavização, quantidade fixa de barras e refs DOM não são, isoladamente, gambiarra. A justificativa para a mudança é reduzir acoplamento, explicitar contratos e validar comportamento. Trocar por `AnalyserNode` não garante automaticamente melhor visual ou melhor som.

A análise observada alimenta um visualizador, não controles de equalização que modificam o áudio. O novo produto mantém essa distinção.

## Pontos de atenção para os testes novos

Distinguir bloqueio de reprodução e falha de arquivo; evitar avanço infinito quando não há candidato válido; garantir estado real de reprodução; testar zero/uma faixa, trocas rápidas, recarga de metadados e limpeza do grafo. São cenários de risco a validar, não incidentes de produção comprovados por esta revisão.

Alguns documentos do legado descrevem implementação anterior. Usar o código do snapshot escolhido como evidência, sem assumir que o plano antigo foi executado integralmente.

## Uso desta auditoria

Este arquivo registra o que foi encontrado, sem manter outro roadmap ou checklist de migração. Novas observações devem identificar snapshot e método de verificação. Contratos vigentes: [rádio](RADIO.md), [biblioteca](MUSIC_PIPELINE.md), [catálogo](CATALOG_3D.md) e [roadmap](ROADMAP.md).
