# Data Model: Spotify Album Showcase

## Spotify API Response Types

These types mirror the Spotify Web API response shapes, scoped to only the fields we request.

```typescript
interface SpotifyImage {
  url: string;
  height: number | null;
  width: number | null;
}

interface SpotifyArtist {
  name: string;
}

interface SpotifyAlbumRaw {
  id: string;
  name: string;
  artists: SpotifyArtist[];
  images: SpotifyImage[];   // Descending by size: [640x640, 300x300, 64x64]
}

interface SpotifyTrackItem {
  track: {
    album: SpotifyAlbumRaw;
  } | null;                 // null for removed/unavailable tracks
}

interface SpotifyPlaylistTracksPage {
  items: SpotifyTrackItem[];
  next: string | null;      // URL of next page; null on last page
  total: number;
}

interface SpotifyTokenResponse {
  access_token: string;
  token_type: 'Bearer';
  expires_in: number;       // Seconds; typically 3600
}
```

---

## Normalized Domain Entity

The `Album` type is the normalized shape used by the Astro component after fetching and de-duplicating.

```typescript
interface Album {
  id: string;        // Spotify album ID — used as dedup key
  name: string;      // Album title displayed in tile
  artists: string;   // Comma-joined artist names, e.g. "Frank Ocean" or "Migos, Drake"
  imageUrl: string;  // 300×300 JPEG from Spotify CDN (i.scdn.co)
}
```

### Transformation Rules

| Raw field                     | Normalized field | Rule                                                                |
| :---------------------------- | :--------------- | :------------------------------------------------------------------ |
| `album.id`                    | `id`             | Direct copy; used as Map key for de-duplication                     |
| `album.name`                  | `name`           | Direct copy                                                         |
| `album.artists[*].name`       | `artists`        | Join with `', '`                                                    |
| `album.images[1].url`         | `imageUrl`       | Prefer index 1 (300×300); fall back to index 0 if array has only 1 |

### De-duplication

Albums are collected into a `Map<string, Album>` keyed by `id`. When a track references an album already in the Map, it is skipped — first occurrence in playlist track order wins.

Tracks where `track === null` (removed/unavailable) are filtered before processing.

---

## Entity Relationships

```
Playlist (1)
  └── has many Tracks (N)
        └── each Track references one Album (1)
              └── Album has many Images (1–3)
              └── Album has many Artists (1–N)
```

The final component renders a flat list of unique `Album` entities, ordered by first appearance in the playlist.
