# Evolução do fluxo de orçamentos — P0, P1, P2 e Futuro

**Projeto:** CM 3D & Rádio  
**Área:** /orcamentos  
**Referência:** docs/PLANO_ORCAMENTOS.md e implementação vigente na main  
**Tipo:** especificação de próximas entregas; não é código implementado  
**Direção aprovada:** o fluxo é permanente, sem formulário exclusivo de Natal. Campanhas sazonais alteram apresentação e chamadas, não o contrato central do pedido.  
**Ordem:** finalizar e validar o ticket de correções em andamento → P0 → P1 → P2 → Futuro.

## 0. Premissas e separação do trabalho em andamento

### Fora deste plano: ticket que outro agente já está executando

Não reabrir nem duplicar como nova entrega:
- Corrigir a falha de Cloudflare Turnstile, diagnosticar sua causa, permitir nova tentativa sem reiniciar o pedido e preservar a validação no servidor.
- Persistir/restaurar o rascunho após atualização acidental, sem armazenar token de captcha ou o conteúdo dos arquivos locais.
- Aceitar inicialmente **um** arquivo STL/3MF **ou** **um** link válido MakerWorld/Bambu Handy para a modalidade “Imprimir meu arquivo 3D”.

**Dependência:** antes de iniciar P0, conferir o estado real da main e o resultado do ticket anterior; não assumir que ele foi concluído só porque o código existe. Preservar os contratos/medidas de segurança que estiverem em produção. Não sobrescrever o trabalho concorrente.

### Princípios invariáveis

1. Preservar as quatro entradas: **Caixa personalizada**, **Placa personalizada**, **Imprimir meu arquivo 3D** e **Outro projeto**.
2. Preservar o conceito de três etapas: escolher → personalizar → contato/entrega/revisão; grupos internos são permitidos, um questionário longo não.
3. O cliente não precisa conhecer termos técnicos, filamentos, fatiamento ou medidas exatas para pedir análise.
4. Não há preço automático, checkout, pagamento, conta de usuário nem promessa de prazo de produção.
5. Pedido rápido e passo a passo de caixas/placas continuam disponíveis; não transplantar perguntas de impressão para essas categorias.
6. Um orçamento é uma solicitação comercial, não um compromisso automático de fabricação; o estúdio analisa viabilidade técnica, preço, prazo e eventuais restrições aplicáveis.
7. Reutilizar identidade visual e componentes aprovados do Estúdio. Desktop, mobile e comportamento da Rádio não podem regredir.
8. Novas validações precisam existir no servidor, não apenas no navegador; não expor credenciais, arquivos privados ou dados de contato em analytics.

## P0 — Pedido de impressão com múltiplos modelos

**Objetivo:** permitir que um cliente envie, por exemplo, 15 links do MakerWorld com quantidades e cores diferentes e conclua **um único orçamento**, sem repetir cadastro e entrega 15 vezes.

**Escopo:** somente o tipo “Imprimir meu arquivo 3D”. Os outros três tipos permanecem com o comportamento atual, salvo compatibilidade de componentes compartilhados.

### P0.1 — Lista de modelos: links e arquivos no mesmo orçamento

**Interface**
- Trocar a entrada de modelo único por uma lista de itens: “Adicione os modelos que deseja imprimir”.
- Permitir adicionar um link individual, colar vários links de uma só vez **um por linha** e selecionar STL/3MF locais. Links e arquivos podem coexistir no mesmo orçamento.
- Ao colar vários links: ignorar linhas vazias; validar cada linha; adicionar somente os válidos; apontar a linha e o motivo dos inválidos sem apagar os válidos.
- Mostrar uma linha/cartão compacto por modelo, numerado (Modelo 01, Modelo 02…), com origem (link ou nome de arquivo), ações **Editar** e **Remover**. Nome/título descritivo opcional; não inventar título nem imagem do MakerWorld.
- Permitir corrigir um link, substituir um arquivo antes do envio, reordenar itens se tecnicamente simples e remover sem limpar os demais.
- Alertar quando o mesmo link aparecer novamente; permitir manter duplicado conscientemente se o cliente precisar de configurações diferentes. Não fundir automaticamente pedidos.
- Mostrar contagem dos modelos e unidades no resumo. Não mostrar “20 arquivos disponíveis” quando o limite de upload for menor.
- **Exigir entre 1 e 20 modelos por solicitação** (limite inicial comercial, revisável após dados de uso).

