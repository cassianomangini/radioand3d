# Componentes e estados CM V1

Status: handoff funcional/visual da entrega 03. Complementa `STUDIO_RADIO_HANDOFF_V1.md` e `CM_VISUAL_SYSTEM_V1.md`.

Este documento define comportamento, estados e limites dos componentes do primeiro recorte. Não autoriza implementação visual final enquanto `ready_for_frontend` continuar `no`.

## 1. Princípio

A interface tem duas gramáticas:

- **Estúdio**: editorial, fotográfico, espaçado e simples.
- **Rádio**: mais densa, operacional e musical.

Compartilhar tokens e primitivas não significa fazer tudo parecer o mesmo card.

---

## 2. Header / Nav

### Desktop

Estrutura mínima:

```text
[CM]  Início  3D  Rádio  Sobre  Contato            [ações úteis]
```

Regras:

- altura conforme sistema visual;
- item ativo por texto + acento discreto;
- sem cápsula grande em volta do item ativo;
- sem busca, conta, carrinho ou qualquer ícone se a função ainda não existir no produto;
- nenhum controle de reprodução no header desktop.

Estados:

- normal;
- hover;
- focus-visible;
- ativo;
- menu reduzido quando o espaço não comportar navegação completa.

### Mobile

Estrutura:

```text
[CM]                                     [menu]
```

Logo abaixo vem o `MiniPlayer`.

---

## 3. Button

Variantes:

- `primary`
- `secondary`
- `quiet` somente para ações de baixa ênfase

Tamanhos iniciais:

- normal: 46-48 px de altura;
- icon button: alvo mínimo 44 x 44 px.

Estados obrigatórios:

- default;
- hover;
- focus-visible;
- pressed;
- disabled;
- loading.

Regras:

- loading preserva largura do botão;
- ícone nunca é o único significado de ação ambígua;
- botão comum não vira pill;
- gradiente não é obrigatório no CTA principal.

---

## 4. StudioHero

Responsabilidade:

- identificar o **Estúdio de Impressão 3D**;
- dizer em poucas linhas o que existe ali;
- carregar a principal mídia 3D da primeira dobra;
- oferecer 1 CTA principal e no máximo 1 secundário.

Estrutura:

```text
eyebrow
headline
lead
[CTA principal] [CTA secundário opcional]
mídia do estúdio
```

Estados:

- com mídia real;
- com placeholder editorial identificado;
- sem CTA secundário;
- copy mais longa em locale futuro sem quebrar composição.

O componente não pode criar:

- cards de benefício;
- métricas;
- categorias;
- produtos;
- materiais.

Esses conteúdos entram como seções independentes quando existirem.

---

## 5. MediaFrame

Uso: foto/vídeo/placeholder do Estúdio.

Estados:

- `ready`: mídia real carregada;
- `loading`: skeleton/área reservada sem pular layout;
- `missing`: placeholder neutro **MÍDIA DO ESTÚDIO**;
- `error`: fallback neutro, sem quebrar o hero.

Regras:

- reservar proporção;
- não inventar render de produto como substituto de conteúdo real;
- nenhum glow ou moldura chamativa para compensar ausência de mídia.

---

## 6. MiniPlayer

**Somente mobile/compacto. Nunca renderizar no desktop split.**

Estrutura mínima:

```text
[capa] [título]
       [artista]      [play/pause] [próxima] [abrir rádio]
[progresso]
```

Pode omitir anterior, shuffle, repeat e volume quando o espaço não comportar.

Ações:

- play/pause;
- próxima;
- seek simples quando o controle puder manter área de toque adequada;
- abrir Rádio completa.

Estados:

- `idle`: nenhuma faixa selecionada;
- `loading`;
- `playing`;
- `paused`;
- `buffering`;
- `blocked`: reprodução aguardando interação;
- `error`.

Com zero faixas publicadas:

- mostrar estado vazio curto;
- play/next ficam desabilitados;
- ação de abrir Rádio pode continuar disponível para explicar que não há faixas.

Com uma faixa:

- próxima fica desabilitada quando repeat não permitir avanço útil;
- não inventar segunda faixa.

---

## 7. FullPlayer / CM Rádio

### Desktop padrão

A própria Rádio completa ocupa a coluna direita. Não existe player duplicado embaixo.

Ordem:

1. RadioHeader;
2. NowPlaying;
3. Progress;
4. TransportControls;
5. Visualizer;
6. LibraryTabs/contexto;
7. SearchField;
8. TrackList.

### Desktop expandido

Quando atingir a largura expandida:

- o conteúdo interno pode passar para duas zonas;
- NowPlaying/capa podem ocupar a coluna esquerda;
- biblioteca/lista pode ocupar a coluna direita;
- controles não aumentam de escala indiscriminadamente;
- a transição não recria o áudio.

### Mobile

A Rádio completa abre sob demanda e ocupa a superfície útil. Fechar retorna ao Estúdio.

Estados gerais:

- zero faixas;
- uma faixa;
- várias faixas;
- loading da biblioteca;
- falha da biblioteca;
- faixa atual indisponível depois de atualização;
- capa ausente.

---

## 8. RadioHeader

Conteúdo:

- `CM RÁDIO`;
- ação expandir/recolher no desktop;
- ação fechar/voltar quando aplicável no mobile.

No desktop, a ação expandir alterna entre preset padrão e expandido.

Não mostrar:

- botão de mini player;
- segundo play/pause;
- controles duplicados do NowPlaying.

---

## 9. NowPlaying

