# Roadmap

## Estado verificado na reorganização

Base da reorganização: `f11aaff2dd96825c468551a1a0cb6c506f7bc824`, em 28/09/2026. Havia cinco arquivos documentais e nenhum aplicativo, schema, workflow de CI ou perfil individual de agente. Não havia PR aberto naquela consulta. A organização acrescentou contratos, perfis e checklists; não implementou o site.

Naquela consulta o repositório retornou `private: false`. A visibilidade deve ser confirmada antes de importar qualquer conteúdo privado. Serviços de hospedagem, banco e storage não foram inspecionados nem provisionados. O refinamento dos padrões de frontend partiu do commit `5c2717d058f6475410ec644d21cfb649099cfaa4`; continua sendo trabalho documental, sem tela ou paleta aprovada.

## Agora

**03, direção visual CM**, foi aprovada por Cassiano. A Home, o catálogo R2, o player, o mini player mobile, o visualizador e o shell responsivo já estão na `main`. Em 02/10 foi aprovada a direção de análise musical offline com voz no centro, acompanhamento ao redor e fallback live honesto. O [plano de movimento](design/CM_MOTION_EXPERIENCE_PLAN_V1.md) define o efeito e seus critérios; a fila de aceite está abaixo. A `main` em `62c2779` contém código para focus/fullscreen, mini -> full mobile, faixa -> Now Playing, visualizador por regiões e rota `/studio`. A transição da Rádio usa FLIP/WAAPI para mover elementos reais entre composições; isso é evidência de implementação, não de resultado percebido.

Em 03/10, Cassiano informou que ainda não vê a transformação visual prometida; o botão de play foi a mudança mais clara. **A Rádio animada e a passagem para tela grande continuam abertas.** Não há aprovação perceptiva registrada para C1. A execução de C1 foi então separada em três gates: **C1.1 Motion Spine** (estado, interrupção, cancelamento e reversão), **C1.2 Signature Radio** (split → focus → fullscreen como uma transformação única e inequívoca) e **C1.3 Motion QA** (abertura, retorno, interrupção, drag, continuidade de áudio e reduced motion). C2–C7 têm código antecipado, mas não avançam como entregas até os gates anteriores. O Estúdio pode evoluir em paralelo desde que não altere a mecânica da Rádio ou o motion spine. As entregas **03b**, **06** e **06b** continuam em andamento; 07 permanece bloqueada pelas dependências formais. Passos e evidências: [03b](work/03b-frontend-foundation.md), [06](work/06-radio-engine.md) e [06b](work/06b-synced-lyrics.md).

## Fila de movimento da Rádio

A fila abaixo é de **aceite perceptivo**, não apenas de implementação. Código existente em uma frente posterior não autoriza pular o gate atual. O objetivo é que cada etapa grande produza uma diferença que Cassiano consiga perceber usando o site.

| Ordem | Frente e entrega | Estado | Saída observável para fechar |
| --- | --- | --- | --- |
| 1 | **C1.1 Motion Spine**, 03b | in_progress | Um único spine controla split/custom/focus/fullscreen; animação em andamento pode ser interrompida e substituída sem salto de estado, timer antigo limpando estado novo ou animações órfãs. C1 e C5 deixam de disputar a mesma responsabilidade. |
| 2 | **C1.2 Signature Radio**, 03b | blocked | Rádio lateral → focus → fullscreen parece uma única transformação grande, rápida e inequívoca. Capa, faixa, visualizador, transporte, fila e letra se recompõem; não pode parecer apenas sidebar ficando larga. |
| 3 | **C1.3 Motion QA**, 03b/09 | blocked | Abrir, voltar, interromper nos dois sentidos, drag lento/rápido, fullscreen por navegação e gesto, seek/troca de faixa durante motion, áudio contínuo e reduced motion passam sem estado fantasma. Só então C1 fecha. |
| 4 | **C2 Freeze do contrato de áudio**, 06 | blocked | Sidecar v3 é validado em faixas vocal, instrumental/harmônica, calma, densa/percussiva, além de seek, silêncio e fallback. Passou: o significado dos dados congela. |
| 5 | **C3 Visualizer final**, 06 | blocked | Expressão visual usa o contrato congelado: voz/bateria/baixo/campo harmônico, attack/release, profundidade e mini player. Problema visual não reabre a semântica do pipeline. |
| P | **S1 Estúdio: aquisição + Search**, 08 | in_progress_parallel | `/studio` evolui para **Impressões, Orçamento e Produtos**, com **Impressão 3D sob demanda** como serviço-base e Placas/Caixas como especialidades prioritárias. Search/SEO entra desde a arquitetura: rotas, metadata, canonical, sitemap, imagens, performance e Search Console. Preservar Rádio persistente e não alterar C1. [checklist](work/08-studio-growth.md) |
| 6 | **C4 Interface viva da Rádio**, 03b/07 | blocked | Seleção → Now Playing, troca de faixa, metadata, controles, buffering/error, teclado/touch e respostas táteis parecem partes do mesmo software vivo. |
| 7 | **C5 Física de manipulação direta**, 03b/07 | blocked | C5 não recria fullscreen. Fica restrito à física do divisor: drag, magnetismo, snap, flick, thresholds, resistência/retorno e recomposição contínua enquanto a mão move o painel. |
| 8 | **C6 Assinatura mobile**, 03b/07 | blocked | Mini player → Rádio completa → mini parece transformação do mesmo produto, preservando touch, scroll, rotação e estado. |
| 9 | **C7 Acabamento high-fidelity**, 03b/07 | blocked | Busca, seek, volume, tooltips, foco, disabled/loading/error, scroll e famílias de controles atingem o mesmo nível das cenas maiores. |
| 10 | **C8 QA integrado**, 09 | blocked | Desktop amplo/estreito, limite do split, mobile, playing/paused/buffering, título longo, lista grande, músicas de perfis diferentes, drag, fullscreen, navegação e reduced motion passam com áudio + motion simultâneos. |

