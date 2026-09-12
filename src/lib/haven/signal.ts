import { loadCircles, loadFriends } from "./graph-local";
import type { PacketHeader } from "./packet";
import { relayPublish } from "./relay";
import { expiresAtFrom, isGroupPeer, type StoredVideo, type TtlMode } from "./types";
import { sealClip } from "./vault";

export async function sendSealedHeader(opts: {
  recipientId: string;
  recipientPublicKey: string;
  header: PacketHeader;
  ttlMode?: TtlMode;
}): Promise<void> {
  const ttlMode = opts.ttlMode ?? "6m";
  const sealed = await sealClip({ blob: new Blob([]), poster: null, header: opts.header });
  const exp = expiresAtFrom(ttlMode);
  await relayPublish({
    recipientId: opts.recipientId,
    ttlMode,
    expiresAt: exp ? new Date(exp).toISOString() : null,
    wrappedKey: await sealed.wrapFor(opts.recipientPublicKey),
    iv: sealed.iv,
    ciphertext: sealed.ciphertext,
    poster: null,
  });
}

function keyFor(userId: string, friends: Awaited<ReturnType<typeof loadFriends>>, circles: Awaited<ReturnType<typeof loadCircles>>): string | null {
  const friend = friends.find((f) => f.userId === userId);
  if (friend?.publicKey) return friend.publicKey;
  for (const circle of circles) {
    const member = circle.members.find((m) => m.userId === userId);
    if (member?.publicKey) return member.publicKey;
  }
  return null;
}

/** Dual-delete: tell the other party this clip is gone. 1:1 only — groups expire per device. */
export async function shredPeerCopies(clips: StoredVideo[], myId: string): Promise<void> {
  if (!clips.length) return;
  const [friends, circles] = await Promise.all([loadFriends(), loadCircles()]);
  for (const clip of clips) {
    if (clip.groupId || isGroupPeer(clip.peerId) || clip.peerId === "self") continue;
    const otherId = clip.outgoing ? clip.recipientId : clip.senderId;
    if (!otherId || otherId === myId) continue;
    const pub = keyFor(otherId, friends, circles);
    if (!pub) continue;
    try {
      await sendSealedHeader({
        recipientId: otherId,
        recipientPublicKey: pub,
        header: { v: 1, purpose: "shred", clipId: clip.id, senderId: myId },
        ttlMode: "1d",
      });
    } catch {
      /* best-effort dual delete */
    }
  }
}
