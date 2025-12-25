"use client"

import { useState, useMemo, lazy, Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { mockMessages, mockCallLogs, mockUserStats } from "@/src/data"

// Lazy load components for performance
const StatsCards = lazy(() => import("@/src/components/dashboard/stats-cards").then(module => ({ default: module.StatsCards })))
const DataTable = lazy(() => import("@/src/components/dashboard/data-table").then(module => ({ default: module.DataTable })))
const Filters = lazy(() => import("@/src/components/dashboard/filters").then(module => ({ default: module.Filters })))

export default function DashboardPage() {
  const [userStatusFilter, setUserStatusFilter] = useState("all")
  const [callStatusFilter, setCallStatusChange] = useState("all")
  const [activeTab, setActiveTab] = useState<"messages" | "calls" | "users">("messages")

  // Filter data based on selected filters
  const filteredCallLogs = useMemo(() => {
    if (callStatusFilter === "all") {
      return mockCallLogs
    }
    return mockCallLogs.filter((call) => call.status === callStatusFilter)
  }, [callStatusFilter])

  const filteredUserStats = useMemo(() => {
    if (userStatusFilter === "all") {
      return mockUserStats
    }
    return mockUserStats.filter((user) => user.status === userStatusFilter)
  }, [userStatusFilter])

  // Calculate stats
  const totalMessages = mockMessages.length
  const totalCalls = mockCallLogs.length
  const activeUsers = mockUserStats.filter((user) => user.status === "active").length
  const totalCallDuration = mockCallLogs
    .filter((call) => call.status === "completed")
    .reduce((sum, call) => sum + call.duration, 0)

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Overview of messages, calls, and user activity
        </p>
      </div>

      {/* Stats Cards */}
      <Suspense fallback={<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"><div className="h-32 bg-muted animate-pulse rounded-xl" /><div className="h-32 bg-muted animate-pulse rounded-xl" /><div className="h-32 bg-muted animate-pulse rounded-xl" /><div className="h-32 bg-muted animate-pulse rounded-xl" /></div>}>
        <StatsCards
          totalMessages={totalMessages}
          totalCalls={totalCalls}
          activeUsers={activeUsers}
          totalCallDuration={totalCallDuration}
        />
      </Suspense>

      {/* Tabs and Filters */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("messages")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === "messages"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              Messages
            </button>
            <button
              onClick={() => setActiveTab("calls")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === "calls"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              Calls
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === "users"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              Users
            </button>
          </div>

          <Suspense fallback={<div className="h-10 w-48 bg-muted animate-pulse rounded-md" />}>
            <Filters
              userStatusFilter={userStatusFilter}
              callStatusFilter={callStatusFilter}
              onUserStatusChange={setUserStatusFilter}
              onCallStatusChange={setCallStatusChange}
              showUserFilter={activeTab === "users"}
              showCallFilter={activeTab === "calls"}
            />
          </Suspense>
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
            <Suspense fallback={<div className="h-96 bg-muted animate-pulse rounded-md" />}>
              {activeTab === "messages" && (
                <DataTable data={mockMessages} type="messages" itemsPerPage={10} />
              )}
              {activeTab === "calls" && (
                <DataTable data={filteredCallLogs} type="calls" itemsPerPage={10} />
              )}
              {activeTab === "users" && (
                <DataTable data={filteredUserStats} type="users" itemsPerPage={10} />
              )}
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

