# Feature Specification: Album Marquee — Music Section

**Feature Branch**: `feature/add-speckit`
**Created**: 2026-05-19
**Status**: Draft
**Input**: User description: "In the music section on the homepage, update the album grid to have a marquee effect with only one row."

## Clarifications

### Session 2026-05-19

- Q: Should each tile link somewhere, and what should it link to? → A: Each tile links to the song's track URL when one is available; falls back to the couple's Spotify playlist URL otherwise.
- Q: On touch/mobile, when a guest taps an album tile, does it navigate immediately or pause the marquee first? → A: Navigate immediately — a tap on any tile opens the linked URL in a new tab.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Experience the Scrolling Album Showcase (Priority: P1)

A wedding guest visits the music section of the homepage and sees album tiles scrolling horizontally in a continuous marquee, giving the section a lively, animated feel.

**Why this priority**: This is the primary visual change — transforming a static grid into a dynamic, single-row marquee is the entire scope of this feature.

**Independent Test**: Can be fully tested by visiting the music section and confirming that all album tiles are arranged in a single horizontal row that scrolls automatically.

**Acceptance Scenarios**:

1. **Given** a guest visits the music section, **When** the section loads, **Then** they see a single row of album tiles scrolling horizontally in a continuous loop.
2. **Given** the marquee is scrolling, **When** a guest hovers over the marquee, **Then** scrolling pauses so they can read the content.
3. **Given** the marquee is paused on hover, **When** the guest moves their cursor away, **Then** scrolling resumes automatically.
4. **Given** a guest views the section on a mobile device, **Then** the single-row marquee is visible and the tiles are legible at mobile screen widths.

---

### User Story 2 - View Album Details and Navigate to Music (Priority: P2)

A guest browsing the scrolling marquee can read each album tile's song name and artist, and can click any tile to open the music directly.

**Why this priority**: Readability and access are preserved even in the animated format — every tile is both informative and actionable.

**Independent Test**: Can be fully tested by hovering to pause the marquee and confirming each tile shows album art, song name, artist name, and navigates to the correct URL when clicked.

**Acceptance Scenarios**:

1. **Given** the marquee is displaying, **When** a guest pauses it, **Then** each visible tile shows the album cover image, song name, and artist name.
2. **Given** a tile has no album artwork, **When** it appears in the marquee, **Then** a fallback placeholder is displayed in place of the missing image.
3. **Given** a guest clicks a tile that has a song track URL, **Then** they are taken to that song on Spotify in a new tab.
4. **Given** a guest clicks a tile that has no song track URL, **Then** they are taken to the couple's Spotify playlist in a new tab.
5. **Given** a guest pauses the marquee by hovering and then clicks a tile, **Then** the tile link navigates normally — pausing does not disable links.

---

### Edge Cases

- What happens when the playlist has very few albums (fewer than enough to fill the marquee width)?
- Does the marquee loop seamlessly without a visible gap or jump?
- Does the marquee behave correctly on touch screens where hover is unavailable?
- On touch devices, a tap on any tile navigates immediately to the linked URL — there is no pause-first gesture.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The album grid MUST be replaced with a single-row horizontal marquee — all album tiles appear in one row with no wrapping.
- **FR-002**: The marquee MUST scroll continuously and automatically from right to left without requiring user interaction.
- **FR-003**: The marquee MUST loop seamlessly — when the last tile passes, the sequence repeats without a visible gap or jump.
- **FR-004**: The marquee MUST pause its scrolling when a guest hovers over it.
- **FR-005**: Scrolling MUST resume automatically when the guest's cursor leaves the marquee area.
- **FR-006**: Each album tile MUST display album cover image, song name, and artist name.
- **FR-007**: The marquee MUST display correctly on mobile screens (375px wide and up), showing at least two partial tiles to communicate the scrollable nature of the content.
- **FR-008**: Album tiles that are outside the visible marquee area MUST not be interactable or readable (clipped by the container boundary).
- **FR-009**: Each album tile MUST be a clickable link. When a Spotify track URL is available for the song, the tile MUST link to that track URL. When no track URL is available, the tile MUST link to the couple's Spotify playlist URL. All tile links MUST open in a new tab.

### Key Entities

- **Marquee**: The single-row, continuously scrolling container that replaces the album grid.
- **Album Tile**: An individual item in the marquee displaying one album's cover image, song name, and artist. Each tile has a destination URL — the song's Spotify track URL if available, or the playlist URL as a fallback.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Zero album tiles wrap to a second row — the layout is a single horizontal row at all tested screen widths.
- **SC-002**: The marquee scrolls automatically on page load without any guest interaction required.
- **SC-003**: Scrolling stops within 100ms of the cursor entering the marquee area and resumes when the cursor leaves.
- **SC-004**: The tile sequence loops without a visible break or flash — a guest watching continuously sees no interruption.
- **SC-005**: All album content (cover, song, artist) remains legible when the marquee is paused on screens from 375px wide and up.
- **SC-006**: Every album tile is a functional link — clicking any tile opens the correct destination URL in a new tab with zero broken links.

## Assumptions

- The marquee scrolls left (content moves from right to left), consistent with standard marquee conventions.
- Touch devices (where hover is unavailable) display the marquee in its continuously scrolling state with no pause mechanism. Tapping a tile navigates immediately to the linked URL.
- The number of albums in the playlist is sufficient to create a looping effect without large empty gaps; if the playlist is short, tiles are duplicated to fill the loop.
- The visual design of individual album tiles (artwork, text layout, sizing) is unchanged from the existing grid implementation.
- The marquee replaces the grid entirely — no toggle or option to switch back to the grid is needed.
- Scroll speed is set to a comfortable reading pace (~30–60 seconds for a full cycle) and does not need to be user-adjustable.
- Song track URLs may not be available for all songs (e.g., locally-added tracks in a Spotify playlist); the playlist URL fallback covers these cases.
- Tile links open in a new tab, consistent with the existing playlist link behavior established in the prior feature spec.
