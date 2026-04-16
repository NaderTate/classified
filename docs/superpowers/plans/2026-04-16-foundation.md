# Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the Classified password manager into a Turborepo monorepo with a Hono REST API, PostgreSQL database, AES-256-GCM encryption, and shared package — producing a fully working, tested API that both web and mobile apps will consume.

**Architecture:** Turborepo monorepo with Bun. Hono API deployed as Vercel serverless functions. Prisma ORM with Neon PostgreSQL. JWT access/refresh token auth. AES-256-GCM at-rest encryption for passwords. Shared package with Zod schemas, TypeScript types, and API client.

**Tech Stack:** Turborepo, Bun, Hono, Prisma, PostgreSQL (Neon), Vitest, Zod, jose (JWT), bcryptjs

**Spec:** `docs/superpowers/specs/2026-04-16-classified-v2-design.md`

---

## File Structure

```
classified/
├── package.json                          # Root workspace config
├── turbo.json                            # Turborepo pipeline config
├── bunfig.toml                           # Bun workspace config
├── .gitignore                            # Updated for monorepo
├── .prettierrc                           # Shared Prettier config
├── .prettierignore                       # Prettier ignore
├── apps/
│   └── api/
│       ├── package.json
│       ├── tsconfig.json
│       ├── vitest.config.ts
│       ├── .env                          # Local env (gitignored)
│       ├── .env.example                  # Env template
│       ├── src/
│       │   ├── index.ts                  # Hono app entry + Vercel export
│       │   ├── lib/
│       │   │   ├── prisma.ts             # Prisma client singleton
│       │   │   ├── encryption.ts         # AES-256-GCM encrypt/decrypt
│       │   │   ├── jwt.ts                # JWT sign/verify/refresh logic
│       │   │   ├── mail.ts               # Resend email sending
│       │   │   └── tokens.ts             # Verification/reset/2FA token generation
│       │   ├── middleware/
│       │   │   ├── auth.ts               # JWT auth middleware
│       │   │   └── ownership.ts          # Record ownership check
│       │   ├── routes/
│       │   │   ├── auth.ts               # Auth endpoints
│       │   │   ├── records.ts            # Records CRUD endpoints
│       │   │   └── user.ts               # User profile endpoints
│       │   └── utils/
│       │       └── password.ts           # bcrypt hash/compare helpers
│       ├── test/
│       │   ├── setup.ts                  # Test setup (env vars, mocks)
│       │   ├── helpers.ts                # Test factory helpers
│       │   ├── lib/
│       │   │   ├── encryption.test.ts
│       │   │   └── jwt.test.ts
│       │   ├── routes/
│       │   │   ├── auth.test.ts
│       │   │   ├── records.test.ts
│       │   │   └── user.test.ts
│       │   └── middleware/
│       │       └── auth.test.ts
│       └── prisma/
│           └── schema.prisma             # PostgreSQL schema
├── packages/
│   └── shared/
│       ├── package.json
│       ├── tsconfig.json
│       ├── tsup.config.ts                # Build config
│       └── src/
│           ├── index.ts                  # Barrel export
│           ├── schemas.ts                # Zod validation schemas
│           └── types.ts                  # Inferred TypeScript types
├── scripts/
│   └── migrate.ts                        # One-time data migration
└── old_data/
    ├── Records.Record.json               # Existing MongoDB exports
    └── Records.users.json
```

---

### Task 1: Initialize Turborepo Monorepo

**Files:**
- Create: `package.json` (overwrite existing)
- Create: `turbo.json`
- Create: `bunfig.toml`
- Create: `.prettierrc`
- Create: `.prettierignore`
- Modify: `.gitignore`

- [ ] **Step 1: Back up and clean the root**

Move the existing Next.js source files to a temporary backup. We will reference them during implementation but they won't be part of the new structure.

```bash
cd /c/Users/Nader/OneDrive/Documents/Projects/classified
mkdir -p _old_nextjs_backup
# Move existing source files (NOT old_data, docs, or .git)
mv actions app auth.ts auth.config.ts components hooks lib middleware.ts next-auth.d.ts next.config.js package.json postcss.config.js prisma public routes.ts schemas.ts tailwind.config.ts tsconfig.json utils .eslintrc.json _old_nextjs_backup/ 2>/dev/null
# Remove node_modules and lock files
rm -rf node_modules package-lock.json .next
```

- [ ] **Step 2: Create root package.json**

```json
{
  "name": "classified",
  "private": true,
  "workspaces": ["apps/*", "packages/*"],
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "lint": "turbo run lint",
    "type-check": "turbo run type-check",
    "format:check": "turbo run format:check",
    "format": "turbo run format",
    "test": "turbo run test",
    "clean": "turbo run clean"
  },
  "devDependencies": {
    "turbo": "^2.9.6",
    "prettier": "^3.5.3"
  },
  "packageManager": "bun@1.3.9"
}
```

- [ ] **Step 3: Create turbo.json**

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^build"]
    },
    "type-check": {
      "dependsOn": ["^build"]
    },
    "format:check": {},
    "format": {},
    "test": {
      "dependsOn": ["^build"],
      "cache": false
    },
    "clean": {
      "cache": false
    }
  }
}
```

- [ ] **Step 4: Create bunfig.toml**

```toml
[install]
peer = false
```

- [ ] **Step 5: Create .prettierrc**

```json
{
  "semi": true,
  "singleQuote": false,
  "tabWidth": 2,
  "trailingComma": "all",
  "printWidth": 100
}
```

- [ ] **Step 6: Create .prettierignore**

```
node_modules
dist
.next
.turbo
coverage
bun.lockb
old_data
_old_nextjs_backup
.superpowers
```

- [ ] **Step 7: Update .gitignore**

Replace the existing `.gitignore` with:

```gitignore
# Dependencies
node_modules/

# Build outputs
dist/
.next/
.turbo/
out/

# Env files
.env
.env.local
.env.*.local

# IDE
.vscode/
.idea/
*.swp
*.swo
.DS_Store

# Test & coverage
coverage/

# Lock files (bun)
# bun.lockb is committed

# Prisma
prisma/generated/

# Misc
*.tsbuildinfo
_old_nextjs_backup/
.superpowers/
```

- [ ] **Step 8: Install root dependencies and verify**

```bash
bun install
```

Expected: `bun.lockb` created, `node_modules` with turbo and prettier.

- [ ] **Step 9: Commit**

```bash
git add package.json turbo.json bunfig.toml .prettierrc .prettierignore .gitignore bun.lockb
git commit -m "feat: initialize Turborepo monorepo with Bun"
```

---

### Task 2: Set Up Shared Package

**Files:**
- Create: `packages/shared/package.json`
- Create: `packages/shared/tsconfig.json`
- Create: `packages/shared/tsup.config.ts`
- Create: `packages/shared/src/index.ts`
- Create: `packages/shared/src/schemas.ts`
- Create: `packages/shared/src/types.ts`

- [ ] **Step 1: Create packages/shared/package.json**

```json
{
  "name": "@classified/shared",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  },
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "lint": "eslint src/",
    "type-check": "tsc --noEmit",
    "format:check": "prettier --check \"src/**/*.ts\"",
    "format": "prettier --write \"src/**/*.ts\"",
    "clean": "rm -rf dist"
  },
  "dependencies": {
    "zod": "^3.24.4"
  },
  "devDependencies": {
    "@types/node": "^22.15.3",
    "eslint": "^9.26.0",
    "tsup": "^8.4.0",
    "typescript": "^5.8.3"
  }
}
```

- [ ] **Step 2: Create packages/shared/tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

- [ ] **Step 3: Create packages/shared/tsup.config.ts**

```typescript
import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: true,
  clean: true,
  sourcemap: true,
});
```

- [ ] **Step 4: Create packages/shared/src/schemas.ts**

Migrated from the old `schemas.ts` with additions for API request/response shapes:

```typescript
import { z } from "zod";

// ── Auth Schemas ──

export const LoginSchema = z.object({
  email: z.string().email({ message: "Email is required" }),
  password: z.string().min(1, { message: "Password is required" }),
});

export const TwoFactorSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6, { message: "Code must be 6 digits" }),
});

export const SignupSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  email: z.string().email({ message: "Email is required" }),
  password: z.string().min(6, { message: "Minimum 6 characters required" }),
});

export const ResetPasswordSchema = z.object({
  email: z.string().email({ message: "Email is required" }),
});

export const NewPasswordSchema = z.object({
  password: z.string().min(6, { message: "Minimum 6 characters required" }),
  token: z.string().min(1, { message: "Token is required" }),
});

export const VerifyEmailSchema = z.object({
  token: z.string().min(1, { message: "Token is required" }),
});

export const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(1, { message: "Refresh token is required" }),
});

export const OAuthCodeSchema = z.object({
  code: z.string().min(1, { message: "Authorization code is required" }),
  redirectUri: z.string().url({ message: "Valid redirect URI is required" }),
});

