# CM Motion Experience Plan V1

## Objetivo

Transformar movimento, áudio, transições e resposta de interface em parte estrutural do CM 3D & Radio, sem transformar o produto em uma demonstração de efeitos.

A meta perceptiva é: a pessoa deve perceber uma interface com mecânica própria, continuidade espacial, resposta real à música e comportamento incomum, mas ainda legível, controlável e rápida.

**Diretriz central: experiência máxima, arquitetura disciplinada.** O objetivo não é fazer o básico com uma biblioteca nova. O objetivo é chegar a um nível visual e mecânico fora do comum — com transições espaciais, física, recomposição de layout, reação musical e momentos de assinatura — sem aceitar efeito falso, travamento, inconsistência ou implementação pela metade.

Este documento **não substitui** o [Roadmap](../ROADMAP.md), [EXPERIENCE.md](../EXPERIENCE.md), [RADIO.md](../RADIO.md) ou [ARCHITECTURE.md](../ARCHITECTURE.md).

- O roadmap continua sendo a única fonte da fila de aceite e do estado macro de C1–C8. Os IDs abaixo identificam frentes e critérios; não autorizam trabalho fora da fila.
- EXPERIENCE continua definindo composição, identidade e comportamento visual aprovado.
- RADIO continua definindo player, fila, áudio, visualizador e continuidade.
- ARCHITECTURE continua definindo a stack e as regras de dependência.
- Este documento define o **nível de ambição, a linguagem de movimento, os gates de qualidade e os recortes técnicos** desta evolução.

## O nível que estamos buscando

Não é "site bem animado". É produto com mecânica própria.

A experiência deve ser capaz de entregar momentos como:

- uma faixa selecionada reorganizando a própria interface até virar Now Playing;
- a Rádio expandindo e recompondo playlist, visualizador e controles em vez de apenas aumentar de tamanho;
- o divisor alterando fisicamente a relação Estúdio/Rádio, com continuidade até fullscreen;
- visualização musical realmente dirigida pela análise da faixa;
- mini player mobile expandindo para Rádio completa mantendo identidade e continuidade;
- transições nas quais elementos persistentes parecem continuar existindo, não desaparecer e reaparecer;
- interações pequenas com sensação de peso, resposta e precisão, sem virar brinquedo.

Se uma mecânica forte exigir Motion, Canvas, WebGL ou outro recurso apropriado, ela deve ser considerada. O filtro é qualidade e adequação, não conservadorismo técnico.

## Calibração por superfície

Não existe um único nível de "loucura" para o site inteiro.

### Rádio completa

- variance: 9/10;
- motion: 9/10;
- density: 8/10.

Pode ser expressiva, tátil, densa, reativa e pouco convencional, desde que controles, faixa e playlist continuem dominando a hierarquia.

### Split desktop Estúdio + Rádio

- variance: 8/10;
- motion: 8/10;
- density: 6/10.

A assinatura vem da relação física entre os dois mundos, do resize, da recomposição e da continuidade da Rádio, não de ornamentação.

### Estúdio

- variance: 7/10;
- motion: 4/10;
- density: 5/10.

Precisa continuar calmo, material, fotográfico e premium. "Calmo" não significa estático ou convencional: os poucos momentos de motion devem ser muito bem resolvidos.

### Mobile

- variance: 7/10;
- motion: 6/10;
- density: 6/10.

Touch, legibilidade e espaço útil têm prioridade, mas o mobile também precisa ter uma mecânica memorável — principalmente na transição mini player -> Rádio completa.

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
10. **Ambição não é opcional.** Uma solução tecnicamente correta, mas visualmente comum, não fecha uma frente cuja meta seja assinatura de experiência.
11. **Sem biblioteca por vaidade.** Dependência nova entra somente junto de um caso real que prove necessidade.

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

Portanto, este plano **não autoriza reimplementar o que já existe** e **não autoriza instalar todo o stack de animação antecipadamente**. Isso é disciplina de implementação, não redução de ambição.

## Regra de stack

### CSS / browser nativo

