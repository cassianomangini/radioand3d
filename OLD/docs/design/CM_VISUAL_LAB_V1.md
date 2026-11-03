# Visual Lab 08V — três composições de Impressões (V1)

**Artefato:** `CM3D-08V-visual-lab-v1`  
**Estado:** experimentos isolados em `/dev/visual-lab` **rejeitados como direção de arte** em 09/10/2026 por falta de estudo do site real. Permanecem SOMENTE como casos técnicos para Motion, screenshot, responsividade e acessibilidade. **Não são alternativas para aprovação visual.**  
**Aprovação visual:** `approved_by: null`; `ready_for_frontend: no`.  
**Relação:** [08V checklist](../work/08-visual-quality-evolution.md) · [receita R1](CM_VISUAL_RECIPES_V1.md) · [registro de referências](CM_VISUAL_REFERENCE_REGISTER_V1.md).

**Correção de referência:** ver [auditoria do site CM real](CM_SITE_VISUAL_IDENTITY_AUDIT_V1.md). As três variantes têm identidade própria excessivamente neutra/teal, não mostram o header CM, a relação com o split/Rádio nem as direções de marca e fotografia já aceitas. A aprovação técnica 46/46 não valida esses estudos como design. **Não pedir seleção de 01, 02 ou 03.**

## Escopo histórico (harness técnico V1)

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
- Inspeção visual sobre hierarquia, espaço de mídia, CTA, comprimento de texto, proporção e linguagem material. Após a primeira renderização, foi observado texto do Mostruário sobrepondo descrição em desktop; o CSS foi corrigido e foi adicionado teste de colisão de caixas de glifos. A correção foi validada na [CI 37942413229](https://github.com/cassianomangini/radioand3d/actions/runs/37942413229), sem retries, após reequilibrar colunas e sincronizar testes com hidratação.

## Evidência do experimento, não aprovação artística

- **30/30** testes Playwright de páginas públicas/404 e **16/16** do laboratório, mais 84 testes unitários, lint, typecheck e build verdes na [execução final 37942413229](https://github.com/cassianomangini/radioand3d/actions/runs/37942413229).
- Estudo em quatro tamanhos (1440, 1024, 390, 360), troca com mouse/teclado, sem colisões/overflow detectados e rota inacessível em `NODE_ENV=production`.
- Capturas reais no [artefato do laboratório](https://github.com/cassianomangini/radioand3d/actions/runs/37942413229/artifacts/11622475963), dentro do arquivo `comparativo.html`, com material também disponível como imagens individuais. [Registro de testes e inventário de desempenho dev](../work/evidence/08v-lab-performance-2026-10-09.md).
- **Nenhuma composição escolhida.** V4.4/V4.5 exigem manifestação de Cassiano; V5/implementação pública não iniciados.

## Critérios para decisão

Avaliar cada estudo por:

1. **Leitura da proposta:** entender que o Estúdio fabrica peças reais e exibe um portfólio.
2. **Protagonismo da mídia:** espaço bom para fotografia real sem destruir legibilidade mobile.
3. **Continuidade comercial:** informação e caminho para Impressões/Orçamento claros, sem gerar falsa promessa.
4. **Personalidade:** não é Shopee genérica nem landing SaaS, mas também não usa ornamentação vazia.
5. **Custo:** DOM/CSS predominam; Motion só coordena a troca; não exigir WebGL para um layout editorial.

**Próximo gate:** A1.5/A1.6 do [plano 08V](../work/08-visual-quality-evolution.md): auditar `/studio/impressoes` e o mobile real, criar um conceito contextual integrado ao CM e só então buscar aprovação de nova art direction. As três variantes V1 **não seguem para seleção**. Conteúdo E3 continua pendente.
