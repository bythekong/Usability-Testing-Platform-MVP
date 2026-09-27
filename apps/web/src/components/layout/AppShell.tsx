"use client";

import * as React from "react";
import { Menu } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { cn } from "@/lib/utils";
import { getUser } from "@/lib/auth";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);
  const [user, setUser] = React.useState<{ role: "OWNER" | "TESTER"; email: string; id: string } | null>(null);

  React.useEffect(() => {
    const savedState = localStorage.getItem("sidebarCollapsed");
    if (savedState !== null) {
      try {
        setIsCollapsed(JSON.parse(savedState));
      } catch {
        localStorage.removeItem("sidebarCollapsed");
      }
    }
    setUser(getUser());
  }, []);

  const handleSetCollapsed = (value: boolean) => {
    setIsCollapsed(value);
    localStorage.setItem("sidebarCollapsed", JSON.stringify(value));
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        user={user}
        isCollapsed={isCollapsed}
        setIsCollapsed={handleSetCollapsed}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      <main
        className={cn(
          "min-h-screen transition-[padding] duration-200 ease-out",
          isCollapsed ? "md:pl-20" : "md:pl-64"
        )}
      >
        <div className="flex h-16 items-center border-b border-border bg-surface px-4 md:hidden">
          <button
            type="button"
            onClick={() => setIsMobileOpen(true)}
            className="-ml-2 rounded-md p-2 text-muted transition hover:bg-gray-100 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="ml-2 font-semibold text-foreground">Usability Hub</span>
        </div>

        <div className="mx-auto w-full max-w-7xl p-4 sm:p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
