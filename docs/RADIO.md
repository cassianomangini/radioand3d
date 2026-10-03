# Contrato da CM Radio

## Uma reprodução, superfícies responsivas

Existe um único motor e uma única fila por instância da aplicação no navegador.

- **Desktop:** a interface visível é a Rádio completa/acoplada. Não existe mini player adicional no rodapé.
- **Mobile:** existe mini player persistente logo abaixo do header; a Rádio completa abre sob demanda.

Trocar entre estados de largura da Rádio, abrir a Rádio completa no mobile ou navegar internamente preserva versão da faixa, posição, volume e modos. Nenhuma interface cria outro elemento de áudio.

No desktop, a divisória entre Estúdio e Rádio continua ajustando a largura lateral. Ao arrastá-la além da largura máxima para a esquerda, a Rádio avança proporcionalmente sobre o Estúdio; ao chegar ao limite esquerdo e soltar, ocupa a tela inteira. O link Rádio abre esse mesmo estado; o controle de fechar retorna ao layout dividido. Um arraste incompleto retorna à largura lateral. O mobile mantém a Rádio de tela inteira acessível pelo menu e pelo mini player.

Isso cobre navegação interna, não continuidade sonora durante refresh, fechamento do navegador ou entre dispositivos. Recuperação de preferências após recarga é uma melhoria separada; não prometer autoplay. Controles de sistema e reprodução em segundo plano dependem de suporte e testes reais.

## Interfaces da primeira versão

Mini player **mobile**: faixa/capa ou fallback CM, play/pause, anterior/próxima, barras ligadas ao mesmo analisador, indicação de progresso e ação de abrir a Rádio completa. Volume, fila completa e controles adicionais ficam na Rádio completa quando faltar espaço.

Rádio completa: no desktop fica acoplada à composição e pode ser redimensionada/expandida; no mobile abre sob demanda. Contém a lista única **A seguir**, busca simples entre as faixas dessa lista, seleção direta, posição/duração, seek e volume quando suportado. Ao abrir o site, a playlist nasce em ordem aleatória, sem repetição automática. O transporte mostra Nova ordem, Repetir faixa, Anterior, Play/Pausa, Próxima, Volume e Coração nessa ordem. Nova ordem tem tooltip; Repetir faixa fica iluminado quando ativo. Tocar uma faixa atualiza imediatamente qualquer superfície visível; o estado tocando só aparece após confirmação do motor.

O botão de volume fica depois de Próxima no transporte, abre um slider e uma ação de mudo. Ao sair do mudo, restaura o último volume audível; mover o slider para acima de zero também reativa o som. Desktop e Rádio completa mobile compartilham o mesmo volume do motor. Fechar o controle não altera o volume nem a reprodução.

A lista **A seguir** tem rolagem própria. Em ordem aleatória, mostra primeiro as entradas ainda não ouvidas neste ciclo, na ordem decidida pelo controller, e em seguida as já ouvidas, no fim da fila, na ordem em que deixaram a reprodução. As dez primeiras ainda não ouvidas são sempre as próximas dez quando existem. A lista atualiza após avanço e seleção manual. Quando não restam entradas novas, a reprodução para e as já ouvidas continuam na lista para uma escolha explícita. A UI não inventa títulos nem repete itens só para preencher a lista. A rolagem não desloca os controles ou a Rádio inteira.

Na Rádio completa, o título **A seguir** e o campo de busca ocupam a mesma linha. Não exibir contador de faixas; o espaço inicial da lista deve comportar três músicas completas em alturas de tela comuns, preservando rolagem para as demais.

Com **Repetir faixa** ligado, a faixa atual aparece como próxima e volta a tocar ao terminar. O botão **Próxima faixa** avança para uma entrada ainda não percorrida quando existe. Desligar a repetição restaura a sequência restante.

Busca e seleção manual pertencem à V1. Skins, visualizadores adicionais, painel de histórico, favoritos e equalização sonora avançada são evoluções. O histórico mínimo para o botão anterior faz parte do motor inicial.

## Regras propostas da fila

Validar estes padrões operacionais na entrega 01:

- A abertura cria uma ordem aleatória para as entradas elegíveis. A mesma ordem é usada na renderização inicial e pela fila do navegador, sem discrepância entre a lista e o botão próxima.
- Selecionar uma faixa toca a versão escolhida. As ainda não ouvidas permanecem à frente; a que estava tocando vai para o fim da fila aleatória. Uma seleção explícita pode revisitar uma faixa já ouvida. Os avanços automáticos não a recolocam entre as próximas.
- Digitar uma busca filtra somente a apresentação da lista **A seguir**, sem alterar a fila em execução. Selecionar uma faixa reorganiza as próximas ainda não ouvidas e mantém as já ouvidas no fim.
- O controller fornece à interface a ordem já decidida. Enquanto houver faixa ainda não ouvida, o começo da lista coincide com o botão próxima e com o término natural. As já ouvidas ficam depois dessa sequência e não entram no avanço automático.
- Cada entrada toca no máximo uma vez por avanço automático enquanto **Repetir faixa** está desligado. Ao terminar as entradas novas, a reprodução para. Repetir faixa, anterior e seleção direta são ações explícitas e podem revisitar uma entrada que permanece no fim da fila.
- **Nova ordem** reinicia a playlist com todas as entradas elegíveis em outra sequência aleatória, limpa o histórico, esvazia a fila de já ouvidas e desliga Repetir faixa. Se a Rádio estava tocando, passa a tocar a primeira música da nova ordem; se estava pausada, a nova primeira música fica pronta sem autoplay.
- Anterior reinicia a faixa se já passou de três segundos; senão usa o histórico realmente ouvido. Com fila vazia, controles ficam desabilitados. Uma faixa sozinha termina em `off` e repete somente quando solicitado.
- Ao mudar a biblioteca publicada, preservar a faixa atual quando ainda elegível. Uma versão retirada não pode ser selecionada de novo; tratar item indisponível sem loop infinito.

