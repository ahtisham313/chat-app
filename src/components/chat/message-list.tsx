"use client"

import { useEffect, useRef } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Message } from "@/src/lib/chat-service"

interface MessageListProps {
  messages: Message[]
  currentUserId: string
}

export function MessageList({ messages, currentUserId }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const formatTime = (timestamp: number) => {
    if (!timestamp) return ""
    const date = new Date(timestamp)
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(date)
  }

  return (
    <ScrollArea className="flex-1 p-4">
      <div className="space-y-4">
        {messages.map((message) => {
          const isCurrentUser = message.senderId === currentUserId

          return (
            <div
              key={message.id}
              className={`flex gap-3 ${
                isCurrentUser ? "justify-end" : "justify-start"
              }`}
            >
              {!isCurrentUser && (
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarFallback className="text-xs">
                    {message.senderName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              )}

              <div
                className={`max-w-[70%] sm:max-w-[60%] lg:max-w-[50%] ${
                  isCurrentUser ? "order-first" : ""
                }`}
              >
                {!isCurrentUser && (
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-foreground">
                      {message.senderName}
                    </span>
                    <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                      {formatTime(message.timestamp)}
                    </Badge>
                  </div>
                )}

                <div
                  className={`rounded-lg px-3 py-2 text-sm ${
                    isCurrentUser
                      ? "bg-primary text-primary-foreground ml-auto"
                      : "bg-muted"
                  }`}
                >
                  {message.text}
                </div>

                {isCurrentUser && (
                  <div className="flex justify-end mt-1">
                    <Badge variant="outline" className="text-xs px-1.5 py-0.5">
                      {formatTime(message.timestamp)}
                    </Badge>
                  </div>
                )}
              </div>

              {isCurrentUser && (
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarFallback className="text-xs">
                    {message.senderName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  )
}
