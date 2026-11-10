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
};

export function getCatalogProductEditorial(slug: string): CatalogProductEditorial | null {
  return Object.hasOwn(catalogProductEditorial, slug) ? catalogProductEditorial[slug] : null;
}
