import { bufToB64, randomBytes } from "./bytes";
import {
  decryptBuffer,
  derivePasscodeKey,
  encryptBuffer,
  exportPrivateKey,
  generateAesKey,
  generateIdentityKeyPair,
  importPrivateKey,
} from "./crypto";
import { kvGet, kvSet, wipeVault } from "./idb";

const LOCK_KEY = "lock";
const IDENTITY_KEY = "identity";
const VAULT_WRAP_KEY = "vaultWrap";

export type LockConfig = {
  hasPasscode: boolean;
  hasBiometric: boolean;
  saltB64: string;
  passcodeProbe?: string;
  credentialId?: string;
};

type IdentityRecord = {
  publicKey: string;
  privatePkcs8: string;
};

type VaultWrap = {
  iv: string;
  ciphertext: string;
};

let sessionVaultKey: CryptoKey | null = null;
let sessionPrivateKey: CryptoKey | null = null;
let sessionPublicB64: string | null = null;

export function isUnlocked(): boolean {
  return sessionVaultKey != null && sessionPrivateKey != null;
}

export function getSessionKeys() {
  if (!sessionVaultKey || !sessionPrivateKey || !sessionPublicB64) {
    throw new Error("Vault is locked");
  }
  return {
    vaultKey: sessionVaultKey,
    privateKey: sessionPrivateKey,
    publicKey: sessionPublicB64,
  };
}

export function lockSession(): void {
  sessionVaultKey = null;
  sessionPrivateKey = null;
  sessionPublicB64 = null;
}

export async function getLockConfig(): Promise<LockConfig | null> {
  return (await kvGet<LockConfig>(LOCK_KEY)) ?? null;
}

async function persistIdentity(privateKey: CryptoKey, publicKey: string, vaultKey: CryptoKey) {
  const pkcs8 = await exportPrivateKey(privateKey);
  const wrappedPriv = await encryptBuffer(vaultKey, new TextEncoder().encode(pkcs8));
  const record: IdentityRecord = {
    publicKey,
    privatePkcs8: JSON.stringify({
      iv: bufToB64(wrappedPriv.iv),
      ciphertext: bufToB64(wrappedPriv.ciphertext),
    }),
  };
  await kvSet(IDENTITY_KEY, record);
}

async function unwrapIdentity(vaultKey: CryptoKey): Promise<{
  privateKey: CryptoKey;
  publicKey: string;
}> {
  const record = await kvGet<IdentityRecord>(IDENTITY_KEY);
  if (!record) throw new Error("Missing identity");
  const wrapped = JSON.parse(record.privatePkcs8) as { iv: string; ciphertext: string };
  const { b64ToBuf } = await import("./bytes");
  const pkcs8 = new TextDecoder().decode(
    await decryptBuffer(vaultKey, b64ToBuf(wrapped.iv), b64ToBuf(wrapped.ciphertext)),
  );
  return { privateKey: await importPrivateKey(pkcs8), publicKey: record.publicKey };
}

async function openSession(vaultKey: CryptoKey) {
  const identity = await unwrapIdentity(vaultKey);
  sessionVaultKey = vaultKey;
  sessionPrivateKey = identity.privateKey;
  sessionPublicB64 = identity.publicKey;
  return identity.publicKey;
}

export async function bootstrapVault(): Promise<string> {
  if (sessionVaultKey && sessionPublicB64) return sessionPublicB64;

  const lock = await getLockConfig();
  const raw = await kvGet<ArrayBuffer>("vaultRaw");
  if (lock?.hasPasscode && !raw) throw new Error("LOCKED");

  const existing = await kvGet<IdentityRecord>(IDENTITY_KEY);
  if (raw && existing) {
    const vaultKey = await crypto.subtle.importKey("raw", raw, { name: "AES-GCM" }, true, [
      "encrypt",
      "decrypt",
    ]);
    return openSession(vaultKey);
  }

  const pair = await generateIdentityKeyPair();
  const { exportPublicKey } = await import("./crypto");
  const publicKey = await exportPublicKey(pair.publicKey);
  const vaultKey = await generateAesKey();
  const freshRaw = await crypto.subtle.exportKey("raw", vaultKey);
  await kvSet("vaultRaw", freshRaw);
  const wrapped = await encryptBuffer(vaultKey, new Uint8Array(32));
  await kvSet(VAULT_WRAP_KEY, {
    iv: bufToB64(wrapped.iv),
    ciphertext: bufToB64(wrapped.ciphertext),
  } satisfies VaultWrap);
  await persistIdentity(pair.privateKey, publicKey, vaultKey);
  await kvSet(LOCK_KEY, {
    hasPasscode: false,
    hasBiometric: lock?.hasBiometric ?? false,
    saltB64: lock?.saltB64 ?? bufToB64(randomBytes(16)),
    credentialId: lock?.credentialId,
  } satisfies LockConfig);
  return openSession(vaultKey);
}

