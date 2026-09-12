const DB_NAME = "haven-vault";
const DB_VERSION = 1;

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve(req.result);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains("kv")) db.createObjectStore("kv");
      if (!db.objectStoreNames.contains("videos")) {
        const videos = db.createObjectStore("videos", { keyPath: "id" });
        videos.createIndex("peerId", "peerId", { unique: false });
        videos.createIndex("createdAt", "createdAt", { unique: false });
      }
    };
  });
}

function reqToPromise<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function kvGet<T>(key: string): Promise<T | undefined> {
  const db = await openDb();
  try {
    return await reqToPromise(db.transaction("kv", "readonly").objectStore("kv").get(key));
  } finally {
    db.close();
  }
}

export async function kvSet(key: string, value: unknown): Promise<void> {
  const db = await openDb();
  try {
    await reqToPromise(db.transaction("kv", "readwrite").objectStore("kv").put(value, key));
  } finally {
    db.close();
  }
}

export async function kvDel(key: string): Promise<void> {
  const db = await openDb();
  try {
    await reqToPromise(db.transaction("kv", "readwrite").objectStore("kv").delete(key));
  } finally {
    db.close();
  }
}

export async function putVideo(video: unknown): Promise<void> {
  const db = await openDb();
  try {
    await reqToPromise(db.transaction("videos", "readwrite").objectStore("videos").put(video));
  } finally {
    db.close();
  }
}

export async function getVideo<T>(id: string): Promise<T | undefined> {
  const db = await openDb();
  try {
    return await reqToPromise(db.transaction("videos", "readonly").objectStore("videos").get(id));
  } finally {
    db.close();
  }
}

export async function deleteVideo(id: string): Promise<void> {
  const db = await openDb();
  try {
    await reqToPromise(db.transaction("videos", "readwrite").objectStore("videos").delete(id));
  } finally {
    db.close();
  }
}

export async function listVideos<T>(): Promise<T[]> {
  const db = await openDb();
  try {
    return await reqToPromise(db.transaction("videos", "readonly").objectStore("videos").getAll());
  } finally {
    db.close();
  }
}

export async function wipeVault(): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const req = indexedDB.deleteDatabase(DB_NAME);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
    req.onblocked = () => resolve();
  });
}
