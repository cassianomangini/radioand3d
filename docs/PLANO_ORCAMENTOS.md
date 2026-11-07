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
3. Perguntar se a pessoa prefere **retirar em São Caetano do Sul** ou **receber em casa**. Pedir **CEP somente para envio**. Definir a forma de envio depois da análise, sem cobrar nem prometer valor nesta etapa.
4. Perguntar opcionalmente se **precisa para alguma data**, com escolha **Não tenho data**. Validar a data no fuso de São Paulo e esclarecer que a possibilidade de atendê-la será analisada junto com o orçamento; para envio, ela indica o recebimento desejado.
5. Mostrar o resumo em grupos de peça, cores/quantidade/arquivos e contato/entrega, com respostas e medidas legíveis. Cada **Editar** abre diretamente o grupo correspondente. A pessoa pode salvar e voltar ao resumo sem avançar pelas outras perguntas, ou cancelar para restaurar o que estava preenchido antes da edição.
6. Na revisão de **Imprimir meu arquivo 3D**, exigir a declaração de autorização para impressão e oferecer acesso às condições do serviço. Caixa, placa e outro projeto mostram apenas aviso contextual quando o cliente compartilha imagens de referência.
7. Exibir um aviso curto sobre a finalidade dos dados antes do botão **Solicitar orçamento**.

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
- A revisão estática de P0.1–P0.4 cobriu formulário, contrato servidor, SQL e e-mail: lista/ordem e preferências por modelo, associação de anexos ao rascunho, limite do corpo, idempotência e mensagem única ao estúdio. A continuação da revisão encontrou e corrigiu as lacunas descritas abaixo; leitura de código não comprova execução de pedido real.
- O proprietário informou que aplicou a migração de observabilidade. A aplicação remota não foi consultada nesta revisão. O código de observabilidade consta na `main` local desde `aadc4e5`; publicação desse código não foi verificada.
- Na continuação da revisão de P0.1/P0.4, o formulário ganhou substituição de STL/3MF mesmo antes de recarregar a página, ações **Editar/Remover** e reordenação por item, além de título descritivo opcional. O título é validado, salvo no pedido, exibido no resumo e no e-mail; itens anteriores sem título continuam aceitos. Ao editar um item a partir do resumo, o foco vai ao campo correspondente. A orientação para arquivos acima dos limites passou a indicar análise manual com o Estúdio. Essas alterações constam na `main` local em `4ac4852`; publicação não verificada.
- Na continuação de P0.4, o retry de um pedido já gravado passou a consultar primeiro seu recibo, usando os dados persistidos para notificar o estúdio. Desligar a entrada ou a flag de múltiplos modelos, alterar o catálogo ou mudar validações do formulário não bloqueia esse retry; pedidos **novos** continuam sujeitos às flags e às validações. O formulário mantém disponível **Tentar confirmar envio** para um pedido pendente quando a entrada é pausada e mostra seu resumo de múltiplos modelos. A leitura da notificação aceita pedidos nos estados `submitted`, `reviewing` e `closed`. Essas correções também constam na `main` local em `4ac4852`; publicação não verificada.
- Na revisão do rascunho recuperado, remover o último modelo que precisava de reanexo passou a limpar o aviso correspondente; um papel `model` antigo salvo na sessão também deixa de gerar aviso quando não há modelo ativo que precise dele. Itens de arquivo ainda sem `File` local agora contam no limite de cinco ao adicionar novos STL/3MF, e a entrada de novos arquivos fica desativada quando os cinco lugares estão ocupados. Esta correção está somente nos arquivos locais.
- Na revisão de P0.2, cada modelo passou a oferecer a mesma paleta visual de cores disponível no formulário anterior, além do campo por nome. A escolha grava nome e RGB apenas no item escolhido, respeita o máximo de quatro cores e permite fechar o menu com Escape. A última cor de um item não pode ser removida enquanto o modo é **Escolher cores**; para não escolher cor, há a opção **Ainda não decidi**. Esta correção está somente nos arquivos locais.
- Na revisão de P0.4, o e-mail do pedido múltiplo passou a apresentar as cores por nome/RGB e as medidas informadas com seus nomes e a unidade `cm`, sem exibir chaves técnicas nem dimensões vazias. O HTML continua escapando o conteúdo do cliente. Esta correção está somente nos arquivos locais.
- Na revisão de P0.3, o link de compatibilidade dos pedidos sem arquivo passou a ser gravado sem espaços nas bordas, como os links dos itens. Isso evita que um item aceito pelo validador seja rejeitado depois pela regra SQL. Cores e medidas de cada item agora são gravadas somente com os campos previstos, sem propriedades extras do JSON recebido. Esta correção está somente nos arquivos locais.
- Na revisão conjunta de P0.1–P0.4, erros de link, quantidade, cores e medidas agora apontam o modelo específico no formulário; estouro de 10.000 unidades também aponta o item que ultrapassou o total. Links ainda não adicionados à lista são preservados no rascunho após reload, sem guardar arquivos ou token do Turnstile. O aviso de reanexo aparece apenas para os papéis de arquivo ativos na jornada atual. Esta correção está somente nos arquivos locais.
- No servidor, itens de impressão guardados enquanto o cliente muda para caixa, placa ou outro projeto deixam de invalidar a nova jornada; anexos só são aceitos nos papéis realmente escolhidos no modo ativo. A triagem `needs-information` passou a considerar apenas as respostas da categoria enviada, inclusive escolhas **Não sei** da caixa, sem ser contaminada por opções deixadas em outra. Uma personalização escondida também não substitui a descrição exigida para outro formato de caixa. O limite do JSON subiu de 48 KB para 256 KB, ainda finito, para comportar até 20 itens junto com respostas preservadas ao alternar jornadas. Não houve nova migration. Esta correção está somente nos arquivos locais.
- Na revisão final de P0.3/P0.4, o servidor passou a limitar a 30.000 caracteres o texto **efetivamente gravado e enviado por e-mail**, calculado depois de descartar respostas escondidas das outras jornadas; os campos e a lista de modelos já tinham limites individuais. Só a rota de finalização aceita o corpo ampliado de 256 KB; sessão e anexos permanecem limitados a 4 KB. A revisão do pedido múltiplo identifica **Seus modelos** e informa que viabilidade, valor e prazo dependem de análise. Se o corpo exceder o limite de transporte, o formulário desbloqueia a edição e apresenta uma mensagem recuperável, mantendo as respostas. Essas alterações estão somente nos arquivos locais.
- Na revisão de concorrência de P0.4, a migration `20261106215314_quote_email_dispatch_claim.sql` cria uma reserva curta e atômica da notificação por requestId, restrita ao service role e à sessão dona do pedido. O servidor usa a reserva antes de obter links privados e enviar o e-mail; confirma envio e evento na mesma transação, reconhece eventos de pedidos anteriores e responde **em andamento** quando outra tentativa já está notificando. Uma execução interrompida libera a tentativa pelo vencimento da reserva após dois minutos. Isso evita dois envios concorrentes comuns, mas SMTP não oferece confirmação transacional com o banco: se o provedor aceitar a mensagem e a confirmação ao banco falhar, um retry posterior ainda pode reenviá-la. O proprietário informou posteriormente que **aplicou** essa migration no Supabase CM; a aplicação remota não foi verificada nesta revisão.
- TypeScript, ESLint dos arquivos alterados e `git diff --check` passaram. Nenhum pedido real de múltiplos modelos foi enviado nesta revisão; não foram abertas telas nem criados testes.

