import { useEffect, useState } from "react";
import { Mic, Plus, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { decryptPoster, decryptVideo } from "@/lib/haven/vault";
import type { StoredVideo } from "@/lib/haven/types";

export function VideoOrb({
  name,
  subtitle,
  video,
  unread,
  self,
  group,
  onClick,
}: {
  name: string;
  subtitle?: string;
  video?: StoredVideo;
  unread?: number;
  self?: boolean;
  group?: boolean;
  onClick: () => void;
}) {
  const [src, setSrc] = useState<string | null>(null);
  const [poster, setPoster] = useState<string | null>(null);
  const isAudio = video?.kind === "audio";

  useEffect(() => {
    let url: string | null = null;
    let posterUrl: string | null = null;
    let cancelled = false;
    if (!video || isAudio) {
      setSrc(null);
      setPoster(null);
      return;
    }
    void (async () => {
      try {
        const [clip, still] = await Promise.all([
          decryptVideo(video.id).catch(() => null),
          decryptPoster(video.id),
        ]);
        if (cancelled) return;
        if (still) {
          posterUrl = URL.createObjectURL(still);
          setPoster(posterUrl);
        }
        if (clip) {
          url = URL.createObjectURL(clip);
          setSrc(url);
        }
      } catch {
        if (!cancelled) setSrc(null);
      }
    })();
    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
      if (posterUrl) URL.revokeObjectURL(posterUrl);
    };
  }, [video?.id, isAudio]);

  const initial = name.slice(0, 1).toUpperCase();

  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex flex-col items-center gap-2.5 text-center"
    >
      <span className="relative size-36 sm:size-40">
        <span
          className={cn(
            "absolute inset-0 overflow-hidden rounded-full orb-ring bg-ink-2",
            "transition-transform duration-200 group-active:scale-[0.96]",
          )}
        >
          {src && !isAudio ? (
            <video
              src={src}
              poster={poster ?? undefined}
              className="size-full object-cover"
              muted
              playsInline
              loop
              autoPlay
            />
          ) : (
            <span className="flex size-full items-center justify-center spec text-3xl font-medium text-mist">
              {self ? (
                <Plus className="size-10 text-fog/80" />
              ) : isAudio ? (
                <Mic className="size-10 text-fog/80" />
              ) : group ? (
                <Users className="size-10 text-fog/80" />
              ) : (
                initial
              )}
            </span>
          )}
        </span>
        {unread ? (
          <span className="absolute right-1 top-2 grid min-w-6 place-items-center rounded-full bg-fog px-1.5 py-0.5 text-[11px] font-semibold text-accent-fg tabular-nums">
            {unread}
          </span>
        ) : null}
      </span>
      <span className="text-sm font-medium text-fog">{name}</span>
      {subtitle ? <span className="text-xs text-mute">{subtitle}</span> : null}
    </button>
  );
}
