import { SignJWT, jwtVerify } from "jose";
import { randomBytes } from "node:crypto";

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set");
  return new TextEncoder().encode(secret);
}

export interface AccessTokenPayload {
  sub: string;
  email: string;
}

export async function signAccessToken(
  payload: AccessTokenPayload,
  expiresIn = "15m",
): Promise<string> {
  return new SignJWT({ email: payload.email })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(getSecret());
}

export async function verifyAccessToken(token: string): Promise<AccessTokenPayload> {
  const { payload } = await jwtVerify(token, getSecret());
  if (!payload.sub || !payload.email) {
    throw new Error("Invalid token payload");
  }
  return { sub: payload.sub, email: payload.email as string };
}

export function generateRefreshToken(): string {
  return randomBytes(32).toString("hex");
}
