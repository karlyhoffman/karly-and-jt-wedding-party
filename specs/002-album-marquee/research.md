# Research: Album Marquee

**Feature**: Album Marquee — Music Section
**Date**: 2026-05-19

## Decision 1: Animation approach

**Decision**: CSS `@keyframes` animation with `translateX(-50%)` on a double-width track

**Rationale**: A marquee requires a continuous, non-scroll-triggered loop. CSS `animation` is the simplest correct tool:
- GPU-accelerated via `transform` (no layout thrashing)
- Pause on hover via `animation-play-state: paused` — zero JavaScript required
- Seamless loop: render tiles twice; translating by -50% of track width returns to visual start

**Alternatives considered**:
- GSAP `gsap.to()` with `repeat: -1`: Works but adds JS execution overhead for something CSS handles natively. Rejected.
- GSAP ScrollTrigger: Requires scroll position to drive; marquee runs independently of scroll. Wrong tool. Rejected.
- CSS `scroll-snap` + hidden scrollbar: Requires user swipe/drag; not auto-scrolling. Rejected.
- `<marquee>` HTML element: Deprecated, inaccessible. Rejected.

## Decision 2: Seamless loop strategy

**Decision**: Render tiles twice in SSR output (original set + aria-hidden duplicate set)

**Rationale**: The CSS `translateX(-50%)` technique requires the scrolling track to be exactly twice the visible tile set width. When the animation reaches -50% of track width, it loops to 0 seamlessly — the viewer sees an unbroken stream of tiles. The duplicate set carries `aria-hidden="true"` per tile so screen readers see the content only once.

**Alternatives considered**:
- JS-based DOM cloning at runtime: Violates Principle III (Minimal JavaScript). Rejected.
- Single tile set with `animation-iteration-count: infinite`: Creates a visible gap when the last tile scrolls off before the first reappears. Rejected.

## Decision 3: No data model changes

**Decision**: `src/lib/spotify/index.ts` and the `Track` type are unchanged

**Rationale**: `Track.songUrl` is already populated from `external_urls.spotify`. `SpotifyPlaylist.astro` already uses `href={songUrl || PLAYLIST_URL}` on each tile link. FR-009 is already implemented — the marquee refactor does not touch this logic.
