import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Camera, Mic, RefreshCw, Send, Square, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  capturePoster,
  durationOf,
  formatRecTime,
  listenCaptions,
  MAX_SECONDS,
  mimeOf,
  openCamera,
  openMic,
  pickMime,
} from "@/lib/haven/media";
import { readPrefs } from "@/lib/haven/prefs";
import { TTL_OPTIONS, ttlLabel, type MediaKind, type StoredVideo, type TtlMode } from "@/lib/haven/types";
import { cn } from "@/lib/utils";
import { ClipRail } from "./clip-rail";
import { NotesChip, useThreadNote } from "./notes-pad";

export type RecorderPayload = {
  blob: Blob;
  poster: Blob | null;
  durationMs: number;
  ttl: TtlMode;
  kind: MediaKind;
  mimeType: string;
  captions: string;
};

export function Recorder({
  toName,
  peerId,
  defaultTtl,
  clips,
  onOpenClip,
  onCancel,
  onSend,
}: {
  toName: string;
  peerId: string;
  defaultTtl: TtlMode;
  /** This conversation's clips, shown along the bottom like the thread view. */
  clips: StoredVideo[];
  onOpenClip: (clipId: string) => void;
  onCancel: () => void;
  onSend: (payload: RecorderPayload) => Promise<void>;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playbackRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startedAtRef = useRef(0);
  const captionsRef = useRef("");
  const stopCaptionsRef = useRef<(() => void) | null>(null);
  const [facing, setFacing] = useState<"user" | "environment">("user");
  const [kind, setKind] = useState<MediaKind>("video");
  const [live, setLive] = useState(false);
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [preview, setPreview] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [ttl, setTtl] = useState<TtlMode>(defaultTtl);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [ttlOpen, setTtlOpen] = useState(false);
  const [liveCaption, setLiveCaption] = useState("");
  const notes = useThreadNote(peerId);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const stream = kind === "audio" ? await openMic() : await openCamera(facing);
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = stream;
        if (videoRef.current && kind === "video") {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => undefined);
        }
        setLive(true);
        setError(null);
      } catch {
        if (!cancelled) {
          setError(kind === "audio" ? "Microphone is blocked." : "Camera is blocked. You can still choose a clip.");
        }
      }
    })();
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, [facing, kind]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  useEffect(() => {
    if (!recording) return;
    const started = startedAtRef.current || Date.now();
    const tick = window.setInterval(() => {
      const s = Math.floor((Date.now() - started) / 1000);
      setSeconds(s);
      if (MAX_SECONDS > 0 && s >= MAX_SECONDS) stop();
    }, 200);
    return () => window.clearInterval(tick);
  }, [recording]);

  useEffect(() => {
    if (kind !== "audio" || !live || preview) return;
    const stream = streamRef.current;
    const canvas = canvasRef.current;
    if (!stream || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const audioCtx = new AudioContext();
    const source = audioCtx.createMediaStreamSource(stream);
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 64;
    source.connect(analyser);
    const data = new Uint8Array(analyser.frequencyBinCount);
    let raf = 0;
    const draw = () => {
      analyser.getByteFrequencyData(data);
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);
      const barW = width / data.length;
      for (let i = 0; i < data.length; i += 1) {
        const h = (data[i]! / 255) * height;
        ctx.fillStyle = "rgba(244,245,248,0.85)";
        ctx.fillRect(i * barW + 2, height - h, Math.max(2, barW - 4), h);
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(raf);
      void audioCtx.close();
    };
  }, [kind, live, preview]);

  function start() {
    const stream = streamRef.current;
    if (!stream) return;
    chunksRef.current = [];
    const mime = pickMime(kind === "audio" ? "audio" : "video");
    const rec = new MediaRecorder(stream, {
      mimeType: mime,
      ...(kind === "video" ? { videoBitsPerSecond: 650_000 } : { audioBitsPerSecond: 48_000 }),
    });
    rec.ondataavailable = (ev) => {
      if (ev.data.size) chunksRef.current.push(ev.data);
    };
    rec.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: rec.mimeType || mime });
      setPreview(blob);
      setPreviewUrl(URL.createObjectURL(blob));
    };
    recorderRef.current = rec;
    rec.start(200);
    startedAtRef.current = Date.now();
    captionsRef.current = "";
    setLiveCaption("");
    stopCaptionsRef.current?.();
    if (readPrefs().captions) {
      stopCaptionsRef.current = listenCaptions((text) => {
        captionsRef.current = text;
        setLiveCaption(text);
      });
    }
    setRecording(true);
    setSeconds(0);
  }

  function stop() {
    stopCaptionsRef.current?.();
    stopCaptionsRef.current = null;
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.stop();
    }
    setRecording(false);
  }

  async function send() {
    if (!preview) return;
    setSending(true);
    try {
      let poster: Blob | null = null;
      if (kind === "video" && playbackRef.current) poster = await capturePoster(playbackRef.current);
      const elapsed = startedAtRef.current ? Date.now() - startedAtRef.current : seconds * 1000;
      const fromEl = playbackRef.current?.duration;
      const fromBlob = await durationOf(preview);
      const durationMs =
        (fromEl && Number.isFinite(fromEl) ? Math.round(fromEl * 1000) : 0) ||
        fromBlob ||
        elapsed ||
        1000;
      await onSend({
        blob: preview,
        poster,
        durationMs,
        ttl,
        kind,
        mimeType: mimeOf(preview, kind === "audio" ? "audio" : "video"),
        captions: captionsRef.current,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send");
      setSending(false);
    }
  }

  function onFile(file: File) {
    const fileKind: MediaKind = file.type.startsWith("audio/") ? "audio" : "video";
    setKind(fileKind);
    setPreview(file);
    setPreviewUrl(URL.createObjectURL(file));
    startedAtRef.current = 0;
  }

  return (
    <div className="player-screen relative flex min-h-dvh flex-col">
      {kind === "video" ? (
        <video
          ref={videoRef}
          className={cn(
            "absolute inset-0 size-full object-cover",
            preview ? "hidden" : "block",
            facing === "user" && "-scale-x-100",
          )}
          muted
          playsInline
          autoPlay
        />
      ) : (
        <div className="absolute inset-0 spec" />
      )}
      {previewUrl && kind === "video" ? (
        <video
          ref={playbackRef}
          src={previewUrl}
          className="absolute inset-0 size-full object-cover"
          playsInline
          loop
          autoPlay
          muted
        />
      ) : null}
      {kind === "audio" && !preview ? (
        <div className="absolute inset-0 grid place-items-center">
          <div className="flex flex-col items-center gap-5">
            <span className="grid size-24 place-items-center rounded-full glass">
              <Mic className="size-10 text-fog" />
            </span>
            <canvas ref={canvasRef} width={280} height={64} className="w-64" />
          </div>
        </div>
      ) : null}
      {kind === "audio" && previewUrl ? (
        <div className="absolute inset-0 grid place-items-center">
          <audio src={previewUrl} autoPlay loop className="hidden" />
          <p className="text-sm text-mist">Voice note ready</p>
        </div>
      ) : null}
      <div className="absolute inset-0 bg-gradient-to-b from-ink/50 via-transparent to-ink/70" />

      <div className="relative z-10 flex items-center justify-between px-4 pt-[max(1rem,env(safe-area-inset-top))]">
        <Button variant="glass" size="icon" onClick={onCancel} aria-label="Close">
          <ArrowLeft className="size-5" />
        </Button>
        <p className="text-sm font-medium">To {toName}</p>
        <button
          type="button"
          onClick={() => setTtlOpen((v) => !v)}
          className="glass-tight rounded-full px-3 py-2 text-xs font-medium"
        >
          {ttlLabel(ttl)}
        </button>
      </div>

      <div className="relative z-10 mx-auto mt-4 flex rounded-full glass p-1">
        <button
          type="button"
          onClick={() => {
            setKind("video");
            setPreview(null);
            setPreviewUrl(null);
          }}
          className={cn(
            "flex h-10 items-center gap-1.5 rounded-full px-4 text-sm font-medium",
            kind === "video" ? "bg-fog text-accent-fg" : "text-mist",
          )}
        >
          <Video className="size-4" />
          Video
        </button>
        <button
          type="button"
          onClick={() => {
            setKind("audio");
            setPreview(null);
            setPreviewUrl(null);
          }}
          className={cn(
            "flex h-10 items-center gap-1.5 rounded-full px-4 text-sm font-medium",
            kind === "audio" ? "bg-fog text-accent-fg" : "text-mist",
          )}
        >
          <Mic className="size-4" />
          Voice
        </button>
      </div>

      {ttlOpen ? (
        <div className="relative z-10 mx-4 mt-3 rounded-xl glass p-3">
          <p className="mb-2 px-1 text-xs text-mute">Timer starts after they watch. Unwatched stays.</p>
          <div className="grid grid-cols-2 gap-2">
          {TTL_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => {
                setTtl(opt.id);
                setTtlOpen(false);
              }}
              className={cn(
                "rounded-md px-3 py-2 text-left text-sm",
                ttl === opt.id ? "bg-fog text-accent-fg" : "text-fog",
              )}
            >
              {opt.label}
            </button>
          ))}
          </div>
        </div>
      ) : null}

      {recording && liveCaption ? (
        <p className="relative z-10 mx-5 mt-auto rounded-xl bg-ink/55 px-4 py-2 text-center text-sm text-fog">
          {liveCaption}
        </p>
      ) : null}

      <div className="relative z-10 mt-auto flex flex-col items-center gap-5 px-6 pb-4">
        <NotesChip text={notes.text} className="w-full" />
        {error ? (
          <p className="glass rounded-full px-4 py-2 text-center text-sm text-fog">{error}</p>
        ) : null}
        {recording ? (
          <p className="tabular-nums text-sm text-fog">{formatRecTime(seconds)}</p>
        ) : null}

        {!preview ? (
          <div className="flex w-full items-center justify-between">
            <label className="grid size-11 place-items-center rounded-full glass-tight">
              {kind === "audio" ? <Mic className="size-5" /> : <Camera className="size-5" />}
              <input
                type="file"
                accept={kind === "audio" ? "audio/*" : "video/*"}
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onFile(file);
                }}
              />
            </label>
            <button
              type="button"
              disabled={!live}
              onClick={() => (recording ? stop() : start())}
              className={cn(
                "relative grid size-[84px] place-items-center rounded-full",
                "shadow-[0_0_0_6px_rgb(255_255_255/0.18)] bg-fog",
                "active:scale-[0.96] transition-transform",
                !live && "opacity-40",
              )}
              aria-label={recording ? "Stop" : "Record"}
            >
              {recording ? (
                <Square className="size-7 fill-record text-record" />
              ) : (
                <span className="size-16 rounded-full bg-record" />
              )}
            </button>
            {kind === "video" ? (
              <Button
                variant="glass"
                size="icon"
                onClick={() => setFacing((f) => (f === "user" ? "environment" : "user"))}
                aria-label="Flip camera"
              >
                <RefreshCw className="size-5" />
              </Button>
            ) : (
              <span className="size-11" />
            )}
          </div>
        ) : (
          <div className="flex w-full items-center justify-between gap-3">
            <Button variant="glass" size="pill" onClick={() => { setPreview(null); setPreviewUrl(null); }}>
              Retake
            </Button>
            <Button size="pill" disabled={sending} onClick={() => void send()}>
              <Send className="size-4" />
              Send
            </Button>
          </div>
        )}
      </div>
      <div className="relative z-10 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <ClipRail
          clips={clips}
          activeIndex={-1}
          disabled={recording || sending}
          onPick={(i) => {
            const clip = clips[i];
            if (clip) onOpenClip(clip.id);
          }}
        />
      </div>
    </div>
  );
}
