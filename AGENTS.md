# AGENTS.md

## Objetivo

Este repositorio contem o projeto CM 3D and Radio.

O produto une catalogo 3D, trabalhos personalizados, cores e materiais, portfolio e uma experiencia de radio/musica persistente.

## Regra principal

Nao tratar 3D e Radio como dois produtos desconectados.

Toda decisao relevante deve considerar a experiencia completa de navegacao, especialmente a persistencia do player.

## Antes de alterar

1. leia `README.md`;
2. leia `docs/PROJECT_PLAN.md`;
3. identifique a area principal da mudanca;
4. confirme dependencias;
5. evite expandir o escopo sem necessidade.

## Papeis

- Planning / Architecture
- Experience / Motion
- Frontend
- Backend / Data
- Audio / Media
- Infra
- Review / QA

Uma entrega deve ter um responsavel principal.

## Identidade CM

- este projeto nao e uma continuacao visual do Artesopolis;
- nao usar astronauta, logos, favicon ou copy Artesopolis;
- nao introduzir tema espacial/orbital por reflexo do projeto antigo;
- codigo reaproveitado deve entrar com naming neutro ou CM;
- comportamento pode ser migrado, identidade visual deve ser redesenhada;
- consultar `docs/REUSE_AUDIT_ARTESOPOLIS_LANDING.md` antes de portar codigo do projeto antigo.

## Padroes

- TypeScript estrito;
- componentes reutilizaveis;
- responsabilidades separadas;
- sem duplicar regras de negocio entre frontend e backend;
- sem conectar UI publica diretamente a dados internos sensiveis;
- acessibilidade nao e opcional;
- mobile deve ser tratado como experiencia propria;
- animacao deve ter funcao, nao ser decoracao aleatoria;
- respeitar reduced motion;
- evitar dependencias pesadas sem justificativa;
- nao introduzir 3D real onde CSS/motion resolve melhor;
- nao interromper audio em navegacao interna;
- nao usar mocks permanentes como solucao final.

## UI e motion

Toda mudanca visual relevante precisa ser verificada no navegador.

Validar:

- desktop;
- mobile;
- loading;
- empty;
- error;
- hover/focus;
- reduced motion;
- performance basica.

## Audio

Mudancas no player precisam verificar:

- play/pause;
- progresso;
- volume;
- troca de faixa;
- navegacao entre paginas;
- refresh;
- mobile;
- comportamento quando o navegador bloqueia autoplay.

## Dados

Separar:

- produto;
- material;
- cor;
- combinacao permitida;
- disponibilidade;
- estoque pronto;
- item sob producao.

Nunca assumir que uma cor disponivel significa uma peca pronta naquela cor.

## Entregas

Cada PR deve deixar claro:

- o que foi feito;
- por que;
- como validar;
- riscos;
- pendencias reais.

Evitar PRs gigantes quando a mudanca puder ser separada por fronteira funcional.

## Fonte canonica

- visao e roadmap: `docs/PROJECT_PLAN.md`;
- regras de agentes: `AGENTS.md`;
- setup e entrada do repositorio: `README.md`.

Nao repetir o mesmo conteudo em varios arquivos.
