import { useEffect, useRef, useState, type PointerEvent } from "react";
import {
  ArrowLeft,
  Ban,
  CornerUpRight,
  Download,
  EyeOff,
  LogOut,
  Mic,
  NotebookPen,
  Pause,
  Play,
  Share2,
  Trash2,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { blockLocal, removeCircle } from "@/lib/haven/graph-local";
import { getSessionKeys } from "@/lib/haven/lock";
import { SPEED_OPTIONS, setPrefs, speedLabel, usePrefs, type PlaybackRate } from "@/lib/haven/prefs";
import { relayPublish } from "@/lib/haven/relay";
import { safetyNumber } from "@/lib/haven/safety";
import { sendSealedHeader } from "@/lib/haven/signal";
import {
  addReaction,
  decryptPoster,
  decryptVideo,
  destroyVideo,
  encryptAndStoreVideo,
  markViewed,
  sealClip,
  sealJsonMessage,
} from "@/lib/haven/vault";
import {
  parseGroupId,
  REACTION_EMOJIS,
  ttlLabel,
  type Circle,
  type Friend,
  type Profile,
  type StoredVideo,
} from "@/lib/haven/types";
import { cn } from "@/lib/utils";
import { ClipRail } from "./clip-rail";
import { NotesSheet, useThreadNote } from "./notes-pad";

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

function nextSpeed(current: PlaybackRate): PlaybackRate {
  const i = SPEED_OPTIONS.indexOf(current);
  return SPEED_OPTIONS[(i + 1) % SPEED_OPTIONS.length] ?? 1;
}

function initialIndex(clips: StoredVideo[], clipId?: string | null): number {
  const picked = clipId ? clips.findIndex((v) => v.id === clipId) : -1;
  if (picked >= 0) return picked;
  const unread = clips.findIndex((v) => !v.outgoing && !v.viewedAt);
  if (unread >= 0) return unread;
  return clips.length ? clips.length - 1 : 0;
}

function keyFor(userId: string, friends: Friend[], circles: Circle[]): string | null {
  const friend = friends.find((f) => f.userId === userId);
  if (friend?.publicKey) return friend.publicKey;
  for (const circle of circles) {
    const member = circle.members.find((m) => m.userId === userId);
    if (member?.publicKey) return member.publicKey;
  }
  return null;
}

export function ThreadView({
  peerId,
  name,
  videos,
  friends,
  circles,
  myId,
  me,
  initialClipId,
  onBack,
  onReply,
  onChanged,
}: {
  peerId: string;
  name: string;
  videos: StoredVideo[];
  friends: Friend[];
  circles: Circle[];
  myId: string;
  me: Pick<Profile, "handle" | "displayName">;
  /** Clip to open on, e.g. one tapped in the camera's clip rail. */
  initialClipId?: string | null;
  onBack: () => void;
  onReply: () => void;
  onChanged: () => void;
}) {
  const clips = videos;
  const [index, setIndex] = useState(() => initialIndex(clips, initialClipId));
  const current = clips[index];
  const [src, setSrc] = useState<string | null>(null);
  const [gone, setGone] = useState(false);
  const mediaRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [notesOpen, setNotesOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [skipFlash, setSkipFlash] = useState<string | null>(null);
  const [shielded, setShielded] = useState(false);
  const [muted, setMuted] = useState(false);
  const [safety, setSafety] = useState<string | null>(null);
  const [reactOpen, setReactOpen] = useState(false);
  const [burnOpen, setBurnOpen] = useState(false);
  const [forwardOpen, setForwardOpen] = useState(false);
  const lastTap = useRef<{ at: number; x: number } | null>(null);
  const prefs = usePrefs();
  const notes = useThreadNote(peerId);
  const isAudio = current?.kind === "audio";
  const canSave = Boolean(current?.allowSave);
  const canForward = canSave && prefs.allowForward;
  const groupId = parseGroupId(peerId);
  const circle = groupId ? circles.find((c) => c.id === groupId) : null;
  const friend = !groupId ? friends.find((f) => f.userId === peerId) : null;
  const reactions = current?.reactions ?? (current?.hearts ? { "❤️": current.hearts } : {});
  const reactionEntries = Object.entries(reactions).filter(([, n]) => n > 0);

  useEffect(() => {
    setIndex(initialIndex(clips, initialClipId));
  }, [clips.length]);

  useEffect(() => {
    setMuted(prefs.startMuted);
  }, [prefs.startMuted, current?.id]);

  useEffect(() => {
    const el = mediaRef.current;
    if (el) el.muted = muted;
  }, [muted, src]);

  useEffect(() => {
    let url: string | null = null;
    let cancelled = false;
    if (!current) {
      setSrc(null);
      return;
    }
    void decryptVideo(current.id).then((blob) => {
      if (cancelled) return;
      url = URL.createObjectURL(blob);
      setSrc(url);
      setGone(false);
      setCurrentTime(0);
    });
    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [current?.id]);

  useEffect(() => {
    const el = mediaRef.current;
    if (!el) return;
    el.playbackRate = prefs.playbackRate;
  }, [prefs.playbackRate, src]);

  useEffect(() => {
    if (!friend?.publicKey) {
      setSafety(null);
      return;
    }
    try {
      const mine = getSessionKeys().publicKey;
      void safetyNumber(mine, friend.publicKey).then(setSafety);
    } catch {
      setSafety(null);
    }
  }, [friend?.publicKey]);

  useEffect(() => {
    if (!prefs.shieldClips) {
      setShielded(false);
      return;
    }
    const hide = () => {
      setShielded(true);
      mediaRef.current?.pause();
    };
    const show = () => {
      if (document.visibilityState === "visible") setShielded(false);
    };
    const block = (e: Event) => e.preventDefault();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "PrintScreen") hide();
    };
    const onVis = () => (document.hidden ? hide() : show());
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("blur", hide);
    window.addEventListener("focus", show);
    window.addEventListener("keyup", onKey);
    document.addEventListener("contextmenu", block);
    document.addEventListener("copy", block);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("blur", hide);
      window.removeEventListener("focus", show);
      window.removeEventListener("keyup", onKey);
      document.removeEventListener("contextmenu", block);
      document.removeEventListener("copy", block);
    };
  }, [prefs.shieldClips]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (notesOpen && e.key !== "Escape") return;
      if (e.key === " ") {
        e.preventDefault();
        togglePlay();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        skip(1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        skip(-1);
      } else if (e.key === "Escape") {
        setNotesOpen(false);
        setMenuOpen(false);
        setReactOpen(false);
        setBurnOpen(false);
        setForwardOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  async function sendControl(
    kind: "receipt" | "reaction" | "shred",
    clip: StoredVideo,
    extra?: { emoji?: string },
  ) {
    const targets: { id: string; pub: string }[] = [];
    if (circle) {
      for (const member of circle.members) {
        if (member.userId === myId || !member.publicKey) continue;
        if (kind !== "shred" && member.userId !== clip.senderId) continue;
        targets.push({ id: member.userId, pub: member.publicKey });
      }
    } else {
      const otherId = clip.outgoing ? clip.recipientId : clip.senderId;
      const pub = keyFor(otherId, friends, circles);
      if (otherId && pub && otherId !== myId) targets.push({ id: otherId, pub });
    }
    for (const target of targets) {
      try {
        const sealed = await sealJsonMessage(
          {
            clipId: clip.id,
            at: Date.now(),
            purpose: kind,
            emoji: extra?.emoji,
            ttlMode: clip.ttlMode,
          },
          target.pub,
          myId,
        );
        await relayPublish({
          recipientId: target.id,
          ttlMode: "1d",
          expiresAt: new Date(Date.now() + 86_400_000).toISOString(),
          ...sealed,
          poster: null,
        });
      } catch {
        /* sealed control is best-effort */
      }
    }
  }

  async function finished() {
    if (!current || current.outgoing) return;
    const remaining = await markViewed(current.id);
    if (prefs.sendReceipts) void sendControl("receipt", current);
    if (current.ttlMode === "view") void sendControl("shred", current);
    if (!remaining) {
      setGone(true);
      setSrc(null);
    }
    onChanged();
  }

  async function burn(everyone: boolean) {
    if (!current) return;
    if (everyone) await sendControl("shred", current);
    await destroyVideo(current.id);
    setGone(true);
    setSrc(null);
    setBurnOpen(false);
    onChanged();
  }

  async function react(emoji: string) {
    if (!current || current.outgoing) return;
    await addReaction(current.id, emoji);
    void sendControl("reaction", current, { emoji });
    setReactOpen(false);
    onChanged();
  }

  async function forwardTo(to: Friend) {
    if (!current || !canForward || !to.publicKey) return;
    try {
      const blob = await decryptVideo(current.id);
      const poster = await decryptPoster(current.id);
      const id = crypto.randomUUID();
      await encryptAndStoreVideo({
        id,
        peerId: to.userId,
        senderId: myId,
        recipientId: to.userId,
        blob,
        poster,
        ttlMode: current.ttlMode,
        durationMs: current.durationMs,
        outgoing: true,
        kind: current.kind,
        mimeType: current.mimeType,
        allowSave: current.allowSave,
        captions: current.captions,
        senderHandle: me.handle,
        senderName: me.displayName,
      });
      const sealed = await sealClip({
        blob,
        poster,
        header: {
          v: 1,
          purpose: "clip",
          clipId: id,
          kind: current.kind,
          mimeType: current.mimeType,
          durationMs: current.durationMs,
          senderId: myId,
          senderHandle: me.handle,
          senderName: me.displayName,
          allowSave: current.allowSave,
          captions: current.captions,
          ttlMode: current.ttlMode,
        },
      });
      await relayPublish({
        recipientId: to.userId,
        ttlMode: current.ttlMode,
        expiresAt: null,
        wrappedKey: await sealed.wrapFor(to.publicKey),
        iv: sealed.iv,
        ciphertext: sealed.ciphertext,
        poster: sealed.poster,
      });
      toast(`Forwarded to ${to.displayName}`);
      setForwardOpen(false);
      onChanged();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Could not forward");
    }
  }

  async function shareClip() {
    if (!current || !canSave) return;
    try {
      const blob = await decryptVideo(current.id);
      const file = new File([blob], current.kind === "audio" ? "haven.webm" : "haven.webm", {
        type: blob.type,
      });
      const nav = navigator as Navigator & { share?: (data: ShareData) => Promise<void> };
      if (nav.share && navigator.canShare?.({ files: [file] })) {
        await nav.share({ files: [file], title: "Haven clip" });
      } else {
        toast("Sharing is blocked for this clip");
      }
    } catch (err) {
      toast(err instanceof Error ? err.message : "Could not share");
    }
  }

  async function downloadClip() {
    if (!current || !canSave) return;
    const blob = await decryptVideo(current.id);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = current.kind === "audio" ? "haven-voice.webm" : "haven-clip.webm";
    a.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1500);
  }

  function togglePlay() {
    const el = mediaRef.current;
    if (!el) return;
    if (el.paused) {
      void el.play();
      setPlaying(true);
    } else {
      el.pause();
      setPlaying(false);
    }
  }

  function skip(dir: -1 | 1) {
    const el = mediaRef.current;
    if (!el) return;
    const next = Math.max(0, Math.min(el.duration || 0, el.currentTime + dir * prefs.skipSeconds));
    el.currentTime = next;
    setCurrentTime(next);
    setSkipFlash(`${dir > 0 ? "+" : "−"}${prefs.skipSeconds}s`);
    window.setTimeout(() => setSkipFlash(null), 700);
  }

  function onStagePointer(e: PointerEvent<HTMLDivElement>) {
    if (notesOpen || menuOpen || reactOpen || burnOpen || forwardOpen) return;
    const now = Date.now();
    const x = e.clientX;
    const prev = lastTap.current;
    lastTap.current = { at: now, x };
    if (prev && now - prev.at < 280) {
      const rect = e.currentTarget.getBoundingClientRect();
      skip(x < rect.left + rect.width / 2 ? -1 : 1);
      return;
    }
    window.setTimeout(() => {
      const latest = lastTap.current;
      if (!latest || latest.at !== now) return;
      togglePlay();
    }, 260);
  }

  function seekTo(ratio: number) {
    const el = mediaRef.current;
    if (!el || !el.duration) return;
    const next = Math.max(0, Math.min(el.duration, ratio * el.duration));
    el.currentTime = next;
    setCurrentTime(next);
  }

  const forwardTargets = friends.filter(
    (f) => f.status === "accepted" && f.publicKey && f.userId !== peerId && f.userId !== current?.senderId,
  );

  return (
    <div className={cn("player-screen relative flex min-h-dvh flex-col", (prefs.shieldClips || !canSave) && "shield-clips")}>
      {src && !gone ? (
        <video
          ref={mediaRef}
          src={src}
          className={cn("absolute inset-0 size-full object-cover", isAudio && "opacity-0")}
          playsInline
          autoPlay
          muted={muted}
          controls={false}
          disablePictureInPicture
          controlsList="nodownload noplaybackrate noremoteplayback"
          onContextMenu={(e) => e.preventDefault()}
          onEnded={() => {
            setPlaying(false);
            void finished();
          }}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
          onLoadedMetadata={(e) => {
            setDuration(e.currentTarget.duration || 0);
            e.currentTarget.playbackRate = prefs.playbackRate;
            e.currentTarget.muted = muted;
          }}
        />
      ) : (
        <div className="absolute inset-0 spec" />
      )}
      {isAudio ? <div className="absolute inset-0 spec" /> : null}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-ink/55 via-transparent to-ink/80" />

      <div
        className="absolute inset-0 z-[1]"
        onPointerDown={onStagePointer}
        aria-hidden="true"
      />

      {isAudio && src && !gone ? (
        <div className="pointer-events-none absolute inset-0 z-[2] grid place-items-center">
          <div className="flex flex-col items-center gap-4">
            <span className="grid size-28 place-items-center rounded-full glass">
              <Mic className="size-12 text-fog" />
            </span>
            <p className="text-sm text-mist">Voice note · {speedLabel(prefs.playbackRate)}</p>
          </div>
        </div>
      ) : null}

      {current?.captions && src && !gone ? (
        <p className="pointer-events-none absolute inset-x-6 bottom-48 z-[3] rounded-xl bg-ink/55 px-4 py-2 text-center text-sm text-fog">
          {current.captions}
        </p>
      ) : null}

      {skipFlash ? (
        <div className="pointer-events-none absolute inset-0 z-[2] grid place-items-center">
          <span className="rounded-full bg-ink/55 px-4 py-2 text-sm font-medium tabular-nums text-fog">
            {skipFlash}
          </span>
        </div>
      ) : null}

      {shielded ? (
        <div className="absolute inset-0 z-40 grid place-items-center bg-ink">
          <p className="px-8 text-center text-sm text-mist">Clip hidden while Haven is in the background.</p>
        </div>
      ) : null}

      <div className="relative z-10 flex items-center justify-between px-4 pt-[max(1rem,env(safe-area-inset-top))]">
        <Button variant="glass" size="icon" onClick={onBack} aria-label="Back">
          <ArrowLeft className="size-5" />
        </Button>
        <button type="button" className="text-center" onClick={() => setMenuOpen(true)}>
          <p className="text-sm font-medium">{name}</p>
          {current ? (
            <p className="text-xs text-mist">
              {current.outgoing ? (current.theyViewedAt ? "Seen · " : "Sent · ") : current.viewedAt ? "Watched · " : "New · "}
              {current.ttlMode === "forever"
                ? "Keep forever"
                : current.ttlMode === "view"
                  ? "After viewing"
                  : `${ttlLabel(current.ttlMode)} after watch`}
            </p>
          ) : null}
        </button>
        <Button
          variant="glass"
          size="icon"
          onClick={() => setNotesOpen((v) => !v)}
          aria-label="Notes"
          className={cn(notes.text.trim() && "shadow-[0_0_0_1.5px_rgb(215_221_230/0.7)]")}
        >
          <NotebookPen className="size-5" />
        </Button>
      </div>

      <div className="relative z-10 mt-auto flex flex-col items-center gap-4 px-0 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        {gone ? (
          <div className="glass mx-5 rounded-xl px-5 py-4 text-center">
            <EyeOff className="mx-auto size-6 text-mist" />
            <p className="mt-2 text-sm">This clip destroyed itself.</p>
          </div>
        ) : null}
        {!current && !gone ? (
          <p className="text-sm text-mist">No clips yet. Send the first one.</p>
        ) : null}

        {src && !gone ? (
          <div className="flex w-full flex-col gap-3 px-5">
            <div className="flex items-center gap-3 text-[11px] tabular-nums text-mist">
              <span>{formatTime(currentTime)}</span>
              <input
                type="range"
                min={0}
                max={1000}
                value={duration ? Math.min(1000, (currentTime / duration) * 1000) : 0}
                onChange={(e) => seekTo(Number(e.target.value) / 1000)}
                className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-fog/25 accent-fog"
                aria-label="Seek"
              />
              <span>{formatTime(duration)}</span>
            </div>
            <div className="flex items-center justify-between">
              <Button
                variant="glass"
                size="icon"
                onClick={() => skip(-1)}
                aria-label={`Skip back ${prefs.skipSeconds} seconds`}
              >
                <SkipBack className="size-5" />
              </Button>
              <Button variant="glass" size="icon" onClick={togglePlay} aria-label={playing ? "Pause" : "Play"}>
                {playing ? <Pause className="size-5" /> : <Play className="ml-0.5 size-5" />}
              </Button>
              <Button
                variant="glass"
                size="icon"
                onClick={() => skip(1)}
                aria-label={`Skip forward ${prefs.skipSeconds} seconds`}
              >
                <SkipForward className="size-5" />
              </Button>
              <Button
                variant="glass"
                size="icon"
                onClick={() => setMuted((m) => !m)}
                aria-label={muted ? "Unmute" : "Mute"}
              >
                {muted ? <VolumeX className="size-5" /> : <Volume2 className="size-5" />}
              </Button>
              <button
                type="button"
                onClick={() => setPrefs({ playbackRate: nextSpeed(prefs.playbackRate) })}
                className="glass-tight min-h-11 min-w-14 rounded-full px-3 text-sm font-medium tabular-nums"
                aria-label="Playback speed"
              >
                {speedLabel(prefs.playbackRate)}
              </button>
            </div>
          </div>
        ) : null}

        {reactionEntries.length ? (
          <div className="flex items-center gap-2 text-sm text-mist">
            {reactionEntries.map(([emoji, n]) => (
              <span key={emoji} className="glass-tight rounded-full px-2 py-1">
                {emoji}
                {n > 1 ? ` ${n}` : ""}
              </span>
            ))}
          </div>
        ) : null}

        <div className="grid w-full grid-cols-[1fr_auto_1fr] items-center gap-3 px-5">
          <div className="flex items-center justify-end gap-2">
            {current && !current.outgoing ? (
              <Button variant="glass" size="icon" onClick={() => setReactOpen((v) => !v)} aria-label="React">
                <span className="text-lg leading-none">{reactionEntries[0]?.[0] ?? "❤️"}</span>
              </Button>
            ) : null}
            {canForward ? (
              <Button variant="glass" size="icon" onClick={() => setForwardOpen(true)} aria-label="Forward">
                <CornerUpRight className="size-5" />
              </Button>
            ) : null}
          </div>
          <RecordButton onClick={onReply} />
          <div className="flex items-center gap-2">
            {canSave ? (
              <>
                <Button variant="glass" size="icon" onClick={() => void shareClip()} aria-label="Share">
                  <Share2 className="size-5" />
                </Button>
                <Button variant="glass" size="icon" onClick={() => void downloadClip()} aria-label="Save">
                  <Download className="size-5" />
                </Button>
              </>
            ) : null}
            {current ? (
              <Button variant="glass" size="icon" onClick={() => setBurnOpen(true)} aria-label="Destroy">
                <Trash2 className="size-5" />
              </Button>
            ) : null}
          </div>
        </div>

        <ClipRail
          clips={clips}
          activeIndex={index}
          onPick={(i) => {
            setIndex(i);
            setGone(false);
          }}
        />
      </div>

      {reactOpen ? (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-ink/50 px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <div className="glass w-full max-w-md rounded-3xl p-5">
            <p className="text-sm font-medium">React</p>
            <div className="mt-4 grid grid-cols-6 gap-2">
              {REACTION_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => void react(emoji)}
                  className="grid h-12 place-items-center rounded-xl bg-glass text-2xl"
                  aria-label={`React ${emoji}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
            <Button className="mt-4 w-full" variant="ghost" onClick={() => setReactOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : null}

      {burnOpen ? (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-ink/50 px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <div className="glass w-full max-w-md rounded-3xl p-5">
            <p className="text-lg font-medium">Destroy this clip</p>
            <p className="mt-2 text-sm text-mute">
              Just this phone, or send a sealed shred so it vanishes for both of you.
            </p>
            <Button className="mt-4 w-full" variant="glass" onClick={() => void burn(false)}>
              Just on this phone
            </Button>
            <Button className="mt-2 w-full" variant="danger" onClick={() => void burn(true)}>
              Delete for everyone
            </Button>
            <Button className="mt-2 w-full" variant="ghost" onClick={() => setBurnOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : null}

      {forwardOpen ? (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-ink/50 px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <div className="glass max-h-[80dvh] w-full max-w-md overflow-y-auto rounded-3xl p-5">
            <p className="text-lg font-medium">Forward</p>
            <p className="mt-1 text-xs text-mute">Re-seals the clip for someone else. They still cannot save it if the sender turned that off.</p>
            {forwardTargets.length ? (
              <div className="mt-4 space-y-2">
                {forwardTargets.map((f) => (
                  <button
                    key={f.userId}
                    type="button"
                    onClick={() => void forwardTo(f)}
                    className="flex w-full items-center gap-3 rounded-xl bg-glass px-3 py-3 text-left"
                  >
                    <span className="grid size-10 place-items-center rounded-full bg-fog text-sm font-medium text-accent-fg">
                      {f.displayName.slice(0, 1).toUpperCase()}
                    </span>
                    <span>
                      <span className="block text-sm font-medium">{f.displayName}</span>
                      <span className="text-xs text-mute">@{f.handle}</span>
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-mute">No one else to forward to yet.</p>
            )}
            <Button className="mt-4 w-full" variant="ghost" onClick={() => setForwardOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : null}

      {menuOpen ? (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-ink/50 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-16">
          <div className="glass max-h-[80dvh] w-full max-w-md overflow-y-auto rounded-3xl p-5">
            <p className="text-lg font-medium">{name}</p>
            {safety ? (
              <div className="mt-4">
                <p className="text-xs uppercase tracking-[0.16em] text-mute">Safety number</p>
                <p className="mt-2 font-mono text-sm leading-6 text-fog">{safety}</p>
                <p className="mt-1 text-xs text-mute">Match this with them in person so you know it’s their phone.</p>
              </div>
            ) : null}
            {circle ? (
              <p className="mt-3 text-xs text-mute">
                {circle.members.filter((m) => m.status === "member").length} in this group
                {circle.members.some((m) => m.status === "invited")
                  ? ` · ${circle.members.filter((m) => m.status === "invited").length} invited`
                  : ""}
              </p>
            ) : null}
            {circle ? (
              <Button
                className="mt-4 w-full"
                variant="glass"
                onClick={() => {
                  void (async () => {
                    if (circle.createdBy === myId) {
                      for (const member of circle.members) {
                        if (member.userId === myId || !member.publicKey) continue;
                        try {
                          await sendSealedHeader({
                            recipientId: member.userId,
                            recipientPublicKey: member.publicKey,
                            header: {
                              v: 1,
                              purpose: "circle-meta",
                              groupId: circle.id,
                              circleName: circle.name,
                              createdBy: myId,
                              disbanded: true,
                            },
                          });
                        } catch {
                          /* best-effort */
                        }
                      }
                    }
                    await removeCircle(circle.id);
                    toast(circle.createdBy === myId ? "Group deleted" : "You left the group");
                    setMenuOpen(false);
                    onBack();
                    onChanged();
                  })().catch((err: unknown) => toast(err instanceof Error ? err.message : "Could not leave"));
                }}
              >
                <LogOut className="size-4" />
                {circle.createdBy === myId ? "Delete group" : "Leave group"}
              </Button>
            ) : null}
            {friend ? (
              <Button
                className="mt-4 w-full"
                variant="danger"
                onClick={() => {
                  void blockLocal(friend.userId)
                    .then(() => {
                      toast(`Blocked ${friend.displayName}`);
                      setMenuOpen(false);
                      onBack();
                      onChanged();
                    })
                    .catch((err: unknown) => toast(err instanceof Error ? err.message : "Could not block"));
                }}
              >
                <Ban className="size-4" />
                Block
              </Button>
            ) : null}
            <Button className="mt-3 w-full" variant="ghost" onClick={() => setMenuOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      ) : null}

      <NotesSheet
        open={notesOpen}
        text={notes.text}
        onChange={notes.setText}
        onClose={() => setNotesOpen(false)}
        onClear={() => undefined}
        peerId={peerId}
      />
    </div>
  );
}

/** Big record button that sits above the clip rail — same spot as on the camera. */
function RecordButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Record a reply"
      className="grid size-[72px] place-items-center rounded-full bg-fog shadow-[0_0_0_6px_rgb(255_255_255/0.18)] transition-transform active:scale-[0.96]"
    >
      <span className="size-14 rounded-full bg-record" />
    </button>
  );
}
