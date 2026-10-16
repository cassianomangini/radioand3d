# 08V — Auditoria técnica Impeccable do site público (16/10/2026)

> **Registro recuperado para a `main` (16/10/2026).** Esta é a auditoria histórica produzida em outra base e revisada na branch `cmc/feat/impecable`. O arquivo foi restaurado para preservar evidência e decisões. **A recuperação dos patches na `main` não constitui uma nova auditoria local nem uma aprovação dos testes.** O pacote completo da skill Impeccable continua disponível na branch de origem; **não foi copiado nem ativado na `main` por esta operação**.

**Estado:** diagnóstico técnico documentado; **correções, auditoria perceptual e gate de release pendentes**.  
**Natureza:** autorrevisão técnica originalmente executada em ambiente local, complementada por revisão crítica **documental e de código remoto** nesta versão. Não é aprovação estética, homologação WCAG, medição de desempenho de produção nem autorização para editar a UI.  
**Vínculo:** [08V — Evolução visual](../08-visual-quality-evolution.md) e [pipeline render-first](../../design/CM_VISUAL_RENDER_PIPELINE_V1.md). A sequência oficial continua no [roadmap](../../ROADMAP.md).  
**Escopo desta revisão documental:** somente este relatório. Nenhum componente, estilo, hook, dado remoto, ambiente, publicação ou teste local foi alterado/executado por esta revisão.

## 1. Veredito executivo

**Veredito técnico: PARCIAL / gate aberto.** A evidência disponível sustenta que a linguagem CM foi preservada nas superfícies examinadas e que os cinco avisos do detector não demonstram, isoladamente, perda de identidade. **Não sustenta** afirmar que o design está aprovado, que o site cumpre integralmente WCAG 2.2 AA ou que a performance está validada. O comando `pnpm lint` foi relatado como falho na execução original.

**Problemas priorizados na amostra: 0 P0; 2 P1; 3 P2; 0 P3.** A classificação é operacional, não uma contagem exaustiva dos defeitos do site. Existem ainda **duas investigações transversais**: diferença de hidratação por origem e defasagem entre código auditado e a branch atual.

| Frente | Resultado sustentado | Limite / decisão |
| --- | --- | --- |
| Identidade e consistência CM | Sem desvio comprovado pelos cinco avisos do detector; composição Estúdio + Rádio, marca e papéis cromáticos permanecem reconhecíveis | **Não equivale a aprovação visual**. Falta comparação crítica do render com referências aprovadas |
| Acessibilidade | Axe e interações apontaram alvos pequenos, falta de `h1` acessível no hub e alertas de semântica do divisor | Cobertura parcial de rotas e estados; sem declaração de conformidade WCAG |
| Responsividade | Relatado sem overflow estável nas dimensões testadas | Não cobre todos os estados e breakpoints do contrato |
| Integridade de desenvolvimento | `typecheck` e `eslint src` relatados como aprovados | `pnpm lint` global relatado como **falho** devido aos scripts do Impeccable |
| Performance | Suspeita fundamentada de `will-change` excessivo; tamanho de PNGs registrado | Sem perfil de GPU, FPS, INP, LCP ou build de produção comparável |
| Experiência visual | Identidade de produto descrita e restrições de arte conhecidas | **Auditoria perceptual independente ainda não realizada nesta rodada** |

### Sobre a pontuação 14/20

A primeira execução registrou **14/20 (“bom”)** pela rubrica de cinco dimensões do `reference/audit.md` do Impeccable: acessibilidade 2, performance 3, temas/tokens 3, responsividade 3, integridade 3. **Preservamos esse número somente como baseline histórico daquela amostra**, não como nota revalidada na branch, selo de UX ou avaliação artística. Em particular, a nota de performance não substitui métricas de produção; “boa” não significa pronta para lançamento. Qualquer comparação futura exige mesma rubrica, rotas, estados, viewport, navegador e commit.

## 2. Proveniência e confiabilidade

Não misturar estes três tipos de evidência:

- **[EXECUÇÃO LOCAL RELATADA]** Resultados e medições reproduzidos da auditoria enviada em 16/10; seus logs brutos, JSON do Axe, screenshots e traces não foram anexados a este documento. Não foram reexecutados nesta revisão.
- **[CÓDIGO INSPECIONADO]** Leitura no GitHub dos arquivos existentes em `cmc/feat/impecable`, incluindo ``eslint.config.mjs``, ``studio-radio-shell.tsx``, ``studio-radio-shell.module.css``, ``studio-prints-carousel.module.css`` e os contratos de experiência. Essa inspeção comprova implementações, **não** comportamento renderizado.
- **[PENDENTE]** Questões que exigem reprodução no navegador, comparação visual ou medições. Ausência de evidência não vira `PASS`.

**Base histórica do teste local:** `main@4ddd121f018357a97c7dcb8ec340a599b3807302`, informado como quatro commits atrás de `origin/main` e com alterações locais preexistentes. **Base consultada nesta revisão:** branch `cmc/feat/impecable`, em estado posterior e distinto. A branch já contém arquivos da skill Impeccable versionados; no momento da auditoria local eles haviam sido reportados como não rastreados. Não afirmar que o conteúdo atual da branch é idêntico ao workspace usado no teste.

**Divergência de versão que altera a interpretação:** no código histórico `4ddd121f`, o divisor usava fallback `Math.round(radioWidth ?? DEFAULT_RADIO_WIDTH)` fora do fullscreen. Na branch `cmc/feat/impecable`, o atributo passa a ser omitido quando `radioWidth === null` ou em fullscreen. Portanto, a hipótese “faltava `aria-valuenow` porque o width era null” **não é explicada pelo código histórico citado**, mas **tem fundamento no código consultado agora**. Reproduzir na branch antes de determinar a causa e a severidade finais.

## 3. Escopo executado e lacunas

### Cobertura relatada da auditoria original

- **Oito superfícies/URLs:** Home (`/`), hub (`/studio`), impressão sob demanda, placas personalizadas, caixas personalizadas, orçamento, lista de produtos e produto individual `porta-curativos-compacto`. A rota `/studio/impressoes` redireciona para `/studio#impressoes` no comportamento informado.
- **16 varreduras Axe** em Google Chrome: 8 superfícies × 2 tamanhos, desktop **1440 × 900** e mobile **390 × 844**.
- **Hub adicional:** 360 × 800, texto ampliado a 200%, gesto de toque sintetizado e operações de teclado.
- **Verificações informadas:** ``pnpm typecheck`` (passou), ``pnpm lint`` (falhou), ``pnpm exec eslint src`` (passou), inspeção CSS/React/assets, Impeccable `detect`, abertura de galeria, troca de foto e atalho de dock.
- **Origem válida relatada:** `localhost:3001` com hidratação confirmada. A primeira varredura em `127.0.0.1:3001` foi descartada por falha de hidratação.

### Fora da cobertura desta rodada

Não foram cobertos de forma suficiente: build `next build`/`next start`; 1024 × 768 e desktop curto 1760 × 824 **nessa execução**; fluxo integral de seis etapas e estados de erro do orçamento; Rádio em fullscreen/docked em todas as transições; fila/volume/loading/erro com teclado e leitor de tela; todos os produtos e casos de mídia; usuário com aparelho físico; `prefers-reduced-motion`; perfil de produção; comparação perceptual com mocks aprovados. Testes prévios no repositório **não** convertem automaticamente essas lacunas em provas da execução atual.

## 4. Achados — priorizados por impacto e possibilidade de validação

### P1-01 — Lint global contaminado por scripts distribuídos com a skill

**Categoria:** integridade de engenharia / bloqueio do gate.  
**Fontes:** [ESLint](../../../eslint.config.mjs); `.agents/skills/impeccable/scripts/`.  
**Evidência:** [EXECUÇÃO LOCAL RELATADA] `pnpm lint` retornou **31 erros e 78 avisos**; os 31 erros foram atribuídos a `live-browser.js` (29) e `modern-screenshot.umd.js` (2). `pnpm exec eslint src` passou. [CÓDIGO INSPECIONADO] o `globalIgnores` consultado não ignora os scripts empacotados; esses dois arquivos constam na branch atual.

