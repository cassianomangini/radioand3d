export type StudioPrintStatus =
  | "produzido"
  | "conceito"
  | "produto"
  | "cliente";

export type StudioImage = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

export type StudioPrintEntry = {
  slug: string;
  title: string;
  status: StudioPrintStatus;
  summary: string;
  images: StudioImage[];
  material?: string;
  dimensions?: string;
  canPublish: boolean;
  intellectualPropertyNote?: string;
};

export type StudioMaterialAvailability =
  | "disponivel"
  | "sob-consulta"
  | "indisponivel";

export type StudioMaterialColor = {
  id: string;
  name: string;
  finish: string;
  sample: StudioImage;
  availability: StudioMaterialAvailability;
  source: string;
  lastVerifiedAt: string;
};

export type StudioProductAvailability =
  | "disponivel"
  | "sob-consulta"
  | "indisponivel";

export type StudioProductVariant = {
  name: string;
  image?: StudioImage;
};

export type StudioMeasurementSet = {
  label: string;
  values: ReadonlyArray<{
    label: string;
    value: string;
  }>;
};

export type StudioProductSpec = {
  label: string;
  value: string;
};

export type StudioProduct = {
  slug: string;
  title: string;
  contextLabel: string;
  summary: string;
  description: string;
  images: StudioImage[];
  videoUrl?: string;
  materials: string[];
  variants: StudioProductVariant[];
  measurements: StudioMeasurementSet[];
  specs: StudioProductSpec[];
  availability: StudioProductAvailability;
  source: string;
  lastVerifiedAt: string;
  shopeeUrl?: string;
};

function productImages(title: string, urls: readonly string[]): StudioImage[] {
  return urls.map((src, index) => ({
    src,
    alt: `${title} — foto ${index + 1}`,
    width: 1200,
    height: 1200
  }));
}

function productVariant(name: string, imageUrl?: string): StudioProductVariant {
  return {
    name,
    image: imageUrl
      ? {
          src: imageUrl,
          alt: `${name} — variação do produto`,
          width: 1200,
          height: 1200
        }
      : undefined
  };
}

const SHOPEE_SHOP_ID = "1433140862";

function shopeeProductUrl(itemId: string) {
  return `https://shopee.com.br/product/${SHOPEE_SHOP_ID}/${itemId}`;
}

/**
 * Deliberately empty until real pieces are selected and publication permission is confirmed.
 * Do not add synthetic/example entries just to populate the interface.
 */
export const studioPrints: readonly StudioPrintEntry[] = [];

/**
 * Deliberately empty until real material/color samples are photographed and their
 * current availability has a known source. Do not populate this from generic swatches.
 */
export const studioMaterialColors: readonly StudioMaterialColor[] = [];

/**
 * Public editorial snapshot built from the Artesópolis Admin / Shopee live catalog.
 *
 * This is intentionally not a checkout database. It exposes only information useful
 * to explain each public product. Price, inventory quantities, internal costs, SKUs and
 * operational identifiers remain out of the public catalog.
 */
