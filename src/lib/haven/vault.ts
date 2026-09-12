import { b64ToBuf, bufToB64 } from "./bytes";
import {
  decryptBuffer,
  encryptBuffer,
  generateAesKey,
  importPublicKey,
  unwrapVideoKey,
  wrapVideoKeyForRecipient,
} from "./crypto";
import { rememberCircleName } from "./circles-local";
import {
  isBlocked,
  removeCircle,
  saveCircle,
  toCircleMembers,
  upsertFriend,
} from "./graph-local";
import { deleteVideo, getVideo, listVideos, putVideo } from "./idb";
import { getSessionKeys } from "./lock";
import { packPacket, unpackPacket, type PacketHeader } from "./packet";
import {
  expiresAtFrom,
  groupPeerId,
  isMediaKind,
  isPlayable,
  isTtlMode,
  SELF_PEER,
  type MediaKind,
  type StoredVideo,
  type TtlMode,
} from "./types";

function normalizeReactions(row: { reactions?: unknown; hearts?: unknown }): Record<string, number> {
  if (row.reactions && typeof row.reactions === "object" && !Array.isArray(row.reactions)) {
    const out: Record<string, number> = {};
    for (const [key, value] of Object.entries(row.reactions as Record<string, unknown>)) {
      if (typeof value === "number" && value > 0) out[key] = value;
    }
    if (Object.keys(out).length) return out;
  }
  const hearts = typeof row.hearts === "number" && row.hearts > 0 ? row.hearts : 0;
  return hearts ? { "❤️": hearts } : {};
}

function normalize(row: StoredRow): StoredRow {
  const kind: MediaKind = isMediaKind(row.kind) ? row.kind : "video";
  const ttlMode: TtlMode = isTtlMode(row.ttlMode) ? row.ttlMode : "1d";
  const reactions = normalizeReactions(row);
  return {
    ...row,
    kind,
    ttlMode,
    mimeType: row.mimeType || (kind === "audio" ? "audio/webm" : "video/webm"),
    groupId: row.groupId ?? null,
    theyViewedAt: row.theyViewedAt ?? null,
    allowSave: row.allowSave === true,
    captions: typeof row.captions === "string" ? row.captions : "",
    reactions,
    hearts: reactions["❤️"] ?? 0,
    expiresAt: row.ttlMode === "forever" ? null : row.expiresAt,
  };
}

function clipHeader(opts: {
  clipId: string;
  senderId: string;
  kind: MediaKind;
  mimeType: string;
  durationMs: number;
  ttlMode: TtlMode;
  groupId?: string | null;
  allowSave?: boolean;
  captions?: string;
  senderHandle?: string;
  senderName?: string;
}): PacketHeader {
  return {
    v: 1,
    purpose: "clip",
    clipId: opts.clipId,
    kind: opts.kind,
    mimeType: opts.mimeType,
    durationMs: opts.durationMs,
    senderId: opts.senderId,
    senderHandle: opts.senderHandle,
    senderName: opts.senderName,
    allowSave: opts.allowSave === true,
    groupId: opts.groupId ?? null,
    captions: opts.captions ?? "",
    ttlMode: opts.ttlMode,
  };
}

export async function encryptAndStoreVideo(opts: {
  id: string;
  peerId: string;
  senderId: string;
  recipientId: string;
  blob: Blob;
  poster: Blob | null;
  ttlMode: TtlMode;
  durationMs: number;
  outgoing: boolean;
  kind?: MediaKind;
  mimeType?: string;
  groupId?: string | null;
  allowSave?: boolean;
  captions?: string;
  senderHandle?: string;
  senderName?: string;
}): Promise<StoredVideo> {
  const { vaultKey } = getSessionKeys();
  const kind: MediaKind = opts.kind === "audio" ? "audio" : "video";
  const mimeType = opts.mimeType || opts.blob.type || (kind === "audio" ? "audio/webm" : "video/webm");
  const packed = packPacket(
    clipHeader({
      clipId: opts.id,
      senderId: opts.senderId,
      kind,
      mimeType,
      durationMs: opts.durationMs,
      ttlMode: opts.ttlMode,
      groupId: opts.groupId,
      allowSave: opts.allowSave,
      captions: opts.captions,
      senderHandle: opts.senderHandle,
      senderName: opts.senderName,
    }),
    await opts.blob.arrayBuffer(),
  );
  const videoKey = await generateAesKey();
  const sealed = await encryptBuffer(videoKey, packed);
  const rawVideoKey = await crypto.subtle.exportKey("raw", videoKey);
  const wrappedKey = await encryptBuffer(vaultKey, rawVideoKey);

  let posterIv: ArrayBuffer | null = null;
  let posterCipher: ArrayBuffer | null = null;
  if (opts.poster) {
    const sealedPoster = await encryptBuffer(videoKey, await opts.poster.arrayBuffer());
    posterIv = sealedPoster.iv;
    posterCipher = sealedPoster.ciphertext;
  }

  const stored: StoredVideo = {
    id: opts.id,
    peerId: opts.peerId,
    senderId: opts.senderId,
    recipientId: opts.recipientId,
    createdAt: Date.now(),
    ttlMode: opts.ttlMode,
    expiresAt: null,
    viewedAt: null,
    iv: sealed.iv,
    ciphertext: sealed.ciphertext,
    posterIv,
    posterCipher,
    durationMs: opts.durationMs,
    outgoing: opts.outgoing,
    kind,
    mimeType,
    groupId: opts.groupId ?? null,
    theyViewedAt: null,
    allowSave: opts.allowSave === true,
    captions: opts.captions ?? "",
    hearts: 0,
    reactions: {},
  };
  await putVideo({ ...stored, wrappedKey: { iv: wrappedKey.iv, ciphertext: wrappedKey.ciphertext } });
  return stored;
}

