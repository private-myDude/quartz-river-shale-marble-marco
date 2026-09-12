import { useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { saveCircle } from "@/lib/haven/graph-local";
import { getSessionKeys } from "@/lib/haven/lock";
import { sendSealedHeader } from "@/lib/haven/signal";
import { MAX_CIRCLE, type CircleMember, type Friend, type Profile } from "@/lib/haven/types";
import { cn } from "@/lib/utils";

export function CircleSheet({
  friends,
  myId,
  me,
  open,
  onClose,
  onCreated,
}: {
  friends: Friend[];
  myId: string;
  me: Profile;
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const accepted = friends.filter((f) => f.status === "accepted");
  const [name, setName] = useState("");
  const [picked, setPicked] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const maxOthers = MAX_CIRCLE - 1;

  if (!open) return null;

  function toggle(id: string) {
    setPicked((cur) => {
      if (cur.includes(id)) return cur.filter((x) => x !== id);
      if (cur.length >= maxOthers) {
        toast(`Groups hold up to ${MAX_CIRCLE} people`);
        return cur;
      }
      return [...cur, id];
    });
  }

  async function create() {
    if (!name.trim()) {
      toast("Name this group");
      return;
    }
    if (!picked.length) {
      toast("Add at least one person");
      return;
    }
    setBusy(true);
    try {
      const label = name.trim();
      const id = crypto.randomUUID();
      const mine = getSessionKeys();
      const members: CircleMember[] = [
        {
          userId: myId,
          handle: me.handle,
          displayName: me.displayName,
          publicKey: mine.publicKey,
          role: "owner",
          status: "member",
        },
        ...picked.flatMap((uid) => {
          const friend = accepted.find((f) => f.userId === uid);
          if (!friend) return [];
          return [
            {
              userId: friend.userId,
              handle: friend.handle,
              displayName: friend.displayName,
              publicKey: friend.publicKey,
              role: "member" as const,
              status: "invited" as const,
            },
          ];
        }),
      ];
      await saveCircle({ id, name: label, createdBy: myId, members, pending: false });
      for (const member of members) {
        if (member.userId === myId || !member.publicKey) continue;
        try {
          await sendSealedHeader({
            recipientId: member.userId,
            recipientPublicKey: member.publicKey,
            header: {
              v: 1,
              purpose: "circle-meta",
              groupId: id,
              circleName: label,
              createdBy: myId,
              senderId: myId,
              senderHandle: me.handle,
              senderName: me.displayName,
              members: members.map((m) => ({
                userId: m.userId,
                handle: m.handle,
                displayName: m.displayName,
                publicKey: m.publicKey ?? undefined,
                role: m.role,
                status: m.status,
              })),
            },
          });
        } catch {
          /* name packet is best-effort */
        }
      }
      toast("Invites sent. They join after they accept.");
      setName("");
      setPicked([]);
      onCreated();
      onClose();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Could not create group");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-ink/50 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-16">
      <div className="glass max-h-[80dvh] w-full max-w-md overflow-y-auto rounded-3xl p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium">New group</h2>
            <p className="text-xs text-mute">Up to {MAX_CIRCLE} people. They join only after they accept.</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
            <X className="size-5" />
          </Button>
        </div>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Family, cousins…"
          maxLength={40}
        />
        <p className="mt-4 text-xs uppercase tracking-[0.16em] text-mute">
          {picked.length}/{maxOthers} invited
        </p>
        <div className="mt-2 space-y-2">
          {accepted.length ? (
            accepted.map((f) => {
              const on = picked.includes(f.userId);
              return (
                <button
                  key={f.userId}
                  type="button"
                  onClick={() => toggle(f.userId)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-xl px-4 py-3 text-left",
                    on ? "bg-fog text-accent-fg" : "bg-glass",
                  )}
                >
                  <span>
                    <span className="block text-sm font-medium">{f.displayName}</span>
                    <span className={cn("text-xs", on ? "text-accent-fg/70" : "text-mute")}>
                      @{f.handle}
                    </span>
                  </span>
                  <span className="text-xs font-medium">{on ? "Added" : "Add"}</span>
                </button>
              );
            })
          ) : (
            <p className="text-sm text-mute">Add friends first, then group them.</p>
          )}
        </div>
        <Button className="mt-5 w-full" disabled={busy} onClick={() => void create()}>
          Create group
        </Button>
      </div>
    </div>
  );
}
