'use client'

import { useState, useEffect } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import { CalendarIcon, Clock, Crown, CheckCircle } from 'lucide-react'
import NextImage from 'next/image'
import { TimezoneSelect } from '@/components/ui/timezone-select'
import { Label } from '@/components/ui/label'

export function DatePickerSheet({ 
  selectedDate, 
  onSelectDate, 
  selectedTimeSlot,
  onSelectTimeSlot,
  availableDates = [],
  availableSlots = [],
  loadingAvailability = false,
  expert = null,
  sessions = [],
  selectedSession = null,
  timezone = 'UTC',
  onTimezoneChange,
  children 
}) {
  const [isOpen, setIsOpen] = useState(false)

  // Auto-select first available date when sheet opens and no date is selected
  useEffect(() => {
    if (isOpen && !selectedDate && availableDates.length > 0) {
      const firstAvailableDate = availableDates[0]
      // Only call onSelectDate if we have a valid date
      if (firstAvailableDate) {
        onSelectDate(firstAvailableDate)
      }
    }
  }, [isOpen, availableDates, selectedDate, onSelectDate])

  const handleConfirm = () => {
    // If no date is selected but we have available dates, auto-select the first one
    if (!selectedDate && availableDates.length > 0) {
      onSelectDate(availableDates[0])
    }
    setIsOpen(false)
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        {children || (
          <Button
            variant="outline"
            className={`w-full justify-start text-left font-normal ${
              !selectedDate ? 'text-gray-400' : ''
            }`}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {selectedDate && selectedTimeSlot ? (
              <span>
                {selectedDate.toLocaleDateString('en-US', { 
                  month: 'long', 
                  day: 'numeric',
                  year: 'numeric'
                })} at {selectedTimeSlot.start}
              </span>
            ) : selectedDate ? (
              selectedDate.toLocaleDateString('en-US', { 
                month: 'long', 
                day: 'numeric',
                year: 'numeric'
              })
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        )}
      </SheetTrigger>
      <SheetContent side="middle" className="!inset-x-auto !inset-y-auto !top-[50%] !left-[50%] !-translate-x-[50%] !-translate-y-[50%] h-[95vh] sm:h-[95vh] w-[98vw] sm:w-[80vw] max-w-5xl rounded-2xl p-0 border flex flex-col">
        <div className="grid grid-cols-3 flex-1 overflow-hidden">
          <div className="border-r border-gray-200 p-6 flex flex-col">
            {expert && (
              <>
                <div className="flex flex-col mb-6">
                  <div className="relative w-24 h-24 mb-4">
                    <NextImage
                      src={expert.avatar}
                      alt={expert.name}
                      width={100}
                      height={100}
                      quality={100}
                      className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
                    />
                    {(expert.isTopAdvisor || expert.topAdvisor === true || expert.topAdvisor === "true" || expert.topAdvisor === 1) && (
                      <div className="absolute top-1 right-0.5 flex items-center justify-center w-6 h-6 rounded-full bg-amber-500 flex-shrink-0 shadow-lg z-10">
                        <Crown className="w-3.5 h-3.5 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-bold text-gray-900 text-left">{expert.name}</h3>
                    {expert.isVerified && (
                      <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-1 hover-rotate-icon" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  {expert.bio && (
                    <p className="text-sm text-gray-700 text-left leading-relaxed">
                      {expert.bio}
                    </p>
                  )}

                  {(() => {
                    // Get advice points from the selected session or first session
                    const sessionToUse = selectedSession || (sessions.length > 0 ? sessions[0] : null)
                    const advicePoints = sessionToUse?.advicePoints || []
                    
                    if (advicePoints.length > 0) {
                      return (
                        <div className="mt-4">
                          <h4 className="text-sm font-semibold text-gray-900 mb-2">Get Advice On:</h4>
                          <ol className="space-y-1.5 list-decimal list-inside ml-1">
                            {advicePoints.map((point, index) => (
                              <li key={index} className="text-sm text-gray-700 capitalize">
                                {point}
                              </li>
                            ))}
                          </ol>
                        </div>
                      )
                    }
                    return null
                  })()}
                </div>
                
              </>
            )}
          </div>

          <div className="border-r border-gray-200 p-4 overflow-y-auto">
            <SheetHeader >
              <SheetTitle className="text-sm font-semibold text-gray-900 text-center">Select a Date & Time</SheetTitle>
            </SheetHeader>
            <Calendar
              mode="single"
              selected={selectedDate || (availableDates.length > 0 ? availableDates[0] : null)}
              onSelect={onSelectDate}
              className="rounded-md w-full"
              modifiers={{
                available: availableDates,
                today: new Date()
              }}
              modifiersClassNames={{
                available: "bg-blue-500 text-white hover:bg-blue-600 hover:text-white rounded-full",
                today: "text-blue-500 font-semibold"
              }}
            />
          </div>

          <div className="p-6 overflow-y-auto">
            {/* Determine which date to display - use selectedDate or fall back to first available date */}
            {(() => {
              const dateToDisplay = selectedDate || (availableDates.length > 0 ? availableDates[0] : null)
              
              if (!dateToDisplay) {
                return (
                  <div className="text-center py-8">
                    <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-600 text-sm">
                      No available dates at this time
                    </p>
                  </div>
                )
              }
              
              return (
                <>
                  <div className="mb-4">
                    <h4 className="text-lg font-semibold text-gray-900">
                      {dateToDisplay.toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        month: 'short',
                        day: 'numeric'
                      })}
                    </h4>
                  </div>
                  {loadingAvailability ? (
                    <div className="space-y-2">
                      {Array.from({ length: 6 }).map((_, index) => (
                        <div
                          key={index}
                          className="p-3 rounded-lg border border-gray-200 bg-gray-100 animate-pulse"
                        >
                          <div className="h-4 bg-gray-300 rounded"></div>
                        </div>
                      ))}
                    </div>
                  ) : availableSlots.length > 0 ? (
                    <div className="space-y-2">
                      {availableSlots.map((slot, index) => (
                        <Button
                          key={index}
                          variant={selectedTimeSlot?.start === slot.start ? "default" : "outline"}
                          onClick={() => onSelectTimeSlot(slot)}
                          className={`w-full p-3 rounded-lg text-sm font-medium transition-all ${
                            selectedTimeSlot?.start === slot.start
                              ? 'bg-blue-600 text-white hover:bg-blue-700 hover:text-white'
                              : 'bg-white border border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50'
                          }`}
                        >
                          {slot.start}
                        </Button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-600 text-sm">
                        No available slots for this date
                      </p>
                    </div>
                  )}
                </>
              )
            })()}
          </div>
        </div>
        
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4" />
                <Label className="text-sm text-gray-900 font-semibold">Selected Timezone <span className="text-red-500 -ml-1">*</span></Label>
              </div>
              <TimezoneSelect value={timezone} onValueChange={onTimezoneChange} placeholder="Select your timezone" />
            </div>
            <Button 
              onClick={handleConfirm}
              disabled={(!selectedDate && availableDates.length === 0) || !selectedTimeSlot}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              Confirm Details        
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}