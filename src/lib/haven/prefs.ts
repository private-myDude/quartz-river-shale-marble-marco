import { useSyncExternalStore } from "react";

export type ThemeMode = "system" | "light" | "dark";
export type SkipSeconds = 10 | 15 | 20 | 30;
export type PlaybackRate = 1 | 1.25 | 1.5 | 1.75 | 2;
export type CloudTarget =
  | "device"
  | "icloud"
  | "proton"
  | "gdrive"
  | "onedrive"
  | "folder"
  | "file"
  | "haven";
export type RelayMode = "pickup" | "until-expiry";

export type Prefs = {
  theme: ThemeMode;
  skipSeconds: SkipSeconds;
  playbackRate: PlaybackRate;
  shieldClips: boolean;
  cloudTarget: CloudTarget;
  relayMode: RelayMode;
  allowSave: boolean;
  allowForward: boolean;
  sendReceipts: boolean;
  notifications: boolean;
  /** Show the sender's name in push alerts (looked up on this phone only). */
  showSender: boolean;
  quietHours: boolean;
  quietStart: string;
  quietEnd: string;
  captions: boolean;
  startMuted: boolean;
  wifiOnly: boolean;
  discovery: "handle" | "anyone";
};

export const PREFS_KEY = "haven-prefs-v1";

export const SKIP_OPTIONS: SkipSeconds[] = [10, 15, 20, 30];
export const SPEED_OPTIONS: PlaybackRate[] = [1, 1.25, 1.5, 1.75, 2];
export const THEME_OPTIONS: { id: ThemeMode; label: string }[] = [
  { id: "system", label: "System" },
  { id: "light", label: "Light" },
  { id: "dark", label: "Dark" },
];
export const CLOUD_OPTIONS: { id: CloudTarget; label: string; hint: string; native?: boolean }[] = [
  { id: "device", label: "This device only", hint: "Playable clips never leave this phone." },
  {
    id: "icloud",
    label: "iCloud",
    hint: "Native iCloud Drive lands in the Haven app. Until then, pick the iCloud folder this phone already syncs.",
    native: true,
  },
  {
    id: "proton",
    label: "Proton Drive",
    hint: "Native Proton Drive lands in the Haven app. Until then, pick a Proton-synced folder or save a backup file.",
    native: true,
  },
  {
    id: "gdrive",
    label: "Google Drive",
    hint: "Native Drive lands in the Haven app. Until then, pick a Drive-synced folder or save a backup file.",
    native: true,
  },
  {
    id: "onedrive",
    label: "OneDrive",
    hint: "Native OneDrive lands in the Haven app. Until then, pick a OneDrive folder or save a backup file.",
    native: true,
  },
  { id: "folder", label: "Any synced folder", hint: "Encrypted backup into whatever folder your cloud already watches." },
  { id: "file", label: "Backup file", hint: "Download or restore a sealed vault file." },
  { id: "haven", label: "Haven Cloud", hint: "Sealed mailbox only. We cannot watch your clips." },
];
export const RELAY_OPTIONS: { id: RelayMode; label: string; hint: string }[] = [
  { id: "pickup", label: "Delete when picked up", hint: "Sealed copy vanishes as soon as this phone takes it." },
  { id: "until-expiry", label: "Keep until lifetime ends", hint: "Mailbox holds ciphertext until the clip’s timer." },
];

export const DEFAULT_PREFS: Prefs = {
  theme: "system",
  skipSeconds: 10,
  playbackRate: 1,
  shieldClips: true,
  cloudTarget: "device",
  relayMode: "pickup",
  allowSave: false,
  allowForward: true,
  sendReceipts: true,
  notifications: true,
  showSender: true,
  quietHours: false,
  quietStart: "22:00",
  quietEnd: "07:00",
  captions: false,
  startMuted: false,
  wifiOnly: false,
  discovery: "handle",
};

const listeners = new Set<() => void>();
let cached: Prefs = DEFAULT_PREFS;
let cachedRaw: string | null = null;
let hydrated = false;

