import { prisma } from "@/lib/prisma.js";
import { hashPassword } from "@/utils/password.js";

export async function createTestUser(overrides: Partial<{
  name: string;
  email: string;
  password: string;
  emailVerifiedAt: Date | null;
  isTwoFactorEnabled: boolean;
}> = {}) {
  const password = overrides.password || "Test123!";
  const passwordHash = await hashPassword(password);

  return prisma.user.create({
    data: {
      name: overrides.name || "Test User",
      email: overrides.email || `test-${Date.now()}@test.com`,
      passwordHash,
      emailVerifiedAt: overrides.emailVerifiedAt ?? new Date(),
      isTwoFactorEnabled: overrides.isTwoFactorEnabled ?? false,
    },
  });
}

export async function cleanupTestData() {
  await prisma.twoFactorToken.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.verificationToken.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.record.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();
}
