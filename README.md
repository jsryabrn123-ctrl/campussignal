# Campus Signal

Campus Signal helps students find events that fit their interests and gives campus organizers a calmer, more targeted way to reach them.

## What's here

- A personalized student home with recommendations, upcoming events, closing dates, and campus activity
- Event discovery with search, category and format filters, and sort options
- Event details, registration, waitlisting, saved events, calendar, and notifications
- A multi-step event publishing flow with saved drafts and student audience targeting
- Organizer metrics, participant counts, event management, and engagement views
- Admin overview, organizer approval examples, and event feature/moderation actions
- Student, organizer, and admin demo roles
- Responsive navigation, keyboard focus, reduced-motion support, and empty states

The repository started without an application or backend. This is a complete, runnable product demo: realistic events and user activity are seeded locally, and changes persist in browser storage. It does not claim to provide production authentication or server-side authorization. Real accounts, notification delivery, organizer approval, and shared registration records require a trusted API and database before public deployment.

## Stack

- React 18 and TypeScript
- Vite
- Lucide icons
- Vitest for business-logic tests
- Browser `localStorage` for demo persistence

## Architecture

```text
src/
  components/       Shared event and layout primitives
  data/             Realistic seed events and notifications
  pages/            Student, organizer, admin, and event screens
  services/         Registration rules, recommendation scoring, and audience matching
  types.ts          Shared domain types
  App.tsx           Demo navigation, role views, and local workflows
```

Recommendation scoring and notification audience matching are standalone services. They can be called from API-backed feature services later without coupling their rules to React components.

## Requirements

- Node.js 20 or newer
- npm

## Install and run

```sh
npm install
npm run dev
```

Open the local URL Vite prints. The demo opens in the student experience. Use **Viewing as** in the header (or the profile menu on mobile) to switch between Student, Organizer, and Admin views. To reset the demo, open Settings and choose **Reset demo workspace**.

## Data and demo flows

- The initial workspace includes 15 campus events, saved items, a registration, and notifications.
- Registering updates capacity, adds a confirmation notification, and puts the event in the calendar.
- Full events offer a waitlist; duplicate registrations are blocked.
- Organizer drafts autosave to browser storage while the event form is open.
- Published events appear in discovery and the organizer event board.
- Audience targeting supports department, year, interest, skill, and prior participation filters in the matching service.
- Saved events and workspace changes stay in the browser used to make them.

## Environment configuration

The current demo needs no environment variables, secrets, database, or API keys. `.env.example` is provided as a placeholder for future local-only configuration. Do not put credentials in Vite `VITE_*` values: they are exposed to the browser.

## Test and build

```sh
npm test
npm run build
```

Tests cover recommendation ranking, registration/capacity decisions, and audience matching. Registration and publishing run as browser-local demo interactions; move these rules to a server before connecting real student accounts.

## Deployment notes

Build with `npm run build` and serve the `dist/` directory from a static host with SPA fallback. The demo depends on Unsplash image URLs and Google Fonts for its photography and typography; the system font stack and image layout remain usable if those services are unavailable.
