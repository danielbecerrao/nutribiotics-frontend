import { cn } from "@/lib/utils/cn";
import type { TextareaHTMLAttributes } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
  hint?: string;
  label?: string;
}

export function Textarea({
  className,
  error,
  hint,
  id,
  label,
  ...props
}: TextareaProps) {
  const textareaId = id ?? props.name;
  const helperText = error ?? hint;

  return (
    <label className="grid gap-1.5 text-sm font-medium text-foreground">
      {label ? <span>{label}</span> : null}
      <textarea
        aria-describedby={
          helperText && textareaId ? `${textareaId}-helper` : undefined
        }
        aria-invalid={Boolean(error)}
        className={cn(
          "min-h-28 w-full rounded-md border border-border-strong bg-surface px-3 py-2 text-sm text-foreground shadow-sm transition-colors",
          "placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20",
          "disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground",
          error && "border-danger focus:border-danger focus:ring-danger/20",
          className,
        )}
        id={textareaId}
        {...props}
      />
      {helperText ? (
        <span
          className={cn(
            "text-xs font-normal",
            error ? "text-danger" : "text-muted-foreground",
          )}
          id={textareaId ? `${textareaId}-helper` : undefined}
        >
          {helperText}
        </span>
      ) : null}
    </label>
  );
}
