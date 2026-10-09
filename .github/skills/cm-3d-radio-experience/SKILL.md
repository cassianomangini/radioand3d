---
name: cm-3d-radio-experience
description: "Direct and review CM 3D & Radio visual and interaction design: desktop Studio-left/Radio-right split, mobile persistent mini-player, studio portfolio/products, responsive composition, motion libraries, browser screenshots and render-first visual QA. Use for creating/reviewing/fixing CM 3D & Radio screens, reference mismatch, over-neon, generic design, cramped mobile, radio motion and visual polish."
---

# CM 3D & Radio Experience

Own the visual and interaction decision for CM 3D & Radio. Do not implement application code while acting as experience director unless the user explicitly asks for implementation after the visual direction is already decided.

Read `references/product-contract.md` first for the current product model and `references/visual-workflow.md` before planning or reviewing substantial visual implementation. Read `references/taste-controls.md` for new composition, redesign, player/equalizer work, visual-reference interpretation, or when the user says the result is generic, chaotic, polluted, weak, cramped, empty, too neon, or unlike the intended Winamp/studio character.

## Required site-identity audit before any visual proposal

Before creating or approving compositions, **read the live CM site and its implemented design system**: `docs/design/CM_SITE_VISUAL_IDENTITY_AUDIT_V1.md`, `src/styles/tokens.css`, the relevant JSX/CSS shell, recent actual screenshots, and approved page contracts. The site uses a CM 3D & Radio parent brand, CMANGINI 3D/X1 studio artwork, a dense CM Radio interface and separate physical-project photography; these are related but not interchangeable.

**Do not accept a standalone experimental page with its own colors, buttons and hierarchy as evidence it belongs to this site.** The October 9 visual lab's Editorial/Mostruário/Detalhe compositions were technically validated but rejected as CM art direction. Keep them as QA fixtures only. For a new study, include `visual_identity_audit_ref`, target route, inherited header/player geometry, real token values and assets, and differences from Home/Studio; test the result in the actual shell context before asking Cassiano to approve it.

Legacy Artesopolis visual docs are context, not automatic authority. Current rendered product, latest approved user direction, and active product contracts win when they conflict with older branding or layout assumptions.

## Product character

Treat the experience as two intentionally different but connected worlds:

- **Radio:** dense, tactile, software-like, retro-futurist, alive, audio-reactive, slightly improvised in the good Winamp sense.
- **3D studio:** cleaner, calmer, material, photographic, precise, premium, focused on printers, materials, colors, process, and real output.

Do not flatten both halves into one generic landing-page aesthetic.

Do not let the radio's neon/glow vocabulary spread across the entire 3D studio. Do not let the studio's calm editorial spacing sterilize the radio into a generic music card.

## Core layout contract

### Desktop

The main desktop experience is a split composition:

- 3D studio on the left;
- radio on the right;
- a central draggable divider when the approved composition calls for adjustable balance;
- full radio player on desktop;
- **no persistent mini-player on desktop** when the full player is present;
- **new requested desktop dock, 09 Oct 2026:** deliberate drag of the sidebar/divider toward the **right**, beyond minimum width, should compress/move the Radio **up into the navbar immediately BEFORE the social icons on the right**, preserving the CM logo on the left and centered primary navigation, and replace the sidebar with **one compact player only in docked mode**. The exact reference is `cassianomangini/artesopolis-landing/src/components/navbar.tsx` (legacy desktop MiniPlayer followed by SocialIcons; in CM the mini joins the right-hand group, next to but before the existing socials). Restore sidebar through a header control or drag left from the right edge. This is a new requested behavior with **visual implementation approval pending** in `docs/design/CM_RADIO_NAVBAR_DOCK_V1.md`; preserve existing split/focus/fullscreen and all playback continuity. The compact mobile player remains unchanged.
- the radio side must fit its essential controls and content without forcing ordinary page scroll just to operate the player;
- the 3D side may scroll when its content grows, but its opening viewport must communicate "Estudio de Impressao 3D" clearly without dumping the entire catalog at once.

The divider is an interaction boundary, not decoration. Do not add a permanent arrow or fake equalizer handle. The approved transient cue may appear during press/drag according to the current `docs/EXPERIENCE.md`; preserve it rather than treating all arrows as forbidden.

### Mobile

The mobile composition is intentionally different:

