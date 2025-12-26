'use client'

import { useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'
export default function Error({
  error,
  reset: _reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Dashboard error:', error)
  }, [error])
  
  const handleRetry = () => {
    window.location.reload()
  }
  return (
    <div className="min-h-screen flex items-center justify-center">

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <CardTitle>Error Loading Dashboard</CardTitle>
          </div>
          <CardDescription>
            Failed to load dashboard data from the API
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {error.message || 'An unexpected error occurred while fetching dashboard data.'}
          </p>
          <Button onClick={handleRetry} variant="default">
            Try Again
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

