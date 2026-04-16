import type { Context, Next } from "hono";
import { prisma } from "../lib/prisma";

export async function ownershipMiddleware(c: Context, next: Next) {
  const recordId = c.req.param("id");
  if (!recordId) {
    await next();
    return;
  }

  const userId = c.get("userId");
  const record = await prisma.record.findUnique({ where: { id: recordId } });

  if (!record) {
    return c.json({ error: "Record not found" }, 404);
  }

  if (record.userId !== userId) {
    return c.json({ error: "Record not found" }, 404);
  }

  c.set("record" as never, record as never);
  await next();
}