**Limites de arquivo a preservar inicialmente**
- Manter **até 5 arquivos por pedido, 50 MB por arquivo e 100 MB no total**, conforme política atual. Os demais itens, até completar 20 modelos, podem ser links.
- Os limites valem para o pedido inteiro, não para cada item. A UI deve explicar separadamente “até 20 modelos” e “até 5 arquivos”.
- Não elevar limites de upload sem revisar cotas, reservas, armazenamento, validação, limpeza, rate limit, retenção e custo; se for necessário receber 15 arquivos STL/3MF, isso constitui decisão e implementação separadas.

**Links**
- Partir dos domínios/caminhos já aceitos no código vigente (MakerWorld e compartilhamento Bambu Lab); não adicionar domínios ou encurtadores genéricos por suposição.
- Exigir HTTPS, URL completa, tamanho limitado, sem credenciais embutidas. Validar no backend com a mesma regra do frontend.
- O link é **referência para avaliação humana**. Não baixar automaticamente o modelo, não visitar links arbitrários no servidor, não executar arquivo e não extrair metadados nesta fase.
- Links inválidos não podem bloquear toda a lista sem indicação do item que precisa ser corrigido.

### P0.2 — Especificações por item e padrões opcionais

Cada modelo terá:
- **Identificador estável** dentro do pedido (não usar o índice da lista como identidade).
- **Origem**: link validado ou arquivo STL/3MF anexado e associado ao item.
- **Quantidade**: inteiro positivo, padrão 1, dentro dos limites de validação do sistema.
- **Cores**: até quatro cores **por modelo** ou “Ainda não decidi”, mantendo o padrão atual de seleção; cores diferentes entre modelos são permitidas.
- **Tamanho/escala**: manter original, solicitar alteração (medida(s) em cm) ou “Ainda não sei”. Não exigir medidas se o cliente quiser o tamanho original ou não souber.
- **Observações opcionais**: instruções de acabamento, encaixe, resistência ou preferência que afetem aquele modelo.

**Preferências em lote**
- Oferecer “Usar as mesmas preferências nos modelos” para cor e tamanho, sem obrigar o cliente a configurar 15 vezes.
- Permitir personalizar exceções por item posteriormente. Alterar o padrão do pedido **não deve sobrescrever silenciosamente** itens que já foram personalizados.
- A quantidade geral do pedido deixa de ser a fonte de verdade para impressão múltipla: o total de unidades é calculado pela soma das quantidades dos itens, com validação contra estouro de números.
- Não impor “máximo de quatro cores no pedido inteiro”; o limite de quatro aplica-se a cada peça/modelo nas condições de produção previstas.

### P0.3 — Contrato, armazenamento, uploads e compatibilidade

**Modelo lógico esperado** (nomes definitivos devem ser alinhados ao código atual):
- Um pedido de tipo impressão contém uma coleção ordenada **modelItems**, com no máximo 20 entradas.
- Cada entrada contém itemId, sourceType (link/file), link validado ou attachmentId correspondente, quantity, colorMode/colors, scaleMode/dimensions, notes e uma indicação das preferências indefinidas.
- Contato, método de entrega e CEP permanecem em nível de **pedido**, não repetidos nos itens.
- Um arquivo anexado deve pertencer ao mesmo rascunho/sessão do cliente e estar associado a um item; uma referência de anexo não pode apontar para arquivo de outro pedido.
- Avaliar a persistência existente (dados estruturados do projeto/produção, IDs de anexos e gateway Supabase). Ajustar os contratos de leitura, gravação e notificação, com validação de estrutura, cardinalidade e limites.
- Garantir compatibilidade de leitura com os pedidos antigos de um único link ou arquivo. Não migrar destrutivamente os históricos nem transformar um pedido antigo em vinte itens fictícios.
- Manter o fluxo atômico de finalização, chaves de idempotência e envio de e-mail associado a um único requestId; retry não pode duplicar o orçamento nem os anexos.
- Quando o rascunho for restaurado após reload, preservar links, ordem, quantidades e opções, mas pedir novamente os arquivos locais que não possam ser recuperados; nunca fingir que um arquivo foi anexado.
- Evitar carregar arquivos em sessionStorage/localStorage. Não persistir tokens Turnstile.
- Validar limites de payload, comprimento por campo, total de texto e número de entradas **antes** de gravar ou enviar e-mail; garantir que 20 itens válidos não sejam rejeitados por limite interno de tamanho da mensagem.
- Tratar links/textos de clientes como dados não confiáveis: escapar HTML no e-mail e no resumo, não inserir conteúdo bruto como HTML, validar URL de destino antes de transformá-la em link clicável.
- Preservar regras atuais de reserva, inspeção de arquivos, armazenamento privado, rate limiting e expiração; não criar atalho de upload para suportar múltiplos itens.

