# Taste controls for CM 3D & Radio

Use for substantial composition, player redesign, studio redesign, responsive restructuring, or visual-reference work.

## 1. Dials

### Variance

- 1-2: literal fidelity fix; no redesign.
- 3-4: small controlled evolution.
- 5-6: authored but conventional product UI.
- 7-8: strong CM 3D & Radio identity; project default range.
- 9-10: experimental; only with explicit direction and visual proof.

Raise variance through layout, proportion, typography, split balance, control grouping, material treatment, and asymmetric emphasis.

Do not raise variance through random glow, shapes, cards, or extra controls.

### Motion

- 1-2: only basic feedback.
- 3-4: state transitions, focus, simple reveals.
- 5-6: audio reaction, track transitions, divider continuity, richer player state; default range.
- 7-8: highly expressive radio interactions when performance/readability remain safe.
- 9-10: avoid unless motion itself is the requested experience.

Motion belongs mostly to the radio. The studio should usually stay calmer.

### Density

- 1-3: too sparse for the radio; acceptable only for a deliberate studio hero.
- 4-5: calm studio/editorial density.
- 6-7: balanced product default.
- 8: full-player/playlist dense desktop operation.
- 9-10: likely too cramped unless the user explicitly wants a power-user view.

## 2. Surface presets

### Desktop split home

Start around:

- variance 8
- motion 6
- density 6

Goal: unmistakable two-world composition, not two generic cards.

### Full radio player

Start around:

- variance 8
- motion 7
- density 8

The surface may be visually rich, but track info, controls, playlist, and visualizer must remain scannable.

### Equalizer / visualization

Start around:

- variance 7
- motion 8
- density 6

The motion is earned because the audio signal is the content. Fake/repeating movement is worse than a simpler truthful visualizer.

### 3D studio landing/content

Start around:

- variance 6
- motion 3
- density 5

Use typography, photography, printer/material imagery, and composition before effects.

### Mobile mini-player + studio

Start around:

- variance 5
- motion 4
- density 6

Priority is operability and preserving viewport for the 3D content.

## 3. Inference rules

- "igual", "so", "apenas", "nao inventa": variance 1-2.
- "mais Winamp": increase software tactility, density, segmented control grammar, playlist/equalizer hierarchy; do not literally copy a proprietary skin.
- "mais moderno": improve type, proportion, alignment, state transitions, and material; do not erase the retro-software identity.
- "menos poluido": reduce competing glows, decorative lines, repeated labels, and equal visual weight; do not hide useful controls first.
- "mais chique": simplify studio surfaces, strengthen image/copy balance, use restraint; do not add gold/glass/glow by reflex.
- "mais futurista": use precision, lighting, depth, display/control behavior, and real-time state; do not add generic stars/cyberpunk shapes.
- "a imagem ta gritando": reduce image scale/contrast/coverage before adding overlays or more copy.
- "3D repetindo": fix wording hierarchy and naming before changing layout.

## 4. Visual locks

### Radio color lock

Radio may own brighter neon/spectrum behavior. Limit strong glow to active/audio states and focal controls.

### Studio color lock

Studio uses a quieter subset of the palette. Its identity should come from media/material/type rather than radio-level glow.

### Control lock

Player buttons, playlist rows, toggles, shuffle state, and transport controls must share one control language.

### Equalizer lock

Bars/spectrum/visualization should use one consistent signal grammar. Do not mix unrelated bar styles, waveforms, or ornamental meters in the same player.

### Media lock

Printer/product/material images must be approved/realistic enough to function as evidence. Avoid obviously AI-random objects when presenting studio capability.

### Split lock

Desktop radio/studio proportions can move, but each side must remain usable across the allowed divider range.

### Mobile lock

Mini-player stays compact and persistent without becoming a second navbar-sized wall.

## 5. Anti-slop catalog

Reject by default:

- giant cosmic background everywhere;
- generic star particles;
- astronaut mascot reintroduced without explicit approval;
- glass panel behind every block;
- radio UI reduced to one glossy rounded card;
- equalizer as decorative wallpaper;
- random spectrum colors disconnected from the player grammar;
- fake knobs/sliders/meters that do nothing;
- duplicated transport controls;
- duplicate player on desktop;
- 3D side turned into ecommerce cards before a real catalog exists;
- random vase/figurine grids;
- icon badges for materials/colors when photography or text is clearer;
- huge printer image swallowing the message;
- CTA floating without a clear studio proposition;
- central divider with arrows or equalizer decoration that obscures dragging;
- 3D and Radio headings competing at equal hero intensity in the same viewport.

## 6. Composition repertoire

### Split workstation

Primary desktop model. Two persistent worlds separated by a functional divider. Use when both radio and 3D must be visible simultaneously.

### Full radio workstation

Player header/status + transport + track identity + equalizer + playlist/library. Dense but bounded.

### Radio focus mode

Use when the radio temporarily becomes primary; enlarge player content without introducing a second player instance.

### Studio hero + proof

Clear studio proposition paired with one strong printer/brand/media asset and one CTA. Keep text concise.

### Materials/color rail

Use once real material/color content exists. Prefer tactile swatches/photos and concise labels over decorative icon grids.

### Printer/equipment feature

Use real X1/P1S or current equipment imagery only when it explains capability. Avoid generic machine renders.

### Process strip

Use for a short real workflow such as idea -> preparation -> print -> finish. Keep it compact; do not turn it into SaaS feature steps.

### Product/gallery expansion

Only when enough real content exists. Start editorially; do not default to marketplace cards.

## 7. Equalizer quality gate

Ask:

- are bars changing from actual analyser data?
- do low/mid/high regions behave differently?
- do quiet passages visibly calm down?
- do vocals/background elements affect the signal when audible?
- does the visualization avoid one repeated metronomic pattern?
- does paused state clearly differ from playing state?
- is motion still readable rather than chaotic?
- does performance remain stable?

If the answer is no because the available analyser cannot infer it, simplify honestly instead of simulating precision.

## 8. Page rhythm

The split page should have one dominant tension: software radio versus material 3D studio.

Do not create several competing mini-themes inside each half.

Radio can be denser and more luminous. Studio should provide visual rest through calmer surfaces, better photography, and clearer spacing.

## 9. Pre-flight

Before `ready_for_frontend: yes`, check:

- does desktop clearly read as 3D studio left / radio right?
- is the full desktop radio independently operable without a persistent mini-player?
- can essential radio use happen without page scroll?
- is the divider obviously draggable but visually quiet?
- does the radio feel like purposeful software rather than a glossy card?
- is the equalizer truthful to audio/state?
- does the studio feel real and premium rather than AI-generated filler?
- is image scale controlled?
- is "3D" wording not repeated awkwardly?
- does mobile switch to compact player + 3D instead of stacking desktop?
- are touch targets, focus, long titles, loading/error, and reduced motion covered?
- would removing glow still leave a strong composition?

If any essential answer is no, correct it before frontend handoff.
