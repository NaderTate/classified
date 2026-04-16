import { handle } from "hono/vercel";

// Re-export the app — Vercel's bundler will follow the imports
// Need to use relative paths since Vercel doesn't read tsconfig paths
import app from "../src/index";

export const config = {
  runtime: "nodejs",
};

export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const DELETE = handle(app);
export const OPTIONS = handle(app);
export const PATCH = handle(app);
