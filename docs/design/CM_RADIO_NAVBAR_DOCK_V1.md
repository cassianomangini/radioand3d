# CM Rádio — Dock superior na navbar (proposta V1)

**Pedido funcional:** Cassiano, 09/10/2026. **Contexto:** nova evolução pontual da Rádio após a passagem aceita em 05/10, **não** reabertura automática de C1–C8.  
**Comportamento solicitado:** ao empurrar/arrastar a Rádio lateral **para a direita**, ela deve **subir e se transformar em um player compacto dentro da navbar**, liberando o Estúdio. O usuário consegue **restaurar a Rádio lateral** por um botão na navegação ou arrastando novamente a partir da borda direita.  
**Gate:** comportamento indicado pelo usuário; **posição do dock no cabeçalho confirmada por Cassiano: imediatamente ANTES do grupo de ícones sociais, à direita da navegação principal; acabamento e animação ainda não aprovados em mock/render**. `ready_for_frontend: no` até revisão da prévia do movimento. `visual_approved_by: null`. `artifact_ref: docs/design/CM_RADIO_NAVBAR_DOCK_V1.md`.  
**Checklist:** [03c — Dock da Rádio](../work/03c-radio-navbar-dock.md).

## 1. Princípio de interação

O produto passa a ter um novo estado de apresentação da Rádio no desktop: **`docked`**. Ele é mutuamente exclusivo com `split`, `custom`, `focus` e `fullscreen`, sem interferir na reprodução.

A Rádio **não desaparece abruptamente**. Ela parece fisicamente ser recolhida da lateral direita, subir e encaixar-se **à esquerda e imediatamente antes dos botões de redes sociais no cabeçalho** (no mesmo agrupamento de ações à direita), onde só permanece um **player pequeno**. Enquanto isso, o Estúdio ganha a largura liberada. O conteúdo da Rádio e o motor de áudio não são reinicializados.

### Estado A — Rádio lateral (existente)

```text
╔════════════════════ HEADER SOMENTE DO ESTÚDIO ══════════╦═══════╗
║ CM 3D & Radio       Início  Estúdio  Rádio              ║       ║
╠════════════════════════════════════════════════════════╣ RÁDIO ║
║                                                        ║       ║
║ ESTÚDIO, HOME, HUB OU CONTEÚDO                           ║ PLAYER║
║                                                        ║       ║
║                                                        ║       ║
╚════════════════════════════════════════════════════════╩═══════╝
                                             arrastar para a direita →
```

### Estado B — Rádio acoplada à navbar (novo)

```text
╔══════════════════════════════════════════════════════════════════════════════╗
║ LOGO CM       Início   Estúdio   Rádio       [♪ Faixa  ▶  Abrir]  [redes sociais] ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║                     ESTÚDIO OCUPANDO A LARGURA LIBERADA                       ║
║                                                                              ║
║                                                                           ▏  ║
╚══════════════════════════════════════════════════════════════════════════════╝
                                             ↑ borda direita arrastável
```

Esquema funcional, **não mock final**. A ordem da navbar em dock é **logo à esquerda | navegação centrada | player compacto | grupo de redes sociais à extrema direita**. **As redes sociais não desaparecem para abrir espaço para o mini player.** O header deve permanecer equilibrado; não cortar a marca nem empurrar a navegação para fora da tela.

### Referência verificada: Artesópolis Landing (legado, somente comportamento/composição)

Cassiano esclareceu em 09/10/2026 que o mini player deve ficar **antes dos botões sociais**, como na experiência de navbar da antiga Landing Artesópolis. O repositório legado foi conferido:

- `cassianomangini/artesopolis-landing/src/components/navbar.tsx` (`master`): no desktop, a navbar organizava **marca/menu | MiniPlayer | SocialIcons** em três áreas do grid, com o player no centro e os ícones na última área à direita.
- `cassianomangini/artesopolis-landing/src/components/mini-player.tsx`: o player mostrava arte, faixa, controles e um visualizador ativo por um contexto único de áudio.
- **Distinção deliberada:** no novo CM, a navegação principal `Início / Estúdio / Rádio` **permanece centralizada** e o player passa a integrar o **grupo de ações à direita**, imediatamente **antes dos ícones sociais**, não na coluna central. Não importar o estilo neon, o astronauta, os arquivos do player ou sua antiga arquitetura; apenas usar a relação espacial/comportamental como referência.

**Decisão confirmada:** posição relativa `dock → redes sociais` aprovada pela indicação direta de Cassiano. **Pendente:** dimensões, conteúdo de controle e percepção visual da transformação, que continuam sujeitos a preview.

