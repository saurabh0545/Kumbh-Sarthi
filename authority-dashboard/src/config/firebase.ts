import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';

/**
 * Kumbh Sarthi Authority Dashboard - Firebase Configuration
 * Reads credentials from Vite environment variables (VITE_FIREBASE_*).
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDemoPlaceholderApiKeyKumbhSarthi',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'kumbh-smart-assist.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'kumbh-smart-assist',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'kumbh-smart-assist.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789012',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:123456789012:web:abcdef1234567890',
};

/**
 * Checks if real Firebase credentials have been provided by the user.
 */
export function isFirebaseConfigured(): boolean {
  const key = import.meta.env.VITE_FIREBASE_API_KEY;
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
