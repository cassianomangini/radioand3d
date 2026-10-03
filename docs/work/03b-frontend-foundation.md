# Entrega 03b: base visual compartilhada Estúdio + Rádio

## Objetivo

Implementar a primeira superfície real a partir do pacote visual aprovado por Cassiano, sem reabrir composição no código.

Artefato aprovado: `docs/design/STUDIO_RADIO_APPROVAL_PACKAGE_V1.md`.

## Escopo deste PR

- [x] Registrar `ready_for_frontend: yes` e `approved_by: Cassiano`.
- [x] Promover tokens CM aprovados para `src/styles/tokens.css`.
- [x] Aplicar Manrope + IBM Plex Mono no layout.
- [x] Substituir a tela de bootstrap pela Home do Estúdio + Rádio.
- [x] Desktop sem mini player.
- [x] Rádio desktop acoplada à direita.
- [x] Resize por pointer e teclado.
- [x] Botão expandir/recolher.
- [x] Mobile com header -> mini player -> Estúdio.
- [x] Rádio completa mobile em superfície dedicada.
- [x] Usar somente a faixa real de referência `Limite Elástico`, identificada como prévia.
- [x] Usar placeholder editorial para mídia 3D ainda não publicada.
- [x] Não criar produtos, materiais ou categorias fictícios.
- [x] CI: lint.
- [x] CI: typecheck.
- [x] CI: build.
- [x] Render real em 1440 px.
- [ ] Render real com Rádio expandida.
- [x] Render real em ~390 px.
- [ ] Revisão visual independente/Cassiano.

## Limite desta entrega

O transporte da Rádio neste PR demonstra estado visual. O motor de áudio, biblioteca real, storage e visualizador conectado ao áudio pertencem às entregas 04/06/07.

A Home continua `noindex` enquanto o marco integrado não estiver pronto.

## Aceite

Não considerar esta entrega concluída apenas por CI verde. O merge visual exige validação do frontend por Cassiano.

`experience_review_status: incomplete`

`reviewed_by: implementação + captura automatizada; aguardando Cassiano/independente`


## Revisão humana de 29/09/2026

Cassiano revisou o front real em desktop e encontrou dois defeitos de fidelidade/implementação:

- a CM Rádio lateral não cabia inteira na altura útil e exigia scroll do painel;
- a navegação desktop ficou deslocada para a extrema direita, deixando a navbar visualmente desequilibrada.

Correção aberta em `fix/desktop-radio-fit-navbar`:

- [x] centralizar a navegação desktop dentro da navbar;
- [x] remover scroll do painel lateral da Rádio;
- [x] adaptar capa, gaps, controles e visualizador à altura útil do viewport;
- [x] manter eventual overflow futuro restrito à lista de faixas, não ao player inteiro;
- [x] validar captura desktop em altura curta próxima ao caso reportado (1760x824);
- [ ] receber nova revisão de Cassiano.

`experience_review_status: changes_required`

`reviewed_by: Cassiano`

## Ajuste de fidelidade da Rádio em 29/09/2026

Cassiano apontou o mockup da Rádio como alvo visual e confirmou que ela pode ocupar a tela inteira desde o topo, permanecendo parada enquanto o Estúdio rola.

- [x] mover o header do Estúdio para somente a coluna esquerda;
- [x] fixar a Rádio no topo com altura de viewport;
- [x] limitar a rolagem interna à lista de faixas;
- [x] refazer capa de prévia, controles, visualizador, abas, busca e linha da faixa segundo o mockup;
- [x] abrir a Rádio mobile em superfície de tela inteira;
- [x] manter apenas `Limite Elástico` como faixa real de referência e identificar arte/reprodução como prévia;
- [x] validar render em 1440 × 824, Rádio expandida e 390 × 844;
- [x] validar visualmente a Rádio fixa após rolar o Estúdio;
- [x] lint, typecheck e build;
- [ ] receber revisão visual de Cassiano para o ajuste.

