# CM 3D & Rádio - Plano Mestre de Reconstrução V1

**Data:** 25/10/2026  
**Projeto novo proposto:** `cassianomangini/cm-3d-radio-v2`  
**Origem de código e dados:** `cassianomangini/radioand3d`, `main@b469c565062217b51a5c8ff18e6ba1eabf574f8c`  
**Estado:** especificação prescritiva. Em 25/10/2026 Cassiano indicou este arquivo como o plano a seguir. A aprovação visual dos tokens, da foto e do texto da Home continua pendente, como a seção 13 registra.  
**Próximo trabalho permitido após aprovação:** fundação mínima e Home.  
**Produção, domínio, exclusões e migrations:** NÃO autorizados por este plano.

## 0. Como ler este contrato

**Aprovado anteriormente pelo proprietário:** dois ambientes (Estúdio à esquerda e Rádio à direita no desktop), Rádio contínua com player único, mini-player no mobile, Rádio lateral com largura fixa e sem arraste desde 24/10/2026, possibilidade de recolher a Rádio para a navbar e abri-la em tela cheia, identidade CM sem astronauta, destaque de impressão 3D, fotografias reais, compras pela Shopee, orçamentos como prioridade comercial e quatro destinos do hub na ordem Orçamentos / Produtos / Materiais / O Estúdio.

**Definido nesta V1 como proposta técnica e visual a aprovar:** valores exatos de tokens, famílias de fonte, tamanhos, breakpoints, APIs de componentes, árvore de diretórios, distribuição percentual, conteúdo-base da Home e sequência de PRs. São o único default permitido ao agente; NÃO devem ser chamados de aprovados até validação. Nenhum agente pode trocar silenciosamente esses valores por preferência própria.

**Precedência de decisões:** (1) instrução atual explícita do proprietário; (2) referência visual da superfície aprovada por ele; (3) este plano após aprovação; (4) código legado SOMENTE para recuperar lógica e dados; (5) documentação histórica legada como contexto, nunca como autoridade automática. Quando houver conflito, registrar e não improvisar.

**Papel do agente:** implementar uma etapa fechada, não criar conceito de marca, nova tipografia, novo layout ou funcionalidades não solicitadas. Se faltar um ativo essencial, usar o ativo provisório explicitamente indicado e deixar a aprovação visual pendente; não fabricar outra solução.

---

## 1. Produto e escopo

O novo site reúne dois mundos conectados:

- **CM 3D Estúdio:** serviços de placas personalizadas, caixas sob medida, avaliação de arquivos 3D, produtos reais, impressões realizadas, materiais e apresentação da operação.
- **CM Rádio:** músicas autorais publicadas, fila, busca, reprodução, controles, visualizador e links individuais.

**Objetivos de conversão:** (1) receber pedidos de orçamento com destino real e seguro; (2) apresentar produtos e levar o comprador à página específica da Shopee.

**Não criar:** checkout próprio, blog genérico, dashboards de administração, redes sociais fictícias, favoritamento desativado, conta/login de visitante, sistema de avaliação, reviews inventados, catálogo de filamentos sem estoque verificado, editor 3D, área de testes visuais pública, animações por decoração, modais duplicados.

**Princípio de migração:** repositório novo e interface nova; aproveitar código do motor da Rádio, modelos de dados, integrações e ativos mediante inventário. Projeto antigo permanece intacto até um cutover explicitamente aprovado. **Proibido copiar a pasta `src/` inteira.**

---

## 2. Arquitetura técnica obrigatória

### Stack e dependências

| Camada | Decisão V1 |
|---|---|
| Framework | Next.js App Router + React + TypeScript, com `src/` |
| Gerenciador | pnpm com lockfile versionado |
| Versão de partida | Verificar compatibilidade com o legado (`next@16.3.7`, `react@19.2.4` no SHA de origem); fixar versões no novo lockfile. Não atualizar versões no meio da migração da Rádio. |
| Estilo | CSS Modules + `tokens.css` + `globals.css`; **sem Tailwind** na V1 |
| Fontes | `next/font/google`: Outfit + Manrope; **sem terceira fonte** na V1 |
| Ícones | SVG local e coerente; sem biblioteca de ícones de terceiros |
| Animações | CSS para hover/transições simples; biblioteca `motion` somente quando um estado interrompível da Rádio demonstrar necessidade |
| Áudio | Migrar provider, fila e análise existentes; um único `<audio>` no layout raiz |
| Mídias | R2 existente; não copiar centenas de originais para o Git |
| Dados de produtos | Snapshot editorial tipado de 9 produtos; checkout permanece Shopee |
| Orçamento | Recuperar contratos/handlers protegidos; UI nova; ativar somente depois de validar integrações/segredos |
| Deploy | Projeto Vercel de preview separado; domínio público permanece no projeto antigo até cutover |

### Árvore de diretórios de destino

```text
src/
  app/
    layout.tsx
    page.tsx
    musica/[slug]/page.tsx
    studio/
      page.tsx
      orcamento/page.tsx
      produtos/page.tsx
      produtos/[slug]/page.tsx
      impressoes/page.tsx
      o-estudio/page.tsx
      materiais/page.tsx
      placas-personalizadas/page.tsx
      caixas-personalizadas/page.tsx
      impressao-3d-sob-demanda/page.tsx
    api/
      radio/lyrics/route.ts
      studio/prints/[id]/route.ts
      quote/...
  components/
    layout/        # SiteShell, SiteHeader, SiteNav, SocialLinks
    ui/            # ActionLink, ActionButton, IconButton, PageFrame, MediaFrame, MediaViewer, FormField
    home/          # HomeHero, HomeArt, HomeActions
    studio/        # StudioHub, PhotoGrid, ProductCard, QuoteForm etc, quando demandados
    radio/         # RadioPanel, RadioControls, RadioQueue, RadioDock, MobileMiniPlayer, RadioFullscreen
  features/
    radio/         # core de reprodução, catálogo, letras, visualizador; migrar sem shell legado
    studio/        # catálogo editorial, produtos, materiais, contratos de arquivos
  server/
    quote/         # migração seletiva dos handlers, quando a etapa começar
  lib/
    site-config.ts
    links.ts       # somente destinos verificados
  styles/
    tokens.css
    globals.css
public/
  images/
    brand/
    studio/
    radio/
README.md
docs/
  PLANO_MESTRE.md   # cópia deste documento depois de aprovado
```

