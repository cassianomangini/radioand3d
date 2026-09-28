# Arquitetura e infraestrutura

## Situação das decisões

Este documento orienta a entrega 01. A stack abaixo é proposta, ainda não instalada. Registre aqui a escolha, justificativa e versão efetiva antes de criar dependências.

| Camada | Proposta inicial | Validação necessária |
| --- | --- | --- |
| Aplicação | Next.js App Router, React e TypeScript estrito; repositório único modular | Compatibilidade e versões mantidas na data do bootstrap |
| Estilo e movimento | Tokens próprios, CSS/Tailwind e Motion quando necessário | Aprovação visual e orçamento de desempenho |
| 3D em tempo real | Three.js/React Three Fiber apenas para interação aprovada | Modelo publicável, fallback e custo no mobile |
| Pacotes | pnpm, Node suportado e lockfile versionado | Fixar versões no setup e CI |
| Metadados | Banco relacional com migrations | Fornecedor, autenticação e operação local a decidir |
| Mídia | Object storage; R2 é candidato por existir no legado | Alvos CM, acesso privado, CORS e entrega pública |
| Aplicação hospedada | Vercel é candidata | Conta, plano, domínio e permissões a confirmar |

Não criar microserviços, monorepo ou infraestrutura de processamento distribuído antes de uma necessidade medida. O detalhamento do upload pode exigir processamento fora da requisição; decidir o menor mecanismo que respeite os limites reais do ambiente.

## Módulos propostos

Estrutura a criar na entrega 02, não diretórios já existentes:

```text
src/app/                 rotas, layouts e composição
src/features/catalog/    catálogo, materiais e apresentação 3D
src/features/music/      biblioteca, importação e publicação
src/features/radio/      reprodução, fila, análise e interfaces
src/components/ui/       primitivas visuais compartilhadas
src/server/              autorização, repositórios e adapters externos
src/config/              configuração validada, sem segredos no cliente
tests/                   testes de integração e navegação
```

Rotas propostas: `/`, `/pecas`, `/pecas/[slug]`, `/materiais`, `/clientes`, `/radio` e `/gestao/musicas`. Confirmar na entrega 01. A navegação pública deve compartilhar o layout persistente da rádio. A gestão é uma área privada, não a exposição do Admin operacional.

Server Components por padrão para leitura e composição. Interatividade e áudio em componentes cliente delimitados. O provider persistente não deve transformar toda a aplicação em código cliente nem ser recriado por mudança de rota ou modo do player. Layouts compartilhados preservam estado na navegação interna: [Next.js](https://nextjs.org/docs/app/getting-started/layouts-and-pages).

Contratos próprios: [rádio](RADIO.md), [biblioteca](MUSIC_PIPELINE.md) e [catálogo](CATALOG_3D.md). Consumidores públicos recebem dados explicitamente publicáveis, não registros internos completos. Compartilhar tipos não substitui validação de entrada no servidor.

## Segurança e publicação

Acesso público somente a itens publicados. Gestão restrita ao proprietário, com autenticação e autorização no servidor para cada operação. Se houver Data API acessível pelo navegador, também impor permissões e políticas no banco. Não confiar em esconder botões ou em IDs difíceis de adivinhar.

Escritas, uploads e publicação exigem validação, limites, trilha de resultado e tratamento de repetição. URLs fornecidas por importadores não autorizam fetch arbitrário no servidor. Segredos de banco/storage nunca entram no bundle público.

A integração com Artesopolis Admin é opcional. Exige contrato de leitura com lista explícita de campos, alvo autorizado e política de atualização. Não copiar banco, estoque ou clientes para acelerar a demonstração.

## Infraestrutura a preparar

Separar desenvolvimento, preview/teste e produção, incluindo dados e credenciais. O setup local deve funcionar com amostras identificadas e sem segredos de produção. Proibir indexação de previews e proteger gestão; `noindex` não é controle de acesso.

Guardar originais e rascunhos de mídia em área privada. Publicar somente derivados aprovados, conforme o contrato da biblioteca. Se escolher R2 público, usar domínio próprio para produção: `r2.dev` é destinado a desenvolvimento e tem limitação de tráfego. Validar CORS para os domínios autorizados, `GET`/`HEAD`, upload e requisições de intervalos; CORS não torna um arquivo privado. Referências: [R2 público](https://developers.cloudflare.com/r2/buckets/public-buckets/) e [CORS](https://developers.cloudflare.com/r2/buckets/cors/).

Antes da publicação: documentar limites de upload e lote, cache/revalidação, domínio, HTTPS, logs sem dados sensíveis, alertas de erro/custo, backup de metadados, retenção dos originais e procedimento de restauração. Rollback de código não desfaz automaticamente alterações de banco ou arquivos.

A CI da entrega 02 deve validar dependências reproduzíveis, lint, tipos, testes e build. Acrescentar E2E e verificações visuais conforme os fluxos existirem. Não registrar execução de comandos inexistentes. Alterações remotas de infraestrutura exigem autorização e conferência do alvo.
