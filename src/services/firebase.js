import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup,
  signInWithRedirect, 
  getRedirectResult, 
  signOut, 
  onAuthStateChanged 
} from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot 
} from "firebase/firestore";

// Read Firebase Web App configuration from Vite Environment Variables (.env)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase App, Auth, and Firestore
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Force account selection on Google Sign-In
googleProvider.setCustomParameters({ prompt: 'select_account' });

/**
 * Hybrid Google Sign-In Approach:
 * - Desktop browsers: signInWithPopup (instant, reliable, no redirect loop)
 * - Mobile browsers (iOS Safari, Android Chrome): signInWithRedirect (bypasses popup blocking)
 */
export const signInWithGoogle = async () => {
  const isMobile = typeof window !== 'undefined' && (
    window.innerWidth < 768 || 
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  );

  if (isMobile) {
    console.log('[Guardian Auth] 📱 Mobile browser detected -> Using signInWithRedirect...');
    try {
      await signInWithRedirect(auth, googleProvider);
    } catch (error) {
      console.error("[Guardian Auth] ❌ Google Sign-In Redirect Error:", error);
      throw error;
    }
  } else {
    console.log('[Guardian Auth] 💻 Desktop browser detected -> Using signInWithPopup...');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      console.log('[Guardian Auth] ✅ signInWithPopup SUCCESS! User acquired:', result.user.email);
      return result.user;
    } catch (error) {
      console.error("[Guardian Auth] ❌ Google Sign-In Popup Error:", error);
      throw error;
    }
  }
};

/**
 * Catch and return user auth state after redirecting back from Google (Mobile flow)
 */
export const checkRedirectResult = async () => {
  console.log('[Guardian Auth] 🔄 Calling getRedirectResult(auth)...');
  try {
    const result = await getRedirectResult(auth);
    if (result && result.user) {
      console.log('[Guardian Auth] ✅ getRedirectResult SUCCESS! User acquired from redirect:', {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName
      });
      return result.user;
    }
    console.log('[Guardian Auth] ℹ️ getRedirectResult returned null (Normal page load / no pending redirect result)');
    return null;
  } catch (error) {
    console.error("[Guardian Auth] ❌ getRedirectResult Error:", error);
    throw error;
  }
};

/**
 * Sign out current user
 */
export const logoutUser = async () => {
  console.log('[Guardian Auth] 🚪 Logging out current user...');
  try {
    await signOut(auth);
    console.log('[Guardian Auth] ✅ Sign-Out successful.');
  } catch (error) {
    console.error("[Guardian Auth] ❌ Sign-Out Error:", error);
    throw error;
  }
};

/**
 * Subscribe to Firebase Auth state changes
 */
export const subscribeAuthState = (callback) => {
  console.log('[Guardian Auth] 📡 Registering onAuthStateChanged listener...');
  return onAuthStateChanged(auth, callback);
};

/**
 * Realtime Firestore subscription for user's trusted contacts:
 * Stored under `users/{uid}/contacts`
 */
export const subscribeUserContacts = (uid, onUpdate) => {
  if (!uid) return () => {};
  console.log(`[Guardian Firestore] 📡 Subscribing to contacts for uid: ${uid}`);
  const contactsRef = collection(db, "users", uid, "contacts");
  
  return onSnapshot(contactsRef, (snapshot) => {
    const contactsList = [];
    snapshot.forEach((docSnap) => {
      contactsList.push({ id: docSnap.id, ...docSnap.data() });
    });
    console.log(`[Guardian Firestore] 📦 Contacts snapshot received (${contactsList.length} contacts)`);
    onUpdate(contactsList);
  }, (error) => {
    console.error("[Guardian Firestore] ❌ Contacts Subscription Error:", error);
  });
};

/**
 * Add or update contact in Firestore under users/{uid}/contacts/{contactId}
 */
export const addContactToCloud = async (uid, contact) => {
  if (!uid || !contact?.id) return;
  console.log(`[Guardian Firestore] ➕ Adding contact "${contact.name}" to Cloud Firestore...`);
  const docRef = doc(db, "users", uid, "contacts", contact.id);
  await setDoc(docRef, contact);
};

/**
 * Delete contact from Firestore
 */
export const deleteContactFromCloud = async (uid, contactId) => {
  if (!uid || !contactId) return;
  console.log(`[Guardian Firestore] 🗑️ Deleting contact "${contactId}" from Cloud Firestore...`);
  const docRef = doc(db, "users", uid, "contacts", contactId);
  await deleteDoc(docRef);
};

/**
 * Update primary contact flag across user's contacts in Firestore
 */
export const updatePrimaryContactInCloud = async (uid, targetContactId, contactsList) => {
  if (!uid || !contactsList) return;
  console.log(`[Guardian Firestore] ⭐ Updating primary contact to "${targetContactId}"...`);
  for (const c of contactsList) {
    const isPrimary = c.id === targetContactId;
    const docRef = doc(db, "users", uid, "contacts", c.id);
    await setDoc(docRef, { ...c, isPrimary }, { merge: true });
  }
};
