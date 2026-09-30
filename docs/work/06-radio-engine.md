# Entrega 06: motor e fila da CM Rádio

## Identificação

ID do roadmap: 06. Responsável: CM Audio. Branch atual: `feat/radio-r2-catalog`, baseada em `fix/radio-mockup-fidelity` (`f67701b`). Contratos lidos: [Rádio](../RADIO.md), [biblioteca](../MUSIC_PIPELINE.md) e [arquitetura](../ARCHITECTURE.md). A entrega 02 fornece o projeto local; o contrato editorial definitivo da entrega 04 continua pendente.

## Resultado e limites

Objetivo observável: um único motor de áudio e uma fila que exponha as próximas dez ocorrências na ordem efetiva, com play/pause, anterior/próxima, seek, volume, shuffle, repetição e dados para visualizador. O mini player e a Rádio completa consomem o mesmo estado.

Incluído: prova local do motor e da interface com fixture de áudio explicitamente identificada apenas em desenvolvimento; testes de fila e estados de reprodução. Cassiano informou o bucket R2 `musicas` com a lista correta da rádio e pediu que nenhuma faixa seja excluída, inclusive nomes com `(1)`. Este recorte acrescenta leitura completa e paginada do bucket no servidor, sem filtrar variantes pelo nome, e usa o endereço público apenas para reprodução. Fora do escopo: upload, alteração ou exclusão no R2, banco, Music Inbox, equalização que altera o som e declarar aprovação visual. Áreas reservadas: `src/features/radio/`, `src/app/layout.tsx`, configuração de exemplo, testes e documentação desta entrega.

Critérios de aceite: a fila anunciada coincide com os próximos avanços; não há duas fontes de áudio; play só aparece após evento do motor; mudança de largura e abertura mobile preservam faixa, posição e volume; barras reagem ao sinal e param quando a visualização não está ativa. Cassiano faz a revisão visual e das interações.

## Checklist de execução

- [x] Base, instruções, diff local e dependências verificados.
- [x] Contratos e critérios de aceite definidos.
- [x] Implementar fila determinística e testar sequência, modos e histórico.
- [x] Implementar um elemento de áudio no layout persistente, com estados, seek, volume e tratamento de falhas.
- [x] Conectar mini player, player completo e visualizador ao mesmo motor.
- [x] Disponibilizar fixture identificada somente no ambiente local e conferir a resposta HTTP.
- [x] Implementar leitura paginada do inventário R2 no servidor, sem excluir variantes `(1)` e sem expor credenciais ao player.
- [ ] Verificar reprodução, troca rápida, continuidade, seek, volume e barras no navegador com escuta real.
- [x] Executar lint, typecheck, build e testes pertinentes; revisar diff.
- [x] Integrar o catálogo real no ambiente local e conferir CORS por HTTP.
- [ ] Validar o som e as interações no navegador com Cassiano.
- [x] Confirmar inventário completo do R2 por API S3 com credencial somente de leitura.
- [x] Validar URLs públicas de todo o inventário por HTTP, sem recorrer à pasta local como fonte canônica.
- [ ] Reconciliar os 101 arquivos que existem na pasta local e não estão no R2 antes de declarar o acervo completo.
- [ ] Receber revisão visual e de interações de Cassiano.

## Evidência e retomada

No início, o repositório continha apenas a referência visual `Limite Elástico`, sem áudio ou catálogo de músicas. Cassiano foi consultado sobre a origem das faixas e sobre o significado de “equalizador”. A Home em desenvolvimento usa 12 amostras sintéticas explicitamente rotuladas até o R2 ser configurado; em produção, a rota `/dev/audio-fixture` responde 404 e a Home não inclui essas amostras. Cassiano configurou o acesso R2 no `.env.local` ignorado pelo Git, e o catálogo real está ativo nesse ambiente local. O fluxo editorial da entrega 04 permanece separado.

| Critério | Evidência | Resultado |
| --- | --- | --- |
| Próximas dez na ordem efetiva | `pnpm test`, casos de sequência, shuffle, repeat e histórico | 11 testes passaram no total, incluindo 3 do catálogo R2 |
| Inventário R2 sem omissão por página ou sufixo | `pnpm test`, páginas simuladas com `(1)`, M4A e chave aninhada | Passou |
| Inventário real do bucket | `ListObjectsV2` com credencial local de leitura; registro ignorado em `output/r2-inventory-2026-09-30.json` | 242 objetos em uma página: 160 MP3, 82 M4A; 32 com `(1)`; inventário do bucket ainda incompleto frente à pasta local |
| Reconciliação com a pasta local | Comparação de nomes e tamanho entre R2 e `D:\Músicas\radio artesopolis`; plano ignorado em `output/r2-missing-upload-plan-2026-09-30.csv` | 343 arquivos locais; 242 presentes no R2 com o mesmo tamanho; 101 ausentes (421,5 MiB), incluindo 9 com `(1)` |
| URLs públicas do inventário | HEAD com `Origin: http://localhost:3000` para todos os 242 objetos | 242 respostas 200, tipo `audio/*` e CORS `*`; nenhuma falha |
| Catálogo na Home local | GET `http://localhost:3005/` após ativar R2 no `.env.local` | 200, biblioteca com 242 músicas, dez linhas em “A seguir”, sem amostra sintética |
| Visualizador silencioso e com sinal | `pnpm test`, vetor vazio e frequência conhecida | Barras ficam na linha de base em silêncio e reagem ao sinal |
| Fixture local | GET `/dev/audio-fixture?track=1` em servidor de desenvolvimento | 200, `audio/wav`, 352844 bytes |
| Sem fixture publicada | GET da rota no build de produção + inspeção da Home | 404; título das amostras ausente |
| Lista no HTML de desenvolvimento | GET da Home e contagem dos itens no primeiro `ol` “Próximas músicas” | Dez linhas |
| Código e build | `pnpm lint`, `pnpm typecheck`, `pnpm build`, `pnpm test`, `git diff --check` | Passaram nesta branch; 11 testes |

Essas verificações não comprovam escuta, interação visual ou continuidade em navegador. O próximo passo é revisar a interface com Cassiano, executar os cenários de áudio no navegador quando ele solicitar essa validação e conectar as mídias autorizadas. As mudanças locais do hero foram preservadas.

Em 30/09, Cassiano informou o bucket R2 e confirmou que a lista inteira da rádio deve ser usada, inclusive `(1)`. A ponte de leitura percorre `ListObjectsV2` até a última página e fornece URLs públicas codificadas; a pasta local não define o catálogo. O endereço público não lista objetos, por isso a credencial de leitura fica somente no servidor. Requisições `GET` com `Range: bytes=0-1` responderam `206`, `Access-Control-Allow-Origin: *` e tipo de áudio para um MP3 com `(1)` e um M4A. A conferência posterior validou todas as 242 URLs por HEAD. Isso não comprova reprodução audível.

Após a comparação, o próximo passo exato é Cassiano decidir se os 101 arquivos locais ausentes devem ser enviados ao bucket `musicas`. Se autorizado, preparar credencial temporária de escrita restrita ao bucket, enviar apenas os ausentes, relistar o R2 e verificar as URLs. Depois, Cassiano ouve e revisa as interações da rádio local. O domínio próprio e a configuração de credenciais no ambiente hospedado continuam necessários antes de uso em produção.
