# Classified v2 — Design Spec

## Overview

Rebuild the Classified password manager from a monolithic Next.js 14 + MongoDB app into a Turborepo monorepo with:
- **Standalone Hono API** with JWT auth and AES-256-GCM encryption
- **Vite + React 19 SPA** (web) with HeroUI v3
- **Expo + React Native** (mobile) with HeroUI Native
- **PostgreSQL** (Neon) replacing MongoDB
- **Shared package** for types, schemas, API client, and query hooks

Single developer, single Neon database, deployed to Vercel (web + API) and EAS Build (mobile).

---

## 1. Monorepo Structure

**Tooling:** Turborepo + Bun

```
classified/
├── apps/
│   ├── web/              Vite + React 19 + HeroUI v3 + TanStack Router & Query
│   ├── api/              Hono + Prisma + JWT auth + AES-256-GCM encryption
│   └── mobile/           Expo + React Native + HeroUI Native + Expo Router + TanStack Query
├── packages/
│   └── shared/           Zod schemas, TS types, typed API client, TanStack Query hooks
├── scripts/
│   └── migrate.ts        One-time data migration script
├── old_data/             MongoDB JSON exports (kept for reference)
├── turbo.json
├── package.json          Root workspace config
└── bun.lockb
```

**Turborepo pipelines:**
- `build` — builds all apps and packages (with dependency ordering)
- `dev` — starts dev servers for web + API in parallel
- `lint` — ESLint across all workspaces
- `type-check` — `tsc --noEmit` across all workspaces
- `format:check` — Prettier check across all workspaces

**Deployment:**
- `apps/web` → Vercel project 1 (Static SPA)
- `apps/api` → Vercel project 2 (Serverless Functions)
- `apps/mobile` → EAS Build → App Stores

---

## 2. Database Schema (PostgreSQL via Neon)

Prisma ORM with `postgresql` provider. Connection via `NEON_URL` env var.

### Users
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK, `gen_random_uuid()` |
| name | VARCHAR | NOT NULL |
| email | VARCHAR | UNIQUE, NOT NULL |
| password_hash | VARCHAR | nullable (OAuth users have no password) |
| image | VARCHAR | nullable |
| email_verified_at | TIMESTAMP | nullable |
| is_two_factor_enabled | BOOLEAN | default false |
| created_at | TIMESTAMP | default now() |
| updated_at | TIMESTAMP | auto-updated |

### Records
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| user_id | UUID | FK → Users, CASCADE delete |
| site | VARCHAR | nullable |
| icon | VARCHAR | nullable |
| email | VARCHAR | nullable |
| username | VARCHAR | nullable |
| encrypted_password | TEXT | AES-256-GCM encrypted, base64 encoded |
| encryption_iv | VARCHAR | 12-byte IV, base64 encoded |
| created_at | TIMESTAMP | default now() |
| updated_at | TIMESTAMP | auto-updated |

### Accounts (OAuth)
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| user_id | UUID | FK → Users, CASCADE delete |
| provider | VARCHAR | "google" or "github" |
| provider_account_id | VARCHAR | |
| access_token | TEXT | nullable |
| refresh_token | TEXT | nullable |
| expires_at | INTEGER | nullable |
| token_type | VARCHAR | nullable |
| scope | VARCHAR | nullable |
| id_token | TEXT | nullable |

UNIQUE constraint on `(provider, provider_account_id)`.

### RefreshTokens
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| user_id | UUID | FK → Users, CASCADE delete |
| token_hash | VARCHAR | bcrypt hash of the refresh token |
| expires_at | TIMESTAMP | 30 days from creation |
| created_at | TIMESTAMP | default now() |
| revoked_at | TIMESTAMP | nullable, set on revocation |

### VerificationTokens
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| email | VARCHAR | |
| token_hash | VARCHAR | hashed token |
| expires_at | TIMESTAMP | 1 hour from creation |

UNIQUE constraint on `(email, token_hash)`.

### PasswordResetTokens
Same structure as VerificationTokens. 1-hour expiry.

### TwoFactorTokens
Same structure as VerificationTokens. 5-minute expiry.

---

## 3. API Design (Hono)

### Auth Endpoints (public)
```
POST   /auth/signup          → { accessToken, refreshToken }
POST   /auth/login           → { accessToken, refreshToken } or { twoFactor: true }
POST   /auth/two-factor      → { accessToken, refreshToken }
POST   /auth/refresh         → { accessToken }
POST   /auth/logout          → revoke refresh token
POST   /auth/verify-email    → { success }
POST   /auth/reset-password  → { success } (sends email)
POST   /auth/new-password    → { success }
POST   /auth/google          → { accessToken, refreshToken }
POST   /auth/github          → { accessToken, refreshToken }
```