Autorrevisão por captura Playwright. A arte de prévia foi gerada para esta interface; não é capa oficial da faixa. O motor de áudio, biblioteca real e análise sincronizada continuam nas entregas próprias.

Capturas: [desktop](evidence/03b-radio-desktop.png), [expandida](evidence/03b-radio-expanded.png), [após rolar o Estúdio](evidence/03b-radio-scroll.png), [mobile](evidence/03b-radio-mobile.png).

`experience_review_status: changes_required`

`reviewed_by: implementação + captura automatizada; aguardando Cassiano`

## Revisão da estrutura do Estúdio em 29/09/2026

Cassiano forneceu o logo CM 3D and Radio e rejeitou a estrutura anterior do Estúdio: fundo azulado, CTA preenchido, texto sem acento, placeholder grande e faixa de separação entre Estúdio e Rádio. Pediu também o logo menor na navbar e apontou o puxador/duas linhas do divisor como defeito.

- [x] incorporar o arquivo exato do logo fornecido, sem recriá-lo;
- [x] usar logo pequeno na navbar e logo de escala moderada na abertura;
- [x] centralizar “ESTÚDIO DE IMPRESSÃO 3D & MÚSICAS” logo abaixo da imagem;
- [x] usar “ESTÚDIO 3D” e substituir o lead pelo texto fornecido por Cassiano;
- [x] refazer o hero sem card grande de mídia provisória;
- [x] usar fundo quase preto, acento azul/violeta no título e CTA contornado;
- [x] remover a faixa visual e manter somente a borda fina da Rádio;
- [x] manter a área de arraste transparente, com resize por pointer e teclado verificados;
- [x] revisar render desktop padrão, expandido e mobile;
- [x] remover somente os blocos inferiores “O ESTÚDIO” e “PRÓXIMAS ENTRADAS” da home;
- [x] restaurar o botão “Conheça mais sobre” e o item “Sobre” visíveis, desativados até existir a página do Estúdio;
- [ ] receber aprovação visual de Cassiano para esta revisão.

Capturas desta revisão: [desktop](evidence/03b-studio-desktop-v2.png), [expandida](evidence/03b-studio-expanded-v2.png), [mobile](evidence/03b-studio-mobile-v2.png). Autorrevisão, sem aprovação visual presumida.

Após a correção, a home foi conferida em [1440 × 824](evidence/03b-home-cleanup-desktop.png) e [390 × 844](evidence/03b-home-cleanup-mobile.png). O botão “Conheça mais sobre” aparece nas duas larguras; os dois blocos removidos não aparecem. O menu mobile mostra “Sobre” desativado. `pnpm lint` e `pnpm typecheck` passaram. Autorrevisão, sem nova aprovação visual presumida.

`experience_review_status: changes_required`

`reviewed_by: implementação + captura automatizada; aguardando Cassiano`

## Imagem escolhida para a Rádio em 29/09/2026

Cassiano identificou `output/dj2.png` como a imagem correta para a Rádio e pediu a retirada do logo CM 3D and Radio sobreposto à capa. A cópia em `public/images/cm-radio-preview-art.png` substitui a arte anterior na capa de prévia e nas miniaturas. O enquadramento da imagem horizontal foi ajustado para essas superfícies.

- [x] usar o arquivo escolhido sem alterar sua arte;
- [x] remover o logo sobreposto à imagem da Rádio;
- [ ] Cassiano conferir render desktop e mobile com o novo enquadramento.

## Correção de definição das imagens em 29/09/2026

Objetivo: exibir o logo fornecido por Cassiano e a arte `output/dj2.png` com a definição máxima dos arquivos disponíveis. Responsável: CM Frontend. Contratos lidos: `docs/EXPERIENCE.md` e estratégia de mídia em `docs/ARCHITECTURE.md`.

Limite: corrigir somente o carregamento das imagens desta Home; preservar os originais e o enquadramento para revisão. Aceite técnico: o componente aponta diretamente para os PNGs originais no hero, no cabeçalho, na capa e nas miniaturas; lint, tipos e build passam. Cassiano confirma a qualidade visual em desktop e mobile. A definição não pode ultrapassar a do arquivo de origem.

