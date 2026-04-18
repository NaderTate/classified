# Classified Browser Extension Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Chromium (MV3) browser extension that signs the user into their Classified account, auto-matches records to the current tab, and copies credentials to the clipboard.

**Architecture:** New `apps/extension/` workspace. Vite + `@crxjs/vite-plugin` builds the MV3 bundle. Popup is React 19 + Tailwind. A background service worker owns the access token (in memory) and refresh token (in `chrome.storage.local`) and proxies all API calls. Pure matching logic (current tab hostname → records) lives in `lib/match.ts` with unit tests.

**Tech Stack:** Vite 5, `@crxjs/vite-plugin`, React 19, TypeScript 5, Tailwind CSS 3, @tanstack/react-query 5, @classified/shared (workspace), Vitest for unit tests.

**Spec:** `docs/superpowers/specs/2026-04-18-browser-extension-design.md`

---

## File Structure

```
apps/extension/
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── manifest.config.ts             CRXJS dynamic manifest (MV3)
├── README.md                      How to load unpacked
├── src/
│   ├── popup/
│   │   ├── index.html
│   │   ├── main.tsx
│   │   ├── App.tsx                4-screen router via useState
│   │   ├── screens/
│   │   │   ├── login.tsx
│   │   │   ├── two-factor.tsx
│   │   │   ├── vault.tsx
│   │   │   └── add-record.tsx
│   │   ├── components/
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── toast.tsx
│   │   │   ├── alert.tsx
│   │   │   ├── record-row.tsx
│   │   │   └── copy-button.tsx
│   │   └── hooks/
│   │       ├── use-auth.tsx
│   │       ├── use-records.ts
│   │       └── use-current-tab.ts
│   ├── background/
│   │   └── service-worker.ts
│   ├── lib/
│   │   ├── storage.ts             Typed chrome.storage.local wrapper
│   │   ├── match.ts               Pure hostname matching (tested)
│   │   ├── generate-password.ts   Password generator util
│   │   └── api-client.ts          Popup → SW message client
│   └── styles/
│       └── global.css
├── public/
│   └── icons/
│       ├── icon-16.png
│       ├── icon-32.png
│       ├── icon-48.png
│       └── icon-128.png
└── tests/
    ├── match.test.ts
    └── storage.test.ts
```

---

## Task 1: Scaffold extension workspace

**Files:**
- Create: `apps/extension/package.json`
- Create: `apps/extension/tsconfig.json`
- Create: `apps/extension/vite.config.ts`
- Create: `apps/extension/manifest.config.ts`
- Create: `apps/extension/tailwind.config.js`
- Create: `apps/extension/postcss.config.js`
- Create: `apps/extension/src/popup/index.html`
- Create: `apps/extension/src/popup/main.tsx`
- Create: `apps/extension/src/popup/App.tsx`
- Create: `apps/extension/src/styles/global.css`
- Create: `apps/extension/public/icons/icon-128.png` (placeholder — real icons in Task 12)
- Create: `apps/extension/README.md`
- Create: `apps/extension/.gitignore`

- [ ] **Step 1: Create workspace directories**

```bash
mkdir -p apps/extension/src/popup/screens apps/extension/src/popup/components apps/extension/src/popup/hooks apps/extension/src/background apps/extension/src/lib apps/extension/src/styles apps/extension/public/icons apps/extension/tests
```

- [ ] **Step 2: Create `apps/extension/package.json`**

```json
{
  "name": "@classified/extension",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc --noEmit && vite build",
    "type-check": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "@classified/shared": "workspace:*",
    "@tanstack/react-query": "^5.75.5",
    "react": "^19.1.0",
    "react-dom": "^19.1.0"
  },
  "devDependencies": {
    "@crxjs/vite-plugin": "^2.0.0-beta.28",
    "@types/chrome": "^0.0.287",
    "@types/react": "^19.1.10",
    "@types/react-dom": "^19.1.0",
    "@vitejs/plugin-react": "^4.3.4",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.5.1",
    "tailwindcss": "^3.4.17",
    "typescript": "^5.8.3",
    "vite": "^5.4.14",
    "vitest": "^2.1.8"
  }
}
```

- [ ] **Step 3: Create `apps/extension/tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noFallthroughCasesInSwitch": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "types": ["chrome", "vitest/globals"],
    "paths": {
      "@/*": ["./src/*"]
    },
    "baseUrl": "."
  },
  "include": ["src", "tests", "manifest.config.ts", "vite.config.ts"]
}
```

- [ ] **Step 4: Create `apps/extension/manifest.config.ts`**

```ts
import { defineManifest } from "@crxjs/vite-plugin";

export default defineManifest({
  manifest_version: 3,
  name: "Classified",
  version: "0.0.1",
  description: "Quick access to your Classified password vault.",
  action: {
    default_popup: "src/popup/index.html",
    default_title: "Classified",
  },
  background: {
    service_worker: "src/background/service-worker.ts",
    type: "module",
  },
  permissions: ["storage", "activeTab", "clipboardWrite"],
  icons: {
    "16": "public/icons/icon-16.png",
    "32": "public/icons/icon-32.png",
    "48": "public/icons/icon-48.png",
    "128": "public/icons/icon-128.png",
  },
});
```

- [ ] **Step 5: Create `apps/extension/vite.config.ts`**

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { crx } from "@crxjs/vite-plugin";
import path from "node:path";
import manifest from "./manifest.config";

export default defineConfig({
  plugins: [react(), crx({ manifest })],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: { popup: path.resolve(__dirname, "src/popup/index.html") },
    },
  },
  server: { port: 5180, strictPort: true },
  test: {
    environment: "jsdom",
    globals: true,
  },
});
```

- [ ] **Step 6: Create `apps/extension/tailwind.config.js`**

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{html,ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#0a0a0a",
        foreground: "#fafafa",
        card: "#141414",
        border: "#262626",
        input: "#1a1a1a",
        muted: "#171717",
        "muted-foreground": "#a3a3a3",
        primary: "#3b82f6",
        destructive: "#ef4444",
      },
    },
  },
  plugins: [],
};
```

