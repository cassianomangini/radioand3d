# STUDIO_COMMERCE_EXPERIENCE_V1 — Handoff de experiência do Estúdio

Status: **estrutura-base aprovada; direção visual reaberta após feedback sobre iconografia genérica e inclusão de Impressão 3D sob demanda**  
ready_for_frontend: **no**  
approved_by: **estrutura-base: Cassiano — 04/10/2026; revisão atual: pending**  
artifact_ref: **docs/design/STUDIO_COMMERCE_EXPERIENCE_V1.md**  
Versão: **V1 — 04/10/2026**

Este artefato define o que precisa existir na tela, o que não deve existir, quais partes dependem de fotografia/asset real e quais partes podem ser resolvidas por layout e componentes. Ele existe para impedir implementação prematura com CSS improvisado, cards genéricos e componentes que depois precisam ser descartados.

Plano comercial: [../STUDIO_GROWTH_PLAN_V1.md](../STUDIO_GROWTH_PLAN_V1.md)  
Search: [../STUDIO_SEARCH_DISCOVERY_V1.md](../STUDIO_SEARCH_DISCOVERY_V1.md)  
Orçamento: [../STUDIO_QUOTE_FLOW_V1.md](../STUDIO_QUOTE_FLOW_V1.md)  
Wireframes: [STUDIO_COMMERCE_WIREFRAMES_V1.md](STUDIO_COMMERCE_WIREFRAMES_V1.md)  
Mídia: [STUDIO_MEDIA_INVENTORY_V1.md](STUDIO_MEDIA_INVENTORY_V1.md)

## 1. Calibração de experiência

### Estúdio público

- variance: **6/10**
- motion: **3/10**
- density: **5/10**

Direção: material, fotográfica, precisa, calma, premium e claramente diferente da densidade da Rádio.

### Orçamento

- variance: **4/10**
- motion: **2/10**
- density: **4/10**

Direção: clareza e redução de esforço. O formulário deve parecer uma conversa guiada, não um cadastro.

### Produtos

- variance: **5/10**
- motion: **2/10**
- density: **5/10**

Direção: fotografia e informação de decisão. O site apresenta; a Shopee transaciona.

## 2. Regra principal de design

Nenhum bloco deve nascer da pergunta “qual card fazemos aqui?”.

Antes de desenhar qualquer bloco, responder:

1. O que o visitante precisa entender, enxergar ou fazer?
2. Isso pede **texto**, **fotografia real**, **asset gráfico/diagrama**, **componente interativo** ou **nada**?
3. Existe mídia real suficiente?
4. O frontend está tentando simular com CSS algo que deveria ser um asset?
5. O bloco resolve um problema real ou só preenche espaço?

Se a resposta correta for fotografia ou asset, o frontend **não inventa** uma versão falsa com gradientes, pseudo-elementos, blur, sombras, `clip-path` ou SVG decorativo.

## 3. Gramática visual congelada

### Estúdio

- fotografia e objetos físicos têm prioridade;
- tipografia dá hierarquia;
- fundos e superfícies são calmos;
- neon e glow pertencem majoritariamente à Rádio;
- azul/ciano/roxo podem aparecer como acento, não como preenchimento constante;
- borda, raio e sombra têm poucos níveis;
- evitar “card dentro de card”;
- ícone não substitui foto quando existe algo físico para mostrar;
- **ícones decorativos de serviço/benefício não entram no conteúdo editorial**;
- ícones ficam restritos principalmente a controles funcionais inequívocos (voltar, fechar, upload, navegação etc.);
- listas de características de Placas, Caixas e Impressão sob demanda usam tipografia, fotografia e diagramas reais — não fileiras de pictogramas genéricos.

### Rádio x Estúdio

A Rádio continua sendo o mundo mais denso, software-like e expressivo.

O Estúdio deve fornecer descanso visual:

- menos glow;
- menos controles;
- mais mídia real;
- mais materialidade;
- menos movimento contínuo.

O Estúdio não copia a gramática da Rádio e a Rádio não é suavizada para parecer ecommerce.

## 4. /studio — papel da tela

`/studio` é **hub**, não catálogo e não outro hero da home.

O visitante já clicou em “Explorar o Estúdio”; portanto não repetir um hero gigante.

### Abertura

Conteúdo curto:

**ESTÚDIO DE IMPRESSÃO 3D**

Mensagem funcional:

> Projetos personalizados, peças que já produzimos e produtos prontos.

Não colocar na abertura:

