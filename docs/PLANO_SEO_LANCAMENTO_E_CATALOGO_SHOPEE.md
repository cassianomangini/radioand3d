# CMangini3D — Plano de SEO para lançamento e catálogo Shopee

**Data da decisão:** 06/11/2026  
**Projeto:** `cassianomangini/radioand3d`  
**Domínio canônico:** `https://cmangini3d.com.br`  
**Prioridade comercial:** atrair pessoas que pesquisam produtos no **Google**, levá-las às páginas do CMangini3D e encaminhá-las ao **anúncio específico na Shopee**.  
**Estado deste documento:** plano de execução faseado; registrar aqui o aceite de cada fase. Não confundir planejamento com implementação, deploy, indexação ou resultado de ranking.

## 1. Decisão estratégica

**Lançar agora a base do site, depois evoluir o SEO dos produtos por ondas.** Não exigir otimização perfeita de todo o catálogo para iniciar a indexação das páginas institucionais e comerciais já aptas. Ao mesmo tempo, não indexar automaticamente os 27 anúncios só porque estão com status `NORMAL` na Shopee.

Duas metas distintas:

1. **Google orgânico:** buscar posições para consultas de produtos e atrair visitas qualificadas ao site e cliques aos anúncios externos.
2. **Busca interna da Shopee:** tem fatores próprios e requer otimização dos anúncios e da operação na plataforma. SEO no site **não garante** melhora no ranking interno da Shopee, nem venda atribuível sem medição.

Sitemap e metadados auxiliam descoberta e entendimento; não garantem indexação, posição ou vendas. Publicar uma página antes de estar perfeita é aceitável quando ela já oferece conteúdo correto e útil; publicar páginas genéricas em massa não é a estratégia.

**Escopo comercial prioritário:** páginas dos produtos Shopee, suas imagens verdadeiras e intenção de compra. O carrossel de fotos do Estúdio é secundário. Não criar blog, páginas de palavras-chave vazias ou categorias artificiais apenas para multiplicar URLs.

## P1 — Piloto de produtos Shopee no Google (próxima prioridade)

**Objetivo:** liberar um primeiro grupo **de 5 a 8 produtos** com páginas realmente úteis, mantendo a expansão gradual. A seleção final depende de evidências, não é uma lista fixa por preferência.

### Seleção dos produtos

- [ ] Cruzar estado atual do anúncio, URL de compra, material/fotos, consistência do produto e condições comerciais reais.
- [ ] Pesquisar termos concretos e intenção de busca, concorrência e possíveis distinções do produto; **não inventar volume ou posição**.
- [ ] Priorizar potencial de venda e clareza do produto, não apenas título longo ou volume do catálogo.
- [ ] Conferir marcas, personagens e alegações de propriedade intelectual antes de construir SEO baseado nesses nomes.
- [ ] Registrar motivo da inclusão/exclusão e fontes usadas para cada produto candidato.

**Candidatos iniciais para investigar, não pré-aprovados:** caixa de dois compartimentos, porta-controles de mesa, porta-curativos compacto, casinha porta-iscas de formiga e chaveiro Mureta de Santos. .

### Critério mínimo de uma página de produto indexável

- [ ] Slug estável e único; produto ativo e URL de compra que abre **o anúncio específico** na Shopee.
- [ ] Foto principal real correspondente à peça e imagens complementares adequadas; sem distorção. Usar `alt` descritivo e contexto textual útil.
- [ ] Termo principal e variantes relacionados definidos com base em pesquisa ou classificados explicitamente como hipótese.
- [ ] `title`, meta description, H1 e texto **específicos**, legíveis, sem cópia automática do anúncio; não criar promessas, preço, estoque, avaliações ou características não comprovados.
- [ ] Conteúdo útil: aplicação/benefício reconhecível, material, medidas, mecanismo, variações e limites **quando verificados**; não exigir texto longo artificial.
- [ ] Canonical absoluta do domínio oficial, Open Graph e links internos reais; botão claro **Comprar na Shopee**.
- [ ] Dados estruturados `Product`/`BreadcrumbList` **somente com propriedades válidas e confirmadas**; não fabricar `Offer`, estoque, preço ou `AggregateRating`. Verificar elegibilidade para recursos do Google sem assumir checkout próprio.
- [ ] Revisão visual, factual e técnica aprovada, inclusive HTML renderizado; **só então** inserir o slug na lista de aprovados, liberar `index` e incluir no sitemap.
- [ ] Se um item ficar `UNLIST`, `BANNED`, `SELLER_DELETE` ou perder aprovação, aplicar política segura de retirada, `noindex`, 404/410 ou redirect quando houver substituto real; uma falha transitória de sincronização não deve despublicar o catálogo.

**Critério de aceite P1:** 5–8 páginas revisadas, tecnicamente indexáveis, presentes no sitemap e com saída comercial correta; nenhuma garantia de posição. Continuar operando com menos páginas se menos produtos passarem no gate.

## P2 — Conteúdo editorial persistente e expansão

**Objetivo:** tornar o SEO independente das atualizações operacionais da Shopee e ampliar páginas sem gerar duplicatas ou conteúdo raso.

