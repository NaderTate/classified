import { createApiClient } from "@classified/shared";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

let accessToken: string | null = null;
let refreshToken: string | null = null;

export const tokenStore = {
  getAccessToken: () => accessToken,
  getRefreshToken: () => refreshToken,
  setTokens: (tokens: { accessToken: string; refreshToken: string }) => {
    accessToken = tokens.accessToken;
    refreshToken = tokens.refreshToken;
  },
  clearTokens: () => {
    accessToken = null;
    refreshToken = null;
  },
};

export const api = createApiClient(API_URL, tokenStore);
