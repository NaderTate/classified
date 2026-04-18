import { AuthProvider, useAuth } from "./hooks/use-auth";
import { LoginScreen } from "./screens/login";
import { TwoFactorScreen } from "./screens/two-factor";

function Root() {
  const { state } = useAuth();
  if (state.status === "loading") {
    return <div className="h-[500px] flex items-center justify-center bg-background text-muted-foreground text-sm">Loading…</div>;
  }
  if (state.status === "signed-out") return <LoginScreen />;
  if (state.status === "two-factor") return <TwoFactorScreen />;
  return <div className="h-[500px] flex items-center justify-center bg-background text-foreground">Signed in — vault in next task</div>;
}

export default function App() {
  return (
    <AuthProvider>
      <Root />
    </AuthProvider>
  );
}
