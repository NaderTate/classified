import { Hono } from "hono";
import { CreateRecordSchema, UpdateRecordSchema, RecordQuerySchema } from "@classified/shared";
import { prisma } from "../lib/prisma";
import { encrypt, decrypt } from "../lib/encryption";
import { authMiddleware } from "../middleware/auth";
import { ownershipMiddleware } from "../middleware/ownership";
import type { Record as PrismaRecord } from "@prisma/client";

const records = new Hono();

records.use("*", authMiddleware);
records.use("/:id", ownershipMiddleware);
records.use("/:id/*", ownershipMiddleware);

function decryptRecord(record: PrismaRecord) {
  return {
    id: record.id,
    site: record.site,
    icon: record.icon,
    email: record.email,
    username: record.username,
    password:
      record.encryptedPassword && record.encryptionIv
        ? decrypt(record.encryptedPassword, record.encryptionIv)
        : null,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

// GET /records
records.get("/", async (c) => {
  const userId = c.get("userId");
  const query = RecordQuerySchema.safeParse({
    page: c.req.query("page"),
    search: c.req.query("search"),
    limit: c.req.query("limit"),
  });

  if (!query.success) {
    return c.json({ error: "Invalid query parameters" }, 400);
  }

  const { page, search, limit } = query.data;

  const where = {
    userId,
    ...(search
      ? { site: { contains: search, mode: "insensitive" as const } }
      : {}),
  };

  const [dbRecords, resultsCount, totalCount] = await Promise.all([
    prisma.record.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: (page - 1) * limit,
    }),
    prisma.record.count({ where }),
    prisma.record.count({ where: { userId } }),
  ]);

  return c.json({
    records: dbRecords.map(decryptRecord),
    resultsCount,
    totalCount,
    page,
    limit,
  });
});

// GET /records/:id
records.get("/:id", async (c) => {
  const record = c.get("record" as never) as PrismaRecord;
  return c.json(decryptRecord(record));
});

// POST /records
records.post("/", async (c) => {
  const userId = c.get("userId");
  const body = await c.req.json();
  const parsed = CreateRecordSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: "Invalid fields", details: parsed.error.flatten() }, 400);
  }

  const { password, ...rest } = parsed.data;

  let encryptedPassword: string | null = null;
  let encryptionIv: string | null = null;

  if (password) {
    const encrypted = encrypt(password);
    encryptedPassword = encrypted.encryptedPassword;
    encryptionIv = encrypted.iv;
  }

  const record = await prisma.record.create({
    data: {
      ...rest,
      encryptedPassword,
      encryptionIv,
      userId,
    },
  });

  return c.json(decryptRecord(record), 201);
});

// PUT /records/:id
records.put("/:id", async (c) => {
  const recordId = c.req.param("id");
  const body = await c.req.json();
  const parsed = UpdateRecordSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: "Invalid fields", details: parsed.error.flatten() }, 400);
  }

  const { password, ...rest } = parsed.data;

  const updateData: Record<string, unknown> = { ...rest };

  if (password !== undefined) {
    if (password) {
      const encrypted = encrypt(password);
      updateData.encryptedPassword = encrypted.encryptedPassword;
      updateData.encryptionIv = encrypted.iv;
    } else {
      updateData.encryptedPassword = null;
      updateData.encryptionIv = null;
    }
  }

  const record = await prisma.record.update({
    where: { id: recordId },
    data: updateData,
  });

  return c.json(decryptRecord(record));
});

// DELETE /records/:id
records.delete("/:id", async (c) => {
  const recordId = c.req.param("id");
  await prisma.record.delete({ where: { id: recordId } });
  return c.json({ success: "Record deleted" });
});

export { records as recordsRoutes };
