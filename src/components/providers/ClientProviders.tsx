"use client"

import { Suspense } from "react"
import { ThemeProvider } from "next-themes"
import { AuthProvider } from "@/src/context/AuthContext"
import { CallProvider } from "@/src/context/CallContext"
import { CallOverlay } from "@/src/components/call/call-overlay"

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
        <AuthProvider>
          <CallProvider>
            {children}
            <CallOverlay />
          </CallProvider>
        </AuthProvider>
      </Suspense>
    </ThemeProvider>
  )
}

