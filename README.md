# Overview

A custom-built website serving wedding guests through the full lifecycle of the event, from pre-wedding RSVPs and logistics, to a post-wedding commemorative experience featuring a film photo gallery and a thank-you message.

This project solves a real problem with a polished, purposeful result: give wedding guests a single destination for everything they need before and after the event. Rather than using an off-the-shelf service, the site was built from scratch to match the couple's aesthetic and to give full control over the guest experience and data.

The site has two distinct states:

- **Pre-wedding** — guests could RSVP, view venue details, read FAQs, find the registry, and get directions. RSVPs were collected through a multi-step form with conditional logic (meal preference, dietary restrictions, shuttle needs, Sunday picnic attendance), and stored in a Notion database. Guests received a personalized confirmation email upon submitting.
- **Post-wedding** — the homepage was updated to a thank-you experience with a curated film photo gallery, a Spotify playlist of the reception music, and the ceremony/reception details preserved for keepsake. The original pre-wedding site remains accessible at `/archive`.

---

## Features

- Multi-step RSVP form with conditional fields, guest lookup, and email confirmation
- Guest database backed by Notion, with a REST API layer for reads and writes
- Transactional email via Nodemailer — organizer alerts + personalized guest confirmations
- Dual-carousel film photo gallery with synced thumbnails and per-photo download
- Scroll-driven animations (navigation hide/show, hero image reveal) using GSAP ScrollTrigger
- Fully responsive design with fluid typography and Astro image optimization
- Preserved archive of the pre-wedding site at `/archive`
- Search-engine-excluded (`noindex`) — built for invited guests, not public discovery
- Minimal analytics (page view count only) provided by Vercel Analytics and Speed Insights

---

## Tech Stack

| Layer | Technology |
| :--- | :--- |
| Framework | [Astro](https://astro.build) 5 (SSR) |
| Deployment | [Vercel](https://vercel.com) via `@astrojs/vercel` |
| Styling | SCSS with CSS custom properties |
| Animation | GSAP 3 + ScrollTrigger |
| Carousel | Splide 4 |
| Database | Notion API (`@notionhq/client`) |
| Email | Nodemailer 7 (Gmail transport) |
| Analytics | Vercel Analytics + Speed Insights |
| Language | TypeScript |

---

## Architecture

### Astro SSR with file-based routing

The app runs in server-side rendering mode on Vercel. Pages and API routes are colocated in `src/pages/` and map directly to URLs:

```
/                  → src/pages/index.astro       (post-wedding homepage)
/archive           → src/pages/archive.astro     (preserved pre-wedding site)
```

### Notion as a guest database

Guest records live in a Notion database. A thin client layer in `src/lib/notion/` handles querying the database and mapping Notion's property schema to the app's data model. The `/api/guests` endpoints expose this data to the RSVP form for guest lookup.

### Interactive components as native Custom Elements

Rather than reaching for a JavaScript framework, all interactive UI is built as native Web Components using the Custom Elements API:

- **`<reveal-nav>`** — hides on scroll-down, reveals on scroll-up, powered by GSAP ScrollTrigger
- **`<hero-animation>`** — scroll-correlated opacity reveal on the hero image
- **`<photo-gallery>`** — dual Splide carousels (main + thumbnails) with slide sync and individual photo downloads
- **`<form-rsvp>`** — multi-step RSVP form with conditional field visibility, guest lookup, and fetch-based submission

This approach keeps the JavaScript bundle lean and avoids framework overhead for what is ultimately a content-focused site.

### Email flow

When a guest submits the RSVP form, the `/api/rsvp` endpoint:
1. Writes the response to the Notion guest database [TODO]
2. Sends an alert email to the organizers with the full RSVP details
3. Sends a personalized confirmation email to the guest — with different copy for attending vs. not attending

### Image optimization

All images are AVIF format, processed through Astro's `<Image>` component with responsive `widths` and `sizes` attributes. The photo gallery uses `import.meta.glob()` for dynamic imports and applies priority loading to the first and last sets of images in the carousel.

---

## Project Structure

```
src/
├── assets/             # Images organized by section
│   ├── homepage/
│   └── archive/
├── components/
│   ├── homepage/       # Hero, Intro, Outro, PhotoGallery
│   ├── archive/        # RSVP, ReceptionDetails, Registry, Venue, FAQs
│   ├── layout/         # BodySection (reusable slot-based section wrapper)
│   └── utils/          # Vercel analytics wrapper
├── layouts/            # Layout, Navigation, Footer
├── lib/
│   └── notion/         # Notion API client and data mapping
├── pages/
│   ├── index.astro
│   ├── archive.astro
│   └── api/            # guests and rsvp endpoints
└── styles/
    ├── global.scss
    ├── base/           # html, layout, typography, utilities
    ├── components/     # per-component stylesheets
    └── layout/         # navigation, footer, body
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- A Notion integration with access to a guest database
- A Gmail account configured for app passwords (for Nodemailer)

### Environment Variables

Create a `.env` file in the project root:

```env
NOTION_TOKEN=your_notion_integration_token
NOTION_DATABASE_ID=your_notion_database_id
NODEMAILER_USER=your_gmail_address
NODEMAILER_PASS=your_gmail_app_password
NODEMAILER_RECIPIENTS=comma,separated,alert,recipients
```

### Commands

```sh
npm install        # Install dependencies
npm run dev        # Start local dev server at localhost:4321
npm run build      # Build for production
npm run preview    # Preview the production build locally
```
