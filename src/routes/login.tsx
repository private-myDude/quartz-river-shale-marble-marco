import { useState, type FormEvent } from "react";
import { createFileRoute, Navigate } from "@tanstack/react-router";
import { GROK_PROVIDERS, authClient, authEnabled, signIn } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Atmosphere, HavenMark } from "@/components/haven/atmosphere";
import { resolvePhoneLogin } from "@/lib/haven/api";
import { looksLikePhone, normalizePhone } from "@/lib/haven/phone";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  const { user, isPending } = useCurrentUserState();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [name, setName] = useState("");
  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (isPending) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Atmosphere />
        <HavenMark subtitle="Private video for the people you love." />
      </div>
    );
  }
  if (user) return <Navigate to="/" />;

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!authEnabled) return;
    setBusy(true);
    setError(null);
    try {
      let email = account.trim();
      if (looksLikePhone(email)) {
        const phone = normalizePhone(email);
        if (!phone) throw new Error("Enter a valid mobile number");
        const resolved = await resolvePhoneLogin({ data: { phone } });
        if ("error" in resolved) throw new Error(resolved.error);
        email = resolved.email;
      }
      if (mode === "up") {
        const { error: err } = await authClient.signUp.email({
          email,
          password,
          name: name.trim() || email.split("@")[0] || "Friend",
        });
        if (err) throw new Error(err.message ?? "Could not create account");
      } else {
        const { error: err } = await authClient.signIn.email({ email, password });
        if (err) throw new Error(err.message ?? "Could not sign in");
      }
      window.location.href = "/";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign in");
      setBusy(false);
    }
  }

  return (
    <main className="relative mx-auto flex min-h-dvh w-full max-w-md flex-col justify-between px-6 py-10">
      <Atmosphere />
      <div>
        <p className="font-display text-5xl italic text-fog">Haven</p>
        <h1 className="mt-5 text-2xl font-medium tracking-tight text-balance">
          Private video for the people you love.
        </h1>
        <p className="mt-3 text-sm text-mute">
          Encrypted on your device. Sealed in transit. Gone when you say so.
        </p>
      </div>

      <form onSubmit={(e) => void submit(e)} className="glass spec mt-10 space-y-3 rounded-2xl p-5">
        <div className="mb-4 flex gap-1 rounded-full bg-ink/40 p-1">
          {(["in", "up"] as const).map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => setMode(id)}
              className={`h-9 flex-1 rounded-full text-sm font-medium ${
                mode === id ? "bg-fog text-accent-fg" : "text-mute"
              }`}
            >
              {id === "in" ? "Sign in" : "Create account"}
            </button>
          ))}
        </div>
        {mode === "up" ? (
          <Input
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
          />
        ) : null}
        <Input
          placeholder="Email or phone"
          value={account}
          onChange={(e) => setAccount(e.target.value)}
          autoComplete="username"
        />
        <Input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete={mode === "up" ? "new-password" : "current-password"}
          minLength={8}
          required
        />
        {error ? <p className="text-sm text-danger">{error}</p> : null}
        <Button type="submit" className="w-full" size="lg" disabled={busy || !authEnabled}>
          {mode === "up" ? "Create account" : "Continue"}
        </Button>
        <p className="text-center text-xs text-mute">
          Phone finds an existing account. Email is the login. Face ID is a device lock, set after you
          enter.
        </p>
      </form>

      <div className="mt-6 space-y-2 pb-4">
        {authEnabled ? (
          GROK_PROVIDERS.map((p) => (
            <Button
              key={p.providerId}
              variant="glass"
              className="w-full"
              size="lg"
              onClick={() => void signIn(p.providerId, { callbackURL: "/" })}
            >
              Continue with {p.label}
            </Button>
          ))
        ) : (
          <p className="text-center text-sm text-mute">Sign-in is disabled.</p>
        )}
      </div>
    </main>
  );
}