### P0.4 — Revisão, e-mail e confirmação

**Revisão final**
- Exibir cada item numerado com origem, quantidade, cores, tamanho e observações; ações para editar o item diretamente.
- Mostrar resumo global: **N modelos / M unidades**, contato, data desejada (quando P1 estiver ativo) e entrega.
- Deixar claro que valores e viabilidade serão analisados manualmente.

**Notificação ao estúdio**
- Um único e-mail para um único orçamento, com a mesma ordem dos itens mostrada ao cliente.
- Para cada item: número, link HTTPS clicável validado ou arquivo identificado com seu anexo privado, quantidade, cores, escala, medidas e observações.
- Informar totais de modelos/unidades e dados de entrega uma vez só.
- O HTML e a versão texto devem ser legíveis com 15–20 modelos. Adaptar limites de tamanho da mensagem e testar pior caso, sem silenciosamente descartar itens.
- Não anexar arquivos brutos ao e-mail nem publicar o bucket; preservar o mecanismo seguro de acesso já existente.

**Sucesso**
- Exibir confirmação somente após registro real; número de pedido apenas quando fornecido pelo backend.
- Se a notificação falhar após o banco confirmar, manter pedido e reprocessar e-mail sem gerar novo orçamento.

### P0.5 — Critérios de aceite e testes

- [ ] Um cliente consegue colar 15 links válidos, configurar 15 itens e concluir **um único orçamento**.
- [ ] Um pedido com 3 links + 2 STL/3MF funciona, inclusive upload, revisão, gravação e e-mail.
- [ ] Uma linha inválida na colagem em massa mostra erro localizado e não elimina os links válidos.
- [ ] É possível adicionar, editar, remover e manter conscientemente um link duplicado com configurações diferentes.
- [ ] Quantidade, cor e tamanho por modelo não interferem nas configurações de outros itens.
- [ ] Limites de 20 modelos e 5 arquivos, 50 MB por arquivo e 100 MB totais são aplicados no cliente e servidor.
- [ ] Não é possível referenciar anexo de outro pedido ou criar itens sem origem válida.
- [ ] Rascunho recupera dados textuais de múltiplos itens após reload e avisa sobre necessidade de selecionar novamente arquivos locais.
- [ ] Reenvio/retry de um pedido já finalizado não cria duplicidade.
- [ ] O e-mail contém **todos** os itens em ordem, com links clicáveis seguros; testar 20 itens e campos próximos dos limites máximos.
- [ ] Um pedido antigo com modelo único continua legível.
- [ ] Caixa, placa e outro projeto não sofrem regressão; validar desktop e mobile (incluindo ~390 px), teclado, erros e estados vazios.

**Entregas recomendadas em PRs pequenos:** P0-A (modelo/contrato/servidor/compatibilidade), P0-B (lista e UX de múltiplos itens), P0-C (resumo/e-mail/testes de ponta a ponta). Só concluir P0 com os três integrados, sem fragmentar funcionalidade visível pela metade.

## P1 — Condições direcionadas, prazo, entrega e refinamento de UX

**Objetivo:** melhorar qualidade das solicitações e a proteção proporcional do serviço, sem transformar o orçamento de caixas/placas em um termo jurídico.

### P1.1 — Aceite específico de impressão sob demanda

- Exigir **um checkbox desmarcado por padrão**, somente para pedidos da categoria **Imprimir meu arquivo 3D**, sejam por link, STL, 3MF ou uma combinação.
- Texto curto proposto (sujeito a revisão jurídica): **“Confirmo que tenho autorização para solicitar a impressão dos modelos enviados e estou ciente de que o pedido será analisado quanto à viabilidade técnica e às condições do serviço.”**
- Mostrar o aceite na revisão, imediatamente antes da confirmação; incluir acesso às condições do serviço sem abrir parede de texto.
- Armazenar no backend a versão exata do termo aceito e o horário de aceite atribuído pelo **servidor**, associados ao requestId. Validar obrigatoriedade no servidor para esse tipo de projeto; nunca confiar apenas no checkbox visual.
- Não adicionar esse checkbox genericamente a **Caixa personalizada**, **Placa personalizada** ou **Outro projeto**.
- Quando o usuário enviar **fotos de referência** nos outros fluxos, mostrar somente aviso contextual, por exemplo: **“Envie fotos ou imagens que você tenha autorização para compartilhar.”** Não exigir aceite extra por foto comum.
- Quando a solicitação for explicitamente reproduzir logotipo, personagem ou arte de terceiro, avaliar aviso/declaração contextual própria **apenas naquele caso**. Não presumir infração nem submeter todo pedido a questionário jurídico.
- Ter uma página curta de condições do serviço: objeto da prestação de impressão, análise de viabilidade, autorização de uso da referência, variações/tolerâncias FDM, orçamento, pagamento, cancelamento e possibilidade de recusa fundamentada. Texto contratual requer validação jurídica antes da publicação.
- Não apresentar a declaração como imunidade jurídica nem tratar dados contratuais como consentimento de marketing ou autorização genérica para compartilhar os arquivos.

