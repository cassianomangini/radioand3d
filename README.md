# CM 3D and Radio

Catálogo das criações em impressão 3D de Cassiano e experiência musical CM Radio, com player pequeno e grande compartilhando a mesma reprodução.

## Estado do código

A Home Estúdio + Rádio está na `main` e usa o catálogo real da rádio no ambiente local configurado. Em 05/10/2026 Cassiano aceitou a passagem da Rádio, as barras e a entrada então existente do Estúdio. A frente aberta é o crescimento público do Estúdio. O site ainda não foi lançado. O estado está no [roadmap](docs/ROADMAP.md).

### Ambiente local

- Node.js 22
- pnpm 10

```bash
pnpm install
pnpm dev
```

Verificações:

```bash
pnpm lint
pnpm typecheck
pnpm build
```

### Laboratório de composição (apenas desenvolvimento)

Abra `/dev/visual-lab` com `pnpm dev` para reproduzir três **fixtures técnicos de composição** (Editorial, Mostruário e Detalhe), sem alterar as páginas públicas. **Esses três estudos foram rejeitados como direção artística em 09/10/2026**, pois não respeitam adequadamente a identidade e o shell CM existentes; não pedir escolha/aprovação entre eles. O estudo real está na [Auditoria da identidade visual do site](docs/design/CM_SITE_VISUAL_IDENTITY_AUDIT_V1.md). A rota deve responder **404** em `pnpm start`/produção e no preview Vercel. O protótipo usa `motion/react` apenas para troca entre variantes, incluindo movimento reduzido; os espaços de fotografia são honestamente sinalizados como pendentes.

A CI `[visual]` valida a proteção da rota e renderiza os três casos de teste em desktop/mobile. Imagens geradas nesse lab **não são candidatas atuais ao design do site**; servem somente para QA até termos novo conceito fiel à identidade CM. [Brief do laboratório](docs/design/CM_VISUAL_LAB_V1.md) · [Registro de referências/baselines](docs/design/CM_VISUAL_REFERENCE_REGISTER_V1.md).

### Nova evolução planejada da Rádio: dock na navbar

Em 09/10/2026, foi pedido um modo desktop no qual **empurrar a Rádio lateral para a direita** a faz **subir para a navbar como player pequeno imediatamente antes dos botões de redes sociais**, liberando o Estúdio e mantendo o menu principal centralizado; ela retorna por botão no header ou novo arraste da borda direita para a esquerda. Contrato: [CM Radio Navbar Dock V1](docs/design/CM_RADIO_NAVBAR_DOCK_V1.md) · [checklist 03c](docs/work/03c-radio-navbar-dock.md). **Protótipo técnico** em `/dev/radio-dock` somente no `pnpm dev`: importa o shell CM real e testa movimento reversível, mas **o mini atual não traduz adequadamente o player da Landing Artesópolis** (faltam anterior/próxima e visualizer sincronizado; acabamento e escala insuficientes). [Correção D4.1/D4.2 no checklist](docs/work/03c-radio-navbar-dock.md). É necessário refazer a prévia e renderizá-la antes de solicitar D5. Não houve integração na Rádio pública.

### QA visual renderizado (ferramentas de desenvolvimento)

O projeto mantém `scripts/capture-radio-states.mjs`/CDP para a Rádio e adiciona diagnósticos com Playwright Test. As bibliotecas `motion`, `@playwright/test` e `@axe-core/playwright` estão versionadas no lockfile; instalar ferramentas **não** modifica a aparência das páginas.

```bash
pnpm install --frozen-lockfile
pnpm visual:qa
```

O visual runner usa o **Google Chrome** instalado (`channel: chrome`) e inicia `pnpm dev` localmente. Na CI, após `pnpm build`, usa `pnpm start`. Captura Home, Estúdio, Orçamento e Produto em cinco perfis de tela e anexa inventário inicial de acessibilidade. **Não gera/aprova baselines automaticamente** nem substitui comparação humana com o mock aprovado. Resultados e pendências: [08V](docs/work/08-visual-quality-evolution.md) e [pipeline](docs/design/CM_VISUAL_RENDER_PIPELINE_V1.md).

### Catálogo da rádio no R2

O ambiente local configurado lê as 343 músicas do bucket R2 `musicas`. Para configurar outra máquina, copie `.env.example` para `.env.local`, preencha as credenciais S3 **somente de leitura** e defina `RADIO_CATALOG_SOURCE=r2`. A URL `R2_S3_ENDPOINT` termina em `r2.cloudflarestorage.com`; `musicas` fica em `R2_BUCKET`, sem repetir o nome do bucket no endpoint. Não coloque credenciais no repositório nem no navegador.

