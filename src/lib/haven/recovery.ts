import { b64ToBuf, bufToB64, randomBytes, utf8 } from "./bytes";
import { decryptBuffer, derivePasscodeKey, encryptBuffer, exportPrivateKey } from "./crypto";
import { kvGet, kvSet } from "./idb";
import { fromBase32, toBase32 } from "./totp";
import { wordAt } from "./words";

const PACK_KEY = "recovery-pack";
const EMAIL_KEY = "recovery-email";
const EMERGENCY_KEY = "recovery-emergency";

export type RecoveryPack = {
  v: 1;
  publicKey: string;
  salt: string;
  wrappedVault: { iv: string; ciphertext: string };
  wrappedIdentity: { iv: string; ciphertext: string };
  note: "Haven cannot open this backup.";
};

export type PhraseBundle = {
  words: string[];
  phrase: string;
  passkey: string;
};

export type SessionBits = {
  vaultKey: CryptoKey;
  privateKey: CryptoKey;
  publicKey: string;
};

function wordsFromEntropy(bytes: Uint8Array): string[] {
  return [...bytes].map((b) => wordAt(b));
}

export function generatePhrase(): PhraseBundle {
  const entropy = randomBytes(16);
  const words = wordsFromEntropy(entropy);
  return { words, phrase: words.join(" "), passkey: toBase32(entropy) };
}

export function normalizePhrase(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .split(/[^a-z]+/)
    .filter(Boolean)
    .join(" ");
}

export function phraseFromPasskey(passkey: string): string | null {
  const bytes = fromBase32(passkey);
  if (bytes.length < 16) return null;
  return wordsFromEntropy(bytes.subarray(0, 16)).join(" ");
}

/** Secrets to try against a pack: phrase, passkey, or a short email/emergency code. */
export function recoverySecrets(input: string): string[] {
  const trimmed = input.trim();
  const phrase = normalizePhrase(trimmed);
  const compact = trimmed.replace(/\s+/g, "").toUpperCase();
  const out = new Set<string>();
  if (trimmed) out.add(trimmed);
  if (phrase) out.add(phrase);
  if (compact) out.add(compact);
  out.add(trimmed.toLowerCase());
  const fromKey = phraseFromPasskey(compact);
  if (fromKey) out.add(fromKey);
  return [...out];
}

export async function wrapRecoveryPack(secret: string, keys: SessionBits): Promise<RecoveryPack> {
  const salt = randomBytes(16);
  const wrapKey = await derivePasscodeKey(secret, salt);
  const vaultRaw = await crypto.subtle.exportKey("raw", keys.vaultKey);
  const wrappedVault = await encryptBuffer(wrapKey, vaultRaw);
  const pkcs8 = await exportPrivateKey(keys.privateKey);
  const wrappedIdentity = await encryptBuffer(wrapKey, utf8(pkcs8));
  return {
    v: 1,
    publicKey: keys.publicKey,
    salt: bufToB64(salt),
    wrappedVault: { iv: bufToB64(wrappedVault.iv), ciphertext: bufToB64(wrappedVault.ciphertext) },
    wrappedIdentity: { iv: bufToB64(wrappedIdentity.iv), ciphertext: bufToB64(wrappedIdentity.ciphertext) },
    note: "Haven cannot open this backup.",
  };
}

export async function persistRecoveryPack(secret: string, keys: SessionBits): Promise<RecoveryPack> {
  const pack = await wrapRecoveryPack(secret, keys);
  await kvSet(PACK_KEY, pack);
  return pack;
}

export async function loadRecoveryPack(): Promise<RecoveryPack | null> {
  return (await kvGet<RecoveryPack>(PACK_KEY)) ?? null;
}

export async function openPackWithSecret(secret: string, pack: RecoveryPack): Promise<{
  vaultKey: CryptoKey;
  pkcs8: string;
  publicKey: string;
}> {
  const wrapKey = await derivePasscodeKey(secret, new Uint8Array(b64ToBuf(pack.salt)));
  const raw = await decryptBuffer(wrapKey, b64ToBuf(pack.wrappedVault.iv), b64ToBuf(pack.wrappedVault.ciphertext));
  const vaultKey = await crypto.subtle.importKey("raw", raw, { name: "AES-GCM" }, true, [
    "encrypt",
    "decrypt",
  ]);
  const pkcs8 = new TextDecoder().decode(
    await decryptBuffer(wrapKey, b64ToBuf(pack.wrappedIdentity.iv), b64ToBuf(pack.wrappedIdentity.ciphertext)),
  );
  return { vaultKey, pkcs8, publicKey: pack.publicKey };
}

export async function vaultKeyFromSecret(secret: string, pack?: RecoveryPack | null): Promise<CryptoKey> {
  const row = pack ?? (await loadRecoveryPack());
  if (!row) throw new Error("No recovery backup on this device");
  let last: Error | null = null;
  for (const guess of recoverySecrets(secret)) {
    try {
      return (await openPackWithSecret(guess, row)).vaultKey;
    } catch (err) {
      last = err instanceof Error ? err : new Error("That recovery secret does not match");
    }
  }
  throw last ?? new Error("That recovery secret does not match");
}

export function parseRecoveryPack(raw: string | null): RecoveryPack | null {
  if (!raw) return null;
  try {
    const pack = JSON.parse(raw) as RecoveryPack;
    if (pack?.v !== 1 || !pack.salt || !pack.wrappedVault) return null;
    return pack;
  } catch {
    return null;
  }
}

export function downloadText(filename: string, body: string) {
  const blob = new Blob([body], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}

export function recoveryFileBody(bundle: PhraseBundle): string {
  return [
    "HAVEN RECOVERY",
    "Haven cannot open this backup. Only you can.",
    "",
    `Passkey: ${bundle.passkey}`,
    "",
    "Phrase:",
    bundle.phrase,
    "",
    "Keep this offline. Anyone with it can open your vault.",
  ].join("\n");
}

export async function setRecoveryEmail(email: string): Promise<void> {
  await kvSet(EMAIL_KEY, email.trim().toLowerCase());
}

export async function getRecoveryEmail(): Promise<string | null> {
  return (await kvGet<string>(EMAIL_KEY)) ?? null;
}

export async function setEmergencyContact(userId: string): Promise<void> {
  await kvSet(EMERGENCY_KEY, userId);
}

export async function getEmergencyContact(): Promise<string | null> {
  return (await kvGet<string>(EMERGENCY_KEY)) ?? null;
}