### P1.2 — Prazo desejado (opcional)

- Perguntar **“Precisa para alguma data?”** com resposta simples **“Não tenho data”** ou seleção de data.
- Campo disponível onde fizer sentido nas quatro categorias; não exigir resposta complexa para avançar e não prometer atendimento do prazo.
- Validar data real, não anterior ao dia corrente considerado no fuso **America/Sao_Paulo**, tanto no cliente quanto no servidor; deixar rascunhos antigos sem data válidos.
- Registrar no pedido e destacar no e-mail para permitir priorização manual. Para envio, data é **desejada de recebimento**, não garantia de postagem ou entrega.
- Copy de apoio: **“Vamos verificar se conseguimos atender essa data junto com o orçamento.”**

### P1.3 — Entrega mais simples

- Trocar rótulos voltados ao cliente por **“Retirar em São Caetano do Sul”** e **“Receber em casa”**.
- Coletar CEP apenas para envio; não exigir endereço completo na solicitação inicial.
- Definir Correios ou Shopee **após analisar o pedido**; não obrigar o cliente a conhecer o canal de despacho.
- Preservar, quando possível, o contrato interno atual de delivery=retirada/envio, alterando a apresentação e o texto, sem migration desnecessária.
- Não apresentar preço de frete, prazo garantido ou checkout fictício.

### P1.4 — Melhorias nas quatro jornadas

- Manter cada pergunta pertinente ao tipo de projeto e o caminho rápido/detalhado de caixa e placa, sem adicionar formulários excessivos.
- Destacar respostas simples: **Não sei**, **Ainda não decidi**, **Quero tamanho original**, conforme contexto e regra já existente.
- Revisão editável que leva diretamente à pergunta/grupo correto, sem obrigar o cliente a percorrer todo o fluxo novamente; editar e voltar preserva o restante.
- Mensagens de erro próximas aos campos, com foco visível, descrição clara e preservação das respostas. Evitar modais desnecessários.
- Ajustar legibilidade, hierarquia, tamanho dos controles de toque e espaçamento, mantendo a estética do Estúdio. Não alterar a composição aprovada da Rádio.
- Usar os três passos existentes como orientação de progresso, sem exibir 15 cards de modelos como 15 etapas independentes.
- Confirmar sucesso só após resposta válida do backend; manter botão e feedback coerentes durante upload/verificação/envio.
- Se instrumentar funil de conversão, registrar apenas eventos agregados (tipo de projeto, passo iniciado/concluído, motivo técnico de falha), **sem nome, contato, links de modelos, descrições ou conteúdo de arquivos**.

### P1.5 — Critérios de aceite

- [ ] Checkbox obrigatório somente no tipo impressão; servidor rejeita pedido de impressão sem aceite válido e armazena versão/horário do texto.
- [ ] Caixa simples por foto/descrição não recebe checkbox de direitos autorais; referências visuais mostram apenas aviso contextual.
- [ ] Um pedido com arte explicitamente de terceiro recebe orientação pertinente sem criar bloqueio universal de caixas/placas.
- [ ] Prazo opcional é salvo e aparece na revisão e no e-mail; data inválida é rejeitada; ausência não impede orçamento.
- [ ] Entrega usa os novos rótulos e mantém CEP apenas para envio; canal de despacho fica para avaliação posterior.
- [ ] Os quatro caminhos passam em testes de navegação, edição, retorno, erro, teclado e mobile, sem regressão.
- [ ] Não há dupla solicitação nem sucesso fictício após falha de comunicação.

**Sequência indicada:** P1-A (regras/termos e backend) → P1-B (prazo e entrega) → P1-C (acabamento de UX e testes).

## P2 — Campanhas sazonais sem novo formulário

**Objetivo:** aproveitar datas como Natal para gerar interesse, preservando a mesma rota e o mesmo sistema de orçamentos.

### Implementar