## 2. Gatilhos e reversão

**Entrar no dock pelo gesto:** no desktop, o usuário arrasta a divisória **para a direita**. O resize normal continua funcionando até a largura mínima da Rádio; somente uma continuação clara do gesto **além** desse mínimo sinaliza o magnetismo do dock. Durante o arraste, a navbar antecipa discretamente o ponto de encaixe. Ao soltar depois de passar o limiar, a Rádio sobe e se recolhe. Um movimento pequeno ou cancelado volta ao estado lateral sem ativar o dock.

**Retornar por botão:** o player da navbar contém um controle nomeado **“Abrir Rádio lateral”** (rótulo acessível visível ou tooltip com foco); clicar nele executa a transformação inversa e restaura a largura lateral anterior. O item **Rádio** da navegação principal já abre a Rádio em tela inteira e **preserva essa função**: o botão do dock é distinto, para não criar ambiguidade. É aceitável explorar visualmente o controle junto ao player, mas não duplicar o logo nem cobrir o título da música.

**Retornar pelo gesto:** no estado `docked`, deixar uma zona de arraste **sutil e funcional** na borda direita. Puxá-la **para a esquerda** reabre a Rádio lateral com o mesmo efeito invertido. Não depender apenas de hover; suporte a mouse, touch onde fizer sentido e teclado. Não usar seta circular/equalizador fictício permanente sobre o divisor.

**Outros estados:** o modo `fullscreen` existente, acionado pelo link Rádio ou pelo arraste forte para a esquerda, continua operando. O dock é um caminho adicional **do modo lateral para o topo**, não uma substituição de fullscreen nem do foco.

## 3. Conteúdo do player no cabeçalho

O player compacto aparece **apenas no estado `docked` do desktop**; não aparece ao lado da Rádio lateral completa nem da fullscreen. A composição do lado direito da navbar é um **grupo horizontal na ordem player compacto → botões sociais**. Os ícones de redes sociais existentes preservam sua posição final à direita, visibilidade e espaçamento próprio. O grupo do player contém:

- pequena imagem/identidade da faixa real atual (quando disponível, fallback existente se não houver capa);
- **título** e, quando couber, artista, truncados sem corte de controles;
- **play/pause** funcional, acionando o mesmo `useRadio()` que a sidebar e o mini mobile;
- um controle distinto para **restaurar a Rádio lateral**;
- acesso opcional à próxima faixa **somente se couber** em desktop intermediário; não sacrificar legibilidade ou equilibrar a navbar à força.

O player inteiro não é um segundo motor de áudio nem cópia independente do player completo. Ele é uma **vista pequena do mesmo estado de reprodução**. Playlist, letra, visualizador grande e controles secundários saem de vista enquanto a Rádio está recolhida; permanecem disponíveis após restauração/fullscreen.

## 4. Movimento de assinatura (não um fade de cards)

Direção: **deslocamento para cima + compressão horizontal e vertical + encaixe no header**. Percepção esperada: a mesma superfície física que ocupava a lateral encontra seu lugar na navbar. A capa/título têm continuidade visual; conteúdos de playlist/letra/visualizador reduzem sua presença durante a transição, sem teleporte de elementos nem zoom de toda a UI em escala ilegível.

- Gatilho: drag para direita além do mínimo ou botão “Recolher Rádio” da interface lateral (se o mock confirmar). 
- Distância: da borda direita da Rádio até a zona de encaixe no canto direito do header, com resize do Estúdio coordenado.
- Duração-base a testar: aproximadamente **550–700 ms** no snap, sem atraso arbitrário. Arraste imediato, com feedback de proximidade; interromper/reverter em qualquer ponto.
- Interrupção: novo drag, clique de restaurar, rota Home↔Estúdio, resize do viewport ou abrir fullscreen devem terminar no **estado correto**, sem painéis fantasmas, timers órfãos ou dois transportes ativos.
- Movimento reduzido: transição sem viagem/compressão; trocar para os estados estáveis, preservando foco, áudio e informações essenciais.
- Renderer: manter o **motion spine WAAPI/FLIP já aceito**, estendendo o estado/medição de origem e destino. Motion for React só entra se um teste isolado demonstrar ganho sem dois motores competindo no mesmo painel.

## 5. Arquitetura e contratos afetados — diagnóstico da main

Inspecionado em 09/10/2026:

