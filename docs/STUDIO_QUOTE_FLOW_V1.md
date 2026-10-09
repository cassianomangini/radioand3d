# Fluxo de Orçamento do Estúdio

Status: **contrato de produto**  
Versão: **V1 — 04/10/2026**  
Infra backend: [SUPABASE_INFRASTRUCTURE_V1.md](SUPABASE_INFRASTRUCTURE_V1.md)

O orçamento existe para transformar interesse em uma solicitação analisável sem abrir o WhatsApp para qualquer visitante.

## Objetivos

- reduzir contato sem contexto;
- não assustar cliente legítimo com formulário enorme;
- distinguir rapidamente quem já tem um arquivo 3D pronto de quem precisa de placa, caixa ou outro projeto;
- receber referência visual e arquivos;
- preservar a origem da intenção;
- permitir triagem antes do contato manual.

## Princípio de interação

O fluxo deve parecer uma **conversa guiada**, não um formulário cadastral.

Regras de experiência:

- começar por “O que você quer fazer?”;
- não começar por nome, telefone ou e-mail;
- apresentar uma decisão ou pequeno grupo coerente por etapa;
- usar branching para esconder perguntas irrelevantes;
- mesmo no desktop, não aproveitar espaço apenas para despejar campos;
- oferecer “Não sei ainda” ou “Preciso de ajuda nisso” quando a pessoa não precisa dominar termos técnicos;
- preservar respostas ao voltar;
- contato entra no final;
- antes do envio, mostrar um resumo editável.

Referência de padrão de pergunta/branching:  
https://design-system.service.gov.uk/patterns/question-pages/

## Entrada

CTAs podem entrar com contexto:

- `/studio/orcamento?tipo=impressao`
- `/studio/orcamento?tipo=placa`
- `/studio/orcamento?tipo=caixa`
- `/studio/orcamento?tipo=placa&referencia=mano-jotta`
- `/studio/orcamento?origem=placas-personalizadas`

Esses parâmetros auxiliam preenchimento e analytics. Não criam URLs canônicas separadas.

## Etapa 1 — Intenção

Pergunta:

**O que você precisa?**

Opções iniciais:

- **Imprimir um arquivo 3D que já tenho**
- Criar uma placa personalizada
- Criar uma caixa sob medida
- Outro projeto

“Imprimir um arquivo 3D” é um branch próprio. Essa pessoa não deve atravessar perguntas de criação/modelagem que não se aplicam.

## Branch — impressão a partir de arquivo pronto

Ordem recomendada:

1. arquivo 3D;
2. quantidade;
3. escala/tamanho desejado, quando relevante;
4. preferência de material/cor ou **“não sei, preciso de orientação”**;
5. prazo desejado opcional;
6. observação curta;
7. contato;
8. revisão e envio.

Mensagem-chave:

> Envie o arquivo para análise. A produção depende da viabilidade do modelo e das condições do pedido.

Não prometer que todo arquivo enviado será aceito ou impresso.

## Etapa 2 — Ponto de partida para projeto personalizado

Pergunta:

**O que você já tem?**

Permitir múltipla escolha quando fizer sentido:

- arquivo 3D;
- logo/arte;
- foto ou referência;
- desenho;
- medidas;
- somente a ideia.

Esta etapa é um dos principais sinais de complexidade do lead.

## Etapa 3 — Perguntas específicas

### Impressão de arquivo pronto

Perguntas candidatas:

- Quantas unidades?
- Existe um tamanho/escala obrigatório?
- Tem preferência de material?
- Tem preferência de cor?
- Existe prazo desejado?
- Há alguma exigência funcional importante da peça?

Perguntas de modelagem, logo, QR, tampa ou encaixe só aparecem se realmente forem necessárias ao pedido.

### Placa

Perguntas candidatas:

- Qual o uso da placa?
- Texto, logo ou ambos?
- Precisa de QR Code?
- Precisa de Pix/Instagram/outro identificador?
- Tamanho aproximado?
- Quantidade?
- Como será usada: apoiada, parede, fixa, pendurada?
- Cores desejadas?
- Precisa de iluminação?

Não exibir perguntas irrelevantes.

### Caixa

Perguntas candidatas:

- O que precisa caber dentro?
- As medidas fornecidas são internas ou externas?
- Comprimento/largura/altura?
- Precisa de tampa?
- Precisa de encaixe?
- Precisa de divisórias?
- Precisa de passagem de cabo/furo?
- Precisa encaixar em outro objeto?
- Quantidade?

### Luminária

Somente quando a categoria estiver ativa:

- uso;
- dimensões;
- arte/logo;
- tipo de apoio/fixação;
- alimentação;
- referência visual.

### Outra peça

Perguntas curtas:

