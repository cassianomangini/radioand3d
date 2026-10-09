# CM 3D & Radio product contract

Use this as the product-shape baseline for visual decisions. If current code or a newly approved user direction conflicts with this file, reconcile the conflict instead of silently following stale assumptions.

## Product model

CM 3D & Radio combines two experiences:

1. a music/radio experience with a strong software/player identity;
2. a 3D printing studio experience focused on real capability and material output.

The two halves share one brand and one page, but they do not need identical visual density or interaction grammar.

## Desktop

- 3D studio left;
- radio right;
- central draggable split when active in the approved design;
- full desktop radio player;
- no persistent desktop mini-player when the full player is present;
- essential radio operation should not depend on scrolling the page;
- playlist/equalizer/full-player content may use the radio pane's internal composition;
- 3D pane can grow with future content.

## Mobile

- compact persistent mini-player at the top;
- 3D content below;
- no full desktop player squeezed into mobile;
- mobile must remain touch-first and readable;
- the radio remains available while the user browses the 3D content.

## Radio character

- modern Winamp spirit rather than literal skin cloning;
- old-school software tactility;
- dense but organized;
- visible audio state;
- playlist and shuffle behavior when supported;
- equalizer/visualizer driven by real audio analysis;
- controls and track identity always outrank decorative light.

## 3D character

- "Estudio de Impressao 3D" must be clear;
- start simple and expand with real materials, colors, printers, photos, and pieces over time;
- prefer approved real imagery;
- avoid random product-grid filler;
- clean/premium enough to contrast with the denser radio half.

## Technical continuity

Current repository patterns include:

- Next.js App Router;
- global player state via provider;
- UI/engine separation for the player;
- audio analysis with Web Audio / analyser pipeline;
- `next/image` for important media;
- responsive player variants;
- Tailwind/CSS-based visual work.

Visual redesign must not casually break the global player continuity across routes.
