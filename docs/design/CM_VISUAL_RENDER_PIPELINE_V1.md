# CM — Pipeline render-first e catálogo técnico V1

**Estado:** contrato operacional para novas tarefas visuais substanciais. **Não autoriza redesenho automático** de páginas aceitas.  
**Relação:** `EXPERIENCE.md` é a fonte da direção de arte; `ARCHITECTURE.md` governa a stack; `docs/work/08-visual-quality-evolution.md` é o checklist e o registro de evidência; `ROADMAP.md` é a única sequência macro.  
**Base:** pesquisa entregue em 09/10/2026, *Como fazer agentes de código entregarem interfaces com acabamento visual de 2040*. A pesquisa propõe render-first, escolha do renderer, receitas reutilizáveis e feedback por screenshots; não estabelece uma nota estética objetiva universal.

## 1 — Contrato de entrega visual

A composição aprovada **não** vira autorização para o agente trocar texto, ordem, funcionalidade, imagem ou navegação. Antes de implementar, levantar:

- rota, contrato, `artifact_ref`, aprovação e versão do mock;
- design aprovado x áreas ainda abertas; quais alterações são permitidas;
- conteúdo real, falta de mídia, fontes, aspectos e estados;
- referência desktop e **composição mobile autônoma**;
- hierarquia de informação, profundidade, iluminação, ritmo tipográfico, interação, rolagem, foco e movimento reduzido;
- critérios de aceite e falha específicos da tela.

O agente não pode declarar frontend visual `done` apenas por compilar, ter botões ou produzir screenshot. Quando o ambiente permitir, precisa **abrir o browser, comparar o resultado com a referência, registrar discrepâncias concretas, corrigir e capturar novamente**. Sem esse acesso, sinalizar `blocked_visual_review` ou revisão incompleta; não inventar aprovação.

A análise visual produz no máximo cinco problemas prioritários por rodada (ex.: imagem cortada incorretamente; hero comprimido; vidro plano; tipografia com hierarquia errada; mini player estourando viewport). Evitar comentários vagos como "modernizar" ou "mais premium". Cada correção preserva regressões já resolvidas.

## 2 — Divisão entre a estética e os contratos existentes

**Desktop:** Estúdio à esquerda, Rádio completa à direita, divisor ajustável. **Mobile:** mini-player junto ao topo e Estúdio abaixo; Rádio completa abre por ação, não fica comprimida. Não existe segundo mini-player desktop. A seta pequena na divisória é **contextual** (pressão/arraste), nunca um ornamento fixo. O player usa um motor único e persistente; o visualizer depende de áudio/sidecars reais.

**Hub `/studio`:** exatamente três entradas: Impressões/Estúdio como destaque à esquerda; Orçamento e Produtos à direita. Sem quarto card de Materiais & Cores. **Produto individual:** CTA principal único **Comprar na Shopee**, sem carrinho nem checkout CM. Fotos/peças/dimensões/publicações não são inventadas.

Não replicar efeitos brilhantes da Rádio no Estúdio. Estúdio = mídia real, objetos, material e tipografia; Rádio = software tátil, densidade, áudio reativo, transição espacial. Fundo artístico estático pode ser um asset; os controles e textos continuam HTML reais.

## 3 — Seletor de renderer

| Necessidade | Primeiro meio | Critério para alternativa |
| --- | --- | --- |
| Texto, layout, formulário, link, foco, controles | DOM/CSS | Sem canvas para texto semântico |
| Brilho simples, sombra, seleção, background contido | CSS/OKLCH/tokens | Não empilhar dezenas de pseudo-elementos |
| Ícone funcional, máscara, curvas, diagrama técnico | SVG | Ícone só quando ajuda função, não decorar benefícios |
| Fundo artístico/fotografia sem interação | Asset aprovado AVIF/WebP | Imagem gerada não é fotografia/prova de uma peça |
| Reflexo/iluminação complexa local | SVG filtros ou CSS multicamada | Medir custo de blur/filter |
| Shared layout, drag, spring, interrupção | Motion for React | Reutilizar biblioteca; não mexer na Rádio aprovada por reflexo |
| Timeline SVG/scroll narrativa excepcional | GSAP | Só adicionar com caso de uso e prova superior a Motion/CSS |
| Efeito procedural/partículas com estado | Canvas | Pausar fora da área visível |
| Geometria 3D real publicável | Three.js/R3F/Drei | Exigir modelo autorizado, fallback estático e budget mobile |

Nenhuma biblioteca pode disputar `transform`, `opacity` ou layout do mesmo nó com a WAAPI/CSS existente. Não substituir automaticamente FLIP/CDP da Rádio. Escolha documentada por **problema + solução + custo + alternativa rejeitada**.

## 4 — Registro de bibliotecas e decisão de instalação

