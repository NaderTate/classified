import { useState } from "react";
import { Input } from "../components/input";
import { Button } from "../components/button";
import { Alert } from "../components/alert";
import { useAuth } from "../hooks/use-auth";

const WEB_URL = "https://classified.vercel.app";

export function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col h-full p-5 gap-4 bg-background text-foreground">
      <div className="text-center pt-6 pb-2">
        <h1 className="text-xl font-bold">Classified</h1>
        <p className="text-sm text-muted-foreground mt-1">Sign in to your vault</p>
      </div>
      {error ? <Alert>{error}</Alert> : null}
      <div className="flex flex-col gap-3">
        <Input
          placeholder="you@example.com"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          placeholder="Password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Button type="submit" loading={loading}>Sign In</Button>
      </div>
      <div className="mt-auto text-center text-xs text-muted-foreground">
        No account?{" "}
        <button
          type="button"
          className="text-primary hover:underline"
          onClick={() => chrome.tabs.create({ url: WEB_URL })}
        >
          Open web app
        </button>
      </div>
    </form>
  );
}
