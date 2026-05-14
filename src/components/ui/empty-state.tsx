import type { ReactNode } from "react";

interface EmptyStateProps {
  action?: ReactNode;
  message?: string;
  title?: string;
}

export function EmptyState({
  action,
  message = "There are no records to show yet.",
  title = "No data",
}: EmptyStateProps) {
  return (
    <div className="grid min-h-40 place-items-center rounded-md border border-dashed border-border-strong bg-surface p-6 text-center">
      <div className="max-w-md space-y-3">
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground">{message}</p>
        {action}
      </div>
    </div>
  );
}