- [ ] **Step 7: Create `apps/extension/postcss.config.js`**

```js
export default {
  plugins: { tailwindcss: {}, autoprefixer: {} },
};
```

- [ ] **Step 8: Create `apps/extension/src/styles/global.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

html, body { background: #0a0a0a; color: #fafafa; margin: 0; }
#root { width: 360px; min-height: 500px; max-height: 600px; overflow: hidden; }
```

- [ ] **Step 9: Create `apps/extension/src/popup/index.html`**

```html
<!doctype html>
<html lang="en" class="dark">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=360" />
    <title>Classified</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="./main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 10: Create `apps/extension/src/popup/main.tsx`**

```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import "@/styles/global.css";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
);
```

- [ ] **Step 11: Create placeholder `apps/extension/src/popup/App.tsx`**

```tsx
export default function App() {
  return (
    <div className="flex flex-col items-center justify-center h-[500px] p-6 bg-background text-foreground">
      <h1 className="text-xl font-bold">Classified</h1>
      <p className="text-muted-foreground text-sm mt-2">Extension scaffold ready</p>
    </div>
  );
}
```

- [ ] **Step 12: Create placeholder 128×128 icon**

```bash
cp logo.jpg apps/extension/public/icons/icon-128.png
cp logo.jpg apps/extension/public/icons/icon-48.png
cp logo.jpg apps/extension/public/icons/icon-32.png
cp logo.jpg apps/extension/public/icons/icon-16.png
```

(Real resized PNGs land in Task 12; JPG renamed to PNG works for Chrome dev loading.)

- [ ] **Step 13: Create `apps/extension/README.md`**

```markdown
# @classified/extension

Chromium browser extension for Classified.

## Dev
`bun run --filter=@classified/extension dev` — watches and rebuilds.

## Build
`bun run --filter=@classified/extension build` — outputs `dist/`.

## Install
1. Open `chrome://extensions`
2. Enable Developer mode
3. Click "Load unpacked" and select `apps/extension/dist`
```

- [ ] **Step 14: Create `apps/extension/.gitignore`**

```
dist
node_modules
.vite
```

- [ ] **Step 15: Install deps from repo root**

Run: `bun install`
Expected: adds `@classified/extension` to the workspace, installs Vite/CRXJS/React deps. No errors.

- [ ] **Step 16: Build and verify it loads**

Run: `bun run --filter=@classified/extension build`
Expected: `dist/` folder appears with `manifest.json`, `popup.html`, `assets/`, and `service-worker-loader.js`.

Manually: open `chrome://extensions`, enable Dev mode, "Load unpacked" → select `apps/extension/dist`. Click the toolbar icon. Popup shows "Classified — Extension scaffold ready".

- [ ] **Step 17: Commit**

```bash
git add apps/extension
git commit -m "feat(extension): scaffold MV3 extension workspace with empty popup"
```

---

## Task 2: Implement `lib/match.ts` with tests (TDD)

**Files:**
- Create: `apps/extension/tests/match.test.ts`
- Create: `apps/extension/src/lib/match.ts`

- [ ] **Step 1: Write failing tests**

Create `apps/extension/tests/match.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { findMatches, normalizeHostname } from "@/lib/match";
import type { Record } from "@classified/shared";

function rec(site: string): Record {
  return {
    id: `id-${site}`,
    site,
    username: null,
    email: null,
    password: "x",
    icon: null,
    userId: "u",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  } as unknown as Record;
}

describe("normalizeHostname", () => {
  it("lowercases and strips www", () => {
    expect(normalizeHostname("WWW.GitHub.com")).toBe("github.com");
  });
  it("passes through bare domains", () => {
    expect(normalizeHostname("example.org")).toBe("example.org");
  });
});

describe("findMatches", () => {
  it("exact hostname match ranks highest", () => {
    const records = [rec("github.com"), rec("notgithub.com")];
    const m = findMatches("github.com", records);
    expect(m[0]?.site).toBe("github.com");
  });

  it("subdomain of current matches parent record site", () => {
    const records = [rec("github.com")];
    const m = findMatches("app.github.com", records);
    expect(m[0]?.site).toBe("github.com");
  });

  it("URL-shaped record.site extracts hostname", () => {
    const records = [rec("https://github.com/settings")];
    const m = findMatches("github.com", records);
    expect(m.length).toBe(1);
  });

  it("free-text site matches via substring", () => {
    const records = [rec("github")];
    const m = findMatches("github.com", records);
    expect(m.length).toBe(1);
  });

  it("returns at most 3 matches", () => {
    const records = [rec("github.com"), rec("github"), rec("https://github.com"), rec("gh"), rec("hub")];
    const m = findMatches("github.com", records);
    expect(m.length).toBeLessThanOrEqual(3);
  });

  it("handles co.uk two-part TLD as registrable domain", () => {
    const records = [rec("bbc.co.uk")];
    const m = findMatches("news.bbc.co.uk", records);
    expect(m.length).toBe(1);
  });

  it("ignores records with empty site", () => {
    const records = [{ ...rec("github.com"), site: "" } as Record];
    expect(findMatches("github.com", records)).toEqual([]);
  });

  it("is case-insensitive", () => {
    const records = [rec("GitHub.com")];
    expect(findMatches("github.com", records).length).toBe(1);
  });
});
```

- [ ] **Step 2: Run tests — should fail**

Run: `bun run --filter=@classified/extension test`
Expected: Cannot find module `@/lib/match`. Fail.

- [ ] **Step 3: Implement `apps/extension/src/lib/match.ts`**

