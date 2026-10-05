# Search Discovery & SEO Contract — Estúdio

Status: **canônico para descoberta orgânica do Estúdio**  
Versão: **V1 — 04/10/2026**

Este documento transforma SEO em requisito de produto e engenharia. Ele define o que precisa existir para o Google descobrir, rastrear, indexar, compreender e medir as páginas públicas do Estúdio.

Plano comercial relacionado: [STUDIO_GROWTH_PLAN_V1.md](STUDIO_GROWTH_PLAN_V1.md).

## 1. Modelo mental obrigatório

O Google Search deve ser tratado em etapas distintas:

1. **Descoberta** — a URL precisa ser encontrada.
2. **Rastreamento** — o Googlebot precisa conseguir requisitar a página.
3. **Renderização e indexação** — conteúdo, metadados, imagens, links e canonical precisam ser processáveis.
4. **Elegibilidade e exibição** — a página precisa atender uma intenção real e competir com outras páginas.
5. **Medição e iteração** — Search Console informa o que realmente está gerando impressões, cliques e consultas.

Nenhum item isolado — sitemap, schema, velocidade ou quantidade de palavras — garante ranking.

Fonte oficial: Google Search Central, “How Search Works”  
https://developers.google.com/search/docs/fundamentals/how-search-works

## 2. Regra de arquitetura

Uma URL pública deve existir porque atende uma intenção distinta e possui conteúdo próprio suficiente.

Arquitetura inicial:

- `/studio`
- `/studio/impressoes`
- `/studio/impressao-3d-sob-demanda`
- `/studio/placas-personalizadas`
- `/studio/caixas-personalizadas`
- `/studio/orcamento`
- `/studio/produtos`
- `/studio/produtos/[slug]`

Rotas futuras dependem de prova e demanda.

### Proibido

- páginas quase idênticas trocando apenas uma keyword;
- uma página para cada cidade sem conteúdo local real;
- repetir “impressão 3D”, “placa 3D” e variações de forma artificial;
- criar páginas vazias só para “começar a indexar”;
- criar FAQ fictícia sem dúvidas reais;
- gerar artigos em massa apenas para aumentar volume indexado.

Referência: políticas de spam do Google Search  
https://developers.google.com/search/docs/essentials/spam-policies

## 3. Estado atual e gate de indexação

O código atual contém `robots.index = false` e `robots.follow = false` no layout raiz.

### Decisão

- **desenvolvimento/preview**: continuar `noindex`;
- **produção aprovada**: permitir indexação;
- não remover `noindex` antes do gate de lançamento;
- não usar `robots.txt` como substituto de `noindex` para páginas que precisam ser acessíveis mas não indexadas.

Referência oficial sobre `noindex`:  
https://developers.google.com/search/docs/crawling-indexing/block-indexing

## 4. Descoberta e links rastreáveis

Todas as rotas estratégicas precisam ser alcançáveis por links HTML reais.

Exemplo de hierarquia:

`/studio`
→ `/studio/impressoes`  
→ `/studio/impressao-3d-sob-demanda`  
→ `/studio/placas-personalizadas`  
→ `/studio/caixas-personalizadas`  
→ `/studio/orcamento`  
→ `/studio/produtos`

Projetos e produtos devem ligar de volta para suas categorias e próximos passos.

Não depender apenas de handlers JS sem `href` para navegação estratégica.

Referência oficial: crawlable links  
https://developers.google.com/search/docs/crawling-indexing/links-crawlable

## 5. Sitemap

Criar sitemap apenas com URLs públicas indexáveis.

### Deve incluir

- hub do Estúdio;
- Impressões;
- serviços publicados;
- produtos publicados;
- data real de atualização quando existir fonte confiável;
- projetos/cases publicados quando existirem.

### Não deve incluir

- preview;
- rotas de gestão;
- rascunhos;
- páginas sem conteúdo;
- URLs de teste;
- filtros/estados que não são documentos canônicos.

Sitemap ajuda descoberta e monitoramento, mas não garante indexação ou posição.

Referência oficial:  
https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview

## 6. Canonical

Toda página estratégica precisa de canonical consistente para a URL pública definitiva.

Regras:

- uma página, uma canonical preferida;
- parâmetros de referência/orçamento não criam novas páginas canônicas;
- não canonicalizar páginas distintas de serviço para `/studio`;
- produto individual canonicaliza para sua própria URL;
- preview não deve competir com produção.

Referência oficial:  
https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls

## 7. Metadata

Cada página precisa de:

- `title` específico;
- description específica;
- canonical;
- Open Graph coerente;
- imagem social quando houver ativo aprovado.

### Regra de title

O title descreve a página primeiro e a marca depois.