Continua sendo suficiente apenas para:

- hover/focus/press simples;
- mudança curta de cor/opacidade;
- transição pequena sem coordenação entre componentes;
- estados que não precisam de timeline, gesto ou shared layout.

Não usar CSS puro por inércia quando a mecânica exigir física, continuidade ou orquestração mais sofisticada.

### Motion for React

É o **primeiro candidato** para coordenação de interface quando CSS deixar de ser suficiente:

- springs;
- presença;
- layout/shared layout;
- gestos;
- drag coordenado;
- transições interrompíveis;
- recomposição do player/playlist;
- morph visual entre superfícies equivalentes.

A introdução deve vir junto de mecânica real aprovada.

### GSAP / ScrollTrigger

Não entram automaticamente, mas também não estão proibidos.

ARCHITECTURE hoje determina que motores de animação não devem ser empilhados por padrão. Portanto GSAP pode entrar quando uma cena de assinatura exigir:

1. timeline/orquestração que Motion/CSS não resolvam bem;
2. ganho perceptivo relevante;
3. responsabilidade claramente delimitada;
4. custo de bundle, manutenção e cleanup medido.

Se essa prova existir, a tecnologia entra. O objetivo não é evitar GSAP; é evitar usar GSAP para hover de botão.

### Lenis

Pode ser avaliado em experiência real de scroll do Estúdio quando houver ganho claro de sincronização ou sensação. Não entra apenas para "amaciar" o scroll.

### Three.js / React Three Fiber

Não é obrigatório no primeiro marco, mas permanece disponível para uma mecânica de alto impacto que realmente se beneficie de profundidade, luz, material ou exploração espacial.

Precisa de fallback e orçamento de GPU/mobile. Não usar WebGL decorativo; usar WebGL quando ele permitir uma experiência que o DOM não consegue entregar com a mesma qualidade.

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

# Frentes e critérios de aceite

Estas frentes descrevem o comportamento esperado. A ordem vigente, os bloqueios e a próxima frente ativa ficam somente no [roadmap](../ROADMAP.md). Código antecipado em uma frente posterior não comprova seu aceite.

## C1 — Motion Core de Alto Impacto

Objetivo: provar o novo patamar de movimento com **uma única mecânica de assinatura real**, sustentada por um spine interrompível e testável. C1 não fecha com helpers, tokens ou commits isolados.

### C1.1 — Motion Spine

Responsabilidade: tornar o estado espacial da Rádio previsível antes de aumentar o espetáculo visual.

Estados conceituais:

- `split`: largura inicial aprovada;
- `custom`: largura livre escolhida pelo usuário;
- `focus`: workstation intermediária com recomposição interna;
- `fullscreen`: Rádio domina a tela, preservando a mesma instância de áudio.

Regras:

- uma nova transição invalida a anterior;
- animações WAAPI antigas não podem continuar controlando o mesmo elemento;
- callbacks/timers antigos não podem limpar o estado de uma transição nova;
- ao interromper, o novo FLIP parte da geometria **visível naquele instante**, não da geometria antiga;
- reduced motion muda estado imediatamente e não deixa resíduos;
- resize e drag não criam outro dono de layout;
- estado conceitual deve ficar observável no DOM para diagnóstico e QA.

Gate C1.1:

- abrir e inverter antes do fim não gera salto grosseiro;
- fechar e reabrir antes do fim não deixa estado fantasma;
- não existem animations/timers órfãos após substituição ou unmount;
- `split/custom/focus/fullscreen` têm ownership claro;
- C5 deixa de ser responsável pela transição de estado e passa a cuidar apenas da física da manipulação direta.

### C1.2 — Signature Radio

Responsabilidade: fazer **Rádio acoplada → focus workstation → fullscreen → retorno** parecer uma única transformação grande, rápida e inequívoca.

A composição deve mudar de verdade:

- capa/Now Playing ganha território;
- informação de faixa muda de hierarquia;
- visualizador cresce como parte da mesma superfície;
- transporte encontra posição própria;
- fila passa a ocupar uma coluna funcional;
- letra aparece quando existe espaço para isso;
- o Estúdio cede território sem parecer troca de página;
- retorno refaz a composição no sentido inverso.

