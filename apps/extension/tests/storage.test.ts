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
