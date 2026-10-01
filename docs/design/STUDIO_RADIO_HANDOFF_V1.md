# Handoff V1: Estúdio de Impressão 3D + CM Rádio

Status: proposta de composição pronta para aprovação visual. Este documento fixa geometria, hierarquia e comportamento. Paleta final, tipografia final e acabamento fino continuam na etapa 03.4.

## 1. Objetivo do primeiro recorte

Entregar uma experiência pública que já pareça produto final mesmo com pouco conteúdo 3D:

- **Estúdio de Impressão 3D** claramente apresentado;
- **CM Rádio funcional e visualmente completa**;
- nenhum produto, material, número ou categoria inventado para preencher espaço;
- estrutura pronta para receber conteúdo real progressivamente.

A referência visual aprovada na conversa de 28/09/2026 é usada por composição, densidade, relação 3D/Rádio e peso da fotografia. Não copiar seus cards genéricos nem conteúdo fictício.

---

## 2. Desktop

### Breakpoint do split

O layout dividido é usado a partir de **1180 px** de largura útil.

Abaixo disso entra o comportamento compacto/mobile, sem tentar esmagar o Estúdio e a Rádio lado a lado.

### Shell

Estrutura:

```text
┌─────────────────────────────────────────────┬───────────────┐
│ Header do Estúdio                           │ CM Rádio      │
├─────────────────────────────────────────────┤ desde o topo  │
│ Estúdio de Impressão 3D                     │ da tela       │
│ hero + conteúdo 3D real disponível          │               │
└─────────────────────────────────────────────┴───────────────┘
```

**Não existe mini player no desktop.**

A Rádio começa no topo do viewport, ocupa toda a altura útil e permanece fixa enquanto o Estúdio rola. O header pertence apenas à coluna do Estúdio. Quando houver muitas faixas, somente a lista interna da Rádio rola; o player completo continua visível.

### Header

- altura alvo: 64-72 px;
- logo CM à esquerda;
- navegação curta;
- busca somente quando tiver utilidade real;
- sem barra carregada de ícones sem função;
- borda inferior sutil, sem glassmorphism pesado.

### Proporção inicial

Em 1440 px:

- gutter externo: 24-32 px;
- Rádio padrão: **480 px em 1440 px**, reduzindo proporcionalmente até 400 px perto do limite desktop;
- Estúdio usa todo o restante;
- divisor visual: 1 px;
- área interativa do divisor: 16 px.

O divisor visual é a própria borda da Rádio: não há coluna ou faixa escura entre as duas superfícies. A área interativa de 16 px fica transparente e centrada nessa borda; não mostrar puxador permanente.

A largura não deve ser tratada como valor rígido. Usar limites:

- Rádio mínima: **400 px**;
- Rádio padrão: **min(480 px, 1/3 da largura)**, com mínimo de 400 px e respeitando o espaço do Estúdio;
- Rádio expandida: **clamp(560px, 48vw, 720px)**;
- o Estúdio nunca pode cair abaixo de aproximadamente **640 px** no modo split.

Se o viewport não comportar esses limites, mudar para o shell compacto em vez de deformar os dois lados.

### Resize

O divisor:

- usa Pointer Events;
- cursor `col-resize`;
- não anima enquanto o usuário arrasta;
- suporta teclado quando focado;
- `ArrowLeft/ArrowRight`: passo pequeno;
- `Shift + Arrow`: passo maior;
- botão **Expandir rádio** continua existindo como alternativa ao arraste.

O estado da largura pertence ao layout. Não altera fila, faixa, posição ou elemento de áudio.

### Presets

Três estados de apresentação:

1. **Padrão**: Rádio em 400-480 px conforme a largura desktop.
2. **Expandida**: Rádio em aproximadamente 48% da largura, respeitando 720 px.
3. **Personalizada**: largura deixada pelo usuário dentro dos limites.

O botão expandir alterna entre Padrão e Expandida. Se o usuário arrastar depois, entra em Personalizada.

Na revisão de Cassiano em 29/09/2026, a largura inicial de 390 px foi considerada fina. A Rádio passa a abrir em 480 px em 1440 px, diminuindo proporcionalmente até 400 px perto de 1180 px para preservar o Estúdio. O botão Expandir/Recolher fica visível no próprio cabeçalho. A mudança de largura por botão anima em 260 ms; o arraste responde diretamente ao ponteiro.

---

## 3. Estúdio de Impressão 3D

### Primeiro viewport

O visitante deve entender em poucos segundos:

1. isso é um **Estúdio de Impressão 3D**;
2. são criações/soluções físicas reais;
3. existe também uma Rádio CM integrada ao mesmo site.

### Hero

Obrigatório:

- label visível, centralizado logo abaixo do logo: **ESTÚDIO DE IMPRESSÃO 3D & MÚSICAS**;
- headline forte, curta e legível;
- texto de apoio curto e legível na largura disponível;
- CTA primário quando houver destino funcional;
- no máximo 1 CTA secundário;
- uma imagem principal forte quando houver mídia real aprovada.

A fotografia deve carregar mais peso visual que ornamentos de interface.

Até existir foto definitiva, o primeiro viewport usa o logo fornecido por Cassiano como âncora visual, junto de título e texto. Não ocupar metade da abertura com um card de placeholder. Não fabricar peça ou produto fictício e apresentá-lo como real.

### Depois do hero

Na primeira versão, manter somente conteúdo que exista.

