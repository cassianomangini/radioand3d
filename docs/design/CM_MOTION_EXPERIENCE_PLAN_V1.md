# CM Motion Experience Plan V1

## Objetivo

Transformar movimento, áudio, transições e resposta de interface em parte estrutural do CM 3D & Radio, não em decoração adicionada depois.

A meta perceptiva é simples: o usuário não deve pensar apenas "tem bastante animação". A experiência deve provocar a sensação de que a interface tem mecânica própria, reage ao conteúdo e faz coisas incomuns de forma coerente, fluida e tecnicamente sólida.

Este plano não substitui o [Roadmap](../ROADMAP.md). O roadmap continua sendo a única fonte de sequência e estado das entregas. Este documento define a arquitetura de motion, o nível de qualidade e as frentes que podem virar PRs quando suas dependências estiverem prontas.

## Calibração

- Variance geral: 9/10.
- Motion da Rádio: 9/10.
- Motion do Estúdio: 3-4/10.
- Density da Rádio completa: 8/10.
- Density do Estúdio: 5/10.
- A Rádio pode ser expressiva, tátil, densa e reativa.
- O Estúdio deve permanecer mais silencioso, material, fotográfico e premium.
- Movimento não compensa composição fraca. Se a experiência depende de glow, partículas ou excesso de neon para parecer interessante, reprovar.

## Princípios não negociáveis

1. **Movimento tem causa.** Toda animação deve responder a áudio, mudança de estado, seleção, navegação, arraste, foco, expansão, scroll ou outra ação real.
2. **Áudio verdadeiro.** O visualizador reage a dados medidos. Não usar batida inventada, pulso global, "voz" sintética ou ciclos decorativos.
3. **Continuidade espacial.** Quando possível, um elemento muda de posição, escala ou papel sem parecer que foi destruído e recriado.
4. **Um único player.** Motion nunca cria um segundo motor de áudio nem quebra fila, posição, volume ou continuidade entre superfícies.
5. **Interrupção segura.** Animações precisam aceitar cliques rápidos, seek, troca de faixa, resize e mudança de rota sem deixar estado fantasma.
6. **Performance faz parte do design.** Uma ideia que só funciona em máquina forte não está pronta.
7. **Reduced motion é uma composição válida.** Não é simplesmente desligar tudo.
8. **Mobile é outra composição.** Não encolher o desktop.
9. **Nada pela metade.** Cada frente deve fechar comportamento, estados, acessibilidade, performance e validação perceptiva antes de ser considerada concluída.
10. **Sem biblioteca por vaidade.** Cada dependência entra por um problema concreto que ela resolve melhor que a stack já existente.

## Arquitetura proposta

### Motion for React

Responsabilidade principal:

- microinterações;
- springs;
- layout animation;
- shared layout;
- presença/entrada/saída;
- gestos;
- drag;
- mudança de estado dos componentes;
- transições do player e da playlist.

É a camada padrão para motion de interface.

### GSAP + ScrollTrigger

Usar apenas onde Motion não for a ferramenta certa:

- timelines com múltiplas etapas;
- cenas coordenadas;
- progressão ligada ao scroll;
- pin/scrub controlado;
- momentos de assinatura com sequência complexa.

Não usar GSAP para todo hover ou botão.

### Lenis

Opcional e condicionado a prova real de ganho.

Pode ser usado para sincronizar uma experiência de scroll do Estúdio com GSAP/WebGL. Não entra para "deixar o scroll macio" por padrão e não deve sequestrar comportamento nativo, foco, teclado ou acessibilidade.

### Web Audio + sidecars offline

A fonte de verdade da reação musical continua sendo o pipeline definido em [RADIO.md](../RADIO.md).

Combinar:

- análise offline por faixa;
- posição real do único elemento de áudio;
- dados live do AnalyserNode apenas quando necessário;
- interpolação temporal;
- um estado normalizado consumível pelos renderers.

### Three.js / React Three Fiber

Não é fundação obrigatória.

Só entra depois de experimento isolado provar vantagem perceptiva clara sobre DOM/CSS/Motion. Casos aceitáveis incluem profundidade real, iluminação/material interativo ou exploração espacial de uma peça.

Não usar para:

- impressora girando sem função;
- partículas genéricas;
- starfield;
- objetos decorativos;
- "3D porque o site fala de impressão 3D".

## Motion system

Antes de espalhar animações pela aplicação, criar vocabulário centralizado.

Estrutura de referência:

```text
motion/
  tokens
  springs
  easings
  durations
  reduced-motion
  audio-motion
  transitions
```

O vocabulário deve representar sensação e função, por exemplo:

- `snappy`;
- `mechanical`;
- `heavy`;
- `fluid`;
- `magnetic`;
- `trackChange`;
- `panelShift`;
- `radioExpand`;
- `studioReveal`.

Evitar durações e curvas arbitrárias repetidas em componentes.

## Frentes de implementação

As frentes abaixo são recortes técnicos planejados. Elas não são estados do roadmap e não devem gerar checklists vazios antecipadamente.

### Frente 1 — Motion Foundation

