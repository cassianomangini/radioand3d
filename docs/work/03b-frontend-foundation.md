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
- [ ] identificar pelo menos dez faixas autorizadas e a origem da fila;
- [ ] implementar a lista das próximas faixas ligada à ordem de reprodução;
- [x] executar lint, tipos e build;
- [x] revisar diff e confirmar que o ajuste da Rádio preserva as alterações locais do hero;
- [ ] Cassiano verificar a rolagem e a lista com dez faixas em desktop e mobile;
- [ ] registrar validação visual de Cassiano.

Evidência inicial: `rg --files public src` e busca por arquivos de áudio no repositório encontraram somente imagens, sem áudio nem catálogo de faixas. `pnpm check` passou em 29/09/2026. A rolagem ainda não foi conferida no navegador, pois Cassiano reservou para si a validação visual e de interações. O próximo passo dependente de conteúdo é receber a origem das faixas autorizadas e integrá-las ao controller da entrega 06/07. A composição do hero já modificada localmente não pertence a este ajuste. Sem commit/PR novo nesta sessão.

Cassiano informou depois que o layout da Home está praticamente aprovado e pediu continuidade no layout funcional da Rádio. Isso ainda não é aprovação visual final da Rádio; a prova técnica do motor e do visualizador está no [checklist 06](06-radio-engine.md).