type StoredRow = StoredVideo & {
  wrappedKey: { iv: ArrayBuffer; ciphertext: ArrayBuffer };
};

async function videoKeyFor(row: StoredRow): Promise<CryptoKey> {
  const { vaultKey } = getSessionKeys();
  const raw = await decryptBuffer(vaultKey, row.wrappedKey.iv, row.wrappedKey.ciphertext);
  return crypto.subtle.importKey("raw", raw, { name: "AES-GCM" }, true, ["encrypt", "decrypt"]);
}

export async function decryptVideo(id: string): Promise<Blob> {
  const raw = await getVideo<StoredRow>(id);
  if (!raw) throw new Error("Clip not found");
  const row = normalize(raw);
  const key = await videoKeyFor(row);
  const plain = await decryptBuffer(key, row.iv, row.ciphertext);
  const unpacked = unpackPacket(plain);
  const mime = unpacked.header?.mimeType || row.mimeType;
  return new Blob([unpacked.media], { type: mime });
}

export async function decryptPoster(id: string): Promise<Blob | null> {
  const row = await getVideo<StoredRow>(id);
  if (!row?.posterIv || !row?.posterCipher) return null;
  const key = await videoKeyFor(row);
  const plain = await decryptBuffer(key, row.posterIv, row.posterCipher);
  return new Blob([plain], { type: "image/jpeg" });
}

function startLifetime(row: StoredRow, at: number): void {
  if (row.ttlMode === "forever" || row.ttlMode === "view") {
    row.expiresAt = null;
    return;
  }
  row.expiresAt = expiresAtFrom(row.ttlMode, at);
}

export async function markViewed(id: string): Promise<StoredVideo | null> {
  const row = await getVideo<StoredRow>(id);
  if (!row) return null;
  row.viewedAt = Date.now();
  if (row.ttlMode === "view") {
    await deleteVideo(id);
    return null;
  }
  startLifetime(row, row.viewedAt);
  await putVideo(row);
  return normalize(row);
}

export async function destroyVideo(id: string): Promise<void> {
  await deleteVideo(id);
}

export async function sweepExpired(): Promise<StoredVideo[]> {
  const all = await listVideos<StoredRow>();
  const now = Date.now();
  const gone: StoredVideo[] = [];
  for (const raw of all) {
    const row = normalize(raw);
    if (row.ttlMode === "forever" || row.ttlMode === "view") continue;
    const start = row.outgoing ? row.theyViewedAt : row.viewedAt;
    if (!start) continue;
    const exp = expiresAtFrom(row.ttlMode, start);
    if (exp && exp <= now) {
      gone.push(row);
      await deleteVideo(row.id);
    }
  }
  return gone;
}

export async function videosForPeer(peerId: string): Promise<StoredVideo[]> {
  const all = await listVideos<StoredRow>();
  return all
    .filter((row) => row.peerId === peerId)
    .map(normalize)
    .filter((row) => isPlayable(row.kind))
    .sort((a, b) => a.createdAt - b.createdAt);
}

export async function latestByPeer(): Promise<Record<string, StoredVideo>> {
  const all = await listVideos<StoredRow>();
  const map: Record<string, StoredVideo> = {};
  for (const row of all.map(normalize).filter((v) => isPlayable(v.kind))) {
    const prev = map[row.peerId];
    if (!prev || row.createdAt > prev.createdAt) map[row.peerId] = row;
  }
  return map;
}