Criar a infraestrutura comum de motion e definir responsabilidades entre CSS, Motion e GSAP.

Entregáveis:

- tokens de duração/easing/spring;
- primitives reutilizáveis;
- política de reduced motion;
- estratégia de cleanup;
- convenção para animações interrompíveis;
- limites de bundle/performance;
- nenhuma reescrita do player.

Gate:

- fundação reutilizável;
- lint/typecheck/build pertinentes;
- nenhuma regressão visual relevante;
- nenhuma dependência instalada sem uso demonstrado.

### Frente 2 — Audio Intelligence Bridge

Começa após existir amostra real válida do sync de análises.

Objetivo:

traduzir dados offline + estado live em um modelo único de motion.

Saída conceitual:

```text
sidecar offline
      +
currentTime / live analyzer
      ↓
audio motion state
      ↓
renderers
```

Campos devem representar apenas sinais realmente disponíveis, como energia, bandas, transientes, dinâmica e presença vocal quando derivada da separação real.

Gate:

- músicas de perfis diferentes produzem comportamento perceptivelmente diferente;
- silêncio e passagens calmas realmente acalmam;
- ausência de sidecar não derruba reprodução;
- nenhum atributo "instrumento" é inventado.

### Frente 3 — Visualizer 2.0

Substituir a lógica percebida como "barras CSS" por um renderer dirigido pelo áudio.

Separar pelo menos:

- macro energy;
- distribuição de bandas;
- transientes;
- movimento fino;
- voz central quando disponível;
- acompanhamento dobrado ao redor do centro.

Gate:

- sem padrão metronômico repetitivo;
- pausa, seek e troca de faixa não quebram a leitura;
- mini e full player usam a mesma fonte sem parecer clones redimensionados;
- comportamento estável em música calma, densa, vocal e instrumental.

### Frente 4 — Radio Living Interface

Fazer a Rádio parecer software vivo, não uma página com controles.

Mecânicas alvo:

- linha selecionada da playlist com continuidade para Now Playing;
- troca de faixa como transição espacial;
- play/pause com resposta física;
- estados de shuffle/repeat/volume/seek coerentes;
- loading/buffering/error perceptíveis sem espetáculo;
- shared layout onde houver continuidade real.

Gate:

- controles permanecem mais importantes que decoração;
- teclado e touch continuam completos;
- cliques rápidos não deixam estado intermediário travado;
- continuidade de áudio preservada.

### Frente 5 — Radio Focus Mode

A Rádio pode passar de acoplada para dominante/tela cheia sem virar uma segunda interface.

Ao ganhar espaço:

- playlist recompõe;
- visualizador expande;
- Now Playing muda de hierarquia;
- informações secundárias podem aparecer;
- controles preservam identidade e posição perceptiva.

Ao voltar, a composição retorna de forma coerente.

Gate:

- nenhuma duplicação do player;
- nenhuma perda de posição/volume/fila;
- expansão e retorno funcionam com conteúdo longo e resize.

### Frente 6 — Divider Physics

Transformar o divisor em interação espacial refinada.

Comportamentos possíveis:

- drag real;
- preview proporcional;
- limites com resistência;
- snap/spring apenas quando melhora controle;
- fullscreen no limite já aprovado;
- retorno previsível de drag incompleto.

Gate:

- função do divisor continua óbvia;
- nada de setas, equalizador ou ornamento no handle;
- pointer, touch e teclado não criam armadilhas;
- layout não entra em thrashing durante o drag.

### Frente 7 — Page Transition System

Eliminar sensação de tela destruída/recriada quando existe continuidade entre rotas/estados.

Priorizar:

- elementos persistentes;
- shared identity;
- transição espacial;
- áudio contínuo;
- navegação imediatamente responsiva.

Não tornar API experimental de navegador dependência estrutural da experiência. Pode existir como enhancement futuro se madura e testada.

Gate:

- back/forward funciona;
- refresh não depende da animação;
- transição interrompida não deixa overlay/elemento preso;
- navegação sem motion continua correta.

### Frente 8 — Studio Scroll Experience

Usar scroll como narrativa apenas em trechos que justificam.

Possíveis usos:

- ideia -> preparação -> impressão -> acabamento;
- impressora/foto mantida como âncora enquanto o conteúdo muda;
- materiais/cores revelados com relação direta ao conteúdo;
- progressão espacial curta e controlada.

Evitar:

- cada título aparecendo com fade-up;
- parallax genérico;
- scroll sequestrado;
- múltiplas cenas concorrentes;
- Rádio e Estúdio brigando por movimento.

Gate:

- sem motion, a informação continua legível;
- scroll por teclado/touch mantém orientação;
- nenhuma seção prende o usuário sem necessidade.

### Frente 9 — Depth / WebGL Experiment

Criar prova isolada antes de incorporar WebGL ao produto.

O experimento deve responder:

- o efeito comunica algo que DOM não comunica?;
- a diferença perceptiva justifica bundle/GPU/complexidade?;
- existe fallback de imagem/DOM?;
- funciona em hardware médio e mobile escolhido?;
- mantém qualidade quando reduced motion estiver ativo?

