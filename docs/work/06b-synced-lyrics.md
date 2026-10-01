# Entrega 06b: letras sincronizadas da CM Rádio

## Identificação

ID do roadmap: 06b. Responsável: CM Audio. Branch: `feat/synced-radio-lyrics`, baseada em `main` (`aabf7ba090428b999e6b94c91fc2016fac89d4f8`). Contratos lidos: [Rádio](../RADIO.md), [biblioteca](../MUSIC_PIPELINE.md), [arquitetura](../ARCHITECTURE.md) e `AGENTS.md`. Dependência verificada: a entrega 06 já expõe a posição corrente do único motor e o importador existente já produz `lyrics.generated.json` com a letra canônica.

## Resultado e limites

Objetivo observável: pré-processar áudio + letra canônica em timestamps por linha/palavra e fazer o painel de letra já existente acompanhar a posição da faixa, sem IA no navegador e sem trocar a letra oficial por uma transcrição automática.

Incluído: helper offline em lote com WhisperX, cache por arquivo/modelo, reconciliação ordenada com a letra canônica, recusa por cobertura mínima, catálogo JSON gerado, validação de hash da letra na API, destaque/rolagem no painel de letra fullscreen e fallback para texto simples. O painel, grid e composição já existentes são preservados; não há novo desenho de página. Pedido funcional aprovado por Cassiano nesta conversa em 01/10/2026.

Fora de escopo: gerar aqui os timestamps reais das 343 faixas, pois este ambiente não possui a pasta local de áudio nem runtime/modelos WhisperX; isolamento de vocais com Demucs; revisão visual/escuta em navegador; processamento dentro da requisição web; mudança do Music Inbox. Áreas reservadas: `scripts/*lyrics*`, `src/features/radio/*lyrics*`, API de letra, integração pontual no shell, testes e contratos desta entrega. Nenhuma credencial ou escrita em R2 é necessária.

## Checklist de execução

- [x] Base, contratos e dependências verificadas; trabalho alheio preservado em branch própria.
- [x] Implementar reconciliação que mantém a letra canônica e usa a transcrição somente como evidência temporal.
- [x] Implementar processamento WhisperX em lote, cache e saída gerada sem executar IA no navegador.
- [x] Integrar API com hash da fonte e fallback para letra simples quando a sincronização estiver ausente ou obsoleta.
- [x] Integrar linha/palavra ativa e rolagem automática ao painel de letra existente.
- [x] Cobrir normalização, repetição, interpolação, rejeição por baixa cobertura e seleção temporal com testes isolados.
- [ ] Executar `pnpm test`, `pnpm lint`, `pnpm typecheck` e `pnpm build` no checkout completo/CI.
- [ ] Processar ao menos uma faixa real e conferir timestamps contra escuta.
- [ ] Cassiano revisar acompanhamento, rolagem e legibilidade com música real.

## Evidência

| Critério | Comando, cenário ou artefato | Resultado observado |
| --- | --- | --- |
| Reconciliação canônica | `node --test tests/lyrics-sync.test.mjs` no recorte isolado | 4/4 testes passaram: acentos/pontuação, refrão repetido, palavra interpolada e baixa cobertura recusada |
| Seleção temporal | `node --experimental-strip-types --test tests/synced-lyrics.test.mjs` no recorte isolado | 2/2 testes passaram para linha ativa, intervalo instrumental e palavra ativa |
| Orquestração/cache | execução do `sync-radio-lyrics.mjs` em estrutura temporária com saída WhisperX em cache | 1/1 faixa simulada gerou linhas e palavras sincronizadas sem chamar o modelo novamente |
| Helper Python | `python3 -m py_compile scripts/transcribe-radio-lyrics.py` no recorte isolado | Sintaxe válida |
| Scripts Node | `node --check` nos helpers `.mjs` | Sintaxe válida |
| Mídia real | pasta local/R2 não disponível para processamento neste ambiente | Não executado; não há alegação de sincronização real das 343 faixas |
| UI/escuta | exige aplicação local com faixa sincronizada | Pendente de Cassiano |

## Retomada

Último ponto verificado: pipeline, reconciliação e seleção temporal passaram nos testes isolados; integração foi preparada para manter fallback quando `lyrics.synced.generated.json` estiver vazio. Pendência: CI/checks do repositório completo e primeira faixa real. Próxima ação exata: instalar `scripts/requirements-lyrics-sync.txt` na máquina que contém os áudios e executar `pnpm lyrics:sync -- "D:\\Músicas\\radio artesopolis" --track "<arquivo>"`; depois ouvir essa faixa no player fullscreen e revisar o acompanhamento antes de ampliar o lote. Commit/PR: preencher após publicação da branch.
