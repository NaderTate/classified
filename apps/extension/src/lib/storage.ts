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
