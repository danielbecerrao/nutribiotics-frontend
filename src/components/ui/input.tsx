import { cn } from "@/lib/utils/cn";
import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  hint?: string;
  label?: string;
}

export function Input({ className, error, hint, id, label, ...props }: InputProps) {
  const inputId = id ?? props.name;
  const helperText = error ?? hint;

  return (
    <label className="grid gap-1.5 text-sm font-medium text-foreground">
      {label ? <span>{label}</span> : null}
      <input
        aria-describedby={helperText && inputId ? `${inputId}-helper` : undefined}
        aria-invalid={Boolean(error)}
        className={cn(
          "h-10 w-full rounded-md border border-border-strong bg-surface px-3 text-sm text-foreground shadow-sm transition-colors",
          "placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20",
          "disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground",
          error && "border-danger focus:border-danger focus:ring-danger/20",
          className,
        )}
        id={inputId}
        {...props}
      />
      {helperText ? (
        <span
          className={cn(
            "text-xs font-normal",
            error ? "text-danger" : "text-muted-foreground",
          )}
          id={inputId ? `${inputId}-helper` : undefined}
        >
          {helperText}
        </span>
      ) : null}
    </label>
  );
}
