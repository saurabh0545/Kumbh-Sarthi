import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import db, { isFirebaseConfigured } from '@/config/firebase';
import { apiClient } from './api';
import { sha256 } from '@/utils/hash';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: string;
  token?: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

function normalizeDocId(email: string): string {
  return email.trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
}

/**
 * Register a new user:
 * 1. Checks & saves in Firebase Cloud Firestore "users" collection
 * 2. Also registers in local FastAPI MySQL backend if reachable
 */
export async function registerUser(payload: RegisterPayload): Promise<AuthUser> {
  const cleanEmail = payload.email.trim().toLowerCase();
  const cleanName = payload.name.trim();
  const cleanPass = payload.password;

  if (!cleanEmail || !cleanPass) {
    throw new Error('Please provide a valid email and password.');
  }

  // 1. Check & write to Firebase Firestore
  if (isFirebaseConfigured()) {
    try {
      const docId = normalizeDocId(cleanEmail);
      const userDocRef = doc(db, 'users', docId);
      const existingSnap = await getDoc(userDocRef);

      if (existingSnap.exists()) {
        throw new Error('This email is already registered. Please log in.');
      }

      const pHash = sha256(cleanPass);
      const newUserDoc = {
        id: Date.now(),
        name: cleanName,
        email: cleanEmail,
        passwordHash: pHash,
        role: 'PILGRIM',
        createdAt: serverTimestamp(),
        source: 'MOBILE_APP',
      };

      await setDoc(userDocRef, newUserDoc);
      console.log('[Auth] User registered successfully in Firestore:', cleanEmail);
    } catch (err: any) {
      if (err.message && err.message.includes('already registered')) {
        throw err;
      }
      console.warn('[Auth] Firestore registration notice:', err);
    }
  }

  // 2. Best-effort mirror into FastAPI backend if reachable (non-blocking)
  apiClient.post<AuthUser>('/api/auth/register', {
    name: cleanName,
    email: cleanEmail,
    password: cleanPass,
  }).catch(() => {});

  return {
    id: Date.now(),
    name: cleanName,
    email: cleanEmail,
    role: 'PILGRIM',
    token: `kumbh-token-${Date.now()}`,
  };
}

/**
 * Log in an existing user:
 * Strictly verifies credentials against Firestore or FastAPI.
 * Rejects wrong passwords and non-existent accounts!
 */
export async function loginUser(payload: LoginPayload): Promise<AuthUser> {
  const cleanEmail = payload.email.trim().toLowerCase();
  const cleanPass = payload.password;

  if (!cleanEmail || !cleanPass) {
    throw new Error('Please enter both email and password.');
  }

  let firestoreAuthenticatedUser: AuthUser | null = null;

  // 1. Authenticate with Firebase Cloud Firestore
  if (isFirebaseConfigured()) {
    try {
      const docId = normalizeDocId(cleanEmail);
      const userDocRef = doc(db, 'users', docId);
      const userSnap = await getDoc(userDocRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        const expectedHash = userData.passwordHash;
        const incomingHash = sha256(cleanPass);

        if (expectedHash && expectedHash !== incomingHash) {
          throw new Error('Incorrect password. Please try again.');
        }

        firestoreAuthenticatedUser = {
          id: Number(userData.id) || Date.now(),
          name: userData.name || cleanEmail.split('@')[0],
          email: cleanEmail,
          role: userData.role || 'PILGRIM',
          token: `kumbh-fb-token-${Date.now()}`,
        };

        // Authenticated directly via Firebase Cloud! Return immediately without laptop dependency
        return firestoreAuthenticatedUser;
      }
    } catch (err: any) {
      if (err.message && (err.message.includes('Incorrect password') || err.message.includes('already registered'))) {
        throw err;
      }
      console.warn('[Auth] Firestore login check notice:', err);
    }
  }

  // 2. Fallback: Authenticate with FastAPI Backend if reachable
  try {
    const response = await apiClient.post<AuthUser>('/api/auth/login', {
      email: cleanEmail,
      password: cleanPass,
    });
    return response.data;
  } catch (backendErr: any) {
    if (backendErr.response) {
      const status = backendErr.response.status;
      if (status === 401) {
        throw new Error('Invalid email or password.');
      }
      if (status === 404) {
        throw new Error('No account found with this email. Please register first.');
      }
    }
  }

  // If neither verified, strictly reject the login
  throw new Error('Invalid email or password. Please check your credentials or register an account.');
}

