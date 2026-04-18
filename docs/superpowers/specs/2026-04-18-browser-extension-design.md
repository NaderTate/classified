# Classified Browser Extension — Design

**Date:** 2026-04-18
**Status:** Approved for implementation

## Summary

A Chromium browser extension (Chrome, Edge, Brave) that lets users quickly look up saved credentials for the site they are on and copy them to the clipboard. Read + Create scope only — editing and deleting records stays on the web and mobile apps.

The extension is a new workspace in the existing Turborepo (`apps/extension/`) that reuses `@classified/shared` for schemas, types, and the API client. It talks to the existing production API; it does not require server-side changes.

## Goals

- Open popup → see records for the current tab auto-matched at the top → one click copies username / email / password.
- Add a new record for the current site without leaving the browser.
- Stay logged in across browser restarts, matching the convenience model of the web and mobile apps.

## Non-goals

- Form autofill (inject credentials into page inputs). Copy-to-clipboard only for v1.
- Edit or delete records from the popup.
- Firefox or Safari support. Chromium-only (MV3).
- OAuth (Google / GitHub) login in the extension.
- Chrome Web Store publishing. v1 is personal / "Load unpacked".
- Master-password / PIN lock. Can be added later behind a setting.

## Stack

- Vite 5 + `@crxjs/vite-plugin` — MV3 manifest bundling and HMR for popup + service worker.
- React 19 + TypeScript 5.
- Tailwind CSS (no HeroUI — popup is 360px wide and HeroUI is heavier than we need).
- `@tanstack/react-query` for fetch / cache (same version as web and mobile).
- `@classified/shared` — schemas, types, API client (workspace dep).

## File layout

```
apps/extension/
├── manifest.json            MV3 manifest (see Permissions below)
├── vite.config.ts           CRXJS plugin configured for MV3
├── tailwind.config.js
├── tsconfig.json
├── package.json             workspace: @classified/extension
├── src/
│   ├── popup/
│   │   ├── index.html
│   │   ├── main.tsx
│   │   ├── App.tsx          Screen router (login ↔ vault ↔ add-record)
│   │   ├── screens/
│   │   │   ├── login.tsx
│   │   │   ├── two-factor.tsx
│   │   │   ├── vault.tsx
│   │   │   └── add-record.tsx
│   │   └── components/      RecordRow, CopyButton, Input, Button, Toast
│   ├── background/
│   │   └── service-worker.ts    Auth + API proxy
│   ├── lib/
│   │   ├── storage.ts       Typed chrome.storage.local wrapper
│   │   ├── auth.ts          login, refresh, logout, 2FA
│   │   └── match.ts         Hostname → record matching (pure function)
│   └── styles/global.css
└── public/
    └── icons/               16/32/48/128 derived from logo.jpg
```

## Manifest (MV3)

- `manifest_version`: 3
- `name`: "Classified"
- `action.default_popup`: `src/popup/index.html`
- `background.service_worker`: `src/background/service-worker.ts` (`type: module`)
- `permissions`: `storage`, `activeTab`, `clipboardWrite`
- `host_permissions`: none — access tokens are sent to the known API origin only; `activeTab` is enough to read the current tab's URL on popup open
- `icons`: 16 / 32 / 48 / 128 from resized logo

## UI flows

### Popup dimensions

360px × 500px. The popup always renders inside that frame; the record list scrolls within it.

### Screen 1 — Login (no refresh token in storage)

- Classified logo + tagline "Sign in to Classified"
- Email input, password input
- "Sign In" button
- Footer link "No account? Open web app" → `chrome.tabs.create` with the production web URL
- On submit:
  - Success response `{ accessToken, refreshToken, user }` → save, navigate to Vault
  - Response `{ twoFactor: true, email }` → navigate to Two-factor, preserve email

### Screen 2 — Two-factor (post-login if 2FA enabled)

- "Enter the 6-digit code sent to your email"
- Single 6-character input (numeric keyboard hint)
- "Verify" button → `POST /auth/two-factor`
- "Back" → clears state, returns to Login

### Screen 3 — Vault (default when authenticated)

- Top bar:
  - Classified logo (left)
  - Kebab menu (right): Logout · Open web app
- "For this site (hostname)" section — only rendered when at least one record matches the current tab (see Matching). Shows up to 3 rows.
- Search input — live-filters all records by site / username / email (debounced 200ms)
- "All records" list — paginated 10 per page; Prev / Next buttons at the bottom
- Floating "+ Add" button bottom-right → navigates to Add record, prefilled with current tab's hostname

**Record row:**
- Icon avatar (40×40, falls back to initials circle)
- Site name (primary), username or email (secondary)
- Copy actions on the right, shown only when the row has the corresponding field:
  - `@` → copy email
  - 👤 → copy username
  - 🔑 → copy password
