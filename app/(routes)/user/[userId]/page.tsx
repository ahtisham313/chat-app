"use client"

import { useParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, User, MessageCircle, Phone, Clock, Mail } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { mockUserStats, mockMessages, mockCallLogs } from "@/src/data"
import { UserStat } from "@/src/data/userStats"
import { Message } from "@/src/data/messages"
import { CallLog } from "@/src/data/callLogs"

export default function UserDetailPage() {
  const params = useParams()
  const userId = params.userId as string

  // Get user data
  const user = mockUserStats.find(u => u.userId === userId)

  if (!user) {
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
            <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">User Not Found</h2>
            <p className="text-muted-foreground">No user found with ID: {userId}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Get user's messages
  const userMessages = mockMessages.filter(msg => msg.senderId === userId)

  // Get user's calls (as caller or receiver)
  const userCalls = mockCallLogs.filter(call =>
    call.callerId === userId || call.receiverId === userId
  )

  // Get call stats
  const completedCalls = userCalls.filter(call => call.status === 'completed')
  const totalCallDuration = completedCalls.reduce((sum, call) => sum + call.duration, 0)

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
    }

    const config = statusConfig[status] || { variant: "default" as const, label: status }
    return <Badge variant={config.variant}>{config.label}</Badge>
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
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-2xl font-medium text-primary">
              {user.userName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{user.userName}</h1>
            <p className="text-muted-foreground">User details and activity</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <Card>
        <CardHeader>
          <CardTitle>User Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge
                  variant={
                    user.status === 'active' ? 'default' :
                    user.status === 'inactive' ? 'secondary' :
                    'outline'
                  }
                >
                  {user.status}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Last Seen</p>
                <p className="font-medium">{new Date(user.lastSeen).toLocaleString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">User ID</p>
                <p className="font-medium font-mono text-sm">{user.userId}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user.totalMessages}</div>
            <p className="text-xs text-muted-foreground">Sent by user</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Calls</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user.totalCalls}</div>
            <p className="text-xs text-muted-foreground">Participated in</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Call Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDuration(user.totalCallDuration)}</div>
            <p className="text-xs text-muted-foreground">Total time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <Phone className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {user.totalCalls > 0 ? Math.round((completedCalls.length / user.totalCalls) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">Call success</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Messages */}
      {userMessages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Messages</CardTitle>
            <CardDescription>Latest messages sent by this user</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {userMessages.slice(-5).reverse().map((message: Message) => (
                <div key={message.id} className="flex items-start gap-3 p-3 rounded-lg border">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">
                        {message.senderName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">Room: {message.roomId}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(message.timestamp).toLocaleString()}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {message.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground break-words">
                      {message.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Calls */}
      {userCalls.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Calls</CardTitle>
            <CardDescription>Latest calls involving this user</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {userCalls.slice(-5).reverse().map((call: CallLog) => (
                <div key={call.id} className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <Phone className={`h-4 w-4 ${
                      call.status === 'completed' ? 'text-green-500' :
                      call.status === 'missed' ? 'text-red-500' :
                      call.status === 'declined' ? 'text-orange-500' : 'text-blue-500'
                    }`} />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {call.callerId === userId ? call.receiverName : call.callerName}
                        </span>
                        <span className="text-muted-foreground">
                          ({call.callerId === userId ? 'called' : 'received from'})
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Room: {call.roomId} • {new Date(call.startTime).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {getStatusBadge(call.status)}
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
      )}
    </div>
  )
}

