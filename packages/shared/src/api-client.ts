import type {
  AuthTokens,
  LoginInput,
  LoginResponse,
  SignupInput,
  TwoFactorInput,
  NewPasswordInput,
  VerifyEmailInput,
  ResetPasswordInput,
  OAuthCodeInput,
  CreateRecordInput,
  UpdateRecordInput,
  PaginatedRecords,
  Record as RecordType,
  UserProfile,
  ApiError,
  ApiSuccess,
} from "./types.js";

type TokenStore = {
  getAccessToken: () => string | null;
  getRefreshToken: () => string | null;
  setTokens: (tokens: AuthTokens) => void;
  clearTokens: () => void;
};

export function createApiClient(baseUrl: string, tokenStore: TokenStore) {
  async function request<T>(
    path: string,
    options: RequestInit = {},
  ): Promise<T> {
    const accessToken = tokenStore.getAccessToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    }

    let res = await fetch(`${baseUrl}${path}`, { ...options, headers });

    // If 401 and we have a refresh token, try silent refresh
    if (res.status === 401 && tokenStore.getRefreshToken()) {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        headers["Authorization"] = `Bearer ${tokenStore.getAccessToken()}`;
        res = await fetch(`${baseUrl}${path}`, { ...options, headers });
      }
    }

    if (!res.ok) {
      const error = await res.json().catch((): ApiError => ({ error: "Request failed" })) as ApiError;
      throw new ApiClientError(error.error, res.status);
    }

    return res.json() as Promise<T>;
  }

  async function refreshAccessToken(): Promise<boolean> {
    const refreshToken = tokenStore.getRefreshToken();
    if (!refreshToken) return false;

    try {
      const res = await fetch(`${baseUrl}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (!res.ok) {
        tokenStore.clearTokens();
        return false;
      }

      const data = (await res.json()) as { accessToken: string };
      tokenStore.setTokens({
        accessToken: data.accessToken,
        refreshToken,
      });
      return true;
    } catch {
      tokenStore.clearTokens();
      return false;
    }
  }

  return {
    auth: {
      login: (data: LoginInput) =>
        request<LoginResponse>("/auth/login", {
          method: "POST",
          body: JSON.stringify(data),
        }),
      signup: (data: SignupInput) =>
        request<ApiSuccess>("/auth/signup", {
          method: "POST",
          body: JSON.stringify(data),
        }),
      twoFactor: (data: TwoFactorInput) =>
        request<AuthTokens>("/auth/two-factor", {
          method: "POST",
          body: JSON.stringify(data),
        }),
      verifyEmail: (data: VerifyEmailInput) =>
        request<ApiSuccess>("/auth/verify-email", {
          method: "POST",
          body: JSON.stringify(data),
        }),
      resetPassword: (data: ResetPasswordInput) =>
        request<ApiSuccess>("/auth/reset-password", {
          method: "POST",
          body: JSON.stringify(data),
        }),
      newPassword: (data: NewPasswordInput) =>
        request<ApiSuccess>("/auth/new-password", {
          method: "POST",
          body: JSON.stringify(data),
        }),
      google: (data: OAuthCodeInput) =>
        request<AuthTokens>("/auth/google", {
          method: "POST",
          body: JSON.stringify(data),
        }),
      github: (data: OAuthCodeInput) =>
        request<AuthTokens>("/auth/github", {
          method: "POST",
          body: JSON.stringify(data),
        }),
      refresh: () => refreshAccessToken(),
      logout: (refreshToken: string) =>
        request<ApiSuccess>("/auth/logout", {
          method: "POST",
          body: JSON.stringify({ refreshToken }),
        }),
    },
    records: {
      list: (params?: { page?: number; search?: string; limit?: number }) => {
        const query = new URLSearchParams();
        if (params?.page) query.set("page", params.page.toString());
        if (params?.search) query.set("search", params.search);
        if (params?.limit) query.set("limit", params.limit.toString());
        const qs = query.toString();
        return request<PaginatedRecords>(`/records${qs ? `?${qs}` : ""}`);
      },
      get: (id: string) => request<RecordType>(`/records/${id}`),
      create: (data: CreateRecordInput) =>
        request<RecordType>("/records", {
          method: "POST",
          body: JSON.stringify(data),
        }),
      update: (id: string, data: UpdateRecordInput) =>
        request<RecordType>(`/records/${id}`, {
          method: "PUT",
          body: JSON.stringify(data),
        }),
      delete: (id: string) =>
        request<ApiSuccess>(`/records/${id}`, { method: "DELETE" }),
    },
    user: {
      me: () => request<UserProfile>("/user/me"),
      updateSettings: (data: Record<string, unknown>) =>
        request<UserProfile>("/user/settings", {
          method: "PUT",
          body: JSON.stringify(data),
        }),
    },
  };
}

export class ApiClientError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

export type ApiClient = ReturnType<typeof createApiClient>;