// ── Record Schemas ──

export const CreateRecordSchema = z.object({
  site: z.string().optional(),
  icon: z.string().optional(),
  username: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  password: z.string().optional(),
});

export const UpdateRecordSchema = CreateRecordSchema.partial();

export const RecordQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  search: z.string().default(""),
  limit: z.coerce.number().int().positive().max(50).default(12),
});

// ── Settings Schema ──

export const UpdateSettingsSchema = z
  .object({
    name: z.string().min(1).optional(),
    email: z.string().email().optional(),
    isTwoFactorEnabled: z.boolean().optional(),
    password: z
      .union([z.string().min(6), z.string().length(0)])
      .optional()
      .transform((v) => (v === "" ? undefined : v)),
    newPassword: z
      .union([z.string().min(6), z.string().length(0)])
      .optional()
      .transform((v) => (v === "" ? undefined : v)),
  })
  .refine((data) => !(data.password && !data.newPassword), {
    message: "New password is required",
    path: ["newPassword"],
  })
  .refine((data) => !(data.newPassword && !data.password), {
    message: "Current password is required",
    path: ["password"],
  });
```

- [ ] **Step 5: Create packages/shared/src/types.ts**

```typescript
import type { z } from "zod";
import type {
  LoginSchema,
  SignupSchema,
  TwoFactorSchema,
  ResetPasswordSchema,
  NewPasswordSchema,
  VerifyEmailSchema,
  RefreshTokenSchema,
  OAuthCodeSchema,
  CreateRecordSchema,
  UpdateRecordSchema,
  RecordQuerySchema,
  UpdateSettingsSchema,
} from "./schemas.js";

// ── Request Types ──

export type LoginInput = z.infer<typeof LoginSchema>;
export type SignupInput = z.infer<typeof SignupSchema>;
export type TwoFactorInput = z.infer<typeof TwoFactorSchema>;
export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;
export type NewPasswordInput = z.infer<typeof NewPasswordSchema>;
export type VerifyEmailInput = z.infer<typeof VerifyEmailSchema>;
export type RefreshTokenInput = z.infer<typeof RefreshTokenSchema>;
export type OAuthCodeInput = z.infer<typeof OAuthCodeSchema>;
export type CreateRecordInput = z.infer<typeof CreateRecordSchema>;
export type UpdateRecordInput = z.infer<typeof UpdateRecordSchema>;
export type RecordQuery = z.infer<typeof RecordQuerySchema>;
export type UpdateSettingsInput = z.infer<typeof UpdateSettingsSchema>;

// ── Response Types ──

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface TwoFactorRequired {
  twoFactor: true;
  email: string;
}

export type LoginResponse = AuthTokens | TwoFactorRequired;

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  image: string | null;
  isOAuth: boolean;
  isTwoFactorEnabled: boolean;
  createdAt: string;
}

export interface Record {
  id: string;
  site: string | null;
  icon: string | null;
  email: string | null;
  username: string | null;
  password: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedRecords {
  records: Record[];
  resultsCount: number;
  totalCount: number;
  page: number;
  limit: number;
}

export interface ApiError {
  error: string;
}

export interface ApiSuccess {
  success: string;
}
```

- [ ] **Step 6: Create packages/shared/src/index.ts**

```typescript
export * from "./schemas.js";
export * from "./types.js";
```

- [ ] **Step 7: Install dependencies and build**

```bash
cd /c/Users/Nader/OneDrive/Documents/Projects/classified
bun install
cd packages/shared && bun run build
```

Expected: `packages/shared/dist/` created with `index.js`, `index.d.ts`.

- [ ] **Step 8: Commit**

```bash
cd /c/Users/Nader/OneDrive/Documents/Projects/classified
git add packages/shared/
git commit -m "feat: add shared package with Zod schemas and types"
```

---

### Task 3: Scaffold Hono API App

**Files:**
- Create: `apps/api/package.json`
- Create: `apps/api/tsconfig.json`
- Create: `apps/api/.env.example`
- Create: `apps/api/src/index.ts`
- Create: `apps/api/src/lib/prisma.ts`

- [ ] **Step 1: Create apps/api/package.json**

```json
{
  "name": "@classified/api",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc && node -e \"require('fs').cpSync('src/prisma', 'dist/prisma', {recursive: true})\" 2>/dev/null || true",
    "start": "node dist/index.js",
    "lint": "eslint src/",
    "type-check": "tsc --noEmit",
    "format:check": "prettier --check \"src/**/*.ts\"",
    "format": "prettier --write \"src/**/*.ts\"",
    "test": "vitest run",
    "test:watch": "vitest",
    "clean": "rm -rf dist",
    "db:generate": "prisma generate --schema=src/prisma/schema.prisma",
    "db:push": "prisma db push --schema=src/prisma/schema.prisma"
  },
  "dependencies": {
    "@classified/shared": "workspace:*",
    "@hono/node-server": "^1.14.1",
    "@prisma/client": "^6.6.0",
    "bcryptjs": "^2.4.3",
    "hono": "^4.7.7",
    "jose": "^6.0.11",
    "resend": "^4.5.1",
    "zod": "^3.24.4"
  },
  "devDependencies": {
    "@types/bcryptjs": "^2.4.6",
    "@types/node": "^22.15.3",
    "eslint": "^9.26.0",
    "prisma": "^6.6.0",
    "prettier": "^3.5.3",
    "tsx": "^4.19.4",
    "typescript": "^5.8.3",
    "vitest": "^3.1.3"
  }
}
```

- [ ] **Step 2: Create apps/api/tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "declaration": true,
    "sourceMap": true,
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist", "test"]
}
```

- [ ] **Step 3: Create apps/api/.env.example**

```bash
# Database
NEON_URL=postgresql://user:pass@host/db?sslmode=require

# Encryption
ENCRYPTION_KEY=generate-a-64-char-hex-string-here

# Auth
JWT_SECRET=your-jwt-secret-here

# OAuth
GOOGLE_ID=your-google-client-id
GOOGLE_SECRET=your-google-client-secret
GITHUB_ID=your-github-client-id
GITHUB_SECRET=your-github-client-secret

# Email
RESEND_API_KEY=your-resend-api-key
FROM_EMAIL=onboarding@resend.dev

# Cloudinary
CLOUDINARY_URL=https://api.cloudinary.com/v1_1/your-cloud/image/upload

# CORS
CORS_ORIGIN=http://localhost:5173
```

- [ ] **Step 4: Create apps/api/.env**

Copy `.env.example` and fill in real values from the project's existing `.env`:

```bash
# Database
NEON_URL=postgresql://neondb_owner:npg_W0FOz8QxYnqy@ep-jolly-queen-am37b9m2-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# Encryption (generate fresh)
ENCRYPTION_KEY=<run: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))">

# Auth
JWT_SECRET=<run: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))">

# OAuth
GOOGLE_ID=<your-google-client-id>
GOOGLE_SECRET=<your-google-client-secret>
GITHUB_ID=<your-github-client-id>
GITHUB_SECRET=<your-github-client-secret>

# Email
RESEND_API_KEY=<your-resend-api-key>
FROM_EMAIL=onboarding@resend.dev

# Cloudinary
CLOUDINARY_URL=https://api.cloudinary.com/v1_1/dqkyatgoy/image/upload

# CORS
CORS_ORIGIN=http://localhost:5173
```

**Important:** Generate `ENCRYPTION_KEY` and `JWT_SECRET` fresh by running the node commands above. Do NOT reuse existing secrets.

- [ ] **Step 5: Create apps/api/src/lib/prisma.ts**

```typescript
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
```

- [ ] **Step 6: Create apps/api/src/index.ts**

```typescript
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { serve } from "@hono/node-server";

const app = new Hono();

// Middleware
app.use("*", logger());
app.use(
  "*",
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  }),
);

// Health check
app.get("/health", (c) => c.json({ status: "ok" }));

// Dev server
if (process.env.NODE_ENV !== "production") {
  const port = parseInt(process.env.PORT || "3001", 10);
  console.log(`API server running on http://localhost:${port}`);
  serve({ fetch: app.fetch, port });
}

