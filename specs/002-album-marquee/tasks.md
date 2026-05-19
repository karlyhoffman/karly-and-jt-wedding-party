# Tasks: Album Marquee — Music Section

**Feature**: Album Marquee
**Branch**: `feature/add-speckit`
**Date**: 2026-05-19
**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)

## Overview

3 tasks across 2 phases. No setup or foundational tasks are needed — there are no new dependencies, no new files, and no environment variable changes. The tile link fallback (`songUrl || PLAYLIST_URL`) is already implemented in `SpotifyPlaylist.astro` and is preserved unchanged.

## User Stories

| Story | Priority | Goal |
| :--- | :--- | :--- |
| US1 | P1 | Single-row marquee with continuous scroll, seamless loop, and hover-pause |
| US2 | P2 | Tile content readable; each tile links to song or playlist URL (already implemented — satisfied by US1 tasks) |

---

## Phase 1 — User Story 1: Marquee Animation (P1)

**Story goal**: Replace the CSS Grid album layout with a single-row continuously scrolling marquee that pauses on hover and loops seamlessly.

**Independent test**: Navigate to the music section. Confirm all tiles appear in a single horizontal row, the row scrolls left automatically, scrolling pauses when hovering, and resumes on mouse-out.

- [x] T001 [P] [US1] Update `src/styles/components/music.scss`: remove `.album-grid` CSS Grid rules entirely; add `.album-marquee { overflow: hidden }` with child selector `.album-marquee__track { animation-play-state: paused }` on `:hover`; add `.album-marquee__track { display: flex; width: max-content; gap: var(--layout--gutter); list-style: none; margin: 0; padding: 0; animation: marquee-scroll 40s linear infinite }`; add `@keyframes marquee-scroll { from { transform: translateX(0) } to { transform: translateX(-50%) } }`; update `.album-tile` to add `flex-shrink: 0; width: 170px`

- [x] T002 [P] [US1] Update `src/components/homepage/SpotifyPlaylist.astro`: in the non-error branch, replace `<ul class="album-grid">` with `<div class="album-marquee"><ul class="album-marquee__track">`; keep the existing `songs.map(...)` tile rendering as the first (visible) set; add a second `songs.map(...)` after the first where each `<li>` has `aria-hidden="true"` (duplicate set for seamless `-50%` loop); close with `</ul></div>`; keep all tile internals (link `href={songUrl || PLAYLIST_URL}`, `target="_blank"`, img, song title, artist text) completely unchanged

---

## Phase 2 — Polish

**Goal**: Confirm overflow is contained and the tile text display holds up in the flex context.

- [x] T003 Verify layout integrity in `src/styles/components/music.scss`: confirm `.album-marquee` has `overflow: hidden` so no horizontal page scroll appears; confirm `.album-tile__name` and `.album-tile__artist` have `overflow: hidden` and `text-overflow: ellipsis` (or equivalent) so long song/artist names do not break the fixed-width tile; add truncation rules to those selectors if missing

---

## Dependencies

```
T001 ──┐
       ├── T003
T002 ──┘
```

T001 and T002 are independent (different files) and can run in parallel. T003 depends on both completing.

## Parallel Execution

**All US1 tasks in parallel (recommended):**

| Agent | Tasks |
| :--- | :--- |
| Agent A | T001 — `music.scss` |
| Agent B | T002 — `SpotifyPlaylist.astro` |
| Either agent | T003 — polish check (after A and B complete) |

## Implementation Strategy

**MVP = T001 + T002**. Together they complete US1 and US2 in full — this is a 2-file, 2-task feature. T003 is a polish safety net.

US2 requirements (readable tile content, link navigation) are satisfied by existing code that T002 preserves untouched.