```ts
import type { Record } from "@classified/shared";

const TWO_PART_TLDS = new Set([
  "co.uk", "com.au", "co.jp", "co.nz", "com.br",
  "co.za", "com.mx", "com.sg", "com.tr", "com.ar",
  "co.in", "co.il", "com.hk", "ac.uk", "gov.uk",
]);

export function normalizeHostname(host: string): string {
  return host.trim().toLowerCase().replace(/^www\./, "");
}

function parseSite(site: string): string {
  const trimmed = site.trim().toLowerCase();
  if (!trimmed) return "";
  if (trimmed.includes("://")) {
    try {
      return normalizeHostname(new URL(trimmed).hostname);
    } catch {
      return trimmed;
    }
  }
  return trimmed.replace(/^www\./, "");
}

function registrableDomain(host: string): string {
  const parts = host.split(".");
  if (parts.length < 2) return host;
  const lastTwo = parts.slice(-2).join(".");
  const lastThree = parts.slice(-3).join(".");
  if (parts.length >= 3 && TWO_PART_TLDS.has(lastTwo)) return lastThree;
  return lastTwo;
}

type Rank = 0 | 1 | 2;

function rankFor(hostNorm: string, siteNorm: string): Rank | null {
  if (!siteNorm) return null;
  if (hostNorm === siteNorm) return 0;
  const regDomain = registrableDomain(hostNorm);
  if (regDomain === siteNorm) return 1;
  if (hostNorm.includes(siteNorm)) return 2;
  return null;
}

export function findMatches(currentHostname: string, records: Record[]): Record[] {
  const hostNorm = normalizeHostname(currentHostname);
  const scored: Array<{ record: Record; rank: Rank }> = [];
  for (const r of records) {
    if (!r.site) continue;
    const siteNorm = parseSite(r.site);
    const rank = rankFor(hostNorm, siteNorm);
    if (rank !== null) scored.push({ record: r, rank });
  }
  scored.sort((a, b) => a.rank - b.rank);
  return scored.slice(0, 3).map((s) => s.record);
}
```

- [ ] **Step 4: Run tests — should pass**

Run: `bun run --filter=@classified/extension test`
Expected: all 8 tests pass.

- [ ] **Step 5: Commit**

```bash
git add apps/extension/src/lib/match.ts apps/extension/tests/match.test.ts
git commit -m "feat(extension): hostname matching with unit tests"
```

---

## Task 3: Implement `lib/storage.ts` with tests (TDD)

**Files:**
- Create: `apps/extension/tests/storage.test.ts`
- Create: `apps/extension/src/lib/storage.ts`
- Create: `apps/extension/tests/setup.ts`

- [ ] **Step 1: Create test setup mocking chrome.storage.local**

Create `apps/extension/tests/setup.ts`:

```ts
import { vi } from "vitest";

const store = new Map<string, unknown>();
(globalThis as { chrome: unknown }).chrome = {
  storage: {
    local: {
      get: vi.fn((keys: string | string[]) => {
        const result: Record<string, unknown> = {};
        const list = typeof keys === "string" ? [keys] : keys;
        for (const k of list) {
          if (store.has(k)) result[k] = store.get(k);
        }
        return Promise.resolve(result);
      }),
      set: vi.fn((items: Record<string, unknown>) => {
        for (const [k, v] of Object.entries(items)) store.set(k, v);
        return Promise.resolve();
      }),
      remove: vi.fn((keys: string | string[]) => {
        const list = typeof keys === "string" ? [keys] : keys;
        for (const k of list) store.delete(k);
        return Promise.resolve();
      }),
      clear: vi.fn(() => {
        store.clear();
        return Promise.resolve();
      }),
    },
  },
};

export function resetStore() {
  store.clear();
}
```

Update `apps/extension/vite.config.ts` — add `setupFiles: ["./tests/setup.ts"]` to the `test` block:

```ts
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
  },
```

- [ ] **Step 2: Write failing tests**

Create `apps/extension/tests/storage.test.ts`:

```ts
import { describe, it, expect, beforeEach } from "vitest";
import { getRefreshToken, setRefreshToken, clearTokens } from "@/lib/storage";
import { resetStore } from "./setup";

beforeEach(() => resetStore());

describe("storage", () => {
  it("returns null when no refresh token", async () => {
    expect(await getRefreshToken()).toBeNull();
  });

  it("round-trips a refresh token", async () => {
    await setRefreshToken("abc123");
    expect(await getRefreshToken()).toBe("abc123");
  });

  it("clearTokens removes the refresh token", async () => {
    await setRefreshToken("abc123");
    await clearTokens();
    expect(await getRefreshToken()).toBeNull();
  });
});
```

- [ ] **Step 3: Run tests — should fail**

Run: `bun run --filter=@classified/extension test`
Expected: Cannot find module `@/lib/storage`. Fail.

- [ ] **Step 4: Implement `apps/extension/src/lib/storage.ts`**

```ts
const REFRESH_TOKEN_KEY = "classified.refreshToken";

export async function getRefreshToken(): Promise<string | null> {
  const data = await chrome.storage.local.get(REFRESH_TOKEN_KEY);
  const value = data[REFRESH_TOKEN_KEY];
  return typeof value === "string" ? value : null;
}

export async function setRefreshToken(token: string): Promise<void> {
  await chrome.storage.local.set({ [REFRESH_TOKEN_KEY]: token });
}

export async function clearTokens(): Promise<void> {
  await chrome.storage.local.remove(REFRESH_TOKEN_KEY);
}
```

- [ ] **Step 5: Run tests — should pass**

Run: `bun run --filter=@classified/extension test`
Expected: all tests pass (match + storage = 11 tests).

- [ ] **Step 6: Commit**

```bash
git add apps/extension/src/lib/storage.ts apps/extension/tests/storage.test.ts apps/extension/tests/setup.ts apps/extension/vite.config.ts
git commit -m "feat(extension): chrome.storage.local wrapper with unit tests"
```

---

## Task 4: Implement `lib/generate-password.ts`

**Files:**
- Create: `apps/extension/src/lib/generate-password.ts`

- [ ] **Step 1: Implement the generator**

