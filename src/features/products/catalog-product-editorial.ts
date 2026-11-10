// Textos editoriais dos produtos vendidos pela Shopee no site CMangini3D. Informacoes e medidas
// derivadas dos anuncios do catalogo; nao representam garantia de compatibilidade.
// O gate de indexacao continua independente (search-approval.ts).
export type CatalogProductEditorial = Readonly<{
  metaDescription: string;
  lead: string;
  body: string;
  facts: readonly Readonly<{ label: string; value: string }>[];
  note: string;
}>;

export const catalogProductEditorial: Readonly<Record<string, CatalogProductEditorial>> = {
  "caixa-organizadora-dois-compartimentos": {
    metaDescription: "Caixa organizadora com tampa deslizante para bijuterias, acessórios e objetos pequenos. Opções com dois compartimentos ou sem divisória.",
    lead: "Brincos, cartões de memória e outros objetos pequenos não precisam ficar espalhados. Esta caixa organizadora reúne tudo em um só lugar, na gaveta, na mesa ou na bolsa.",
    body: "A tampa deslizante facilita o acesso. Escolha a versão com dois compartimentos para separar os acessórios ou a opção sem divisória para ter um espaço único.",
    facts: [
      { label: "Medidas externas", value: "10,7 × 6,7 × 2,2 cm (aprox.)" },
      { label: "Cada compartimento", value: "10 × 2,94 × 2 cm (aprox.)" },
      { label: "Material", value: "PLA, impressão 3D" },
    ],
    note: "As medidas internas se referem à versão com divisória. Confira a variação escolhida antes da compra. Objetos das fotos não acompanham o produto.",
  },
  "porta-controles-de-mesa": {
    metaDescription: "Porta-controles de mesa com dois compartimentos, impresso em 3D. Organize os controles perto da TV e escolha entre cores e acabamentos.",
    lead: "Chega de procurar o controle remoto entre as almofadas. Este porta-controles de mesa reúne seus controles perto da TV e ajuda a manter a estante organizada.",
    body: "Com dois espaços para controles ou pequenos acessórios, é produzido em PLA por impressão 3D. Há diferentes combinações de cores e acabamentos.",
    facts: [
      { label: "Versão preto/cobre", value: "9 × 6,2 × 6,5 cm (aprox.)" },
      { label: "Versão Rainbow", value: "10 × 7 × 7 cm (aprox.)" },
      { label: "Material", value: "PLA, impressão 3D" },
    ],
    note: "As dimensões variam conforme a versão. Compare o tamanho do suporte com os controles que pretende guardar.",
  },
  "porta-curativos-compacto": {
    metaDescription: "Porta-curativos compacto para bolsa, mochila ou viagem. Estojo rígido impresso em 3D, com diferentes cores e medidas internas informadas.",
    lead: "Chega de curativos espalhados no fundo da bolsa! O Porta-Curativos Compacto mantém as embalagens individuais reunidas em um estojo rígido, fácil de levar no dia a dia.",
    body: "Impresso em 3D e disponível em várias cores, tem um formato compacto para guardar na bolsa, mochila ou nécessaire sem ocupar muito espaço.",
    facts: [
      { label: "Medidas externas", value: "11 × 3,3 × 1,9 cm (aprox.)" },
      { label: "Espaço interno", value: "10 × 3,2 × 1,8 cm (aprox.)" },
      { label: "Material", value: "PLA, impressão 3D" },
    ],
    note: "Indicado principalmente para curativos em embalagens pequenas ou médias. Alguns maiores podem não caber: compare as medidas antes de comprar. Curativos não inclusos.",
  },
  "casinha-porta-iscas-formiga": {
    metaDescription: "Casinha porta-iscas para formigas com telhado removível. Suporte em PLA para iscas comerciais, vendido sem isca ou inseticida.",
    lead: "Uma forma mais discreta de acomodar a isca de formigas. A mini casinha tem telhado removível: é só abrir, colocar a isca comercial e encaixar o telhado novamente.",
    body: "Produzida em PLA por impressão 3D, a casinha é compacta e pode ser usada em locais permitidos pelas instruções da isca escolhida.",
    facts: [
      { label: "Dimensões", value: "6,1 × 5 × 5,16 cm (aprox.)" },
      { label: "Abertura", value: "Telhado removível" },
      { label: "Material", value: "PLA, impressão 3D" },
    ],
    note: "Você recebe apenas a casinha com o telhado. Isca, formicida e outros produtos químicos não acompanham a peça. Siga as instruções de uso da isca e mantenha fora do alcance de crianças e animais.",
  },
  "porta-figurinhas-3d": {
    metaDescription: "Porta-figurinhas com tampa deslizante, feito em PLA. Organize figurinhas e cards compatíveis em uma caixa compacta com cores variadas.",
    lead: "Sua coleção merece um lugar próprio. O porta-figurinhas reúne as figurinhas em uma caixinha com tampa deslizante, prática para guardar em casa ou levar na mochila.",
    body: "Impresso em 3D em PLA, está disponível em diferentes combinações de cores. Também pode acomodar cards de tamanho semelhante, desde que caibam nas medidas da caixa.",
    facts: [
      { label: "Dimensões (fechado)", value: "8,5 × 6,5 × 3,5 cm (aprox.)" },
      { label: "Capacidade informada", value: "Mais de 100 figurinhas padrão" },
      { label: "Material", value: "PLA, impressão 3D" },
    ],
    note: "A quantidade pode variar conforme a espessura das figurinhas. Este produto é a caixa individual; o kit é vendido em outro anúncio.",
  },
  "caixa-organizadora-grande": {
    metaDescription: "Caixa organizadora grande com tampa deslizante para cartões e pequenos acessórios. Conheça medidas e variações de acabamento na Shopee.",
    lead: "Cartões, cabos e pequenos acessórios ficam mais fáceis de encontrar quando têm um lugar próprio. Esta caixa organizadora reúne esses itens em um estojo fino para levar na bolsa ou guardar na gaveta.",
    body: "Feita em PLA por impressão 3D, tem tampa deslizante e formato prático para organizar objetos de uso diário. Há diferentes acabamentos para escolher.",
    facts: [
      { label: "Dimensões fechada", value: "12,7 × 7,7 × 1,7 cm (aprox.)" },
      { label: "Fechamento", value: "Tampa deslizante" },
      { label: "Material", value: "PLA, impressão 3D" },
    ],
    note: "Antes de comprar, compare as medidas com os cartões e acessórios que pretende guardar. Os objetos usados nas fotos não acompanham a caixa.",
  },
  "caixa-organizadora-quadrada": {
    metaDescription: "Caixa organizadora quadrada em PLA com tampa de encaixe para brincos, anéis e pequenos objetos. Escolha entre estampas em relevo.",
    lead: "Brincos, anéis e outras miudezas merecem um lugar para não se perder na gaveta. A caixa quadrada reúne pequenos acessórios e ainda decora com estampas em relevo.",
    body: "A tampa de encaixe completa o formato compacto, feito em PLA por impressão 3D. Há diferentes estampas para combinar com seu estilo.",
    facts: [
      { label: "Dimensões fechada", value: "9,2 × 9,2 × 1,8 cm (aprox.)" },
      { label: "Fechamento", value: "Tampa de encaixe" },
      { label: "Material", value: "PLA, impressão 3D" },
    ],
    note: "Confira se os objetos cabem no espaço interno. A compra inclui a caixa; acessórios e outros itens de cenário não acompanham a peça.",
  },
  "caixinha-organizadora-pequena": {
    metaDescription: "Caixinha organizadora pequena para cotonetes, fio dental e acessórios. Modelos com divisória e opção sem divisória para bolsa e nécessaire.",
    lead: "Cotonetes, fio dental e acessórios pequenos não precisam ficar soltos na nécessaire. Esta caixinha compacta ajuda a manter os itens reunidos na bolsa, gaveta ou mochila.",
    body: "Produzida em PLA por impressão 3D, possui versões com divisória e uma opção sem divisória. Escolha a que combina melhor com os objetos que pretende guardar.",
    facts: [
      { label: "Tamanho", value: "Pequeno e portátil" },
      { label: "Interior", value: "Com ou sem divisória, conforme variação" },
      { label: "Material", value: "PLA, impressão 3D" },
    ],
    note: "Confira a versão e as medidas nas fotos antes de comprar. Cotonetes, fio dental e outros acessórios não acompanham a caixinha.",
  },
  "estojo-duplo-compacto": {
    metaDescription: "Estojo duplo compacto com dois compartimentos redondos e tampa de encaixe. Organize acessórios pequenos em uma peça impressa em 3D.",
    lead: "Duas divisões para separar o que costuma ficar misturado. O estojo duplo tem compartimentos redondos para anéis, clipes e outros objetos pequenos do dia a dia.",
    body: "Seu formato compacto e a tampa de encaixe facilitam guardar as miudezas na mesa, na gaveta ou na bolsa. A peça é produzida em PLA por impressão 3D.",
    facts: [
      { label: "Interior", value: "2 compartimentos redondos" },
      { label: "Fechamento", value: "Tampa de encaixe" },
      { label: "Material", value: "PLA, impressão 3D" },
    ],
    note: "Verifique as medidas antes de escolher o que guardar. A ficha do produto apresenta valores diferentes de comprimento, que precisam de confirmação.",
  },
  "porta-lapis-cachepo": {
    metaDescription: "Porta-lápis e porta-pincéis com design ondulado, que também funciona como cachepô decorativo. Cores individuais e opção de kit.",
    lead: "Um organizador de mesa que também chama atenção pelo formato. As linhas onduladas dão personalidade ao espaço enquanto você guarda lápis, pincéis ou pequenos objetos.",
    body: "A peça também pode ser usada como cachepô decorativo para arranjos secos. Há cores individuais e uma opção de kit com três unidades.",
    facts: [
      { label: "Medidas do modelo", value: "5,03 × 5,05 × 7,39 cm (aprox.)" },
      { label: "Formato", value: "Superfície ondulada" },
      { label: "Opções", value: "Peça avulsa ou kit com 3" },
    ],
    note: "Escolha a variação antes de comprar. Não há indicação de impermeabilização; evite usar água diretamente no recipiente.",
  },
  "suporte-celular-articulado": {
    metaDescription: "Suporte articulado de celular com base redonda e ajuste de ângulo. Apoie o aparelho para assistir a vídeos, ver receitas e fazer chamadas.",
    lead: "Receitas, videochamadas e vídeos ficam mais práticos com o celular apoiado. Este suporte articulado deixa a tela à vista sem precisar segurar o aparelho o tempo todo.",
    body: "A base redonda e as articulações permitem mudar o ângulo de apoio. Produzido em PLA, está disponível em diferentes cores para a mesa ou bancada.",
    facts: [
      { label: "Movimento", value: "Articulações com ajuste de ângulo" },
      { label: "Base", value: "Redonda" },
      { label: "Material", value: "PLA, impressão 3D" },
    ],
    note: "O encaixe e a posição dependem do tamanho do celular e da capinha utilizada. Compare as fotos e dimensões antes de comprar.",
  },
  "chaveiro-mureta-santos": {
    metaDescription: "Chaveiro inspirado nas muretas da orla de Santos, impresso em PLA. Lembrança da cidade com letras brancas ou coloridas e argola prateada.",
    lead: "Quem conhece Santos reconhece suas muretas de longe. Este chaveiro em miniatura traz um pedacinho da orla para acompanhar suas chaves ou mochila.",
    body: "Impresso em PLA, tem argola prateada e versões com letras brancas ou coloridas. Uma lembrança para moradores, visitantes e apaixonados pela cidade.",
    facts: [
      { label: "Dimensões", value: "7,8 × 2,4 × 1,17 cm (aprox.)" },
      { label: "Material", value: "PLA, impressão 3D" },
      { label: "Variações", value: "Letras brancas ou coloridas" },
    ],
    note: "Confira a opção de letras escolhida no anúncio. O produto é um chaveiro decorativo inspirado nas muretas de Santos.",
  },
  "capa-botao-descarga": {
    metaDescription: "Capa decorativa para botão de descarga com área maior para apertar. Escolha entre modelos impressos em 3D e confira o encaixe.",
    lead: "Até o botão da descarga pode ganhar um detalhe divertido. Esta capa fica sobre o botão original do vaso sanitário e oferece uma superfície maior para apertar.",
    body: "Há modelos com cores e temas diferentes. A peça pode ficar apoiada ou ser fixada com a fita dupla face que acompanha a base, conforme o encaixe.",
    facts: [
      { label: "Base", value: "7,2 × 7,0 × 3,9 cm (aprox.)" },
      { label: "Parte superior", value: "6,1 × 6,0 cm (aprox.)" },
      { label: "Fixação", value: "Fita dupla face incluída" },
    ],
    note: "A capa não substitui o botão nem altera o mecanismo da descarga. Compare o formato e as medidas do botão existente com as fotos antes de comprar.",
  },
  "dinossauro-articulado-t-rex": {
    metaDescription: "Dinossauro T-Rex articulado impresso em 3D, com cauda e membros móveis. Miniatura decorativa para colecionadores e fãs de dinossauros.",
    lead: "Um T-Rex que não precisa ficar sempre na mesma pose. As articulações na cauda, no corpo e nos membros permitem mudar a posição da miniatura na mesa ou estante.",
    body: "Impresso em PLA nas cores azul e preto, é uma peça de coleção para quem gosta de dinossauros e objetos articulados.",
    facts: [
      { label: "Dimensões esticado", value: "11,7 × 10 × 3,9 cm (aprox.)" },
      { label: "Articulações", value: "Cauda, corpo, braços e pernas" },
      { label: "Material", value: "PLA, impressão 3D" },
    ],
    note: "Peça decorativa, não indicada para crianças pequenas por conter partes delicadas. Evite torções fortes nas articulações e exposição ao calor excessivo.",
  },
  "dummy-13-boneco-articulado": {
    metaDescription: "Kit Dummy 13 com boneco articulado para montar. Acompanha duas cartelas de peças e manual de instruções, com opções de cores.",
    lead: "Gosta de montar peças e testar novas poses? O Dummy 13 chega desmontado para você construir seu próprio boneco articulado.",
    body: "O conjunto inclui duas cartelas com as peças necessárias e um manual de montagem. Há combinações de cores diferentes para escolher.",
    facts: [
      { label: "Conteúdo", value: "2 cartelas de peças e manual" },
      { label: "Tipo", value: "Boneco articulado para montar" },
      { label: "Opções", value: "Combinações de cores" },
    ],
    note: "É necessário montar o boneco antes do uso. Contém peças pequenas e não é indicado para crianças pequenas.",
  },
  "fita-cassete-retro": {
    metaDescription: "Fita cassete decorativa impressa em 3D para quem gosta de música e estética retrô. Enfeite para mesa, estante ou quarto.",
    lead: "Um toque dos anos 80 e 90 para a decoração. Esta fita cassete em miniatura leva o visual retrô para a mesa, o quarto ou a estante.",
    body: "Produzida por impressão 3D, é uma peça para expor em ambientes criativos, setups e cantinhos dedicados à música.",
    facts: [
      { label: "Dimensões", value: "10,44 × 6,32 × 1,11 cm (aprox.)" },
      { label: "Tipo", value: "Peça decorativa" },
      { label: "Fabricação", value: "Impressão 3D" },
    ],
    note: "É um objeto decorativo: não reproduz áudio e não funciona em aparelhos toca-fitas.",
  },
  "imas-frases-veganas-2": {
    metaDescription: "Kit com 2 ímãs decorativos de geladeira com frases veganas. Plaquinhas de 7,4 × 4,9 cm para cozinha, armário ou painel metálico.",
    lead: "Duas frases para dar mais personalidade à geladeira. Este kit reúne plaquinhas com humor vegano para decorar a cozinha ou um painel metálico.",
    body: "O conjunto traz as frases “All You Need Is Couve” e “Era Soja Que Me Faltava”. Cada plaquinha já possui ímã para fixação.",
    facts: [
      { label: "Conteúdo", value: "2 plaquinhas com ímã" },
      { label: "Medida de cada uma", value: "7,4 × 4,9 × 0,3 cm" },
      { label: "Frases", value: "Couve e soja" },
    ],
    note: "Use em superfícies metálicas que aceitem ímãs. O kit contém as duas frases indicadas, sem itens adicionais.",
  },
  "imas-frases-veganas-4": {
    metaDescription: "Kit com 4 ímãs de geladeira com frases veganas para decorar a cozinha ou painel metálico. Plaquinhas de 7,4 × 4,9 cm.",
    lead: "Quatro frases e bastante personalidade para a geladeira. As plaquinhas deste kit combinam humor vegano com decoração para a cozinha.",
    body: "O conjunto inclui quatro modelos diferentes com ímã, entre eles “All You Need Is Couve” e “Era Soja Que Me Faltava”. Veja nas fotos as outras frases do kit.",
    facts: [
      { label: "Conteúdo", value: "4 plaquinhas com ímã" },
      { label: "Medida de cada uma", value: "7,4 × 4,9 × 0,3 cm" },
      { label: "Fixação", value: "Superfície metálica compatível" },
    ],
    note: "Confira as quatro frases nas imagens antes de comprar. As peças precisam de uma superfície onde o ímã consiga aderir.",
  },
  "bolinhas-basquete-sensoriais": {
    metaDescription: "Kit com 2 bolinhas de basquete texturizadas que giram. Peças em PLA para manusear, brincar com o movimento ou decorar a mesa.",
    lead: "Um passatempo para quem gosta de ter alguma coisa nas mãos. O kit traz duas mini bolinhas de basquete com textura e movimento giratório.",
    body: "As peças são rígidas, feitas em PLA por impressão 3D. Além do movimento, têm um visual esportivo que combina com a mesa ou estante.",
    facts: [
      { label: "Quantidade", value: "2 bolinhas" },
      { label: "Superfície", value: "Texturizada" },
      { label: "Movimento", value: "Giratório" },
    ],
    note: "Não indicado para crianças pequenas devido ao tamanho das peças. São miniaturas para manuseio, não bolas para jogar basquete.",
  },
  "kit-porta-curativos": {
    metaDescription: "Kit com porta-curativos e caixa organizadora com divisória. Duas peças impressas em 3D para bolsa, nécessaire e pequenos acessórios.",
    lead: "Dois estojos compactos para organizar o que vai com você. O kit combina um porta-curativos para embalagens individuais e uma caixinha com divisória para itens pequenos.",
    body: "As duas peças são produzidas por impressão 3D e estão disponíveis em diferentes cores. Uma combinação prática para guardar na bolsa, mochila ou nécessaire.",
    facts: [
      { label: "Conteúdo", value: "1 porta-curativos + 1 caixinha" },
      { label: "Porta-curativos", value: "11 × 3,3 × 1,9 cm (aprox.)" },
      { label: "Caixinha", value: "8,8 × 6,2 × 1,5 cm (aprox.)" },
    ],
    note: "Curativos, medicamentos e outros objetos não acompanham o kit. Confira o tamanho das embalagens antes de colocá-las no porta-curativos.",
  },
  "kit-porta-figurinhas-3d": {
    metaDescription: "Kit porta-figurinhas com tampa deslizante para guardar figurinhas e cards de tamanho compatível. Veja dimensões e cores na Shopee.",
    lead: "Figurinhas espalhadas pela mochila? O porta-figurinhas com tampa deslizante dá à coleção um espaço próprio para guardar e transportar.",
    body: "O modelo foi pensado para figurinhas de álbum e cards de tamanho semelhante. Há versões em diferentes cores, produzidas por impressão 3D.",
    facts: [
      { label: "Dimensões do estojo", value: "8,38 × 6,38 × 4 cm (aprox.)" },
      { label: "Capacidade indicada", value: "Mais de 100 figurinhas padrão" },
      { label: "Fechamento", value: "Tampa deslizante" },
    ],
    note: "A quantidade que cabe depende da espessura das figurinhas. Confira no anúncio a quantidade de peças incluídas no kit e a variação escolhida.",
  },
  "martelo-thor-rotativo": {
    metaDescription: "Martelo nórdico rotativo impresso em 3D, com símbolos em relevo e eixo giratório. Peça decorativa para colecionar ou manusear.",
    lead: "Um pequeno martelo inspirado na mitologia nórdica que também gira. A miniatura combina detalhes em relevo com um movimento para brincar com os dedos.",
    body: "Produzido em PLA por impressão 3D, tem símbolos nas laterais e empunhadura texturizada. Fica bem como peça de mesa ou item de coleção.",
    facts: [
      { label: "Dimensões", value: "10,5 × 6 × 3,5 cm (aprox.)" },
      { label: "Peso", value: "Cerca de 60 g" },
      { label: "Mecanismo", value: "Eixo rotativo" },
    ],
    note: "Peça decorativa e de passatempo, não uma ferramenta. Contém partes móveis e não é indicada para crianças pequenas.",
  },
  "mini-arvore-pinheiro": {
    metaDescription: "Mini pinheiro verde impresso em 3D, com 16,1 cm de altura e base fixa. Uma peça para mesa, prateleira ou decoração de Natal.",
    lead: "Um pinheiro para decorar sem precisar montar árvore grande. A mini árvore verde cabe na mesa, na estante ou em um cantinho de Natal.",
    body: "Com visual simples e base fixa, chega pronta para usar como decoração. É produzida em PLA por impressão 3D e pode continuar exposta depois das festas.",
    facts: [
      { label: "Altura", value: "16,1 cm (aprox.)" },
      { label: "Largura e profundidade", value: "10,73 × 10,73 cm (aprox.)" },
      { label: "Conteúdo", value: "1 mini pinheiro com base fixa" },
    ],
    note: "Não acompanha luzes nem outros objetos decorativos. Evite deixar a peça próxima de calor intenso.",
  },
  "nave-espacial-espiral": {
    metaDescription: "Nave alienígena de duas peças com encaixe em espiral. Puzzle para deslizar, encaixar e brincar com o movimento, em várias cores.",
    lead: "Parece que as duas peças não vão se encaixar. O segredo está no movimento: as espirais deslizam uma pela outra até formar a nave espacial.",
    body: "É uma peça para desmontar, montar e explorar o encaixe de novo. As combinações de cores dão um visual diferente ao pequeno puzzle.",
    facts: [
      { label: "Peças", value: "2 partes em espiral" },
      { label: "Mecanismo", value: "Encaixe deslizante" },
      { label: "Variações", value: "Combinações de cores" },
    ],
    note: "Recomendada para jovens e adultos. Não indicada para crianças pequenas; evite forçar as peças fora do sentido do encaixe.",
  },
  "porta-controle-good-vibes": {
    metaDescription: "Vaso decorativo Good Vibes Only com frase em relevo e textura vertical. Peça impressa em 3D para arranjos secos ou pequenos objetos.",
    lead: "Um recado de boas vibrações para a mesa ou estante. O vaso decorativo Good Vibes Only mistura frase em relevo e textura vertical para dar personalidade ao ambiente.",
    body: "Feito em PLA por impressão 3D, funciona como recipiente decorativo para arranjos secos, plantas artificiais ou pequenos objetos.",
    facts: [
      { label: "Material", value: "PLA, impressão 3D" },
      { label: "Acabamento", value: "Textura vertical e frase em relevo" },
      { label: "Uso", value: "Arranjos secos e pequenos objetos" },
    ],
    note: "Plantas e acessórios das fotos não acompanham a peça. Não há indicação de impermeabilização para uso com água.",
  },
  "porta-remedios-semanal": {
    metaDescription: "Porta-remédios semanal compacto com sete divisões marcadas de domingo a sábado e abertura deslizante. Para organizar a rotina.",
    lead: "Os sete dias da semana em um só estojo. O porta-remédios semanal tem compartimentos marcados de domingo a sábado para ajudar a organizar a rotina.",
    body: "As marcações e o sistema deslizante facilitam encontrar o compartimento do dia. É uma peça compacta, impressa em PLA, para guardar em casa ou levar em viagens.",
    facts: [
      { label: "Organização", value: "7 dias, de DOM a SAB" },
      { label: "Dimensões", value: "15 × 4,16 × 1,5 cm (aprox.)" },
      { label: "Material", value: "PLA, impressão 3D" },
    ],
    note: "Medicamentos não inclusos. Respeite a dose e as orientações de armazenamento de cada medicamento; confirme se o recipiente é adequado ao conteúdo.",
  },
  "trio-estrelas-decorativas": {
    metaDescription: "Trio de estrelas decorativas impressas em 3D, em três tamanhos e opções azul, dourada ou vermelha. Para o Natal e outros ambientes.",
    lead: "Três estrelas de tamanhos diferentes para montar uma composição na mesa, no aparador ou na estante. O conjunto combina com o Natal e com outras decorações ao longo do ano.",
    body: "O kit inclui uma estrela pequena, uma média e uma grande, impressas em 3D. As opções de cor incluem azul brilhante, dourado e vermelho.",
    facts: [
      { label: "Conteúdo", value: "3 estrelas: pequena, média e grande" },
      { label: "Pequena", value: "4,5 × 4,5 × 1,4 cm (aprox.)" },
      { label: "Média", value: "7,4 × 7,2 × 1,4 cm (aprox.)" },
      { label: "Grande", value: "9,3 × 9 × 1,4 cm (aprox.)" },
    ],
    note: "Confira a cor selecionada para o conjunto. Luzes, móveis e outros objetos das fotos não acompanham as estrelas.",
  },
};

export function getCatalogProductEditorial(slug: string): CatalogProductEditorial | null {
  return Object.hasOwn(catalogProductEditorial, slug) ? catalogProductEditorial[slug] : null;
}
