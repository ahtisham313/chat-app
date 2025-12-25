"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface FiltersProps {
  userStatusFilter: string
  callStatusFilter: string
  onUserStatusChange: (value: string) => void
  onCallStatusChange: (value: string) => void
  showUserFilter?: boolean
  showCallFilter?: boolean
}

export function Filters({
  userStatusFilter,
  callStatusFilter,
  onUserStatusChange,
  onCallStatusChange,
  showUserFilter = false,
  showCallFilter = false,
}: FiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      {showUserFilter && (
        <div className="flex items-center gap-2">
          <Label htmlFor="user-status" className="whitespace-nowrap">
            User Status:
          </Label>
          <Select value={userStatusFilter} onValueChange={onUserStatusChange}>
            <SelectTrigger id="user-status" className="w-[180px]">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="away">Away</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {showCallFilter && (
        <div className="flex items-center gap-2">
          <Label htmlFor="call-status" className="whitespace-nowrap">
            Call Status:
          </Label>
          <Select value={callStatusFilter} onValueChange={onCallStatusChange}>
            <SelectTrigger id="call-status" className="w-[180px]">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="missed">Missed</SelectItem>
              <SelectItem value="declined">Declined</SelectItem>
              <SelectItem value="ongoing">Ongoing</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  )
}