```ts
const CHARSET =
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|:;<>?,./~";

export function generatePassword(length = 20): string {
  const buf = new Uint32Array(length);
  crypto.getRandomValues(buf);
  let out = "";
  for (let i = 0; i < length; i++) {
    out += CHARSET[buf[i]! % CHARSET.length];
  }
  return out;
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/extension/src/lib/generate-password.ts
git commit -m "feat(extension): password generator using crypto.getRandomValues"
```

---

## Task 5: Service worker with API proxy

**Files:**
- Create: `apps/extension/src/background/service-worker.ts`

The SW owns: access token (in-memory), refresh token (from storage), and the `@classified/shared` API client configured against an in-memory token store that persists writes.

Message protocol between popup and SW:

```ts
// popup → SW
{ type: "auth/login", body: { email, password } }
{ type: "auth/two-factor", body: { email, code } }
{ type: "auth/logout" }
{ type: "records/list", body: { search?, page? } }
{ type: "records/create", body: { site?, username?, email?, password?, icon? } }
{ type: "auth/status" }

// SW → popup (as Promise resolution from sendMessage)
{ ok: true, data: <T> }
{ ok: false, error: string, status?: number }
```

- [ ] **Step 1: Create `apps/extension/src/background/service-worker.ts`**

```ts
import { createApiClient, ApiClientError } from "@classified/shared";
import { getRefreshToken, setRefreshToken, clearTokens } from "@/lib/storage";

const API_URL = import.meta.env.VITE_API_URL ?? "https://classified-api.vercel.app";

let accessToken: string | null = null;
let refreshTokenCache: string | null = null;

async function loadRefreshToken(): Promise<string | null> {
  if (refreshTokenCache !== null) return refreshTokenCache;
  refreshTokenCache = await getRefreshToken();
  return refreshTokenCache;
}

const api = createApiClient(API_URL, {
  getAccessToken: () => accessToken,
  getRefreshToken: () => refreshTokenCache,
  setTokens: (tokens) => {
    accessToken = tokens.accessToken;
    refreshTokenCache = tokens.refreshToken;
    void setRefreshToken(tokens.refreshToken);
  },
  clearTokens: () => {
    accessToken = null;
    refreshTokenCache = null;
    void clearTokens();
  },
});

type Message =
  | { type: "auth/login"; body: { email: string; password: string } }
  | { type: "auth/two-factor"; body: { email: string; code: string } }
  | { type: "auth/logout" }
  | { type: "auth/status" }
  | { type: "records/list"; body?: { search?: string; page?: number } }
  | { type: "records/create"; body: { site?: string; username?: string; email?: string; password?: string; icon?: string } };

async function handle(msg: Message): Promise<unknown> {
  switch (msg.type) {
    case "auth/status": {
      const token = await loadRefreshToken();
      return { authed: !!token };
    }
    case "auth/login": {
      const result = await api.auth.login(msg.body);
      if ("twoFactor" in result) return result;
      accessToken = result.accessToken;
      refreshTokenCache = result.refreshToken;
      await setRefreshToken(result.refreshToken);
      return { user: result.user };
    }
    case "auth/two-factor": {
      const result = await api.auth.twoFactor(msg.body);
      accessToken = result.accessToken;
      refreshTokenCache = result.refreshToken;
      await setRefreshToken(result.refreshToken);
      return { ok: true };
    }
    case "auth/logout": {
      const rt = await loadRefreshToken();
      if (rt) {
        try { await api.auth.logout(rt); } catch { /* best-effort */ }
      }
      accessToken = null;
      refreshTokenCache = null;
      await clearTokens();
      return { ok: true };
    }
    case "records/list": {
      await loadRefreshToken();
      return await api.records.list({ ...(msg.body ?? {}), limit: 50 });
    }
    case "records/create": {
      await loadRefreshToken();
      return await api.records.create(msg.body);
    }
  }
}

chrome.runtime.onMessage.addListener((msg: Message, _sender, sendResponse) => {
  handle(msg)
    .then((data) => sendResponse({ ok: true, data }))
    .catch((err: unknown) => {
      const status = err instanceof ApiClientError ? err.status : undefined;
      const message = err instanceof Error ? err.message : "Request failed";
      sendResponse({ ok: false, error: message, status });
    });
  return true;
});
```

- [ ] **Step 2: Type-check**

Run: `bun run --filter=@classified/extension type-check`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add apps/extension/src/background/service-worker.ts
git commit -m "feat(extension): service worker with API proxy and token handling"
```

---

## Task 6: Popup-side API client (message dispatcher)

**Files:**
- Create: `apps/extension/src/lib/api-client.ts`

- [ ] **Step 1: Create `apps/extension/src/lib/api-client.ts`**

```ts
type Envelope<T> = { ok: true; data: T } | { ok: false; error: string; status?: number };

export class SwApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = "SwApiError";
  }
}

async function send<T>(type: string, body?: unknown): Promise<T> {
  const res = (await chrome.runtime.sendMessage({ type, body })) as Envelope<T>;
  if (!res.ok) throw new SwApiError(res.error, res.status);
  return res.data;
}

