# Biblioteca musical e importação

## Fluxo desejado

Criar no Suno, baixar, arrastar um lote para o Music Inbox privado, revisar apenas o necessário e publicar. Upload, organização no storage e atualização da biblioteca pertencem ao sistema. Não exigir renomear arquivos, editar `tracks.json`, fazer commit ou manipular R2 para publicar uma música.

O caminho documentado de exportação do Suno é [download de músicas](https://help.suno.com/en/articles/2409921). A V1 começa no arquivo exportado. Integração direta/API não foi validada nesta revisão; não afirmar que existe ou não existe uma API oficial. Automatização adicional exige avaliação de suporte, permissões e estabilidade. Não usar cookies de sessão ou scraping como dependência silenciosa.

## Modelo mínimo proposto

Detalhar tipos, constraints e migrations na entrega 04, preservando estes limites:

| Entidade | Campos/conceitos essenciais |
| --- | --- |
| `tracks` | ID estável, título, idioma opcional, capa opcional, estado editorial e versão principal |
| `track_versions` | ID, track_id, rótulo, asset_id, origem/proveniência, estado editorial próprio e data de publicação |
| `media_assets` | ID, chave privada, nome original, hash verificado, formato, tamanho, duração e estado de processamento |
| `import_items` | ID da tentativa, chave de idempotência, proprietário, resultado, erro e asset associado |
| `playlists` / `playlist_items` | Playlist publicada, itens por version_id, ordem explícita e referências válidas |

Música e arquivo são coisas diferentes. Duas gerações de título igual podem ser músicas diferentes; mesmo arquivo renomeado continua sendo duplicata binária. Hash de conteúdo identifica bytes iguais, não equivalência musical. Agrupamento por nome, tags ou similaridade é sugestão revisável, nunca fusão automática.

Estado editorial: `draft`, `published`, `archived`, tanto para música quanto para versão. Asset de mídia precisa estar `ready` após validação; estados de processamento não substituem aprovação editorial. Uma versão nova de música publicada começa em rascunho.

Regra pública: música publicada + versão publicada + asset pronto e publicável. O catálogo principal apresenta a versão principal; remixes/alternativas aparecem apenas se publicados intencionalmente. Impedir versão principal apontando para outra música ou para versão não elegível. Publicação/troca da principal deve ser consistente sob concorrência.

## Importação em lote

1. Autorizar proprietário, quantidade, tamanho e formato; criar tentativa identificada por arquivo.
2. Enviar para área privada com chave gerada pelo sistema. Nome original é metadado, nunca caminho confiável.
3. Validar o arquivo real no servidor/processamento confiável: tamanho, assinatura/formato, integridade e duração. Hash calculado no cliente não basta como prova.
4. Reconciliar duplicidade e reenvios de forma idempotente. Repetir uma tentativa concluída não cria outro asset ou música.
5. Sugerir título/versão com metadados disponíveis; pedir confirmação do que faltar. Não presumir que MP3 contém letra, capa, idioma ou dados completos do Suno.
6. Registrar o rascunho pronto para revisão. Um arquivo inválido não deve cancelar os demais do lote.

Se upload concluir e gravação no banco falhar, a tentativa permite retomar/reconciliar. Se falhar antes, manter erro por arquivo e nova tentativa. Definir expiração e limpeza de uploads órfãos; nunca remover objetos referenciados por conteúdo válido. Se o processamento exceder limites do host, executar fora da requisição com estado persistente.

## Publicação e retirada

Publicar exige arquivo válido, título revisado, versão explícita, autorização de uso e confirmação humana. A área privada deve permitir corrigir metadados, selecionar versão principal, publicar e retirar, incluindo ações em lote com resumo do que será alterado.

Rascunhos e originais ficam privados. No modelo de entrega pública proposto, somente derivados aprovados são copiados para a origem pública. Preparar mídia antes de ativar leitura pública; falhas parciais ficam rastreáveis e são reconciliadas.

Retirar desativa a seleção pública e invalida caches/listas, preservando o original privado. Caso a retirada inclua revogar a URL pública, remover/invalidar também a cópia pública e o cache. Ocultar a linha na UI não revoga um arquivo público; conteúdo já baixado não pode ser recuperado. Durante cache ou reprodução já iniciada, não prometer corte instantâneo.

A API pública retorna apenas metadados publicáveis e URL de reprodução aprovada. Não expor chaves internas, URLs de upload, hashes, nomes privados ou versões em rascunho. Aceite inclui requisição direta sem login, não apenas inspeção da tela.

## Acervo existente

Antes de migrar: inventariar quantidade, origem, tamanho, objetos faltantes e permissão de publicação. Fazer uma importação piloto por cópia, com relatório de duplicatas e sugestões de agrupamento. Preservar nome original/proveniência e não apagar, renomear ou mover o acervo de origem.

Um manifesto antigo pode alimentar um importador único, jamais voltar a ser a biblioteca canônica. Validar o resultado antes de ampliar para o restante do acervo. Faixas de marca antiga podem ficar arquivadas; renomear o arquivo não altera o que está cantado na gravação.

## Limites da V1

MP3 como formato inicial proposto; WAV, transcodificação, extração de letra, sincronizador local e importadores externos dependem de decisão posterior. O helper de Windows seria uma aplicação autorizada separada: o site hospedado não ganha acesso automático à pasta Downloads.

O Inbox é gestão musical mínima para Cassiano, não um novo ERP ou SaaS multiusuário. Fluxos visuais seguem [EXPERIENCE.md](EXPERIENCE.md); reprodução e filas seguem [RADIO.md](RADIO.md).

## Aceite da biblioteca

Importar múltiplos arquivos; repetir envio sem duplicar; detectar bytes iguais com nomes diferentes; não fundir músicas pelo título; corrigir título sem renomear binário; publicar a principal e manter outra versão privada; retirar sem apagar o original; retomar falha parcial; negar gravação anônima; impedir acesso público a rascunho; disponibilizar uma publicação sem commit/deploy.
