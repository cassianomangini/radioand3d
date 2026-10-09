# Regras de trabalho

## Entrada e fonte de verdade

Leia [README](README.md), [plano](docs/PROJECT_PLAN.md) e [roadmap](docs/ROADMAP.md). Depois leia somente o contrato da área e o checklist da entrega ativa. Não carregar todos os documentos por reflexo.

O plano define o produto; contratos de domínio definem comportamento; o roadmap guarda o estado macro; o arquivo da entrega guarda os passos e evidências. Ao mudar uma decisão, altere sua fonte e remova orientações incompatíveis. Não copiar regras entre documentos.

Documentação em português, código e identificadores técnicos em inglês. Propostas não viram decisões aprovadas apenas porque foram escritas. Não declarar código, teste, deploy, integração ou aprovação visual que não ocorreram.

## Perfis e limites

| Perfil | Responsabilidade | Referência |
| --- | --- | --- |
| [CM Planning](.github/agents/cm-planning.agent.md) | Escopo, dependências, decisões e retomada | Plano + roadmap |
| [CM Experience](.github/agents/cm-experience.agent.md) | Identidade, composição e movimento | Experiência |
| [CM Frontend](.github/agents/cm-frontend.agent.md) | Interfaces e integração dos contratos | Arquitetura + experiência |
| [CM Data](.github/agents/cm-data.agent.md) | Dados, autorização e ingestão | Biblioteca + catálogo |
| [CM Audio](.github/agents/cm-audio.agent.md) | Motor, fila e análise de áudio | Rádio |
| [CM Infra](.github/agents/cm-infra.agent.md) | Ambientes, mídia, deploy e recuperação | Arquitetura |
| [CM Review](.github/agents/cm-review.agent.md) | Defeitos, regressões e evidências | Contratos afetados |

Um responsável por entrega. Paralelizar somente após definir contratos e arquivos de cada um. Disputas sobre layout global, tipos públicos, schema ou configuração precisam ser resolvidas antes de editar em paralelo.

Os perfis não criam permissões nem garantem isolamento. As permissões reais pertencem à ferramenta e às contas conectadas. Não fixar um modelo de IA ou instalar serviços sem necessidade.

## Ciclo de uma entrega

1. Conferir branch, HEAD, diff local, instruções vigentes e dependências. Preservar trabalho alheio.
2. Assumir uma entrega disponível no roadmap. Usar [o modelo](docs/work/TEMPLATE.md) apenas para a entrega atual; não abrir dezenas de checklists vazios.
3. Registrar objetivo, limites, responsável, contratos lidos e critérios de aceite antes de implementar.
4. Marcar passos conforme são realmente verificados. Registrar bloqueio e próximo passo exato antes de encerrar a sessão.
5. Revisar o diff. Para mudanças de código, dependência, script ou workflow, executar as verificações técnicas pertinentes (lint, typecheck, testes, build) quando o ambiente permitir; registrar comandos e resultados reais. Para trabalho visual substancial já autorizado, renderizar localmente a página em navegador real, capturar desktop/mobile, comparar com a referência, corrigir diferenças e registrar a revisão técnica e visual do agente. Cassiano continua responsável por aprovar a direção/resultado visual final; screenshot e CI não são aprovação humana. Se o ambiente impedir o navegador, declarar a revisão visual bloqueada, não concluída. O agente pode realizar esses QA locais como parte de uma entrega visual autorizada, sem transformar isso em permissão para deploy ou escrita remota.
6. Atualizar contratos alterados e estado no roadmap. Informar commit/PR, evidência e pendências reais ao usuário.

Implementar diretamente na `main`. Criar branch ou PR somente quando Cassiano pedir explicitamente. Organização documental solicitada pode ser um commit atômico, sem reescrever histórico. Nunca usar force push ou sobrescrever arquivos concorrentes. Um PR solicitado deve ter um resultado verificável; dividir por dependência funcional quando ficar difícil revisar, não por número arbitrário de linhas.

## Critério de conclusão

Estados: `ready`, `in_progress`, `blocked`, `done`, `dropped`. `done` exige artefato, evidência pertinente e pendências bloqueantes resolvidas. Desenho novo requer aprovação de Cassiano antes da interface final. Autorrevisão deve ser identificada como tal; não inventar revisão independente.

Fixtures e protótipos são permitidos para desenvolvimento e testes quando identificados. Não apresentá-los como dados reais nem publicá-los silenciosamente. A prova integrada exige arquivos e produtos autorizados.

## Segurança e escopo

Não alterar o Artesopolis Admin nem o landing antigo nesta iniciativa sem pedido específico. Consultas não autorizam migração de dados, publicação de ativos ou exclusão do original.

Antes de incorporar código privado, ativos, segredos ou dados, conferir visibilidade do destino e autorizações. Nenhuma credencial em documentos, commits, logs ou frontend. Provisionamento pago, migração remota e publicação em produção exigem alvo confirmado e autorização.

Invariantes do produto estão no plano; regras de áudio, publicação e estoque ficam nos contratos de domínio. Não transformar este arquivo em uma segunda especificação.
