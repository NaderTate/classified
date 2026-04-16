import type { z } from "zod";
import type {
  LoginSchema,
  SignupSchema,
  TwoFactorSchema,
  ResetPasswordSchema,
  NewPasswordSchema,
  VerifyEmailSchema,
  RefreshTokenSchema,
  OAuthCodeSchema,
  CreateRecordSchema,
  UpdateRecordSchema,
  RecordQuerySchema,
  UpdateSettingsSchema,
} from "./schemas.js";

// ── Request Types ──

export type LoginInput = z.infer<typeof LoginSchema>;
export type SignupInput = z.infer<typeof SignupSchema>;
export type TwoFactorInput = z.infer<typeof TwoFactorSchema>;
export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;
export type NewPasswordInput = z.infer<typeof NewPasswordSchema>;
export type VerifyEmailInput = z.infer<typeof VerifyEmailSchema>;
export type RefreshTokenInput = z.infer<typeof RefreshTokenSchema>;
export type OAuthCodeInput = z.infer<typeof OAuthCodeSchema>;
export type CreateRecordInput = z.infer<typeof CreateRecordSchema>;
export type UpdateRecordInput = z.infer<typeof UpdateRecordSchema>;
export type RecordQuery = z.infer<typeof RecordQuerySchema>;
export type UpdateSettingsInput = z.infer<typeof UpdateSettingsSchema>;

// ── Response Types ──

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface TwoFactorRequired {
  twoFactor: true;
  email: string;
}

export type LoginResponse = AuthTokens | TwoFactorRequired;

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  image: string | null;
  isOAuth: boolean;
  isTwoFactorEnabled: boolean;
  createdAt: string;
}

export interface Record {
  id: string;
  site: string | null;
  icon: string | null;
  email: string | null;
  username: string | null;
  password: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedRecords {
  records: Record[];
  resultsCount: number;
  totalCount: number;
  page: number;
  limit: number;
}

export interface ApiError {
  error: string;
}

export interface ApiSuccess {
  success: string;
}
