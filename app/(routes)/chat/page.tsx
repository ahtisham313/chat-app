"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ChatHeader } from "@/src/components/chat/chat-header"
import { MessageList } from "@/src/components/chat/message-list"
import { MessageInput } from "@/src/components/chat/message-input"
import { ConversationSidebar } from "@/src/components/chat/conversation-sidebar"
import { listenMessages, sendMessage, getRoomId, type Message } from "@/src/lib/chat-service"
import { useAuth } from "@/src/context/AuthContext"
import { mockContacts, type Contact } from "@/src/data/contacts"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { cn } from "@/src/lib/utils"

// Display current user info for testing - positioned to not overlap with header
function UserIndicator({ userId, userName, userParam }: { userId: string; userName: string; userParam: string | null }) {
  return (
    // <div className="fixed bottom-4 right-4 z-40 bg-muted border border-border px-3 py-2 rounded-lg text-xs font-medium shadow-lg">
    //   {/* <div className="font-semibold text-foreground">You are:</div> */}
    //   {/* <div className="text-muted-foreground">{userName}</div> */}
    //   {/* <div className="text-muted-foreground text-[10px] mt-1 opacity-75">?user={userParam || "none"}</div> */}
    // </div>
    null
  )
}

function ChatPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null)
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [showSidebar, setShowSidebar] = useState(true)
  const { currentUser } = useAuth()
  const userParam = searchParams.get("user")

  // Redirect if no user param in URL
  useEffect(() => {
    if (!userParam) {
      // Default to user1 if no param
      router.replace("/chat?user=user1")
    }
  }, [userParam, router])

  // Auto-select first conversation on mount
  useEffect(() => {
    if (currentUser && mockContacts.length > 0) {
      const otherContacts = mockContacts.filter((c) => c.id !== currentUser.id)
      if (otherContacts.length > 0) {
        const firstContact = otherContacts[0]
        const roomId = getRoomId(currentUser.id, firstContact.id)
        setCurrentRoomId(roomId)
        setSelectedContact(firstContact)
        setShowSidebar(false) // Hide sidebar on mobile after selection
      }
    }
  }, [currentUser])

  // Listen to messages for current room
  useEffect(() => {
    if (!currentRoomId || !currentUser) {
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
  }, [currentRoomId, currentUser])

  const handleSelectConversation = (roomId: string, contact: Contact) => {
    setCurrentRoomId(roomId)
    setSelectedContact(contact)
    setShowSidebar(false) // Hide sidebar on mobile after selection
  }

  const handleSendMessage = async (text: string) => {
    if (!currentUser || !text.trim() || !currentRoomId) return

    try {
      await sendMessage({
        text,
        senderId: currentUser.id,
        senderName: currentUser.name,
        roomId: currentRoomId,
      })
    } catch (error) {
      console.error("Failed to send message:", error)
    }
  }

  const handleBackToSidebar = () => {
    setShowSidebar(true)
    setSelectedContact(null)
    setCurrentRoomId(null)
  }

  // Mobile view: show sidebar OR chat (not both)
  // Desktop view: show sidebar AND chat side by side
  return (
    <div className="flex h-screen bg-background">
      {/* User indicator for testing */}
      {currentUser && (
        <UserIndicator userId={currentUser.id} userName={currentUser.name} userParam={userParam} />
      )}
      {/* Sidebar - Hidden on mobile when chat is open */}
      <div
        className={cn(
          "hidden lg:block lg:w-80 shrink-0",
          showSidebar && "block w-full lg:w-80"
        )}
      >
        <ConversationSidebar
          contacts={mockContacts}
          currentRoomId={currentRoomId}
          onSelectConversation={handleSelectConversation}
          currentUserId={currentUser?.id || ""}
        />
      </div>

      {/* Chat Area */}
      {selectedContact && currentRoomId ? (
        <div className="flex-1 flex flex-col min-w-0">
          {/* Mobile back button */}
          <div className="lg:hidden border-b p-2 flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBackToSidebar}
              className="h-8 w-8"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-medium text-primary">
                  {selectedContact.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="font-medium">{selectedContact.name}</span>
            </div>
          </div>

          <ChatHeader
            contactName={selectedContact.name}
            isOnline={true}
            lastSeen={Date.now() - 5 * 60 * 1000} // 5 minutes ago as example
            contactId={selectedContact.id}
          />

          {isLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-muted-foreground">Loading messages...</div>
            </div>
          ) : (
            <MessageList
              messages={messages}
              currentUserId={currentUser?.id || ""}
            />
          )}

          <MessageInput
            onSendMessage={handleSendMessage}
            disabled={!currentUser || isLoading}
          />
        </div>
      ) : (
        // Empty state when no conversation selected (desktop only)
        <div className="hidden lg:flex flex-1 items-center justify-center">
          <div className="text-center text-muted-foreground">
            <p className="text-lg mb-2">Select a conversation</p>
            <p className="text-sm">Choose a contact from the sidebar to start chatting</p>
          </div>
        </div>
      )}
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
