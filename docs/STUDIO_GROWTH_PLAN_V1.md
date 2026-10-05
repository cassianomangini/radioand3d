# Plano de crescimento do Estúdio — busca, prova, orçamento e produtos

Status: **canônico para a frente pública do Estúdio**  
Versão: **V1 — 04/10/2026**

Este documento define como o Estúdio de Impressão 3D deve crescer como produto público e como canal de aquisição. Ele não substitui o contrato visual da Rádio nem o roadmap geral. O estado macro continua em [ROADMAP.md](ROADMAP.md); a execução desta frente fica em [work/08-studio-growth.md](work/08-studio-growth.md).

## Objetivo

O Estúdio precisa cumprir três objetivos diferentes e mensuráveis:

1. **Impressões — chamar atenção e provar capacidade.**  
   A reação desejada é: “esses caras imprimem coisas muito legais”. A pessoa explora trabalhos reais, entende variedade, acabamento e possibilidades.
2. **Orçamento — transformar interesse em projeto qualificado.**  
   A pessoa explica o que precisa sem ser jogada diretamente para WhatsApp. O site coleta contexto suficiente para permitir triagem antes de qualquer contato manual.
3. **Produtos — transformar intenção de compra em venda.**  
   O site apresenta os produtos próprios com contexto, fotos e informações úteis; a Shopee continua sendo o checkout quando aplicável.

Esses três pilares não são cards equivalentes. Cada um atende uma intenção diferente: inspiração/prova, contratação e compra.

## Decisão estrutural

A versão anterior de `/studio` usava três entradas: **Impressões**, **Materiais & Cores** e **Loja Shopee**.

Esta V1 substitui esse recorte por:

- **Impressões**
- **Peça um orçamento**
- **Produtos**

**Materiais & Cores continuam importantes**, mas deixam de ser um pilar comercial de primeiro nível. Eles entram como conteúdo de apoio em trabalhos, páginas de serviço, produtos e orçamento.

## Serviço-base e especialidades prioritárias

O Estúdio não atende apenas projetos desenhados por nós. Existe um serviço-base separado:

1. **Impressão 3D sob demanda** — a pessoa já tem um arquivo 3D; o Estúdio analisa se o modelo é imprimível e, dependendo da peça, material, tamanho, quantidade e demais condições, pode produzir.
2. **Placas personalizadas** — especialidade comercial prioritária.
3. **Caixas personalizadas** — especialidade comercial prioritária.
4. Luminárias e outras categorias entram quando houver prova e conteúdo real suficientes.

A mensagem pública precisa deixar clara a diferença entre **“já tenho o arquivo e quero imprimir”** e **“preciso de uma peça/projeto personalizado”**.

A arquitetura deve permitir expansão sem criar páginas vazias ou genéricas.

## Arquitetura pública proposta

| URL | Papel | Estado pretendido |
| --- | --- | --- |
| `/studio` | Hub do Estúdio e distribuição para os três pilares | lançamento |
| `/studio/impressoes` | Galeria/prova do que saiu das impressoras | lançamento |
| `/studio/impressao-3d-sob-demanda` | Serviço para quem já possui arquivo 3D e quer análise/produção | lançamento |
| `/studio/placas-personalizadas` | Landing comercial prioritária | lançamento |
| `/studio/caixas-personalizadas` | Landing comercial prioritária | lançamento |
| `/studio/orcamento` | Fluxo progressivo de qualificação | lançamento |
| `/studio/produtos` | Catálogo próprio antes da Shopee | lançamento |
| `/studio/produtos/[slug]` | Página individual de produto | conforme produtos reais |
| `/studio/luminarias-personalizadas` | Landing secundária | depois de prova real suficiente |
| `/studio/projetos/[slug]` | Caso real aprofundado | crescimento, não requisito inicial |

Não criar uma rota apenas porque existe uma palavra-chave. Uma rota comercial só nasce quando há uma intenção distinta, conteúdo útil próprio e evidência suficiente para sustentar a página.

## Jornada 1 — Impressões

### Função

