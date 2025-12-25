"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { MessageSquare, Phone, Users, Clock } from "lucide-react"

interface StatCard {
  title: string
  value: string | number
  description: string
  icon: React.ReactNode
  tooltip?: string
}

interface StatsCardsProps {
  totalMessages: number
  totalCalls: number
  activeUsers: number
  totalCallDuration: number
}

export function StatsCards({
  totalMessages,
  totalCalls,
  activeUsers,
  totalCallDuration,
}: StatsCardsProps) {
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  }

  const stats: StatCard[] = [
    {
      title: "Total Messages",
      value: totalMessages,
      description: "All time messages",
      icon: <MessageSquare className="h-5 w-5" />,
      tooltip: "Total number of messages sent across all chat rooms",
    },
    {
      title: "Total Calls",
      value: totalCalls,
      description: "All time calls",
      icon: <Phone className="h-5 w-5" />,
      tooltip: "Total number of calls made, including completed and missed",
    },
    {
      title: "Active Users",
      value: activeUsers,
      description: "Currently active",
      icon: <Users className="h-5 w-5" />,
      tooltip: "Number of users currently active in the system",
    },
    {
      title: "Call Duration",
      value: formatDuration(totalCallDuration),
      description: "Total call time",
      icon: <Clock className="h-5 w-5" />,
      tooltip: "Total duration of all completed calls",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <TooltipProvider>
        {stats.map((stat) => (
          <Tooltip key={stat.title}>
            <TooltipTrigger asChild>
              <Card className="transition-all hover:shadow-md cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <div className="text-muted-foreground">{stat.icon}</div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <CardDescription className="text-xs mt-1">
                    {stat.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </TooltipTrigger>
            {stat.tooltip && (
              <TooltipContent>
                <p>{stat.tooltip}</p>
              </TooltipContent>
            )}
          </Tooltip>
        ))}
      </TooltipProvider>
    </div>
  )
}

