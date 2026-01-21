# Welcome to your Lovable project

## Project info


# MBA Suites — Frontend (elysian-stays)

This repository contains the frontend for the MBA Suites demo site — a small React + Vite application showcasing a hotel / serviced-apartments booking UI.

The project is focused on a clean, responsive UI built with TypeScript, Tailwind CSS and shadcn-ui components. It includes a public landing page, room listings, and an admin-style bookings management page.

Contents
- Overview and goals
- Tech stack
- Getting started (local dev)
- Available scripts
- Routes and pages added
- Accessibility & performance notes
- Contributing and branches
- Contact

## Overview

This frontend demonstrates:
- A mobile-first landing page with hero, search and feature sections
- Feature cards, special offers and a featured rooms grid
- Booking management UI (local sample data) with a small admin dashboard available at `/admin`
- Accessible components (aria labels, semantic markup) and performance-minded assets (lazy images, motion-safe animations)

## Tech stack

- Vite + React (TypeScript)
- Tailwind CSS
- shadcn-ui components
- react-router for client routing

## Prerequisites

- Node.js 18+ (or a compatible LTS) and npm
- Git configured for your environment

On Windows (PowerShell) you can use nvm-windows or the official Node installer.

## Setup (local development)

1. Clone the repository:

```powershell
git clone <YOUR_REMOTE_URL>
cd elysian-stays
```

2. Install dependencies:

```powershell
npm install
```

3. Start the development server (Vite):

```powershell
npm run dev
```

4. Open the URL printed by Vite (usually http://localhost:5173).

Notes for Windows PowerShell: use `;` to chain commands on one line. Example:

```powershell
npm install; npm run dev
```

## Available scripts

- `npm run dev` — development server with hot-reload
- `npm run build` — production build (dist)
- `npm run preview` — locally preview production build
- `npm run lint` — (if configured) run linters

Check `package.json` for the exact scripts your project exposes.

## Important routes / pages

- `/` — Landing page (hero, search, features, special offers)
- `/rooms` — Rooms listing
- `/rooms/:id` — Room details
- `/manage-bookings` — Bookings manager (staff)
- `/admin` — Admin dashboard (mirrors `ManageBookings` for now)
- `/about`, `/contact`, `/privacy`, `/terms` — informational pages added to the site

If you add new pages, register them in `src/App.tsx` using `<Route />` from `react-router-dom`.

## What I added in this branch

- Landing sections: `src/components/LandingAbout.tsx`, `src/components/LandingContact.tsx`
- Informational pages: `src/pages/About.tsx`, `src/pages/Contact.tsx`, `src/pages/Privacy.tsx`, `src/pages/Terms.tsx`
- Footer and Navbar updates to include links
- Admin dashboard / stats added to `src/pages/ManageBookings.tsx`

## Accessibility & performance notes

- Images use `loading="lazy"` and include descriptive `alt` text.
- Motion animations are applied with `motion-safe:` to respect users who prefer reduced motion.
- Sections include `aria-labelledby` and `role="region"` where appropriate for better landmarking.
- Use responsive `srcset` or picture tags for production to serve optimized images (I can add those if you provide WebP / multiple sizes).

## Branching & committing

I recommend creating a `develop` branch for ongoing work and keeping `main` for stable releases. Example (run locally):

```powershell
# create or update develop branch from current working tree
git checkout -B develop
git add -A
git commit -m "feat: add landing sections, pages; update navbar, footer, routes and admin dashboard"
git push -u origin develop
```

If you prefer a different branch naming convention, adapt accordingly.

## Contributing

- Keep changes focused and make small commits with clear messages.
- Follow the project's Tailwind-based design tokens in `src/index.css`.
- Add tests or a manual QA checklist for any behavioral change that affects bookings.

## Deploying

Build and host the `dist/` folder on any static hosting (Netlify, Vercel, GitHub Pages). For Vite deploys:

```powershell
npm run build
# then deploy the generated `dist` folder to your hosting provider
```
### How to use Booking.com/Airbnb sync:

Get the iCal export URL from your Booking.com or Airbnb property
Add it in Admin Dashboard → Sync → Add Calendar
Click "Sync" to import blocked dates
Copy your export URL and paste it into Booking.com/Airbnb to sync your direct bookings back
Enhanced booking system is now complete with:

✅ Implemented:

Double-booking prevention - Database trigger blocks overlapping bookings
Real-time availability - Live updates via Supabase Realtime
Booking operations - Create, update, cancel, confirm, complete APIs
External calendar sync - Import from Booking.com/Airbnb via iCal
Calendar export - Generate iCal URLs for external platforms
Admin UI - New "Sync" tab to manage external calendars
How to use Booking.com/Airbnb sync:

Get the iCal export URL from your Booking.com or Airbnb property
Add it in Admin Dashboard → Sync → Add Calendar
Click "Sync" to import blocked dates
Copy your export URL and paste it into Booking.com/Airbnb to sync your direct bookings back

## Next recommendations

- Replace placeholder images with optimized WebP or AVIF files and add `srcset` for responsive images.
- Add a simple CI workflow to run lint and type checks on PRs.
- Add an accessibility test step (axe or Lighthouse) in CI.

## Contact

If you need help with styling, accessibility audits, or wiring a real backend for bookings, I can help implement the API endpoints, persistent storage, and authentication.

---

_(Generated and updated to reflect the current repository layout.)_
