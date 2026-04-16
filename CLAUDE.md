# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Classified is a password manager with a Turborepo monorepo architecture. Users can store, search, and manage password records with credential-based auth, Google/GitHub OAuth, email verification, and two-factor authentication. Passwords are encrypted at rest with AES-256-GCM.

## Monorepo Structure

```
classified/
├── apps/
│   ├── api/          Hono REST API (JWT auth, Prisma, encryption)
│   ├── web/          (planned) Vite + React 19 + HeroUI v3
│   └── mobile/       (planned) Expo + React Native + HeroUI Native
├── packages/
│   └── shared/       Zod schemas, TypeScript types, API client
├── scripts/
│   └── migrate.ts    One-time MongoDB → PostgreSQL migration (already run)
└── old_data/         MongoDB JSON exports (reference only)
```

## Commands

```bash
# Root (Turborepo)
bun run dev            # Start all dev servers in parallel
bun run build          # Build all apps and packages
bun run lint           # ESLint across all workspaces
bun run type-check     # tsc --noEmit across all workspaces
bun run format:check   # Prettier check across all workspaces
bun run test           # Vitest across all workspaces

# API (apps/api)
cd apps/api
bun run dev            # Start API server (localhost:3001)
bun run test           # Run API tests (12 tests)
bun run db:generate    # Regenerate Prisma client
bun run db:push        # Push schema changes to Neon PostgreSQL
```

## Architecture

### API (`apps/api`)

- **Hono** REST API with CORS, rate limiting, and request logging
- **JWT auth** — 15-min access tokens (jose), 30-day refresh tokens (bcrypt-hashed in DB)
- **AES-256-GCM** encryption for stored passwords — per-record random IV, server-side key
- **Prisma ORM** with PostgreSQL (Neon) — singleton client in `src/lib/prisma.ts`
- **Rate limiting** — 5 req/min on auth endpoints per IP
- Path alias: `@/*` maps to `apps/api/src/`

### API Endpoints

**Auth (public):** `/auth/signup`, `/auth/login`, `/auth/two-factor`, `/auth/refresh`, `/auth/logout`, `/auth/verify-email`, `/auth/reset-password`, `/auth/new-password`, `/auth/google`, `/auth/github`

**Records (protected):** `GET /records`, `GET /records/:id`, `POST /records`, `PUT /records/:id`, `DELETE /records/:id`

**User (protected):** `GET /user/me`, `PUT /user/settings`

### Shared Package (`packages/shared`)

- Zod validation schemas for all API request/response shapes
- TypeScript types inferred from schemas
- Built with tsup (ESM), importable as `@classified/shared`

### Data Layer

- **PostgreSQL** (Neon) — 7 models: User, Record, Account, RefreshToken, VerificationToken, PasswordResetToken, TwoFactorToken
- Schema at `apps/api/src/prisma/schema.prisma`
- Records store encrypted passwords in `encrypted_password` + `encryption_iv` columns

### Middleware Stack

1. CORS (whitelist web app origin)
2. Rate limiting (auth: 5/min, general: 60/min)
3. Auth middleware — validates JWT, sets `userId` on Hono context
4. Ownership middleware — verifies record belongs to authenticated user

### External Services

- **Resend** — transactional emails (verification, reset, 2FA codes) via `src/lib/mail.ts`
- **Cloudinary** — icon/image uploads
- **Google/GitHub OAuth** — code exchange via API endpoints

## Environment Variables

### API (`apps/api/.env`)
```
NEON_URL, ENCRYPTION_KEY, JWT_SECRET,
GOOGLE_ID, GOOGLE_SECRET, GITHUB_ID, GITHUB_SECRET,
RESEND_API_KEY, FROM_EMAIL, CLOUDINARY_URL, CORS_ORIGIN
```

## Design Spec

Full design document at `docs/superpowers/specs/2026-04-16-classified-v2-design.md`.
