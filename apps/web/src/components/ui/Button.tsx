import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-lg font-semibold transition-[background-color,border-color,color,box-shadow,transform] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:translate-y-px disabled:pointer-events-none disabled:opacity-45 disabled:shadow-none",
          {
            "border border-accent/70 bg-accent text-accent-foreground shadow-[0_1px_2px_rgba(0,0,0,0.12)] hover:border-accent-hover hover:bg-accent-hover":
              variant === "primary",
            "border border-border bg-surface-elevated text-foreground shadow-[0_1px_2px_rgba(0,0,0,0.05)] hover:bg-surface-subtle":
              variant === "secondary",
            "border border-border bg-transparent text-foreground hover:border-primary/45 hover:bg-surface-subtle":
              variant === "outline",
            "border border-danger/35 bg-danger text-white shadow-sm hover:brightness-95":
              variant === "danger",
            "bg-transparent text-muted hover:bg-surface-subtle hover:text-foreground":
              variant === "ghost",
            "h-8 px-3 text-xs": size === "sm",
            "h-10 px-4 py-2 text-sm": size === "md",
            "h-12 px-6 text-sm": size === "lg",
          },
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