**Impacto:** o gate geral fica vermelho por código de ferramenta terceira, impedindo usar o lint como sinal confiável de regressão do aplicativo.

**Decisão proposta:** ignorar **somente os artefatos distribuídos não mantidos pelo projeto** — por exemplo, o subtree de scripts da skill — preservando cobertura de `src` e de scripts/configurações próprios. Evitar ignorar toda a pasta `.agents` indiscriminadamente: uma skill local também pode conter scripts editados pelo projeto. Revisar o diff e os artefatos instalados antes de versionar/atualizar o hook.

**Aceite:** `pnpm lint` passa no mesmo HEAD; `pnpm exec eslint src` continua passando; um defeito deliberado de lint em arquivo próprio continua sendo detectado; a mudança não desativa regras globais. Registrar log e commit. **Comando de apoio:** `$impeccable harden`, com escopo explícito — não executar de modo aberto.

### P1-02 — Alvos frequentes de toque abaixo da meta CM

**Categoria:** usabilidade mobile e acessibilidade.  
**Fontes:** [mini-player](../../../src/components/studio-radio/studio-radio-shell.module.css) (classes `miniStep`/`miniPlay`); [carrossel](../../../src/components/studio-radio/studio-prints-carousel.module.css) (`timelineStep`/`pause`); [experiência](../../EXPERIENCE.md).

**Evidência:** [EXECUÇÃO LOCAL RELATADA] botões de rádio ~30 × 30 CSS px, Play/Pausa ~39 × 39, marcadores da timeline ~18 × 34 e botão Pausar ~32 × 32. [CÓDIGO INSPECIONADO] `miniStep` define `1.9rem`, `miniPlay` usa `2.45rem`, `timelineStep` mantém área estreita, e `pause` usa `2rem`.

**Impacto:** maior probabilidade de toque errado e dificuldade de uso, especialmente com controles próximos e uso recorrente.

**Precisão normativa:** WCAG **2.2 AA 2.5.8** estabelece em regra **24 × 24 CSS px**, com exceções, inclusive por espaçamento; **44 × 44 CSS px** corresponde ao critério aprimorado **2.5.5 (AAA)** e também é uma **meta de qualidade explicitamente adotada pela CM**. O relatório **não afirma** que toda medida menor que 44 constitui, isoladamente, violação AA. [W3C 2.5.8](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum) · [W3C 2.5.5](https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced).

**Decisão proposta:** aumentar a **área interativa real** sem tornar todos os ícones grandes ou mudar a composição. Na timeline, não ampliar cegamente cada marcador para 44 px se isso criar alvos sobrepostos, cortar a faixa ou impedir o uso em 360 px; desenhar alternativa acionável acessível e verificar a interação completa.

**Aceite:** métricas de `getBoundingClientRect()` e teste com toque sintetizado para controles frequentes nos tamanhos 360/390; sem áreas acionáveis sobrepostas, toques acidentais, overflow, perda de navegação por teclado ou alteração perceptual indesejada. Validar também em aparelho físico quando possível. **Comando de apoio:** `$impeccable adapt`, restrito a esses controles.

### P2-01 — Hub `/studio` não expõe título principal de nível 1

**Categoria:** semântica e navegação assistiva.  
**Fontes:** [shell](../../../src/components/studio-radio/studio-radio-shell.tsx), [visibilidade](../../../src/components/studio-radio/studio-radio-shell.module.css), [rota](../../../src/app/studio/page.tsx).

**Evidência:** [EXECUÇÃO LOCAL RELATADA] Axe registrou `page-has-heading-one` no desktop e mobile do hub. [CÓDIGO INSPECIONADO] existe `h1` na seção `studioIdentity`, porém essa seção recebe `visibility: hidden` no modo `detail`. O cabeçalho específico do hub (`studioCatalogHeader`) utiliza `strong` e ``span``; a página `/studio` retorna `null` porque o shell compartilhado compõe a experiência.

