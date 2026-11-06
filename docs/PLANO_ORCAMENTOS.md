# Plano da página de Orçamentos

Este plano parte do fluxo proposto por Cassiano e do que foi examinado no `OLD`. A página nova já tem o banner de Orçamentos; o formulário ficará abaixo dele. O código e o visual antigos servem como referência de comportamento, sem cópia direta da interface.

## Objetivo

Permitir que uma pessoa descreva o projeto e solicite uma análise, mesmo sem saber medidas, material ou termos técnicos. O fluxo terá **três etapas**, mostrará apenas perguntas pertinentes ao tipo escolhido e não calculará preço automaticamente.

## Estrutura da página

- Manter o banner atual, com título e subtítulo.
- Colocar o formulário abaixo do banner, centralizado na área do Estúdio, com largura máxima aproximada de 720 px.
- Mostrar uma etapa por vez e o progresso em texto: **1 de 3**, **2 de 3**, **3 de 3**.
- Preservar as respostas ao voltar ou editar. O formulário deve funcionar no desktop, no celular e com a Rádio aberta ou recolhida.
- Usar campos com rótulos claros, mensagens de erro próximas ao campo e navegação por teclado.

## Etapa 1 — Escolher

**Título:** O que vamos criar para você?  
**Apoio:** Escolha uma opção para começar.

| Opção | Descrição |
| --- | --- |
| Caixa personalizada | Caixas sob medida, no formato que a pessoa imaginar. |
| Placa personalizada | Nomes, frases, logotipos, QR Codes e placas decorativas. |
| Imprimir meu arquivo 3D | Já tenho um modelo e quero imprimir. |
| Outro projeto | Tenho uma ideia e quero transformá-la em uma peça 3D. |

O clique seleciona a opção e avança. Nenhuma opção aparece selecionada antes da escolha. Não há campos de texto nesta etapa.

## Etapa 2 — Personalizar

As perguntas mudam de acordo com a opção escolhida. Apresentá-las em grupos curtos dentro da etapa, sem despejar todos os campos em uma parede de formulário.

### Caixa personalizada

**Título:** Vamos montar sua caixa!

Antes dos campos, a pessoa escolhe entre **Pedido rápido** e **Montar passo a passo**. Pode mudar de caminho sem perder o que já preencheu. Os dois caminhos chegam à mesma etapa de contato e revisão.

**Pedido rápido:** mostrar a foto de referência primeiro, depois um campo livre: **O que você quer criar ou mudar?** A pessoa pode escrever, por exemplo, “Quero essa caixa em preto e vermelho, com meu QR Code”. Foto **ou** descrição é suficiente para avançar. Pedir também a quantidade, começando em 1. Não mostrar as perguntas de formato, medidas, cor e personalização neste caminho.

**Montar passo a passo:** apresentar um grupo por vez, com navegação de voltar e avançar:

1. **Foto de referência:** aceitar fotos, desenhos ou documentos; opcional.
2. **Formato:** redonda, quadrada, retangular ou outro formato, com espaço livre; permitir **Ainda não sei**.
3. **Divisórias:** perguntar **Com ou sem divisórias?**, com **Ainda não sei** no topo, separado das respostas. Se a pessoa escolher **Com divisórias**, perguntar **Quantas divisórias serão?** e exigir um número para avançar.
4. **Medidas:** exigir largura, profundidade e altura em centímetros, todas válidas, ou **Não sei as medidas**. Se informar medidas, exigir a indicação **internas**, **externas** ou **Não sei**.
5. **Personalização:** escolher **nome ou frase**, **logotipo** e/ou **QR Code**, ou marcar **Não quero** no topo. Se escolher texto, exigir o texto. Para QR Code, usar uma escolha por rádio entre **informar link ou texto** e **anexar QR pronto**; exigir o conteúdo do caminho escolhido. O arquivo do logotipo continua opcional se a pessoa ainda não o tiver.
6. **Cores e quantidade:** permitir até **4 cores**, cada uma informada por nome ou pela paleta visual. Usar um botão redondo **+** para acrescentar outra e permitir removê-la. Exigir que cada cor adicionada esteja preenchida, ou escolher **Ainda não decidi**. Quantidade com controle `− / +` e valor editável.