- O que a peça precisa fazer?
- Existe referência?
- Medidas aproximadas?
- Quantidade?

## Etapa 4 — Arquivos e referências

### Política V1 de seleção

Formatos aceitos:

- 3D: `.stl`, `.3mf`, `.obj`, `.step`, `.stp`;
- documento: `.pdf`;
- imagem: `.png`, `.jpg`, `.jpeg`, `.webp`.

Limites:

- até **5 arquivos** por solicitação;
- até **50 MB por arquivo**;
- até **100 MB no total**.

Não aceitar ZIP, executáveis ou G-code na V1. Compactação dificulta inspeção segura e G-code é saída de máquina, não fonte necessária para orçamento.

### Segurança

A validação no navegador existe apenas para feedback rápido. A política estrutural de arquivos e da solicitação deve ser reutilizada no runtime server, mas isso **não substitui a inspeção do conteúdo real** antes de qualquer persistência definitiva.

Requisitos de engenharia:

- extensão e MIME fornecido pelo navegador não são prova de formato;
- nome do arquivo não é confiável;
- armazenamento privado por padrão;
- **sessão anônima opaca e vinculada no servidor a cada orçamento**; o UUID ou a posse do arquivo, isoladamente, nunca autoriza acesso;
- cookie de sessão seguro e HttpOnly, verificação de Origin/CSRF e rejeição de acesso cruzado entre visitantes;
- **quota global de bytes reservados + armazenados**, além de limite por solicitação e rate limit;
- validar conteúdo/assinatura quando aplicável antes da gravação definitiva;
- não executar, renderizar ou interpretar arquivo enviado no processo de ingestão;
- não publicar anexos automaticamente;
- retenção e exclusão definidas antes de habilitar envio;
- proteção contra upload abusivo e volume excessivo;
- o registro do lead não deve depender de URL pública de arquivo.

## Etapa 5 — Produção

Coletar apenas o necessário:

- quantidade;
- prazo desejado, se houver;
- cidade/CEP ou modalidade logística quando isso já estiver definido operacionalmente;
- observações.

Não prometer prazo só porque o usuário informou uma data.

## Etapa 6 — Contato

Contato só aparece depois que o projeto já foi descrito.

Pergunta principal:

**Como podemos falar com você?**

Opções iniciais:

- WhatsApp;
- E-mail.

Mostrar somente o campo correspondente. Pedir outros dados apenas quando houver necessidade operacional real.



Campos mínimos:

- nome;
- escolha entre WhatsApp ou e-mail;
- somente o número **ou** o e-mail correspondente à escolha.

Cidade, CEP, estado e outros dados entram apenas quando houver necessidade operacional real. Evitar solicitar dados que não serão usados.

## Revisão antes do envio

Antes de enviar, mostrar um resumo legível com:

- tipo de projeto;
- medidas informadas;
- quantidade;
- opções relevantes;
- arquivos anexados;
- canal de contato.

Cada grupo deve permitir edição sem apagar as respostas já preenchidas.

## CTA final

Preferir:

**Enviar projeto para análise**

Evitar:

- “Comprar agora” em serviço sob medida;
- “Falar no WhatsApp” como primeira ação;
- texto que prometa orçamento instantâneo se houver análise manual.

## Upload — comportamento visual

Desktop:

- seletor normal sempre disponível;
- drag-and-drop pode complementar;
- limites/formats claros;
- anexos selecionados visíveis.

Mobile:

- usar o seletor nativo;
- não depender de drag-and-drop.

Referências:
- https://design-system.service.gov.uk/components/file-upload/
- https://design-system.dwp.gov.uk/contribute/file-upload/discoverable

## Confirmação

Depois do envio:

> Recebemos seu projeto. Vamos verificar as informações e, se houver dados suficientes para análise, seguimos pelo contato informado.

A copy final pode mudar, mas não deve prometer prazo ou aceite automático.

## Classificação interna inicial

A classificação pode começar simples:

### Pronto para analisar

Tem:

- tipo de peça;
- descrição suficiente;
- referência/arquivo ou medidas quando necessários;
- quantidade;
- contato.

### Faltam informações

Parece uma solicitação legítima, mas um dado essencial está ausente.

### Incompleto

Sem informação mínima para avaliação.

### Revisão manual / fora de escopo

A classificação estrutural não recusa projeto automaticamente. Quando a solicitação parecer fora do escopo operacional, contraditória ou ambígua, ela segue para decisão humana.

Não usar IA ou regras automáticas para recusar silenciosamente um cliente sem permitir revisão humana quando houver ambiguidade.

### Contrato técnico da solicitação

O payload interno usa `schemaVersion: 1` e não depende de URL pública de arquivo nem de um provider específico.

