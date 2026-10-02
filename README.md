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

O visualizador usa sidecars pré-calculados para separar voz do acompanhamento e sincronizar todas as barras pelo mesmo `currentTime` do player. O FFT ao vivo permanece apenas como fallback para alguma faixa ainda sem sidecar.

O lote completo é um único comando:

```bash
pnpm visualizer:sync
```

Na primeira execução, o comando cria automaticamente o ambiente Python em `output/radio-visualizer/.venv` e instala Demucs, librosa e o cliente R2. Depois ele:

1. lê **todo** o catálogo de áudio diretamente do bucket R2;
2. confere quais sidecars já existem e ainda correspondem ao ETag/tamanho/configuração atuais;
3. baixa uma música por vez pela URL pública;
4. separa o stem vocal e analisa todo o acompanhamento em bandas harmônicas, percussivas e transientes;
5. grava o sidecar localmente e o publica imediatamente em `_analysis/v1/<sha256-do-track-id>.json`;
6. apaga o áudio temporário e segue para a próxima faixa.

O lote é retomável. Se a máquina parar no meio, execute `pnpm visualizer:sync` outra vez: sidecars válidos já publicados no R2 são ignorados e apenas as faixas pendentes são processadas novamente.

A execução precisa das credenciais de leitura já usadas pelo catálogo e de uma credencial de escrita restrita a `_analysis/v1/*`, configurada em `R2_VISUALIZER_WRITE_ACCESS_KEY_ID` e `R2_VISUALIZER_WRITE_SECRET_ACCESS_KEY`. Essas credenciais são somente do comando local e nunca entram no frontend.

Use `--force` somente quando for necessário regerar todas as análises após uma mudança deliberada no algoritmo/configuração.
