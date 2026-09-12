import { useEffect, useState } from "react";
import { ScanFace } from "lucide-react";
import { PinPad } from "./pin-pad";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  biometricAvailable,
  consumeBackupCode,
  getLockConfig,
  loadTotpSecret,
  unlockWithBiometric,
  unlockWithPasscode,
  unlockWithPhrase,
} from "@/lib/haven/lock";
import { totpValid } from "@/lib/haven/totp";

type Step = "lock" | "totp" | "recover" | "backup";

export function LockScreen({
  onUnlocked,
}: {
  onUnlocked: () => void;
}) {
  const [pin, setPin] = useState("");
  const [totpPin, setTotpPin] = useState("");
  const [phrase, setPhrase] = useState("");
  const [backup, setBackup] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [hasPasscode, setHasPasscode] = useState(true);
  const [hasBio, setHasBio] = useState(false);
  const [step, setStep] = useState<Step>("lock");
  const [totpSecret, setTotpSecret] = useState<string | null>(null);

  useEffect(() => {
    void getLockConfig().then((cfg) => {
      setHasPasscode(Boolean(cfg?.hasPasscode));
      setHasBio(Boolean(cfg?.hasBiometric));
    });
    void loadTotpSecret().then((v) => v && setTotpSecret(v));
  }, []);

  async function finishUnlock() {
    const secret = totpSecret ?? (await loadTotpSecret());
    if (secret) {
      setTotpSecret(secret);
      setStep("totp");
      setTotpPin("");
      return;
    }
    onUnlocked();
  }

  useEffect(() => {
    if (step !== "lock" || pin.length !== 6) return;
    let cancelled = false;
    (async () => {
      setBusy(true);
      setError(null);
      try {
        await unlockWithPasscode(pin);
        if (!cancelled) await finishUnlock();
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Wrong passcode");
          setPin("");
        }
      } finally {
        if (!cancelled) setBusy(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [pin, step]);

  useEffect(() => {
    if (step !== "totp" || totpPin.length !== 6 || !totpSecret) return;
    let cancelled = false;
    (async () => {
      setBusy(true);
      setError(null);
      try {
        if (!(await totpValid(totpSecret, totpPin))) throw new Error("Wrong authenticator code");
        if (!cancelled) onUnlocked();
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Wrong authenticator code");
          setTotpPin("");
        }
      } finally {
        if (!cancelled) setBusy(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [totpPin, step, totpSecret, onUnlocked]);

  async function bio() {
    setBusy(true);
    setError(null);
    try {
      await unlockWithBiometric();
      await finishUnlock();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Face ID failed");
    } finally {
      setBusy(false);
    }
  }

  async function recover() {
    setBusy(true);
    setError(null);
    try {
      await unlockWithPhrase(phrase);
      await finishUnlock();
    } catch (err) {
      setError(err instanceof Error ? err.message : "That recovery secret does not match");
    } finally {
      setBusy(false);
    }
  }

  async function useBackup() {
    setBusy(true);
    setError(null);
    try {
      if (!(await consumeBackupCode(backup))) throw new Error("That backup code does not match");
      onUnlocked();
    } catch (err) {
      setError(err instanceof Error ? err.message : "That backup code does not match");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-between px-6 py-10">
      <div className="pt-10 text-center">
        <p className="font-display text-5xl italic text-fog">Haven</p>
        <p className="mt-3 text-sm text-mute">
          {step === "totp"
            ? "Authenticator code"
            : step === "backup"
              ? "Backup code"
              : step === "recover"
                ? "Recover this device"
                : "Locked on this device"}
        </p>
      </div>
      <div className="flex w-full max-w-sm flex-col items-center gap-8">
        {step === "lock" && hasPasscode ? <PinPad value={pin} onChange={setPin} disabled={busy} /> : null}
        {step === "totp" ? <PinPad value={totpPin} onChange={setTotpPin} disabled={busy} /> : null}
        {step === "backup" ? (
          <div className="flex w-full flex-col gap-3">
            <Input
              value={backup}
              onChange={(e) => setBackup(e.target.value.toUpperCase())}
              placeholder="XXXX-XXXX"
              className="font-mono"
            />
            <Button className="w-full" disabled={busy || backup.trim().length < 8} onClick={() => void useBackup()}>
              Unlock with backup code
            </Button>
            <Button variant="ghost" onClick={() => setStep("totp")}>
              Back
            </Button>
          </div>
        ) : null}
        {step === "recover" ? (
          <div className="flex w-full flex-col gap-3">
            <textarea
              value={phrase}
              onChange={(e) => setPhrase(e.target.value)}
              rows={4}
              placeholder="Phrase, passkey, or email code"
              className="w-full rounded-xl bg-glass px-4 py-3 text-sm text-fog placeholder:text-mute"
            />
            <Button className="w-full" disabled={busy || !phrase.trim()} onClick={() => void recover()}>
              Unlock with recovery
            </Button>
            <Button variant="ghost" onClick={() => setStep("lock")}>
              Back
            </Button>
          </div>
        ) : null}
        {error ? <p className="text-sm text-danger">{error}</p> : null}
        {step === "lock" && hasBio && biometricAvailable() ? (
          <Button variant="glass" size="pill" onClick={() => void bio()} disabled={busy}>
            <ScanFace className="size-5" />
            Unlock with Face ID
          </Button>
        ) : null}
        {step === "totp" ? (
          <button type="button" className="text-xs text-mute" onClick={() => setStep("backup")}>
            Use a backup code
          </button>
        ) : null}
        {step === "lock" ? (
          <button type="button" className="text-xs text-mute" onClick={() => setStep("recover")}>
            Forgot passcode? Use recovery
          </button>
        ) : null}
      </div>
      <p className="pb-4 text-center text-xs text-mute">
        Videos stay encrypted until you unlock.
      </p>
    </div>
  );
}
