import { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "outline" | "ghost" | "destructive";
type Size = "sm" | "md";

const BASE = "inline-flex items-center justify-center rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
const VARIANTS: Record<Variant, string> = {
  primary: "bg-primary text-white hover:opacity-90",
  outline: "border border-border text-foreground hover:bg-muted",
  ghost: "text-foreground hover:bg-muted",
  destructive: "bg-destructive text-white hover:opacity-90",
};
const SIZES: Record<Size, string> = { sm: "h-8 px-3 text-sm", md: "h-10 px-4 text-sm" };

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
};

export function Button({ variant = "primary", size = "md", loading, className = "", children, disabled, ...rest }: Props) {
  return (
    <button
      className={`${BASE} ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? "…" : children}
    </button>
  );
}