### Regra de prioridade

O caminho crítico perceptivo é **C1.1 → C1.2 → C1.3 → C2 → C3 → C4 → C5 → C6 → C7 → C8**. O Estúdio segue em paralelo apenas quando o trabalho não interfere nesse caminho. Três mudanças grandes seguidas sem ganho visível para Cassiano são sinal de desvio: parar e revisar antes de continuar.

## Frente paralela S1 — Estúdio

Plano canônico: [STUDIO_GROWTH_PLAN_V1.md](STUDIO_GROWTH_PLAN_V1.md)

Contratos:
- [Search Discovery](STUDIO_SEARCH_DISCOVERY_V1.md)
- [Fluxo de Orçamento](STUDIO_QUOTE_FLOW_V1.md)
- [Catálogo 3D](CATALOG_3D.md)
- [Checklist 08](work/08-studio-growth.md)

Sequência interna: **S1.0A contrato/documentação → S1.0B gate de experiência → S1.1 fundação Search/rotas → S1.2 hub → S1.3 Impressões → S1.3B Impressão 3D sob demanda → S1.4 Placas → S1.5 Caixas → S1.6 Orçamento → S1.7 Produtos → S1.8 gate de lançamento → S1.9 crescimento por dados**.

Essa sequência não altera a fila C1–C8 da Rádio. Se uma etapa do Estúdio exigir mudança no motion spine, física do divisor ou semântica do áudio, ela deixa de ser paralela e precisa ser coordenada.

O frontend visual do Estúdio está bloqueado pelo handoff [STUDIO_COMMERCE_EXPERIENCE_V1.md](design/STUDIO_COMMERCE_EXPERIENCE_V1.md), atualmente com `ready_for_frontend: no`. Infraestrutura/Search independente pode avançar sem cristalizar o layout.

## Sequência única

