// Copy editorial exclusiva do site. A Shopee continua sendo a fonte do nome original.
// A chave e o slug publico estavel; sincronizacoes de catalogo nao alteram esta tabela.
export type ProductTitleInput = { slug: string; name: string; seoTitle?: string };

type EditorialTitle = Readonly<{ displayTitle: string; seoTitle: string }>;

export const curatedProductTitles: Readonly<Record<string, EditorialTitle>> = {
  "porta-controles-de-mesa": { displayTitle: "Porta-Controles com 2 Divisórias", seoTitle: "Porta-Controles de Mesa com 2 Divisórias" },
  "kit-porta-figurinhas-3d": { displayTitle: "Kit Porta-Figurinhas com Tampa", seoTitle: "Kit Porta-Figurinhas com Tampa para Cards" },
  "nave-espacial-espiral": { displayTitle: "Nave Alienígena de Encaixe", seoTitle: "Nave Alienígena com Encaixe em Espiral" },
  "bolinhas-basquete-sensoriais": { displayTitle: "Kit 2 Bolinhas de Basquete Giratórias", seoTitle: "Kit 2 Bolinhas de Basquete Giratórias" },
  "fita-cassete-retro": { displayTitle: "Fita Cassete Retrô Decorativa", seoTitle: "Fita Cassete Retrô Decorativa em 3D" },
  "kit-porta-curativos": { displayTitle: "Kit Porta-Curativos + Caixa Portátil", seoTitle: "Kit Porta-Curativos e Caixa Portátil" },
  "casinha-porta-iscas-formiga": { displayTitle: "Casinha Porta-Iscas para Formigas", seoTitle: "Casinha Porta-Iscas para Formigas" },
  "estojo-duplo-compacto": { displayTitle: "Estojo Duplo com Tampa", seoTitle: "Estojo Duplo com Tampa e 2 Compartimentos" },
  "porta-figurinhas-3d": { displayTitle: "Porta-Figurinhas com Tampa", seoTitle: "Porta-Figurinhas com Tampa para Cards" },
  "trio-estrelas-decorativas": { displayTitle: "Trio de Estrelas Decorativas", seoTitle: "Trio de Estrelas Decorativas para Natal" },
  "porta-lapis-cachepo": { displayTitle: "Porta-Lápis e Pincéis Multiuso", seoTitle: "Porta-Lápis e Pincéis Multiuso" },
  "imas-frases-veganas-2": { displayTitle: "Kit 2 Ímãs com Frases Veganas", seoTitle: "Kit 2 Ímãs de Geladeira com Frases Veganas" },
  "porta-remedios-semanal": { displayTitle: "Porta-Remédios Semanal (7 Dias)", seoTitle: "Porta-Remédios Semanal de 7 Dias" },
  "porta-controle-good-vibes": { displayTitle: "Vaso Decorativo Good Vibes Only", seoTitle: "Vaso Decorativo Good Vibes Only" },
  "imas-frases-veganas-4": { displayTitle: "Kit 4 Ímãs com Frases Veganas", seoTitle: "Kit 4 Ímãs de Geladeira com Frases Veganas" },
  "suporte-celular-articulado": { displayTitle: "Suporte de Celular Articulado", seoTitle: "Suporte de Celular Articulado de Mesa" },
  "caixinha-organizadora-pequena": { displayTitle: "Caixinha para Cotonetes e Fio Dental", seoTitle: "Caixinha para Cotonetes e Fio Dental" },
  "caixa-organizadora-quadrada": { displayTitle: "Caixa Quadrada com Tampa de Encaixe", seoTitle: "Caixa Quadrada com Tampa de Encaixe" },
  "porta-curativos-compacto": { displayTitle: "Porta-Curativos Compacto", seoTitle: "Porta-Curativos Compacto para Bolsa e Viagem" },
  "caixa-organizadora-grande": { displayTitle: "Caixa Grande com Tampa Deslizante", seoTitle: "Caixa Organizadora Grande com Tampa Deslizante" },
  "mini-arvore-pinheiro": { displayTitle: "Mini Pinheiro Decorativo", seoTitle: "Mini Pinheiro Decorativo para Natal" },
  "caixa-organizadora-dois-compartimentos": { displayTitle: "Caixa Portátil com 2 Compartimentos", seoTitle: "Caixa Organizadora com 2 Compartimentos" },
  "martelo-thor-rotativo": { displayTitle: "Martelo Nórdico Rotativo", seoTitle: "Martelo Nórdico Rotativo de Brinquedo" },
  "dinossauro-articulado-t-rex": { displayTitle: "Dinossauro T-Rex Articulado", seoTitle: "Dinossauro T-Rex Articulado Flexível" },
  "capa-botao-descarga": { displayTitle: "Capa para Botão de Descarga do Vaso", seoTitle: "Capa para Botão de Descarga de Vaso Sanitário" },
  "chaveiro-mureta-santos": { displayTitle: "Chaveiro Mureta de Santos", seoTitle: "Chaveiro Mureta de Santos em 3D" },
  "dummy-13-boneco-articulado": { displayTitle: "Dummy 13 – Boneco para Montar", seoTitle: "Dummy 13 – Boneco Articulado para Montar" },
};

// Produto novo ainda exige revisao editorial antes de entrar no Google.
// Para os cards, usar os termos iniciais do anuncio sem inventar atributos.
export function suggestProductDisplayTitle(original: string): string {
  const normalized = original.replace(/\s+/g, " ").trim();
  const first = normalized.split(/\s+(?:[|–—-])\s+/u, 1)[0]?.trim() ?? normalized;
  const candidate = first.length >= 12 ? first : normalized;
  if (candidate.length <= 48) return candidate;
  const lastSpace = candidate.slice(0, 49).lastIndexOf(" ");
  // Nao cortar uma palavra ao meio quando houver uma separacao util.
  const end = lastSpace >= 24 ? lastSpace : 48;
  return candidate.slice(0, end).trimEnd();
}

function editorialTitle(slug: string): EditorialTitle | undefined {
  return Object.hasOwn(curatedProductTitles, slug) ? curatedProductTitles[slug] : undefined;
}

export function getProductDisplayTitle(product: ProductTitleInput): string {
  return editorialTitle(product.slug)?.displayTitle ?? suggestProductDisplayTitle(product.name);
}

export function getProductSeoTitle(product: ProductTitleInput): string {
  const editorial = editorialTitle(product.slug);
  const base = editorial?.seoTitle
    ?? (product.seoTitle && product.seoTitle.trim() !== product.name.trim()
      ? product.seoTitle.trim() : getProductDisplayTitle(product));
  // Metadados do site usam a marca comercial, mesmo se a origem ainda vier
  // com o nome anterior. O titulo bruto Shopee nao e modificado.
  const unbranded = base.replace(/\s*\|\s*(?:CMangini\s*3D|CM\s*3D|Artesópolis)\s*$/iu, "").trim();
  return unbranded + " | CMangini3D";
}
