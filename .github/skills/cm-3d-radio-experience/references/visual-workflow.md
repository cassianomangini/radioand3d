# Visual workflow / CM 3D & Radio (v2)

## Scope

This skill is an experience/design reviewer, not an unapproved permission to alter production UI. The repository's `AGENTS.md`, active design contracts, latest accepted mock and real browser implementation outrank cached examples here.

## Existing source of truth (09 Oct 2026)

- Studio is on the **left** and full Radio on the **right** on desktop.
- Requested 09 Oct 2026: a **third desktop presentation** where dragging Radio to the right beyond minimum width docks it **up into the navbar** as the sole visible compact player. Restore sidebar by navbar action or leftward edge drag; this is distinct from fullscreen and still awaits rendered art approval. See `docs/design/CM_RADIO_NAVBAR_DOCK_V1.md` / `docs/work/03c-radio-navbar-dock.md`. Mobile has persistent mini-player below the header and Studio below it. There is no additional desktop mini-player.
- A narrow divider is draggable. Do not insert a permanent arrow; the tiny approved cue may appear contextually during press/drag. No fake meters.
- Preserve the real single audio provider and playback/queue during split-to-focus/fullscreen and route navigation. This accepted behavior is not a redesign target by default.
- `/studio` presents exactly three entry areas: Impressões (large left), Orçamento and Produtos (stacked right). Materials/Colors are supporting content, not a fourth entry.
- A product has ONE principal CTA: **Comprar na Shopee**. No cart or local checkout. Use real data; do not fake prices, stock, photos or reviews.
- Commercial studio surfaces remain less neon and more photographic/material than Radio. Avoid repetitive AI-style icons and card-inside-card.

## Visual implementation decision

| Intent | First choice | Exceptional upgrade |
| --- | --- | --- |
| Semantics, typography, navigation, forms | DOM/CSS | None |
| Real diagrams/outlined light/rings | SVG | SVG filters only where justified |
| Static photographic/scenographic background | Approved image asset | Art-directed AVIF/WebP |
| Layout morph, gesture, presence, interruption | Motion for React | Native View Transitions if scope/state better |
| Staged SVG/scroll choreography | GSAP candidate | Add ONLY after tested gain/license review |
| Active spectrum/reactive audio | Existing real sidecar/Canvas/DOM | Do not fake instrumentation |
| Genuinely explorable print geometry | React Three Fiber candidate | Must have real model, GPU budget and static fallback |

Consider React Bits, Magic UI and Codrops as catalogs of reference examples, not default installed dependencies. Confirm actual license *of the selected component*, including redistribution. Do not copy an entire theme or overwrite studio identity.

## Gate: identity before renderer

The first decision is **not** CSS versus a library: it is which existing **CM product surface** this belongs to. Before sketching anything, consult `docs/design/CM_SITE_VISUAL_IDENTITY_AUDIT_V1.md`, `docs/EXPERIENCE.md`, relevant brand assets, live tokens and approved compositions.

- Parent `CM 3D and Radio`: site shell/header; preserve nav/logo and split/player persistence.
- `CMANGINI 3D` + X1: specific studio brand artwork, never fake proof of a printed part.
- `CM Radio`: audio-activated blue/cyan/violet/pink artwork and dense controls, not a template for every Studio page.
- Physical 3D pieces/cases: content photography may have warm or distinct project-owned colors; never recast those as global brand tokens.

Use actual site palette (`#020305`, `#03050A`, `#4E9DFF`, `#52D6FF`, `#8B6DFF`, white text) and the current hero gradient only in its intended accent roles; exact values reside in code. `/studio` is the accepted 3-entry hub, whereas `/studio/impressoes` is an editorial gallery inside the existing shell. The three previously rendered lab variants are **invalid as creative candidates** despite passing tests. No art proposal is eligible without a site-context comparison.

## Render-first QA checklist

1. Capture BEFORE, reference, and AFTER for the same viewport/state. If approved screenshots are missing, comparison is descriptive and cannot be called exact reference parity.
2. Test desktop wide, laptop, short desktop, 390 and narrow mobile, with long titles, audio paused/playing (when relevant), keyboard, touch and reduced motion.
3. Identify **up to five highest-impact differences**: hierarchy, composition, image crop, lighting/material, typography, overflow or broken interaction. Correct and recapture.
4. Prevent regression of no page-level unwanted scroll, one audio instance, no player remount, usable controls, correct link destination, no duplicated copy.
5. Visual score is advisory; pixel differences are regression evidence, never aesthetic truth. Do not automatically approve with numeric thresholds alone.
6. Report: files/commit, reference, screenshots, conditions, checks actually run, failed checks, and whether Cassiano approved. If browser is unavailable, record a block instead of marking reviewed.

The repository's tracked delivery is `docs/work/08-visual-quality-evolution.md`. Follow `docs/design/CM_VISUAL_RENDER_PIPELINE_V1.md`, `docs/design/CM_VISUAL_RECIPES_V1.md` and available evidence in `docs/work/evidence/`. For browser QA, use the installed `pnpm visual:qa` (Playwright, screenshots and Axe inventory) alongside the existing CDP Radio suite. No current baseline grants aesthetic approval automatically.
