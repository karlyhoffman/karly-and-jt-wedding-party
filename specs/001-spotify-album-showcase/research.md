# Research: Spotify Album Showcase

## 1. Spotify API Authentication

**Decision**: Client Credentials OAuth2 flow (`grant_type=client_credentials`)

**Rationale**: The target playlist is publicly accessible on Spotify. Client Credentials grants an app-level token without requiring any user login — the simplest and most appropriate flow for server-side read access to public data.

**How it works**:
```
POST https://accounts.spotify.com/api/token
Authorization: Basic <base64(SPOTIFY_CLIENT_ID:SPOTIFY_CLIENT_SECRET)>
Content-Type: application/x-www-form-urlencoded
Body: grant_type=client_credentials
```
Response: `{ access_token, token_type: "Bearer", expires_in: 3600 }`

**Env vars required**: `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`
(Created at developer.spotify.com → Create App → copy credentials)

**Alternatives considered**:
- Authorization Code flow — rejected: requires user login, unnecessary for public data
- PKCE flow — rejected: client-side only, would expose credentials in browser

---

## 2. Fetching Playlist Tracks and Albums

**Decision**: `GET /v1/playlists/{id}/tracks` with `fields` filter, paginated until `next` is null

**Endpoint**:
```
GET https://api.spotify.com/v1/playlists/2uME1BuGAZBt2CoJ1B7qrZ/tracks
  ?fields=items(track(album(id,name,artists(name),images))),next,total
  &limit=100
  &offset=0
Authorization: Bearer {access_token}
```

**Rationale**: The `fields` parameter reduces response payload to only what's needed. Limit 100 is Spotify's maximum per page. The playlist is described as 19+ hours, implying ~325 tracks and ~4 pages of API calls. All pages must be fetched to ensure SC-002 (100% album coverage).

**Pagination**: Loop while `next !== null`, using the `next` URL directly as the next request URL.

**Alternatives considered**:
- Fetching only first page (100 tracks) — rejected: violates SC-002 (100% coverage)
- Using Spotify's Node SDK (`spotify-web-api-node`) — rejected: user requested minimal dependencies; native `fetch` is sufficient

---

## 3. Album De-duplication

**Decision**: Deduplicate using a `Map<string, Album>` keyed by Spotify album ID; first occurrence wins; preserve playlist order.

**Rationale**: The same album will appear multiple times when multiple tracks from that album are in the playlist. The spec (FR-006) requires each album appear once. Using a Map preserves insertion order (first track encounter), which keeps the album list ordered as guests might expect.

**Edge case**: Removed/unavailable tracks are returned as `{ track: null }` by Spotify — these must be filtered before processing.

---

## 4. Image Display Strategy

**Decision**: Plain `<img loading="lazy" decoding="async">` using Spotify's 300×300 JPEG URLs from `i.scdn.co`.

**Rationale**: Spotify returns an array of images per album in descending size order: `[640×640, 300×300, 64×64]`. The 300×300 image (index 1) is appropriate for album tile display. Using a plain `<img>` tag is the correct approach because:
1. Spotify images are 3rd-party JPEG hosted on their CDN — we don't control the format
2. Spotify's CDN is already globally distributed and well-optimized
3. Astro's `<Image>` component would attempt to download and reprocess remote images per-request in SSR mode, adding latency for minimal benefit

**Constitution deviation**: The AVIF + Astro `<Image>` constraint (Principle IV) is documented to apply to image assets the project owns. Remote 3rd-party CDN images are a justified exception. This is noted in the plan's Complexity Tracking table.

**Fallback**: If `images` array is empty, render a neutral placeholder (CSS-based, no external image dependency).

---

## 5. Rendering Approach

**Decision**: Pure Astro SSR — fetch and render in `.astro` frontmatter; output static HTML; no client-side JavaScript.

**Rationale**: The album grid is display-only (FR-003 just requires a link to the playlist, not in-page playback). No interactive state is needed, so no Custom Element or client-side script is required. The Astro frontmatter runs server-side on each request, making the rendered HTML immediately available to guests.

**Alternatives considered**:
- Custom Element with client-side Spotify fetch — rejected: would expose credentials in the browser; adds unnecessary complexity
- Pre-fetching to a JSON file at build time — rejected: SSR is already configured; YAGNI principle applies

---

## 6. Caching

**Decision**: Accept per-request fetching. No explicit caching layer added.

**Rationale**: This is a low-traffic wedding website. The Spotify API calls (token + track pages) complete in ~300–500ms combined, well within acceptable SSR response times. Adding a cache would mean new infrastructure or module-level state that may not persist across Vercel function invocations anyway.

**Future option** (not implemented): Add `Cache-Control: s-maxage=3600, stale-while-revalidate` to the page response to enable Vercel's CDN edge caching — one line of change if ever needed.

---

## 7. Environment Variable Setup

**Local development**: `.env` file at project root:
```
SPOTIFY_CLIENT_ID=your_client_id_here
SPOTIFY_CLIENT_SECRET=your_client_secret_here
```

**Production (Vercel)**: Set via Vercel dashboard → Project → Settings → Environment Variables.

**Security**: These are server-side secrets. They are never exposed to the client because all Spotify API calls occur in Astro's server-side frontmatter. The client only receives rendered HTML.

---

## Summary of Decisions

| Area               | Decision                                  | Key Reason                              |
| :----------------- | :---------------------------------------- | :-------------------------------------- |
| Auth               | Client Credentials OAuth2                 | Public playlist, no user login needed   |
| Fetch              | Native `fetch`, no Spotify SDK            | Zero new dependencies                   |
| Pagination         | Fetch all pages until `next` is null      | SC-002: 100% album coverage             |
| De-duplication     | `Map<albumId, Album>`, first-seen wins    | FR-006: one tile per album              |
| Images             | `<img loading="lazy">` with 300×300 JPEG  | 3rd-party CDN, format not controllable  |
| Rendering          | Astro SSR frontmatter → static HTML       | Display-only; no client JS needed       |
| Caching            | None added                                | YAGNI; low traffic; simple is better   |
