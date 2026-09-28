# Reuse audit: artesopolis-landing

Source reviewed: `cassianomangini/artesopolis-landing` on branch `master`, current tree at commit `546af1c5b3b18e6b03a72a658e843864e69d8f8d`.

## Goal

Reuse mature technical pieces without carrying the Artesopolis visual language into CM 3D and Radio.

The new site must have **CM identity**. Astronaut, Artesopolis lettering, cosmic mascot language and branded copy are not part of the new product unless explicitly reintroduced later.

## What is worth reusing

### 1. Player engine: reuse strongly

The current `PlayerProvider` already solves several real problems:

- persistent player state at root layout level;
- `HTMLAudioElement` lifecycle;
- remote audio from Cloudflare R2;
- `crossOrigin = "anonymous"`;
- play/pause;
- previous;
- skip;
- shuffle logic;
- history;
- temporary blocking/retry of failed tracks;
- automatic advance;
- audio loading/error states;
- Web Audio context lifecycle;
- Meyda analysis;
- equalizer frame generation;
- multiple groups of visual bars registered by DOM refs.

Files to use as technical source:

- `src/lib/player-context.tsx`
- `src/lib/audio-utils.ts`
- `src/types/player.ts`
- `src/app/layout.tsx`

This should be **ported and cleaned**, not redesigned from zero.

### 2. Control primitives: reuse selectively

`src/components/ui/control-button.tsx` can be reused as a behavioral/accessibility starting point.

Its final visual treatment must follow the CM design system.

### 3. Track manifest / media pipeline: reuse concept

The repository already has:

- `public/tracks.json`;
- a track-sync script;
- R2 as the current audio origin.

We can keep the concept and decide later whether the production catalog stays manifest-based or moves to managed data.

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

Port by boundary:

1. player types;
2. audio utilities;
3. player engine/provider;
4. neutral control primitives;
5. track/media configuration;
6. build a brand-new CM player UI on top;
7. build the 3D experience independently.

Each ported module must remove Artesopolis-specific naming before entering the new codebase.

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

- port the audio engine;
- make it play 3 to 5 real tracks;
- keep playback alive across two test routes;
- render a temporary neutral player;
- verify desktop + mobile;
- only then build the final CM player skin.

This isolates the risky audio behavior from visual redesign.
