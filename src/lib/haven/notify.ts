import { readPrefs } from "./prefs";

export async function ensureNotifyPermission(): Promise<boolean> {
  if (typeof Notification === "undefined") return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const next = await Notification.requestPermission();
  return next === "granted";
}

export async function registerHavenWorker(): Promise<void> {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
  try {
    await navigator.serviceWorker.register("/haven-sw.js");
  } catch {
    /* preview hosts may block SW */
  }
}

function inQuietHours(prefs = readPrefs()): boolean {
  if (!prefs.quietHours) return false;
  const now = new Date();
  const cur = now.getHours() * 60 + now.getMinutes();
  const [sh, sm] = prefs.quietStart.split(":").map(Number);
  const [eh, em] = prefs.quietEnd.split(":").map(Number);
  const start = (sh ?? 22) * 60 + (sm ?? 0);
  const end = (eh ?? 7) * 60 + (em ?? 0);
  if (start === end) return false;
  if (start < end) return cur >= start && cur < end;
  return cur >= start || cur < end;
}

export async function notifyNewClip(label = "New clip in Haven"): Promise<void> {
  const prefs = readPrefs();
  if (!prefs.notifications) return;
  if (inQuietHours(prefs)) return;
  if (typeof Notification === "undefined") return;
  if (Notification.permission !== "granted") return;
  try {
    const reg = "serviceWorker" in navigator ? await navigator.serviceWorker.getRegistration() : null;
    const body = "Someone sent you a sealed clip.";
    if (reg?.showNotification) {
      await reg.showNotification(label, { body, icon: "/icon-192.png", tag: "haven-inbox", silent: false });
    } else {
      new Notification(label, { body, tag: "haven-inbox" });
    }
  } catch {
    /* ignore */
  }
}
