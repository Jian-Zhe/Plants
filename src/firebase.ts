import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut as fbSignOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  indexedDBLocalPersistence,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
} from 'firebase/firestore';
import defaultFirebaseConfig from '../firebase-applet-config.json';

// Support both Vite environment variables (e.g. for GitHub Actions CI/Secrets) and local config fallback
const firebaseConfig = {
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || defaultFirebaseConfig.projectId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || defaultFirebaseConfig.appId,
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || defaultFirebaseConfig.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || defaultFirebaseConfig.authDomain,
  firestoreDatabaseId: import.meta.env.VITE_FIREBASE_DATABASE_ID || defaultFirebaseConfig.firestoreDatabaseId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || defaultFirebaseConfig.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || defaultFirebaseConfig.messagingSenderId,
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// CRITICAL: Must pass firestoreDatabaseId
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// Enforce robust local persistence (IndexedDB -> browser local storage)
// Critical for standalone PWAs and mobile browsers to keep authentication intact
if (typeof window !== 'undefined') {
  setPersistence(auth, indexedDBLocalPersistence)
    .catch(() => setPersistence(auth, browserLocalPersistence))
    .catch((err) => {
      console.warn('Set persistence warning:', err);
    });
}

export const googleProvider = new GoogleAuthProvider();
// Force account selection prompt on re-login after logout
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Validate Connection to Firestore on boot
export async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline or network restricted.');
    }
  }
}

// Detect if running inside a mobile browser or PWA standalone
export function isMobileOrPWA(): boolean {
  if (typeof window === 'undefined') return false;
  const ua = navigator.userAgent || '';
  const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as unknown as { standalone?: boolean }).standalone === true;
  return isMobileUA || isStandalone;
}

// User sign in with Google:
// In Standalone PWA, popup keeps user inside the app and prevents dropping state to an external browser!
// We only use redirect if forceRedirect is explicitly set or popup is blocked by the browser.
export async function loginWithGoogle(forceRedirect = false): Promise<User | null> {
  // If user explicitly asks for redirect
  if (forceRedirect) {
    await signInWithRedirect(auth, googleProvider);
    return null;
  }

  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (err: unknown) {
    if (auth.currentUser) {
      return auth.currentUser;
    }
    const errorCode = (err as { code?: string })?.code;
    // If popup was blocked by browser or restricted environment, fallback to redirect
    if (errorCode === 'auth/popup-blocked') {
      console.warn('Popup blocked by browser, attempting redirect sign-in...');
      await signInWithRedirect(auth, googleProvider);
      return null;
    }
    console.error('Google sign-in error:', err);
    throw err;
  }
}

// Check redirect result on app initialization or when app regains focus from redirect
export async function handleAuthRedirect(): Promise<User | null> {
  try {
    const result = await getRedirectResult(auth);
    if (result?.user) {
      return result.user;
    }
    if (auth.currentUser) {
      return auth.currentUser;
    }
    return null;
  } catch (err: unknown) {
    // If getRedirectResult throws (e.g. storage partitioning, null state), don't crash
    console.warn('Redirect check notice:', err);
    return auth.currentUser || null;
  }
}

// Helper to actively refresh and check current auth state
export async function refreshCurrentAuth(): Promise<User | null> {
  try {
    if (auth.currentUser) {
      await auth.currentUser.reload();
      return auth.currentUser;
    }
    const redirectUser = await handleAuthRedirect();
    return redirectUser || auth.currentUser || null;
  } catch (err) {
    console.warn('Refresh auth error:', err);
    return auth.currentUser || null;
  }
}

// User sign out
export async function logoutUser(): Promise<void> {
  await fbSignOut(auth);
}

// Listen to auth changes
export function subscribeToAuth(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

// Trigger connection test once
testFirestoreConnection();