O servidor percorre todas as páginas do bucket e inclui todos os objetos de áudio, inclusive nomes com `(1)`. O navegador recebe apenas os títulos e as URLs públicas para reprodução. A lista do bucket é a fonte deste piloto; a biblioteca editorial e o Music Inbox ainda precisam do contrato próprio. O endereço `r2.dev` serve para desenvolvimento. A produção precisa de um domínio próprio conectado ao bucket.

A rota `/dev/foundation` existe somente fora de produção para validar tokens e primitivas reais sem transformar essa vitrine na página pública.

## Comece aqui

1. [Plano do produto](docs/PROJECT_PLAN.md): escopo, decisões e limites.
2. [Plano de crescimento do Estúdio](docs/STUDIO_GROWTH_PLAN_V1.md): Impressões, Orçamento, Produtos, serviços prioritários e aquisição.
3. [Handoff comercial do Estúdio](docs/design/STUDIO_COMMERCE_EXPERIENCE_V1.md): composição, mídia, formulário, Shopee, mobile e gate antes do frontend.
4. [Wireframes comerciais](docs/design/STUDIO_COMMERCE_WIREFRAMES_V1.md): disposição funcional desktop/mobile de Hub, Placas, Orçamento e Produto.
5. [Inventário de mídia](docs/design/STUDIO_MEDIA_INVENTORY_V1.md): assets existentes, referências conhecidas e fotos/diagramas ainda necessários.
6. [Search Discovery do Estúdio](docs/STUDIO_SEARCH_DISCOVERY_V1.md): crawling, indexação, canonical, sitemap, imagens, schema, Search Console e gate de lançamento.
7. [Fluxo de Orçamento](docs/STUDIO_QUOTE_FLOW_V1.md): qualificação progressiva antes de contato manual.
8. [Roadmap](docs/ROADMAP.md): estado real, dependências e próxima entrega.
9. [Evolução visual e Visual QA — 08V](docs/work/08-visual-quality-evolution.md): auditoria, plano, critérios de qualidade e checklist de execução com evidências.
10. [AGENTS.md](AGENTS.md): como trabalhar sem duplicar decisões ou atropelar outra área.

## Mapa da documentação

| Documento | Responsabilidade exclusiva |
| --- | --- |
| [Receitas visuais CM](docs/design/CM_VISUAL_RECIPES_V1.md) | Casos de uso reais, limites de arte/assets e inventário de referências |
| [Auditoria da identidade visual CM](docs/design/CM_SITE_VISUAL_IDENTITY_AUDIT_V1.md) | Referências do site real, paleta/fontes implementadas, marcas, layout e bloqueio de estudos genéricos |
| [Pipeline visual render-first](docs/design/CM_VISUAL_RENDER_PIPELINE_V1.md) | Decisão de renderer, bibliotecas avaliadas, revisão visual e critérios de evidência |
| [Skill de experiência CM versionada](.github/skills/cm-3d-radio-experience/SKILL.md) | Direção visual do Estúdio e Rádio sincronizada com os contratos atuais; ZIP distribuído separadamente para atualização da skill instalada |
| [Arquitetura](docs/ARCHITECTURE.md) | Stack, módulos, segurança, infraestrutura e estratégia de frontend |
| [Experiência CM](docs/EXPERIENCE.md) | Identidade, movimento, responsividade e aprovação visual |
| [Catálogo 3D](docs/CATALOG_3D.md) | Peças, materiais, cores, disponibilidade, portfólio e separação entre prova, serviço e produto |
| [Plano de crescimento do Estúdio](docs/STUDIO_GROWTH_PLAN_V1.md) | Três pilares, páginas comerciais prioritárias, aquisição e fases S1 |
| [Handoff comercial do Estúdio](docs/design/STUDIO_COMMERCE_EXPERIENCE_V1.md) | Composição, inventário de mídia, orçamento, produtos/Shopee e bloqueio visual antes do frontend |
| [Wireframes comerciais](docs/design/STUDIO_COMMERCE_WIREFRAMES_V1.md) | Ordem, peso e recursos das superfícies principais em desktop/mobile |
| [Inventário de mídia](docs/design/STUDIO_MEDIA_INVENTORY_V1.md) | Assets existentes, referências, mídia faltante e bloqueios de fotografia/diagramas |
| [Search Discovery do Estúdio](docs/STUDIO_SEARCH_DISCOVERY_V1.md) | Contrato técnico de SEO/Search baseado em documentação oficial |
| [Fluxo de Orçamento](docs/STUDIO_QUOTE_FLOW_V1.md) | Wizard, anexos, triagem, analytics e continuidade por contato |
| [Infra Supabase CM](docs/SUPABASE_INFRASTRUCTURE_V1.md) | Projeto Supabase CM em São Paulo, schema/bucket/limites aplicados; quatro rotas de Orçamento e rota interna de retenção em código; CI/SQL mockados verdes, intake desativado; TUS real, remoção física, smoke, secrets e Cron pendentes |
| [Checklist E2](docs/work/08-supabase-provisioning.md) | Execução verificável de provisionamento e segurança sem detalhes privados do ambiente legado |
| [Checklist 08](docs/work/08-studio-growth.md) | Execução do Estúdio sem interferir no motion spine da Rádio |
| [Biblioteca musical](docs/MUSIC_PIPELINE.md) | Importação, versões, publicação, permissões e acervo antigo |
| [Rádio](docs/RADIO.md) | Reprodução, fila, mini/full player e visualizador |
| [Auditoria do legado](docs/REUSE_AUDIT_ARTESOPOLIS_LANDING.md) | Evidências e limites do reaproveitamento |
| [Modelo de entrega](docs/work/TEMPLATE.md) | Checklist de execução, evidências e retomada |

