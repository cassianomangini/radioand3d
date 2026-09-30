# Roadmap

## Estado verificado na reorganização

Base da reorganização: `f11aaff2dd96825c468551a1a0cb6c506f7bc824`, em 28/09/2026. Havia cinco arquivos documentais e nenhum aplicativo, schema, workflow de CI ou perfil individual de agente. Não havia PR aberto naquela consulta. A organização acrescentou contratos, perfis e checklists; não implementou o site.

Naquela consulta o repositório retornou `private: false`. A visibilidade deve ser confirmada antes de importar qualquer conteúdo privado. Serviços de hospedagem, banco e storage não foram inspecionados nem provisionados. O refinamento dos padrões de frontend partiu do commit `5c2717d058f6475410ec644d21cfb649099cfaa4`; continua sendo trabalho documental, sem tela ou paleta aprovada.

## Agora

**03, direção visual CM**, foi aprovada por Cassiano. A Home da **03b** e a ponte R2 da **06** estão implementadas em PRs com verificações de código aprovadas. A revisão do transporte, volume, ordem aleatória e fila está no PR #8. Cassiano relatou barras paradas durante a música; a correção está no PR #10 em rascunho, com testes de código aprovados e movimento real ainda pendente de conferência. Cassiano ainda precisa revisar a Rádio renderizada em desktop e mobile, ouvir a reprodução e conferir as interações antes de concluir essas entregas; [checklist visual](work/03b-frontend-foundation.md) e [checklist de áudio](work/06-radio-engine.md).

## Sequência única

| ID | Entrega | Responsável principal | Dependências | Estado | Saída verificável |
| --- | --- | --- | --- | --- | --- |
| 00 | Revisar e organizar documentação | CM Planning | Nenhuma | done | Contratos separados, perfis, links e inconsistências revisados; commit da reorganização |
| 01 | Fechar base técnica e material piloto | CM Planning | 00 | in_progress | Stack local delimitada; serviços, privacidade efetiva e material piloto continuam pendentes; [checklist](work/01-base.md) |
| 02 | Criar aplicação e verificações mínimas | CM Infra | 01: stack local | in_progress | App Router, lockfile, lint, tipos, build e CI em PR; integrações externas ficam fora deste recorte; [checklist](work/02-bootstrap.md) |
| 03 | Fechar contrato visual Estúdio + Rádio | CM Experience | Requisitos do produto | done | Handoff desktop/mobile com referência, grid, split da rádio, mini player somente mobile, tokens, estados e motion aprovado por Cassiano; [checklist](work/03-experience.md) |
| 03b | Construir base visual compartilhada | CM Frontend | 02 + 03 | in_progress | Home Estúdio + Rádio, tokens e interações de layout em implementação; revisão renderizada exigida; [checklist](work/03b-frontend-foundation.md) |
| 04 | Biblioteca e ingestão seguras | CM Data | 02 + decisões de dados/serviços da 01 | blocked | Modelo, autorização, importação e publicação testados por serviço/API, incluindo falhas e rascunhos |
| 05 | Music Inbox utilizável | CM Frontend | 03b + 04 | blocked | Upload em lote, revisão e publicação de três a cinco faixas reais sem JSON manual |
| 06 | Motor de rádio e análise isolados | CM Audio | 02 + contrato de leitura da biblioteca | in_progress | Motor e fila ligados localmente às 343 faixas do R2; inventário, tamanhos e URLs validados; escuta e revisão de Cassiano pendentes; [checklist](work/06-radio-engine.md) |
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

Somente esta tabela guarda o estado macro. O checklist da entrega guarda os passos e a evidência, sem outra cópia do roadmap. Dependência bloqueada não autoriza pular para implementação posterior. Um bloqueio localizado não impede trabalho independente.

Ao abrir uma entrega posterior, criar seu checklist a partir de [TEMPLATE.md](work/TEMPLATE.md), acrescentar o link à tabela e confirmar que o escopo ainda cabe em uma revisão. Depois do marco 09, priorizar expansão do catálogo e da rádio conforme uso; não abrir antecipadamente tarefas para toda possibilidade futura.

## Correções preservadas

Decisões e estrutura precedem implementação. Player grande pertence à primeira experiência. Pipeline não especifica também a UI de reprodução. Publicação distingue música e versão. Leitura estática não comprova funcionamento do legado. Agora a base visual tem entrega própria antes da expansão das interfaces, para evitar tokens e componentes diferentes por agente. Não houve teste de áudio, build da aplicação, aprovação de tela ou deploy nestas alterações documentais.
