import { randomBytes, randomInt } from "node:crypto";
import { hashPassword } from "../utils/password";
import { prisma } from "./prisma";

async function hashToken(token: string): Promise<string> {
  return hashPassword(token);
}

export async function generateVerificationToken(email: string) {
  const token = randomBytes(32).toString("hex");
  const tokenHash = await hashToken(token);
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await prisma.verificationToken.deleteMany({ where: { email } });

  await prisma.verificationToken.create({
    data: { email, tokenHash, expiresAt },
  });

  return { email, token };
}

export async function generatePasswordResetToken(email: string) {
  const token = randomBytes(32).toString("hex");
  const tokenHash = await hashToken(token);
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await prisma.passwordResetToken.deleteMany({ where: { email } });

  await prisma.passwordResetToken.create({
    data: { email, tokenHash, expiresAt },
  });

  return { email, token };
}

export async function generateTwoFactorToken(email: string) {
  const code = randomInt(100_000, 1_000_000).toString();
  const tokenHash = await hashToken(code);
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  await prisma.twoFactorToken.deleteMany({ where: { email } });

  await prisma.twoFactorToken.create({
    data: { email, tokenHash, expiresAt },
  });

  return { email, code };
}