export const swApi = {
  authStatus: () => send<{ authed: boolean }>("auth/status"),
  login: (body: { email: string; password: string }) =>
    send<{ twoFactor: true; email: string } | { user: unknown }>("auth/login", body),
  twoFactor: (body: { email: string; code: string }) => send<{ ok: true }>("auth/two-factor", body),
  logout: () => send<{ ok: true }>("auth/logout"),
  listRecords: (body?: { search?: string; page?: number }) =>
    send<{ records: unknown[]; total: number; page: number; limit: number; totalPages: number }>(
      "records/list",
      body,
    ),
  createRecord: (body: {
    site?: string;
    username?: string;
    email?: string;
    password?: string;
    icon?: string;
  }) => send<unknown>("records/create", body),
};
```

- [ ] **Step 2: Commit**

```bash
git add apps/extension/src/lib/api-client.ts
git commit -m "feat(extension): popup-side SW message client"
```

---

## Task 7: UI primitives

**Files:**
- Create: `apps/extension/src/popup/components/button.tsx`
- Create: `apps/extension/src/popup/components/input.tsx`
- Create: `apps/extension/src/popup/components/toast.tsx`
- Create: `apps/extension/src/popup/components/alert.tsx`

- [ ] **Step 1: Create `button.tsx`**

```tsx
import { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "outline" | "ghost" | "destructive";
type Size = "sm" | "md";

const BASE = "inline-flex items-center justify-center rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
const VARIANTS: Record<Variant, string> = {
  primary: "bg-primary text-white hover:opacity-90",
  outline: "border border-border text-foreground hover:bg-muted",
  ghost: "text-foreground hover:bg-muted",
  destructive: "bg-destructive text-white hover:opacity-90",
};
const SIZES: Record<Size, string> = { sm: "h-8 px-3 text-sm", md: "h-10 px-4 text-sm" };

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
};

export function Button({ variant = "primary", size = "md", loading, className = "", children, disabled, ...rest }: Props) {
  return (
    <button
      className={`${BASE} ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? "…" : children}
    </button>
  );
}
```

- [ ] **Step 2: Create `input.tsx`**

```tsx
import { InputHTMLAttributes, forwardRef } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & { rightSlot?: React.ReactNode };

export const Input = forwardRef<HTMLInputElement, Props>(function Input(
  { className = "", rightSlot, ...rest },
  ref,
) {
  return (
    <div className="relative flex items-center">
      <input
        ref={ref}
        className={`h-10 w-full rounded-lg bg-input border border-border px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary ${rightSlot ? "pr-10" : ""} ${className}`}
        {...rest}
      />
      {rightSlot ? <div className="absolute right-2">{rightSlot}</div> : null}
    </div>
  );
});
```

- [ ] **Step 3: Create `toast.tsx`**

```tsx
import { createContext, useContext, useState, useCallback, ReactNode } from "react";

type ToastCtx = (message: string) => void;

const Ctx = createContext<ToastCtx | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);
  const show = useCallback((m: string) => {
    setMessage(m);
    window.setTimeout(() => setMessage(null), 1500);
  }, []);
  return (
    <Ctx.Provider value={show}>
      {children}
      {message ? (
        <div className="fixed bottom-3 left-1/2 -translate-x-1/2 bg-card border border-border px-3 py-1.5 rounded-lg text-sm shadow-lg">
          {message}
        </div>
      ) : null}
    </Ctx.Provider>
  );
}

export function useToast(): ToastCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("ToastProvider missing");
  return ctx;
}
```

- [ ] **Step 4: Create `alert.tsx`**

```tsx
type Props = { children: React.ReactNode; tone?: "error" | "info" };

export function Alert({ children, tone = "error" }: Props) {
  const color = tone === "error" ? "border-destructive text-destructive" : "border-primary text-primary";
  return (
    <div className={`rounded-lg border ${color} bg-card px-3 py-2 text-sm`}>{children}</div>
  );
}
```

- [ ] **Step 5: Wrap App with ToastProvider in `main.tsx`**

Edit `apps/extension/src/popup/main.tsx`:

```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import { ToastProvider } from "./components/toast";
import "@/styles/global.css";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <App />
      </ToastProvider>
    </QueryClientProvider>
  </StrictMode>,
);
```

- [ ] **Step 6: Type-check**

Run: `bun run --filter=@classified/extension type-check`
Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add apps/extension/src/popup/components apps/extension/src/popup/main.tsx
git commit -m "feat(extension): UI primitives and toast provider"
```

---

## Task 8: Auth context + Login + Two-factor screens

**Files:**
- Create: `apps/extension/src/popup/hooks/use-auth.tsx`
- Create: `apps/extension/src/popup/screens/login.tsx`
- Create: `apps/extension/src/popup/screens/two-factor.tsx`
- Modify: `apps/extension/src/popup/App.tsx`

- [ ] **Step 1: Create `use-auth.tsx`**

```tsx
import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { swApi } from "@/lib/api-client";

type AuthState =
  | { status: "loading" }
  | { status: "signed-out" }
  | { status: "two-factor"; email: string }
  | { status: "signed-in" };

type Ctx = {
  state: AuthState;
  login: (email: string, password: string) => Promise<void>;
  verifyTwoFactor: (code: string) => Promise<void>;
  cancelTwoFactor: () => void;
  logout: () => Promise<void>;
};

const AuthCtx = createContext<Ctx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: "loading" });

  useEffect(() => {
    swApi.authStatus().then((r) =>
      setState(r.authed ? { status: "signed-in" } : { status: "signed-out" }),
    );
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await swApi.login({ email, password });
    if ("twoFactor" in res) setState({ status: "two-factor", email: res.email });
    else setState({ status: "signed-in" });
  }, []);

  const verifyTwoFactor = useCallback(
    async (code: string) => {
      if (state.status !== "two-factor") return;
      await swApi.twoFactor({ email: state.email, code });
      setState({ status: "signed-in" });
    },
    [state],
  );

  const cancelTwoFactor = useCallback(() => setState({ status: "signed-out" }), []);

  const logout = useCallback(async () => {
    await swApi.logout();
    setState({ status: "signed-out" });
  }, []);

  return (
    <AuthCtx.Provider value={{ state, login, verifyTwoFactor, cancelTwoFactor, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("AuthProvider missing");
  return ctx;
}
```

- [ ] **Step 2: Create `login.tsx`**

```tsx
import { useState } from "react";
import { Input } from "../components/input";
import { Button } from "../components/button";
import { Alert } from "../components/alert";
import { useAuth } from "../hooks/use-auth";

const WEB_URL = "https://classified.vercel.app";

export function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col h-full p-5 gap-4 bg-background text-foreground">
      <div className="text-center pt-6 pb-2">
        <h1 className="text-xl font-bold">Classified</h1>
        <p className="text-sm text-muted-foreground mt-1">Sign in to your vault</p>
      </div>
      {error ? <Alert>{error}</Alert> : null}
      <div className="flex flex-col gap-3">
        <Input
          placeholder="you@example.com"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          placeholder="Password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Button type="submit" loading={loading}>Sign In</Button>
      </div>
      <div className="mt-auto text-center text-xs text-muted-foreground">
        No account?{" "}
        <button
          type="button"
          className="text-primary hover:underline"
          onClick={() => chrome.tabs.create({ url: WEB_URL })}
        >
          Open web app
        </button>
      </div>
    </form>
  );
}
```

- [ ] **Step 3: Create `two-factor.tsx`**

```tsx
import { useState } from "react";
import { Input } from "../components/input";
import { Button } from "../components/button";
import { Alert } from "../components/alert";
import { useAuth } from "../hooks/use-auth";

export function TwoFactorScreen() {
  const { verifyTwoFactor, cancelTwoFactor } = useAuth();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await verifyTwoFactor(code);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col h-full p-5 gap-4 bg-background text-foreground">
      <div className="text-center pt-6 pb-2">
        <h1 className="text-xl font-bold">Two-factor required</h1>
        <p className="text-sm text-muted-foreground mt-1">Enter the 6-digit code sent to your email</p>
      </div>
      {error ? <Alert>{error}</Alert> : null}
      <Input
        inputMode="numeric"
        maxLength={6}
        pattern="[0-9]{6}"
        placeholder="123456"
        value={code}
        onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
        required
      />
      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={cancelTwoFactor} className="flex-1">Back</Button>
        <Button type="submit" loading={loading} className="flex-1">Verify</Button>
      </div>
    </form>
  );
}
```

- [ ] **Step 4: Rewrite `App.tsx`**

```tsx
import { AuthProvider, useAuth } from "./hooks/use-auth";
import { LoginScreen } from "./screens/login";
import { TwoFactorScreen } from "./screens/two-factor";

