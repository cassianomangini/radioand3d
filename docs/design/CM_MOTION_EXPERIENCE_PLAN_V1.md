# CM Motion Experience Plan V1

## Objetivo

Transformar movimento, áudio, transições e resposta de interface em parte estrutural do CM 3D & Radio, sem transformar o produto em uma demonstração de efeitos.

A meta perceptiva é: a pessoa deve perceber uma interface com mecânica própria, continuidade espacial, resposta real à música e comportamento incomum, mas ainda legível, controlável e rápida.

Este documento **não substitui** o [Roadmap](../ROADMAP.md), [EXPERIENCE.md](../EXPERIENCE.md), [RADIO.md](../RADIO.md) ou [ARCHITECTURE.md](../ARCHITECTURE.md).

- O roadmap continua sendo a única fonte de sequência e estado macro.
- EXPERIENCE continua definindo composição, identidade e comportamento visual aprovado.
- RADIO continua definindo player, fila, áudio, visualizador e continuidade.
- ARCHITECTURE continua definindo a stack e as regras de dependência.
- Este documento define o **nível de ambição, a linguagem de movimento, os gates de qualidade e os recortes técnicos** desta evolução.

## Calibração por superfície

Não existe um único nível de "loucura" para o site inteiro.

### Rádio completa

- variance: 9/10;
- motion: 9/10;
- density: 8/10.

Pode ser expressiva, tátil, densa, reativa e pouco convencional, desde que controles, faixa e playlist continuem dominando a hierarquia.

### Split desktop Estúdio + Rádio

- variance: 8/10;
- motion: 7/10;
- density: 6/10.

A assinatura vem da relação física entre os dois mundos, do resize e da continuidade da Rádio, não de ornamentação.

### Estúdio

- variance: 6/10;
- motion: 3-4/10;
- density: 5/10.

Precisa continuar calmo, material, fotográfico e premium. Não importar para o Estúdio toda a agitação visual da Rádio.

### Mobile

- variance: 6/10;
- motion: 5/10;
- density: 6/10.

Touch, legibilidade e espaço útil têm prioridade sobre espetáculo.

## Princípios não negociáveis

1. **Movimento tem causa.** Toda animação responde a áudio, estado, seleção, navegação, arraste, foco, expansão, scroll ou outra ação real.
2. **Áudio verdadeiro.** Visualizador e efeitos audio-reactive usam dados medidos. Sem pulso, voz, beat ou movimento inventado.
3. **Continuidade espacial.** Quando um elemento continua sendo o mesmo objeto conceitual, preferir transformação/recomposição a destruir e recriar visualmente.
4. **Um único player.** Nenhum sistema de motion cria outro elemento de áudio ou outro dono da fila.
5. **Interrupção segura.** Troca rápida, seek, resize, drag, mudança de rota e fechamento de painel não deixam estado fantasma.
6. **Mobile desde o começo.** Nenhuma frente visual desktop pode ser considerada completa deixando mobile para o fim.
7. **Performance desde o começo.** O gate final existe, mas cada frente já precisa respeitar orçamento de frame, render e bundle.
8. **Reduced motion é uma composição válida.** Não é apenas desligar `animation`.
9. **Sem efeito para esconder design fraco.** Se remover glow e cor fizer a composição desabar, a mecânica ainda não está pronta.
10. **Sem biblioteca por vaidade.** Dependência nova entra somente junto de um caso real que prove necessidade.

## Estado técnico atual que este plano deve respeitar

O projeto já possui:

- Next.js App Router e React;
- um único provider/motor persistente da Rádio;
- fila/controller separados da UI;
- análise live por Web Audio;
- pipeline de sidecars offline do visualizador;
- visualizador real em implementação;
- resize/expansão desktop já pertencentes à 03b;
- trabalho de fullscreen por drag já registrado em `feat/desktop-radio-fullscreen-drag`;
- mini player mobile já existente no recorte atual.

O `package.json` atual não possui Motion, GSAP, Lenis, Three.js ou React Three Fiber.

Portanto, este plano **não autoriza reimplementar o que já existe** e **não autoriza instalar todo o stack de animação antecipadamente**.

## Regra de stack

### CSS / browser nativo

Continua sendo a primeira opção para:

- hover/focus/press simples;
- mudança curta de cor/opacidade;
- transição pequena sem coordenação entre componentes;
- estados que não precisam de timeline, gesto ou shared layout.

