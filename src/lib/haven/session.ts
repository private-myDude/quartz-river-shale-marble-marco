import { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { authEnabled } from "@/lib/auth/client";
import { ensureProfile, listInbox, updateProfile } from "./api";
import { hashHandle } from "./contacts";
import {
  consumePendingInvite,
  loadCircles,
  loadFriends,
  loadIdentity,
  saveIdentity,
  suggestHandle,
  type LocalIdentity,
} from "./graph-local";
import {
  bootstrapVault,
  getLockConfig,
  isUnlocked,
  lockSession,
  type LockConfig,
} from "./lock";
import { ingestIncomingEnvelope, sweepExpired, allVideos } from "./vault";
import { relayPickup } from "./relay";
import { isPlayable, type Circle, type Friend, type Profile, type StoredVideo } from "./types";
import { readPrefs, setPrefs } from "./prefs";
import { writeBackupToFolder } from "./cloud";
import { flushOutbox } from "./outbox";
import { notifyNewClip, registerHavenWorker } from "./notify";
import { shredPeerCopies } from "./signal";
import { clearSignupName, readSignupName } from "./signup-name";

async function ensureLocalIdentity(fallbackName: string): Promise<LocalIdentity> {
  let ident = await loadIdentity();
  if (!ident.handle) {
    ident = {
      handle: suggestHandle(fallbackName || "haven"),
      displayName: ident.displayName || fallbackName || "You",
    };
    await saveIdentity(ident);
  } else if (!ident.displayName) {
    ident = { ...ident, displayName: fallbackName || "You" };
    await saveIdentity(ident);
  }
  await ensureProfile({ data: { handleHash: await hashHandle(ident.handle) } });
  return ident;
}

export function useHavenSession() {
  const { user, isPending } = useCurrentUserState();
  const qc = useQueryClient();
  const [lock, setLock] = useState<LockConfig | null>(null);
  const [unlocked, setUnlocked] = useState(false);
  const [vaultError, setVaultError] = useState<string | null>(null);
  const [lockKnown, setLockKnown] = useState(false);
  const [videos, setVideos] = useState<StoredVideo[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [circles, setCircles] = useState<Circle[]>([]);
  const [identity, setIdentity] = useState<LocalIdentity>({ handle: "", displayName: "" });

  const refreshLock = useCallback(async () => {
    try {
      const cfg = await getLockConfig();
      setLock(cfg);
      setUnlocked(isUnlocked());
    } finally {
      setLockKnown(true);
    }
  }, []);

  const refreshVideos = useCallback(async () => {
    if (!isUnlocked()) {
      setVideos([]);
      return;
    }
    const gone = await sweepExpired();
    if (gone.length && user?.id) void shredPeerCopies(gone, user.id);
    setVideos(await allVideos());
    if (readPrefs().cloudTarget !== "device") {
      void writeBackupToFolder().catch(() => undefined);
    }
  }, [user?.id]);

  const refreshGraph = useCallback(async () => {
    if (!isUnlocked()) {
      setFriends([]);
      setCircles([]);
      return;
    }
    await consumePendingInvite();
    const [nextFriends, nextCircles, ident] = await Promise.all([
      loadFriends(),
      loadCircles(),
      loadIdentity(),
    ]);
    setFriends(nextFriends);
    setCircles(nextCircles);
    if (ident.handle) setIdentity(ident);
  }, []);

  useEffect(() => {
    void refreshLock();
  }, [refreshLock]);

  const profileQuery = useQuery({
    queryKey: ["haven", "profile", user?.id],
    enabled: !!user && !isPending,
    queryFn: async () => {
      const publicKey = isUnlocked() ? (await import("./lock")).getSessionKeys().publicKey : undefined;
      const profile = await ensureProfile({
        data: {
          publicKey,
          setupComplete: authEnabled ? undefined : true,
        },
      });
      return profile;
    },
  });

  useEffect(() => {
    const p = profileQuery.data;
    if (!p) return;
    setPrefs({
      allowSave: p.allowSave,
      sendReceipts: p.sendReceipts,
      discovery: p.discovery,
    });
  }, [profileQuery.data]);

  const inboxQuery = useQuery({
    queryKey: ["haven", "inbox", user?.id],
    enabled: !!user && !isPending && unlocked,
    queryFn: () => listInbox(),
    refetchInterval: 8_000,
  });

  useEffect(() => {
    if (!unlocked || !inboxQuery.data?.length || !user) return;
    let cancelled = false;
    (async () => {
      let newClips = 0;
      for (const item of inboxQuery.data) {
        try {
          const payload = await relayPickup(item.id);
          if (!payload || cancelled) continue;
          const stored = await ingestIncomingEnvelope({
            id: payload.id,
            senderId: payload.senderId,
            recipientId: user.id,
            wrappedKey: payload.wrappedKey,
            iv: payload.iv,
            ciphertext: payload.ciphertext,
            poster: payload.poster,
            ttlMode: payload.ttlMode,
            createdAt: Date.parse(payload.createdAt) || Date.now(),
          });
          if (stored && isPlayable(stored.kind)) newClips += 1;
        } catch {
          /* pickup is best-effort; next poll retries */
        }
      }
      if (!cancelled) {
        await refreshVideos();
        await refreshGraph();
        await qc.invalidateQueries({ queryKey: ["haven", "inbox"] });
        if (newClips && typeof document !== "undefined" && document.hidden) {
          void notifyNewClip(newClips === 1 ? "New clip in Haven" : `${newClips} new clips in Haven`);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [inboxQuery.data, unlocked, user, refreshVideos, refreshGraph, qc]);

  useEffect(() => {
    if (!unlocked) return;
    void refreshVideos();
    void refreshGraph();
  }, [unlocked, refreshVideos, refreshGraph]);

  useEffect(() => {
    if (!unlocked) return;
    if (readPrefs().notifications) void registerHavenWorker();
    void flushOutbox();
    const onOnline = () => void flushOutbox();
    window.addEventListener("online", onOnline);
    return () => window.removeEventListener("online", onOnline);
  }, [unlocked]);

  useEffect(() => {
    let timer: number | undefined;
    const onVis = () => {
      if (!(lock?.hasPasscode || lock?.hasBiometric)) return;
      if (document.visibilityState === "hidden") {
        timer = window.setTimeout(() => {
          lockSession();
          setUnlocked(false);
        }, 15_000);
      } else if (timer) {
        window.clearTimeout(timer);
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      if (timer) window.clearTimeout(timer);
    };
  }, [lock]);

  const openVault = useCallback(async () => {
    setVaultError(null);
    try {
      const publicKey = await bootstrapVault();
      setUnlocked(true);
      const fallback = authEnabled
        ? (readSignupName() || user?.displayName || user?.primaryEmail?.split("@")[0] || "Friend")
        : "You";
      const ident = await ensureLocalIdentity(fallback);
      clearSignupName();
      setIdentity(ident);
      await ensureProfile({ data: { publicKey, handleHash: await hashHandle(ident.handle) } });
      await qc.invalidateQueries({ queryKey: ["haven", "profile"] });
      await refreshVideos();
      await refreshGraph();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not open vault";
      if (message === "LOCKED") {
        setUnlocked(false);
        return;
      }
      setVaultError(message);
    }
  }, [profileQuery.data, qc, refreshVideos, refreshGraph, user]);

  useEffect(() => {
    if (!user || isPending) return;
    if (lock?.hasPasscode || lock?.hasBiometric) return;
    void openVault();
  }, [user, isPending, lock, openVault]);

  const latest = useMemo(() => {
    const map: Record<string, StoredVideo> = {};
    for (const row of videos) {
      const prev = map[row.peerId];
      if (!prev || row.createdAt > prev.createdAt) map[row.peerId] = row;
    }
    return map;
  }, [videos]);

  const profile = useMemo(() => {
    const p = profileQuery.data as Profile | undefined;
    if (!p) return undefined;
    return {
      ...p,
      handle: identity.handle || p.handle || "you",
      displayName: identity.displayName || p.displayName || "You",
    };
  }, [profileQuery.data, identity]);

  const needsLock = Boolean(lock?.hasPasscode || lock?.hasBiometric) && !unlocked;

  return {
    user,
    isPending,
    profile,
    profileLoading: profileQuery.isPending,
    friends,
    friendsLoading: false,
    circles,
    inbox: inboxQuery.data ?? [],
    lock,
    lockKnown,
    needsLock,
    unlocked,
    vaultError,
    videos,
    latest,
    latestByPeer: latest,
    refreshLock,
    refreshVideos,
    openVault,
    setUnlocked,
    invalidate: () => {
      void qc.invalidateQueries({ queryKey: ["haven"] });
      void refreshGraph();
    },
  };
}

export type HavenSession = ReturnType<typeof useHavenSession>;