Exemplos de direção, não copy final:

- `Placas personalizadas em impressão 3D | CM`
- `Caixas personalizadas sob medida | CM`
- `Produtos do Estúdio | CM`

Evitar títulos duplicados e stuffing.

## 8. Conteúdo people-first

Cada página precisa responder a uma necessidade real com conteúdo demonstrável.

Para serviços:

- problema que resolvemos;
- no caso de **Impressão 3D sob demanda**, deixar explícito que a intenção atendida é “já tenho um arquivo e quero fabricar”;
- exemplos reais;
- opções e limitações;
- processo;
- informações necessárias para orçamento;
- próximos passos.

Para projetos:

- contexto;
- resultado;
- fotos;
- dimensões/material quando publicáveis;
- o que foi personalizado;
- limitações e decisões relevantes.

Para produtos:

- fotos;
- uso;
- medidas;
- material;
- opções válidas;
- disponibilidade real;
- caminho de compra.

Referência oficial: Creating helpful, reliable, people-first content  
https://developers.google.com/search/docs/fundamentals/creating-helpful-content

## 9. Imagens como conteúdo de aquisição

Mídia importante deve ser rastreável e semanticamente ligada ao texto.

### Requisitos

- usar `<img>`/`next/image` para imagens de conteúdo;
- não esconder todas as provas em CSS background;
- `alt` descreve a imagem de forma natural;
- legenda quando ela acrescentar contexto;
- dimensões conhecidas para evitar layout shift;
- imagem responsiva;
- nome de arquivo legível quando possível;
- imagem de projeto próxima ao texto do projeto;
- considerar image sitemap quando útil;
- enquanto a mídia de Produto estiver hospedada apenas no CDN da Shopee, **não** publicar essas URLs em image sitemap do CM;
- image sitemap de Produtos entra quando os ativos públicos estiverem sob host controlado/verificável pela CM.

Referências oficiais:  
https://developers.google.com/search/docs/appearance/google-images  
https://developers.google.com/search/docs/crawling-indexing/sitemaps/image-sitemaps

## 10. Dados estruturados

Dados estruturados são auxiliares de entendimento e elegibilidade de rich results. Não inventar informação.

### Candidatos

- `Organization`;
- `LocalBusiness` quando a operação e os dados públicos justificarem;
- `BreadcrumbList`;
- `Product` em páginas de produto **somente** quando os campos reais e visíveis permitirem cumprir os requisitos aplicáveis;
- `WebSite` para identificar o site quando a produção estiver indexável;
- outros tipos somente após verificar elegibilidade e documentação oficial.

### Regras

- schema precisa refletir conteúdo visível;
- não marcar avaliação inexistente;
- não marcar preço/estoque não confirmado;
- não fingir checkout próprio se a compra acontece externamente;
- validar no Rich Results Test quando aplicável;
- não emitir `Product` apenas para “ter schema”: para snippet de produto, o Google exige `name` e pelo menos um entre `offers`, `review` ou `aggregateRating`;
- como o CM hoje não publica oferta/preço local e não possui avaliações próprias, o rich-result markup de `Product` fica **adiado** em vez de gerar marcação incompleta.

Referências oficiais:  
https://developers.google.com/search/docs/appearance/structured-data/search-gallery  
https://developers.google.com/search/docs/appearance/structured-data/product-snippet

## 11. Produtos e Shopee

A página própria do produto é a superfície de descoberta e contexto.

Fluxo preferido:

**Search → produto no domínio CM → Shopee**

A página precisa ter valor próprio mesmo que o checkout seja externo.

Não depender de página genérica “Loja Shopee” como destino final do tráfego orgânico.

## 12. Core Web Vitals e desempenho

A Rádio não pode degradar desnecessariamente as páginas comerciais.

Metas de referência do Google:

- LCP bom: até 2,5 s;
- INP bom: até 200 ms;
- CLS bom: até 0,1.

Essas métricas são parte da experiência de página, não um substituto para relevância.

Referência oficial:  
https://developers.google.com/search/docs/appearance/core-web-vitals

### Direção técnica

- conteúdo comercial renderizado cedo;
- mídia dimensionada;
- evitar bloquear conteúdo por áudio/animações;
- isolar estado dinâmico da Rádio sempre que possível;
- não exigir JS para conteúdo textual principal existir;
- avaliar impacto de Web Audio, visualizador e transições na interação.

## 13. Next.js — requisitos de implementação

O App Router oferece convenções próprias para:

- Metadata API;
- `robots.ts`;
- `sitemap.ts`;
- Open Graph images;
- canonical via metadata;
- Server Components para conteúdo indexável.

Referências:
- https://nextjs.org/docs/app/getting-started/metadata-and-og-images
- https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots
- https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap

### Problema atual a resolver

A aplicação usa um shell cliente persistente e o layout raiz atualmente chama `connection()` por necessidade da Rádio. O desenho final deve evitar que a aleatoriedade do player transforme toda página comercial em trabalho dinâmico desnecessário.

A solução técnica exata fica para implementação, mas o resultado exigido é:

- Rádio preserva continuidade;
- conteúdo comercial continua renderizável e rastreável;
- páginas não dependem do player para produzir HTML útil.

## 14. Search Console

Após domínio e produção:

1. verificar propriedade;
2. enviar sitemap;
3. inspecionar URLs estratégicas;
4. acompanhar cobertura/indexação;
5. usar Performance para consultas e páginas;
6. acompanhar mobile e Core Web Vitals;
7. investigar quedas ou páginas excluídas antes de “criar mais conteúdo”.

Métricas principais:

- clicks;
- impressions;
- CTR;
- average position;
- query;
- page;
- country/device quando relevante.

Referência oficial: Search Console Performance report  
https://support.google.com/webmasters/answer/7576553

## 15. Ciclo de otimização

Depois do lançamento:

1. observar consultas com impressões reais;
2. separar intenção correta de impressão acidental;
3. verificar qual página o Google está escolhendo;
4. melhorar title/copy/prova/linkagem quando necessário;
5. criar nova página apenas quando a intenção for distinta e houver conteúdo suficiente;
6. comparar período a período;
7. registrar decisões no plano.

Não perseguir posição diária de keyword isolada como métrica principal.

## 16. Google Images

Para o Estúdio, Google Images é canal estratégico porque o produto é visual.

Acompanhar:

- impressões e cliques que chegam por imagem quando disponíveis;
- quais tipos de peça aparecem;
- qualidade e enquadramento dos ativos;
- páginas que recebem tráfego por imagem;
- relação entre projeto visual e orçamento.

## 17. SEO local

Somente depois de fechar a operação:

- endereço público ou não;
- área de serviço;
- regiões realmente atendidas;
- retirada/entrega;
- categoria principal do negócio;
- dados consistentes entre site e Perfil da Empresa.

Não expor endereço residencial por conveniência de SEO.

Referências oficiais do Perfil da Empresa:
- ranking local: https://support.google.com/business/answer/7091
- diretrizes de endereço/área de serviço: https://support.google.com/business/answer/3038177

## 18. Recursos de IA no Google Search

Não criar uma “segunda camada de SEO para IA” separada do Search.

Princípios:

- conteúdo precisa estar indexável;
- mesma base técnica da Pesquisa;
- conteúdo original e útil continua prioritário;
- não implementar arquivos ou marcações experimentais como se fossem requisito de ranking;
- monitorar documentação oficial antes de adotar qualquer nova prática.

Referência oficial: AI features and your website  
https://developers.google.com/search/docs/appearance/ai-features

## 19. Checklist de lançamento

### Indexação

- [ ] domínio definitivo configurado;
- [ ] produção sem `noindex`;
- [ ] previews continuam `noindex`;
- [ ] `robots.txt` correto;
- [ ] sitemap correto;
- [ ] canonical por página.

### Conteúdo

- [ ] `/studio` explica a proposta;
- [ ] placas tem conteúdo e prova próprios;
- [ ] caixas tem conteúdo e prova próprios;
- [ ] Impressões tem mídia real;
- [ ] produto publicado tem informação suficiente;
- [ ] nenhum conceito é descrito como peça produzida.

### Imagens

- [ ] imagens importantes em HTML;
- [ ] alt útil;
- [ ] dimensões/responsividade;
- [ ] sem dados pessoais de cliente;
- [ ] mídia autorizada.

### Dados estruturados

- [ ] apenas schemas aplicáveis;
- [ ] campos conferem com conteúdo visível;
- [ ] validação feita.

### Performance

- [ ] mobile testado;
- [ ] conteúdo não bloqueado pelo player;
- [ ] sem CLS evidente;
- [ ] áudio + scroll + interação permanecem utilizáveis.

### Search Console

- [ ] propriedade verificada;
- [ ] sitemap enviado;
- [ ] URLs principais inspecionadas;
- [ ] baseline de métricas registrado.

## 20. Critério de aceite

A fundação de Search está pronta quando uma página estratégica:

- pode ser descoberta por link interno;
- aparece no sitemap;
- não está bloqueada em produção;
- possui canonical e metadata corretos;
- entrega conteúdo principal sem depender de interação;
- contém prova real;
- possui imagens rastreáveis quando aplicável;
- não usa schema enganoso;
- mantém desempenho aceitável com a Rádio ativa;
- pode ser inspecionada e medida no Search Console.

