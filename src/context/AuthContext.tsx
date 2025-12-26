"use client"

import { createContext, useContext, ReactNode, useMemo } from "react"
import { useSearchParams } from "next/navigation"

export interface User {
  id: string
  name: string
  email?: string
}

interface AuthContextType {
  currentUser: User | null
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Default users for simulation - consistent naming
const defaultUsers: Record<string, User> = {
  user_1: {
    id: "user_1",
    name: "User 1",
    email: "user1@example.com",
  },
  user_2: {
    id: "user_2",
    name: "User 2",
    email: "user2@example.com",
  },
  user_3: {
    id: "user_3",
    name: "User 3",
    email: "user3@example.com",
  },
  user_4: {
    id: "user_4",
    name: "User 4",
    email: "user4@example.com",
  },
  user_5: {
    id: "user_5",
    name: "User 5",
    email: "user5@example.com",
  },
  // Support shorter format too
  user1: {
    id: "user_1",
    name: "User 1",
    email: "user1@example.com",
  },
  user2: {
    id: "user_2",
    name: "User 2",
    email: "user2@example.com",
  },
}

// Fallback default user
const defaultUser: User = {
  id: "user_1",
  name: "User 1",
  email: "user1@example.com",
}

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const searchParams = useSearchParams()
  const userParam = searchParams.get("user")

  const currentUser = useMemo(() => {
    // Normalize user param (support both user1 and user_1 formats)
    let normalizedParam = userParam
    if (normalizedParam && !normalizedParam.startsWith("user_")) {
      // Convert user1 -> user_1, user2 -> user_2
      const match = normalizedParam.match(/^user(\d+)$/i)
      if (match) {
        normalizedParam = `user_${match[1]}`
      } else {
        normalizedParam = `user_${normalizedParam}`
      }
    }

    if (normalizedParam) {
      // Check if user exists in defaultUsers
      if (defaultUsers[normalizedParam]) {
        return defaultUsers[normalizedParam]
      }
      // Also check original param format
      if (defaultUsers[userParam || ""]) {
        return defaultUsers[userParam || ""]
      }
      // Create user from param with consistent naming
      const userNumber = normalizedParam.replace("user_", "")
      return {
        id: normalizedParam,
        name: `User ${userNumber}`,
        email: `${normalizedParam}@example.com`,
      }
    }
    return defaultUser
  }, [userParam])

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: true,
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
