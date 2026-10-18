# Auditoria de CSS, arquitetura do shell e QA visual do CM 3D & Radio

**Data:** 18/10/2026  
**Base imutavel da leitura:** `main@23f25c3c2193cddadd6a3e0f014ca7df2fcf5666`  
**Escopo:** Home, composicao Estudio/Radio, CSS Module compartilhado, componentes consumidores, contratos de interacao, testes Playwright e workflow de CI.  
**Natureza:** diagnostico e proposta de execucao. Este documento nao altera interface, audio, rotas ou dados.  
**Estado:** auditoria estatica e leitura dos resultados de CI concluidas; validacao renderizada da nova `main` pendente.  
**Aprovacao visual:** nao registrada para a nova versao da `main`.  
**Responsavel pela execucao futura:** a definir. Este PR nao implementa as correcoes.

## 1. Resumo executivo e decisao

A versao atual **nao deve ser julgada pelas capturas do PR #33**. Em 18/10, a `main` recebeu a imagem `cm-home-x1-hd.webp`, ajustou `object-position`, eliminou parte das regras antigas do hero e mudou a Home para um bloco de texto ancorado no topo, com composicao lateral inclusive no Estudio estreito. O PR #33 partiu de outro CSS e de outro asset.

Os problemas que continuam sustentados por evidencia direta:

1. **P0, gate de qualidade:** os dois workflows do commit atual ficaram verdes, mas o job principal **pulou os passos de captura visual e Playwright**; o push tinha mensagem `c`, sem `[visual]`. Uma alteracao relevante de Home, CSS e imagem chegou a `main` sem executar esse gate.
2. **P0, teste em contradicao com produto:** `tests/visual/home-hero-responsive.spec.ts` exige layout vertical com `position: relative` no Estudio estreito. A nova `main` exige explicitamente layout lateral e preserva `position: absolute`. O teste precisa ser reescrito a partir do comportamento aprovado e **executado**; nao apenas enfraquecido para ficar verde.
3. **P1, divida estrutural:** `studio-radio-shell.module.css` tem **5.149 linhas** e `studio-radio-shell.tsx` tem **2.458 linhas**. O mesmo modulo CSS guarda varias superficies, estados e geracoes de estilos.
4. **P1, divida de cascata:** a contagem estatica encontrou **85 grupos de seletor + propriedade + contexto com valores distintos repetidos**. Isso mede oportunidade de revisao, nao 85 defeitos confirmados.
5. **P1, codigo potencialmente sem consumidor:** foram identificadas **21 classes candidatas**, por analise das referencias estaticas, e **72 blocos de regras / 245 declaracoes candidatas**. A classificacao e preliminar e exige confirmacao antes da exclusao.
6. **P1, acessibilidade objetiva:** o divisor divulga `aria-valuemax=1120`, mas o teto operacional e variavel e pode ser menor. O atributo precisa refletir o limite calculado.
7. **P1, enquadramento e legibilidade ainda sem aceite:** a imagem atual usa `cover` e `center`; as frases da Home sao forçadas a `nowrap` em contêineres a partir de `60rem`. A adequacao desses valores a todos os tamanhos reais da coluna de texto nao foi comprovada em navegador na `main`.

**Diretriz:** corrigir primeiro o processo de prova e os testes obsoletos, depois consolidar os estilos e extrair responsabilidades. Nao iniciar reescrita total, nao trocar o motor de audio e nao introduzir mais overrides ao final do CSS.

## 2. Evidencias e limites

### Base e estado dos workflows

