import { b64ToBuf, bufToB64, utf8 } from "./bytes";
import { decryptBuffer, encryptBuffer } from "./crypto";
import { kvGet, kvSet } from "./idb";
import { getSessionKeys } from "./lock";

type Sealed = { iv: string; ciphertext: string };

export async function sealToKv(key: string, value: unknown): Promise<void> {
  const { vaultKey } = getSessionKeys();
  const { iv, ciphertext } = await encryptBuffer(vaultKey, utf8(JSON.stringify(value)));
  const row: Sealed = { iv: bufToB64(iv), ciphertext: bufToB64(ciphertext) };
  await kvSet(key, row);
}

export async function unsealFromKv<T>(key: string): Promise<T | null> {
  const row = await kvGet<Sealed>(key);
  if (!row?.iv || !row.ciphertext) return null;
  const { vaultKey } = getSessionKeys();
  const plain = await decryptBuffer(vaultKey, b64ToBuf(row.iv), b64ToBuf(row.ciphertext));
  return JSON.parse(new TextDecoder().decode(plain)) as T;
}
