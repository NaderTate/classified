import { useState } from "react";
import { Input } from "../components/input";
import { Button } from "../components/button";
import { Alert } from "../components/alert";
import { useAuth } from "../hooks/use-auth";

export function TwoFactorScreen() {
  const { verifyTwoFactor, cancelTwoFactor } = useAuth();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await verifyTwoFactor(code);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col h-full p-5 gap-4 bg-background text-foreground">
      <div className="text-center pt-6 pb-2">
        <h1 className="text-xl font-bold">Two-factor required</h1>
        <p className="text-sm text-muted-foreground mt-1">Enter the 6-digit code sent to your email</p>
      </div>
      {error ? <Alert>{error}</Alert> : null}
      <Input
        inputMode="numeric"
        maxLength={6}
        pattern="[0-9]{6}"
        placeholder="123456"
        value={code}
        onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
        required
      />
      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={cancelTwoFactor} className="flex-1">Back</Button>
        <Button type="submit" loading={loading} className="flex-1">Verify</Button>
      </div>
    </form>
  );
}
