import { Hono } from "hono";
import { UpdateSettingsSchema } from "@classified/shared";
import { prisma } from "../lib/prisma.js";
import { authMiddleware } from "../middleware/auth.js";
import { hashPassword, comparePassword } from "../utils/password.js";
import { generateVerificationToken } from "../lib/tokens.js";
import { sendVerificationEmail } from "../lib/mail.js";

const user = new Hono();

user.use("*", authMiddleware);

// GET /user/me
user.get("/me", async (c) => {
  const userId = c.get("userId");

  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
    include: { accounts: { select: { provider: true } } },
  });

  if (!dbUser) {
    return c.json({ error: "User not found" }, 404);
  }

  return c.json({
    id: dbUser.id,
    name: dbUser.name,
    email: dbUser.email,
    image: dbUser.image,
    isOAuth: dbUser.accounts.length > 0,
    isTwoFactorEnabled: dbUser.isTwoFactorEnabled,
    createdAt: dbUser.createdAt.toISOString(),
  });
});

// PUT /user/settings
user.put("/settings", async (c) => {
  const userId = c.get("userId");
  const body = await c.req.json();
  const parsed = UpdateSettingsSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: "Invalid fields", details: parsed.error.flatten() }, 400);
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
    include: { accounts: { select: { provider: true } } },
  });

  if (!dbUser) {
    return c.json({ error: "User not found" }, 404);
  }

  const isOAuth = dbUser.accounts.length > 0;
  const values = parsed.data;

  if (isOAuth) {
    values.email = undefined;
    values.password = undefined;
    values.newPassword = undefined;
  }

  if (values.email && values.email !== dbUser.email) {
    const existing = await prisma.user.findUnique({ where: { email: values.email } });
    if (existing && existing.id !== userId) {
      return c.json({ error: "Email already in use" }, 409);
    }

    const { token } = await generateVerificationToken(values.email);
    await sendVerificationEmail(values.email, token);
    return c.json({ success: "Verification email sent" });
  }

  const updateData: Record<string, unknown> = {};

  if (values.password && values.newPassword && dbUser.passwordHash) {
    const valid = await comparePassword(values.password, dbUser.passwordHash);
    if (!valid) {
      return c.json({ error: "Incorrect current password" }, 400);
    }
    updateData.passwordHash = await hashPassword(values.newPassword);
  }

  if (values.name !== undefined) updateData.name = values.name;
  if (values.isTwoFactorEnabled !== undefined) {
    updateData.isTwoFactorEnabled = values.isTwoFactorEnabled;
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: updateData,
  });

  return c.json({
    id: updatedUser.id,
    name: updatedUser.name,
    email: updatedUser.email,
    image: updatedUser.image,
    isOAuth,
    isTwoFactorEnabled: updatedUser.isTwoFactorEnabled,
    createdAt: updatedUser.createdAt.toISOString(),
  });
});

export { user as userRoutes };