// Vercel serverless export
export default app;
```

- [ ] **Step 7: Install dependencies and verify**

```bash
cd /c/Users/Nader/OneDrive/Documents/Projects/classified
bun install
```

- [ ] **Step 8: Start the API and test health endpoint**

```bash
cd apps/api && bun run dev &
sleep 2
curl http://localhost:3001/health
```

Expected: `{"status":"ok"}`

Kill the dev server after verifying.

- [ ] **Step 9: Commit**

```bash
cd /c/Users/Nader/OneDrive/Documents/Projects/classified
git add apps/api/package.json apps/api/tsconfig.json apps/api/.env.example apps/api/src/ bun.lockb
git commit -m "feat: scaffold Hono API app with health endpoint"
```

---

### Task 4: Set Up Prisma PostgreSQL Schema

**Files:**
- Create: `apps/api/src/prisma/schema.prisma`

- [ ] **Step 1: Create apps/api/src/prisma/schema.prisma**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("NEON_URL")
}

model User {
  id                 String               @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  name               String
  email              String               @unique
  passwordHash       String?              @map("password_hash")
  image              String?
  emailVerifiedAt    DateTime?            @map("email_verified_at")
  isTwoFactorEnabled Boolean              @default(false) @map("is_two_factor_enabled")
  createdAt          DateTime             @default(now()) @map("created_at")
  updatedAt          DateTime             @updatedAt @map("updated_at")
  records            Record[]
  accounts           Account[]
  refreshTokens      RefreshToken[]

  @@map("users")
}

model Record {
  id                String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  site              String?
  icon              String?
  email             String?
  username          String?
  encryptedPassword String?  @map("encrypted_password")
  encryptionIv      String?  @map("encryption_iv")
  createdAt         DateTime @default(now()) @map("created_at")
  updatedAt         DateTime @updatedAt @map("updated_at")
  userId            String   @map("user_id") @db.Uuid
  user              User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@map("records")
}

model Account {
  id                String  @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  userId            String  @map("user_id") @db.Uuid
  provider          String
  providerAccountId String  @map("provider_account_id")
  accessToken       String? @map("access_token")
  refreshToken      String? @map("refresh_token")
  expiresAt         Int?    @map("expires_at")
  tokenType         String? @map("token_type")
  scope             String?
  idToken           String? @map("id_token")
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@map("accounts")
}

model RefreshToken {
  id        String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  userId    String    @map("user_id") @db.Uuid
  tokenHash String    @map("token_hash")
  expiresAt DateTime  @map("expires_at")
  createdAt DateTime  @default(now()) @map("created_at")
  revokedAt DateTime? @map("revoked_at")
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@map("refresh_tokens")
}

model VerificationToken {
  id        String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  email     String
  tokenHash String   @map("token_hash")
  expiresAt DateTime @map("expires_at")

  @@unique([email, tokenHash])
  @@map("verification_tokens")
}

model PasswordResetToken {
  id        String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  email     String
  tokenHash String   @map("token_hash")
  expiresAt DateTime @map("expires_at")

  @@unique([email, tokenHash])
  @@map("password_reset_tokens")
}

model TwoFactorToken {
  id        String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  email     String
  tokenHash String   @map("token_hash")
  expiresAt DateTime @map("expires_at")

  @@unique([email, tokenHash])
  @@map("two_factor_tokens")
}
```

- [ ] **Step 2: Generate Prisma client**

```bash
cd /c/Users/Nader/OneDrive/Documents/Projects/classified/apps/api
bunx prisma generate --schema=src/prisma/schema.prisma
```

Expected: "Prisma Client generated successfully"

- [ ] **Step 3: Push schema to Neon database**

```bash
cd /c/Users/Nader/OneDrive/Documents/Projects/classified/apps/api
bunx prisma db push --schema=src/prisma/schema.prisma
```

Expected: Tables created in Neon PostgreSQL. Verify with:

```bash
bunx prisma studio --schema=src/prisma/schema.prisma
```

- [ ] **Step 4: Commit**

```bash
cd /c/Users/Nader/OneDrive/Documents/Projects/classified
git add apps/api/src/prisma/schema.prisma
git commit -m "feat: add PostgreSQL Prisma schema for Neon"
```

---

### Task 5: Implement Encryption Utilities

**Files:**
- Create: `apps/api/src/lib/encryption.ts`
- Create: `apps/api/vitest.config.ts`
- Create: `apps/api/test/setup.ts`
- Create: `apps/api/test/lib/encryption.test.ts`

- [ ] **Step 1: Create apps/api/vitest.config.ts**

```typescript
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["./test/setup.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
```

- [ ] **Step 2: Create apps/api/test/setup.ts**

```typescript
process.env.ENCRYPTION_KEY = "a".repeat(64); // 32 bytes as hex for testing
process.env.JWT_SECRET = "test-jwt-secret-that-is-long-enough-for-hs256";
process.env.NEON_URL = "postgresql://test:test@localhost:5432/test";
process.env.CORS_ORIGIN = "http://localhost:5173";
process.env.FROM_EMAIL = "test@test.com";
process.env.RESEND_API_KEY = "re_test_key";
```

- [ ] **Step 3: Write the failing test for encryption**

Create `apps/api/test/lib/encryption.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { encrypt, decrypt } from "@/lib/encryption.js";

describe("encryption", () => {
  it("encrypts and decrypts a password correctly", () => {
    const plaintext = "MyS3cur3P@ssw0rd!";
    const { encryptedPassword, iv } = encrypt(plaintext);

    expect(encryptedPassword).toBeDefined();
    expect(iv).toBeDefined();
    expect(encryptedPassword).not.toBe(plaintext);

    const decrypted = decrypt(encryptedPassword, iv);
    expect(decrypted).toBe(plaintext);
  });

  it("produces different ciphertexts for the same plaintext", () => {
    const plaintext = "SamePassword";
    const result1 = encrypt(plaintext);
    const result2 = encrypt(plaintext);

    expect(result1.encryptedPassword).not.toBe(result2.encryptedPassword);
    expect(result1.iv).not.toBe(result2.iv);
  });

  it("fails to decrypt with wrong IV", () => {
    const { encryptedPassword } = encrypt("test");
    const { iv: wrongIv } = encrypt("other");

    expect(() => decrypt(encryptedPassword, wrongIv)).toThrow();
  });

  it("handles unicode and special characters", () => {
    const plaintext = "p@$$wörd🔒中文";
    const { encryptedPassword, iv } = encrypt(plaintext);
    expect(decrypt(encryptedPassword, iv)).toBe(plaintext);
  });
});
```

- [ ] **Step 4: Run test to verify it fails**

```bash
cd /c/Users/Nader/OneDrive/Documents/Projects/classified/apps/api
bunx vitest run test/lib/encryption.test.ts
```

Expected: FAIL — module `@/lib/encryption.js` not found.

- [ ] **Step 5: Implement encryption**

Create `apps/api/src/lib/encryption.ts`:

```typescript
import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;

function getKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;
  if (!key || key.length !== 64) {
    throw new Error("ENCRYPTION_KEY must be a 64-character hex string (32 bytes)");
  }
  return Buffer.from(key, "hex");
}

export function encrypt(plaintext: string): { encryptedPassword: string; iv: string } {
  const key = getKey();
  const iv = randomBytes(IV_LENGTH);

  const cipher = createCipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  // Store as: authTag + ciphertext (both base64 encoded together)
  const combined = Buffer.concat([authTag, encrypted]);

  return {
    encryptedPassword: combined.toString("base64"),
    iv: iv.toString("base64"),
  };
}

export function decrypt(encryptedPassword: string, iv: string): string {
  const key = getKey();
  const ivBuffer = Buffer.from(iv, "base64");
  const combined = Buffer.from(encryptedPassword, "base64");

  // Extract authTag (first 16 bytes) and ciphertext (rest)
  const authTag = combined.subarray(0, AUTH_TAG_LENGTH);
  const ciphertext = combined.subarray(AUTH_TAG_LENGTH);

  const decipher = createDecipheriv(ALGORITHM, key, ivBuffer, { authTagLength: AUTH_TAG_LENGTH });
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return decrypted.toString("utf8");
}
```

- [ ] **Step 6: Run test to verify it passes**

```bash
cd /c/Users/Nader/OneDrive/Documents/Projects/classified/apps/api
bunx vitest run test/lib/encryption.test.ts
```

Expected: 4 tests PASS.

- [ ] **Step 7: Commit**

```bash
cd /c/Users/Nader/OneDrive/Documents/Projects/classified
git add apps/api/src/lib/encryption.ts apps/api/test/ apps/api/vitest.config.ts
git commit -m "feat: add AES-256-GCM encryption with tests"
```

---

### Task 6: Implement JWT Utilities

**Files:**
- Create: `apps/api/src/lib/jwt.ts`
- Create: `apps/api/test/lib/jwt.test.ts`

- [ ] **Step 1: Write failing tests**

