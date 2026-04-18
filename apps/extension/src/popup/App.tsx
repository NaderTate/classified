import { useState } from "react";
import { AuthProvider, useAuth } from "./hooks/use-auth";
import { LoginScreen } from "./screens/login";
import { TwoFactorScreen } from "./screens/two-factor";
import { VaultScreen } from "./screens/vault";

type Screen = "vault" | "add";

function Root() {
  const { state } = useAuth();
  const [screen, setScreen] = useState<Screen>("vault");

  if (state.status === "loading") {
    return <div className="h-[500px] flex items-center justify-center bg-background text-muted-foreground text-sm">Loading…</div>;
  }
  if (state.status === "signed-out") return <LoginScreen />;
  if (state.status === "two-factor") return <TwoFactorScreen />;

  if (screen === "add") {
    return <div className="h-[500px] flex items-center justify-center bg-background text-foreground">Add — in next task <button onClick={() => setScreen("vault")} className="text-primary ml-2">back</button></div>;
  }
  return <VaultScreen onAdd={() => setScreen("add")} />;
}

export default function App() {
  return (
    <AuthProvider>
      <Root />
    </AuthProvider>
  );
}
