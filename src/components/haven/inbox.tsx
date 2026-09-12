import { Mic, Send } from "lucide-react";
import { groupPeerId, type Circle, type Friend, type StoredVideo } from "@/lib/haven/types";
import { cn } from "@/lib/utils";

export function InboxScreen({
  friends,
  circles,
  videos,
  myId: _myId,
  onOpen,
}: {
  friends: Friend[];
  circles: Circle[];
  videos: StoredVideo[];
  myId: string;
  onOpen: (peerId: string) => void;
}) {
  const byPeer = new Map<string, StoredVideo[]>();
  for (const v of videos) {
    if (v.outgoing || v.viewedAt) continue;
    const list = byPeer.get(v.peerId) ?? [];
    list.push(v);
    byPeer.set(v.peerId, list);
  }
  const items = [...byPeer.entries()].sort(
    (a, b) => Math.max(...b[1].map((c) => c.createdAt)) - Math.max(...a[1].map((c) => c.createdAt)),
  );

  return (
    <div className="flex flex-col gap-6 px-5 pb-28 pt-6">
      <header>
        <h1 className="text-2xl font-medium tracking-tight">Inbox</h1>
        <p className="mt-1 text-sm text-mute">New clips land here first. Tap a person to watch the thread.</p>
      </header>
      {items.length === 0 ? (
        <div className="glass flex flex-col items-center gap-3 rounded-2xl px-6 py-12 text-center">
          <Send className="size-8 -rotate-45 text-mist" />
          <p className="text-sm text-mute">Nothing waiting. New videos and voice notes appear here.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map(([peerId, clips]) => {
            const circle = circles.find((c) => groupPeerId(c.id) === peerId);
            const friend = friends.find((f) => f.userId === peerId);
            const name =
              peerId === "self" ? "You" : (circle?.name ?? friend?.displayName ?? "Someone");
            const latest = clips.reduce((a, b) => (a.createdAt > b.createdAt ? a : b));
            const hasAudio = clips.some((c) => c.kind === "audio");
            return (
              <button
                key={peerId}
                type="button"
                onClick={() => onOpen(peerId)}
                className="glass flex w-full items-center gap-3 rounded-xl px-4 py-4 text-left"
              >
                <span
                  className={cn(
                    "grid size-12 shrink-0 place-items-center rounded-full text-sm font-medium",
                    "bg-fog text-accent-fg",
                  )}
                >
                  {name.slice(0, 1).toUpperCase()}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{name}</span>
                  <span className="flex items-center gap-1 text-xs text-mute">
                    {hasAudio ? <Mic className="size-3" /> : null}
                    {clips.length} new
                    {circle ? ` · ${circle.members.length} people` : friend ? ` · @${friend.handle}` : ""}
                  </span>
                </span>
                <span className="grid min-w-6 place-items-center rounded-full bg-fog px-1.5 py-0.5 text-[11px] font-semibold text-accent-fg tabular-nums">
                  {clips.length}
                </span>
                <span className="sr-only">
                  Latest {new Date(latest.createdAt).toLocaleString()}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