function Root() {
  const { state } = useAuth();
  if (state.status === "loading") {
    return <div className="h-[500px] flex items-center justify-center bg-background text-muted-foreground text-sm">Loading…</div>;
  }
  if (state.status === "signed-out") return <LoginScreen />;
  if (state.status === "two-factor") return <TwoFactorScreen />;
  return <div className="h-[500px] flex items-center justify-center bg-background text-foreground">Signed in — vault in next task</div>;
}

export default function App() {
  return (
    <AuthProvider>
      <Root />
    </AuthProvider>
  );
}
```

- [ ] **Step 5: Type-check and build**

Run: `bun run --filter=@classified/extension build`
Expected: build succeeds, `dist/` updates.

Manually: reload extension at `chrome://extensions`. Popup shows Login screen. Attempt login with real credentials → either lands on the placeholder "Signed in" screen or the Two-factor screen.

- [ ] **Step 6: Commit**

```bash
git add apps/extension/src/popup/hooks apps/extension/src/popup/screens apps/extension/src/popup/App.tsx
git commit -m "feat(extension): auth context and login/2FA screens"
```

---

## Task 9: Current-tab hook + Vault screen with search and matched section

**Files:**
- Create: `apps/extension/src/popup/hooks/use-current-tab.ts`
- Create: `apps/extension/src/popup/hooks/use-records.ts`
- Create: `apps/extension/src/popup/components/record-row.tsx`
- Create: `apps/extension/src/popup/components/copy-button.tsx`
- Create: `apps/extension/src/popup/screens/vault.tsx`
- Modify: `apps/extension/src/popup/App.tsx`

- [ ] **Step 1: Create `use-current-tab.ts`**

```ts
import { useEffect, useState } from "react";

export function useCurrentTabHostname(): string | null {
  const [hostname, setHostname] = useState<string | null>(null);
  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
      const url = tabs[0]?.url;
      if (!url) return;
      try {
        setHostname(new URL(url).hostname);
      } catch {
        setHostname(null);
      }
    });
  }, []);
  return hostname;
}
```

- [ ] **Step 2: Create `use-records.ts`**

```ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { swApi } from "@/lib/api-client";
import type { Record, PaginatedRecords, CreateRecordInput } from "@classified/shared";

export function useRecords(params: { search: string; page: number }) {
  return useQuery({
    queryKey: ["records", params],
    queryFn: () => swApi.listRecords(params) as unknown as Promise<PaginatedRecords>,
  });
}

export function useCreateRecord() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateRecordInput) => swApi.createRecord(data) as unknown as Promise<Record>,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["records"] }),
  });
}
```

- [ ] **Step 3: Create `copy-button.tsx`**

```tsx
import { useToast } from "./toast";

type Props = { value: string; label: string; icon: React.ReactNode };

export function CopyButton({ value, label, icon }: Props) {
  const toast = useToast();
  const onCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(value);
    toast(`Copied ${label}`);
  };
  return (
    <button
      type="button"
      onClick={onCopy}
      title={`Copy ${label}`}
      className="h-7 w-7 flex items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
    >
      {icon}
    </button>
  );
}
```

- [ ] **Step 4: Create `record-row.tsx`**

