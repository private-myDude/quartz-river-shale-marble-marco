import { bufToB64, b64ToBuf } from "./bytes";
import { encryptBuffer, decryptBuffer } from "./crypto";
import { kvGet, kvSet, kvDel } from "./idb";
import { getSessionKeys } from "./lock";
import { exportVaultRows, importVaultRow } from "./vault";

const FOLDER_KEY = "cloud-folder-handle";
const BACKUP_NAME = "haven-vault.haven";

type DirHandle = FileSystemDirectoryHandle & {
  requestPermission?: (opts: { mode: "readwrite" | "read" }) => Promise<PermissionState>;
};

type PickerWindow = Window &
  typeof globalThis & {
    showDirectoryPicker?: (opts?: { id?: string; mode?: "readwrite" | "read" }) => Promise<DirHandle>;
  };

export function folderPickerAvailable(): boolean {
  return typeof window !== "undefined" && "showDirectoryPicker" in window;
}

export async function getSyncedFolder(): Promise<DirHandle | null> {
  const handle = await kvGet<DirHandle>(FOLDER_KEY);
  return handle ?? null;
}

export async function clearSyncedFolder(): Promise<void> {
  await kvDel(FOLDER_KEY);
}

export async function pickSyncedFolder(): Promise<DirHandle> {
  const picker = (window as PickerWindow).showDirectoryPicker;
  if (!picker) throw new Error("This browser cannot open a folder. Use a backup file instead.");
  const handle = await picker({ id: "haven-sync", mode: "readwrite" });
  await kvSet(FOLDER_KEY, handle);
  await writeBackupToFolder(handle);
  return handle;
}

function serializeRow(row: Record<string, unknown>) {
  const out: Record<string, unknown> = { ...row };
  for (const key of Object.keys(out)) {
    const value = out[key];
    if (value instanceof ArrayBuffer) out[key] = { t: "ab", v: bufToB64(value) };
    else if (value && typeof value === "object" && !Array.isArray(value)) {
      const nested = value as Record<string, unknown>;
      const next: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(nested)) {
        next[k] = v instanceof ArrayBuffer ? { t: "ab", v: bufToB64(v) } : v;
      }
      out[key] = next;
    }
  }
  return out;
}

function revive(value: unknown): unknown {
  if (!value || typeof value !== "object") return value;
  const rec = value as Record<string, unknown>;
  if (rec.t === "ab" && typeof rec.v === "string") return b64ToBuf(rec.v);
  const next: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(rec)) next[k] = revive(v);
  return next;
}

export async function buildBackupBlob(): Promise<Blob> {
  const { vaultKey } = getSessionKeys();
  const rows = await exportVaultRows();
  const payload = JSON.stringify({
    v: 1,
    exportedAt: Date.now(),
    videos: rows.map((row) => serializeRow(row as unknown as Record<string, unknown>)),
  });
  const sealed = await encryptBuffer(vaultKey, new TextEncoder().encode(payload));
  const pack = JSON.stringify({
    iv: bufToB64(sealed.iv),
    ciphertext: bufToB64(sealed.ciphertext),
  });
  return new Blob([pack], { type: "application/octet-stream" });
}

export async function restoreBackupBlob(blob: Blob): Promise<number> {
  const { vaultKey } = getSessionKeys();
  const pack = JSON.parse(await blob.text()) as { iv: string; ciphertext: string };
  if (!pack.iv || !pack.ciphertext) throw new Error("Not a Haven backup");
  const plain = await decryptBuffer(vaultKey, b64ToBuf(pack.iv), b64ToBuf(pack.ciphertext));
  const parsed = JSON.parse(new TextDecoder().decode(plain)) as { videos?: unknown[] };
  let n = 0;
  for (const raw of parsed.videos ?? []) {
    const row = revive(raw) as Parameters<typeof importVaultRow>[0];
    if (row?.id) {
      await importVaultRow(row);
      n += 1;
    }
  }
  return n;
}

export async function downloadBackupFile(): Promise<void> {
  const blob = await buildBackupBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = BACKUP_NAME;
  a.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}

export async function writeBackupToFolder(handle?: DirHandle): Promise<void> {
  const dir = handle ?? (await getSyncedFolder());
  if (!dir) throw new Error("No synced folder yet");
  const perm = await dir.requestPermission?.({ mode: "readwrite" });
  if (perm && perm !== "granted") throw new Error("Folder access was denied");
  const blob = await buildBackupBlob();
  const file = await dir.getFileHandle(BACKUP_NAME, { create: true });
  const writable = await file.createWritable();
  await writable.write(blob);
  await writable.close();
}

export async function restoreFromFolder(): Promise<number> {
  const dir = await getSyncedFolder();
  if (!dir) throw new Error("No synced folder yet");
  const file = await dir.getFileHandle(BACKUP_NAME);
  const blob = await (await file.getFile()).slice();
  return restoreBackupBlob(blob);
}
