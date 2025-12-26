"use client"

import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Phone, PhoneOff, Clock, Users } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { mockCallLogs } from "@/src/data"
import { CallLog } from "@/src/data/callLogs"

export default function CallRoomPage() {
  const params = useParams()
  const roomId = params.roomId as string

  // Get calls for this room
  const roomCalls = mockCallLogs.filter(call => call.roomId === roomId)

  // Get unique participants
  const uniqueCallers = Array.from(new Set(roomCalls.map(call => call.callerName)))
  const uniqueReceivers = Array.from(new Set(roomCalls.map(call => call.receiverName)))
  const allParticipants = Array.from(new Set([...uniqueCallers, ...uniqueReceivers]))

  // Get room stats
  const totalCalls = roomCalls.length
  const completedCalls = roomCalls.filter(call => call.status === 'completed').length
  const successRate = totalCalls > 0 ? Math.round((completedCalls / totalCalls) * 100) : 0
  const totalDuration = roomCalls
    .filter(call => call.status === 'completed')
    .reduce((sum, call) => sum + call.duration, 0)

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <Phone className="h-4 w-4 text-green-500" />
      case 'missed':
        return <PhoneOff className="h-4 w-4 text-red-500" />
      case 'declined':
        return <PhoneOff className="h-4 w-4 text-orange-500" />
      case 'ongoing':
        return <Phone className="h-4 w-4 text-blue-500" />
      default:
        return <Phone className="h-4 w-4 text-muted-foreground" />
    }
  }

  if (roomCalls.length === 0) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <Phone className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Call Room Not Found</h2>
            <p className="text-muted-foreground">No calls found for room ID: {roomId}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Call Room: {roomId}</h1>
          <p className="text-muted-foreground">Call history and room details</p>
        </div>
      </div>

      {/* Room Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Calls</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCalls}</div>
            <p className="text-xs text-muted-foreground">In this room</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <Phone className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{successRate}%</div>
            <p className="text-xs text-muted-foreground">Completed calls</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDuration(totalDuration)}</div>
            <p className="text-xs text-muted-foreground">Completed calls</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Participants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allParticipants.length}</div>
            <p className="text-xs text-muted-foreground">Unique users</p>
          </CardContent>
        </Card>
      </div>

      {/* Call History */}
      <Card>
        <CardHeader>
          <CardTitle>Call History</CardTitle>
          <CardDescription>All calls in this room</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {roomCalls.map((call: CallLog) => (
              <div key={call.id} className="flex items-center justify-between p-4 rounded-lg border">
                <div className="flex items-center gap-3">
                  {getStatusIcon(call.status)}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{call.callerName}</span>
                      <span className="text-muted-foreground">→</span>
                      <span className="font-medium">{call.receiverName}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(call.startTime).toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge
                    variant={
                      call.status === 'completed' ? 'default' :
                      call.status === 'missed' ? 'destructive' :
                      call.status === 'declined' ? 'secondary' : 'outline'
                    }
                  >
                    {call.status}
                  </Badge>
                  <div className="text-sm">
                    {call.type === 'video' ? 'Video' : 'Audio'}
                  </div>
                  <div className="text-sm font-medium">
                    {call.status === 'completed' && call.duration > 0
                      ? formatDuration(call.duration)
                      : call.status === 'ongoing'
                      ? 'In progress'
                      : '-'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Call Status Summary */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Call Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {['completed', 'missed', 'declined', 'ongoing'].map(status => {
                const count = roomCalls.filter(call => call.status === status).length
                const percentage = totalCalls > 0 ? Math.round((count / totalCalls) * 100) : 0
                return (
                  <div key={status} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(status)}
                      <span className="capitalize">{status}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">{count} calls</span>
                      <span className="text-sm font-medium">({percentage}%)</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Call Type Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {['audio', 'video'].map(type => {
                const count = roomCalls.filter(call => call.type === type).length
                const percentage = totalCalls > 0 ? Math.round((count / totalCalls) * 100) : 0
                return (
                  <div key={type} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="capitalize">{type}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">{count} calls</span>
                      <span className="text-sm font-medium">({percentage}%)</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Participants */}
      <Card>
        <CardHeader>
          <CardTitle>Room Participants</CardTitle>
          <CardDescription>Users who have participated in calls in this room</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
            {allParticipants.map((userName) => (
              <div key={userName} className="flex items-center gap-3 p-3 rounded-lg border">
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                  <span className="text-sm font-medium">
                    {userName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="font-medium">{userName}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

