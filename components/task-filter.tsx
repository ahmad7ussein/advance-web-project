"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Filter, X, CalendarIcon, SortAsc, SortDesc } from "lucide-react"
import { format } from "date-fns"

interface User {
  id: string
  name: string
  role: string
  studentId?: string
}

interface TaskFilterProps {
  users: User[]
  onFilterChange: (filters: TaskFilters) => void
  userRole: "admin" | "student"
  currentUserId: string
}

export interface TaskFilters {
  status: string[]
  assigneeId: string
  startDate: Date | null
  endDate: Date | null
  searchTerm: string
  sortBy: string
  sortOrder: "asc" | "desc"
}

export function TaskFilter({ users, onFilterChange, userRole, currentUserId }: TaskFilterProps) {
  const [filters, setFilters] = useState<TaskFilters>({
    status: [],
    assigneeId: "",
    startDate: null,
    endDate: null,
    searchTerm: "",
    sortBy: "createdAt",
    sortOrder: "desc",
  })

  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [dateRange, setDateRange] = useState<{
    from: Date | null
    to: Date | null
  }>({
    from: null,
    to: null,
  })

  // Filter options
  const statusOptions = [
    { id: "pending", label: "Pending" },
    { id: "in-progress", label: "In Progress" },
    { id: "completed", label: "Completed" },
  ]

  const sortOptions = [
    { id: "createdAt", label: "Creation Date" },
    { id: "title", label: "Title" },
    { id: "status", label: "Status" },
  ]

  // Students only see their own tasks, so no need for assignee filter
  const studentUsers = users.filter((user) => user.role === "student")

  // Apply filters when they change
  useEffect(() => {
    onFilterChange(filters)
  }, [filters, onFilterChange])

  // Update date range when calendar selection changes
  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      startDate: dateRange.from,
      endDate: dateRange.to,
    }))
  }, [dateRange])

  const handleStatusChange = (status: string, checked: boolean) => {
    setFilters((prev) => ({
      ...prev,
      status: checked ? [...prev.status, status] : prev.status.filter((s) => s !== status),
    }))
  }

  const handleAssigneeChange = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      assigneeId: value,
    }))
  }

  const handleSortByChange = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      sortBy: value,
    }))
  }

  const handleSortOrderToggle = () => {
    setFilters((prev) => ({
      ...prev,
      sortOrder: prev.sortOrder === "asc" ? "desc" : "asc",
    }))
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({
      ...prev,
      searchTerm: e.target.value,
    }))
  }

  const clearFilters = () => {
    setFilters({
      status: [],
      assigneeId: "",
      startDate: null,
      endDate: null,
      searchTerm: "",
      sortBy: "createdAt",
      sortOrder: "desc",
    })
    setDateRange({ from: null, to: null })
  }

  const getActiveFilterCount = () => {
    let count = 0
    if (filters.status.length > 0) count++
    if (filters.assigneeId) count++
    if (filters.startDate || filters.endDate) count++
    if (filters.searchTerm) count++
    if (filters.sortBy !== "createdAt" || filters.sortOrder !== "desc") count++
    return count
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-grow">
          <Input
            placeholder="Search tasks..."
            value={filters.searchTerm}
            onChange={handleSearchChange}
            className="bg-gray-700 border-gray-600 pr-10"
          />
          {filters.searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0 text-gray-400"
              onClick={() => setFilters((prev) => ({ ...prev, searchTerm: "" }))}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Clear search</span>
            </Button>
          )}
        </div>

        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex gap-2 bg-gray-700 border-gray-600">
                <Filter className="h-4 w-4" />
                <span>Filter</span>
                {getActiveFilterCount() > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                    {getActiveFilterCount()}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 bg-gray-800 border-gray-700 text-white">
              <div className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Status</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {statusOptions.map((option) => (
                      <div key={option.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`status-${option.id}`}
                          checked={filters.status.includes(option.id)}
                          onCheckedChange={(checked) => handleStatusChange(option.id, checked === true)}
                        />
                        <Label htmlFor={`status-${option.id}`} className="text-sm">
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {userRole === "admin" && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Assignee</h4>
                    <Select value={filters.assigneeId} onValueChange={handleAssigneeChange}>
                      <SelectTrigger className="bg-gray-700 border-gray-600">
                        <SelectValue placeholder="All Students" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        <SelectItem value="all">All Students</SelectItem>
                        {studentUsers.map((student) => (
                          <SelectItem key={student.id} value={student.id}>
                            {student.name} {student.studentId ? `(${student.studentId})` : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <h4 className="font-medium">Date Range</h4>
                  <div>
                    <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal bg-gray-700 border-gray-600"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dateRange.from ? (
                            dateRange.to ? (
                              <>
                                {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                              </>
                            ) : (
                              format(dateRange.from, "LLL dd, y")
                            )
                          ) : (
                            <span>Select date range</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-700" align="start">
                        <Calendar
                          initialFocus
                          mode="range"
                          defaultMonth={dateRange.from || new Date()}
                          selected={dateRange}
                          onSelect={setDateRange}
                          numberOfMonths={2}
                          className="bg-gray-800"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Sort By</h4>
                  <div className="flex gap-2">
                    <Select value={filters.sortBy} onValueChange={handleSortByChange}>
                      <SelectTrigger className="bg-gray-700 border-gray-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        {sortOptions.map((option) => (
                          <SelectItem key={option.id} value={option.id}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleSortOrderToggle}
                      className="bg-gray-700 border-gray-600"
                    >
                      {filters.sortOrder === "asc" ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <Button variant="secondary" className="w-full" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          <Button
            variant="outline"
            size="icon"
            onClick={handleSortOrderToggle}
            className="bg-gray-700 border-gray-600"
            title={`Sort ${filters.sortOrder === "asc" ? "Ascending" : "Descending"}`}
          >
            {filters.sortOrder === "asc" ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Active filters display */}
      {getActiveFilterCount() > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.status.length > 0 && (
            <Badge variant="outline" className="bg-gray-700 border-gray-600 flex items-center gap-1">
              Status: {filters.status.join(", ")}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 ml-1"
                onClick={() => setFilters((prev) => ({ ...prev, status: [] }))}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Clear status filter</span>
              </Button>
            </Badge>
          )}

          {filters.assigneeId && (
            <Badge variant="outline" className="bg-gray-700 border-gray-600 flex items-center gap-1">
              Assignee: {users.find((u) => u.id === filters.assigneeId)?.name || "Unknown"}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 ml-1"
                onClick={() => setFilters((prev) => ({ ...prev, assigneeId: "" }))}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Clear assignee filter</span>
              </Button>
            </Badge>
          )}

          {(filters.startDate || filters.endDate) && (
            <Badge variant="outline" className="bg-gray-700 border-gray-600 flex items-center gap-1">
              Date: {filters.startDate ? format(filters.startDate, "MMM d, yyyy") : "Any"}
              {" - "}
              {filters.endDate ? format(filters.endDate, "MMM d, yyyy") : "Any"}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 ml-1"
                onClick={() => {
                  setFilters((prev) => ({ ...prev, startDate: null, endDate: null }))
                  setDateRange({ from: null, to: null })
                }}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Clear date filter</span>
              </Button>
            </Badge>
          )}

          {filters.sortBy !== "createdAt" || filters.sortOrder !== "desc" ? (
            <Badge variant="outline" className="bg-gray-700 border-gray-600 flex items-center gap-1">
              Sort: {sortOptions.find((o) => o.id === filters.sortBy)?.label || "Creation Date"} (
              {filters.sortOrder === "asc" ? "Ascending" : "Descending"})
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 ml-1"
                onClick={() => setFilters((prev) => ({ ...prev, sortBy: "createdAt", sortOrder: "desc" }))}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Clear sort filter</span>
              </Button>
            </Badge>
          ) : null}
        </div>
      )}
    </div>
  )
}
