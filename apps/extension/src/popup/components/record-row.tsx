import type { Record } from "@classified/shared";
import { CopyButton } from "./copy-button";

function Initials({ site }: { site: string | null | undefined }) {
  const ch = (site ?? "?").trim().charAt(0).toUpperCase() || "?";
  return (
    <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center text-sm text-muted-foreground">
      {ch}
    </div>
  );
}

export function RecordRow({ record }: { record: Record }) {
  const sub = record.username || record.email || "";
  return (
    <div className="flex items-center gap-3 px-3 py-2 hover:bg-muted rounded-lg">
      {record.icon ? (
        <img src={record.icon} alt="" className="h-9 w-9 rounded-lg object-cover" />
      ) : (
        <Initials site={record.site} />
      )}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate text-foreground">{record.site || "Untitled"}</div>
        {sub ? <div className="text-xs text-muted-foreground truncate">{sub}</div> : null}
      </div>
      <div className="flex items-center gap-1">
        {record.email ? <CopyButton value={record.email} label="email" icon={<span className="text-sm">@</span>} /> : null}
        {record.username ? <CopyButton value={record.username} label="username" icon={<span className="text-sm">👤</span>} /> : null}
        {record.password ? <CopyButton value={record.password} label="password" icon={<span className="text-sm">🔑</span>} /> : null}
      </div>
    </div>
  );
}