**Leitura do P0 por bloco nesta revisão de arquivos**

| Bloco | Código local | O que falta para considerar entregue |
| --- | --- | --- |
| P0.1 Lista, links e arquivos | Implementado, com erros por item, duplicatas e limites de 20 modelos/5 arquivos | Publicação e aceite com 15 links e pedido misto |
| P0.2 Preferências por modelo | Implementado, com quantidade, cor, tamanho, observações e aplicação explícita em lote | Aceite de independência entre itens |
| P0.3 Contrato e compatibilidade | Implementado, com associação de anexos, limites de corpo e texto, rascunho e leitura antiga | Aceite do upload e registro reais após publicação |
| P0.3a Cota, limpeza e observabilidade | Migrações e código locais existentes; proprietário informou aplicação da migração de observabilidade | Confirmar configuração remota atual, execução automática da limpeza, métricas e alertas |
| P0.4 Revisão, e-mail e retry | Código local inclui replay pelo pedido persistido e reserva para evitar notificações concorrentes | Proprietário informou que aplicou a migration da reserva; confirmar pelo CLI do CM e depois o envio misto, e-mail e retry após publicação do commit correto |
| P0.5 Critérios de aceite | Não executados nesta revisão por orientação do proprietário | Aceite operacional pelo proprietário após publicação |

### Continuação local em 07/11/2026

