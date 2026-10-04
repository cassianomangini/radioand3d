# STUDIO_COMMERCE_WIREFRAMES_V1 — Wireframes funcionais

Status: **proposta para revisão de Cassiano**  
depends_on: [STUDIO_COMMERCE_EXPERIENCE_V1.md](STUDIO_COMMERCE_EXPERIENCE_V1.md)  
ready_for_frontend: **no**  
approved_by: **pending**  
Versão: **V1 — 04/10/2026**

Este documento fecha a disposição funcional das quatro superfícies que precisam estar resolvidas antes do frontend visual: hub `/studio`, Placas, Orçamento e Produto individual.

Não é especificação de CSS. Os blocos identificam **função, ordem, peso e tipo de recurso**.

---

## 1. Regra de tela desktop

A Rádio continua persistente no desktop. O Estúdio ocupa a outra região e é a área que rola.

O conteúdo comercial do Estúdio não deve exigir que a Rádio seja escondida para ser compreendido.

Referência de composição:

```text
┌──────────────────── RÁDIO ────────────────────┬──────────── ESTÚDIO / CONTEÚDO ────────────┐
│ player completo                              │ conteúdo comercial                          │
│ playlist / letras / controles                │ scroll próprio da página                   │
│ operação sem scroll da página                │                                             │
└───────────────────────────────────────────────┴─────────────────────────────────────────────┘
```

Em largura de laptop, a Rádio pode usar seu limite mínimo aprovado; o conteúdo do Estúdio deve continuar legível sem virar coluna estreita de cards.

---

# 2. HUB /studio — desktop

## Objetivo

Em menos de um viewport útil, o visitante precisa entender:

- que existe prova real;
- que pode pedir algo sob medida;
- que existem produtos prontos.

Não repetir o hero da Home.

## Estrutura

```text
┌──────────────────────────────────────────────────────────────────────┐
│ ESTÚDIO DE IMPRESSÃO 3D                                             │
│ Projetos personalizados, peças que já produzimos e produtos prontos.│
│                                                                      │
│ ┌───────────────────────────────────┬──────────────────────────────┐ │
│ │                                   │ ORÇAMENTO                    │ │
│ │ IMPRESSÕES                        │ [foto/referência curta]       │ │
│ │ [FOTO REAL FORTE]                 │ Conte seu projeto             │ │
│ │                                   │ [Pedir orçamento →]           │ │
│ │                                   ├──────────────────────────────┤ │
│ │                                   │ PRODUTOS                      │ │
│ │ Veja o que já saiu do estúdio     │ [foto de produto real]        │ │
│ │ [Explorar impressões →]           │ [Ver produtos →]              │ │
│ └───────────────────────────────────┴──────────────────────────────┘ │
│                                                                      │
│ O QUE MAIS FAZEMOS SOB MEDIDA                                       │
│ ┌────────────────────────────┐  ┌────────────────────────────────┐  │
│ │ [foto placa]               │  │ [foto caixa]                   │  │
│ │ Placas personalizadas      │  │ Caixas personalizadas          │  │
│ │ [Conhecer →]               │  │ [Conhecer →]                   │  │
│ └────────────────────────────┘  └────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────┘
```

## Regras

- Impressões ocupa cerca de metade do mosaico e recebe a melhor imagem.
- Orçamento e Produtos têm peso menor.
- Não usar três cards visualmente idênticos.
- Não colocar filtros.
- Não mostrar impressoras/material como “feature”.
- A área de Placas/Caixas vem **depois** dos três pilares.
- O topo deve caber confortavelmente sem hero de 80vh.

## Recursos por bloco

| Bloco | Recurso |
| --- | --- |
| Intro | texto HTML |
| Impressões | foto real |
| Orçamento | foto/referência discreta + CTA |
| Produtos | foto real de produto |
| Placas | foto real |
| Caixas | foto real |

---

# 3. HUB /studio — mobile

```text
[MINI PLAYER]

ESTÚDIO DE IMPRESSÃO 3D
Projetos personalizados, peças que já produzimos
e produtos prontos.

IMPRESSÕES
[FOTO REAL LARGA]
Veja o que já saiu do estúdio.
[Explorar impressões →]

ORÇAMENTO
[FOTO/REFERÊNCIA]
Conte o que você precisa.
[Pedir orçamento →]

PRODUTOS
[FOTO PRODUTO]
Peças prontas para comprar.
[Ver produtos →]

O QUE MAIS FAZEMOS SOB MEDIDA

[FOTO PLACA]
Placas personalizadas
[Conhecer →]

[FOTO CAIXA]
Caixas personalizadas
[Conhecer →]
```