| ID | Entrega | Responsável principal | Dependências | Estado | Saída verificável |
| --- | --- | --- | --- | --- | --- |
| 00 | Revisar e organizar documentação | CM Planning | Nenhuma | done | Contratos separados, perfis, links e inconsistências revisados; commit da reorganização |
| 01 | Fechar base técnica e material piloto | CM Planning | 00 | in_progress | Stack local delimitada; serviços, privacidade efetiva e material piloto continuam pendentes; [checklist](work/01-base.md) |
| 02 | Criar aplicação e verificações mínimas | CM Infra | 01: stack local | in_progress | App Router, lockfile, lint, tipos, build e CI em PR; integrações externas ficam fora deste recorte; [checklist](work/02-bootstrap.md) |
| 03 | Fechar contrato visual Estúdio + Rádio | CM Experience | Requisitos do produto | done | Handoff desktop/mobile com referência, grid, split da rádio, mini player somente mobile, tokens, estados e motion aprovado por Cassiano; [checklist](work/03-experience.md) |
| 03b | Construir base visual compartilhada | CM Frontend | 02 + 03 | in_progress | Shell persistente, Home + rota /studio, shared route transitions, divisor/focus, mobile e microinterações em implementação; revisão perceptiva de Cassiano ainda aberta; [checklist](work/03b-frontend-foundation.md) |
| 04 | Biblioteca e ingestão seguras | CM Data | 02 + decisões de dados/serviços da 01 | blocked | Modelo, autorização, importação e publicação testados por serviço/API, incluindo falhas e rascunhos |
| 05 | Music Inbox utilizável | CM Frontend | 03b + 04 | blocked | Upload em lote, revisão e publicação de três a cinco faixas reais sem JSON manual |
| 06 | Motor de rádio e análise isolados | CM Audio | 02 + contrato de leitura da biblioteca | in_progress | Motor/fila e consumer do visualizador ligados ao catálogo; sidecar por regiões, dynamics/fallback/diagnóstico implementados; sync real e revisão perceptiva de Cassiano pendentes; [checklist](work/06-radio-engine.md) |
| 06b | Sincronizar letras da Rádio | CM Audio | 06 + letras canônicas | in_progress | Pipeline offline áudio + letra → timestamps e painel ligado à posição do player; primeira faixa real e revisão perceptiva pendentes; [checklist](work/06b-synced-lyrics.md) |
| 07 | Rádio CM pronta na interface | CM Frontend | 03b + 04 + 06 | blocked | Desktop com rádio acoplada/redimensionável e expansível; mobile com mini player sob o header e full player sob demanda; seleção, controles, visualizador e sincronização revisados |
| 08 | Estúdio público: aquisição, orçamento e produtos | CM Frontend | 03b | in_progress_parallel | Hub com Impressões/Orçamento/Produtos; Impressão 3D sob demanda; Placas e Caixas; catálogo próprio antes da Shopee; fundação de Search; fluxo de orçamento qualificado; conteúdo real e Rádio persistente. [checklist](work/08-studio-growth.md) |
| 09 | Validar marco Estúdio + Rádio | CM Review | 05 + 07 + 08 + acesso aos ambientes | blocked | Experiência integrada em desktop/mobile, continuidade de áudio, resize/expand, mídia real disponível, privacidade e aprovação visual final |

A entrega 06 não precisa esperar a interface do Inbox: usa o mesmo contrato e fixtures apenas no ambiente de teste. A 03b pode usar estados controlados, sem substituir o motor ou a biblioteca finais. O marco 09 exige a importação real da 05. Não publicar protótipos como produto concluído.

## Bloqueios externos

| Código | Pendência | Quem resolve | O que bloqueia |
| --- | --- | --- | --- |
| E1 | Confirmar repositório privado | Cassiano | Cópia de código, ativos ou dados privados |
| E2 | Aprovar fornecedores, autenticação, alvo e orçamento | Cassiano + CM Infra | Escritas em serviços remotos e preview integrado |
| E3 | Selecionar faixas, peça, fotos e permissões de uso | Cassiano + CM Planning | Dados reais do marco, sem impedir provas locais |
| E4 | Aprovar logo e direção visual | Cassiano + CM Experience | Implementação visual final |
| E5 | Definir origem/atualização dos dados 3D e contato | Cassiano + CM Data | Catálogo real e chamadas comerciais |

## Regras de manutenção

Somente este roadmap guarda sequência e estado macro, inclusive C1–C8. O checklist da entrega guarda passos e evidências, sem outra cópia de status. Dependência bloqueada não autoriza pular para implementação posterior. Um bloqueio localizado não impede trabalho independente fora da fila de movimento.

Ao abrir uma entrega posterior, criar seu checklist a partir de [TEMPLATE.md](work/TEMPLATE.md), acrescentar o link à tabela e confirmar que o escopo ainda cabe em uma revisão. Depois do marco 09, priorizar expansão do catálogo e da rádio conforme uso; não abrir antecipadamente tarefas para toda possibilidade futura.

## Correções preservadas

Decisões e estrutura precedem implementação. Player grande pertence à primeira experiência. Pipeline não especifica também a UI de reprodução. Publicação distingue música e versão. Leitura estática não comprova funcionamento do legado. Agora a base visual tem entrega própria antes da expansão das interfaces, para evitar tokens e componentes diferentes por agente. Não houve teste de áudio, build da aplicação, aprovação de tela ou deploy nestas alterações documentais.
