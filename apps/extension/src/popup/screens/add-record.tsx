import { useState, useEffect } from "react";
import { Input } from "../components/input";
import { Button } from "../components/button";
import { Alert } from "../components/alert";
import { useCreateRecord } from "../hooks/use-records";
import { useCurrentTabHostname } from "../hooks/use-current-tab";
import { useToast } from "../components/toast";
import { generatePassword } from "@/lib/generate-password";

type Props = { onDone: () => void };

export function AddRecordScreen({ onDone }: Props) {
  const hostname = useCurrentTabHostname();
  const [site, setSite] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();
  const create = useCreateRecord();

  useEffect(() => {
    if (hostname && !site) setSite(hostname);
  }, [hostname, site]);

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
        <Input placeholder="Site (e.g. github.com)" value={site} onChange={(e) => setSite(e.target.value)} />
        <Input placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Input placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
        <div className="flex gap-2">
          <Input
            placeholder="Password"
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="flex-1"
          />
          <Button type="button" variant="outline" onClick={() => setPassword(generatePassword())}>Generate</Button>
        </div>
      </div>
      <div className="p-3 border-t border-border flex gap-2">
        <Button type="button" variant="outline" onClick={onDone} className="flex-1">Cancel</Button>
        <Button type="submit" loading={create.isPending} className="flex-1">Save</Button>
      </div>
    </form>
  );
}