Faixa, versão publicada e playlist seguem [MUSIC_PIPELINE.md](MUSIC_PIPELINE.md). Não inferir identidade ou versão por regex no motor.

Para a prova com o acervo R2 indicado por Cassiano, o servidor lista todas as páginas do bucket `musicas` e entrega ao motor todas as chaves de áudio, inclusive variantes com `(1)`. A chave do objeto serve como ID estável apenas nesta ponte de leitura; a identidade editorial definitiva pertence à biblioteca. Nomes da pasta local não substituem o inventário do bucket. O endpoint S3 fica no servidor com credencial de leitura; o player usa a URL pública do objeto.

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

O visualizador tem duas camadas. A camada preferencial é uma análise musical offline por faixa; o `AnalyserNode` do navegador permanece como fallback enquanto uma faixa ainda não possui derivado pré-calculado ou quando o sidecar não puder ser carregado.

A análise offline separa voz e acompanhamento antes da publicação. Voz principal e backing vocals alimentam o miolo do campo visual. Todo o acompanhamento restante — bateria, baixo, violão, guitarra, piano, flauta, synth e qualquer outro conteúdo audível — continua sendo analisado em múltiplas bandas; não é necessário adivinhar o nome do instrumento para ele participar. O acompanhamento combina energia espectral, componente harmônico, componente percussivo e ataques/transientes reais. A normalização é feita por banda para impedir que graves dominem permanentemente e que regiões altas desapareçam só por terem menor energia absoluta.

O layout canônico usa voz no centro e acompanhamento ao redor. As bandas instrumentais são dobradas ao redor do miolo em vez de formar uma régua simples grave → agudo da esquerda para a direita. Isso é uma gramática visual, não uma alegação de que determinada barra identifica um instrumento específico. Toda subida de barra deve continuar ligada a energia, harmônico, percussão ou transiente medido no áudio.

O processamento pesado acontece fora do navegador. Cada faixa pode gerar um sidecar versionado com quadros quantizados a aproximadamente 25 Hz. Durante a reprodução, o renderer consulta o `currentTime` do único elemento de áudio, interpola os quadros e desenha as barras sem criar outro relógio ou outra reprodução. O mesmo derivado é reamostrado para a quantidade de barras da Rádio completa ou do mini player.

Quando o sidecar não existir, o fallback ao vivo usa `AnalyserNode` no grafo único fonte → analisador → saída. O fallback reorganiza o espectro em torno de um miolo de presença média e dobra as demais bandas nas laterais para evitar a antiga rampa visual concentrada à esquerda, mas não deve ser apresentado como separação real de voz/instrumentos.

Pausar o loop quando a visualização não estiver ativa ou a aba estiver oculta; não parar a música por isso. Pausa e indisponibilidade voltam as barras à linha de base. Dados ausentes ou sidecar inválido nunca derrubam a reprodução. Não disparar renderizações da página inteira a cada frame.

Movimento sintético continua proibido: sem metrônomo inventado, pulso global compartilhado, boost fixo de "voz" ou barras subindo sem evidência no sinal. Equalização que altera o som é outro recurso e permanece fora deste marco.

## Letras sincronizadas

A letra canônica continua sendo a fonte editorial. A sincronização é um derivado pré-calculado fora do navegador: áudio + letra canônica passam por alinhamento temporal e geram timestamps por linha e palavra. A transcrição automática serve apenas como evidência de tempo; ela não substitui nem reescreve a letra exibida.

O player usa a posição do mesmo motor de áudio já existente para selecionar linha e palavra ativas. Não existe segundo elemento de áudio nem IA durante a reprodução. O derivado guarda hash da letra de origem; se a letra mudar, a API descarta timestamps obsoletos e mantém o fallback para texto simples até nova geração. Alinhamentos com cobertura insuficiente devem ser recusados em vez de publicados como sincronização aparentemente correta. Detalhes operacionais ficam no [checklist 06b](work/06b-synced-lyrics.md).

## Aceite da rádio

Testar zero, uma e várias faixas; início aleatório em novas aberturas; ordem anunciada igual aos avanços; término sem repetição; seleção manual; histórico; seek; pausa; erro real; bloqueio do navegador; cliques rápidos; capa/título ausentes; volume e mudo conforme suporte. Redimensionar/expandir a Rádio no desktop, abrir/fechar a Rádio completa no mobile e navegar entre duas rotas repetidamente sem recriar áudio, duplicar som ou perder posição.

Validar com mídia real, storage e CORS do ambiente, não apenas mocks. Automação testa estados; escuta e navegador real verificam som e continuidade. Registrar resultados separados para desktop e mobile. Fallback visual não pode interromper a música.
