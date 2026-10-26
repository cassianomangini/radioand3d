# CM 3D & RÁDIO

> Substituído como contrato de execução por [CM_3D_RADIO_PLANO_MESTRE_RECONSTRUCAO_V1.md](CM_3D_RADIO_PLANO_MESTRE_RECONSTRUCAO_V1.md). Este arquivo permanece só como contexto.

## Plano de construção do novo projeto

**Data:** 25/10/2026
**Projeto:** CM 3D & Rádio
**Estratégia:** Novo projeto, reaproveitamento seletivo de funcionalidades e conteúdos existentes.

**Objetivo:** Construir um site bonito, consistente, simples de manter e comercialmente funcional, com um estúdio de impressão 3D e uma rádio de músicas autorais.

---

# 1. A DECISÃO PRINCIPAL

O novo CM 3D & Rádio será desenvolvido em um repositório independente.

O projeto antigo permanecerá preservado como referência.

Não haverá migração integral de componentes, estilos, páginas ou testes.

A transferência acontecerá seletivamente:

* Código funcional que vale preservar.
* Dados e catálogos existentes.
* Imagens, músicas e outros arquivos aprovados.
* Integrações que já resolvem problemas reais.

A interface será construída novamente.

**A regra mais importante: cada página será concebida, implementada e aprovada individualmente.**

Nenhuma página adicional será criada simplesmente para adiantar o desenvolvimento.

---

# 2. O QUE JÁ TEMOS DISPONÍVEL

## Rádio

O repositório atual contém:

* Motor de reprodução.
* Controle de áudio.
* Gerenciamento de volume.
* Fila de músicas.
* Embaralhamento.
* Repetição.
* Busca e seleção de faixas.
* Reprodução contínua.
* Equalizador e visualização musical.
* Letras sincronizadas.
* Compartilhamento individual de músicas.
* Integração com o Cloudflare R2.

O manifesto atual registra **343 músicas publicadas**.

Vamos reutilizar essas funcionalidades, preservando os identificadores das músicas e os arquivos armazenados.

A interface visual não será copiada integralmente.

## Estúdio

Já existem:

* Fotografias reais de impressões.
* 220 imagens catalogadas no manifesto atual do R2.
* Dados de nove produtos da Shopee.
* Fotografias e variações dos produtos.
* Informações sobre PLA, PETG e TPU.
* Estrutura de orçamento por tipo de projeto.
* Infraestrutura inicial de recebimento seguro de pedidos.
* Identidade visual e imagens aprovadas anteriormente.

Esses conteúdos representam o material inicial do novo site.

**Não precisamos recriar o que já existe. Precisamos apresentá-lo corretamente.**

---

# 3. ESTRUTURA DO NOVO PROJETO

## Tecnologia

Manter uma base conhecida e compatível com as funcionalidades existentes:

**Next.js + React + TypeScript + CSS Modules.**

Usar pnpm para gerenciamento de dependências.

Não adicionar bibliotecas visuais por antecipação.

Não instalar Tailwind apenas por convenção, caso a composição continue sendo feita com CSS Modules.

Não criar laboratórios, frameworks de componentes ou sistemas de animação sem necessidade concreta.

## Organização inicial

```text
cm-3d-radio-novo/
│
├── public/
│   ├── images/
│   └── icons/
│
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   │
│   ├── components/
│   │   ├── layout/
│   │   ├── ui/
│   │   └── home/
│   │
│   ├── features/
│   │   ├── radio/
│   │   └── studio/
│   │
│   ├── lib/
│   └── styles/
│       ├── tokens.css
│       └── globals.css
│
├── README.md
└── package.json
```

Essa é a estrutura mínima inicial.

As páginas e pastas adicionais serão criadas quando suas funcionalidades forem desenvolvidas.

## CSS

Começar com uma identidade visual centralizada.

Definir:

* Cores.
* Tipografia.
* Espaçamentos.
* Bordas.
* Botões.
* Larguras.
* Comportamento responsivo.

Componentes podem possuir CSS próprio, desde que utilizem os padrões compartilhados.

A Rádio terá liberdade visual própria, mas não poderá contaminar a identidade do Estúdio.

**Não criar um CSS para cada página como se ela pertencesse a outro site.**

---

# 4. ETAPA ZERO: CRIAR O PROJETO LIMPO

### Objetivo

Preparar uma base simples para iniciar a Home.

### Entregas

1. Criar o novo repositório privado.
2. Criar uma aplicação Next.js limpa.
3. Configurar TypeScript e CSS Modules.
4. Configurar os tokens visuais iniciais.
5. Criar somente o layout global e a rota `/`.
6. Configurar um projeto Vercel separado para previews.
7. Registrar as variáveis de ambiente necessárias, sem copiar segredos para o Git.
8. Preservar o projeto antigo sem modificações.

