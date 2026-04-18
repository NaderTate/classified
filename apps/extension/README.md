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