### Motion for React

É o **primeiro candidato** para coordenação de interface quando CSS deixar de ser suficiente:

- springs;
- presença;
- layout/shared layout;
- gestos;
- drag coordenado;
- transições interrompíveis;
- recomposição do player/playlist.

Não instalar para criar abstração vazia. A introdução deve vir junto do primeiro caso de uso real aprovado.

### GSAP / ScrollTrigger

**Não fazem parte da fundação obrigatória.**

ARCHITECTURE hoje determina que motores de animação não devem ser empilhados por padrão. Portanto GSAP só pode entrar por uma decisão técnica explícita depois de um experimento provar que:

1. Motion/CSS não resolvem bem a cena;
2. existe ganho perceptivo relevante;
3. o custo de bundle, manutenção e cleanup foi medido;
4. não existe sobreposição confusa de responsabilidade.

Se aprovado, fica restrito à cena que justificou sua entrada.

### Lenis

Não é dependência planejada do core.

Só pode ser avaliado dentro de um experimento real de scroll do Estúdio, se o scroll nativo + ferramenta escolhida não entregarem sincronização suficiente. Não entra apenas para alterar a "sensação" do scroll.

### Three.js / React Three Fiber

Não é dependência do primeiro marco.

Só entra após prova isolada demonstrar que profundidade, luz, material ou exploração espacial agregam algo que DOM/CSS/Motion não entregam. Precisa de fallback e orçamento de GPU/mobile.

## Organização do motion

A arquitetura já reserva `src/components/motion/` para primitives/presets compartilhados. Não criar outro framework paralelo.

Regras:

- tokens globais de duração/easing ficam na fonte canônica de tokens;
- primitives compartilhadas ficam em `src/components/motion/` quando houver repetição real;
- comportamento específico da Rádio continua dentro do domínio da Rádio;
- audio-motion não deve transformar dados do áudio em estado React global a cada frame;
- não criar dezenas de presets abstratos antes de existirem consumidores.

Vocabulário de sensação pode incluir nomes como:

- `snappy`;
- `mechanical`;
- `heavy`;
- `fluid`;
- `trackChange`;
- `panelShift`;
- `radioExpand`.

O nome deve representar função/sensação real, não mascarar números arbitrários.

# Caminho crítico

As etapas abaixo são o caminho principal. Experimentos opcionais ficam fora dele.

## C1 — Motion Foundation mínima

Objetivo: criar somente a infraestrutura necessária para as primeiras mecânicas aprovadas.

Inclui:

- consolidar tokens de duração/easing existentes;
- definir política de interruption/cancelamento;
- definir reduced motion;
- definir ownership entre CSS e a primeira biblioteca adotada;
- criar primitives somente quando houver uso real;
- medir custo da dependência introduzida;
- preservar o player existente.

Não inclui:

- GSAP;
- Lenis;
- Three.js;
- um "framework de motion" vazio;
- reescrita dos controles atuais.

Gate:

- primeira mecânica real usa a fundação;
- não existem duas soluções diferentes para a mesma classe de animação;
- lint/typecheck/build pertinentes passam;
- nenhuma regressão de player, resize ou mobile.

## C2 — Audio Motion Contract

Dependência: amostra real válida do sync do visualizador.

Objetivo: transformar dados offline + relógio real do player em um contrato consumível por renderers, sem inventar semântica musical.

Pode expor sinais como:

- energia;
- bandas;
- transientes;
- componente harmônico/percussivo quando disponível;
- presença vocal derivada do stem real;
- dinâmica.

Não deve tentar nomear instrumento por barra.

Gate:

- faixas diferentes produzem comportamento diferente;
- silêncio/passagem calma reduz atividade;
- seek encontra o quadro correto sem "correr" animação atrasada;
- sidecar ausente usa fallback sem quebrar áudio;
- dados por frame não rerenderizam a aplicação inteira.

## C3 — Visualizer 2.0

Objetivo: transformar o visualizador atual em uma superfície musical convincente usando o contrato aprovado em RADIO.

Camadas possíveis:

- macro energy;
- energia por região;
- transientes;
- voz central quando disponível;
- acompanhamento dobrado ao redor do centro;
- attack/release coerente.

Desktop e mini player usam a mesma análise, reamostrada para suas geometrias.