- [x] servir os PNGs originais sem recompressão nem escolha de variante abaixo do tamanho exibido;
- [x] conferir dimensões dos arquivos de origem: logo 1983 × 793 px; Rádio 1813 × 868 px;
- [x] executar lint e typecheck;
- [x] executar build;
- [ ] Cassiano conferir a definição no desktop e mobile.

Evidência técnica: `pnpm lint`, `pnpm typecheck` e `pnpm build` passaram. O HTML estático gerado referencia `/images/cm-3d-radio-logo.png` e `/images/cm-radio-preview-art.png` diretamente, sem `srcset` de variantes processadas. Nenhuma validação visual foi feita nesta correção; a conferência da definição na interface fica com Cassiano.

## Largura e movimento da Rádio em 29/09/2026

Cassiano considerou a barra lateral estreita e pediu que seu layout combine com o restante do site, com botão de expansão dentro dela, animação da expansão e cursor de mão sobre o botão. O ajuste fica restrito ao painel lateral e à expansão.

- [x] ampliar o preset para 480 px em 1440 px e ajustar proporcionalmente até 400 px perto de 1180 px;
- [x] deixar Expandir/Recolher visível no cabeçalho da Rádio;
- [x] animar a mudança de largura por botão e desligar easing durante o arraste;
- [x] mostrar cursor de mão sobre o botão e respeitar movimento reduzido na expansão;
- [x] conferir render em 1440 × 824 nos estados [padrão](evidence/03b-radio-sidebar-default.png) e [expandido](evidence/03b-radio-sidebar-expanded.png);
- [x] conferir a proporção da barra em [1180 × 824](evidence/03b-radio-sidebar-1180.png);
- [x] verificar no navegador cursor `pointer`, transição de 260 ms e largura intermediária durante o recolhimento;
- [x] executar `pnpm check` (lint, typecheck e build);
- [ ] Cassiano conferir render e interação em desktop padrão, expandido e mobile;
- [ ] receber revisão visual de Cassiano.

A nova imagem da Rádio foi conferida também em [390 × 844](evidence/03b-radio-dj2-mobile.png). Estas capturas são autorrevisão; não registram aprovação visual de Cassiano.

## Fila rolável solicitada em 29/09/2026

Objetivo: mostrar na Rádio uma lista com rolagem das próximas dez músicas, sempre na ordem em que tocarão. Responsável: CM Frontend. Contratos lidos: `docs/RADIO.md` e `docs/EXPERIENCE.md`. Base: `fix/radio-mockup-fidelity`, HEAD `39b78c9`; alterações locais existentes no hero e sua imagem devem ser preservadas.

Limite: o recorte 03b contém somente a prévia visual de `Limite Elástico`; ainda não existe motor, fila ou outras faixas autorizadas no repositório. A interface não deve apresentar músicas fictícias como próximas. Aceite: rolagem restrita à lista, dez próximas ocorrências reais quando a fila tiver esse volume, ordem correspondente ao controller e atualização após troca de faixa ou modo. Cassiano valida o resultado visual e a interação.

- [x] conferir base, diff local, contrato e disponibilidade de faixas;
- [x] reservar a barra de rolagem no painel da lista sem rolar o player inteiro;
- [x] identificar pelo menos dez faixas autorizadas e a origem da fila (concluído depois na entrega 06);
- [x] implementar a lista das próximas faixas ligada à ordem de reprodução (concluído depois na entrega 06);
- [x] executar lint, tipos e build;
- [x] revisar diff e confirmar que o ajuste da Rádio preserva as alterações locais do hero;
- [ ] Cassiano verificar a rolagem e a lista com dez faixas em desktop e mobile;
- [ ] registrar validação visual de Cassiano.

Evidência inicial: `rg --files public src` e busca por arquivos de áudio no repositório encontraram somente imagens, sem áudio nem catálogo de faixas. `pnpm check` passou em 29/09/2026. A rolagem ainda não foi conferida no navegador, pois Cassiano reservou para si a validação visual e de interações. A composição do hero já modificada localmente não pertencia a este ajuste. Não houve commit/PR novo naquela sessão.