Cassiano substituiu o marcador e o lead do hero por **ESTÚDIO 3D** e “Descubra mais sobre nosso estúdio, peças, materiais, cores e muito mais para voce explorar..”. Os blocos adicionais “O ESTÚDIO / Do arquivo ao objeto real” e “PRÓXIMAS ENTRADAS” saem da home. O botão “Conheça mais sobre” permanece e levará à página do Estúdio quando ela existir. Até lá, ele e o item “Sobre” ficam visíveis, mas desativados; não criar uma rota por inferência.

Não renderizar seção de produtos, materiais, categorias ou trabalhos se a fonte estiver vazia.

Quando os dados chegarem, novas seções entram **abaixo** sem alterar o shell Estúdio/Rádio.

---

## 4. CM Rádio no desktop

A Rádio é uma **região da experiência**, não um card dentro da home.

Ordem visual padrão:

1. cabeçalho CM Rádio no topo da tela + ação Expandir/Recolher;
2. capa/arte da faixa;
3. faixa atual e metadados;
4. progresso;
5. transporte;
6. visualizador;
7. abas/contexto de biblioteca quando necessário;
8. busca;
9. lista de faixas.

A largura expandida permite reflow interno: capa maior, mais espaço para metadados e biblioteca. Não simplesmente escalar todos os elementos.

Com largura mínima, priorizar faixa atual, transporte e lista. Elementos secundários podem reduzir densidade, nunca legibilidade.

---

## 5. Mobile / compacto

Aplicado abaixo do breakpoint do split.

Estrutura obrigatória:

```text
Header
Mini player
Estúdio de Impressão 3D
Conteúdo 3D real disponível
```

### Header

- 56-64 px;
- logo;
- apenas ações realmente necessárias;
- menu quando a navegação não couber;
- não duplicar controles da Rádio no header.

### Mini player

**Existe somente no layout mobile/compacto.**

Posição:

- imediatamente abaixo do header;
- pode ficar sticky junto ao header durante scroll;
- não pode sobrepor o hero nem o teclado.

Conteúdo mínimo:

- capa/fallback;
- título;
- artista;
- play/pause;
- próxima faixa;
- progresso compacto;
- ação para abrir Rádio completa.

Não tentar colocar a biblioteca completa no mini player.

### Rádio completa no mobile

Abre sob demanda como superfície dedicada de largura e altura totais da tela dentro do shell persistente.

Precisa preservar:

- faixa;
- posição;
- volume;
- fila;
- shuffle/repeat;
- histórico do controller.

Fechar a Rádio devolve a pessoa ao Estúdio no mesmo ponto útil da navegação.

---

## 6. Crescimento do 3D

As seções futuras são dirigidas por conteúdo, não por layout vazio.

### Produtos

Só aparece quando existirem itens publicados.

### Materiais e cores

Só aparece quando existirem opções reais e a relação entre material/cor/disponibilidade estiver definida.

### Trabalhos para clientes

Só aparece com material autorizado.

### Fotos e mídia

Entram como galeria/editorial conforme o volume justificar.

Nenhuma dessas áreas é requisito visual para que a primeira home pareça completa.

---

## 7. Regras de composição

### Adotar

- contraste alto;
- tipografia clara e grande onde importa;
- fotografia real;
- superfícies escuras profundas;
- acentos CM controlados;
- Rádio com aparência de equipamento/software musical;
- bordas discretas;
- poucos níveis de profundidade;
- bastante precisão no alinhamento.

### Evitar

- sequência de 4 cards de benefício;
- card dentro de card;
- grid de cards para qualquer informação;
- ícone colorido só para preencher seção;
- gradiente em toda borda;
- glow constante;
- microtexto cinza;
- espaço vertical enorme sem mídia/conteúdo;
- efeito cyberpunk genérico;
- astronauta ou tema espacial herdado;
- fake dashboard.

---

## 8. Motion deste recorte

### Resize da Rádio

- durante drag: resposta direta, sem easing;
- botão expandir/recolher: 220-280 ms;
- preferência por transformação de grid/width com layout estável;
- reduced motion: transição curta ou instantânea.

### Controles

- hover/press: 120-160 ms;
- troca de faixa: crossfade visual discreto 160-220 ms;
- foco visível sempre independente da animação.

### Visualizador

Movimento contínuo pertence somente ao conteúdo de áudio. Não usar o visualizador como decoração fora da Rádio.

---

## 9. Requisitos responsivos

Testar explicitamente:

- 1440 px, Rádio padrão;
- 1440 px, Rádio expandida;
- 1180 px, limite inferior do split;
- ~1024 px, shell compacto;
- 390 px;
- 360 px;
- zoom de texto 200%.

Nenhum breakpoint pode criar mini player no desktop split.

---

## 10. O frontend não pode inventar

Sem nova aprovação, frontend não pode:

- adicionar mini player ao desktop;
- adicionar cards de benefício;
- mudar a ordem mobile;
- adicionar sidebar comprimida no mobile;
- inventar categorias/produtos/materiais;
- introduzir nova paleta local;
- alterar limites de resize para resolver layout ruim;
- colocar controles essenciais apenas no hover;
- criar ornamentos decorativos genéricos para preencher vazio.

---

## 11. Próxima decisão visual

Depois deste handoff estrutural, fechar:

1. família tipográfica;
2. paleta final e tokens;
3. acabamento de Button/Header/Radio/TrackRow;
4. motion final;
5. mock final em 1440 padrão, 1440 expandido e 390 mobile.

`ready_for_frontend: no`

`approved_by: null`

`artifact_ref: docs/design/STUDIO_RADIO_HANDOFF_V1.md`