**Criar pastas e rotas apenas na etapa em que forem usadas.** A árvore acima é o destino lógico, não licença para implementar dez páginas vazias.

### Regra de arquitetura

`RootLayout (server)` → `RadioProvider (client, montado uma vez)` → `SiteShell` → `SiteHeader` + `StudioPane` + `RadioSurface`.

As páginas são conteúdo normal de `children` do App Router. **Proibido repetir o modelo antigo em que `/studio/page.tsx` retorna `null` e o shell inventa páginas por pathname.** O shell administra layout/estados, não conteúdo das rotas.

O provider nunca deve ser recriado por mudança de página. As visualizações `RadioPanel`, `RadioDock`, `MobileMiniPlayer` e `RadioFullscreen` consomem o mesmo contexto e nunca instanciam áudio independente. Mudança de rota não reinicia faixa, fila nem posição.

---

## 3. Sistema visual V1 - tokens obrigatórios

### Identidade

- Estúdio: quase preto, fotografia e material real, alto contraste, pouco brilho.
- Rádio: fundo escuro próprio, mais densidade e cores reativas ao áudio; não transformar a Rádio em card SaaS.
- Ciano marca CM e ações principais. Violeta/rosa pertencem principalmente à Rádio e aos estados de música.
- Laranja escuro reservado às ações da Shopee, não espalhado por cards aleatórios.
- Sem astronautas, galáxias, estrelas, glassmorphism em toda a tela, diagramas fictícios ou render de produtos inventados.

### `src/styles/tokens.css` proposto (fonte única)

```css
:root {
  --bg-app: #05070b;
  --bg-studio: #06090e;
  --bg-radio: #080a13;
  --bg-panel: #10161f;
  --bg-raised: #161f2b;
  --bg-overlay: rgb(3 5 10 / 90%);

  --text-primary: #ffffff;
  --text-secondary: #d2dce7;
  --text-muted: #adbac9;
  --text-on-cyan: #06080c;

  --accent-cyan: #52d6ff;
  --accent-cyan-hover: #7fe3ff;
  --accent-violet: #9c78ff;
  --accent-pink: #f46ac5;
  --accent-shopee: #c83e20;
  --focus-ring: #8ddbff;
  --error: #ff8794;
  --success: #75dbac;

  --border-default: rgb(255 255 255 / 14%);
  --border-strong: rgb(255 255 255 / 22%);
  --border-active: rgb(82 214 255 / 68%);

  --font-heading: var(--font-outfit), Arial, sans-serif;
  --font-body: var(--font-manrope), Arial, sans-serif;

  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 24px;
  --space-6: 32px;
  --space-7: 48px;
  --space-8: 64px;

  --radius-photo: 12px;
  --radius-field: 12px;
  --radius-card: 16px;
  --radius-dialog: 18px;
  --radius-action: 999px;

  --header-height: 72px;
  --mobile-header-height: 60px;
  --mobile-player-height: 96px;
  --radio-panel-width: clamp(360px, 30vw, 600px);
  --page-gutter: 32px;

  --motion-fast: 140ms;
  --motion-ui: 220ms;
  --motion-panel: 260ms;
  --ease-ui: cubic-bezier(.2, .8, .2, 1);

  --layer-base: 0;
  --layer-header: 10;
  --layer-player: 20;
  --layer-menu: 30;
  --layer-dialog: 40;
}
@media (max-width: 1023px) {
  :root { --page-gutter: 20px; }
}
```

**Contraste:** texto principal branco; texto secundário `#d2dce7` sobre fundo escuro. Não usar cinza de baixo contraste para descrição de produtos. O ciano `#52d6ff` funciona com texto escuro no botão. Branco sobre `#c83e20` é legível (contraste calculado aproximado 5:1). Foco visível em todas as ações.

**Política CSS:** valores de cor, radius, spacing, tipografia e transição devem vir dos tokens, exceto tratamento de fotografia, estado de áudio que realmente exija outra cor, e valores geométricos locais documentados. Não usar `!important` como correção normal. Não criar novos gradientes sem decisão explícita. Não fazer override global de classes de componentes. Proibido copiar os antigos arquivos CSS gigantes.

### Tipografia: contrato fechado para a implementação proposta

| Papel | Família / peso | Desktop | Mobile | Altura de linha | Cor |
|---|---|---:|---:|---:|---|
| H1 da Home | Outfit 800 | `clamp(36px, 5.2cqi, 58px)` | 36px | 1.06 | branco; máximo 1 destaque ciano |
| H1 de página | Outfit 800 | 44px | 34px | 1.10 | branco |
| H2 de seção | Outfit 700 | 32px | 27px | 1.15 | branco |
| H3/card título | Manrope 700 | 22px | 20px | 1.20 | branco |
| Texto de abertura | Manrope 500 | 18px | 16px | 1.50 | branco |
| Texto comum | Manrope 500 | 16px | 16px | 1.55 | branco |
| Texto de apoio | Manrope 500 | 15px | 15px | 1.50 | secundário |
| Nav/botão | Manrope 700 | 15px | 15px | 1.20 | branco / on-cyan |
| Rótulo curto | Manrope 700 | 13px | 13px | 1.25 | secundário ou ciano |
| Tempo e números Rádio | Manrope 600 com `tabular-nums` | 13px | 13px | 1.25 | secundário |

**Restrições:** nenhuma outra fonte; pesos somente 500/600/700/800 nos componentes; `letter-spacing` H1 `-0.025em`, H2 `-0.015em`, corpo `normal`. Não reduzir fonte abaixo de 13px para acomodar layout. Evitar caps lock com tracking exagerado; permitido apenas em etiqueta curta e excepcional. Largura de leitura do texto corrido: 62 caracteres (`max-width:62ch`). Destaque no título tem significado, não colorir uma palavra aleatória por seção.

### Medidas e tratamento

- Cabeçalho: 72px desktop; 60px até 1023px. Logo preservado, largura visual até 164px, proporção original intacta.
- Botão padrão: altura 48px, padding horizontal 22px, raio cápsula `999px`; no hero 52px; texto 15px/700; ícone 18px; gap 10px.
- Botão de ícone: área tocável mínima 44×44px, ícone SVG 20–22px. Controles densos da Rádio no desktop podem usar 40×40px se o painel comportar adequadamente; mobile 44×44px.
- Card: raio 16px, borda 1px, fundo escuro discreto. Sombra somente se realmente houver elevação funcional. Nada de bordas luminosas em todos os cards.
- Campos: altura mínima 48px, raio 12px, texto 16px, label 14px/700, erro legível imediatamente abaixo.
- Foto: raio 12px; produto/peça com `object-fit: contain`; imagem de cenário pode usar `cover` com enquadramento aprovado. Nunca inverter, distorcer ou inventar geometria de produto.
- Espaço entre controles da mesma linha: 8–12px. Entre blocos 24–32px. Entre seções 48–64px no conteúdo completo.
- Nenhum banner/fundo com texto incorporado à própria imagem. Texto principal deve ser HTML acessível e responsivo.

