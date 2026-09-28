# Arquitetura e infraestrutura

## Situação das decisões

Este documento orienta a entrega 01. A stack abaixo é proposta, ainda não instalada. Registre aqui a escolha, justificativa e versão efetiva antes de criar dependências.

| Camada | Proposta inicial | Validação necessária |
| --- | --- | --- |
| Aplicação | Next.js App Router, React e TypeScript estrito; repositório único modular | Compatibilidade e versões mantidas na data do bootstrap |
| Estilo e movimento | Tokens próprios, CSS/Tailwind e Motion quando necessário | Aprovação visual e orçamento de desempenho |
| 3D em tempo real | Three.js/React Three Fiber apenas para interação aprovada | Modelo publicável, fallback e custo no mobile |
| Pacotes | pnpm, Node suportado e lockfile versionado | Fixar versões no setup e CI |
| Metadados | Banco relacional com migrations | Fornecedor, autenticação e operação local a decidir |
| Mídia | Object storage; R2 é candidato por existir no legado | Alvos CM, acesso privado, CORS e entrega pública |
| Aplicação hospedada | Vercel é candidata | Conta, plano, domínio e permissões a confirmar |

Não criar microserviços, monorepo ou infraestrutura de processamento distribuído antes de uma necessidade medida. O detalhamento do upload pode exigir processamento fora da requisição; decidir o menor mecanismo que respeite os limites reais do ambiente.

## Módulos propostos

Estrutura planejada, não diretórios já existentes. A entrega 02 cria o necessário ao setup; a base visual entra na 03b após aprovação da 03.

```text
src/app/                 rotas, layouts e composição
src/features/catalog/    catálogo, materiais e apresentação 3D
src/features/music/      biblioteca, importação e publicação
src/features/radio/      reprodução, fila, análise e interfaces
src/components/ui/       primitivas visuais compartilhadas
src/components/layout/   container, seções e alinhamento comuns
src/components/motion/   presets e composições reutilizadas
src/styles/tokens.css    valores e papéis visuais canônicos
src/server/              autorização, repositórios e adapters externos
src/config/              configuração validada, sem segredos no cliente
tests/                   testes de integração e navegação
```

Rotas propostas: `/`, `/pecas`, `/pecas/[slug]`, `/materiais`, `/clientes`, `/radio` e `/gestao/musicas`. Confirmar na entrega 01. A navegação pública deve compartilhar o layout persistente da rádio. A gestão é uma área privada, não a exposição do Admin operacional.

