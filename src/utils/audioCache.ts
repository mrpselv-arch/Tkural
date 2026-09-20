// Offline Audio Storage for Thirukkural recitation using IndexedDB
// Enables 100% offline playback of generated voice without internet

const DB_NAME = 'kural_audio_db';
const STORE_NAME = 'recitations';
const DB_VERSION = 1;

let dbPromise: Promise<IDBDatabase> | null = null;

function getDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported in this environment'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'key' });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });

  return dbPromise;
}

export interface CachedAudioEntry {
  key: string; // `${id}_${lang}`
  id: number;
  lang: string;
  blob: Blob;
  size: number;
  timestamp: number;
}

export async function getCachedAudio(id: number, lang: string = 'ta'): Promise<Blob | null> {
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const key = `${id}_${lang}`;
      const request = store.get(key);

      request.onsuccess = () => {
        if (request.result && request.result.blob) {
          resolve(request.result.blob);
        } else {
          resolve(null);
        }
      };

      request.onerror = () => {
        resolve(null);
      };
    });
  } catch {
    return null;
  }
}

export async function saveAudioToCache(id: number, lang: string, blob: Blob): Promise<void> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const key = `${id}_${lang}`;
      const entry: CachedAudioEntry = {
        key,
        id,
        lang,
        blob,
        size: blob.size,
        timestamp: Date.now(),
      };

      const request = store.put(entry);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn('Failed to cache audio in IndexedDB:', err);
  }
}

export async function isAudioCached(id: number, lang: string = 'ta'): Promise<boolean> {
  const blob = await getCachedAudio(id, lang);
  return blob !== null;
}

export async function getAllCachedIds(lang: string = 'ta'): Promise<Set<number>> {
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.getAllKeys();

      request.onsuccess = () => {
        const keys = (request.result || []) as string[];
        const ids = new Set<number>();
        for (const k of keys) {
          if (k.endsWith(`_${lang}`)) {
            const id = parseInt(k.split('_')[0], 10);
            if (!isNaN(id)) ids.add(id);
          }
        }
        resolve(ids);
      };

      request.onerror = () => resolve(new Set());
    });
  } catch {
    return new Set();
  }
}

export async function clearAudioCache(): Promise<void> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch {
    // ignore
  }
}
