import { createContext, useContext, useState, useCallback, ReactNode } from "react";

type ToastCtx = (message: string) => void;

const Ctx = createContext<ToastCtx | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);
  const show = useCallback((m: string) => {
    setMessage(m);
    window.setTimeout(() => setMessage(null), 1500);
  }, []);
  return (
    <Ctx.Provider value={show}>
      {children}
      {message ? (
        <div className="fixed bottom-3 left-1/2 -translate-x-1/2 bg-card border border-border px-3 py-1.5 rounded-lg text-sm shadow-lg">
          {message}
        </div>
      ) : null}
    </Ctx.Provider>
  );
}

export function useToast(): ToastCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("ToastProvider missing");
  return ctx;
}
