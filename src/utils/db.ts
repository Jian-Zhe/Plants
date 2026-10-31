import { PlantItem } from '../types/plant';
import { INITIAL_PLANTS } from '../data/plantPresets';

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
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
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

// Load all plants (presets are deleted, starts empty for user's own plants)
export async function getAllPlants(): Promise<PlantItem[]> {
  try {
    const db = await openDB();

    // Check if we need to purge default presets from existing local database
    const hasPurgedPresets = typeof window !== 'undefined' ? localStorage.getItem(PRESETS_CLEARED_FLAG) : 'true';

    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();

      req.onsuccess = async () => {
        let list = (req.result as PlantItem[]) || [];

        // If user requested to delete presets or on first load with presets
        if (!hasPurgedPresets) {
          // Remove all preset-* items from IndexedDB
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

// Save or update single plant
export async function savePlant(plant: PlantItem): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put(plant);
  } catch (err) {
    console.warn('Error saving to IndexedDB', err);
  }

  // Also sync to localStorage
  const current = getLocalPlants().filter((p) => p.id !== plant.id);
  current.unshift(plant);
  saveLocalPlants(current);
}

// Delete single plant
export async function deletePlant(id: string): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.delete(id);
  } catch (err) {
    console.warn('Error deleting from IndexedDB', err);
  }

  const current = getLocalPlants().filter((p) => p.id !== id);
  saveLocalPlants(current);
}

// Clear all plants completely
export async function clearAllPlants(): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.clear();
  } catch (err) {
    console.warn('Error clearing IndexedDB', err);
  }

  localStorage.removeItem(LOCAL_STORAGE_BACKUP_KEY);
  localStorage.setItem(PRESETS_CLEARED_FLAG, 'true');
}

// Delete preset default plants only
export async function deletePresetPlantsOnly(): Promise<PlantItem[]> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.getAll();

    return new Promise((resolve) => {
      req.onsuccess = () => {
        const list = (req.result as PlantItem[]) || [];
        const kept = list.filter((p) => !p.id.startsWith('preset-'));
        for (const item of list) {
          if (item.id.startsWith('preset-')) {
            store.delete(item.id);
          }
        }
        saveLocalPlants(kept);
        localStorage.setItem(PRESETS_CLEARED_FLAG, 'true');
        resolve(kept);
      };
      req.onerror = () => {
        const kept = getLocalPlants().filter((p) => !p.id.startsWith('preset-'));
        saveLocalPlants(kept);
        localStorage.setItem(PRESETS_CLEARED_FLAG, 'true');
        resolve(kept);
      };
    });
  } catch (err) {
    const kept = getLocalPlants().filter((p) => !p.id.startsWith('preset-'));
    saveLocalPlants(kept);
    localStorage.setItem(PRESETS_CLEARED_FLAG, 'true');
    return kept;
  }
}

// Restore default presets if explicitly requested by user
export async function loadDefaultPresets(): Promise<PlantItem[]> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    for (const plant of INITIAL_PLANTS) {
      store.put(plant);
    }
  } catch (err) {
    console.warn('Error restoring presets to IndexedDB', err);
  }

  saveLocalPlants(INITIAL_PLANTS);
  return INITIAL_PLANTS;
}

// Export all plants to JSON string
export async function exportPlantsJSON(): Promise<string> {
  const plants = await getAllPlants();
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

// Import plants from JSON
export async function importPlantsJSON(jsonString: string): Promise<number> {
  try {
    const parsed = JSON.parse(jsonString);
    const plantList: PlantItem[] = Array.isArray(parsed) ? parsed : parsed.data;
    if (!Array.isArray(plantList)) {
      throw new Error('Invalid JSON format: expecting plant array');
    }

    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    for (const p of plantList) {
      if (p.id && p.name) {
        store.put(p);
      }
    }

    saveLocalPlants(plantList);
    return plantList.length;
  } catch (err) {
    throw new Error('匯入失敗：' + (err instanceof Error ? err.message : String(err)));
  }
}