O fechamento é definido pelo formato, sem pergunta separada: caixa redonda tem tampa de rosquear, quadrada tem tampa de encaixe e retangular tem tampa de deslizar. Para outro formato, o fechamento fica a definir no orçamento.

No caminho detalhado, cada grupo exige uma resposta ou sua opção explícita de **Não sei/Não quero** antes de avançar. A foto de referência continua opcional. Contato e entrega são informados depois.

### Placa personalizada

**Título:** Vamos criar sua placa!

Assim como na caixa, a pessoa escolhe entre **Pedido rápido** e **Montar passo a passo**. Pode voltar e mudar de caminho sem perder as respostas já preenchidas.

**Pedido rápido:** mostrar primeiro a foto de referência e depois um campo livre para descrever a placa. Foto **ou** descrição é suficiente para avançar. Pedir a quantidade, sem exigir conteúdo, uso, medidas ou cores neste caminho.

**Montar passo a passo:** apresentar um grupo por vez, com voltar e avançar:

1. **O que vai na placa?** Permitir combinar **nome ou frase**, **logotipo** e **QR Code**, ou marcar **Ainda não decidi**. Se escolher texto, exigir o texto. O anexo do logotipo é opcional. Para QR Code, exigir **informar link ou texto** ou **anexar QR pronto**, com o conteúdo correspondente.
2. **Onde será usada e como será colocada?** Balcão, mesa, parede ou outro lugar; a pessoa informa a fixação em texto. Cada pergunta tem **Ainda não sei** como escolha separada.
3. **Qual tamanho você precisa?** Exigir largura e altura válidas em centímetros ou **Não sei as medidas**.
4. **Cores, quantidade e referências:** até 4 cores por nome ou pela paleta visual, ou **Ainda não decidi**; quantidade no controle `− / +`; fotos, desenhos ou documentos opcionais.

Cada grupo detalhado exige uma resposta ou sua opção explícita de **Não sei/Ainda não decidi** antes de avançar. Os dois caminhos seguem para o mesmo contato e resumo, que mostra apenas os dados do caminho escolhido.

### Imprimir meu arquivo 3D

**Título:** Vamos imprimir seu projeto!

1. **Envie seu arquivo 3D.** Um modelo é obrigatório para este caminho. A proposta atual pede STL e 3MF; o `OLD` também tinha suporte a OBJ e STEP/STP, então a lista final de formatos deve ser alinhada com o backend antes da liberação.
2. **Quer alterar o tamanho?** Manter o tamanho original, informar outro tamanho ou não sei. Se quiser alterar, exigir pelo menos uma medida válida em centímetros.
3. **Quais cores você prefere?** Até 4 cores por nome ou seletor visual RGB, ou **Ainda não decidi**.
4. **Quantas unidades você precisa?** Controle `− / +`, começando em 1 e com valor editável.
5. Oferecer um campo opcional para exigências importantes, como encaixe ou resistência, sem exigir conhecimento de material.

### Outro projeto

**Título:** Conte sua ideia!

1. **O que você gostaria de criar?** Campo livre com o apoio: “Pode explicar do seu jeito, sem termos técnicos.”
2. **Tem alguma referência?** Fotos ou desenhos opcionais. Para continuar, exigir **uma descrição ou uma referência**, não as duas.
3. **Sabe o tamanho aproximado?** Campo opcional.
4. **Quantas unidades você precisa?** Controle `− / +`, começando em 1 e com valor editável.

## Etapa 3 — Contato, entrega e revisão

**Título:** Estamos quase lá!

1. Pedir o **nome**.
2. Permitir escolher **WhatsApp ou e-mail** e mostrar somente o campo correspondente. Validar o contato escolhido.
3. Perguntar se a pessoa prefere **retirar em São Caetano do Sul** ou **receber no meu endereço pela Shopee**. Pedir **CEP somente para envio**. Explicar que os detalhes do envio pela Shopee serão combinados depois do orçamento; não cobrar nem prometer valor nesta etapa.
4. Mostrar o resumo em grupos de peça, cores/quantidade/arquivos e contato/entrega, com respostas e medidas legíveis. Cada **Editar** abre diretamente o grupo correspondente. A pessoa pode salvar e voltar ao resumo sem avançar pelas outras perguntas, ou cancelar para restaurar o que estava preenchido antes da edição.
5. Exibir um aviso curto sobre a finalidade dos dados antes do botão **Solicitar orçamento**.

