import { createApiClient } from "@classified/shared";
import * as SecureStore from "expo-secure-store";

const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3001";

const REFRESH_TOKEN_KEY = "classified_refresh_token";

let accessToken: string | null = null;

export const tokenStore = {
  getAccessToken: () => accessToken,
  getRefreshToken: () => {
    try {
      return SecureStore.getItem(REFRESH_TOKEN_KEY);
    } catch {
      return null;
    }
  },
  setTokens: (tokens: { accessToken: string; refreshToken: string }) => {
    accessToken = tokens.accessToken;
    try {
      SecureStore.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
    } catch {
      // SecureStore may fail on some devices
    }
  },
  clearTokens: () => {
    accessToken = null;
    try {
      SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    } catch {
      // ignore
    }
  },
};

export const api = createApiClient(API_URL, tokenStore);