- estatísticas;
- lista de materiais;
- lista de impressoras;
- “tecnologia de ponta”;
- benefícios genéricos;
- badges;
- ícones de categorias;
- X1 Carbon repetida sem necessidade;
- CTA múltiplo competindo.

## 5. /studio — composição principal desktop

Os três pilares têm pesos diferentes. Eles **não são três cards equivalentes**.

### Peso visual

| Pilar | Peso | Papel |
| --- | ---: | --- |
| Impressões | ~50% | prova e impacto |
| Orçamento | ~25% | contratação |
| Produtos | ~25% | compra |

Composição de referência:

```text
┌──────────────────────────────┬───────────────────┐
│                              │                   │
│        IMPRESSÕES            │    ORÇAMENTO      │
│                              │                   │
│   fotografia real forte      │ imagem/referência │
│                              │ + ação clara       │
│                              ├───────────────────┤
│                              │                   │
│                              │    PRODUTOS       │
│                              │ produto real      │
└──────────────────────────────┴───────────────────┘
```

A mídia conduz a composição. CSS resolve grid, ritmo e responsividade; CSS não precisa “fabricar” interesse visual.

### Mobile

A ordem é linear e intencional:

1. Impressões;
2. Orçamento;
3. Produtos.

Cada bloco usa imagem e ação sem tentar reproduzir o mosaico desktop comprimido.

## 6. /studio — serviços abaixo dos pilares

Depois dos três caminhos, apresentar uma área de serviço mais direta:

### Como podemos produzir para você

1. **Já tenho um arquivo 3D** — Impressão 3D sob demanda.
2. **Placas personalizadas**
3. **Caixas personalizadas**

A primeira opção é fundamental porque não pressupõe modelagem nem projeto criado pelo Estúdio: o cliente pode chegar com um arquivo pronto e querer análise + fabricação.

Cada entrada usa fotografia real ou, se a mídia ainda não existir, composição tipográfica simples.

**Não usar ícones de impressora, cubo, régua, QR, paleta, material etc. para ornamentar essa área.**

Também não transformar esse trecho em grade de mini-benefícios. Detalhes pertencem às páginas específicas de serviço.

## 6B. /studio/impressao-3d-sob-demanda

Essa página atende a pergunta:

> “Eu já tenho o arquivo. Vocês conseguem imprimir?”

Primeira dobra:

- título **Impressão 3D sob demanda**;
- frase curta: **“Já tem o arquivo 3D? Envie para análise.”**;
- fotografia real de processo ou peça impressa;
- CTA **Enviar arquivo para análise**.

Depois, explicar em texto simples:

- o Estúdio analisa o arquivo;
- a produção depende de compatibilidade com o processo, tamanho, material, quantidade e demais condições;
- a pessoa pode informar preferência de material/cor ou marcar que não sabe;
- pode existir necessidade de ajuste de escala/orientação/suporte;
- envio para análise não significa aceite automático da produção.

Não transformar a página em tabela técnica extensa nem em feature grid com ícones.

## 7. /studio/impressoes

A página deve ser editorial e principalmente fotográfica.

### Abertura

- título curto;
- explicação curta;
- um trabalho forte em destaque.

Exemplo de hierarquia:

```text
IMPRESSÕES

Peças, testes e projetos que realmente
saíram das nossas máquinas.

[FOTO GRANDE]

PLACA PERSONALIZADA
Mano Jotta

Retrato, identidade, QR Code e peça de mesa.
Ver projeto →
```

### Estados editoriais obrigatórios

- **PRODUZIDO**
- **CONCEITO**
- **PRODUTO**
- **PROJETO DE CLIENTE**

A fotografia da peça física comprova “produzido”.

Prancha de alternativas ou mock sem peça física = “conceito”.

Nunca permitir que uma composição faça parecer que todas as variantes foram fabricadas quando não foram.

### Galeria

- foto é o elemento principal;
- texto curto abaixo ou em área segura;
- sem moldura pesada em todas as imagens;
- sem filtro enquanto o volume não justificar;
- sem categorias vazias;
- CTA contextual “Quero algo nessa linha” quando fizer sentido.

## 8. /studio/placas-personalizadas

Essa página precisa provar domínio de placas, não parecer landing SEO genérica.

### Primeira dobra

- título;
- proposta de valor;
- fotografia real forte;
- usos reais resumidos;
- CTA “Pedir orçamento”.

Direção de conteúdo:

> Uma placa feita para o espaço, a marca e a função que você precisa.

### Bloco de possibilidades

Explicar com contexto, não com seis ícones:

- tamanho;
- formato;
- apoio/fixação;
- logo;
- texto;
- QR Code;
- cores;
- iluminação somente quando realmente oferecida.

