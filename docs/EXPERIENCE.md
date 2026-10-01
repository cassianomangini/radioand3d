# Experiência e identidade CM

## Direção confirmada

CM como identidade principal. Sem astronauta, lettering Artesopolis ou tema espacial herdado. Cassiano forneceu em 29/09/2026 o logo **CM 3D and Radio**, salvo em `public/images/cm-3d-radio-logo.png`. A navbar mostra uma versão pequena; o hero usa a mesma arte em escala moderada, sem competir com o título. Preservar o arquivo fornecido, sem redesenhar o monograma no frontend.

Cassiano pediu um resultado bonito, chique, fácil e vivo, com muitas animações. Isso vale para composição e uso real. Tokens e componentes preservam uma direção visual aprovada; não substituem essa direção.

## Decisões confirmadas desta rodada

A referência visual mais próxima do alvo mostrou uma composição em dois mundos, não uma home convencional com uma coleção de cards.

Na revisão da interface em 29/09/2026, Cassiano pediu fundo quase preto, mais presença de cor no título, CTA do Estúdio em cápsula preta com contorno azul e seta, e uma única borda fina entre Estúdio e Rádio. Não reservar uma faixa escura para o divisor nem exibir um puxador permanente. A área de arraste pode ser transparente sobre a borda.

No hero da landing, o marcador “ESTÚDIO 3D” e o texto “Descubra mais sobre nosso estúdio, peças, materiais, cores e muito mais para voce explorar..” substituem a copy anterior. Cassiano pediu retirar o bloco inferior “O ESTÚDIO / Do arquivo ao objeto real” e “PRÓXIMAS ENTRADAS” da home, preservando o botão “Conheça mais sobre”. O destino definido por Cassiano é a futura página do Estúdio. Até a rota existir, o botão e o item “Sobre” permanecem visíveis, mas desativados.

Cassiano escolheu `output/dj2.png` como imagem da Rádio. A cópia exata em `public/images/cm-radio-preview-art.png` aparece na arte principal e nas miniaturas da prévia visual, sem logo CM 3D and Radio sobreposto. A imagem não é apresentada como capa oficial da faixa.

O logo e a arte da Rádio devem manter a definição máxima dos PNGs fornecidos. A Home serve os arquivos originais, sem recompressão no carregamento. Isso não cria detalhe além da resolução dos arquivos de origem.

Na mesma revisão, Cassiano pediu que a barra lateral da Rádio tenha proporção e aparência coerentes com o Estúdio. O estado inicial usa 480 px no desktop de 1440 px e reduz até 400 px perto do limite desktop; Expandir/Recolher fica dentro do cabeçalho da Rádio, mostra cursor de mão ao passar o mouse e anima apenas a mudança de largura em 260 ms. O arraste permanece imediato e a preferência por movimento reduzido desativa essa transição.

**Desktop**

- Header CM enxuto.
- Área principal com o **Estúdio de Impressão 3D** à esquerda/centro.
- Rádio acoplada à direita como uma superfície própria, não como um card genérico.
- A rádio tem botão de expandir/recolher e pode ser redimensionada por divisor quando a interação for confortável.
- O conteúdo 3D não precisa começar completo. A primeira versão pode ter hero + uma pequena entrada do estúdio e crescer conforme chegam fotos, materiais, peças e trabalhos reais.
- A riqueza visual vem de mídia real, composição, tipografia e do player, não de quatro cards explicativos genéricos abaixo do hero.

**Mobile**

- Header compacto.
- Mini player logo abaixo do header.
- O conteúdo do **Estúdio de Impressão 3D** começa imediatamente abaixo do mini player.
- A rádio grande abre sob demanda em uma superfície própria; não manter uma sidebar comprimida.
- A ordem mobile é desenhada de propósito, não é o desktop empilhado.

**Conteúdo**

- A expressão **Estúdio de Impressão 3D** deve aparecer claramente na entrada pública.
- Não criar produtos, materiais, números, depoimentos ou categorias falsas para completar composição.
- Se ainda não houver conteúdo suficiente, mostrar menos seções com mais qualidade.
- Produtos, materiais, fotos e projetos reais entram progressivamente sem exigir redesenho da base.

## Hipótese visual para apresentar

Estúdio de objetos e música: acabamento preciso, peças bem fotografadas, tipografia com presença e rádio com personalidade de equipamento musical. Explorar grafite fosco, texto claro, azul/ciano e roxo pontual. Fundos neutros mais claros nas fotografias podem valorizar materiais. Paleta, fontes e proporção entre superfícies claras/escuras ainda serão aprovadas; dark mode para tudo não é uma obrigação.

