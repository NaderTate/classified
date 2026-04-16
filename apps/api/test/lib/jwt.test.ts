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
    expect(token1).toHaveLength(64);
    expect(token1).not.toBe(token2);
  });
});
