import Image from "next/image";
import Link from "next/link";
import { BarChart3, History, Settings } from "lucide-react";

import { OfflineIndicator } from "@/components/opengym/offline-indicator";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background">
      <div className="mx-auto flex h-14 w-full max-w-md items-center justify-between px-4">
        <Link href="/" aria-label="OpenGym home" className="flex items-center gap-2">
          <Image
            src="/logo/opengym_icon_v2.png"
            alt="OpenGym"
            width={18}
            height={18}
            className="size-[18px]"
          />
          <p className="text-sm font-bold text-primary">&gt; OPENGYM</p>
        </Link>
        <div className="flex items-center gap-1 text-primary">
          <OfflineIndicator />
          <Link href="/" aria-label="Dashboard" className="p-2">
            <BarChart3 className="size-4" />
          </Link>
          <Link href="/history" aria-label="History" className="p-2">
            <History className="size-4" />
          </Link>
          <Link href="/profile" aria-label="Settings" className="p-2">
            <Settings className="size-4" />
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