- `src/components/studio-radio/radio-motion-spine.ts`: `RadioLayoutMode` só conhece `split | custom | focus | fullscreen`; será necessária extensão explícita para `docked` sem quebrar callers e contratos já testados.
- `studio-radio-shell.tsx`: resize usa `clampRadioWidth`, `handlePointerDown`, `handlePointerMove`, `stopDragging`; o valor é calculado por `rect.right - event.clientX - dragOffsetRef.current`. O limite mínimo atual impede dock por simples resize. Detectar **overshoot para a direita antes do clamp** e aplicar gatilho/histerese independente do fullscreen, que usa overshoot na direção oposta.
- `radio-panel-drag.ts`: snap points existentes são `compact, balanced, focus` (todos com sidebar). O dock é **estado terminal diferente de `compact`**: não transformar o snap `compact` em `docked` automaticamente.
- `studio-radio-shell.module.css`: o header desktop termina em `right: calc(var(--radio-width) + var(--rail-width))`, a Rádio é fixa à direita e o divisor permanece à esquerda dela. Em dock, o header precisa **ocupar todo o viewport** sem alterar a navegação global; o Estúdio ocupa a área liberada. O bloco direito atual contém `SocialIcons` e tem espaço limitado: será preciso compor um grupo **[dock player][SocialIcons]**, mantendo o menu principal geometricamente centrado. Atualmente o CSS oculta os ícones sociais em expansão/focus; **essa regra não pode esconder redes sociais em dock**. O antigo `resizeHandle` deixa de estar na fronteira do painel e vira uma zona de retorno na borda da tela.
- `studio-radio-shell.tsx` `navigateStudioRoute`/`restoreInitialRadioLayout` restauram o split durante navegação: deve haver uma exceção deliberada para preservar `docked` ao visitar Home/Estúdio/Produtos. Não redefinir áudio nem forçar a sidebar a reaparecer a cada link.
- `RadioContent` permanece montado ou isolado de modo que não perca dados/estado; com dock estável, conteúdo completo deve ficar **inert/fora da ordem de foco** e o custo de desenhar o visualizador oculto deve ser suspenso quando possível. **Não montar um segundo `<audio>`.**
- Mobile usa sua própria mini no topo; **não** criar um segundo dock mobile. Ao cruzar o breakpoint desktop/mobile, resolver a apresentação sem manter dois compactos visíveis.

## 6. Design CM: identidade e encaixe

Respeitar [auditoria da identidade](CM_SITE_VISUAL_IDENTITY_AUDIT_V1.md): header quase preto `#020305`, marca original, Manrope nos controles, ciano `#52D6FF` apenas no progresso/estado ativo, violeta como assinatura discreta, sem caixa de vidro/neon que pareça widget independente. A Rádio recolhida deve lembrar um **instrumento pequeno integrado ao cabeçalho**, não uma barra de Spotify colada no site.

Preservar o padrão do mini mobile como referência de **informações** e controle, não copiar suas duas linhas, alturas ou equalizador para navbar desktop. Nada de visualizador fake ou mais de uma instância simultânea. A barra divisória original permanece como linguagem visual no split; quando recolhida, o affordance da borda deve ser discreto.

## 7. QA / aceite necessário antes da UI definitiva

- Demonstrar com vídeo/capturas do browser os estados **lateral → puxando à direita → dock no topo → botão de retorno → lateral** e **dock → puxar da borda à esquerda → lateral**.
- Cobrir início/cancelamento/reversão no meio da animação; drag pequeno não aciona modo sem intenção; overshoot à esquerda para fullscreen continua funcionando.
- Verificar que playback, tempo, faixa, playlist, shuffle/repeat e seek não reiniciam; **um único áudio** persiste enquanto o dock, header, rota e fullscreen mudam.
- Confirmar que a nav continua legível e centrada em 1440, 1180, 1024 (sem dock abaixo do breakpoint real), desktop baixo; text overflow e zoom 200%; foco de teclado nunca vai para o painel oculto. No dock, conferir explicitamente a ordem **logo | nav central | mini player | ícones sociais**, nenhum ícone escondido, nenhuma sobreposição e player truncando título antes de roubar espaço do menu.
- Contrastar modo desktop `docked` com mobile 390/360, reduced motion e entrada/saída em resize. Sem layout shift ou scroll horizontal por reaparecimento do painel.
- Não declarar o efeito pronto só porque CSS animou a largura; a percepção espacial de **subir para navbar** e sua reversão precisam ser revisadas com Cassiano.

**NÃO executado:** nenhuma mudança do shell, motor de áudio, estilo de produção ou testes nesta especificação. `ready_for_frontend: no`, `visual_approved_by: null` para a composição/transição final.
