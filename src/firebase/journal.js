import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { db, auth } from "./firebase";

/**
 * Helper to sort entries newest first (handles Firestore Timestamp, JS Date, or ISO date string)
 * @param {Array} entries 
 * @returns {Array} Sorted entries copy
 */
export function sortEntriesDesc(entries = []) {
  return [...entries].sort((a, b) => {
    const timeA =
      a.createdAt?.toMillis?.() ||
      (a.createdAt?.seconds ? a.createdAt.seconds * 1000 : null) ||
      (a.date ? new Date(a.date + "T00:00:00").getTime() : 0);

    const timeB =
      b.createdAt?.toMillis?.() ||
      (b.createdAt?.seconds ? b.createdAt.seconds * 1000 : null) ||
      (b.date ? new Date(b.date + "T00:00:00").getTime() : 0);

    return timeB - timeA;
  });
}

/**
 * Syncs user profile information into users/{userId}
 * @param {import("firebase/auth").User} user 
 */
export async function syncUserProfile(user) {
  if (!user || !user.uid) return;

  try {
    const userRef = doc(db, "users", user.uid);
    await setDoc(
      userRef,
      {
        name: user.displayName || "Anonymous",
        email: user.email || "",
        photoURL: user.photoURL || "",
        lastLoginAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (error) {
    console.warn("[Journal] Could not sync user profile to Firestore:", error);
  }
}

/**
 * Creates a new journal entry in users/{userId}/entries
 * @param {string} userId
 * @param {{ title: string, content: string, date: string, mood: string, favorite?: boolean }} entryData
 * @returns {Promise<string>} The created entry ID
 */
export async function createEntry(userId, { title, content, date, mood = "Good", favorite = false }) {
  const currentUid = userId || auth.currentUser?.uid;
  if (!currentUid) {
    throw new Error("No authenticated user found. Please ensure you are logged in.");
  }

  const todayIso = new Date().toISOString().split("T")[0];
  const entryDate = date || todayIso;

  console.log("[Journal] Save started for user:", currentUid);
  console.log("[Journal] Entry data to save:", { title, date: entryDate, mood, favorite });

  try {
    const entriesRef = collection(db, "users", currentUid, "entries");
    const docRef = doc(entriesRef); // Generate unique ID client-side immediately
    const entryId = docRef.id;

    console.log("[Journal] Writing document to users/" + currentUid + "/entries/" + entryId);

    // Timeout guard so the request never hangs indefinitely if Firestore is unreachable
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(
        () =>
          reject(
            new Error(
              "Firestore write timed out. Please check your internet connection or Firebase permissions."
            )
          ),
        20000
      )
    );

    const writePromise = setDoc(docRef, {
      title: title?.trim() || "Untitled Entry",
      content: content || "",
      date: entryDate,
      mood: mood || "Good",
      favorite: Boolean(favorite),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    await Promise.race([writePromise, timeoutPromise]);

    console.log("[Journal] Firestore write completed successfully. Entry ID:", entryId);
    return entryId;
  } catch (error) {
    console.error("[Journal] Firestore createEntry error:", error);
    throw error;
  }
}

// Alias for createEntry
export const createJournalEntry = createEntry;

/**
 * Fetches all journal entries for a user ordered newest first
 * @param {string} userId
 * @returns {Promise<Array>}
 */
export async function getUserEntries(userId) {
  const currentUid = userId || auth.currentUser?.uid;
  if (!currentUid) {
    throw new Error("User ID is required to fetch journal entries.");
  }

  try {
    const entriesRef = collection(db, "users", currentUid, "entries");
    const snapshot = await getDocs(entriesRef);

    const entries = snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));

    return sortEntriesDesc(entries);
  } catch (error) {
    console.error("[Journal] Firestore getUserEntries error:", error);
    throw error;
  }
}

// Alias for getUserEntries
export const getUserJournalEntries = getUserEntries;

/**
 * Sets up a real-time listener for user entries with robust fallback
 * @param {string} userId 
 * @param {(entries: Array) => void} onNext 
 * @param {(error: Error) => void} onError 
 * @returns {() => void} Unsubscribe function
 */
export function subscribeUserEntries(userId, onNext, onError) {
  const currentUid = userId || auth.currentUser?.uid;
  if (!currentUid) {
    if (onNext) onNext([]);
    return () => { };
  }

  const entriesRef = collection(db, "users", currentUid, "entries");
  const q = query(entriesRef);

  return onSnapshot(
    q,
    (snapshot) => {
      console.log("[Journal DEBUG] Current UID:", currentUid);
      console.log("[Journal DEBUG] Firestore documents found:", snapshot.docs.length);
      console.log(
        "[Journal DEBUG] Entries:",
        snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }))
      );

      const entries = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      if (onNext) onNext(sortEntriesDesc(entries));
    },
    (error) => {
      console.error("[Journal] Firestore real-time subscription notice:", error);
      // Fallback to one-time getDocs
      getUserEntries(currentUid)
        .then((fallbackEntries) => {
          if (onNext) onNext(fallbackEntries);
        })
        .catch((fallbackError) => {
          if (onError) onError(fallbackError);
        });
    }
  );
}