Cassiano informou depois que o layout da Home está praticamente aprovado e pediu continuidade no layout funcional da Rádio. Isso ainda não é aprovação visual final da Rádio; a prova técnica do motor e do visualizador está no [checklist 06](06-radio-engine.md).

Em 30/09, a origem das faixas deixou de ser pendência: a entrega 06 conectou as 343 músicas do R2. A revisão seguinte passou a mostrar em “A seguir” toda a sequência restante, com as dez próximas no topo. Permanecem pendentes a conferência de rolagem e da ordem da fila por Cassiano em desktop e mobile.

## Volume recolhido no transporte em 30/09/2026

Objetivo: mover o volume para perto do coração, conforme a revisão e a imagem enviadas por Cassiano. Responsável: CM Frontend. Branch: `fix/radio-volume-popover`, baseada em `feat/radio-r2-catalog`. Contratos lidos: `docs/EXPERIENCE.md` e `docs/RADIO.md`. Escopo: botão depois de Próxima, popover de volume e ação de mudo usando o motor compartilhado; remover a barra de volume fixa abaixo do transporte. Não alterar catálogo, arte ou composição do Estúdio.

Aceite: abrir/fechar o controle por botão e Escape, ajustar o slider, silenciar e restaurar o último nível audível; desktop e Rádio completa mobile exibem o mesmo volume. O botão fica depois de Próxima e antes do coração. Cassiano confere posição, uso e aparência em desktop/mobile.

- [x] Conferir branch, diff local, contratos e dependência do motor.
- [x] Registrar objetivo, limites, responsável e aceite antes da implementação.
- [x] Implementar botão, popover acessível, slider e mudo compartilhado.
- [x] Remover a barra de volume fixa e revisar o encaixe responsivo pelo código.
- [x] Executar verificações pertinentes e revisar diff.
- [ ] Receber revisão visual e de interações de Cassiano.

## Playlist aleatória sem repetição em 30/09/2026

Cassiano identificou que os botões nas pontas do transporte (shuffle e repetição) não eram claros e pediu que a Rádio sempre abra em ordem aleatória, sem repetir automaticamente as músicas. Depois pediu explicitamente Repetir faixa e Nova ordem, além de melhorar ícones, layout e hover. Responsável: CM Frontend nesta branch, com ajuste pontual do controller da entrega 06. Contratos lidos: `docs/RADIO.md` e `docs/EXPERIENCE.md`. Limite: manter seleção manual, mostrar a ordem efetiva da fila e usar uma lista única **A seguir**, sem aba Biblioteca. A composição corrigida põe título/artista sobre a arte grande, retira miniatura e selo duplicado e reúne os sete controles na mesma fileira.

Aceite: a primeira faixa e a ordem seguinte variam entre aberturas, a fila anunciada coincide com os avanços, nenhuma entrada toca novamente por avanço automático enquanto Repetir faixa está desligado, e a Rádio para ao final. Ação explícita de selecionar ou voltar a uma faixa pode reproduzi-la novamente. Repetir faixa ativo repete somente a atual; Nova ordem reinicia todas as entradas em outra sequência.

- [x] Registrar objetivo, limites, responsável e aceite antes de mudar a fila.
- [x] Inicializar uma ordem aleatória estável para a renderização da página.
- [x] Impedir repetição automática mesmo após seleção manual.
- [x] Corrigir ícones e hover, ordenar os sete controles na mesma fileira, destacar repetição ativa, dar tooltip a Nova ordem e manter somente **A seguir**.
- [x] Colocar título/artista sobre a arte grande e remover miniatura, selo duplicado e menu de três pontos.
- [x] Testar fila, lint, tipos, build e revisar diff.
- [ ] Receber revisão visual e de interação de Cassiano.

