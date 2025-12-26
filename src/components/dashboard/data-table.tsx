"use client"

import { useMemo } from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Pagination } from "./pagination"
import type {
  DashboardMessage,
  DashboardCallLog,
  DashboardUserStat,
} from "@/src/types/dashboard"
import { Eye, Phone, Video } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

type TableData = DashboardCallLog | DashboardUserStat | DashboardMessage

interface DataTableProps<T extends TableData> {
  data: T[]
  type: "calls" | "users" | "messages"
  itemsPerPage?: number
}

export function DataTable<T extends TableData>({
  data,
  type,
  itemsPerPage = 10,
}: DataTableProps<T>) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const totalPages = Math.ceil(data.length / itemsPerPage)
  
  // Get page from URL, but only if it matches the current tab type
  // This prevents cross-tab page number issues
  const urlTab = searchParams.get("tab")
  const pageParam = urlTab === type ? searchParams.get("page") : null
  const rawPage = parseInt(pageParam || "1", 10)
  const currentPage = Math.max(1, Math.min(rawPage, totalPages || 1))

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return data.slice(startIndex, endIndex)
  }, [data, currentPage, itemsPerPage])

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    // Ensure tab is set in URL
    if (!params.get("tab")) {
      params.set("tab", type)
    }
    if (page === 1) {
      params.delete("page")
    } else {
      params.set("page", page.toString())
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`
    }
    if (minutes > 0) {
      return `${minutes}m ${secs}s`
    }
    return `${secs}s`
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      completed: { variant: "default", label: "Completed" },
      missed: { variant: "destructive", label: "Missed" },
      declined: { variant: "secondary", label: "Declined" },
      ongoing: { variant: "default", label: "Ongoing" },
      active: { variant: "default", label: "Active" },
      inactive: { variant: "secondary", label: "Inactive" },
      away: { variant: "outline", label: "Away" },
    }

    const config = statusConfig[status] || { variant: "default" as const, label: status }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const getAvatarUrl = (id: string) => {
    const numericId = id.replace(/[^0-9]/g, '') || '1'
    return `https://i.pravatar.cc/150?img=${numericId}`
  }

  const renderCallRow = (call: DashboardCallLog) => (
    <TableRow key={call.id} className="hover:bg-muted/50 transition-colors">
      <TableCell className="font-medium whitespace-nowrap">
        <div className="flex items-center gap-2">
          <Image
            src={getAvatarUrl(call.callerId)}
            alt={call.callerName}
            width={24}
            height={24}
            className="rounded-full shrink-0"
          />
          {call.type === "video" ? (
            <Video className="h-4 w-4 text-muted-foreground shrink-0" />
          ) : (
            <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
          )}
          <span className="truncate max-w-[120px] sm:max-w-none">{call.callerName}</span>
        </div>
      </TableCell>
      <TableCell className="whitespace-nowrap">
        <span className="truncate max-w-[120px] sm:max-w-none block">{call.receiverName}</span>
      </TableCell>
      <TableCell className="whitespace-nowrap">{getStatusBadge(call.status)}</TableCell>
      <TableCell className="whitespace-nowrap">
        {call.status === "completed" && call.duration > 0
          ? formatDuration(call.duration)
          : call.status === "ongoing"
          ? "In progress"
          : "-"}
      </TableCell>
      <TableCell className="whitespace-nowrap text-xs sm:text-sm">{formatDate(call.startTime)}</TableCell>
      <TableCell className="whitespace-nowrap">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/call/${call.roomId}`}>
                  <Eye className="h-4 w-4" />
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>View call details</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </TableCell>
    </TableRow>
  )

  const renderUserRow = (user: DashboardUserStat) => (
    <TableRow key={user.id} className="hover:bg-muted/50 transition-colors">
      <TableCell className="font-medium whitespace-nowrap">
        <div className="flex items-center gap-2">
          {user.avatar && (
            <Image
              src={user.avatar}
              alt={user.userName}
              width={32}
              height={32}
              className="rounded-full shrink-0"
            />
          )}
          <span className="truncate max-w-[120px] sm:max-w-none">{user.userName}</span>
        </div>
      </TableCell>
      <TableCell className="whitespace-nowrap">
        <span className="truncate max-w-[150px] sm:max-w-none block">{user.email}</span>
      </TableCell>
      <TableCell className="whitespace-nowrap">{getStatusBadge(user.status)}</TableCell>
      <TableCell className="whitespace-nowrap text-xs sm:text-sm">{formatDate(user.lastSeen)}</TableCell>
      <TableCell className="whitespace-nowrap">{user.totalMessages}</TableCell>
      <TableCell className="whitespace-nowrap">{user.totalCalls}</TableCell>
      <TableCell className="whitespace-nowrap">{formatDuration(user.totalCallDuration)}</TableCell>
      <TableCell className="whitespace-nowrap">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/user/${user.userId}`}>
                  <Eye className="h-4 w-4" />
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>View user details</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </TableCell>
    </TableRow>
  )

  const renderMessageRow = (message: DashboardMessage) => (
    <TableRow key={message.id} className="hover:bg-muted/50 transition-colors">
      <TableCell className="font-medium whitespace-nowrap">
        <div className="flex items-center gap-2">
          <Image
            src={getAvatarUrl(message.senderId)}
            alt={message.senderName}
            width={24}
            height={24}
            className="rounded-full shrink-0"
          />
          <span className="truncate max-w-[120px] sm:max-w-none">{message.senderName}</span>
        </div>
      </TableCell>
      <TableCell>
        <span className="truncate max-w-[200px] sm:max-w-[300px] block">
          {message.content.substring(0, 50)}{message.content.length > 50 ? "..." : ""}
        </span>
      </TableCell>
      <TableCell className="whitespace-nowrap">
        <Badge variant="outline">{message.type}</Badge>
      </TableCell>
      <TableCell className="whitespace-nowrap text-xs sm:text-sm">{formatDate(message.timestamp)}</TableCell>
      <TableCell className="whitespace-nowrap">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/chat/${message.roomId}`}>
                  <Eye className="h-4 w-4" />
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>View chat room</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </TableCell>
    </TableRow>
  )

  const getTableHeaders = () => {
    switch (type) {
      case "calls":
        return ["Caller", "Receiver", "Status", "Duration", "Start Time", "Actions"]
      case "users":
        return ["Name", "Email", "Status", "Last Seen", "Messages", "Calls", "Total Duration", "Actions"]
      case "messages":
        return ["Sender", "Content", "Type", "Timestamp", "Actions"]
      default:
        return []
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border overflow-hidden">
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <div className="inline-block min-w-full align-middle px-4 sm:px-0">
            <Table>
              <TableHeader>
                <TableRow>
                  {getTableHeaders().map((header) => (
                    <TableHead key={header} className="whitespace-nowrap">{header}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={getTableHeaders().length} className="text-center py-8 text-muted-foreground">
                      No data available
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map((item) => {
                    if (type === "calls") {
                      return renderCallRow(item as DashboardCallLog)
                    } else if (type === "users") {
                      return renderUserRow(item as DashboardUserStat)
                    } else {
                      return renderMessageRow(item as DashboardMessage)
                    }
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  )
}

