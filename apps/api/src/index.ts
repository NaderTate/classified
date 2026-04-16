import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { serve } from "@hono/node-server";

const app = new Hono();

// Middleware
app.use("*", logger());
app.use(
  "*",
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
  }),
);

// Health check
app.get("/health", (c) => c.json({ status: "ok" }));

// Dev server
if (process.env.NODE_ENV !== "production") {
  const port = parseInt(process.env.PORT || "3001", 10);
  console.log(`API server running on http://localhost:${port}`);
  serve({ fetch: app.fetch, port });
}

export default app;