## Envio e confirmação

- Destino confirmado pelo proprietário: `casman1986@gmail.com`. A mensagem é composta com os dados já gravados no banco; anexos permanecem no bucket privado.
- O envio pode usar o próprio Gmail do destinatário com `CM_QUOTE_GMAIL_APP_PASSWORD` (senha de aplicativo de 16 caracteres, com verificação em duas etapas) ou, futuramente, Resend com `RESEND_API_KEY` e `CM_QUOTE_EMAIL_FROM` verificado. Os segredos ficam somente no servidor.
- O envio só aparece ativo quando `CM_QUOTE_INTAKE_ENABLED=true`, as credenciais do projeto Supabase **CM 3D & Rádio** e as credenciais de e-mail estão configuradas. Não usar os projetos Supabase do Artesopolis Admin.
- Registrar a solicitação no servidor antes de mostrar sucesso. Não simular envio nem confirmar apenas porque o botão foi clicado.
- Se o banco confirmar e o e-mail falhar, manter a solicitação e permitir repetir a notificação com a mesma chave; não criar um segundo pedido.
- Em caso de erro, manter o preenchimento e mostrar uma mensagem compreensível com possibilidade de tentar novamente.
- Depois da confirmação real, mostrar: **“Recebemos sua solicitação. Vamos analisar seu projeto e retornar pelo contato escolhido.”**
- Mostrar número de solicitação somente se vier do registro real. Oferecer **Voltar ao início**.
- Não apresentar preço automático, pagamento ou promessa de aprovação ou prazo de retorno.

## Arquivos e proteção dos dados

- Aplicar os limites do fluxo antigo: até **5 arquivos**, **50 MB por arquivo** e **100 MB no total**.
- Referências podem incluir imagens e PDF; modelos 3D seguem a política final definida para o caminho “Imprimir meu arquivo 3D”. Mostrar formatos e limites antes da seleção.
- Validar arquivos também no servidor. Seleção no navegador, extensão e tipo informado pelo navegador não comprovam que o arquivo é seguro.
- Reaproveitar seletivamente as regras e os handlers do `OLD`, incluindo sessão/posse do pedido, armazenamento privado, limites de uso, expiração e retenção. Não copiar o CSS nem ligar o envio antigo sem revisão e teste do fluxo completo.
- Não enviar nome, contato, descrição do projeto ou arquivos para analytics.

## Sequência de implementação

1. Montar a interface das três etapas abaixo do banner existente, adaptada à identidade visual da versão nova.
2. Implementar as perguntas condicionais, a navegação, a revisão editável e a validação local dos campos.
3. Revisar e adaptar os contratos de dados e as políticas de arquivos do `OLD` para a nova rota `/orcamentos`.
4. Integrar sessão, upload privado e registro do pedido; verificar os caminhos de sucesso e erro com arquivos reais.
5. Conectar os botões de entrada para Orçamentos e liberar o envio somente quando o destino comercial, a configuração do Supabase e a confirmação de ponta a ponta estiverem resolvidos.

## Status do envio e próximos passos

**Regra de atualização:** após cada mudança em orçamentos, registrar aqui a data, o que foi feito, o que foi apenas verificado, o que está publicado e os próximos passos. Ordenar os próximos passos com **trabalho de código primeiro**; publicação e aceite vêm depois. Não tratar código na `main`, deploy `READY` ou consulta ao banco como prova de envio completo. Push, deploy e alterações remotas ficam a cargo do proprietário.

### Estado em 06/11/2026

