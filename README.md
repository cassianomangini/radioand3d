# CM 3D and Radio

Catálogo das criações em impressão 3D de Cassiano e experiência musical CM Radio, com player pequeno e grande compartilhando a mesma reprodução.

## Estado do código

A fundação Next.js e a Home Estúdio + Rádio estão em construção. A Home já recebeu a direção visual aprovada e usa o catálogo real da rádio no ambiente local configurado, mas a revisão visual e das interações por Cassiano ainda está pendente.

### Ambiente local

- Node.js 22
- pnpm 10

```bash
pnpm install
pnpm dev
```

Verificações:

```bash
pnpm lint
pnpm typecheck
pnpm build
```

### Catálogo da rádio no R2

O ambiente local configurado lê as 343 músicas do bucket R2 `musicas`. Para configurar outra máquina, copie `.env.example` para `.env.local`, preencha as credenciais S3 **somente de leitura** e defina `RADIO_CATALOG_SOURCE=r2`. A URL `R2_S3_ENDPOINT` termina em `r2.cloudflarestorage.com`; `musicas` fica em `R2_BUCKET`, sem repetir o nome do bucket no endpoint. Não coloque credenciais no repositório nem no navegador.

O servidor percorre todas as páginas do bucket e inclui todos os objetos de áudio, inclusive nomes com `(1)`. O navegador recebe apenas os títulos e as URLs públicas para reprodução. A lista do bucket é a fonte deste piloto; a biblioteca editorial e o Music Inbox ainda precisam do contrato próprio. O endereço `r2.dev` serve para desenvolvimento. A produção precisa de um domínio próprio conectado ao bucket.

A rota `/dev/foundation` existe somente fora de produção para validar tokens e primitivas reais sem transformar essa vitrine na página pública.

## Comece aqui

1. [Plano do produto](docs/PROJECT_PLAN.md): escopo, decisões e limites.
2. [Roadmap](docs/ROADMAP.md): estado real, dependências e próxima entrega.
3. [AGENTS.md](AGENTS.md): como trabalhar sem duplicar decisões ou atropelar outra área.

## Mapa da documentação

| Documento | Responsabilidade exclusiva |
| --- | --- |
| [Arquitetura](docs/ARCHITECTURE.md) | Stack, módulos, segurança, infraestrutura e estratégia de frontend |
| [Experiência CM](docs/EXPERIENCE.md) | Identidade, movimento, responsividade e aprovação visual |
| [Catálogo 3D](docs/CATALOG_3D.md) | Peças, materiais, cores, disponibilidade e portfólio |
| [Biblioteca musical](docs/MUSIC_PIPELINE.md) | Importação, versões, publicação, permissões e acervo antigo |
| [Rádio](docs/RADIO.md) | Reprodução, fila, mini/full player e visualizador |
| [Auditoria do legado](docs/REUSE_AUDIT_ARTESOPOLIS_LANDING.md) | Evidências e limites do reaproveitamento |
| [Modelo de entrega](docs/work/TEMPLATE.md) | Checklist de execução, evidências e retomada |

Os perfis em `.github/agents/` são instruções versionadas. Serviços de banco, storage, autenticação e deploy não são provisionados por este bootstrap.


### Análise musical do visualizador

O visualizador pode usar sidecars pré-calculados para separar a voz do acompanhamento e sincronizar todas as barras pelo mesmo `currentTime` do player. O navegador mantém o FFT ao vivo apenas como fallback.

Prepare um ambiente Python separado e instale:

```bash
python -m venv output/radio-visualizer/.venv
output/radio-visualizer/.venv/Scripts/python -m pip install -r scripts/requirements-visualizer-analysis.txt
```

No Windows, para validar uma faixa antes do lote:

```bash
pnpm visualizer:sync -- "D:\\Músicas\\radio artesopolis" --limit 1
```

O resultado fica em `output/radio-visualizer/publish/_analysis/v1`. Para publicar no R2, use `--upload` somente com as credenciais locais de escrita `R2_VISUALIZER_WRITE_ACCESS_KEY_ID` e `R2_VISUALIZER_WRITE_SECRET_ACCESS_KEY`; essas credenciais não pertencem ao frontend nem ao ambiente público.
