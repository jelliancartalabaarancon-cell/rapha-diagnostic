# RAPHA Diagnostic Laboratory

A full-stack patient portal and public website for a diagnostic laboratory, built with Next.js (App Router), Tailwind CSS, NextAuth (Auth.js) v5, and Prisma/MySQL.

## Stack

| Layer          | Choice                                                        |
| -------------- | -------------------------------------------------------------- |
| Framework      | Next.js 16 (App Router, Turbopack)                              |
| Styling        | Tailwind CSS v4                                                  |
| Auth           | NextAuth.js v5 (Auth.js), Credentials provider, JWT sessions     |
| Database       | MySQL via Prisma ORM (connected — not mock data)                 |
| Validation     | Zod                                                              |
| Email          | Nodemailer (Gmail SMTP, app password)                            |
| AI Chatbot     | OpenAI SDK against OpenRouter (`openrouter/free`)                |
| PDF generation | pdf-lib (laboratory result export)                               |
| Icons          | lucide-react                                                     |

## Getting started

```bash
npm install
cp .env.example .env   # then edit .env — see below
npx prisma generate
npx prisma migrate dev
npx prisma db seed     # optional: loads default services
npm run dev
```

Visit `http://localhost:3000`.

There is no seeded demo account by default — create one via the Sign Up page, or add one to `prisma/seed.ts` if you want a fixed set of test credentials.

## Data layer

The mock in-memory data layer has been retired. Every function in `src/lib/data/*.ts` now calls Prisma directly against a real MySQL database, and API routes/Server Components consume those functions as before — nothing above that layer changed shape.

`src/lib/prisma.ts` holds the Prisma client singleton, attached to `globalThis` in development so hot-reload doesn't spawn a new client per request.

## What's implemented

