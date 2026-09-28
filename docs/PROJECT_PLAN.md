# Plano do produto

## Propósito

Uma identidade CM conectando objetos físicos e música. A pessoa pode conhecer peças, consultar cores e materiais, ver trabalhos para clientes e ouvir o acervo enquanto navega.

Este é o contrato de escopo. A sequência e o estado das entregas ficam apenas no [roadmap](ROADMAP.md).

## Requisitos confirmados por Cassiano

- Identidade CM própria, sem astronauta ou reaproveitamento automático da estética Artesopolis.
- Catálogo de peças e trabalhos personalizados, com cores e materiais disponíveis.
- Experiência viva, com muitas animações e boa apresentação em computador e celular.
- Rádio inspirada no Winamp, com tecnologia atual.
- Player pequeno persistente e player grande para escolher músicas, além do shuffle.
- Reduzir o trabalho manual entre criação no Suno e publicação no site.
- Rever criticamente o legado antes de reaproveitar código.
- Agentes, padrões e checklists que permitam continuar o projeto entre sessões.

## Recorte inicial proposto

| Área | Primeira experiência útil | Contrato |
| --- | --- | --- |
| Home | Entrada clara para peças e rádio, mantendo a identidade comum | [Experiência](EXPERIENCE.md) |
| Peças e materiais | Uma peça real detalhada, combinações válidas e mostruário inicial | [Catálogo 3D](CATALOG_3D.md) |
| Trabalhos para clientes | Estrutura de caso e caminho de contato, usando apenas material autorizado | [Catálogo 3D](CATALOG_3D.md) |
| Biblioteca privada | Importar em lote, revisar versões e publicar sem editar JSON ou Git | [Biblioteca](MUSIC_PIPELINE.md) |
| CM Radio | Acervo selecionável, mini/full sincronizados e visualizador real | [Rádio](RADIO.md) |

A V1 proposta é pública para ouvir e explorar; somente a gestão exige login do proprietário. Contato/orçamento e links de compra serão definidos sem presumir checkout próprio. Reprodução individual, não transmissão ao vivo sincronizada entre ouvintes.

## Primeiro marco integrado

Cassiano importa de três a cinco faixas autorizadas, revisa e publica. Um visitante escolhe uma delas no player grande, volta ao catálogo, explora uma peça real e continua ouvindo pelo player pequeno. Abrir novamente a rádio preserva faixa, posição e fila.

O marco exige validação de ponta a ponta, em desktop e mobile: importação, publicação, leitura pública, reprodução, navegação e comportamento dos dados. Requisitos de teste detalhados permanecem nos respectivos contratos.

## Fora do primeiro marco

Checkout, gestão financeira ou de produção, contas de ouvintes, app nativo, sincronizador local de pastas, scraping do Suno, transmissão ao vivo, múltiplas skins, equalizador que altera o som e catálogo completo com configurador 3D.

Essas possibilidades não estão descartadas. Entram no roadmap somente quando houver necessidade e decisão explícita; não devem atrasar a prova inicial.

## Decisões ainda abertas

A entrega 01 deve fechar stack e versões, serviços/ambientes, autenticação do proprietário, origem dos dados 3D, arquivos piloto, direitos de publicação e caminho de contato. O logo final e a composição do site dependem da entrega visual 03. A escolha de fornecedor não autoriza gastos nem conexão a produção.

As propostas técnicas estão em [ARCHITECTURE.md](ARCHITECTURE.md). A auditoria do legado é uma referência histórica, não um segundo plano de execução.
