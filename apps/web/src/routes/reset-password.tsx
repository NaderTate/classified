import { createFileRoute } from "@tanstack/react-router";
import { Button, Card, Input, Spinner, TextField, Label, toast } from "@heroui/react";
import { useState } from "react";
import { api } from "@/lib/api-client";

export const Route = createFileRoute("/reset-password")({
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await api.auth.resetPassword({ email });
      setSent(true);
    } catch (err) {
      toast.danger(err instanceof Error ? err.message : "Failed to send reset email");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <Card className="w-full max-w-md">
        <Card.Header className="flex flex-col gap-1 items-center pb-0">
          <h1 className="text-2xl font-bold">Reset Password</h1>
        </Card.Header>
        <Card.Content>
          {sent ? (
            <div className="text-center flex flex-col gap-4">
              <p className="text-default-500">
                If an account with that email exists, we&apos;ve sent a reset link.
              </p>
              <a href="/login" className="text-primary">
                Back to login
              </a>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
              <Button type="submit" variant="primary" fullWidth isDisabled={isLoading}>
                {isLoading ? <Spinner size="sm" /> : "Send Reset Link"}
              </Button>
              <a href="/login" className="text-center text-sm text-primary">
                Back to login
              </a>
            </form>
          )}
        </Card.Content>
      </Card>
    </div>
  );
}