- Trocar ou destacar **fotografia aprovada**, chamada comercial e CTA em superfícies do Estúdio/Home, sem alterar a estrutura dos quatro tipos de orçamento.
- Exemplo de chamada sazonal: **“Encontrou modelos para decorar sua casa? Envie os links e peça tudo em um orçamento.”** Ajustar linguagem conforme campanha real.
- CTA da campanha leva ao fluxo normal de impressão (é possível pré-selecionar o tipo por um parâmetro seguro, se a experiência existente suportar), sem rota/formulário Natal exclusivo.
- Criar mecanismo simples e reversível para ativar/desativar criativos sazonais; evitar deixar mensagem de Natal publicada fora de época.
- Preservar URLs estáveis, SEO, acessibilidade, alt text e desempenho; usar apenas imagens reais/aprovadas e não inventar portfólio, preços ou disponibilidade.
- Medir visitas e cliques da campanha de forma agregada, sem capturar links/arquivos/dados pessoais.

### Critérios de aceite

- [ ] Ao entrar pela campanha, cliente segue o mesmo fluxo comum e pode pedir qualquer modelo, não apenas Natal.
- [ ] Ativar/desativar campanha não altera schema, validação, pagamento, e-mail ou entrega.
- [ ] Visual responde bem no desktop e mobile; texto/foto podem ser revertidos facilmente.
- [ ] Fora da campanha o conteúdo permanente continua correto.

**Dependência:** executar somente depois de estabilizar P0 e a revisão essencial de P1, salvo se houver oportunidade comercial explícita que justifique mudar a ordem sem comprometer o formulário.

## Futuro — automações condicionadas ao volume real

### F1. Reconhecimento assistido de modelos por link

- Exibir nome e imagem do modelo apenas quando obtidos por fonte **autorizada e confiável**, com respeito aos termos da plataforma e à disponibilidade real da informação.
- Primeiro verificar suporte oficial do MakerWorld/Bambu Lab, autorização, limites de uso, custo e políticas de cache. Não criar scraper ou download automatizado como atalho.
- Se metadata falhar, o fluxo manual por URL continua funcionando; título e imagem jamais são condição para enviar um orçamento.
- Manter proteção contra SSRF, URLs internas, redirects inseguros, arquivos maliciosos e vazamento de dados.

### F2. Painel privado de gestão e precificação

- Apenas quando o volume justificar: fila de pedidos, triagem, situação, prazos, materiais, tempo de máquina, estimativa de custo, proposta e acompanhamento.
- Manter administração autenticada/autorizada, isolamento de dados, trilha de auditoria e retenção definida; nunca expor orçamento, arquivos ou contato em rota pública.
- Não implementar simulador de preço final para o cliente antes de existir base de custos validada e processo operacional estável.

## Ordem operacional e definição de concluído

| Marco | Resultado que precisa existir antes de avançar |
| --- | --- |
| Ticket anterior | Fluxo básico funcional; Turnstile recuperável, rascunho recuperável, um link ou arquivo aceito; evidência de testes |
| P0 | Pedido de 15 links/itens mistos enviado como **um** orçamento com especificações e notificação completas; segurança e compatibilidade verificadas |
| P1 | Condições direcionadas, prazo opcional, entrega simples e quatro jornadas revisadas sem novos atritos |
| P2 | Campanha reversível que usa o mesmo formulário |
| Futuro | Somente após métricas, necessidade operacional e validação de integrações |

### Validação de cada entrega

1. Rebase/atualização sobre a **main real**, inspecionar primeiro as alterações anteriores. Evitar sobrescrever modificações do outro agente.
2. Cobrir frontend, contrato servidor, persistência, notificação e erros nas partes afetadas; testes unitários e de integração com cenários reais e extremos.
3. Rodar as verificações existentes (lint, typecheck, testes e build) e **informar quais realmente foram executadas**, sem declarar resultado presumido.
4. Verificar render e interação em desktop e mobile, com foco, teclado, leitores de tela quando disponível e conexão instável.
5. Validar ao menos um envio ponta a ponta em ambiente autorizado, sem disparar pedidos reais de teste para o atendimento sem identificação/limpeza apropriadas.
6. Entregar mudanças de código por PR com resumo, riscos, evidências e eventuais migrações/configurações. **Não inferir autorização de deploy/merge de produção a partir deste documento.**

### Arquivos/componentes a revisar na execução

- src/app/orcamentos/quote-flow.tsx
- src/features/quote/model-link.ts
- src/features/quote/file-policy.ts
- src/features/quote/client-upload.ts
- src/server/quote/form-contract.ts
- src/server/quote/handlers.ts
- src/server/quote/email.ts
- src/server/quote/supabase-gateway.ts
- tests/quote-*.test.cjs e demais testes relevantes

**Estado deste documento:** planejamento de implementação. Nenhuma funcionalidade descrita aqui deve ser considerada entregue sem mudança de código, teste e validação próprios.