- **Public site** — Home / About / Services / Contact sections.
- **Auth** — signup, login, JWT sessions, role-based access (`PATIENT`, `STAFF`, `ADMIN`) enforced in `src/proxy.ts` (Next.js 16's `middleware.ts` equivalent).
- **Patient dashboard** — book/reschedule/cancel appointments against real appointment slots with capacity checks (booking runs inside a Prisma transaction to prevent overbooking), profile + password settings.
- **Cancellation/reschedule limit** — a patient's account is automatically deactivated after 3 cancellations/reschedules within a calendar month; this is enforced server-side, not just in the UI.
- **Staff area** — manage appointment slots, mark appointments complete/cancelled, manage services.
- **Admin area** — create/edit/deactivate Staff, Admin, and Patient accounts.
- **Email notifications** — confirmation, reschedule, and cancellation emails sent via Gmail SMTP (Nodemailer). Email failures never block the underlying action; they're logged and swallowed.
- **In-app notifications** — created alongside the emails above, readable from `/dashboard/notifications`.
- **Laboratory result PDF export** — `/api/lab-results/[id]` generates a formatted PDF via `pdf-lib`. **This currently returns hardcoded demo data for any ID** — it is not yet wired to a real `LabResult` record, and has no auth/ownership check (see Known Issues below).
- **AI chatbot** (`src/components/Chatbot.tsx` + `/api/chatbot`) — answers general lab-test questions unauthenticated, and can surface the logged-in patient's own appointments/notifications/lab results when a session exists. Scoping of *which* records it can see is enforced server-side (it only ever fetches data for `session.user.id`); the restrictions on *what it says* about that data are prompt-based, not code-enforced.

## Known issues / before this goes further

These are flagged deliberately rather than silently fixed, so they can be discussed and addressed with full context (useful for a thesis defense — this is exactly the kind of thing that should be listed as a limitation or as a next iteration).

1. **`/api/lab-results/[id]` has no authentication check.** It only serves hardcoded demo data today, but the route shape (accepts any `id`, returns a PDF) is exactly what would need an `auth()` + ownership check once real lab results are connected. Fix this before wiring in the real data.
2. **`/api/test-email` and `/api/test-services` are leftover debug routes with no auth check.** `test-email` sends a real email to a hardcoded address on every GET request — this should be deleted or moved behind an admin-only check; leaving it public risks quota exhaustion or spam.
3. **No rate limiting** on login, signup, or the chatbot endpoint. Worth adding (e.g. Upstash Redis + `@upstash/ratelimit`) before this is used with real patient data.
4. **`resend` is listed as a dependency but unused** — actual email sending goes through `nodemailer` + Gmail. Pick one and drop the other from `package.json`.
5. **No security headers configured** in `next.config.ts` (CSP, `X-Frame-Options`, HSTS, etc.).

## Environment variables

See `.env.example`. You'll need:

- `DATABASE_URL` — MySQL connection string, e.g. `mysql://user:password@host:3306/rapha_diagnostic`.
- `AUTH_SECRET` — required for NextAuth session encryption. Generate with `npx auth secret` or `openssl rand -base64 32`.
- `GMAIL_USER` / `GMAIL_APP_PASSWORD` — Gmail address + [app password](https://myaccount.google.com/apppasswords) used to send transactional emails via Nodemailer.
- `OPENROUTER_API_KEY` — API key for the chatbot (used against OpenRouter's OpenAI-compatible endpoint).

None of these should ever be committed. `.env*` is already in `.gitignore`.

## Project structure

```
src/
  app/
    page.tsx                 Public landing page (Home/About/Services/Contact sections)
    login/, signup/          Auth pages
    dashboard/                Patient portal (protected by proxy.ts)
      page.tsx                Dashboard home
      appointments/           List + make/reschedule/cancel
      notifications/          In-app notifications, backed by real data
      results/                Lab results list + PDF export
      settings/                Profile + password
    staff/                    Staff portal — appointment slots, appointments, services
    admin/                     Admin portal — user account management
    api/                       Route handlers (auth, appointments, account, admin, staff, chatbot, lab-results)
  components/
    ui/                       Reusable primitives (Button, Card, Modal, EmptyState…)
    layout/, landing/         Public site sections
    dashboard/, staff/, admin/, auth/, brand/  Area-specific and shared components
    Chatbot.tsx                Floating AI assistant widget
  lib/
    data/                     Prisma-backed data layer (users, appointments, slots, services, notifications, lab results)
    chatbot/                  Data fetchers scoped for the chatbot's context window
    validations/              Zod schemas
    auth.ts, auth.config.ts   NextAuth config (split for edge/runtime reasons, see below)
    email.ts                  Nodemailer/Gmail email sending
    prisma.ts                 Prisma client singleton
  types/                      Shared TypeScript types mirroring the Prisma schema
prisma/
  schema.prisma               MySQL schema
  migrations/                 Migration history
  seed.ts                     Seeds default lab services
```

## Auth notes

- `src/auth.config.ts` holds only edge-safe config (pages, the `authorized` callback) — no Node-only dependencies.
- `src/auth.ts` adds the Credentials provider (bcrypt password comparison) and is used by API routes and Server Components.
- `src/proxy.ts` is Next.js 16's renamed `middleware.ts` convention. It builds a second, lightweight NextAuth instance from `auth.config.ts` alone, just to gate `/dashboard/*`, `/staff/*`, and `/admin/*`, and to route each role to its own area.
- Sessions are JWT-based (no database session table needed), which is standard for a Credentials-only setup.

## Scripts

```bash
npm run dev       # start dev server
npm run build     # production build
npm run start     # run the production build
npm run lint      # ESLint
```

## Deployment (Vercel)

This project is deployed on Vercel. Pushing to the connected GitHub repo's default branch triggers an automatic production deploy; every other branch/PR gets its own preview deployment.

Environment variables (`DATABASE_URL`, `AUTH_SECRET`, `GMAIL_USER`, `GMAIL_APP_PASSWORD`, `OPENROUTER_API_KEY`) must be set in the Vercel project's **Settings → Environment Variables**, separately from your local `.env` — Vercel does not read your local `.env` file.

`postinstall` runs `prisma generate` automatically on every deploy, so the Prisma client is always in sync with `prisma/schema.prisma`. Database *migrations* are not run automatically on deploy — run `npx prisma migrate deploy` against the production `DATABASE_URL` yourself after a schema change, before or right after pushing.
