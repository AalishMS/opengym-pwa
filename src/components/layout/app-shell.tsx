import type { ReactNode } from "react";

import { AppHeader } from "@/components/layout/app-header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { A2HSPrompt } from "@/components/pwa/a2hs-prompt";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-background">
      <AppHeader />
      <main className="flex flex-1 flex-col px-4 pb-24 pt-4">{children}</main>
      <A2HSPrompt />
      <BottomNav />
    </div>
  );
}
