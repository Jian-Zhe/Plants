import { PlantItem } from '../types/plant';
import { INITIAL_PLANTS } from '../data/plantPresets';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  writeBatch,
  getDocs,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';

const DB_NAME = 'BotanicaLogDB';
const DB_VERSION = 1;
const STORE_NAME = 'plants';
const LOCAL_STORAGE_BACKUP_KEY = 'botanicalog_plants_v1';
const PRESETS_CLEARED_FLAG = 'botanicalog_preset_deleted_v1';

// Open or initialize IndexedDB
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const idb = (event.target as IDBOpenDBRequest).result;
      if (!idb.objectStoreNames.contains(STORE_NAME)) {
        const store = idb.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('family', 'family', { unique: false });
        store.createIndex('updatedAt', 'updatedAt', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Fallback localStorage operations
function getLocalPlants(): PlantItem[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_BACKUP_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed reading localStorage', err);
    return [];
  }
}

function saveLocalPlants(plants: PlantItem[]) {
  try {
    const safeCopy = plants.map((p) => ({
      ...p,
      images: p.images.slice(0, 3).map((img) => ({
        ...img,
        dataUrl: img.dataUrl.length > 300000 ? img.dataUrl.substring(0, 100) + '...[IDB_ONLY]' : img.dataUrl,
      })),
    }));
    localStorage.setItem(LOCAL_STORAGE_BACKUP_KEY, JSON.stringify(safeCopy));
  } catch (err) {
    console.warn('LocalStorage backup quota reached (IndexedDB holds full data)', err);
  }
}

// Load all plants from local cache/IndexedDB
export async function getAllPlants(): Promise<PlantItem[]> {
  try {
    const idb = await openDB();
    const hasPurgedPresets = typeof window !== 'undefined' ? localStorage.getItem(PRESETS_CLEARED_FLAG) : 'true';

    return new Promise((resolve) => {
      const tx = idb.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();

      req.onsuccess = async () => {
        let list = (req.result as PlantItem[]) || [];

        // If user requested to delete presets or on first load with presets
        if (!hasPurgedPresets) {
          const userOnly = list.filter((p) => !p.id.startsWith('preset-'));
          for (const item of list) {
            if (item.id.startsWith('preset-')) {
              store.delete(item.id);
            }
          }
          saveLocalPlants(userOnly);
          localStorage.setItem(PRESETS_CLEARED_FLAG, 'true');
          list = userOnly;
        }

        resolve(list);
      };

      req.onerror = () => {
        const fallback = getLocalPlants().filter((p) => !p.id.startsWith('preset-'));
        resolve(fallback);
      };
    });
  } catch (err) {
    console.warn('IndexedDB unavailable, falling back to LocalStorage', err);
    const fallback = getLocalPlants().filter((p) => !p.id.startsWith('preset-'));
    return fallback;
  }
}

// Deeply strip undefined values to prevent Firestore unsupported field value: undefined errors
function stripUndefined<T>(obj: T): T {
  if (obj === null || obj === undefined || typeof obj !== 'object') {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(stripUndefined) as unknown as T;
  }
  const clean: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      clean[key] = stripUndefined(value);
    }
  }
  return clean as T;
}

// Save or update single plant (to Local IndexedDB + optional Firebase Cloud)
export async function savePlant(plant: PlantItem, userUid?: string | null): Promise<void> {
  // 1. Save to local IndexedDB
  try {
    const idb = await openDB();
    const tx = idb.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put(plant);
  } catch (err) {
    console.warn('Error saving to IndexedDB', err);
  }

  // Also sync to localStorage
  const current = getLocalPlants().filter((p) => p.id !== plant.id);
  current.unshift(plant);
  saveLocalPlants(current);

  // 2. If logged in with Firebase, sync to Firestore
  if (userUid) {
    const docPath = `users/${userUid}/plants/${plant.id}`;
    try {
      const payload = stripUndefined({
        ...plant,
        userId: userUid,
        updatedAt: plant.updatedAt || new Date().toISOString(),
      });
      await setDoc(doc(db, 'users', userUid, 'plants', plant.id), payload);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, docPath);
    }
  }
}

