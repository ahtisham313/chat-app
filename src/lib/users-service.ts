import { ref, onValue, off, set, DataSnapshot } from "firebase/database"
import { getDb } from "./firebase/config"
import type { Contact } from "@/src/data/contacts"

/**
 * Listen to all users from Firebase
 * Returns a cleanup function to unsubscribe
 */
export function listenUsers(
  currentUserId: string,
  callback: (users: Contact[]) => void
): () => void {
  const db = getDb()
  if (!db) {
    callback([])
    return () => {}
  }

  const usersRef = ref(db, "users")

  const unsubscribe = onValue(
    usersRef,
    (snapshot: DataSnapshot) => {
      if (snapshot.exists()) {
        const usersData = snapshot.val()
        const users: Contact[] = Object.keys(usersData)
          .map((key) => {
            const user = usersData[key]
            return {
              id: key,
              name: user.displayName || user.email || "Unknown User",
              email: user.email || undefined,
              avatar: user.photoURL || undefined,
            }
          })
          .filter((user) => user.id !== currentUserId) // Exclude current user

        callback(users)
      } else {
        callback([])
      }
    },
    (error) => {
      console.error("Error listening to users:", error)
      callback([])
    }
  )

  return () => {
    off(usersRef)
  }
}

/**
 * Create or update user profile in Firebase when they sign up/login
 */
export async function createOrUpdateUserProfile(
  userId: string,
  displayName: string | null,
  email: string | null,
  photoURL: string | null
): Promise<void> {
  const db = getDb()
  if (!db) {
    throw new Error("Database not initialized")
  }

  const userRef = ref(db, `users/${userId}`)
  
  await set(userRef, {
    displayName: displayName || email || "User",
    email: email || "",
    photoURL: photoURL || null,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  })
}

