# 03c — Revisão V2 do dock: Artesópolis Landing → CM Rádio

**Data:** 11/10/2026  
**Status:** D4.1 e D4.2 concluídos como **prévia visual/funcional de desenvolvimento**. **D5 não aprovado**; I1–I6/Q1–Q7 de produção não iniciados.  
**Origem visual:** `cassianomangini/artesopolis-landing` (`master`), arquivos `src/components/navbar.tsx`, `mini-player.tsx`, `social-icons.tsx`, `ui/control-button.tsx`, `src/lib/audio-utils.ts`, `src/lib/player-context.tsx` e `docs/frontend-patterns.md`.  
**Nova implementação:** `src/app/dev/radio-dock/radio-dock-preview.tsx`, `radio-dock-preview.module.css`, `tests/visual/radio-dock-preview.spec.ts`. **Nenhum arquivo da Rádio pública mudou**.

## Correção em relação à prévia V1

A V1 reduzia a navbar do legado a posicionamento: mini com capa de 36px, título e dois botões, sem contexto/controles musicais. A investigação completa do legado mostrou que havia **capa**, marca e faixa em hierarquia própria, **anterior/play/próxima**, **13 barras baseadas no sinal real** e uma superfície chromática marcante, distinta da barra genérica feita antes.

A **V2** reconstrói a composição adaptada ao CM: faixa real de contexto `useRadio`, capa, etiqueta **CM RÁDIO**, título/artista truncados, controles **anterior/play-próxima**, **13 barras do `RadioVisualizer`** alimentadas pelo analisador/sidecars, e restauração da lateral. Usa os tokens do CM e gradiente controlado, não importa DJ astronauta nem o tema legado. A posição continua **imediatamente à esquerda de SocialIcons**; a navegação `Início/Estúdio/Rádio` permanece centrada.

- Layout responsivo do mini testado nos viewports **1180, 1440 e 1760**, com título fictício muito longo **somente na camada de texto do QA** (não alterou a fila/áudio).
- O movimento continua lateral direita → navbar e navbar → lateral, por botão ou arraste; o motor de áudio permanece o provider original, sem duplicar `audio`.
- Uma revisão de screenshot identificou **letras do overlay de voo enormes/cortadas quando o player já estava próximo da navbar**. A tipografia do overlay passou a usar unidades `cqh/cqw` com `container: radio-flight / size` para diminuir com a altura real da superfície animada. O novo screenshot da transição confirmou que a legenda permaneceu dentro do plano em 240ms.
- A prévia mantém um painel de QA identificado como tal e só roda em `/dev/radio-dock` durante `pnpm dev`. Não funciona como design final da Rádio e não publica a variante.

## Evidências verificáveis

**Execução final do laboratório:** [GitHub Actions 38137954780](https://github.com/cassianomangini/radioand3d/actions/runs/38137954780) — **9 testes browser passaram**, 23 skips deliberados devido ao recorte por viewport e cenário de produção; sem retries em `VISUAL_LAB_QA=1`. [Artefato com screenshots, vídeo e relatório](https://github.com/cassianomangini/radioand3d/actions/runs/38137954780/artifacts/11701662794).

**CI geral no mesmo SHA `35f7de3f`:** [run 38137954786](https://github.com/cassianomangini/radioand3d/actions/runs/38137954786) — **lint, typecheck, unit tests e build passaram**. O workflow de desenvolvimento inclui lint local do protótipo (verde). O browser da CI principal é configurado para rodar em outros gatilhos, de modo que seus steps visuais foram pulados nesta execução; não descrevê-los como validados ali.

**Cenários de browser comprovados:**
1. Header real CM com logo/nav, componente Rádio lateral inicial, mini à esquerda dos ícones sociais em estado `docked`, restauração e nenhum `audio` duplicado;
2. arraste da divisória para a direita e retorno pela borda direita puxada para a esquerda;
3. **1180/1440/1760:** barra com marca/faixa, 3 transportes, 13 barras, restaurar, título longo truncado, sem sobreposição da nav/ícones/controles e sem scroll horizontal;
4. **som efetivo no navegador:** `/dev/audio-fixture` (WAV sintético **de desenvolvimento**, não música pública) atingiu `playing`, **a altura de barras reais mudou** via Web Audio, e voltou ao repouso ao pausar. A screenshot `radio-dock-real-fixture-playing.png` comprova o estado; teste verifica dinâmica numérica, não uma animação CSS falsa;
5. Próxima/anterior alteram e restauram a faixa da **fila do mesmo RadioProvider**; Enter no botão de restaurar retorna ao modo lateral;
6. `prefers-reduced-motion` preserva estados sem voo; layout mobile 390 e tablet 1024 permanecem sem segundo mini.

**Inspeção humana do agente:** conferidos screenshots do laboratório no browser (desktop com player parado, reprodução sintética, mobile/1180/1440/1760, transição durante voo e retorno), e corrigido defeito visual de clipping. Isto é **autorrevisão técnica/visual do agente**, não aprovação de Cassiano.

## O que ainda falta

- **D5:** Cassiano avaliar o tamanho real da barra, o cromatismo e a transformação; nenhum aceite é implícito.
- **I1–I6:** mover conceito aprovado para a máquina de estados real `RadioLayoutMode`, gestos e layout/FLIP nativos, preservar estado por rota/resize, remover o tratamento por portal/atributos usado como harness.
- **Q1–Q7:** provas finais com música R2/sidecar de verdade, continuidade da reprodução em rota e fullscreen, interrupção de gesto/animação, acesso por teclado no produto e múltiplos dispositivos; publicar somente com autorização adequada.
- **Arte reproduzida:** a Landing antiga mantinha mini fixo na navbar; o efeito de subida é uma **capacidade nova do CM**, não um recurso legado copiado.

**Próxima ação:** apresentação da V2 para apreciação de Cassiano; depois da aprovação visual, implementar a interação no shell público com os testes previstos. O design pode ser refinado antes de D5 sem impactar o layout público.
