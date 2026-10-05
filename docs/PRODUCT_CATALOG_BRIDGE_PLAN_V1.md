# Product Catalog Bridge V1 — Artesopolis Admin → CM 3D & Radio

Status: **ready_for_implementation**  
Data da revisão: **05/10/2026**  
Escopo: **ponte read-only de Produtos entre `artesopolis-admin` e `radioand3d`**  
Runtime atual: **9 produtos materializados estaticamente em `src/features/studio/catalog.ts`**  
Objetivo final: **produto novo/publicado no Artesopolis Admin não deve exigir alteração de código no CM 3D & Radio**

## 1. Resultado final observável

A Shopee continua sendo a origem observada do anúncio e da compra. O Artesopolis Admin continua sendo o owner do produto interno e passa a ser também o owner da decisão editorial de publicar aquele produto no CM.

O `radioand3d` deixa de manter uma cópia manual do catálogo em código e passa a consumir, no servidor, uma projeção pública fechada e segura.

Fluxo alvo:

```text
Shopee
  ↓
shopee-sync-catalog
  ↓
Shopee Channel no Artesopolis Admin
  ├─ shopee_item_links
  ├─ shopee_model_links
  └─ snapshots/read models observados
          +
Products no Artesopolis Admin
  ├─ products
  └─ configuração editorial CM
          ↓
boundary pública read-only
          ↓
CM 3D & Radio
  ├─ /studio/produtos
  ├─ /studio/produtos/[slug]
  ├─ metadata
  └─ sitemap
          ↓
Comprar na Shopee
```

Critério principal de conclusão:

> depois do cutover, incluir o décimo produto publicado no CM não pode exigir commit, PR ou edição manual do catálogo no repositório `radioand3d`.

## 2. Autoridades e ownership

A ponte não cria uma terceira autoridade de produto.

### Shopee Channel

Continua owner de fatos observados do marketplace:

- `shop_id`;
- `item_id`;
- status externo do anúncio;
- nome observado do item;
- mídia observada;
- vídeo observado;
- models/variações observadas;
- timestamps de sincronização;
- demais fatos do provider.

### Products

Continua owner de:

- identidade interna do produto;
- lifecycle interno;
- dados internos de Produto;
- mídia interna;
- receitas 3D;
- custo;
- estoque;
- campos comerciais internos.

A nova configuração de publicação CM também pertence a Products porque responde à pergunta:

> “como este produto interno deve ser apresentado/publicado na superfície pública CM?”

### CM 3D & Radio

É somente consumidor público.

Não passa a ser owner de:

- Shopee;
- estoque;
- preço;
- custo;
- margem;
- SKUs;
- receita 3D;
- vínculo de identidade;
- sync.

## 3. Correções feitas em relação ao plano inicial

A revisão do plano resultou nas seguintes decisões.

### 3.1 Publicação não pode depender apenas de `product_id`

Um produto interno pode ter mais de um vínculo/listing externo.

A publicação precisa selecionar explicitamente qual anúncio Shopee é a fonte comercial:

```text
product_id
+
source_item_link_id
```

O campo deve referenciar uma linha real de `shopee_item_links`.

Não usar `item_id` externo como identidade da publicação.

### 3.2 Não expor uma view de tenant diretamente para `anon`

O site público não lê tabelas/views do Artesopolis Admin pelo browser.

A projeção sai por uma boundary server/Edge dedicada, com:

- organização fixa/configurada no backend;
- shape allowlisted;
- nenhuma escolha de `organization_id` pelo visitante;
- nenhum payload bruto da Shopee;
- nenhuma credencial no cliente.

### 3.3 Preço e estoque ficam fora da V1

O objetivo desta ponte é retirar o catálogo estático e manter produto, mídia, variações e contexto sincronizados.

A V1 não publica:

- preço;
- estoque numérico;
- margem;
- custo;
- prazo;
- disponibilidade física garantida.

Preço, frete, pagamento e disponibilidade final continuam confirmados na Shopee.

### 3.4 Não manter dois catálogos de produção

Durante desenvolvimento pode existir fixture explícita para teste/CI.

Depois do cutover:

- produção usa somente a projeção remota;
- `studioProducts` hardcoded deixa de ser fonte de produção;
- não existe fallback silencioso para os 9 produtos estáticos.

