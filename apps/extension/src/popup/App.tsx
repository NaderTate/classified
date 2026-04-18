import { useState } from "react";
import { AuthProvider, useAuth } from "./hooks/use-auth";
import { LoginScreen } from "./screens/login";
import { TwoFactorScreen } from "./screens/two-factor";
import { VaultScreen } from "./screens/vault";
import { AddRecordScreen } from "./screens/add-record";

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
    return <AddRecordScreen onDone={() => setScreen("vault")} />;
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
