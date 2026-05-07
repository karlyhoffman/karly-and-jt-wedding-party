<!--
  Sync Impact Report
  Version change: [blank template] → 1.0.0
  Modified principles: N/A — initial population from project context
  Added sections: Core Principles (I–V), Technology Constraints, Development Workflow, Governance
  Removed sections: None — first fill
  Templates requiring updates:
    - .specify/templates/plan-template.md ✅ (Constitution Check section is generic — compatible)
    - .specify/templates/spec-template.md ✅ (no constitution-specific references — compatible)
    - .specify/templates/tasks-template.md ✅ (tests already marked optional — aligns with Principle V)
  Follow-up TODOs: None — all placeholders resolved.
-->

# Karly & JT Wedding Website Constitution

## Core Principles

### I. Guest Experience First

Every feature MUST serve invited wedding guests. The site exists to provide a single destination
for pre-wedding logistics (RSVP, venue, FAQ, registry) and post-wedding commemoration (photo
gallery, Spotify playlist, thank you message). Features without a clear guest benefit MUST NOT be added.
Complexity must be justified by direct guest value.

**Rationale**: The site has a defined audience (invited guests) and a defined lifecycle
(pre- to post-wedding). Scope creep undermines the polished, purposeful guest experience.

### II. Privacy & Exclusivity

Pages MUST include `noindex` meta tags. Guest data (RSVPs, contact info) MUST be collected
solely for wedding logistics and MUST NOT be exposed publicly. API endpoints that access guest
data MUST enforce server-side validation. No third-party analytics beyond Vercel Analytics
(page views only).

**Rationale**: The site is built for invited guests, not public discovery. Guest trust depends
on clear data boundaries.

### III. Native Web Components, Minimal JavaScript

Interactive UI MUST be built as native Web Components using the Custom Elements API. JavaScript
framework components (React, Vue, Svelte, etc.) MUST NOT be introduced. New runtime
dependencies MUST be explicitly justified. Astro islands architecture may be used only when
Custom Elements are genuinely insufficient.

**Rationale**: Existing components (`<photo-gallery>`, `<form-rsvp>`, `<reveal-nav>`,
`<hero-animation>`) use the Custom Elements API to keep the bundle lean for a content-focused,
low-maintenance site.

### IV. Design Integrity

All features MUST maintain the established visual aesthetic: fluid typography, SCSS-only styling
(no CSS-in-JS, no utility-class frameworks), and consistent GSAP animation patterns
(ScrollTrigger). New animations MUST follow the established scroll-driven approach. Image assets
MUST use AVIF format and pass through Astro's `<Image>` component with responsive widths.

**Rationale**: Visual consistency is a core deliverable for a wedding site. The couple's
aesthetic MUST be preserved across all additions.

### V. Simplicity & YAGNI

This site has a fixed audience and a clear post-wedding end state. Features MUST NOT be built
for hypothetical future needs. Three similar lines are preferable to a premature abstraction.
Tests are OPTIONAL — include only when explicitly requested or when covering a non-trivial data
transformation or external API integration. No feature flags, backwards-compatibility shims, or
speculative infrastructure.

**Rationale**: A wedding website is not a long-lived product platform. Complexity costs are
borne by a solo developer and are not amortized over time.

## Technology Constraints

The following stack is fixed. Changes to core dependencies require explicit justification in the
feature spec and a constitution amendment.

| Layer | Technology | Constraint |
| :--- | :--- | :--- |
| Framework | Astro 5 (SSR) | MUST remain Astro SSR on Vercel |
| Language | TypeScript | All source files MUST be TypeScript (no plain `.js`) |
| Styling | SCSS | MUST use SCSS; no CSS-in-JS or utility-class frameworks |
| Animation | GSAP 3 + ScrollTrigger | New animations MUST follow existing GSAP patterns |
| Database | Notion API (`@notionhq/client`) | Guest data MUST stay in Notion |
| Email | Nodemailer 7 (Gmail transport) | Transactional email MUST use the existing Nodemailer setup |
| Deployment | Vercel (`@astrojs/vercel`) | No alternative deployment targets |
| Images | AVIF + Astro `<Image>` | All images MUST be AVIF, processed via Astro's Image component |

## Development Workflow

Features MUST follow the Spec Kit workflow before implementation begins:

1. `/speckit-specify` — write or update the feature spec
2. `/speckit-plan` — produce a technical plan and research document
3. `/speckit-tasks` — generate a dependency-ordered task list
4. `/speckit-implement` — execute tasks one at a time

All development MUST happen on feature branches (e.g., `feature/spotify-api`). Direct commits
to `main` are not permitted. Vercel provides automatic preview deployments per branch.

## Governance

This constitution supersedes all other development guidance. Any deviation from a principle
requires a documented exception in the feature spec.

Amendments MUST:
1. Increment the version (MAJOR for principle removal/redefinition, MINOR for additions,
   PATCH for clarifications)
2. Update `LAST_AMENDED_DATE`
3. Re-run the consistency propagation checklist across templates

All implementation plans MUST include a Constitution Check section referencing applicable
principles. Complexity MUST be justified in the plan's Complexity Tracking table. Use
`CLAUDE.md` for runtime development guidance.

**Version**: 1.0.0 | **Ratified**: 2026-05-07 | **Last Amended**: 2026-05-07
