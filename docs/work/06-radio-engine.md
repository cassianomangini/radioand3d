# Entrega 06: motor e fila da CM Rádio

## Identificação

ID do roadmap: 06. Responsável: CM Audio. Branch atual: `feat/radio-r2-catalog`, baseada em `fix/radio-mockup-fidelity` (`f67701b`). Contratos lidos: [Rádio](../RADIO.md), [biblioteca](../MUSIC_PIPELINE.md) e [arquitetura](../ARCHITECTURE.md). A entrega 02 fornece o projeto local; o contrato editorial definitivo da entrega 04 continua pendente.

## Resultado e limites

Objetivo observável: um único motor de áudio e uma fila que exponha as próximas dez ocorrências na ordem efetiva, com play/pause, anterior/próxima, seek, volume, shuffle, repetição e dados para visualizador. O mini player e a Rádio completa consomem o mesmo estado.

Incluído: prova local do motor e da interface com fixture de áudio explicitamente identificada apenas em desenvolvimento; testes de fila e estados de reprodução. Cassiano informou o bucket R2 `musicas` com a lista correta da rádio e pediu que nenhuma faixa seja excluída, inclusive nomes com `(1)`. Este recorte acrescenta leitura completa e paginada do bucket no servidor, sem filtrar variantes pelo nome, e usa o endereço público apenas para reprodução. O envio posterior dos 101 arquivos ausentes foi autorizado por Cassiano e concluído sem substituir os objetos existentes. O acabamento da lista mostra duração indisponível até que os metadados do áudio sejam carregados; o lint ignora auditorias locais em `output/`. Fora do escopo: alteração ou exclusão das músicas no R2, banco, Music Inbox, equalização que altera o som e declarar aprovação visual. Áreas reservadas: `src/features/radio/`, apresentação da lista em `src/components/studio-radio/`, `src/app/layout.tsx`, `eslint.config.mjs`, configuração de exemplo, testes e documentação desta entrega.

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
- [x] Reconciliar os 101 arquivos que existiam na pasta local e faltavam no R2, sem substituir os objetos já presentes.
- [x] Exibir duração indisponível na lista enquanto o áudio não informa metadados e ignorar auditorias locais no lint.
- [ ] Receber revisão visual e de interações de Cassiano.

## Evidência e retomada

No início, o repositório continha apenas a referência visual `Limite Elástico`, sem áudio ou catálogo de músicas. Cassiano foi consultado sobre a origem das faixas e sobre o significado de “equalizador”. A Home em desenvolvimento usa 12 amostras sintéticas explicitamente rotuladas até o R2 ser configurado; em produção, a rota `/dev/audio-fixture` responde 404 e a Home não inclui essas amostras. Cassiano configurou o acesso R2 no `.env.local` ignorado pelo Git, e o catálogo real está ativo nesse ambiente local. O fluxo editorial da entrega 04 permanece separado.

| Critério | Evidência | Resultado |
| --- | --- | --- |
| Próximas dez na ordem efetiva | `pnpm test`, casos de sequência, shuffle, repeat e histórico | 11 testes passaram no total, incluindo 3 do catálogo R2 |
| Inventário R2 sem omissão por página ou sufixo | `pnpm test`, páginas simuladas com `(1)`, M4A e chave aninhada | Passou |
| Inventário real do bucket | `ListObjectsV2` com credencial local de leitura; registro ignorado em `output/r2-inventory-2026-09-30.json` | 343 objetos em uma página: 228 MP3, 115 M4A; 41 com `(1)` |
| Reconciliação com a pasta local | Comparação de nomes e tamanho entre R2 e `D:\Músicas\radio artesopolis`; plano ignorado em `output/r2-missing-upload-plan-2026-09-30.csv` | 101 arquivos ausentes (421,5 MiB) enviados com condição de não sobrescrever; `HeadObject` confirmou cada tamanho; os 343 locais estão no bucket |
| URLs públicas do inventário | HEAD com `Origin: http://localhost:3000` para todos os 343 objetos | 343 respostas 200, tipo `audio/*` e CORS `*`; nenhuma falha |
| Catálogo na Home local | GET `http://localhost:3005/` após ativar R2 no `.env.local` | 200, biblioteca com 343 músicas, dez linhas em “A seguir”, sem amostra sintética |
| Visualizador silencioso e com sinal | `pnpm test`, vetor vazio e frequência conhecida | Barras ficam na linha de base em silêncio e reagem ao sinal |
| Fixture local | GET `/dev/audio-fixture?track=1` em servidor de desenvolvimento | 200, `audio/wav`, 352844 bytes |
| Sem fixture publicada | GET da rota no build de produção + inspeção da Home | 404; título das amostras ausente |
| Lista no HTML de desenvolvimento | GET da Home e contagem dos itens no primeiro `ol` “Próximas músicas” | Dez linhas |
| Código e build | `pnpm lint`, `pnpm typecheck`, `pnpm build`, `pnpm test`, `git diff --check` | Passaram nesta branch; 11 testes |

Essas verificações não comprovam escuta, interação visual ou continuidade em navegador. As mudanças locais do hero foram preservadas.

