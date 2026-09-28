# Roadmap

## Estado verificado nesta revisão

Base: `f11aaff2dd96825c468551a1a0cb6c506f7bc824`, em 28/09/2026. Havia cinco arquivos documentais e nenhum aplicativo, schema, workflow de CI ou perfil individual de agente. Não havia PR aberto na consulta. A organização atual acrescenta contratos, perfis e checklists; não implementa o site.

A consulta ao repositório retornou `private: false`. A visibilidade deve ser confirmada antes de importar qualquer conteúdo privado. Serviços de hospedagem, banco e storage não foram inspecionados nem provisionados nesta revisão.

## Agora

Próximas frentes disponíveis: **01, decisões de base**, e **03, proposta visual**. Podem avançar em paralelo porque nenhuma implementa a interface final. Limite de três entregas simultâneas; atualize responsável e arquivo de trabalho ao assumir uma.

## Sequência única

| ID | Entrega | Responsável principal | Dependências | Estado | Saída verificável |
| --- | --- | --- | --- | --- | --- |
| 00 | Revisar e organizar documentação | CM Planning | Nenhuma | done | Contratos separados, perfis, links e inconsistências revisados; commit desta reorganização |
| 01 | Fechar base técnica e material piloto | CM Planning | 00 | ready | Decisões registradas e bloqueios externos resolvidos ou delimitados; [checklist](work/01-base.md) |
| 02 | Criar aplicação e verificações mínimas | CM Infra | 01 | blocked | Setup local reproduzível, lockfile, lint, tipos, testes, build e CI; README com comandos reais |
| 03 | Aprovar direção visual CM | CM Experience | Requisitos do produto | ready | Proposta desktop/mobile de home, produto, mini/full player e Inbox; aprovação de Cassiano registrada |
| 04 | Biblioteca e ingestão seguras | CM Data | 02 + decisões de dados/serviços da 01 | blocked | Modelo, autorização, importação e publicação testados por serviço/API, incluindo falhas e rascunhos |
| 05 | Music Inbox utilizável | CM Frontend | 03 + 04 | blocked | Upload em lote, revisão e publicação de três a cinco faixas reais sem JSON manual |
| 06 | Motor de rádio e análise isolados | CM Audio | 02 + contrato de leitura da biblioteca | blocked | Prova técnica entre duas rotas e testes de fila/falhas; fixtures identificadas permitidas |
| 07 | Mini player e player grande CM | CM Frontend | 03 + 04 + 06 | blocked | Seleção, busca simples, controles, visualizador e sincronização, com revisão renderizada |
| 08 | Recorte 3D e apresentação pública | CM Frontend | 02 + 03 + dados piloto da 01 | blocked | Home e uma peça real, cores/materiais, contato definido e caso autorizado quando disponível |
| 09 | Validar marco e preparar publicação | CM Review | 05 + 07 + 08 + acesso aos ambientes | blocked | Fluxo completo, privacidade, mobile, áudio real, recuperação e aprovação de publicação |

A entrega 06 não precisa esperar a interface do Inbox: usa o mesmo contrato e fixtures apenas no ambiente de teste. O marco 09 exige a importação real da entrega 05. Não publicar protótipos como produto concluído.

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

Ao abrir uma entrega posterior, crie seu checklist a partir de [TEMPLATE.md](work/TEMPLATE.md), acrescente o link à tabela e confirme que o escopo ainda cabe em uma revisão. Depois do marco 09, priorizar expansão do catálogo e da rádio conforme uso; não abrir antecipadamente tarefas para toda possibilidade futura.

## Correções desta reorganização

Ordem corrigida: decisões e estrutura antes da implementação. Player grande pertence à primeira experiência, não a uma fase futura duplicada. Pipeline deixou de especificar também a UI de reprodução. Publicação passou a distinguir música e versão. A auditoria deixou de tratar leitura estática como prova de funcionamento e de condenar técnicas isoladas de visualização. As verificações desta entrega são documentais; não houve teste de áudio, build da aplicação ou deploy.
