# Entrega 06: motor e fila da CM Rádio

## Identificação

ID do roadmap: 06. Responsável: CM Audio. Branch/base/HEAD: `fix/radio-mockup-fidelity`, `39b78c9`. Contratos lidos: [Rádio](../RADIO.md), [biblioteca](../MUSIC_PIPELINE.md) e [arquitetura](../ARCHITECTURE.md). A entrega 02 fornece o projeto local; o contrato público definitivo da entrega 04 e as mídias autorizadas continuam pendentes.

## Resultado e limites

Objetivo observável: um único motor de áudio e uma fila que exponha as próximas dez ocorrências na ordem efetiva, com play/pause, anterior/próxima, seek, volume, shuffle, repetição e dados para visualizador. O mini player e a Rádio completa consomem o mesmo estado.

Incluído: prova local do motor e da interface com fixture de áudio explicitamente identificada apenas em desenvolvimento; testes de fila e estados de reprodução. Fora do escopo: publicar músicas, conectar storage/banco, importar o acervo, equalização que altera o som e declarar aprovação visual. Áreas reservadas: `src/features/radio/`, interface da Rádio em `src/components/studio-radio/`, rota técnica em `/dev` e testes correspondentes. As alterações locais do hero e sua imagem são trabalho já existente e devem ser preservadas.

Critérios de aceite: a fila anunciada coincide com os próximos avanços; não há duas fontes de áudio; play só aparece após evento do motor; mudança de largura e abertura mobile preservam faixa, posição e volume; barras reagem ao sinal e param quando a visualização não está ativa. Cassiano faz a revisão visual e das interações.

## Checklist de execução

- [x] Base, instruções, diff local e dependências verificados.
- [x] Contratos e critérios de aceite definidos.
- [x] Implementar fila determinística e testar sequência, modos e histórico.
- [x] Implementar um elemento de áudio no layout persistente, com estados, seek, volume e tratamento de falhas.
- [x] Conectar mini player, player completo e visualizador ao mesmo motor.
- [x] Disponibilizar fixture identificada somente no ambiente local e conferir a resposta HTTP.
- [ ] Verificar reprodução, troca rápida, continuidade, seek, volume e barras no navegador com escuta real.
- [x] Executar lint, typecheck, build e testes pertinentes; revisar diff.
- [ ] Integrar mídias reais autorizadas e validar som/CORS no ambiente alvo.
- [ ] Receber revisão visual e de interações de Cassiano.

## Evidência e retomada

No início, o repositório continha apenas a referência visual `Limite Elástico`, sem áudio ou catálogo de músicas. Cassiano foi consultado sobre a origem das faixas e sobre o significado de “equalizador”. A Home em desenvolvimento usa 12 amostras sintéticas explicitamente rotuladas; em produção, a rota `/dev/audio-fixture` responde 404 e a Home não inclui essas amostras. A integração real depende das faixas e da publicação do contrato da entrega 04. Nenhum commit/PR desta entrega ainda.

| Critério | Evidência | Resultado |
| --- | --- | --- |
| Próximas dez na ordem efetiva | `pnpm test`, casos de sequência, shuffle, repeat e histórico | 8 testes passaram |
| Visualizador silencioso e com sinal | `pnpm test`, vetor vazio e frequência conhecida | Barras ficam na linha de base em silêncio e reagem ao sinal |
| Fixture local | GET `/dev/audio-fixture?track=1` em servidor de desenvolvimento | 200, `audio/wav`, 352844 bytes |
| Sem fixture publicada | GET da rota no build de produção + inspeção da Home | 404; título das amostras ausente |
| Lista no HTML de desenvolvimento | GET da Home e contagem dos itens no primeiro `ol` “Próximas músicas” | Dez linhas |
| Código e build | `pnpm check`, `pnpm test`, `git diff --check` | Passaram; oito testes |

Essas verificações não comprovam escuta, interação visual ou continuidade em navegador. O próximo passo é revisar a interface com Cassiano, executar os cenários de áudio no navegador quando ele solicitar essa validação e conectar as mídias autorizadas. As mudanças locais do hero foram preservadas; nenhum commit/PR foi criado.