### Não fazer

Não copiar as páginas antigas.

Não importar o shell antigo.

Não criar suítes de testes.

Não configurar Supabase antes de existir uma funcionalidade que dependa dele.

Não publicar no domínio definitivo.

### Critério de conclusão

Novo projeto funcionando localmente, estrutura compreensível e ambiente de preview independente.

---

# 5. PRIMEIRA ENTREGA: A HOME

**Esta será a primeira página efetivamente construída.**

Não vamos desenvolver Produtos, Materiais, Impressões ou Orçamentos antes de consolidar a identidade inicial.

## 5.1. O que a Home precisa comunicar

Ao entrar no site, a pessoa deve compreender imediatamente:

**O que é a CM 3D & Rádio?**

Um estúdio de impressão 3D que apresenta produtos próprios, recebe solicitações de peças personalizadas e oferece uma rádio com músicas autorais.

O visitante deve identificar dois caminhos comerciais:

**Solicitar uma peça personalizada.**

**Conhecer os produtos disponíveis.**

A rádio é parte da identidade do site e deve permanecer acessível durante a navegação.

## 5.2. Composição desktop

Manter o conceito de dois ambientes:

**Estúdio à esquerda. Rádio à direita.**

A divisão inicial da Rádio será fixa, sem o antigo recurso de arrastar.

A Home terá:

### Cabeçalho

Logotipo CM 3D & Rádio.

Navegação simples.

Ações sociais e comerciais somente quando possuírem destinos funcionais.

Sem menus duplicados.

### Apresentação principal

Imagem principal com a identidade do estúdio.

A Bambu Lab X1 Carbon e as peças podem compor essa imagem, utilizando materiais visuais aprovados.

O texto apresenta a proposta do site sem frases genéricas.

A Home não deve virar um catálogo completo.

### Ações principais

Dois botões visualmente padronizados, com hierarquia clara.

O visitante precisa compreender a diferença entre conhecer os produtos e solicitar uma personalização.

### Rádio

O painel da direita apresenta o player completo.

A Rádio utilizará músicas verdadeiras e controles funcionais, não uma simulação decorativa.

## 5.3. Composição mobile

A versão mobile será desenhada separadamente.

O player compacto ficará próximo ao cabeçalho.

A apresentação do estúdio ocupará o espaço principal.

A pessoa poderá abrir a Rádio completa quando desejar.

O mini-player não deverá ocupar uma parcela exagerada da tela.

Os botões comerciais precisam permanecer legíveis e facilmente utilizáveis.

## 5.4. Como vamos desenvolver a Home

**Primeiro:** fechar a organização do conteúdo.

**Segundo:** criar uma proposta visual com proporções, alinhamentos e imagens reais.

**Terceiro:** aprovar a composição desktop e mobile.

**Quarto:** implementar a página com os componentes necessários.

**Quinto:** integrar a Rádio real.

**Sexto:** revisar o resultado renderizado e corrigir as diferenças.

### Critério de conclusão

A Home deverá estar visualmente aprovada no desktop e no celular.

O player deverá estar funcional.

O layout não poderá apresentar sobreposição, corte de conteúdo ou comportamento inconsistente.

Os links não poderão conduzir o visitante a funcionalidades anunciadas como prontas, mas inexistentes.

**Não avançar para outra página enquanto a Home estiver em revisão.**

---

# 6. REAPROVEITAMENTO DO MOTOR DA RÁDIO

Esta etapa será executada durante a conclusão da Home.

O objetivo é aproveitar o motor atual sem trazer a estrutura visual problemática.

## Arquivos principais para migração

### Reprodução e fila

```text
src/features/radio/radio-provider.tsx
src/features/radio/queue.ts
```

Responsáveis pelo estado global do áudio e pelo comportamento da fila.

### Catálogo musical

```text
src/features/radio/catalog.ts
src/features/radio/published-r2-catalog.ts
src/features/radio/publications.ts
src/features/radio/publications-core.ts
src/features/radio/publications.generated.json
```

Responsáveis por disponibilizar as músicas publicadas.

### Visualização musical

```text
src/features/radio/radio-visualizer.tsx
src/features/radio/visualizer-analysis.ts
src/features/radio/frequency-bars.ts
```

A visualização deve continuar baseada em áudio ou análise musical real.

### Letras

```text
src/features/radio/radio-lyrics.tsx
src/features/radio/synced-lyrics.ts
```

Também será necessário migrar os dados e as rotas de letras utilizados por esses módulos.

### Compartilhamento

Preservar os identificadores e slugs publicados.

A experiência continuará permitindo compartilhar uma música diretamente.

