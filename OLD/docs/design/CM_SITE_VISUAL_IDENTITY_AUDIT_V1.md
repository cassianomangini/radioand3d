# CM — Auditoria da identidade visual aplicada ao site (09/10/2026)

**Estado:** auditoria de referências e código concluída; **direção de qualquer novo estudo ainda não aprovada**.  
**Responsável:** CM Experience. **Escopo:** CM 3D & Radio, Home, Rádio, Estúdio, hub comercial e linguagem das páginas de conteúdo.  
**Natureza:** estudo visual do produto **existente**, não redesign autorizado. Não alterar uma UI aceita nem reivindicar aprovação do usuário só porque há screenshot ou CI verde.  
**Origem:** seis imagens fornecidas por Cassiano em 09/10/2026; leitura de `main` (site, tokens, arte e handoffs), conforme registro abaixo. Os arquivos anexados na conversa **não foram incorporados como PNGs ao Git** neste estudo; a referência é descritiva até que originais/arquivos autorizados estejam versionados.

## 1. Diagnóstico do erro de abordagem de 08V V4

A primeira rodada de `/dev/visual-lab` comparou três arranjos **genéricos** para Impressões. Ela comprovou o *pipeline* técnico, não a identidade visual do CM. O exercício foi executado fora da moldura real do site, escolhendo cinza-grafite com verde-água discreto e substituindo a composição de imagem por grandes caixas de mídia vazias. O fluxo permitia comparar screenshots, mas **faltou a etapa fundamental: estudar o design já aprovado e o sistema de composição que ele realmente usa**.

**Decisão desta auditoria:** estudos Editorial/Mostruário/Detalhe V1 **rejeitados como propostas de direção de arte**, preservados somente como fixtures técnicas do laboratório e regressão de interação. **Nenhum é candidato atual para V4.4/V4.5; nenhum foi aprovado**. Não pedir que Cassiano escolha o menos ruim. Recomeçar uma proposta somente após cumprir o mapa visual e a inserção contextual descritos neste documento.

## 2. Fontes e seus limites

| Fonte | O que foi realmente observado | O que ela NÃO permite concluir |
| --- | --- | --- |
| Imagem 1: Rádio expandida, tela quase 1920px | Header preto com logo CM 3D & Radio, navegação centrada/estado Rádio, três zonas operacionais playlist → artwork/player → letra, saturação concentrada em artwork/equalizador, linha/divisória luminosa | Não demonstra todos os breakpoints, estados ou implementação da galeria de Impressões |
| Imagem 2: Home no split, quase 1920px | Estúdio com robô X1 e máquina preenchendo o lado esquerdo; headline/CTA no lado direito do estúdio; rádio densa à direita; trilho divisor com arte azul/roxa | Não autoriza trocar essa Home nem usar X1 em toda subpágina |
| Imagem 3: banner horizontal CMANGINI 3D + X1 | Branding próprio do Estúdio 3D: cromado/prata, bordas ciano/azul-violeta, robô X1, luz/reflexo sobre superfície escura; cenário gráfico/brand asset | Não é evidência de produto impresso, nem prova de que o banner inteiro já integra a Home |
| Imagem 4: selo circular CMANGINI 3D | Variante de marca/uso como avatar, lettering prata em fundo quase preto, contorno circular azul | Não substitui o logotipo **CM 3D and Radio** no header global |
| Imagem 5: X1 isolado, vertical | Variante de personagem/asset CMANGINI 3D com metal, ciano, roxo e luzes; material gráfico, não foto de peça fabricada | Não usar como fotografia comercial ou "prova" de uma Impressão |
| Imagem 6: apresentação Placa Personalizada, Mano Jotta | Referência do **outro regime editorial**: peça/projeto em protagonismo, fundo fotográfico mais quente, títulos e usos curtos, thumbnails de projetos; a cor amarela pertence ao projeto retratado | Não significa que cores quentes sejam novos tokens globais CM nem que todas as imagens da prancha sejam fotografias físicas validadas |
| `src/styles/tokens.css` e `src/app/layout.tsx` | Paleta e fontes implementadas (Manrope/IBM Plex Mono), escala e espaçamento | Não substituem o render final: CSS do componente também define cores e layouts locais |
| `src/components/studio-radio/studio-radio-shell.tsx` + `.module.css` | Composição e assets em uso, hero `x1_fundo_2.png`, gradientes vivos, CTA contornado, split/transformação, hub 3 entradas | Não dar permissão para reabrir a Rádio |
| `docs/EXPERIENCE.md`, `CM_VISUAL_SYSTEM_V1.md` e handoffs comerciais | Decisões históricas/aceitas, tipografia, identidade, regras de imagem e estruturas publicamente aprovadas | Há conteúdo **proposto** nos docs mais antigos; decisões datadas de aceite e implementação mais recente prevalecem |
| `public/images/*` | Logo do header, X1 da Home, artwork da Rádio, imagem do divisor e background adicional disponíveis no repositório | Não contém automaticamente todos os arquivos de peça real mostrados nas mensagens |