### Caso real

Usar um projeto forte como prova.

Idealmente:

- peça inteira;
- detalhe;
- espessura/lateral;
- uso em contexto.

### Preparação para orçamento

Mostrar o que ajuda a entender o projeto:

- logo/arte;
- tamanho aproximado;
- referência;
- quantidade;
- uso.

CTA leva ao orçamento já com `tipo=placa`.

## 9. /studio/caixas-personalizadas

A linguagem muda porque caixas são mais funcionais que placas.

### Primeira dobra

- título;
- problema funcional;
- foto real.

Direção:

> Quando a peça precisa caber no objeto — e não o contrário.

### Bloco dimensional

Combinar:

- fotografia real;
- **diagrama técnico simples**.

Diagrama pode ser SVG porque aqui é informação técnica legítima.

Mostrar quando aplicável:

- comprimento;
- largura;
- altura;
- medida interna/externa;
- tampa;
- encaixe;
- divisória;
- passagem de cabo.

Não tentar desenhar “caixa 3D premium” com CSS, perspectiva e sombras falsas.

## 10. Orçamento — princípio de interação

O orçamento deve parecer uma **conversa guiada**.

Não abrir com nome, telefone ou uma parede de campos.

Referência de padrão: GOV.UK recomenda perguntas focadas e branching para exibir somente questões relevantes.  
https://design-system.service.gov.uk/patterns/question-pages/

## 11. Orçamento — fluxo visual

### Passo 1 — O que você precisa?

Opções:

- **Imprimir um arquivo 3D que já tenho**;
- Criar uma placa personalizada;
- Criar uma caixa sob medida;
- Outro projeto.

Se a pessoa escolhe arquivo pronto, o fluxo pula perguntas de criação e vai direto para upload + informações de produção.

Quando houver foto real útil, ela pode apoiar a escolha.

Se não houver asset adequado, preferir escolha textual limpa a um ícone 3D genérico.

### Branch — arquivo 3D pronto

Perguntar apenas o necessário:

- arquivo;
- quantidade;
- tamanho/escala, se houver exigência;
- preferência de material/cor ou “não sei”;
- prazo desejado opcional;
- contato.

### Passo 2 — De onde estamos começando? — somente para projetos personalizados

Opções:

- tenho logo, desenho ou arte;
- tenho foto ou referência;
- tenho as medidas;
- tenho apenas a ideia.

A interface deve deixar claro que não possuir arquivo 3D não impede o contato.

### Passo 3 em diante — branching

Placa vê perguntas de placa.

Caixa vê perguntas de caixa.

Não mostrar perguntas irrelevantes apenas porque cabem na tela.

### Quantidade de informação por tela

Mesmo no desktop, evitar 8–12 campos de uma vez.

Preferir uma decisão ou pequeno grupo coerente por etapa.

### Opção “não sei”

Para perguntas técnicas pertinentes, oferecer:

- “Não sei ainda”
- “Preciso de ajuda nisso”

O cliente explica o problema; o Estúdio decide a solução técnica.

## 12. Upload

### Desktop

- drag-and-drop como melhoria;
- botão “Escolher arquivo” sempre presente;
- formatos e limites visíveis;
- lista de anexos após seleção.

### Mobile

- botão nativo “Adicionar foto ou arquivo”;
- não depender de drag-and-drop.

Referências:
- https://design-system.service.gov.uk/components/file-upload/
- https://design-system.dwp.gov.uk/contribute/file-upload/discoverable

## 13. Contato

Contato entra **depois** que o visitante já descreveu o projeto.

Pergunta:

### Como podemos falar com você?

Opções:

- WhatsApp;
- E-mail.

Mostrar somente o campo correspondente.

Evitar pedir cidade, CEP, estado e dados extras antes de existir necessidade operacional.

## 14. Revisão antes do envio

Antes de enviar, mostrar resumo editável:

```text
SEU PROJETO

Placa personalizada

18 × 12 cm
2 unidades
Logo + QR Code
Uso em balcão

Arquivo:
logo.png

Contato:
WhatsApp

[Editar respostas]

[Enviar para análise]
```

A pessoa consegue voltar, editar e retornar sem perder estado.

## 15. Confirmação

Não criar tela morta.

Mensagem curta:

**Projeto recebido.**

Explicar que o Estúdio vai analisar as informações sem prometer prazo inexistente.

Pode sugerir duas ou três Impressões relacionadas.

Não colocar WhatsApp gigante como “próximo passo obrigatório”.

