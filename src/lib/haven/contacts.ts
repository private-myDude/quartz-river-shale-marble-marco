import { sha256Hex } from "./crypto";
import { last4, normalizePhone, PHONE_HASH_PEPPER } from "./phone";
import { sealToKv, unsealFromKv } from "./sealed";

const CONTACTS_KEY = "phone-contacts";

export type VaultContact = {
  id: string;
  name: string;
  phones: string[];
  emails: string[];
  addedAt: number;
};

type ContactsPickerResult = {
  name?: string[];
  tel?: string[];
  email?: string[];
};

function contactsApi(): {
  select: (
    properties: string[],
    options?: { multiple?: boolean },
  ) => Promise<ContactsPickerResult[]>;
} | null {
  if (typeof navigator === "undefined") return null;
  const api = (navigator as Navigator & { contacts?: { select?: unknown } }).contacts;
  if (!api || typeof api.select !== "function") return null;
  return api as {
    select: (
      properties: string[],
      options?: { multiple?: boolean },
    ) => Promise<ContactsPickerResult[]>;
  };
}

export function contactsPickerAvailable(): boolean {
  return contactsApi() != null;
}

export async function hashContactPhone(phone: string): Promise<string> {
  return sha256Hex(`${PHONE_HASH_PEPPER}:${phone}`);
}

export async function hashContactEmail(email: string): Promise<string> {
  return sha256Hex(`${PHONE_HASH_PEPPER}:${email.trim().toLowerCase()}`);
}

export async function hashHandle(handle: string): Promise<string> {
  const compact = handle.trim().toLowerCase().replace(/^@/, "");
  return sha256Hex(`${PHONE_HASH_PEPPER}:handle:${compact}`);
}

export async function loadContacts(): Promise<VaultContact[]> {
  return (await unsealFromKv<VaultContact[]>(CONTACTS_KEY)) ?? [];
}

async function persist(contacts: VaultContact[]): Promise<void> {
  await sealToKv(CONTACTS_KEY, contacts);
}

function mergeContact(existing: VaultContact[], incoming: VaultContact): VaultContact[] {
  const phoneSet = new Set(incoming.phones);
  const emailSet = new Set(incoming.emails.map((e) => e.toLowerCase()));
  const idx = existing.findIndex((row) => {
    if (row.phones.some((p) => phoneSet.has(p))) return true;
    if (row.emails.some((e) => emailSet.has(e.toLowerCase()))) return true;
    return false;
  });
  if (idx < 0) return [...existing, incoming];
  const prev = existing[idx]!;
  const next: VaultContact = {
    ...prev,
    name: incoming.name || prev.name,
    phones: [...new Set([...prev.phones, ...incoming.phones])],
    emails: [...new Set([...prev.emails, ...incoming.emails])],
  };
  const copy = existing.slice();
  copy[idx] = next;
  return copy;
}

export async function upsertContact(input: {
  name: string;
  phones?: string[];
  emails?: string[];
}): Promise<VaultContact[]> {
  const phones = (input.phones ?? [])
    .map((p) => normalizePhone(p))
    .filter((p): p is string => Boolean(p));
  const emails = (input.emails ?? [])
    .map((e) => e.trim().toLowerCase())
    .filter((e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));
  if (!phones.length && !emails.length) {
    throw new Error("Add a phone number or email");
  }
  const all = await loadContacts();
  const merged = mergeContact(all, {
    id: crypto.randomUUID(),
    name: input.name.trim() || phones[0] || emails[0] || "Contact",
    phones,
    emails,
    addedAt: Date.now(),
  });
  merged.sort((a, b) => a.name.localeCompare(b.name));
  await persist(merged);
  return merged;
}

export async function removeContact(id: string): Promise<VaultContact[]> {
  const next = (await loadContacts()).filter((row) => row.id !== id);
  await persist(next);
  return next;
}

export async function pickDeviceContacts(): Promise<VaultContact[]> {
  const api = contactsApi();
  if (!api) throw new Error("This phone cannot share its address book with the browser");
  const rows = await api.select(["name", "tel", "email"], { multiple: true });
  let all = await loadContacts();
  for (const row of rows) {
    const name = (row.name ?? []).filter(Boolean).join(" ").trim();
    const phones = (row.tel ?? []).map((t) => normalizePhone(t)).filter((t): t is string => Boolean(t));
    const emails = (row.email ?? [])
      .map((e) => e.trim().toLowerCase())
      .filter((e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));
    if (!name && !phones.length && !emails.length) continue;
    all = mergeContact(all, {
      id: crypto.randomUUID(),
      name: name || phones[0] || emails[0] || "Contact",
      phones,
      emails,
      addedAt: Date.now(),
    });
  }
  all.sort((a, b) => a.name.localeCompare(b.name));
  await persist(all);
  return all;
}

export function contactSubtitle(contact: VaultContact): string {
  if (contact.phones[0]) return `Mobile · ${last4(contact.phones[0])}`;
  if (contact.emails[0]) return contact.emails[0];
  return "Saved on this phone";
}
