// IndexedDB-backed queue for report submissions made while offline.
// Each pending report stores the structured RPC payload + media blobs so
// it can be replayed once connectivity is restored.

import { openDB, type IDBPDatabase } from "idb";

export type PendingMedia = {
  id: string;
  kind: "image" | "video" | "audio";
  blob: Blob;
  filename: string;
  mimeType: string;
};

export type PendingReport = {
  id: string; // local uuid
  trackingCode: string;
  payload: {
    _tracking_code: string;
    _category: string;
    _agency: string;
    _language: string;
    _description: string;
    _contact_name: string;
    _contact_phone: string;
    _contact_email: string;
    _latitude?: number;
    _longitude?: number;
    _region: string;
    _town: string;
  };
  media: PendingMedia[];
  createdAt: number;
  attempts: number;
  lastError?: string;
};

const DB_NAME = "child-voice-gm-offline";
const DB_VERSION = 1;
const STORE = "pending-reports";

let _dbPromise: Promise<IDBPDatabase> | null = null;
function db() {
  if (!_dbPromise) {
    _dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(database) {
        if (!database.objectStoreNames.contains(STORE)) {
          database.createObjectStore(STORE, { keyPath: "id" });
        }
      },
    });
  }
  return _dbPromise;
}

export async function enqueueReport(report: PendingReport): Promise<void> {
  const d = await db();
  await d.put(STORE, report);
}

export async function listPending(): Promise<PendingReport[]> {
  const d = await db();
  return (await d.getAll(STORE)) as PendingReport[];
}

export async function removePending(id: string): Promise<void> {
  const d = await db();
  await d.delete(STORE, id);
}

export async function updatePending(report: PendingReport): Promise<void> {
  const d = await db();
  await d.put(STORE, report);
}

export async function countPending(): Promise<number> {
  const d = await db();
  return d.count(STORE);
}
