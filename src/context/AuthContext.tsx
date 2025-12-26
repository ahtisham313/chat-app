"use client"

import { createContext, useContext, ReactNode, useEffect, useState } from "react"
import { 
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile
} from "firebase/auth"
import { auth } from "@/src/lib/firebase/config"
import { createOrUpdateUserProfile } from "@/src/lib/users-service"

export interface User {
  uid: string
  displayName: string | null
  email: string | null
  photoURL: string | null
}

interface AuthContextType {
  user: User | null
  loading: boolean
  error: string | null
  signInWithEmail: (email: string, password: string) => Promise<void>
  signUpWithEmail: (email: string, password: string, displayName: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined") return;
    
    // Subscribe to auth state changes
    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser: FirebaseUser | null) => {
        if (firebaseUser) {
          // Create or update user profile in Firebase Database
          try {
            await createOrUpdateUserProfile(
              firebaseUser.uid,
              firebaseUser.displayName,
              firebaseUser.email,
              firebaseUser.photoURL
            )
          } catch (error) {
            console.error("Error creating/updating user profile:", error)
          }
          
          setUser({
            uid: firebaseUser.uid,
            displayName: firebaseUser.displayName,
            email: firebaseUser.email,
            photoURL: firebaseUser.photoURL,
          })
        } else {
          setUser(null)
        }
        setLoading(false)
        setError(null)
      },
      (error) => {
        console.error("Auth state change error:", error)
        setError(error.message)
        setLoading(false)
      }
    )

    // Cleanup subscription on unmount
    return () => unsubscribe()
  }, [])

  const signInWithEmail = async (email: string, password: string) => {
    try {
      setError(null)
      if (typeof window === "undefined") return;
      await signInWithEmailAndPassword(auth, email, password)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to sign in"
      setError(errorMessage)
      throw err
    }
  }

  const signUpWithEmail = async (email: string, password: string, displayName: string) => {
    try {
      setError(null)
      if (typeof window === "undefined") return;
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      // Update profile with display name
      if (userCredential.user) {
        await updateProfile(userCredential.user, {
          displayName: displayName,
        })
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to sign up"
      setError(errorMessage)
      throw err
    }
  }

  const logout = async () => {
    try {
      setError(null)
      if (typeof window === "undefined") return;
      await signOut(auth)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to logout"
      setError(errorMessage)
      throw err
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        signInWithEmail,
        signUpWithEmail,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
