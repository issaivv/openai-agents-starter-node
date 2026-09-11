/**
 * Local UI history snapshot store (IndexedDB).
 *
 * Stores lightweight Message[] snapshots per conversationId so the chat UI can
 * restore immediately on page load while backend /history is still pending.
 */

import type { Message } from '../types';

const DB_NAME = 'chat-ui-store-db';
const DB_VERSION = 1;
const STORE_NAME = 'snapshots';

interface SnapshotRecord {
  conversationId: string;
  messages: Message[];
  updatedAt: number;
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'conversationId' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveSnapshot(conversationId: string, messages: Message[]): Promise<void> {
  const record: SnapshotRecord = {
    conversationId,
    messages,
    updatedAt: Date.now(),
  };

  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(record);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function loadSnapshot(conversationId: string): Promise<Message[]> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const req = tx.objectStore(STORE_NAME).get(conversationId);
    req.onsuccess = () => {
      const record = req.result as SnapshotRecord | undefined;
      resolve(record?.messages ?? []);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function deleteSnapshot(conversationId: string): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(conversationId);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
