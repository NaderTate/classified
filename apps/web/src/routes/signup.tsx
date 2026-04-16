import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button, Card, Input, Spinner, toast } from "@heroui/react";
import { useState } from "react";
import { api } from "@/lib/api-client";

export const Route = createFileRoute("/signup")({
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await api.auth.signup({ name, email, password });
      toast.success(result.success);
      navigate({ to: "/login" });
    } catch (err) {
      toast.danger(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <Card className="w-full max-w-md">
        <Card.Header className="flex flex-col gap-1 items-center pb-0">
          <h1 className="text-2xl font-bold">Create Account</h1>
          <p className="text-default-500 text-sm">Sign up for Classified</p>
        </Card.Header>
        <Card.Content>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium">Name</span>
              <Input value={name} onChange={(e) => setName(e.target.value)} required autoFocus />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium">Email</span>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium">Password</span>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <span className="text-xs text-default-400">Minimum 6 characters</span>
            </label>
            <Button type="submit" variant="primary" fullWidth isDisabled={isLoading}>
              {isLoading ? <Spinner size="sm" /> : "Sign Up"}
            </Button>
            <p className="text-center text-sm text-default-500">
              Already have an account?{" "}
              <a href="/login" className="text-primary">
                Sign in
              </a>
            </p>
          </form>
        </Card.Content>
      </Card>
    </div>
  );
}
