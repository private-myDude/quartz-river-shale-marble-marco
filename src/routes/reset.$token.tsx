import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Atmosphere } from "@/components/haven/atmosphere";
import { checkPasswordResetLink, resetPasswordWithLink } from "@/lib/haven/password-reset";

export const Route = createFileRoute("/reset/$token")({ component: ResetPassword });

function ResetPassword() {
  const { token } = Route.useParams();
  const [valid, setValid] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    void checkPasswordResetLink({ data: { token } })
      .then((r) => setValid(r.valid))
      .catch(() => setValid(false));
  }, [token]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwords don’t match");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await resetPasswordWithLink({ data: { token, password } });
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not reset password");
      setBusy(false);
    }
  }

  return (
    <main className="relative mx-auto flex min-h-dvh w-full max-w-md flex-col px-6 py-10">
      <Atmosphere />
      <p className="font-display text-5xl italic text-fog">Haven</p>
      <h1 className="mt-5 text-2xl font-medium tracking-tight">Reset your password</h1>

      {valid === null ? <p className="mt-3 text-sm text-mute">Checking your link…</p> : null}

      {valid === false && !done ? (
        <p className="mt-3 text-sm text-mute">
          This link has expired or was already used. Ask the person who runs your family’s Haven for a new one.
        </p>
      ) : null}

      {done ? (
        <div className="mt-6 space-y-4">
          <p className="text-sm text-mute">Your password is changed. Sign in with your email and new password.</p>
          <Button className="w-full" size="lg" onClick={() => (window.location.href = "/login")}>
            Sign in
          </Button>
        </div>
      ) : null}

      {valid && !done ? (
        <form onSubmit={(e) => void submit(e)} className="glass spec mt-8 space-y-3 rounded-2xl p-5">
          <Input
            placeholder="New password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            minLength={8}
            required
          />
          <Input
            placeholder="Confirm new password"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
            minLength={8}
            required
          />
          {error ? <p className="text-sm text-danger">{error}</p> : null}
          <Button type="submit" className="w-full" size="lg" disabled={busy}>
            Set new password
          </Button>
          <p className="text-center text-xs text-mute">
            At least 8 characters. You’ll be signed out on your other devices.
          </p>
        </form>
      ) : null}
    </main>
  );
}