A coreografia deve privilegiar poucos movimentos grandes e relacionados. Não usar uma cascata lenta de delays que faça parecer que cada controle chegou separadamente.

Gate C1.2:

- gravada sem áudio, a transformação ainda parece uma cena de assinatura;
- foco e fullscreen são perceptivelmente diferentes do split;
- fullscreen não parece sidebar apenas ficando larga;
- o fluxo completo continua rápido o suficiente para uso repetido;
- música, fila, posição, volume e estado do player permanecem contínuos.

### C1.3 — Motion QA

Responsabilidade: provar a mecânica antes de declarar C1 concluído.

Matriz mínima:

- split → focus;
- focus → split;
- focus → fullscreen;
- fullscreen → split;
- abrir e interromper no meio;
- fechar e interromper no meio;
- drag lento;
- drag rápido;
- soltura em pontos intermediários;
- fullscreen pelo link e pelo gesto;
- seek durante motion;
- troca de faixa durante motion;
- áudio contínuo;
- resize da janela;
- `prefers-reduced-motion`.

C1 só recebe `done` depois dessa matriz e da aprovação perceptiva de Cassiano.

### Stack de C1

CSS, View Transitions e WAAPI continuam válidos. Motion for React entra apenas se a política de interrupção/shared layout continuar cara ou frágil depois do spine. Não empilhar outro motor só para reescrever hover ou transições já resolvidas.

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
- música vocal, instrumental, densa e leve continuam legíveis;
- o resultado parece parte da música, não um gráfico técnico.

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
- foco e touch;
- reorganização do player quando o espaço disponível muda.

A Rádio pode ser rica e surpreendente. O limite é clareza e controle, não "ser discreta".

Gate:

- controles vencem decoração;
- ações respondem imediatamente;
- cliques rápidos não deixam estado visual incorreto;
- keyboard e touch completos;
- áudio não espera a animação;
- existe pelo menos um momento claramente memorável, não apenas microinterações corretas.

## C5 — Física de Manipulação Direta do Divisor

**C5 não cria focus/fullscreen e não possui a transição de estado.** Esses estados e sua recomposição pertencem a C1.

Objetivo: fazer o divisor parecer uma superfície física sob a mão do usuário.

Pode tratar:

- drag direto sem atraso;
- magnetismo próximo a larguras úteis;
- snap;
- flick/velocidade;
- thresholds;
- resistência e retorno;
- preview de fullscreen;
- recomposição contínua dos elementos internos enquanto a largura muda;
- resize de viewport durante um estado customizado.

Gate:

- não recria player;
- não perde fila/posição/volume;
- o cursor/pointer continua preso ao gesto sem lag;
- snap não rouba intenção quando o usuário quer largura livre;
- flick avança de forma previsível;
- fullscreen pelo gesto converge para o mesmo estado de C1;
- teclado permanece previsível;
- layout não sofre thrashing;
- nenhuma lógica de C5 duplica o motion spine de C1.

## C6 — Mobile Signature Experience

Mobile é validado em todas as etapas anteriores. Esta etapa cria a mecânica memorável própria do mobile.

Objetivo:

- mini player compacto e persistente;
- expansão para Rádio completa com continuidade espacial forte;
- player completo reorganizado para touch, não versão comprimida do desktop;
- fechamento retornando de forma coerente ao ponto de origem;
- resposta visual a track change e playing state sem roubar o viewport.

Gate:

- primeiro viewport continua pertencendo ao Estúdio;
- gesto não conflita com scroll;
- touch targets corretos;
- rotação/resize preserva estado;
- nada depende de hover;
- mini -> full -> mini parece uma transformação do mesmo produto, não troca brusca de componente.

## C7 — Microinteraction High-Fidelity Pass

Revisar o conjunto depois das grandes mecânicas para que o nível de acabamento dos detalhes acompanhe as cenas maiores.

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
- não existe `scale(1.05)` como resposta universal;
- nenhum controle importante parece "HTML padrão com CSS por cima".

