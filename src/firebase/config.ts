import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  getDocFromServer,
  getDoc,
  collection,
  getDocs,
  setDoc,
  onSnapshot,
} from 'firebase/firestore';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import configJson from '../../firebase-applet-config.json';
import { SystemData, UserProfile } from '../types';
import { getDefaultPermissionsForRole } from '../utils/storage';

export const firebaseConfig = {
  apiKey: configJson.apiKey,
  authDomain: configJson.authDomain,
  projectId: configJson.projectId,
  storageBucket: configJson.storageBucket,
  messagingSenderId: configJson.messagingSenderId,
  appId: configJson.appId,
};

export const oAuthClientId = configJson.oAuthClientId;

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);
export const auth = getAuth(app);

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

// Test connection on boot
export async function testFirebaseConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'system', 'connection-test'));
    return true;
  } catch (error) {
    return false;
  }
}

// Google Sign-In with Firebase Auth
export async function signInWithGoogle(): Promise<{
  firebaseUser: FirebaseUser;
  profile: UserProfile;
}> {
  const result = await signInWithPopup(auth, googleProvider);
  const fbUser = result.user;

  // Check if user document already exists in Firestore
  const userDocRef = doc(db, 'users', fbUser.uid);
  let userProfile: UserProfile;

  try {
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      userProfile = snap.data() as UserProfile;
    } else {
      // First-time Google Sign-In: create initial company profile
      userProfile = {
        id: `usr-google-${fbUser.uid.substring(0, 8)}`,
        name: fbUser.displayName || 'مستخدم Google معتمد',
        username: (fbUser.email?.split('@')[0] || `user_${fbUser.uid.substring(0, 5)}`).toLowerCase(),
        email: fbUser.email || '',
        phone: fbUser.phoneNumber || '0500000000',
        role: 'الإدارة المركزية',
        branchId: undefined, // All branches
        branchName: 'الإدارة المركزية - كافة الفروع',
        avatarUrl: fbUser.photoURL || undefined,
        isActive: true,
        createdAt: new Date().toISOString().split('T')[0],
        permissions: getDefaultPermissionsForRole('الإدارة المركزية'),
      };
      await setDoc(userDocRef, userProfile);
    }
  } catch (err) {
    console.warn('Firestore read error during Google sign-in, creating fallback profile:', err);
    userProfile = {
      id: `usr-google-${fbUser.uid.substring(0, 8)}`,
      name: fbUser.displayName || 'مستخدم Google معتمد',
      username: (fbUser.email?.split('@')[0] || 'user').toLowerCase(),
      email: fbUser.email || '',
      phone: '0500000000',
      role: 'الإدارة المركزية',
      branchName: 'الإدارة المركزية - كافة الفروع',
      avatarUrl: fbUser.photoURL || undefined,
      isActive: true,
      createdAt: new Date().toISOString().split('T')[0],
      permissions: getDefaultPermissionsForRole('الإدارة المركزية'),
    };
  }

  return { firebaseUser: fbUser, profile: userProfile };
}

// Sign out from Firebase
export async function signOutFromFirebase(): Promise<void> {
  await signOut(auth);
}

// Subscribe to Firebase Auth state
export function subscribeToFirebaseAuthState(
  callback: (user: FirebaseUser | null) => void
) {
  return onAuthStateChanged(auth, callback);
}

// Sync full system state to Firestore
export async function syncDataToFirestore(data: SystemData) {
  try {
    const systemDocRef = doc(db, 'system_data', 'ofooq_main');
    await setDoc(
      systemDocRef,
      {
        ...data,
        lastSyncedAt: new Date().toISOString(),
      },
      { merge: true }
    );
    return true;
  } catch (err) {
    console.warn('Failed to sync to Firestore:', err);
    return false;
  }
}

// Persist single user to Firestore
export async function persistUserToFirestore(user: UserProfile) {
  try {
    const userDocRef = doc(db, 'users', user.id);
    await setDoc(userDocRef, user, { merge: true });
    return true;
  } catch (err) {
    console.warn('Failed to persist user in Firestore:', err);
    return false;
  }
}

// Subscribe to real-time updates from Firestore
export function subscribeToFirestoreSystemData(
  callback: (data: SystemData) => void
) {
  const systemDocRef = doc(db, 'system_data', 'ofooq_main');
  return onSnapshot(
    systemDocRef,
    (snap) => {
      if (snap.exists()) {
        const d = snap.data() as SystemData;
        if (d.branches && d.branches.length > 0) {
          callback(d);
        }
      }
    },
    (err) => {
      console.warn('Firestore subscription notice (using local storage cache):', err.message);
    }
  );
}
