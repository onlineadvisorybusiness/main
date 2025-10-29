'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Clock, Save, Plus, Trash2, Check, X, RefreshCw, Calendar, Settings, Users } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

const generateTimeSlots = () => {
  const slots = []
  for (let hour = 0; hour <= 23; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      // Skip if it's past 23:30
      if (hour === 23 && minute > 30) break
      
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      slots.push(timeString)
    }
  }
  return slots
}

const TIME_SLOTS = generateTimeSlots()

const MAX_SLOTS_PER_DAY = 5

const DAYS_OF_WEEK = [
  { id: 0, name: 'Sunday', short: 'Sun' },
  { id: 1, name: 'Monday', short: 'Mon' },
  { id: 2, name: 'Tuesday', short: 'Tue' },
  { id: 3, name: 'Wednesday', short: 'Wed' },
  { id: 4, name: 'Thursday', short: 'Thu' },
  { id: 5, name: 'Friday', short: 'Fri' },
  { id: 6, name: 'Saturday', short: 'Sat' }
]

const formatTime = (time) => {
  const [hours, minutes] = time.split(':')
  const hour = parseInt(hours)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour % 12 || 12
  return `${displayHour}:${minutes} ${ampm}`
}

const parseTime = (timeString) => {
  const [hours, minutes] = timeString.split(':').map(Number)    

  let normalizedHours = hours
  let normalizedMinutes = minutes
  
  if (minutes >= 60) {
    normalizedHours += Math.floor(minutes / 60)
    normalizedMinutes = minutes % 60
  }
  
  const totalMinutes = normalizedHours * 60 + normalizedMinutes
  return totalMinutes
}

