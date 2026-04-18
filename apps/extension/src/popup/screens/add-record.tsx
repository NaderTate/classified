import { useState, useEffect } from "react";
import { Input } from "../components/input";
import { Button } from "../components/button";
import { Alert } from "../components/alert";
import { useCreateRecord } from "../hooks/use-records";
import { useCurrentTabHostname } from "../hooks/use-current-tab";
import { useToast } from "../components/toast";
import { generatePassword } from "@/lib/generate-password";
import { searchKeywordForHost } from "@/lib/match";
import { EyeIcon, RefreshIcon } from "../components/icons";

type Props = { onDone: () => void };

export function AddRecordScreen({ onDone }: Props) {
  const hostname = useCurrentTabHostname();
  const [site, setSite] = useState("");
  const [siteTouched, setSiteTouched] = useState(false);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();
  const create = useCreateRecord();

  useEffect(() => {
    if (hostname && !siteTouched && site === "") {
      setSite(searchKeywordForHost(hostname));
    }
  }, [hostname, siteTouched, site]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await create.mutateAsync({
        site: site || undefined,
        email: email || undefined,
        username: username || undefined,
        password: password || undefined,
      });
      toast("Record saved");
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    }
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col h-[500px] bg-background text-foreground">
      <div className="flex items-center justify-between px-4 h-11 border-b border-border">
        <div className="font-semibold text-sm">New record</div>
        <Button type="button" size="sm" variant="ghost" onClick={onDone}>Close</Button>
      </div>
      <div className="p-4 flex-1 overflow-y-auto flex flex-col gap-3">
        {error ? <Alert>{error}</Alert> : null}
        <Input
          placeholder="Site (e.g. github)"
          value={site}
          onChange={(e) => {
            setSiteTouched(true);
            setSite(e.target.value);
          }}
        />
        <Input
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <Input
          placeholder="Password"
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          rightSlot={
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                title={showPassword ? "Hide" : "Show"}
                className={`h-6 w-6 flex items-center justify-center rounded ${showPassword ? "text-primary" : "text-muted-foreground"} hover:bg-muted`}
              >
                <EyeIcon open={showPassword} />
              </button>
              <button
                type="button"
                onClick={() => {
                  setPassword(generatePassword());
                  setShowPassword(true);
                }}
                title="Generate password"
                className="h-6 w-6 flex items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <RefreshIcon />
              </button>
            </div>
          }
        />
      </div>
      <div className="p-3 border-t border-border flex gap-2">
        <Button type="button" variant="outline" onClick={onDone} className="flex-1">Cancel</Button>
        <Button type="submit" loading={create.isPending} className="flex-1">Save</Button>
      </div>
    </form>
  );
}
