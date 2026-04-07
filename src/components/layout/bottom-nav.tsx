"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarClock, House, Settings, Timer } from "lucide-react";

import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "DASH", icon: House },
  { href: "/workouts", label: "WORK", icon: Timer },
  { href: "/history", label: "HIST", icon: CalendarClock },
  { href: "/profile", label: "PROF", icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background">
      <ul className="mx-auto grid h-16 w-full max-w-md grid-cols-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex h-full flex-col items-center justify-center gap-1 border-r border-border text-[10px] font-bold tracking-wide transition",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon className="size-4" />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
