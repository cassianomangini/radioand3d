# Entrega 06a: equalizador sonoro da CM Rádio

## Identificação

ID do roadmap: 06a. Responsável: CM Audio. Branch `feat/radio-equalizer`, base `fix/radio-volume-popover` (`a7a76fa`). Contratos lidos: [plano](../PROJECT_PLAN.md), [Rádio](../RADIO.md) e [experiência](../EXPERIENCE.md). Dependência verificada: motor único e `AnalyserNode` da 06 já implementados; revisão de áudio da 06 ainda pendente.

## Resultado e limites

Objetivo observável: alterar o som com dez bandas sem criar outro player ou interromper a reprodução ao abrir/fechar a interface. Incluído: controles de -12 a +12 dB, ativação, Zerar, estado compartilhado e análise após filtros. Fora de escopo: presets, normalização de loudness, persistência após recarga e edição das músicas. Arquivos reservados: `src/features/radio/`, `src/components/studio-radio/`, testes e contratos desta entrega. Não há escrita remota.

Aceite técnico: com equalizador desligado ou zerado, os ganhos aplicados são neutros; com uma banda ajustada e ativada, o filtro recebe o ganho correspondente. A fonte de áudio permanece única; o visualizador recebe o sinal após os filtros. Se o grafo falhar, a reprodução deve continuar e a interface deve mostrar o equalizador indisponível. Cassiano revisa aparência, interação e som em desktop e mobile antes da interface final.

## Checklist de execução

- [x] Base, dependências, contratos e escopo verificados; trabalho anterior preservado.
- [x] Critérios de aceite definidos antes da implementação.
- [x] Encadear dez filtros no grafo único e manter fallback audível pelo código.
- [x] Expor estado e ações de equalização pelo provider compartilhado.
- [x] Implementar painel acessível e responsivo como proposta visual.
- [x] Executar testes, lint, tipos, build e revisar diff.
- [ ] Cassiano revisar interface renderizada e escuta com áudio real.
- [ ] Atualizar evidência, roadmap e PR.

## Evidência

`pnpm test` passou com 18 testes, incluindo clamp, bypass, configuração das dez bandas e a ligação fonte → filtros → análise → saída. `pnpm check` passou para lint, tipos e build. O HTML da Home local respondeu 200 com o botão EQ e 342 próximas músicas. O grafo e o fallback foram conferidos por código; build e testes não comprovam mudança sonora audível, fallback real ou aparência renderizada.

## Retomada

Último ponto verificado: grafo, controles e verificações técnicas implementados nesta branch. Pendências: Cassiano revisar painel, teclado/toque e escutar ganho, bypass e continuidade em desktop/mobile; verificar fallback com falha real de Web Audio. Próxima ação: abrir PR de rascunho e pedir revisão visual e de áudio. PR: ainda não aberto.
