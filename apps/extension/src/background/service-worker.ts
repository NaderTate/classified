/// <reference types="vite/client" />
// Service worker runs as an ES module. Do not use top-level await without try/catch.
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
      return { ok: true };
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
