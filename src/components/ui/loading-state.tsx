import { cn } from "@/lib/utils/cn";

interface LoadingStateProps {
  className?: string;
  label?: string;
}

export function LoadingState({
  className,
  label = "Loading",
}: LoadingStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-40 items-center justify-center gap-3 rounded-md border border-border bg-surface p-6 text-sm text-muted-foreground",
        className,
      )}
      role="status"
    >
      <span
        aria-hidden="true"
        className="size-5 animate-spin rounded-full border-2 border-primary border-r-transparent"
      />
      <span>{label}</span>
    </div>
  );
}
