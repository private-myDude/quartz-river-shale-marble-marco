import { Mic } from "lucide-react";
import { VideoOrb } from "./video-orb";
import { SELF_PEER, groupPeerId, type Circle, type Friend, type StoredVideo } from "@/lib/haven/types";
import { cn } from "@/lib/utils";

export function HomeScreen({
  meName,
  friends,
  circles,
  latest,
  videos,
  myId: _myId,
  onOpen,
  onRecordSelf,
}: {
  meName: string;
  friends: Friend[];
  circles: Circle[];
  latest: Record<string, StoredVideo>;
  videos: StoredVideo[];
  myId: string;
  onOpen: (peerId: string) => void;
  onRecordSelf: () => void;
}) {
  const accepted = friends.filter((f) => f.status === "accepted");
  const unreadFor = (peerId: string) =>
    videos.filter((v) => v.peerId === peerId && !v.outgoing && !v.viewedAt).length;

  const waiting = (() => {
    const byPeer = new Map<string, StoredVideo[]>();
    for (const v of videos) {
      if (v.outgoing || v.viewedAt) continue;
      const list = byPeer.get(v.peerId) ?? [];
      list.push(v);
      byPeer.set(v.peerId, list);
    }
    return [...byPeer.entries()].sort(
      (a, b) => Math.max(...b[1].map((c) => c.createdAt)) - Math.max(...a[1].map((c) => c.createdAt)),
    );
  })();

  function nameFor(peerId: string): string {
    if (peerId === SELF_PEER) return "You";
    const circle = circles.find((c) => groupPeerId(c.id) === peerId);
    if (circle) return circle.name;
    return friends.find((f) => f.userId === peerId)?.displayName ?? "Someone";
  }

  return (
    <div className="px-5 pb-28 pt-4">
      <header className="mb-6 flex items-end justify-between">
        <div>
          <p className="font-display text-4xl italic leading-none text-fog">Haven</p>
          <p className="mt-2 text-sm text-mute">{meName} · encrypted on this device</p>
        </div>
      </header>

      {waiting.length ? (
        <section className="mb-8">
          <p className="mb-3 text-xs uppercase tracking-[0.16em] text-mute">New</p>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {waiting.map(([peerId, clips]) => {
              const name = nameFor(peerId);
              const hasAudio = clips.some((c) => c.kind === "audio");
              return (
                <button
                  key={peerId}
                  type="button"
                  onClick={() => onOpen(peerId)}
                  className="glass flex min-w-40 shrink-0 items-center gap-3 rounded-2xl px-3 py-3 text-left"
                >
                  <span className="grid size-11 shrink-0 place-items-center rounded-full bg-fog text-sm font-medium text-accent-fg">
                    {name.slice(0, 1).toUpperCase()}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">{name}</span>
                    <span className="flex items-center gap-1 text-xs text-mute">
                      {hasAudio ? <Mic className="size-3" /> : null}
                      {clips.length} new
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      ) : null}

      <div className="grid grid-cols-2 gap-x-4 gap-y-8">
        <VideoOrb
          name="You"
          subtitle={latest[SELF_PEER] ? "Your latest" : "Tap to record"}
          video={latest[SELF_PEER]}
          self={!latest[SELF_PEER]}
          unread={unreadFor(SELF_PEER)}
          onClick={() => (latest[SELF_PEER] ? onOpen(SELF_PEER) : onRecordSelf())}
        />
        {circles.filter((c) => !c.pending).map((c) => {
          const peer = groupPeerId(c.id);
          return (
            <VideoOrb
              key={c.id}
              name={c.name}
              subtitle={`${c.members.length} people`}
              video={latest[peer]}
              unread={unreadFor(peer)}
              group
              onClick={() => onOpen(peer)}
            />
          );
        })}
        {accepted.map((f) => (
          <VideoOrb
            key={f.userId}
            name={f.displayName}
            subtitle={`@${f.handle}`}
            video={latest[f.userId]}
            unread={unreadFor(f.userId)}
            onClick={() => onOpen(f.userId)}
          />
        ))}
      </div>
      {accepted.length === 0 && circles.length === 0 ? (
        <p className={cn("mt-10 text-center text-sm text-mute")}>
          Add family in People. Until then, record a private clip to yourself.
        </p>
      ) : null}
    </div>
  );
}
