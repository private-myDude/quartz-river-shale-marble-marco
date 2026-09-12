import { useEffect, useState } from "react";
import { Cloud, ScanFace, Shield, ShieldOff, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserButton } from "@/lib/auth/gates";
import { signOut } from "@/lib/auth/client";
import { deleteAccount, updateProfile } from "@/lib/haven/api";
import { hashHandle } from "@/lib/haven/contacts";
import { saveIdentity } from "@/lib/haven/graph-local";
import {
  biometricAvailable,
  clearPasscode,
  destroyLocalVault,
  disableBiometric,
  getLockConfig,
  registerBiometric,
  setPasscode,
} from "@/lib/haven/lock";
import { normalizePhone } from "@/lib/haven/phone";
import {
  CLOUD_OPTIONS,
  RELAY_OPTIONS,
  SKIP_OPTIONS,
  SPEED_OPTIONS,
  THEME_OPTIONS,
  setPrefs,
  skipLabel,
  speedLabel,
  usePrefs,
  type CloudTarget,
  type PlaybackRate,
  type RelayMode,
  type SkipSeconds,
} from "@/lib/haven/prefs";
import {
  clearSyncedFolder,
  downloadBackupFile,
  folderPickerAvailable,
  pickSyncedFolder,
  restoreBackupBlob,
  restoreFromFolder,
} from "@/lib/haven/cloud";
import { relayShredMine } from "@/lib/haven/relay";
import { TTL_OPTIONS, ttlHint, type Friend, type Profile, type TtlMode } from "@/lib/haven/types";
import { PinPad } from "./pin-pad";
import { PrefSelect } from "./pref-select";
import { PrivacyPanel } from "./privacy-panel";
import { RecoveryPanel } from "./recovery-panel";
import { cn } from "@/lib/utils";

type YouTab = "profile" | "privacy" | "security";