A rota `/musica/[slug]` deverá abrir a experiência principal com a faixa selecionada em destaque.

O início da reprodução continuará respeitando as restrições de autoplay dos navegadores.

## O que NÃO copiar

Não copiar integralmente:

```text
studio-radio-shell.tsx
studio-radio-shell.module.css
radio-content.module.css
studio-welcome.module.css
```

Esses arquivos pertencem à estrutura visual antiga.

O novo projeto terá um shell próprio e componentes de Rádio com responsabilidades mais claras.

O motor poderá ser adaptado às novas interfaces, mantendo somente um elemento de áudio e um provider global.

## Critério de conclusão da Rádio

Reprodução real funcionando.

Fila e embaralhamento funcionando.

Player único.

Música contínua durante a navegação.

Controles funcionais em desktop e mobile.

Compartilhamento preservado quando a respectiva rota estiver pronta.

Sem controles falsos ou funcionalidades desativadas apresentadas como disponíveis.

---

# 7. SEGUNDA ENTREGA: ORÇAMENTOS

Depois da Home, a prioridade comercial será a solicitação de orçamentos.

## Categorias iniciais

**Placas personalizadas.**

**Caixas sob medida.**

**Impressão de arquivo enviado pelo cliente.**

**Outros projetos sujeitos à avaliação.**

O novo formulário deverá ser simples.

As perguntas devem mudar conforme a categoria selecionada.

Não é necessário copiar integralmente as seis etapas atuais.

A quantidade de etapas deve surgir da necessidade real de coletar informações.

## Reaproveitamento

Utilizar os contratos, validações e partes seguras do backend existente como referência e fonte de código.

Não copiar automaticamente a interface antiga.

A integração com Supabase ocorrerá somente quando o fluxo estiver definido e as configurações de segurança estiverem verificadas.

## Critério de conclusão

O visitante consegue enviar uma solicitação verdadeira.

O sistema apresenta confirmação ou erro real.

Arquivos e informações pessoais recebem tratamento seguro.

Não existe botão de envio desabilitado como etapa final de uma jornada anunciada como funcional.

---

# 8. TERCEIRA ENTREGA: PRODUTOS

Criar a área de produtos utilizando os dados reais existentes.

## Página de Produtos

Fotografias pequenas e organizadas.

Nome claro.

Breve explicação do produto.

Navegação para os detalhes.

## Detalhe de produto

Fotografias reais.

Variações.

Dimensões.

Informações úteis.

Botão principal para compra na Shopee.

Possibilidade de solicitar algo semelhante com personalização, quando fizer sentido.

### Não fazer

Não criar carrinho próprio.

Não inventar preços ou disponibilidade.

Não utilizar diagramas que não representam o produto.

Não copiar o design atual.

## Critério de conclusão

Os produtos são apresentados de forma consistente e possuem links comerciais funcionais.

---

# 9. QUARTA ENTREGA: IMPRESSÕES

Criar a galeria utilizando o acervo do R2.

## Diretrizes

Preservar as imagens autorizadas.

Organizar metadados e projetos.

Manter **pelo menos oito imagens por fileira em desktop amplo**, adaptando a quantidade para telas menores.

Carregar miniaturas progressivamente.

Criar um único visualizador compartilhado.

Preservar as proporções das fotografias.

Permitir ampliar a imagem e solicitar algo parecido.

Não exibir nomes técnicos de arquivos como títulos comerciais.

## Critério de conclusão

Uma galeria organizada, rápida, visualmente aprovada e integrada ao fluxo de orçamento.

---

# 10. QUINTA ENTREGA: O ESTÚDIO

Esta página terá uma função própria.

**Mostrar o estúdio real, sua estrutura e como o trabalho é realizado.**

Não repetir o carrossel inteiro.

Não transformar a página em outra listagem de produtos.

## Conteúdo

Apresentação do espaço.

Equipamentos.

Três Bambu Lab P1S e uma X1 Carbon.

Materiais e processo de produção.

Um pouco sobre quem conduz o estúdio.

Fotografias reais do ambiente e das máquinas, quando disponíveis e aprovadas.

## Critério de conclusão

O visitante compreende quem está por trás do trabalho e quais recursos existem no estúdio.

---

# 11. SEXTA ENTREGA: MATERIAIS

Apresentar PLA, PETG e TPU.

Informações curtas e práticas.

Fotografias reais ou amostras confiáveis.

Cores e acabamentos disponíveis somente quando confirmados.

A página deve complementar a experiência de orçamento, não repetir um manual técnico.

---

# 12. SÉTIMA ENTREGA: PÁGINAS COMERCIAIS E SEO

Após as páginas principais, criar ou finalizar os destinos específicos:

