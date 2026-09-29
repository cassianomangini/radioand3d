# Entrega 03: contrato visual do Estúdio + Rádio

## Objetivo

Transformar a direção visual aceita nesta conversa em um handoff reproduzível para o frontend. O resultado não é "uma inspiração": ele precisa definir composição, proporção, comportamento e limites suficientes para que outro agente implemente sem inventar uma nova estética.

Responsável principal: CM Experience. Implementação só começa após aprovação explícita de Cassiano.

## Resultado esperado

Uma primeira experiência pública profissional e simples:

**Desktop**

`Header -> Estúdio de Impressão 3D + Rádio completa acoplada`

O Estúdio domina a composição. A Rádio completa fica à direita, pode ser redimensionada dentro de limites aprovados e também possui ação explícita de expandir/recolher. **Não existe mini player no desktop.** Alterar a largura nunca reinicia a música.

**Mobile**

`Header -> mini player -> Estúdio de Impressão 3D -> conteúdo 3D progressivo`

A Rádio completa abre sob demanda. Não existe sidebar espremida.

O 3D começa pequeno e bem resolvido. Produtos, materiais, fotos e trabalhos são adicionados depois, conforme existirem. Não completar a tela com dados ou cards fictícios.

## Referência adotada

A imagem escolhida por Cassiano nesta conversa é referência de **composição e densidade**, não fonte literal de conteúdo.

Adotar dela:

- relação entre área 3D e área Rádio;
- Rádio como superfície vertical própria;
- contraste escuro com acentos CM;
- fotografia grande como principal carga visual;
- mini player apenas no mobile;
- hierarquia forte no hero;
- sensação de produto tecnológico premium sem cromado excessivo.

Não adotar automaticamente:

- cards genéricos de benefícios;
- produtos/materiais inventados;
- textos gerados só para preencher;
- ícones decorativos sem função;
- todos os detalhes da imagem gerada como se fossem requisito.

## Plano de execução

### 03.1 Estrutura e hierarquia

- [x] Definir grid desktop canônico e gutter.
- [x] Definir largura inicial da Rádio e limites mínimo/máximo.
- [x] Definir presets de Rádio padrão, expandida e personalizada.
- [x] Definir ordem mobile: header, mini player, hero do Estúdio e conteúdo.
- [x] Definir como o full player abre no mobile.
- [x] Definir leitura e ação prioritárias no primeiro viewport.

### 03.2 Conteúdo inicial do 3D

- [x] Hero identifica explicitamente **Estúdio de Impressão 3D**.
- [x] Definir copy pública V1 para composição e aprovação editorial.
- [x] Definir uma área de mídia principal preparada para foto real.
- [x] Definir no máximo os blocos realmente necessários para o lançamento inicial.
- [x] Definir como produtos, materiais, fotos e trabalhos entram depois sem mudar a grade principal.
- [x] Registrar estados para "ainda não há conteúdo publicado" sem fingir catálogo.

### 03.3 Rádio

- [x] Definir mini player **somente mobile**.
- [x] Definir full player padrão e expandido.
- [x] Definir biblioteca/lista, busca, transporte, progresso, volume e visualizador.
- [x] Definir divisor de resize e feedback de cursor/foco.
- [x] Definir alternativa ao arraste por botão e teclado.
- [x] Definir comportamento do layout ao expandir/recolher sem alterar playback.
- [x] Definir estado com 0, 1 e muitas faixas.

### 03.4 Sistema visual

- [x] Escolher família tipográfica e pesos: Manrope + IBM Plex Mono, proposta pendente de aprovação visual.
- [x] Fechar proposta de superfícies, texto, acentos e contraste.
- [x] Fechar escala de spacing, raio, borda e sombra.
- [x] Mapear proposta de tokens semânticos.
- [x] Definir Lucide/equivalente de traço consistente como direção.
- [x] Definir motion de controles, resize, expansão e troca de faixa.
- [x] Definir reduced motion.

### 03.5 Componentes mínimos

A base visual só precisa congelar componentes usados neste primeiro recorte:

- [x] Header/Nav.
- [x] Button e IconButton.
- [x] StudioHero.
- [x] MediaFrame/placeholder honesto.
- [x] MiniPlayer mobile.
- [x] FullPlayer.
- [x] TrackRow.
- [x] TransportControls.
- [x] RadioResizeHandle.
- [x] SearchField.

Produto, MaterialSwatch, galerias complexas e outros componentes entram somente quando houver conteúdo real que os exija.

### 03.6 Artefato e aprovação

- [ ] Produzir desktop 1440 padrão.
- [ ] Produzir desktop 1440 com Rádio expandida.
- [ ] Produzir mobile ~390 com mini player acima do Estúdio.
- [ ] Mostrar pelo menos normal, hover/focus, loading e empty onde relevante.
- [x] Anotar medidas relativas e tokens diretamente no handoff.
- [x] Registrar o que frontend não pode alterar por conta própria.
- [ ] Receber ajustes de Cassiano.
- [ ] Registrar aprovação final.

## Regras anti "design de IA"

Reprovar antes de frontend quando houver:

- quatro ou mais cards homogêneos usados apenas para explicar benefícios;
- card dentro de card sem necessidade;
- glow, gradiente ou ícone usados para preencher espaço;
- seções alternadas esquerda/direita repetidas mecanicamente;
- texto centralizado em excesso;
- microtexto cinza de baixo contraste;
- espaços enormes sem função;
- muitos raios e sombras diferentes;
- cor local fora do sistema de tokens;
- mídia fictícia apresentada como produto real;
- mobile obtido apenas empilhando desktop;
- qualquer mudança visual que dependa de hover para ser entendida.

## Gate para frontend

Frontend final só recebe esta entrega quando existir:

`ready_for_frontend: yes`

`approved_by: Cassiano`

`artifact_ref: <referência concreta do handoff>`

Antes disso, provas técnicas podem continuar, mas não podem virar a composição pública definitiva.

## Gate depois da implementação

A implementação não é aprovada por CI.

Exigir revisão renderizada em:

- 1440 px padrão;
- 1440 px Rádio expandida;
- ~390 px mobile;
- 200% de zoom de texto;
- reduced motion.

Comparar diretamente com o handoff. Qualquer desvio de composição, densidade, tipografia, mídia ou hierarquia volta para correção antes do merge visual.

## Estado atual

`ready_for_frontend: no`

`approved_by: null`

`artifact_ref: docs/design/STUDIO_RADIO_APPROVAL_PACKAGE_V1.md`

Estrutura, sistema visual, Rádio, componentes e copy pública V1 estão reunidos no pacote de aprovação. Para liberar frontend falta apenas a aprovação explícita de Cassiano e o registro `ready_for_frontend: yes`.
