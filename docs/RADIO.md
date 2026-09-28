# Contrato da CM Radio

## Uma reprodução, duas interfaces

Mini player e player grande compartilham um motor e uma fila por instância da aplicação no navegador. Abrir, recolher ou navegar internamente preserva versão da faixa, posição, volume e modos. Nenhuma interface cria outro elemento de áudio.

Isso cobre navegação interna, não continuidade sonora durante refresh, fechamento do navegador ou entre dispositivos. Recuperação de preferências após recarga é uma melhoria separada; não prometer autoplay. Controles de sistema e reprodução em segundo plano dependem de suporte e testes reais.

## Interfaces da primeira versão

Mini player: faixa/capa ou fallback CM, play/pause, anterior/próxima, indicação de progresso e shuffle, ação de expandir. Volume e outros controles podem ficar no expandido quando faltar espaço no mobile.

Player grande: biblioteca publicada, busca simples por título, seleção direta, playlist/fila atual, posição/duração, seek, volume quando suportado, shuffle e repetição. Tocar uma faixa atualiza imediatamente a seleção nas duas interfaces; o estado tocando só aparece após confirmação do motor.

Busca e seleção manual pertencem à V1. Skins, visualizadores adicionais, painel de histórico, favoritos e equalização sonora avançada são evoluções. O histórico mínimo para o botão anterior faz parte do motor inicial.

## Regras propostas da fila

Validar estes padrões operacionais na entrega 01:

- Selecionar uma faixa toca a versão escolhida, mantendo a preferência de shuffle. O contexto de seleção, biblioteca ou playlist, define a sequência a partir de IDs estáveis.
- Digitar uma busca ou mudar a ordenação visual não altera a fila em execução. Uma nova ação de tocar pode criar uma nova fila a partir do contexto exibido.
- Shuffle desligado segue a ordem da fila. Ligado percorre candidatos sem reposição antes de iniciar novo ciclo; respeita o modo de repetição.
- `repeat` aceita `off`, `all` e `one`. O término natural respeita o modo; próxima/anterior explícitos continuam sendo ações do usuário, mesmo em `one`.
- Anterior reinicia a faixa se já passou de três segundos; senão usa o histórico realmente ouvido. Com fila vazia, controles ficam desabilitados. Uma faixa sozinha termina em `off` e repete somente quando solicitado.
- Ao mudar a biblioteca publicada, preservar a faixa atual quando ainda elegível. Uma versão retirada não pode ser selecionada de novo; tratar item indisponível sem loop infinito.

Faixa, versão publicada e playlist seguem [MUSIC_PIPELINE.md](MUSIC_PIPELINE.md). Não inferir identidade ou versão por regex no motor.

## Separação técnica

| Parte | Responsabilidade | Não deve conhecer |
| --- | --- | --- |
| Playback engine | Elemento de áudio, fonte, play/pause, seek, volume e eventos | Componentes, cores, barras e banco de dados |
| Queue/controller | IDs, ordem, shuffle, repeat, histórico e decisões de avanço | DOM e fórmulas de visualização |
| Audio graph/analyzer | Contexto e dados de frequência/tempo | Ref de botão ou posição de painel |
| Renderer | Traduzir dados em barras/waveform e controlar seu ciclo visual | Regras de publicação e escolha de faixa |
| UI CM | Composição, ações acessíveis e estado apresentado | Credenciais e acesso interno ao storage |

O controller decide qual faixa vem depois; o engine apenas carrega a fonte escolhida. Evitar dois donos para anterior/próxima.

## Estados e falhas

Modelar `idle`, `loading`, `playing`, `paused`, `buffering`, `ended`, `blocked` e `error` a partir dos eventos e promessas reais. Não confundir a intenção de tocar com reprodução confirmada.

`NotAllowedError` solicita interação e preserva a faixa; não a classifica como arquivo defeituoso. Uma interrupção por troca rápida não dispara recuperação de outra faixa. Erros reais de rede/formato devem ter tentativas limitadas e mensagem acionável. Se todos os candidatos falharem, parar e oferecer nova tentativa. Referência: [HTMLMediaElement.play](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/play).

Trocas rápidas precisam ignorar resultados antigos. Recarregar a lista ou metadados da mesma versão não deve recriar `src` e interromper o som. Criar o grafo uma vez por elemento; limpar listeners, recursos e animações quando o motor for realmente encerrado. Verificar também montagem/desmontagem de desenvolvimento.

## Visualizador

Proposta inicial: `AnalyserNode` nativo para dados de frequência e tempo. A API não desenha nem calibra o visualizador automaticamente: definir bandas, escala, suavização e limites, e testar. Ela analisa sem alterar o som: [MDN](https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode).

Meyda, suavização e renderização imperativa não são proibidos por princípio. Reutilizar somente quando houver função justificada, fronteiras limpas e testes. DOM refs ou canvas podem existir no renderer, nunca como contrato do provider de reprodução. Não disparar renderizações da página inteira a cada frame.

Pausar loops quando não houver visualização ativa, aba visível ou movimento permitido; não parar a música por isso. Tolerar falha de canvas/análise sem derrubar reprodução. Testar silêncio e sinal conhecido para evitar barras que pulam sem correspondência ao áudio. Equalizador que modifica frequências é outro recurso, fora do marco inicial.

## Aceite da rádio

Testar zero, uma e várias faixas; seleção com shuffle ligado/desligado; término em cada modo; histórico; seek; pausa; erro real; bloqueio do navegador; cliques rápidos; capa/título ausentes; volume conforme suporte. Abrir/recolher e navegar entre duas rotas repetidamente sem recriar áudio, duplicar som ou perder posição.

Validar com mídia real, storage e CORS do ambiente, não apenas mocks. Automação testa estados; escuta e navegador real verificam som e continuidade. Registrar resultados separados para desktop e mobile. Fallback visual não pode interromper a música.