A nostalgia de Winamp aparece no display, sequência de faixas, controles e visualizador, com leitura e toque confortáveis. Concentrar riqueza visual na rádio e nas peças; navegação, textos e formulários ficam claros. A assinatura CM nasce da combinação de tipografia, recortes, acabamento, fotografia e resposta dos controles, não de gradientes aplicados a tudo.

## Composição e facilidade

| Superfície | Prioridade de leitura e ação |
| --- | --- |
| Home | Entender o que Cassiano cria, ver uma peça e encontrar catálogo e rádio |
| Produto | Foto e uso, dimensões, opções válidas, disponibilidade e próximo passo |
| Mostruário | Comparar cor e acabamento com nome e exemplo impresso |
| Mini player mobile | Faixa e controles essenciais logo abaixo do header; ação para abrir a Rádio completa |
| Player grande | Música atual, busca, biblioteca e fila fáceis de encontrar |
| Music Inbox | Importar lote, identificar pendências, revisar e publicar |

Uma grade comum com diferentes composições: fotografia/galeria para objetos, linhas para músicas, amostras para materiais e formulário para gestão. Componentização não obriga a encaixar tudo em cartões nem a repetir seções alternando esquerda/direita.

O frontend deve rejeitar automaticamente o padrão visual de "quatro cards de benefícios" usado apenas para preencher espaço. Um card só existe quando agrupa conteúdo ou ação real. Informação simples pode viver diretamente na composição.

Navegação e ações ficam legíveis antes do hover. Explorar o site não exige dar play. Botões usam verbos claros; filtros, seleções e causas de indisponibilidade ficam visíveis. Ações ambíguas recebem rótulo, além de nome acessível.

Definir desktop e mobile separadamente: ordem, densidade, área segura, foco e teclado aberto. No desktop existe somente a Rádio completa/acoplada, sem mini player duplicado. No mobile existe mini player logo abaixo do header e a Rádio completa abre sob demanda. O player não cobre controles.

## Escalas iniciais para avaliação

Pontos de partida, não valores finais aprovados:

- Texto principal em torno de 16 a 18 px; interface de 14 a 16 px, implementados com unidades relativas. Informação decisiva não vira microtexto.
- Uma família principal por leitura/personalidade; complementar somente se ajudar display e tempo. Testar acentos, numerais e títulos longos; verificar licença antes de adotar.
- Texto entre 55 e 70 caracteres por linha; grade ampla de referência até 1280 px. Imagens e listas não ficam artificialmente limitadas à largura do texto.
- Espaçamento baseado em 4/8, com gutters e intervalos por função. Alturas nascem do conteúdo, não de um viewport obrigatório por seção.
- Poucos níveis de raio, borda e elevação. Pílulas para controles/etiquetas adequados, não para toda superfície.

Os valores finais, escalas fluidas e exceções aparecem no artefato. A implementação centralizada segue [ARCHITECTURE.md](ARCHITECTURE.md).

## Tokens: vocabulário obrigatório

Separar valores-base, papéis semânticos e poucas variáveis específicas de componente. Exemplo: azul da paleta alimenta ação primária; botão consome ação primária, não escolhe outro azul localmente.

| Família | Papéis a definir e visualizar |
| --- | --- |
| Superfícies | Página, painel, elevação, mídia e sobreposição |
| Texto | Principal, secundário legível, texto sobre acento, link e indisponível |
| Ação/estado | Primária, hover, pressionado, selecionado, foco, sucesso, aviso, erro e loading |
| Tipografia | Família, peso, tamanho, entrelinha, medida de leitura e numerais |
| Layout | Espaçamento, gutters, larguras, controles e limites responsivos |
| Forma/camada | Raios, bordas, sombras e ordem de navegação/player/menu/diálogo |
| Movimento | Duração, curva, distância, expansão e alternativa reduzida |

Mostrar pares reais de fundo/texto e estados, não só bolinhas de paleta. Seleção combina forma/texto e cor. Filamentos e capas são conteúdo: suas cores não são alteradas para caber na paleta da interface.

## Movimento como linguagem

Movimento entra na primeira entrega. Projetar resposta de controles, transições de player/listas/seleções e um momento de assinatura. Uma cena expressiva pode coexistir com áreas quietas; vários detalhes responsivos não exigem atrações competindo simultaneamente.

Referência para testar: 120 a 180 ms para resposta curta, 200 a 320 ms para transições e 400 a 650 ms para assinatura. São propostas, não limites da análise contínua de áudio. A ação e o texto respondem sem esperar a animação acabar.

Cada efeito tem gatilho, finalidade, duração, interrupção, estado parado e alternativa reduzida. Preservar scroll nativo, foco e orientação. Evitar cursor personalizado, rolagem sequestrada, animação obrigatória de cada linha e conteúdo escondido até uma sequência terminar.

