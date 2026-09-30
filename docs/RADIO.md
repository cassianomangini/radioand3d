# Contrato da CM Radio

## Uma reprodução, superfícies responsivas

Existe um único motor e uma única fila por instância da aplicação no navegador.

- **Desktop:** a interface visível é a Rádio completa/acoplada. Não existe mini player adicional no rodapé.
- **Mobile:** existe mini player persistente logo abaixo do header; a Rádio completa abre sob demanda.

Trocar entre estados de largura da Rádio, abrir a Rádio completa no mobile ou navegar internamente preserva versão da faixa, posição, volume e modos. Nenhuma interface cria outro elemento de áudio.

Isso cobre navegação interna, não continuidade sonora durante refresh, fechamento do navegador ou entre dispositivos. Recuperação de preferências após recarga é uma melhoria separada; não prometer autoplay. Controles de sistema e reprodução em segundo plano dependem de suporte e testes reais.

## Interfaces da primeira versão

Mini player **mobile**: faixa/capa ou fallback CM, play/pause, anterior/próxima, indicação de progresso e ação de abrir a Rádio completa. Volume, biblioteca e controles adicionais ficam na Rádio completa quando faltar espaço.

Rádio completa: no desktop fica acoplada à composição e pode ser redimensionada/expandida; no mobile abre sob demanda. Contém biblioteca publicada, busca simples por título, seleção direta, playlist/fila atual, posição/duração, seek, volume quando suportado, shuffle e repetição. Tocar uma faixa atualiza imediatamente qualquer superfície visível; o estado tocando só aparece após confirmação do motor.

A lista da fila tem rolagem própria e acompanha a sequência decidida pelo controller. Exibe pelo menos as próximas dez ocorrências quando a fila oferece essa quantidade, atualizando após avanço, seleção e mudanças de shuffle/repetição. Com `repeat: off`, uma fila que termina antes disso mostra somente as próximas reais. Repetições previstas pelo modo ativo podem aparecer; a UI não inventa títulos nem repete itens só para preencher a lista. A rolagem não desloca os controles ou a Rádio inteira.

Busca e seleção manual pertencem à V1. Skins, visualizadores adicionais, painel de histórico, favoritos e equalização sonora avançada são evoluções. O histórico mínimo para o botão anterior faz parte do motor inicial.

## Regras propostas da fila

Validar estes padrões operacionais na entrega 01:

- Selecionar uma faixa toca a versão escolhida, mantendo a preferência de shuffle. O contexto de seleção, biblioteca ou playlist, define a sequência a partir de IDs estáveis.
- Digitar uma busca ou mudar a ordenação visual não altera a fila em execução. Uma nova ação de tocar pode criar uma nova fila a partir do contexto exibido.
- Shuffle desligado segue a ordem da fila. Ligado percorre candidatos sem reposição antes de iniciar novo ciclo; respeita o modo de repetição.
- O controller fornece à interface a ordem futura já decidida, inclusive no shuffle; mostrar a fila não pode sortear uma sequência diferente da usada pelo botão próxima ou pelo término natural.
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

Testar zero, uma e várias faixas; seleção com shuffle ligado/desligado; término em cada modo; histórico; seek; pausa; erro real; bloqueio do navegador; cliques rápidos; capa/título ausentes; volume conforme suporte. Redimensionar/expandir a Rádio no desktop, abrir/fechar a Rádio completa no mobile e navegar entre duas rotas repetidamente sem recriar áudio, duplicar som ou perder posição.

Validar com mídia real, storage e CORS do ambiente, não apenas mocks. Automação testa estados; escuta e navegador real verificam som e continuidade. Registrar resultados separados para desktop e mobile. Fallback visual não pode interromper a música.
