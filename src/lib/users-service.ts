import { ref, onValue, set, DataSnapshot } from "firebase/database"
import { auth, getDb } from "./firebase/config"
import type { Contact } from "@/src/data/contacts"

async function ensureAuthReady(): Promise<void> {
  if (auth?.currentUser) {
    await auth.currentUser.getIdToken()
  }
}

function mapUsersFromSnapshot(
  usersData: Record<string, unknown>,
  currentUserId: string
): Contact[] {
  return Object.keys(usersData)
    .map((key) => {
      const user = usersData[key]
      if (!user || typeof user !== "object") return null

      const profile = user as {
        displayName?: string
        email?: string
        photoURL?: string
      }

      return {
        id: key,
        name: profile.displayName || profile.email || "Unknown User",
        email: profile.email || undefined,
        avatar: profile.photoURL || undefined,
      }
    })
    .filter((user): user is Contact => user !== null && user.id !== currentUserId)
}

/**
 * Listen to all users from Firebase
 * Returns a cleanup function to unsubscribe
 */
export function listenUsers(
  currentUserId: string,
  callback: (users: Contact[]) => void
): () => void {
  let unsubscribe = () => {}
  let cancelled = false

  void (async () => {
    await ensureAuthReady()
    if (cancelled) return

    const db = getDb()
    if (!db) {
      callback([])
      return
    }

    const usersRef = ref(db, "users")

    unsubscribe = onValue(
      usersRef,
      (snapshot: DataSnapshot) => {
        if (snapshot.exists()) {
          callback(mapUsersFromSnapshot(snapshot.val(), currentUserId))
        } else {
          callback([])
        }
      },
      (error) => {
        console.error("Error listening to users:", error)
        callback([])
      }
    )
  })()

  return () => {
    cancelled = true
    unsubscribe()
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
  await ensureAuthReady()

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

