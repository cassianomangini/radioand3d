# Visual Lab 08V — três composições de Impressões (V1)

**Artefato:** `CM3D-08V-visual-lab-v1`  
**Estado:** experimentos isolados em `/dev/visual-lab`. **Não são layout público final.**  
**Aprovação visual:** `approved_by: null`; `ready_for_frontend: no`.  
**Relação:** [08V checklist](../work/08-visual-quality-evolution.md) · [receita R1](CM_VISUAL_RECIPES_V1.md) · [registro de referências](CM_VISUAL_REFERENCE_REGISTER_V1.md).

## Escopo

Explorar qual composição consegue transformar **Impressões** em uma vitrine premium, legível e visualmente memorável sem inventar fotos de peças, substituir assets por CSS ornamental ou espalhar o brilho da Rádio pelo Estúdio. Cada estudo contém exatamente o mesmo assunto e intenção de CTA, sem novas categorias, carrinho, pricing, filtros ou outras funcionalidades não aprovadas.

O ambiente é protegido pelo `NODE_ENV=development`; não aparece na navegação pública. Qualquer requisição ao caminho em build de produção deve retornar 404. Até mesmo um deploy de preview (`NODE_ENV=production`) não deve mostrar o experimento.

## Estudos (mesmo conteúdo, proporções diferentes)

| ID | Linguagem | Desktop | Mobile | Trade-off de avaliação |
| --- | --- | --- | --- | --- |
| 01 — Editorial | Narrativa e hero de peça | Texto/editorial à esquerda e mídia vertical à direita | Mídia curta antes do texto; sem hero esmagado | Respiro x quantidade de conteúdo acima da dobra |
| 02 — Mostruário | Fotografia primeiro | Mídia panorâmica grande; copy lateral/abaixo | Imagem panorâmica e texto em sequência | Primeira impressão x contexto imediato |
| 03 — Detalhe | Precisão e contexto | Mídia vertical e copy/ficha editorial ao lado | Mídia e notas reais empilhadas | Informação x simplicidade |

**Materialidade visual:** grafite, cinza neutro, off-white e um acento ciano contido. Nenhum `card-inside-card`, estrela aleatória, robô inventado ou produto fictício. Fotografias **ainda não foram fornecidas**: usar apenas área neutra explicitamente rotulada como mídia pendente.

**Interação:** seleção entre três estudos (botão com `aria-pressed`), transição coordenada via Motion for React, equivalente reduced-motion sem animação. Não manipular player ou domínio de Rádio e não adicionar um novo `audio`.

## QA exigido antes da apresentação

- Abertura da rota em desenvolvimento com 200; retorno 404 no build público.
- Desktop 1440×900 e notebook 1024×768; mobile 390×844 e estreito 360×800, cada qual com três composições capturadas no navegador e sem overflow horizontal.
- Troca de estudo por mouse/toque e teclado; exatamente um estado ativo; foco visível; ausência de overflow horizontal; nenhuma foto/medida inventada.
- Capturas fullPage geradas por Playwright, armazenadas como artefatos de CI; não cometer thumbnails como baselines finais sem aprovação.
- A CI monta `test-results/visual-lab/comparativo.html` reunindo os 3 estudos lado a lado em desktop/mobile. Esse contato visual é uma **proposta para revisão**, não prova automática de superioridade.
- Inspeção visual sobre hierarquia, espaço de mídia, CTA, comprimento de texto, proporção e linguagem material. Após a primeira renderização, foi observado texto do Mostruário sobrepondo descrição em desktop; o CSS foi corrigido e foi adicionado teste de colisão de caixas de glifos. A correção só pode ser marcada validada após a nova renderização CI.

## Critérios para decisão

Avaliar cada estudo por:

1. **Leitura da proposta:** entender que o Estúdio fabrica peças reais e exibe um portfólio.
2. **Protagonismo da mídia:** espaço bom para fotografia real sem destruir legibilidade mobile.
3. **Continuidade comercial:** informação e caminho para Impressões/Orçamento claros, sem gerar falsa promessa.
4. **Personalidade:** não é Shopee genérica nem landing SaaS, mas também não usa ornamentação vazia.
5. **Custo:** DOM/CSS predominam; Motion só coordena a troca; não exigir WebGL para um layout editorial.

**Próximo gate:** mostrar capturas desktop/mobile dos três estudos e obter seleção/direção de Cassiano. A aprovação de uma composição não supre o conteúdo E3 (fotografias reais) nem autoriza reescrever automaticamente `/studio` ou a Rádio.
