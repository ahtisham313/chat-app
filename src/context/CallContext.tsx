"use client"

import { createContext, useContext, ReactNode, useState, useEffect, useCallback, useRef } from "react"
import { CallStatus, CallType, CallParticipant } from "@/src/types/call"

interface CallContextType {
  status: CallStatus
  type: CallType | null
  participant: CallParticipant | null
  isMuted: boolean
  isVideoOff: boolean
  timer: number // in seconds
  startCall: (type: CallType, participant: CallParticipant) => void
  endCall: () => void
  toggleMute: () => void
  toggleVideo: () => void
}

const CallContext = createContext<CallContextType | undefined>(undefined)

interface CallProviderProps {
  children: ReactNode
}

export function CallProvider({ children }: CallProviderProps) {
  const [status, setStatus] = useState<CallStatus>('idle')
  const [type, setType] = useState<CallType | null>(null)
  const [participant, setParticipant] = useState<CallParticipant | null>(null)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [timer, setTimer] = useState(0)

  const ringingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const endedTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Timer logic: increment every second when connected
  useEffect(() => {
    if (status === 'connected') {
      timerIntervalRef.current = setInterval(() => {
        setTimer((prev) => prev + 1)
      }, 1000)

      return () => {
        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current)
        }
      }
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
        timerIntervalRef.current = null
      }
    }
  }, [status])

  // Reset timer when status changes
  useEffect(() => {
    if (status !== 'connected') {
      setTimer(0)
    }
  }, [status])

  const startCall = useCallback((callType: CallType, callParticipant: CallParticipant) => {
    // Clear any existing timeouts/intervals
    if (ringingTimeoutRef.current) clearTimeout(ringingTimeoutRef.current)
    if (endedTimeoutRef.current) clearTimeout(endedTimeoutRef.current)
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)

    // Reset state
    setType(callType)
    setParticipant(callParticipant)
    setIsMuted(false)
    setIsVideoOff(false)
    setTimer(0)
    setStatus('ringing')

    // Auto-transition to connected after 3 seconds
    ringingTimeoutRef.current = setTimeout(() => {
      setStatus('connected')
    }, 3000)
  }, [])

  const endCall = useCallback(() => {
    // Clear all intervals and timeouts
    if (ringingTimeoutRef.current) {
      clearTimeout(ringingTimeoutRef.current)
      ringingTimeoutRef.current = null
    }
    if (endedTimeoutRef.current) {
      clearTimeout(endedTimeoutRef.current)
      endedTimeoutRef.current = null
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current)
      timerIntervalRef.current = null
    }

    setStatus('ended')

    // Auto-transition to idle after 2 seconds
    endedTimeoutRef.current = setTimeout(() => {
      setStatus('idle')
      setType(null)
      setParticipant(null)
      setIsMuted(false)
      setIsVideoOff(false)
      setTimer(0)
    }, 2000)
  }, [])

  const toggleMute = useCallback(() => {
    if (status === 'connected') {
      setIsMuted((prev) => !prev)
    }
  }, [status])

  const toggleVideo = useCallback(() => {
    if (status === 'connected' && type === 'video') {
      setIsVideoOff((prev) => !prev)
    }
  }, [status, type])

  return (
    <CallContext.Provider
      value={{
        status,
        type,
        participant,
        isMuted,
        isVideoOff,
        timer,
        startCall,
        endCall,
        toggleMute,
        toggleVideo,
      }}
    >
      {children}
    </CallContext.Provider>
  )
}

export function useCall() {
  const context = useContext(CallContext)
  if (context === undefined) {
    throw new Error("useCall must be used within a CallProvider")
  }
  return context
}

