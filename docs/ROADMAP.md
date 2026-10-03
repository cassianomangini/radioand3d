# Roadmap

## Estado verificado na reorganização

Base da reorganização: `f11aaff2dd96825c468551a1a0cb6c506f7bc824`, em 28/09/2026. Havia cinco arquivos documentais e nenhum aplicativo, schema, workflow de CI ou perfil individual de agente. Não havia PR aberto naquela consulta. A organização acrescentou contratos, perfis e checklists; não implementou o site.

Naquela consulta o repositório retornou `private: false`. A visibilidade deve ser confirmada antes de importar qualquer conteúdo privado. Serviços de hospedagem, banco e storage não foram inspecionados nem provisionados. O refinamento dos padrões de frontend partiu do commit `5c2717d058f6475410ec644d21cfb649099cfaa4`; continua sendo trabalho documental, sem tela ou paleta aprovada.

## Agora

**03, direção visual CM**, foi aprovada por Cassiano. A Home, o catálogo R2, o player, o mini player mobile, o visualizador e o shell responsivo já estão na `main`. Em 02/10 foi aprovada a direção de análise musical offline com voz no centro, acompanhamento ao redor e fallback live honesto. O [plano de movimento](design/CM_MOTION_EXPERIENCE_PLAN_V1.md) define o efeito e seus critérios; a fila de aceite está abaixo. A `main` em `62c2779` contém código para focus/fullscreen, mini -> full mobile, faixa -> Now Playing, visualizador por regiões e rota `/studio`. A transição da Rádio usa FLIP/WAAPI para mover elementos reais entre composições; isso é evidência de implementação, não de resultado percebido.

Em 03/10, Cassiano informou que ainda não vê a transformação visual prometida; o botão de play foi a mudança mais clara. **A Rádio animada e a passagem para tela grande continuam abertas.** Não há aprovação perceptiva registrada para a versão `62c2779`. O próximo gate é C1, com revisão da Rádio em execução real por Cassiano. C2–C7 têm código antecipado, mas não avançam como entregas até os gates anteriores. As entregas **03b**, **06** e **06b** continuam em andamento; 07 permanece bloqueada pelas dependências formais. Passos e evidências: [03b](work/03b-frontend-foundation.md), [06](work/06-radio-engine.md) e [06b](work/06b-synced-lyrics.md).

## Fila de movimento da Rádio

Os IDs C1–C8 são frentes do plano de movimento, subordinadas às entregas 03b/06/07/09. A ordem abaixo é a fila de **aceite**, mesmo onde já existe código adiantado. Não marcar uma frente `done` por commit, CI ou captura estática. Uma rejeição perceptiva volta à frente correspondente antes de abrir a seguinte. Mobile, acessibilidade e desempenho são verificados em cada frente, sem esperar C6/C8.

| Ordem | Frente e entrega | Estado | Evidência atual | Próximo gate |
| --- | --- | --- | --- | --- |
| 1 | C1 Motion Core, 03b | in_progress | FLIP/WAAPI em `62c2779`; inventário técnico no [registro de 03/10](design/CM_MOTION_IMPLEMENTATION_LOG_2026-10-03.md). Cassiano ainda não percebeu a mudança esperada. | Cassiano conferir split → focus → tela inteira e retorno no código atualizado, com capa, visualizador, controles e fila se recompondo visivelmente; registrar defeitos concretos e corrigir até aprovação. |
| 2 | C2 Contrato de movimento do áudio, 06 | blocked | Consumer por regiões e ferramenta de inspeção implementados. | Após C1, validar sidecars v3 reais gerados pelo sync em faixas de perfis diferentes, com seek, silêncio e fallback. |
| 3 | C3 Visualizador 2.0, 06 | blocked | Voz central, acompanhamento e fallback implementados no código. | Após C2, Cassiano ouvir e comparar música vocal, instrumental, calma e densa; ajustar até as barras expressarem esses eventos sem movimento inventado. |
| 4 | C4 Interface viva da Rádio, 03b/07 | blocked | Troca de faixa, estados reais, fila e controles táteis implementados. | Após C3, revisar seleção → Now Playing, transporte, erros, toque e teclado como experiência perceptível e coerente. |
| 5 | C5 Split/focus/divisor, 03b/07 | blocked | Drag, snap e estados de largura implementados. | Após C4, validar recomposição durante o arraste e a expansão, limiar de tela inteira, retorno e continuidade do áudio. |
| 6 | C6 Assinatura mobile, 03b/07 | blocked | Mini → full → mini implementado. | Após C5, Cassiano conferir transformação e retorno em uso mobile, com toque, rotação e scroll. |
| 7 | C7 Acabamento das microinterações, 03b/07 | blocked | Press mecânico, seek, volume e foco implementados parcialmente. | Após C6, revisar famílias de controles, busca, tooltips, scroll e estados de erro/loading. |
| 8 | C8 QA integrado, 09 | blocked | Capturas e verificações técnicas parciais. | Após C1–C7, verificar áudio e movimento simultâneos em desktop/mobile, desempenho, interrupções e aprovação visual final. |

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
| 08 | Entrada do Estúdio de Impressão 3D | CM Frontend | 03b | blocked | Hero e navegação pública do estúdio, preparados para crescimento progressivo; nenhuma seção fictícia exigida e conteúdo real adicionado apenas quando disponível |
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