### Mobile não faz

- mosaico apertado;
- 2 colunas;
- CTA sticky no rodapé;
- cards muito altos com texto sobre imagem ilegível.

---

# 4. PLACAS — desktop

URL: `/studio/placas-personalizadas`

## Primeira dobra

```text
┌──────────────────────────────────────────────────────────────────────┐
│ PLACAS PERSONALIZADAS                                               │
│                                                                      │
│ Uma placa feita para o espaço,                                      │
│ a marca e a função que você precisa.        [FOTO REAL PRINCIPAL]   │
│                                                                      │
│ Logo · QR Code · balcão · parede · mesa                              │
│                                                                      │
│ [Pedir orçamento]                                                    │
└──────────────────────────────────────────────────────────────────────┘
```

A foto deve ser peça real, não mock.

## Segundo bloco — possibilidades

```text
O QUE PODE MUDAR DE UMA PLACA PARA OUTRA

[foto detalhe]          Tamanho e formato
                        Apoio ou fixação
                        Logo e texto
                        QR Code
                        Cores
                        Iluminação, quando aplicável
```

Sem ícone para cada item.

## Terceiro bloco — projeto real

```text
PROJETO REAL

[FOTO GRANDE]       [DETALHE]
                    contexto curto
                    medidas/material se publicáveis
                    o que foi personalizado
```

Se o Mano Jotta for autorizado, é o candidato natural para primeira prova.

## Quarto bloco — preparar orçamento

```text
PARA ENTENDER SEU PROJETO, AJUDA TER

logo ou arte
tamanho aproximado
referência
quantidade
onde a placa será usada

[Pedir orçamento de placa →]
```

O botão abre `/studio/orcamento?tipo=placa`.

---

# 5. PLACAS — mobile

Ordem:

1. título;
2. proposta;
3. CTA;
4. foto principal;
5. possibilidades;
6. projeto real;
7. CTA final.

Não colocar a foto antes de a pessoa entender onde chegou se isso empurrar o título para baixo do primeiro viewport.

---

# 6. ORÇAMENTO — shell comum

URL: `/studio/orcamento`

O fluxo é intencionalmente mais limpo que o restante do Estúdio.

Desktop:

```text
┌──────────────────────────────────────────────────────────────┐
│ ← Voltar ao Estúdio                     Etapa 2 de 6         │
│                                                              │
│ TÍTULO DA PERGUNTA                                           │
│ texto de ajuda curto                                         │
│                                                              │
│ [ opção ]                                                    │
│ [ opção ]                                                    │
│ [ opção ]                                                    │
│                                                              │
│                                      [Continuar →]            │
└──────────────────────────────────────────────────────────────┘
```

Não abrir um card flutuante dentro de outro painel. A página em si é a superfície.

Mobile:

```text
[MINI PLAYER]

← Voltar       2 de 6

TÍTULO

[ opção grande ]
[ opção grande ]
[ opção grande ]

[Continuar]
```

---

# 7. ORÇAMENTO — fluxo completo

## Etapa 1 — Tipo

**O que você quer fazer?**

- Placa
- Caixa
- Luminária
- Outra peça

Imagem só entra se houver foto real útil. Sem foto, escolha textual é suficiente.

## Etapa 2 — Ponto de partida

**De onde estamos começando?**

- Já tenho arquivo 3D
- Tenho logo, desenho ou arte
- Tenho foto ou referência
- Tenho as medidas
- Tenho apenas a ideia

Pode ser múltipla escolha quando necessário.

## Etapa 3 — Branch específico

### Placa

Dividir em pequenos grupos:

1. uso: balcão / parede / mesa / outro;
2. conteúdo: logo / texto / QR / combinação;
3. tamanho aproximado ou “não sei ainda”;
4. quantidade;
5. cores/referência quando houver.

### Caixa

1. o que precisa caber dentro;
2. medidas internas/externas ou “não sei ainda”;
3. tampa;
4. divisória/encaixe/furo;
5. quantidade.

