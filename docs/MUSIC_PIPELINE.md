# Music Pipeline

## Problem

The Artesopolis radio treats a folder of MP3 files and `tracks.json` as the music catalog.

That creates manual work:

1. generate music in Suno;
2. download the file;
3. rename or organize it;
4. move it to the expected folder;
5. regenerate the manifest;
6. upload/sync media;
7. depend on filename parsing to recover title and version.

The CM project should remove most of this workflow.

## Target workflow

### V1: Music Inbox

The minimum useful workflow should be:

1. download one or many tracks from Suno;
2. drag the files into a private **Music Inbox** in CM;
3. the system analyzes each file automatically;
4. review only the fields that need confirmation;
5. click **Publish**.

The system handles the rest.

Automatic processing should include:

- stable track ID;
- content hash for duplicate detection;
- original filename preservation;
- audio duration;
- MIME/format validation;
- normalized storage key;
- upload to object storage;
- title suggestion;
- version suggestion;
- duplicate/version-group suggestion;
- draft status;
- publication timestamp;
- optional cover association.

No manual `tracks.json`.

No dependency on a filename naming convention.

## Data model

Keep the first version small.

### tracks

Canonical song identity.

Suggested fields:

- `id`
- `title`
- `language`
- `status`: draft | published | archived
- `cover_asset_id`
- `created_at`
- `published_at`

### track_versions

A specific generated/exported audio file.

Suggested fields:

- `id`
- `track_id`
- `version_label`
- `source`: suno | manual | other
- `original_filename`
- `storage_key`
- `content_hash`
- `duration_seconds`
- `mime_type`
- `is_primary`
- `created_at`

This avoids pretending that `Song.mp3`, `Song (1).mp3`, `Song_v2.mp3` are three unrelated songs.

### playlists

- `id`
- `name`
- `slug`
- `status`

### playlist_items

- `playlist_id`
- `track_version_id`
- `position`

The radio reads published data, not a generated JSON file committed to Git.

## Storage

Audio binaries should live in object storage/CDN, not in Git.

Cloudflare R2 is already proven in the old project and is a reasonable candidate.

Database metadata and binary storage must remain separate concerns.

## Suno boundary

Do not make the production pipeline depend on scraping Suno or an unofficial API.

The robust V1 starts at the downloaded audio file.

If Suno later provides a supported integration that gives us reliable metadata or export automation, add an importer behind the same ingestion boundary without changing the player.

## Near-zero manual workflow later

After the web Music Inbox works, an optional local helper can reduce the workflow further on Windows:

1. watch a configured `Suno Inbox` folder;
2. detect new audio files;
3. calculate the hash;
4. upload them to the CM inbox;
5. open or notify the review queue.

The deployed web application cannot watch a local PC folder by itself, so this should be a separate optional helper, not hidden inside the website architecture.

## Player surfaces

The radio has two synchronized presentation modes over the same playback engine.

### Mini player

Persistent across the site.

Purpose:

- show the current track;
- play/pause;
- previous/next;
- expose shuffle state;
- show essential progress/status;
- provide a clear action to open the full player.

The mini player must never own a second audio element or a separate queue.

### Full player

Dedicated radio experience.

It must allow the listener to:

- browse the published music library;
- choose an exact song manually;
- play from a playlist;
- turn shuffle on or off;
- see the current queue/history when useful;
- control progress and volume;
- use repeat modes;
- view cover/metadata;
- access the richer visualizer experience.

Manual song selection and shuffle are complementary. Shuffle is a playback mode, not the only navigation model.

Opening the full player must not restart the current track. Closing it must return to the mini player with the same track, position, queue and playback state.

Selecting a song in the full player must immediately become the current track shown by the mini player.

The public library should normally expose the published primary version of each song. Alternate versions/remixes can be published as distinct selectable entries when intentionally exposed, but raw generation versions should not leak into the listener UI by default.

## Audio analysis and visualizer

Playback and visualization must be separate.

### Playback engine

Owns:

- audio element;
- source changes;
- play/pause;
- seek;
- volume;
- previous/next;
- ended/error events.

### Queue state

Owns:

- current track/version;
- history;
- shuffle;
- repeat;
- playlist ordering.

### Analyzer

Consumes the audio graph and emits normalized analysis data.

For the first version, use native `AnalyserNode` frequency data.

Possible output:

- frequency bins;
- smoothed band levels;
- RMS/energy if needed.

The analyzer must not know about React DOM refs.

### Visualizer

Consumes analyzer output and decides how to render it.

Possible renderers:

- Winamp-style spectrum bars;
- waveform;
- radial spectrum;
- full-screen visualizer.

A real user-controlled equalizer, if added later, is a separate audio-processing feature and should not be confused with the visualizer.

## V1 acceptance

The pipeline is acceptable when:

- multiple MP3 files can be imported together;
- duplicate files are detected by content hash;
- a title can be corrected without renaming a file;
- versions can be grouped under one song;
- a track can remain draft;
- publishing makes it available to the radio without a Git commit;
- unpublishing removes it from the public radio without deleting the audio;
- the player receives stable IDs and metadata from the library;
- no filename regex is required for normal playback;
- the mini player and full player share one playback state;
- opening the full player does not restart the song;
- a listener can choose a specific published song;
- shuffle can be enabled or disabled independently from manual song selection;
- selecting a song in the full player updates the mini player immediately.
