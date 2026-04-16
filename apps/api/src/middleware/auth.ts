import type { Context, Next } from "hono";
import { verifyAccessToken } from "../lib/jwt.js";

declare module "hono" {
  interface ContextVariableMap {
    userId: string;
    userEmail: string;
  }
}

export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header("Authorization");
  if (!authHeader) {
    return c.json({ error: "Authorization header required" }, 401);
  }

  const token = authHeader.replace("Bearer ", "");
  if (!token || token === authHeader) {
    return c.json({ error: "Bearer token required" }, 401);
  }

  try {
    const payload = await verifyAccessToken(token);
    c.set("userId", payload.sub);
    c.set("userEmail", payload.email);
    await next();
  } catch {
    return c.json({ error: "Invalid or expired token" }, 401);
  }
}