Gate perceptivo:

- sem movimento metronômico repetido;
- sem "dança aleatória";
- regiões diferentes realmente respondem de forma diferente;
- passagem calma acalma;
- pausa relaxa;
- troca de faixa e seek não deixam resíduos;
- música vocal, instrumental, densa e leve continuam legíveis.

## C4 — Radio Living Interface

Objetivo: fazer seleção e transporte parecerem partes do mesmo software vivo.

Alvos:

- seleção de faixa;
- playlist -> Now Playing quando houver continuidade espacial real;
- troca de metadados/capa;
- play/pause;
- shuffle/repeat;
- seek/volume;
- loading/buffering/error;
- foco e touch.

Não transformar todo controle em animação de assinatura. A Rádio pode ser rica, mas não pode ficar cansativa.

Gate:

- controles vencem decoração;
- ações respondem imediatamente;
- cliques rápidos não deixam estado visual incorreto;
- keyboard e touch completos;
- áudio não espera a animação.

## C5 — Split / Focus / Divider refinement

**Esta etapa não cria o fullscreen do zero.**

O fullscreen por drag e a prévia já pertencem ao trabalho atual da 03b. Esta frente começa do comportamento que estiver integrado e aprovado e faz somente o refinamento necessário.

Pode tratar:

- continuidade entre split e fullscreen;
- recomposição interna da Rádio conforme largura;
- spring/snap somente se melhorar controle;
- estados padrão/personalizado/fullscreen;
- retorno ao split;
- resize durante viewport change.

Gate:

- não recria player;
- não perde fila/posição/volume;
- drag continua direto, sem lag;
- fullscreen pelo link e pelo gesto converge para o mesmo estado;
- teclado/pointer permanecem previsíveis;
- layout não sofre thrashing.

## C6 — Mobile parity e expansão

Mobile é validado em todas as etapas anteriores. Esta etapa é um refinamento específico da relação mini player -> Rádio completa.

Objetivo:

- mini player compacto e persistente;
- abertura da Rádio completa sem parecer uma workstation desktop comprimida;
- continuidade perceptiva entre origem e destino quando isso ajudar;
- fechamento devolvendo a pessoa ao ponto útil do Estúdio.

Gate:

- primeiro viewport continua pertencendo ao Estúdio;
- gesto não conflita com scroll;
- touch targets corretos;
- rotação/resize preserva estado;
- nada depende de hover.

## C7 — Microinteraction integration pass

Revisar o conjunto depois das grandes mecânicas para remover inconsistências, não para adicionar efeitos em tudo.

Cobrir:

- transport;
- busca;
- playlist;
- seek;
- volume;
- tooltips;
- foco;
- estados disabled/loading/error;
- scroll interno;
- CTA do Estúdio.

Gate:

- controles equivalentes compartilham gramática;
- nenhum feedback atrasa ação;
- foco/seleção não dependem somente de cor;
- não existe `scale(1.05)` como resposta universal.

## C8 — Integrated performance + experience QA

Performance é verificada em cada etapa. Aqui ocorre a prova integrada.

Medir e observar:

- frame pacing;
- long tasks;
- reflow/layout;
- memória;
- listeners/timelines órfãos;
- bundle;
- loops de animação invisíveis;
- aba oculta;
- resize;
- drag;
- navegação;
- áudio + motion simultâneos.

Matriz mínima:

- desktop amplo;
- notebook/desktop estreito;
- 1180 px próximo do limite do split;
- ~390 px mobile;
- playing;
- paused;
- buffering;
- troca rápida de faixa;
- seek;
- título longo;
- lista grande;
- música calma;
- música densa;
- vocal;
- instrumental;
- silêncio/passagem baixa;
- divider drag;
- fullscreen/retorno;
- reduced motion.

Nenhuma frente visual fecha sem revisão perceptiva de Cassiano.

# Extensões condicionais — fora do caminho crítico

Estas ideias podem ser muito fortes, mas **não podem bloquear o marco Estúdio + Rádio**.

## X1 — Page continuity / route transitions

Só abrir quando existirem pelo menos dois destinos públicos reais nos quais a continuidade entre elementos faça sentido.

Objetivos possíveis:

- preservar identidade;
- evitar sensação de teardown;
- manter Rádio contínua;
- shared layout entre elementos realmente persistentes.

Não criar rota ou arquitetura só para justificar uma transição.