- [ ] Manter **campos da Shopee** (identificador, status, imagens, variações, link, atualização) separados dos **campos editoriais** (título próprio, descrição, conteúdo, consulta-alvo, imagens/alt aprovados, canonical, revisão e aprovação).
- [ ] Definir fonte persistente de aprovação e histórico das alterações editoriais, com vínculo a identificador estável de produto; o controle inicial por slugs é apenas gate transitório, **não a solução final**.
- [ ] Preservar slug/URL publicada mesmo se nome de anúncio mudar; implementar redirect para mudança legítima de slug.
- [ ] Criar páginas de categorias apenas quando houver grupo real de produtos, intenção distinta, conteúdo próprio e navegação útil. Não gerar URLs para filtros de interface nem uma página por variação de cor.
- [ ] Implementar produtos relacionados pertinentes e trilhas de links internos; não recomendar itens inexistentes ou indisponíveis.
- [ ] Evoluir as páginas com especificações verdadeiras, fotos e dúvidas frequentes comprovadas, sem copiar o mesmo parágrafo para dezenas de produtos.
- [ ] Rever cache/fallback do catálogo, atualizações e remoções, preservando último estado válido diante de falhas de sync.
- [ ] Expandir gradualmente o número de produtos aprovados após revisão editorial; evitar indexação em massa.
- [ ] Para serviços sob medida, avaliar páginas específicas de caixas, placas e impressão a partir de arquivo, **apenas com material real e intenção clara**, sem desviar a prioridade dos produtos Shopee.

**Critério de aceite P2:** conteúdo editorial preservado através de sincronizações; URLs estáveis; categorias e relações agregam valor; publicação/despublicação rastreável.

## P3 — Medição e melhoria contínua

**Objetivo:** priorizar melhorias pelo retorno observado, não pela quantidade de páginas indexadas.

- [ ] Medir no **Search Console** consultas, URLs, impressões, cliques, CTR, posição média e evolução de indexação.
- [ ] Medir no **site** a origem da visita e cliques de saída para cada anúncio da Shopee, sem transmitir dados pessoais de clientes nem conteúdo de orçamento.
- [ ] Confrontar, quando tecnicamente possível e com atribuição confiável, o tráfego externo com visitas/pedidos/vendas na Shopee. **Não declarar vendas geradas pelo SEO apenas por correlação temporal.**
- [ ] Rever resultados aproximadamente após 30, 60 e 90 dias da primeira indexação de produtos, interpretando dados pequenos com cautela.
- [ ] Priorizar páginas com impressões e CTR baixo, posição intermediária, baixa utilidade ou bom interesse comercial; testar mudanças incrementais de título, conteúdo e imagem conforme evidência.
- [ ] Expandir o piloto, corrigir conteúdos fracos e suspender páginas que não cumpram o padrão; monitorar regressões de canonical, `noindex`, links e status de produtos.
- [ ] Tratar **otimização de anúncios dentro da Shopee** (título, atributos, imagens e operação comercial) como frente complementar, com métricas próprias.

**Critério de aceite P3:** decisões com fonte, janela, hipótese e resultado registrado. Não prometer posição no Google nem ranking interno na Shopee.

## 3. Guardrails e ordem de trabalho

1. **P0 não espera P1–P3.** Iniciar indexação do site quando os checks técnicos de produção passarem.
2. **Produto visível no catálogo não significa produto indexável.** Somente o controle editorial aprovado autoriza `index` e entrada no sitemap.
3. **Nada de SEO automático pela simples importação.** `seoTitle = nome do anúncio` e `seoDescription = nome do anúncio` não bastam para aprovação.
4. **Mudança de produção é separada da edição deste plano.** Deploy, Search Console, Analytics e publicação de produto requerem verificação real.
5. **Sem métricas fictícias:** separar dado observado, inferência e termo candidato.
6. **Não comprometer segurança:** não expor endpoints privados, arquivos de clientes, token de catálogo, dados de pedidos ou contas; a navegação da Rádio deve continuar funcional.
7. **Uma URL útil por intenção relevante:** evitar duplicação, doorway pages e proliferação de filtros em URLs indexáveis.

## 4. Registro de execução

| Etapa | Estado ao criar o plano | Próxima ação | Aceite |
|---|---|---|---|
| P0 | Preparação técnica em código; deploy e checagem pública pendentes de confirmação | Build/deploy + QA HTTP + Search Console | Pendente |
| P1 | Snapshot de 27 produtos; zero slugs aprovados para indexação | Pesquisar, selecionar e revisar 5–8 candidatos | Pendente |
| P2 | Camada editorial persistente e expansão não implementadas neste plano | Definir contrato, estados e implementação | Pendente |
| P3 | Mensuração de conversão SEO→Shopee não comprovada | Planejar instrumentação sem PII e acompanhar Search Console | Pendente |

**Próximo passo imediato:** após o deploy de Production, verificar `https://cmangini3d.com.br/robots.txt` e `https://cmangini3d.com.br/sitemap.xml`; então enviar o sitemap na propriedade já validada do Search Console e testar as quatro URLs principais. **Não solicitar indexação dos 27 detalhes de produto enquanto `noindex`.**
