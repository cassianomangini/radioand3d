// Copy editorial em revisao. Ainda nao autoriza indexacao: a aprovacao esta
// isolada em search-approval.ts e depende de QA, fotos, dados e link de compra.
export type PilotProductEditorial = Readonly<{
  metaDescription: string;
  paragraphs: readonly string[];
}>;
export const pilotProductEditorial: Readonly<Record<string, PilotProductEditorial>> = {
  "caixa-organizadora-dois-compartimentos": {
    metaDescription: "Caixa portátil com tampa deslizante, disponível em versões com dois compartimentos ou sem divisória. Confira medidas e opções na Shopee.",
    paragraphs: [
      "A versão com divisória desta caixa organizadora portátil separa pequenos objetos em dois compartimentos. A tampa deslizante permite reunir acessórios em uma peça compacta para guardar na mesa, gaveta ou bolsa.",
      "É indicada para objetos pequenos, como brincos, anéis, fones, cartões de memória e acessórios de escritório. O anúncio informa medidas externas aproximadas de 10,7 × 6,7 × 2,2 cm e internas de 10 × 2,94 × 2 cm por compartimento.",
      "A peça é produzida em PLA por impressão 3D. Existe também uma opção anunciada sem divisória; confira a variação selecionada e compare as medidas internas com o que pretende guardar antes da compra.",
    ],
  },
  "porta-controles-de-mesa": {
    metaDescription: "Porta-controles de mesa com duas divisórias para organizar controles remotos e pequenos acessórios. Consulte as cores e medidas na Shopee.",
    paragraphs: [
      "O porta-controles é um suporte de mesa com duas divisórias, pensado para manter controles remotos reunidos e fáceis de localizar. Também pode organizar pequenos acessórios em uma mesa, estante ou aparador.",
      "A peça tem acabamento em camadas característico da impressão 3D e é anunciada em PLA. As medidas variam conforme a versão: o anúncio informa 9 × 6,2 × 6,5 cm para preto/cobre e 10 × 7 × 7 cm para Rainbow.",
      "Antes de comprar, verifique a variação de cor e compare as dimensões do suporte com o espaço disponível e os controles que pretende guardar.",
    ],
  },
  "porta-curativos-compacto": {
    metaDescription: "Estojo compacto para organizar curativos embalados na bolsa, mochila ou nécessaire. Veja as medidas internas e escolha a cor na Shopee.",
    paragraphs: [
      "Este porta-curativos compacto reúne embalagens individuais de curativos em um estojo para transportar na bolsa, mochila ou nécessaire. É uma opção para quem quer evitar que as embalagens fiquem soltas entre outros objetos.",
      "O anúncio informa aproximadamente 11 × 3,3 × 1,9 cm de medidas externas e 10 × 3,2 × 1,8 cm de área interna. A compatibilidade depende do tamanho e da espessura das embalagens: alguns curativos maiores podem não caber.",
      "Confira as medidas úteis e as opções de cor no anúncio antes de escolher. O estojo não acompanha curativos e não deve ser usado para armazenar comprimidos soltos em contato direto com a peça.",
    ],
  },
  "casinha-porta-iscas-formiga": {
    metaDescription: "Casinha porta-iscas para formigas com telhado removível. Suporte vazio em PLA, sem produtos químicos; veja dimensões e variações na Shopee.",
    paragraphs: [
      "A casinha porta-iscas é um suporte em formato de miniatura, com telhado removível para acomodar uma isca comercial para formigas. A abertura fica no telhado, que pode ser retirado e encaixado novamente.",
      "O anúncio informa medidas aproximadas de 6,1 × 5 × 5,16 cm, fabricação em PLA por impressão 3D e opções de cor. O produto vendido é somente o recipiente vazio, sem isca, formicida, gel, inseticida ou qualquer produto químico.",
      "Ao utilizar uma isca, siga as instruções, restrições de ambiente e cuidados do fabricante do produto químico. Não considere a casinha uma proteção contra acesso de crianças ou animais.",
    ],
  },
  "porta-figurinhas-3d": {
    metaDescription: "Porta-figurinhas com tampa deslizante para guardar figurinhas de álbum e cards semelhantes. Consulte dimensões, cores e opções na Shopee.",
    paragraphs: [
      "Este porta-figurinhas é uma caixa compacta com tampa deslizante, feita para reunir figurinhas de álbum e cards de formato compatível. Pode ser usada para guardar a coleção em casa ou levá-la na mochila.",
      "O anúncio informa medidas aproximadas de 8,5 cm de comprimento, 6,5 cm de largura e 3,5 cm de altura. A peça é produzida em PLA por impressão 3D, com diferentes combinações de cores.",
      "Confira as medidas e o tipo de figurinha ou card antes de escolher. A quantidade que cabe na caixa depende da espessura e do formato dos itens; este anúncio corresponde ao porta-figurinhas, distinto do kit listado separadamente.",
    ],
  },
};

export function getPilotProductEditorial(slug: string): PilotProductEditorial | null {
  return Object.hasOwn(pilotProductEditorial, slug) ? pilotProductEditorial[slug] : null;
}
