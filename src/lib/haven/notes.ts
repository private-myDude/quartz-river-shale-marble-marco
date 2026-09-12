import { sealToKv, unsealFromKv } from "./sealed";

const NOTES_KEY = "thread-notes";

export type ThreadNote = {
  peerId: string;
  text: string;
  updatedAt: number;
};

type NotesMap = Record<string, ThreadNote>;

async function loadAll(): Promise<NotesMap> {
  return (await unsealFromKv<NotesMap>(NOTES_KEY)) ?? {};
}

export async function getNote(peerId: string): Promise<ThreadNote | null> {
  const all = await loadAll();
  return all[peerId] ?? null;
}

export async function saveNote(peerId: string, text: string): Promise<ThreadNote> {
  const all = await loadAll();
  const note: ThreadNote = { peerId, text, updatedAt: Date.now() };
  if (!text.trim()) {
    delete all[peerId];
  } else {
    all[peerId] = note;
  }
  await sealToKv(NOTES_KEY, all);
  return note;
}

export async function clearNote(peerId: string): Promise<void> {
  const all = await loadAll();
  if (!(peerId in all)) return;
  delete all[peerId];
  await sealToKv(NOTES_KEY, all);
}
