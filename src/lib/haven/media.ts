/** 0 = no cap. Clips can be as long as you need, like Marco Polo. */
export const MAX_SECONDS = 0;

export function formatRecTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function pickMime(kind: "video" | "audio" = "video"): string {
  const video = [
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm",
    "video/mp4",
  ];
  const audio = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"];
  const candidates = kind === "audio" ? audio : video;
  if (typeof MediaRecorder === "undefined") return kind === "audio" ? "audio/webm" : "video/webm";
  return candidates.find((type) => MediaRecorder.isTypeSupported(type)) ?? candidates[candidates.length - 1]!;
}

export async function openCamera(facing: "user" | "environment"): Promise<MediaStream> {
  return navigator.mediaDevices.getUserMedia({
    audio: { echoCancellation: true, noiseSuppression: true },
    video: {
      facingMode: { ideal: facing },
      width: { ideal: 720, max: 1280 },
      height: { ideal: 1280, max: 1920 },
      frameRate: { ideal: 24, max: 30 },
    },
  });
}

export async function openMic(): Promise<MediaStream> {
  return navigator.mediaDevices.getUserMedia({
    audio: { echoCancellation: true, noiseSuppression: true },
    video: false,
  });
}

export async function capturePoster(video: HTMLVideoElement): Promise<Blob | null> {
  try {
    const canvas = document.createElement("canvas");
    const w = video.videoWidth || 360;
    const h = video.videoHeight || 480;
    canvas.width = 360;
    canvas.height = Math.round((360 * h) / w);
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return await new Promise((resolve) =>
      canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.72),
    );
  } catch {
    return null;
  }
}

export function mimeOf(blob: Blob, kind: "video" | "audio"): string {
  if (blob.type) return blob.type;
  return kind === "audio" ? "audio/webm" : "video/webm";
}

export async function durationOf(blob: Blob): Promise<number> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(blob);
    const el = document.createElement(blob.type.startsWith("audio/") ? "audio" : "video");
    el.preload = "metadata";
    const done = (ms: number) => {
      URL.revokeObjectURL(url);
      resolve(ms);
    };
    el.onloadedmetadata = () => {
      const d = el.duration;
      done(Number.isFinite(d) && d > 0 ? Math.round(d * 1000) : 0);
    };
    el.onerror = () => done(0);
    window.setTimeout(() => done(0), 4000);
    el.src = url;
  });
}

type Recog = {
  continuous: boolean;
  interimResults: boolean;
  onresult: ((ev: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  start: () => void;
  stop: () => void;
};

export function listenCaptions(onText: (text: string) => void): () => void {
  const w = window as unknown as { SpeechRecognition?: new () => Recog; webkitSpeechRecognition?: new () => Recog };
  const Ctor = w.SpeechRecognition ?? w.webkitSpeechRecognition;
  if (!Ctor) return () => undefined;
  const rec = new Ctor();
  rec.continuous = true;
  rec.interimResults = true;
  rec.onresult = (ev) => {
    let text = "";
    for (let i = 0; i < ev.results.length; i += 1) text += ev.results[i]![0]!.transcript + " ";
    onText(text.trim());
  };
  try {
    rec.start();
  } catch {
    return () => undefined;
  }
  return () => {
    try {
      rec.stop();
    } catch {
      /* ignore */
    }
  };
}