Rollback, se necessário, é rollback de código/commit, não convivência indefinida old/new.

## 4. Modelo de publicação no Artesopolis Admin

Nome proposto da persistência:

`product_cm_publications`

O nome é específico de propósito. Não criar agora um framework genérico de publicação multicanal sem necessidade medida.

### Campos mínimos

| Campo | Papel |
| --- | --- |
| `id` | identidade interna da publicação |
| `organization_id` | tenant owner |
| `product_id` | produto interno |
| `source_item_link_id` | listing Shopee escolhido como fonte comercial |
| `status` | `draft`, `published`, `archived` |
| `slug` | slug público estável |
| `public_title` | título apresentado no CM |
| `context_label` | contexto curto de uso/categoria |
| `summary` | resumo para listagem/metadata |
| `description` | descrição editorial pública |
| `materials` | materiais publicáveis |
| `measurements` | grupos de medidas publicáveis |
| `specs` | ficha técnica pública |
| `sort_order` | ordenação explícita no catálogo |
| `published_at` | primeira/última publicação conforme contrato final |
| `created_at` / `updated_at` | auditoria temporal |
| `created_by` / `updated_by` | auditoria de ator quando aplicável |

### Estruturas editoriais

`measurements` e `specs` podem ser persistidos como estruturas JSON fechadas, desde que o write contract valide shape e limites.

Formato conceitual de medida:

```json
{
  "label": "Medidas externas",
  "values": [
    { "label": "Comprimento", "value": "11 cm" },
    { "label": "Largura", "value": "3,3 cm" },
    { "label": "Altura", "value": "1,9 cm" }
  ]
}
```

Formato conceitual de spec:

```json
{
  "label": "Material",
  "value": "PLA"
}
```

Não aceitar JSON editorial arbitrário sem validação.

## 5. Invariantes da publicação

### Identidade

- uma publicação pertence a exatamente uma organização;
- `product_id` deve pertencer à mesma organização;
- `source_item_link_id` deve pertencer à mesma organização;
- o link Shopee selecionado deve apontar para o mesmo `product_id`;
- a fonte pública V1 deve ser `environment=live`;
- ID externo nunca substitui identidade interna.

### Slug

- slug obrigatório para `published`;
- slug único dentro da organização;
- slug não muda automaticamente quando nome Shopee muda;
- troca de listing Shopee não altera slug por consequência.

### Estado editorial

Estados:

```text
draft
published
archived
```

O estado editorial controla se a página existe publicamente.

O status Shopee não deve alterar automaticamente `published` para `archived`.

### Estado Shopee

A página e o CTA são separados:

```text
publication.status = published
Shopee NORMAL
→ página pública
→ CTA Comprar na Shopee habilitado

publication.status = published
Shopee UNLIST / indisponível / estado sem compra
→ página pública pode permanecer
→ CTA comercial não afirma disponibilidade

publication.status = archived
→ fora da listagem pública
→ fora do sitemap
→ rota não deve continuar como produto publicado
```

Isso preserva URL/SEO durante indisponibilidade comercial temporária sem inventar estoque.

### Gate de publicação

Antes de aceitar `published`, validar pelo menos:

- produto interno existente e não deletado;
- source item link resolvido para o mesmo produto/org;
- source em ambiente live;
- slug válido;
- título;
- summary;
- description;
- pelo menos uma mídia real observada/publicável;
- measurements suficientes para a peça quando o contrato de Produto exigir;
- specs não vazias quando usadas.

Não bloquear publicação apenas porque preço/estoque não são conhecidos: eles não fazem parte da V1.

## 6. Origem de cada campo público

| Campo público | Origem V1 |
| --- | --- |
| slug | publicação CM |
| title | publicação CM |
| contextLabel | publicação CM |
| summary | publicação CM |
| description | publicação CM |
| materials | publicação CM |
| measurements | publicação CM |
| specs | publicação CM |
| images | listing Shopee selecionado |
| video | listing Shopee selecionado |
| variants | models observados do listing selecionado |
| shopeeUrl | derivada server-side de shop/item |
| CTA habilitado | status observado do listing |
| sourceUpdatedAt | sync observado da Shopee |
| publicationUpdatedAt | publicação CM |
| lastModifiedAt | maior timestamp confiável entre conteúdo e fonte |

### Não copiar para a publicação

