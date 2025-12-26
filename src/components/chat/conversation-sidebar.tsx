"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/src/lib/utils"
import { Contact } from "@/src/data/contacts"
import { getRoomId, getLastMessage, type Message } from "@/src/lib/chat-service"
import { useAuth } from "@/src/context/AuthContext"

interface ConversationSidebarProps {
  contacts: Contact[]
  currentRoomId: string | null
  onSelectConversation: (roomId: string, contact: Contact) => void
  currentUserId: string
}

interface ConversationItem {
  contact: Contact
  roomId: string
  lastMessage: Message | null
}

export function ConversationSidebar({
  contacts,
  currentRoomId,
  onSelectConversation,
  currentUserId,
}: ConversationSidebarProps) {
  const [conversations, setConversations] = useState<ConversationItem[]>([])

  useEffect(() => {
    // Create conversations for each contact (excluding current user)
    const otherContacts = contacts.filter((contact) => contact.id !== currentUserId)
    const conversationItems: ConversationItem[] = otherContacts.map((contact) => ({
      contact,
      roomId: getRoomId(currentUserId, contact.id),
      lastMessage: null,
    }))

    setConversations(conversationItems)

    // Subscribe to last messages for each conversation
    const unsubscribes: (() => void)[] = []

    conversationItems.forEach((item) => {
      const unsubscribe = getLastMessage(item.roomId, (message) => {
        setConversations((prev) =>
          prev.map((conv) =>
            conv.roomId === item.roomId ? { ...conv, lastMessage: message } : conv
          )
        )
      })
      unsubscribes.push(unsubscribe)
    })

    // Cleanup
    return () => {
      unsubscribes.forEach((unsubscribe) => unsubscribe())
    }
  }, [contacts, currentUserId])

  const formatTime = (timestamp: number) => {
    if (!timestamp) return ""
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) {
      return new Intl.DateTimeFormat("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }).format(date)
    } else if (days < 7) {
      return new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(date)
    } else {
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
      }).format(date)
    }
  }

  const sortedConversations = [...conversations].sort((a, b) => {
    const timeA = a.lastMessage?.timestamp || 0
    const timeB = b.lastMessage?.timestamp || 0
    return timeB - timeA
  })

  return (
    <div className="flex h-full flex-col border-r bg-background">
      <div className="border-b p-4">
        <h2 className="text-lg font-semibold">Chats</h2>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2">
          {sortedConversations.map((conversation) => {
            const isActive = conversation.roomId === currentRoomId
            const lastMessage = conversation.lastMessage

            return (
              <button
                key={conversation.roomId}
                onClick={() => onSelectConversation(conversation.roomId, conversation.contact)}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-lg transition-colors hover:bg-muted",
                  isActive && "bg-muted"
                )}
              >
                <Avatar className="h-12 w-12 flex-shrink-0">
                  <AvatarFallback>
                    {conversation.contact.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm truncate">
                      {conversation.contact.name}
                    </span>
                    {lastMessage && (
                      <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">
                        {formatTime(lastMessage.timestamp)}
                      </span>
                    )}
                  </div>
                  {lastMessage ? (
                    <p className="text-sm text-muted-foreground truncate">
                      {lastMessage.senderId === currentUserId ? "You: " : ""}
                      {lastMessage.text}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">No messages yet</p>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}

