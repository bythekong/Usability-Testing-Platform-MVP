"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Briefcase,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Settings,
  User as UserIcon,
  X,
  Plug,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logout } from "@/lib/auth";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useTranslations } from "next-intl";

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

export function Sidebar({
  user,
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen,
}: SidebarProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const t = useTranslations('nav');
  
  const currentTab = searchParams.get("tab");

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const navItems = user?.role === "OWNER"
    ? [
        { name: t('createCampaign'), href: "/owner", id: null, icon: LayoutDashboard },
        { name: t('manageCampaigns'), href: "/owner?tab=campaigns", id: "campaigns", icon: FolderKanban },
        { name: t('settings'), href: "/owner?tab=settings", id: "settings", icon: Settings },
      ]
    : [
        { name: t('availableJobs'), href: "/tester", id: null, icon: Search },
        { name: t('myJobs'), href: "/tester?tab=my-jobs", id: "my-jobs", icon: Briefcase },
        { name: t('extensionSetup'), href: "/tester?tab=extension-sync", id: "extension-sync", icon: Plug },
        { name: t('settings'), href: "/tester?tab=settings", id: "settings", icon: Settings },
      ];

  const sidebarContent = (
    <div className="flex h-full flex-col border-r border-border bg-surface">
      <div className={cn("flex h-16 items-center border-b border-border px-4", isCollapsed ? "justify-center" : "justify-between")}>
        {!isCollapsed && <span className="truncate font-semibold text-foreground">Usability Hub</span>}
        <div className="flex items-center">
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden rounded-md p-1.5 text-muted transition hover:bg-muted/10 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary md:flex"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
          </button>
          <button
            type="button"
            onClick={() => setIsMobileOpen(false)}
            className="rounded-md p-1.5 text-muted transition hover:bg-muted/10 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary md:hidden"
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setIsMobileOpen(false)}
              className={cn(
                "group flex items-center rounded-lg px-3 py-2.5 text-sm transition-colors",
                isActive
                  ? "bg-primary/10 font-medium text-primary"
                  : "text-muted hover:bg-muted/10 hover:text-foreground",
                isCollapsed ? "justify-center" : "justify-start"
              )}
              title={isCollapsed ? item.name : undefined}
            >
              <Icon className={cn("h-5 w-5 shrink-0", !isCollapsed && "mr-3")} />
              {!isCollapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-4">
        {user && (
          <div className={cn("flex items-center", isCollapsed ? "flex-col gap-3" : "justify-between gap-2")}>
            <div className={cn("flex min-w-0 items-center", isCollapsed && "justify-center")}>
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted/20">
                <UserIcon className="h-4 w-4 text-muted" />
              </div>
              {!isCollapsed && (
                <div className="ml-3 min-w-0" title={user.email}>
                  <p className="truncate text-sm font-medium text-foreground">{user.email}</p>
                  <p className="text-xs capitalize text-muted">{user.role.toLowerCase()}</p>
                </div>
              )}
            </div>
            <div className={cn("flex items-center", isCollapsed ? "flex-col gap-2" : "gap-2")}>
              <LanguageSwitcher />
              <ThemeToggle />
              <button
                type="button"
                onClick={handleLogout}
                className="shrink-0 rounded-md p-1.5 text-muted transition hover:bg-muted/10 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                title="Logout"
                aria-label="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 hidden transition-[width] duration-200 ease-out md:block",
          isCollapsed ? "w-20" : "w-64"
        )}
      >
        {sidebarContent}
      </aside>

      {isMobileOpen && (
        <button
          type="button"
          aria-label="Close navigation overlay"
          className="fixed inset-0 z-40 bg-black/45 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-200 ease-out md:hidden",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
