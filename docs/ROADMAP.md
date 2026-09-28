# Roadmap

## Estado verificado na reorganização

Base da reorganização: `f11aaff2dd96825c468551a1a0cb6c506f7bc824`, em 28/09/2026. Havia cinco arquivos documentais e nenhum aplicativo, schema, workflow de CI ou perfil individual de agente. Não havia PR aberto naquela consulta. A organização acrescentou contratos, perfis e checklists; não implementou o site.

Naquela consulta o repositório retornou `private: false`. A visibilidade deve ser confirmada antes de importar qualquer conteúdo privado. Serviços de hospedagem, banco e storage não foram inspecionados nem provisionados. O refinamento dos padrões de frontend partiu do commit `5c2717d058f6475410ec644d21cfb649099cfaa4`; continua sendo trabalho documental, sem tela ou paleta aprovada.

## Agora

**02, fundação executável**, começa em branch própria com scaffold local, tokens semânticos provisórios e CI. **03, direção visual CM**, continua em paralelo sem autorizar UI final; [checklist](work/03-experience.md). **01** permanece em andamento apenas para serviços, dados piloto e acessos externos. Limite de três entregas simultâneas.

## Sequência única

| ID | Entrega | Responsável principal | Dependências | Estado | Saída verificável |
| --- | --- | --- | --- | --- | --- |
| 00 | Revisar e organizar documentação | CM Planning | Nenhuma | done | Contratos separados, perfis, links e inconsistências revisados; commit da reorganização |
| 01 | Fechar base técnica e material piloto | CM Planning | 00 | in_progress | Stack local delimitada; serviços, privacidade efetiva e material piloto continuam pendentes; [checklist](work/01-base.md) |
| 02 | Criar aplicação e verificações mínimas | CM Infra | 01: stack local | in_progress | App Router, lockfile, lint, tipos, build e CI em PR; integrações externas ficam fora deste recorte; [checklist](work/02-bootstrap.md) |
| 03 | Aprovar direção visual CM | CM Experience | Requisitos do produto | in_progress | Composição desktop/mobile, mapa de tokens, componentes/estados e motion aprovados por Cassiano; [checklist](work/03-experience.md) |
| 03b | Construir base visual compartilhada | CM Frontend | 02 + 03 | blocked | Tokens, componentes do piloto e vitrine local/preview implementados; revisão renderizada em contexto |
| 04 | Biblioteca e ingestão seguras | CM Data | 02 + decisões de dados/serviços da 01 | blocked | Modelo, autorização, importação e publicação testados por serviço/API, incluindo falhas e rascunhos |
| 05 | Music Inbox utilizável | CM Frontend | 03b + 04 | blocked | Upload em lote, revisão e publicação de três a cinco faixas reais sem JSON manual |
| 06 | Motor de rádio e análise isolados | CM Audio | 02 + contrato de leitura da biblioteca | blocked | Prova técnica entre duas rotas e testes de fila/falhas; fixtures identificadas permitidas |
| 07 | Mini player e player grande CM | CM Frontend | 03b + 04 + 06 | blocked | Seleção, busca simples, controles, visualizador e sincronização, com revisão renderizada |
| 08 | Recorte 3D e apresentação pública | CM Frontend | 03b + dados piloto da 01 | blocked | Home e uma peça real, cores/materiais, contato definido e caso autorizado quando disponível |
| 09 | Validar marco e preparar publicação | CM Review | 05 + 07 + 08 + acesso aos ambientes | blocked | Fluxo completo, privacidade, mobile, áudio real, recuperação e aprovação de publicação |

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
