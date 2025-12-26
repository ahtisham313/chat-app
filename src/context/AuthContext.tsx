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
  setError: (error: string | null) => void
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
      let errorMessage = "Failed to sign in. Please try again."
      const firebaseError = err as { code?: string; message?: string }
      
      // Map all Firebase auth error codes to user-friendly messages
      const errorCodeMap: Record<string, string> = {
        "auth/network-request-failed": "Network error. Please check your internet connection.",
        "auth/invalid-email": "Invalid email address. Please enter a valid email.",
        "auth/user-not-found": "No account found with this email address.",
        "auth/wrong-password": "Incorrect password. Please try again.",
        "auth/invalid-credential": "Invalid email or password. Please check your credentials.",
        "auth/too-many-requests": "Too many failed attempts. Please try again later.",
        "auth/user-disabled": "This account has been disabled. Please contact support.",
        "auth/operation-not-allowed": "Sign in is currently disabled. Please contact support.",
        "auth/invalid-verification-code": "Invalid verification code.",
        "auth/invalid-verification-id": "Invalid verification ID.",
        "auth/missing-email": "Email is required.",
        "auth/missing-password": "Password is required.",
      }
      
      if (firebaseError?.code && errorCodeMap[firebaseError.code]) {
        errorMessage = errorCodeMap[firebaseError.code]
      } else if (err instanceof Error && !err.message.includes("Firebase")) {
        // Only use error message if it's not a Firebase technical message
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
      let errorMessage = "Failed to sign up. Please try again."
      const firebaseError = err as { code?: string; message?: string }
      
      // Map all Firebase auth error codes to user-friendly messages
      const errorCodeMap: Record<string, string> = {
        "auth/network-request-failed": "Network error. Please check your internet connection.",
        "auth/email-already-in-use": "An account with this email already exists. Please sign in instead.",
        "auth/invalid-email": "Invalid email address. Please enter a valid email.",
        "auth/weak-password": "Password is too weak. Please use at least 6 characters.",
        "auth/missing-email": "Email is required.",
        "auth/missing-password": "Password is required.",
        "auth/operation-not-allowed": "Sign up is currently disabled. Please contact support.",
        "auth/invalid-verification-code": "Invalid verification code.",
        "auth/invalid-verification-id": "Invalid verification ID.",
      }
      
      if (firebaseError?.code && errorCodeMap[firebaseError.code]) {
        errorMessage = errorCodeMap[firebaseError.code]
      } else if (err instanceof Error && !err.message.includes("Firebase")) {
        // Only use error message if it's not a Firebase technical message
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
        setError,
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
