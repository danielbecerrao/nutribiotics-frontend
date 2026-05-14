import { cn } from "@/lib/utils/cn";
import type { SelectHTMLAttributes } from "react";

interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
  hint?: string;
  label?: string;
  options: SelectOption[];
  placeholder?: string;
}

export function Select({
  className,
  error,
  hint,
  id,
  label,
  options,
  placeholder,
  ...props
}: SelectProps) {
  const selectId = id ?? props.name;
  const helperText = error ?? hint;

  return (
    <label className="grid gap-1.5 text-sm font-medium text-foreground">
      {label ? <span>{label}</span> : null}
      <select
        aria-describedby={helperText && selectId ? `${selectId}-helper` : undefined}
        aria-invalid={Boolean(error)}
        className={cn(
          "h-10 w-full rounded-md border border-border-strong bg-surface px-3 text-sm text-foreground shadow-sm transition-colors",
          "focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:bg-muted",
          error && "border-danger focus:border-danger focus:ring-danger/20",
          className,
        )}
        id={selectId}
        {...props}
      >
        {placeholder ? <option value="">{placeholder}</option> : null}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {helperText ? (
        <span
          className={cn(
            "text-xs font-normal",
            error ? "text-danger" : "text-muted-foreground",
          )}
          id={selectId ? `${selectId}-helper` : undefined}
        >
          {helperText}
        </span>
      ) : null}
    </label>
  );
}