Os perfis em `.github/agents/` são instruções versionadas. Serviços de banco, storage, autenticação e deploy não são provisionados por este bootstrap.


### Análise musical do visualizador

O visualizador usa sidecars pré-calculados para separar voz do acompanhamento e sincronizar todas as barras pelo mesmo `currentTime` do player. O FFT ao vivo permanece apenas como fallback para alguma faixa ainda sem sidecar.

O **R2 continua sendo a fonte canônica das 343 faixas**, mas o processamento pesado não baixa as músicas. Ele reconcilia o catálogo do R2 com a pasta local que contém os mesmos arquivos e usa esses arquivos locais como entrada do Demucs.

Configure uma vez no `.env.local`:

```bash
RADIO_LOCAL_AUDIO_DIR=D:\Músicas\radio artesopolis
```

Depois o lote completo é um único comando:

```bash
pnpm visualizer:sync
```

Também é possível informar a pasta diretamente:

```bash
pnpm visualizer:sync -- "D:\Músicas\radio artesopolis"
```

Na primeira execução, o comando cria automaticamente o ambiente Python em `output/radio-visualizer/.venv` e instala Demucs, librosa, FFmpeg e o cliente R2. Depois ele:

1. lê **todo** o catálogo de áudio diretamente do bucket R2;
2. varre a pasta local e reconcilia cada item do R2 por caminho/nome, aceitando fallback por basename apenas quando ele é único;
3. confere o tamanho do arquivo local contra o objeto correspondente no R2 e aborta antes do processamento se houver falta, ambiguidade ou divergência;
4. verifica quais sidecars já existem e ainda correspondem ao ETag/tamanho/configuração atuais;
5. processa cada áudio **diretamente da pasta local**, sem baixar música do R2;
6. separa o stem vocal e preserva os stems não vocais do Demucs durante a análise; baixo e bateria mantêm envelopes próprios e o stem `other` combina sustentação harmônica com ataques reais de notas/acordes para dar presença a piano, guitarra, synths, cordas e outros instrumentos sem inventar sua identidade;
7. publica imediatamente o sidecar pronto em `_analysis/v3/<sha256-do-track-id>.json`;
8. segue para a próxima faixa.

O relatório de reconciliação fica em `output/radio-visualizer/reconciliation.json`. O lote é retomável: se a máquina parar no meio, execute `pnpm visualizer:sync` outra vez; sidecars válidos já publicados no R2 são ignorados e apenas as faixas pendentes são processadas novamente.

A execução usa as credenciais de leitura já usadas pelo catálogo e uma credencial de escrita restrita a `_analysis/v3/*`, configurada em `R2_VISUALIZER_WRITE_ACCESS_KEY_ID` e `R2_VISUALIZER_WRITE_SECRET_ACCESS_KEY`. Essas credenciais são somente do comando local e nunca entram no frontend.

Use `--force` somente quando for necessário regerar todas as análises após uma mudança deliberada no algoritmo/configuração.