- Each click triggers `navigator.clipboard.writeText(value)` and shows a 1.5s toast at the bottom: "Copied email", "Copied password", etc.

### Screen 4 — Add record

- Header: "New record" + close button → back to Vault
- Fields: Site (prefilled with current tab hostname), Email, Username, Password
- "Generate password" button — 20-char random from the same charset used by the mobile form
- "Save" → `POST /records`, invalidate vault query, return to Vault
- "Cancel" → back to Vault

### Navigation

Simple `useState<"login" | "two-factor" | "vault" | "add-record">` in `App.tsx`. No router library — four screens and linear transitions don't justify it.

### Feedback

- Copy success: bottom toast, 1.5s, "Copied <field>"
- Inline alert banner for errors at the top of the active screen with the server's `message` if present, or a generic fallback

## Domain matching

Pure function in `lib/match.ts`:

```ts
function findMatches(currentHostname: string, records: Record[]): Record[]
```

### Algorithm

1. Normalize current hostname: lowercase, strip leading `www.`.
2. For each record, normalize `record.site`:
   - If it contains `://`, parse as URL and extract hostname; strip `www.`.
   - Otherwise, lowercase the string and use it as-is.
3. A record matches if any of:
   - Normalized site equals normalized hostname (exact).
   - Registrable domain of the hostname equals the normalized site (subdomain match).
   - Normalized site is a substring of the hostname (free-text entries like "github" match "github.com").
4. Rank: exact > registrable-domain > substring. Return top 3.

### Registrable domain

Split hostname by `.`, take the last two parts. If the second-to-last part is in a hardcoded 15-entry list of common two-part TLDs (`co.uk`, `com.au`, `co.jp`, `co.nz`, `com.br`, `co.za`, `com.mx`, `com.sg`, `com.tr`, `com.ar`, `co.in`, `co.il`, `com.hk`, `ac.uk`, `gov.uk`), take the last three.

We explicitly do not ship the full Public Suffix List (~30KB of rules for long-tail cases). The hardcoded list covers the common cases; misses fall back to substring matching and manual search.

## Auth & storage

### Sign-in

- `POST /auth/login` with `{ email, password }` — reuse `@classified/shared` api-client.
- On `{ twoFactor: true }` navigate to Two-factor; on success save tokens and navigate to Vault.
- 2FA submits `POST /auth/two-factor` with `{ email, code }`, same token response shape.

### Storage model

- `chrome.storage.local["refreshToken"]`: string, persisted across browser restarts (30-day API expiry).
- Access token: **in memory in the service worker only**. Never persisted.
- If the SW is torn down and a new popup open needs an access token, the SW calls `POST /auth/refresh` on first request.

### Service worker as API proxy

- Popup sends messages: `{ type: "api", method, path, body? }`
- SW attaches the current access token, forwards the request, returns the response.
- On 401: SW calls `POST /auth/refresh` with the stored refresh token, retries the original request once with the new access token.
- If refresh fails: SW clears `chrome.storage.local`, messages the popup → popup shows Login.

### Logout

`POST /auth/logout` (best-effort; ignore failure) → `chrome.storage.local.clear()` → navigate to Login.

## API integration

All endpoints from the existing production API via `@classified/shared` client:

- `POST /auth/login`
- `POST /auth/two-factor`
- `POST /auth/refresh`
- `POST /auth/logout`
- `GET /records?search=&page=&limit=50`
- `POST /records`

`VITE_API_URL` env var sets the base URL at build time; defaults to the production Vercel deployment.

## Error handling

- Network failure: banner "Can't reach Classified. Check your connection."
- 401 after one refresh retry: force logout, back to Login.
- 429 on `/auth/*`: banner "Too many attempts. Wait a minute."
- 5xx on record list: banner + retry button calling React Query's `refetch`.
- Other errors: inline alert with server `message` field if present, else "Something went wrong."

## Testing

- `lib/match.ts` — Vitest unit tests covering: exact hostname, subdomain, substring, URL-shaped site values, two-part TLD cases, case-insensitivity, `www.` stripping.
- `lib/storage.ts` — Vitest with a mocked `chrome.storage.local`.
- No E2E. Manual testing on a loaded unpacked extension is faster than setting up Puppeteer + extension loading for v1.

## Distribution

- `bun run --filter=@classified/extension build` produces `apps/extension/dist/`.
- Install via `chrome://extensions` → Load unpacked.
- Chrome Web Store publishing deferred.

## Out-of-scope for v1 (logged as future work)

- Form autofill via content scripts.
- Edit / delete from the popup.
- Master-password / PIN lock with idle timeout.
- Firefox / Safari ports.
- Google / GitHub OAuth in the extension.
- Chrome Web Store listing.
