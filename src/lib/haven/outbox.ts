import { kvGet, kvSet } from "./idb";
import { relayPublish, type OutgoingSeal } from "./relay";
import { readPrefs } from "./prefs";

const KEY = "haven-outbox";

export type QueuedSeal = OutgoingSeal & { queuedAt: number; localId: string };

export function onWifi(): boolean {
  if (typeof navigator === "undefined") return true;
  const conn = (navigator as Navigator & { connection?: { type?: string; saveData?: boolean } }).connection;
  if (!conn) return true;
  if (conn.type === "cellular") return false;
  if (conn.saveData) return false;
  return true;
}

export async function readOutbox(): Promise<QueuedSeal[]> {
  return (await kvGet<QueuedSeal[]>(KEY)) ?? [];
}

export async function queueSeal(seal: OutgoingSeal): Promise<void> {
  const rows = await readOutbox();
  rows.push({ ...seal, queuedAt: Date.now(), localId: crypto.randomUUID() });
  await kvSet(KEY, rows);
}

export async function replaceOutbox(rows: QueuedSeal[]): Promise<void> {
  await kvSet(KEY, rows);
}

export async function canSendNow(wifiOnly: boolean): Promise<{ ok: true } | { ok: false; reason: string }> {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return { ok: false, reason: "offline" };
  }
  if (wifiOnly && !onWifi()) return { ok: false, reason: "wifi" };
  return { ok: true };
}

export async function flushOutbox(): Promise<number> {
  const ready = await canSendNow(readPrefs().wifiOnly);
  if (!ready.ok) return 0;
  const rows = await readOutbox();
  if (!rows.length) return 0;
  const left: QueuedSeal[] = [];
  let sent = 0;
  for (const row of rows) {
    try {
      const { queuedAt: _q, localId: _id, ...seal } = row;
      await relayPublish(seal);
      sent += 1;
    } catch {
      left.push(row);
    }
  }
  await replaceOutbox(left);
  return sent;
}
