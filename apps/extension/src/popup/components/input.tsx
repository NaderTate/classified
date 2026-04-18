import { InputHTMLAttributes, forwardRef } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & { rightSlot?: React.ReactNode };

export const Input = forwardRef<HTMLInputElement, Props>(function Input(
  { className = "", rightSlot, ...rest },
  ref,
) {
  return (
    <div className="relative flex items-center">
      <input
        ref={ref}
        className={`h-10 w-full rounded-lg bg-input border border-border px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary ${rightSlot ? "pr-10" : ""} ${className}`}
        {...rest}
      />
      {rightSlot ? <div className="absolute right-2">{rightSlot}</div> : null}
    </div>
  );
});
