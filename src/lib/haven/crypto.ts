import { asBytes, b64ToBuf, bufToB64, randomBytes, utf8 } from "./bytes";

const EC_ALG: EcKeyGenParams = { name: "ECDH", namedCurve: "P-256" };
const AES_ALG = { name: "AES-GCM", length: 256 } as const;
const PBKDF2_ITERS = 210_000;
const WRAP_INFO = utf8("haven-envelope-v1");

export async function generateIdentityKeyPair(): Promise<CryptoKeyPair> {
  return crypto.subtle.generateKey(EC_ALG, true, ["deriveBits"]);
}

export async function exportPublicKey(key: CryptoKey): Promise<string> {
  return bufToB64(await crypto.subtle.exportKey("spki", key));
}

export async function importPublicKey(spkiB64: string): Promise<CryptoKey> {
  return crypto.subtle.importKey("spki", b64ToBuf(spkiB64), EC_ALG, true, []);
}

export async function exportPrivateKey(key: CryptoKey): Promise<string> {
  return bufToB64(await crypto.subtle.exportKey("pkcs8", key));
}

export async function importPrivateKey(pkcs8B64: string): Promise<CryptoKey> {
  return crypto.subtle.importKey("pkcs8", b64ToBuf(pkcs8B64), EC_ALG, true, [
    "deriveBits",
  ]);
}

export async function generateAesKey(extractable = true): Promise<CryptoKey> {
  return crypto.subtle.importKey("raw", randomBytes(32), AES_ALG, extractable, [
    "encrypt",
    "decrypt",
  ]);
}

export async function derivePasscodeKey(
  passcode: string,
  salt: Uint8Array,
): Promise<CryptoKey> {
  const base = await crypto.subtle.importKey("raw", utf8(passcode), "PBKDF2", false, [
    "deriveKey",
  ]);
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: asBytes(salt), iterations: PBKDF2_ITERS, hash: "SHA-256" },
    base,
    AES_ALG,
    false,
    ["encrypt", "decrypt"],
  );
}

export async function encryptBuffer(
  key: CryptoKey,
  data: ArrayBuffer | Uint8Array,
): Promise<{ iv: ArrayBuffer; ciphertext: ArrayBuffer }> {
  const iv = randomBytes(12);
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    asBytes(data),
  );
  return { iv: iv.buffer as ArrayBuffer, ciphertext };
}

export async function decryptBuffer(
  key: CryptoKey,
  iv: ArrayBuffer,
  ciphertext: ArrayBuffer,
): Promise<ArrayBuffer> {
  return crypto.subtle.decrypt({ name: "AES-GCM", iv: asBytes(iv) }, key, ciphertext);
}

async function ecdhAesKey(
  privateKey: CryptoKey,
  publicKey: CryptoKey,
): Promise<CryptoKey> {
  const bits = await crypto.subtle.deriveBits(
    { name: "ECDH", public: publicKey },
    privateKey,
    256,
  );
  const hkdf = await crypto.subtle.importKey("raw", bits, "HKDF", false, ["deriveKey"]);
  return crypto.subtle.deriveKey(
    { name: "HKDF", hash: "SHA-256", salt: randomBytes(32), info: WRAP_INFO },
    hkdf,
    AES_ALG,
    false,
    ["encrypt", "decrypt"],
  );
}

export type WrappedVideoKey = {
  ephemeralPublic: string;
  iv: string;
  ciphertext: string;
};

export async function wrapVideoKeyForRecipient(
  videoKey: CryptoKey,
  recipientPublic: CryptoKey,
): Promise<string> {
  const ephemeral = await generateIdentityKeyPair();
  const wrapKey = await ecdhAesKey(ephemeral.privateKey, recipientPublic);
  const raw = await crypto.subtle.exportKey("raw", videoKey);
  const { iv, ciphertext } = await encryptBuffer(wrapKey, raw);
  const payload: WrappedVideoKey = {
    ephemeralPublic: await exportPublicKey(ephemeral.publicKey),
    iv: bufToB64(iv),
    ciphertext: bufToB64(ciphertext),
  };
  return JSON.stringify(payload);
}

export async function unwrapVideoKey(
  wrappedJson: string,
  recipientPrivate: CryptoKey,
): Promise<CryptoKey> {
  const wrapped = JSON.parse(wrappedJson) as WrappedVideoKey;
  const ephemeralPublic = await importPublicKey(wrapped.ephemeralPublic);
  const wrapKey = await ecdhAesKey(recipientPrivate, ephemeralPublic);
  const raw = await decryptBuffer(wrapKey, b64ToBuf(wrapped.iv), b64ToBuf(wrapped.ciphertext));
  return crypto.subtle.importKey("raw", raw, AES_ALG, true, ["encrypt", "decrypt"]);
}

export async function hashPasscode(passcode: string, salt: Uint8Array): Promise<string> {
  const key = await derivePasscodeKey(passcode, salt);
  const probe = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: randomBytes(12) },
    key,
    utf8("haven-lock"),
  );
  return bufToB64(probe);
}

export async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", utf8(value));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