**Feito em código**
- O retry de upload passou a reutilizar o mesmo rascunho e a mesma reserva quando o cliente altera apenas texto, quantidade, cor ou ordem dos modelos. A assinatura dos arquivos é independente da ordem e identifica a instância real de cada `File`; substituir um arquivo por outro com mesmo nome, tamanho e data não reutiliza o binário anterior. Mudar o tipo de projeto ou os arquivos continua abrindo uma nova sessão.
- Uma falha temporária ao confirmar um anexo já enviado não causa nova assinatura nem zera a sessão. Só a ausência confirmada do objeto permite tentar o upload de novo com a reserva existente. Conteúdo inválido e tamanho divergente recebem mensagens específicas para escolher outro arquivo.
- Antes de finalizar, o servidor compara cada anexo declarado com a reserva validada do mesmo rascunho: ID, nome, extensão e tamanho. Um PNG declarado como STL, um nome forjado ou um anexo ainda pendente não é aceito como modelo. A segunda consulta de recibo preserva o replay quando duas finalizações com a mesma chave concorrem. A limitação de tentativas acontece antes das leituras externas de catálogo e anexos.
- O P1.2 de prazo desejado foi implementado localmente nas quatro categorias: data opcional ou **Não tenho data**, validação de data real a partir do dia corrente em `America/Sao_Paulo` no cliente e no servidor, recuperação de rascunhos antigos sem o campo, revisão editável e destaque no e-mail. A data fica em `production.desiredDate` no JSON já existente; não há migration nova. É preferência do cliente, sem promessa de atendimento.
- O P1.3 de entrega foi implementado localmente nos rótulos, resumo e e-mail: **Retirar em São Caetano do Sul** ou **Receber em casa**, CEP apenas para envio e definição posterior da forma de despacho. O contrato interno `delivery=retirada/envio` foi preservado.
- O P1.1 recebeu o aviso contextual para fotos, desenhos e logotipos enviados como referência em caixa, placa ou outro projeto, sem bloquear essas categorias. Para **Imprimir meu arquivo 3D**, a revisão mostra o texto de declaração do plano em um checkbox desmarcado por padrão, com link para a página curta `/orcamentos/condicoes`. O servidor rejeita pedidos novos de impressão sem a declaração e grava no JSON do pedido o texto exato, sua versão `2026-11-07-v1` e o horário de aceite gerado pelo servidor. O e-mail do Estúdio indica versão e horário; os outros tipos não recebem checkbox nem registro. Rascunhos antigos recuperados começam com a declaração desmarcada. A troca de categoria limpa um aceite anterior. Conforme instrução do proprietário nesta continuação, não foi criada flag nem condicionada a entrega a uma revisão jurídica; nenhum texto foi aprovado por revisão jurídica nesta execução.
- No P1.4, erros visíveis do formulário passaram a levar o foco ao controle correspondente, além de rolar a mensagem para a área de leitura. Erros em modelos mistos focam especificamente link, quantidade, cor ou medida do item; a seleção de arquivos expõe `aria-invalid`. O controle de quantidade comum agora respeita o teto de 10.000 unidades do servidor, e os campos de link recebem o mesmo estilo legível dos demais campos.
- Na continuação do P1.4, a confirmação pelo resumo passou a abrir diretamente o grupo de projeto, contato ou entrega quando uma resposta ficou inválida depois da revisão; antes, o botão podia simplesmente parar sem mostrar o erro porque o campo estava oculto. Isso também cobre uma data desejada que venceu enquanto o resumo ficou aberto. Quando o servidor devolve `invalid_quote_submit`, o cliente revalida as respostas para levar a pessoa ao campo recuperável; o aceite de impressão recusado reaparece junto do checkbox. A edição preserva o rascunho e limpa o aviso antigo de envio quando a pessoa altera a resposta.
- A revisão adicional do P1.4 alinhou os limites locais de quantidade, dimensões, cores, nome, contato e textos aos limites já aceitos no contrato servidor. Um rascunho com quantidade fora do intervalo agora recebe erro no controle correspondente; caixa e placa sem modo selecionado mostram erro nas opções de caminho, inclusive quando o resumo antigo é recuperado. O link do modelo único passou a marcar visualmente o campo inválido.
- Em nova revisão local de P1.1, o aceite de impressão passou a incluir a versão do texto exibido no navegador. O servidor compara essa versão com a vigente antes de gravar o texto/horário; se o formulário estiver desatualizado, rejeita o pedido e orienta a atualizar a página. Rascunhos recuperados com aceite de versão antiga voltam a ficar desmarcados. Isso evita, no fluxo normal, registrar como aceito um texto novo que o cliente não leu. Essa correção está **somente nos arquivos locais após `256b238`**.
- Na revisão concentrada do envio de P0/P1, o servidor passou a ignorar e normalizar a quantidade antiga, oculta, quando o pedido de impressão usa a lista de modelos: as quantidades válidas dos itens continuam determinando o total gravado. Antes, um valor antigo inválido podia bloquear um pedido que o formulário considerava válido. O cliente TUS agora exige o cabeçalho `upload-offset` nas respostas HEAD/PATCH; a ausência do cabeçalho não é mais confundida com deslocamento zero. A leitura da migration confirmou que o retry da reserva com o mesmo upload key é permitido enquanto o anexo está pendente, e a finalização repetida de um anexo validado é idempotente. Essas correções estão **somente nos arquivos locais após `256b238`**.