## X2 — Studio Scroll Experience

Só abrir quando o Estúdio possuir conteúdo real suficiente para formar narrativa.

Possíveis casos:

- ideia -> preparação -> impressão -> acabamento;
- mídia real ancorada enquanto contexto muda;
- materiais/cores com progressão ligada ao conteúdo.

Proibido preencher a página com conteúdo fictício para viabilizar a cena.

GSAP/ScrollTrigger/Lenis só podem ser avaliados aqui mediante o gate de stack descrito acima.

## X3 — Depth / WebGL

Experimento isolado, descartável e comparado com alternativa DOM.

Responder antes de incorporar:

- comunica algo útil?;
- a melhoria é perceptível sem explicação?;
- justifica custo de bundle/GPU?;
- existe fallback?;
- funciona em hardware médio?;
- continua coerente em reduced motion?

Se qualquer resposta importante for não, descartar.

# Gates contínuos

Toda frente visível precisa validar, durante a própria implementação:

- desktop e mobile aplicáveis;
- touch/keyboard;
- reduced motion;
- estado interrompido;
- performance;
- cleanup;
- loading/error/disabled pertinentes;
- ausência de movimento falso;
- continuidade do player.

Não deixar esses temas para um PR de "polimento".

# Anti-slop gate

Reprovar por padrão:

- fade-up em toda seção;
- parallax genérico;
- partículas/estrelas;
- glow em cada controle;
- glassmorphism como preenchimento;
- ambient motion sem evento;
- fake equalizer/waveform;
- animações diferentes para controles equivalentes;
- scroll hijacking;
- cursor customizado;
- conteúdo escondido até a animação acabar;
- desktop mini player duplicado;
- full player desktop espremido no mobile;
- WebGL usado apenas para provar capacidade técnica;
- biblioteca adicionada sem caso de uso aprovado.

# Dependências com o roadmap atual

- 03b já contém shell, resize e fullscreen por drag em andamento. Motion novo deve complementar, não reimplementar.
- 06 fornece motor, analyzer, sidecars e contrato de áudio.
- O sync atual desbloqueia C2/C3 após validação de uma amostra real.
- 06b usa o mesmo relógio do player, mas não depende deste plano para funcionar.
- 07 é o principal consumidor de C3-C6.
- 08 pode ser entregue sem X2/X3. Scroll cinematográfico e WebGL não são requisito de lançamento.
- 09 valida o conjunto integrado e não deve esperar extensões opcionais.

# Ordem pretendida

Caminho crítico:

```text
C1 Motion Foundation mínima
        ↓
C2 Audio Motion Contract
        ↓
C3 Visualizer 2.0
        ↓
C4 Radio Living Interface
        ↓
C5 Split / Focus / Divider refinement
        ↓
C6 Mobile parity e expansão
        ↓
C7 Microinteraction integration pass
        ↓
C8 Integrated performance + experience QA
```

X1/X2/X3 são extensões condicionais independentes e entram somente quando seus pré-requisitos reais existirem.

C1 pode ser iniciada sem esperar o sync, desde que o roadmap permita. C2/C3 dependem da análise real. Mobile, performance, accessibility e reduced motion não esperam C6/C8: são gates contínuos.

# Definition of done por frente

Uma frente só pode ser concluída quando:

- a mecânica principal está inteira;
- não há implementação paralela antiga fazendo a mesma função;
- estados pertinentes estão cobertos;
- interrupção foi testada;
- desktop/mobile aplicáveis foram tratados;
- keyboard/touch aplicáveis foram tratados;
- reduced motion foi tratado;
- performance foi observada;
- cleanup foi verificado;
- não existe efeito falso desconectado do estado real;
- Cassiano revisou perceptivamente quando a mudança é visual;
- contratos/checklist/roadmap afetados foram atualizados.

"Build passou", "funciona no meu clique" ou "ficou bonito em uma gravação" não fecha experiência.

# Estado do artefato

- artifact_ref: `CM3D-MOTION-EXPERIENCE-v1`
- approved_by: Cassiano
- approved_scope: nível de ambição e direção de motion
- ready_for_frontend: `no`
- motivo: este artefato organiza a direção e os gates; cada recorte executável ainda precisa ser aberto no roadmap/checklist vigente. C2/C3 também aguardam validação perceptiva de uma amostra real do sync.
