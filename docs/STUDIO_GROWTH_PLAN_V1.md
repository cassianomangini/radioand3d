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

## Prioridade comercial

O Estúdio pode produzir placas, caixas, luminárias e outras peças, mas a prioridade inicial é:

1. **Placas personalizadas**
2. **Caixas personalizadas**
3. Luminárias e outras categorias somente quando houver prova e conteúdo real suficientes

A arquitetura deve permitir expansão sem criar páginas vazias ou genéricas.

## Arquitetura pública proposta

| URL | Papel | Estado pretendido |
| --- | --- | --- |
| `/studio` | Hub do Estúdio e distribuição para os três pilares | lançamento |
| `/studio/impressoes` | Galeria/prova do que saiu das impressoras | lançamento |
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

### S1.0 — Contrato comercial e de aquisição

- [x] Fixar os três pilares: Impressões, Orçamento e Produtos.
- [x] Fixar Placas e Caixas como prioridades.
- [x] Tirar Materiais & Cores da posição de pilar de primeiro nível.
- [ ] Fechar decisões abertas listadas neste documento.

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
- link externo no nível do produto;
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
- encontra uma página específica para placas ou caixas;
- consegue explicar um projeto sem abrir WhatsApp;
- um lead chega com contexto suficiente para análise;
- um produto pode ser descoberto no nosso domínio antes da compra na Shopee;
- o Google consegue descobrir, rastrear e interpretar a hierarquia pública;
- Search Console passa a orientar novas decisões com consultas e páginas reais;
- a Rádio continua persistente sem tornar as páginas comerciais lentas ou opacas para Search.