Create `apps/api/test/lib/jwt.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { signAccessToken, verifyAccessToken, generateRefreshToken } from "@/lib/jwt.js";

describe("JWT utilities", () => {
  const payload = { sub: "user-123", email: "test@test.com" };

  it("signs and verifies an access token", async () => {
    const token = await signAccessToken(payload);
    expect(token).toBeDefined();
    expect(typeof token).toBe("string");

    const decoded = await verifyAccessToken(token);
    expect(decoded.sub).toBe("user-123");
    expect(decoded.email).toBe("test@test.com");
  });

  it("rejects an expired token", async () => {
    const token = await signAccessToken(payload, "0s");
    // Small delay to ensure expiry
    await new Promise((r) => setTimeout(r, 50));
    await expect(verifyAccessToken(token)).rejects.toThrow();
  });

  it("rejects a tampered token", async () => {
    const token = await signAccessToken(payload);
    const tampered = token.slice(0, -5) + "XXXXX";
    await expect(verifyAccessToken(tampered)).rejects.toThrow();
  });

  it("generates a random refresh token", () => {
    const token1 = generateRefreshToken();
    const token2 = generateRefreshToken();
    expect(token1).toHaveLength(64); // 32 bytes hex
    expect(token1).not.toBe(token2);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd /c/Users/Nader/OneDrive/Documents/Projects/classified/apps/api
bunx vitest run test/lib/jwt.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement JWT utilities**

Create `apps/api/src/lib/jwt.ts`:

```typescript
import { SignJWT, jwtVerify } from "jose";
import { randomBytes } from "node:crypto";

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set");
  return new TextEncoder().encode(secret);
}

export interface AccessTokenPayload {
  sub: string;
  email: string;
}

export async function signAccessToken(
  payload: AccessTokenPayload,
  expiresIn = "15m",
): Promise<string> {
  return new SignJWT({ email: payload.email })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(getSecret());
}

export async function verifyAccessToken(token: string): Promise<AccessTokenPayload> {
  const { payload } = await jwtVerify(token, getSecret());
  if (!payload.sub || !payload.email) {
    throw new Error("Invalid token payload");
  }
  return { sub: payload.sub, email: payload.email as string };
}

