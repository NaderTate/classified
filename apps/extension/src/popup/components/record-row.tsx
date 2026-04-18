import { useState } from "react";
import type { Record } from "@classified/shared";
import { useToast } from "./toast";
import { CopyIcon, EyeIcon } from "./icons";

function Initials({ site }: { site: string | null | undefined }) {
  const ch = (site ?? "?").trim().charAt(0).toUpperCase() || "?";
  return (
    <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center text-sm text-muted-foreground">
      {ch}
    </div>
  );
}

type FieldRowProps = {
  label: string;
  value: string;
  secret?: boolean;
};

function FieldRow({ label, value, secret = false }: FieldRowProps) {
  const toast = useToast();
  const [revealed, setRevealed] = useState(!secret);
  const displayValue = secret && !revealed ? "•".repeat(Math.min(value.length, 12)) : value;

  const onCopy = async () => {
    await navigator.clipboard.writeText(value);
    toast(`Copied ${label.toLowerCase()}`);
  };

  return (
    <div className="flex items-center gap-2">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground min-w-[36px]">
        {label}
      </div>
      <div className="flex-1 text-xs text-foreground truncate font-mono">{displayValue}</div>
      {secret ? (
        <button
          type="button"
          onClick={() => setRevealed((r) => !r)}
          title={revealed ? "Hide" : "Show"}
          className="h-6 w-6 flex items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <EyeIcon open={revealed} />
        </button>
      ) : null}
      <button
        type="button"
        onClick={onCopy}
        title={`Copy ${label.toLowerCase()}`}
        className="h-6 w-6 flex items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground"
      >
        <CopyIcon />
      </button>
    </div>
  );
}

export function RecordRow({ record }: { record: Record }) {
  const hasFields = record.email || record.username || record.password;

  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2.5 flex flex-col gap-2">
      <div className="flex items-center gap-2.5">
        {record.icon ? (
          <img src={record.icon} alt="" className="h-9 w-9 rounded-lg object-cover" />
        ) : (
          <Initials site={record.site} />
        )}
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold truncate text-foreground">
            {record.site || "Untitled"}
          </div>
        </div>
      </div>

      {hasFields ? (
        <div className="flex flex-col gap-1.5 pl-0.5">
          {record.email ? <FieldRow label="Email" value={record.email} /> : null}
          {record.username ? <FieldRow label="User" value={record.username} /> : null}
          {record.password ? <FieldRow label="Pass" value={record.password} secret /> : null}
        </div>
      ) : null}
    </div>
  );
}
