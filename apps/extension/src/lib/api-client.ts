import type { PaginatedRecords, Record } from "@classified/shared";

type Envelope<T> = { ok: true; data: T } | { ok: false; error: string; status?: number };

export class SwApiError extends Error {
  constructor(
    message: string,
    public status?: number,
  ) {
    super(message);
    this.name = "SwApiError";
  }
}

async function send<T>(type: string, body?: unknown): Promise<T> {
  const res = (await chrome.runtime.sendMessage({ type, body })) as Envelope<T>;
  if (!res.ok) throw new SwApiError(res.error, res.status);
  return res.data;
}

export const swApi = {
  authStatus: () => send<{ authed: boolean }>("auth/status"),
  login: (body: { email: string; password: string }) =>
    send<{ twoFactor: true; email: string } | { ok: true }>("auth/login", body),
  twoFactor: (body: { email: string; code: string }) => send<{ ok: true }>("auth/two-factor", body),
  logout: () => send<{ ok: true }>("auth/logout"),
  listRecords: (body?: { search?: string; page?: number }) =>
    send<PaginatedRecords>("records/list", body),
  createRecord: (body: {
    site?: string;
    username?: string;
    email?: string;
    password?: string;
    icon?: string;
  }) => send<Record>("records/create", body),
};