---

## 4. Layout, breakpoints e estados

### Breakpoints fixos

| Largura da janela | Composição |
|---|---|
| 320–639px | Mobile: header 60px, mini-player 96px abaixo, Estúdio em coluna, Rádio completa sob demanda |
| 640–1023px | Tablet/compacto: mesma lógica mobile, conteúdo mais largo; mini-player permanente |
| >=1024px | Desktop split: Estúdio esquerda / Rádio direita, largura lateral fixa |

**Desktop:** `grid-template-columns: minmax(0,1fr) var(--radio-panel-width)`, onde a Rádio começa perto de 30% e respeita piso 360px e teto 600px. Borda divisória de 1px, **sem drag, sem handle, sem cursor resize**. Altura visual da experiência `calc(100dvh - 72px)`. Estúdio pode ter `overflow-y:auto`; Rádio tem scroll próprio na fila, sem obrigar rolagem da página inteira para operar Play/Pausa e volume. `min-width:0`, `min-height:0` nas áreas flex/grid.

**Conteúdo do Estúdio dentro do split:** ativar `container-type:inline-size` no pane. Tipografia e cards respondem à largura **do Estúdio**, não ao `vw` da página inteira. Quando pane < 800px, composições com colunas internas devem reorganizar.

**Mobile:** body rola normalmente; header e mini-player continuam acessíveis; Rádio expandida abre superfície própria com scroll/foco geridos e botão Fechar. Hero mobile não é a versão desktop espremida.

### Estados da Rádio desktop

1. `split`: painel completo à direita. Sem mini-player desktop simultâneo.
2. `docked`: painel lateral deixa de ocupar espaço; mini-player ocupa a navbar **antes dos links sociais**. Estúdio recebe a largura livre. Um botão do dock restaura o painel lateral.
3. `fullscreen`: Rádio ocupa a superfície de foco; Fechar retorna ao estado anterior (`split` ou `docked`).

O X do painel lateral significa **recolher para a navbar**, não parar o áudio. Expandir significa tela cheia. Botões com rótulos acessíveis explícitos. Transição visual inicial até 260ms, sem copiar a implementação antiga de FLIP; melhorar somente se o resultado exigir e for aprovado.

**Mobile:** mini-player persistente; tocar na faixa ou no botão de abrir mostra a Rádio completa. Fechar não altera música, fila ou progresso. Link compartilhado de música abre a Home com a faixa selecionada, destacada/expandida no mobile; respeitar bloqueio de autoplay.

### Movimento e acessibilidade

- Movimento da Rádio decorre de interação ou sinal de áudio real; movimento do Estúdio é mínimo.
- Nenhuma animação letra por letra na Home V1. Entrada opcional por opacidade de bloco até 220ms, somente depois de aceite visual.
- `prefers-reduced-motion`: desabilitar movimentos de layout desnecessários sem esconder conteúdo.
- `:focus-visible` com contorno 3px; navegação funcional por teclado e Escape em diálogos.
- Sem botões clicáveis feitos de `<span>` ou `<div>`. Link de navegação é `<a>`/`Link`; ação local é `<button>`.
- `alt` descritivo para fotografia informativa, `alt=""` para fundo puramente decorativo. Ícones de botões precisam de nome acessível.
- Sem scroll horizontal involuntário desde 320px.

---

## 5. Biblioteca de componentes: contrato de responsabilidade

**Criar apenas quando houver consumidor real.** Não construir uma biblioteca abstrata no Bloco 0.

| Componente (destino) | Responsabilidade | Interface e restrição |
|---|---|---|
| `SiteShell` | Divisão Desktop/Mobile, posição dos panes | Não administra texto de página nem motor de áudio |
| `SiteHeader` | Logo, nav, menu mobile, espaço do dock | Um header em todas as rotas; links somente ativos/verificados |
| `SiteNav` | Links Início, Estúdio, Orçamentos, Rádio | Rotas ainda não existentes não aparecem; `aria-current` correto |
| `SocialLinks` | Shopee, Instagram, contato | Renderiza `<a>` real somente se URL confirmada; caso contrário não exibe |
| `PageFrame` | Largura, padding, ritmo do conteúdo interno | Não redefine cores/fontes por página |
| `SectionHeading` | Título H2, resumo opcional | Sem eyebrow automático em todas as seções |
| `ActionLink` | Navegar | `href`, `variant='primary'|'secondary'|'shopee'`, `size='md'|'lg'`; mesmo CSS de ActionButton |
| `ActionButton` | Ação local | `type`, `onClick`, `disabled`, `variant`, `size`; sem `href` |
| `IconButton` | Fechar, próxima, expandir | Hit area >=44px mobile, label explícito, SVG `currentColor` |
| `MediaFrame` | Proporção e apresentação da mídia | `mode='contain'|'cover'`; não recortar produto sem aprovação |
| `MediaViewer` | Único dialog de ampliação de fotos | Foto centrada, proporção preservada, X roxo/branco, CTA abaixo quando cabível, ESC, foco e controles condicionais |
| `HomeHero` | Conteúdo e imagem de abertura | Não importa Rádio nem altera áudio |
| `RadioPanel` | Rádio completa desktop | Consome o provider, não cria áudio |
| `RadioControls` | Shuffle, repeat, prev, play, next, volume | Mesmo componente/semântica quando usado nas superfícies necessárias |
| `RadioQueue` | Busca e lista 'A seguir' | Lista rolável interna, sem segundo catálogo duplicado |
| `RadioDock` | Mini-player desktop no header recolhido | Só existe em `docked` |
| `MobileMiniPlayer` | Player compacto sempre visível no mobile | Altura-alvo 96px; ações principais em toque |
| `RadioFullscreen` | Superfície completa de foco | Retorna ao estado anterior; player continua único |
| `PhotoGrid` | Miniaturas de Impressões | 8 colunas quando Studio pane >=900px, 5 colunas de 600–899px, 3 entre 360–599px, 2 abaixo de 360px |
| `ProductCard` | Foto, título e utilidade da peça | Sem preço/estoque inventado; o card abre detalhe |
| `FormField` | Label, input, hint e erro | Mesmo padrão visual em todos os campos |
| `QuoteForm` | Tipo → detalhes → contato/revisão | Não duplica backend e não permite envio fictício |