## Etapa 4 — Referências e arquivos

```text
MOSTRE O QUE VOCÊ JÁ TEM

[Escolher foto ou arquivo]

ou, no desktop:
[área drag & drop]

arquivos selecionados:
logo.png                  remover
referencia.pdf            remover

[Não tenho arquivo agora]
```

## Etapa 5 — Produção

- quantidade se ainda não coletada;
- prazo desejado, opcional;
- logística somente quando definida operacionalmente;
- observações curtas.

## Etapa 6 — Contato

**Como podemos falar com você?**

[ WhatsApp ] [ E-mail ]

Depois da escolha, mostrar somente:

- nome;
- telefone **ou** e-mail.

## Revisão

```text
SEU PROJETO

Placa personalizada                  Editar
18 × 12 cm · 2 unidades

Logo + QR Code                       Editar
Uso em balcão

ARQUIVOS                             Editar
logo.png

CONTATO                              Editar
WhatsApp · (xx) xxxxx-xxxx

[Enviar para análise]
```

## Confirmação

```text
PROJETO RECEBIDO

Vamos analisar as informações enviadas.
Se precisarmos de algo a mais, usamos o contato escolhido.

[Voltar ao Estúdio]

Talvez você também queira ver:
[2 ou 3 impressões relacionadas]
```

Sem CTA obrigatório para WhatsApp.

---

# 8. PRODUTO INDIVIDUAL — desktop

URL: `/studio/produtos/[slug]`

## Primeira dobra

```text
┌──────────────────────────────────┬──────────────────────────────────┐
│                                  │ NOME DO PRODUTO                  │
│ [FOTO PRINCIPAL]                 │ descrição curta de uso          │
│                                  │                                  │
│ [mini] [mini] [mini]             │ Medidas                          │
│                                  │ Material                         │
│                                  │ Opções reais                     │
│                                  │                                  │
│                                  │ [Comprar na Shopee]              │
│                                  │ Finalização e pagamento          │
│                                  │ acontecem na Shopee.             │
└──────────────────────────────────┴──────────────────────────────────┘
```

Se preço e estoque não forem sincronizados:

> Ver preço e disponibilidade na Shopee.

## Segunda área

- detalhes de uso;
- dimensões;
- acabamento;
- fotos adicionais;
- combinações reais.

## Final

```text
PRECISA DE ALGO PARECIDO, MAS COM OUTRA MEDIDA?

[Pedir orçamento →]
```

---

# 9. PRODUTO INDIVIDUAL — mobile

Ordem:

1. galeria;
2. nome;
3. descrição curta;
4. medidas/material/opções;
5. CTA Shopee;
6. aviso de redirecionamento;
7. detalhes;
8. CTA de orçamento relacionado.

Não usar botão Shopee sticky na primeira versão.

---

# 10. Catálogo /studio/produtos

Enquanto o catálogo for pequeno:

```text
PRODUTOS
Peças do estúdio disponíveis para compra.

[PRODUTO DESTAQUE GRANDE]

[foto] Produto A
       atributo decisivo
       Ver produto →

[foto] Produto B
       atributo decisivo
       Ver produto →
```

Sem:

- filtro;
- ordenação;
- badges de promoção;
- frete;
- estoque local sem sincronização;
- cinco informações no preview.

---

# 11. Recursos que não devem ser resolvidos em CSS

| Necessidade | Recurso correto |
| --- | --- |
| mostrar acabamento de placa | fotografia |
| mostrar interior de caixa | fotografia |
| mostrar medidas da caixa | diagrama SVG |
| mostrar produto | fotografia |
| mostrar material real | foto/amostra |
| explicar QR/logo | peça real ou detalhe |
| preencher ausência de mídia | deixar espaço simples / não publicar seção |

---

# 12. Gate de revisão

Este wireframe resolve **estrutura**, não aprovação visual final.

Para avançar:

- [ ] Cassiano aprova hierarquia do hub;
- [ ] Cassiano aprova ordem da página de Placas;
- [ ] Cassiano aprova fluxo do Orçamento;
- [ ] Cassiano aprova hierarquia Produto → Shopee;
- [ ] assets mínimos são selecionados;
- [ ] então criar mock visual final das quatro superfícies.

ready_for_frontend: **no**
approved_by: **pending**
