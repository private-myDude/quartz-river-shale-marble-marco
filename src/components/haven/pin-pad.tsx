import { Delete } from "lucide-react";
import { cn } from "@/lib/utils";

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "del"] as const;

export function PinPad({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (next: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex gap-3" aria-label="Passcode dots">
        {Array.from({ length: 6 }).map((_, i) => (
          <span
            key={i}
            className={cn(
              "size-3 rounded-full transition-colors duration-150",
              i < value.length ? "bg-fog" : "bg-fog/20",
            )}
          />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-3">
        {KEYS.map((key, i) => {
          if (key === "") return <span key={`empty-${i}`} />;
          const isDel = key === "del";
          return (
            <button
              key={`key-${key}`}
              type="button"
              disabled={disabled}
              onClick={() => {
                if (isDel) onChange(value.slice(0, -1));
                else if (value.length < 6) onChange(value + key);
              }}
              className={cn(
                "size-[72px] rounded-full text-2xl font-medium text-fog",
                "glass-tight transition-transform duration-150 active:scale-[0.96]",
                "flex items-center justify-center",
              )}
            >
              {isDel ? <Delete className="size-6" /> : key}
            </button>
          );
        })}
      </div>
    </div>
  );
}
