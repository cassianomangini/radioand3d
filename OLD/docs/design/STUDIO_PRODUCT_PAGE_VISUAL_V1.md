# STUDIO_PRODUCT_PAGE_VISUAL_V1 — Produto individual

Status: **direção visual final aprovada**  
approved_by: **Cassiano — 05/10/2026**  
route: `/studio/produtos/[slug]`  
artifact_ref: **docs/design/STUDIO_PRODUCT_PAGE_VISUAL_V1.md**

Este documento cristaliza a direção visual da página individual de produto a partir da composição final aprovada em 05/10/2026.

A página deve funcionar como uma **ficha técnica visual clara e premium antes da Shopee**. Ela não tenta reconstruir a Shopee e não implementa checkout próprio.

## 1. Objetivo

Antes de sair para a Shopee, a pessoa precisa conseguir entender sem esforço:

- o que é a peça;
- para que serve;
- como ela é fisicamente;
- dimensões externas e, quando aplicável, internas;
- material;
- acabamento;
- variações reais;
- fotos e vídeos úteis;
- detalhes técnicos relevantes.

A Shopee permanece responsável pela compra, pagamento, frete e disponibilidade comercial final.

## 2. Composição desktop aprovada

A primeira área é densa o suficiente para responder às perguntas principais sem espalhar informações por vários cards.

Estrutura:

```text
BREADCRUMB

┌──────────┬──────────────────────────────┬──────────────────────────────────┐
│ mídia    │ FOTO / VÍDEO PRINCIPAL      │ categoria                        │
│ vertical │                              │ NOME DO PRODUTO                  │
│          │                              │ descrição curta                  │
│ [foto]   │                              │                                  │
│ [vídeo]  │                              │ preço/estado somente se confiável│
│ [foto]   │                              │                                  │
│ [foto]   │                              │ VARIAÇÕES / CORES REAIS          │
│          │                              │ [thumbs / swatches]               │
│          │                              │                                  │
│          │                              │ [ COMPRAR NA SHOPEE ]            │
└──────────┴──────────────────────────────┴──────────────────────────────────┘

┌────────────────────────────────────────┬──────────────────────────────────┐
│ DIMENSÕES                              │ DETALHES DA PEÇA                 │
│ diagrama externo + interno             │ material                         │
│ com medidas legíveis                   │ dimensões                        │
│                                        │ acabamento                       │
│                                        │ produção/uso quando relevante    │
└────────────────────────────────────────┴──────────────────────────────────┘

DESCRIÇÃO / CONTEXTO DE USO
texto editorial + mídia adicional quando realmente ajudar
```

A composição deve privilegiar leitura e comparação visual, não ornamentação.

## 3. Galeria e vídeo

A galeria é parte central da página.

### Desktop

- miniaturas em coluna ao lado da mídia principal;
- mídia principal grande;
- navegação anterior/próxima discreta quando houver mais de uma mídia;
- vídeo entra na mesma galeria e é identificado por controle de play;
- imagem pode abrir em visualização ampliada;
- miniatura selecionada tem estado claro, sem glow excessivo.

### Tipos de mídia úteis

Prioridade:

1. peça inteira;
2. interior/abertura/encaixe;
3. lateral ou detalhe de acabamento;
4. escala/contexto de uso;
5. vídeo curto mostrando uso, abertura, encaixe ou acabamento.

Não preencher galeria com ângulos redundantes apenas para aumentar quantidade.

## 4. Bloco de decisão

Na lateral da mídia principal:

- categoria ou contexto curto;
- nome do produto;
- descrição objetiva do uso;
- preço e situação comercial somente quando a origem for confiável e suficientemente atualizada;
- variações reais;
- CTA único de compra.

A página não precisa repetir material, dimensões e acabamento várias vezes dentro da mesma primeira dobra.

## 5. Compra — contrato obrigatório

Existe **um único CTA comercial principal**:

**Comprar na Shopee**

Não existem no CM:

- botão **Adicionar ao carrinho**;
- carrinho;
- checkout próprio;
- botão genérico **Comprar agora**;
- seletor de quantidade associado a carrinho/checkout;
- cálculo de frete;
- fluxo de pagamento local.

O botão sempre deixa explícito o destino externo.

Abaixo do CTA pode existir uma linha curta:

> Compra, pagamento e disponibilidade final são confirmados na Shopee.

### Preço e disponibilidade

Preço/estoque podem aparecer no CM **somente se houver sincronização confiável**.

Sem sincronização confiável:

- não exibir número possivelmente desatualizado;
- não inventar “em estoque”;
- manter o botão **Comprar na Shopee**;
- a Shopee passa a ser a fonte final de preço e disponibilidade.

O rótulo do botão não muda para “Ver preço e disponibilidade”; a ação principal aprovada continua sendo **Comprar na Shopee**.

## 6. Variações e cores

As variações devem ser muito mais legíveis que na Shopee.

Quando houver cores:

- mostrar visualmente cada opção;
- usar nome legível;
- destacar seleção atual;
- representar somente cores/combinações realmente oferecidas;
- uma miniatura/render de variante só pode ser usada se for fiel à opção;
- simulação deve ser identificável como simulação quando não houver foto real daquela variante.

A seleção de variação não cria estado de carrinho.

Se a variação puder ser mapeada de forma confiável ao anúncio/modelo correspondente da Shopee, o CTA pode abrir o destino específico. Caso contrário, o CTA abre o produto e a escolha final acontece na Shopee.

## 7. Dimensões

Dimensão é conteúdo de primeira classe, não uma linha perdida em descrição.

Usar diagrama visual quando a geometria justificar.

Para caixas e organizadores, quando aplicável:

- comprimento;
- largura;
- altura;
- medidas externas;
- medidas internas;
- gaveta/compartimento;
- espessura ou encaixe quando relevante.

O diagrama é asset técnico/SVG, não perspectiva improvisada em CSS.

Medidas escritas no diagrama devem bater com a ficha técnica textual.

## 8. Detalhes da peça

A ficha técnica fica próxima das dimensões.

Mostrar apenas campos úteis, por exemplo:

- material;
- dimensões externas;
- dimensões internas;
- acabamento;
- tipo de produção;
- uso indicado;
- outras características que realmente alterem decisão.

Evitar:

- ícone decorativo para cada linha;
- badges redundantes;
- frases promocionais sem informação;
- repetir “impressão 3D” em toda linha.

A legibilidade vem de alinhamento, tipografia e espaçamento.

## 9. Descrição e conteúdo adicional

Depois da área técnica, a descrição pode explicar:

- problema que a peça resolve;
- organização/uso;
- abertura, encaixe ou funcionamento;
- cuidados;
- limitações;
- diferenças entre versões.

Usar foto/vídeo adicional apenas quando acrescentar compreensão.

Não transformar a parte inferior em outra landing page cheia de features.

## 10. Mobile

Ordem:

1. mini player persistente;
2. breadcrumb compacto quando couber;
3. galeria;
4. nome + descrição curta;
5. variações;
6. CTA **Comprar na Shopee**;
7. dimensões;
8. ficha técnica;
9. descrição/mídia adicional;
10. ponte para orçamento quando aplicável.

No mobile:

- miniaturas podem virar trilho horizontal;
- diagramas de dimensão empilham;
- tabela/ficha técnica vira linhas simples;
- não usar CTA sticky na primeira versão;
- não adicionar carrinho mobile;
- não duplicar o botão Shopee em várias barras persistentes.

## 11. Ponte para personalizado

Quando fizer sentido, depois da informação do produto:

**Precisa de algo parecido, mas com outra medida?**

→ **Pedir orçamento**

Esse CTA é secundário e não compete com **Comprar na Shopee**.

## 12. Regras visuais

A página pertence ao mundo visual do Estúdio:

- dark premium atual do produto;
- azul/roxo como acento controlado;
- fotografia e peça física dominam;
- bordas discretas;
- pouco glow;
- sem fileiras de ícones de benefício;
- sem card dentro de card sem função;
- densidade informacional organizada;
- desktop aproveita largura para leitura simultânea de mídia + decisão + ficha técnica.

O valor da página vem de **clareza técnica + mídia real + hierarquia**, não de decoração.

## 13. Não implementar

- carrinho;
- adicionar ao carrinho;
- checkout;
- quantity picker para compra local;
- favoritos sem função real;
- avaliações inventadas;
- badges de urgência;
- promoções falsas;
- estoque local não sincronizado;
- frete local;
- grade de ícones genéricos;
- informação duplicada para preencher tela.

## 14. Gate de frontend

A direção visual da página individual de produto está aprovada.

O frontend pode implementar esta superfície respeitando:

- dados reais;
- galeria real;
- vídeo quando disponível;
- diagramas dimensionais corretos;
- variações verdadeiras;
- CTA único Shopee;
- ausência total de carrinho/checkout interno.

ready_for_frontend: **yes — produto individual**  
approved_by: **Cassiano — 05/10/2026**
