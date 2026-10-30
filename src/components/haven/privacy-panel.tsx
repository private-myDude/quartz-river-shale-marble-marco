import { useEffect } from "react";
import { toast } from "sonner";
import { updateProfile } from "@/lib/haven/api";
import { disablePush, enablePush, syncWorkerPrefs } from "@/lib/haven/notify";
import { setPrefs, usePrefs } from "@/lib/haven/prefs";
import type { Profile } from "@/lib/haven/types";
import { PrefSelect } from "./pref-select";
import { cn } from "@/lib/utils";

function Toggle({
  on,
  onClick,
}: {
  on: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={onClick}
      className={cn("relative h-7 w-12 shrink-0 rounded-full transition-colors", on ? "bg-fog" : "bg-glass")}
    >
      <span
        className={cn(
          "absolute top-1 size-5 rounded-full transition-transform",
          on ? "translate-x-6 bg-accent-fg" : "translate-x-1 bg-fog",
        )}
      />
    </button>
  );
}

export function PrivacyPanel({
  profile,
  onChanged,
}: {
  profile: Profile;
  onChanged: () => void;
}) {
  const prefs = usePrefs();

  useEffect(() => {
    const { quietHours, quietStart, quietEnd, showSender } = prefs;
    void syncWorkerPrefs({ quietHours, quietStart, quietEnd, showSender });
  }, [prefs]);

  async function syncProfile(partial: {
    discovery?: "handle" | "anyone";
    allowSave?: boolean;
    sendReceipts?: boolean;
  }) {
    await updateProfile({ data: partial });
    onChanged();
  }

  return (
    <div className="glass divide-y divide-line overflow-hidden rounded-2xl">
        <label className="flex items-center justify-between gap-4 px-4 py-4">
          <span>
            <span className="block text-sm font-medium">Who can find you</span>
            <span className="text-xs text-mute">Only someone who already knows your handle or number. We never match on your name.</span>
          </span>
          <PrefSelect
            aria-label="Discovery"
            value="handle"
            onChange={() => {
              setPrefs({ discovery: "handle" });
              void syncProfile({ discovery: "handle" });
            }}
          >
            <option value="handle">Handle or number</option>
          </PrefSelect>
        </label>
        <label className="flex items-center justify-between gap-4 px-4 py-4">
          <span>
            <span className="block text-sm font-medium">Allow saving or sharing my clips</span>
            <span className="text-xs text-mute">Off = no download, no share, no forward. Still possible to film the screen.</span>
          </span>
          <Toggle
            on={prefs.allowSave}
            onClick={() => {
              const allowSave = !prefs.allowSave;
              setPrefs({ allowSave, shieldClips: allowSave ? prefs.shieldClips : true, allowForward: allowSave ? prefs.allowForward : false });
              void syncProfile({ allowSave });
            }}
          />
        </label>
        <label className="flex items-center justify-between gap-4 px-4 py-4">
          <span>
            <span className="block text-sm font-medium">Allow forwarding</span>
            <span className="text-xs text-mute">Forward a clip to someone else only if the sender also allowed saving.</span>
          </span>
          <Toggle
            on={prefs.allowForward}
            onClick={() => setPrefs({ allowForward: !prefs.allowForward })}
          />
        </label>
        <label className="flex items-center justify-between gap-4 px-4 py-4">
          <span>
            <span className="block text-sm font-medium">Watched receipts</span>
            <span className="text-xs text-mute">Tell them when you finish a clip. Opt out anytime.</span>
          </span>
          <Toggle
            on={prefs.sendReceipts}
            onClick={() => {
              const sendReceipts = !prefs.sendReceipts;
              setPrefs({ sendReceipts });
              void syncProfile({ sendReceipts });
            }}
          />
        </label>
        <label className="flex items-center justify-between gap-4 px-4 py-4">
          <span>
            <span className="block text-sm font-medium">Notifications</span>
            <span className="text-xs text-mute">Alert when a new sealed clip arrives.</span>
          </span>
          <Toggle
            on={prefs.notifications}
            onClick={() => {
              const next = !prefs.notifications;
              setPrefs({ notifications: next });
              if (!next) {
                void disablePush();
                return;
              }
              void enablePush().then((status) => {
                if (status === "needs-home-screen") {
                  toast("On iPhone, add Haven to your Home Screen first, then turn this on there.");
                } else if (status === "blocked") {
                  toast("Notifications are blocked. Allow them for Haven in your phone’s Settings.");
                } else if (status === "unsupported") {
                  toast("This browser can’t show notifications while Haven is closed.");
                }
              });
            }}
          />
        </label>
        {prefs.notifications ? (
          <label className="flex items-center justify-between gap-4 px-4 py-4">
            <span>
              <span className="block text-sm font-medium">Show who sent it</span>
              <span className="text-xs text-mute">
                Alerts say “Grandma sent you a clip”. The name comes from this phone, and shows on your lock screen.
              </span>
            </span>
            <Toggle on={prefs.showSender} onClick={() => setPrefs({ showSender: !prefs.showSender })} />
          </label>
        ) : null}
        <label className="flex items-center justify-between gap-4 px-4 py-4">
          <span>
            <span className="block text-sm font-medium">Quiet hours</span>
            <span className="text-xs text-mute">Silence alerts overnight.</span>
          </span>
          <Toggle on={prefs.quietHours} onClick={() => setPrefs({ quietHours: !prefs.quietHours })} />
        </label>
        {prefs.quietHours ? (
          <div className="flex gap-3 px-4 py-3">
            <InputTime
              label="From"
              value={prefs.quietStart}
              onChange={(quietStart) => setPrefs({ quietStart })}
            />
            <InputTime label="To" value={prefs.quietEnd} onChange={(quietEnd) => setPrefs({ quietEnd })} />
          </div>
        ) : null}
        <label className="flex items-center justify-between gap-4 px-4 py-4">
          <span>
            <span className="block text-sm font-medium">Captions</span>
            <span className="text-xs text-mute">Live transcript while you record, shown when they watch.</span>
          </span>
          <Toggle on={prefs.captions} onClick={() => setPrefs({ captions: !prefs.captions })} />
        </label>
        <label className="flex items-center justify-between gap-4 px-4 py-4">
          <span>
            <span className="block text-sm font-medium">Start muted</span>
            <span className="text-xs text-mute">Watch at work without sound until you unmute.</span>
          </span>
          <Toggle on={prefs.startMuted} onClick={() => setPrefs({ startMuted: !prefs.startMuted })} />
        </label>
        <label className="flex items-center justify-between gap-4 px-4 py-4">
          <span>
            <span className="block text-sm font-medium">Wi-Fi only upload</span>
            <span className="text-xs text-mute">Queue clips until you are on Wi-Fi.</span>
          </span>
          <Toggle on={prefs.wifiOnly} onClick={() => setPrefs({ wifiOnly: !prefs.wifiOnly })} />
        </label>
      </div>
  );
}

function InputTime({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex flex-1 flex-col gap-1 text-xs text-mute">
      {label}
      <input
        type="time"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 rounded-lg bg-glass px-3 text-sm text-fog"
      />
    </label>
  );
}