```text
/studio/placas-personalizadas
/studio/caixas-personalizadas
/studio/impressao-3d-sob-demanda
```

Essas páginas terão conteúdo específico para a intenção de busca.

Placas e caixas terão prioridade.

Também serão preparados:

Metadados.

Sitemap.

Robots.

Dados estruturados pertinentes.

Compartilhamento das páginas e músicas.

Analytics.

Compatibilidade ou redirecionamentos para links antigos que já tenham sido compartilhados.

Nada de publicar páginas vazias apenas para aumentar a quantidade de URLs.

---

# 13. REGRAS PARA NÃO REPETIR OS PROBLEMAS

## Desenvolvimento

**Uma página por vez.**

Componentes compartilhados de verdade.

CSS local limitado à responsabilidade do componente.

Nenhuma duplicação de player, modal ou controle quando existir uma implementação adequada.

Não criar funcionalidades futuras sem necessidade atual.

Não adicionar bibliotecas sem justificar seu uso.

## Design

Referências aprovadas antes da implementação final.

Imagens reais quando representam produtos ou serviços existentes.

Tipografia forte e legível.

Textos brancos com contraste adequado.

Visual sofisticado, sem poluição.

Sem astronautas, efeitos genéricos, cartões desnecessários ou excesso de neon.

A Rádio pode ser visualmente mais expressiva que o Estúdio.

## Testes e verificações

Nenhuma suíte de testes antiga será copiada.

Não criar testes visuais automaticamente para cada mudança.

Não criar laboratório de componentes antes de existir uma necessidade concreta.

Verificações técnicas serão proporcionais ao risco.

Build e TypeScript serão utilizados para identificar problemas técnicos relevantes.

Fluxos sensíveis, como arquivos de orçamento e sessões, continuarão exigindo verificações de segurança.

**Nenhum resultado de CI será considerado aprovação estética.**

## Documentação

Manter somente documentos úteis e atualizados.

Um plano de execução vigente.

Decisões visuais aprovadas.

Informações essenciais para manutenção.

Sem multiplicar documentos e contratos para cada pequeno ajuste.

---

# 14. PUBLICAÇÃO

O novo site terá inicialmente um ambiente de preview separado.

O domínio definitivo não será transferido durante a construção.

O projeto antigo permanecerá preservado.

A publicação final ocorrerá somente depois de confirmar:

Home aprovada.

Rádio funcionando.

Orçamento recebendo solicitações.

Produtos acessíveis.

Fotografias carregando corretamente.

Navegação desktop e mobile consistente.

SEO e links comerciais configurados.

A troca de domínio e o encerramento do projeto antigo serão decisões independentes.

---

# 15. ORDEM DEFINITIVA

| Bloco | Entrega                                  | Situação inicial                           |
| ----- | ---------------------------------------- | ------------------------------------------ |
| 0     | Novo repositório e estrutura mínima      | Base local em `cm-3d-radio-novo`. Remoto e Vercel ainda não. |
| 1     | Home: conteúdo, composição e identidade  | A iniciar                                  |
| 2     | Integração do motor e interface da Rádio | Reutilizar código existente                |
| 3     | Orçamentos funcionais                    | Reconstruir UI e aproveitar backend seguro |
| 4     | Produtos e detalhes                      | Reutilizar catálogo real                   |
| 5     | Impressões e galeria                     | Reorganizar acervo R2                      |
| 6     | O Estúdio                                | Criar nova apresentação                    |
| 7     | Materiais                                | Reutilizar informações                     |
| 8     | Páginas comerciais e SEO                 | Criar quando houver conteúdo               |
| 9     | Revisão geral e publicação               | Somente após aprovação                     |

O bloco da Rádio faz parte da entrega completa da Home. Não representa autorização para começar outras páginas em paralelo.

---

# 16. PRIMEIRO MARCO DE APROVAÇÃO

A primeira meta não é entregar dez rotas nem configurar toda a infraestrutura.

A primeira meta é ter:

**Uma Home bonita, com identidade própria, funcionando no desktop e no celular, acompanhada de uma Rádio verdadeira.**

Somente depois disso o novo projeto começa a crescer.

### Estado inicial

`ready_for_frontend: no`

**Motivo:** a composição e o conteúdo final da nova Home ainda precisam ser definidos e aprovados.

**Próxima decisão:** fechar a estrutura e a apresentação visual da Home.

**Código novo:** base local criada em `cm-3d-radio-novo` (Next.js 16.3.7, TypeScript, CSS Modules, tokens da identidade CM, rota `/` sem composição). Repositório Git remoto e projeto Vercel ainda não existem.

**Migração:** ainda não iniciada.

**Publicação:** não autorizada.
