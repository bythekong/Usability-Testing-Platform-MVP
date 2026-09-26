"use client";

import * as React from "react";
import { Sidebar } from "./Sidebar";
import { cn } from "@/lib/utils";
import { Menu } from "lucide-react";
import { getUser } from "@/lib/auth";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);
  const [user, setUser] = React.useState<{ role: "OWNER" | "TESTER"; email: string; id: string } | null>(null);

  React.useEffect(() => {
    // Load sidebar state from localStorage
    const savedState = localStorage.getItem("sidebarCollapsed");
    if (savedState !== null) {
      setTimeout(() => {
        setIsCollapsed(JSON.parse(savedState));
      }, 0);
    }

    // Get current user for the sidebar
    const currentUser = getUser();
    if (currentUser) {
       setTimeout(() => {
         setUser(currentUser);
       }, 0);
    }
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
          "transition-all duration-300 ease-in-out min-h-screen flex flex-col",
          "md:pl-64", // default expanded
          isCollapsed && "md:pl-20" // collapsed state
        )}
      >
        {/* Mobile Header (visible only on mobile) */}
        <div className="md:hidden flex items-center h-16 px-4 border-b border-border bg-surface shrink-0">
          <button
            onClick={() => setIsMobileOpen(true)}
            className="p-2 -ml-2 rounded-md hover:bg-gray-100 text-muted"
          >
            <Menu className="w-6 h-6" />
          </button>
          <span className="ml-2 font-semibold text-foreground">Usability Testing</span>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-4 md:p-8 max-w-6xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
