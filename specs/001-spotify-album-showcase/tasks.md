# Tasks: Spotify Album Showcase — Music Section

**Input**: Design documents from `specs/001-spotify-album-showcase/`
**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | quickstart.md ✅

**Tests**: Not requested — omitted per constitution Principle V.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no shared dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2)

---

## Phase 1: Setup

**Purpose**: Establish local credentials needed for all Spotify API calls.

- [ ] T001 In the `.env` file at project root, add `SPOTIFY_CLIENT_ID=` and `SPOTIFY_CLIENT_SECRET=` variables; populate with credentials from developer.spotify.com (see quickstart.md for setup steps).

**Checkpoint**: `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET` are set in `.env` — Spotify API calls can be made locally.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Server-side Spotify utility that both user stories depend on. Must be complete before Phase 3.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [ ] T002 Create `src/lib/spotify.ts` — define `Album` interface (`id`, `name`, `artists`, `imageUrl` as strings) and `getAccessToken()` async function: POST to `https://accounts.spotify.com/api/token` with `Authorization: Basic <base64(SPOTIFY_CLIENT_ID:SPOTIFY_CLIENT_SECRET)>` header and `grant_type=client_credentials` body; return the `access_token` string from the JSON response. (Refer to data-model.md → `SpotifyTokenResponse`.)
- [ ] T003 Add `getPlaylistAlbums(playlistId: string, token: string): Promise<Album[]>` to `src/lib/spotify.ts` — paginate through all pages of `GET https://api.spotify.com/v1/playlists/{playlistId}/tracks?fields=items(track(album(id,name,artists(name),images))),next&limit=100` using the `next` URL until it is null; filter out items where `track === null`; collect unique albums into a `Map<string, Album>` keyed by album `id` (first occurrence wins); map each raw album to `Album` using `images[1]?.url ?? images[0]?.url` for `imageUrl` and `artists.map(a => a.name).join(', ')` for `artists`; return the Map values as `Album[]`. (Refer to data-model.md for types.)

**Checkpoint**: `getAccessToken()` and `getPlaylistAlbums()` are implemented and importable — user story implementation can begin.

---

## Phase 3: User Story 1 — Discover the Wedding Playlist (Priority: P1) 🎯 MVP

**Goal**: Guests visiting the Music section see a responsive visual grid of album covers from the wedding reception playlist — no "Coming Soon" text.

**Independent Test**: Run `npm run dev`, navigate to `/#playlists`, and confirm: album tiles are visible with cover art, album name, and artist text; the "Coming Soon" emoji/text is gone; the grid adapts at 375px and 768px widths.

### Implementation

- [ ] T004 [P] [US1] Create `src/styles/components/music.scss` — define `.album-grid` as a CSS Grid with `grid-template-columns: repeat(auto-fill, minmax(140px, 1fr))` and a consistent gap; define `.album-tile` as a flex column with no extra padding; define `.album-tile__img` with `width: 100%`, `aspect-ratio: 1/1`, and `object-fit: cover`; define `.album-tile__name` (semibold, small font size, single-line ellipsis overflow) and `.album-tile__artist` (lighter weight, small font size, single-line ellipsis overflow). Follow existing SCSS variable and nesting conventions from `src/styles/components/photo-gallery.scss`.
- [ ] T005 [US1] Create `src/components/homepage/SpotifyAlbums.astro` — in frontmatter: import `getAccessToken` and `getPlaylistAlbums` from `../../lib/spotify`; import `../../styles/components/music.scss`; wrap calls in try/catch: call `getAccessToken()` then `getPlaylistAlbums('2uME1BuGAZBt2CoJ1B7qrZ', token)`, store result in `albums`; on error set `albums = []` and flag `hasError = true`. In template: if `hasError`, render a plain fallback paragraph with a link to the playlist URL; otherwise render `<ul class="album-grid">` with one `<li class="album-tile">` per album containing `<img class="album-tile__img" src={album.imageUrl} alt={album.name} loading="lazy" decoding="async" width="300" height="300" />`, `<p class="album-tile__name">{album.name}</p>`, and `<p class="album-tile__artist">{album.artists}</p>`. (Depends on T002, T003, T004.)
- [ ] T006 [US1] Update `src/pages/index.astro` — add import for `SpotifyAlbums` from `../components/homepage/SpotifyAlbums.astro`; inside the Music `<Section>`, remove `<Fragment slot="small-text">🚧 Coming soon 🚧</Fragment>` and add `<SpotifyAlbums />` as a child of the section (after the existing `<p>` elements); remove the TODO comment block (lines 35–47). Keep the existing descriptive `<p>` text and playlist link untouched.

