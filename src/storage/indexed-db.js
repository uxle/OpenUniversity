// src/storage/indexed-db.js — generic promise-based IndexedDB helper.
// One database, one object store per domain (progress/bookmarks/notes/user),
// matching src/storage/*-storage.js.

const DB_NAME = "openuniversity";
const DB_VERSION = 1;
export const STORES = ["progress", "bookmarks", "notes", "user"];

let dbPromise = null;

export function openDB() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB is not available in this environment"));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      for (const store of STORES) {
        if (!db.objectStoreNames.contains(store)) {
          db.createObjectStore(store, { keyPath: "id" });
        }
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  return dbPromise;
}

function withStore(storeName, mode, work) {
  return openDB().then((db) => new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, mode);
    const store = tx.objectStore(storeName);
    const request = work(store);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  }));
}

export function getAll(storeName) {
  return withStore(storeName, "readonly", (store) => store.getAll());
}

export function get(storeName, id) {
  return withStore(storeName, "readonly", (store) => store.get(id));
}

export function put(storeName, record) {
  if (!record.id) throw new Error("put() requires a record with an id");
  return withStore(storeName, "readwrite", (store) => store.put(record));
}

export function remove(storeName, id) {
  return withStore(storeName, "readwrite", (store) => store.delete(id));
}

export function clearStore(storeName) {
  return withStore(storeName, "readwrite", (store) => store.clear());
}
