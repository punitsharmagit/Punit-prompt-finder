import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
  getIdToken,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  setDoc,
  getDoc,
  onSnapshot,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase App
export const app = initializeApp(firebaseConfig);

// CRITICAL: The app requires firestoreDatabaseId passed to getFirestore
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Configure Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

// Error handling standard required by skill
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
) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((p) => ({
          providerId: p.providerId,
          email: p.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Connection check required by skill
export async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase connection check: Client is offline or database initializing.');
    }
  }
}

// Trigger connection check on module load
testFirestoreConnection();

/**
 * Sign In with Google via Firebase Popup
 */
export async function signInWithFirebaseGoogle(): Promise<{
  firebaseUser: FirebaseUser;
  idToken: string;
}> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const idToken = await getIdToken(result.user);

    // Save or update user document in Firestore
    try {
      await setDoc(
        doc(db, 'users', result.user.uid),
        {
          id: result.user.uid,
          email: result.user.email || '',
          name: result.user.displayName || result.user.email?.split('@')[0] || 'Google User',
          avatarUrl: result.user.photoURL || '',
          tier: 'PRO',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
        { merge: true }
      );
    } catch (fsErr) {
      console.warn('Could not sync user profile to Firestore:', fsErr);
    }

    return {
      firebaseUser: result.user,
      idToken,
    };
  } catch (err: any) {
    console.error('Firebase Google Sign-In error:', err);
    throw err;
  }
}

/**
 * Sign Out from Firebase
 */
export async function signOutFromFirebase(): Promise<void> {
  await firebaseSignOut(auth);
}

export type { FirebaseUser };