**Ícones:** biblioteca local com desenho SVG 24×24, `stroke-width:1.8` e poucos nomes reais: menu, fechar, buscar, tocar, pausar, anterior, próximo, shuffle, repetir, volume, expandir, restaurar, compartilhar, seta externa. Nenhum pacote de ícones por conveniência. A Rádio pode ajustar alguns tamanhos, mas não trocar arbitrariamente a linguagem dos controles.

**Estados comuns:** default, hover (onde existe hover), focus, pressed/active, loading, disabled somente quando legítimo, error e empty. Feedback de sucesso exige ação de fato confirmada.

---

## 5A. Moldes de página e componentes com geometria definida

O objetivo desta seção é impedir que cada nova rota reinvente uma composição.

### Página interna padrão (`PageFrame`)

- Toda rota `/studio/*` é renderizada **dentro do StudioPane**, com a Rádio persistente à direita no desktop.
- Padding do conteúdo: `32px` desktop dentro do pane e `20px` mobile; margem vertical superior `24px`; espaço inferior `64px`. Não criar um novo `max-width` por rota.
- Título H1 alinhado ao mesmo eixo esquerdo do breadcrumb e do conteúdo. Breadcrumb somente em páginas filhas e produtos; fonte 13px, sem enorme espaço vazio acima.
- Hero interno sem fotografia: título e abertura em bloco único, largura máxima `62ch`. Hero com fotografia real: duas colunas proporcionais `55% texto / 45% imagem` somente se `StudioPane >=850px`; abaixo disso, imagem antes ou depois do texto conforme contrato editorial da rota, não sobreposta ao texto.
- Uma página interna tem um H1 e seções H2 semanticamente válidas; não adicionar `eyebrow` decorativo antes de cada título. Títulos e descrição em branco/secondary, nunca cinza fraco.
- Sem `min-height:100vh` obrigatório em cada seção, sem fundos e gradientes independentes para cada rota. Apenas o shell controla fundo principal.
- No máximo **uma chamada principal por seção**. Não repetir 'Pedir orçamento' três vezes em áreas adjacentes.

### Produtos: medidas dos cards

- Grid por largura do **StudioPane**: `4 colunas` a partir de `1200px`; `3 colunas` entre `800–1199px`; `2 colunas` entre `360–799px`; `1 coluna` abaixo de `360px`.
- Gap 12px mobile, 16px desktop. Card com `border:1px solid var(--border-default)` e `border-radius:16px`. Área da fotografia proporção `1:1`; `object-fit:contain` em fundo neutro sólido.
- Card inteiro é um único `<Link>` para o detalhe. Sem seta extra, sem dois botões concorrentes dentro dele.
- Título máximo 2 linhas visíveis, Manrope 700, 17px no mobile e 19px no desktop. Descrição até 2 linhas quando houver; o detalhe expõe o texto completo.
- Não colocar faixa colorida atrás de cada título. O laranja aparece apenas no CTA de Shopee no detalhe.
- Detalhe: foto principal + miniaturas, título/descrição, opções reais e medidas em texto, CTA Shopee. Se a fotografia não carregar, mostrar erro legível e possibilidade de tentar novamente; não um quadrado cinza sem contexto.

### Galeria e visualizador: dimensões operacionais

- `PhotoGrid` usa miniaturas com borda/raio definidos, gap 8px e carregamento preguiçoso; a grade pode apresentar várias fotos de um projeto sem inventar um projeto por arquivo.
- `MediaViewer`: largura máxima `min(1080px, calc(100vw - 32px))`, altura máxima `92dvh`, fundo escuro sólido, conteúdo em coluna. Imagem com `object-fit:contain` e altura máxima `calc(92dvh - 154px)`, preservando espaço para controles/CTA.
- Fechar com botão circular de 40px, fundo violeta `var(--accent-violet)`, X branco, posicionado dentro do modal; sem faixa/borda azul em toda a largura. Miniatura não se amplia automaticamente até a altura da tela se for uma imagem pequena.
- CTA 'Quero algo parecido' aparece **abaixo da fotografia**, não sobre ela; usa `ActionLink` secundário para orçamento, levando `referencia` de mídia **somente por ID público aprovado**, nunca caminho privado ou dados do cliente.
- Anterior/Próxima só são exibidos quando houver mídia anterior/posterior válida; ESC fecha; foco retorna ao disparador. Swipe mobile somente se não atrapalhar zoom/scroll.

### Estúdio, Materiais e Serviços: ordem editorial obrigatória

- **O Estúdio:** hero com apresentação real; estrutura/equipamentos (3 P1S + 1 X1 Carbon); processo em até quatro etapas reais; apresentação breve de quem opera; único CTA contextual. Máximo duas fotografias demonstrativas fora da página Impressões. Não repetir o catálogo, nem inventar estrutura de fábrica.
- **Materiais:** PLA, PETG e TPU como três linhas de leitura, cada uma com tipo, uso, limitação e imagem/amostra real se aprovada. Sem título gigante com sigla isolada; sem quadro falso de cores disponíveis. Final com indicação objetiva de que escolha e disponibilidade dependem da peça.
- **Placas/caixas/arquivo:** hero com descrição específica, imagem real autorizada quando houver, lista curta de informações necessárias para orçamento, CTA funcional. Não replicar template vazio e trocá-lo apenas pelo nome do serviço.
- **Orçamento:** formulário em `max-width:720px` dentro do StudioPane, progresso visível `1 de 3`, uma pergunta/título de etapa, controles padronizados, botão Voltar e avanço inequívoco. Não apresentar primeiro card como selecionado antes do clique. Erros próximos ao campo. Envio só após confirmação do backend.

### Painel da Rádio: regiões e densidade