**Feito**
- O P0 de múltiplos modelos foi integrado à `main` no PR #44 (`dc78380`): lista de até 20 modelos por links/arquivos, especificações por item, limites de anexos, gravação e e-mail associados a um pedido. As migrações `20261106122659` e `20261106134500` constam como aplicadas no Supabase do CM.
- A colagem de links passou a mostrar a linha e o motivo de cada erro; links válidos são adicionados e excedentes permanecem no campo. Arquivos de modelo que não sejam STL/3MF são recusados ao selecionar; o aviso de reanexo permanece até todos os arquivos locais necessários serem recuperados (`5f9124c`).
- A rotina de retenção passou a reconhecer uma reserva vencida cujo objeto já não existe no Storage, mantendo a checagem final do banco antes de liberar espaço (`a4013ee`). Uma limpeza manual **autorizada** liberou o único anexo vencido encontrado; a consulta posterior retornou zero anexos vencidos pendentes. Isso não substitui a verificação da próxima execução automática do cron.
- No banco do projeto CM, foram configurados `max_bytes=500000000`, `max_daily_bytes=250000000` e `storage_reviewed_at` para `quote-intake`. Esses são tetos operacionais de proteção, não dados de demanda comercial.
- Nesta revisão local, a migração `20261106190000_quote_observability.sql` passou a definir um retrato agregado de bytes físicos, bytes contabilizados/reservados, uso diário, autorizações de upload aceitas/bloqueadas e resultado da retenção. O servidor registra apenas o resultado e uma categoria fixa para cada autorização de upload; recusas por rate limit não viram eventos persistentes para evitar crescimento sem limite. O cron registra métricas sem dados de cliente e envia alerta ao endereço do estúdio quando há falha de limpeza, bloqueio por cota, objetos sem tamanho conhecido ou uso de pelo menos 80% dos tetos. A rota interna reservou até 60 segundos para limpeza e aviso. Falha de observabilidade retorna 503 sem desfazer a limpeza já concluída.
- Foi feita revisão estática dos caminhos P0.1–P0.4 no formulário, contrato servidor, SQL e e-mail: lista/ordem e preferências por modelo, associação de anexos ao rascunho, limite do corpo, idempotência e mensagem única ao estúdio. Nenhuma lacuna adicional apareceu nos trechos revisados; isso não comprova execução de pedido real.
- O proprietário informou que aplicou a migração de observabilidade. A aplicação remota não foi consultada nesta revisão; o código desta entrega permanece somente nos arquivos locais.
- TypeScript, ESLint dos arquivos alterados e `git diff --check` passaram. Nenhum pedido real de múltiplos modelos foi enviado nesta revisão; não foram abertas telas nem criados testes.

**Publicado e configuração atual**
- O commit `a4013ee` foi enviado à `main` e o deploy manual `dpl_GdEBEZmw2osYRayhG72KLH1W8GNk` ficou `READY`. O deploy seguinte, `dpl_2T6ezpJW8SddFZM8SmXZx1nmT4s5`, foi **cancelado**.
- `CM_QUOTE_INTAKE_ENABLED=true`; `CM_QUOTE_MULTIMODEL_ENABLED=false` em produção. Portanto, a interface de múltiplos modelos **não está ativada**. A configuração de cotas retirou o bloqueio de novas reservas de upload no banco, mas não há confirmação de um envio real após essa mudança.

### Próximos passos

1. **Arquivos locais:** manter este status e os próximos passos atualizados se surgir outra lacuna concreta na revisão do P0; fazer a correção de código antes de propor publicação. A migração de observabilidade e os arquivos de servidor desta entrega ainda precisam ser incluídos no próximo push do proprietário.
2. **Publicação pelo proprietário:** enviar os arquivos e fazer o deploy; então decidir quando ativar `CM_QUOTE_MULTIMODEL_ENABLED=true`. A aplicação informada da migração não publica o código do servidor.
3. **Aceite após publicação:** conferir a execução automática da retenção, as métricas e alertas, e um pedido misto com links e STL/3MF. Nenhum desses resultados foi confirmado nesta revisão local.

**Histórico anterior:** a integração inicial registrou pedidos sintéticos sem arquivo e com PNG, com gravação, e-mail e upload privado. Isso validou o fluxo anterior de um modelo; STL/3MF e o pedido com múltiplos modelos não foram confirmados de ponta a ponta naquela ocasião.