export function generateRefreshToken(): string {
  return randomBytes(32).toString("hex");
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd /c/Users/Nader/OneDrive/Documents/Projects/classified/apps/api
bunx vitest run test/lib/jwt.test.ts
```

Expected: 4 tests PASS.

- [ ] **Step 5: Commit**

```bash
cd /c/Users/Nader/OneDrive/Documents/Projects/classified
git add apps/api/src/lib/jwt.ts apps/api/test/lib/jwt.test.ts
git commit -m "feat: add JWT sign/verify utilities with tests"
```

---

### Task 7: Implement Password Utilities and Email Service

**Files:**
- Create: `apps/api/src/utils/password.ts`
- Create: `apps/api/src/lib/mail.ts`
- Create: `apps/api/src/lib/tokens.ts`

- [ ] **Step 1: Create apps/api/src/utils/password.ts**

```typescript
import bcrypt from "bcryptjs";

const SALT_ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
```

- [ ] **Step 2: Create apps/api/src/lib/mail.ts**

```typescript
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

function getFromEmail(): string {
  const from = process.env.FROM_EMAIL;
  if (!from) throw new Error("FROM_EMAIL is not set");
  return from;
}

export async function sendVerificationEmail(email: string, token: string): Promise<void> {
  const confirmLink = `${process.env.CORS_ORIGIN}/verify-email?token=${token}`;
  await resend.emails.send({
    from: getFromEmail(),
    to: email,
    subject: "Confirm your email",
    html: `<p>Click <a href="${confirmLink}">here</a> to confirm your email.</p>`,
  });
}

export async function sendPasswordResetEmail(email: string, token: string): Promise<void> {
  const resetLink = `${process.env.CORS_ORIGIN}/new-password?token=${token}`;
  await resend.emails.send({
    from: getFromEmail(),
    to: email,
    subject: "Reset your password",
    html: `<p>Click <a href="${resetLink}">here</a> to reset your password.</p>`,
  });
}

export async function sendTwoFactorEmail(email: string, code: string): Promise<void> {
  await resend.emails.send({
    from: getFromEmail(),
    to: email,
    subject: "Your two-factor authentication code",
    html: `<p>Your confirmation code: <strong>${code}</strong></p>`,
  });
}
```

- [ ] **Step 3: Create apps/api/src/lib/tokens.ts**

```typescript
import { randomBytes, randomInt } from "node:crypto";
import { hashPassword } from "@/utils/password.js";
import { prisma } from "./prisma.js";

async function hashToken(token: string): Promise<string> {
  return hashPassword(token);
}

export async function generateVerificationToken(email: string) {
  const token = randomBytes(32).toString("hex");
  const tokenHash = await hashToken(token);
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  // Delete existing tokens for this email
  await prisma.verificationToken.deleteMany({ where: { email } });

  await prisma.verificationToken.create({
    data: { email, tokenHash, expiresAt },
  });

  return { email, token }; // Return raw token (sent via email), hash is in DB
}

export async function generatePasswordResetToken(email: string) {
  const token = randomBytes(32).toString("hex");
  const tokenHash = await hashToken(token);
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await prisma.passwordResetToken.deleteMany({ where: { email } });

  await prisma.passwordResetToken.create({
    data: { email, tokenHash, expiresAt },
  });

  return { email, token };
}

export async function generateTwoFactorToken(email: string) {
  const code = randomInt(100_000, 1_000_000).toString();
  const tokenHash = await hashToken(code);
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  await prisma.twoFactorToken.deleteMany({ where: { email } });

  await prisma.twoFactorToken.create({
    data: { email, tokenHash, expiresAt },
  });

  return { email, code }; // Return raw code (sent via email)
}
```

- [ ] **Step 4: Commit**

```bash
cd /c/Users/Nader/OneDrive/Documents/Projects/classified
git add apps/api/src/utils/password.ts apps/api/src/lib/mail.ts apps/api/src/lib/tokens.ts
git commit -m "feat: add password utils, email service, and token generation"
```

---

### Task 8: Implement Auth Middleware

**Files:**
- Create: `apps/api/src/middleware/auth.ts`
- Create: `apps/api/test/middleware/auth.test.ts`

- [ ] **Step 1: Write failing tests**

Create `apps/api/test/middleware/auth.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { Hono } from "hono";
import { authMiddleware } from "@/middleware/auth.js";
import { signAccessToken } from "@/lib/jwt.js";

function createTestApp() {
  const app = new Hono();
  app.use("/protected/*", authMiddleware);
  app.get("/protected/test", (c) => {
    const userId = c.get("userId");
    return c.json({ userId });
  });
  return app;
}

describe("auth middleware", () => {
  it("rejects requests without Authorization header", async () => {
    const app = createTestApp();
    const res = await app.request("/protected/test");
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe("Authorization header required");
  });

  it("rejects requests with invalid token", async () => {
    const app = createTestApp();
    const res = await app.request("/protected/test", {
      headers: { Authorization: "Bearer invalid-token" },
    });
    expect(res.status).toBe(401);
  });

  it("allows requests with valid token and sets userId", async () => {
    const app = createTestApp();
    const token = await signAccessToken({ sub: "user-abc", email: "test@test.com" });
    const res = await app.request("/protected/test", {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.userId).toBe("user-abc");
  });

  it("rejects expired tokens", async () => {
    const app = createTestApp();
    const token = await signAccessToken({ sub: "user-abc", email: "test@test.com" }, "0s");
    await new Promise((r) => setTimeout(r, 50));
    const res = await app.request("/protected/test", {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status).toBe(401);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd /c/Users/Nader/OneDrive/Documents/Projects/classified/apps/api
bunx vitest run test/middleware/auth.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Implement auth middleware**

Create `apps/api/src/middleware/auth.ts`:

```typescript
import type { Context, Next } from "hono";
import { verifyAccessToken } from "@/lib/jwt.js";

// Extend Hono's context variables
declare module "hono" {
  interface ContextVariableMap {
    userId: string;
    userEmail: string;
  }
}

export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header("Authorization");
  if (!authHeader) {
    return c.json({ error: "Authorization header required" }, 401);
  }

  const token = authHeader.replace("Bearer ", "");
  if (!token || token === authHeader) {
    return c.json({ error: "Bearer token required" }, 401);
  }

  try {
    const payload = await verifyAccessToken(token);
    c.set("userId", payload.sub);
    c.set("userEmail", payload.email);
    await next();
  } catch {
    return c.json({ error: "Invalid or expired token" }, 401);
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd /c/Users/Nader/OneDrive/Documents/Projects/classified/apps/api
bunx vitest run test/middleware/auth.test.ts
```

Expected: 4 tests PASS.

- [ ] **Step 5: Commit**

```bash
cd /c/Users/Nader/OneDrive/Documents/Projects/classified
git add apps/api/src/middleware/auth.ts apps/api/test/middleware/auth.test.ts
git commit -m "feat: add JWT auth middleware with tests"
```

---

### Task 9: Implement Auth Routes

**Files:**
- Create: `apps/api/src/routes/auth.ts`
- Create: `apps/api/test/helpers.ts`
- Create: `apps/api/test/routes/auth.test.ts`

This is the largest task. It implements all auth endpoints: signup, login, 2FA, refresh, logout, verify-email, reset-password, new-password.

- [ ] **Step 1: Create test helpers**

Create `apps/api/test/helpers.ts`:

```typescript
import { prisma } from "@/lib/prisma.js";
import { hashPassword } from "@/utils/password.js";

export async function createTestUser(overrides: Partial<{
  name: string;
  email: string;
  password: string;
  emailVerifiedAt: Date | null;
  isTwoFactorEnabled: boolean;
}> = {}) {
  const password = overrides.password || "Test123!";
  const passwordHash = await hashPassword(password);

  return prisma.user.create({
    data: {
      name: overrides.name || "Test User",
      email: overrides.email || `test-${Date.now()}@test.com`,
      passwordHash,
      emailVerifiedAt: overrides.emailVerifiedAt ?? new Date(),
      isTwoFactorEnabled: overrides.isTwoFactorEnabled ?? false,
    },
  });
}

export async function cleanupTestData() {
  await prisma.twoFactorToken.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.verificationToken.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.record.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();
}
```

- [ ] **Step 2: Implement auth routes**

Create `apps/api/src/routes/auth.ts`:

```typescript
import { Hono } from "hono";
import {
  LoginSchema,
  SignupSchema,
  TwoFactorSchema,
  RefreshTokenSchema,
  VerifyEmailSchema,
  ResetPasswordSchema,
  NewPasswordSchema,
  OAuthCodeSchema,
} from "@classified/shared";
import { prisma } from "@/lib/prisma.js";
import { hashPassword, comparePassword } from "@/utils/password.js";
import { signAccessToken, generateRefreshToken } from "@/lib/jwt.js";
import {
  generateVerificationToken,
  generatePasswordResetToken,
  generateTwoFactorToken,
} from "@/lib/tokens.js";
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendTwoFactorEmail,
} from "@/lib/mail.js";

const auth = new Hono();

// ── Helpers ──

async function createTokenPair(userId: string, email: string) {
  const accessToken = await signAccessToken({ sub: userId, email });
  const refreshToken = generateRefreshToken();
  const refreshTokenHash = await hashPassword(refreshToken);

  await prisma.refreshToken.create({
    data: {
      userId,
      tokenHash: refreshTokenHash,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
  });

  return { accessToken, refreshToken };
}

// ── POST /auth/signup ──

auth.post("/signup", async (c) => {
  const body = await c.req.json();
  const parsed = SignupSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "Invalid fields", details: parsed.error.flatten() }, 400);
  }

  const { name, email, password } = parsed.data;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser?.emailVerifiedAt) {
    return c.json({ error: "Email already in use" }, 409);
  }

  // If user exists but not verified, delete and re-create
  if (existingUser) {
    await prisma.user.delete({ where: { id: existingUser.id } });
  }

  const passwordHash = await hashPassword(password);
  await prisma.user.create({
    data: { name, email, passwordHash },
  });

  const { token } = await generateVerificationToken(email);
  await sendVerificationEmail(email, token);

  return c.json({ success: "Confirmation email sent" }, 201);
});

// ── POST /auth/login ──

auth.post("/login", async (c) => {
  const body = await c.req.json();
  const parsed = LoginSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "Invalid fields" }, 400);
  }

  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.passwordHash) {
    return c.json({ error: "Invalid credentials" }, 401);
  }

  const passwordValid = await comparePassword(password, user.passwordHash);
  if (!passwordValid) {
    return c.json({ error: "Invalid credentials" }, 401);
  }

  if (!user.emailVerifiedAt) {
    const { token } = await generateVerificationToken(email);
    await sendVerificationEmail(email, token);
    return c.json({ error: "Email not verified. Confirmation email sent." }, 403);
  }

  if (user.isTwoFactorEnabled) {
    const { code } = await generateTwoFactorToken(email);
    await sendTwoFactorEmail(email, code);
    return c.json({ twoFactor: true, email }, 200);
  }

  const tokens = await createTokenPair(user.id, user.email);
  return c.json(tokens, 200);
});

// ── POST /auth/two-factor ──

auth.post("/two-factor", async (c) => {
  const body = await c.req.json();
  const parsed = TwoFactorSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "Invalid fields" }, 400);
  }

  const { email, code } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return c.json({ error: "Invalid request" }, 400);
  }

  // Find all tokens for this email and check code against each hash
  const tokens = await prisma.twoFactorToken.findMany({ where: { email } });
  let validToken = null;

  for (const t of tokens) {
    const isValid = await comparePassword(code, t.tokenHash);
    if (isValid) {
      validToken = t;
      break;
    }
  }

  if (!validToken) {
    return c.json({ error: "Invalid code" }, 401);
  }

  if (new Date() > validToken.expiresAt) {
    await prisma.twoFactorToken.delete({ where: { id: validToken.id } });
    return c.json({ error: "Code expired" }, 401);
  }

  await prisma.twoFactorToken.delete({ where: { id: validToken.id } });

  const authTokens = await createTokenPair(user.id, user.email);
  return c.json(authTokens, 200);
});

// ── POST /auth/refresh ──

auth.post("/refresh", async (c) => {
  const body = await c.req.json();
  const parsed = RefreshTokenSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "Refresh token required" }, 400);
  }

  const { refreshToken } = parsed.data;

  // Find all non-revoked, non-expired refresh tokens
  const storedTokens = await prisma.refreshToken.findMany({
    where: { revokedAt: null, expiresAt: { gt: new Date() } },
    include: { user: true },
  });

  let matchedToken = null;
  for (const stored of storedTokens) {
    const isValid = await comparePassword(refreshToken, stored.tokenHash);
    if (isValid) {
      matchedToken = stored;
      break;
    }
  }

  if (!matchedToken) {
    return c.json({ error: "Invalid refresh token" }, 401);
  }

  const accessToken = await signAccessToken({
    sub: matchedToken.user.id,
    email: matchedToken.user.email,
  });

  return c.json({ accessToken }, 200);
});

// ── POST /auth/logout ──

auth.post("/logout", async (c) => {
  const body = await c.req.json();
  const parsed = RefreshTokenSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "Refresh token required" }, 400);
  }

  const { refreshToken } = parsed.data;

  // Find and revoke the matching token
  const storedTokens = await prisma.refreshToken.findMany({
    where: { revokedAt: null },
  });

  for (const stored of storedTokens) {
    const isValid = await comparePassword(refreshToken, stored.tokenHash);
    if (isValid) {
      await prisma.refreshToken.update({
        where: { id: stored.id },
        data: { revokedAt: new Date() },
      });
      break;
    }
  }

  return c.json({ success: "Logged out" }, 200);
});

// ── POST /auth/verify-email ──

auth.post("/verify-email", async (c) => {
  const body = await c.req.json();
  const parsed = VerifyEmailSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "Token required" }, 400);
  }

  const { token } = parsed.data;

  // Find matching verification token
  const verificationTokens = await prisma.verificationToken.findMany();
  let matchedToken = null;

  for (const vt of verificationTokens) {
    const isValid = await comparePassword(token, vt.tokenHash);
    if (isValid) {
      matchedToken = vt;
      break;
    }
  }

  if (!matchedToken) {
    return c.json({ error: "Invalid token" }, 400);
  }

  if (new Date() > matchedToken.expiresAt) {
    await prisma.verificationToken.delete({ where: { id: matchedToken.id } });
    return c.json({ error: "Token expired" }, 400);
  }

  const user = await prisma.user.findUnique({ where: { email: matchedToken.email } });
  if (!user) {
    return c.json({ error: "User not found" }, 400);
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { emailVerifiedAt: new Date(), email: matchedToken.email },
    }),
    prisma.verificationToken.delete({ where: { id: matchedToken.id } }),
  ]);

  return c.json({ success: "Email verified" }, 200);
});

// ── POST /auth/reset-password ──

auth.post("/reset-password", async (c) => {
  const body = await c.req.json();
  const parsed = ResetPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "Invalid email" }, 400);
  }

  const { email } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    // Don't reveal whether email exists
    return c.json({ success: "If the email exists, a reset link has been sent" }, 200);
  }

  const { token } = await generatePasswordResetToken(email);
  await sendPasswordResetEmail(email, token);

  return c.json({ success: "If the email exists, a reset link has been sent" }, 200);
});

// ── POST /auth/new-password ──

auth.post("/new-password", async (c) => {
  const body = await c.req.json();
  const parsed = NewPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "Invalid fields" }, 400);
  }

  const { password, token } = parsed.data;

  // Find matching reset token
  const resetTokens = await prisma.passwordResetToken.findMany();
  let matchedToken = null;

  for (const rt of resetTokens) {
    const isValid = await comparePassword(token, rt.tokenHash);
    if (isValid) {
      matchedToken = rt;
      break;
    }
  }

  if (!matchedToken) {
    return c.json({ error: "Invalid token" }, 400);
  }

  if (new Date() > matchedToken.expiresAt) {
    await prisma.passwordResetToken.delete({ where: { id: matchedToken.id } });
    return c.json({ error: "Token expired" }, 400);
  }

  const user = await prisma.user.findUnique({ where: { email: matchedToken.email } });
  if (!user) {
    return c.json({ error: "User not found" }, 400);
  }

  const passwordHash = await hashPassword(password);

  await prisma.$transaction([
    prisma.user.update({ where: { id: user.id }, data: { passwordHash } }),
    prisma.passwordResetToken.delete({ where: { id: matchedToken.id } }),
  ]);

  return c.json({ success: "Password updated" }, 200);
});

// ── POST /auth/google ──

auth.post("/google", async (c) => {
  const body = await c.req.json();
  const parsed = OAuthCodeSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "Invalid fields" }, 400);
  }

  const { code, redirectUri } = parsed.data;

  // Exchange code for tokens with Google
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      code,
      client_id: process.env.GOOGLE_ID,
      client_secret: process.env.GOOGLE_SECRET,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  if (!tokenRes.ok) {
    return c.json({ error: "Failed to exchange Google auth code" }, 400);
  }

  const tokenData = await tokenRes.json();

  // Get user info from Google
  const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });

  if (!userInfoRes.ok) {
    return c.json({ error: "Failed to get Google user info" }, 400);
  }

  const googleUser = (await userInfoRes.json()) as {
    id: string;
    email: string;
    name: string;
    picture: string;
  };

  // Find or create user
  let user = await prisma.user.findUnique({ where: { email: googleUser.email } });

  if (!user) {
    user = await prisma.user.create({
      data: {
        name: googleUser.name,
        email: googleUser.email,
        image: googleUser.picture,
        emailVerifiedAt: new Date(),
      },
    });
  } else if (!user.emailVerifiedAt) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: { emailVerifiedAt: new Date() },
    });
  }

  // Upsert OAuth account link
  await prisma.account.upsert({
    where: {
      provider_providerAccountId: {
        provider: "google",
        providerAccountId: googleUser.id,
      },
    },
    create: {
      userId: user.id,
      provider: "google",
      providerAccountId: googleUser.id,
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresAt: tokenData.expires_in
        ? Math.floor(Date.now() / 1000) + tokenData.expires_in
        : null,
      tokenType: tokenData.token_type,
      idToken: tokenData.id_token,
      scope: tokenData.scope,
    },
    update: {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
    },
  });

  const tokens = await createTokenPair(user.id, user.email);
  return c.json(tokens, 200);
});

// ── POST /auth/github ──

auth.post("/github", async (c) => {
  const body = await c.req.json();
  const parsed = OAuthCodeSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "Invalid fields" }, 400);
  }

  const { code, redirectUri } = parsed.data;

  // Exchange code for token with GitHub
  const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      code,
      client_id: process.env.GITHUB_ID,
      client_secret: process.env.GITHUB_SECRET,
      redirect_uri: redirectUri,
    }),
  });

  if (!tokenRes.ok) {
    return c.json({ error: "Failed to exchange GitHub auth code" }, 400);
  }

  const tokenData = await tokenRes.json();

  if (tokenData.error) {
    return c.json({ error: "GitHub auth failed" }, 400);
  }

  // Get user info from GitHub
  const userInfoRes = await fetch("https://api.github.com/user", {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });

  if (!userInfoRes.ok) {
    return c.json({ error: "Failed to get GitHub user info" }, 400);
  }

  const githubUser = (await userInfoRes.json()) as {
    id: number;
    email: string | null;
    name: string | null;
    avatar_url: string;
  };

  // If GitHub doesn't return email, fetch from emails endpoint
  let email = githubUser.email;
  if (!email) {
    const emailsRes = await fetch("https://api.github.com/user/emails", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    if (emailsRes.ok) {
      const emails = (await emailsRes.json()) as Array<{
        email: string;
        primary: boolean;
        verified: boolean;
      }>;
      const primary = emails.find((e) => e.primary && e.verified);
      email = primary?.email || emails[0]?.email || null;
    }
  }

  if (!email) {
    return c.json({ error: "Could not retrieve email from GitHub" }, 400);
  }

  // Find or create user
  let user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    user = await prisma.user.create({
      data: {
        name: githubUser.name || email.split("@")[0],
        email,
        image: githubUser.avatar_url,
        emailVerifiedAt: new Date(),
      },
    });
  } else if (!user.emailVerifiedAt) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: { emailVerifiedAt: new Date() },
    });
  }

  // Upsert OAuth account link
  await prisma.account.upsert({
    where: {
      provider_providerAccountId: {
        provider: "github",
        providerAccountId: githubUser.id.toString(),
      },
    },
    create: {
      userId: user.id,
      provider: "github",
      providerAccountId: githubUser.id.toString(),
      accessToken: tokenData.access_token,
      tokenType: tokenData.token_type,
      scope: tokenData.scope,
    },
    update: {
      accessToken: tokenData.access_token,
    },
  });

  const tokens = await createTokenPair(user.id, user.email);
  return c.json(tokens, 200);
});

export { auth as authRoutes };
```

- [ ] **Step 3: Wire auth routes into the main app**

Update `apps/api/src/index.ts`:

```typescript
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { serve } from "@hono/node-server";
import { authRoutes } from "@/routes/auth.js";

const app = new Hono();

// Middleware
app.use("*", logger());
app.use(
  "*",
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  }),
);

// Health check
app.get("/health", (c) => c.json({ status: "ok" }));

// Routes
app.route("/auth", authRoutes);

// Dev server
if (process.env.NODE_ENV !== "production") {
  const port = parseInt(process.env.PORT || "3001", 10);
  console.log(`API server running on http://localhost:${port}`);
  serve({ fetch: app.fetch, port });
}

export default app;
```

- [ ] **Step 4: Commit**

```bash
cd /c/Users/Nader/OneDrive/Documents/Projects/classified
git add apps/api/src/routes/auth.ts apps/api/src/index.ts apps/api/test/helpers.ts
git commit -m "feat: implement auth routes (signup, login, 2FA, OAuth, tokens)"
```

---

### Task 10: Implement Ownership Middleware and Records Routes

**Files:**
- Create: `apps/api/src/middleware/ownership.ts`
- Create: `apps/api/src/routes/records.ts`
- Create: `apps/api/test/routes/records.test.ts`

- [ ] **Step 1: Create ownership middleware**

Create `apps/api/src/middleware/ownership.ts`:

```typescript
import type { Context, Next } from "hono";
import { prisma } from "@/lib/prisma.js";

export async function ownershipMiddleware(c: Context, next: Next) {
  const recordId = c.req.param("id");
  if (!recordId) {
    await next();
    return;
  }

  const userId = c.get("userId");
  const record = await prisma.record.findUnique({ where: { id: recordId } });

  if (!record) {
    return c.json({ error: "Record not found" }, 404);
  }

  if (record.userId !== userId) {
    return c.json({ error: "Record not found" }, 404); // Don't reveal existence
  }

  c.set("record" as never, record as never);
  await next();
}
```

- [ ] **Step 2: Implement records routes**

Create `apps/api/src/routes/records.ts`:

```typescript
import { Hono } from "hono";
import { CreateRecordSchema, UpdateRecordSchema, RecordQuerySchema } from "@classified/shared";
import { prisma } from "@/lib/prisma.js";
import { encrypt, decrypt } from "@/lib/encryption.js";
import { authMiddleware } from "@/middleware/auth.js";
import { ownershipMiddleware } from "@/middleware/ownership.js";
import type { Record as PrismaRecord } from "@prisma/client";

const records = new Hono();

// All routes require authentication
records.use("*", authMiddleware);

// Ownership check on routes with :id param
records.use("/:id", ownershipMiddleware);
records.use("/:id/*", ownershipMiddleware);

function decryptRecord(record: PrismaRecord) {
  return {
    id: record.id,
    site: record.site,
    icon: record.icon,
    email: record.email,
    username: record.username,
    password:
      record.encryptedPassword && record.encryptionIv
        ? decrypt(record.encryptedPassword, record.encryptionIv)
        : null,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

// ── GET /records ──

records.get("/", async (c) => {
  const userId = c.get("userId");
  const query = RecordQuerySchema.safeParse({
    page: c.req.query("page"),
    search: c.req.query("search"),
    limit: c.req.query("limit"),
  });

  if (!query.success) {
    return c.json({ error: "Invalid query parameters" }, 400);
  }

  const { page, search, limit } = query.data;

  const where = {
    userId,
    ...(search
      ? { site: { contains: search, mode: "insensitive" as const } }
      : {}),
  };

  const [dbRecords, resultsCount, totalCount] = await Promise.all([
    prisma.record.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: (page - 1) * limit,
    }),
    prisma.record.count({ where }),
    prisma.record.count({ where: { userId } }),
  ]);

  return c.json({
    records: dbRecords.map(decryptRecord),
    resultsCount,
    totalCount,
    page,
    limit,
  });
});

// ── GET /records/:id ──

records.get("/:id", async (c) => {
  const record = c.get("record" as never) as PrismaRecord;
  return c.json(decryptRecord(record));
});

// ── POST /records ──

records.post("/", async (c) => {
  const userId = c.get("userId");
  const body = await c.req.json();
  const parsed = CreateRecordSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: "Invalid fields", details: parsed.error.flatten() }, 400);
  }

  const { password, ...rest } = parsed.data;

  let encryptedPassword: string | null = null;
  let encryptionIv: string | null = null;

  if (password) {
    const encrypted = encrypt(password);
    encryptedPassword = encrypted.encryptedPassword;
    encryptionIv = encrypted.iv;
  }

  const record = await prisma.record.create({
    data: {
      ...rest,
      encryptedPassword,
      encryptionIv,
      userId,
    },
  });

  return c.json(decryptRecord(record), 201);
});

// ── PUT /records/:id ──

records.put("/:id", async (c) => {
  const recordId = c.req.param("id");
  const body = await c.req.json();
  const parsed = UpdateRecordSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: "Invalid fields", details: parsed.error.flatten() }, 400);
  }

  const { password, ...rest } = parsed.data;

  const updateData: Record<string, unknown> = { ...rest };

  if (password !== undefined) {
    if (password) {
      const encrypted = encrypt(password);
      updateData.encryptedPassword = encrypted.encryptedPassword;
      updateData.encryptionIv = encrypted.iv;
    } else {
      updateData.encryptedPassword = null;
      updateData.encryptionIv = null;
    }
  }

  const record = await prisma.record.update({
    where: { id: recordId },
    data: updateData,
  });

  return c.json(decryptRecord(record));
});