Não duplicar em `product_cm_publications`:

- lista de imagens Shopee;
- status externo;
- `item_id`;
- models;
- preço;
- estoque.

Esses fatos continuam no owner Shopee e são compostos na projeção.

## 7. Variantes

A V1 usa somente models reais do listing escolhido.

Cada variante pública precisa de:

- nome legível observado;
- imagem quando a Shopee fornecer uma associação confiável;
- ordenação determinística.

Não publicar:

- combinações inferidas;
- cor inventada;
- variante sem existência observada;
- SKU interno;
- `model_id` externo se o site não precisar dele.

Se futuramente houver necessidade de renomear/ocultar/reordenar models no CM, criar extensão editorial somente após existir caso real. Não antecipar essa camada na V1.

## 8. Mídia

### V1

Usar mídia real observada da Shopee:

- galeria do item;
- imagem principal;
- vídeo quando houver;
- imagem de model quando houver associação confiável.

Não copiar essas URLs para a tabela editorial apenas para duplicar estado.

### Fora da V1

Fica adiado:

- ingestão automática da mídia Shopee para R2/host CM;
- image sitemap de Produto com URLs da Shopee;
- reordenação editorial própria de fotos;
- overrides de mídia por variante;
- pipeline de transformação/resize CM.

O contrato vigente de Search continua valendo: enquanto Produto usar CDN Shopee, não adicionar essas URLs ao image sitemap CM.

## 9. Writes no Artesopolis Admin

Writes da publicação passam por boundary canônica de Products.

Nome proposto:

`save_product_cm_publication_backend(jsonb)`

Semântica esperada:

- `SECURITY DEFINER`;
- `search_path` explícito;
- closed shape;
- organization derivada pelo helper canônico;
- role mínima definida pelo produto, recomendação inicial: `admin`;
- validação atômica de product/source link/slug/shape;
- nenhum write na Shopee;
- nenhum efeito em estoque/preço;
- erro em envelope canônico.

A operação de publicar/despublicar é estado editorial interno. Não é external write Shopee.

## 10. Reads de gestão

A UI do Admin precisa de read model próprio para editar a publicação e escolher a fonte.

Exemplo conceitual:

`view_product_cm_publication_admin`

Pode compor:

- publicação CM;
- produto interno;
- links Shopee elegíveis do produto;
- título/status do listing;
- contagem/mídia disponível;
- last sync;
- quantidade de models.

A UI não deve ler payload bruto do provider.

## 11. UI no Artesopolis Admin

Adicionar uma seção dentro da jornada existente de Produto:

### Publicação no CM 3D & Radio

Campos:

- estado: draft / published / archived;
- listing Shopee fonte;
- slug;
- título público;
- contexto;
- summary;
- description;
- materiais;
- medidas;
- ficha técnica;
- ordem no catálogo.

Bloco read-only da fonte Shopee:

- item observado;
- status;
- fotos disponíveis;
- vídeo;
- número de variações;
- último sync.

### Comportamento

Se houver mais de um `shopee_item_links` elegível para o produto, o operador escolhe explicitamente a fonte.

Não selecionar “primeiro item” implicitamente.

A UI deve deixar claro:

- **Conteúdo CM** = editável;
- **Dados Shopee** = observados/read-only.

## 12. Boundary pública

Criar uma Edge Function/server boundary dedicada no `artesopolis-admin`.

Nome proposto:

`cm-public-catalog`

### Entrada V1

```text
GET /cm-public-catalog
GET /cm-public-catalog?slug=<public-slug>
```

Aceitar somente filtro público necessário.

Não aceitar:

- `organization_id`;
- `shop_id`;
- SQL/filter arbitrário;
- nome de tabela;
- seleção dinâmica de campos.

### Organização

A organização pública é configurada no ambiente da function:

`CM_PUBLIC_ORGANIZATION_ID`

Ela não vem do visitante.

A function deve validar que todos os registros compostos pertencem a essa organização.

### Banco

A function pode usar contexto privilegiado somente dentro do backend.

Requisitos:

- `service_role` nunca sai da function;
- leitura sempre filtra explicitamente a organização configurada;
- logs estruturados incluem `organization_id` e `request_id`;
- nenhuma credencial/token/raw payload sai na resposta.

### Autenticação da API pública

A V1 não precisa tratar os dados públicos como segredo.

