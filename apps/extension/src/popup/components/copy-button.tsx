import { useToast } from "./toast";

type Props = { value: string; label: string; icon: React.ReactNode };

export function CopyButton({ value, label, icon }: Props) {
  const toast = useToast();
  const onCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(value);
    toast(`Copied ${label}`);
  };
  return (
    <button
      type="button"
      onClick={onCopy}
      title={`Copy ${label}`}
      className="h-7 w-7 flex items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
    >
      {icon}
    </button>
  );
}
