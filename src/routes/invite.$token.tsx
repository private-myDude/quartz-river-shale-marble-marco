import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Atmosphere, HavenMark } from "@/components/haven/atmosphere";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { acceptInviteLink, peekInvite } from "@/lib/haven/api";
import { PENDING_INVITE_KEY } from "@/lib/haven/graph-local";

export const Route = createFileRoute("/invite/$token")({
  component: InvitePage,
});

function claimFromHash(): { n?: string; h?: string } {
  if (typeof window === "undefined") return {};
  const raw = window.location.hash.replace(/^#/, "");
  if (!raw) return {};
  try {
    return JSON.parse(atob(raw)) as { n?: string; h?: string };
  } catch {
    return {};
  }
}

function InvitePage() {
  const { token } = Route.useParams();
  const { user, isPending } = useCurrentUserState();
  const navigate = useNavigate();
  const [info, setInfo] = useState<{ userId: string; publicKey: string | null } | null>(null);
  const [claim, setClaim] = useState<{ n?: string; h?: string }>({});
  const [missing, setMissing] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setClaim(claimFromHash());
    let cancelled = false;
    void peekInvite({ data: { token } }).then((row) => {
      if (cancelled) return;
      if (!row) setMissing(true);
      else setInfo(row);
    });
    return () => {
      cancelled = true;
    };
  }, [token]);

  if (isPending) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Atmosphere />
        <HavenMark subtitle="Opening invite…" />
      </div>
    );
  }
  if (!user) return <RedirectToSignIn />;

  async function accept() {
    if (!info) return;
    setBusy(true);
    try {
      const accepted = await acceptInviteLink({ data: { token } });
      const payload = {
        userId: accepted.userId,
        publicKey: accepted.publicKey ?? info.publicKey,
        handle: claim.h || "friend",
        displayName: claim.n || claim.h || "Friend",
      };
      sessionStorage.setItem(PENDING_INVITE_KEY, JSON.stringify(payload));
      toast(`You’re connected with ${payload.displayName}`);
      await navigate({ to: "/" });
    } catch (err) {
      toast(err instanceof Error ? err.message : "Invite expired");
      setBusy(false);
    }
  }

  const title = claim.n || "Someone";
  const handle = claim.h;

  return (
    <div className="haven-bg flex min-h-dvh flex-col items-center justify-center px-6">
      <Atmosphere />
      <HavenMark subtitle="Private video for the people you love." />
      <div className="glass mt-10 w-full max-w-sm rounded-3xl p-6 text-center">
        {missing ? (
          <p className="text-sm text-mist">This invite is gone or already used.</p>
        ) : info ? (
          <>
            <p className="text-lg font-medium">{title}</p>
            <p className="mt-1 text-sm text-mute">
              {handle ? `@${handle} invited you to Haven` : "Invited you to Haven"}
            </p>
            <Button className="mt-5 w-full" disabled={busy} onClick={() => void accept()}>
              Accept invite
            </Button>
          </>
        ) : (
          <p className="text-sm text-mute">Looking up this invite…</p>
        )}
      </div>
    </div>
  );
}
