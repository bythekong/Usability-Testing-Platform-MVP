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
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
        {
          "bg-success-bg text-success-text": status === "success",
          "bg-warning-bg text-warning-text": status === "warning",
          "bg-danger-bg text-danger-text": status === "danger",
          "bg-gray-100 text-gray-700": status === "neutral",
        },
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
