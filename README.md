# RAPHA Diagnostic Laboratory

A full-stack patient portal and public website for a diagnostic laboratory, built with Next.js (App Router), Tailwind CSS, NextAuth (Auth.js) v5, and a Prisma/MySQL schema ready to connect.

## Stack

| Layer          | Choice                                      |
| -------------- | -------------------------------------------- |
| Framework      | Next.js 16 (App Router, Turbopack)           |
| Styling        | Tailwind CSS v4                              |
| Auth           | NextAuth.js v5 (Auth.js), Credentials provider, JWT sessions |
| Database (future) | MySQL via Prisma ORM                      |
| Validation     | Zod                                          |
| Icons          | lucide-react                                 |

## Getting started

```bash
npm install
cp .env.example .env   # then edit .env — see below
npm run dev
```

Visit `http://localhost:3000`. A demo patient account is seeded so you can explore the portal immediately:

```
Email:    demo@rapha.health
Password: Patient123!
```

## How the data layer works right now

There's no live database wired up yet. Every "table" the app needs — users, appointments, notifications, lab results — is implemented as an in-memory store in `src/lib/data/*.ts`, shaped to match `prisma/schema.prisma` exactly. All state resets when the dev server restarts, which is expected: it's a stand-in, not the real thing.

Notifications and Laboratory Results intentionally always return empty lists — the spec asked for complete frontends for those two with no backend behind them yet, so that's what's wired up (the empty-state UI is what you're meant to see there).

Because Next.js compiles route handlers (`app/api/**/route.ts`) and Server Components (`app/**/page.tsx`) as separate bundles, a plain module-level array would end up duplicated across them. To avoid that, each store attaches its array to `globalThis` (the same pattern used for the Prisma client singleton below), so a user created via `/api/auth/register` is immediately visible to a Server Component page reading `getUserById`.

## Connecting a real MySQL database

1. Provision a MySQL database (local, Docker, PlanetScale, Railway, RDS — anything works).
2. Set `DATABASE_URL` in `.env`:
   ```
   DATABASE_URL="mysql://user:password@host:3306/rapha_diagnostic"
   ```
3. Generate the client and run the first migration:
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```
4. In `src/lib/data/*.ts`, swap each function's body for the equivalent Prisma call. For example, in `users.ts`:
   ```ts
   // before (mock)
   export function getUserByEmail(email: string) {
     return users.find((u) => u.email.toLowerCase() === email.toLowerCase());
   }

   // after (Prisma)
   import { prisma } from "@/lib/prisma";
   export function getUserByEmail(email: string) {
     return prisma.user.findUnique({ where: { email: email.toLowerCase() } });
   }
   ```
   Every function signature and return shape in `src/lib/data/*.ts` already matches a Prisma query, so nothing above that layer (API routes, pages, components) needs to change.
5. `src/lib/prisma.ts` (the Prisma client singleton) is excluded from `tsconfig.json`'s type-checking until you've run `prisma generate` — remove that exclusion once you're using it.
6. Seed real services into the database (currently in `src/lib/data/services.ts`) via a `prisma/seed.ts` script if you want them to come from the database too, or leave them as static config — either is reasonable.

## Environment variables

See `.env.example`. You need:

- `DATABASE_URL` — only required once you connect MySQL (see above).
- `AUTH_SECRET` — required for NextAuth session encryption. Generate one with `npx auth secret` or `openssl rand -base64 32`.

## Project structure

```
src/
  app/
    page.tsx                 Public landing page (Home/About/Services/Contact sections)
    login/, signup/          Auth pages
    dashboard/                Patient portal (protected by proxy.ts)
      page.tsx                Dashboard home
      appointments/           List + make/reschedule/cancel
      notifications/          Frontend-only, empty state
      results/                Frontend-only, empty state + future-ready table
      settings/               Profile + password
    api/                      Route handlers (auth, appointments, account)
  components/
    ui/                       Reusable primitives (Button, Card, Input, Modal, EmptyState…)
    layout/, landing/         Public site sections
    dashboard/, auth/, brand/ Portal-specific and shared components
  lib/
    data/                     Mock data layer (see above) — swap for Prisma later
    validations/              Zod schemas
    auth.ts, auth.config.ts   NextAuth config (split for edge/runtime reasons, see below)
  types/                      Shared TypeScript types mirroring the Prisma schema
prisma/
  schema.prisma               MySQL schema — write-ready, not yet connected
```

## Auth notes

- `src/auth.config.ts` holds only edge-safe config (pages, the `authorized` callback) — no Node-only dependencies.
- `src/auth.ts` adds the Credentials provider (bcrypt password comparison) and is used by API routes and Server Components.
- `src/proxy.ts` is Next.js 16's renamed `middleware.ts` convention. It builds a second, lightweight NextAuth instance from `auth.config.ts` alone, just to gate `/dashboard/*` and bounce logged-in users away from `/login` and `/signup`.
- Sessions are JWT-based (no database session table needed), which is standard for a Credentials-only setup.

## What's built vs. deferred

Everything in the spec is implemented, including form validation, soft-cancel (appointments are never hard-deleted, just marked `CANCELLED`), and the first-time "no appointments yet" empty state. The features explicitly called out as future work — admin approval, reminders, email/SMS, uploaded results, payments, profile photos, medical history, dark mode, activity logs — are intentionally not built, but nothing here should need restructuring to add them:

- New Prisma models slot into `prisma/schema.prisma` alongside the existing ones.
- New data functions go in `src/lib/data/*.ts` next to what's there.
- The component structure (small, composable pieces in `components/ui` and `components/dashboard`) is meant to be extended, not rewritten.

## Scripts

```bash
npm run dev       # start dev server
npm run build     # production build
npm run start     # run the production build
npm run lint      # ESLint
```
