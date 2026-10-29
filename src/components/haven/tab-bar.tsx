import type { ReactNode } from "react";
import { Camera, Home, Inbox, User, Users } from "lucide-react";
import { cn } from "@/lib/utils";

export type TabId = "home" | "people" | "inbox" | "you";

export function TabBar({
  tab,
  onTab,
  onCamera,
  inboxCount,
}: {
  tab: TabId;
  onTab: (tab: TabId) => void;
  onCamera: () => void;
  inboxCount: number;
}) {
  return (
    <nav className="pointer-events-none fixed inset-x-0 bottom-0 z-30 flex justify-center px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <div className="pointer-events-auto grid w-full max-w-md grid-cols-5 items-center justify-items-center rounded-full glass px-2 py-2">
        <TabBtn active={tab === "home"} label="Home" onClick={() => onTab("home")}>
          <Home className="size-5" />
        </TabBtn>
        <TabBtn active={tab === "people"} label="People" onClick={() => onTab("people")}>
          <Users className="size-5" />
        </TabBtn>
        <button
          type="button"
          onClick={onCamera}
          aria-label="Record"
          className="grid size-16 -translate-y-5 place-items-center rounded-full bg-fog text-accent-fg shadow-[0_0_0_6px_var(--color-ring)] transition-transform active:scale-[0.96]"
        >
          <Camera className="size-7" />
        </button>
        <TabBtn active={tab === "inbox"} label="Inbox" onClick={() => onTab("inbox")} badge={inboxCount}>
          <Inbox className="size-5" />
        </TabBtn>
        <TabBtn active={tab === "you"} label="You" onClick={() => onTab("you")}>
          <User className="size-5" />
        </TabBtn>
      </div>
    </nav>
  );
}

function TabBtn({
  active,
  label,
  onClick,
  badge,
  children,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  badge?: number;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        "relative flex size-11 flex-col items-center justify-center rounded-full transition-colors",
        active ? "text-fog" : "text-mute",
      )}
    >
      {children}
      {badge ? (
        <span className="absolute right-0.5 top-0.5 min-w-4 rounded-full bg-fog px-1 text-[10px] font-semibold leading-4 text-accent-fg tabular-nums">
          {badge > 9 ? "9+" : badge}
        </span>
      ) : null}
    </button>
  );
}
