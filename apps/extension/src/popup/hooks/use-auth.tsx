import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { swApi } from "@/lib/api-client";

type AuthState =
  | { status: "loading" }
  | { status: "signed-out" }
  | { status: "two-factor"; email: string }
  | { status: "signed-in" };

type Ctx = {
  state: AuthState;
  login: (email: string, password: string) => Promise<void>;
  verifyTwoFactor: (code: string) => Promise<void>;
  cancelTwoFactor: () => void;
  logout: () => Promise<void>;
};

const AuthCtx = createContext<Ctx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: "loading" });

  useEffect(() => {
    swApi.authStatus().then((r) =>
      setState(r.authed ? { status: "signed-in" } : { status: "signed-out" }),
    );
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await swApi.login({ email, password });
    if ("twoFactor" in res) setState({ status: "two-factor", email: res.email });
    else setState({ status: "signed-in" });
  }, []);

  const verifyTwoFactor = useCallback(
    async (code: string) => {
      if (state.status !== "two-factor") return;
      await swApi.twoFactor({ email: state.email, code });
      setState({ status: "signed-in" });
    },
    [state],
  );

  const cancelTwoFactor = useCallback(() => setState({ status: "signed-out" }), []);

  const logout = useCallback(async () => {
    await swApi.logout();
    setState({ status: "signed-out" });
  }, []);

  return (
    <AuthCtx.Provider value={{ state, login, verifyTwoFactor, cancelTwoFactor, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("AuthProvider missing");
  return ctx;
}