/**
 * Fetches a single journal entry by ID
 * @param {string} userId
 * @param {string} entryId
 */
export async function getEntryById(userId, entryId) {
  const currentUid = userId || auth.currentUser?.uid;
  if (!currentUid || !entryId) {
    throw new Error("User ID and Entry ID are required.");
  }

  try {
    const docRef = doc(db, "users", currentUid, "entries", entryId);
    const snapshot = await getDoc(docRef);

    if (!snapshot.exists()) {
      return null;
    }

    return {
      id: snapshot.id,
      ...snapshot.data(),
    };
  } catch (error) {
    console.error(`[Journal] Firestore getEntryById (${entryId}) error:`, error);
    throw error;
  }
}

/**
 * Updates an existing journal entry
 * @param {string} userId
 * @param {string} entryId
 * @param {{ title?: string, content?: string, date?: string, mood?: string, favorite?: boolean }} updateData
 */
export async function updateEntry(userId, entryId, updateData) {
  const currentUid = userId || auth.currentUser?.uid;
  if (!currentUid || !entryId) {
    throw new Error("User ID and Entry ID are required.");
  }

  try {
    const docRef = doc(db, "users", currentUid, "entries", entryId);
    const dataToUpdate = {
      ...updateData,
      updatedAt: serverTimestamp(),
    };

    if (dataToUpdate.title) {
      dataToUpdate.title = dataToUpdate.title.trim();
    }

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(
        () =>
          reject(
            new Error(
              "Firestore update timed out. Please check your internet connection or Firebase permissions."
            )
          ),
        20000
      )
    );

    const updatePromise = updateDoc(docRef, dataToUpdate);
    await Promise.race([updatePromise, timeoutPromise]);
    console.log("[Journal] Entry updated successfully:", entryId);
  } catch (error) {
    console.error(`[Journal] Firestore updateEntry (${entryId}) error:`, error);
    throw error;
  }
}

/**
 * Deletes a journal entry
 * @param {string} userId
 * @param {string} entryId
 */
export async function deleteEntry(userId, entryId) {
  const currentUid = userId || auth.currentUser?.uid;
  if (!currentUid || !entryId) {
    throw new Error("User ID and Entry ID are required.");
  }

  try {
    const docRef = doc(db, "users", currentUid, "entries", entryId);

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(
        () =>
          reject(
            new Error(
              "Firestore delete timed out. Please check your internet connection or Firebase permissions."
            )
          ),
        20000
      )
    );

    const deletePromise = deleteDoc(docRef);
    await Promise.race([deletePromise, timeoutPromise]);
    console.log("[Journal] Entry deleted successfully:", entryId);
  } catch (error) {
    console.error(`[Journal] Firestore deleteEntry (${entryId}) error:`, error);
    throw error;
  }
}

/**
 * Toggles the favorite status of a journal entry
 * @param {string} userId
 * @param {string} entryId
 * @param {boolean} currentFavorite
 */
export async function toggleFavoriteEntry(userId, entryId, currentFavorite) {
  return updateEntry(userId, entryId, {
    favorite: !currentFavorite,
  });
}