- Header do painel: identificação da Rádio, ação de tela cheia e ação de recolher. Não usar ícone X com comportamento ambíguo no mobile.
- Arte da faixa atual no topo, sem engolir toda a coluna; altura-alvo `min(32dvh, 260px)`, com título/artista legíveis sobre área escura ou região de texto. Sem chamar a mesma imagem genérica de capa oficial de 343 músicas.
- Controles em uma linha, na ordem definida, com Play/Pausa visualmente maior. Altura total-alvo dos controles `64px`.
- Linha seguinte com título **A seguir** e campo de busca no mesmo agrupamento; lista ocupando o espaço restante, com linhas de `min-height:56px` e seu próprio `overflow-y:auto`.
- Mini-player mobile (`96px`): arte de 52px, título em uma linha truncada, artista acessível, Play/Pausa de 44px e ação de abrir a Rádio completa. Se houver espaço, visualização real das barras fica na faixa inferior do mini; nunca desloca Play/Pausa para fora da área visível.
- Dock desktop no header: largura-alvo `260–320px`, aparece somente quando o painel lateral está recolhido. Quando dockado, navegação fica junto do logo, mini antes das redes; não duplicar player completo.

### Regras de tamanho de CSS, sem teste artificial

- `globals.css` deve continuar pequeno e limitar-se a reset, tipografia base, foco e políticas globais; alvo de revisão: `<=120 linhas`.
- `tokens.css`: apenas tokens necessários, alvo inicial `<=140 linhas`.
- Um CSS Module com `>300 linhas` exige revisão humana de responsabilidades antes do merge: dividir **por componente real**, não apenas em arquivos menores para satisfazer número.
- Não criar testes que contem linhas de CSS, nomes de classes, cores ou quantidade de arquivos. Esses limites são gatilhos de revisão, não um CI burocrático.
- Um componente não deve estilizar elementos internos pertencentes a outro componente por seletores globais. Preferir `data-state` e atributos ARIA para estados, não cadeias de seletores por pathname.

---

## 6. Home V1 - especificação da PRIMEIRA página

### Objetivo

Em 5 segundos de leitura, explicar que o site reúne um estúdio real de impressão 3D, serviços personalizados, produtos prontos e música autoral; apresentar duas rotas comerciais inequívocas. Não virar galeria nem página institucional extensa.

### Texto-base V1 (não inventar outras versões no frontend)

- Saudação: **SEJA MUITO BEM-VINDO!**
- H1: **Conheça nossos produtos, trabalhos e serviços de impressão 3D.**
- Apoio: **Placas personalizadas, caixas sob medida e produtos prontos. Se você já tem um arquivo 3D, também pode enviá-lo para avaliação.**
- Nota curta de Rádio (somente desktop; omitida no mobile): **E a CM Rádio acompanha sua visita com músicas autorais.**
- CTA principal: **Pedir orçamento** → `/studio/orcamento`.
- CTA secundário: **Conhecer produtos** → `/studio/produtos`.

O texto-base usa a chamada mais recente da Home como ponto de partida e corrige a saudação. **É proposta para aprovação junto ao mock, não autorização para alterar sem consulta.** Não inserir 'ideias que ganham forma', 'muito mais' ou outras frases genéricas por iniciativa do agente.

### Desktop ≥1024px

```text
┌────────────────────────────────── HEADER GLOBAL ───────────────────────────────────┐
│ LOGO CM 3D & RÁDIO       Início  Estúdio  Orçamentos  Rádio      [ações válidas] │
├──────────────────────────────┬────────────────────────────────────────────────────┤
│  ESTÚDIO (70% aprox.)        │  RÁDIO (30% aprox.)                                │
│                              │                                                    │
│  [X1 / arte real aprovada]   │  [arte/faixa atual]                                │
│      à esquerda             │  [título e artista]                               │
│                              │  [busca e controles]                               │
│                  SAUDAÇÃO    │  [A seguir: playlist rolável]                      │
│                  H1          │                                                    │
│                  APOIO       │                                                    │
│                  [CTA][CTA]  │                                                    │
└──────────────────────────────┴────────────────────────────────────────────────────┘
```

- Arte X1/robô **à esquerda do pane do Estúdio**, texto à direita. Imagem ocupa visualmente até cerca de 35% do pane; pelo menos 60% da área de leitura deve ficar escura e livre.
- Sem luz central sobre o texto, sem plantas/objetos decorativos e sem alterar a geometria da impressora. A X1 Carbon deve aparecer com AMS de quatro posições quando visível.
- O H1 fica em bloco legível à direita, sem cobrir impressora. Pode quebrar por palavra; nunca renderizar uma `<span>` por letra.
- Padding lateral 32px; ações com gap 12px. Em pane de Estúdio <800px o H1 fica no limite inferior da escala, sem forçar uma terceira coluna.
- Separação da Rádio com **apenas 1px**. Nenhuma alça ou seta decorativa.
- Não acrescentar na Home seções 'Nosso processo', 'por que escolher', catálogo de 9 produtos, grade aleatória ou depoimentos falsos.

### Mobile até 1023px

- Header de 60px, logo claro, botão Menu de 44px.
- Mini-player de 96px logo abaixo do header, com capa, faixa, Play/Pausa e acesso à Rádio completa. Se o analisador real estiver disponível, visualização compacta real; não inventar barras pulsando.
- Hero em coluna: imagem/robô no topo em área de 170–240px (enquadramento mobile aprovado); saudação, H1 36px, apoio e CTAs abaixo.
- Ações empilhadas com a **mesma largura** abaixo de 460px de conteúdo. Altura 48px e espaço 10px, para evitar botões tortos ou textos quebrados de maneira desigual.
- O texto não pode ficar apagado sobre fotografia; se a arte não permitir contraste, usar fundo escuro uniforme atrás do texto, não mais neon.
- Nenhuma rádio desktop comprimida no celular.

### Ativos iniciais: copiar somente após conferência de fidelidade

| Uso | Origem real no legado | Regra |
|---|---|---|
| Logo | `public/images/cm-3d-radio-logo.png` | Original aprovado; não redesenhar monograma em CSS |
| Arte de Home candidata | `public/images/studio/imagem_principal_fundo23.png` | Apenas referência inicial; imagem final requer aprovação para novo layout |
| Arte de prévia da Rádio | `public/images/cm-radio-preview-art.png` | Não chamar automaticamente de capa oficial de todas as faixas |
| Fotografias de produtos | URLs reais em `src/features/studio/catalog.ts` | Não fabricar novas peças |

Não inserir imagens inventadas enquanto não houver uma escolha visual explícita. Não embutir textos publicitários nas fotos.

### Gate de aceitação da Home