**Impacto:** a hierarquia anunciada por tecnologias assistivas não identifica de maneira adequada a entrada da página. **`page-has-heading-one` é regra de boa prática do Axe**, não reprovação WCAG AA automática. [Deque — regras Axe](https://github.com/dequelabs/axe-core/blob/develop/doc/rule-descriptions.md).

**Decisão proposta:** aproveitar um título **já existente e semanticamente correto no hub**, dando-lhe nível `h1` sem adicionar heading decorativo ou duplicar visualmente o título da Home; revisar hierarquia `h2`/`h3` e a árvore de acessibilidade após a transição entre rotas. Não inserir um `h1` novo apenas para satisfazer o detector se o título visível pode cumprir essa função.

**Aceite:** uma entrada `h1` significativa e exposta no hub, navegação de heading coerente, `page-has-heading-one` resolvido nessa rota, Home e rotas filhas sem regressão, aparência aprovada preservada. **Comando de apoio:** `$impeccable harden`, limitado à semântica.

### P2-02 — Divisor da Rádio: landmark e valor ARIA em estados específicos

**Categoria:** acessibilidade de controle redimensionável.  
**Fonte:** [`resizeHandle` no shell](../../../src/components/studio-radio/studio-radio-shell.tsx).

**Evidência:** [EXECUÇÃO LOCAL RELATADA] Axe marcou `region` nas oito rotas desktop; houve dois registros de `aria-required-attr` em carregamentos diretos, não em todas as visitas. [CÓDIGO INSPECIONADO NA BRANCH] o `role="separator"` permanece com `tabIndex={0}`; `aria-valuenow` é omitido se `radioWidth === null` ou `radioFullscreen`. `aria-valuemin` também é omitido até obter `shellWidth`. A atribuição desse comportamento ao commit histórico é imprecisa: ver `Proveniência`.

**Impacto:** um separador ajustável **exposto e focável** sem valor presente pode comunicar estado incompleto ao leitor de tela; falta de landmark reduz orientação estrutural. A regra Axe `region` é boa prática; a exigência de valor em separador focável é específica de ARIA. [WAI-ARIA — valores de range](https://www.w3.org/WAI/ARIA/apg/practices/range-related-properties/) · [Window Splitter Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/windowsplitter/).

**Decisão proposta:** reproduzir com captura da **árvore de acessibilidade** no primeiro render, após hidratação, no modo lateral, no dock e no fullscreen. Se for controle redimensionável ativo, entregar `aria-valuenow` coerente desde o instante em que está acessível, com limites compatíveis; se a função estiver desativada em certo estado, ajustar exposição/foco/semântica sem criar controle “fantasma”. Rever `aria-controls` e a inclusão em landmark apropriado **sem mover visualmente a divisória nem romper eventos de arraste**.

**Aceite:** nenhum alerta `aria-required-attr` nos estados em que o separador está ativo; valor e limites coerentes, teclado e arraste preservados, foco não preso a controle invisível, `region` triado e resolvido sem regressão do split/dock. **Comando de apoio:** `$impeccable harden` após reprodução, não correção especulativa.

### P2-03 — `will-change` persistente e custo potencial de animações

**Categoria:** performance / memória gráfica.  
**Fontes:** [camadas e transições](../../../src/components/studio-radio/studio-radio-shell.module.css); [galeria/carrossel](../../../src/components/studio-radio/studio-prints-carousel.module.css).

**Evidência:** [CÓDIGO INSPECIONADO] `studioMachine` antecipa `width`, `clip-path` e `transform`; `studioIdentity` antecipa `top`, `left` e `transform` mesmo fora da transição. [EXECUÇÃO LOCAL RELATADA] outras camadas também apresentam pistas persistentes; assets informados: `x1_fundo_2.png` 1,84 MiB, arte Rádio 1,68 MiB, logo 0,55 MiB. **Não foi demonstrada queda de FPS ou gargalo de memória.**

**Impacto potencial:** `will-change` permanente pode reservar recursos desnecessariamente; alterações de geometria e efeitos podem causar layout/paint caros. Isso é **hipótese de custo**, não defeito de fluidez confirmado. [web.dev — animações](https://web.dev/articles/animations-guide).

**Decisão proposta:** medir o **build de produção** nas transições Home → Estúdio, split ↔ dock, fullscreen e carrossel, usando DevTools Performance, repetição em condições controladas e dispositivo mobile representativo. Comparar cenários antes/depois e só então restringir `will-change` aos intervalos necessários ou trocar uma propriedade quando houver ganho mensurável. **Preservar as imagens originais da Home/Rádio**: o contrato proíbe recompressão unilateral; variações de assets são uma decisão de produto separada.

**Aceite:** nenhuma regressão visual/funcional, menos custo de renderização comprovado **ou** decisão registrada de manter implementação se não houver ganho relevante. **Comando de apoio:** `$impeccable optimize` somente depois do perfil.

## 5. Investigações transversais que não devem desaparecer

### I-01 — Diferença de hidratação entre `127.0.0.1` e `localhost`

[EXECUÇÃO LOCAL RELATADA] a primeira origem deixou cartões no estado inicial invisível; a segunda concluiu a hidratação. A origem funcional foi corretamente escolhida para continuar a auditoria, **mas isso não encerra a investigação**. Reproduzir ambas no mesmo HEAD, porta, navegador e variáveis; capturar Console, Network, erros React, bloqueios de recurso, estado de hidratação e diferenças de configuração por host. Repetir em `next start`. Registrar causa e se há impacto em preview/produção. Não classificar como bug público ou detalhe inofensivo sem evidência.

### I-02 — Divergência entre a base auditada e o destino das correções

O relatório original descreve um workspace local com alterações não commitadas, atrás de `origin/main`. Esta branch contém alterações posteriores e os scripts da skill já versionados. **O código que receberá eventual patch deve ser relido**, com `git status`, HEAD, diff, arquivos de terceiro e contratos vigentes. Os locais deste documento são pontos de partida, não autorização para aplicar automaticamente a mesma mudança em código diferente.

## 6. Resultado positivo — o que deve ser preservado

- O mundo visual CM é identificável: Estúdio e Rádio formam uma experiência integrada, e o hub distingue funções comerciais com cores locais intencionais. Não substituir por templates genéricos.
- Os quatro avisos de texto em gradiente e o aviso da borda lateral do Impeccable **não foram tratados como defeitos sem justificativa**; são escolhas de composição que precisam ser julgadas no contexto da marca.
- Na execução original em `localhost`: oito respostas HTTP 200, ausência de overflow horizontal estável em 1440/390, e hub sem overflow no teste adicional de 360/200% **nos estados examinados**.
- O Axe não reportou falha de contraste na amostra inicial; isso **não** cobre textos sobre todas as mídias, foco, hover, loading, overlays e demais estados.
- Na amostra: troca de mídia pelo controle Próxima, abertura da galeria por toque sintetizado e fechamento com Escape, navegação básica de dock por teclado. Nenhuma dessas provas substitui revisão em dispositivo físico.
- Placeholders são identificados como tal; eles **não** devem ser confundidos com provas de produtos produzidos ou mídia pronta para lançamento.

## 7. Auditoria visual/perceptual que ainda falta — entrega distinta

**Não chamar o `$impeccable audit` de auditoria estética completa:** a própria skill afirma que `audit.md` é análise técnica de código, **não crítica de design**. Para fechar o 08V com qualidade visual, realizar nova revisão **render-first** com o contrato CM, screenshots atuais e referência aprovada, sem reabrir automaticamente a Rádio.

| Superfície/estado | Verificação perceptual e de experiência | Evidência obrigatória |
| --- | --- | --- |
| Home com Rádio lateral | Equilíbrio de proporções; enquadramento X1; hierarquia da chamada; CTA; marca; texto legível com Rádio nas larguras-limite | Capturas desktop/mobile + confronto explícito com referência CM |
| Transição Home → Estúdio | Continuidade espacial, presença das três entradas, legibilidade durante a animação, sem cartões invisíveis após estabilização | Captura de estado inicial/final e vídeo ou trace de transição |
| Hub / Impressões e galeria | Escala e aspecto das fotos consistentes, controles do carrossel, ritmo e contraste dos cartões, diferenciação entre peça real e placeholder | Capturas e passos de interação |
| Rádio: split, dock, fullscreen, mobile | Continuidade do áudio/fila, controles, legibilidade e foco, não duplicar player, barras reais, restauração reversível | Teste funcional + capturas por estado |
| Orçamento completo | Hierarquia da etapa, feedback de seleção, campos/erros/anexos, teclado/toque, scroll e responsividade de **todas** as etapas | Capturas/roteiro com dados de teste sem PII |
| Produtos e produto individual | Fotografia fiel, miniaturas, densidade informacional, detalhes/medidas, CTA Shopee único | Capturas em tamanhos críticos; sem produto inventado |

**Dimensões de avaliação**, com achados concretos e prioridade, sem nota artística arbitrária: (1) fidelidade à identidade/mocks aceitos; (2) composição e hierarquia; (3) ritmo de espaçamento e tipografia; (4) tratamento de fotos/artwork, escala e crop; (5) estados, foco, interações, movimento e `reduced-motion`; (6) layout e leitura por breakpoint.

**Viewport mínimo por superfície pertinente:** 1440 × 900, 1024 × 768, desktop curto 1760 × 824, 390 × 844 e 360 × 800. Incluir texto a 200% e estados dinâmicos; reproduzir mídia/fonte/tempo, fixar ou documentar a aleatoriedade do catálogo e não comparar imagens geradas em estados diferentes como se fossem regressão. Em mobile, configurar `isMobile`, `hasTouch` e DPR apropriados — apenas diminuir a janela não prova gesto. O site real, não o antigo `/dev/visual-lab` rejeitado artisticamente, é o alvo.

**Forma do parecer:** até cinco problemas visuais relevantes por rodada, cada um com **tela + viewport + screenshot/estado + referência esperada + causa provável + ação mínima + efeito colateral a evitar**. Não aceitar pareceres vagos como “mais moderno”, nem afirmar aprovação por CI verde. Se um conceito novo for necessário, produzir artefato de experiência separado e obter aceite de Cassiano **antes** do frontend. Vide [auditoria de identidade](../../design/CM_SITE_VISUAL_IDENTITY_AUDIT_V1.md) e [pipeline render-first](../../design/CM_VISUAL_RENDER_PIPELINE_V1.md).

## 8. Ordem de execução proposta e gates de saída

Este quadro **não registra trabalhos executados**. Os comandos Impeccable são auxiliares e **não autorizam mudanças automáticas em lote**.

| Ordem | Intervenção / comando orientador | Prova mínima antes de marcar `done` |
| --- | --- | --- |
| 0 | Sincronizar evidência da branch e separar arquivos da skill de código próprio | HEAD, `git status`, diff e origem dos testes registrados, sem sobrescrever modificações locais |
| 1 | **P1-01**: lint dirigido; `$impeccable harden` | `pnpm lint` e lint próprio verdes; regras continuam ativas |
| 2 | **P1-02**: alvos de toque; `$impeccable adapt` | Medidas reais e interação em 360/390; zero sobreposição/overflow; composição preservada |
| 3 | **P2-01/02**: título do hub e separador; `$impeccable harden` | Axe/árvore de acessibilidade/teclado nos estados afetados, com regressão de navegação ausente |
| 4 | **I-01**: investigar a hidratação por host | Logs comparáveis e causa/risco definidos; resultado em dev e `next start` |
| 5 | **P2-03**: medir antes de otimizar; `$impeccable optimize` se justificado | Trace e comparação de performance em produção local, sem perda de animação aprovada |
| 6 | **Avaliação visual real:** `$impeccable critique` + revisão humana e evidência renderizada | Matriz de superfícies/estados acima, capturas comparáveis, divergências concretas e aceite quando aplicável |
| 7 | Revisão integrada final: `$impeccable polish` restrito aos defeitos encontrados; depois `$impeccable audit` | `lint`/`typecheck`/testes aplicáveis/build e Axe/capturas refeitos no **mesmo commit**; pendências declaradas |

**Gates independentes:** (A) **qualidade do código**: verificações executadas, não inferidas; (B) **funcionalidade/acessibilidade**: navegação e estados comprovados; (C) **fidelidade visual**: comparação de render; (D) **aprovação humana**: somente quando houver alteração de direção/resultado que demande aceite. Um gate não substitui outro.

**Modelo mínimo do registro de prova por correção:** ID do achado · commit/branch · estado/rota · viewport/navegador · screenshot ou trace **antes** · mudança realizada · comando/resultado **depois** · screenshot ou trace **depois** · avaliação visual · pendências reais. Não marcar `done` com base apenas na intenção de rodar um comando.

## 9. Critério de fechamento desta auditoria

A **revisão documental** está concluída com análise adicional do código remoto e explicitação das limitações. A **remediação e a validação** permanecem abertas. Este arquivo pode orientar patches futuros sem autorizar mudanças do layout, nomes, navegação, impressões reais, identidade da Rádio ou contratos já aprovados.

O fechamento técnico exige baseline sincronizada, lint restabelecido, achados acessíveis corrigidos ou justificados por prova, riscos de performance medidos e testes proporcionais no código final. O fechamento **visual** exige render comparável e avaliação de fidelidade; a aprovação de Cassiano é distinta de qualquer execução automatizada. Se faltar uma dessas provas, registrar `PENDENTE` ou `NÃO VERIFICADO`, nunca `CONCLUÍDO`.

### Fontes internas e normas consultadas

- [Impeccable — instrução técnica de audit (branch de origem)](https://github.com/cassianomangini/radioand3d/blob/cmc/feat/impecable/.agents/skills/impeccable/reference/audit.md) (limita-se a auditoria técnica, não crítica estética).
- [Contrato de experiência](../../EXPERIENCE.md) · [evolução 08V](../08-visual-quality-evolution.md) · [pipeline de render](../../design/CM_VISUAL_RENDER_PIPELINE_V1.md) · [auditoria da identidade](../../design/CM_SITE_VISUAL_IDENTITY_AUDIT_V1.md).
- [W3C WCAG 2.2, alvos AA](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum) e [AAA](https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced); [WAI-ARIA Window Splitter](https://www.w3.org/WAI/ARIA/apg/patterns/windowsplitter/); [WAI-ARIA range properties](https://www.w3.org/WAI/ARIA/apg/practices/range-related-properties/); [Deque — descrições de regras](https://github.com/dequelabs/axe-core/blob/develop/doc/rule-descriptions.md); [web.dev — animações](https://web.dev/articles/animations-guide).

**Atualização do documento não equivale a reexecução do Impeccable nem a correção de um único achado.**

## 10. Execução de correções na branch `cmc/feat/impecable` (16/10/2026)

**Estado:** patches versionados; **validação executável e aceite visual ainda não comprovados**. Esta seção atualiza o diagnóstico sem apagar a proveniência do teste local original nem promover um achado a `done` sem seus gates.

| Achado | Patch versionado | Situação verificável |
| --- | --- | --- |
| P1-01 lint | `eslint.config.mjs` ignora somente `.agents/skills/impeccable/scripts/**`, mantendo regras do projeto | **Implementado;** `pnpm lint` **não reexecutado** neste ambiente |
| P1-02 mini-player | `miniStep` e `miniPlay` passam a reservar 44×44 CSS px; grid da linha de controles atualizado | **Implementado;** medir em 360/390 e aprovar aparência |
| P1-02 carrossel | Timeline com ações 44×44, rolagem horizontal delimitada e marcador selecionado recentrado; Pause 44×44 | **Implementado;** testar composição/toque/scroll em execução real |
| P2-01 `h1` | Cabeçalho já existente do hub promovido a `h1`, sem inserir conteúdo visual novo | **Implementado;** Axe/árvore acessível pendentes |
| P2-02 separador | Divisor sob região nomeada; role ajustado para botão em fullscreen; função de separator só fica exposta após geometria conhecida, com fallback coerente para `aria-valuenow` | **Implementado;** reproduzir estados e testar navegação |
| P2-03 performance | Nenhuma mudança de `will-change` ou assets | **Aguardando profiling**, conforme decisão técnica |
| I-01 hidratação | Nenhum ajuste especulativo de host/hidratação | **Investigação aberta** em `localhost` vs `127.0.0.1` |

**Regressões adicionadas:** `tests/visual/impeccable-a11y.spec.ts` cobre heading do hub, geometria dos botões do mini-player, controle do carrossel e valores/teclado do separador nas configurações Playwright pertinentes. Testes **adicionados não significam testes aprovados**.

**Limites da execução:** atualizações foram aplicadas por commits remotos através da integração com GitHub. Não houve acesso ao navegador local do usuário, `node_modules`, execução de `pnpm lint`, `pnpm typecheck`, build, servidor HTTP ou Playwright nesta etapa. Também não houve screenshots comparativos nem inspeção de performance. As correções devem ser avaliadas no **HEAD final da branch**, e os testes existentes devem continuar verdes, em particular o fluxo da Rádio split/dock e a continuidade de áudio.

**Próximo gate obrigatório:** no checkout local da branch, preservar alterações locais, executar `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` e `pnpm visual:qa` (Chrome instalado); revisar screenshots e áreas de toque, reproduzir as origens de hidratação e documentar regressões. Os erros encontrados exigem correção antes de merge/release. Para uma avaliação estética, seguir separadamente a seção 7: o `audit` técnico não a substitui.

**Nenhuma alteração desta seção constitui aprovação visual, release, deploy, correção validada de performance ou autorização para mudança adicional do design.**

## 11. Recuperação dos ajustes na `main` (16/10/2026)

Os patches de qualidade e acessibilidade criados originalmente na branch foram **reaplicados de forma seletiva à `main`**, sem mesclar a branch divergente nem sobrescrever mudanças pré-existentes do site. A `main` possuía quatro commits próprios desde o ancestral comum; estes commits foram preservados.

| Recuperação | Arquivo na `main` | Resultado de código |
| --- | --- | --- |
| Lint de terceiros | `eslint.config.mjs` | Mantida a exclusão pontual `.agents/skills/impeccable/scripts/**`, preparada para quando a skill for instalada na `main` |
| Mini Rádio mobile | `src/components/studio-radio/studio-radio-shell.module.css` | Controles frequentes e Play/Pausa com 44 × 44 CSS px e linha de controles ajustada |
| Título principal do hub | `src/components/studio-radio/studio-radio-shell.tsx` e `.module.css` | Cabeçalho existente promovido a `h1`, preservando aparência |
| Semântica do divisor | `src/components/studio-radio/studio-radio-shell.tsx` | Landmark nomeado, `role` adequado ao modo fullscreen/lateral, valor do separador preservado via fallback já existente na `main`, e `aria-controls` |
| Carrossel mobile | `src/components/studio-radio/studio-prints-carousel.module.css` e `.tsx` | Timeline e Pausar com alvos 44 × 44, rolagem horizontal e recentramento ajustado por geometria real do viewport |
| Provas de regressão | `tests/visual/impeccable-a11y.spec.ts` | Testes Playwright recuperados e verificação de sobreposição adaptada para respeitar clipping |

**Não incluídos nesta recuperação:** biblioteca binária/instalação do Impeccable, assets e funcionalidades paralelas que existiam apenas na branch, novas animações ou otimização especulativa de `will-change`. Misturar esses itens em uma mesclagem cega da branch poderia regredir a `main`.

**Validação:** foi conferida a gravação dos arquivos no GitHub. **Não houve execução local de build, lint, Playwright, Axe, medição de desempenho ou inspeção no browser** nesta recuperação; a CI associada à atualização da `main` é a próxima prova necessária, seguida de revisão visual humana. Não classificar como aprovado antes dessa evidência.

**Pendentes:** investigação da diferença de hidratação entre `localhost` e `127.0.0.1`, perfil de performance em build de produção, teste das transições split/dock/fullscreen e comparação visual das superfícies modificadas. A ordem e os critérios de aceite continuam nas seções 5, 7 e 8 acima.