export async function unreadCount(peerId: string, myId: string): Promise<number> {
  const all = await videosForPeer(peerId);
  return all.filter((v) => !v.outgoing && v.recipientId === myId && !v.viewedAt).length;
}

export async function allVideos(): Promise<StoredVideo[]> {
  const all = await listVideos<StoredRow>();
  return all.map(normalize).filter((row) => isPlayable(row.kind));
}

export async function exportVaultRows(): Promise<StoredRow[]> {
  return listVideos<StoredRow>();
}

export async function importVaultRow(row: StoredRow): Promise<void> {
  await putVideo(normalize(row));
}

export type SealedClip = {
  videoKey: CryptoKey;
  iv: string;
  ciphertext: string;
  poster: string | null;
  wrapFor: (publicKeyB64: string) => Promise<string>;
};

export async function sealClip(opts: {
  blob: Blob;
  poster: Blob | null;
  header?: PacketHeader;
}): Promise<SealedClip> {
  const videoKey = await generateAesKey();
  const raw = await opts.blob.arrayBuffer();
  const packed = opts.header ? packPacket(opts.header, raw) : raw;
  const sealed = await encryptBuffer(videoKey, packed);
  let poster: string | null = null;
  if (opts.poster) {
    const sealedPoster = await encryptBuffer(videoKey, await opts.poster.arrayBuffer());
    poster = JSON.stringify({
      iv: bufToB64(sealedPoster.iv),
      ciphertext: bufToB64(sealedPoster.ciphertext),
    });
  }
  return {
    videoKey,
    iv: bufToB64(sealed.iv),
    ciphertext: bufToB64(sealed.ciphertext),
    poster,
    wrapFor: async (publicKeyB64: string) => {
      const recipient = await importPublicKey(publicKeyB64);
      return wrapVideoKeyForRecipient(videoKey, recipient);
    },
  };
}

export async function sealJsonMessage(
  payload: {
    clipId?: string;
    at?: number;
    purpose?: PacketHeader["purpose"];
    emoji?: string;
    ttlMode?: TtlMode;
  },
  recipientPublicKey: string,
  senderId: string,
): Promise<{ wrappedKey: string; iv: string; ciphertext: string }> {
  const purpose =
    payload.purpose === "reaction" || payload.purpose === "shred" || payload.purpose === "receipt"
      ? payload.purpose
      : "receipt";
  const header: PacketHeader = {
    v: 1,
    purpose,
    senderId,
    clipId: payload.clipId,
    at: payload.at,
    emoji: payload.emoji,
    ttlMode: payload.ttlMode,
  };
  const sealed = await sealClip({ blob: new Blob([]), poster: null, header });
  return {
    wrappedKey: await sealed.wrapFor(recipientPublicKey),
    iv: sealed.iv,
    ciphertext: sealed.ciphertext,
  };
}

export async function prepareOutgoingEnvelope(opts: {
  blob: Blob;
  poster: Blob | null;
  recipientPublicKey: string;
  ttlMode: TtlMode;
  header?: PacketHeader;
}): Promise<{
  wrappedKey: string;
  iv: string;
  ciphertext: string;
  poster: string | null;
}> {
  const sealed = await sealClip({ blob: opts.blob, poster: opts.poster, header: opts.header });
  return {
    wrappedKey: await sealed.wrapFor(opts.recipientPublicKey),
    iv: sealed.iv,
    ciphertext: sealed.ciphertext,
    poster: sealed.poster,
  };
}

export async function markTheyViewed(clipId: string, at = Date.now()): Promise<void> {
  const row = await getVideo<StoredRow>(clipId);
  if (!row) return;
  row.theyViewedAt = at;
  if (row.ttlMode === "view") {
    await deleteVideo(clipId);
    return;
  }
  startLifetime(row, at);
  await putVideo(row);
}

export async function addReaction(clipId: string, emoji = "❤️"): Promise<void> {
  const row = await getVideo<StoredRow>(clipId);
  if (!row) return;
  const reactions = normalizeReactions(row);
  reactions[emoji] = (reactions[emoji] ?? 0) + 1;
  row.reactions = reactions;
  row.hearts = reactions["❤️"] ?? 0;
  await putVideo(row);
}

export async function addHeart(clipId: string): Promise<void> {
  await addReaction(clipId, "❤️");
}

