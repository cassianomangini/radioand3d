# Catálogo 3D

## Separações essenciais

Produto é o modelo/peça oferecida. Material define propriedades e acabamento. Cor é uma opção de filamento, possivelmente vinculada a material, fabricante e acabamento. Combinação permitida relaciona produto, material e cores. Disponibilidade pronta pertence à variante física, não ao mostruário.

Mostrar uma cor disponível para produzir não significa informar estoque de uma peça pronta. Prazo de produção, prazo de envio e disponibilidade são informações distintas. Uma simulação de cor não equivale à fotografia de uma peça impressa naquela cor.

## Separação entre galeria e produtos comerciais

A área **Impressões** é uma galeria do que saiu das impressoras. Ela pode mostrar fotos de peças pessoais, estudos e trabalhos inspirados em propriedades intelectuais de terceiros quando houver base legítima para exibição, mas esses itens não recebem preço, estoque, CTA de compra, SKU nem link para Shopee apenas por aparecerem na galeria.

A área **Produtos** é comercial. Ela contém somente peças que o estúdio realmente vende e pode publicar como oferta comercial. O card **Loja Shopee** em `/studio` navega primeiro para `/studio/produtos`, onde cada item terá informações próprias; o link externo de compra entra no nível do produto, não no card geral do Estúdio.

## Conteúdo mínimo

| Entidade | Informação necessária |
| --- | --- |
| Produto | ID, slug, nome, descrição, categoria, dimensões com unidade, fotos e estado de publicação |
| Material/cor | ID, nome legível, acabamento, amostra/foto e situação de disponibilidade conhecida |
| Variante | Produto, combinações válidas e condição: pronta, sob consulta ou indisponível |
| Caso de cliente | Pedido resumido, resultado, fotos autorizadas e possibilidades de personalização |

Campos de preço e prazo só devem ser exibidos quando confirmados e com origem conhecida. Não publicar custos internos. Textos de contato e links comerciais dependem da decisão da entrega 01.

## Primeiro recorte

Uma peça real com fotos, medidas, opções compatíveis e próximo passo de contato/compra definido. Mostruário com exemplos autorizados, incluindo uma combinação inválida para testar a proteção da interface. Um caso de cliente entra somente se houver conteúdo e permissão; caso contrário, não inventar portfólio.

Cadastro completo, estoque em tempo real, cálculo de orçamento e configurador 3D não são pré-requisitos desse recorte. Evitar duplicar o sistema operacional já existente.

## Origem e atualização

Na entrega 01, decidir entre leitura pública controlada do Admin ou cadastro editorial mínimo mantido no CM. Registrar origem e data de atualização; dados desconhecidos ficam como sob consulta, nunca como estoque garantido. Definir um responsável para atualizar cada informação.

Separar estado editorial (`draft`, `published`, `archived`) de disponibilidade física. Um item publicado pode estar indisponível. Publicar um objeto não autoriza expor arquivo de fabricação ou dados pessoais do cliente.

## Interação 3D e exposição

Modelo interativo é opcional e deve ter permissão específica de distribuição. Um arquivo entregue ao navegador deve ser tratado como recuperável pelo visitante; não prometer proteção de STL/GLB apenas por esconder o link. Para ativos restritos, usar imagens ou vídeo autorizados.

Fotos continuam utilizáveis sem WebGL. Rotação e troca de cor, quando implementadas, respeitam a seleção válida e indicam simulação visual. Não representar brilho, textura ou luz de filamento de maneira enganosa.

## Aceite

Conferir dados com a peça real; unidades e fotos corretas; combinações inválidas bloqueadas; nenhuma falsa promessa de estoque; contato funcional; rascunhos ausentes da leitura pública; fotos sem dados de clientes; navegação preservando a rádio. Usabilidade no celular e alternativa estática seguem [EXPERIENCE.md](EXPERIENCE.md).
