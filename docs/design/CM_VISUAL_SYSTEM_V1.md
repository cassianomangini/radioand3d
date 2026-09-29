# Sistema Visual CM V1

Status: **proposta para aprovação de Cassiano**. Este documento define valores concretos para que o mock final e o frontend falem a mesma língua. Nada aqui vira regra definitiva antes da aprovação visual.

## 1. Caráter

A direção é **estúdio criativo premium**, não cyberpunk genérico.

A interface precisa parecer:

- precisa;
- moderna;
- tecnológica;
- confortável;
- musical;
- física/tátil na parte 3D;
- refinada sem parecer agência de IA.

O contraste principal vem de:

1. superfícies escuras e calmas;
2. tipografia clara e grande;
3. mídia real;
4. poucos acentos azul/ciano/violeta;
5. densidade maior dentro da Rádio.

Não usar brilho como substituto de hierarquia.

---

## 2. Tipografia

### Família principal

**Manrope**

Uso:

- navegação;
- hero;
- títulos;
- textos;
- botões;
- lista de músicas.

Pesos:

- 400: texto secundário;
- 500: interface;
- 600: navegação/labels;
- 700: botões e headings;
- 800: hero quando necessário.

Motivo: geométrica sem ser caricata, leitura muito boa, moderna e menos "sci-fi pronta" que famílias futuristas.

### Família técnica

**IBM Plex Mono**

Uso restrito:

- duração;
- tempo atual;
- labels técnicos da Rádio;
- pequenos estados;
- informações do visualizador.

Não usar mono em parágrafos nem em todo o player.

### Escala

| Papel | Desktop | Mobile | Peso | Linha |
| --- | ---: | ---: | ---: | ---: |
| Hero | clamp(56px, 5.2vw, 76px) | clamp(40px, 11vw, 52px) | 750/800 | 0.98 |
| H2 | 42-52px | 32-38px | 700 | 1.06 |
| H3 | 24-30px | 22-26px | 700 | 1.15 |
| Lead | 18px | 17px | 400/500 | 1.55 |
| Body | 16px | 16px | 400/500 | 1.6 |
| UI | 14-15px | 14-15px | 500/600 | 1.35 |
| Technical | 12-13px | 12-13px | 500/600 mono | 1.3 |

Hero: tracking aproximado de -0.045em.
Headings: -0.025em a -0.035em.
Body: tracking normal.

---

## 3. Paleta

### Superfícies

- `page`: **#080B12**
- `studio-surface`: **#0B1019**
- `radio-surface`: **#0D1420**
- `panel`: **#111A28**
- `elevated`: **#162131**
- `media-light`: **#E9EDF2**
- `overlay`: rgba(4, 7, 12, .86)

O lado do Estúdio é um pouco mais neutro. A Rádio é ligeiramente mais fria/azulada.

### Texto

- `text-primary`: **#F5F7FB**
- `text-secondary`: **#B1BBC8**
- `text-muted`: **#7E8998**
- `text-disabled`: **#596373**

Texto normal nunca pode depender de hover para ganhar contraste.

### Acentos

- `cm-blue`: **#4E9DFF**
- `cm-cyan`: **#52D6FF**
- `cm-violet`: **#8B6DFF**
- `focus`: **#8DDBFF**

Uso:

- azul: ação primária e seleção;
- ciano: detalhe vivo, foco e progresso;
- violeta: Rádio/visualizador e estados secundários de música;
- gradiente azul->violeta: permitido somente em pequenas áreas de assinatura, visualizador e progresso especial; não contornar cada card.

### Status

- sucesso: #65D5A2
- aviso: #F0C26A
- erro: #FF7E8B

---

## 4. Superfícies e profundidade

Bordas:

- sutil: rgba(255,255,255,.08)
- forte: rgba(255,255,255,.14)
- selecionado: mistura do accent com 45-60% de opacidade

Raios:

- controle: 10px
- componente: 14px
- painel principal: 18px
- mídia: 16px

Não usar pill em botões comuns. Pill fica reservado para pequenos filtros/status quando fizer sentido.

Sombra:

- quase nenhuma em layout comum;
- `0 18px 55px rgba(0,0,0,.30)` somente em superfície elevada que realmente precise se separar;
- sem glow permanente ao redor dos painéis.

---

## 5. Header

Desktop:

- 68px;
- fundo praticamente sólido, levemente separado da página;
- logo CM à esquerda;
- navegação curta;
- tipografia 14px / 600;
- item ativo indicado por texto/acento, não por cápsula grande;
- ações secundárias discretas.

Mobile:

- 60px;
- logo;
- menu;
- sem controles de Rádio duplicados.

---

## 6. Estúdio

### Hero

Label:
**ESTÚDIO DE IMPRESSÃO 3D**

Visual:

- label em 12px/700;
- headline clara de 2-3 linhas;
- texto máximo 52ch;
- uma imagem grande;
- máximo dois CTAs;
- nenhum conjunto de "benefícios" em cards logo abaixo.

