// Central API service for fetching and mapping JSONPlaceholder data to domain models

import type {
  DashboardMessage,
  DashboardCallLog,
  DashboardUserStat,
  DashboardStats,
} from '@/src/types/dashboard'

const JSONPLACEHOLDER_BASE_URL = 'https://jsonplaceholder.typicode.com'

// Stable base date for consistent timestamps across server and client
// This prevents hydration mismatches
const BASE_DATE = new Date('2025-01-01T00:00:00Z').getTime()

// JSONPlaceholder response types
interface JSONPlaceholderComment {
  id: number
  postId: number
  name: string
  email: string
  body: string
}

interface JSONPlaceholderTodo {
  id: number
  userId: number
  title: string
  completed: boolean
}

interface JSONPlaceholderUser {
  id: number
  name: string
  username: string
  email: string
  phone: string
  website: string
}

interface JSONPlaceholderPost {
  id: number
  userId: number
  title: string
  body: string
}

/**
 * Creates a timeout promise that rejects after specified milliseconds
 */
function createTimeoutPromise(timeoutMs: number): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error(`Request timeout after ${timeoutMs / 1000} seconds`))
    }, timeoutMs)
  })
}

/**
 * Fetches data from JSONPlaceholder API with timeout
 * Only works on client side
 */
async function fetchJSONPlaceholder<T>(endpoint: string, retries = 3): Promise<T> {
  // Ensure we're on the client side
  if (typeof window === "undefined") {
    throw new Error("fetchJSONPlaceholder can only be called on the client side")
  }

  const TIMEOUT_MS = 5000 // 5 seconds

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      // Race between fetch and timeout
      const fetchPromise = fetch(`${JSONPLACEHOLDER_BASE_URL}${endpoint}`, {
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const timeoutPromise = createTimeoutPromise(TIMEOUT_MS)
      
      const response = await Promise.race([fetchPromise, timeoutPromise])

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      // Also race the json() parsing with timeout
      const jsonPromise = response.json()
      const jsonTimeoutPromise = createTimeoutPromise(TIMEOUT_MS)
      
      return await Promise.race([jsonPromise, jsonTimeoutPromise])
    } catch (error) {
      // If this is the last attempt, throw the error
      if (attempt === retries) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        // Check if it's a timeout error
        if (errorMessage.includes('timeout')) {
          throw new Error(`Request timeout: API did not respond within 5 seconds`)
        }
        throw new Error(`Failed to fetch ${endpoint} after ${retries} attempts: ${errorMessage}`)
      }
      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 100))
    }
  }

  throw new Error(`Failed to fetch ${endpoint} after ${retries} attempts`)
}

/**
 * Maps JSONPlaceholder comments to Dashboard Messages
 * /comments -> Recent Messages (map body to content, email to sender)
 * @param userId - Optional user ID to personalize data (uses userId % 10 to filter posts)
 */
