# Data Model: Album Marquee

**Feature**: Album Marquee — Music Section
**Date**: 2026-05-19

No data model changes. The `Track` type in `src/lib/spotify/index.ts` is sufficient as-is.

## Track (unchanged)

| Field | Type | Source | Notes |
| :--- | :--- | :--- | :--- |
| `id` | `string` | Spotify track ID | Deduplication key |
| `artists` | `string` | Joined artist names | Displayed in tile |
| `imageUrl` | `string` | Album art URL (medium res) | Displayed in tile; `''` if unavailable |
| `songTitle` | `string` | Track name | Displayed in tile |
| `songUrl` | `string` | `external_urls.spotify` | Tile link `href`; `''` for local files |

## Tile destination URL resolution

Resolved at render time in `SpotifyPlaylist.astro` — no new fields or functions needed:

- `songUrl` is non-empty → tile links to Spotify track URL
- `songUrl` is `''` → tile links to `PLAYLIST_URL` (`https://open.spotify.com/playlist/2uME1BuGAZBt2CoJ1B7qrZ`)