// ── DELETE /records/:id ──

records.delete("/:id", async (c) => {
  const recordId = c.req.param("id");
  await prisma.record.delete({ where: { id: recordId } });
  return c.json({ success: "Record deleted" });
});

export { records as recordsRoutes };
```

- [ ] **Step 3: Wire records routes into main app**

Update `apps/api/src/index.ts` — add after the auth route:

```typescript
import { recordsRoutes } from "@/routes/records.js";
// ... existing code ...
app.route("/records", recordsRoutes);
```

Full updated `apps/api/src/index.ts`:

```typescript
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { serve } from "@hono/node-server";
import { authRoutes } from "@/routes/auth.js";
import { recordsRoutes } from "@/routes/records.js";

const app = new Hono();

// Middleware
app.use("*", logger());
app.use(
  "*",
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  }),
);

// Health check
app.get("/health", (c) => c.json({ status: "ok" }));

// Routes
app.route("/auth", authRoutes);
app.route("/records", recordsRoutes);

// Dev server
if (process.env.NODE_ENV !== "production") {
  const port = parseInt(process.env.PORT || "3001", 10);
  console.log(`API server running on http://localhost:${port}`);
  serve({ fetch: app.fetch, port });
}

export default app;
```

- [ ] **Step 4: Commit**

```bash
cd /c/Users/Nader/OneDrive/Documents/Projects/classified
git add apps/api/src/middleware/ownership.ts apps/api/src/routes/records.ts apps/api/src/index.ts
git commit -m "feat: implement records CRUD with encryption and ownership check"
```

---

### Task 11: Implement User Routes

**Files:**
- Create: `apps/api/src/routes/user.ts`

- [ ] **Step 1: Implement user routes**

Create `apps/api/src/routes/user.ts`:

```typescript
import { Hono } from "hono";
import { UpdateSettingsSchema } from "@classified/shared";
import { prisma } from "@/lib/prisma.js";
import { authMiddleware } from "@/middleware/auth.js";
import { hashPassword, comparePassword } from "@/utils/password.js";
import { generateVerificationToken } from "@/lib/tokens.js";
import { sendVerificationEmail } from "@/lib/mail.js";