## 16. /studio/produtos

A página não tenta reproduzir a Shopee.

### Catálogo inicial

Se houver poucos produtos:

- sem filtros;
- sem ordenação;
- sem categorias vazias;
- destaque + grade simples.

### Card/preview

O preview deve ser quase todo fotografia.

Mostrar apenas o necessário:

- foto;
- nome;
- uma medida ou atributo decisivo quando útil;
- “Ver produto”.

Evitar no card:

- preço sem sincronização;
- estoque sem sincronização;
- frete;
- material repetido em badge;
- várias opções;
- promoção fictícia;
- botão Shopee antes da pessoa entender o produto.

## 17. Página individual do produto

A página individual é a principal superfície de decisão antes da Shopee.

### Primeira área

- galeria de imagens;
- nome;
- uso;
- medidas;
- material;
- opções reais;
- CTA **Comprar na Shopee**;
- aviso curto de que compra/pagamento serão finalizados na Shopee.

### Depois

- mais fotos;
- detalhes;
- dimensões;
- acabamento;
- variações permitidas;
- cuidados/uso quando relevante.

### Ponte para serviço

No final:

**Precisa de algo parecido, mas com outra medida?**

→ **Pedir orçamento**

Referência de usabilidade para product detail page:  
https://baymard.com/research/product-page

## 18. Shopee — contrato de experiência

Shopee é checkout, não identidade principal.

Regras:

- botão chama **Comprar na Shopee**;
- não usar “Comprar” e surpreender com redirecionamento;
- informar que a finalização acontece na Shopee;
- não deixar logo Shopee dominar a composição;
- link externo no nível do produto, não no hub geral;
- preço e estoque só aparecem no nosso domínio se houver sincronização confiável.

Sem sincronização:

> Ver preço e disponibilidade na Shopee

é preferível a duplicar informação sujeita a divergência.

## 19. Materiais

Não criar página decorativa de materiais agora.

Material aparece quando ajuda a decisão:

- projeto;
- serviço;
- produto;
- orçamento.

Não criar grid de PLA/PETG/TPU com ícones genéricos apenas para preencher o Estúdio.

Uma página própria de materiais só entra quando houver conteúdo, fotos/amostras e utilidade suficiente.

## 20. Mapa de mídia e recursos

| Superfície | Recurso preferido |
| --- | --- |
| Hub `/studio` | 3 fotografias/editoriais fortes |
| Impressões | fotografia real |
| Placas | peça inteira + detalhe + contexto |
| Caixas | peça real + interior + diagrama dimensional |
| Orçamento | interface funcional; imagens apenas quando ajudam |
| Produtos | 3–5 fotos úteis por produto quando possível |
| Produto individual | hero + lateral + detalhe + escala/contexto |
| Materiais | amostra/foto real quando relevante |

Se uma seção precisa de asset específico, produzir/selecionar o asset **antes** de tentar imitar com CSS.

## 21. Papel do CSS

CSS deve resolver:

- layout;
- grid;
- tipografia;
- espaçamento;
- bordas;
- estados;
- responsividade;
- foco;
- feedback;
- transições simples.

CSS não deve ser usado para improvisar:

- fotografia;
- render de produto;
- desenho técnico;
- textura física;
- objeto 3D falso;
- “arte premium” com dezenas de layers.

A identidade nasce principalmente de:

**fotografia + proporção + tipografia + conteúdo + materialidade real**.

## 22. Famílias de componentes justificadas

Componentes previstos apenas quando houver repetição/responsabilidade real:

- `MediaFrame`
- `ProjectPreview`
- `ProductPreview`
- `ProductGallery`
- `ServiceFeature`
- `QuoteChoice`
- `QuoteField`
- `FileUpload`
- `QuoteSummary`
- `StudioSection`

Não criar por padrão:

- `Card`
- `CardHeader`
- `CardBody`
- `CardFooter`
- `CardGlow`
- `CardBadge`
- `CardIcon`

só porque existe um bloco visual.

HTML semântico simples é preferível quando a abstração não adiciona comportamento ou consistência real.

## 23. Mobile

Mobile é composição própria.

### Regra global

mini player → conteúdo.

Evitar acumular:

- mini player;
- breadcrumb grande;
- hero alto;
- CTA sticky inferior;
- barras adicionais persistentes.

### Serviço

título → foto → explicação → CTA.

### Orçamento

mini player → voltar/etapa → pergunta.

### Produto

mini player → imagem → nome → informações → Shopee.

Inicialmente não usar CTA sticky no rodapé porque já existe superfície persistente da Rádio.