- Visual aprovado em 1440×900, 1024×768, 390×844 e 360×800; inspecionar também 1920×1080.
- H1 legível e sem interceptar a imagem. CTAs alinhados e de mesmo padrão.
- Rádio toca catálogo real e permanece funcional quando recolhida/expandida.
- Um único áudio, volume consistente, teclado e controles acessíveis.
- Não existem links sem destino verdadeiro. Durante preview interno, uma rota ainda não implementada não é anunciada como funcional; publicação final exige Orçamentos e Produtos utilizáveis.
- Nenhum CSS/DOM do site antigo foi copiado para servir de remendo.
- Aprovação do proprietário registrada por captura da **mesma versão implementada**.

---

## 7. Rádio - migração funcional, interface nova

### Copiar e adaptar com dependências verificadas

| Domínio | Arquivos existentes de origem | Tratamento |
|---|---|---|
| Player e fila | `src/features/radio/radio-provider.tsx`, `queue.ts` | Copiar lógica, adaptar imports; manter áudio único e seleção de rota |
| Catálogo R2 | `catalog.ts`, `published-r2-catalog.ts`, `r2-catalog-core.ts` | Copiar dados e leitura publicados; credenciais somente no servidor |
| Publicações | `publications.ts`, `publications-core.ts`, `publications.generated.json` | Preservar IDs, slugs e versões; 343 itens publicados no manifesto da origem |
| Visualizador | `radio-visualizer.tsx`, `visualizer-analysis.ts`, `frequency-bars.ts` | Copiar lógica; integrar no novo painel; nenhum equalizador falso |
| Letras | `radio-lyrics.tsx`, `synced-lyrics.ts`, JSONs gerados, `/api/radio/lyrics` | Copiar dados/rota, refazer apenas estilos de apresentação |
| Links de música | `src/app/musica/[slug]/...` e Open Graph | Preservar URLs públicas e experiência de Home com faixa selecionada |

**Não copiar:** `studio-radio-shell.tsx`, `studio-radio-shell.module.css`, `radio-content.module.css`, `studio-welcome.module.css`, laboratório visual e animações antigas FLIP sem prova de necessidade.

**Cuidado:** `radio-provider.tsx` usa `usePathname` para links de música. Migrar o comportamento ou extrair um pequeno `MusicRouteSelection` sem criar segundo provider. Não copiar seletivamente só dois arquivos e concluir que a Rádio está migrada. Catalogar todas as importações transitivas primeiro.

### Contrato de comportamento

- Ao abrir a Home: fila embaralhada uma vez, preservando música atual enquanto navega; não embaralhar a cada render.
- Controles da Rádio lateral em ordem: **Nova ordem, Repetir faixa, Anterior, Play/Pausa, Próxima, Volume**. Favoritos fica FORA até existir funcionalidade real. Sem botão decorativo desativado.
- `A seguir`: uma única lista, com busca, scroll próprio e ao menos três músicas completas visíveis no desktop comum. Não duplicar aba 'Biblioteca' sem necessidade.
- Volume depois de Próxima. Ajuste abre sob demanda; mudo acessível.
- Repetição da faixa só quando escolhida; não reiniciar automaticamente no fim da fila se o comportamento vigente for parar.
- Visualizador só reage a análise/sinal real; estado pausado fica visualmente calmo.
- Dados públicos apresentam título artístico e artista; nunca usar nome bruto de arquivo como título visível.
- Compartilhar gera `/musica/[slug]`; seleção da faixa na Home, primeiro item selecionado, restante da fila embaralhado e contínuo. Se autoplay for bloqueado, mostrar ação explícita **Ouvir [título]**.
- O mesmo provider permanece montado em páginas do Estúdio e da Rádio. Fullscreen, dock e mini-player não duplicam áudio.

**Critério de aceitação:** tocar faixa real, ir para Produtos e voltar, recolher/restaurar, fullscreen, mobile abrir/fechar, navegar por link de música, alternar faixas e reproduzir/pausar; não deve perder faixa/progresso fora das mudanças pedidas.

---

## 8. Páginas posteriores - contratos mínimos, sem construir antes da Home

### `/studio` - Hub

Usar o mock de 19/10 como referência de distribuição, sem copiar o CSS antigo. **Ordem fixa dos quatro links:** Orçamentos, Produtos, Materiais, O Estúdio. Cards compactos, imagem pequena ao lado do título grande, borda fina por categoria, sem seta e sem CTA duplicado. Carrossel de Impressões dominante; uma faixa de miniaturas pode permanecer como parte do hub se a composição for aprovada. **Não repetir o carrossel em O Estúdio.** Em pane <800px, carrossel no topo e cards abaixo sem esmagar conteúdo.

### `/studio/orcamento` - prioridade comercial imediata após Home/Rádio

Nova UI com **3 etapas**, sem migrar os 6 passos antigos:

1. **Tipo:** Placa, Caixa, Tenho arquivo 3D, Outro. Clicar seleciona e avança, sem seleção predefinida falsa.
2. **Detalhes:** campos condicionais e referências. Placa: uso, texto/logo, medidas quando conhecidas, quantidade, fixação opcional. Caixa: objeto/função, medidas quando conhecidas, tampa/divisórias opcionais, quantidade. Arquivo: arquivo 3D obrigatório para análise, quantidade e requisitos. Outro: descrição e referência opcional.
3. **Contato, revisão e envio:** nome, WhatsApp ou e-mail, revisão editável, aviso de finalidade/privacidade, envio real, confirmação com ID ou erro legível.

Reutilizar políticas de upload verificadas do código antigo: **até 5 arquivos; 50 MB por arquivo; 100 MB no conjunto; STL, 3MF, OBJ, STEP/STP, PDF, PNG, JPG/JPEG e WebP**. Não supor que extensão/MIME do navegador prova segurança. Backend deve aplicar validação, rate limit, sessão/posse, origem permitida, armazenamento privado, expiração/retenção e erros consistentes. Reaproveitar código de `src/features/studio/quote-contract.ts`, `quote-request-contract.ts` e `src/server/quote/` mediante revisão de dependências. Ativação da flag **somente** depois do caminho de ponta a ponta funcionar; nunca mostrar 'enviado' sem confirmação do servidor.

**Pendente de decisão operacional (não autoriza improviso):** destino/triagem efetiva das solicitações e configurações do projeto Supabase CM. Enquanto isso não estiver disponível, preview pode demonstrar UI, mas não existe publicação pública de orçamento fictício.