A segurança vem de:

- shape fechado;
- organização fixa;
- campos allowlisted;
- ausência de operações de escrita;
- ausência de raw provider payload;
- ausência de filtros de tenant.

Não criar segredo compartilhado só para esconder informação que já será renderizada publicamente, salvo necessidade operacional posterior.

## 13. Contrato HTTP público

Resposta de lista:

```json
{
  "schemaVersion": 1,
  "generatedAt": "2026-10-05T00:00:00Z",
  "products": []
}
```

Produto público conceitual:

```json
{
  "slug": "porta-curativos-compacto",
  "title": "Porta Curativos Compacto",
  "contextLabel": "Organização portátil",
  "summary": "...",
  "description": "...",
  "images": [
    {
      "src": "https://...",
      "alt": "..."
    }
  ],
  "videoUrl": null,
  "materials": ["PLA"],
  "variants": [
    {
      "name": "Azul",
      "image": null
    }
  ],
  "measurements": [],
  "specs": [],
  "purchaseLink": {
    "enabled": true,
    "url": "https://shopee.com.br/..."
  },
  "sourceUpdatedAt": "...",
  "publicationUpdatedAt": "...",
  "lastModifiedAt": "..."
}
```

### Campos proibidos na resposta

Não expor:

- `organization_id`;
- `product_id`;
- internal SKU;
- external model id sem necessidade pública;
- custo;
- margem;
- estoque interno;
- quantidade de estoque Shopee;
- receita 3D;
- peso de filamento;
- tempo de máquina;
- Ads;
- ROAS;
- pedidos;
- tokens;
- raw Shopee payload.

## 14. Consumo no `radioand3d`

Criar um adapter server-side único.

Nome indicativo:

`src/server/studio-products.ts`

ou equivalente coerente com a arquitetura final.

Responsabilidades:

1. chamar `cm-public-catalog`;
2. validar resposta como `unknown`;
3. exigir `schemaVersion: 1`;
4. converter para o contrato de `StudioProduct`;
5. aplicar cache/revalidação;
6. fornecer listagem e busca por slug para Server Components.

### Proibido

- fetch no browser para montar conteúdo principal;
- Supabase service key no `radioand3d`;
- acesso direto às tabelas do Admin;
- acesso direto à Shopee;
- duplicar lógica Shopee no site;
- usar o catálogo hardcoded como fallback de produção.

## 15. Cache e falha

Política inicial recomendada:

- revalidação: **15 minutos**;
- conteúdo principal continua server-rendered;
- metadata e sitemap usam a mesma fonte/contrato.

### Falha transitória

Objetivo:

- se existir payload remoto anteriormente validado no cache, preferir manter esse estado durante falha transitória quando a primitive escolhida permitir;
- se nunca houve payload válido, falhar de forma explícita;
- não trocar silenciosamente para os 9 produtos estáticos.

A implementação deve usar o mecanismo nativo mais simples do Next.js vigente no momento do recorte. Não criar cache distribuído próprio sem evidência de necessidade.

## 16. Desenvolvimento e CI

Fixture é permitida somente de forma explícita.

Exemplo:

```text
STUDIO_CATALOG_SOURCE=fixture
```

Usos permitidos:

- testes;
- CI;
- desenvolvimento local sem acesso ao endpoint remoto.

Produção:

```text
STUDIO_CATALOG_SOURCE=remote
```

ou ausência de switch com remote como único modo válido.

A fixture deve:

- ser identificada como fixture;
- seguir o mesmo `schemaVersion`;
- não ser fallback automático de produção.

## 17. Rotas e SEO

### `/studio/produtos`

Listar somente `published`.

### `/studio/produtos/[slug]`

Buscar produto público por slug.

A rota não deve depender de `generateStaticParams` baseado em array hardcoded.

A estratégia final deve funcionar sem exigir chamada de rede durante o build de CI.

### Metadata

Usar:

- public title;
- summary;
- mídia real disponível;
- canonical próprio.

### Sitemap

Incluir somente produtos `published`.

`lastModified` deve usar `lastModifiedAt` real da projeção.

### Dados estruturados

Continua valendo o contrato atual:

- não emitir `Product` incompleto apenas para “ter schema”;
- sem offer/review/aggregateRating suficiente, o rich-result de Product continua adiado.

### Imagens

