export const TTL_OPTIONS = [
  { id: "view", label: "After viewing", hint: "Destroyed when they finish watching" },
  { id: "1d", label: "24 hours", hint: "Gone 24 hours after they watch — not after you send" },
  { id: "1w", label: "1 week", hint: "Lives seven days after they watch" },
  { id: "2w", label: "2 weeks", hint: "Lives fourteen days after they watch" },
  { id: "3w", label: "3 weeks", hint: "Lives twenty-one days after they watch" },
  { id: "4w", label: "4 weeks", hint: "Lives twenty-eight days after they watch" },
  { id: "6m", label: "6 months", hint: "Lives six months after they watch" },
  { id: "forever", label: "Keep forever", hint: "Stays until you delete it" },
] as const;

export type TtlMode = (typeof TTL_OPTIONS)[number]["id"];

export const TTL_SECONDS: Record<TtlMode, number | null> = {
  view: null,
  "1d": 86400,
  "1w": 86400 * 7,
  "2w": 86400 * 14,
  "3w": 86400 * 21,
  "4w": 86400 * 28,
  "6m": 86400 * 182,
  forever: null,
};

export const REACTION_EMOJIS = ["❤️", "😂", "😮", "😢", "👍", "🔥"] as const;
export type ReactionEmoji = (typeof REACTION_EMOJIS)[number];

export function isReactionEmoji(value: string): value is ReactionEmoji {
  return (REACTION_EMOJIS as readonly string[]).includes(value);
}

export function isTtlMode(value: string): value is TtlMode {
  return TTL_OPTIONS.some((option) => option.id === value);
}

export function ttlLabel(mode: TtlMode): string {
  return TTL_OPTIONS.find((option) => option.id === mode)?.label ?? "24 hours";
}

export function ttlHint(mode: TtlMode): string {
  return TTL_OPTIONS.find((option) => option.id === mode)?.hint ?? "";
}

/** Lifetime clock starts when the clip is watched, never when it is sent. */
export function expiresAtFrom(mode: TtlMode, fromMs = Date.now()): number | null {
  const seconds = TTL_SECONDS[mode];
  if (seconds == null) return null;
  return fromMs + seconds * 1000;
}

export type MediaKind = "video" | "audio" | "receipt" | "reaction" | "recovery";

export function isMediaKind(value: string): value is MediaKind {
  return value === "video" || value === "audio" || value === "receipt" || value === "reaction" || value === "recovery";
}

export function isPlayable(kind: MediaKind): boolean {
  return kind === "video" || kind === "audio";
}

export type Discovery = "handle" | "anyone";

export function isDiscovery(value: string): value is Discovery {
  return value === "handle" || value === "anyone";
}

export type Profile = {
  userId: string;
  handle: string;
  displayName: string;
  phoneLast4: string | null;
  hasPhone: boolean;
  publicKey: string | null;
  defaultTtl: TtlMode;
  setupComplete: boolean;
  discovery: Discovery;
  allowSave: boolean;
  sendReceipts: boolean;
  totpEnabled: boolean;
  hasRecoveryEmail: boolean;
};

export type Friend = {
  userId: string;
  handle: string;
  displayName: string;
  publicKey: string | null;
  status: "accepted" | "pending-out" | "pending-in";
  friendshipId: string;
};

export const MAX_CIRCLE = 50;
export const GROUP_PREFIX = "g:";

export function groupPeerId(id: string): string {
  return `${GROUP_PREFIX}${id}`;
}

export function isGroupPeer(peerId: string): boolean {
  return peerId.startsWith(GROUP_PREFIX);
}

export function parseGroupId(peerId: string): string | null {
  return isGroupPeer(peerId) ? peerId.slice(GROUP_PREFIX.length) : null;
}

export type CircleMember = {
  userId: string;
  handle: string;
  displayName: string;
  publicKey: string | null;
  role: "owner" | "member";
  status: "member" | "invited";
};

export type Circle = {
  id: string;
  name: string;
  createdBy: string;
  members: CircleMember[];
  pending?: boolean;
};

export type EnvelopeMeta = {
  id: string;
  ttlMode: TtlMode;
  createdAt: string;
  senderId?: string;
};

export type EnvelopePayload = EnvelopeMeta & {
  wrappedKey: string;
  iv: string;
  ciphertext: string;
  poster: string | null;
};

export type StoredVideo = {
  id: string;
  peerId: string;
  senderId: string;
  recipientId: string;
  createdAt: number;
  ttlMode: TtlMode;
  expiresAt: number | null;
  viewedAt: number | null;
  theyViewedAt: number | null;
  iv: ArrayBuffer;
  ciphertext: ArrayBuffer;
  posterIv: ArrayBuffer | null;
  posterCipher: ArrayBuffer | null;
  durationMs: number;
  outgoing: boolean;
  kind: MediaKind;
  mimeType: string;
  groupId: string | null;
  allowSave: boolean;
  captions: string;
  hearts: number;
  reactions: Record<string, number>;
};

export const SELF_PEER = "self";
