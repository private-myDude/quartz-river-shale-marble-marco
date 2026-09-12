import { useEffect, useRef, useState } from "react";
import { NotebookPen, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { clearNote, getNote, saveNote } from "@/lib/haven/notes";
import { cn } from "@/lib/utils";

export function useThreadNote(peerId: string | null) {
  const [text, setText] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoaded(false);
    if (!peerId) {
      setText("");
      setLoaded(true);
      return;
    }
    void getNote(peerId)
      .then((note) => {
        if (cancelled) return;
        setText(note?.text ?? "");
        setLoaded(true);
      })
      .catch(() => {
        if (cancelled) return;
        setText("");
        setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [peerId]);

  useEffect(() => {
    if (!peerId || !loaded) return;
    const handle = window.setTimeout(() => {
      void saveNote(peerId, text).catch(() => undefined);
    }, 280);
    return () => window.clearTimeout(handle);
  }, [peerId, text, loaded]);

  return { text, setText, loaded };
}

export function NotesSheet({
  open,
  text,
  onChange,
  onClose,
  onClear,
  peerId,
}: {
  open: boolean;
  text: string;
  onChange: (next: string) => void;
  onClose: () => void;
  onClear: () => void;
  peerId: string;
}) {
  const areaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open) areaRef.current?.focus();
  }, [open]);

  if (!open) return null;

  return (
    <div className="absolute inset-x-0 bottom-0 z-20 px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <div className="glass rounded-[28px] p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <NotebookPen className="size-4 text-mist" />
            <p className="text-sm font-medium">Notes for your reply</p>
          </div>
          <Button variant="ghost" size="icon" className="size-9" onClick={onClose} aria-label="Close notes">
            <X className="size-4" />
          </Button>
        </div>
        <Textarea
          ref={areaRef}
          value={text}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Tally what you want to remember…"
          className="mt-3 min-h-32 bg-ink/40"
          maxLength={2000}
        />
        <div className="mt-3 flex items-center justify-between">
          <p className="text-xs text-mute">Stays on this phone, encrypted.</p>
          {text ? (
            <button
              type="button"
              className="text-xs text-mute underline-offset-4 hover:underline"
              onClick={() => {
                onChange("");
                void clearNote(peerId);
                onClear();
              }}
            >
              Clear
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function NotesChip({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  if (!text.trim()) return null;
  return (
    <div className={cn("glass max-h-28 overflow-auto rounded-2xl px-4 py-3 text-left", className)}>
      <p className="text-[11px] uppercase tracking-[0.16em] text-mute">Your notes</p>
      <p className="mt-1 whitespace-pre-wrap text-sm text-fog">{text}</p>
    </div>
  );
}