Evidência técnica desta branch: `pnpm lint`, `pnpm typecheck`, `pnpm test` (16 testes) e `pnpm build` passaram. Duas requisições HTTP à Home local responderam 200, exibiram 342 entradas reais em “A seguir” para o catálogo de 343 faixas, sem aba Biblioteca, e produziram ordens diferentes. A aprovação de Cassiano nesta conversa cobre a composição solicitada; ainda falta ele conferir a interface renderizada, os estados de hover e as interações em desktop e mobile com áudio real.

Após ver a fila, Cassiano pediu três linhas completas visíveis no tamanho inicial, título **A seguir** e busca lado a lado e ausência de contador. A branch `fix/radio-volume-popover` implementa esse ajuste; a revisão visual final permanece pendente.

## Revisão do mini player mobile em 01/10/2026

Objetivo: substituir o mini player comprimido da captura enviada por Cassiano por uma superfície mobile legível, com capa, título, controles de transporte e barras ligadas ao áudio. Responsável: CM Frontend. Branch `fix/mobile-mini-player`, baseada em `fix/radio-visualizer-motion` (`b0135ff`). Contratos lidos: `docs/EXPERIENCE.md`, `docs/RADIO.md` e este checklist. Limites: preservar o motor único, a fila, o player completo e a composição desktop; não acrescentar outra fonte de áudio.

Aceite técnico: mini player abaixo do header com faixa legível em 320–390 px, botões de toque confortáveis, barras que usam o mesmo analisador da Rádio completa, progresso visível e ação de abrir a Rádio. Ao abrir o player completo, o mini interrompe apenas o desenho das barras. Cassiano confere o resultado visual e as interações no mobile antes da aprovação final.

- [x] Conferir branch, diff, contrato mobile e código atual.
- [x] Registrar objetivo, limites e critérios.
- [x] Implementar a nova composição e as barras compartilhadas.
- [x] Verificar lint, tipos, testes pertinentes e build; revisar diff.
- [ ] Cassiano conferir visual e interação no Chrome mobile.

Evidência técnica: `pnpm check`, `pnpm test` (21 testes) e `git diff --check` passaram. O mini player exibe 24 barras do mesmo analisador da Rádio, sem novo elemento de áudio; interrompe o desenho ao abrir a Rádio completa. A grade reserva 56–64 px para a capa, 44–52 px para os controles e mantém o título em até duas linhas. Não houve revisão visual ou interação em navegador nesta branch, conforme o pedido de Cassiano para interromper a automação do player.