Conteúdo:

- capa/fallback;
- título;
- artista;
- ações secundárias somente se realmente existirem no produto.

Estados:

- sem seleção;
- carregando;
- selecionada e pausada;
- tocando;
- erro da faixa;
- capa ausente.

Título longo:

- máximo duas linhas;
- não empurrar controles para fora da área;
- tooltip não substitui texto legível.

---

## 10. TransportControls

Controles V1:

- shuffle;
- anterior;
- play/pause;
- próxima;
- repeat.

Hierarquia:

- play/pause é a ação dominante;
- anterior/próxima são secundárias;
- shuffle/repeat são terciárias, porém legíveis.

Estados:

- enabled;
- disabled por ausência de candidato;
- selected para shuffle/repeat;
- focus-visible;
- loading/buffering no play principal sem fingir estado tocando.

A UI só mostra `playing` após confirmação do motor.

---

## 11. Progress / Seek

Conteúdo:

- tempo atual;
- slider;
- duração.

Requisitos:

- teclado;
- pointer/touch;
- label acessível;
- não exigir hover para encontrar o handle;
- duração desconhecida não pode mostrar `NaN` ou `Infinity`.

No mobile compacto, a leitura de tempo pode ser removida do MiniPlayer; o full player continua mostrando.

---

## 12. Visualizer

- responde ao áudio real;
- não controla reprodução;
- não é equalizador;
- não é decoração fora da Rádio;
- não dispara rerender da página inteira.

Estados:

- ativo;
- pausado;
- sinal baixo/silêncio;
- indisponível;
- reduced motion.

Fallback: área estática simples ou ausência do visualizador. A Rádio continua funcional.

---

## 13. SearchField

Uso: busca simples por título na biblioteca publicada.

Estados:

- vazio;
- digitando;
- resultado;
- sem resultado;
- disabled quando a biblioteca não estiver pronta.

Regras:

- filtrar a visualização não altera a fila em execução;
- não esconder o botão de limpar apenas no hover;
- debounce só se necessário pela fonte de dados, não por hábito.

---

## 14. TrackRow

Conteúdo:

- capa/fallback pequeno;
- título;
- artista;
- duração;
- indicador da faixa atual.

Interação:

- clique/toque seleciona e toca;
- foco/Enter também;
- seleção precisa ser reconhecível sem depender só de cor.

Estados:

- normal;
- hover;
- focus-visible;
- selected/current;
- loading da faixa;
- unavailable;
- error.

Não é card.

A lista usa espaçamento e/ou separadores suaves. Evitar caixas individuais com bordas e sombras.

---

## 15. RadioResizeHandle

**Somente desktop split.**

Apresentação:

- divisor visual fino;
- área de captura maior, invisível;
- cursor `col-resize`;
- estado focus-visible claro.

Pointer:

- resposta 1:1 durante drag;
- largura clampada entre os limites do handoff;
- sem animação durante arraste.

Teclado:

- esquerda/direita: passo de 16 px;
- Shift + esquerda/direita: passo de 48 px;
- Home: preset mínimo;
- End: preset expandido.

Alternativa não-drag:

- botão Expandir/Recolher sempre disponível.

---

## 16. Estados da biblioteca

### Zero faixas

Mostrar:

- título da Rádio;
- mensagem curta de que ainda não há músicas publicadas;
- nenhum TrackRow fictício;
- transporte desabilitado.

### Uma faixa

Mostrar a faixa real.
Não duplicar o item para preencher lista.

### Muitas faixas

Lista vertical;
scroll local apenas quando a altura útil realmente exigir;
cabeçalho da Rádio e controles principais não devem desaparecer por causa da lista.

---

## 17. Persistência e sincronização

Todos os componentes visuais consomem o mesmo controller.

Mudanças que **não** podem recriar `HTMLAudioElement` nem resetar estado:

- resize;
- expandir/recolher;
- abrir/fechar Rádio no mobile;
- mudar de rota pública;
- filtrar busca;
- reflow interno da Rádio expandida.

---

## 18. Matriz mínima de revisão

| Superfície | Normal | Hover | Focus | Loading | Empty | Error |
| --- | --- | --- | --- | --- | --- | --- |
| Header/Nav | sim | sim | sim | n/a | n/a | n/a |
| Button | sim | sim | sim | sim | n/a | n/a |
| StudioHero | sim | n/a | CTAs | mídia | mídia | mídia |
| MiniPlayer mobile | sim | sim | sim | sim | sim | sim |
| FullPlayer | sim | sim | sim | sim | sim | sim |
| TrackRow | sim | sim | sim | sim | lista | sim |
| SearchField | sim | sim | sim | sim | sem resultado | sim |
| ResizeHandle | sim | sim | sim | n/a | n/a | n/a |

---

## 19. Limites que frontend não pode alterar

Sem nova decisão de experiência:

- MiniPlayer não aparece no desktop split.
- FullPlayer desktop não vira modal.
- TrackRow não vira card.
- RadioResizeHandle não some sem manter alternativa de tamanho.
- Não adicionar favoritos, conta, carrinho ou busca global só porque o mock antigo tinha ícones.
- Não preencher estados vazios com conteúdo falso.
- Não mover MiniPlayer mobile para o rodapé.
- Não fazer autoplay para “demonstrar” a Rádio.
- Não usar o visualizador como efeito decorativo do Estúdio.

`ready_for_frontend: no`

`approved_by: null`

`artifact_ref: docs/design/CM_COMPONENT_STATES_V1.md`
