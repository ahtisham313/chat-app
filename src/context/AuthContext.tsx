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
    
    // Check if auth is available
    if (!auth) {
      console.error("Firebase Auth is not initialized")
      setError("Firebase Auth is not initialized. Please check your Firebase configuration.")
      setLoading(false)
      return
    }
    
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
            // Don't block auth flow if profile update fails
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
      (error: unknown) => {
        console.error("Auth state change error:", error)
        // Only set error for network issues, not for normal unauthenticated state
        const firebaseError = error as { code?: string; message?: string }
        if (firebaseError?.code === "auth/network-request-failed") {
          setError("Network error: Please check your internet connection and Firebase configuration.")
        } else {
          setError(null) // Clear error for other auth state changes
        }
        setLoading(false)
      }
    )

    // Cleanup subscription on unmount
    return () => unsubscribe()
  }, [])

  const signInWithEmail = async (email: string, password: string) => {
    try {
      setError(null)
      if (typeof window === "undefined") {
        throw new Error("Authentication can only be performed on the client side")
      }
      
      // Ensure auth is properly initialized
      if (!auth) {
        throw new Error("Firebase Auth is not initialized. Please check your Firebase configuration.")
      }
      
      await signInWithEmailAndPassword(auth, email, password)
    } catch (err: unknown) {
      let errorMessage = "Failed to sign in"
      const firebaseError = err as { code?: string; message?: string }
      
      if (firebaseError?.code === "auth/network-request-failed") {
        errorMessage = "Network error: Please check your internet connection and Firebase configuration."
      } else if (firebaseError?.code === "auth/invalid-email") {
        errorMessage = "Invalid email address."
      } else if (firebaseError?.code === "auth/user-not-found") {
        errorMessage = "No account found with this email."
      } else if (firebaseError?.code === "auth/wrong-password") {
        errorMessage = "Incorrect password."
      } else if (firebaseError?.code === "auth/too-many-requests") {
        errorMessage = "Too many failed attempts. Please try again later."
      } else if (firebaseError?.message) {
        errorMessage = firebaseError.message
      } else if (err instanceof Error) {
        errorMessage = err.message
      }
      
      console.error("Sign in error:", err)
      setError(errorMessage)
      throw err
    }
  }

  const signUpWithEmail = async (email: string, password: string, displayName: string) => {
    try {
      setError(null)
      if (typeof window === "undefined") {
        throw new Error("Authentication can only be performed on the client side")
      }
      
      // Ensure auth is properly initialized
      if (!auth) {
        throw new Error("Firebase Auth is not initialized. Please check your Firebase configuration.")
      }
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      // Update profile with display name
      if (userCredential.user) {
        await updateProfile(userCredential.user, {
          displayName: displayName,
        })
      }
    } catch (err: unknown) {
      let errorMessage = "Failed to sign up"
      const firebaseError = err as { code?: string; message?: string }
      
      if (firebaseError?.code === "auth/network-request-failed") {
        errorMessage = "Network error: Please check your internet connection and Firebase configuration."
      } else if (firebaseError?.code === "auth/email-already-in-use") {
        errorMessage = "An account with this email already exists."
      } else if (firebaseError?.code === "auth/invalid-email") {
        errorMessage = "Invalid email address."
      } else if (firebaseError?.code === "auth/weak-password") {
        errorMessage = "Password should be at least 6 characters."
      } else if (firebaseError?.message) {
        errorMessage = firebaseError.message
      } else if (err instanceof Error) {
        errorMessage = err.message
      }
      
      console.error("Sign up error:", err)
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