Em 30/09, Cassiano informou o bucket R2 e confirmou que a lista inteira da rádio deve ser usada, inclusive `(1)`. A ponte de leitura percorre `ListObjectsV2` até a última página e fornece URLs públicas codificadas; a pasta local não define o catálogo. O endereço público não lista objetos, por isso a credencial de leitura fica somente no servidor. Após detectar a diferença de 101 arquivos, Cassiano autorizou o envio. A credencial inicial retornou 403 para escrita; uma credencial temporária de escrita restrita ao bucket permitiu copiar os ausentes. Requisições `GET` com `Range: bytes=0-1` responderam `206`, `Access-Control-Allow-Origin: *` e tipo de áudio para um MP3 com `(1)` e um M4A. A conferência final validou todas as 343 URLs por HEAD. Isso não comprova reprodução audível.

O próximo passo exato é Cassiano ouvir e revisar as interações da rádio local, incluindo seleção, dez próximas, seek, volume, shuffle, repetição e visualizador. Até o navegador carregar os metadados de uma faixa, a lista mostra duração indisponível em vez de inventar `0:00`; para a faixa carregada, mostra a duração informada pelo áudio. A credencial temporária de escrita deve ser revogada no painel da Cloudflare após o envio. O domínio próprio e a configuração da credencial de leitura no ambiente hospedado continuam necessários antes de uso em produção.

A branch posterior `fix/radio-volume-popover` ajustou a fila para abrir embaralhada, expor toda a sequência restante em **A seguir** e terminar sem repetir automaticamente. Acrescentou Repetir faixa e Nova ordem como ações explícitas. Os 16 testes passaram, incluindo a nova sequência sem reposição; a escuta e a revisão no navegador seguem pendentes com Cassiano.

## Correção do movimento das barras em 30/09/2026

Cassiano informou que as barras permanecem paradas enquanto a música toca. Responsável: CM Audio. Branch `fix/radio-visualizer-motion`, base `fix/radio-volume-popover` (`a7a76fa`). Contratos lidos: `docs/RADIO.md` e este checklist. Limite: corrigir o caminho do sinal e a atualização das barras; preservar fila, transporte, layout aprovado e arquivos de mídia.

Aceite técnico: o sinal percorre fonte → analisador → saída no mesmo grafo; níveis não nulos produzem alturas acima da linha de base; o loop de desenho começa quando reprodução e análise estão prontas, para ao pausar ou ocultar a superfície e não interrompe o áudio. A confirmação de movimento com música real fica com Cassiano, que revisa a interface no navegador.

- [x] Conferir branch, dependências, relato, contrato e código do grafo/visualizador.
- [x] Registrar objetivo, limite e critérios antes da correção.
- [x] Ligar o analisador ao caminho da saída e revisar o estado de disponibilidade.
- [x] Iniciar o ciclo imediatamente quando visível, manter a observação e melhorar a resposta a frequências estreitas.
- [x] Executar testes pertinentes, lint, tipos e build; revisar diff.
- [x] Cassiano confirmar que as barras se movem durante música real no Chrome.
- [ ] Cassiano confirmar resposta ao ritmo após o ajuste de latência, inclusive em mobile.

