import { useState } from "react";
import { ScanFace, Shield, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PinPad } from "./pin-pad";
import { updateProfile } from "@/lib/haven/api";
import { hashHandle } from "@/lib/haven/contacts";
import { saveIdentity } from "@/lib/haven/graph-local";
import {
  biometricAvailable,
  registerBiometric,
  setPasscode,
} from "@/lib/haven/lock";
import { normalizePhone } from "@/lib/haven/phone";
import { TTL_OPTIONS, type TtlMode } from "@/lib/haven/types";
import { PrefSelect } from "./pref-select";

export function SetupFlow({
  displayName,
  handle,
  onDone,
}: {
  displayName: string;
  handle: string;
  onDone: () => void;
}) {
  const [step, setStep] = useState<0 | 1 | 2 | 3>(0);
  const [name, setName] = useState(displayName);
  const [pin, setPin] = useState("");
  const [pin2, setPin2] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [phone, setPhone] = useState("");
  const [ttl, setTtl] = useState<TtlMode>("1d");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function finish(extra?: { phone?: string | null }) {
    setBusy(true);
    setError(null);
    try {
      const display = name.trim() || displayName;
      await saveIdentity({ handle, displayName: display });
      await updateProfile({
        data: {
          defaultTtl: ttl,
          setupComplete: true,
          phone: extra?.phone ?? (phone ? normalizePhone(phone) : null),
          handleHash: await hashHandle(handle),
        },
      });
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col px-6 py-10">
      <p className="font-display text-4xl italic text-fog">Haven</p>
      {step === 0 ? (
        <div className="mt-10 flex flex-1 flex-col">
          <h1 className="text-2xl font-medium tracking-tight">Private video for the people you love.</h1>
          <ul className="mt-8 space-y-4 text-sm text-mist">
            <li className="glass rounded-xl p-4">
              Clips are encrypted on this device. Haven never holds the keys.
            </li>
            <li className="glass rounded-xl p-4">
              In transit they stay sealed. At rest they stay sealed. After the timer, they vanish.
            </li>
            <li className="glass rounded-xl p-4">
              You can lock Haven with a passcode, Face ID, or both.
            </li>
          </ul>
          <div className="mt-auto pt-8">
            <p className="mb-3 text-xs uppercase tracking-[0.18em] text-mute">Your name</p>
            <Input value={name} onChange={(e) => setName(e.target.value)} maxLength={40} />
            <p className="mt-2 text-xs text-mute">Handle @{handle} — you can change it later.</p>
            <Button className="mt-6 w-full" size="lg" onClick={() => setStep(1)}>
              Continue
            </Button>
          </div>
        </div>
      ) : null}

      {step === 1 ? (
        <div className="mt-8 flex flex-1 flex-col items-center">
          <Shield className="size-8 text-mist" />
          <h1 className="mt-4 text-xl font-medium">Device lock</h1>
          <p className="mt-2 max-w-xs text-center text-sm text-mute">
            A 6-digit passcode encrypts your vault. Face ID can unlock it on this phone.
          </p>
          <div className="mt-8">
            <PinPad
              value={confirming ? pin2 : pin}
              onChange={(next) => {
                if (confirming) setPin2(next);
                else setPin(next);
              }}
            />
          </div>
          {pin.length === 6 && !confirming ? (
            <Button className="mt-6" size="pill" onClick={() => setConfirming(true)}>
              Confirm passcode
            </Button>
          ) : null}
          {confirming && pin2.length === 6 ? (
            <Button
              className="mt-6"
              size="pill"
              disabled={busy}
              onClick={() => {
                if (pin !== pin2) {
                  setError("Passcodes did not match");
                  setPin("");
                  setPin2("");
                  setConfirming(false);
                  return;
                }
                setBusy(true);
                void setPasscode(pin)
                  .then(() => setStep(2))
                  .catch((err: unknown) =>
                    setError(err instanceof Error ? err.message : "Could not set passcode"),
                  )
                  .finally(() => setBusy(false));
              }}
            >
              Save lock
            </Button>
          ) : null}
          {error ? <p className="mt-4 text-sm text-danger">{error}</p> : null}
          <button
            type="button"
            className="mt-auto pt-8 text-sm text-mute underline-offset-4 hover:underline"
            onClick={() => setStep(2)}
          >
            Skip for now
          </button>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="mt-8 flex flex-1 flex-col">
          <ScanFace className="size-8 text-mist" />
          <h1 className="mt-4 text-xl font-medium">Face ID</h1>
          <p className="mt-2 text-sm text-mute">
            Use your phone’s Face ID, Touch ID, or Windows Hello as a second lock.
          </p>
          {error ? <p className="mt-4 text-sm text-danger">{error}</p> : null}
          <div className="mt-auto flex flex-col gap-3">
            {biometricAvailable() ? (
              <Button
                size="lg"
                disabled={busy}
                onClick={() => {
                  setBusy(true);
                  setError(null);
                  void registerBiometric()
                    .then(() => setStep(3))
                    .catch((err: unknown) =>
                      setError(err instanceof Error ? err.message : "Could not enable Face ID"),
                    )
                    .finally(() => setBusy(false));
                }}
              >
                Enable Face ID
              </Button>
            ) : (
              <p className="text-sm text-mute">This browser cannot use device biometrics.</p>
            )}
            <Button variant="glass" size="lg" onClick={() => setStep(3)}>
              Not now
            </Button>
          </div>
        </div>
      ) : null}

      {step === 3 ? (
        <div className="mt-8 flex flex-1 flex-col">
          <Smartphone className="size-8 text-mist" />
          <h1 className="mt-4 text-xl font-medium">Findable by phone</h1>
          <p className="mt-2 text-sm text-mute">
            Optional. Family can add you by number. We store a one-way hash, never the number itself.
          </p>
          <Input
            className="mt-6"
            inputMode="tel"
            placeholder="Mobile number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <p className="mt-8 text-xs uppercase tracking-[0.18em] text-mute">Clip lifetime</p>
          <div className="mt-3">
            <PrefSelect
              className="w-full"
              aria-label="Default lifetime"
              value={ttl}
              onChange={(e) => setTtl(e.target.value as TtlMode)}
            >
              {TTL_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label} — {opt.hint}
                </option>
              ))}
            </PrefSelect>
          </div>
          {error ? <p className="mt-4 text-sm text-danger">{error}</p> : null}
          <div className="mt-auto flex flex-col gap-3 pt-8">
            <Button
              size="lg"
              disabled={busy}
              onClick={() => {
                if (phone && !normalizePhone(phone)) {
                  setError("Enter a valid mobile number");
                  return;
                }
                void finish({ phone: phone ? normalizePhone(phone) : null });
              }}
            >
              Enter Haven
            </Button>
            <Button variant="ghost" onClick={() => void finish({ phone: null })}>
              Skip phone
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