### `/studio/produtos` e `/studio/produtos/[slug]`

Migrar os **9 produtos estáticos reais** de `src/features/studio/catalog.ts` para estrutura tipada separada do componente visual. Grid de cards com imagem real, título e utilidade, sem gradiente aleatório. Detalhe inclui fotos, variantes, medidas textuais corretas e **um CTA principal 'Comprar na Shopee'**, com cor laranja do token e link real por item. Sem carrinho próprio, sem preço/estoque presumidos, sem SVG de caixa genérica usado para produtos diferentes. Personalizações, quando couber, apontam ao orçamento funcional.

### `/studio/impressoes`

Origem R2 `carrossel`, manifesto atual de **220 imagens**. **Inventário != publicação.** Criar catálogo editorial com campos `id` estável, `r2Key`, `revision`, `width`, `height`, `alt`, `projectId?`, `approvedForPublic`, `order?`, `featured?` e opcional `relatedQuoteType`. Não gerar título público a partir de `1.png` ou `IMG_...`. Um arquivo substituído não deve quebrar ID/links permanentes por causa de ETag.

Desktop amplo (`StudioPane >=900px`): **8 colunas**; 600–899px: 5; 360–599px: 3; abaixo: 2. Miniaturas leves e progressivas; iniciar com até 48 e carregar lotes seguintes sob demanda, sem bloquear com 220 originais. Ampliar em um único `MediaViewer`: imagem `contain`, modal dimensionado pela foto, X branco com fundo violeta sem borda, CTA **Quero algo parecido** abaixo; navegação anterior/próxima quando existir outra mídia válida. Carrossel do hub pode ser aleatório sem repetição imediata; galeria completa segue ordem editorial. Nunca inferir autorização de publicar apenas porque a foto está no bucket.

### `/studio/o-estudio`

Apresentar o espaço real, **3 Bambu Lab P1S e 1 X1 Carbon**, processo real, capacidade de avaliar projetos, materiais e quem opera o estúdio. Uma página editorial calma com poucas fotos aprovadas. **Proibido** duplicar galeria de Impressões, inventar equipe ou criar segunda loja. Não deixar `MOCK VISUAL` e textos de instrução de produção no resultado público.

### `/studio/materiais`

PLA, PETG e TPU, linguagem simples sobre utilidade/limites. Cores e acabamentos só quando inventário e fotografia estiverem confirmados. Sem aula extensa sobre polímeros e sem barrinhas CSS fingindo amostras. Reutilizar dados corretos de `src/features/studio/materials.ts` após revisão editorial.

### Serviços e SEO

`/studio/placas-personalizadas`, `/studio/caixas-personalizadas`, `/studio/impressao-3d-sob-demanda`: imagens reais e informação específica de pedido, com foco em Placas e Caixas. Nada de páginas publicadas com `FOTO REAL PENDENTE`. Metadados, sitemap, canonical, Open Graph, robots e JSON-LD por superfície apenas após existir conteúdo real; `noindex` no ambiente de preview. Preservar links compartilhados `/musica/[slug]`. Não registrar nomes de clientes em fotos/copy sem permissão.

---

## 9. Mídia, dados e segurança da migração

1. Criar inventário de **arquivos reutilizáveis**, com origem, destino, dependências e status (aprovado/pendente/não copiar). Não migrar documentos históricos nem `.env.local` inteiro.
2. Publicações de Rádio: copiar manifesto e lógica; validar IDs/slugs/URLs de áudio no ambiente de preview. Segredos R2 somente no servidor. Não tornar bucket privado público por comodidade.
3. Fotos: manter originais no R2. Script de inventário separado do catálogo editorial; considerar autorização de marcas e pessoas antes de publicar. Não enviar 220 arquivos ao Git nem copiar chave secreta ao navegador.
4. Produtos: migrar snapshot de dados, verificar cada link da Shopee e cada URL de imagem. Não marcar produto ativo apenas porque consta no snapshot.
5. Orçamento: trabalhar inicialmente com a infraestrutura Supabase CM já existente se auditada. Sem migrations remotas, credenciais de produção, writes ou ativação de submissão sem alvo e autorização confirmados.
6. Configuração: `.env.example` com nomes das variáveis, sem valores; segredos separados por preview/produção. Reutilizar nomes legados apenas quando equivalentes (`RADIO_CATALOG_SOURCE`, `R2_PUBLIC_BASE_URL`, `R2_S3_ENDPOINT`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, `CM_QUOTE_INTAKE_ENABLED` etc.).
7. Mídia comercial não deve ter reflexos, espelhamentos nem alteração de geometria. X1 Carbon com AMS correto. Nada de imagem sintética tratada como fotografia de peça vendida.
8. Privacidade: não gravar em Analytics nomes, telefones, e-mails, arquivos de clientes ou detalhes de orçamento. Definir retenção de dados no backend antes da ativação.

---

## 10. Política de qualidade SEM nova fábrica de testes

**No projeto novo, nenhuma suíte antiga será copiada.** Não criar Playwright, snapshot, laboratório visual ou teste de existência de classe CSS no bloco inicial.

**Verificações técnicas mínimas por PR:** `tsc --noEmit` e `next build` sobre a alteração; checagens de lint coerentes com o código, evitando bloquear um script utilitário por `console.log` sem relação com funcionamento. Se a etapa não possui runtime operacional, registrar impedimento, não marcar como aprovada.

**Verificação visual por agente:** render e captura de 1440×900, 1024×768, 390×844, 360×800, e 1920×1080 quando houver split; verificar também Rádio `split`, `docked`, `fullscreen`, áudio tocando/parado, título longo, erro de imagem, foco e fechamento. Primeiro comparar e corrigir; só depois pedir aprovação do proprietário. A captura não vale como aceite por si.

**Quando justificar automação:** (a) fila de áudio e provider único; (b) links de música/seleção; (c) segurança, upload, posse de dados e submissão de orçamento. Apenas testes focados em riscos reais, portados seletivamente ou escritos depois de encontrar a falha. Nenhum agente pode criar automaticamente 50 novos testes nem tornar o CI visual um gate estético. Segurança e integridade continuam obrigatórias.

**Definition of Done para página:** conteúdo definido, componente usando tokens, mobile e desktop renderizados, links funcionando, imagens reais disponíveis, sem controles fantasmas, console/rede sem erro relevante, continuidade de áudio preservada, aprovação visual do proprietário registrada. CI verde sozinho **não** é Done.

