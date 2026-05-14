import { Button } from "./button";

interface ErrorStateProps {
  actionLabel?: string;
  message?: string;
  onAction?: () => void;
  title?: string;
}

export function ErrorState({
  actionLabel,
  message = "Something went wrong. Try again.",
  onAction,
  title = "Unable to load data",
}: ErrorStateProps) {
  return (
    <div
      className="grid min-h-40 place-items-center rounded-md border border-danger/25 bg-danger-soft p-6 text-center"
      role="alert"
    >
      <div className="max-w-md space-y-3">
        <h2 className="text-base font-semibold text-danger-strong">{title}</h2>
        <p className="text-sm text-foreground">{message}</p>
        {actionLabel && onAction ? (
          <Button onClick={onAction} size="sm" variant="danger">
            {actionLabel}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