CSS para feedback simples; Motion para coordenação; 3D apenas na interação aprovada. Preferir transform/opacity quando adequados e medir o resultado. Suspender efeitos invisíveis/ociosos, adaptar canvas/3D e manter fallback com imagem. Reduzir efeitos não para a música.

Respeitar preferência do sistema e dar controle sobre efeitos contínuos. A política alcança CSS, canvas e 3D, não somente Motion. Referência: [acessibilidade no Motion](https://motion.dev/docs/react-accessibility). Gráficos de áudio seguem [RADIO.md](RADIO.md).

## Handoff estrutural

A geometria, o shell responsivo, os limites da Rádio, a ordem mobile e a estratégia de crescimento progressivo do 3D estão documentados em [STUDIO_RADIO_HANDOFF_V1.md](design/STUDIO_RADIO_HANDOFF_V1.md). A proposta de tipografia, paleta, superfícies e motion está em [CM_VISUAL_SYSTEM_V1.md](design/CM_VISUAL_SYSTEM_V1.md). Os estados, responsabilidades e limites dos componentes do primeiro recorte estão em [CM_COMPONENT_STATES_V1.md](design/CM_COMPONENT_STATES_V1.md). Os três artefatos permanecem sujeitos à aprovação visual de Cassiano.

## Artefato de aprovação da entrega 03

O artefato final deve transformar a referência visual aprovada em especificação reproduzível, sem depender da interpretação de quem implementar.

Precisa mostrar, no mínimo:

- desktop em 1440 px com Estúdio + Rádio acoplada;
- estado desktop com Rádio expandida;
- mobile em aproximadamente 390 px com header -> mini player -> Estúdio;
- mini player **mobile**, Rádio completa desktop/mobile, divisor/redimensionamento desktop e ação de expandir;
- hero contendo "Estúdio de Impressão 3D";
- estado inicial do 3D com pouco conteúdo real, sem cards fictícios;
- comportamento quando novos blocos de produtos/materiais forem adicionados futuramente;
- grid, medidas relativas, hierarquia tipográfica, tokens, estados e motion.

Aplicar a mesma linguagem ao Inbox somente no nível necessário para manter coerência; ele não deve atrasar a aprovação da experiência pública inicial.

Handoff: grade, hierarquia, proporções, conteúdo disponível, fotos/capas, componentes mínimos, estados, mapa de tokens, motion, fallback, foco e comportamento responsivo. Registrar o que o frontend não pode inventar; vários agentes não podem decidir fontes, cores ou ornamentos independentemente.

Registrar `ready_for_frontend: yes|no`, `artifact_ref`, `approved_by` e referência da aprovação recebida. O pacote consolidado de decisão está em [STUDIO_RADIO_APPROVAL_PACKAGE_V1.md](design/STUDIO_RADIO_APPROVAL_PACKAGE_V1.md). Até Cassiano aprovar, manter `ready_for_frontend: no`. Provas técnicas neutras ficam fora de produção. Construir a base visual aprovada antes de multiplicar páginas.

## Verificação e rejeição

Cassiano revisa o render em 360/390 px, faixa intermediária e 1440 px; zoom de texto de 200%; toque, teclado, foco, títulos longos, capa ausente, zero/muitas faixas e loading/empty/error. Contraste precisa funcionar no estado normal, não apenas no hover.

Meta: WCAG 2.2 AA, incluindo contraste de 4,5:1 para texto comum e 3:1 para texto grande conforme o critério. Meta própria para controles frequentes de toque: área acionável de 44 x 44 CSS px mesmo com ícone menor; essa meta não deve ser confundida com o mínimo AA de tamanho e suas exceções. Referências: [contraste](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) e [alvos de toque](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html).

Reprovar texto apagado, cartões aninhados sem função, grade de cartões para tudo, espaços enormes sem valor, controles dependentes de hover, inconsistência de cores/raios, títulos brigando com imagens, brilho/cromado excessivo, fontes difíceis e ornamentos genéricos ocupando o lugar de peças e músicas. Cartões, gradientes e profundidade são permitidos quando coerentes com a composição.

Fotos precisam de enquadramento, resolução e luz adequados. Placeholder não comprova qualidade da mídia final. Testar desempenho com áudio, navegação e efeitos simultâneos; captura estática não valida animação. Revisar a base de componentes também em páginas reais.

Comparar com o artefato aprovado. Aprovação final exige Cassiano ou revisão independente identificada, não declaração automática do autor. Rejeição reabre composição ou fidelidade, em vez de empilhar efeitos sobre o problema.