Server Components por padrão para leitura e composição. Interatividade e áudio em componentes cliente delimitados. O provider persistente não deve transformar toda a aplicação em código cliente nem ser recriado por mudança de rota ou modo do player. Layouts compartilhados preservam estado na navegação interna: [Next.js layouts](https://nextjs.org/docs/app/getting-started/layouts-and-pages). A fronteira deve manter código estático fora do bundle interativo: [Server e Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components).

Contratos próprios: [rádio](RADIO.md), [biblioteca](MUSIC_PIPELINE.md) e [catálogo](CATALOG_3D.md). Consumidores públicos recebem dados explicitamente publicáveis, não registros internos completos. Compartilhar tipos não substitui validação de entrada no servidor.

## Estratégia de frontend

### Tokens e estilos

[EXPERIENCE.md](EXPERIENCE.md) define intenção, famílias e aprovação. Após aprovação, `src/styles/tokens.css` será a fonte dos valores visuais. Organizar valores-base, aliases semânticos e overrides de componente somente quando necessários. Exemplos de nomes: `--surface-page`, `--surface-panel`, `--text-primary`, `--text-secondary`, `--action-primary`, `--focus-ring`, `--space-control-gap` e `--radius-panel`.

Componentes consomem papéis semânticos, não escolhem cores da paleta-base. Integrar a mesma fonte ao CSS/Tailwind; no Tailwind v4, avaliar `@theme`/`@theme inline` para mapear os aliases sem duplicar valores. Referência: [Theme variables](https://tailwindcss.com/docs/theme). Preservar tokens exigidos por canvas/motion mesmo quando não gerarem uma utility usada no HTML.

Definir famílias de movimento na mesma escala canônica. Presets reutilizam os valores por um adaptador, em vez de espalhar durações, curvas e springs divergentes por cada componente. Escolher a implementação simples na 03b; não criar um framework de tokens antes de precisar.

Valores estáticos recorrentes de marca, texto, espaço, borda e sombra devem usar tokens. Exceções legítimas: cor real de filamento, capa, porcentagem de progresso, dimensão medida e geometria de visualizador. Essas entradas continuam validadas e não se tornam regras globais. Novo valor visual compartilhado exige revisão da fonte canônica.

Manter estilos de base no global; estilos de domínio junto do domínio. Utility classes podem compor layout, sem centenas de variantes visuais locais. Evitar `!important` corretivo e overrides em cascata para compensar uma primitiva inadequada.

### Componentes e composição

| Nível | Exemplos iniciais | Limite |
| --- | --- | --- |
| Layout | Container, Section, Stack e agrupamentos de ações | Grade e ritmo, não enquadrar toda seção como cartão |
| Primitivas | Button, IconButton, Field, SearchInput, Slider, Dialog e estados de feedback | Sem regra de estoque, faixa ou publicação |
| Catálogo | ProductCard, ProductGallery, MaterialSwatch e AvailabilityLabel | Fotos, opções e disponibilidade do contrato 3D |
| Rádio | TrackRow, TransportControls, MiniPlayer e FullPlayer | Consomem o mesmo controller; não criam outro áudio |
| Gestão musical | UploadBatch, ImportItem e revisão/publicação | Fluxo privado, com falha e retomada por arquivo |

Inventário é vocabulário, não lista obrigatória de arquivos. Implementar apenas componentes usados pelo recorte aprovado. Uma nova abstração deve representar responsabilidade ou repetição real, não uma hipótese de reuso futuro.

Definir API curta e tipada, variantes nomeadas e estados. Separar hierarquia visual (`primary`, `secondary`, `quiet`) de estado (`loading`, `disabled`, `selected`). Reutilizar comportamento, sem forçar ProductCard e TrackRow a serem o mesmo componente com dezenas de flags. Usar HTML semântico antes de widgets customizados.

Escolher no máximo uma base headless para interações complexas, se necessária; avaliar Radix como candidata, preservando aparência própria. Ela oferece primitivas sem estilos e comportamento de acessibilidade, mas a composição final ainda exige testes. Não importar kit de páginas/tema pronto como identidade CM. Referência: [Radix Primitives](https://www.radix-ui.com/primitives/docs/overview/introduction).

Ícones devem vir de uma família coerente, com peso/tamanho consistentes. Nome acessível, teclado, foco, estado e alvo de toque fazem parte do contrato do componente. Nada essencial depende exclusivamente de cor, animação ou tooltip. Sliders devem funcionar sem arrastar; upload admite seletor de arquivos além de drag-and-drop.

### Base visual antes da expansão

A entrega 03b implementa tokens e somente as primitivas/combinações do piloto aprovado. Criar uma vitrine de componentes em ambiente local/preview protegido, usando os componentes reais e todos os estados relevantes. Escolher Storybook ou rota de desenvolvimento conforme o setup, não manter ambos sem necessidade. Não publicar exemplos internos, credenciais ou dados reais privados.

A vitrine mostra componentes lado a lado e em contexto: botão/seleção de material, linha de música, player compacto e item de importação. Ela apoia revisão e regressão, não substitui aprovação de home/produto/rádio renderizados. A mesma implementação entra nas páginas; evitar recriar componentes só para a demonstração.

### Movimento, mídia e desempenho

CSS resolve feedback simples; Motion coordena transições que precisam dele. Não empilhar motores de animação. Carregar visualizador rico, player expandido e 3D sob demanda quando possível. Reservar proporção das imagens, servir tamanho adequado e manter foto/fallback útil enquanto a interação carrega.

Dados do visualizador não disparam rerender de catálogo ou da página inteira a cada frame. Manter análise e renderizador isolados, conforme RADIO. Testar orçamento de trabalho com música tocando, busca ativa, troca de rota e efeitos visíveis em desktop e celular real. Tokens de z-index e layout precisam cobrir player fixo, menus, modal e teclado mobile sem valores arbitrários concorrentes.

### Aceite de frontend

Por componente aplicável: normal, hover, focus-visible, pressionado, selecionado, disabled, loading, empty e error. Testar títulos longos, ausência de mídia e listas reais. Estados automatizados, regressão visual e análise de acessibilidade ajudam a detectar defeitos; beleza e facilidade exigem revisão renderizada contra EXPERIENCE.

Aprovar a base em contexto antes de expandir páginas. Alterar um token ou primitiva compartilhada exige revisar as superfícies consumidoras afetadas. Não marcar UI pronta apenas porque build ou captura isolada passou.

## Segurança e publicação

Acesso público somente a itens publicados. Gestão restrita ao proprietário, com autenticação e autorização no servidor para cada operação. Se houver Data API acessível pelo navegador, também impor permissões e políticas no banco. Não confiar em esconder botões ou em IDs difíceis de adivinhar.

Escritas, uploads e publicação exigem validação, limites, trilha de resultado e tratamento de repetição. URLs fornecidas por importadores não autorizam fetch arbitrário no servidor. Segredos de banco/storage nunca entram no bundle público.

A integração com Artesopolis Admin é opcional. Exige contrato de leitura com lista explícita de campos, alvo autorizado e política de atualização. Não copiar banco, estoque ou clientes para acelerar a demonstração.

## Infraestrutura a preparar

Separar desenvolvimento, preview/teste e produção, incluindo dados e credenciais. O setup local deve funcionar com amostras identificadas e sem segredos de produção. Proibir indexação de previews e proteger gestão; `noindex` não é controle de acesso.

Guardar originais e rascunhos de mídia em área privada. Publicar somente derivados aprovados, conforme o contrato da biblioteca. Se escolher R2 público, usar domínio próprio para produção: `r2.dev` é destinado a desenvolvimento e tem limitação de tráfego. Validar CORS para os domínios autorizados, `GET`/`HEAD`, upload e requisições de intervalos; CORS não torna um arquivo privado. Referências: [R2 público](https://developers.cloudflare.com/r2/buckets/public-buckets/) e [CORS](https://developers.cloudflare.com/r2/buckets/cors/).

Antes da publicação: documentar limites de upload e lote, cache/revalidação, domínio, HTTPS, logs sem dados sensíveis, alertas de erro/custo, backup de metadados, retenção dos originais e procedimento de restauração. Rollback de código não desfaz automaticamente alterações de banco ou arquivos.

A CI da entrega 02 deve validar dependências reproduzíveis, lint, tipos, testes e build. Acrescentar E2E e verificações visuais conforme os fluxos existirem. Não registrar execução de comandos inexistentes. Alterações remotas de infraestrutura exigem autorização e conferência do alvo.
