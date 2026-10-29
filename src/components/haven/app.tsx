import { useMemo, useState } from "react";
import { toast } from "sonner";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { encryptAndStoreVideo, sealClip, videosForPeer } from "@/lib/haven/vault";
import { relayPublish } from "@/lib/haven/relay";
import { canSendNow, queueSeal } from "@/lib/haven/outbox";
import { readPrefs } from "@/lib/haven/prefs";
import {
  groupPeerId,
  isGroupPeer,
  parseGroupId,
  SELF_PEER,
  type MediaKind,
} from "@/lib/haven/types";
import type { PacketHeader } from "@/lib/haven/packet";
import { useHavenSession } from "@/lib/haven/session";
import { Atmosphere, HavenMark } from "./atmosphere";
import { HomeScreen } from "./home";
import { InboxScreen } from "./inbox";
import { LockScreen } from "./lock-screen";
import { PeopleScreen } from "./people";
import { Recorder, type RecorderPayload } from "./recorder";
import { SetupFlow } from "./setup";
import { TabBar, type TabId } from "./tab-bar";
import { ThreadView } from "./thread";
import { YouScreen } from "./you";

export function HavenApp() {
  const session = useHavenSession();
  const [tab, setTab] = useState<TabId>("home");
  const [threadId, setThreadId] = useState<string | null>(null);
  const [cameraFor, setCameraFor] = useState<string | null>(null);
  const [threadVideos, setThreadVideos] = useState<Awaited<ReturnType<typeof videosForPeer>>>([]);

  const { user, isPending, profile, needsLock, lockKnown, unlocked, friends, circles, videos, latest } =
    session;
  const myInbox = videos.filter((v) => !v.outgoing && !v.viewedAt).length;

  const threadName = useMemo(() => {
    const id = threadId ?? cameraFor;
    if (!id || id === SELF_PEER) return "You";
    const gid = parseGroupId(id);
    if (gid) return circles.find((c) => c.id === gid)?.name ?? "Group";
    return friends.find((f) => f.userId === id)?.displayName ?? "Friend";
  }, [threadId, cameraFor, friends, circles]);

  async function openThread(peerId: string) {
    setThreadVideos(await videosForPeer(peerId));
    setThreadId(peerId);
  }

  async function sendClip(payload: RecorderPayload) {
    if (!user || !profile) return;
    const peerId = cameraFor ?? SELF_PEER;
    const id = crypto.randomUUID();
    const groupId = parseGroupId(peerId);
    const circle = groupId ? circles.find((c) => c.id === groupId) : null;
    const recipientId = peerId === SELF_PEER ? user.id : groupId ? groupPeerId(groupId) : peerId;
    const kind: MediaKind = payload.kind === "audio" ? "audio" : "video";
    const prefs = readPrefs();
    const header: PacketHeader = {
      v: 1,
      purpose: "clip",
      clipId: id,
      kind,
      mimeType: payload.mimeType,
      durationMs: payload.durationMs,
      senderId: user.id,
      senderHandle: profile.handle,
      senderName: profile.displayName,
      allowSave: prefs.allowSave,
      groupId,
      captions: payload.captions,
      ttlMode: payload.ttl,
    };
    await encryptAndStoreVideo({
      id,
      peerId,
      senderId: user.id,
      recipientId,
      blob: payload.blob,
      poster: payload.poster,
      ttlMode: payload.ttl,
      durationMs: payload.durationMs,
      outgoing: true,
      kind,
      mimeType: payload.mimeType,
      groupId,
      allowSave: prefs.allowSave,
      captions: payload.captions,
      senderHandle: profile.handle,
      senderName: profile.displayName,
    });
    const expiresAt = null;

    async function publishOrQueue(seal: Parameters<typeof relayPublish>[0]) {
      const ready = await canSendNow(prefs.wifiOnly);
      if (!ready.ok) {
        await queueSeal(seal);
        toast(ready.reason === "wifi" ? "Queued until you’re on Wi-Fi" : "Queued. We’ll send when you’re back online.");
        return;
      }
      await relayPublish(seal);
    }

    if (circle) {
      const others = circle.members.filter(
        (m) => m.userId !== user.id && m.publicKey && m.status === "member",
      );
      if (!others.length) throw new Error("Waiting for people to accept this group");
      const sealed = await sealClip({ blob: payload.blob, poster: payload.poster, header });
      for (const member of others) {
        await publishOrQueue({
          recipientId: member.userId,
          ttlMode: payload.ttl,
          expiresAt,
          wrappedKey: await sealed.wrapFor(member.publicKey!),
          iv: sealed.iv,
          ciphertext: sealed.ciphertext,
          poster: sealed.poster,
        });
      }
    } else if (peerId !== SELF_PEER && !isGroupPeer(peerId)) {
      const friend = friends.find((f) => f.userId === peerId);
      if (!friend?.publicKey) throw new Error("They have not opened Haven on a device yet");
      const sealed = await sealClip({ blob: payload.blob, poster: payload.poster, header });
      await publishOrQueue({
        recipientId: peerId,
        ttlMode: payload.ttl,
        expiresAt,
        wrappedKey: await sealed.wrapFor(friend.publicKey),
        iv: sealed.iv,
        ciphertext: sealed.ciphertext,
        poster: sealed.poster,
      });
    }
    await session.refreshVideos();
    setCameraFor(null);
    await openThread(peerId);
  }

  if (isPending) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center px-6">
        <Atmosphere />
        <HavenMark subtitle="Private video for the people you love." />
      </div>
    );
  }
  if (!user) return <RedirectToSignIn />;
  if (!lockKnown) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center px-6">
        <Atmosphere />
        <HavenMark subtitle="Opening on this device…" />
      </div>
    );
  }

  if (needsLock) {
    return (
      <div className="haven-bg min-h-dvh">
        <Atmosphere />
        <LockScreen
          onUnlocked={() => {
            session.setUnlocked(true);
            void session.openVault();
          }}
        />
      </div>
    );
  }

  if (!unlocked || !profile) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-3 haven-bg">
        <Atmosphere />
        <p className="text-sm text-mute">Opening your vault…</p>
        {session.vaultError ? <p className="text-sm text-danger">{session.vaultError}</p> : null}
      </div>
    );
  }

  if (!profile.setupComplete) {
    return (
      <div className="haven-bg min-h-dvh">
        <Atmosphere />
        <SetupFlow
          displayName={profile.displayName}
          handle={profile.handle}
          onDone={() => session.invalidate()}
        />
      </div>
    );
  }

  if (cameraFor) {
    return (
      <Recorder
        toName={threadName}
        peerId={cameraFor}
        defaultTtl={profile.defaultTtl}
        onCancel={() => setCameraFor(null)}
        onSend={sendClip}
      />
    );
  }

  if (threadId) {
    return (
      <ThreadView
        peerId={threadId}
        name={threadName}
        videos={threadVideos}
        friends={friends}
        circles={circles}
        myId={user.id}
        me={profile}
        onBack={() => setThreadId(null)}
        onReply={() => {
          setCameraFor(threadId);
          setThreadId(null);
        }}
        onChanged={() => {
          void videosForPeer(threadId).then(setThreadVideos);
          void session.refreshVideos();
        }}
      />
    );
  }

  return (
    <div className="haven-bg min-h-dvh">
      <Atmosphere />
      <div className="mx-auto min-h-dvh w-full max-w-md">
        {tab === "home" ? (
          <HomeScreen
            meName={profile.displayName}
            friends={friends}
            circles={circles}
            latest={latest}
            videos={videos}
            myId={user.id}
            onOpen={(id) => void openThread(id)}
            onRecordSelf={() => setCameraFor(SELF_PEER)}
          />
        ) : null}
        {tab === "people" ? (
          <PeopleScreen
            friends={friends}
            circles={circles}
            myId={user.id}
            me={profile}
            onOpen={(id) => void openThread(id)}
            onChanged={() => session.invalidate()}
          />
        ) : null}
        {tab === "inbox" ? (
          <InboxScreen
            friends={friends}
            circles={circles}
            videos={videos}
            myId={user.id}
            onOpen={(id) => void openThread(id)}
          />
        ) : null}
        {tab === "you" ? (
          <YouScreen profile={profile} friends={friends} onChanged={() => session.invalidate()} />
        ) : null}
        <TabBar
          tab={tab}
          onTab={setTab}
          onCamera={() => setCameraFor(SELF_PEER)}
          inboxCount={myInbox}
        />
      </div>
    </div>
  );
}