## 24. Movimento do Estúdio

Movimento serve a eventos reais:

- mudança de etapa;
- seleção;
- upload;
- troca de mídia;
- expansão de detalhe;
- navegação.

Não usar:

- parallax em toda foto;
- objetos flutuando;
- background animado;
- reveal obrigatório em cada linha;
- ambient motion contínuo.

A Rádio continua sendo a superfície que “dança”.

## 25. O que não entra inicialmente

| Não entra | Motivo |
| --- | --- |
| configurador 3D | custo alto sem valor comprovado |
| rotação 3D de cada produto | fotografia é prova suficiente |
| simulador de preço | contrato comercial ainda não confiável |
| chat/WhatsApp flutuante | destrói a filtragem |
| filtros com catálogo pequeno | interface sem problema real |
| filtros em galeria pequena | mesma razão |
| avaliações/depoimentos inventados | sem prova |
| contador de peças produzidas | sem necessidade |
| animação em todo bloco | ruído |
| ícone para toda informação | aparência de template/IA; conteúdo editorial deve usar texto, foto ou diagrama real |
| cards de materiais no hub | material deixou de ser pilar |
| mapa/endereço | depende do modelo local |
| IA no orçamento | primeiro entender fluxo real |

## 26. Ordem de design antes do frontend

Antes de implementar superfícies visíveis, fechar nesta ordem:

1. **Hub `/studio` desktop + mobile** — wireframe criado
2. **Página Placas desktop + mobile** — wireframe criado
3. **Fluxo completo de Orçamento em wireframe** — criado; etapa visual final ainda pendente
5. **Página individual de Produto desktop + mobile** — wireframe criado
6. **Impressões** — estrutura funcional definida; visual final posterior
7. **Caixas** — estrutura funcional definida; visual final posterior

Referência: [STUDIO_COMMERCE_WIREFRAMES_V1.md](STUDIO_COMMERCE_WIREFRAMES_V1.md).

Essas quatro primeiras superfícies definem a gramática real do sistema; as seguintes reutilizam a linguagem já aprovada.

## 27. Inventário de assets antes da implementação

Para cada superfície registrar:

- asset já existe;
- asset precisa ser fotografado;
- asset precisa ser recortado/tratado;
- asset precisa ser desenhado como diagrama;
- asset ainda não existe e a seção deve esperar.

Frontend não cria placeholder sofisticado para esconder falta de mídia.

Durante mock visual, quando a fotografia real ainda não existir, usar **placeholder neutro explicitamente marcado como FOTO REAL PENDENTE**. Não gerar caixa, produto, placa ou processo sintético com aparência de prova real apenas para completar a composição.

## 28. Gate de design

Não iniciar implementação visual substancial enquanto faltarem:

- wireframe desktop do hub;
- wireframe mobile do hub;
- wireframe da página de Placas;
- wireframe do fluxo de Orçamento;
- wireframe da página de Produto;
- inventário mínimo de mídia;
- decisão explícita sobre o que é foto, asset, texto ou componente;
- revisão de composição mobile;
- aprovação de Cassiano.

Trabalho técnico independente de Search/rotas pode avançar desde que não cristalize layout visual prematuro.

## 29. Anti-slop pre-flight

Reprovar antes do frontend se houver:

- três cards iguais para os três pilares;
- ícone antes de todo título;
- fileira de ícones para explicar benefícios, materiais ou serviços;
- gradiente usado como substituto de mídia;
- fundo neon no Estúdio;
- card dentro de card;
- foto real tratada como mero background quando é prova;
- CSS tentando desenhar produto;
- filtro sem volume;
- formulário gigante;
- mobile que só empilha o desktop;
- Shopee maior que a marca CM;
- produto com preço/estoque duplicado sem sincronização;
- WhatsApp como primeira etapa;
- material explicado por ícone quando foto/texto seria melhor.

## 30. Critério para ready_for_frontend

Mudar para `ready_for_frontend: yes` somente quando:

- as quatro superfícies fundamentais estiverem desenhadas;
- mídia e lacunas estiverem inventariadas;
- desktop e mobile estiverem resolvidos separadamente;
- fluxo de orçamento tiver branching claro;
- produto e Shopee tiverem hierarquia aprovada;
- componentes necessários estiverem delimitados;
- itens proibidos estiverem explícitos;
- Cassiano aprovar a direção.

Até lá:

ready_for_frontend: **no**  
approved_by: **estrutura-base aprovada por Cassiano em 04/10/2026; revisão do hub/serviço sob demanda e mock visual final pendentes**
