"use client"

import { useState, useMemo } from "react"
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
import { CallLog } from "../../data/callLogs"
import { UserStat } from "../../data/userStats"
import { Message } from "../../data/messages"
import { Eye, Phone, Video, Clock } from "lucide-react"
import Link from "next/link"

type TableData = CallLog | UserStat | Message

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
  const [currentPage, setCurrentPage] = useState(1)

  const totalPages = Math.ceil(data.length / itemsPerPage)

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return data.slice(startIndex, endIndex)
  }, [data, currentPage, itemsPerPage])

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

  const renderCallRow = (call: CallLog) => (
    <TableRow key={call.id} className="hover:bg-muted/50 transition-colors">
      <TableCell className="font-medium">
        <div className="flex items-center gap-2">
          {call.type === "video" ? (
            <Video className="h-4 w-4 text-muted-foreground" />
          ) : (
            <Phone className="h-4 w-4 text-muted-foreground" />
          )}
          {call.callerName}
        </div>
      </TableCell>
      <TableCell>{call.receiverName}</TableCell>
      <TableCell>{getStatusBadge(call.status)}</TableCell>
      <TableCell>
        {call.status === "completed" && call.duration > 0
          ? formatDuration(call.duration)
          : call.status === "ongoing"
          ? "In progress"
          : "-"}
      </TableCell>
      <TableCell>{formatDate(call.startTime)}</TableCell>
      <TableCell>
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

  const renderUserRow = (user: UserStat) => (
    <TableRow key={user.id} className="hover:bg-muted/50 transition-colors">
      <TableCell className="font-medium">{user.userName}</TableCell>
      <TableCell>{user.email}</TableCell>
      <TableCell>{getStatusBadge(user.status)}</TableCell>
      <TableCell>{formatDate(user.lastSeen)}</TableCell>
      <TableCell>{user.totalMessages}</TableCell>
      <TableCell>{user.totalCalls}</TableCell>
      <TableCell>{formatDuration(user.totalCallDuration)}</TableCell>
      <TableCell>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/user/${user.id}`}>
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

  const renderMessageRow = (message: Message) => (
    <TableRow key={message.id} className="hover:bg-muted/50 transition-colors">
      <TableCell className="font-medium">{message.senderName}</TableCell>
      <TableCell>{message.content.substring(0, 50)}{message.content.length > 50 ? "..." : ""}</TableCell>
      <TableCell>
        <Badge variant="outline">{message.type}</Badge>
      </TableCell>
      <TableCell>{formatDate(message.timestamp)}</TableCell>
      <TableCell>
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
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {getTableHeaders().map((header) => (
                <TableHead key={header}>{header}</TableHead>
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
                  return renderCallRow(item as CallLog)
                } else if (type === "users") {
                  return renderUserRow(item as UserStat)
                } else {
                  return renderMessageRow(item as Message)
                }
              })
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  )
}

