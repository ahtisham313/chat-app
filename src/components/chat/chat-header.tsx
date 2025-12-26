"use client"

import { Phone, Video } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "./theme-toggle"
import { useCall } from "@/src/context/CallContext"

interface ChatHeaderProps {
  contactName: string
  isOnline?: boolean
  lastSeen?: number
  contactId?: string
}

export function ChatHeader({ contactName, isOnline = false, lastSeen, contactId }: ChatHeaderProps) {
  const { startCall } = useCall()

  const handleStartAudioCall = () => {
    startCall('audio', {
      name: contactName,
    })
  }

  const handleStartVideoCall = () => {
    startCall('video', {
      name: contactName,
    })
  }
  const formatLastSeen = (timestamp: number) => {
    if (!timestamp) return "never"
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 1) return "just now"
    if (minutes < 60) return `${minutes} minutes ago`
    if (hours < 24) return `${hours} hours ago`
    if (days < 7) return `${days} days ago`
    
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    }).format(date)
  }

  return (
    <div className="flex sticky top-0 z-50 items-center justify-between border-b bg-background px-4 py-3">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <Avatar className="h-10 w-10 shrink-0">
          <AvatarFallback>
            {contactName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <h1 className="font-semibold text-foreground truncate">{contactName}</h1>
          <div className="text-sm text-muted-foreground">
            {isOnline ? (
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-green-500"></span>
                online
              </span>
            ) : (
              <span>
                last seen {lastSeen ? formatLastSeen(lastSeen) : "recently"}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleStartAudioCall}
          className="h-9 w-9"
          title="Start audio call"
        >
          <Phone className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleStartVideoCall}
          className="h-9 w-9"
          title="Start video call"
        >
          <Video className="h-4 w-4" />
        </Button>
        <ThemeToggle />
      </div>
    </div>
  )
}
