import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button, Card, Input, Separator, Spinner, TextField, Label, toast } from "@heroui/react";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/lib/api-client";
import { FaGithub, FaGoogle } from "react-icons/fa";
import type { LoginResponse } from "@classified/shared";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { login, loginWithTwoFactor, loginWithTokens } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [twoFactorEmail, setTwoFactorEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result: LoginResponse = await login({ email, password });
      if ("twoFactor" in result) {
        setShowTwoFactor(true);
        setTwoFactorEmail(result.email);
        toast.success("2FA code sent to your email");
      } else {
        navigate({ to: "/" });
      }
    } catch (err) {
      toast.danger(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTwoFactor = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await loginWithTwoFactor({ email: twoFactorEmail, code });
      navigate({ to: "/" });
    } catch (err) {
      toast.danger(err instanceof Error ? err.message : "Invalid code");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuth = (provider: "google" | "github") => {
    const clientId =
      provider === "google"
        ? import.meta.env.VITE_GOOGLE_CLIENT_ID
        : import.meta.env.VITE_GITHUB_CLIENT_ID;
    const redirectUri = `${window.location.origin}/login`;

    const url =
      provider === "google"
        ? `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=openid%20email%20profile`
        : `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=user:email`;

    window.location.href = url;
  };

  // Handle OAuth callback
  const searchParams = new URLSearchParams(window.location.search);
  const oauthCode = searchParams.get("code");
  if (oauthCode && !isLoading) {
    setIsLoading(true);
    const redirectUri = `${window.location.origin}/login`;
    const isGithub = !searchParams.has("scope");
    const handler = isGithub ? api.auth.github : api.auth.google;
    handler({ code: oauthCode, redirectUri })
      .then((tokens) => {
        loginWithTokens(tokens);
        window.history.replaceState({}, "", "/login");
        navigate({ to: "/" });
      })
      .catch((err) => {
        toast.danger(err instanceof Error ? err.message : "OAuth login failed");
        window.history.replaceState({}, "", "/login");
        setIsLoading(false);
      });
  }

  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <Card className="w-full max-w-md">
        <Card.Header className="flex flex-col gap-1 items-center pb-0">
          <h1 className="text-2xl font-bold">Welcome Back</h1>
          <p className="text-default-500 text-sm">Sign in to Classified</p>
        </Card.Header>
        <Card.Content className="flex flex-col gap-4">
          {showTwoFactor ? (
            <form onSubmit={handleTwoFactor} className="flex flex-col gap-4">
              <p className="text-sm text-default-500 text-center">
                Enter the 6-digit code sent to your email
              </p>
              <TextField>
                <Label>Verification Code</Label>
                <Input
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  maxLength={6}
                  autoFocus
                />
              </TextField>
              <Button type="submit" variant="primary" fullWidth isDisabled={isLoading}>
                {isLoading ? <Spinner size="sm" /> : "Verify"}
              </Button>
              <Button variant="ghost" size="sm" onPress={() => setShowTwoFactor(false)}>
                Back to login
              </Button>
            </form>
          ) : (
            <>
              <form onSubmit={handleLogin} className="flex flex-col gap-4">
                <TextField>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                  />
                </TextField>
                <TextField>
                  <Label>Password</Label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </TextField>
                <div className="flex justify-end">
                  <a href="/reset-password" className="text-sm text-primary">
                    Forgot password?
                  </a>
                </div>
                <Button type="submit" variant="primary" fullWidth isDisabled={isLoading}>
                  {isLoading ? <Spinner size="sm" /> : "Sign In"}
                </Button>
              </form>

              <Separator />

              <div className="flex gap-2">
                <Button variant="outline" fullWidth onPress={() => handleOAuth("google")}>
                  <FaGoogle />
                  Google
                </Button>
                <Button variant="outline" fullWidth onPress={() => handleOAuth("github")}>
                  <FaGithub />
                  GitHub
                </Button>
              </div>

              <p className="text-center text-sm text-default-500">
                Don&apos;t have an account?{" "}
                <a href="/signup" className="text-primary">
                  Sign up
                </a>
              </p>
            </>
          )}
        </Card.Content>
      </Card>
    </div>
  );
}
