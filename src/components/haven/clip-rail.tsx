import { useEffect, useRef, useState } from "react";
import { Mic } from "lucide-react";
import { decryptPoster } from "@/lib/haven/vault";
import type { StoredVideo } from "@/lib/haven/types";
import { cn } from "@/lib/utils";

/**
 * The conversation's clips as a row of bubbles along the bottom, oldest left,
 * newest right — shown while watching and while recording so the thread never
 * leaves the screen.
 */
export function ClipRail({
  clips,
  activeIndex,
  onPick,
  disabled,
}: {
  clips: StoredVideo[];
  /** Highlighted clip, or -1 for none (e.g. while recording). */
  activeIndex: number;
  onPick: (index: number) => void;
  disabled?: boolean;
}) {
  const railRef = useRef<HTMLDivElement>(null);
  const focus = activeIndex >= 0 ? activeIndex : clips.length - 1;

  useEffect(() => {
    const node = railRef.current?.querySelector(`[data-clip-index="${focus}"]`);
    node?.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
  }, [focus, clips.length]);

  if (!clips.length) return null;
  return (
    <div
      ref={railRef}
      className={cn("clip-rail flex w-full gap-3 overflow-x-auto px-5 pt-1", disabled && "opacity-60")}
      aria-label="Clips in this conversation"
    >
      {clips.map((clip, i) => (
        <ClipThumb
          key={clip.id}
          clip={clip}
          index={i}
          active={i === activeIndex}
          disabled={disabled}
          onPick={() => onPick(i)}
        />
      ))}
    </div>
  );
}

function ClipThumb({
  clip,
  index,
  active,
  disabled,
  onPick,
}: {
  clip: StoredVideo;
  index: number;
  active: boolean;
  disabled?: boolean;
  onPick: () => void;
}) {
  const [poster, setPoster] = useState<string | null>(null);
  const isNew = !clip.outgoing && !clip.viewedAt;
  const label = isNew ? "New" : clip.outgoing ? (clip.theyViewedAt ? "Seen" : "Sent") : "Watched";

  useEffect(() => {
    let url: string | null = null;
    let cancelled = false;
    if (clip.kind === "audio") return;
    void decryptPoster(clip.id).then((blob) => {
      if (cancelled || !blob) return;
      url = URL.createObjectURL(blob);
      setPoster(url);
    });
    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [clip.id, clip.kind]);

  return (
    <button
      type="button"
      data-clip-index={index}
      onClick={onPick}
      disabled={disabled}
      className="flex shrink-0 flex-col items-center gap-1"
      aria-label={`${label} clip ${index + 1}`}
    >
      <span
        className={cn(
          "relative size-14 overflow-hidden rounded-full bg-ink-2",
          active ? "orb-ring scale-105" : "opacity-80",
          isNew && "shadow-[0_0_0_2px_var(--color-fog)]",
        )}
      >
        {poster ? (
          <img src={poster} alt="" className="size-full object-cover" />
        ) : (
          <span className="flex size-full items-center justify-center text-mist">
            {clip.kind === "audio" ? <Mic className="size-5" /> : clip.outgoing ? "You" : ""}
          </span>
        )}
      </span>
      <span className={cn("text-[10px] font-medium", isNew ? "text-fog" : "text-mute")}>{label}</span>
    </button>
  );
}