O [PR #11](https://github.com/cassianomangini/radioand3d/pull/11) foi integrado à `main` em 01/10/2026 por pedido de Cassiano. O merge não substitui a conferência visual e das interações marcada acima.

## Arraste da divisória para abrir a Rádio no desktop em 01/10/2026

Objetivo: mostrar a Rádio avançando sobre o Estúdio enquanto a divisória desktop é arrastada para a esquerda e abrir a Rádio na tela inteira ao chegar ao limite. Responsável: CM Frontend. Branch `feat/desktop-radio-fullscreen-drag`, criada de `main` (`ebc8a4b`) em worktree separado para preservar uma alteração local alheia no menu. Contratos lidos: `docs/EXPERIENCE.md`, `docs/RADIO.md` e este checklist. Limites: preservar o player e a fila únicos, o redimensionamento atual, o menu e o mini player mobile.

Aceite técnico: a prévia acompanha o ponteiro sem renderizar a página a cada quadro; soltar a divisória perto do limite esquerdo abre a Rádio em tela inteira e o link Rádio leva ao mesmo estado. Arraste incompleto ou cancelado retorna à barra lateral. O controle de fechar retorna ao layout dividido. Cassiano aprova aparência e sensação do movimento no desktop.

- [x] Conferir instruções, branch, diff local, contratos e pontos de entrada do gesto.
- [x] Registrar objetivo, limites e critérios antes da implementação.
- [x] Implementar prévia, estado de tela inteira, navegação e testes do limiar.
- [x] Executar verificações pertinentes e revisar diff.
- [ ] Cassiano conferir a interação e o efeito no Chrome desktop.

Evidência técnica: a divisória acompanha o ponteiro depois do limite de largura da barra lateral; o link Rádio e o arraste completo ativam o mesmo painel de tela inteira, com foco no controle de voltar. Arraste incompleto volta à largura lateral. `pnpm check`, `pnpm test` (23 testes) e `git diff --check` passaram. Não houve revisão visual nem teste de interação em navegador pelo agente, conforme a instrução de Cassiano para trabalhar no código.

## Novo hero do Estúdio em 01/10/2026

Objetivo: aplicar `x1_fundo.png` enviado por Cassiano e reproduzir texto, alinhamento e cores do mock `Captura de tela 2026-10-01 181141.png`. Responsável: CM Frontend. Branch `feat/studio-hero-mock`. Contrato lido: `docs/EXPERIENCE.md`. Limites: somente o hero; preservar a Rádio e as alterações locais alheias. Aceite: arte original no fundo, copy exata do mock, alinhamento à esquerda, título branco com “forma.” em ciano/violeta e botão contornado no mesmo gradiente. O botão permanece desativado até a página do Estúdio existir. Cassiano confere o render desktop e mobile.

- [x] Conferir branch, diff local, imagens e contrato.
- [ ] Aplicar imagem, texto e estilos do mock.
- [x] Em 02/10/2026, trocar o fundo do Estúdio para `x1_fundo_2.png`, cópia exata do PNG enviado.
- [ ] Executar lint, typecheck e revisar diff.
- [ ] Cassiano conferir o resultado visual.

## Retomada da transformação da Rádio — C1, 03/10/2026

Responsável: CM Frontend. Base de código revisada: `origin/main` `62c2779`. Contratos lidos: [Experiência](../EXPERIENCE.md), [Rádio](../RADIO.md) e [plano de movimento](../design/CM_MOTION_EXPERIENCE_PLAN_V1.md). A fila e o estado de C1–C8 ficam no [roadmap](../ROADMAP.md). A revisão documental ocorreu em `docs/motion-sequence`; nenhuma mudança de interface foi feita nesta retomada.

Objetivo observável: ao sair da Rádio acoplada, passar pelo focus workstation e abrir a tela grande, Cassiano consegue ver uma recomposição expressiva da arte, faixa atual, visualizador, controles e fila, com retorno coerente ao split. O áudio, a fila, a posição e o volume continuam os mesmos. O botão/link e o arraste devem convergir para o mesmo estado. A prova precisa ocorrer no HEAD atualizado que contém a transição. O Estúdio `/studio`, letras e microefeitos isolados não substituem esse resultado.

Limites: não modificar o título do Estúdio nesta frente; não publicar mídia nem concluir C2–C7 como compensação. A revisão visual e das interações pertence a Cassiano. Código e testes automáticos podem apoiar a correção, mas não demonstram a percepção do movimento.

- [x] Conferir branch, HEAD, diff local e seis commits adicionais de `origin/main`. O checkout principal recebeu um `pull` externo durante a revisão e terminou em `62c2779`, sem diff local; a branch documental não modificou seu código.
- [x] Conferir no código `62c2779` a medição dos elementos reais, a animação FLIP/WAAPI e o caminho inverso; consultar o [inventário técnico](../design/CM_MOTION_IMPLEMENTATION_LOG_2026-10-03.md).
- [ ] Identificar o HEAD servido pelo localhost usado na comparação; confirmar que contém `62c2779` antes de atribuir o resultado à transição atual.
- [ ] Cassiano verificar em desktop a Rádio acoplada, focus, tela inteira e retorno, tanto pelo controle/link quanto pelo arraste, com música tocando.
- [ ] Registrar quais elementos ganharam presença e detalhe e quais continuam parecendo uma barra lateral ampliada; corrigir os defeitos observados dentro de C1.
- [ ] Após cada correção, verificar interrupção/reversão, continuidade do áudio, teclado, movimento reduzido e verificações de código pertinentes.
- [ ] Registrar a avaliação perceptiva de Cassiano e somente então avançar a fila no roadmap.

| Critério | Evidência disponível nesta retomada | Limite |
| --- | --- | --- |
| Elementos animados entre as composições | Leitura estática de `collectRadioFlipSnapshot`/`animateRadioFlip` e commit `62c2779` | O código não prova que a transformação é visível ou convincente. |
| Verificações anteriores | [Inventário técnico de 03/10](../design/CM_MOTION_IMPLEMENTATION_LOG_2026-10-03.md) relata lint, tipos, testes, build e capturas | Não foram reexecutadas nesta mudança documental. |
| Percepção do efeito | Cassiano informou em 03/10 que ainda não vê a mudança grande prometida | Requer comparação no HEAD servido e correção guiada pelo que ele observar. |

Retomada exata: conferir o HEAD do servidor local e fazer a revisão de C1 na versão atualizada; anotar o primeiro defeito perceptivo da passagem split → focus → tela inteira e corrigi-lo antes de seguir para C2. A edição local vista na inspeção inicial deixou de aparecer no checkout principal após o `pull` externo; confirmar com seu responsável se ela ainda era necessária.

## Ajustes da Rádio pedidos em 03/10/2026

Responsável: CM Frontend. Contrato lido: [Rádio](../RADIO.md). Objetivo: corrigir o formato dos controles no Full e permitir alternar o espaço entre playlist e letra com ação de fechar. A playlist abre embaralhada e mantém a ordem durante a reprodução. Cassiano corrigiu o aceite do botão Embaralhar: ele também deve trocar a faixa atual, respeitando o estado tocando/pausado. Os ícones de Embaralhar e Repetir faixa devem comunicar melhor cada ação. Limites: preservar arquivos de mídia, Estúdio e alterações locais existentes. Aceite pendente de Cassiano: controles compactos e circulares no mobile, playlist com mais espaço por padrão, letra que abre e fecha, troca imediata de faixa ao embaralhar e ícones claros. Na correção anterior, Cassiano pediu que não fossem executados testes nem aberto o navegador; nesta revisão, os 15 testes da fila e os 65 testes gerais passaram, assim como lint, typecheck, build e `git diff --check`. A validação visual e das interações continua com Cassiano.

## Seta da divisória desktop em 03/10/2026

Responsável: CM Frontend. Contratos lidos: [Experiência](../EXPERIENCE.md) e [Rádio](../RADIO.md). Objetivo: fazer a seta piscante indicar o arraste assim que Cassiano pressiona a divisória, integrada à barra. Limites: preservar o redimensionamento, os estados de expansão/tela inteira e o comportamento mobile. Aceite: a seta aparece dentro da largura da barra, alterna azul e rosa sem círculo ciano, acompanha a divisória durante o arraste e some ao soltar ou entrar em tela inteira; um clique sem arrastar continua expandindo/recolhendo. Cassiano confere aparência e interação.

- [x] Conferir `main`, HEAD, diff, contratos e condição atual da seta.
- [x] Corrigir o estado e a posição da seta.
- [ ] Corrigir a aparência após Cassiano rejeitar o círculo ciano mostrado na captura: seta pequena dentro da barra, piscando em azul e rosa.
- [ ] Revisar o diff e executar `git diff --check` após a correção visual.
- [ ] Cassiano conferir a seta piscando no clique e durante o arraste, seu desaparecimento ao soltar e o clique simples para expandir/recolher.

Evidência de código: antes, `handlePointerDown` desligava a dica e o atributo visual exigia `radioExpanded`; agora o atributo acompanha `showResizeHint` durante o gesto. A primeira tentativa usou um círculo ciano que Cassiano rejeitou na captura enviada. Lint, typecheck, build e testes não foram executados nesta correção, conforme a regra de execução apenas por pedido explícito. A aplicação não foi aberta no navegador e não houve validação visual pelo agente. Próximo passo: Cassiano conferir o comportamento e a aparência da seta na divisória desktop; corrigir qualquer defeito observado antes de considerar este ajuste aprovado.
