import { asBytes } from "./bytes";
import { isMediaKind, isReactionEmoji, isTtlMode, type MediaKind, type TtlMode } from "./types";

const MAGIC = [0x48, 0x56, 0x4e, 0x31]; // HVN1

export type PacketPurpose =
  | "clip"
  | "receipt"
  | "reaction"
  | "recovery"
  | "circle-meta"
  | "intro"
  | "intro-ack"
  | "shred";

export type PacketMember = {
  userId: string;
  handle?: string;
  displayName?: string;
  publicKey?: string;
  role?: "owner" | "member";
  status?: "member" | "invited";
};

export type PacketHeader = {
  v: 1;
  purpose: PacketPurpose;
  kind?: MediaKind;
  mimeType?: string;
  durationMs?: number;
  senderId?: string;
  senderHandle?: string;
  senderName?: string;
  senderPublicKey?: string;
  allowSave?: boolean;
  groupId?: string | null;
  captions?: string;
  circleName?: string;
  createdBy?: string;
  disbanded?: boolean;
  members?: PacketMember[];
  clipId?: string;
  at?: number;
  emoji?: string;
  ttlMode?: TtlMode;
};

export type Unpacked = {
  header: PacketHeader | null;
  media: ArrayBuffer;
};

function isPurpose(value: unknown): value is PacketPurpose {
  return (
    value === "clip" ||
    value === "receipt" ||
    value === "reaction" ||
    value === "recovery" ||
    value === "circle-meta" ||
    value === "intro" ||
    value === "intro-ack" ||
    value === "shred"
  );
}

function parseMembers(raw: unknown): PacketMember[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const out: PacketMember[] = [];
  for (const item of raw.slice(0, 50)) {
    if (!item || typeof item !== "object") continue;
    const rec = item as Record<string, unknown>;
    if (typeof rec.userId !== "string") continue;
    out.push({
      userId: rec.userId,
      handle: typeof rec.handle === "string" ? rec.handle : undefined,
      displayName: typeof rec.displayName === "string" ? rec.displayName : undefined,
      publicKey: typeof rec.publicKey === "string" ? rec.publicKey : undefined,
      role: rec.role === "owner" ? "owner" : "member",
      status: rec.status === "invited" ? "invited" : "member",
    });
  }
  return out.length ? out : undefined;
}

export function parseHeader(raw: unknown): PacketHeader | null {
  if (!raw || typeof raw !== "object") return null;
  const rec = raw as Record<string, unknown>;
  if (!isPurpose(rec.purpose)) return null;
  const kind = typeof rec.kind === "string" && isMediaKind(rec.kind) ? rec.kind : undefined;
  const emoji = typeof rec.emoji === "string" && isReactionEmoji(rec.emoji) ? rec.emoji : undefined;
  const ttlMode = typeof rec.ttlMode === "string" && isTtlMode(rec.ttlMode) ? rec.ttlMode : undefined;
  return {
    v: 1,
    purpose: rec.purpose,
    kind,
    mimeType: typeof rec.mimeType === "string" ? rec.mimeType : undefined,
    durationMs: typeof rec.durationMs === "number" ? rec.durationMs : undefined,
    senderId: typeof rec.senderId === "string" ? rec.senderId : undefined,
    senderHandle: typeof rec.senderHandle === "string" ? rec.senderHandle : undefined,
    senderName: typeof rec.senderName === "string" ? rec.senderName : undefined,
    senderPublicKey: typeof rec.senderPublicKey === "string" ? rec.senderPublicKey : undefined,
    allowSave: rec.allowSave === true,
    groupId: typeof rec.groupId === "string" ? rec.groupId : rec.groupId === null ? null : undefined,
    captions: typeof rec.captions === "string" ? rec.captions : undefined,
    circleName: typeof rec.circleName === "string" ? rec.circleName : undefined,
    createdBy: typeof rec.createdBy === "string" ? rec.createdBy : undefined,
    disbanded: rec.disbanded === true,
    members: parseMembers(rec.members),
    clipId: typeof rec.clipId === "string" ? rec.clipId : undefined,
    at: typeof rec.at === "number" ? rec.at : undefined,
    emoji,
    ttlMode,
  };
}

export function packPacket(header: PacketHeader, media: ArrayBuffer | Uint8Array): ArrayBuffer {
  const headerBytes = new TextEncoder().encode(JSON.stringify(header));
  const body = asBytes(media);
  const out = new Uint8Array(8 + headerBytes.length + body.length);
  out[0] = MAGIC[0]!;
  out[1] = MAGIC[1]!;
  out[2] = MAGIC[2]!;
  out[3] = MAGIC[3]!;
  const view = new DataView(out.buffer, out.byteOffset, out.byteLength);
  view.setUint32(4, headerBytes.length);
  out.set(headerBytes, 8);
  out.set(body, 8 + headerBytes.length);
  return out.buffer.slice(out.byteOffset, out.byteOffset + out.byteLength);
}

export function unpackPacket(buffer: ArrayBuffer | Uint8Array): Unpacked {
  const bytes = asBytes(buffer);
  if (
    bytes.length < 8 ||
    bytes[0] !== MAGIC[0] ||
    bytes[1] !== MAGIC[1] ||
    bytes[2] !== MAGIC[2] ||
    bytes[3] !== MAGIC[3]
  ) {
    return { header: null, media: bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) };
  }
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const headerLen = view.getUint32(4);
  if (headerLen < 2 || 8 + headerLen > bytes.length) {
    return { header: null, media: bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) };
  }
  try {
    const json = new TextDecoder().decode(bytes.subarray(8, 8 + headerLen));
    const header = parseHeader(JSON.parse(json));
    const media = bytes.subarray(8 + headerLen);
    return {
      header,
      media: media.buffer.slice(media.byteOffset, media.byteOffset + media.byteLength),
    };
  } catch {
    return { header: null, media: bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) };
  }
}
