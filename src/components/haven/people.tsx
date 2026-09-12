import { useEffect, useState } from "react";
import { BookUser, Link2, Search, UserPlus, Users, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  createInviteLink,
  matchContacts,
  searchPeople,
  type MatchedPerson,
} from "@/lib/haven/api";
import {
  contactSubtitle,
  contactsPickerAvailable,
  hashContactEmail,
  hashContactPhone,
  hashHandle,
  loadContacts,
  pickDeviceContacts,
  removeContact,
  upsertContact,
  type VaultContact,
} from "@/lib/haven/contacts";
import {
  removeCircle,
  removeFriend,
  saveCircle,
  upsertFriend,
} from "@/lib/haven/graph-local";
import { getSessionKeys } from "@/lib/haven/lock";
import { looksLikePhone, normalizePhone } from "@/lib/haven/phone";
import { sendSealedHeader } from "@/lib/haven/signal";
import type { Circle, Friend, Profile } from "@/lib/haven/types";
import { groupPeerId } from "@/lib/haven/types";
import { CircleSheet } from "./circle-sheet";

function claimFragment(name: string, handle: string): string {
  try {
    return btoa(JSON.stringify({ n: name, h: handle }));
  } catch {
    return "";
  }
}

export function PeopleScreen({
  friends,
  circles,
  myId,
  me,
  onOpen,
  onChanged,
}: {
  friends: Friend[];
  circles: Circle[];
  myId: string;
  me: Profile;
  onOpen: (id: string) => void;
  onChanged: () => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<
    { userId: string; publicKey: string | null; handle: string; displayName: string }[]
  >([]);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [contacts, setContacts] = useState<VaultContact[]>([]);
  const [matches, setMatches] = useState<MatchedPerson[]>([]);
  const [manualName, setManualName] = useState("");
  const [manualPhone, setManualPhone] = useState("");
  const [showManual, setShowManual] = useState(false);
  const [showGroup, setShowGroup] = useState(false);

  const incoming = friends.filter((f) => f.status === "pending-in");
  const outgoing = friends.filter((f) => f.status === "pending-out");
  const accepted = friends.filter((f) => f.status === "accepted");
  const canPick = contactsPickerAvailable();
  const pendingGroups = circles.filter((c) => c.pending);
  const joinedGroups = circles.filter((c) => !c.pending);

  async function shareInvite(label?: string) {
    setBusy(true);
    try {
      const { token } = await createInviteLink();
      const frag = claimFragment(me.displayName, me.handle);
      const url = `${window.location.origin}/invite/${token}${frag ? `#${frag}` : ""}`;
      const text = label ? `${label}, join me on Haven.` : "Private video, just us.";
      const nav = navigator as Navigator & { share?: (data: ShareData) => Promise<void> };
      try {
        if (nav.share) {
          await nav.share({ title: "Join me on Haven", text, url });
        } else if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(url);
          toast("Invite link copied");
        } else {
          toast(url);
        }
      } catch (shareErr) {
        const message = shareErr instanceof Error ? shareErr.message : "";
        if (/abort|cancel/i.test(message)) return;
        toast(url);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not create invite";
      if (!/abort|cancel/i.test(message)) toast(message);
    } finally {
      setBusy(false);
    }
  }

  async function sendIntro(
    userId: string,
    publicKey: string,
    handle: string,
    displayName: string,
    status: Friend["status"],
  ) {
    const mine = getSessionKeys();
    await upsertFriend({
      userId,
      handle,
      displayName,
      publicKey,
      status,
      friendshipId: crypto.randomUUID(),
    });
    await sendSealedHeader({
      recipientId: userId,
      recipientPublicKey: publicKey,
      header: {
        v: 1,
        purpose: status === "accepted" ? "intro-ack" : "intro",
        senderId: myId,
        senderHandle: me.handle,
        senderName: me.displayName,
        senderPublicKey: mine.publicKey,
      },
    });
    onChanged();
  }

  async function addPerson(row: {
    userId: string;
    publicKey: string | null;
    handle: string;
    displayName: string;
  }) {
    if (!row.publicKey) {
      toast("They have not opened Haven on a device yet");
      return;
    }
    setBusy(true);
    try {
      await sendIntro(row.userId, row.publicKey, row.handle, row.displayName, "pending-out");
      setNote("Request sent. They join after they accept.");
      toast("Request sent");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Could not add");
    } finally {
      setBusy(false);
    }
  }

  async function refreshMatches(rows: VaultContact[]) {
    const phoneHashes = (
      await Promise.all(rows.flatMap((c) => c.phones.map((p) => hashContactPhone(p))))
    ).slice(0, 200);
    const emailHashes = (
      await Promise.all(rows.flatMap((c) => c.emails.map((e) => hashContactEmail(e))))
    ).slice(0, 200);
    if (!phoneHashes.length && !emailHashes.length) {
      setMatches([]);
      return;
    }
    const found = await matchContacts({ data: { phoneHashes, emailHashes } });
    setMatches(found);
  }

  useEffect(() => {
    let cancelled = false;
    void loadContacts()
      .then(async (rows) => {
        if (cancelled) return;
        setContacts(rows);
        await refreshMatches(rows);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  async function search() {
    const q = query.trim();
    if (!q) return;
    setBusy(true);
    setNote(null);
    try {
      const phone = looksLikePhone(q) ? normalizePhone(q) : null;
      const handle = q.replace(/^@/, "").toLowerCase();
      const rows = await searchPeople({
        data: phone
          ? { phoneHash: await hashContactPhone(phone) }
          : { handleHash: await hashHandle(handle) },
      });
      setResults(
        rows.map((row) => ({
          userId: row.userId,
          publicKey: row.publicKey,
          handle: phone ? handle : handle,
          displayName: phone ? q : `@${handle}`,
        })),
      );
      if (!rows.length) setNote("No one matched. Ask them for their Haven handle.");
    } catch (err) {
      setNote(err instanceof Error ? err.message : "Search failed");
    } finally {
      setBusy(false);
    }
  }

  async function syncContacts() {
    setBusy(true);
    try {
      const rows = await pickDeviceContacts();
      setContacts(rows);
      await refreshMatches(rows);
      toast(rows.length ? `Saved ${rows.length} contacts on this phone` : "No contacts selected");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not sync contacts";
      if (!/cancel|abort/i.test(message)) toast(message);
    } finally {
      setBusy(false);
    }
  }

  async function addManual() {
    const phone = normalizePhone(manualPhone);
    if (!phone) {
      toast("Enter a valid mobile number");
      return;
    }
    setBusy(true);
    try {
      const rows = await upsertContact({ name: manualName, phones: [phone] });
      setContacts(rows);
      await refreshMatches(rows);
      setManualName("");
      setManualPhone("");
      setShowManual(false);
      toast("Saved and encrypted on this phone");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Could not save contact");
    } finally {
      setBusy(false);
    }
  }

  async function matchedFor(contact: VaultContact): Promise<MatchedPerson | undefined> {
    const hashes = await Promise.all(contact.phones.map((p) => hashContactPhone(p)));
    const emailHashes = await Promise.all(contact.emails.map((e) => hashContactEmail(e)));
    const hashSet = new Set(hashes);
    const emailSet = new Set(emailHashes);
    return matches.find(
      (row) =>
        (row.phoneHash && hashSet.has(row.phoneHash)) || (row.emailHash && emailSet.has(row.emailHash)),
    );
  }

  const [resolved, setResolved] = useState<Record<string, MatchedPerson | undefined>>({});
  useEffect(() => {
    let cancelled = false;
    void Promise.all(contacts.map(async (c) => [c.id, await matchedFor(c)] as const)).then((pairs) => {
      if (cancelled) return;
      setResolved(Object.fromEntries(pairs));
    });
    return () => {
      cancelled = true;
    };
  }, [contacts, matches]);

  return (
    <div className="flex flex-col gap-6 px-5 pb-28 pt-6">
      <header>
        <h1 className="text-2xl font-medium tracking-tight">People</h1>
        <p className="mt-1 text-sm text-mute">Add family by handle or phone. Groups hold up to 50. Names stay on this phone.</p>
      </header>

      <div className="flex gap-2">
        <Button variant="glass" className="flex-1" onClick={() => setShowGroup(true)}>
          <Users className="size-4" />
          New group
        </Button>
        <Button variant="glass" className="flex-1" disabled={busy} onClick={() => void shareInvite()}>
          <Link2 className="size-4" />
          Share invite
        </Button>
      </div>

      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          void search();
        }}
      >
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search @handle or number"
          aria-label="Search people"
        />
        <Button type="submit" variant="glass" size="icon" disabled={busy} aria-label="Search">
          <Search className="size-5" />
        </Button>
      </form>
      {note ? <p className="text-sm text-mute">{note}</p> : null}

      {results.length ? (
        <section className="space-y-2">
          {results.map((row) => (
            <div key={row.userId} className="glass flex items-center justify-between rounded-xl px-4 py-3">
              <div>
                <p className="text-sm font-medium">{row.displayName}</p>
                <p className="text-xs text-mute">@{row.handle}</p>
              </div>
              <Button size="sm" variant="glass" disabled={busy} onClick={() => void addPerson(row)}>
                <UserPlus className="size-4" />
                Add
              </Button>
            </div>
          ))}
        </section>
      ) : null}

      <section className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xs uppercase tracking-[0.16em] text-mute">Contacts</h2>
            <p className="mt-1 text-xs text-mute">Encrypted at rest on this phone. Haven never stores the book.</p>
          </div>
        </div>
        <div className="flex gap-2">
          {canPick ? (
            <Button variant="glass" className="flex-1" disabled={busy} onClick={() => void syncContacts()}>
              <BookUser className="size-4" />
              Sync from phone
            </Button>
          ) : (
            <Button variant="glass" className="flex-1" onClick={() => setShowManual(true)}>
              <BookUser className="size-4" />
              Add from phone
            </Button>
          )}
          {canPick ? (
            <Button variant="glass" size="icon" onClick={() => setShowManual((v) => !v)} aria-label="Add contact">
              <UserPlus className="size-4" />
            </Button>
          ) : null}
        </div>
        {!canPick ? (
          <p className="text-xs text-mute">
            This browser cannot open your address book. Add people by name and number — they still stay encrypted here.
          </p>
        ) : null}
        {showManual ? (
          <div className="glass space-y-2 rounded-2xl p-4">
            <Input
              value={manualName}
              onChange={(e) => setManualName(e.target.value)}
              placeholder="Name"
              maxLength={60}
            />
            <Input
              value={manualPhone}
              onChange={(e) => setManualPhone(e.target.value)}
              placeholder="Mobile number"
              inputMode="tel"
            />
            <Button className="w-full" disabled={busy} onClick={() => void addManual()}>
              Save encrypted
            </Button>
          </div>
        ) : null}
        {contacts.length ? (
          <div className="space-y-2">
            {contacts.map((contact) => {
              const match = resolved[contact.id];
              const friend = match ? friends.find((f) => f.userId === match.userId) : undefined;
              return (
                <div key={contact.id} className="glass flex items-center justify-between gap-3 rounded-xl px-4 py-3">
                  <button
                    type="button"
                    className="min-w-0 flex-1 text-left"
                    onClick={() => {
                      if (friend?.status === "accepted" && match) onOpen(match.userId);
                    }}
                  >
                    <span className="block truncate text-sm font-medium">{contact.name}</span>
                    <span className="text-xs text-mute">
                      {match ? "On Haven" : contactSubtitle(contact)}
                    </span>
                  </button>
                  <div className="flex shrink-0 items-center gap-1">
                    {match && friend?.status !== "accepted" && friend?.status !== "pending-out" ? (
                      <Button
                        size="sm"
                        variant="glass"
                        disabled={busy}
                        onClick={() =>
                          void addPerson({
                            userId: match.userId,
                            publicKey: match.publicKey,
                            handle: contact.name,
                            displayName: contact.name,
                          })
                        }
                      >
                        Add
                      </Button>
                    ) : null}
                    {!match ? (
                      <Button size="sm" variant="glass" disabled={busy} onClick={() => void shareInvite(contact.name)}>
                        Invite
                      </Button>
                    ) : null}
                    {friend?.status === "pending-out" ? (
                      <span className="text-xs text-mute">Waiting</span>
                    ) : null}
                    <Button
                      size="icon"
                      variant="ghost"
                      className="size-9"
                      aria-label={`Remove ${contact.name}`}
                      onClick={() =>
                        void removeContact(contact.id).then((rows) => {
                          setContacts(rows);
                          void refreshMatches(rows);
                        })
                      }
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-mute">No contacts on this device yet.</p>
        )}
      </section>

      {incoming.length ? (
        <section>
          <h2 className="mb-2 text-xs uppercase tracking-[0.16em] text-mute">Requests</h2>
          <div className="space-y-2">
            {incoming.map((f) => (
              <div key={f.friendshipId} className="glass flex items-center justify-between rounded-xl px-4 py-3">
                <div>
                  <p className="text-sm font-medium">{f.displayName}</p>
                  <p className="text-xs text-mute">@{f.handle}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => {
                      if (!f.publicKey) {
                        toast("They have not opened Haven yet");
                        return;
                      }
                      void sendIntro(f.userId, f.publicKey, f.handle, f.displayName, "accepted").then(() =>
                        toast(`Connected with ${f.displayName}`),
                      );
                    }}
                  >
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => void removeFriend(f.userId).then(onChanged)}
                  >
                    Ignore
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {outgoing.length ? (
        <section>
          <h2 className="mb-2 text-xs uppercase tracking-[0.16em] text-mute">Waiting</h2>
          <div className="space-y-2">
            {outgoing.map((f) => (
              <div key={f.friendshipId} className="glass rounded-xl px-4 py-3">
                <p className="text-sm font-medium">{f.displayName}</p>
                <p className="text-xs text-mute">Invite pending · @{f.handle}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {pendingGroups.length ? (
        <section>
          <h2 className="mb-2 text-xs uppercase tracking-[0.16em] text-mute">Group invites</h2>
          <div className="space-y-2">
            {pendingGroups.map((c) => (
              <div key={c.id} className="glass flex items-center justify-between rounded-xl px-4 py-3">
                <div>
                  <p className="text-sm font-medium">{c.name}</p>
                  <p className="text-xs text-mute">Accept to join · {c.members.length} people</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() =>
                      void saveCircle({
                        ...c,
                        pending: false,
                        members: c.members.map((m) =>
                          m.userId === myId ? { ...m, status: "member" } : m,
                        ),
                      }).then(onChanged)
                    }
                  >
                    Join
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => void removeCircle(c.id).then(onChanged)}>
                    Decline
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section>
        <h2 className="mb-2 text-xs uppercase tracking-[0.16em] text-mute">Groups</h2>
        {joinedGroups.length ? (
          <div className="space-y-2">
            {joinedGroups.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => onOpen(groupPeerId(c.id))}
                className="glass flex w-full items-center justify-between rounded-xl px-4 py-3 text-left"
              >
                <span>
                  <span className="block text-sm font-medium">{c.name}</span>
                  <span className="text-xs text-mute">{c.members.length} people</span>
                </span>
              </button>
            ))}
          </div>
        ) : (
          <p className="text-sm text-mute">No groups yet. Up to 50 people, video or voice. They must accept the invite.</p>
        )}
      </section>

      <section>
        <h2 className="mb-2 text-xs uppercase tracking-[0.16em] text-mute">Family</h2>
        {accepted.length ? (
          <div className="space-y-2">
            {accepted.map((f) => (
              <button
                key={f.userId}
                type="button"
                onClick={() => onOpen(f.userId)}
                className="glass flex w-full items-center justify-between rounded-xl px-4 py-3 text-left"
              >
                <span>
                  <span className="block text-sm font-medium">{f.displayName}</span>
                  <span className="text-xs text-mute">@{f.handle}</span>
                </span>
              </button>
            ))}
          </div>
        ) : (
          <p className="text-sm text-mute">Haven stays quiet until you add someone you trust.</p>
        )}
      </section>
      <CircleSheet
        friends={friends}
        myId={myId}
        me={me}
        open={showGroup}
        onClose={() => setShowGroup(false)}
        onCreated={onChanged}
      />
    </div>
  );
}