export async function fetchMessages(userId?: string): Promise<DashboardMessage[]> {
  try {
    let comments = await fetchJSONPlaceholder<JSONPlaceholderComment[]>('/comments')
    
    // If userId provided, filter by posts from userId % 10
    if (userId) {
      const userSpecificPostId = (parseInt(userId.replace(/\D/g, '')) || 1) % 10
      comments = comments.filter(comment => comment.postId % 10 === userSpecificPostId)
    }
    
    return comments.slice(0, 100).map((comment, index) => ({
      id: `msg-${comment.id}`,
      roomId: `room-${comment.postId}`,
      senderId: `user-${comment.id}`,
      senderName: comment.email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      content: comment.body,
      timestamp: new Date(BASE_DATE - (index * 60000)), // Stagger timestamps using stable base date
      type: 'text' as const,
    }))
  } catch (error) {
    throw new Error(`Failed to fetch messages: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Maps JSONPlaceholder todos to Call Logs
 * /todos -> Call Logs (map completed boolean to 'Success/Missed' status)
 * @param userId - Optional user ID to personalize data (uses userId % 10 to filter todos)
 */
export async function fetchCallLogs(userId?: string): Promise<DashboardCallLog[]> {
  try {
    let todos = await fetchJSONPlaceholder<JSONPlaceholderTodo[]>('/todos')
    
    // If userId provided, filter by todos from userId % 10
    if (userId) {
      const userSpecificUserId = (parseInt(userId.replace(/\D/g, '')) || 1) % 10
      todos = todos.filter(todo => todo.userId % 10 === userSpecificUserId)
    }
    
    return todos.slice(0, 100).map((todo, index) => {
      const status: DashboardCallLog['status'] = todo.completed 
        ? 'completed' 
        : index % 3 === 0 
          ? 'missed' 
          : index % 3 === 1 
            ? 'declined' 
            : 'ongoing'
      
      // Use deterministic calculation instead of Math.random() to prevent hydration mismatches
      const seed = todo.id * 11 + index * 3
      const duration = status === 'completed' ? ((seed % 3600) + 60) : 0
      const startTime = new Date(BASE_DATE - (index * 3600000)) // Stagger by hours using stable base date
      const endTime = status === 'completed' ? new Date(startTime.getTime() + duration * 1000) : null
      
      return {
        id: `call-${todo.id}`,
        roomId: `room-${todo.userId}`,
        callerId: `user-${todo.userId}`,
        callerName: `User ${todo.userId}`,
        receiverId: `user-${(todo.userId % 10) + 1}`,
        receiverName: `User ${(todo.userId % 10) + 1}`,
        status,
        duration,
        startTime,
        endTime,
        type: index % 2 === 0 ? 'video' : 'audio',
      }
    })
  } catch (error) {
    throw new Error(`Failed to fetch call logs: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Maps JSONPlaceholder users & posts to User Statistics
 * /users & /posts -> User Statistics (count users for total, count posts for activity)
 * @param userId - Optional user ID to personalize data (uses userId % 10 to filter posts)
 */
export async function fetchUserStats(userId?: string): Promise<DashboardUserStat[]> {
  try {
    let [users, posts] = await Promise.all([
      fetchJSONPlaceholder<JSONPlaceholderUser[]>('/users'),
      fetchJSONPlaceholder<JSONPlaceholderPost[]>('/posts'),
    ])
    
    // If userId provided, filter posts by userId % 10
    if (userId) {
      const userSpecificUserId = (parseInt(userId.replace(/\D/g, '')) || 1) % 10
      posts = posts.filter(post => post.userId % 10 === userSpecificUserId)
    }
    
    // Count posts per user
    const postsPerUser = posts.reduce((acc, post) => {
      acc[post.userId] = (acc[post.userId] || 0) + 1
      return acc
    }, {} as Record<number, number>)
    
    // Count comments per user (approximate based on postId)
    // Use deterministic calculation instead of Math.random() to prevent hydration mismatches
    const commentsPerUser = posts.reduce((acc, post) => {
      // Use postId as seed for deterministic "random" value
      const seed = post.userId * 7 + post.id * 3
      acc[post.userId] = (acc[post.userId] || 0) + ((seed % 10) + 1)
      return acc
    }, {} as Record<number, number>)
    
    return users.map((user, index) => {
      const statuses: DashboardUserStat['status'][] = ['active', 'active', 'away', 'inactive']
      const status = statuses[index % statuses.length]
      
      // Use deterministic calculations based on user.id instead of Math.random()
      const seed1 = user.id * 13 + index * 7
      const seed2 = user.id * 17 + index * 11
      const seed3 = user.id * 19 + index * 5
      
      return {
        id: `user-stat-${user.id}`,
        userId: `user-${user.id}`,
        userName: user.name,
        email: user.email,
        status,
        lastSeen: new Date(BASE_DATE - (index * 86400000)), // Stagger by days using stable base date
        totalMessages: commentsPerUser[user.id] || ((seed1 % 50) + 10),
        totalCalls: (seed2 % 20) + 5,
        totalCallDuration: (seed3 % 7200) + 1800, // 30min to 2h
        avatar: `https://i.pravatar.cc/150?img=${user.id}`,
      }
    })
  } catch (error) {
    throw new Error(`Failed to fetch user stats: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Fetches all dashboard data in parallel
 * @param userId - Optional user ID to personalize data (uses userId % 10 trick)
 */
export async function fetchDashboardData(userId?: string): Promise<{
  messages: DashboardMessage[]
  callLogs: DashboardCallLog[]
  userStats: DashboardUserStat[]
  stats: DashboardStats
}> {
  try {
    const [messages, callLogs, userStats] = await Promise.all([
      fetchMessages(userId),
      fetchCallLogs(userId),
      fetchUserStats(userId),
    ])
    
    // Calculate stats
    const stats: DashboardStats = {
      totalMessages: messages.length,
      totalCalls: callLogs.length,
      activeUsers: userStats.filter((user) => user.status === 'active').length,
      totalCallDuration: callLogs
        .filter((call) => call.status === 'completed')
        .reduce((sum, call) => sum + call.duration, 0),
    }
    
    return {
      messages,
      callLogs,
      userStats,
      stats,
    }
  } catch (error) {
    throw new Error(`Failed to fetch dashboard data: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