As seis imagens são **referências fornecidas**, não comparações pixel-a-pixel homologadas. A imagem 6 é referência para apresentação de portfólio e peça real *quando comprovada*; a fotografia/ativo original autorizado ainda é dependência E3.

## 2.1. Conferência complementar: renders atuais do próprio site no CI

Além das imagens do usuário, foram inspecionados os screenshots do navegador da execução [37942413229](https://github.com/cassianomangini/radioand3d/actions/runs/37942413229), [artefato Playwright](https://github.com/cassianomangini/radioand3d/actions/runs/37942413229/artifacts/11622475963). Esses renders mostram o **shell implementado** em Home, hub, Produto e Orçamento, em desktop e mobile. A execução tem mídia/playlist de teste sem reprodução real de R2; **não** tratá-la como substituta de visitação real e nem como mock final aprovado.

- **Hub desktop (1440×900):** logo pequeno e nav central continuam acima da área Estúdio; um trilho de marca fino separa Estúdio e Rádio, que permanece visível à direita. A zona dominante à esquerda de Impressões ocupa 2 linhas; Orçamento e Produtos ficam na coluna direita. Com mídia E3 ausente, grandes áreas negras são placeholders; o texto aparece no rodapé de cada bloco, com kicker em **ciano para Impressões**, **violeta para Orçamento**, **laranja/coral para Produtos**. Isso é um vocabulário de diferenciação por **função comercial**, não uma página monotemática teal.
- **Hub mobile (390×844):** header compacto → mini-player com capa e controles → eyebrow de Estúdio → 3 entradas empilhadas, nesta ordem; mesmo universo negro/ciano/violeta/coral. O contexto da Rádio permanece presente, embora a tela seja de comércio 3D.
- **Produto desktop (1440×900):** foto real de produto grande e clara contra fundo quase preto, rail vertical de miniaturas, decisão/variações à direita, CTA **Comprar na Shopee** como botão azul-violeta sólido/retangular, linha divisória sutil. **Não se reutiliza o botão-pill da Home nesse CTA**. Prova de que páginas comerciais têm uma gramática visual própria **dentro do mesmo shell** e conseguem usar fotografia com fundo branco sem “quebrar a marca”.
- **Orçamento desktop (1440×900):** predominam texto branco, título de grande escala, kicker ciano e opções funcionais com contorno discreto; sem foto fictícia nem ícones de benefícios. A Rádio permanece à direita. Densidade de formulário é deliberadamente diferente da galeria.
- **Home mobile (390×844):** header, mini-player e grande imagem X1; o texto da Home começa perto da borda inferior do primeiro viewport no screenshot. Registrar isso como **observação para futura QA**, não copiar mecanicamente a relação arte/título na rota Impressões, nem alterar Home aprovada por conta desta auditoria.

**Atualização do gate A1.5:** screenshots existentes da Home/hub/Produto/Orçamento desktop e mobile foram conferidos. Ainda não há, nesta execução de CI, captura comparável **da rota `/studio/impressoes` com conteúdo real e mobile**; ela continua pendente para validar a próxima composição específica.

## 3. Arquitetura de marcas e linguagem visual

**Marca guarda-chuva:** `CM 3D and Radio` no header global. Assinatura com monograma CM, 3D e Rádio juntos, cromaticidade mais alta em cyan/azul/violeta; preservar o PNG original `public/images/cm-3d-radio-logo.png` e a proporção do header.

**Estúdio / CMANGINI 3D:** camada de identidade própria dentro do site: X1 robô, logotipo metálico/prata em variantes de banner/avatar e imagem artística com reflexo magenta/ciano. **A arte é rica, mas a UI do Estúdio não deve copiar todo o tratamento de glow da arte**. O personagem é uma assinatura existente, não placeholder para fotografias de objetos impressos.

**Rádio CM:** superfície técnica densa e viva, neo-Winamp sem cópia literal. A energia visual pertence ao estado da música: capa ilustrada, visualizador azul/ciano/violeta, interação dos controles, playlist e letras. A Rádio compartilha marca/tokens com o Estúdio, **não a mesma densidade**.

**Projetos/peças reais:** conteúdo do portfólio tem sua luz, textura e cores próprias. A peça Mano Jotta da referência recebe amarelo quente/dourado; esse amarelo é **cor de conteúdo**, não um novo brand token. É aceitável fotografar objetos em ambientes mais quentes; não tingir a imagem com overlays frios para “combinar com o layout”.

Logo metálico, robô de arte, capa de música e foto de peça física são **quatro classes de mídia com responsabilidades distintas**.

## 4. Paleta real do projeto — código e interpretação

Valores diretamente extraídos de `src/styles/tokens.css` (não palpites sobre screenshot):

| Papel implementado | Valor | Uso adequado |
| --- | --- | --- |
| Plano de fundo / Estúdio | `#020305` | Negro quase absoluto; permite que foto e artwork sejam o contraste principal |
| Superfície da Rádio | `#03050A` | Preto-azulado, diferencia o instrumento musical |
| Painel | `#0A101B` | Apoio a controles/estados quando precisa delimitar conteúdo |
| Superfície elevada | `#111827` | Elementos de interface em primeiro plano |
| Texto principal | `#F7F8FB` | Títulos, controles e decisões |
| Texto secundário | `#C0C7D2` | Descrição e metadados principais |
| Texto auxiliar | `#7E8998` | Metadados discretos, sem esconder informação obrigatória |
| Ação azul | `#4E9DFF` | Controles e seleção quando o padrão primário requer preenchimento |
| Acento ciano | `#52D6FF` | Foco, sinal, informação ativa e detalhes significativos |
| Acento violeta | `#8B6DFF` | Complemento musical/marca, não cor dominante da página inteira |
| Foco | `#8DDBFF` | Acessibilidade/teclado |
| Borda | `rgba(255,255,255,.08/.14)` | Separação sutil; não desenhar “card em card” por reflexo |

**Acentos mais saturados fazem parte de componentes/arte já presentes.** No hero implementado, `forma.` usa gradiente `#00D7F5 → #1398FF → #B82EE9`; a borda do botão usa `#00DBF3 → #198CFF → #CF2AEA`. São **assinaturas pontuais**, não licenças para todas as palavras e bordas ficarem coloridas. Arte X1 e capa da Rádio trazem ciano elétrico, azul real e magenta mais fortes do que os tokens utilitários. O banner prateado funciona por **metal/foto/iluminação**, não por um token CSS de prata que seria aplicado a todos os títulos.

**Distinção obrigatória:** paleta de interface (preto/azulado + branco + poucos acentos) ≠ paleta dos assets de marca ≠ paleta de cada produto do portfólio. O lab V1 confundiu “Estúdio mais calmo” com **produto dessaturado e desconectado da marca**, elegendo cinza/teal como tema inteiro.

## 5. Tipografia, proporção e acabamento

- **Fonte do site:** `Manrope` (textos, títulos, nav, CTAs) com `IBM Plex Mono` apenas em labels técnicos, tempo e microinformação. Definição em `src/app/layout.tsx` e `src/styles/tokens.css`.
- **Título da Home:** branco, peso alto, linhas curtas, tracking negativo, destaque em uma palavra gradiente. Não é a mesma coisa que usar título arbitrariamente gigante em toda página.
- **Microcopy:** kicker de estúdio com *letter spacing* largo, em caixa alta. Títulos curtos e copy prática; informação comercial não pode soar genérica ou publicitária demais.
- **Header:** logo CM 3D and Radio à esquerda, navegação central Início/Estúdio/Rádio, item ativo por sublinhado ciano; fundo quase preto com divisão sutil. Mudar essa gramática apenas porque o protótipo é dev não cria uma proposta contextualizada.
- **CTA da Home:** cápsula preta com gradiente restrito ao contorno, texto branco e seta à direita. O botão é específico da entrada do Estúdio; CTAs de compra/orçamento seguem sua hierarquia funcional própria.
- **Bordas/raios:** zonas de player e mídia são relativamente compactas, superfícies só se delimitam quando têm função, radii discretos nos blocos comerciais; não trocar por dez cards arredondados com glow.
- **Profundidade:** resulta de imagens, recorte, luz/foco da composição e contraste tonal, e não de sombras coloridas aplicadas universalmente.

## 6. Layout real — site completo, não uma página solta

### 6.1 Home desktop

A composição aprovada é **um palco dividido**. A maior área do Estúdio à esquerda e a Rádio cheia à direita não são cartões comuns. O dividor é estreito, usa arte `/images/cm-radio-divider.webp`, arraste e transições espaciais aceitas. Na área Estúdio, `/images/x1_fundo_2.png` dá o peso visual esquerdo; texto à direita dentro dessa área, no local previamente aprovado, com `ESTÚDIO DE CRIAÇÃO`, `Ideias que ganham forma.` e `Explore o estúdio`. Não transformar essa entrada em e-commerce, nem mover a imagem para encaixar layout de laboratório.

### 6.2 Rádio em foco

A primeira imagem do usuário mostra **playlist** à esquerda, **arte/controles/equalizador** no centro, **letra** à direita. A capa azul/magenta é contraste legítimo contra painéis muito escuros e linhas ciano. O layout cresce em densidade com a Rádio, não com bordas de 3 cards genéricos. O foco não autoriza recriar a playlist, áudio ou visualizer para dar beleza a outras páginas.

### 6.3 Hub `/studio`

`/studio` **não é** uma nova hero gigante e **não é** uma página de portfólio inteira. Hierarquia aprovada: **Estúdio de Impressão 3D + Impressões** numa peça dominante à esquerda; **Peça um orçamento** acima à direita; **Produtos** abaixo à direita. Exatamente **3 entradas**. A rota mantém contexto de CM e Rádio persistente, inclusive enquanto a navegação espacial troca Home→hub. A composição da Home termina após essas entradas; materiais, placas e caixas não formam outra fileira genérica.

### 6.4 Rota `/studio/impressoes`

Aqui, diferentemente do hub, cabe narrativa editorial e prova fotográfica de peças físicas. O handoff propõe abertura com título curto, explicação curta, foto forte e um projeto contextualizado; estados distinguem `PRODUZIDO`, `CONCEITO`, `PRODUTO` e `PROJETO DE CLIENTE`. A imagem 6 (Mano Jotta e projetos) ajuda a visualizar essa linguagem: **objeto/prova em primeiro plano**, dados úteis próximos, conjuntos de fotos contextualizados, sem fila de ícones sem sentido. Novo estudo de Impressões precisa ocorrer **dentro dessa arquitetura** e com os próprios tokens/nav/respiro do CM, não num microsite novo.

### 6.5 Produtos e orçamento

Produto individual já tem composição aprovada: galeria real, descrição, dimensões, variantes válidas, vídeo quando existir e **um CTA principal Comprar na Shopee**. Não inventar carrinho, checkout ou pricing. Orçamento tem interação progressiva, diferente do detalhe de produto. Nenhuma das duas rotas adota automaticamente a tipografia/display gigantes da Home.

### 6.6 Mobile

O mobile **não empilha** Estúdio e Rádio completa como duas colunas comprimidas. É header CM, mini-player persistente logo abaixo, Estúdio; Rádio completa abre sob ação. A própria imagem X1 é prioridade visual no topo da Home e o texto vem depois, conforme contrato; subpáginas precisam respeitar essa ordem de nav/player, mas têm composição editorial mais enxuta. O site exige teste de rolagem, crops e tamanho de barra em mobile. As imagens atuais do usuário são principalmente desktop/arte; mobile completo precisa ser validado pelo navegador, não deduzido dos banners.

## 7. O que falhou nos estudos anteriores — observável no código do lab

| Aspecto | Laboratório 08V V1 | Site CM existente / critério corrigido |
| --- | --- | --- |
| Moldura | Página isolada chamada `Laboratório visual`, sem header real, divisor ou contexto Rádio | Nova proposta deve demonstrar que convive com o shell CM e o player persistente, sem criar segundo áudio |
| Cores | Fundo `#070A0C`, stage `#0D1113`, teal suave `#80C7DB`; vocabulário novo do protótipo | Partir dos tokens implementados e acentos reais; adicionar cor de artwork como conteúdo, não tema novo |
| Materialidade | Retângulos vazios e marcas d’água de mídia pendente tomam grande área | Placeholder técnico ainda é lícito, mas não é substituto de direção de fotografia, contraste e objetos |
| Tipografia | H2 “Impressões.” com tamanho de hero e frases genéricas nas três variantes | Padrão de títulos e microcopy específicos da rota, a partir do handoff real |
| Marca | Sem logo CM 3D and Radio, sem assinatura/contexto CMANGINI 3D; “CM / Estúdio” inventa um subheader | Herdar o sistema de identidade existente, sem colocar o logo do robô em todo card |
| Navegação | Botão ilustrativo `VER IMPRESSÕES` sem comportamento funcional real | Distinguir navegação do hub, capa editorial, projeto e CTA de orçamento; não simular clique como entrega |
| Referência | Três arranjos avaliados *entre si* sem comparação com a Home aceita, a Rádio em foco ou o hub | Comparar também **contra o universo visual do site** e registrar desvio de branding antes de apresentar |
| Teste | CI verde, collision/overflow/hydration verificados | Prova engenharia, mas **não** supera desvio de identidade; novo gate inclui fidelidade perceptiva e integração |

**Veredito:** a infraestrutura/testes de V4.1–V4.3 continuam tecnicamente válidos. As três composições iniciais **não satisfazem a direção visual do CM** e não podem ser escolhidas como layout público sem nova art direction.

## 8. Novo gate obrigatório antes de propor CSS/JSX de página

**G8V-IDENTIDADE** — para qualquer novo mock/study visual deste projeto:

1. **Referências reais primeiro:** links/arquivos verificáveis da Home em split, Rádio em foco, hub Estúdio e peça/projeto pertinente; identificar o que é render atual, asset e mock aprovado. Se faltar visão da rota-alvo, renderizar a implementação existente ou declarar a lacuna.
2. **Mapa de design concreto:** extrair tokens, fontes, gradiente efetivamente usado e controle do CTA, gramática de nav, peso de mídia, bordas, estado ativo e ritmo das telas já aceitas. Não escolher outra paleta por gosto próprio.
3. **Mapa de superfície:** esclarecer se a proposta pertence ao hub (3 entradas), à galeria `/studio/impressoes` ou a um detalhe de peça. Cada uma tem propósito e fluxo diferentes.
4. **Prévia contextualizada:** demonstrar o conceito com a **estrutura do site**, incluindo espaço/impacto de header e player — não apenas screenshot de página independente. Manter protótipo dev-only, sem duplicar motor de áudio; o método de preview contextual é decisão técnica separada.
5. **Mídia com significado:** asset/arte CM existente para identidade; fotografia de peça física apenas se arquivo e permissão existirem; placeholders nunca apresentados como qualidade visual final.
6. **Avaliação criativa além de CI:** avaliar fidelidade de composição e cromatismo, assinatura CM, legibilidade, fotografia, energia apropriada por área e mobile. Testes de unit/Playwright não podem passar essa etapa automaticamente.
7. **Aprovação de Cassiano:** variações só seguem para página pública quando houver layout *e* direção estética avalizados. Se as variantes compartilham erro de linguagem, rejeitar todas sem votação.

**Status das condições:** 1–3 cumpridas para Home/Rádio/hub por inspeção de screenshots e repo; falta referência visual completa em **mobile e na galeria-alvo** para paridade de tela; condições 4–7 **não foram cumpridas pelo lab V1**.

## 9. Estratégia de retomada

- **Primeiro:** preservar o laboratório como *harness*, mas mudar seu status de “três candidatos para escolher” para **experimentos técnicos descartados criativamente**. Não acrescentar estilo aleatório para “aproximar” os três.
- **Segundo:** criar proposta contextual de Impressões que incorpore nav/shell, tokens CM e edição visual com media reais (quando houver), respeitando o fato de que a peça mostrada no hub é entrada e a galeria é outra página.
- **Terceiro:** avaliar uma composição integrada em desktop/mobile e comparar com Home, hub e exemplos comerciais. Só criar três opções novamente se elas testarem **hipóteses realmente diferentes e coerentes com CM**; não há obrigação de produzir três por rodada.
- **Quarto:** congelar escolha **após avaliação de Cassiano**, planejar assets E3 e só então começar V5 na rota pública.

**Não executado nesta auditoria:** nenhuma alteração de `tsx`, `.module.css`, tokens, marketing/page, Rádio, imagens públicas, testes ou deploy; somente leitura visual de referências do usuário, renders Playwright existentes, código/contratos e atualização de documentação/agentes. **O lab anterior não foi removido nem aprovado.** **O lab anterior não foi removido nem aprovado.**