- `main`, 18/10/2026: [commit 23f25c3](https://github.com/cassianomangini/radioand3d/commit/23f25c3c2193cddadd6a3e0f014ca7df2fcf5666).
- [CI principal do commit atual, run 39151011258](https://github.com/cassianomangini/radioand3d/actions/runs/39151011258): `lint`, `typecheck`, testes e `build` concluidos com sucesso; etapas `Capture visual review` e `Playwright visual diagnostics` constam como **skipped**.
- [Workflow da previa de Radio, run 39151011224](https://github.com/cassianomangini/radioand3d/actions/runs/39151011224): sucesso na superficie que cobre; **nao equivale a revisar a nova Home**.
- [PR #33](https://github.com/cassianomangini/radioand3d/pull/33): versao substituida, capturas e medidas historicas; nao reutilizar seus pixels para declarar defeitos presentes na nova `main`.
- [Contrato de experiencia](../../EXPERIENCE.md), [arquitetura](../../ARCHITECTURE.md), [processo render-first](../../design/CM_VISUAL_RENDER_PIPELINE_V1.md) e [execucao 08V](../08-visual-quality-evolution.md). Estes documentos nao concedem aprovacao automatica a capturas de agente.

### Metodo

[VERIFICADO] Arquivos e diffs lidos diretamente no GitHub, snapshot de arvore da `main`, estado dos jobs e comparacao com `main@89794b9`. Houve analise estatica das classes e das declaracoes CSS considerando os consumidores `studio-radio-shell.tsx` e `radio-lyrics.tsx`.

[INFERENCIA] Duplicacoes de cascata e classes sem referencia sao **candidatos de refatoracao**. Nem toda redefinicao e bug e nem todo CSS sem referencia textual esta morto. Necessario validar estados dinamicos, especificidade, `:has`, `data-*` e consumidores reais antes de remover.

[NAO VERIFICADO] A nova `main` nao foi renderizada/interagida nesta rodada. Nao foram executados localmente `pnpm visual:qa`, captura CDP, medicao de layout shift, desempenho, rede, a11y completa ou comparacao perceptual com os mocks aprovados. Qualidade visual atual continua **pendente**, e nao reprovada por evidencias de outra branch.

## 3. Inventario quantitativo na main atual

| Arquivo ou indicador | Valor atual | Interpretacao |
| --- | ---: | --- |
| `src/components/studio-radio/studio-radio-shell.module.css` | **5.149 linhas**, 121.001 bytes | Excesso de concentracao de responsabilidades |
| `src/components/studio-radio/studio-radio-shell.tsx` | **2.458 linhas** | Orquestracao e UI acopladas |
| Regras CSS comuns detectadas | **695** | Contagem estatica, sem `@keyframes` |
| Declaracoes CSS detectadas | **2.558** | Contagem estatica |
| `@media` / `@container` / `@keyframes` | **40 / 5 / 22** | Mecanismos legitimos que pedem consolidacao |
| Grupos de propriedades redefinidas com valores distintos | **85** | Auditoria de cascata necessaria |
| Classes sem consumidor estatico identificado | **21 candidatas** | Triagem, nao exclusao automatica |
| Blocos / declaracoes potencialmente orfaos | **72 / 245** | Heuristica, revisar antes de apagar |
| Asset novo da Home | `cm-home-x1-hd.webp`, **899.842 bytes** | Novo asset, sem QA de enquadramento atual |
| Asset PNG antigo ainda versionado | `cm-home-x1.png`, **1.921.133 bytes** | Verificar consumidores antes de excluir |

A atualizacao reduziu o CSS de **5.193 para 5.149 linhas**, mas nao eliminou o problema estrutural. Numero de linhas nao deve virar meta artificial: a meta e remover logica redundante, clarificar ownership e reduzir regressao.

## 4. Achados acionaveis

### A-01 [P0] Gate visual opcional em push na main

**Evidencia:** [`.github/workflows/ci.yml`](https://github.com/cassianomangini/radioand3d/blob/23f25c3c2193cddadd6a3e0f014ca7df2fcf5666/.github/workflows/ci.yml), passos condicionados a `pull_request` ou a mensagem contendo `[visual]`. O commit atual de Home entrou com mensagem `c`; [run 39151011258](https://github.com/cassianomangini/radioand3d/actions/runs/39151011258) registra `skipped` para captura e Playwright.

**Problema real:** um CI verde nao certifica sequer que a suite visual rodou. Isso mascara regressao de layout e deixa as capturas recentes fora da base validada.

**Alterar:** detectar mudancas em arquivos visuais/estruturais e executar os testes pertinentes em PR e push na `main` sem depender do texto do commit. Preservar caminhos mais leves para modificacoes sem impacto visual; o filtro deve ser por arquivos/capacidades, nao por convencao editorial. Publicar resumo claro: `executado`, `falhou`, `skipped justificado`.

**Aceite:** em uma alteracao de `studio-radio-shell.module.css`, `studio-radio-shell.tsx`, arte da Home ou teste visual, o gate executa, produz capturas e pode falhar a integracao. O controle nao se limita a gerar anexos.

### A-02 [P0] Teste da Home esta preso ao layout antigo

**Evidencia:** [`tests/visual/home-hero-responsive.spec.ts`](https://github.com/cassianomangini/radioand3d/blob/23f25c3c2193cddadd6a3e0f014ca7df2fcf5666/tests/visual/home-hero-responsive.spec.ts), `inspectHomeState`. Para `studioWidth < 52rem`, o teste espera `copyLayout === "relative"` e texto abaixo da arte; na [nova regra CSS do compacto](https://github.com/cassianomangini/radioand3d/blob/23f25c3c2193cddadd6a3e0f014ca7df2fcf5666/src/components/studio-radio/studio-radio-shell.module.css#L5050-L5100), o texto continua `position: absolute` e `left: 52%`. Para o estado normal mais largo, o teste conserva um limiar de `titleLeft >= 40% do Estudio + 160px`, enquanto a nova regra passa a usar `left: 45%`. O teste nao foi executado no push atual.

**Impacto:** as afirmacoes do teste e o CSS nao descrevem o mesmo comportamento. Nao se deve resolver a divergencia removendo assertions sem uma referencia aprovada.

**Alterar:** atualizar o contrato do teste com as composicoes aceitas hoje, testar largura **real do painel** e incluir `split-default`, intermediaria, limite fisico, `docked`, fullscreen, desktop curto e mobile. Aferir geometrias do texto efetivamente pintado com `Range.getClientRects()` ou spans de palavras, alem das caixas do `h1` e CTA. Verificar corte lateral e vertical, colisao com controles e proposito da area dedicada ao X1.

**Aceite:** a suite passa na versao realmente renderizada e falha ao introduzir truncamento de palavras, colisao com a divisoria ou estado de layout diferente do aprovado.

### A-03 [P1] Textos sem quebra usam gatilho de largura do Estudio inteiro

**Evidencia:** [CSS da Home](https://github.com/cassianomangini/radioand3d/blob/23f25c3c2193cddadd6a3e0f014ca7df2fcf5666/src/components/studio-radio/studio-radio-shell.module.css#L4958-L5110). A partir de `@container studio (min-width: 60rem)`, `.studioHomePhrase` adota `white-space: nowrap`. A coluna de texto ocupa apenas a parte direita do Estudio, com `left: 45%` no split e offset especifico no dock.

**Risco:** a largura do Estudio nao garante que cada frase caiba na coluna restante. Os cortes comprovados nas capturas do **antigo PR #33** mostram por que o criterio precisa ser medido, mas nao comprovam o mesmo defeito no asset/layout novos.

**Alterar:** derivar o layout da largura disponivel para a copy e da medida do texto, nao do viewport geral isoladamente. Evitar regras que mantenham frases inteiras sem demonstrar cabimento. Nao destruir as quebras aprovadas por uma solucao generica; preservar a composicao com fallback de quebra natural para espacos intermediarios.

**Aceite:** nenhuma palavra fora da area visivel em todos os estados do divisor; frases completas somente quando couberem; capturas confrontadas com mock aprovado.

### A-04 [P1] Enquadramento e carregamento do novo background sem prova renderizada

**Evidencia:** [arquivo TSX da Home](https://github.com/cassianomangini/radioand3d/blob/23f25c3c2193cddadd6a3e0f014ca7df2fcf5666/src/components/studio-radio/studio-radio-shell.tsx#L2200-L2212) aponta para `/images/studio/cm-home-x1-hd.webp` com `fill`, `priority`, `sizes="100vw"` e `unoptimized`. O CSS usa `object-fit: cover` e `object-position: center`. A nova imagem possui 899.842 bytes no repositório.

**Risco:** o painel varia continuamente de largura. `cover` recorta o asset; `center` pode privilegiar elementos errados conforme estado. `sizes="100vw"` nao descreve o painel no desktop com split, e `unoptimized` entrega o arquivo fonte sem variantes otimizadas do Next. Nao chamar o WebP de baixa qualidade sem observar o render, nem prometer ganho pela recompressao sem medir.

**Alterar:** estabelecer politica de enquadramento para dock, split, limite estreito, tablet e mobile; conferir resolucao efetiva, `naturalWidth` / `naturalHeight`, `currentSrc`, tamanho transferido, LCP e corte da X1. Manter arte original preservada; gerar variantes somente se trouxerem ganho real. Ajustar `sizes` ou estrategia de otimizacao com base na area visual real.

**Aceite:** foto nitida na area de uso e sem elementos essenciais cortados; medicao de peso e LCP documentada; nenhuma perda perceptiva aprovada.

### A-05 [P1] Cascata antiga e blocos concorrentes no CSS monolitico

**Evidencia:** [CSS completo](https://github.com/cassianomangini/radioand3d/blob/23f25c3c2193cddadd6a3e0f014ca7df2fcf5666/src/components/studio-radio/studio-radio-shell.module.css). Exemplos verificaveis no contexto base: `.siteHeader` recebe `background` e `backdrop-filter` nos blocos iniciais e novamente por volta de L2243; `.radioPanel` recebe backgrounds em L282, L1116 e L2837; `.studio` tem backgrounds sucessivos em L149, L2267 e L3631. `.radioContent` passa por composicoes desktop sucessivas.

**Problema:** propriedades definidas por sucessivas camadas historicas exigem interpretar ordem, especificidade e estado antes de qualquer ajuste. Muitas sobrescritas sao deliberadas; as obsoletas devem ser removidas, e as intencionais, documentadas perto do proprio dono.

**Alterar:** construir inventario por seletor + contexto + valor computado em cenarios representativos; consolidar regras-base, variantes por `data-*` e `@container`. Eliminar pares obsoletos no mesmo PR que introduz a regra final, sem empilhar um novo override no fim.

**Aceite:** demonstrar diff de simplificacao, ausencia de regressao visual, e propriedade com uma fonte de verdade por estado. **Nao** perseguir reducao arbitraria de linhas.

### A-06 [P1] CSS potencialmente inutil e dependencias fora do componente principal

**Evidencia:** varredura de classes `styles.*` em `studio-radio-shell.tsx` e `shellStyles.*` em [`radio-lyrics.tsx`](https://github.com/cassianomangini/radioand3d/blob/23f25c3c2193cddadd6a3e0f014ca7df2fcf5666/src/features/radio/radio-lyrics.tsx). Candidatas sem referencia incluem `brandMark`, `brandSuffix`, `pendingNav`, `hero`, `heroCopy`, `mediaFrame`, `coverFallback`, `heroContent` e `studioProducts`. O CSS de letras **tem consumidor externo** e nao pode ser apagado como morto.

**Alterar:** confirmar alcance de seletores e usos dinamicos com ferramenta CSS apropriada, checar todas as importacoes do modulo e inspecionar computed styles antes de remover. Mover estilos de letras para `src/features/radio/radio-lyrics.module.css`, mantendo diferencas de apresentacao no modal e na Radio completa. Avaliar `src/app/page.module.css` como arquivo aparentemente sem import atual.

**Aceite:** remocao de lixo comprovado, nenhuma quebra da letra sincronizada, pagina de produtos, navbar, modal mobile ou estados de Radio; relatorio de classes removidas com prova de ausencia de consumidor.

### A-07 [P1] Shell React mistura composicao, maquina de estados e UI

**Evidencia:** [`studio-radio-shell.tsx`](https://github.com/cassianomangini/radioand3d/blob/23f25c3c2193cddadd6a3e0f014ca7df2fcf5666/src/components/studio-radio/studio-radio-shell.tsx), **2.458 linhas**. `RadioContent` organiza controles e playlist, enquanto `StudioRadioShell` concentra navbar, hero, card do Estudio, gestos de resize, dock, fullscreen, atalhos, dialog e transicoes de rota.

**Problema:** aumento de acoplamento entre mudancas puramente visuais e transicoes criticas do audio. Ja existem boas extracoes, como `radio-panel-drag.ts`, `radio-motion-spine.ts`, `radio-navbar-dock.tsx` e `studio-prints-carousel.tsx`; devem ser preservadas.

**Alterar:** extrair UI e controle com contratos curtos e tipados, por responsabilidade real: `SiteHeader`, `StudioHome`, `StudioHub`, `RadioFullPlayer`, `RadioMobileMini`, `useRadioPanelLayout` ou equivalente se a extracao reduzir complexidade. `StudioRadioShell` deve orquestrar os mundos. Nao introduzir hooks genericos sem consumidor real.

**Invariantes:** um unico `RadioProvider` e elemento `audio` persistente; fila, faixa, posicao e volume nao reiniciam em split, dock, fullscreen, navegacao, modal mobile ou interrupcao de animacao. Nao trocar Motion/WAAPI/CSS sem beneficio demonstrado.

**Aceite:** componentes menores com responsabilidades explicitas; suites de Radio e carrossel intactas; teste de identidade do mesmo nó `audio` antes/depois das transicoes.

### A-08 [P1] Divisor fornece limite ARIA diferente do limite real

**Evidencia:** [`studio-radio-shell.tsx`](https://github.com/cassianomangini/radioand3d/blob/23f25c3c2193cddadd6a3e0f014ca7df2fcf5666/src/components/studio-radio/studio-radio-shell.tsx#L2350-L2369). `aria-valuemax` usa `MAX_RADIO_WIDTH = 1120`, mas `clampRadioWidth()` tambem limita a largura por `shellWidth - MIN_STUDIO_WIDTH - RESIZE_GUTTER`. Para `shellWidth=1440`, o teto pratico e `768px`, nao 1120px.

**Alterar:** usar o teto efetivamente calculado para `aria-valuemax` (considerando fullscreen/dock) e validar `aria-valuemin <= aria-valuenow <= aria-valuemax` em cada viewport apos resize, teclado e troca de estado.

**Aceite:** Range ARIA coerente com movimento do divisor, tests automatizados verificam valores e interacao real, sem mudar as proporcoes aprovadas.

### A-09 [P2] Capturas e instrumentos nao asseguram paridade com o mock

**Evidencia:** `playwright.config.ts` executa por padrao `reducedMotion: "reduce"`; as capturas gerais do workflow usam orcamento de tempo virtual, e `tests/visual/public-pages.spec.ts` produz screenshots e inventario Axe. Nao ha, no escopo revisado, baseline visual curada que comprove concordancia perceptiva da Home com o mock aprovado. O teste do hero compara principalmente caixas.

**Alterar:** capturar estado estavel (fontes carregadas, hidratacao, fim da introducao) e, separadamente, transicoes em andamento; usar sem movimento e com movimento quando relevantes. Criar antes/depois na **mesma** largura e estado de Radio, com referencia explicitamente aprovada e diff perceptual revisado manualmente. Cobrir titulo longo, proporcao e enquadramento, primeira dobra e clique/touch.

**Aceite:** artefatos e logs rastreaveis por SHA, sem confundir CI verde com aprovacão estetica.

### A-10 [P2] Carrossel e efeitos precisam de ownership e revisao de compactacao

**Evidencia:** `studio-prints-carousel.module.css` usa legenda e transporte sobre a area de imagem; o CSS principal e o componente do carrossel definem regras independentes. Existem 22 `@keyframes` no shell, Motion para cards e WAAPI para transformacoes especificas da Radio.

**Alterar:** validar sobreposicao de legenda/controles em 360/390px, area de toque, titulo longo e imagens de diferentes proporcoes. Registrar dono de `transform`/`opacity` por elemento, reduzir `will-change` persistente onde nao houver beneficio medido e auditar reduced-motion. Nao inventar um novo efeito nem trocar biblioteca so para reduzir CSS.

**Aceite:** carrossel legivel, controles acessiveis, imagens sem zoom desigual indevido e nenhuma interrupcao do audio.

## 5. Sequencia proposta de implementacao

**Nao converter este documento em dezenas de tarefas automaticamente.** O roadmap e `docs/work/08-visual-quality-evolution.md` continuam sendo os trackers. Dividir por risco e responsabilidade, nao pelo numero de linhas.

| Bloco | Escopo de entrega futura | Dependencia | Criterio de pronto |
| --- | --- | --- | --- |
| **B0: Evidencia atual** | Rodar Playwright e capturas na `main` atual; registrar cinco maiores defeitos efetivos | Nenhuma | Fotos/metricas vinculadas ao SHA atual e comparadas com referencia |
| **B1: Gate e testes** | Corrigir A-01/A-02 e reforcar geometria/a11y | B0 | Mudanca visual nao passa sem execucao efetiva do gate |
| **B2: Home cirurgica** | Corrigir apenas diferencas aprovadas A-03/A-04, sem mexer no player | B0/B1 | Cinco viewports + estados do divisor aceitos |
| **B3: Limpeza e consolidacao** | Inventario de overrides, orfaos e CSS da Home/Hub; remover codigo legado comprovado | B1/B2 | Diminuicao de complexidade, sem diff visual imprevisto |
| **B4: Extracao por dominio** | Modularizar CSS do Header/Studio/Radio e, depois, o TSX monolitico | B3 | Ownership claro, audio e rotas preservados |
| **B5: Acabamento** | A11y do divisor, reduced-motion, custo de imagem e efeitos, compactacao do carrossel | B1/B4 quando aplicavel | Medicoes e regressao documentadas |

A-08 pode entrar em B1 se a mudanca for isolada. Nao esperar a modularizacao inteira para corrigir erro objetivo de acessibilidade.

## 6. Mapa proposto de ownership

Estes sao **nomes candidatos**, nao ordem para criar nove arquivos vazios:

| Dono | Conteudo |
| --- | --- |
| `site-header` | Navbar, logo, links, redes e seu responsivo |
| `studio-radio-layout` | Split, divisoria, scroll ownership e larguras da Radio |
| `studio-home` | Arte da Home, coluna editorial, tipografia, CTA e estados de painel |
| `studio-hub` | Tres acessos comerciais e suas animacoes de entrada |
| `radio-player` | Superficie do player completo, transporte, fila e controles |
| `radio-mobile-mini` / dialog | Mini-player e Radio completa no mobile |
| `radio-lyrics` | Letras, scroll e estados associados |
| `radio-navbar-dock` | Manter ownership ja existente |
| `tokens.css` | Valores semanticos compartilhados, sem paletas locais concorrentes |

Extrair somente se a fronteira for real. O principal resultado deve ser **menos cascata conflitante e menos acoplamento**, nao uma pasta cheia de CSS.

## 7. Matriz minima de QA para toda entrega visual

| Ambiente | Estados essenciais | O que medir |
| --- | --- | --- |
| 1440 × 900 | split inicial, intermediario, minimo, dock e fullscreen | texto visivel, asset, divisor, botoes e audio |
| 1760 × 824 | split, dock, titulo/faixa longa | largura real da copy, altura curta, fila e header |
| 1024 × 768 | composicao compacta para laptop | primeira dobra, CTA, mini-player e scroll |
| 390 × 844 | mini mobile, dialog aberto/fechado, hub e carrossel | areas tocaveis, legibilidade e overflow |
| 360 × 800 | mesmo fluxo com titulos longos | quebras, clipping, margem e botoes |
| Teclado/motion | resize, dock, fullscreen, reduced/no-preference | foco, ARIA, continuidade e ausencia de movimento indevido |

**Condicoes obrigatorias:**

1. Fontes e imagens efetivamente carregadas antes da captura de estado final; duracao da animacao nao deve causar capturas intermediarias fingindo ser estado final.
2. Nao basta `element.getBoundingClientRect()` do container; medir texto pintado, visibilidade e possivel clipping dos descendentes.
3. Comparar imagens com **mock aprovado do mesmo estado**, separando fidelidade visual de validacao estrutural.
4. Para o player, testar tocar, pausar, proxima/anterior, faixa longa, busca, fila, volume, erro/buffering e retorno de rota; confirmar um audio persistente.
5. Validar `prefers-reduced-motion` e `no-preference` nos estados onde motion afeta resultado.
6. Executar `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` e `pnpm visual:qa`, alem da captura/CDP existente quando modificar a Radio.
7. Registrar resultados reais, evidencias, bugs residuais e aprovacao humana. `skipped` nao e `passed`.

## 8. Limites e seguranca da refatoracao

- Nao substituir `RadioProvider`, nao duplicar o elemento de audio, nao alterar algoritmo de fila, playlist, progressao ou visualizador para cumprir objetivo de CSS.
- Nao descartar Motion, WAAPI, efeitos do divisor, dock ou transicoes ja aceitas sem demonstrar redundancia/perda de qualidade.
- Nao reabrir textos, imagens aprovadas, CTA, catalogo, Orcamento, Produtos, Shopee ou dados privados durante limpeza estrutural.
- Nao apagar `radio-lyrics` por nao aparecer no JSX principal. Ha importacao explicita de `studio-radio-shell.module.css` no modulo de letras.
- Nao marcar o novo design como aprovado por causa de CI. O aceite artistico e separado e pertence ao usuario.
- Nao integrar uma refatoracao com alteracoes massivas e sem capturas antes/depois. Manter cada diff revisavel e reversivel.

## 9. Definicao de concluido

A implementacao so pode receber `done` quando:

- [ ] A nova `main` tiver baseline renderizada e problemas ativos separados dos defeitos historicos do PR #33.
- [ ] O gate visual rodar automaticamente em mudancas pertinentes e bloquear falhas objetivas.
- [ ] O teste da Home refletir a composicao efetivamente aprovada, incluindo largura real da coluna e estados do divisor.
- [ ] As classes e declaracoes eliminadas forem comprovadamente nao utilizadas.
- [ ] O CSS tiver ownership por dominio, sem regras antigas duplicadas controlando o mesmo estado por acidente.
- [ ] O shell React tiver fronteiras de UI/controle claras e nao recriar o audio.
- [ ] ARIA do divisor refletir os limites reais.
- [ ] Imagem, tipografia, first fold, Hub e carrossel forem avaliados em cinco viewports e estados relevantes.
- [ ] Os comandos de qualidade e as capturas tiverem resultado registrado e revisado.
- [ ] Cassiano tiver avaliado a fidelidade perceptiva da implementacao; isso nao e inferido por teste.

**Conclusao:** o maior bloqueio imediato e a falta de prova visual automatica da atualizacao recente da `main`, seguida pela incompatibilidade entre teste e CSS. Modularizar e limpar o shell e necessario, mas deve acontecer sobre comportamento atual reproduzido, preservando audio e referencias aprovadas. Este PR entrega **somente o relatorio** e nao pretende corrigir o site.
