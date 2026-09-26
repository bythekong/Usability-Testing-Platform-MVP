"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Briefcase,
  Search,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
  X,
  User as UserIcon
} from "lucide-react";
import { logout } from "@/lib/auth";

interface SidebarProps {
  user: {
    role: "OWNER" | "TESTER";
    email: string;
    id: string;
  } | null;
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (value: boolean) => void;
}

export function Sidebar({ user, isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const navItems = user?.role === "OWNER"
    ? [
        { name: "Dashboard", href: "/owner", icon: LayoutDashboard },
        { name: "Campaigns", href: "/owner/campaigns", icon: FolderKanban },
      ]
    : [
        { name: "Dashboard", href: "/tester", icon: LayoutDashboard },
        { name: "My Jobs", href: "/tester/jobs", icon: Briefcase },
        { name: "Extension Sync", href: "/tester/extension", icon: CheckSquare },
      ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-surface border-r border-border">
      {/* Header */}
      <div className={cn("flex items-center h-16 px-4 border-b border-border", isCollapsed ? "justify-center" : "justify-between")}>
        {!isCollapsed && <span className="font-semibold text-foreground truncate">Usability Testing</span>}
        <div className="flex items-center">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex p-1.5 rounded-md hover:bg-gray-100 text-muted"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
          </button>
          <button
            onClick={() => setIsMobileOpen(false)}
            className="md:hidden p-1.5 rounded-md hover:bg-gray-100 text-muted ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Nav Links */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navItems.map((item) => {
          // Exact match for dashboard roots, prefix match for subroutes
          const isDashboard = item.href === '/owner' || item.href === '/tester';
          const isActive = isDashboard ? pathname === item.href : (pathname === item.href || pathname.startsWith(`${item.href}/`));

          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsMobileOpen(false)}
              className={cn(
                "flex items-center px-3 py-2 rounded-md transition-colors group",
                isActive
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted hover:bg-gray-50 hover:text-foreground",
                isCollapsed ? "justify-center" : "justify-start"
              )}
              title={isCollapsed ? item.name : undefined}
            >
              <Icon className={cn("w-5 h-5 flex-shrink-0", isActive ? "text-primary" : "text-muted group-hover:text-foreground", isCollapsed ? "" : "mr-3")} />
              {!isCollapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </div>

      {/* Footer / User Profile */}
      <div className="p-4 border-t border-border">
        {user ? (
          <div className={cn("flex items-center", isCollapsed ? "justify-center" : "justify-between")}>
            <div className={cn("flex items-center min-w-0", isCollapsed ? "justify-center" : "")}>
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                <UserIcon className="w-4 h-4 text-muted" />
              </div>
              {!isCollapsed && (
                <div className="ml-3 truncate" title={user.email}>
                  <p className="text-sm font-medium text-foreground truncate">{user.email}</p>
                  <p className="text-xs text-muted capitalize">{user.role.toLowerCase()}</p>
                </div>
              )}
            </div>
            {!isCollapsed && (
              <button
                onClick={handleLogout}
                className="p-1.5 rounded-md hover:bg-gray-100 text-muted ml-2 flex-shrink-0"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        ) : null}
        {isCollapsed && user && (
          <div className="mt-4 flex justify-center">
             <button
                onClick={handleLogout}
                className="p-1.5 rounded-md hover:bg-gray-100 text-muted"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden md:block fixed inset-y-0 left-0 z-20 transition-all duration-300 ease-in-out",
          isCollapsed ? "w-20" : "w-64"
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <aside
        className={cn(
          "md:hidden fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
