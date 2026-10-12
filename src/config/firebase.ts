import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  Auth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as fbSignOut,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  Firestore,
  doc,
  getDoc,
  getDocFromServer,
  setDoc,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Configured owner email identity
export const CONFIGURED_OWNER_EMAIL = (
  import.meta.env.VITE_OWNER_EMAIL || 'hamzadiab500@gmail.com'
).toLowerCase().trim();

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

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const currentAuth = auth;
  const user = currentAuth?.currentUser;
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: user?.uid,
      email: user?.email,
      emailVerified: user?.emailVerified,
      isAnonymous: user?.isAnonymous,
      tenantId: user?.tenantId,
      providerInfo:
        user?.providerData?.map((provider) => ({
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

// Initialize Firebase App
const app: FirebaseApp = getApps().length
  ? getApps()[0]
  : initializeApp(firebaseConfig);

// Initialize Firestore with configured databaseId (CRITICAL)
export const db: Firestore = getFirestore(
  app,
  firebaseConfig.firestoreDatabaseId
);

// Initialize Auth
export const auth: Auth = getAuth(app);
export const isFirebaseConfigured = true;
export const firebaseApp = app;

/**
 * Test Firestore connection on boot
 */
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firestore offline notice. Please check network connection.');
    }
  }
}
testConnection();

/**
 * Sign in using Google Provider
 */
export async function signInWithGoogle(): Promise<User | null> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const result = await signInWithPopup(auth, provider);
  return result.user;
}

/**
 * Sign out current authenticated user
 */
export async function logOut(): Promise<void> {
  await fbSignOut(auth);
}

/**
 * Verifies if user has the owner role in Firestore or matches configured OWNER_EMAIL
 */
export async function verifyOwnerAuthorization(user: User | null): Promise<boolean> {
  if (!user || !user.email) return false;

  const userEmail = user.email.toLowerCase().trim();
  const isDirectConfiguredMatch = userEmail === CONFIGURED_OWNER_EMAIL;

  if (isDirectConfiguredMatch) {
    // Ensure the owner's record exists in /admins/{uid} for rule compliance
    try {
      const adminDocRef = doc(db, 'admins', user.uid);
      const snap = await getDoc(adminDocRef);
      if (!snap.exists()) {
        await setDoc(adminDocRef, {
          email: userEmail,
          role: 'owner',
          createdAt: new Date().toISOString(),
        });
      }
    } catch (e) {
      // Non-fatal if already handled by security rules
      console.log('Owner doc check status:', e);
    }
    return true;
  }

  // Check /admins/{uid}
  if (user.uid) {
    try {
      const adminDocRef = doc(db, 'admins', user.uid);
      const snap = await getDoc(adminDocRef);
      if (snap.exists()) {
        const data = snap.data();
        if (data.role === 'owner' || data.role === 'admin') {
          return true;
        }
      }
    } catch {
      return false;
    }
  }

  return false;
}
