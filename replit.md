# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **AI**: Groq SDK (llama-3.3-70b-versatile model)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## Artifacts

### AI Marketing Agency OS (`artifacts/marketing-os`)
- **Preview path**: `/`
- **Kind**: React + Vite web app
- **Purpose**: Full-stack AI marketing campaign generator
- Dark mode SaaS dashboard with left input panel (brand, product, audience, theme) and right output panel
- Generates complete marketing packages via Groq AI: campaign idea, strategy, ad script, social content, video storyboard
- Theme engine supports 6 styles: Luxury, Gen Z Viral, Corporate, Emotional, Minimal Apple, High Energy Sports

### API Server (`artifacts/api-server`)
- **Preview path**: `/api`
- **Kind**: Express API server
- Routes:
  - `GET /api/healthz` — health check
  - `GET /api/campaign/themes` — list available campaign themes
  - `POST /api/campaign/generate` — generate full AI marketing campaign via Groq

## Environment Variables / Secrets

- `GROQ_API_KEY` — Groq API key for AI campaign generation
- `SESSION_SECRET` — Express session secret
- `DATABASE_URL` + Postgres vars — PostgreSQL connection (provisioned by Replit)

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
