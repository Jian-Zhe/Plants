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
      const payload = {
        ...plant,
        userId: userUid,
        updatedAt: plant.updatedAt || new Date().toISOString(),
      };
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

      // Update local storage/IndexedDB cache
      try {
        const idb = await openDB();
        const tx = idb.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        for (const p of cloudPlants) {
          store.put(p);
        }
      } catch (e) {
        console.warn('Failed caching cloud plants into IDB:', e);
      }
      saveLocalPlants(cloudPlants);

      onUpdate(cloudPlants);
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, collectionPath);
    }
  );
}

// Upload existing local plants to cloud upon user login
export async function syncLocalPlantsToCloud(userUid: string, localPlants: PlantItem[]): Promise<number> {
  if (!userUid || localPlants.length === 0) return 0;

  try {
    const collectionPath = `users/${userUid}/plants`;
    const existingSnap = await getDocs(collection(db, 'users', userUid, 'plants'));
    const existingIds = new Set(existingSnap.docs.map((d) => d.id));

    let uploadedCount = 0;
    const batch = writeBatch(db);

    for (const plant of localPlants) {
      if (!existingIds.has(plant.id)) {
        const docRef = doc(db, 'users', userUid, 'plants', plant.id);
        batch.set(docRef, {
          ...plant,
          userId: userUid,
          updatedAt: plant.updatedAt || new Date().toISOString(),
        });
        uploadedCount++;
      }
    }

    if (uploadedCount > 0) {
      await batch.commit();
    }
    return uploadedCount;
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

// Import plants from JSON (works for both local and cloud modes)
export async function importPlantsJSON(
  jsonString: string,
  userUid?: string | null
): Promise<number> {
  try {
    const parsed = JSON.parse(jsonString);
    const plantList: PlantItem[] = Array.isArray(parsed) ? parsed : parsed.data;
    if (!Array.isArray(plantList)) {
      throw new Error('格式錯誤：無法讀取植物清單陣列');
    }

    // 1. Save to local IndexedDB
    const idb = await openDB();
    const tx = idb.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    for (const p of plantList) {
      if (p.id && p.name) {
        store.put(p);
      }
    }

    saveLocalPlants(plantList);

    // 2. If logged in, also sync all imported plants into Firestore
    if (userUid && plantList.length > 0) {
      const batch = writeBatch(db);
      for (const p of plantList) {
        if (p.id && p.name) {
          const docRef = doc(db, 'users', userUid, 'plants', p.id);
          batch.set(docRef, {
            ...p,
            userId: userUid,
            updatedAt: p.updatedAt || new Date().toISOString(),
          });
        }
      }
      await batch.commit();
    }

    return plantList.length;
  } catch (err) {
    throw new Error('匯入失敗：' + (err instanceof Error ? err.message : String(err)));
  }
}
