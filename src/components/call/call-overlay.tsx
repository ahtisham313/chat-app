"use client"

import { Mic, MicOff, Video, VideoOff, PhoneOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useCall } from "@/src/context/CallContext"

export function CallOverlay() {
  const { status, type, participant, isMuted, isVideoOff, timer, endCall, toggleMute, toggleVideo } = useCall()

  // Don't render if idle
  if (status === 'idle' || !participant) {
    return null
  }

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Ringing state
  if (status === 'ringing') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-6">
          {/* Pulsing Avatar */}
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
            <div className="absolute inset-2 rounded-full bg-primary/30 animate-pulse" />
            <Avatar className="relative h-32 w-32 border-4 border-primary">
              <AvatarFallback className="text-3xl">
                {participant.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="text-center space-y-2">
            <h2 className="text-2xl font-semibold">{participant.name}</h2>
            <p className="text-muted-foreground">
              {type === 'video' ? 'Video call' : 'Audio call'}
            </p>
            <p className="text-lg font-medium text-primary animate-pulse">Ringing...</p>
          </div>

          <Button
            variant="destructive"
            size="lg"
            onClick={endCall}
            className="rounded-full h-14 w-14"
          >
            <PhoneOff className="h-6 w-6" />
          </Button>
        </div>
      </div>
    )
  }

  // Connected state
  if (status === 'connected') {
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-background">
        {/* Main content area */}
        <div className="flex-1 relative">
          {type === 'video' && !isVideoOff ? (
            // Video call - WhatsApp style with static images
            <>
              {/* Large background image (receiver) */}
              <div className="absolute inset-0">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop&crop=face"
                  alt="Video call background"
                  className="w-full h-full object-cover"
                />
                {/* Dark overlay for better text visibility */}
                <div className="absolute inset-0 bg-black/20" />
              </div>

              {/* Small caller image (top right) */}
              <div className="absolute top-4 right-4 z-10">
                <div className="relative">
                  <div className="w-24 h-32 rounded-lg overflow-hidden border-2 border-white shadow-lg">
                    <img
                      src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=300&fit=crop&crop=face"
                      alt="Caller video"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {/* Small indicator showing this is the caller */}
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center border-2 border-white">
                    <span className="text-xs text-primary-foreground font-medium">You</span>
                  </div>
                </div>
              </div>

              {/* Participant name and timer overlay */}
              <div className="absolute bottom-32 left-4 right-4 z-10">
                <div className="text-center">
                  <h2 className="text-2xl font-semibold text-white drop-shadow-lg">
                    {participant.name}
                  </h2>
                  <p className="text-white/80 drop-shadow">
                    Video call: Connected
                  </p>
                  <div className="text-xl font-mono font-medium text-white drop-shadow-lg mt-2">
                    {formatTimer(timer)}
                  </div>
                </div>
              </div>
            </>
          ) : (
            // Audio call or video off - gradient background with avatar
            <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-secondary/30 to-accent/30 flex items-center justify-center">
              <div className="flex flex-col items-center gap-6">
                {/* Avatar */}
                <Avatar className="h-40 w-40 border-4 border-primary/50">
                  <AvatarFallback className="text-4xl">
                    {participant.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                {/* Participant name */}
                <div className="text-center space-y-1">
                  <h2 className="text-3xl font-semibold">{participant.name}</h2>
                  <p className="text-muted-foreground">
                    {type === 'video' ? 'Video off: ' : 'Audio call: Connected'}
                  </p>
                </div>

                {/* Timer */}
                <div className="text-2xl font-mono font-medium">
                  {formatTimer(timer)}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer controls */}
        <div className="border-t bg-background/95 backdrop-blur-sm p-6">
          <div className="flex items-center justify-center gap-4 max-w-md mx-auto">
            {/* Mute/Unmute button */}
            <Button
              variant={isMuted ? "destructive" : "secondary"}
              size="lg"
              onClick={toggleMute}
              className="rounded-full h-14 w-14"
            >
              {isMuted ? (
                <MicOff className="h-6 w-6" />
              ) : (
                <Mic className="h-6 w-6" />
              )}
            </Button>

            {/* Video toggle (only for video calls) */}
            {type === 'video' && (
              <Button
                variant={isVideoOff ? "destructive" : "secondary"}
                size="lg"
                onClick={toggleVideo}
                className="rounded-full h-14 w-14"
              >
                {isVideoOff ? (
                  <VideoOff className="h-6 w-6" />
                ) : (
                  <Video className="h-6 w-6" />
                )}
              </Button>
            )}

            {/* End call button */}
            <Button
              variant="destructive"
              size="lg"
              onClick={endCall}
              className="rounded-full h-14 w-14"
            >
              <PhoneOff className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Ended state (briefly shown before going to idle)
  if (status === 'ended') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-4">
          <Avatar className="h-24 w-24 border-4 border-muted">
            <AvatarFallback className="text-2xl">
              {participant.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="text-center">
            <h2 className="text-xl font-semibold">Call Ended</h2>
            <p className="text-muted-foreground">{participant.name}</p>
          </div>
        </div>
      </div>
    )
  }

  return null
}

