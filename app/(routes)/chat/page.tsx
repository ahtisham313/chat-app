"use client"

import { useState, useEffect, Suspense } from "react"
import { ChatHeader } from "@/src/components/chat/chat-header"
import { MessageList } from "@/src/components/chat/message-list"
import { MessageInput } from "@/src/components/chat/message-input"
import { ConversationSidebar } from "@/src/components/chat/conversation-sidebar"
import { listenMessages, sendMessage, getRoomId, type Message } from "@/src/lib/chat-service"
import { useAuth } from "@/src/context/AuthContext"
import { listenUsers } from "@/src/lib/users-service"
import { type Contact } from "@/src/data/contacts"
import { Navbar } from "@/src/components/layout/Navbar"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { cn } from "@/src/lib/utils"

function ChatPageContent() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null)
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [showSidebar, setShowSidebar] = useState(true)
  const [contacts, setContacts] = useState<Contact[]>([])
  const { user } = useAuth()

  // Listen to real Firebase users
  useEffect(() => {
    if (!user) {
      setContacts([])
      return
    }

    const unsubscribe = listenUsers(user.uid, (users) => {
      setContacts(users)
    })

    return () => {
      unsubscribe()
    }
  }, [user])

  // Auto-select first conversation on mount when contacts are loaded (desktop only)
  useEffect(() => {
    if (typeof window === "undefined") return
    
    // Only auto-select on desktop (lg breakpoint and above)
    // Use matchMedia for better performance than checking window.innerWidth
    const mediaQuery = window.matchMedia("(min-width: 1024px)")
    const isDesktop = mediaQuery.matches
    
    if (isDesktop && user && contacts.length > 0 && !selectedContact) {
      const firstContact = contacts[0]
      const roomId = getRoomId(user.uid, firstContact.id)
      setCurrentRoomId(roomId)
      setSelectedContact(firstContact)
      // Keep sidebar visible on desktop (it's always visible there)
    }
  }, [user, contacts, selectedContact])

  // Listen to messages for current room
  useEffect(() => {
    if (!currentRoomId || !user) {
      setMessages([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    const unsubscribe = listenMessages(currentRoomId, (newMessages) => {
      setMessages(newMessages)
      setIsLoading(false)
    })

    return () => {
      unsubscribe()
    }
  }, [currentRoomId, user])

  const handleSelectConversation = (roomId: string, contact: Contact) => {
    setCurrentRoomId(roomId)
    setSelectedContact(contact)
    setShowSidebar(false) // Hide sidebar on mobile after selection
  }

  const handleSendMessage = async (text: string) => {
    if (!user || !text.trim() || !currentRoomId) return

    try {
      await sendMessage({
        text,
        senderId: user.uid,
        senderName: user.displayName || user.email || "Guest",
        roomId: currentRoomId,
      })
    } catch (error) {
      console.error("Failed to send message:", error)
    }
  }

  const handleBackToSidebar = () => {
    // On mobile, show sidebar and hide chat
    setShowSidebar(true)
    setSelectedContact(null)
    setCurrentRoomId(null)
    setMessages([]) // Clear messages when going back
  }

  // Mobile view: show sidebar OR chat (not both) - like WhatsApp
  // Desktop view: show sidebar AND chat side by side
  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      <Navbar />
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Sidebar - Show on mobile when no chat selected, always on desktop */}
        <div
          className={cn(
            "hidden lg:flex lg:w-80 shrink-0 border-r h-full",
            showSidebar && "flex w-full lg:w-80"
          )}
        >
          <ConversationSidebar
            contacts={contacts}
            currentRoomId={currentRoomId}
            onSelectConversation={handleSelectConversation}
            currentUserId={user?.uid || ""}
          />
        </div>

        {/* Chat Area - Hidden on mobile when sidebar is shown */}
        {selectedContact && currentRoomId ? (
          <div className={cn(
            "flex-1 flex flex-col min-w-0 h-full overflow-hidden",
            !showSidebar && "w-full",
            showSidebar && "hidden lg:flex"
          )}>
            {/* Mobile back button */}
            <div className="lg:hidden border-b p-2 sm:p-3 flex items-center gap-2 bg-background shrink-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBackToSidebar}
                className="h-8 w-8 shrink-0"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-2 min-w-0 flex-1">
                {selectedContact.avatar ? (
                  <img
                    src={selectedContact.avatar}
                    alt={selectedContact.name}
                    className="h-8 w-8 rounded-full shrink-0"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-sm font-medium text-primary">
                      {selectedContact.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <span className="font-medium truncate">{selectedContact.name}</span>
              </div>
            </div>

            {/* Chat Header - Fixed at top */}
            <div className="shrink-0">
              <ChatHeader
                contactName={selectedContact.name}
                isOnline={false}
                lastSeen={undefined}
              />
            </div>

            {/* Messages Area - Scrollable, takes remaining space */}
            <div className="flex-1 min-h-0 overflow-hidden">
              {isLoading ? (
                <div className="flex h-full items-center justify-center">
                  <div className="text-muted-foreground">Loading messages...</div>
                </div>
              ) : (
                <MessageList
                  messages={messages}
                  currentUserId={user?.uid || ""}
                />
              )}
            </div>

            {/* Message Input - Fixed at bottom */}
            <div className="shrink-0">
              <MessageInput
                onSendMessage={handleSendMessage}
                disabled={!user || isLoading}
              />
            </div>
          </div>
        ) : (
          // Empty state when no conversation selected (desktop only)
          // On mobile, if no chat selected, sidebar is shown (handled by showSidebar state)
          <div className="hidden lg:flex flex-1 items-center justify-center">
            <div className="text-center text-muted-foreground">
              <p className="text-lg mb-2">Select a conversation</p>
              <p className="text-sm">Choose a contact from the sidebar to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ChatPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    }>
      <ChatPageContent />
    </Suspense>
  )
}
