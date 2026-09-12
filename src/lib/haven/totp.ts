import { asBytes, randomBytes } from "./bytes";

const ALPH = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

export function randomTotpSecret(): string {
  const bytes = randomBytes(20);
  return toBase32(bytes);
}

export function toBase32(bytes: Uint8Array): string {
  let bits = 0;
  let value = 0;
  let out = "";
  for (const b of bytes) {
    value = (value << 8) | b;
    bits += 8;
    while (bits >= 5) {
      out += ALPH[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) out += ALPH[(value << (5 - bits)) & 31];
  return out;
}

export function fromBase32(text: string): Uint8Array<ArrayBuffer> {
  const clean = text.toUpperCase().replace(/=+$/g, "").replace(/[^A-Z2-7]/g, "");
  let bits = 0;
  let value = 0;
  const out: number[] = [];
  for (const ch of clean) {
    const idx = ALPH.indexOf(ch);
    if (idx < 0) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return Uint8Array.from(out) as Uint8Array<ArrayBuffer>;
}

export function otpauthUrl(secret: string, account: string): string {
  const label = encodeURIComponent(`Haven:${account}`);
  return `otpauth://totp/${label}?secret=${secret}&issuer=Haven&digits=6&period=30`;
}

export async function totpCode(secret: string, at = Date.now()): Promise<string> {
  const keyBytes = fromBase32(secret);
  const key = await crypto.subtle.importKey("raw", asBytes(keyBytes), { name: "HMAC", hash: "SHA-1" }, false, [
    "sign",
  ]);
  const counter = Math.floor(at / 30_000);
  const msg = new ArrayBuffer(8);
  const view = new DataView(msg);
  view.setUint32(4, counter);
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", key, msg));
  const offset = sig[sig.length - 1]! & 0xf;
  const bin =
    ((sig[offset]! & 0x7f) << 24) |
    (sig[offset + 1]! << 16) |
    (sig[offset + 2]! << 8) |
    sig[offset + 3]!;
  return String(bin % 1_000_000).padStart(6, "0");
}

export async function totpValid(secret: string, code: string, at = Date.now()): Promise<boolean> {
  const guess = code.replace(/\s/g, "");
  if (!/^\d{6}$/.test(guess)) return false;
  for (const delta of [-1, 0, 1]) {
    const expect = await totpCode(secret, at + delta * 30_000);
    if (expect === guess) return true;
  }
  return false;
}
