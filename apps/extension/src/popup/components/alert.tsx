type Props = { children: React.ReactNode; tone?: "error" | "info" };

export function Alert({ children, tone = "error" }: Props) {
  const color = tone === "error" ? "border-destructive text-destructive" : "border-primary text-primary";
  return (
    <div className={`rounded-lg border ${color} bg-card px-3 py-2 text-sm`}>{children}</div>
  );
}
