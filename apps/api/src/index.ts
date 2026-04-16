import { Hono, type Context, type Next } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { serve } from "@hono/node-server";
import { authRoutes } from "./routes/auth";
import { recordsRoutes } from "./routes/records";
import { userRoutes } from "./routes/user";

function createRateLimiter(windowMs: number, maxRequests: number) {
  const requests = new Map<string, { count: number; resetAt: number }>();

  return async function rateLimiter(c: Context, next: Next) {
    const key = c.req.header("x-forwarded-for") || c.req.header("cf-connecting-ip") || "unknown";
    const now = Date.now();
    const entry = requests.get(key);

    if (!entry || now > entry.resetAt) {
      requests.set(key, { count: 1, resetAt: now + windowMs });
      await next();
      return;
    }

    if (entry.count >= maxRequests) {
      return c.json({ error: "Too many requests" }, 429);
    }

    entry.count++;
    await next();
  };
}

const app = new Hono();

app.use("*", logger());
app.use(
  "*",
  cors({
    origin: (origin) => {
      const allowed = (process.env.CORS_ORIGIN || "http://localhost:5173").split(",");
      return allowed.includes(origin) ? origin : allowed[0];
    },
    credentials: true,
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  }),
);

// Rate limiting: 5 req/min for auth endpoints
app.use("/auth/*", createRateLimiter(60_000, 5));

app.get("/health", (c) => c.json({ status: "ok" }));

app.route("/auth", authRoutes);
app.route("/records", recordsRoutes);
app.route("/user", userRoutes);

if (process.env.NODE_ENV !== "production") {
  const port = parseInt(process.env.PORT || "3001", 10);
  console.log(`API server running on http://localhost:${port}`);
  serve({ fetch: app.fetch, port });
}

export default app;
