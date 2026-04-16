import { Hono } from "hono";
import {
  LoginSchema,
  SignupSchema,
  TwoFactorSchema,
  RefreshTokenSchema,
  VerifyEmailSchema,
  ResetPasswordSchema,
  NewPasswordSchema,
  OAuthCodeSchema,
} from "@classified/shared";
import { prisma } from "../lib/prisma.js";
import { hashPassword, comparePassword } from "../utils/password.js";
import { signAccessToken, generateRefreshToken } from "../lib/jwt.js";
import {
  generateVerificationToken,
  generatePasswordResetToken,
  generateTwoFactorToken,
} from "../lib/tokens.js";
import { sendVerificationEmail, sendPasswordResetEmail, sendTwoFactorEmail } from "../lib/mail.js";

const auth = new Hono();

// Helper to create access + refresh token pair
async function createTokenPair(userId: string, email: string) {
  const accessToken = await signAccessToken({ sub: userId, email });
  const refreshToken = generateRefreshToken();
  const refreshTokenHash = await hashPassword(refreshToken);

  await prisma.refreshToken.create({
    data: {
      userId,
      tokenHash: refreshTokenHash,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
  });

  return { accessToken, refreshToken };
}

// POST /auth/signup
auth.post("/signup", async (c) => {
  const body = await c.req.json();
  const parsed = SignupSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "Invalid fields", details: parsed.error.flatten() }, 400);
  }

  const { name, email, password } = parsed.data;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser?.emailVerifiedAt) {
    return c.json({ error: "Email already in use" }, 409);
  }

  if (existingUser) {
    await prisma.user.delete({ where: { id: existingUser.id } });
  }

  const passwordHash = await hashPassword(password);
  await prisma.user.create({
    data: { name, email, passwordHash },
  });

  const { token } = await generateVerificationToken(email);
  await sendVerificationEmail(email, token);

  return c.json({ success: "Confirmation email sent" }, 201);
});

// POST /auth/login
auth.post("/login", async (c) => {
  const body = await c.req.json();
  const parsed = LoginSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "Invalid fields" }, 400);
  }

  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.passwordHash) {
    return c.json({ error: "Invalid credentials" }, 401);
  }

  const passwordValid = await comparePassword(password, user.passwordHash);
  if (!passwordValid) {
    return c.json({ error: "Invalid credentials" }, 401);
  }

  if (!user.emailVerifiedAt) {
    const { token } = await generateVerificationToken(email);
    await sendVerificationEmail(email, token);
    return c.json({ error: "Email not verified. Confirmation email sent." }, 403);
  }

  if (user.isTwoFactorEnabled) {
    const { code } = await generateTwoFactorToken(email);
    await sendTwoFactorEmail(email, code);
    return c.json({ twoFactor: true, email }, 200);
  }

  const tokens = await createTokenPair(user.id, user.email);
  return c.json(tokens, 200);
});

// POST /auth/two-factor
auth.post("/two-factor", async (c) => {
  const body = await c.req.json();
  const parsed = TwoFactorSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "Invalid fields" }, 400);
  }

  const { email, code } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return c.json({ error: "Invalid request" }, 400);
  }

  const tokens = await prisma.twoFactorToken.findMany({ where: { email } });
  let validToken = null;

  for (const t of tokens) {
    const isValid = await comparePassword(code, t.tokenHash);
    if (isValid) {
      validToken = t;
      break;
    }
  }

  if (!validToken) {
    return c.json({ error: "Invalid code" }, 401);
  }

  if (new Date() > validToken.expiresAt) {
    await prisma.twoFactorToken.delete({ where: { id: validToken.id } });
    return c.json({ error: "Code expired" }, 401);
  }

  await prisma.twoFactorToken.delete({ where: { id: validToken.id } });

  const authTokens = await createTokenPair(user.id, user.email);
  return c.json(authTokens, 200);
});

