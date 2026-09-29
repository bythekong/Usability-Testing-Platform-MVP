import * as React from "react";
import { cn } from "@/lib/utils";

export interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: "success" | "warning" | "danger" | "neutral";
  children: React.ReactNode;
}

export function StatusBadge({ status, children, className, ...props }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold tracking-[0.01em]",
        {
          "border-success-text/15 bg-success-bg text-success-text": status === "success",
          "border-warning-text/15 bg-warning-bg text-warning-text": status === "warning",
          "border-danger-text/15 bg-danger-bg text-danger-text": status === "danger",
          "border-border bg-surface-subtle text-muted": status === "neutral",
        },
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
