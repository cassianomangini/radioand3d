# Fluxo de Orçamento do Estúdio

Status: **contrato de produto**  
Versão: **V1 — 04/10/2026**

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

Permitir anexos seguros de tipos aprovados, por exemplo:

- imagem;
- PDF;
- arquivo 3D quando suportado;
- outros formatos somente após validação.

Requisitos de engenharia:

- limite de tamanho;
- lista explícita de MIME/extensões;
- nome do arquivo não é confiável;
- armazenamento privado por padrão;
- não executar arquivo enviado;
- não publicar anexos automaticamente;
- retenção e exclusão definidas;
- proteção contra upload abusivo.

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

### Não atendido

Projeto claramente fora do escopo operacional definido.

Não usar IA ou regras automáticas para recusar silenciosamente um cliente sem permitir revisão humana quando houver ambiguidade.

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

- armazenamento/backend;
- limite de arquivo;
- formatos aceitos;
- retenção;
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
- solicitação gera registro persistente;
- triagem é possível;
- confirmação não promete o que não existe;
- analytics mede funil sem PII;
- mobile e teclado funcionam.