**Mudança de escopo:** se o agente precisar de novo componente, biblioteca, token, animação, rota, seção ou serviço, registrar necessidade e aguardar decisão; não improvisar. O número de arquivos nunca justifica criar um processo paralelo ou testes redundantes.

---

## 11. Sequência de implementação em PRs pequenos

| Entrega | Escopo exato | Pré-requisito | Critério de aceite |
|---|---|---|---|
| `PR-00` Fundação | Repo novo privado, Next/TS/pnpm, CSS global, tokens V1, README, env.example, preview separado | Aprovação do plano | Página-raiz técnica renderiza; nenhuma cópia do shell antigo; nenhum deploy público |
| `PR-01` Shell e controles | `SiteShell`, `SiteHeader`, `SiteNav`, `ActionLink`, `ActionButton`, `IconButton`; layout split/mobile e estados vazios de layout só em preview | PR-00 + direção visual | Capturas confirmam 70/30, header 72/60, botões iguais, mobile sem scroll lateral |
| `PR-02` Home visual | `HomeHero`, foto aprovada, copy definida, hero responsivo, CTAs; visual da Rádio ainda não chamado de funcional | PR-01 + imagem/copy aprovadas | Home desktop/mobile visualmente aceita; sem inventar cartões/ícones/efeitos |
| `PR-03` Migração do núcleo Rádio | Dependências transitivas do provider, queue, R2/catalog, 343 publicações, API/OG/lyrics/visualizer, um `<audio>` persistente | PR-00, em branch isolada | Áudio e metadados reais, fila/seek/volume sem reset entre rotas |
| `PR-04` UI Rádio e Home completa | Painel, busca/A seguir, controles, dock/fullscreen, mini mobile, link de música; conectar PR-02/03 | PR-02 + PR-03 | Desktop/mobile renderizado; áudio contínuo; aprovado visualmente. **Primeiro grande marco.** |
| `PR-05` Orçamento | UI 3 etapas + backend seguro reaproveitado; envio real/confirmado e tratamento de erros | PR-04 + destino/Supabase validado | Pedido chega corretamente; sem falso sucesso, upload seguro |
| `PR-06` Produtos | Catálogo real dos 9 itens, listagem, detalhe, imagens e links Shopee | PR-04, padrões estáveis | Todos os links verificados e imagens conferidas; sem dados inventados |
| `PR-07` Mídia e Impressões | Inventário editorial R2, galeria 8 colunas wide, viewer único, carousel ligado ao mesmo catálogo | PR-04, imagens/autorização | Proporção preservada, fotos abrem, CTA correto, desempenho de thumbs aceitável |
| `PR-08` Hub e editorial | Hub (4 destinos), O Estúdio, Materiais e serviços Placas/Caixas/Sob demanda com conteúdo real | PR-05/06/07 | Não repete carrossel; mesma identidade; nenhuma página vazia |
| `PR-09` Preparação pública | SEO completo, analytics sem PII, sitemap, canonical, revisão final de rotas, links e desempenho, plano de cutover | PR-04 a 08 aprovados | Checklist público aprovado; domínio antigo intacto até ordem explícita de publicação |

**Regra de paralelismo:** PR-02 (Home visual) e PR-03 (Rádio core) podem avançar em branches separadas após PR-00, mas só PR-04 une os dois. Nenhuma frente de página comercial inicia enquanto o primeiro marco Home + Rádio não estiver aceito, salvo correções críticas de infraestrutura explicitamente autorizadas. PR-06 e PR-07 podem ser reordenados somente por decisão do proprietário; sua implementação não cria redesign independente.

**Regra de merge:** cada PR deve declarar arquivos alterados, comportamento entregue, screenshots conferidas, testes realmente executados/não executados e estado de aprovação. Nenhum PR de conteúdo visual vai para `main` apenas porque compilou. **Nenhum deploy de produção ou alteração de domínio automática.**

---

## 12. Critérios de rejeição imediata

Reprovar a entrega quando houver: fonte diferente das duas definidas; texto cinza fino; nova cor/gradiente arbitrário; HTML com link social falso; botão de orçamento sem destino real na publicação; imagem da X1/peça falsa ou espelhada; Rádio duplicada; área preta por imagem que não carregou; CTA mobile desalinhado; modal que não respeita proporção; card genérico preenchendo espaço; `/studio` gerado de dentro do shell por pathname; CSS antigo copiado como base; novo teste de classe CSS; campos de orçamento que declaram envio sem submissão confirmada; violação de privacidade; mudança de layout sem captura e revisão.

---

## 13. Handoff para o PRIMEIRO agente

**Tarefa inicial, após aprovação:** executar APENAS `PR-00` e preparar os componentes fundamentais do `PR-01`, sem copiar Rádio, sem criar páginas comerciais. Conferir nome disponível do novo repositório; criar estrutura, instalar stack decidida, copiar `tokens.css` proposto, definir as fontes, configurar preview não indexável. Nenhum framework visual, nenhuma suíte de testes, nenhum Vercel production.

**Depois:** apresentar captura estrutural do shell nas larguras indicadas; aprovação explícita antes de construir o hero. `PR-02` só começa com composição e foto aprovadas. Quando a Home visual estiver aprovada, migrar o motor pelo `PR-03` e fechar a experiência no `PR-04`.

**Próximas decisões exclusivas do proprietário:** aprovar/ajustar este sistema visual V1; escolher a imagem final da Home; aprovar o texto-base da Home; confirmar os links externos; confirmar destino comercial/triagem do orçamento antes do `PR-05`.

```yaml
artifact_ref: CM_3D_RADIO_PLANO_MESTRE_RECONSTRUCAO_V1.md
approved_by: pending
ready_for_frontend: no
source_repo: cassianomangini/radioand3d
source_sha: b469c565062217b51a5c8ff18e6ba1eabf574f8c
target_repo_proposal: cassianomangini/cm-3d-radio-v2
first_milestone: Home + Radio real, desktop/mobile, visualmente aprovados
production_deploy_authorized: false
```

**Síntese operacional:** construímos um produto novo usando dados, arquivos e lógica útil do antigo. A Home determina a identidade real. A Rádio migra como motor, não como o shell problemático. Só depois entram fluxos comerciais, galeria e páginas editoriais. Sem decisões visuais soltas delegadas ao agente, sem criar testes por reflexo e sem declarar qualidade a partir de CI verde.
