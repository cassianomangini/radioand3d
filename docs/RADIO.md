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

Rádio completa: no desktop fica acoplada à composição e pode ser redimensionada/expandida; no mobile abre sob demanda. Contém a lista única **A seguir**, busca simples entre as faixas ainda programadas, seleção direta, posição/duração, seek e volume quando suportado. Ao abrir o site, a playlist nasce em ordem aleatória, sem repetição automática. O transporte mostra Nova ordem, Repetir faixa, Anterior, Play/Pausa, Próxima, Volume e Coração nessa ordem. Nova ordem tem tooltip; Repetir faixa fica iluminado quando ativo. Tocar uma faixa atualiza imediatamente qualquer superfície visível; o estado tocando só aparece após confirmação do motor.

O botão de volume fica depois de Próxima no transporte, abre um slider e uma ação de mudo. Ao sair do mudo, restaura o último volume audível; mover o slider para acima de zero também reativa o som. Desktop e Rádio completa mobile compartilham o mesmo volume do motor. Fechar o controle não altera o volume nem a reprodução.

A lista **A seguir** tem rolagem própria e mostra todas as entradas ainda programadas na ordem decidida pelo controller; as dez primeiras são sempre as próximas dez quando existem. Atualiza após avanço e seleção manual. Quando a fila acaba, a lista fica vazia e a reprodução para. A UI não inventa títulos nem repete itens só para preencher a lista. A rolagem não desloca os controles ou a Rádio inteira.

Na Rádio completa, o título **A seguir** e o campo de busca ocupam a mesma linha. Não exibir contador de faixas; o espaço inicial da lista deve comportar três músicas completas em alturas de tela comuns, preservando rolagem para as demais.

Com **Repetir faixa** ligado, a faixa atual aparece como próxima e volta a tocar ao terminar. O botão **Próxima faixa** avança para uma entrada ainda não percorrida quando existe. Desligar a repetição restaura a sequência restante.

Busca e seleção manual pertencem à V1. Skins, visualizadores adicionais, painel de histórico, favoritos e equalização sonora avançada são evoluções. O histórico mínimo para o botão anterior faz parte do motor inicial.

## Regras propostas da fila

Validar estes padrões operacionais na entrega 01:

- A abertura cria uma ordem aleatória para as entradas elegíveis. A mesma ordem é usada na renderização inicial e pela fila do navegador, sem discrepância entre a lista e o botão próxima.
- Selecionar uma faixa toca a versão escolhida e preserva o conjunto das entradas ainda não percorridas. Uma seleção explícita pode revisitar uma faixa; os avanços automáticos não a reinserem.
- Digitar uma busca filtra somente a apresentação da lista **A seguir**, sem alterar a fila em execução. Selecionar uma faixa reorganiza as próximas entre as entradas ainda não percorridas.
- O controller fornece à interface a ordem futura já decidida. Mostrar a lista não pode sortear uma sequência diferente da usada pelo botão próxima ou pelo término natural.
- Cada entrada toca no máximo uma vez por avanço automático enquanto **Repetir faixa** está desligado. Ao terminar a playlist, a reprodução para. Repetir faixa, anterior e seleção direta são ações explícitas e podem revisitar uma entrada.
- **Nova ordem** reinicia a playlist com todas as entradas elegíveis em outra sequência aleatória, limpa o histórico e desliga Repetir faixa. Se a Rádio estava tocando, passa a tocar a primeira música da nova ordem; se estava pausada, a nova primeira música fica pronta sem autoplay.
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

Proposta inicial: `AnalyserNode` nativo para dados de frequência e tempo. A API não desenha nem calibra o visualizador automaticamente: definir bandas, escala, suavização e limites, e testar. Ela analisa sem alterar o som: [MDN](https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode).

O sinal deve percorrer fonte → `AnalyserNode` → saída no grafo único. O renderer só anuncia barras reativas depois que o analisador estiver disponível e a reprodução for confirmada. Pausa e indisponibilidade voltam as barras à linha de base sem prometer movimento inexistente.

Meyda, suavização e renderização imperativa não são proibidos por princípio. Reutilizar somente quando houver função justificada, fronteiras limpas e testes. DOM refs ou canvas podem existir no renderer, nunca como contrato do provider de reprodução. Não disparar renderizações da página inteira a cada frame.

Pausar o loop quando a visualização não estiver ativa ou a aba estiver oculta; não parar a música por isso. As barras representam dados do áudio, inclusive quando o navegador reduz animações decorativas. Tolerar falha de canvas/análise sem derrubar reprodução. Testar silêncio e sinal conhecido para evitar barras que pulam sem correspondência ao áudio. Equalizador que modifica frequências é outro recurso, fora do marco inicial.

Cada barra deve derivar somente da energia da própria faixa de frequência. O renderer pode aplicar escala visual e attack/release por barra, mas não deve injetar envelope RMS global, pulso compartilhado entre bandas, boost fixo de "voz" ou movimento sintético para fazer o espectro parecer mais animado. Faixas constantes devem estabilizar; mudanças em uma região do espectro não podem levantar regiões sem energia correspondente.

## Letras sincronizadas

A letra canônica continua sendo a fonte editorial. A sincronização é um derivado pré-calculado fora do navegador: áudio + letra canônica passam por alinhamento temporal e geram timestamps por linha e palavra. A transcrição automática serve apenas como evidência de tempo; ela não substitui nem reescreve a letra exibida.

O player usa a posição do mesmo motor de áudio já existente para selecionar linha e palavra ativas. Não existe segundo elemento de áudio nem IA durante a reprodução. O derivado guarda hash da letra de origem; se a letra mudar, a API descarta timestamps obsoletos e mantém o fallback para texto simples até nova geração. Alinhamentos com cobertura insuficiente devem ser recusados em vez de publicados como sincronização aparentemente correta. Detalhes operacionais ficam no [checklist 06b](work/06b-synced-lyrics.md).

## Aceite da rádio

Testar zero, uma e várias faixas; início aleatório em novas aberturas; ordem anunciada igual aos avanços; término sem repetição; seleção manual; histórico; seek; pausa; erro real; bloqueio do navegador; cliques rápidos; capa/título ausentes; volume e mudo conforme suporte. Redimensionar/expandir a Rádio no desktop, abrir/fechar a Rádio completa no mobile e navegar entre duas rotas repetidamente sem recriar áudio, duplicar som ou perder posição.

Validar com mídia real, storage e CORS do ambiente, não apenas mocks. Automação testa estados; escuta e navegador real verificam som e continuidade. Registrar resultados separados para desktop e mobile. Fallback visual não pode interromper a música.