### Records Endpoints (protected)
```
GET    /records              → { records[], resultsCount, totalCount }
                               Query: ?page=1&search=term&limit=12
GET    /records/:id          → { record } (password decrypted)
POST   /records              → { record }
PUT    /records/:id          → { record }
DELETE /records/:id          → { success }
```

### User Endpoints (protected)
```
GET    /user/me              → { user }
PUT    /user/settings        → { user }
```

### Middleware Stack
1. **CORS** — allow web app origin + mobile
2. **Rate limiting** — auth endpoints: 5 req/min per IP; records: 60 req/min per user
3. **Auth middleware** — validates JWT Bearer token, attaches `userId` to Hono context
4. **Ownership middleware** — on records routes, verifies `record.userId === ctx.userId`

### Token Strategy
- **Access token:** JWT, 15-minute expiry, contains `{ sub: userId, email }`
- **Refresh token:** opaque random string, 30-day expiry, bcrypt-hashed in DB
- **Web:** refresh token set as httpOnly secure cookie by API
- **Mobile:** refresh token stored in `expo-secure-store`
- Silent refresh: clients automatically refresh access token before/on expiry

### OAuth Flow (Mobile)
1. App opens system browser → Google/GitHub OAuth consent
2. OAuth callback redirects to deep link: `classified://auth/callback?code=...`
3. App captures auth code, sends to `POST /auth/google` or `/auth/github`
4. API exchanges code for user info, creates/finds user, returns tokens

### Input Validation
All request bodies validated with Zod schemas from `@classified/shared`. Invalid requests return `400` with structured error response.

---

## 4. Encryption

### Algorithm
AES-256-GCM (authenticated encryption with associated data).

### Key Management
- 32-byte encryption key stored as `ENCRYPTION_KEY` env var
- Same key used for all records (single-tenant app, single user)
- Key never leaves the server

### Per-Record Encryption
- Each record gets a unique random 12-byte IV
- Encrypted value stored as base64 string in `encrypted_password`
- IV stored separately in `encryption_iv` column (base64 of 12 bytes)
- Records with no password store null — no dummy encryption

### Decrypt Flow
1. Client requests `GET /records/:id` with valid access token
2. API verifies ownership, reads encrypted_password + encryption_iv
3. API decrypts with ENCRYPTION_KEY + IV → plaintext password
4. Returns plaintext password over HTTPS
5. Client displays/copies password

---

## 5. Shared Package (`packages/shared`)

### Contents
- **Zod schemas** — all request/response validation (migrated from current `schemas.ts`)
- **TypeScript types** — inferred from Zod schemas (`z.infer<typeof Schema>`)
- **API client** — typed fetch wrapper with auth token management
  - Handles access token injection
  - Handles silent refresh on 401
  - Works in both browser (fetch) and React Native (fetch)
- **TanStack Query hooks** — `useRecords()`, `useRecord(id)`, `useCreateRecord()`, `useUpdateRecord()`, `useDeleteRecord()`, `useUser()`, `useUpdateSettings()`, etc.
  - Optimistic updates for mutations
  - Pagination support
  - Search/filter support

### Package Config
- Built with `tsup` (ESM output)
- Exports from `@classified/shared`

---

## 6. Web App (`apps/web`)

### Stack
- Vite + React 19
- HeroUI v3 + Tailwind CSS v4
- TanStack Router (file-based, type-safe routing)
- TanStack Query (via shared hooks)
- Dark/light theme toggle via HeroUI's built-in theme system

### Routes
```
/login              Email/password + Google/GitHub OAuth buttons
/signup             Registration form
/verify-email       Email verification (token in URL query param)
/reset-password     Request password reset (email form)
/new-password       Set new password (token in URL query param)
/                   Dashboard — records list with search + pagination
/settings           Settings page/modal
```

### Auth on Web
- Access token: held in memory (React state/context)
- Refresh token: httpOnly secure cookie (set by API, sent automatically)
- On page load: attempt silent refresh → if success, user is logged in
- Protected routes redirect to `/login` if no valid session

### Quality Checks
```bash
bun run format:check    # Prettier
bun run type-check      # tsc --noEmit
bun run lint            # ESLint
```

---

## 7. Mobile App (`apps/mobile`)

