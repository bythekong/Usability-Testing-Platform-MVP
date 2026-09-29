import * as React from "react";
import { cn } from "@/lib/utils";

interface FormFieldProps {
  label: string;
  error?: string;
  htmlFor?: string;
  className?: string;
  children: React.ReactNode;
}

export function FormField({ label, error, htmlFor, className, children }: FormFieldProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={htmlFor} className="text-sm font-medium text-foreground">
        {label}
      </label>
      {children}
      {error && <p className="text-xs font-medium text-danger">{error}</p>}
    </div>
  );
}

const controlClassName =
  "w-full rounded-lg border border-border bg-background/70 px-3 text-sm text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] transition-[border-color,box-shadow,background-color] placeholder:text-muted/70 hover:border-primary/30 focus-visible:border-primary focus-visible:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/25 disabled:cursor-not-allowed disabled:bg-surface-subtle disabled:opacity-60";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        className={cn("h-10 py-2", controlClassName, className)}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn("min-h-[96px] py-2.5 leading-6", controlClassName, className)}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";