Evidência: a implementação anterior conectava a fonte separadamente à saída e ao analisador; a [documentação do `AnalyserNode`](https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode) diz que saída desconectada também funciona, portanto essa topologia não comprova a causa do defeito. A correção coloca o analisador no caminho da saída, inicia o loop de desenho quando o elemento já está visível e informa falha de análise. O cálculo das barras agora combina média e pico para revelar energia concentrada em poucas frequências. `pnpm test` passou com 17 testes, incluindo sinal fraco em banda larga; `pnpm check` e `git diff --check` passaram. Os testes sintéticos não comprovam movimento com as músicas reais. A revisão final depende da escuta de Cassiano. [PR #10](https://github.com/cassianomangini/radioand3d/pull/10) integrado à `main` em 01/10/2026.

Em 01/10, Cassiano confirmou no Chrome que as barras continuavam imóveis; a correção anterior não resolveu seu caso. A análise mostrou que o grafo era conectado somente após a promessa de `AudioContext.resume()`, que pode permanecer pendente, e que `prefers-reduced-motion` impedia o ciclo sem indicação. O grafo agora é conectado no gesto de reprodução; o visualizador usa os dados de frequência mesmo sob preferência de movimento reduzido. Cassiano então confirmou movimento, mas descreveu resposta lenta e sem relação clara com ritmo, voz e instrumentos. Para essa segunda correção, o analisador passou a usar FFT de 2048 amostras, suavização 0,3 e faixa de -90 a -5 dB; o desenho acompanha cada quadro visível, e a escala das barras conserva diferença entre níveis fortes. Ainda falta Cassiano confirmar o resultado com música real. A automação de navegador foi interrompida a pedido dele; não registrar aprovação visual a partir dos testes de código.

Cassiano relatou melhora, mas ainda percebeu as barras subindo de modo aleatório. A atualização seguinte combina a energia de cada faixa de frequência com a intensidade RMS da forma de onda e destaca ataques acima da média recente. A subida é rápida e a descida curta, para as barras responderem à batida sem flutuação isolada excessiva. Após Cassiano pedir mais espaço duas vezes, a altura ficou em 7 rem no desktop, 5,4 rem em janelas desktop baixas e 5,6 rem na Rádio mobile. `pnpm test` passou com 20 testes; `pnpm check` e `git diff --check` passaram após o último ajuste de altura. A resposta perceptiva e a altura ainda precisam da conferência de Cassiano com faixas reais.

Cassiano aprovou a altura do espaço, mas percebeu que as barras ocupavam pouco dele. A escala das barras foi elevada com raiz quadrada da intensidade por faixa e um teto de 96% da área; o pulso da forma de onda continua modulando a altura. O tamanho do espaço permanece igual. `pnpm test` passou com 21 testes; `pnpm check` e `git diff --check` passaram. A conferência visual desta nova escala segue com Cassiano.


Em 01/10, uma revisão da implementação já integrada à `main` mostrou que os ajustes perceptivos tinham acumulado heurísticas que fabricavam movimento: boost fixo de médios tratado como faixa vocal, pulso compartilhado de médios, ataque RMS global reaplicado ao grave e flux/onset usados para manter barras dançando mesmo com espectro estável. A correção de fidelidade remove essas dependências cruzadas. O visualizador passa a ler FFT em dB com `getFloatFrequencyData`, usa FFT 4096, cobre aproximadamente 40 Hz–18 kHz, integra a potência real de cada banda com sobreposição fracionária dos bins e aplica somente attack/release por barra. Os testes agora exigem isolamento entre bandas, ausência de boost vocal artificial, representação acima de 12 kHz e estabilização quando o espectro permanece constante. A confirmação perceptiva com músicas reais continua pendente com Cassiano.


## Visualizador musical aprovado em 02/10/2026

Cassiano rejeitou a leitura puramente grave → agudo porque ela concentrava movimento à esquerda, deixava a direita quase parada e não comunicava voz/instrumentos da forma desejada. A direção aprovada passa a ser **voz no miolo e todo o acompanhamento ao redor**, com cada evento audível participando: bateria, baixo, violão, guitarra, piano, flauta, synth, backing vocals ou qualquer outro instrumento presente.

Handoff de experiência para este recorte:

- target_surface: visualizador da Rádio completa + mini player;
- variance: 7; motion: 8; density: 6;
- desktop: 36 barras canônicas; o miolo recebe o stem vocal e as laterais recebem acompanhamento multibanda;
- mobile: usa o mesmo derivado reamostrado para 24 barras, sem criar outra análise ou outro player;
- audio_behavior: Demucs separa voz; os stems não vocais permanecem separados durante a análise. Baixo, bateria e demais instrumentos contribuem com envelopes independentes, com ataques reais da bateria e release temporal controlado; a posição horizontal deixa de ser uma régua simples grave → agudo;
- fallback: FFT ao vivo reorganizado em torno do centro enquanto não houver sidecar;
- reduced_motion: não remove a informação do áudio; apenas evita movimento decorativo externo;
- must_not_invent: instrumento nominal por barra, pulso global, batida sintética, boost fixo de voz ou movimento sem sinal;
- ready_for_frontend: yes;
- approved_by: Cassiano;
- artifact_ref: `docs/work/06-radio-engine.md#visualizador-musical-aprovado-em-02102026`.

Implementação: branch `feat/musical-visualizer-analysis`. O pipeline final é `pnpm visualizer:sync`, sem seleção manual de faixa. O R2 continua definindo o catálogo canônico, mas o áudio para análise vem da pasta local Artesopolis configurada por `RADIO_LOCAL_AUDIO_DIR` ou passada uma vez ao comando. Antes do processamento, o lote reconcilia as 343 entradas do R2 com os arquivos locais e exige correspondência de tamanho, recusando faltas, duplicidades ambíguas ou divergências. Ele compara cada faixa com o sidecar remoto por ETag/tamanho/configuração, prepara automaticamente o ambiente Python na primeira execução e processa somente o que estiver pendente. O modelo `htdemucs` permanece carregado para o lote. O stem vocal ocupa o centro; os stems não vocais deixam de ser somados antes da análise. Baixo e bateria mantêm envelopes próprios, enquanto todos os demais stems continuam contribuindo no campo harmônico/melódico. O v2 remove o flux por banda que deixava o acompanhamento frenético e usa ataques reais da bateria com release controlado, preservando também diferenças estéreo entre esquerda e direita. Cada sidecar pronto é publicado imediatamente em `_analysis/v2/<sha256-do-track-id>.json`; nenhuma música é baixada do R2. Se o processo for interrompido, uma nova execução pula tudo que já estiver atual no R2 e continua das pendentes. O browser usa o `currentTime` do mesmo `HTMLAudioElement` para interpolar os quadros; até um sidecar existir, permanece o fallback ao vivo.

O PR #17 representa a tentativa anterior de calibrar o espectro tradicional e não deve ser tratado como solução final deste requisito.
