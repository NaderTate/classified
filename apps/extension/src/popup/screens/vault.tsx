import { useEffect, useMemo, useState } from "react";
import { Input } from "../components/input";
import { Button } from "../components/button";
import { Alert } from "../components/alert";
import { RecordRow } from "../components/record-row";
import { useRecords } from "../hooks/use-records";
import { useCurrentTabHostname } from "../hooks/use-current-tab";
import { findMatches } from "@/lib/match";
import { useAuth } from "../hooks/use-auth";
import { PlusIcon } from "../components/icons";
import type { Record } from "@classified/shared";

const WEB_URL = "https://classifiedd.vercel.app/";

type Props = { onAdd: () => void };

export function VaultScreen({ onAdd }: Props) {
  const { logout } = useAuth();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const hostname = useCurrentTabHostname();

  useEffect(() => {
    const id = window.setTimeout(() => setDebouncedSearch(search), 200);
    return () => window.clearTimeout(id);
  }, [search]);

  const query = useRecords({ search: debouncedSearch, page });

  const records = (query.data?.records ?? []) as Record[];
  const totalPages = query.data
    ? Math.max(1, Math.ceil(query.data.totalCount / query.data.limit))
    : 1;
  const matches = useMemo(
    () => (hostname ? findMatches(hostname, records) : []),
    [hostname, records],
  );

  return (
    <div className="flex flex-col h-[500px] bg-background text-foreground">
      <div className="flex items-center justify-between px-4 h-11 border-b border-border">
        <div className="font-semibold text-sm">Classified</div>
        <div className="flex gap-1">
          <Button size="sm" variant="ghost" onClick={() => chrome.tabs.create({ url: WEB_URL })}>Web</Button>
          <Button size="sm" variant="ghost" onClick={() => void logout()}>Logout</Button>
        </div>
      </div>

      <div className="p-3 flex-1 overflow-y-auto">
        {query.error ? <Alert>{(query.error as Error).message}</Alert> : null}

        {matches.length > 0 ? (
          <div className="mb-3">
            <div className="text-xs text-muted-foreground px-1 mb-1.5">For this site ({hostname})</div>
            <div className="flex flex-col gap-2">
              {matches.map((r) => <RecordRow key={r.id} record={r} />)}
            </div>
          </div>
        ) : null}

        <Input
          placeholder="Search..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />

        <div className="flex flex-col gap-2 mt-3">
          {query.isLoading ? (
            <div className="text-sm text-muted-foreground text-center py-6">Loading…</div>
          ) : records.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-6">No records</div>
          ) : (
            records.map((r) => <RecordRow key={r.id} record={r} />)
          )}
        </div>

        {query.data && totalPages > 1 ? (
          <div className="flex items-center justify-between mt-3 text-xs">
            <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Prev</Button>
            <span className="text-muted-foreground">Page {query.data.page} of {totalPages}</span>
            <Button size="sm" variant="outline" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
          </div>
        ) : null}
      </div>

      <button
        type="button"
        onClick={onAdd}
        className="absolute bottom-4 right-4 h-11 w-11 rounded-full bg-primary text-white flex items-center justify-center shadow-lg hover:opacity-90"
        title="Add record"
      >
        <PlusIcon />
      </button>
    </div>
  );
}