### Stack
- Expo (managed workflow) + React Native
- Expo Router (file-based routing, React Navigation under the hood)
- HeroUI Native (full component library — Button, Input, Dialog, BottomSheet, Toast, Card, etc.)
- Uniwind (Tailwind for React Native)
- TanStack Query (via shared hooks)
- React Native Reanimated (60fps animations)
- Expo Haptics (tactile feedback)
- Expo Secure Store (encrypted token storage)

### Navigation Structure

**Auth Stack (unauthenticated):**
- Login — email/password + Google/GitHub OAuth
- Signup — name, email, password
- Two-Factor — 6-digit OTP input
- Verify Email — deep link landing
- Reset Password — email form
- New Password — deep link landing

**Main Tabs (authenticated):**

*Records Tab:*
- Records list — search bar, pull-to-refresh, infinite scroll
- Record detail — view fields, copy password (haptic), edit/delete
- Add/Edit record — form with password generator

*Settings Tab:*
- Profile — name, email, avatar
- Security — change password, toggle 2FA
- Logout

### UX Polish
- **Haptic feedback** — on copy, delete, save actions
- **Skeleton loaders** — HeroUI Skeleton while data loads
- **Native gestures** — swipe-back navigation via React Navigation
- **Pull-to-refresh** — on records list
- **Infinite scroll** — paginated loading as user scrolls
- **Optimistic updates** — delete/update feels instant, rolls back on API failure
- **Toast notifications** — HeroUI Native Toast for confirmations
- **Biometric unlock** — optional Face ID / fingerprint re-auth when app resumes from background
- **Secure storage** — tokens in expo-secure-store (device keychain)

---

## 8. Data Migration

One-time script in `scripts/migrate.ts`.

### Steps
1. Read `old_data/Records.users.json` — find user with email `nadertate@gmail.com` (ObjectId: `6599d271679d3bfc2c63a3e3`)
2. Create user in PostgreSQL with new UUID, preserving: name, email, password_hash, is_two_factor_enabled, created_at
3. Read `old_data/Records.Record.json` — filter records where userId matches
4. For each record:
   - Generate random 12-byte IV
   - Encrypt plaintext password with AES-256-GCM + ENCRYPTION_KEY + IV
   - Insert into PostgreSQL with new UUID, user_id mapped to new user UUID
5. Print summary: X records migrated for user Y

### Notes
- Existing bcrypt password hash carries over as-is (algorithm-agnostic)
- Old MongoDB ObjectIds are not preserved — new UUIDs generated
- Records with no password: `encrypted_password` and `encryption_iv` stay null
- Script is idempotent — checks if user already exists before inserting

---

## 9. Environment Variables

### API (`apps/api`)
```
NEON_URL              PostgreSQL connection string (Neon)
ENCRYPTION_KEY        32-byte hex string for AES-256-GCM
JWT_SECRET            Secret for signing JWTs
GOOGLE_ID             Google OAuth client ID
GOOGLE_SECRET         Google OAuth client secret
GITHUB_ID             GitHub OAuth client ID
GITHUB_SECRET         GitHub OAuth client secret
RESEND_API_KEY        Resend email service key
FROM_EMAIL            Sender email for transactional emails
CLOUDINARY_URL        Cloudinary upload endpoint
CORS_ORIGIN           Web app URL (for CORS whitelist)
```

### Web (`apps/web`)
```
VITE_API_URL          API base URL (e.g., https://api.classified.vercel.app)
```

### Mobile (`apps/mobile`)
```
EXPO_PUBLIC_API_URL   API base URL
```

---

## 10. Security Summary

| Concern | Mitigation |
|---------|-----------|
| Passwords at rest | AES-256-GCM with per-record IV, server-side key |
| Token theft (access) | 15-min expiry, in-memory only (web), secure store (mobile) |
| Token theft (refresh) | bcrypt-hashed in DB, httpOnly cookie (web), secure store (mobile), revocable |
| Brute force login | Rate limiting on auth endpoints (5 req/min per IP) |
| CSRF | No cookies for auth on mobile; httpOnly + SameSite for web |
| XSS | SPA with no dangerouslySetInnerHTML; CSP headers on Vercel |
| SQL injection | Prisma parameterized queries exclusively |
| Unauthorized record access | Ownership check middleware on every records endpoint |
| DB breach | Passwords encrypted, tokens hashed — raw DB dump is useless |
| Man-in-the-middle | HTTPS everywhere (Vercel + Neon both enforce TLS) |