A imagem do Estúdio ocupa aproximadamente 42-50% da região útil quando houver foto real.

Enquanto não houver mídia final, usar um placeholder editorial neutro escrito **MÍDIA DO ESTÚDIO**. Não simular produto real.

### CTA

Primário:

- sólido `cm-blue`;
- texto quase preto;
- 46-48px de altura;
- raio 10px;
- sem gradiente obrigatório.

Secundário:

- fundo transparente;
- borda sutil;
- texto primário.

---

## 7. Rádio desktop

A Rádio é mais densa e tem gramática própria.

### Cabeçalho

- "CM RÁDIO" em 15px/700;
- estado/label técnico em IBM Plex Mono;
- Expandir/Recolher como IconButton + tooltip/nome acessível.

### Capa

Padrão:

- largura disponível - paddings;
- 1:1;
- raio 14-16px;
- sem moldura brilhante.

### Faixa atual

Título 18px/700.
Artista 14px/500.
Tempo em mono 12-13px.

### Transporte

Play principal: 48px.
Anterior/Próxima: 42-44px.
Shuffle/Repeat: 36-40px, sem roubar protagonismo.

### Progresso

4px normal; handle aparece com foco/hover/touch active.

### Visualizador

- área de 68-96px;
- barras reais do áudio;
- azul/ciano/violeta;
- fundo transparente;
- sem moldura independente se não houver necessidade.

### Lista

TrackRow:

- 50-56px;
- sem card individual;
- separador suave ou spacing;
- seleção por fundo levemente acentuado + indicador;
- título e duração legíveis.

### Estado expandido

Quando a Rádio chega perto de 48%:

- passa a aproveitar duas colunas internas quando couber;
- capa/now playing pode ficar ao lado da biblioteca;
- lista ganha largura;
- não aumentar todos os controles proporcionalmente.

---

## 8. Mini player mobile

Altura alvo: 72-78px.

Estrutura:

```text
[capa] [título / artista] [play] [next] [abrir]
      [progresso fino abaixo do conteúdo]
```

- logo abaixo do header;
- fundo `radio-surface`;
- bordas horizontalmente discretas;
- não parecer um card flutuante;
- sticky é permitido;
- título 14-15px/700;
- artista 12-13px;
- controles com alvo mínimo de 44px.

---

## 9. Ícones

Escolher **Lucide** ou equivalente de traço simples e consistente.

Regras:

- 1.75-2px de stroke;
- 18-22px na interface;
- 24px somente para ações principais;
- sem misturar filled, outline e emojis;
- ícones não substituem rótulo em ações ambíguas.

---

## 10. Espaçamento

Base 4px.

Escala:

- 4
- 8
- 12
- 16
- 20
- 24
- 32
- 40
- 48
- 64
- 80

Gutters:

- desktop 32px;
- intermediário 24px;
- mobile 16-20px.

Seção:

- 64-80px entre blocos relevantes;
- nunca criar 140-200px de vazio só para parecer "premium".

---

## 11. Motion

### UI curta

- 140ms;
- hover, press, icon state.

### Estado

- 220-260ms;
- abertura de busca, seleção, troca de contexto.

### Rádio expandir/recolher

- 260ms;
- easing: cubic-bezier(.2,.8,.2,1);
- durante drag: sem animação.

### Faixa

- capa/metadados: 180-220ms de crossfade/translate muito curto;
- áudio não espera a animação.

### Reduced motion

- resize por botão quase instantâneo;
- crossfade vira troca simples;
- visualizador pode ficar estático/pausado;
- reprodução nunca é afetada.

---

## 12. Regras de uso de gradiente e glow

Permitido:

- visualizador;
- barra de progresso especial;
- pequeno detalhe de marca;
- imagem/capa quando fizer parte da arte.

Evitar:

- contorno de todos os cards;
- texto principal inteiro em gradiente;
- glow em cada botão;
- halo permanente em todas as superfícies;
- fundo com manchas coloridas aleatórias.

---

## 13. Imagem e fotografia

A parte 3D precisa migrar para mídia real assim que possível.

Tratamento:

- fundo escuro/neutro;
- luz lateral ou superior;
- textura e camada da impressão visíveis;
- não exagerar HDR;
- não substituir peça real por render genérico quando o conteúdo estiver publicado.

A Rádio pode usar capas autorais, mas o shell não depende delas para ser bonito.

---

## 14. Critério visual de aprovação

O mock final precisa provar que:

- Estúdio e Rádio parecem parte da mesma marca;
- Rádio é mais densa sem virar dashboard;
- primeira dobra funciona mesmo com pouco conteúdo 3D;
- mobile não parece versão espremida do desktop;
- não há mini player no desktop;
- não há coleção de cards genéricos;
- a interface continua boa se os acentos forem temporariamente removidos: hierarquia deve sobreviver em preto/cinza/branco.

`ready_for_frontend: no`

`approved_by: null`

`artifact_ref: docs/design/CM_VISUAL_SYSTEM_V1.md`
