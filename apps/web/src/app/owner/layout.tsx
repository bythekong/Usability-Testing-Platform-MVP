import { AppShell } from "@/components/layout/AppShell";

export default function OwnerLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <AppShell>{children}</AppShell>;
}
