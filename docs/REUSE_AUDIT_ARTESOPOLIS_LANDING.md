# Reuse audit: artesopolis-landing

Source reviewed: `cassianomangini/artesopolis-landing` on branch `master`, current tree at commit `546af1c5b3b18e6b03a72a658e843864e69d8f8d`.

## Goal

Reuse mature technical pieces without carrying the Artesopolis visual language into CM 3D and Radio.

The new site must have **CM identity**. Astronaut, Artesopolis lettering, cosmic mascot language and branded copy are not part of the new product unless explicitly reintroduced later.

## What is worth reusing

### 1. Player behavior: reuse as reference, not as the new engine

The current player proves useful behavior:

- persistent playback at root layout level;
- remote audio from Cloudflare R2;
- play/pause;
- previous;
- skip;
- shuffle;
- history;
- temporary blocking/retry of failed tracks;
- automatic advance;
- loading/error handling.

These behaviors are worth preserving.

The current implementation should **not** be ported wholesale.

Problems found in the current source:

- `PlayerProvider` owns playback, track selection, Web Audio lifecycle, analysis and visualizer DOM coordination at the same time;
- the provider exposes `setBarRef()` and mutates visual bar styles directly on every animation frame;
- the visualizer has a hard-coded 13-bar model;
- Meyda `loudness.specific` + RMS are transformed into display levels through custom adaptive normalization;
- this is a visualizer, not an audio equalizer;
- presentation details leak into the audio engine;
- the track model contains only `title` and `file`;
- title/version grouping is inferred from filename regexes;
- the playlist is a static `tracks.json` generated from a local folder.

Files to use as **behavioral reference only**:

- `src/lib/player-context.tsx`
- `src/lib/audio-utils.ts`
- `src/types/player.ts`
- `src/app/layout.tsx`

The CM player should be rebuilt with clear boundaries:

1. playback engine;
2. library/catalog data;
3. queue and playback state;
4. audio analysis;
5. visualizer renderer;
6. CM UI.

For the first visualizer, prefer native Web Audio `AnalyserNode` frequency data unless a specific feature requires Meyda. If the product later includes a real user-controlled equalizer, implement that separately with audio filters such as `BiquadFilterNode`.

### 2. Control primitives: reuse selectively

`src/components/ui/control-button.tsx` can be reused as a behavioral/accessibility starting point.

Its final visual treatment must follow the CM design system.

### 3. R2 can remain; the track manifest should not

The repository already uses R2 successfully as the audio origin. That is worth keeping as an option.

The current library pipeline should be replaced:

- do not use filenames as the primary metadata source;
- do not maintain a static `tracks.json` as the canonical catalog;
- do not encode versions such as `(1)`, `v2`, `v8` in business logic;
- do not require manual renaming just to make the player understand a song.

The new system needs a managed music library with stable IDs, metadata, versions, publication state and storage keys.

### 4. Next.js foundation: reuse patterns

The current project already uses:

- Next.js App Router;
- React;
- TypeScript;
- Tailwind;
- root-level provider;
- responsive component separation;
- `next/image`;
- metadata structure.

These patterns are compatible with the new project.

## What should NOT be copied as-is

### 1. MiniPlayer visual

`src/components/mini-player.tsx` contains useful behavior, but the presentation is Artesopolis-specific.

Do not carry directly:

- astronaut DJ image;
- label `RADIO ARTESOPOLIS`;
- current cosmic/neon composition as a brand rule;
- layout decisions that exist specifically to accommodate the astronaut art.

The new player should consume the reused engine through a fresh CM presentation layer.

### 2. Artesopolis assets and constants

Do not migrate brand assets such as:

- `astronauta-dj.png`;
- Artesopolis logos;
- Artesopolis favicon;
- Artesopolis copy;
- mascot-specific imagery.

When code is ported, brand URLs/constants must be replaced by CM-owned assets or neutral configuration.

### 3. Existing 3D page

There is **no 3D catalog implementation worth migrating yet**.

Current `src/app/impressoes/page.tsx` is only an "em breve" page rendering a responsive remote image.

Therefore:

- the 3D catalog;
- product details;
- colors/materials;
- personalization;
- portfolio;
- model/rotation interactions

must be designed for CM 3D and Radio from the start.

We may reuse generic helpers such as responsive image handling, but not treat the current `impressoes` page as a product foundation.

## Important source-of-truth note

Some documentation inside `artesopolis-landing` describes an older player implementation.

For the migration, trust the current source code first. The current player uses Meyda and direct remote audio source handling; do not blindly reproduce behavior described in older system-map text.

## Migration strategy

Do not copy the whole repository.

Use the old project as a behavior specification and rewrite the weak boundaries.

Sequence:

1. document playback behaviors that must survive;
2. define the new music library model;
3. create a clean playback engine;
4. create queue/playback state independent from UI;
5. create an audio-analysis layer independent from DOM;
6. build a temporary neutral visualizer;
7. validate persistence and playback failure handling;
8. build the CM player UI;
9. build the 3D experience independently.

Only small neutral primitives should be copied directly when they are already clean.

## CM identity boundary

The CM visual system should be recognizable without explanatory text.

Current direction:

- cleaner and lighter than the previous Artesopolis treatment;
- technological, but not generic AI sci-fi;
- CM monogram as brand anchor;
- blue/cyan/purple can remain available as accents, but they are not enough by themselves to define the identity;
- no astronaut mascot;
- no automatic space/orbit metaphor just because the old brand used it;
- radio nostalgia should come from interaction and interface language, especially the Winamp influence, not from retro decoration everywhere;
- the 3D side should feel tactile, material and object-focused.

## First technical spike

Before building the full UI:

- implement the new music-library boundary;
- import 3 to 5 real tracks through the new ingestion path;
- implement a clean playback engine;
- keep playback alive across two test routes;
- render a temporary neutral player;
- render a neutral spectrum visualizer without DOM refs living inside the playback provider;
- verify desktop + mobile;
- only then build the final CM player skin.

This validates the new architecture instead of carrying the old coupling forward.

See also: [MUSIC_PIPELINE.md](MUSIC_PIPELINE.md).
