import * as React from "react";
import { cn } from "@/lib/utils";
import { Globe } from "lucide-react";

interface TargetIconProps extends React.HTMLAttributes<HTMLDivElement> {
  url: string;
}

export function TargetIcon({ url, className, ...props }: TargetIconProps) {
  let hostname = "";
  try {
    hostname = new URL(url).hostname;
  } catch {
    // Invalid URL fallback
  }

  const initial = hostname ? hostname.charAt(0).toUpperCase() : "";

  return (
    <div
      className={cn(
        "flex items-center justify-center w-8 h-8 rounded-md border border-border bg-gray-50 text-muted",
        className
      )}
      title={hostname || url}
      {...props}
    >
      {initial ? (
        <span className="text-xs font-semibold">{initial}</span>
      ) : (
        <Globe className="w-4 h-4" />
      )}
    </div>
  );
}