// POST /auth/refresh
auth.post("/refresh", async (c) => {
  const body = await c.req.json();
  const parsed = RefreshTokenSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "Refresh token required" }, 400);
  }

  const { refreshToken } = parsed.data;

  const storedTokens = await prisma.refreshToken.findMany({
    where: { revokedAt: null, expiresAt: { gt: new Date() } },
    include: { user: true },
  });

  let matchedToken = null;
  for (const stored of storedTokens) {
    const isValid = await comparePassword(refreshToken, stored.tokenHash);
    if (isValid) {
      matchedToken = stored;
      break;
    }
  }

  if (!matchedToken) {
    return c.json({ error: "Invalid refresh token" }, 401);
  }

  const accessToken = await signAccessToken({
    sub: matchedToken.user.id,
    email: matchedToken.user.email,
  });

  return c.json({ accessToken }, 200);
});

// POST /auth/logout
auth.post("/logout", async (c) => {
  const body = await c.req.json();
  const parsed = RefreshTokenSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "Refresh token required" }, 400);
  }

  const { refreshToken } = parsed.data;

  const storedTokens = await prisma.refreshToken.findMany({
    where: { revokedAt: null },
  });

  for (const stored of storedTokens) {
    const isValid = await comparePassword(refreshToken, stored.tokenHash);
    if (isValid) {
      await prisma.refreshToken.update({
        where: { id: stored.id },
        data: { revokedAt: new Date() },
      });
      break;
    }
  }

  return c.json({ success: "Logged out" }, 200);
});

// POST /auth/verify-email
auth.post("/verify-email", async (c) => {
  const body = await c.req.json();
  const parsed = VerifyEmailSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "Token required" }, 400);
  }

  const { token } = parsed.data;

  const verificationTokens = await prisma.verificationToken.findMany();
  let matchedToken = null;

  for (const vt of verificationTokens) {
    const isValid = await comparePassword(token, vt.tokenHash);
    if (isValid) {
      matchedToken = vt;
      break;
    }
  }

  if (!matchedToken) {
    return c.json({ error: "Invalid token" }, 400);
  }

  if (new Date() > matchedToken.expiresAt) {
    await prisma.verificationToken.delete({ where: { id: matchedToken.id } });
    return c.json({ error: "Token expired" }, 400);
  }

  const user = await prisma.user.findUnique({ where: { email: matchedToken.email } });
  if (!user) {
    return c.json({ error: "User not found" }, 400);
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { emailVerifiedAt: new Date(), email: matchedToken.email },
    }),
    prisma.verificationToken.delete({ where: { id: matchedToken.id } }),
  ]);

  return c.json({ success: "Email verified" }, 200);
});

// POST /auth/reset-password
auth.post("/reset-password", async (c) => {
  const body = await c.req.json();
  const parsed = ResetPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "Invalid email" }, 400);
  }

  const { email } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return c.json({ success: "If the email exists, a reset link has been sent" }, 200);
  }

  const { token } = await generatePasswordResetToken(email);
  await sendPasswordResetEmail(email, token);

  return c.json({ success: "If the email exists, a reset link has been sent" }, 200);
});

// POST /auth/new-password
auth.post("/new-password", async (c) => {
  const body = await c.req.json();
  const parsed = NewPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "Invalid fields" }, 400);
  }

  const { password, token } = parsed.data;

  const resetTokens = await prisma.passwordResetToken.findMany();
  let matchedToken = null;

  for (const rt of resetTokens) {
    const isValid = await comparePassword(token, rt.tokenHash);
    if (isValid) {
      matchedToken = rt;
      break;
    }
  }

  if (!matchedToken) {
    return c.json({ error: "Invalid token" }, 400);
  }

  if (new Date() > matchedToken.expiresAt) {
    await prisma.passwordResetToken.delete({ where: { id: matchedToken.id } });
    return c.json({ error: "Token expired" }, 400);
  }

  const user = await prisma.user.findUnique({ where: { email: matchedToken.email } });
  if (!user) {
    return c.json({ error: "User not found" }, 400);
  }

  const passwordHash = await hashPassword(password);

  await prisma.$transaction([
    prisma.user.update({ where: { id: user.id }, data: { passwordHash } }),
    prisma.passwordResetToken.delete({ where: { id: matchedToken.id } }),
  ]);

  return c.json({ success: "Password updated" }, 200);
});