function isSkip(value: unknown): value is SkipSeconds {
  return SKIP_OPTIONS.includes(value as SkipSeconds);
}
function isSpeed(value: unknown): value is PlaybackRate {
  return SPEED_OPTIONS.includes(value as PlaybackRate);
}
function isTheme(value: unknown): value is ThemeMode {
  return value === "system" || value === "light" || value === "dark";
}
function isCloud(value: unknown): value is CloudTarget {
  return CLOUD_OPTIONS.some((opt) => opt.id === value);
}
function isRelay(value: unknown): value is RelayMode {
  return value === "pickup" || value === "until-expiry";
}

export function parsePrefs(raw: unknown): Prefs {
  if (!raw || typeof raw !== "object") return DEFAULT_PREFS;
  const rec = raw as Record<string, unknown>;
  return {
    theme: isTheme(rec.theme) ? rec.theme : DEFAULT_PREFS.theme,
    skipSeconds: isSkip(rec.skipSeconds) ? rec.skipSeconds : DEFAULT_PREFS.skipSeconds,
    playbackRate: isSpeed(rec.playbackRate) ? rec.playbackRate : DEFAULT_PREFS.playbackRate,
    shieldClips: rec.shieldClips === false ? false : true,
    cloudTarget: isCloud(rec.cloudTarget) ? rec.cloudTarget : DEFAULT_PREFS.cloudTarget,
    relayMode: isRelay(rec.relayMode) ? rec.relayMode : DEFAULT_PREFS.relayMode,
    allowSave: rec.allowSave === true,
    allowForward: rec.allowForward === false ? false : true,
    sendReceipts: rec.sendReceipts === false ? false : true,
    notifications: rec.notifications === false ? false : true,
    showSender: rec.showSender === false ? false : true,
    quietHours: rec.quietHours === true,
    quietStart: typeof rec.quietStart === "string" ? rec.quietStart : DEFAULT_PREFS.quietStart,
    quietEnd: typeof rec.quietEnd === "string" ? rec.quietEnd : DEFAULT_PREFS.quietEnd,
    captions: rec.captions === true,
    startMuted: rec.startMuted === true,
    wifiOnly: rec.wifiOnly === true,
    discovery: rec.discovery === "anyone" ? "anyone" : "handle",
  };
}

export function readPrefs(): Prefs {
  if (typeof localStorage === "undefined") return cached;
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (hydrated && raw === cachedRaw) return cached;
    hydrated = true;
    cachedRaw = raw;
    cached = parsePrefs(raw ? JSON.parse(raw) : null);
    return cached;
  } catch {
    hydrated = true;
    return cached;
  }
}

export function writePrefs(next: Prefs): void {
  cached = next;
  cachedRaw = JSON.stringify(next);
  hydrated = true;
  localStorage.setItem(PREFS_KEY, cachedRaw);
  listeners.forEach((fn) => fn());
}

export function setPrefs(partial: Partial<Prefs>): Prefs {
  const next = { ...readPrefs(), ...partial };
  writePrefs(next);
  return next;
}

export function subscribePrefs(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function usePrefs(): Prefs {
  return useSyncExternalStore(subscribePrefs, readPrefs, () => DEFAULT_PREFS);
}

export function systemPrefersDark(): boolean {
  if (typeof window === "undefined") return true;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function resolvedTheme(theme: ThemeMode, systemDark = systemPrefersDark()): "light" | "dark" {
  if (theme === "light") return "light";
  if (theme === "dark") return "dark";
  return systemDark ? "dark" : "light";
}

export function applyThemeClass(mode: "light" | "dark"): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.toggle("dark", mode === "dark");
  root.classList.toggle("light", mode === "light");
  root.style.colorScheme = mode;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", mode === "dark" ? "#07080c" : "#f4f5f7");
}

export function speedLabel(rate: PlaybackRate): string {
  return rate === 1 ? "1×" : `${rate}×`;
}

export function skipLabel(seconds: SkipSeconds): string {
  return `${seconds} seconds`;
}
