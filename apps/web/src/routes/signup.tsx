import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button, Input, Card, CardBody, CardHeader } from "@heroui/react";
import { useState } from "react";
import { api } from "@/lib/api-client";
import toast from "react-hot-toast";

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
      toast.error(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-col gap-1 items-center pb-0">
          <h1 className="text-2xl font-bold">Create Account</h1>
          <p className="text-default-500 text-sm">Sign up for Classified</p>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input label="Name" value={name} onValueChange={setName} isRequired autoFocus />
            <Input label="Email" type="email" value={email} onValueChange={setEmail} isRequired />
            <Input
              label="Password"
              type="password"
              value={password}
              onValueChange={setPassword}
              isRequired
              description="Minimum 6 characters"
            />
            <Button type="submit" color="primary" isLoading={isLoading} fullWidth>
              Sign Up
            </Button>
            <p className="text-center text-sm text-default-500">
              Already have an account?{" "}
              <a href="/login" className="text-primary">
                Sign in
              </a>
            </p>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