export const studioProducts: readonly StudioProduct[] = [
  {
    slug: "porta-curativos-compacto",
    title: "Porta Curativos Compacto",
    contextLabel: "Organização portátil",
    summary:
      "Estojo rígido e compacto para manter curativos e pequenos objetos protegidos dentro da bolsa, mochila ou nécessaire.",
    description:
      "A peça foi pensada para evitar que embalagens pequenas fiquem soltas, dobradas ou amassadas durante o transporte. Antes da compra, compare as medidas internas com o item que pretende guardar. As linhas de camada fazem parte do processo de impressão 3D.",
    images: productImages("Porta Curativos Compacto", [
      "https://cf.shopee.com.br/file/br-11134207-820lq-mrvoxb97i4uc4f",
      "https://cf.shopee.com.br/file/br-11134207-820md-mrvoxb97gq9w72",
      "https://cf.shopee.com.br/file/br-11134207-820md-mrvoxb97fbpgcd",
      "https://cf.shopee.com.br/file/br-11134207-820me-mpwngu5xcwe8f6",
      "https://cf.shopee.com.br/file/br-11134207-820lj-mpwngu5xfpj4db",
      "https://cf.shopee.com.br/file/br-11134207-820ll-mrgd2mjrcmise7"
    ]),
    materials: ["PLA"],
    variants: [
      productVariant("Azul", "https://cf.shopee.com.br/file/br-11134207-81z1k-me4mzty98g0218"),
      productVariant("Cinza", "https://cf.shopee.com.br/file/br-11134207-81z1k-me4mzty95mv6bd"),
      productVariant("Rosa", "https://cf.shopee.com.br/file/br-11134207-81z1k-meyjeukypwqu50"),
      productVariant("Roxo", "https://cf.shopee.com.br/file/br-11134207-81z1k-me4mzty99uki72"),
      productVariant("Vermelho", "https://cf.shopee.com.br/file/br-11134207-81z1k-me4mzty971fmde")
    ],
    measurements: [
      {
        label: "Medidas externas",
        values: [
          { label: "Comprimento", value: "11 cm" },
          { label: "Largura", value: "3,3 cm" },
          { label: "Altura", value: "1,9 cm" }
        ]
      },
      {
        label: "Medidas internas úteis",
        values: [
          { label: "Comprimento", value: "10 cm" },
          { label: "Largura", value: "3,2 cm" },
          { label: "Altura", value: "1,8 cm" }
        ]
      }
    ],
    specs: [
      { label: "Material", value: "PLA" },
      { label: "Produção", value: "Impressão 3D" },
      { label: "Formato", value: "Estojo rígido compacto" },
      { label: "Uso indicado", value: "Curativos embalados e pequenos objetos compatíveis" }
    ],
    availability: "sob-consulta",
    source: "Artesópolis Admin / Shopee live",
    lastVerifiedAt: "2026-10-05T16:47:14.651644Z",
    shopeeUrl: shopeeProductUrl("23198719725")
  },
  {
    slug: "caixa-organizadora-media-tampa-deslizante",
    title: "Caixa Organizadora Média com 2 Divisórias",
    contextLabel: "Organização",
    summary:
      "Caixa compacta com tampa deslizante e dois compartimentos para separar pequenos objetos no dia a dia.",
    description:
      "A tampa desliza pelo corpo da peça e os dois compartimentos internos ajudam a separar itens pequenos sem aumentar muito o volume externo. É uma solução prática para bolsa, mochila, nécessaire ou organização de mesa.",
    images: productImages("Caixa Organizadora Média com 2 Divisórias", [
      "https://cf.shopee.com.br/file/br-11134207-820lq-mmh8fjei13wk56",
      "https://cf.shopee.com.br/file/br-11134207-820mc-mmh8fjehr9xg6d",
      "https://cf.shopee.com.br/file/br-11134207-820md-mmh8fjei3x1g41",
      "https://cf.shopee.com.br/file/br-11134207-820lj-mmh8fjehyaro21",
      "https://cf.shopee.com.br/file/br-11134207-820mb-mmh8fjehww782c",
      "https://cf.shopee.com.br/file/br-11134207-820lc-mmh8fjehzpc4f8"
    ]),
    materials: ["PLA"],
    variants: [
      productVariant("Cinza", "https://cf.shopee.com.br/file/br-11134207-820mc-mmh8fjehr9xg6d"),
      productVariant("Cinza · Ametista", "https://cf.shopee.com.br/file/br-11134207-820mb-mmh8fjehww782c"),
      productVariant("Mar Noturno", "https://cf.shopee.com.br/file/br-11134207-820lv-mmh8fjehsohw75")
    ],
    measurements: [
      {
        label: "Produto fechado",
        values: [
          { label: "Comprimento", value: "10,7 cm" },
          { label: "Largura", value: "6,7 cm" },
          { label: "Altura", value: "2,2 cm" }
        ]
      }
    ],
    specs: [
      { label: "Material", value: "PLA" },
      { label: "Compartimentos", value: "2" },
      { label: "Tampa", value: "Deslizante" },
      { label: "Produção", value: "Impressão 3D" }
    ],
    availability: "sob-consulta",
    source: "Artesópolis Admin / Shopee live",
    lastVerifiedAt: "2026-10-05T05:30:41.918435Z",
    shopeeUrl: shopeeProductUrl("58257947807")
  },
  {
    slug: "caixa-organizadora-grande-tampa-deslizante",
    title: "Caixa Organizadora Grande com Tampa Deslizante",
    contextLabel: "Organização",
    summary:
      "Caixa fina e rígida para cartões, documentos pequenos, cabos curtos e acessórios que precisam ficar protegidos.",
    description:
      "O formato alongado oferece mais área interna sem transformar a peça em uma caixa volumosa. A tampa deslizante fecha o conjunto e mantém o conteúdo organizado para transporte ou uso sobre a mesa.",
    images: productImages("Caixa Organizadora Grande com Tampa Deslizante", [
      "https://cf.shopee.com.br/file/br-11134207-820lc-mmik5y3squbkaa",
      "https://cf.shopee.com.br/file/br-11134207-820mh-mmik5y3stngg19",
      "https://cf.shopee.com.br/file/br-11134207-820lz-mmik5y3ss8w0ff",
      "https://cf.shopee.com.br/file/br-11134207-820lq-mmik5y3sv20w61",
      "https://cf.shopee.com.br/file/br-11134207-820m5-mmik5y3swglc62"
    ]),
    materials: ["PLA"],
    variants: [
      productVariant("Nave", "https://cf.shopee.com.br/file/br-11134207-820md-mmik5y3t0oao2c"),
      productVariant("Onda", "https://cf.shopee.com.br/file/br-11134207-820md-mmik5y3sxv5s26"),
      productVariant("Preto · Vermelho", "https://cf.shopee.com.br/file/br-11134207-820m4-mmik5y3sz9q8cd")
    ],
    measurements: [
      {
        label: "Produto fechado",
        values: [
          { label: "Altura", value: "12,7 cm" },
          { label: "Largura", value: "7,7 cm" },
          { label: "Espessura", value: "1,7 cm" }
        ]
      }
    ],
    specs: [
      { label: "Material", value: "PLA" },
      { label: "Tampa", value: "Deslizante" },
      { label: "Estrutura", value: "Rígida" },
      { label: "Produção", value: "Impressão 3D" }
    ],
    availability: "sob-consulta",
    source: "Artesópolis Admin / Shopee live",
    lastVerifiedAt: "2026-10-05T05:30:19.425297Z",
    shopeeUrl: shopeeProductUrl("58258025838")
  },
  {
    slug: "porta-controles-duas-divisorias",
    title: "Porta Controles com 2 Divisórias",
    contextLabel: "Mesa e sala",
    summary:
      "Organizador de mesa com dois compartimentos para manter controles e pequenos acessórios juntos e fáceis de alcançar.",
    description:
      "A peça usa dois compartimentos verticais e uma base estável para concentrar controles remotos e outros objetos de uso frequente. Algumas variações possuem dimensões próprias; confira a opção escolhida no anúncio antes de finalizar.",
    images: productImages("Porta Controles com 2 Divisórias", [
      "https://cf.shopee.com.br/file/br-11134207-81z1k-mfsi1hugiupx32",
      "https://cf.shopee.com.br/file/br-11134207-81z1k-mfmtbyeo5q846c",
      "https://cf.shopee.com.br/file/br-11134207-81z1k-mfmtbyeo03yc5e",
      "https://cf.shopee.com.br/file/br-11134207-81z1k-mebbfhdj6x3660",
      "https://cf.shopee.com.br/file/br-11134207-81z1k-mfmtbyeo2x3812",
      "https://cf.shopee.com.br/file/br-11134207-81z1k-mfo2gtsuu22sf6"
    ]),
    materials: ["PLA"],
    variants: [
      productVariant("Azul · Branco mármore", "https://cf.shopee.com.br/file/br-11134207-81z1k-mfmtbyeo9xxg0e"),
      productVariant("Azul · Prata", "https://cf.shopee.com.br/file/br-11134207-81z1k-mfmtbyeobchw67"),
      productVariant("Azul Brilhante", "https://cf.shopee.com.br/file/br-11134207-81z1k-mfo2gtsur8xwd6"),
      productVariant("Preto · Branco", "https://cf.shopee.com.br/file/br-11134207-81z1k-mfmtbyeo8jd039"),
      productVariant("Preto · Cobre", "https://cf.shopee.com.br/file/br-11134207-81z1k-mebbfhdj9q82ff"),
      productVariant("Rainbow", "https://cf.shopee.com.br/file/br-11134207-81z1k-mebbfhdjb4si3d"),
      productVariant("Rosa Pink", "https://cf.shopee.com.br/file/br-11134207-81z1k-mfo2gtsusnicba")
    ],
    measurements: [
      {
        label: "Preto · Cobre",
        values: [
          { label: "Comprimento", value: "9 cm" },
          { label: "Largura", value: "6,2 cm" },
          { label: "Altura", value: "6,5 cm" }
        ]
      },
      {
        label: "Rainbow",
        values: [
          { label: "Comprimento", value: "10 cm" },
          { label: "Largura", value: "7 cm" },
          { label: "Altura", value: "7 cm" }
        ]
      }
    ],
    specs: [
      { label: "Material", value: "PLA" },
      { label: "Compartimentos", value: "2" },
      { label: "Uso indicado", value: "Controles remotos e organização de mesa" },
      { label: "Produção", value: "Impressão 3D" }
    ],
    availability: "sob-consulta",
    source: "Artesópolis Admin / Shopee live",
    lastVerifiedAt: "2026-10-05T05:30:35.231603Z",
    shopeeUrl: shopeeProductUrl("22398887031")
  },
  {
    slug: "porta-lapis-cachepo-moderno",
    title: "Porta-Lápis / Cachepô Moderno",
    contextLabel: "Mesa e decoração",
    summary:
      "Recipiente de desenho ondulado que pode funcionar como porta-lápis, porta-pincéis ou peça decorativa.",
    description:
      "O volume compacto e a superfície ondulada dão à peça uma presença visual mais forte sem ocupar muito espaço. Pode ser usado para organizar materiais de mesa ou como recipiente decorativo para arranjos secos e objetos compatíveis.",
    images: productImages("Porta-Lápis / Cachepô Moderno", [
      "https://cf.shopee.com.br/file/br-11134207-81z1k-mfbjdnw61hc7b4",
      "https://cf.shopee.com.br/file/br-11134207-81z1k-mfbjdnw908hwb0",
      "https://cf.shopee.com.br/file/br-11134207-81z1k-mfbjdnw9bh1g0c",
      "https://cf.shopee.com.br/file/br-11134207-81z1k-mfbjdnw91n2c1b",
      "https://cf.shopee.com.br/file/br-11134207-81z1k-mfbjdnw931msbf",
      "https://cf.shopee.com.br/file/br-11134207-81z1k-mfbjdnw95uro65"
    ]),
    materials: ["PLA"],
    variants: [
      productVariant("Azul", "https://cf.shopee.com.br/file/br-11134207-81z1k-mfbjdnw98nwk36"),
      productVariant("Rosa", "https://cf.shopee.com.br/file/br-11134207-81z1k-mfbjdnw979c4c8"),
      productVariant("Verde", "https://cf.shopee.com.br/file/br-11134207-81z1k-mfbjdnw9a2h04b"),
      productVariant("Kit com os 3", "https://cf.shopee.com.br/file/br-11134207-81z1k-mfbl918rj3lzef")
    ],
    measurements: [
      {
        label: "Modelo demonstrado",
        values: [
          { label: "Largura", value: "5,03 cm" },
          { label: "Profundidade", value: "5,05 cm" },
          { label: "Altura", value: "7,39 cm" }
        ]
      }
    ],
    specs: [
      { label: "Material", value: "PLA" },
      { label: "Superfície", value: "Ondulada" },
      { label: "Uso indicado", value: "Mesa, escritório e decoração" },
      { label: "Produção", value: "Impressão 3D" }
    ],
    availability: "sob-consulta",
    source: "Artesópolis Admin / Shopee live",
    lastVerifiedAt: "2026-10-05T05:30:28.245504Z",
    shopeeUrl: shopeeProductUrl("23994442959")
  },
  {
    slug: "chaveiro-mureta-santos",
    title: "Chaveiro Mureta de Santos",
    contextLabel: "Acessório",
    summary:
      "Miniatura inspirada nas tradicionais muretas da orla de Santos, produzida como chaveiro.",
    description:
      "A peça transforma um elemento reconhecível da paisagem de Santos em um chaveiro compacto. As variações alteram a combinação de letras e argola; a escolha final é feita no anúncio da Shopee.",
    images: productImages("Chaveiro Mureta de Santos", [
      "https://cf.shopee.com.br/file/br-11134207-81z1k-mebst2qxy1aacd",
      "https://cf.shopee.com.br/file/br-11134207-81z1k-mebsbnr78lxf2c",
      "https://cf.shopee.com.br/file/br-11134207-81z1k-mebst2qu05xff9",
      "https://cf.shopee.com.br/file/br-11134207-81z1k-mebst2qxzfuq67"
    ]),
    materials: ["PLA"],
    variants: [
      productVariant("Letra Branca · Argola Dourada"),
      productVariant("Letra Branca · Argola Prata", "https://cf.shopee.com.br/file/br-11134207-81z1k-mebst2qy7v9e24"),
      productVariant("Letra Colorida · Argola Prata", "https://cf.shopee.com.br/file/br-11134207-81z1k-mebst2qyaoeaab")
    ],
    measurements: [
      {
        label: "Peça",
        values: [
          { label: "Largura", value: "7,80 cm" },
          { label: "Profundidade", value: "2,40 cm" },
          { label: "Altura", value: "1,17 cm" }
        ]
      }
    ],
    specs: [
      { label: "Material", value: "PLA" },
      { label: "Formato", value: "Miniatura de mureta" },
      { label: "Uso", value: "Chaveiro e lembrança" },
      { label: "Produção", value: "Impressão 3D" }
    ],
    availability: "sob-consulta",
    source: "Artesópolis Admin / Shopee live",
    lastVerifiedAt: "2026-10-05T05:30:12.608015Z",
    shopeeUrl: shopeeProductUrl("23194376258")
  },
  {
    slug: "estojo-duplo-compacto",
    title: "Estojo Duplo Compacto com Tampa",
    contextLabel: "Organização portátil",
    summary:
      "Estojo estreito com dois compartimentos redondos independentes para separar pequenos acessórios.",
    description:
      "Os dois compartimentos possuem tampas independentes e ajudam a manter objetos pequenos separados dentro de bolsa, mochila ou gaveta. O acabamento do modelo publicado é levemente fosco.",
    images: productImages("Estojo Duplo Compacto com Tampa", [
      "https://cf.shopee.com.br/file/br-11134207-81z1k-mfmtbyenknpg4d",
      "https://cf.shopee.com.br/file/br-11134207-81z1k-mfmtbyei5erked",
      "https://cf.shopee.com.br/file/br-11134207-81z1k-mfmtbyekyjnrc0"
    ]),
    materials: ["PLA"],
    variants: [],
    measurements: [
      {
        label: "Peça",
        values: [
          { label: "Altura", value: "11,5 cm" },
          { label: "Largura", value: "3,3 cm" },
          { label: "Profundidade", value: "1,9 cm" }
        ]
      }
    ],
    specs: [
      { label: "Material", value: "PLA" },
      { label: "Compartimentos", value: "2 independentes" },
      { label: "Acabamento", value: "Textura levemente fosca" },
      { label: "Produção", value: "Impressão 3D" }
    ],
    availability: "sob-consulta",
    source: "Artesópolis Admin / Shopee live",
    lastVerifiedAt: "2026-10-05T05:30:11.562280Z",
    shopeeUrl: shopeeProductUrl("22499019708")
  },
  {
    slug: "porta-figurinhas-3d",
    title: "Porta Figurinhas 3D com Tampa",
    contextLabel: "Cards e colecionáveis",
    summary:
      "Caixa compacta com tampa deslizante para organizar e proteger mais de 100 figurinhas ou cards de tamanho semelhante.",
    description:
      "A estrutura rígida evita que as figurinhas fiquem soltas na mochila ou gaveta. A tampa deslizante mantém o conjunto fechado e o formato continua compacto para transporte.",
    images: productImages("Porta Figurinhas 3D com Tampa", [
      "https://cf.shopee.com.br/file/br-11134207-820lq-mlc23k2oey2u25",
      "https://cf.shopee.com.br/file/br-11134207-820l7-mlc23k2odjie1c",
      "https://cf.shopee.com.br/file/br-11134207-820ld-mnu3jw6cyxvmdd",
      "https://cf.shopee.com.br/file/br-11134207-820mb-mnu3jw6d4k5e97",
      "https://cf.shopee.com.br/file/br-11134207-820lw-mnu3jw6d35kyc0",
      "https://cf.shopee.com.br/file/br-11134207-820mh-mnu3jw6d5ypu94"
    ]),
    materials: ["PLA"],
    variants: [
      productVariant("Azul · Verde · Amarelo", "https://cf.shopee.com.br/file/br-11134207-820l6-mmgh90lp998ge0"),
      productVariant("Branco · Verde · Amarelo", "https://cf.shopee.com.br/file/br-11134207-820lq-mm9dazlrchs0dc"),
      productVariant("Galáxia · Preto", "https://cf.shopee.com.br/file/br-11134207-820m9-mo5ez740zhms06"),
      productVariant("Laranja · Azul", "https://cf.shopee.com.br/file/br-11134207-820l8-mo5ez7458lj5ed"),
      productVariant("Preto · Branco", "https://cf.shopee.com.br/file/br-11134207-820lz-mnij81svyfwg23"),
      productVariant("Preto · Verde · Amarelo", "https://cf.shopee.com.br/file/br-11134207-820lo-mlc23k2ohr7q5e"),
      productVariant("Rosa · Branco", "https://cf.shopee.com.br/file/br-11134207-820m7-mnij81t4w3y9ae"),
      productVariant("Todo Preto", "https://cf.shopee.com.br/file/br-11134207-820lv-mnztl1cwb30hf3")
    ],
    measurements: [
      {
        label: "Produto fechado",
        values: [
          { label: "Comprimento", value: "8,5 cm" },
          { label: "Largura", value: "6,5 cm" },
          { label: "Altura", value: "3,5 cm" }
        ]
      }
    ],
    specs: [
      { label: "Material", value: "PLA" },
      { label: "Capacidade", value: "Mais de 100 figurinhas padrão" },
      { label: "Tampa", value: "Deslizante" },
      { label: "Produção", value: "Impressão 3D" }
    ],
    availability: "sob-consulta",
    source: "Artesópolis Admin / Shopee live",
    lastVerifiedAt: "2026-10-05T05:30:31.767081Z",
    shopeeUrl: shopeeProductUrl("58206080464")
  },
  {
    slug: "porta-figurinhas-grande-3d",
    title: "Porta Figurinhas Grande 3D",
    contextLabel: "Cards e colecionáveis",
    summary:
      "Versão ampliada com tampa deslizante para organizar mais de 250 figurinhas e manter repetidas no mesmo lugar.",
    description:
      "A versão grande mantém a mesma lógica de tampa deslizante do modelo compacto, mas aumenta bastante a capacidade. É indicada para quem prefere guardar coleção principal e repetidas em uma única peça.",
    images: productImages("Porta Figurinhas Grande 3D", [
      "https://cf.shopee.com.br/file/br-11134207-820lf-mmgh90lf89a8f0",
      "https://cf.shopee.com.br/file/br-11134207-820md-mmgh90lpanswf6",
      "https://cf.shopee.com.br/file/br-11134207-820m1-mmgh90lpc2dcb7"
    ]),
    materials: ["PLA"],
    variants: [
      productVariant("Base Preta · Tampa Taça", "https://cf.shopee.com.br/file/br-11134207-820lb-mofbo0zay51h27"),
      productVariant("Base Preta · Verde · Amarelo", "https://cf.shopee.com.br/file/br-11134207-820ly-mofbo0z91b7qe6")
    ],
    measurements: [
      {
        label: "Produto fechado",
        values: [
          { label: "Comprimento", value: "17,2 cm" },
          { label: "Largura", value: "7,1 cm" },
          { label: "Altura", value: "3,5 cm" }
        ]
      }
    ],
    specs: [
      { label: "Material", value: "PLA" },
      { label: "Capacidade", value: "Mais de 250 figurinhas padrão" },
      { label: "Tampa", value: "Deslizante" },
      { label: "Produção", value: "Impressão 3D" }
    ],
    availability: "sob-consulta",
    source: "Artesópolis Admin / Shopee live",
    lastVerifiedAt: "2026-10-05T05:30:40.807494Z",
    shopeeUrl: shopeeProductUrl("58257930779")
  }
];

export function findStudioProduct(slug: string) {
  return studioProducts.find((product) => product.slug === slug);
}