// POST /auth/google
auth.post("/google", async (c) => {
  const body = await c.req.json();
  const parsed = OAuthCodeSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "Invalid fields" }, 400);
  }

  const { code, redirectUri } = parsed.data;

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      code,
      client_id: process.env.GOOGLE_ID,
      client_secret: process.env.GOOGLE_SECRET,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  if (!tokenRes.ok) {
    return c.json({ error: "Failed to exchange Google auth code" }, 400);
  }

  const tokenData = (await tokenRes.json()) as {
    access_token: string;
    refresh_token?: string;
    expires_in?: number;
    token_type?: string;
    id_token?: string;
    scope?: string;
  };

  const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });

  if (!userInfoRes.ok) {
    return c.json({ error: "Failed to get Google user info" }, 400);
  }

  const googleUser = (await userInfoRes.json()) as {
    id: string;
    email: string;
    name: string;
    picture: string;
  };

  let user = await prisma.user.findUnique({ where: { email: googleUser.email } });

  if (!user) {
    user = await prisma.user.create({
      data: {
        name: googleUser.name,
        email: googleUser.email,
        image: googleUser.picture,
        emailVerifiedAt: new Date(),
      },
    });
  } else if (!user.emailVerifiedAt) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: { emailVerifiedAt: new Date() },
    });
  }

  await prisma.account.upsert({
    where: {
      provider_providerAccountId: {
        provider: "google",
        providerAccountId: googleUser.id,
      },
    },
    create: {
      userId: user.id,
      provider: "google",
      providerAccountId: googleUser.id,
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresAt: tokenData.expires_in ? Math.floor(Date.now() / 1000) + tokenData.expires_in : null,
      tokenType: tokenData.token_type,
      idToken: tokenData.id_token,
      scope: tokenData.scope,
    },
    update: {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
    },
  });

  const tokens = await createTokenPair(user.id, user.email);
  return c.json(tokens, 200);
});

// POST /auth/github
auth.post("/github", async (c) => {
  const body = await c.req.json();
  const parsed = OAuthCodeSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "Invalid fields" }, 400);
  }

  const { code, redirectUri } = parsed.data;

  const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      code,
      client_id: process.env.GITHUB_ID,
      client_secret: process.env.GITHUB_SECRET,
      redirect_uri: redirectUri,
    }),
  });

  if (!tokenRes.ok) {
    return c.json({ error: "Failed to exchange GitHub auth code" }, 400);
  }

  const tokenData = (await tokenRes.json()) as {
    access_token?: string;
    token_type?: string;
    scope?: string;
    error?: string;
  };

  if (tokenData.error) {
    return c.json({ error: "GitHub auth failed" }, 400);
  }

  const userInfoRes = await fetch("https://api.github.com/user", {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });

  if (!userInfoRes.ok) {
    return c.json({ error: "Failed to get GitHub user info" }, 400);
  }

  const githubUser = (await userInfoRes.json()) as {
    id: number;
    email: string | null;
    name: string | null;
    avatar_url: string;
  };

  let email = githubUser.email;
  if (!email) {
    const emailsRes = await fetch("https://api.github.com/user/emails", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    if (emailsRes.ok) {
      const emails = (await emailsRes.json()) as Array<{
        email: string;
        primary: boolean;
        verified: boolean;
      }>;
      const primary = emails.find((e) => e.primary && e.verified);
      email = primary?.email || emails[0]?.email || null;
    }
  }

  if (!email) {
    return c.json({ error: "Could not retrieve email from GitHub" }, 400);
  }

  let user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    user = await prisma.user.create({
      data: {
        name: githubUser.name || email.split("@")[0],
        email,
        image: githubUser.avatar_url,
        emailVerifiedAt: new Date(),
      },
    });
  } else if (!user.emailVerifiedAt) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: { emailVerifiedAt: new Date() },
    });
  }

  await prisma.account.upsert({
    where: {
      provider_providerAccountId: {
        provider: "github",
        providerAccountId: githubUser.id.toString(),
      },
    },
    create: {
      userId: user.id,
      provider: "github",
      providerAccountId: githubUser.id.toString(),
      accessToken: tokenData.access_token,
      tokenType: tokenData.token_type,
      scope: tokenData.scope,
    },
    update: {
      accessToken: tokenData.access_token,
    },
  });

  const tokens = await createTokenPair(user.id, user.email);
  return c.json(tokens, 200);
});

export { auth as authRoutes };