| Ferramenta | Estado V1 | Por quê / limites |
| --- | --- | --- |
| **Motion** (`motion`) | **Selecionado para instalação do núcleo de motion**, uso em páginas ainda não autorizado | Compatível com React 19 e Next App Router; motion/react em client, motion/react-client quando apropriado. Primeira utilização exige caso aprovado. |
| **Playwright Test** (`@playwright/test`) | **Selecionado para instalação de QA**, sem substituição automática do CDP | Emulação mobile, ações reais, screenshots, testes; V2 precisa capturas estáveis e baselines curadas. |
| **axe** (`@axe-core/playwright`) | **Selecionado para avaliação a11y** | Teste automático parcial; falhas existentes exigem triagem, não ocultação. |
| **GSAP** | **Candidato, não instalar por antecipação** | Timeline/SVG/ScrollTrigger quando houver necessidade aprovada; confirmar licença e cleanup por cena. |
| **React Three Fiber + Drei** | **Candidatos, não instalar ainda** | Sem peça/modelo 3D pronto e caso aceito, custo de GPU/JS injustificado. |
| **Rive / OGL / Lenis** | **Candidatos para experimento**, sem instalação automática | Só com protótipo e gatilho real; evitar scroll sequestrado ou animação gratuita. |
| **React Bits** | **Referência/componente selecionado caso a caso** | Licença MIT **com Commons Clause** em 2026: uso comercial em site permitido, restrições à redistribuição/revenda dos componentes; verificar versão e atribuição antes de copiar. |
| **Codrops / Magic UI / Aceternity** | **Referências de experiência**, não dependências globais | Validar licença de cada código/asset, acessibilidade e compatibilidade; não importar tema pronto. |

Versões concretas de packages instalados são as de `package.json` + `pnpm-lock.yaml`; esta tabela **não** é evidência de que o install ocorreu. Investigar `pnpm add`/lockfile e CI antes de marcar concluído no 08V.

Documentação oficial: [Motion](https://motion.dev/docs/react-installation), [Playwright](https://playwright.dev/docs/intro), [Playwright a11y](https://playwright.dev/docs/accessibility-testing), [React Bits license](https://github.com/DavidHDev/react-bits/blob/main/LICENSE.md), [R3F](https://r3f.docs.pmnd.rs), [GSAP](https://gsap.com/standard-license/).

**Licenças efetivamente verificadas (versões escolhidas):** Motion MIT; Playwright Apache-2.0; `@axe-core/playwright` MPL-2.0. A revisão de redistribuição se aplica sobretudo a código copiado, não apenas ao uso de pacotes padrão. React Bits adota MIT + Commons Clause, com restrições sobre vender/redistribuir componentes. A nota vale para a avaliação de 09/10/2026 e deve ser renovada ao copiar novos componentes.

## 5 — QA renderizado e controle de baseline

**Infra que já existe:** `.github/workflows/ci.yml` captura visual em PRs e pushes com `[visual]`; `scripts/capture-radio-states.mjs` faz captura e validações de transição com CDP. **Não excluir/recriar** esse sistema até provar paridade.

**Etapas de QA:** instalar dependências, medir captura existente, usar Playwright para tarefas que o CDP atual não cobre, normalizar fontes/mídia/viewport, comparar a mesma rota/estado/tempo, isolar variação de catálogo aleatório, e só criar baseline final após aprovação de Cassiano. Screenshot é artefato, não aprovação; pixel diff é excelente para regressão determinística, mas não pontua qualidade artística.

Viewports mínimos por superfície: 1440×900, 1024×768, desktop curto 1760×824, 390×844 e 360×800. Quando forem screens de mobile, emular `isMobile`, `hasTouch` e DPR adequados; não confiar apenas em `--window-size=390`.

Casos centrais: horizontal overflow; scroll indevido da Rádio em desktop e barras comprimidas no mobile; imagem croppada; controles/foco/touch; `prefers-reduced-motion`; navegação Estúdio preserva áudio; sem 2 `audio` nodes; contagem de 3 entradas no hub; CTA Shopee sem carrinho na página individual; contraste legível; estabilidade/performance no mobile.

Aprovação `done` exige **código + testes aplicáveis + revisão visual renderizada + aprovação humana quando o desenho mudou**. Revisão estática e build ficam explicitamente separados.

**Primeira execução técnica:** [CI 37936816995](https://github.com/cassianomangini/radioand3d/actions/runs/37936816995), 25 Playwright/5 viewports aprovados tecnicamente. Ainda houve 1–2 violações Axe moderadas por viewport no hub e falta de prova de conteúdo R2 real. Registrar no [relatório](../work/evidence/08v-visual-qa-audit-2026-10-09.md). Não mascarar problemas de UX apenas porque o workflow ficou verde.

## 6 — Instruções para futuras implementações

Antes do JSX/CSS de página:

1. Ler contrato e artefato aprovado; identificar o que o design não pode modificar.
2. Pesquisar exemplos/repos/bibliotecas e justificar renderer; não recriar manualmente uma cena artística cuja fonte deve ser asset.
3. Quando a intenção for explorar alternativa ainda não aprovada, usar preview/lab isolado; não mudar página pública.
4. Implementar apenas a composição escolhida, com mobile próprio, estados e fallback.
5. Renderizar screenshot, comparar com referência, corrigir até ficar apresentável **antes** de enviar para revisão humana.
6. Publicar evidência no checklist 08V e no checklist da entrega funcional. Marcar cada check apenas após execução e observação reais.

O laboratório visual V4, o piloto real V5 e a rotina final V6 são etapas posteriores e **não são automaticamente concluídos** por este contrato.
