import { cn } from "@/lib/utils/cn";
import type { HTMLAttributes } from "react";

type BadgeTone = "neutral" | "success" | "warning" | "danger" | "info";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

const toneClasses: Record<BadgeTone, string> = {
  neutral: "border-border-strong bg-muted text-foreground",
  success: "border-success/30 bg-success-soft text-success-strong",
  warning: "border-warning/30 bg-warning-soft text-warning-strong",
  danger: "border-danger/30 bg-danger-soft text-danger-strong",
  info: "border-info/30 bg-info-soft text-info-strong",
};

export function Badge({
  children,
  className,
  tone = "neutral",
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center rounded-full border px-2.5 text-xs font-medium",
        toneClasses[tone],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
