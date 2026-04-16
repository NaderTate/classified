import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Button, Input, Card, CardBody, CardHeader } from "@heroui/react";
import { useState } from "react";
import { api } from "@/lib/api-client";
import toast from "react-hot-toast";

export const Route = createFileRoute("/new-password")({
  component: NewPasswordPage,
});

function NewPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (!token) {
      toast.error("Missing reset token");
      return;
    }

    setIsLoading(true);

    try {
      const result = await api.auth.newPassword({ password, token });
      toast.success(result.success);
      navigate({ to: "/login" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-col gap-1 items-center pb-0">
          <h1 className="text-2xl font-bold">New Password</h1>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="New Password"
              type="password"
              value={password}
              onValueChange={setPassword}
              isRequired
              description="Minimum 6 characters"
              autoFocus
            />
            <Button type="submit" color="primary" isLoading={isLoading} fullWidth>
              Reset Password
            </Button>
            <a href="/login" className="text-center text-sm text-primary">
              Back to login
            </a>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