Enquanto hospedadas somente no CDN Shopee:

- renderizar normalmente como conteúdo;
- não incluir no image sitemap CM.

## 18. Comportamento quando Shopee muda

### Foto alterada

```text
Shopee
→ sync catalog
→ snapshot observado atualizado
→ projeção pública muda
→ cache CM revalida
→ página usa nova mídia
```

Sem commit no `radioand3d`.

### Variante adicionada/removida

Mesmo fluxo via models observados.

### Nome Shopee alterado

Não sobrescrever automaticamente `public_title`.

O título editorial CM permanece estável até edição explícita.

### Listing temporariamente UNLIST

- página publicada pode permanecer;
- CTA não afirma compra disponível;
- publication não vira archived automaticamente.

### Listing substituído por outro

Operador altera `source_item_link_id` no Admin.

Slug e editorial permanecem.

## 19. Migração dos 9 produtos atuais

Baseline atual no `radioand3d`:

1. `porta-curativos-compacto`;
2. `caixa-organizadora-media-tampa-deslizante`;
3. `caixa-organizadora-grande-tampa-deslizante`;
4. `porta-controles-duas-divisorias`;
5. `porta-lapis-cachepo-moderno`;
6. `chaveiro-mureta-santos`;
7. `estojo-duplo-compacto`;
8. `porta-figurinhas-3d`;
9. `porta-figurinhas-grande-3d`.

O conteúdo editorial atual é fonte de migração para:

- slug;
- public title;
- context label;
- summary;
- description;
- materials;
- measurements;
- specs;
- sort order.

Não usar o snapshot estático como authority de mídia depois do cutover.

### Mapeamento

Para cada produto:

```text
slug atual
→ item Shopee atual
→ shopee_item_links
→ confirmar product_id
→ criar product_cm_publication
```

Se o item não estiver vinculado corretamente ao produto interno, corrigir a identidade no owner adequado antes de publicar.

Não criar vínculo artificial dentro da publicação.

## 20. Paridade antes do cutover

Antes de remover os 9 registros estáticos, comparar catálogo antigo e projeção nova.

Campos obrigatórios de comparação:

- slug;
- título;
- item/destino Shopee;
- fotos principais;
- quantidade/lista de mídia relevante;
- variantes;
- measurements;
- specs;
- summary;
- description;
- estado de publicação.

Diferença não explicada bloqueia cutover.

## 21. Sequência de implementação

Os blocos abaixo são boundaries funcionais. Podem ser PRs quando Cassiano pedir PR; caso contrário, seguem o modo operacional do repositório correspondente.

### Bloco A — Persistência e contratos no Admin

Resultado:

- `product_cm_publications`;
- constraints;
- RLS/grants coerentes;
- read model de gestão;
- write RPC;
- atualização do canonical de Products.

Prova:

- teste SQL focal;
- tenant isolation;
- slug unique;
- source link deve ser do mesmo org/produto;
- closed shape;
- publish gate.

Não inclui endpoint público nem UI final.

### Bloco B — UI Publicação CM no Admin

Resultado:

- editar conteúdo editorial;
- selecionar source listing explicitamente;
- visualizar fatos Shopee read-only;
- draft/published/archived.

Prova:

- service tests focais;
- validação dos estados;
- UI não escreve Shopee;
- handoff visual humano conforme contrato do Admin.

### Bloco C — Boundary pública read-only

Resultado:

- `cm-public-catalog`;
- `schemaVersion: 1`;
- lista;
- lookup por slug;
- allowlist;
- sem dados internos.

Prova:

- shape test;
- tenant/config test;
- draft/archived ausentes;
- nenhum campo proibido;
- source item errado não vaza;
- logs sem segredo.

### Bloco D — Consumer server-side no Radio

Resultado:

- adapter remoto;
- runtime validation;
- cache;
- catálogo/listagem;
- produto individual;
- metadata;
- sitemap;
- fixture explícita para CI/dev.

No mesmo bloco:

- remover dependência de produção de `studioProducts` hardcoded;
- remover `generateStaticParams` dependente do array local;
- nenhum browser fetch para conteúdo principal.

Prova:

- testes de parser/adapter;
- build sem endpoint remoto;
- CI via fixture;
- rotas renderizadas server-side;
- sitemap usa somente published.

### Bloco E — Migração + cutover live dos 9

