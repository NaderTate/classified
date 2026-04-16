import { createApiClient } from "@classified/shared";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";
const REFRESH_TOKEN_KEY = "classified_refresh_token";

let accessToken: string | null = null;

export const tokenStore = {
  getAccessToken: () => accessToken,
  getRefreshToken: () => {
    try {
      return localStorage.getItem(REFRESH_TOKEN_KEY);
    } catch {
      return null;
    }
  },
  setTokens: (tokens: { accessToken: string; refreshToken: string }) => {
    accessToken = tokens.accessToken;
    try {
      localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
    } catch {
      // localStorage unavailable
    }
  },
  clearTokens: () => {
    accessToken = null;
    try {
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    } catch {
      // localStorage unavailable
    }
  },
};

export const api = createApiClient(API_URL, tokenStore);