export async function setPasscode(passcode: string): Promise<void> {
  if (!/^\d{6}$/.test(passcode)) throw new Error("Use a 6-digit passcode");
  const salt = randomBytes(16);
  const wrapKey = await derivePasscodeKey(passcode, salt);
  const vaultKey = sessionVaultKey ?? (await generateAesKey());
  if (!sessionPrivateKey || !sessionPublicB64) {
    await bootstrapVault();
  }
  const active = getSessionKeys();
  const raw = await crypto.subtle.exportKey("raw", active.vaultKey);
  const wrapped = await encryptBuffer(wrapKey, raw);
  await kvSet(VAULT_WRAP_KEY, {
    iv: bufToB64(wrapped.iv),
    ciphertext: bufToB64(wrapped.ciphertext),
  } satisfies VaultWrap);
  await kvDelRaw();
  const { hashPasscode } = await import("./crypto");
  const probe = await hashPasscode(passcode, salt);
  const prev = (await getLockConfig()) ?? {
    hasPasscode: true,
    hasBiometric: false,
    saltB64: bufToB64(salt),
  };
  await kvSet(LOCK_KEY, {
    ...prev,
    hasPasscode: true,
    saltB64: bufToB64(salt),
    passcodeProbe: probe,
  } satisfies LockConfig);
  sessionVaultKey = active.vaultKey;
}

async function kvDelRaw() {
  const { kvDel } = await import("./idb");
  await kvDel("vaultRaw");
}

export async function unlockWithPasscode(passcode: string): Promise<string> {
  const lock = await getLockConfig();
  if (!lock?.hasPasscode) throw new Error("No passcode set");
  const { b64ToBuf } = await import("./bytes");
  const salt = new Uint8Array(b64ToBuf(lock.saltB64));
  const wrapKey = await derivePasscodeKey(passcode, salt);
  const wrap = await kvGet<VaultWrap>(VAULT_WRAP_KEY);
  if (!wrap) throw new Error("Missing vault");
  try {
    const raw = await decryptBuffer(wrapKey, b64ToBuf(wrap.iv), b64ToBuf(wrap.ciphertext));
    const vaultKey = await crypto.subtle.importKey("raw", raw, { name: "AES-GCM" }, true, [
      "encrypt",
      "decrypt",
    ]);
    return openSession(vaultKey);
  } catch {
    throw new Error("Wrong passcode");
  }
}

export async function clearPasscode(): Promise<void> {
  const active = getSessionKeys();
  const raw = await crypto.subtle.exportKey("raw", active.vaultKey);
  await kvSet("vaultRaw", raw);
  const lock = await getLockConfig();
  await kvSet(LOCK_KEY, {
    hasPasscode: false,
    hasBiometric: lock?.hasBiometric ?? false,
    saltB64: lock?.saltB64 ?? bufToB64(randomBytes(16)),
    credentialId: lock?.credentialId,
  } satisfies LockConfig);
}

export async function registerBiometric(): Promise<void> {
  if (typeof window === "undefined" || !window.PublicKeyCredential) {
    throw new Error("This device cannot use Face ID or a passkey");
  }
  const cred = (await navigator.credentials.create({
    publicKey: {
      challenge: randomBytes(32),
      rp: { name: "Haven", id: window.location.hostname },
      user: {
        id: randomBytes(16),
        name: "haven-lock",
        displayName: "Haven lock",
      },
      pubKeyCredParams: [
        { type: "public-key", alg: -7 },
        { type: "public-key", alg: -257 },
      ],
      authenticatorSelection: {
        authenticatorAttachment: "platform",
        userVerification: "required",
        residentKey: "preferred",
      },
      timeout: 60_000,
    },
  })) as PublicKeyCredential | null;
  if (!cred) throw new Error("Biometric setup was cancelled");
  const lock = (await getLockConfig()) ?? {
    hasPasscode: false,
    hasBiometric: true,
    saltB64: bufToB64(randomBytes(16)),
  };
  await kvSet(LOCK_KEY, {
    ...lock,
    hasBiometric: true,
    credentialId: bufToB64(cred.rawId),
  } satisfies LockConfig);
}