Resultado:

- 9 publicações configuradas no Admin;
- paridade validada;
- Radio consumindo remote em produção;
- static catalog aposentado.

Prova live:

1. alterar conteúdo editorial no Admin;
2. confirmar mudança no CM após revalidação;
3. sincronizar uma mudança observada Shopee;
4. confirmar mudança correspondente no CM;
5. marcar publicação archived;
6. confirmar remoção da listagem/sitemap;
7. republicar;
8. confirmar retorno;
9. adicionar um décimo produto sem alterar código do Radio.

Somente depois do item 9 a ponte é considerada concluída.

## 22. Dependências e hard stops

### Sem blocker para começar código local

É possível implementar A–D sem publicar nada em produção.

### Operações remotas exigem alvo confirmado

Para aplicar/validar live:

- projeto Supabase correto;
- ambiente correto;
- configuração da organização pública;
- URL da Edge Function;
- configuração Vercel/produção;
- autorização humana para migration/deploy/write remoto conforme o repositório.

Migration no Git não significa migration aplicada.

### Dados live

O cutover exige verificar os vínculos reais dos 9 produtos.

Não assumir que o snapshot atual no `catalog.ts` prova o vínculo interno vigente.

## 23. Riscos principais

### Vazamento de dados internos

Mitigação:

- Edge boundary;
- allowlist;
- org fixa no backend;
- sem raw payload;
- testes negativos.

### Produto apontando para listing errado

Mitigação:

- `source_item_link_id` explícito;
- validação same-org/same-product;
- nada de “primeiro link”.

### Site fora do ar por dependência remota

Mitigação:

- cache/revalidação;
- endpoint pequeno/read-only;
- falha explícita;
- sem fetch browser-side;
- rollback de código disponível.

### Divergência editorial

Mitigação:

- título/descrição/medidas continuam owner da publicação CM;
- Shopee não sobrescreve editorial automaticamente.

### Dois catálogos permanentes

Mitigação:

- static catalog removido no cutover;
- fixture apenas test/dev;
- produção sem fallback hardcoded.

## 24. Fora de escopo V1

- checkout CM;
- carrinho;
- pagamento;
- cálculo de frete;
- preço sincronizado no CM;
- estoque numérico no CM;
- Ads/ROAS;
- pedidos;
- reviews;
- migração de mídia Shopee para R2;
- image sitemap de Produto;
- edição de anúncio Shopee a partir do CM;
- webhook de revalidação imediata;
- configuração multi-site genérica;
- renomeação editorial por model;
- dashboard público de analytics.

Esses itens só entram após necessidade real.

## 25. Gate de conclusão

A ponte só recebe estado `done` quando:

- [ ] publicação CM tem owner e contrato no Admin;
- [ ] source listing é explícito;
- [ ] draft não vaza;
- [ ] archived não vaza;
- [ ] produto publicado aparece;
- [ ] payload público não contém campo interno proibido;
- [ ] Radio valida `schemaVersion`;
- [ ] conteúdo principal continua server-rendered;
- [ ] metadata usa projeção;
- [ ] sitemap usa projeção;
- [ ] produção não usa catálogo hardcoded;
- [ ] os 9 produtos atuais migraram;
- [ ] paridade dos 9 foi comprovada;
- [ ] alteração editorial Admin → CM foi comprovada live;
- [ ] alteração observada Shopee → Admin → CM foi comprovada live;
- [ ] archive/re-publish foi comprovado;
- [ ] décimo produto foi publicado sem mudança de código no `radioand3d`;
- [ ] nenhum residual material dentro do objetivo permanece.

## 26. Retomada

Estado atual em 05/10/2026:

- Shopee → Artesopolis Admin: existente;
- catálogo Shopee observado: existente;
- vínculos item/model/product: existentes;
- páginas Produtos no CM: existentes;
- 9 produtos: snapshot estático curado no código;
- Admin → CM automático: **não implementado**;
- tabela de publicação CM: **não implementada**;
- UI de publicação CM: **não implementada**;
- boundary pública: **não implementada**;
- consumer remoto no Radio: **não implementado**.

Próxima ação quando Cassiano autorizar implementação:

> executar **Bloco A — Persistência e contratos no Artesopolis Admin**, sem aplicar migration remotamente até o alvo ser confirmado e autorizado.
