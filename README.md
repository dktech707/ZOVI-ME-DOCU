# ZOVI-ME-DOCU — Skeleton (Local Services Marketplace)

This is a minimal, working skeleton for a “hire a person nearby” services marketplace (not delivery of goods).
It is intentionally small: a web app (Next.js) + an API (Fastify) + a shared types package.

## Monorepo layout

- `apps/web` — Next.js (App Router) web app
- `apps/api` — Fastify API (TypeScript) with a simple JSON-file datastore
- `packages/shared` — shared TypeScript types + zod schemas

## Requirements

- Node.js 20+
- npm 9+ (or newer)

## Quick start

From repo root:

```bash
npm install
npm run dev
```

- Web: http://localhost:3000
- API: http://localhost:3001/health

## Scripts

- `npm run dev` — runs web + api in parallel
- `npm run dev:web` — web only
- `npm run dev:api` — api only
- `npm run build` — builds all workspaces

## Notes

- Data is stored in `apps/api/data/db.json` (for now). Replace with Postgres/Prisma later.
- Auth, payments, and verification are stubbed as placeholders — the point here is to give you a clean GitHub-ready starting structure.