const user = new Hono();

user.use("*", authMiddleware);

// ── GET /user/me ──

user.get("/me", async (c) => {
  const userId = c.get("userId");

  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
    include: { accounts: { select: { provider: true } } },
  });

  if (!dbUser) {
    return c.json({ error: "User not found" }, 404);
  }

  return c.json({
    id: dbUser.id,
    name: dbUser.name,
    email: dbUser.email,
    image: dbUser.image,
    isOAuth: dbUser.accounts.length > 0,
    isTwoFactorEnabled: dbUser.isTwoFactorEnabled,
    createdAt: dbUser.createdAt.toISOString(),
  });
});

// ── PUT /user/settings ──

user.put("/settings", async (c) => {
  const userId = c.get("userId");
  const body = await c.req.json();
  const parsed = UpdateSettingsSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: "Invalid fields", details: parsed.error.flatten() }, 400);
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
    include: { accounts: { select: { provider: true } } },
  });

  if (!dbUser) {
    return c.json({ error: "User not found" }, 404);
  }

  const isOAuth = dbUser.accounts.length > 0;
  const values = parsed.data;

  // OAuth users cannot change email or password
  if (isOAuth) {
    values.email = undefined;
    values.password = undefined;
    values.newPassword = undefined;
  }

  // Handle email change — send verification
  if (values.email && values.email !== dbUser.email) {
    const existing = await prisma.user.findUnique({ where: { email: values.email } });
    if (existing && existing.id !== userId) {
      return c.json({ error: "Email already in use" }, 409);
    }

    const { token } = await generateVerificationToken(values.email);
    await sendVerificationEmail(values.email, token);
    return c.json({ success: "Verification email sent" });
  }

  // Handle password change
  const updateData: Record<string, unknown> = {};

  if (values.password && values.newPassword && dbUser.passwordHash) {
    const valid = await comparePassword(values.password, dbUser.passwordHash);
    if (!valid) {
      return c.json({ error: "Incorrect current password" }, 400);
    }
    updateData.passwordHash = await hashPassword(values.newPassword);
  }

  if (values.name !== undefined) updateData.name = values.name;
  if (values.isTwoFactorEnabled !== undefined) {
    updateData.isTwoFactorEnabled = values.isTwoFactorEnabled;
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: updateData,
  });

  return c.json({
    id: updatedUser.id,
    name: updatedUser.name,
    email: updatedUser.email,
    image: updatedUser.image,
    isOAuth,
    isTwoFactorEnabled: updatedUser.isTwoFactorEnabled,
    createdAt: updatedUser.createdAt.toISOString(),
  });
});

export { user as userRoutes };
```

- [ ] **Step 2: Wire user routes into main app**

Update `apps/api/src/index.ts` — add the import and route:

```typescript
import { userRoutes } from "@/routes/user.js";
// ... existing code ...
app.route("/user", userRoutes);
```

Full final `apps/api/src/index.ts`:

```typescript
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { serve } from "@hono/node-server";
import { authRoutes } from "@/routes/auth.js";
import { recordsRoutes } from "@/routes/records.js";
import { userRoutes } from "@/routes/user.js";

const app = new Hono();

// Middleware
app.use("*", logger());
app.use(
  "*",
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  }),
);

// Health check
app.get("/health", (c) => c.json({ status: "ok" }));

// Routes
app.route("/auth", authRoutes);
app.route("/records", recordsRoutes);
app.route("/user", userRoutes);

// Dev server
if (process.env.NODE_ENV !== "production") {
  const port = parseInt(process.env.PORT || "3001", 10);
  console.log(`API server running on http://localhost:${port}`);
  serve({ fetch: app.fetch, port });
}