// Delete single plant (from Local + optional Firebase Cloud)
export async function deletePlant(id: string, userUid?: string | null): Promise<void> {
  try {
    const idb = await openDB();
    const tx = idb.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.delete(id);
  } catch (err) {
    console.warn('Error deleting from IndexedDB', err);
  }

  const current = getLocalPlants().filter((p) => p.id !== id);
  saveLocalPlants(current);

  if (userUid) {
    const docPath = `users/${userUid}/plants/${id}`;
    try {
      await deleteDoc(doc(db, 'users', userUid, 'plants', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, docPath);
    }
  }
}

// Helper to deduplicate image arrays
function deduplicateImages(images?: PlantItem['images']): PlantItem['images'] {
  if (!images || !Array.isArray(images)) return [];
  const seen = new Set<string>();
  const res: PlantItem['images'] = [];
  for (const img of images) {
    if (!img || !img.dataUrl) continue;
    const key = img.id || img.dataUrl.slice(0, 100);
    if (!seen.has(key)) {
      seen.add(key);
      res.push(img);
    }
  }
  return res;
}

// Subscribe to real-time changes in Firestore when user is logged in
export function subscribeToCloudPlants(
  userUid: string,
  onUpdate: (plants: PlantItem[]) => void
): () => void {
  const collectionPath = `users/${userUid}/plants`;
  const plantsCol = collection(db, 'users', userUid, 'plants');

  return onSnapshot(
    plantsCol,
    async (snapshot) => {
      const cloudPlants: PlantItem[] = [];
      snapshot.forEach((d) => {
        cloudPlants.push(d.data() as PlantItem);
      });

      // Update local storage/IndexedDB cache, respecting local offline newer updates
      try {
        const idb = await openDB();
        const tx = idb.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const localReq = store.getAll();

        localReq.onsuccess = () => {
          const localList = (localReq.result as PlantItem[]) || [];
          const localMap = new Map(localList.map((p) => [p.id, p]));
          const localByName = new Map(localList.map((p) => [p.name?.trim().toLowerCase(), p]));

          const finalMerged: PlantItem[] = [];
          const processedLocalIds = new Set<string>();

          for (const cp of cloudPlants) {
            const lp = localMap.get(cp.id) || localByName.get(cp.name?.trim().toLowerCase());
            if (lp) {
              processedLocalIds.add(lp.id);
              const localTime = new Date(lp.updatedAt || lp.createdAt || 0).getTime();
              const cloudTime = new Date(cp.updatedAt || cp.createdAt || 0).getTime();

              // If local update is newer than cloud (edited offline), keep local version until sync uploads it!
              if (localTime > cloudTime) {
                finalMerged.push(lp);
                store.put(lp);
                continue;
              }
            }
            finalMerged.push(cp);
            store.put(cp);
          }

          // Retain any offline plants created that haven't been pushed to the cloud yet
          for (const lp of localList) {
            if (!processedLocalIds.has(lp.id)) {
              finalMerged.push(lp);
            }
          }

          saveLocalPlants(finalMerged);
          onUpdate(finalMerged);
        };

        localReq.onerror = () => {
          saveLocalPlants(cloudPlants);
          onUpdate(cloudPlants);
        };
      } catch (e) {
        console.warn('Failed caching cloud plants into IDB:', e);
        saveLocalPlants(cloudPlants);
        onUpdate(cloudPlants);
      }
    },
    (err) => {
      console.warn('Firestore plants subscription error/offline:', err);
    }
  );
}

// Upload existing local plants to cloud upon user login (Timestamp-aware Last-Write-Wins)
export async function syncLocalPlantsToCloud(userUid: string, localPlants: PlantItem[]): Promise<number> {
  if (!userUid || localPlants.length === 0) return 0;

  try {
    const existingSnap = await getDocs(collection(db, 'users', userUid, 'plants'));
    const cloudDocs = existingSnap.docs;
    const cloudById = new Map<string, PlantItem>();
    const cloudByName = new Map<string, { id: string; plant: PlantItem }>();

    for (const d of cloudDocs) {
      const p = d.data() as PlantItem;
      cloudById.set(d.id, p);
      if (p.name) {
        cloudByName.set(p.name.trim().toLowerCase(), { id: d.id, plant: p });
      }
    }

    let syncedCount = 0;
    const batch = writeBatch(db);

    for (const plant of localPlants) {
      if (!plant.name) continue;
      const cleanName = plant.name.trim().toLowerCase();
      const matchById = cloudById.get(plant.id);
      const matchByName = cloudByName.get(cleanName);
      const cloudMatch = matchById || matchByName?.plant;
      const targetDocId = matchById ? plant.id : matchByName ? matchByName.id : plant.id;

      if (!cloudMatch) {
        // Brand new local plant created offline: upload to cloud
        const docRef = doc(db, 'users', userUid, 'plants', targetDocId);
        batch.set(docRef, stripUndefined({
          ...plant,
          id: targetDocId,
          userId: userUid,
          updatedAt: plant.updatedAt || new Date().toISOString(),
        }));
        syncedCount++;
      } else {
        // Plant exists: compare timestamps
        const localTime = new Date(plant.updatedAt || plant.createdAt || 0).getTime();
        const cloudTime = new Date(cloudMatch.updatedAt || cloudMatch.createdAt || 0).getTime();

        // If local update is newer than cloud (edited offline!), push the local update to cloud!
        if (localTime > cloudTime) {
          const docRef = doc(db, 'users', userUid, 'plants', targetDocId);
          batch.set(docRef, stripUndefined({
            ...plant,
            id: targetDocId,
            userId: userUid,
            updatedAt: plant.updatedAt || new Date().toISOString(),
          }), { merge: true });
          syncedCount++;
        }
      }
    }

    if (syncedCount > 0) {
      await batch.commit();
    }
    return syncedCount;
  } catch (err) {
    console.error('Error syncing local plants to cloud:', err);
    return 0;
  }
}

// Clear all plants completely
export async function clearAllPlants(userUid?: string | null): Promise<void> {
  try {
    const idb = await openDB();
    const tx = idb.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.clear();
  } catch (err) {
    console.warn('Error clearing IndexedDB', err);
  }

  localStorage.removeItem(LOCAL_STORAGE_BACKUP_KEY);
  localStorage.setItem(PRESETS_CLEARED_FLAG, 'true');

  if (userUid) {
    try {
      const snap = await getDocs(collection(db, 'users', userUid, 'plants'));
      const batch = writeBatch(db);
      snap.forEach((d) => batch.delete(d.ref));
      await batch.commit();
    } catch (err) {
      console.error('Error clearing cloud plants', err);
    }
  }
}

// Delete only preset plants (leaving user custom entries)
export async function deletePresetPlantsOnly(userUid?: string | null): Promise<PlantItem[]> {
  const current = await getAllPlants();
  const remaining = current.filter((p) => !p.id.startsWith('preset-'));

  try {
    const idb = await openDB();
    const tx = idb.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    for (const p of current) {
      if (p.id.startsWith('preset-')) {
        store.delete(p.id);
      }
    }
  } catch (err) {
    console.warn('Error deleting presets from IDB', err);
  }

  saveLocalPlants(remaining);
  localStorage.setItem(PRESETS_CLEARED_FLAG, 'true');

  if (userUid) {
    try {
      const snap = await getDocs(collection(db, 'users', userUid, 'plants'));
      const batch = writeBatch(db);
      snap.forEach((d) => {
        if (d.id.startsWith('preset-')) {
          batch.delete(d.ref);
        }
      });
      await batch.commit();
    } catch (err) {
      console.error('Error deleting presets from cloud', err);
    }
  }

  return remaining;
}

// Load default 18 preset plants
export async function loadDefaultPresets(userUid?: string | null): Promise<PlantItem[]> {
  const current = await getAllPlants();
  const existingMap = new Map(current.map((p) => [p.id, p]));

  for (const preset of INITIAL_PLANTS) {
    existingMap.set(preset.id, preset);
  }

  const combined = Array.from(existingMap.values());

  try {
    const idb = await openDB();
    const tx = idb.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    for (const preset of INITIAL_PLANTS) {
      store.put(preset);
    }
  } catch (err) {
    console.warn('Error loading presets to IDB', err);
  }

  saveLocalPlants(combined);
  localStorage.removeItem(PRESETS_CLEARED_FLAG);

  if (userUid) {
    try {
      const batch = writeBatch(db);
      for (const preset of INITIAL_PLANTS) {
        const docRef = doc(db, 'users', userUid, 'plants', preset.id);
        batch.set(docRef, {
          ...preset,
          userId: userUid,
          updatedAt: new Date().toISOString(),
        });
      }
      await batch.commit();
    } catch (err) {
      console.error('Error loading presets to cloud', err);
    }
  }

  return combined;
}

// Export all plants to JSON string (compatible with original format)
export async function exportPlantsJSON(currentPlants?: PlantItem[]): Promise<string> {
  const plants = currentPlants || (await getAllPlants());
  return JSON.stringify(
    {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      plantCount: plants.length,
      data: plants,
    },
    null,
    2
  );
}

// Import plants from JSON with intelligent deduplication by name and ID
export async function importPlantsJSON(
  jsonString: string,
  userUid?: string | null
): Promise<{ added: number; updated: number; total: number }> {
  try {
    const parsed = JSON.parse(jsonString);
    const incomingList: PlantItem[] = Array.isArray(parsed) ? parsed : parsed.data;
    if (!Array.isArray(incomingList)) {
      throw new Error('格式錯誤：無法讀取植物清單陣列');
    }

    // 1. Get all current existing plants (from IndexedDB / cache)
    const currentList = await getAllPlants();
    const existingById = new Map<string, PlantItem>();
    const existingByName = new Map<string, PlantItem>();

    for (const p of currentList) {
      if (p.id) existingById.set(p.id, p);
      if (p.name) existingByName.set(p.name.trim().toLowerCase(), p);
    }

    let addedCount = 0;
    let updatedCount = 0;
    const finalMap = new Map<string, PlantItem>();
    // Pre-populate with existing plants
    for (const p of currentList) {
      finalMap.set(p.id, p);
    }

    const cloudBatchOps: PlantItem[] = [];

    for (const incoming of incomingList) {
      if (!incoming || !incoming.name) continue;
      const cleanName = incoming.name.trim().toLowerCase();

      // Check match by ID or by normalized botanical name
      const matched = existingById.get(incoming.id) || existingByName.get(cleanName);

      if (matched) {
        // Exists: MERGE and update existing record (keep matched.id to prevent creating duplicate ID!)
        const incomingTime = new Date(incoming.updatedAt || incoming.createdAt || 0).getTime();
        const matchedTime = new Date(matched.updatedAt || matched.createdAt || 0).getTime();

        const merged: PlantItem = {
          ...matched,
          ...incoming,
          id: matched.id, // Retain original ID so we never create a duplicate document!
          images: deduplicateImages([...(incoming.images || []), ...(matched.images || [])]),
          updatedAt: incomingTime >= matchedTime ? (incoming.updatedAt || new Date().toISOString()) : matched.updatedAt,
        };

        finalMap.set(matched.id, merged);
        existingByName.set(cleanName, merged);
        cloudBatchOps.push(merged);
        updatedCount++;
      } else {
        // Brand new plant: ensure valid unique ID
        const newId = incoming.id || `plant-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        const fresh: PlantItem = {
          ...incoming,
          id: newId,
          images: deduplicateImages(incoming.images),
          updatedAt: incoming.updatedAt || new Date().toISOString(),
        };
        finalMap.set(newId, fresh);
        existingById.set(newId, fresh);
        existingByName.set(cleanName, fresh);
        cloudBatchOps.push(fresh);
        addedCount++;
      }
    }

    const mergedList = Array.from(finalMap.values());

    // 2. Write to local IndexedDB
    try {
      const idb = await openDB();
      const tx = idb.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      for (const p of mergedList) {
        store.put(p);
      }
    } catch (err) {
      console.warn('IDB write error on import:', err);
    }

    saveLocalPlants(mergedList);

    // 3. If logged in with Firebase, sync updated & added plants to Firestore
    if (userUid && cloudBatchOps.length > 0) {
      const chunkSize = 400;
      for (let i = 0; i < cloudBatchOps.length; i += chunkSize) {
        const chunk = cloudBatchOps.slice(i, i + chunkSize);
        const batch = writeBatch(db);
        for (const p of chunk) {
          const docRef = doc(db, 'users', userUid, 'plants', p.id);
          batch.set(docRef, stripUndefined({
            ...p,
            userId: userUid,
            updatedAt: p.updatedAt || new Date().toISOString(),
          }), { merge: true });
        }
        await batch.commit();
      }
    }

    return { added: addedCount, updated: updatedCount, total: mergedList.length };
  } catch (err) {
    throw new Error('匯入失敗：' + (err instanceof Error ? err.message : String(err)));
  }
}

// Clean up any existing duplicates in database by matching normalized botanical name
export async function deduplicateAllPlants(userUid?: string | null): Promise<number> {
  const all = await getAllPlants();
  const nameGroups = new Map<string, PlantItem[]>();

  for (const p of all) {
    const key = (p.name || '').trim().toLowerCase();
    if (!key) continue;
    const list = nameGroups.get(key) || [];
    list.push(p);
    nameGroups.set(key, list);
  }

  const idsToDelete: string[] = [];
  const itemsToKeep: PlantItem[] = [];

  for (const [, group] of nameGroups.entries()) {
    if (group.length === 1) {
      itemsToKeep.push(group[0]);
    } else {
      // Sort: latest updatedAt or richest data first
      group.sort((a, b) => {
        const timeA = new Date(a.updatedAt || a.createdAt || 0).getTime();
        const timeB = new Date(b.updatedAt || b.createdAt || 0).getTime();
        if (timeB !== timeA) return timeB - timeA;
        return (b.images?.length || 0) - (a.images?.length || 0);
      });

      const best = group[0];
      const allImages = group.flatMap((g) => g.images || []);
      best.images = deduplicateImages(allImages);
      itemsToKeep.push(best);

      // Other IDs are marked for deletion
      for (let i = 1; i < group.length; i++) {
        idsToDelete.push(group[i].id);
      }
    }
  }

  if (idsToDelete.length === 0) return 0;

  // 1. Delete from local IndexedDB
  try {
    const idb = await openDB();
    const tx = idb.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    for (const id of idsToDelete) {
      store.delete(id);
    }
    for (const item of itemsToKeep) {
      store.put(item);
    }
  } catch (err) {
    console.warn('IDB dedup error:', err);
  }

  saveLocalPlants(itemsToKeep);

  // 2. Delete from cloud Firestore if logged in
  if (userUid && idsToDelete.length > 0) {
    try {
      const batch = writeBatch(db);
      for (const id of idsToDelete) {
        batch.delete(doc(db, 'users', userUid, 'plants', id));
      }
      await batch.commit();
    } catch (err) {
      console.warn('Cloud dedup deletion error:', err);
    }
  }

  return idsToDelete.length;
}
