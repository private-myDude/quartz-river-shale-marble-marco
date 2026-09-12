import { sealToKv, unsealFromKv } from "./sealed";
import type { Circle, CircleMember, Friend } from "./types";

const FRIENDS_KEY = "graph-friends";
const CIRCLES_KEY = "graph-circles";
const BLOCKS_KEY = "graph-blocks";
const IDENTITY_KEY = "graph-identity";
const OUTGOING_KEY = "graph-outgoing-ids";

export const PENDING_INVITE_KEY = "haven-pending-invite";

export type LocalIdentity = {
  handle: string;
  displayName: string;
};

export type PendingInvite = {
  userId: string;
  publicKey: string | null;
  handle: string;
  displayName: string;
};

export function suggestHandle(name: string): string {
  const base =
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "")
      .slice(0, 12) || "haven";
  const suffix = Math.floor(100 + Math.random() * 900);
  return `${base}${suffix}`;
}

export async function loadIdentity(): Promise<LocalIdentity> {
  return (await unsealFromKv<LocalIdentity>(IDENTITY_KEY)) ?? { handle: "", displayName: "" };
}

export async function saveIdentity(next: LocalIdentity): Promise<void> {
  await sealToKv(IDENTITY_KEY, {
    handle: next.handle.trim().toLowerCase().replace(/^@/, ""),
    displayName: next.displayName.trim().slice(0, 40),
  });
}

export async function loadFriends(): Promise<Friend[]> {
  return (await unsealFromKv<Friend[]>(FRIENDS_KEY)) ?? [];
}

export async function upsertFriend(incoming: Friend): Promise<Friend[]> {
  const all = await loadFriends();
  const idx = all.findIndex((row) => row.userId === incoming.userId);
  if (idx < 0) {
    all.push({ ...incoming, friendshipId: incoming.friendshipId || crypto.randomUUID() });
  } else {
    const prev = all[idx]!;
    let status = incoming.status;
    if (prev.status === "accepted" || incoming.status === "accepted") status = "accepted";
    else if (
      (prev.status === "pending-out" && incoming.status === "pending-in") ||
      (prev.status === "pending-in" && incoming.status === "pending-out")
    ) {
      status = "accepted";
    }
    all[idx] = {
      ...prev,
      handle: incoming.handle || prev.handle,
      displayName: incoming.displayName || prev.displayName,
      publicKey: incoming.publicKey || prev.publicKey,
      status,
    };
  }
  all.sort((a, b) => a.displayName.localeCompare(b.displayName));
  await sealToKv(FRIENDS_KEY, all);
  return all;
}

export async function removeFriend(userId: string): Promise<Friend[]> {
  const next = (await loadFriends()).filter((row) => row.userId !== userId);
  await sealToKv(FRIENDS_KEY, next);
  return next;
}

export async function loadCircles(): Promise<Circle[]> {
  return (await unsealFromKv<Circle[]>(CIRCLES_KEY)) ?? [];
}

export async function saveCircle(circle: Circle): Promise<Circle[]> {
  const all = await loadCircles();
  const idx = all.findIndex((row) => row.id === circle.id);
  if (idx < 0) all.unshift(circle);
  else all[idx] = circle;
  await sealToKv(CIRCLES_KEY, all);
  return all;
}

export async function removeCircle(id: string): Promise<Circle[]> {
  const next = (await loadCircles()).filter((row) => row.id !== id);
  await sealToKv(CIRCLES_KEY, next);
  return next;
}

export async function loadBlocks(): Promise<string[]> {
  return (await unsealFromKv<string[]>(BLOCKS_KEY)) ?? [];
}

export async function blockLocal(userId: string): Promise<void> {
  const blocks = await loadBlocks();
  if (!blocks.includes(userId)) blocks.push(userId);
  await sealToKv(BLOCKS_KEY, blocks);
  await removeFriend(userId);
  const circles = await loadCircles();
  const next = circles
    .map((c) => ({ ...c, members: c.members.filter((m) => m.userId !== userId) }))
    .filter((c) => c.createdBy !== userId);
  await sealToKv(CIRCLES_KEY, next);
}

export async function isBlocked(userId: string): Promise<boolean> {
  const blocks = await loadBlocks();
  return blocks.includes(userId);
}

export async function rememberOutgoing(id: string): Promise<void> {
  const ids = (await unsealFromKv<string[]>(OUTGOING_KEY)) ?? [];
  if (!ids.includes(id)) ids.push(id);
  if (ids.length > 400) ids.splice(0, ids.length - 400);
  await sealToKv(OUTGOING_KEY, ids);
}

export async function outgoingIds(): Promise<string[]> {
  return (await unsealFromKv<string[]>(OUTGOING_KEY)) ?? [];
}

export async function consumePendingInvite(): Promise<void> {
  if (typeof sessionStorage === "undefined") return;
  const raw = sessionStorage.getItem(PENDING_INVITE_KEY);
  if (!raw) return;
  sessionStorage.removeItem(PENDING_INVITE_KEY);
  try {
    const row = JSON.parse(raw) as PendingInvite;
    if (!row.userId) return;
    await upsertFriend({
      userId: row.userId,
      handle: row.handle || "friend",
      displayName: row.displayName || row.handle || "Friend",
      publicKey: row.publicKey,
      status: "accepted",
      friendshipId: crypto.randomUUID(),
    });
  } catch {
    /* ignore */
  }
}

export function toCircleMembers(
  members: {
    userId: string;
    handle?: string;
    displayName?: string;
    publicKey?: string | null;
    role?: string;
    status?: string;
  }[],
): CircleMember[] {
  return members.map((m) => ({
    userId: m.userId,
    handle: m.handle ?? "",
    displayName: m.displayName ?? m.handle ?? "Friend",
    publicKey: m.publicKey ?? null,
    role: m.role === "owner" ? "owner" : "member",
    status: m.status === "invited" ? "invited" : "member",
  }));
}
