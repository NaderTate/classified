/**
 * One-time migration script: MongoDB JSON exports → Neon PostgreSQL
 * Migrates only the user nadertate@gmail.com and their records.
 *
 * Usage: cd apps/api && npx tsx ../../scripts/migrate.ts
 * Requires: NEON_URL and ENCRYPTION_KEY env vars set in apps/api/.env
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// Load env from apps/api/.env
import { config } from "dotenv";
config({ path: resolve(import.meta.dirname, "../apps/api/.env") });

import { PrismaClient } from "@prisma/client";
import { encrypt } from "../apps/api/src/lib/encryption.js";

const prisma = new PrismaClient();
const TARGET_EMAIL = "nadertate@gmail.com";
const OLD_USER_OID = "6599d271679d3bfc2c63a3e3";

interface OldUser {
  _id: { $oid: string };
  name: string;
  email: string;
  password?: string;
  image?: string;
  emailVerified?: { $date: string } | null;
  verifiedAt?: { $date: string } | null;
  isTwoFactorEnabled: boolean;
  createdAt: { $date: string };
  updatedAt: { $date: string };
}

interface OldRecord {
  _id: { $oid: string };
  site?: string;
  icon?: string;
  email?: string;
  username?: string;
  password?: string;
  userId: { $oid: string };
  createdAt: { $date: string };
  updatedAt: { $date: string };
}

async function main() {
  const dataDir = resolve(import.meta.dirname, "../old_data");

  const users: OldUser[] = JSON.parse(
    readFileSync(resolve(dataDir, "Records.users.json"), "utf-8"),
  );
  const records: OldRecord[] = JSON.parse(
    readFileSync(resolve(dataDir, "Records.Record.json"), "utf-8"),
  );

  // Find target user
  const oldUser = users.find((u) => u.email === TARGET_EMAIL);
  if (!oldUser) {
    console.error(`User ${TARGET_EMAIL} not found in export`);
    process.exit(1);
  }

  // Check if already migrated
  const existingUser = await prisma.user.findUnique({ where: { email: TARGET_EMAIL } });
  if (existingUser) {
    console.log(`User ${TARGET_EMAIL} already exists in PostgreSQL (id: ${existingUser.id}). Skipping.`);
    await prisma.$disconnect();
    return;
  }

  // Create user
  const emailVerifiedAt = oldUser.emailVerified?.$date || oldUser.verifiedAt?.$date || null;

  const newUser = await prisma.user.create({
    data: {
      name: oldUser.name,
      email: oldUser.email,
      passwordHash: oldUser.password || null,
      image: oldUser.image || null,
      emailVerifiedAt: emailVerifiedAt ? new Date(emailVerifiedAt) : null,
      isTwoFactorEnabled: oldUser.isTwoFactorEnabled,
    },
  });

  console.log(`Created user: ${newUser.name} (${newUser.email}) → ${newUser.id}`);

  // Filter records for this user
  const userRecords = records.filter((r) => r.userId.$oid === OLD_USER_OID);
  console.log(`Found ${userRecords.length} records to migrate`);

  let migrated = 0;
  for (const oldRecord of userRecords) {
    let encryptedPassword: string | null = null;
    let encryptionIv: string | null = null;

    if (oldRecord.password) {
      const encrypted = encrypt(oldRecord.password);
      encryptedPassword = encrypted.encryptedPassword;
      encryptionIv = encrypted.iv;
    }

    await prisma.record.create({
      data: {
        site: oldRecord.site || null,
        icon: oldRecord.icon || null,
        email: oldRecord.email || null,
        username: oldRecord.username || null,
        encryptedPassword,
        encryptionIv,
        userId: newUser.id,
      },
    });

    migrated++;
  }

  console.log(`\nMigration complete: ${migrated} records migrated for ${TARGET_EMAIL}`);
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("Migration failed:", err);
  prisma.$disconnect();
  process.exit(1);
});
