# Catálogo 3D

## Separações essenciais

O Estúdio público tem três papéis que não devem ser misturados:

- **Impressões**: prova/galeria;
- **Orçamento**: contratação de projeto sob medida;
- **Produtos**: itens comerciais publicados.

Material define propriedades e acabamento. Cor é uma opção de filamento, possivelmente vinculada a material, fabricante e acabamento. Combinação permitida relaciona produto, material e cores. Disponibilidade pronta pertence à variante física, não ao mostruário.

Mostrar uma cor disponível para produzir não significa informar estoque de uma peça pronta. Prazo de produção, prazo de envio e disponibilidade são informações distintas. Uma simulação de cor não equivale à fotografia de uma peça impressa naquela cor.

## Impressões, conceitos e produtos

A área **Impressões** é uma galeria do que saiu das impressoras e do repertório visual do Estúdio.

Cada item deve ter estado editorial explícito:

- **produzido** — existe peça física e mídia que comprova;
- **conceito/estudo** — proposta visual não apresentada como peça fabricada;
- **produto** — item realmente oferecido comercialmente;
- **projeto de cliente** — trabalho real com autorização de exposição.

Peças pessoais, estudos e trabalhos inspirados em propriedades intelectuais de terceiros podem aparecer quando houver base legítima para exibição, mas isso não autoriza preço, estoque, SKU, CTA de compra ou link Shopee.

Um conceito nunca deve ser descrito como peça já produzida.

## Produtos comerciais

A área **Produtos** contém somente peças que o Estúdio realmente vende e pode publicar como oferta comercial.

Fluxo:

`/studio` → `/studio/produtos` → `/studio/produtos/[slug]` → Shopee

O link externo de compra entra no nível do produto. A página própria precisa ter valor mesmo quando o checkout acontece na Shopee.

A página individual segue o contrato visual [STUDIO_PRODUCT_PAGE_VISUAL_V1.md](design/STUDIO_PRODUCT_PAGE_VISUAL_V1.md): galeria com foto/vídeo útil, variações reais, dimensões legíveis e ficha técnica. O CTA comercial é **Comprar na Shopee**.

O CM **não possui carrinho, “Adicionar ao carrinho”, checkout próprio ou seletor de quantidade para compra local**. Preço e estoque só aparecem quando houver origem sincronizada e confiável; caso contrário, a Shopee é a fonte final dessas informações.

## Serviços

Existe uma separação importante:

- **Impressão 3D sob demanda** — cliente já possui arquivo 3D e quer análise/fabricação;
- **Projeto personalizado** — cliente precisa adaptar/criar uma solução, como placa, caixa ou outra peça.

Placas e caixas são as especialidades personalizadas prioritárias.

Impressão sob demanda não deve ficar escondida dentro de “outra peça”: é um serviço-base próprio.

Serviço personalizado não é “produto com preço escondido”. A página de serviço explica possibilidades, prova real, limitações e informações necessárias; o próximo passo é [Orçamento](STUDIO_QUOTE_FLOW_V1.md).

Materiais & Cores são conteúdo de apoio dentro de:

- páginas de serviço;
- projetos;
- produtos;
- formulário de orçamento.

Não são um pilar de primeiro nível do Estúdio nesta fase.

## Conteúdo mínimo

| Entidade | Informação necessária |
| --- | --- |
| Impressão/projeto | ID, slug opcional, estado editorial, título, descrição curta, fotos, categoria e permissão de exposição |
| Produto | ID, slug, nome, descrição, categoria, dimensões com unidade, fotos, vídeos quando úteis, variações reais, estado de publicação e link Shopee quando aplicável |
| Material/cor | ID, nome legível, acabamento, amostra/foto e situação de disponibilidade conhecida |
| Variante | Produto, combinações válidas e condição: pronta, sob consulta ou indisponível |
| Caso de cliente | Pedido resumido, resultado, fotos autorizadas, possibilidades de personalização e nenhuma informação pessoal desnecessária |
| Serviço | slug, proposta, tipos de uso reais, prova associada, limitações e CTA para orçamento |

Campos de preço e prazo só devem ser exibidos quando confirmados e com origem conhecida. Não publicar custos internos.

## Primeiro recorte

O primeiro recorte comercial prioriza:

1. página clara de **Impressão 3D sob demanda** para arquivo pronto;
2. uma ou mais provas fortes para **Placas personalizadas**;
3. prova suficiente para **Caixas personalizadas**;
4. galeria de Impressões honesta;
5. fluxo de Orçamento;
6. primeiros Produtos próprios com página individual.

Cadastro completo, estoque em tempo real, cálculo automático de orçamento e configurador 3D não são pré-requisitos.

## Origem e atualização

A origem pública inicial de Produtos está definida como **projeção editorial controlada do catálogo live do Artesópolis Admin/Shopee**.

Nesta fase o CM mantém um snapshot público curado no código com somente mídia, nome, descrição sanitizada, medidas, material, variações e link comercial. Custos, SKU, quantidade de estoque, payload bruto e demais dados operacionais não entram no site público.

Sincronização dinâmica pode ser adicionada depois; não é pré-requisito para publicar a página de produto. Registrar origem e data de atualização; dados desconhecidos ficam como “sob consulta”, nunca como estoque garantido.

Separar estado editorial (`draft`, `published`, `archived`) de disponibilidade física. Um item publicado pode estar indisponível.

Publicar um objeto não autoriza expor arquivo de fabricação ou dados pessoais do cliente.

## Imagens e descoberta

Fotos de peças são conteúdo.

Regras:

- foto principal deve ser renderizada como mídia HTML quando for prova da peça;
- texto alternativo deve descrever a imagem naturalmente;
- contexto textual precisa explicar o que está sendo mostrado;
- conceito deve ser identificado como conceito;
- não publicar rosto, QR, telefone, endereço ou outros dados de cliente sem autorização apropriada;
- imagens de projeto podem alimentar Google Images e precisam seguir o contrato de Search.

Ver [STUDIO_SEARCH_DISCOVERY_V1.md](STUDIO_SEARCH_DISCOVERY_V1.md).

## Interação 3D e exposição

Modelo interativo é opcional e deve ter permissão específica de distribuição. Um arquivo entregue ao navegador deve ser tratado como recuperável pelo visitante; não prometer proteção de STL/GLB apenas por esconder o link. Para ativos restritos, usar imagens ou vídeo autorizados.

Fotos continuam utilizáveis sem WebGL. Rotação e troca de cor, quando implementadas, respeitam a seleção válida e indicam simulação visual. Não representar brilho, textura ou luz de filamento de maneira enganosa.

## Aceite

Conferir:

- dados com a peça real;
- estado produzido/conceito correto;
- unidades e fotos;
- combinações inválidas bloqueadas;
- nenhuma falsa promessa de estoque, preço ou prazo;
- orçamento funcional;
- rascunhos ausentes da leitura pública;
- fotos sem exposição indevida de dados;
- páginas de produto com valor próprio antes da Shopee;
- navegação preservando a Rádio;
- rotas estratégicas seguindo o contrato de Search.

Usabilidade no celular e alternativa estática seguem [EXPERIENCE.md](EXPERIENCE.md).
