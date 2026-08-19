import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
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

const firebaseConfig = {
  apiKey: "AIzaSyBWRQA9GPvVOhNVK0HPlB6bvdq_yfW6EeE",
  authDomain: "guardianai-273f2.firebaseapp.com",
  projectId: "guardianai-273f2",
  storageBucket: "guardianai-273f2.firebasestorage.app",
  messagingSenderId: "1005122121302",
  appId: "1:1005122121302:web:7871d1f5650c92e59715f7",
  measurementId: "G-Q8BW2S7XW5"
};

// Initialize Firebase App, Auth, and Firestore
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Force account selection on Google Sign-In
googleProvider.setCustomParameters({ prompt: 'select_account' });

/**
 * Sign in user with Google popup
 */
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Google Sign-In Error:", error);
    throw error;
  }
};

/**
 * Sign out current user
 */
export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Sign-Out Error:", error);
    throw error;
  }
};

/**
 * Subscribe to Firebase Auth state changes
 */
export const subscribeAuthState = (callback) => {
  return onAuthStateChanged(auth, callback);
};

/**
 * Realtime Firestore subscription for user's trusted contacts:
 * Stored under `users/{uid}/contacts`
 */
export const subscribeUserContacts = (uid, onUpdate) => {
  if (!uid) return () => {};
  const contactsRef = collection(db, "users", uid, "contacts");
  
  return onSnapshot(contactsRef, (snapshot) => {
    const contactsList = [];
    snapshot.forEach((docSnap) => {
      contactsList.push({ id: docSnap.id, ...docSnap.data() });
    });
    onUpdate(contactsList);
  }, (error) => {
    console.error("Firestore Contacts Subscription Error:", error);
  });
};

/**
 * Add or update contact in Firestore under users/{uid}/contacts/{contactId}
 */
export const addContactToCloud = async (uid, contact) => {
  if (!uid || !contact?.id) return;
  const docRef = doc(db, "users", uid, "contacts", contact.id);
  await setDoc(docRef, contact);
};

/**
 * Delete contact from Firestore
 */
export const deleteContactFromCloud = async (uid, contactId) => {
  if (!uid || !contactId) return;
  const docRef = doc(db, "users", uid, "contacts", contactId);
  await deleteDoc(docRef);
};

/**
 * Update primary contact flag across user's contacts in Firestore
 */
export const updatePrimaryContactInCloud = async (uid, targetContactId, contactsList) => {
  if (!uid || !contactsList) return;
  for (const c of contactsList) {
    const isPrimary = c.id === targetContactId;
    const docRef = doc(db, "users", uid, "contacts", c.id);
    await setDoc(docRef, { ...c, isPrimary }, { merge: true });
  }
};
