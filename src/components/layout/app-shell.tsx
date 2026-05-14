import type { ReactNode } from "react";

interface AppShellProps {
  actions?: ReactNode;
  children: ReactNode;
  description?: string;
  eyebrow?: string;
  title: string;
}

export function AppShell({
  actions,
  children,
  description,
  eyebrow,
  title,
}: AppShellProps) {
  return (
    <div className="min-h-full bg-background text-foreground">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="space-y-1">
            {eyebrow ? (
              <p className="text-xs font-semibold uppercase text-primary">
                {eyebrow}
              </p>
            ) : null}
            <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
            {description ? (
              <p className="max-w-3xl text-sm text-muted-foreground">
                {description}
              </p>
            ) : null}
          </div>
          {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
