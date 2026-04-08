import type { ReactNode } from "react";

import { AppHeader } from "@/components/layout/app-header";
import { A2HSPrompt } from "@/components/pwa/a2hs-prompt";
import { AuthGuard } from "@/components/auth/auth-guard";
import { ErrorBoundary } from "@/components/error-boundary";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-background">
      <AppHeader />
      <main className="flex flex-1 flex-col px-4 pb-6 pt-4">
        <AuthGuard>
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </AuthGuard>
      </main>
      <A2HSPrompt />
    </div>
  );
}
