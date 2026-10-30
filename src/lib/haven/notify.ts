import { getPushPublicKey, removePushSubscription, savePushSubscription } from "./push";
import { readPrefs, type Prefs } from "./prefs";

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

// ── Web Push ────────────────────────────────────────────────────────────────
// Wakes the phone when a clip arrives even if Haven is closed. On iPhone this
// only works once Haven is added to the Home Screen (iOS 16.4+).

export type PushStatus = "on" | "unsupported" | "needs-home-screen" | "blocked" | "not-configured";

function isIos(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

function isStandalone(): boolean {
  const nav = navigator as Navigator & { standalone?: boolean };
  return nav.standalone === true || window.matchMedia("(display-mode: standalone)").matches;
}

function keyBytes(base64url: string): Uint8Array<ArrayBuffer> {
  const padded = (base64url + "===".slice((base64url.length + 3) % 4)).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(padded);
  const out = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i += 1) out[i] = raw.charCodeAt(i);
  return out;
}

async function saveSubscription(sub: PushSubscription): Promise<void> {
  const json = sub.toJSON();
  if (!json.endpoint || !json.keys?.p256dh || !json.keys.auth) return;
  await savePushSubscription({
    data: { endpoint: json.endpoint, p256dh: json.keys.p256dh, auth: json.keys.auth },
  });
}

/**
 * Subscribe this device to push. Call from a tap (iOS only asks for permission
 * from a user gesture). Safe to call again — it refreshes the saved subscription.
 */
export async function enablePush(askPermission = true): Promise<PushStatus> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return "unsupported";
  if (isIos() && !isStandalone()) return "needs-home-screen";
  if (!("PushManager" in window) || typeof Notification === "undefined") return "unsupported";
  if (askPermission ? !(await ensureNotifyPermission()) : Notification.permission !== "granted") {
    return "blocked";
  }
  const { key } = await getPushPublicKey();
  if (!key) return "not-configured";
  await registerHavenWorker();
  const reg = await navigator.serviceWorker.ready;
  const sub =
    (await reg.pushManager.getSubscription()) ??
    (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: keyBytes(key) }));
  await saveSubscription(sub);
  await syncWorkerPrefs();
  return "on";
}

/** Stop push on this device. */
export async function disablePush(): Promise<void> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
  const reg = await navigator.serviceWorker.getRegistration();
  const sub = await reg?.pushManager?.getSubscription();
  if (!sub) return;
  await removePushSubscription({ data: { endpoint: sub.endpoint } }).catch(() => undefined);
  await sub.unsubscribe().catch(() => undefined);
}

/**
 * Hand quiet hours to the service worker, which shows pushes while Haven is
 * closed and can't read the app's settings itself.
 */
export async function syncWorkerPrefs(
  prefs: Pick<Prefs, "quietHours" | "quietStart" | "quietEnd" | "showSender"> = readPrefs(),
): Promise<void> {
  if (typeof caches === "undefined") return;
  try {
    const cache = await caches.open("haven-prefs");
    const { quietHours, quietStart, quietEnd, showSender } = prefs;
    await cache.put(
      "/__haven-prefs",
      new Response(JSON.stringify({ quietHours, quietStart, quietEnd, showSender })),
    );
    if (!showSender) await cache.delete("/__haven-names");
  } catch {
    /* cache unavailable — pushes just won't be silenced */
  }
}

/**
 * Give the service worker this phone's contact names so a push can say who a
 * clip is from. Kept on this device only; cleared when "Show who sent it" is off.
 */
export async function syncWorkerNames(friends: { userId: string; displayName: string }[]): Promise<void> {
  if (typeof caches === "undefined") return;
  try {
    const cache = await caches.open("haven-prefs");
    if (!readPrefs().showSender) {
      await cache.delete("/__haven-names");
      return;
    }
    const names: Record<string, string> = {};
    for (const f of friends) if (f.displayName) names[f.userId] = f.displayName;
    await cache.put("/__haven-names", new Response(JSON.stringify(names)));
  } catch {
    /* cache unavailable — alerts stay generic */
  }
}
