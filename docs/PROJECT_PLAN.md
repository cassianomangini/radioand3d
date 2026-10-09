# Plano do produto

## Propósito

Uma identidade CM conectando objetos físicos e música. A pessoa pode conhecer peças, ver trabalhos reais, pedir avaliação de um projeto personalizado, comprar produtos publicados e ouvir o acervo enquanto navega.

Este é o contrato de escopo. A sequência e o estado das entregas ficam apenas no [roadmap](ROADMAP.md).

## Requisitos confirmados por Cassiano

- Identidade CM própria, sem astronauta ou reaproveitamento automático da estética Artesopolis.
- Experiência viva, com muitas animações e boa apresentação em computador e celular.
- Rádio inspirada no Winamp, com tecnologia atual.
- No mobile, mini player persistente; no desktop, a Rádio completa/acoplada é a interface de reprodução visível. Ambos usam o mesmo motor e a mesma fila.
- No desktop, o 3D e a rádio formam uma composição integrada; a rádio pode ganhar largura por arraste e por ação explícita de expandir/recolher.
- No mobile, o mini player aparece logo abaixo do header e a experiência de Estúdio de Impressão 3D começa imediatamente abaixo dele.
- O Estúdio público se organiza em três pilares: **Impressões, Orçamento e Produtos**.
- **Impressões** prova capacidade e inspira; **Orçamento** qualifica projeto personalizado sem abrir WhatsApp para qualquer visitante; **Produtos** apresenta itens próprios antes do checkout externo.
- Impressão 3D sob demanda para quem já tem arquivo é um serviço-base explícito. Placas e caixas são as especialidades comerciais iniciais. Luminárias e outras categorias entram quando houver prova real suficiente.
- Materiais e cores continuam relevantes, mas como conteúdo de apoio dentro de projetos, serviços, produtos e orçamento.
- Produtos, fotos, materiais e projetos reais entram gradualmente, sem conteúdo fictício usado apenas para preencher a tela.
- Search/SEO faz parte da arquitetura do produto, não é uma tarefa cosmética no final.
- Reduzir o trabalho manual entre criação no Suno e publicação no site.
- Rever criticamente o legado antes de reaproveitar código.
- Agentes, padrões e checklists que permitam continuar o projeto entre sessões.

## Recorte inicial proposto

| Área | Primeira experiência útil | Contrato |
| --- | --- | --- |
| Home / Estúdio | Apresentar claramente Estúdio de Impressão 3D e CM Rádio como duas partes da mesma experiência | [Experiência](EXPERIENCE.md) |
| Hub do Estúdio | Distribuir para Impressões, Orçamento e Produtos, sem parecer grade genérica de features | [Plano do Estúdio](STUDIO_GROWTH_PLAN_V1.md) |
| Impressões | Mostrar trabalhos reais e conceitos claramente identificados; gerar prova antes da venda | [Catálogo 3D](CATALOG_3D.md) |
| Impressão sob demanda | Página para quem já tem arquivo 3D e quer análise/fabricação | [Plano do Estúdio](STUDIO_GROWTH_PLAN_V1.md) |
| Placas | Landing comercial prioritária | [Plano do Estúdio](STUDIO_GROWTH_PLAN_V1.md) |
| Caixas | Segunda landing comercial prioritária | [Plano do Estúdio](STUDIO_GROWTH_PLAN_V1.md) |
| Orçamento | Fluxo progressivo por tipo de projeto, com referências/anexos e triagem | [Fluxo de Orçamento](STUDIO_QUOTE_FLOW_V1.md) |
| Produtos | Catálogo próprio com página individual e link Shopee no nível do item | [Catálogo 3D](CATALOG_3D.md) |
| Search | Descoberta, rastreamento, indexação, imagens, metadata e medição | [Search Discovery](STUDIO_SEARCH_DISCOVERY_V1.md) |
| Biblioteca privada | Importar em lote, revisar versões e publicar sem editar JSON ou Git | [Biblioteca](MUSIC_PIPELINE.md) |
| CM Radio | Acervo selecionável, mini/full sincronizados e visualizador real | [Rádio](RADIO.md) |

A V1 é pública para ouvir, explorar e converter. Somente gestão exige login do proprietário. Checkout próprio não é requisito: quando aplicável, a Shopee continua como camada transacional.

## Primeiro marco integrado

O primeiro marco visível entrega duas frentes bem acabadas:

1. **CM Rádio funcional e visualmente pronta**, com Rádio completa no desktop e mini player no mobile compartilhando a mesma reprodução, seleção manual de músicas, shuffle e visualizador.
2. **Estúdio público funcional**, com hero, três pilares, páginas comerciais prioritárias, caminho de orçamento e catálogo de produtos construídos apenas com conteúdo real.

Desktop: o Estúdio ocupa a área principal e a Rádio completa aparece acoplada à direita, com ação de expandir/recolher e redimensionamento quando suportado pela interação aprovada. **Não existe mini player adicional no desktop.**

Mobile: header, mini player compacto e, logo abaixo, a entrada do Estúdio. A rádio completa abre sob demanda.

O marco exige validação de ponta a ponta em desktop e mobile: reprodução, continuidade, expansão/recolhimento da rádio, navegação, conteúdo do Estúdio e composição responsiva.

## Aquisição orgânica

O Estúdio precisa ser encontrável por quem ainda não conhece a CM.

Regras:

- produção indexável somente no gate de lançamento;
- preview/desenvolvimento continuam `noindex`;
- páginas existem por intenção real, não por variação artificial de keyword;
- links internos e sitemap ajudam descoberta;
- cada página comercial recebe metadata e canonical próprios;
- fotos reais são conteúdo indexável, não apenas decoração;
- Search Console orienta iterações depois do lançamento;
- desempenho da Rádio não pode tornar as páginas comerciais opacas ou lentas.

O contrato completo está em [STUDIO_SEARCH_DISCOVERY_V1.md](STUDIO_SEARCH_DISCOVERY_V1.md).

## Fora do primeiro marco

Checkout próprio, gestão financeira ou de produção, contas de ouvintes, app nativo, sincronizador local de pastas, scraping do Suno, transmissão ao vivo, múltiplas skins, equalizador que altera o som e configurador 3D completo.

Essas possibilidades entram no roadmap somente quando houver necessidade e decisão explícita.

## Pendências para lançamento e decisões em aberto

- cobertura geográfica de projetos personalizados;
- até onde o Estúdio modela a partir de ideia, foto, logo ou desenho;
- implementação e cutover da ponte editorial de Produtos, cujo contrato está definido mas não foi implantado;
- provisionamento do novo Supabase CM e execução do backend/retention de Orçamento, cujos contratos já estão definidos;
- contato de continuidade após triagem;
- configuração local/área de serviço no Google;
- domínio público definitivo.

As decisões técnicas estão em [ARCHITECTURE.md](ARCHITECTURE.md) e [SUPABASE_INFRASTRUCTURE_V1.md](SUPABASE_INFRASTRUCTURE_V1.md); seus estados de execução estão somente no [roadmap](ROADMAP.md). A auditoria do legado é uma referência histórica, não um segundo plano de execução.
