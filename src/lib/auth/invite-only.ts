/**
 * Invite-only sign-up, shared by the client and server.
 *
 * New accounts are allowed only for the very first user (the owner), emails
 * listed in the server's `ALLOWED_EMAILS` env var, or someone holding a valid
 * invite link. The client forwards the invite token in `INVITE_HEADER` on
 * sign-up; `server.ts` checks it before the user row is created.
 */
export const INVITE_HEADER = "x-haven-invite";

const PENDING_KEY = "haven-invite-signup";

export type PendingInvite = { token: string; returnTo: string };

/** Remember the invite a signed-out visitor opened, so sign-up can use it. */
export function rememberInvite(token: string, returnTo: string): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(PENDING_KEY, JSON.stringify({ token, returnTo }));
  } catch {
    /* storage unavailable — sign-up falls back to the allowlist */
  }
}

export function readPendingInvite(): PendingInvite | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(PENDING_KEY);
    return raw ? (JSON.parse(raw) as PendingInvite) : null;
  } catch {
    return null;
  }
}

export function clearPendingInvite(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(PENDING_KEY);
  } catch {
    /* ignore */
  }
}