Antes da validação de negócio, o backend deve decodificar a entrada como `unknown` e aceitar somente o formato `schemaVersion: 1`.

A validação compartilhável cobre:

- versão e forma estrutural do payload;
- coerência entre tipo e detalhes do projeto;
- presença e política estrutural dos anexos;
- estado coerente entre “tenho referência” e “não tenho arquivo agora”;
- quantidade;
- preferência de material/acabamento quando o visitante declarar que possui uma;
- observação do arquivo pronto quando informada;
- dados mínimos específicos de placa/caixa/outro;
- nome e canal de contato;
- formato básico do e-mail ou WhatsApp.

A triagem estrutural inicial pode resultar em:

- `ready-for-review`;
- `needs-information`;
- `incomplete`.

“Revisão manual / fora de escopo” é uma decisão operacional posterior, não um status automático calculado pelo contrato.

Storage, sessão/posse anônima, persistência, retenção (Vercel Cron GET), limites globais, rate limiting e ingestão remota estão definidos no [contrato de infraestrutura Supabase](SUPABASE_INFRASTRUCTURE_V1.md). Definição aprovada não implica implementação/deploy.

Resumo vigente:

- **projeto Supabase CM na organização independente Cmangini3d**, com schema privado, bucket `quote-intake` e quota conservadora de 600 MB já aplicados; rotas reais e uploads ainda não;
- região contratada e confirmada `sa-east-1` (São Paulo);
- bucket privado `quote-intake`;
- upload direto por signed resumable upload/TUS;
- nenhum secret Supabase no browser;
- Route Handlers server-side como boundary do Orçamento, com sessão HttpOnly e autorização por posse;
- validação de conteúdo depois do upload e antes do submit;
- draft/upload órfão: 24 h;
- arquivos submetidos: 90 dias;
- conteúdo/contato do intake: 180 dias;
- eventos técnicos sem PII: 365 dias;
- limpeza por Vercel Cron GET autenticado por `CRON_SECRET`, somente depois de rota/segredos disponíveis.

O arquivo de infraestrutura é a autoridade para implementação desses itens.

## Continuidade por WhatsApp

WhatsApp entra depois da triagem.

Ao abrir conversa, preparar resumo interno:

- tipo;
- quantidade;
- medidas;
- referência;
- observações;
- ID da solicitação.

Objetivo: não obrigar o cliente a recontar tudo.

## Analytics

Eventos desejados:

- `quote_start`;
- `quote_type_selected`;
- `quote_step_completed`;
- `quote_file_added`;
- `quote_submit_success`;
- `quote_submit_error`;
- `quote_abandon` quando tecnicamente apropriado e sem rastreamento invasivo.

Dimensões úteis:

- origem;
- tipo de projeto;
- referência de projeto;
- dispositivo;
- etapa de abandono.

Nunca enviar conteúdo sensível, descrição completa do projeto, telefone, e-mail ou nome para analytics.

## SEO

A página `/studio/orcamento` pode ser indexável se tiver conteúdo útil próprio sobre como funciona a avaliação.

Estados internos, confirmações, parâmetros e anexos não são indexáveis.

A landing de serviço deve apontar para orçamento. O formulário não precisa carregar todo o conteúdo SEO do serviço.

## Acessibilidade

- labels reais;
- erros próximos ao campo;
- progresso não dependente apenas de cor;
- teclado;
- foco após mudança de etapa;
- upload acessível por botão, não só drag and drop;
- preservar dados ao voltar;
- não usar animação como requisito para avançar.

## Decisões abertas

O **contrato técnico** está definido em [SUPABASE_INFRASTRUCTURE_V1.md](SUPABASE_INFRASTRUCTURE_V1.md); **o projeto remoto, schema de Orçamento, bucket privado e reserva SQL já existem**. Ainda faltam handlers, upload TUS real, inspeção, retenção, secrets e smoke. Estado e evidências: [checklist E2](work/08-supabase-provisioning.md).

Continuam abertas apenas decisões de operação/comercial:

- quem recebe a triagem;
- SLA real de retorno;
- cobertura geográfica;
- modelagem a partir de ideia/foto/logo;
- logística/retirada.

## Critério de aceite

O fluxo está pronto quando:

- placa e caixa recebem perguntas diferentes;
- um visitante pode concluir sem WhatsApp;
- origem e referência podem chegar pré-preenchidas;
- anexos são privados e validados;
- outra sessão não consegue acessar, concluir upload nem enviar a solicitação;
- quota de arquivo/pedido **e quota global** são respeitadas sob concorrência;
- solicitação gera registro persistente;
- triagem é possível;
- confirmação não promete o que não existe;
- analytics mede funil sem PII;
- mobile e teclado funcionam.