## C8 — Integrated Performance + Experience QA

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

# Extensões condicionais

"Fora do caminho crítico" não significa "sem ambição" nem "provavelmente nunca". Significa apenas que não devem bloquear o primeiro marco se o conteúdo ou pré-requisito ainda não existir.

## X1 — Continuidade de rota

Na navegação Home → Estúdio → Home, a Rádio deve permanecer no shell persistente, sem recriar áudio, fila ou posição. A rota real `/studio` permite trabalhar essa continuidade, mas sua implementação não fecha a prova de C1, que nesta rodada é a transformação da **Rádio** entre split, focus e tela inteira. Trabalho adicional de rota segue a prioridade do roadmap.

## X2 — Studio Scroll Experience

Abrir quando o Estúdio possuir conteúdo real suficiente para formar narrativa.

Possíveis casos:

- ideia -> preparação -> impressão -> acabamento;
- mídia real ancorada enquanto contexto muda;
- materiais/cores com progressão ligada ao conteúdo;
- câmera/composição mudando conforme scroll quando houver mídia adequada.

Proibido inventar catálogo ou prova falsa para viabilizar a cena.

GSAP/ScrollTrigger/Lenis podem ser avaliados aqui mediante o gate de stack.

## X3 — Depth / WebGL

Experimento de alto impacto comparado com alternativa DOM.

Responder antes de incorporar:

- comunica algo útil?;
- impressiona mesmo sem explicação?;
- justifica custo de bundle/GPU?;
- existe fallback?;
- funciona em hardware médio?;
- continua coerente em reduced motion?

Se funcionar e trouxer uma mecânica que eleve claramente o site, incorporar. Se for só "olha, tem 3D", descartar.

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
- continuidade do player;
- diferença perceptível em relação ao estado anterior.

Não deixar esses temas para um PR de "polimento".

# Anti-slop gate

Reprovar por padrão:

- fade-up em toda seção vendido como grande motion;
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
- biblioteca adicionada sem caso de uso aprovado;
- solução "segura" que tecnicamente funciona, mas visualmente continua parecendo site comum.

# Dependências com o roadmap atual

- 03b já contém shell, resize e fullscreen por drag em andamento. Motion novo deve elevar, não reimplementar.
- 06 fornece motor, analyzer, sidecars e contrato de áudio.
- O sync atual desbloqueia C2/C3 após validação de uma amostra real.
- 06b usa o mesmo relógio do player, mas não depende deste plano para funcionar.
- 07 é o principal consumidor de C3-C6.
- 08 pode ser entregue sem X2/X3, mas essas extensões permanecem candidatas fortes assim que existir conteúdo real que as justifique.
- 09 valida o conjunto integrado e não deve esperar uma extensão sem pré-requisito real.

# Relação com a execução

O [roadmap](../ROADMAP.md) registra qual frente pode avançar agora. O [checklist 03b](../work/03b-frontend-foundation.md) guarda os passos e a evidência da transformação visual da Rádio; o [checklist 06](../work/06-radio-engine.md) guarda a análise e a resposta musical. O [inventário de código de 03/10](CM_MOTION_IMPLEMENTATION_LOG_2026-10-03.md) é uma fotografia técnica, sem aprovação perceptiva. X2/X3 continuam condicionais aos seus próprios pré-requisitos.

# Definition of done por frente

Uma frente só pode ser concluída quando:

- a mecânica principal está inteira;
- existe ganho perceptivo claro em relação ao estado anterior;
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

"Build passou", "funciona no meu clique", "está tecnicamente correto" ou "tem animação" não fecham experiência.

# Estado do artefato

- artifact_ref: `CM3D-MOTION-EXPERIENCE-v1`
- approved_by: Cassiano
- approved_scope: experiência extrema com disciplina técnica; não baseline conservador
- ready_for_frontend: `yes`

A aprovação acima cobre a direção de experiência, não a execução de C1–C8. O estado dessa execução pertence ao roadmap.