Se não superar a alternativa, descartar.

### Frente 10 — Microinteraction Pass

Depois das grandes mecânicas, revisar sistematicamente:

- play/pause;
- next/previous;
- shuffle/repeat;
- seek;
- volume/mute;
- seleção de playlist;
- busca;
- tooltips;
- foco;
- hover;
- touch;
- loading;
- erro;
- scrollbars internas;
- botões do Estúdio.

Não aplicar `scale(1.05)` como resposta universal.

Gate:

- famílias de controle compartilham gramática;
- nenhum feedback atrasa a ação;
- foco e estado selecionado não dependem apenas de cor.

### Frente 11 — Mobile Motion Experience

Mobile mantém contrato próprio:

```text
header
mini player persistente
estúdio
```

A Rádio completa pode nascer do mini player com continuidade espacial, mas sem comprimir a workstation desktop no celular.

Gate:

- mini player não domina o primeiro viewport;
- expansão/fechamento retorna ao ponto perceptivo de origem;
- touch targets e gestos não conflitam com scroll;
- rotação/resize não perde estado.

### Frente 12 — Performance Gate

Antes de considerar a experiência pronta, medir com áudio e motion ativos ao mesmo tempo.

Revisar:

- frame pacing/FPS;
- long tasks;
- layout/reflow;
- composição GPU;
- memória;
- listeners/timelines órfãos;
- bundle;
- canvas/WebGL ocioso;
- aba oculta;
- resize;
- navegação;
- mobile.

Priorizar transform/opacity e valores fora do ciclo de renderização React quando apropriado.

### Frente 13 — Experience QA

Matriz mínima:

- desktop amplo;
- notebook/desktop mais estreito;
- ~390 px mobile;
- playing;
- paused;
- buffering;
- troca rápida de faixa;
- seek;
- título longo;
- lista grande;
- música lenta;
- música densa;
- música vocal;
- instrumental;
- passagem silenciosa;
- divider drag;
- fullscreen/retorno;
- navegação;
- reduced motion.

Critério subjetivo adicional:

> Se remover glow/neon fizer a experiência perder toda a personalidade, a mecânica/composição ainda está fraca.

## Dependências com o trabalho atual

Este plano respeita o estado atual do roadmap.

- O sync de análises em execução alimenta as Frentes 2 e 3.
- O motor único, fila e sidecars continuam pertencendo ao contrato de Rádio.
- A fundação visual 03b precisa continuar estável; motion não autoriza reescrever componentes sem necessidade.
- A experiência de Rádio 07 é o principal consumidor das Frentes 3 a 7.
- O Estúdio 08 é o principal consumidor da Frente 8.
- Letras sincronizadas 06b são independentes do motion system, mas devem compartilhar o mesmo relógio do player.
- As frentes são abertas conforme dependências reais ficarem disponíveis; não criar treze PRs ou checklists de uma vez.

## Ordem de execução pretendida

Quando o roadmap liberar implementação desta camada:

```text
Motion Foundation
      ↓
Audio Intelligence Bridge
      ↓
Visualizer 2.0
      ↓
Radio Living Interface
      ↓
Radio Focus Mode
      ↓
Divider Physics
      ↓
Page Transitions
      ↓
Studio Scroll Experience
      ↓
WebGL Experiment
      ↓
Microinteraction Pass
      ↓
Mobile Motion Experience
      ↓
Performance Gate
      ↓
Experience QA
```

A ordem pode ser ajustada pelo roadmap quando uma dependência concreta mudar, mas não por impulso visual.

## Definition of done por frente

Uma frente de motion só pode ser marcada como concluída quando:

- a mecânica principal está completa;
- estados de loading/paused/error pertinentes existem;
- comportamento interrompido foi testado;
- teclado/touch pertinentes foram testados;
- reduced motion foi tratado;
- performance foi observada;
- não há efeito falso desconectado do estado real;
- Cassiano fez a revisão perceptiva quando a frente for visual;
- documentação/contratos afetados foram atualizados.

"Funciona em uma gravação" ou "build passou" não fecha entrega visual.

## Anti-slop gate

Reprovar por padrão:

- fade-up em toda seção;
- partículas/estrelas genéricas;
- glow em cada componente;
- glassmorphism como preenchimento;
- animação ambiente contínua sem evento;
- fake equalizer;
- waveform decorativa sem áudio;
- WebGL usado apenas para impressionar tecnicamente;
- cards movendo em direções aleatórias;
- scroll hijacking;
- cursores personalizados;
- movimento que esconde conteúdo até terminar;
- animações diferentes para componentes equivalentes;
- desktop mini player duplicado;
- full player desktop espremido no mobile;
- efeitos que comprometem clareza dos controles.

## Estado do artefato

- artifact_ref: `CM3D-MOTION-EXPERIENCE-v1`
- approved_direction: Cassiano, 02/10/2026
- ready_for_frontend: `no`
- motivo: a direção está aprovada para planejamento, mas a camada de áudio depende da validação das análises geradas pelo sync atual e a execução deve ser aberta pelo roadmap, uma frente de cada vez.
