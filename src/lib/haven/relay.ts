/**
 * Sealed mailbox adapter.
 * Ciphertext only. Haven cannot open envelopes. No plaintext logs.
 */
import {
  pickupEnvelope,
  publishEnvelope,
  shredEnvelope,
  shredMyEnvelopes,
} from "./api";
import { outgoingIds, rememberOutgoing } from "./graph-local";
import type { EnvelopePayload, TtlMode } from "./types";
import { readPrefs } from "./prefs";

export type OutgoingSeal = {
  recipientId: string;
  ttlMode: TtlMode;
  expiresAt: string | null;
  wrappedKey: string;
  iv: string;
  ciphertext: string;
  poster: string | null;
  groupId?: string | null;
  /** Wake the recipient's phone with a push notification (clips only). */
  notify?: boolean;
};

export async function relayPublish(seal: OutgoingSeal): Promise<{ id: string }> {
  const { groupId: _groupId, ...mailbox } = seal;
  const result = await publishEnvelope({ data: mailbox });
  try {
    await rememberOutgoing(result.id);
  } catch {
    /* vault may be locked; shred-mine still clears inbox */
  }
  return result;
}

export async function relayPickup(id: string): Promise<EnvelopePayload | null> {
  const retain = readPrefs().relayMode === "until-expiry";
  return pickupEnvelope({ data: { id, retain } });
}

export async function relayShred(id: string): Promise<void> {
  await shredEnvelope({ data: { id } });
}

export async function relayShredMine(): Promise<{ removed: number }> {
  let ids: string[] = [];
  try {
    ids = await outgoingIds();
  } catch {
    ids = [];
  }
  return shredMyEnvelopes({ data: { ids } });
}