export default app;
```

- [ ] **Step 3: Commit**

```bash
cd /c/Users/Nader/OneDrive/Documents/Projects/classified
git add apps/api/src/routes/user.ts apps/api/src/index.ts
git commit -m "feat: implement user profile and settings routes"
```

---

### Task 12: Data Migration Script

**Files:**
- Create: `scripts/migrate.ts`

- [ ] **Step 1: Create scripts/migrate.ts**

```typescript
/**
 * One-time migration script: MongoDB JSON exports → Neon PostgreSQL
 * Migrates only the user nadertate@gmail.com and their records.
 *
 * Usage: cd apps/api && npx tsx ../../scripts/migrate.ts
 * Requires: NEON_URL and ENCRYPTION_KEY env vars set in apps/api/.env
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// Load env from apps/api/.env
import { config } from "dotenv";
config({ path: resolve(import.meta.dirname, "../apps/api/.env") });

import { PrismaClient } from "@prisma/client";
import { encrypt } from "../apps/api/src/lib/encryption.js";

const prisma = new PrismaClient();
const TARGET_EMAIL = "nadertate@gmail.com";
const OLD_USER_OID = "6599d271679d3bfc2c63a3e3";

interface OldUser {
  _id: { $oid: string };
  name: string;
  email: string;
  password?: string;
  image?: string;
  emailVerified?: { $date: string } | null;
  verifiedAt?: { $date: string } | null;
  isTwoFactorEnabled: boolean;
  createdAt: { $date: string };
  updatedAt: { $date: string };
}

interface OldRecord {
  _id: { $oid: string };
  site?: string;
  icon?: string;
  email?: string;
  username?: string;
  password?: string;
  userId: { $oid: string };
  createdAt: { $date: string };
  updatedAt: { $date: string };
}

async function main() {
  const dataDir = resolve(import.meta.dirname, "../old_data");

  const users: OldUser[] = JSON.parse(
    readFileSync(resolve(dataDir, "Records.users.json"), "utf-8"),
  );
  const records: OldRecord[] = JSON.parse(
    readFileSync(resolve(dataDir, "Records.Record.json"), "utf-8"),
  );

  // Find target user
  const oldUser = users.find((u) => u.email === TARGET_EMAIL);
  if (!oldUser) {
    console.error(`User ${TARGET_EMAIL} not found in export`);
    process.exit(1);
  }

  // Check if already migrated
  const existingUser = await prisma.user.findUnique({ where: { email: TARGET_EMAIL } });
  if (existingUser) {
    console.log(`User ${TARGET_EMAIL} already exists in PostgreSQL (id: ${existingUser.id}). Skipping.`);
    await prisma.$disconnect();
    return;
  }

  // Create user
  const emailVerifiedAt = oldUser.emailVerified?.$date || oldUser.verifiedAt?.$date || null;

  const newUser = await prisma.user.create({
    data: {
      name: oldUser.name,
      email: oldUser.email,
      passwordHash: oldUser.password || null, // bcrypt hash carries over
      image: oldUser.image || null,
      emailVerifiedAt: emailVerifiedAt ? new Date(emailVerifiedAt) : null,
      isTwoFactorEnabled: oldUser.isTwoFactorEnabled,
    },
  });

  console.log(`Created user: ${newUser.name} (${newUser.email}) → ${newUser.id}`);

  // Filter records for this user
  const userRecords = records.filter((r) => r.userId.$oid === OLD_USER_OID);
  console.log(`Found ${userRecords.length} records to migrate`);

  let migrated = 0;
  for (const oldRecord of userRecords) {
    let encryptedPassword: string | null = null;
    let encryptionIv: string | null = null;

    if (oldRecord.password) {
      const encrypted = encrypt(oldRecord.password);
      encryptedPassword = encrypted.encryptedPassword;
      encryptionIv = encrypted.iv;
    }

    await prisma.record.create({
      data: {
        site: oldRecord.site || null,
        icon: oldRecord.icon || null,
        email: oldRecord.email || null,
        username: oldRecord.username || null,
        encryptedPassword,
        encryptionIv,
        userId: newUser.id,
      },
    });

    migrated++;
  }

  console.log(`\nMigration complete: ${migrated} records migrated for ${TARGET_EMAIL}`);
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("Migration failed:", err);
  prisma.$disconnect();
  process.exit(1);
});
```

- [ ] **Step 2: Test the migration (dry run)**

First verify the script compiles and can read the data files:

```bash
cd /c/Users/Nader/OneDrive/Documents/Projects/classified/apps/api
bunx tsx ../../scripts/migrate.ts
```

Expected: User created, X records migrated.

- [ ] **Step 3: Verify data in database**

```bash
cd /c/Users/Nader/OneDrive/Documents/Projects/classified/apps/api
bunx prisma studio --schema=src/prisma/schema.prisma
```

Check that the user and records exist in the `users` and `records` tables. Verify that `encrypted_password` values are base64 strings (not plaintext).

- [ ] **Step 4: Commit**

```bash
cd /c/Users/Nader/OneDrive/Documents/Projects/classified
git add scripts/migrate.ts
git commit -m "feat: add one-time MongoDB to PostgreSQL migration script"
```

---

### Task 13: Quality Checks and CI Scripts

**Files:**
- Modify: `apps/api/package.json` (already has scripts)
- Modify: `packages/shared/package.json` (already has scripts)

- [ ] **Step 1: Verify type-check passes**

```bash
cd /c/Users/Nader/OneDrive/Documents/Projects/classified
bunx turbo run type-check
```

Fix any TypeScript errors found.

- [ ] **Step 2: Verify lint passes**

```bash
cd /c/Users/Nader/OneDrive/Documents/Projects/classified
bunx turbo run lint
```

Fix any ESLint errors found. If ESLint configs are missing, create minimal ones:

Create `apps/api/eslint.config.js`:

```javascript
import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: ["dist/", "node_modules/", "test/"],
  },
);
```

Create `packages/shared/eslint.config.js` with the same content.

Add ESLint dependencies if needed:

```bash
cd /c/Users/Nader/OneDrive/Documents/Projects/classified
bun add -D -w eslint @eslint/js typescript-eslint
```

- [ ] **Step 3: Verify format:check passes**

```bash
cd /c/Users/Nader/OneDrive/Documents/Projects/classified
bunx turbo run format:check
```

If formatting issues found:

```bash
bunx turbo run format
```

- [ ] **Step 4: Verify tests pass**

```bash
cd /c/Users/Nader/OneDrive/Documents/Projects/classified
bunx turbo run test
```

Expected: All encryption, JWT, and middleware tests pass.

- [ ] **Step 5: Commit**

```bash
cd /c/Users/Nader/OneDrive/Documents/Projects/classified
git add -A
git commit -m "chore: add ESLint configs and fix formatting"
```

---

### Task 14: Add Rate Limiting

**Files:**
- Modify: `apps/api/src/index.ts`

- [ ] **Step 1: Add rate limiting middleware**

Hono has a built-in rate limiter. Update `apps/api/src/index.ts` to add rate limiting before routes:

```typescript
import { rateLimiter } from "hono/rate-limiter";

// After CORS middleware, before routes:

// Strict rate limit on auth endpoints (5 req/min per IP)
app.use(
  "/auth/*",
  rateLimiter({
    windowMs: 60 * 1000,
    limit: 5,
    keyGenerator: (c) => c.req.header("x-forwarded-for") || c.req.header("cf-connecting-ip") || "unknown",
  }),
);

// Relaxed rate limit on other endpoints (60 req/min per IP)
app.use(
  "*",
  rateLimiter({
    windowMs: 60 * 1000,
    limit: 60,
    keyGenerator: (c) => c.req.header("x-forwarded-for") || c.req.header("cf-connecting-ip") || "unknown",
  }),
);
```

Note: If `hono/rate-limiter` is not available in the installed version, use the `@hono-rate-limiter/cloudflare` or `hono-rate-limiter` npm package instead. Check docs and adjust import accordingly.

- [ ] **Step 2: Verify API still starts**

```bash
cd /c/Users/Nader/OneDrive/Documents/Projects/classified/apps/api
bun run dev
# Test health endpoint
curl http://localhost:3001/health
```

Expected: `{"status":"ok"}`

- [ ] **Step 3: Commit**

```bash
cd /c/Users/Nader/OneDrive/Documents/Projects/classified
git add apps/api/src/index.ts
git commit -m "feat: add rate limiting to auth and API endpoints"
```

---

### Task 15: End-to-End API Smoke Test

No new files — this is a manual verification task.

- [ ] **Step 1: Start the API**

```bash
cd /c/Users/Nader/OneDrive/Documents/Projects/classified/apps/api
bun run dev
```

- [ ] **Step 2: Test signup flow**

```bash
curl -s -X POST http://localhost:3001/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"Test123!"}' | jq
```

Expected: `{"success":"Confirmation email sent"}` with status 201.

- [ ] **Step 3: Test login with migrated user**

```bash
curl -s -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"nadertate@gmail.com","password":"<your-password>"}' | jq
```

Expected: `{"accessToken":"...","refreshToken":"..."}` (or `{"twoFactor":true}` if 2FA is enabled).

- [ ] **Step 4: Test records CRUD**

Using the access token from login:

```bash
TOKEN="<access-token-from-login>"

# List records
curl -s http://localhost:3001/records \
  -H "Authorization: Bearer $TOKEN" | jq

# Create a record
curl -s -X POST http://localhost:3001/records \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"site":"TestSite","email":"test@test.com","password":"S3cur3!"}' | jq

# Get the record (check password is decrypted)
curl -s http://localhost:3001/records/<record-id> \
  -H "Authorization: Bearer $TOKEN" | jq
```

Expected: Records returned with plaintext passwords (decrypted from DB).

- [ ] **Step 5: Test token refresh**

```bash
REFRESH="<refresh-token-from-login>"
curl -s -X POST http://localhost:3001/auth/refresh \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\":\"$REFRESH\"}" | jq
```

Expected: `{"accessToken":"<new-token>"}`.

- [ ] **Step 6: Test unauthorized access**

```bash
# No token
curl -s http://localhost:3001/records | jq

# Expired/invalid token
curl -s http://localhost:3001/records \
  -H "Authorization: Bearer invalid" | jq
```

Expected: `{"error":"Authorization header required"}` and `{"error":"Invalid or expired token"}`, both 401.

- [ ] **Step 7: Stop dev server and commit any fixes**

```bash
cd /c/Users/Nader/OneDrive/Documents/Projects/classified
git add -A
git commit -m "chore: smoke test fixes"
```

(Only commit if there were fixes needed. Skip if all passed.)
