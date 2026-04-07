"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";

const ACCENTS = [
  { name: "ELECTRIC BLUE", dark: "#00A8FF", light: "#0077CC" },
  { name: "WARM AMBER", dark: "#FF9500", light: "#CC7700" },
  { name: "DEEP ORANGE", dark: "#FF5722", light: "#E64A19" },
  { name: "HOT PINK", dark: "#FF1493", light: "#CC1177" },
  { name: "CYAN", dark: "#00CED1", light: "#00A5A8" },
  { name: "PURPLE", dark: "#8B5CF6", light: "#6D28D9" },
  { name: "STEEL GRAY", dark: "#A0A0A0", light: "#666666" },
] as const;

const STORAGE_KEY = "opengym_accent_index";

export function getAccentOptions() {
  return ACCENTS;
}

export function getStoredAccentIndex() {
  if (typeof window === "undefined") {
    return 0;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  const parsed = raw ? Number(raw) : 0;
  if (Number.isNaN(parsed) || parsed < 0 || parsed >= ACCENTS.length) {
    return 0;
  }
  return parsed;
}

export function setStoredAccentIndex(index: number) {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, String(index));
}

function applyAccent(accentHex: string) {
  const root = document.documentElement;
  root.style.setProperty("--primary", accentHex);
  root.style.setProperty("--secondary", accentHex);
  root.style.setProperty("--accent", accentHex);
  root.style.setProperty("--ring", accentHex);
  root.style.setProperty("--sidebar-primary", accentHex);
}

export function applySelectedAccent(index: number, useDark: boolean) {
  const safeIndex = Math.max(0, Math.min(index, ACCENTS.length - 1));
  const selected = ACCENTS[safeIndex];
  applyAccent(useDark ? selected.dark : selected.light);
}

export function AccentProvider() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const index = getStoredAccentIndex();
    const darkMode = resolvedTheme !== "light";
    applySelectedAccent(index, darkMode);
  }, [resolvedTheme]);

  return null;
}
