import { APIError } from "better-auth/api";
import { getSql } from "../db";
import { INVITE_HEADER } from "./invite-only";

/** Emails the owner pre-approved via the `ALLOWED_EMAILS` env var (comma-separated). */
function allowedEmails(): string[] {
  return (process.env.ALLOWED_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Throws unless this sign-up is allowed: the first account (the owner), an
 * allowlisted email, or a request carrying a valid invite token.
 */
export async function assertMayCreateAccount(
  email: string,
  headers: Headers | undefined,
): Promise<void> {
  const sql = await getSql();
  const [{ count }] = await sql<{ count: number }>`select count(*)::int as count from "user"`;
  if (count === 0) return;
  if (allowedEmails().includes(email.trim().toLowerCase())) return;
  const token = headers?.get(INVITE_HEADER)?.trim();
  if (token) {
    const rows = await sql`select 1 from invites where token = ${token} limit 1`;
    if (rows.length) return;
  }
  throw new APIError("FORBIDDEN", {
    message: "Haven is invite-only. Ask someone in your family for an invite link.",
  });
}