export async function unlockWithBiometric(): Promise<string> {
  const lock = await getLockConfig();
  if (!lock?.hasBiometric || !lock.credentialId) {
    throw new Error("Face ID is not set up");
  }
  const { b64ToBuf } = await import("./bytes");
  const assertion = await navigator.credentials.get({
    publicKey: {
      challenge: randomBytes(32),
      allowCredentials: [
        {
          type: "public-key",
          id: b64ToBuf(lock.credentialId),
        },
      ],
      userVerification: "required",
      timeout: 60_000,
    },
  });
  if (!assertion) throw new Error("Face ID was cancelled");
  if (lock.hasPasscode && !(await kvGet<ArrayBuffer>("vaultRaw"))) {
    throw new Error("Enter your passcode to open the vault");
  }
  return bootstrapVault();
}

export async function disableBiometric(): Promise<void> {
  const lock = await getLockConfig();
  if (!lock) return;
  await kvSet(LOCK_KEY, { ...lock, hasBiometric: false, credentialId: undefined });
}

export async function destroyLocalVault(): Promise<void> {
  lockSession();
  await wipeVault();
}

export async function unlockWithPhrase(secret: string): Promise<string> {
  const {
    loadRecoveryPack,
    openPackWithSecret,
    parseRecoveryPack,
    recoverySecrets,
  } = await import("./recovery");
  const { importPrivateKey } = await import("./crypto");
  const packs: import("./recovery").RecoveryPack[] = [];
  const local = await loadRecoveryPack();
  if (local) packs.push(local);
  try {
    const { getRecoveryBlob } = await import("./api");
    const email = parseRecoveryPack(await getRecoveryBlob({ data: { kind: "email" } }));
    if (email) packs.push(email);
    const emergency = parseRecoveryPack(await getRecoveryBlob({ data: { kind: "emergency" } }));
    if (emergency) packs.push(emergency);
  } catch {
    /* signed-out or no blob */
  }
  if (!packs.length) throw new Error("No recovery backup on this device");
  const guesses = recoverySecrets(secret);
  let last: Error | null = null;
  for (const pack of packs) {
    for (const guess of guesses) {
      try {
        const opened = await openPackWithSecret(guess, pack);
        sessionVaultKey = opened.vaultKey;
        sessionPrivateKey = await importPrivateKey(opened.pkcs8);
        sessionPublicB64 = opened.publicKey;
        return opened.publicKey;
      } catch (err) {
        last = err instanceof Error ? err : new Error("That recovery secret does not match");
      }
    }
  }
  throw last ?? new Error("That recovery secret does not match");
}

const TOTP_KEY = "totp-secret";
const BACKUP_CODES_KEY = "totp-backup-hashes";

export async function storeTotpSecret(secret: string): Promise<void> {
  await kvSet(TOTP_KEY, secret);
}

export async function loadTotpSecret(): Promise<string | null> {
  return (await kvGet<string>(TOTP_KEY)) ?? null;
}

export async function clearTotpSecret(): Promise<void> {
  const { kvDel } = await import("./idb");
  await kvDel(TOTP_KEY);
  await kvDel(BACKUP_CODES_KEY);
}

const BACKUP_ALPH = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateBackupCodes(count = 8): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i += 1) {
    const bytes = randomBytes(8);
    let raw = "";
    for (const b of bytes) raw += BACKUP_ALPH[b % BACKUP_ALPH.length];
    codes.push(`${raw.slice(0, 4)}-${raw.slice(4)}`);
  }
  return codes;
}

function normalizeBackupCode(code: string): string {
  return code.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export async function storeBackupCodes(codes: string[]): Promise<void> {
  const { sha256Hex } = await import("./crypto");
  const hashes = await Promise.all(codes.map((c) => sha256Hex(normalizeBackupCode(c))));
  await kvSet(BACKUP_CODES_KEY, hashes);
}

export async function remainingBackupCodes(): Promise<number> {
  const hashes = (await kvGet<string[]>(BACKUP_CODES_KEY)) ?? [];
  return hashes.length;
}

export async function consumeBackupCode(code: string): Promise<boolean> {
  const { sha256Hex } = await import("./crypto");
  const hashes = (await kvGet<string[]>(BACKUP_CODES_KEY)) ?? [];
  if (!hashes.length) return false;
  const guess = await sha256Hex(normalizeBackupCode(code));
  const idx = hashes.indexOf(guess);
  if (idx < 0) return false;
  hashes.splice(idx, 1);
  await kvSet(BACKUP_CODES_KEY, hashes);
  return true;
}

export function biometricAvailable(): boolean {
  return typeof window !== "undefined" && !!window.PublicKeyCredential;
}