Impressões é **portfólio e prova**, não catálogo comercial.

Pode mostrar:

- peças pessoais;
- estudos;
- trabalhos de cliente autorizados;
- experimentos;
- conceitos visuais claramente identificados como conceitos;
- peças inspiradas em propriedade intelectual de terceiros quando houver base legítima para exibição.

### Regra de verdade

Distinguir sempre:

- **Impresso / produzido** — existe peça física e a mídia comprova;
- **Conceito / estudo** — proposta visual ainda não produzida;
- **Produto** — peça realmente oferecida comercialmente;
- **Projeto de cliente** — caso real com autorização de exposição.

Um conceito nunca deve ser apresentado como trabalho produzido.

### CTA

Quando uma peça servir de referência para projeto sob medida:

> Quero algo nessa linha

Esse CTA leva ao fluxo de orçamento com contexto, por exemplo:

`/studio/orcamento?tipo=placa&referencia=mano-jotta`

O formulário deve aproveitar a origem para evitar que a pessoa repita informações.

## Jornada 2 — Orçamento

O orçamento é a principal barreira contra contato ruim e a principal ponte para serviço personalizado.

Princípios:

- não usar WhatsApp como porta de entrada universal;
- não exigir um formulário longo e indiferenciado;
- fazer perguntas progressivas por tipo de projeto;
- aceitar referência visual e arquivos;
- pedir medidas, quantidade e contexto quando relevantes;
- classificar a solicitação antes de exigir atendimento manual;
- permitir que WhatsApp seja a **ferramenta de continuidade** depois da triagem, e não o primeiro filtro.

O contrato detalhado está em [STUDIO_QUOTE_FLOW_V1.md](STUDIO_QUOTE_FLOW_V1.md).

## Jornada 3 — Produtos

O site é a camada de descoberta e apresentação. A Shopee é a camada transacional quando o produto estiver publicado lá.

Fluxo preferido:

**Google / navegação interna → página própria do produto → Shopee**

Evitar:

**Google / Estúdio → link genérico para a loja → visitante precisa procurar tudo outra vez**

Cada produto próprio deve ter página indexável com informação real suficiente para justificar sua existência.

## Serviços prioritários

### Impressão 3D sob demanda

É o serviço mais direto para quem **já possui o arquivo 3D**.

A página deve comunicar sem rodeios:

- “Já tem o arquivo? Envie para análise.”
- o envio não garante produção automática;
- o Estúdio verifica se o modelo é imprimível no processo disponível;
- podem ser necessários ajustes de escala, orientação, material ou suporte;
- quantidade, cor/material e prazo desejado entram como contexto de orçamento;
- o cliente pode marcar “não sei” quando não dominar uma decisão técnica.

O CTA deve abrir o orçamento no branch de **arquivo pronto**, evitando que a pessoa responda perguntas de placa/caixa que não têm relação com o pedido.

Essa página não é modelagem 3D. Ela vende **capacidade de fabricação a partir de um arquivo existente**.

### Placas personalizadas

A página deve ser capaz de responder, com conteúdo real, a necessidades como:

- placa com logo;
- placa com QR Code;
- placa Pix;
- placa para balcão;
- placa para parede;
- display de mesa;
- nome ou identidade visual;
- sinalização;
- placa iluminada quando o Estúdio realmente oferecer esse tipo de solução.

Não usar a página como coleção artificial de palavras-chave. A linguagem deve partir de usos e exemplos reais.

### Caixas personalizadas

A página deve ser funcional e orientada ao problema:

- o que precisa caber;
- medida interna ou externa;
- tampa;
- encaixe;
- divisória;
- passagem para cabo;
- apoio;
- proteção;
- quantidade;
- restrições do objeto.

A proposta de valor é fabricação sob medida, não apenas “imprimir uma caixa”.

## Design e experiência como gate de produto

O Estúdio não deve ser implementado como coleção de cards e depois “embelezado”.

A composição parte da necessidade do visitante e do tipo correto de recurso:

- **fotografia real** quando precisamos provar peça, acabamento ou produto;
- **asset gráfico/diagrama** quando precisamos explicar dimensão, encaixe ou informação técnica;
- **texto HTML** para contexto, decisão e Search;
- **componente interativo** apenas quando há estado/comportamento real;
- **nada** quando o bloco só preencheria espaço.

### Direção do hub

`/studio` é hub, não outro hero e não catálogo completo.

Desktop: a superfície dominante da esquerda combina **Estúdio de Impressão 3D + Impressões**. **Orçamento** e **Produtos** ficam empilhados à direita. São exatamente três entradas visuais.

Mobile: ordem **Estúdio+Impressões → Orçamento → Produtos**.

A home termina depois desses três blocos. Serviços específicos continuam acessíveis por rotas e pelo orçamento, sem segunda grade na home.

### Direção do orçamento

O formulário deve funcionar como conversa guiada:

- começar pelo que a pessoa quer fazer, não pelo nome/telefone;
- mostrar apenas perguntas relevantes ao tipo de projeto;
- permitir “não sei ainda” e “preciso de ajuda nisso” quando apropriado;
- contato entra no final;
- upload usa seletor normal em qualquer dispositivo e drag-and-drop apenas como melhoria desktop;
- antes do envio, mostrar resumo editável;
- após envio, não empurrar o visitante automaticamente para WhatsApp.

### Direção de Produtos/Shopee

Nosso domínio apresenta e explica; a Shopee finaliza a compra.

- preview de produto é principalmente fotografia;
- página individual funciona como **ficha técnica visual**: galeria, vídeo quando útil, variações, dimensões externas/internas e ficha técnica legível;
- CTA comercial chama **Comprar na Shopee**;
- não existe carrinho, checkout próprio, quantity picker de compra ou “Adicionar ao carrinho”;
- deixar claro que pagamento/finalização acontecem externamente;
- não duplicar preço/estoque sem sincronização confiável;
- sem sincronização, não exibir preço/estoque possivelmente desatualizado; a Shopee continua sendo a fonte final.

### Regra de mídia versus CSS

CSS resolve layout, tipografia, espaçamento, responsividade, bordas, estados e transições simples.

CSS **não** deve improvisar fotografia, render de produto, diagrama técnico, textura física ou objeto 3D que deveria existir como asset real.

O handoff completo está em [STUDIO_COMMERCE_EXPERIENCE_V1.md](design/STUDIO_COMMERCE_EXPERIENCE_V1.md).

## Pesquisa e SEO como parte do produto

SEO não entra no final como checklist cosmético. Toda nova página comercial deve responder antes da implementação:

1. Qual intenção de pesquisa esta URL atende?
2. O conteúdo é diferente o bastante das outras páginas?
3. Qual prova real sustenta as afirmações?
4. Como o Google e o visitante chegam a esta URL?
5. Quais links internos entram e saem dela?
6. Que imagem é conteúdo indexável e não apenas decoração?
7. Que dados estruturados são verdadeiros e aplicáveis?
8. Qual conversão a página deve gerar?
9. Como essa conversão será medida?
10. Há risco de a página existir apenas para capturar uma variação de consulta?

O contrato técnico e as fontes oficiais estão em [STUDIO_SEARCH_DISCOVERY_V1.md](STUDIO_SEARCH_DISCOVERY_V1.md).

## Conteúdo que gera vantagem

Priorizar conteúdo que concorrentes não conseguem reproduzir honestamente:

- fotos reais das peças;
- medidas;
- material e acabamento;
- problema que precisava ser resolvido;
- processo de decisão;
- resultado;
- limitações;
- variações possíveis;
- contexto de uso;
- projeto antes/depois quando houver autorização.

Evitar produção em massa de artigos genéricos sobre impressão 3D apenas para aumentar contagem de páginas.

## Estratégia de imagem

Fotos de trabalhos são ativos de aquisição.

Regras:

- mídia principal relevante deve existir como imagem HTML rastreável, não apenas como fundo CSS;
- usar texto alternativo descritivo e natural;
- manter contexto textual próximo da imagem;
- servir imagem nítida e responsiva;
- evitar watermark agressivo que prejudique leitura da peça;
- nome de arquivo pode ser legível, mas não deve substituir `alt`, legenda ou contexto;
- considerar imagem em sitemap quando isso melhorar a descoberta.

## Estratégia de links internos

A hierarquia deve ser navegável por links HTML reais.

Exemplos:

`/studio`
→ impressão 3D sob demanda  
→ placas personalizadas  
→ caixas personalizadas  
→ impressões  
→ orçamento  
→ produtos

Uma impressão de placa pode ligar para:

**projeto real → placas personalizadas → orçamento**

Um produto pode ligar para:

**produto → material/acabamento relevante → outros produtos relacionados**

A navegação deve ajudar tanto a pessoa quanto o rastreador a entender a relação entre as páginas.

## Busca local

SEO local só entra com fatos operacionais corretos.

Antes de publicar informação local, decidir:

- o Estúdio recebe clientes fisicamente?
- existe endereço comercial apropriado para exposição pública?
- ou a operação é de área de serviço/entrega?
- quais regiões são realmente atendidas?

Não criar páginas quase idênticas para dezenas de cidades apenas para capturar buscas locais.

## Medição

O Search Console vira fonte principal para decisões de descoberta orgânica.

Acompanhar por URL e consulta:

- impressões;
- cliques;
- CTR;
- posição média como tendência, não como meta isolada;
- consultas com marca e sem marca;
- páginas que aparecem para uma consulta;
- crescimento em Google Imagens quando houver dados;
- páginas com muitas impressões e CTR ruim;
- novas consultas que revelem demandas ainda não cobertas.

Métricas de negócio do próprio site:

- entrada em orçamento;
- conclusão do orçamento;
- abandono por etapa;
- CTA “quero algo nessa linha”;
- visita à página de produto;
- clique para Shopee;
- origem da conversão por página/consulta quando tecnicamente possível.

## Fases de execução

### S1.0A — Contrato comercial e de aquisição

- [x] Fixar os três pilares: Impressões, Orçamento e Produtos.
- [x] Fixar Impressão 3D sob demanda como serviço-base e Placas/Caixas como especialidades prioritárias.
- [x] Tirar Materiais & Cores da posição de pilar de primeiro nível.
- [ ] Fechar decisões abertas listadas neste documento.
- [x] Criar o handoff de experiência [STUDIO_COMMERCE_EXPERIENCE_V1.md](design/STUDIO_COMMERCE_EXPERIENCE_V1.md).
- [ ] Aprovar o handoff visual antes de implementação visível substancial.

### S1.0B — Gate de experiência antes do frontend

O Estúdio **não** avança para composição visual final apenas porque rotas e conteúdo já estão definidos.

Antes de gastar CSS, fechar:

- wireframe do hub `/studio` em desktop e mobile;
- página de Placas em desktop e mobile;
- fluxo completo de Orçamento em wireframe e pelo menos uma etapa com direção visual final;
- página individual de Produto em desktop e mobile;
- inventário de fotos/assets existentes e faltantes;
- decisão explícita por bloco: **foto real / asset gráfico / texto HTML / componente / não existe**;
- comportamento mobile separado do desktop;
- hierarquia Shopee aprovada;
- componentes realmente necessários;
- lista do que o frontend não pode improvisar.

Artefato canônico: [STUDIO_COMMERCE_EXPERIENCE_V1.md](design/STUDIO_COMMERCE_EXPERIENCE_V1.md).

Enquanto esse artefato estiver com `ready_for_frontend: no`, trabalho técnico independente de Search/rotas pode avançar, mas **layout visível substancial não deve ser cristalizado em CSS**.

### S1.1 — Fundação técnica de Search

- indexação por ambiente;
- `robots.txt`;
- sitemap;
- canonical;
- metadata por rota;
- Open Graph;
- arquitetura `/studio/*` mantendo a Rádio;
- imagens rastreáveis;
- base de dados estruturados;
- instrumentação mínima.

