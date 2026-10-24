import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';

/**
 * Kumbh Sarthi Authority Dashboard - Firebase Configuration
 * Reads credentials from Vite environment variables (VITE_FIREBASE_*).
 */
const DEFAULT_FIREBASE_CONFIG = {
  apiKey: 'AIzaSyD2P-1cCvMnwYU31PA0S902S4KV_pF8Hqk',
  authDomain: 'kumbh-sarthi-440b4.firebaseapp.com',
  projectId: 'kumbh-sarthi-440b4',
  storageBucket: 'kumbh-sarthi-440b4.firebasestorage.app',
  messagingSenderId: '6822163058',
  appId: '1:6822163058:web:01344641a74ce5585848eb',
};

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || DEFAULT_FIREBASE_CONFIG.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || DEFAULT_FIREBASE_CONFIG.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || DEFAULT_FIREBASE_CONFIG.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || DEFAULT_FIREBASE_CONFIG.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || DEFAULT_FIREBASE_CONFIG.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || DEFAULT_FIREBASE_CONFIG.appId,
};

/**
 * Checks if real Firebase credentials have been provided.
 */
export function isFirebaseConfigured(): boolean {
  const key = firebaseConfig.apiKey;
  return Boolean(key && !key.includes('Placeholder') && key.startsWith('AIzaSy'));
}

let app: FirebaseApp;
let db: Firestore;

try {
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }
  db = getFirestore(app);
} catch (error) {
  console.warn('[Firebase] Initialization notice:', error);
  app = getApps()[0] || initializeApp(firebaseConfig);
  db = getFirestore(app);
}

export { app, db, firebaseConfig };
export default db;
