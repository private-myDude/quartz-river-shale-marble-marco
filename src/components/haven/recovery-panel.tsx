import { useEffect, useState } from "react";
import { Copy, Download, KeyRound, QrCode, Shield } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { putRecoveryBlob, updateProfile } from "@/lib/haven/api";
import { hashContactEmail } from "@/lib/haven/contacts";
import { getSessionKeys } from "@/lib/haven/lock";
import {
  downloadText,
  generatePhrase,
  getEmergencyContact,
  getRecoveryEmail,
  persistRecoveryPack,
  recoveryFileBody,
  setEmergencyContact,
  setRecoveryEmail,
  wrapRecoveryPack,
  type PhraseBundle,
} from "@/lib/haven/recovery";
import { otpauthUrl, randomTotpSecret, totpValid } from "@/lib/haven/totp";
import { qrSvg } from "@/lib/haven/qr";
import {
  loadTotpSecret,
  storeTotpSecret,
  clearTotpSecret,
  generateBackupCodes,
  storeBackupCodes,
  remainingBackupCodes,
} from "@/lib/haven/lock";
import type { Friend, Profile } from "@/lib/haven/types";

export function RecoveryPanel({
  profile,
  friends,
  onChanged,
}: {
  profile: Profile;
  friends: Friend[];
  onChanged: () => void;
}) {
  const accepted = friends.filter((f) => f.status === "accepted");
  const [bundle, setBundle] = useState<PhraseBundle | null>(null);
  const [email, setEmail] = useState("");
  const [emailCode, setEmailCode] = useState<string | null>(null);
  const [emergency, setEmergency] = useState<string>("");
  const [emergencyCode, setEmergencyCode] = useState<string | null>(null);
  const [totpSecret, setTotpSecret] = useState<string | null>(null);
  const [totpQr, setTotpQr] = useState<string | null>(null);
  const [totpCheck, setTotpCheck] = useState("");
  const [totpOn, setTotpOn] = useState(profile.totpEnabled);
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null);
  const [backupLeft, setBackupLeft] = useState(0);

  useEffect(() => {
    void getRecoveryEmail().then((v) => v && setEmail(v));
    void getEmergencyContact().then((v) => v && setEmergency(v));
    void loadTotpSecret().then((v) => {
      if (v) setTotpOn(true);
    });
    void remainingBackupCodes().then(setBackupLeft);
  }, []);

  async function makePhrase() {
    const next = generatePhrase();
    await persistRecoveryPack(next.phrase, getSessionKeys());
    setBundle(next);
    toast("Phrase created. Haven cannot open this backup.");
  }

  async function saveEmail() {
    if (!email.includes("@")) {
      toast("Enter a real email");
      return;
    }
    await setRecoveryEmail(email);
    const code = generatePhrase().passkey.slice(0, 10);
    setEmailCode(code);
    const pack = await wrapRecoveryPack(code, getSessionKeys());
    await putRecoveryBlob({ data: { kind: "email", blob: JSON.stringify(pack) } });
    await updateProfile({ data: { recoveryEmailHash: await hashContactEmail(email) } });
    onChanged();
    toast("Recovery email saved. Haven cannot read the code.");
  }

  async function startTotp() {
    const secret = randomTotpSecret();
    const url = otpauthUrl(secret, profile.handle);
    setTotpSecret(secret);
    setTotpQr(qrSvg(url));
    setBackupCodes(null);
  }

  async function confirmTotp() {
    if (!totpSecret) return;
    if (!(await totpValid(totpSecret, totpCheck))) {
      toast("That code did not match");
      return;
    }
    const codes = generateBackupCodes();
    await storeTotpSecret(totpSecret);
    await storeBackupCodes(codes);
    await updateProfile({ data: { totpEnabled: true } });
    setTotpOn(true);
    setBackupCodes(codes);
    setBackupLeft(codes.length);
    toast("Authenticator is on. Save your backup codes.");
    onChanged();
  }

  async function rotateBackupCodes() {
    const codes = generateBackupCodes();
    await storeBackupCodes(codes);
    setBackupCodes(codes);
    setBackupLeft(codes.length);
    toast("New backup codes. The old ones no longer work.");
  }

  async function saveEmergency() {
    if (!emergency) {
      toast("Pick someone you trust");
      return;
    }
    await setEmergencyContact(emergency);
    const next = generatePhrase();
    const pack = await wrapRecoveryPack(next.passkey, getSessionKeys());
    await putRecoveryBlob({ data: { kind: "emergency", blob: JSON.stringify(pack) } });
    setEmergencyCode(next.passkey);
    toast("Give them this code in person. Haven cannot open the packet.");
  }

  return (
    <div className="glass space-y-5 rounded-2xl p-4">
        <div>
          <p className="text-sm font-medium">Recovery phrase</p>
          <p className="mt-1 text-xs text-mute">
            Sixteen words. This backup cannot be opened by Haven — only by you.
          </p>
          <Button className="mt-3 w-full" variant="glass" onClick={() => void makePhrase()}>
            <KeyRound className="size-4" />
            Create phrase
          </Button>
          {bundle ? (
            <div className="mt-3 space-y-2">
              <p className="rounded-xl bg-ink-2 px-3 py-3 font-mono text-sm leading-6 text-fog">{bundle.phrase}</p>
              <p className="text-xs text-mute">Passkey code: {bundle.passkey}</p>
              <div className="flex gap-2">
                <Button
                  variant="glass"
                  className="flex-1"
                  onClick={() => {
                    void navigator.clipboard.writeText(bundle.phrase);
                    toast("Copied. Store it offline.");
                  }}
                >
                  <Copy className="size-4" />
                  Copy
                </Button>
                <Button
                  variant="glass"
                  className="flex-1"
                  onClick={() => downloadText("haven-recovery.txt", recoveryFileBody(bundle))}
                >
                  <Download className="size-4" />
                  Download
                </Button>
              </div>
            </div>
          ) : null}
        </div>

        <div>
          <p className="text-sm font-medium">Email recovery</p>
          <p className="mt-1 text-xs text-mute">
            We store only a sealed blob. The code is for you — production emails it; this preview shows it once.
          </p>
          <Input
            className="mt-2"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@family.com"
          />
          <Button className="mt-2 w-full" variant="glass" onClick={() => void saveEmail()}>
            Save recovery email
          </Button>
          {emailCode ? (
            <p className="mt-2 font-mono text-sm text-fog">
              Recovery code (shown once): {emailCode}
            </p>
          ) : null}
        </div>

        <div>
          <p className="text-sm font-medium">Authenticator app</p>
          <p className="mt-1 text-xs text-mute">
            Any TOTP app. Scan the QR or paste the secret. Keep the backup codes somewhere only you can reach.
          </p>
          {totpOn ? (
            <div className="mt-3 space-y-2">
              {backupCodes ? (
                <div className="rounded-xl bg-ink-2 px-3 py-3">
                  <p className="text-xs text-mute">Backup codes — shown once. Each works one time.</p>
                  <ul className="mt-2 grid grid-cols-2 gap-2 font-mono text-sm text-fog">
                    {backupCodes.map((code) => (
                      <li key={code}>{code}</li>
                    ))}
                  </ul>
                  <div className="mt-3 flex gap-2">
                    <Button
                      variant="glass"
                      className="flex-1"
                      onClick={() => {
                        void navigator.clipboard.writeText(backupCodes.join("\n"));
                        toast("Copied backup codes");
                      }}
                    >
                      <Copy className="size-4" />
                      Copy
                    </Button>
                    <Button
                      variant="glass"
                      className="flex-1"
                      onClick={() =>
                        downloadText("haven-2fa-backup.txt", `Haven authenticator backup codes\n\n${backupCodes.join("\n")}\n`)
                      }
                    >
                      <Download className="size-4" />
                      Download
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-mute">
                  {backupLeft
                    ? `${backupLeft} backup code${backupLeft === 1 ? "" : "s"} left. Generate new ones if you lost the list.`
                    : "No backup codes left. Generate a new set."}
                </p>
              )}
              <Button className="w-full" variant="glass" onClick={() => void rotateBackupCodes()}>
                Generate new backup codes
              </Button>
              <Button
                className="w-full"
                variant="ghost"
                onClick={() => {
                  void clearTotpSecret();
                  void updateProfile({ data: { totpEnabled: false } });
                  setTotpOn(false);
                  setBackupCodes(null);
                  setBackupLeft(0);
                  toast("Authenticator off");
                }}
              >
                Remove 2FA
              </Button>
            </div>
          ) : totpSecret && totpQr ? (
            <div className="mt-3 space-y-2">
              <div className="mx-auto w-48 overflow-hidden rounded-xl bg-fog p-2" dangerouslySetInnerHTML={{ __html: totpQr }} />
              <p className="text-center text-xs text-mute">Scan this QR, or paste the secret below into any authenticator.</p>
              <p className="break-all rounded-xl bg-ink-2 px-3 py-2 text-center font-mono text-xs text-fog">{totpSecret}</p>
              <Button
                variant="glass"
                className="w-full"
                onClick={() => {
                  void navigator.clipboard.writeText(totpSecret);
                  toast("Secret copied");
                }}
              >
                <Copy className="size-4" />
                Copy secret
              </Button>
              <Input
                inputMode="numeric"
                placeholder="Code from your app"
                value={totpCheck}
                onChange={(e) => setTotpCheck(e.target.value)}
                maxLength={6}
              />
              <Button className="w-full" onClick={() => void confirmTotp()}>
                Confirm
              </Button>
            </div>
          ) : (
            <Button className="mt-2 w-full" variant="glass" onClick={() => void startTotp()}>
              <QrCode className="size-4" />
              Set up authenticator
            </Button>
          )}
        </div>

        <div>
          <p className="text-sm font-medium">Emergency contact</p>
          <p className="mt-1 text-xs text-mute">
            They hold a sealed packet that can restore your vault. Haven cannot open it.
          </p>
          <select
            className="mt-2 h-11 w-full rounded-lg bg-glass px-3 text-sm"
            value={emergency}
            onChange={(e) => setEmergency(e.target.value)}
          >
            <option value="">Choose someone</option>
            {accepted.map((f) => (
              <option key={f.userId} value={f.userId}>
                {f.displayName}
              </option>
            ))}
          </select>
          <Button className="mt-2 w-full" variant="glass" onClick={() => void saveEmergency()}>
            <Shield className="size-4" />
            Save emergency contact
          </Button>
          {emergencyCode ? (
            <p className="mt-2 break-all font-mono text-sm text-fog">
              Tell them this code in person: {emergencyCode}
            </p>
          ) : null}
        </div>
    </div>
  );
}