export function YouScreen({
  profile,
  friends,
  onChanged,
}: {
  profile: Profile;
  friends: Friend[];
  onChanged: () => void;
}) {
  const prefs = usePrefs();
  const [tab, setTab] = useState<YouTab>("profile");
  const [name, setName] = useState(profile.displayName);
  const [handle, setHandle] = useState(profile.handle);
  const [phone, setPhone] = useState("");
  const [ttl, setTtl] = useState<TtlMode>(profile.defaultTtl);
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState("");
  const [busy, setBusy] = useState(false);
  const [lock, setLock] = useState({ hasPasscode: false, hasBiometric: false });

  useEffect(() => {
    void getLockConfig().then((cfg) =>
      setLock({
        hasPasscode: Boolean(cfg?.hasPasscode),
        hasBiometric: Boolean(cfg?.hasBiometric),
      }),
    );
  }, []);

  async function saveProfile() {
    const nextHandle = handle.trim().toLowerCase();
    if (!/^[a-z0-9]{3,20}$/.test(nextHandle)) {
      toast("Handle must be 3–20 letters or numbers");
      return;
    }
    setBusy(true);
    try {
      await saveIdentity({ handle: nextHandle, displayName: name.trim() });
      await updateProfile({
        data: {
          defaultTtl: ttl,
          phone: phone ? normalizePhone(phone) : undefined,
          handleHash: await hashHandle(nextHandle),
        },
      });
      toast("Profile saved");
      onChanged();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Could not save");
    } finally {
      setBusy(false);
    }
  }

  async function saveTtl(next: TtlMode) {
    setTtl(next);
    try {
      await updateProfile({ data: { defaultTtl: next } });
      onChanged();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Could not save lifetime");
    }
  }

  const nativeCloud = CLOUD_OPTIONS.find((o) => o.id === prefs.cloudTarget)?.native === true;

  async function onCloudTarget(next: CloudTarget) {
    setPrefs({ cloudTarget: next });
    if (next === "device") {
      await clearSyncedFolder().catch(() => undefined);
      return;
    }
    if (next === "folder" || nativeCloud || ["icloud", "proton", "gdrive", "onedrive"].includes(next)) {
      if (!folderPickerAvailable() && next !== "file") {
        toast("This browser cannot open a folder. Use a backup file until native sync lands.");
        return;
      }
      if (next === "folder") {
        try {
          await pickSyncedFolder();
          toast("Encrypted backups will write to that folder");
        } catch (err) {
          const message = err instanceof Error ? err.message : "Could not open folder";
          if (!/abort|cancel/i.test(message)) toast(message);
        }
      }
    }
  }

  async function removeAccount() {
    if (confirmDelete !== "DELETE") return;
    setBusy(true);
    try {
      await deleteAccount({ data: { confirm: "DELETE" } });
      await destroyLocalVault();
      await signOut("/login");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Could not delete account");
      setBusy(false);
    }
  }

  const showFolderTools = prefs.cloudTarget === "folder" || nativeCloud;
  const showFileTools = prefs.cloudTarget === "file" || nativeCloud;

  return (
    <div className="flex flex-col gap-8 px-5 pb-32 pt-6">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-medium tracking-tight">You</h1>
          <p className="mt-1 text-sm text-mute">@{profile.handle}</p>
        </div>
        <UserButton />
      </header>

      <div className="grid grid-cols-3 gap-1 rounded-full glass p-1">
        {([
          ["profile", "Profile"],
          ["privacy", "Privacy"],
          ["security", "Security"],
        ] as const).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={cn(
              "h-10 rounded-full text-sm font-medium transition-colors",
              tab === id ? "bg-fog text-accent-fg" : "text-mist",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "privacy" ? (
        <div className="space-y-6">
          <section className="glass rounded-2xl p-4 spec">
            <p className="text-xs uppercase tracking-[0.16em] text-mute">Encryption</p>
            <p className="mt-2 text-sm text-mist">
              Clips, captions, who sent them, who you added, and group names are sealed
              on this phone. Haven’s mailbox only holds ciphertext it cannot open — not
              even who sent a clip. We cannot play, transcribe, or recover your videos.
            </p>
          </section>
          <section className="space-y-3">
            <p className="text-xs uppercase tracking-[0.16em] text-mute">Privacy & security</p>
            <PrivacyPanel profile={profile} onChanged={onChanged} />
          </section>
        </div>
      ) : null}

      {tab === "security" ? (
        <div className="space-y-6">
          <section className="space-y-3">
            <p className="text-xs uppercase tracking-[0.16em] text-mute">Recovery</p>
            <RecoveryPanel profile={profile} friends={friends} onChanged={onChanged} />
          </section>

          <section className="space-y-3">
            <p className="text-xs uppercase tracking-[0.16em] text-mute">Device lock</p>
            <div className="glass rounded-2xl p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Shield className="size-5 text-mist" />
                  <div>
                    <p className="text-sm font-medium">Passcode</p>
                    <p className="text-xs text-mute">
                      {lock.hasPasscode ? "Encrypts your vault" : "Not set"}
                    </p>
                  </div>
                </div>
                {lock.hasPasscode ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      void clearPasscode().then(() => {
                        setLock((s) => ({ ...s, hasPasscode: false }));
                        toast("Passcode removed");
                      })
                    }
                  >
                    Remove
                  </Button>
                ) : (
                  <Button size="sm" variant="glass" onClick={() => setShowPin(true)}>
                    Set
                  </Button>
                )}
              </div>
              {showPin ? (
                <div className="mt-6">
                  <PinPad
                    value={pin}
                    onChange={(next) => {
                      setPin(next);
                      if (next.length === 6) {
                        void setPasscode(next)
                          .then(() => {
                            setLock((s) => ({ ...s, hasPasscode: true }));
                            setShowPin(false);
                            setPin("");
                            toast("Passcode saved");
                          })
                          .catch((err: unknown) =>
                            toast(err instanceof Error ? err.message : "Could not set passcode"),
                          );
                      }
                    }}
                  />
                </div>
              ) : null}
            </div>
            <div className="glass rounded-2xl p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <ScanFace className="size-5 text-mist" />
                  <div>
                    <p className="text-sm font-medium">Face ID</p>
                    <p className="text-xs text-mute">
                      {lock.hasBiometric ? "On for this device" : "Off"}
                    </p>
                  </div>
                </div>
                {lock.hasBiometric ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      void disableBiometric().then(() => setLock((s) => ({ ...s, hasBiometric: false })))
                    }
                  >
                    Remove
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="glass"
                    disabled={!biometricAvailable()}
                    onClick={() =>
                      void registerBiometric()
                        .then(() => {
                          setLock((s) => ({ ...s, hasBiometric: true }));
                          toast("Face ID enabled");
                        })
                        .catch((err: unknown) =>
                          toast(err instanceof Error ? err.message : "Could not enable Face ID"),
                        )
                    }
                  >
                    Enable
                  </Button>
                )}
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <p className="text-xs uppercase tracking-[0.16em] text-danger">Delete account</p>
            <div className="rounded-2xl p-4 shadow-[0_0_0_1px_rgb(226_85_85/0.35)]">
              <p className="text-sm text-mist">
                Permanently erases your profile, friendships, sealed envelopes, and the local vault
                on this device. Type DELETE to confirm.
              </p>
              <Input
                className="mt-3"
                value={confirmDelete}
                onChange={(e) => setConfirmDelete(e.target.value.toUpperCase())}
                placeholder="DELETE"
              />
              <Button
                className="mt-3 w-full"
                variant="danger"
                disabled={confirmDelete !== "DELETE" || busy}
                onClick={() => void removeAccount()}
              >
                <Trash2 className="size-4" />
                Delete my account
              </Button>
            </div>
          </section>
        </div>
      ) : null}

      {tab === "profile" ? (
        <>
          <section className="space-y-3">
            <p className="text-xs uppercase tracking-[0.16em] text-mute">Profile</p>
            <Input value={name} onChange={(e) => setName(e.target.value)} maxLength={40} />
            <Input value={handle} onChange={(e) => setHandle(e.target.value)} maxLength={20} />
            <Input
              inputMode="tel"
              placeholder={profile.hasPhone ? "Mobile number on file" : "Add a mobile number"}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <Button onClick={() => void saveProfile()} disabled={busy} className="w-full">
              Save profile
            </Button>
          </section>

          <section className="space-y-3">
            <p className="text-xs uppercase tracking-[0.16em] text-mute">Preferences</p>
            <div className="glass divide-y divide-line overflow-hidden rounded-2xl">
              <div className="flex flex-col gap-3 px-4 py-4">
                <div>
                  <p className="text-sm font-medium">Appearance</p>
                  <p className="text-xs text-mute">Follow this phone, or lock light or dark.</p>
                </div>
                <div className="grid grid-cols-3 gap-1 rounded-lg bg-glass p-1">
                  {THEME_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setPrefs({ theme: opt.id })}
                      className={cn(
                        "h-10 rounded-md text-sm font-medium transition-colors",
                        prefs.theme === opt.id ? "bg-accent text-accent-fg" : "text-mist",
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <label className="flex items-center justify-between gap-4 px-4 py-4">
                <span>
                  <span className="block text-sm font-medium">Skip interval</span>
                  <span className="text-xs text-mute">Jump this far while watching.</span>
                </span>
                <PrefSelect
                  aria-label="Skip interval"
                  value={String(prefs.skipSeconds)}
                  onChange={(e) => setPrefs({ skipSeconds: Number(e.target.value) as SkipSeconds })}
                >
                  {SKIP_OPTIONS.map((n) => (
                    <option key={n} value={n}>
                      {skipLabel(n)}
                    </option>
                  ))}
                </PrefSelect>
              </label>
              <label className="flex items-center justify-between gap-4 px-4 py-4">
                <span>
                  <span className="block text-sm font-medium">Playback speed</span>
                  <span className="text-xs text-mute">Default when a clip starts. You can still change it while watching.</span>
                </span>
                <PrefSelect
                  aria-label="Playback speed"
                  value={String(prefs.playbackRate)}
                  onChange={(e) => setPrefs({ playbackRate: Number(e.target.value) as PlaybackRate })}
                >
                  {SPEED_OPTIONS.map((n) => (
                    <option key={n} value={n}>
                      {speedLabel(n)}
                    </option>
                  ))}
                </PrefSelect>
              </label>
              <label className="flex items-center justify-between gap-4 px-4 py-4">
                <span>
                  <span className="block text-sm font-medium">Default lifetime</span>
                  <span className="text-xs text-mute">
                    {ttlHint(ttl) || "Timer starts after they watch, not when you send."}
                  </span>
                </span>
                <PrefSelect
                  aria-label="Default lifetime"
                  value={ttl}
                  onChange={(e) => void saveTtl(e.target.value as TtlMode)}
                >
                  {TTL_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </PrefSelect>
              </label>
              <label className="flex items-center justify-between gap-4 px-4 py-4">
                <span>
                  <span className="block text-sm font-medium">Clip shield</span>
                  <span className="text-xs text-mute">
                    Hide clips if you leave Haven. Blocks save menus. Screenshots on some phones cannot be fully stopped.
                  </span>
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={prefs.shieldClips}
                  onClick={() => setPrefs({ shieldClips: !prefs.shieldClips })}
                  className={cn(
                    "relative h-7 w-12 shrink-0 rounded-full transition-colors",
                    prefs.shieldClips ? "bg-fog" : "bg-glass",
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-1 size-5 rounded-full transition-transform",
                      prefs.shieldClips ? "translate-x-6 bg-accent-fg" : "translate-x-1 bg-fog",
                    )}
                  />
                </button>
              </label>
            </div>
          </section>

          <section className="space-y-3">
            <p className="text-xs uppercase tracking-[0.16em] text-mute">Cloud & mailbox</p>
            <div className="glass divide-y divide-line overflow-hidden rounded-2xl">
              <label className="flex items-center justify-between gap-4 px-4 py-4">
                <span>
                  <span className="block text-sm font-medium">Sync</span>
                  <span className="text-xs text-mute">Where a sealed copy can live if you keep clips forever.</span>
                </span>
                <PrefSelect
                  aria-label="Cloud sync"
                  value={prefs.cloudTarget}
                  onChange={(e) => void onCloudTarget(e.target.value as CloudTarget)}
                >
                  {CLOUD_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </PrefSelect>
              </label>
              <p className="px-4 py-3 text-xs text-mute">
                {CLOUD_OPTIONS.find((o) => o.id === prefs.cloudTarget)?.hint}
              </p>
              {nativeCloud ? (
                <p className="px-4 py-3 text-xs text-mist">
                  Native {CLOUD_OPTIONS.find((o) => o.id === prefs.cloudTarget)?.label} sign-in ships with the
                  phone app. On the web, pick a folder that cloud already syncs, or save a backup file.
                </p>
              ) : null}
              {showFolderTools ? (
                <div className="flex gap-2 px-4 py-4">
                  <Button
                    variant="glass"
                    className="flex-1"
                    disabled={busy}
                    onClick={() =>
                      void pickSyncedFolder()
                        .then(() => toast("Folder linked. Backups stay encrypted."))
                        .catch((err: unknown) =>
                          toast(err instanceof Error ? err.message : "Could not open folder"),
                        )
                    }
                  >
                    <Cloud className="size-4" />
                    {folderPickerAvailable() ? "Choose folder" : "Not on this browser"}
                  </Button>
                  <Button
                    variant="glass"
                    onClick={() =>
                      void restoreFromFolder()
                        .then((n) => toast(`Restored ${n} clips`))
                        .catch((err: unknown) =>
                          toast(err instanceof Error ? err.message : "Nothing to restore"),
                        )
                    }
                  >
                    Restore
                  </Button>
                </div>
              ) : null}
              {showFileTools ? (
                <div className="flex gap-2 px-4 py-4">
                  <Button
                    variant="glass"
                    className="flex-1"
                    onClick={() =>
                      void downloadBackupFile()
                        .then(() => toast("Encrypted backup saved"))
                        .catch((err: unknown) =>
                          toast(err instanceof Error ? err.message : "Could not export"),
                        )
                    }
                  >
                    Download backup
                  </Button>
                  <label className="flex-1">
                    <input
                      type="file"
                      accept=".haven,application/octet-stream"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        void restoreBackupBlob(file)
                          .then((n) => {
                            toast(`Restored ${n} clips`);
                            onChanged();
                          })
                          .catch((err: unknown) =>
                            toast(err instanceof Error ? err.message : "Could not restore"),
                          );
                      }}
                    />
                    <span className="inline-flex h-11 w-full items-center justify-center rounded-full glass text-sm font-medium">
                      Restore file
                    </span>
                  </label>
                </div>
              ) : null}
              <label className="flex items-center justify-between gap-4 px-4 py-4">
                <span>
                  <span className="block text-sm font-medium">Sealed copies on Haven</span>
                  <span className="text-xs text-mute">
                    {RELAY_OPTIONS.find((o) => o.id === prefs.relayMode)?.hint}
                  </span>
                </span>
                <PrefSelect
                  aria-label="Mailbox retention"
                  className="w-44"
                  value={prefs.relayMode}
                  onChange={(e) => setPrefs({ relayMode: e.target.value as RelayMode })}
                >
                  {RELAY_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </PrefSelect>
              </label>
              <div className="px-4 py-4">
                <Button
                  variant="glass"
                  className="w-full"
                  disabled={busy}
                  onClick={() =>
                    void relayShredMine()
                      .then((res) => toast(`Removed ${res.removed} sealed copies from Haven`))
                      .catch((err: unknown) =>
                        toast(err instanceof Error ? err.message : "Could not shred"),
                      )
                  }
                >
                  <ShieldOff className="size-4" />
                  Delete my sealed copies now
                </Button>
              </div>
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}
