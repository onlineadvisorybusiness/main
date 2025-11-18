'use client'

import { useState, useEffect } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { timezones, getCurrentTimeInTimezone } from '@/lib/timezone'

export function TimezoneSelect({ value, onValueChange, placeholder = "Select timezone" }) {
  const [currentTimes, setCurrentTimes] = useState({})

  // Update current times every minute
  useEffect(() => {
    const updateTimes = () => {
      const times = {}
      timezones.forEach(tz => {
        times[tz.value] = getCurrentTimeInTimezone(tz.value)
      })
      setCurrentTimes(times)
    }

    updateTimes()
    const interval = setInterval(updateTimes, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [])

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={placeholder}>
          {value && (
            <div className="flex items-center justify-between w-full">
              <span>{timezones.find(tz => tz.value === value)?.label || value}</span>
              {currentTimes[value] && (
                <span className="text-gray-500 text-sm ml-2">
                  {currentTimes[value]}
                </span>
              )}
            </div>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="max-h-[300px]">
        {timezones.map((tz) => (
          <SelectItem key={tz.value} value={tz.value}>
            <div className="flex items-center justify-between w-full pr-8">
              <span>{tz.label}</span>
              <span className="text-gray-500 text-sm ml-4">
                {currentTimes[tz.value] || getCurrentTimeInTimezone(tz.value)}
              </span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