**Verificado:** TypeScript, ESLint dos arquivos alterados e `git diff --check` passaram também após a correção de versão do aceite. A migration de reserva do e-mail foi relida quanto à posse, lease, permissões e compatibilidade com eventos antigos; não foi alterada nem aplicada pelo agente nesta continuação. Não houve abertura de telas, criação ou execução de testes, push ou deploy pelo agente.

**Atualização operacional informada e conferida em 07/11/2026**
- O proprietário informou que **aplicou** a migration `20261106215314_quote_email_dispatch_claim.sql` no Supabase CM e que **fez deploy** na Vercel. Não pedir para reaplicar. O ref correto do Supabase CM é `rhuypfcvkhfwvaxuorfr`, confirmado tanto em `CM_SUPABASE_URL` local quanto em `supabase/.temp/project-ref`.
- O commit `256b238404abd777730222f03a84e45e257f7b95`, que inclui as correções locais de P0/P1, está no GitHub; a `main` local e `origin/main` apontam para ele e a árvore estava limpa antes desta atualização documental.
- A consulta de leitura à Vercel para o projeto `radioand3d` mostrou como último deploy `READY` o `dpl_EJsQCVK8L87spnES26f4ex3Qvb14`, criado em 07/11/2026 às 06:27 no horário de São Paulo, com SHA `a706713`. Nenhum deploy de `256b238` apareceu na lista consultada. Portanto, o deploy informado pelo proprietário está registrado, mas **a publicação das mudanças de `256b238` não foi confirmada** por essa leitura.
- A migration do Supabase CM não foi verificada remotamente nesta atualização: o CLI local foi bloqueado ao tentar gravar telemetria fora do workspace, e o conector Supabase disponível pertence ao Artesopolis. **O proprietário vetou o uso desse conector para este projeto**. `AGENTS.md` agora fixa o ref correto, o uso exclusivo do CLI do CM para consultas e a proibição do conector Supabase aqui. A flag atual de múltiplos modelos e um pedido real após o deploy também não foram verificados.

### Próximos passos

1. **Código P1.1:** falta a orientação contextual específica quando o cliente declarar reprodução de arte, personagem ou logotipo de terceiro em caixa/placa/outro projeto. Hoje há apenas o aviso genérico para fotos e logotipos anexados. Implementar sem impor aceite universal nem questionário a todos os pedidos. As demais correções locais de P0/P1 registradas acima ainda não foram publicadas.
2. **Código P2, após estabilizar P0/P1 e receber campanha real:** campanha sazonal reversível nas superfícies do Estúdio/Home, com fotografia e chamada aprovadas, CTA para o formulário comum, preservação de SEO/acessibilidade/desempenho e métricas agregadas sem dados pessoais. Não inventar arte, foto, preço ou disponibilidade. F1 (metadados por link) e F2 (painel privado) são trabalho futuro condicionado a volume e validação das integrações; não são parte do próximo lote.
3. **Publicação pelo proprietário:** após fechar o código pertinente, fazer push/deploy e conferir na Vercel um deploy `READY` com o SHA correto; a última leitura ainda mostrou `a706713`, anterior também a `256b238`. A migration de reserva foi informada como aplicada; não reaplicar. Decidir quando ativar `CM_QUOTE_MULTIMODEL_ENABLED=true` somente após confirmar o código publicado.
4. **Aceite de P0/P1 após publicação:** conferir a execução automática da retenção, métricas/alertas, 15 links em um pedido, pedido misto com links e STL/3MF, limites/cotas, e-mail com todos os itens em ordem, retry, quatro jornadas, prazo, entrega, teclado e mobile. Esses critérios de P0.5/P1.5 permanecem sem confirmação nesta revisão local. Verificar histórico da migration apenas pelo CLI vinculado ao Supabase CM, se disponível, sem usar o conector Supabase vetado.

**Histórico anterior:** a integração inicial registrou pedidos sintéticos sem arquivo e com PNG, com gravação, e-mail e upload privado. Isso validou o fluxo anterior de um modelo; STL/3MF e o pedido com múltiplos modelos não foram confirmados de ponta a ponta naquela ocasião.