```tsx
import type { Record } from "@classified/shared";
import { CopyButton } from "./copy-button";

function Initials({ site }: { site: string | null | undefined }) {
  const ch = (site ?? "?").trim().charAt(0).toUpperCase() || "?";
  return (
    <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center text-sm text-muted-foreground">
      {ch}
    </div>
  );
}

export function RecordRow({ record }: { record: Record }) {
  const sub = record.username || record.email || "";
  return (
    <div className="flex items-center gap-3 px-3 py-2 hover:bg-muted rounded-lg">
      {record.icon ? (
        <img src={record.icon} alt="" className="h-9 w-9 rounded-lg object-cover" />
      ) : (
        <Initials site={record.site} />
      )}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate text-foreground">{record.site || "Untitled"}</div>
        {sub ? <div className="text-xs text-muted-foreground truncate">{sub}</div> : null}
      </div>
      <div className="flex items-center gap-1">
        {record.email ? <CopyButton value={record.email} label="email" icon={<span className="text-sm">@</span>} /> : null}
        {record.username ? <CopyButton value={record.username} label="username" icon={<span className="text-sm">👤</span>} /> : null}
        {record.password ? <CopyButton value={record.password} label="password" icon={<span className="text-sm">🔑</span>} /> : null}
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Create `vault.tsx`**

```tsx
import { useEffect, useMemo, useState } from "react";
import { Input } from "../components/input";
import { Button } from "../components/button";
import { Alert } from "../components/alert";
import { RecordRow } from "../components/record-row";
import { useRecords } from "../hooks/use-records";
import { useCurrentTabHostname } from "../hooks/use-current-tab";
import { findMatches } from "@/lib/match";
import { useAuth } from "../hooks/use-auth";
import type { Record } from "@classified/shared";

type Props = { onAdd: () => void };

export function VaultScreen({ onAdd }: Props) {
  const { logout } = useAuth();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const hostname = useCurrentTabHostname();

  useEffect(() => {
    const id = window.setTimeout(() => setDebouncedSearch(search), 200);
    return () => window.clearTimeout(id);
  }, [search]);

  const query = useRecords({ search: debouncedSearch, page });

  const records = (query.data?.records ?? []) as Record[];
  const matches = useMemo(
    () => (hostname ? findMatches(hostname, records) : []),
    [hostname, records],
  );

  return (
    <div className="flex flex-col h-[500px] bg-background text-foreground">
      <div className="flex items-center justify-between px-4 h-11 border-b border-border">
        <div className="font-semibold text-sm">Classified</div>
        <div className="flex gap-1">
          <Button size="sm" variant="ghost" onClick={() => chrome.tabs.create({ url: "https://classified.vercel.app" })}>Web</Button>
          <Button size="sm" variant="ghost" onClick={() => void logout()}>Logout</Button>
        </div>
      </div>

      <div className="p-3 flex-1 overflow-y-auto">
        {query.error ? <Alert>{(query.error as Error).message}</Alert> : null}

        {matches.length > 0 ? (
          <div className="mb-3">
            <div className="text-xs text-muted-foreground px-1 mb-1">For this site ({hostname})</div>
            <div className="flex flex-col gap-1">
              {matches.map((r) => <RecordRow key={r.id} record={r} />)}
            </div>
          </div>
        ) : null}

        <Input
          placeholder="Search..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />

        <div className="flex flex-col gap-1 mt-3">
          {query.isLoading ? (
            <div className="text-sm text-muted-foreground text-center py-6">Loading…</div>
          ) : records.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-6">No records</div>
          ) : (
            records.map((r) => <RecordRow key={r.id} record={r} />)
          )}
        </div>

        {query.data && query.data.totalPages > 1 ? (
          <div className="flex items-center justify-between mt-3 text-xs">
            <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Prev</Button>
            <span className="text-muted-foreground">Page {query.data.page} of {query.data.totalPages}</span>
            <Button size="sm" variant="outline" disabled={page >= query.data.totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
          </div>
        ) : null}
      </div>

      <button
        type="button"
        onClick={onAdd}
        className="absolute bottom-4 right-4 h-11 w-11 rounded-full bg-primary text-white text-2xl leading-none shadow-lg hover:opacity-90"
        title="Add record"
      >
        +
      </button>
    </div>
  );
}
```

- [ ] **Step 6: Update `App.tsx` to show Vault when signed-in**

```tsx
import { useState } from "react";
import { AuthProvider, useAuth } from "./hooks/use-auth";
import { LoginScreen } from "./screens/login";
import { TwoFactorScreen } from "./screens/two-factor";
import { VaultScreen } from "./screens/vault";

type Screen = "vault" | "add";

function Root() {
  const { state } = useAuth();
  const [screen, setScreen] = useState<Screen>("vault");

  if (state.status === "loading") {
    return <div className="h-[500px] flex items-center justify-center bg-background text-muted-foreground text-sm">Loading…</div>;
  }
  if (state.status === "signed-out") return <LoginScreen />;
  if (state.status === "two-factor") return <TwoFactorScreen />;

  if (screen === "add") {
    return <div className="h-[500px] flex items-center justify-center bg-background text-foreground">Add — in next task <button onClick={() => setScreen("vault")} className="text-primary ml-2">back</button></div>;
  }
  return <VaultScreen onAdd={() => setScreen("add")} />;
}

export default function App() {
  return (
    <AuthProvider>
      <Root />
    </AuthProvider>
  );
}
```

- [ ] **Step 7: Build and manually verify**

Run: `bun run --filter=@classified/extension build`
Expected: build succeeds.

Reload extension. Sign in. Vault should show your records. Open the extension on `github.com` → if you have a matching record, it appears in "For this site" at top. Search filters. Copy buttons work.

- [ ] **Step 8: Commit**

```bash
git add apps/extension/src/popup
git commit -m "feat(extension): vault screen with search, matched records, and copy buttons"
```

---

## Task 10: Add-record screen

**Files:**
- Create: `apps/extension/src/popup/screens/add-record.tsx`
- Modify: `apps/extension/src/popup/App.tsx`

- [ ] **Step 1: Create `add-record.tsx`**

```tsx
import { useState, useEffect } from "react";
import { Input } from "../components/input";
import { Button } from "../components/button";
import { Alert } from "../components/alert";
import { useCreateRecord } from "../hooks/use-records";
import { useCurrentTabHostname } from "../hooks/use-current-tab";
import { useToast } from "../components/toast";
import { generatePassword } from "@/lib/generate-password";

type Props = { onDone: () => void };

