import * as React from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ title, description, actions, className, ...props }: PageHeaderProps) {
  return (
    <div className={cn("mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end", className)} {...props}>
      <div className="max-w-3xl">
        <h1 className="text-2xl font-semibold tracking-[-0.02em] text-foreground">{title}</h1>
        {description && <p className="mt-1.5 text-sm leading-6 text-muted">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