### S1.2 — Hub `/studio`

- três caminhos inequívocos;
- prova visual real;
- sem excesso de explicação no topo;
- links reais para as páginas prioritárias.

### S1.3 — Impressões

- galeria real;
- diferença visível entre impresso, conceito e produto;
- CTA contextual para orçamento;
- estrutura preparada para casos futuros.

### S1.3B — Impressão 3D sob demanda

- página própria para quem já tem arquivo 3D;
- CTA “Enviar arquivo para análise”;
- branch de orçamento específico;
- sem exigir conhecimento técnico desnecessário;
- explicar que produção depende de análise;
- prova fotográfica de processo/peças reais quando disponível.

### S1.4 — Placas personalizadas

- página comercial própria;
- evidência real;
- perguntas e possibilidades específicas;
- ligação para projetos de placa e orçamento.

### S1.5 — Caixas personalizadas

- página comercial própria;
- foco em medidas, função e encaixe;
- ligação para orçamento contextual.

### S1.6 — Orçamento

- formulário progressivo;
- upload/referências;
- qualificação;
- confirmação e triagem;
- analytics do funil.

### S1.7 — Produtos

- catálogo interno;
- páginas individuais;
- direção visual individual aprovada em `docs/design/STUDIO_PRODUCT_PAGE_VISUAL_V1.md`;
- galeria real com foto/vídeo;
- variações reais e dimensões legíveis;
- link externo no nível do produto;
- CTA único **Comprar na Shopee**;
- sem carrinho/checkout interno;
- schema aplicável sem inventar checkout próprio.

### S1.8 — Gate de lançamento SEO

- produção indexável;
- preview não indexável;
- sitemap enviado;
- Search Console configurado;
- inspeção das URLs principais;
- Rich Results Test quando aplicável;
- Core Web Vitals e mobile;
- links e imagens verificáveis;
- nenhuma rota estratégica vazia.

### S1.9 — Crescimento por evidência

- usar Search Console para encontrar consultas reais;
- melhorar páginas com impressão alta e CTR baixa;
- criar novos casos reais;
- abrir novas páginas de serviço apenas quando a demanda e o conteúdo justificarem.

## Coisas que o frontend não pode inventar

- avaliações;
- clientes;
- números de produção;
- prazo;
- estoque;
- preço;
- áreas atendidas;
- materiais disponíveis;
- capacidade de modelagem;
- serviço de entrega;
- endereço comercial;
- categorias de produto;
- trabalhos produzidos que só existam como conceito;
- dados estruturados com informações que não aparecem de verdade na página.

## Decisões abertas

1. **Cobertura geográfica de projetos personalizados** — local/regional/Brasil.
2. **Modelagem** — até onde o Estúdio aceita começar de ideia, foto, logo ou desenho sem arquivo 3D pronto.
3. **Destino interno do orçamento** — armazenamento e painel/fluxo de triagem.
4. **Contato de continuidade** — e-mail, WhatsApp ou ambos depois da triagem.
5. **Perfil da Empresa no Google** — endereço físico público, operação híbrida ou área de serviço.
6. **Domínio público definitivo** — necessário para canonical, Search Console e produção.
7. **Fonte de produtos** — cadastro editorial no site ou leitura controlada de fonte já existente.

## Critério de sucesso

O Estúdio está cumprindo este plano quando:

- uma pessoa que não conhece a CM consegue entender rapidamente o que fazemos;
- vê prova real antes de precisar confiar em texto promocional;
- entende que pode enviar um arquivo 3D pronto para análise, além de encontrar páginas específicas para placas ou caixas;
- consegue explicar um projeto sem abrir WhatsApp;
- um lead chega com contexto suficiente para análise;
- um produto pode ser descoberto no nosso domínio antes da compra na Shopee;
- o Google consegue descobrir, rastrear e interpretar a hierarquia pública;
- Search Console passa a orientar novas decisões com consultas e páginas reais;
- a Rádio continua persistente sem tornar as páginas comerciais lentas ou opacas para Search.

