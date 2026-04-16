import { describe, it, expect } from "vitest";
import { Hono } from "hono";
import { authMiddleware } from "@/middleware/auth.js";
import { signAccessToken } from "@/lib/jwt.js";

function createTestApp() {
  const app = new Hono();
  app.use("/protected/*", authMiddleware);
  app.get("/protected/test", (c) => {
    const userId = c.get("userId");
    return c.json({ userId });
  });
  return app;
}

describe("auth middleware", () => {
  it("rejects requests without Authorization header", async () => {
    const app = createTestApp();
    const res = await app.request("/protected/test");
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBe("Authorization header required");
  });

  it("rejects requests with invalid token", async () => {
    const app = createTestApp();
    const res = await app.request("/protected/test", {
      headers: { Authorization: "Bearer invalid-token" },
    });
    expect(res.status).toBe(401);
  });

  it("allows requests with valid token and sets userId", async () => {
    const app = createTestApp();
    const token = await signAccessToken({ sub: "user-abc", email: "test@test.com" });
    const res = await app.request("/protected/test", {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.userId).toBe("user-abc");
  });

  it("rejects expired tokens", async () => {
    const app = createTestApp();
    const token = await signAccessToken({ sub: "user-abc", email: "test@test.com" }, "0s");
    await new Promise((r) => setTimeout(r, 50));
    const res = await app.request("/protected/test", {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status).toBe(401);
  });
});
