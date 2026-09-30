# Plano do produto

## Propósito

Uma identidade CM conectando objetos físicos e música. A pessoa pode conhecer peças, consultar cores e materiais, ver trabalhos para clientes e ouvir o acervo enquanto navega.

Este é o contrato de escopo. A sequência e o estado das entregas ficam apenas no [roadmap](ROADMAP.md).

## Requisitos confirmados por Cassiano

- Identidade CM própria, sem astronauta ou reaproveitamento automático da estética Artesopolis.
- Catálogo de peças e trabalhos personalizados, com cores e materiais disponíveis.
- Experiência viva, com muitas animações e boa apresentação em computador e celular.
- Rádio inspirada no Winamp, com tecnologia atual.
- No mobile, mini player persistente; no desktop, a Rádio completa/acoplada é a interface de reprodução visível. Ambos usam o mesmo motor e a mesma fila.
- No desktop, o 3D e a rádio formam uma composição integrada; a rádio pode ganhar largura por arraste e por ação explícita de expandir/recolher.
- No mobile, o mini player aparece logo abaixo do header e a experiência de Estúdio de Impressão 3D começa imediatamente abaixo dele.
- O 3D nasce como um estúdio apresentável e expansível; produtos, materiais, fotos e projetos reais entram gradualmente, sem conteúdo fictício usado apenas para preencher a tela.
- Reduzir o trabalho manual entre criação no Suno e publicação no site.
- Rever criticamente o legado antes de reaproveitar código.
- Agentes, padrões e checklists que permitam continuar o projeto entre sessões.

## Recorte inicial proposto

| Área | Primeira experiência útil | Contrato |
| --- | --- | --- |
| Home / Estúdio | Apresentar claramente **Estúdio de Impressão 3D** e CM Rádio como duas partes da mesma experiência, sem obrigar catálogo completo no lançamento | [Experiência](EXPERIENCE.md) |
| 3D inicial | Estrutura preparada para receber peças, materiais, fotos e trabalhos reais conforme forem cadastrados; nenhuma grade fictícia é requisito de lançamento | [Catálogo 3D](CATALOG_3D.md) |
| Trabalhos para clientes | Estrutura de caso e caminho de contato, usando apenas material autorizado | [Catálogo 3D](CATALOG_3D.md) |
| Biblioteca privada | Importar em lote, revisar versões e publicar sem editar JSON ou Git | [Biblioteca](MUSIC_PIPELINE.md) |
| CM Radio | Acervo selecionável, mini/full sincronizados e visualizador real | [Rádio](RADIO.md) |

A V1 proposta é pública para ouvir e explorar; somente a gestão exige login do proprietário. Contato/orçamento e links de compra serão definidos sem presumir checkout próprio. Reprodução individual, não transmissão ao vivo sincronizada entre ouvintes.

## Primeiro marco integrado

O primeiro marco visível não depende de um catálogo 3D completo. Ele entrega duas coisas bem acabadas:

1. **CM Rádio funcional e visualmente pronta**, com Rádio completa no desktop e mini player no mobile compartilhando a mesma reprodução, seleção manual de músicas, shuffle e visualizador.
2. **Entrada pública do Estúdio de Impressão 3D**, com hero, identidade, navegação e estrutura preparada para receber conteúdo real progressivamente.

Desktop: o Estúdio ocupa a área principal e a Rádio completa aparece acoplada à direita, com ação de expandir/recolher e redimensionamento quando suportado pela interação aprovada. **Não existe mini player adicional no desktop.**

Mobile: header, mini player compacto e, logo abaixo, a entrada do Estúdio de Impressão 3D. A rádio completa abre sob demanda sem empurrar uma sidebar estreita para dentro da tela.

Materiais, produtos, fotos e trabalhos entram somente quando existirem e estiverem aprovados. Uma seção vazia ou um placeholder honesto é preferível a cards inventados para preencher layout.

O marco exige validação de ponta a ponta em desktop e mobile: reprodução, continuidade, expansão/recolhimento da rádio, navegação e composição responsiva. Importação e publicação real da biblioteca continuam sendo exigidas antes da publicação final do marco.

## Fora do primeiro marco

Checkout, gestão financeira ou de produção, contas de ouvintes, app nativo, sincronizador local de pastas, scraping do Suno, transmissão ao vivo, múltiplas skins, equalizador que altera o som e catálogo completo com configurador 3D.

Essas possibilidades não estão descartadas. Entram no roadmap somente quando houver necessidade e decisão explícita; não devem atrasar a prova inicial.

## Decisões ainda abertas

A entrega 01 deve fechar stack e versões, serviços/ambientes, autenticação do proprietário, origem dos dados 3D, arquivos piloto, direitos de publicação e caminho de contato. O logo fornecido por Cassiano e a composição em revisão ficam na [experiência](EXPERIENCE.md). A escolha de fornecedor não autoriza gastos nem conexão a produção.

As propostas técnicas estão em [ARCHITECTURE.md](ARCHITECTURE.md). A auditoria do legado é uma referência histórica, não um segundo plano de execução.
