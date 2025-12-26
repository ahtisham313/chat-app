"use client"

import { useState, useMemo, useEffect, useRef, startTransition } from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { StatsCards } from "@/src/components/dashboard/stats-cards"
import { DataTable } from "@/src/components/dashboard/data-table"
import { Filters } from "@/src/components/dashboard/filters"
import { ProtectedRoute } from "@/src/components/auth/ProtectedRoute"
import { useAuth } from "@/src/context/AuthContext"
import { fetchDashboardData } from "@/src/lib/api"
import { Navbar } from "@/src/components/layout/Navbar"
import type {
  DashboardMessage,
  DashboardCallLog,
  DashboardUserStat,
  DashboardStats,
} from "@/src/types/dashboard"

type TabType = "messages" | "calls" | "users"

export function DashboardClient() {
  const { user } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [messages, setMessages] = useState<DashboardMessage[]>([])
  const [callLogs, setCallLogs] = useState<DashboardCallLog[]>([])
  const [userStats, setUserStats] = useState<DashboardUserStat[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    totalMessages: 0,
    totalCalls: 0,
    activeUsers: 0,
    totalCallDuration: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeoutError, setTimeoutError] = useState<Error | null>(null)
  const [userStatusFilter, setUserStatusFilter] = useState("all")
  const [callStatusFilter, setCallStatusFilter] = useState("all")
  
  // Get activeTab from URL params, default to "messages"
  const urlTab = searchParams.get("tab") as TabType | null
  const [activeTab, setActiveTab] = useState<TabType>(
    urlTab && ["messages", "calls", "users"].includes(urlTab) ? urlTab : "messages"
  )
  
  const mountedRef = useRef(false)
  const fetchingRef = useRef(false)
  const lastUserIdRef = useRef<string | undefined>(undefined)
  const timeoutErrorRef = useRef<Error | null>(null)

  // Sync activeTab with URL params on mount and when URL changes
  useEffect(() => {
    const urlTab = searchParams.get("tab") as TabType | null
    if (urlTab && ["messages", "calls", "users"].includes(urlTab)) {
      if (urlTab !== activeTab) {
        setActiveTab(urlTab)
      }
    }
  }, [searchParams, activeTab])

  // Ensure tab is in URL on initial mount
  useEffect(() => {
    const urlTab = searchParams.get("tab")
    if (!urlTab) {
      const params = new URLSearchParams(searchParams.toString())
      params.set("tab", activeTab)
      router.replace(`${pathname}?${params.toString()}`)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run on mount

  // Update URL when tab changes
  const handleTabChange = (tab: TabType) => {
    startTransition(() => {
      setActiveTab(tab)
      const params = new URLSearchParams(searchParams.toString())
      params.set("tab", tab)
      // Reset page to 1 when changing tabs
      params.delete("page")
      router.push(`${pathname}?${params.toString()}`)
    })
  }

  // Fetch dashboard data when user is available
  useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined") return;
    
    mountedRef.current = true
    const currentUserId = user?.uid
    
    // Only fetch if userId actually changed and we're not already fetching
    if (currentUserId && currentUserId !== lastUserIdRef.current && !fetchingRef.current) {
      lastUserIdRef.current = currentUserId
      fetchingRef.current = true
      setLoading(true)
      setError(null)
      
      // Set up timeout to trigger error after 5 seconds
      let timeoutId: NodeJS.Timeout | null = null
      
      const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => {
          if (mountedRef.current && fetchingRef.current) {
            fetchingRef.current = false
            reject(new Error("Request timeout: API did not respond within 5 seconds"))
          }
        }, 5000)
      })

      Promise.race([
        fetchDashboardData(currentUserId),
        timeoutPromise
      ])
        .then((data) => {
          if (timeoutId) clearTimeout(timeoutId)
          if (mountedRef.current) {
            setMessages(data.messages)
            setCallLogs(data.callLogs)
            setUserStats(data.userStats)
            setStats(data.stats)
            setError(null)
            setTimeoutError(null)
            timeoutErrorRef.current = null
            setLoading(false)
          }
          fetchingRef.current = false
        })
        .catch((error) => {
          if (timeoutId) clearTimeout(timeoutId)
          fetchingRef.current = false
          
          if (mountedRef.current) {
            const errorMessage = error instanceof Error ? error.message : "Failed to load dashboard data"
            console.error("Failed to fetch dashboard data:", error)
            
            // If it's a timeout error, clear data and set error to trigger error boundary
            if (errorMessage.includes('timeout') || errorMessage.includes('5 seconds')) {
              const timeoutErr = new Error("Request timeout: API did not respond within 5 seconds")
              // Clear all data so nothing renders
              setMessages([])
              setCallLogs([])
              setUserStats([])
              setStats({
                totalMessages: 0,
                totalCalls: 0,
                activeUsers: 0,
                totalCallDuration: 0,
              })
              // Set both ref and state - ref for immediate check, state for re-render
              timeoutErrorRef.current = timeoutErr
              setTimeoutError(timeoutErr)
              setLoading(false)
              setError(null) // Don't show inline error for timeout
            } else {
              setError(errorMessage)
              setLoading(false)
            }
          }
        })
    } else if (!currentUserId && lastUserIdRef.current) {
      // Reset state when user is not available (only if we had a user before)
      lastUserIdRef.current = undefined
      setLoading(false)
      setMessages([])
      setCallLogs([])
      setUserStats([])
      setStats({
        totalMessages: 0,
        totalCalls: 0,
        activeUsers: 0,
        totalCallDuration: 0,
      })
    }
    
    return () => {
      mountedRef.current = false
    }
  }, [user?.uid])

  // Filter data based on selected filters
  const filteredCallLogs = useMemo(() => {
    if (callStatusFilter === "all") {
      return callLogs
    }
    return callLogs.filter((call) => call.status === callStatusFilter)
  }, [callStatusFilter, callLogs])

  const filteredUserStats = useMemo(() => {
    if (userStatusFilter === "all") {
      return userStats
    }
    return userStats.filter((user) => user.status === userStatusFilter)
  }, [userStatusFilter, userStats])

  // If timeout error occurred, throw immediately to trigger error boundary
  // This MUST be checked before ANY rendering - throw during render phase
  const errorToThrow = timeoutError || timeoutErrorRef.current
  if (errorToThrow) {
    // Clear the ref to prevent re-throwing
    timeoutErrorRef.current = null
    // Throw during render to trigger error boundary - this will show error.tsx
    throw errorToThrow
  }

  // Don't render anything if we're about to throw
  // This ensures no content renders before error boundary catches it
  return (
    <ProtectedRoute>
      <Navbar />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 space-y-4 sm:space-y-6 lg:space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">
          Overview of messages, calls, and user activity
        </p>
      </div>

      {/* Error Message - Only show for non-timeout errors */}
      {error && !timeoutError && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error Loading Dashboard</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <button
              onClick={() => {
                if (user?.uid) {
                  fetchingRef.current = false
                  setError(null)
                  setTimeoutError(null)
                  setLoading(true)
                  // Trigger refetch by updating dependency
                  const currentUid = user.uid
                  lastUserIdRef.current = undefined
                  fetchDashboardData(currentUid)
                    .then((data) => {
                      setMessages(data.messages)
                      setCallLogs(data.callLogs)
                      setUserStats(data.userStats)
                      setStats(data.stats)
                      setError(null)
                      setLoading(false)
                    })
                    .catch((err) => {
                      const errMessage = err instanceof Error ? err.message : "Failed to load dashboard data"
                      if (errMessage.includes('timeout') || errMessage.includes('5 seconds')) {
                        setTimeoutError(new Error(errMessage))
                      } else {
                        setError(errMessage)
                      }
                      setLoading(false)
                    })
                }
              }}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Retry
            </button>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      {loading && !timeoutError ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-5 w-32 bg-muted animate-pulse rounded" />
                <div className="h-5 w-5 bg-muted animate-pulse rounded" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-20 bg-muted animate-pulse rounded mb-2" />
                <div className="h-4 w-24 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <StatsCards
          totalMessages={stats.totalMessages}
          totalCalls={stats.totalCalls}
          activeUsers={stats.activeUsers}
          totalCallDuration={stats.totalCallDuration}
        />
      )}

      {/* Tabs and Filters */}
      <div className="space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2 sm:gap-4">
          <div className="flex gap-1 sm:gap-2 overflow-x-auto pb-2 sm:pb-0">
            <button
              onClick={() => handleTabChange("messages")}
              className={`px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === "messages"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              Messages
            </button>
            <button
              onClick={() => handleTabChange("calls")}
              className={`px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === "calls"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              Calls
            </button>
            <button
              onClick={() => handleTabChange("users")}
              className={`px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === "users"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              Users
            </button>
          </div>

          <Filters
            userStatusFilter={userStatusFilter}
            callStatusFilter={callStatusFilter}
            onUserStatusChange={setUserStatusFilter}
            onCallStatusChange={setCallStatusFilter}
            showUserFilter={activeTab === "users"}
            showCallFilter={activeTab === "calls"}
          />
        </div>

        {/* Data Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              {activeTab === "messages"
                ? "Recent Messages"
                : activeTab === "calls"
                ? "Call Logs"
                : "User Statistics"}
            </CardTitle>
            <CardDescription>
              {activeTab === "messages"
                ? "View and manage all messages"
                : activeTab === "calls"
                ? "View call history and status"
                : "View user statistics and activity"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading && !error && !timeoutError ? (
              <div className="h-96 bg-muted animate-pulse rounded-md" />
            ) : error && !timeoutError ? (
              <div className="h-96 flex items-center justify-center text-muted-foreground">
                Unable to load data. Please try again.
              </div>
            ) : !error && !timeoutError ? (
              <>
                {activeTab === "messages" && (
                  <DataTable data={messages} type="messages" itemsPerPage={10} />
                )}
                {activeTab === "calls" && (
                  <DataTable data={filteredCallLogs} type="calls" itemsPerPage={10} />
                )}
                {activeTab === "users" && (
                  <DataTable data={filteredUserStats} type="users" itemsPerPage={10} />
                )}
              </>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
    </ProtectedRoute>
  )
}

