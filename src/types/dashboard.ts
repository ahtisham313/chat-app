// Shared types for dashboard data between server and client components

export interface DashboardMessage {
  id: string
  roomId: string
  senderId: string
  senderName: string
  content: string
  timestamp: Date
  type: 'text' | 'image' | 'file'
}

export interface DashboardCallLog {
  id: string
  roomId: string
  callerId: string
  callerName: string
  receiverId: string
  receiverName: string
  status: 'completed' | 'missed' | 'declined' | 'ongoing'
  duration: number // in seconds
  startTime: Date
  endTime: Date | null
  type: 'audio' | 'video'
}

export interface DashboardUserStat {
  id: string
  userId: string
  userName: string
  email: string
  status: 'active' | 'inactive' | 'away'
  lastSeen: Date
  totalMessages: number
  totalCalls: number
  totalCallDuration: number // in seconds
  avatar?: string
}

export interface DashboardStats {
  totalMessages: number
  totalCalls: number
  activeUsers: number
  totalCallDuration: number
}