export function AddRecordScreen({ onDone }: Props) {
  const hostname = useCurrentTabHostname();
  const [site, setSite] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();
  const create = useCreateRecord();

  useEffect(() => {
    if (hostname && !site) setSite(hostname);
  }, [hostname, site]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await create.mutateAsync({
        site: site || undefined,
        email: email || undefined,
        username: username || undefined,
        password: password || undefined,
      });
      toast("Record saved");
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    }
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col h-[500px] bg-background text-foreground">
      <div className="flex items-center justify-between px-4 h-11 border-b border-border">
        <div className="font-semibold text-sm">New record</div>
        <Button type="button" size="sm" variant="ghost" onClick={onDone}>Close</Button>
      </div>
      <div className="p-4 flex-1 overflow-y-auto flex flex-col gap-3">
        {error ? <Alert>{error}</Alert> : null}
        <Input placeholder="Site (e.g. github.com)" value={site} onChange={(e) => setSite(e.target.value)} />
        <Input placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
        <div className="flex gap-2">
          <Input
            placeholder="Password"
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="flex-1"
          />
          <Button type="button" variant="outline" onClick={() => setPassword(generatePassword())}>Generate</Button>
        </div>
      </div>
      <div className="p-3 border-t border-border flex gap-2">
        <Button type="button" variant="outline" onClick={onDone} className="flex-1">Cancel</Button>
        <Button type="submit" loading={create.isPending} className="flex-1">Save</Button>
      </div>
    </form>
  );
}
```

- [ ] **Step 2: Wire into `App.tsx`**

Replace the `screen === "add"` branch:

```tsx
  if (screen === "add") {
    return <AddRecordScreen onDone={() => setScreen("vault")} />;
  }
```

And add the import:

```tsx
import { AddRecordScreen } from "./screens/add-record";
```

- [ ] **Step 3: Build and manually verify**

Run: `bun run --filter=@classified/extension build`
Reload extension. From vault, click the `+` button → Add record appears with site prefilled. Save → returns to vault, new record shown.

- [ ] **Step 4: Commit**

```bash
git add apps/extension/src/popup
git commit -m "feat(extension): add-record screen with site prefill and password generator"
```

---

## Task 11: Icons + install docs

**Files:**
- Replace: `apps/extension/public/icons/icon-{16,32,48,128}.png`
- Modify: `apps/extension/README.md`

The placeholder icons from Task 1 are `logo.jpg` renamed to `.png` (wrong magic bytes — Chrome accepts it but Firefox / distribution validators will not). Produce real resized PNGs.

- [ ] **Step 1: Check for ImageMagick or sharp-cli**

Run: `magick -version 2>&1 | head -1 || sharp --version 2>&1 | head -1 || echo "no image tool"`

- [ ] **Step 2: If ImageMagick present, resize**

```bash
magick logo.jpg -resize 128x128 apps/extension/public/icons/icon-128.png
magick logo.jpg -resize 48x48 apps/extension/public/icons/icon-48.png
magick logo.jpg -resize 32x32 apps/extension/public/icons/icon-32.png
magick logo.jpg -resize 16x16 apps/extension/public/icons/icon-16.png
```

- [ ] **Step 3: If no ImageMagick, install sharp and run a tiny node script**

```bash
cd apps/extension
bun add -d sharp
node -e "import('sharp').then(({default:s})=>Promise.all([16,32,48,128].map(n=>s('../../logo.jpg').resize(n,n).png().toFile('public/icons/icon-'+n+'.png'))))"
cd ../..
```

- [ ] **Step 4: Build and verify manifest references resolve**

Run: `bun run --filter=@classified/extension build`
Expected: no errors about missing icons.

Reload in `chrome://extensions`. Toolbar icon now shows the real logo.

- [ ] **Step 5: Expand `apps/extension/README.md`**

```markdown
# @classified/extension

Chromium (MV3) browser extension for Classified. Auto-matches the current tab to your saved records and copies credentials to the clipboard.

## Dev

```bash
bun run --filter=@classified/extension dev
```

Writes an unpacked extension to `apps/extension/dist` and rebuilds on change.

## Build

```bash
bun run --filter=@classified/extension build
```

## Install (Chrome / Edge / Brave)

1. Open `chrome://extensions`
2. Enable "Developer mode" (top-right)
3. Click "Load unpacked"
4. Select `apps/extension/dist`
5. Pin the toolbar icon for quick access

## Environment

Set `VITE_API_URL` to override the default API endpoint:

```bash
VITE_API_URL=https://classified-api.vercel.app bun run --filter=@classified/extension build
```

## Tests

```bash
bun run --filter=@classified/extension test
```
```

- [ ] **Step 6: Commit**

```bash
git add apps/extension/public/icons apps/extension/README.md
git commit -m "chore(extension): real resized PNG icons and install docs"
```

---

## Task 12: Full verification pass

- [ ] **Step 1: Run all tests**

Run: `bun run --filter=@classified/extension test`
Expected: all pass.

- [ ] **Step 2: Run type-check**

Run: `bun run --filter=@classified/extension type-check`
Expected: no errors.

- [ ] **Step 3: Run full monorepo type-check**

Run: `bun run type-check`
Expected: no errors across workspaces.

- [ ] **Step 4: Production build**

Run: `bun run --filter=@classified/extension build`
Expected: `dist/` is rebuilt cleanly.

- [ ] **Step 5: Manual acceptance test**

Load `dist/` in Chrome. Confirm each of:
- Login with real creds works (with 2FA path too, if enabled on your account)
- Vault shows records, search filters live
- Open extension on `github.com` → matches surface at top (assuming you have a matching record)
- Copy buttons place the right value on clipboard; toast appears
- Add record prefills site with current hostname; Save refreshes the list
- Logout returns to Login and clears state
- Re-open extension after login → lands on Vault (refresh-token persistence)

- [ ] **Step 6: Final commit if anything moved**

```bash
git status
# If no changes, skip this step.
# Otherwise:
git add -p
git commit -m "chore(extension): final polish"
```