export default function ExpertAvailability() {
  const [availabilities, setAvailabilities] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [selectedDay, setSelectedDay] = useState(1)
  const [newSlot, setNewSlot] = useState({ startTime: '', endTime: '' })
  const { toast } = useToast()

  useEffect(() => {
    loadAvailabilities()
  }, [])

  const loadAvailabilities = async () => {
    try {
      setLoading(true)

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000) 
      
      const response = await fetch('/api/availability', {
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      if (response.ok) {
        const data = await response.json()
        
        const groupedAvailabilities = {}
        
        data.availabilities?.forEach(availability => {
          if (!groupedAvailabilities[availability.dayOfWeek]) {
            groupedAvailabilities[availability.dayOfWeek] = []
          }
          groupedAvailabilities[availability.dayOfWeek].push(availability)
        })
        
        setAvailabilities(groupedAvailabilities)
      } else if (response.status === 401) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to manage your availability",
          variant: "destructive"
        })
        setAvailabilities({})
      } else if (response.status === 403) {
        toast({
          title: "Access Denied",
          description: "Only experts can manage availability",
          variant: "destructive"
        })
        setAvailabilities({})
      } else {
        const errorData = await response.json()
        toast({
          title: "Error",
          description: errorData.error || "Failed to load availability data",
          variant: "destructive"
        })
        setAvailabilities({})
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        toast({
          title: "Timeout",
          description: "Request timed out. Please try again.",
          variant: "destructive"
        })
      } else {
        toast({
          title: "Connection Error",
          description: "Unable to connect to the server. Please check your internet connection.",
          variant: "destructive"
        })
      }
      setAvailabilities({})
    } finally {
      setLoading(false)
    }
  }

  const saveAvailabilities = async () => {
    try {
      setSaving(true)
      const allSlots = Object.values(availabilities).flat()
      
      const response = await fetch('/api/availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ availabilities: allSlots }),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Availability schedule saved successfully!",
        })
      } else {
        throw new Error('Failed to save')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save availability schedule",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const addTimeSlot = (dayId, startTime, endTime) => {
    if (!startTime || !endTime) {
      toast({
        title: "Error",
        description: "Please select both start and end times",
        variant: "destructive"
      })
      return
    }

    if (startTime >= endTime) {
      toast({
        title: "Error",
        description: "End time must be after start time",
        variant: "destructive"
      })
      return
    }

    const currentDaySlots = availabilities[dayId] || []
    if (currentDaySlots.length >= MAX_SLOTS_PER_DAY) {
      toast({
        title: "Error",
        description: `Maximum ${MAX_SLOTS_PER_DAY} slots allowed per day`,
        variant: "destructive"
      })
      return
    }

    const hasConflict = currentDaySlots.some(existingSlot => {
      const existingStart = parseTime(existingSlot.startTime)
      const existingEnd = parseTime(existingSlot.endTime)
      const newStart = parseTime(startTime)
      const newEnd = parseTime(endTime)
      
      return (newStart < existingEnd && newEnd > existingStart)
    })

    if (hasConflict) {
      toast({
        title: "Time Conflict",
        description: "This time slot overlaps with an existing slot. Please choose a different time.",
        variant: "destructive"
      })
      return
    }

    const slot = {
      id: `temp-${Date.now()}`,
      dayOfWeek: dayId,
      startTime: startTime,
      endTime: endTime,
      isActive: true,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    }

    setAvailabilities(prev => ({
      ...prev,
      [dayId]: [...(prev[dayId] || []), slot]
    }))
  }

  const removeTimeSlot = (dayId, slotId) => {
    setAvailabilities(prev => ({
      ...prev,
      [dayId]: prev[dayId]?.filter(slot => slot.id !== slotId) || []
    }))
  }

  const toggleSlotActive = (dayId, slotId) => {
    setAvailabilities(prev => ({
      ...prev,
      [dayId]: prev[dayId]?.map(slot => 
        slot.id === slotId ? { ...slot, isActive: !slot.isActive } : slot
      ) || []
    }))
  }

  const getDaySlots = (dayId) => {
    return availabilities[dayId] || []
  }

  const handleAddSlot = () => {
    addTimeSlot(selectedDay, newSlot.startTime, newSlot.endTime)
    setNewSlot({ startTime: '', endTime: '' })
  }

  const [showLoading, setShowLoading] = useState(true)
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoading(false)
        }, 3000)

    return () => clearTimeout(timer)
  }, [])

  if (loading && showLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto p-6 space-y-8">
          <div className="py-6">
            <div className="text-left">
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-4 w-96" />
            </div>
            <div className="mt-4 space-y-3">
              <Skeleton className="h-4 w-64" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-8 w-24" />
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <Skeleton className="h-6 w-24" />
                  <div className="space-y-2">
                    {Array.from({ length: 7 }).map((_, i) => (
                      <Skeleton key={i} className="h-10 w-full" />
                    ))}
                  </div>
                </div>
                
                <div className="lg:col-span-2 space-y-4">
                  <Skeleton className="h-6 w-48" />
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                  <Skeleton className="h-32 w-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const currentDaySlots = getDaySlots(selectedDay)
  const canAddMore = currentDaySlots.length < MAX_SLOTS_PER_DAY
  const selectedDayInfo = DAYS_OF_WEEK.find(day => day.id === selectedDay)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-4 ">
        <div className="">
          {loading && (
            <div className="mt-4 space-y-3">
            <Skeleton className="h-4 w-64" />
            <Skeleton className="h-4 w-48" />
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Weekly Schedule</h2>
            <p className="text-gray-600 mt-1">Select a day to manage your availability</p>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Select Day</h3>
                  <div className="space-y-2">
                    {DAYS_OF_WEEK.map((day) => (
                      <Button
                        key={day.id}
                        variant={selectedDay === day.id ? "default" : "outline"}
                        onClick={() => setSelectedDay(day.id)}
                        className={`w-full p-3 rounded-lg text-left transition-colors justify-start h-auto ${
                          selectedDay === day.id
                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                            : ''
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <div>
                            <div className="font-medium">{day.name}</div>
                            <div className="text-sm text-white">
                              {getDaySlots(day.id).length}/{MAX_SLOTS_PER_DAY} slots
                            </div>
                          </div>
                          {selectedDay === day.id && (
                            <Check className="w-4 h-4" />
                          )}
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>
              </div>


              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Time Slots for {selectedDayInfo?.name}</h3>
                  
                  <div className="space-y-3 mb-4">
                    {currentDaySlots.map((slot, index) => (
                      <div
                        key={slot.id}
                        className="p-4 rounded-lg border border-gray-200 bg-gray-20 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-600" />
                            <span className="text-sm font-medium text-gray-800">
                              Slot {index + 1}
                            </span>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => toggleSlotActive(selectedDay, slot.id)}
                              className={`p-1.5 rounded transition-colors ${
                                slot.isActive 
                                  ? 'text-gray-800 hover:bg-gray-100' 
                                  : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                              }`}
                              title={slot.isActive ? 'Disable slot' : 'Enable slot'}
                            >
                              {slot.isActive ? <Check className="w-4 h-4" /> : <X className="w-4 h-4 text-gray-800" />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => removeTimeSlot(selectedDay, slot.id)}
                              className="p-1.5 rounded text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                              title="Remove slot"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="text-sm font-semibold text-gray-800">
                          {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                        </div>
                      </div>
                    ))}
                    
                    {currentDaySlots.length === 0 && (
                      <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-300 rounded-lg">
                        <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No time slots set for this day</p>
                      </div>
                    )}
                  </div>

                  {canAddMore && (
                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 shadow-sm">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Plus className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">Add New Time Slot</h4>
                          <p className="text-sm text-gray-600">Set your available time for {selectedDayInfo?.name}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Start Time
                          </label>
                          <Select value={newSlot.startTime} onValueChange={(value) => setNewSlot(prev => ({ ...prev, startTime: value }))}>
                            <SelectTrigger className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                              <SelectValue placeholder="Select start time" />
                            </SelectTrigger>
                            <SelectContent>
                              {TIME_SLOTS.map((time) => (
                                <SelectItem key={time} value={time}>
                                  {formatTime(time)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>                        
                                             
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            End Time
                          </label>
                          <Select value={newSlot.endTime} onValueChange={(value) => setNewSlot(prev => ({ ...prev, endTime: value }))}>
                            <SelectTrigger className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                              <SelectValue placeholder="Select end time" />
                            </SelectTrigger>
                            <SelectContent>
                              {TIME_SLOTS.map((time) => (
                                <SelectItem key={time} value={time}>
                                  {formatTime(time)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <Button
                        onClick={handleAddSlot}
                        className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm transition-all duration-200"
                        disabled={!newSlot.startTime || !newSlot.endTime || newSlot.startTime === newSlot.endTime}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Time Slot
                      </Button>
                    </div>
                  )}

                  {!canAddMore && (
                    <div className="text-center py-4 text-gray-500 text-sm bg-gray-50 rounded-lg border">
                      <Badge variant="secondary" className="text-xs">
                        Maximum {MAX_SLOTS_PER_DAY} slots reached for this day
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

      <div className="flex gap-4 mx-auto">
        <Button
          onClick={saveAvailabilities}
          disabled={saving}
          size="lg"
          className="flex-1 w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Schedule
            </>
          )}
        </Button>
      </div>

      </div>
    </div>
  )
}