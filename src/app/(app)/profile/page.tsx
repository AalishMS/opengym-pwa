"use client";

import { useState, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronRight, Download, Loader2, LogOut, Trash2 } from "lucide-react";
import { useTheme } from "next-themes";

import {
  applySelectedAccent,
  getAccentOptions,
  getStoredAccentIndex,
  setStoredAccentIndex,
} from "@/components/providers/accent-provider";
import { LogoutButton } from "@/components/auth/logout-button";
import { queryKeys } from "@/lib/query-keys";
import { samplePlans, sampleSessions } from "@/lib/sample-data";
import { createPlan, deletePlan, getPlans } from "@/services/plans";
import { createSession, deleteSession, getSessions } from "@/services/sessions";

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="border-b border-border px-4 py-2">
      <p className="text-xs font-bold text-primary">&gt; {title}</p>
    </div>
  );
}

function ThemeOption({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 border px-2 py-2 text-[10px] font-bold ${
        selected
          ? "border-primary bg-primary/10 text-primary"
          : "border-border text-muted-foreground"
      }`}
    >
      {label}
    </button>
  );
}

function SettingRow({
  title,
  subtitle,
  icon,
  destructive,
  onClick,
  disabled,
  loading,
}: {
  title: string;
  subtitle: string;
  icon: ReactNode;
  destructive?: boolean;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex w-full items-center gap-3 border-b border-border px-4 py-3 text-left disabled:opacity-60"
    >
      <div className={destructive ? "text-destructive" : "text-primary"}>{icon}</div>
      <div className="flex-1">
        <p className={`text-xs font-bold ${destructive ? "text-destructive" : "text-foreground"}`}>
          {title}
        </p>
        <p className="text-[10px] text-muted-foreground">{subtitle}</p>
      </div>
      {loading ? <Loader2 className="size-4 animate-spin text-muted-foreground" /> : <ChevronRight className="size-4 text-muted-foreground" />}
    </button>
  );
}

export default function ProfilePage() {
  const accents = getAccentOptions();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [accentIndex, setAccentIndex] = useState(() => getStoredAccentIndex());
  const [status, setStatus] = useState<string | null>(null);
  const [loadingSeed, setLoadingSeed] = useState(false);
  const [loadingClear, setLoadingClear] = useState(false);
  const queryClient = useQueryClient();

  const plansQuery = useQuery({ queryKey: queryKeys.plans, queryFn: getPlans });
  const sessionsQuery = useQuery({ queryKey: queryKeys.sessions, queryFn: getSessions });

  const currentAccent = accents[accentIndex];

  const seedData = async () => {
    if (loadingSeed) {
      return;
    }

    setLoadingSeed(true);
    setStatus(null);
    try {
      const existingPlans = plansQuery.data ?? [];
      const existingPlanNames = new Set(existingPlans.map((plan) => plan.name.toLowerCase()));

      let plansAdded = 0;
      for (const plan of samplePlans) {
        if (existingPlanNames.has(plan.name.toLowerCase())) {
          continue;
        }
        await createPlan({
          name: plan.name,
          exercises: plan.exercises.map((exercise, index) => ({
            name: exercise.name,
            sets: exercise.sets,
            order_index: index,
          })),
        });
        plansAdded += 1;
      }

      const existingSessions = sessionsQuery.data ?? [];
      const existingSessionKeys = new Set(
        existingSessions.map(
          (session) => `${session.plan_name ?? "custom"}-${session.week_number}-${session.date}`,
        ),
      );

      let sessionsAdded = 0;
      for (const session of sampleSessions) {
        const key = `${session.plan_name ?? "custom"}-${session.week_number}-${session.date}`;
        if (existingSessionKeys.has(key)) {
          continue;
        }
        await createSession(session);
        sessionsAdded += 1;
      }

      await queryClient.invalidateQueries({ queryKey: queryKeys.plans });
      await queryClient.invalidateQueries({ queryKey: queryKeys.sessions });
      setStatus(`> Sample data added: ${plansAdded} plans, ${sessionsAdded} workouts.`);
    } catch {
      setStatus("> Error loading sample data. Please check your connection and try again.");
    } finally {
      setLoadingSeed(false);
    }
  };

  const clearAllData = async () => {
    if (loadingClear) {
      return;
    }

    if (!window.confirm("Clear all plans and workout history? This cannot be undone.")) {
      return;
    }

    setLoadingClear(true);
    setStatus(null);
    try {
      const sessions = sessionsQuery.data ?? [];
      for (const session of sessions) {
        await deleteSession(session.id);
      }

      const plans = plansQuery.data ?? [];
      for (const plan of plans) {
        await deletePlan(plan.id);
      }

      await queryClient.invalidateQueries({ queryKey: queryKeys.plans });
      await queryClient.invalidateQueries({ queryKey: queryKeys.sessions });
      setStatus("> All data cleared.");
    } catch {
      setStatus("> Failed to clear data. Please try again.");
    } finally {
      setLoadingClear(false);
    }
  };

  return (
    <section className="space-y-3">
      <div className="border border-border bg-card">
        <SectionHeader title="APPEARANCE" />
        <div className="space-y-3 p-4">
          <div>
            <p className="text-[10px] text-muted-foreground">THEME</p>
            <p className="mt-1 text-[10px] text-muted-foreground">
              &gt; {(theme ?? "system").toUpperCase()}
            </p>
            <div className="mt-2 flex gap-2">
              <ThemeOption
                label="DARK"
                selected={theme === "dark" || (theme === "system" && resolvedTheme === "dark")}
                onClick={() => setTheme("dark")}
              />
              <ThemeOption
                label="LIGHT"
                selected={theme === "light" || (theme === "system" && resolvedTheme === "light")}
                onClick={() => setTheme("light")}
              />
              <ThemeOption
                label="SYSTEM"
                selected={theme === "system"}
                onClick={() => setTheme("system")}
              />
            </div>
          </div>

          <div>
            <p className="text-[10px] text-muted-foreground">ACCENT COLOR</p>
            <p className="mt-1 text-[10px] text-muted-foreground">&gt; {currentAccent.name}</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {accents.map((accent, index) => {
                const selected = index === accentIndex;
                return (
                  <button
                    key={accent.name}
                    type="button"
                    onClick={() => {
                      setAccentIndex(index);
                      setStoredAccentIndex(index);
                      applySelectedAccent(index, resolvedTheme !== "light");
                    }}
                    className={`border px-2 py-2 text-left ${
                      selected ? "border-primary" : "border-border"
                    }`}
                  >
                    <p className={`text-[10px] font-bold ${selected ? "text-primary" : "text-muted-foreground"}`}>
                      {accent.name}
                    </p>
                    <div className="mt-1 flex gap-1">
                      <span className="h-3 w-3 border border-border" style={{ backgroundColor: accent.dark }} />
                      <span className="h-3 w-3 border border-border" style={{ backgroundColor: accent.light }} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="border border-border bg-card">
        <SectionHeader title="DATA" />
        <SettingRow
          title="LOAD SAMPLE DATA"
          subtitle="Add sample plans and workouts for testing"
          icon={<Download className="size-4" />}
          onClick={seedData}
          disabled={loadingSeed || loadingClear}
          loading={loadingSeed}
        />
        <SettingRow
          title="CLEAR ALL DATA"
          subtitle="Delete all plans and workout history"
          destructive
          icon={<Trash2 className="size-4" />}
          onClick={clearAllData}
          disabled={loadingSeed || loadingClear}
          loading={loadingClear}
        />
      </div>

      {status ? (
        <div className="border border-border bg-card px-4 py-3">
          <p className="text-xs text-muted-foreground">{status}</p>
        </div>
      ) : null}

      <div className="border border-border bg-card">
        <SectionHeader title="ACCOUNT" />
        <div className="border-b border-border px-4 py-3">
          <div className="mb-2 flex items-center gap-3 text-destructive">
            <LogOut className="size-4" />
            <p className="text-xs font-bold">LOGOUT</p>
          </div>
          <LogoutButton />
        </div>

        <SectionHeader title="ABOUT" />
        <div className="px-4 py-6 text-center">
          <p className="text-[10px] text-muted-foreground">VERSION</p>
          <p className="mt-1 text-sm">1.0.0</p>
          <p className="mt-4 text-xs text-muted-foreground">&gt; Made by Aalish</p>
        </div>
      </div>
    </section>
  );
}