export async function ingestIncomingEnvelope(opts: {
  id: string;
  senderId?: string;
  recipientId: string;
  wrappedKey: string;
  iv: string;
  ciphertext: string;
  poster: string | null;
  ttlMode: TtlMode;
  createdAt: number;
}): Promise<StoredVideo | null> {
  const { privateKey, vaultKey } = getSessionKeys();
  const videoKey = await unwrapVideoKey(opts.wrappedKey, privateKey);
  const plain = await decryptBuffer(videoKey, b64ToBuf(opts.iv), b64ToBuf(opts.ciphertext));
  const unpacked = unpackPacket(plain);
  let header = unpacked.header;

  if (!header) {
    try {
      const msg = JSON.parse(new TextDecoder().decode(plain)) as {
        clipId?: string;
        at?: number;
        purpose?: string;
        emoji?: string;
      };
      if (msg.clipId) {
        header = {
          v: 1,
          purpose: msg.purpose === "reaction" ? "reaction" : msg.purpose === "shred" ? "shred" : "receipt",
          clipId: msg.clipId,
          at: msg.at,
          emoji: msg.emoji,
        };
      }
    } catch {
      /* legacy media */
    }
  }

  const purpose = header?.purpose ?? "clip";
  const senderId = header?.senderId || opts.senderId;
  if (senderId && (await isBlocked(senderId))) return null;

  if (purpose === "receipt") {
    if (header?.clipId) await markTheyViewed(header.clipId, header.at ?? Date.now());
    return null;
  }
  if (purpose === "reaction") {
    if (header?.clipId) await addReaction(header.clipId, header.emoji || "❤️");
    return null;
  }
  if (purpose === "shred") {
    if (header?.clipId) await destroyVideo(header.clipId);
    return null;
  }
  if (purpose === "intro" || purpose === "intro-ack") {
    if (senderId) {
      await upsertFriend({
        userId: senderId,
        handle: header?.senderHandle || "friend",
        displayName: header?.senderName || header?.senderHandle || "Friend",
        publicKey: header?.senderPublicKey ?? null,
        status: purpose === "intro-ack" ? "accepted" : "pending-in",
        friendshipId: crypto.randomUUID(),
      });
    }
    return null;
  }
  if (purpose === "circle-meta") {
    if (header?.disbanded && header.groupId) {
      await removeCircle(header.groupId);
      return null;
    }
    if (header?.groupId && header.circleName) {
      await rememberCircleName(header.groupId, header.circleName);
      await saveCircle({
        id: header.groupId,
        name: header.circleName,
        createdBy: header.createdBy || senderId || "",
        members: toCircleMembers(header.members ?? []),
        pending: (header.createdBy || senderId) !== opts.recipientId,
      });
    }
    return null;
  }
  if (purpose === "recovery") return null;

  const rawVideoKey = await crypto.subtle.exportKey("raw", videoKey);
  const wrappedLocal = await encryptBuffer(vaultKey, rawVideoKey);
  let posterIv: ArrayBuffer | null = null;
  let posterCipher: ArrayBuffer | null = null;
  if (opts.poster) {
    try {
      const parsed = JSON.parse(opts.poster) as { iv: string; ciphertext: string };
      posterIv = b64ToBuf(parsed.iv);
      posterCipher = b64ToBuf(parsed.ciphertext);
    } catch {
      posterIv = null;
      posterCipher = null;
    }
  }
  const kind: MediaKind =
    header?.kind && isMediaKind(header.kind) ? header.kind : "video";
  const from = senderId || "unknown";
  const groupId = header?.groupId ?? null;
  const ttlMode = header?.ttlMode && isTtlMode(header.ttlMode) ? header.ttlMode : opts.ttlMode;
  const id = header?.clipId || opts.id;
  if (await getVideo(id)) return null;
  const stored: StoredRow = {
    id,
    peerId: groupId ? groupPeerId(groupId) : from,
    senderId: from,
    recipientId: opts.recipientId,
    createdAt: opts.createdAt,
    ttlMode,
    expiresAt: null,
    viewedAt: null,
    theyViewedAt: null,
    iv: b64ToBuf(opts.iv),
    ciphertext: b64ToBuf(opts.ciphertext),
    posterIv,
    posterCipher,
    durationMs: header?.durationMs ?? 0,
    outgoing: false,
    kind,
    mimeType: header?.mimeType || (kind === "audio" ? "audio/webm" : "video/webm"),
    groupId,
    allowSave: header?.allowSave === true,
    captions: header?.captions ?? "",
    hearts: 0,
    reactions: {},
    wrappedKey: wrappedLocal,
  };
  await putVideo(stored);
  return stored;
}

export { SELF_PEER };
