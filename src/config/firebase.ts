import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';

/**
 * Kumbh Sarthi - Mobile App Firebase Configuration
 * Reads credentials from EXPO_PUBLIC_FIREBASE_* environment variables.
 */
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || 'AIzaSyDemoPlaceholderApiKeyKumbhSarthi',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || 'kumbh-smart-assist.firebaseapp.com',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'kumbh-smart-assist',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || 'kumbh-smart-assist.appspot.com',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '123456789012',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '1:123456789012:web:abcdef1234567890',
};

/**
 * Checks if real Firebase credentials have been provided by the user.
 */
export function isFirebaseConfigured(): boolean {
  const key = process.env.EXPO_PUBLIC_FIREBASE_API_KEY;
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
  // Re-attempt safe initialization if needed
  app = getApps()[0] || initializeApp(firebaseConfig);
  db = getFirestore(app);
}

export { app, db, firebaseConfig };
export default db;
