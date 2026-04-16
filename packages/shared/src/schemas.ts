import { z } from "zod";

// ── Auth Schemas ──

export const LoginSchema = z.object({
  email: z.string().email({ message: "Email is required" }),
  password: z.string().min(1, { message: "Password is required" }),
});

export const TwoFactorSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6, { message: "Code must be 6 digits" }),
});

export const SignupSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  email: z.string().email({ message: "Email is required" }),
  password: z.string().min(6, { message: "Minimum 6 characters required" }),
});

export const ResetPasswordSchema = z.object({
  email: z.string().email({ message: "Email is required" }),
});

export const NewPasswordSchema = z.object({
  password: z.string().min(6, { message: "Minimum 6 characters required" }),
  token: z.string().min(1, { message: "Token is required" }),
});

export const VerifyEmailSchema = z.object({
  token: z.string().min(1, { message: "Token is required" }),
});

export const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(1, { message: "Refresh token is required" }),
});

export const OAuthCodeSchema = z.object({
  code: z.string().min(1, { message: "Authorization code is required" }),
  redirectUri: z.string().url({ message: "Valid redirect URI is required" }),
});

// ── Record Schemas ──

export const CreateRecordSchema = z.object({
  site: z.string().optional(),
  icon: z.string().optional(),
  username: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  password: z.string().optional(),
});

export const UpdateRecordSchema = CreateRecordSchema.partial();

export const RecordQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  search: z.string().default(""),
  limit: z.coerce.number().int().positive().max(50).default(12),
});

// ── Settings Schema ──

export const UpdateSettingsSchema = z
  .object({
    name: z.string().min(1).optional(),
    email: z.string().email().optional(),
    isTwoFactorEnabled: z.boolean().optional(),
    password: z
      .union([z.string().min(6), z.string().length(0)])
      .optional()
      .transform((v) => (v === "" ? undefined : v)),
    newPassword: z
      .union([z.string().min(6), z.string().length(0)])
      .optional()
      .transform((v) => (v === "" ? undefined : v)),
  })
  .refine((data) => !(data.password && !data.newPassword), {
    message: "New password is required",
    path: ["newPassword"],
  })
  .refine((data) => !(data.newPassword && !data.password), {
    message: "Current password is required",
    path: ["password"],
  });
