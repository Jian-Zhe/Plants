import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { getStoredApiKey, setStoredApiKey, getStoredModel, setStoredModel } from './gemini';

export interface UserCloudConfig {
  geminiApiKey?: string;
  geminiModel?: string;
  updatedAt?: string;
}

// Sync user's API Key and Model setting to Firebase Cloud
export async function syncUserSettingsToCloud(userUid: string, apiKey?: string, model?: string): Promise<void> {
  if (!userUid) return;
  const currentKey = apiKey !== undefined ? apiKey : getStoredApiKey();
  const currentModel = model !== undefined ? model : getStoredModel();

  try {
    const configRef = doc(db, 'users', userUid, 'settings', 'user_config');
    await setDoc(configRef, {
      geminiApiKey: currentKey || '',
      geminiModel: currentModel || 'gemini-2.5-flash-lite',
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (err) {
    console.warn('Failed syncing user settings to cloud:', err);
  }
}

// Load user's API Key and Model setting from Firebase Cloud upon login
export async function loadUserSettingsFromCloud(userUid: string): Promise<UserCloudConfig | null> {
  if (!userUid) return null;

  try {
    const configRef = doc(db, 'users', userUid, 'settings', 'user_config');
    const snap = await getDoc(configRef);

    if (snap.exists()) {
      const data = snap.data() as UserCloudConfig;

      if (data.geminiApiKey !== undefined) {
        setStoredApiKey(data.geminiApiKey);
      }
      if (data.geminiModel) {
        setStoredModel(data.geminiModel);
      }
      return data;
    } else {
      // First time logging in: store existing local API Key to cloud if available
      const localKey = getStoredApiKey();
      const localModel = getStoredModel();
      if (localKey || localModel) {
        await syncUserSettingsToCloud(userUid, localKey, localModel);
      }
    }
  } catch (err) {
    console.warn('Failed loading user settings from cloud:', err);
  }
  return null;
}