**Checkpoint**: User Story 1 is complete — album grid is visible at `/#playlists` with real album data, "Coming Soon" is gone, layout is responsive.

---

## Phase 4: User Story 2 — Access the Full Spotify Playlist (Priority: P2)

**Goal**: Guests can reach the Spotify playlist in one click directly from the album grid area.

**Independent Test**: Run `npm run dev`, scroll to `/#playlists`, click the Spotify playlist link in the album section, confirm it opens `https://open.spotify.com/playlist/2uME1BuGAZBt2CoJ1B7qrZ` in a new tab.

### Implementation

- [ ] T007 [US2] Add a "Listen on Spotify" call-to-action link to `src/components/homepage/SpotifyAlbums.astro` — render an `<a>` element with `href="https://open.spotify.com/playlist/2uME1BuGAZBt2CoJ1B7qrZ"`, `target="_blank"`, and `rel="noopener noreferrer"` positioned above the album grid (or as a heading-level link); add `.music-cta` styles to `src/styles/components/music.scss` (display block or inline-block, consistent with site link style). This link must also appear inside the error fallback state.

**Checkpoint**: User Stories 1 and 2 are both complete — album grid is visible and the Spotify playlist is one click away.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Final verification and cleanup.

- [ ] T008 [P] Verify full feature in browser — run `npm run dev` with valid Spotify credentials, navigate to `/#playlists`, and confirm: (1) album grid renders with cover art, names, and artists; (2) "Coming Soon" text is absent; (3) "Listen on Spotify" link opens playlist in new tab; (4) grid is usable at 375px width (mobile); (5) image tiles have correct aspect ratio with no layout shift.
- [ ] T009 [P] Verify error fallback — temporarily unset `SPOTIFY_CLIENT_ID` in `.env`, restart dev server, navigate to `/#playlists`, confirm fallback renders with a playlist link and no JS errors in console; restore the env var after.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 (env vars must exist for local testing) — **blocks all user stories**
- **User Story 1 (Phase 3)**: Depends on Phase 2 completion — T004 and T005/T006 can partially overlap
- **User Story 2 (Phase 4)**: Depends on Phase 3 completion (modifies the same component)
- **Polish (Phase 5)**: Depends on Phase 4 completion

### Within Each Phase

- T004 (SCSS) can start at the same time as T005/T006 since it touches a different file
- T005 depends on T002 + T003 (imports the library) and T004 (imports SCSS)
- T006 depends on T005 (imports the component)
- T007 modifies T005's component — must come after T006 is merged

### Parallel Opportunities

| Tasks | Can run in parallel | Reason |
| :--- | :--- | :--- |
| T004, T005 setup | T004 (SCSS) alongside T002/T003 | Different files |
| T008, T009 | Both polish tasks | Independent verification steps |

---

## Parallel Execution Example: Phase 3

```
Start T004 (music.scss) immediately.
While T004 is in progress, also start T002 (getAccessToken).
After T002 is done, start T003 (getPlaylistAlbums).
After T003 + T004 are done, start T005 (SpotifyAlbums.astro).
After T005 is done, start T006 (update index.astro).
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001)
2. Complete Phase 2: Foundational (T002, T003) — **required before anything else**
3. Complete Phase 3: User Story 1 (T004, T005, T006)
4. **STOP and VALIDATE**: Album grid visible, "Coming Soon" gone, responsive layout confirmed
5. Deploy preview to Vercel for review

### Full Delivery

1. MVP complete → add US2 (T007) → add Polish (T008, T009)
2. Each phase adds value without breaking the previous

---

## Notes

- All Spotify API calls occur in Astro server-side frontmatter — credentials are never exposed to the browser
- `<img loading="lazy">` is used for album art (justified deviation from Astro `<Image>` — see plan.md Complexity Tracking)
- The playlist ID `2uME1BuGAZBt2CoJ1B7qrZ` is hardcoded in T005 — it is the wedding reception playlist specified in spec.md FR-007
- The existing `<p>` text and link in `index.astro` (lines 33–34) should be preserved as-is — they describe the playlist context for guests