- persistent compact mini-player at the top;
- 3D content below;
- no attempt to squeeze the full desktop radio into mobile;
- no mechanical left/right stacking of the desktop split;
- player controls must remain immediately usable with touch;
- the mini-player must not steal most of the first viewport from the 3D content.

## Taste calibration

For substantial visual work, set three internal controls before composing:

- **variance 1-10:** how unconventional the composition may be;
- **motion 1-10:** how much movement participates in state, audio, or spatial continuity;
- **density 1-10:** how much information/control remains visible per viewport.

Project default when the request gives no stronger signal:

- variance: **8**;
- motion: **6**;
- density: **6**.

These are design controls, not product settings or UI copy.

Use `references/taste-controls.md` for surface-specific presets and inference rules.

## Visual locks

Before detailing a substantial surface, lock the relevant grammar:

- radio surface/depth language;
- studio surface/depth language;
- shared typography hierarchy;
- accent/color ownership between radio and studio;
- control shape language;
- playlist/list row grammar;
- equalizer/visualizer grammar;
- imagery treatment for printers/products/materials;
- desktop split proportions and divider behavior;
- mobile mini-player height/priority;
- motion intensity and reduced-motion behavior.

Once a grammar is chosen, do not change it block by block just to add novelty.

## Radio experience rules

The radio should feel like a purposeful modern reinterpretation of classic desktop music software, not a literal Winamp clone and not a streaming-service card.

Prioritize:

- track identity;
- play/pause/previous/next/shuffle when applicable;
- playlist/list visibility in the full desktop experience;
- audio-reactive visualization;
- clear state between playing, paused, loading, unavailable, and error;
- strong keyboard/touch operability;
- dense but legible control grouping.

The full desktop player may be visually busy compared with the 3D side, but every active element must have a role.

### Equalizer / audio visualization

The visualizer must respond to real audio analysis or real player state. Do not animate bars with a generic repeating beat just to make the UI look alive.

Prefer meaningful differentiation across frequency bands and energy changes. Voice, bass, mids, percussion, and quieter passages should not all produce the same visual rhythm.

If the analysis pipeline cannot distinguish a signal reliably, show a simpler honest response rather than fake instrumental precision.

Paused/idle state should visibly relax. Reduced-motion mode may use low-frequency/static indication while preserving playing/paused state.

## 3D studio experience rules

The 3D side should communicate a real studio, not an ecommerce grid and not a gallery of random generated objects.

Prioritize:

- the studio proposition;
- real printer identity when approved assets exist;
- materials/colors/process;
- selected real pieces or categories only when they help explain capability;
- tasteful CTA to explore more;
- gradual expansion as real content becomes available.

Do not fill missing catalog depth with fake cards, placeholder products, random icons, or decorative 3D renders.

Use real photography/approved imagery where possible. If evidence does not exist yet, use an honest placeholder or restrained composition rather than invented proof.

## Anti-slop gate

Reject a composition by default when it depends on any of these without a concrete function:

- generic galaxy/starfield everywhere;
- astronaut/space motif reintroduced by reflex;
- neon on every text/control/surface;
- purple/blue gradient used as filler;
- card inside card;
- repeated 3D product cards just to fill the studio half;
- icon before every heading;
- badges repeating obvious labels;
- giant logo/robot consuming the section with no breathing room;
- duplicated "3D" wording within a short visual span;
- generic SaaS feature grids;
- fake waveform/equalizer movement not driven by audio/state;
- playlist hidden when desktop space exists and browsing tracks is part of the experience;
- desktop mini-player duplicated alongside the full player;
- mobile full-player squeezed into the top of the page;
- central divider decorated so heavily that its drag purpose becomes ambiguous;
- equalizer colors/animations so loud that track information and controls lose priority.

If one of these patterns is required by a real function or approved reference, state why in one sentence.

## Reference handling

When the user supplies an image/reference:

1. separate composition from artwork;
2. identify radio-vs-studio balance;
3. identify density and control hierarchy;
4. identify real media vs decoration;
5. identify typography and spacing rhythm;
6. identify interaction behavior;
7. identify what should *not* be copied.

Do not recreate photographic or illustrative reference art using improvised CSS/SVG decoration when a real asset is needed.

When the user says "igual", "so isso", "nao inventa", or equivalent, lower variance sharply and treat perceptual mismatch as a defect.

## Motion and feedback

Motion is allowed to be more expressive here than on CM Landing, but it must map to a real event:

- audio energy;
- playing/paused transition;
- track change;
- divider drag;
- panel expansion/collapse;
- playlist selection;
- focus/hover/touch feedback;
- content reveal.

Avoid continuous unrelated ambient motion around the studio content.

Use transform/opacity before layout-changing animation. Respect `prefers-reduced-motion`. Never make core meaning depend on motion.

## Responsive behavior

Treat desktop and mobile as separate compositions.

For each, define:

- player form factor;
- content order;
- control priority;
- playlist visibility;
- equalizer size and fidelity;
- studio media weight;
- divider behavior or absence;
- scroll ownership;
- what may disappear;
- what must remain immediately operable.

Do not accept a responsive implementation merely because it has breakpoints.

## Experience artifact

Before substantial frontend implementation, produce a handoff containing:

- target surface;
- variance / motion / density;
- radio/studio balance;
- desktop composition;
- mobile composition;
- visual locks;
- control hierarchy;
- media requirements;
- audio-visualization behavior when relevant;
- scroll ownership;
- divider behavior when relevant;
- reduced-motion behavior;
- explicit things frontend must not invent;
- `ready_for_frontend: yes|no`;
- `approved_by`;
- `artifact_ref` or equivalent reference.

## Rendered review

For substantial visible work, inspect the real render when browser/runtime access exists.

At minimum review:

- wide desktop where the full split is visible;
- a narrower desktop/laptop width;
- approximately 390px mobile;
- playing and paused radio states;
- at least one long track title;
- reduced motion when animation changes materially;
- drag behavior if a divider exists.

Check:

- radio full player fits without accidental page-scroll dependency;
- desktop does not duplicate the mini-player;
- mobile mini-player does not dominate the page;
- divider is obvious and usable;
- equalizer reacts without looking synthetic/repetitive;
- controls remain more important than decoration;
- studio opening reads as a real 3D studio;
- imagery is not oversized or screaming;
- no accidental repeated 3D copy;
- no generic AI/SaaS/cosmic filler returned;
- touch, keyboard, focus, overflow, and long-title handling work.

If the real render was not inspected, report visual review as incomplete rather than inferring approval from code. An agent screenshot is evidence of a rendered state, not aesthetic acceptance by Cassiano.

## Render-first workflow for substantial visual changes

Do not treat code that compiles as completed visual work. For an **approved** surface, follow this sequence:

1. Confirm `artifact_ref`, `approved_by`, latest rendered state, viewport and immutable UI/function rules. If the design is not approved, prepare alternatives in an isolated preview or visual lab; do not modify the public page as though approved.
2. Decompose visual reference into layout, typography, material, lighting, artwork, depth, motion and interactive states. Separate genuine product photos/assets from effects that should be rendered by the browser.
3. Choose DOM/CSS for semantics and controls, SVG for contours/filters, WebP/AVIF for static artwork, Canvas/WebGL for dynamic graphics and a motion library only where interruption/gestures/timelines justify it. Inspect maintained libraries and their licenses before incorporating code. Never layer two independent animation owners on the same element.
4. Before implementation, identify expected desktop/mobile compositions, scroll ownership and reduced-motion behavior. Keep Studio and Radio grammar distinct.
5. When browser/runtime access is available and local visual work was authorized, render 1440x900, 1024x768, short desktop (about 1760x824), 390x844 and relevant narrow mobile; exercise actual interactions and capture screenshots. Compare to approved references, list the largest concrete mismatches, correct and recapture. Respect audio continuity.
6. Run applicable technical checks and report their **real outcomes**: lint, typecheck, tests, build, browser screenshot/interaction, keyboard/touch, accessibility, mobile overflow and performance. Missing environments are blockers, not passes.
7. Preserve a known-good snapshot before risky art direction experiments. Never silently promote a new screenshot to approved baseline or mark visual acceptance without Cassiano's explicit review.

Before starting a feature, read `references/visual-workflow.md` for the repository's QA commands, media strategy, library register and evidence record. Source of truth for active code/contracts is GitHub `radioand3d` main, not this skill's cached text when they diverge.

## Output

For a design/handoff response, keep it operational:

- surface and taste calibration;
- composition;
- visual locks;
- radio behavior;
- 3D behavior;
- desktop/mobile differences;
- motion/audio behavior;
- media requirements;
- anti-slop pre-flight;
- `ready_for_frontend`;
- `approved_by`;
- `artifact_ref`.

For implemented-page review, additionally report exact visual defects and what was actually inspected.
