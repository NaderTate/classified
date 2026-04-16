import { createFileRoute } from "@tanstack/react-router";
import { Card, Spinner } from "@heroui/react";
import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";

export const Route = createFileRoute("/verify-email")({
  component: VerifyEmailPage,
});

function VerifyEmailPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (!token) {
      setStatus("error");
      setMessage("Missing verification token");
      return;
    }

    api.auth
      .verifyEmail({ token })
      .then((res) => {
        setStatus("success");
        setMessage(res.success);
      })
      .catch((err) => {
        setStatus("error");
        setMessage(err instanceof Error ? err.message : "Verification failed");
      });
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <Card className="w-full max-w-md text-center">
        <Card.Content className="flex flex-col gap-4 items-center py-8">
          {status === "loading" && <Spinner size="lg" />}
          {status === "success" && (
            <>
              <p className="text-lg text-success">{message}</p>
              <a href="/login" className="text-primary">
                Go to login
              </a>
            </>
          )}
          {status === "error" && (
            <>
              <p className="text-lg text-danger">{message}</p>
              <a href="/login" className="text-primary">
                Back to login
              </a>
            </>
          )}
        </Card.Content>
      </Card>
    </div>
  );
}
