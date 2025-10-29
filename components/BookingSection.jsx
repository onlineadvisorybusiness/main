'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import { Star, Crown, Clock, CheckCircle, Timer, Video, DollarSign, UserCheck, User, Mail, Calendar as CalendarIcon, ArrowLeft, CreditCard } from 'lucide-react'
import NextImage from 'next/image'

export function BookingSection({ expert, sessions = [] }) {
  const { user } = useUser()
  const [selectedSession, setSelectedSession] = useState(null)
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedDuration, setSelectedDuration] = useState('30')
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null)
  const [expertAvailability, setExpertAvailability] = useState({})
  const [existingBookings, setExistingBookings] = useState({})
  const [loadingAvailability, setLoadingAvailability] = useState(false)
  const [availableSlots, setAvailableSlots] = useState([])
  const [booking, setBooking] = useState(false)
  
  const defaultSession = sessions.length > 0 ? sessions[0] : null
  const currentSession = selectedSession || defaultSession

  const getSessionPricing = (session) => {
    if (!session || !session.prices) return {}
    
    let prices = session.prices
    if (typeof prices === 'string') {
      try {
        prices = JSON.parse(prices)
      } catch (e) {
        console.error('Error parsing prices:', e)
        prices = {}
      }
    }
    
    return prices
  }
  
  const sessionPricing = getSessionPricing(currentSession)
  const currentPrice = sessionPricing[selectedDuration] || 0

  // Fetch expert availability
  useEffect(() => {
    if (expert?.username) {
      fetchExpertAvailability()
    }
  }, [expert?.username])

  const generateAvailableSlots = useCallback(() => {
    if (!selectedDate || !expertAvailability) {
      setAvailableSlots([])
      return
    }

    // Format date in local timezone to match backend format
    const year = selectedDate.getFullYear()
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0')
    const day = String(selectedDate.getDate()).padStart(2, '0')
    const selectedDateStr = `${year}-${month}-${day}`
    
    const dayOfWeek = selectedDate.getDay()
    const dayAvailability = expertAvailability[dayOfWeek] || []
    // Get bookings for the specific date, not day of week
    const dayBookings = existingBookings[selectedDateStr] || []
    
    console.log('Generating slots for:', {
      selectedDate: selectedDateStr,
      dayOfWeek: dayOfWeek,
      dayAvailability: dayAvailability,
      dayBookings: dayBookings,
      allExistingBookings: existingBookings
    })
    
    if (dayAvailability.length === 0) {
      setAvailableSlots([])
      return
    }

    const slots = []
    const duration = parseInt(selectedDuration)

    dayAvailability.forEach(availability => {
      const startTime = parseTime(availability.startTime)
      const endTime = parseTime(availability.endTime)
      
      let currentTime = startTime
      while (currentTime <= endTime) {
        const canFit = currentTime + duration <= endTime
        if (canFit) {
          // Check if this time slot is already booked
          const isBooked = dayBookings.some(booking => {
            const bookingStart = parseTime(booking.startTime)
            const bookingEnd = parseTime(booking.endTime)
            const slotStart = currentTime
            const slotEnd = currentTime + duration
            
            // Check for time overlap - any overlap means the slot is booked
            const timeOverlap = (slotStart < bookingEnd && slotEnd > bookingStart)
            
            if (timeOverlap) {
              console.log('Slot conflict detected:', {
                slotTime: `${formatTime(slotStart)} - ${formatTime(slotEnd)}`,
                bookingTime: `${formatTime(bookingStart)} - ${formatTime(bookingEnd)}`,
                slotStart, slotEnd, bookingStart, bookingEnd
              })
            }
            
            return timeOverlap
          })

          if (!isBooked) {
            slots.push({
              start: formatTime(currentTime),
              startTime: currentTime,
              endTime: currentTime + duration,
              duration: duration
            })
          } else {
            console.log('Skipping booked slot:', formatTime(currentTime))
          }
        }
        currentTime += duration 
      }
    })

    setAvailableSlots(slots)
    setSelectedTimeSlot(null)
  }, [selectedDate, selectedDuration, expertAvailability, existingBookings])

  useEffect(() => {
    generateAvailableSlots()
  }, [generateAvailableSlots])

  // Force calendar to re-render when duration or bookings change
  const [calendarKey, setCalendarKey] = useState(0)
  
  useEffect(() => {
    setCalendarKey(prev => prev + 1)
  }, [selectedDuration, existingBookings])

  const fetchExpertAvailability = async () => {
    try {
      setLoadingAvailability(true)
      const response = await fetch(`/api/availability/expert/${expert.username}`)
      if (response.ok) {
        const data = await response.json()
        console.log('Fetched expert availability data:', data)
        setExpertAvailability(data.availabilities || {})
        setExistingBookings(data.existingBookings || {})
      }
    } catch (error) {
      console.error('Error fetching expert availability:', error)
    } finally {
      setLoadingAvailability(false)
    }
  }


  const getAvailableDates = () => {
    const availableDates = []
    const today = new Date()
    
    // Check next 30 days for availability
    for (let i = 0; i < 30; i++) {
      const date = new Date(today.getTime() + i * 24 * 60 * 60 * 1000)
      const dayOfWeek = date.getDay()
      const dayAvailability = expertAvailability[dayOfWeek] || []
      
      // First check if expert has availability for this day
      if (dayAvailability.some(slot => slot.isActive)) {
        // Format date to match the format used in existingBookings
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        const dateStr = `${year}-${month}-${day}`
        
        // Get bookings for this specific date
        const dayBookings = existingBookings[dateStr] || []
        
        // Check if there are any available slots after filtering out booked ones
        const hasAvailableSlots = dayAvailability.some(availability => {
          const startTime = parseTime(availability.startTime)
          const endTime = parseTime(availability.endTime)
          const duration = parseInt(selectedDuration)
          
          let currentTime = startTime
          while (currentTime <= endTime) {
            const canFit = currentTime + duration <= endTime
            if (canFit) {
              // Check if this time slot is already booked
              const isBooked = dayBookings.some(booking => {
                const bookingStart = parseTime(booking.startTime)
                const bookingEnd = parseTime(booking.endTime)
                const slotStart = currentTime
                const slotEnd = currentTime + duration
                
                // Check for time overlap
                return (slotStart < bookingEnd && slotEnd > bookingStart)
              })
              
              if (!isBooked) {
                return true // Found at least one available slot
              }
            }
            currentTime += duration
          }
          return false
        })
        
        if (hasAvailableSlots) {
          availableDates.push(date)
        }
      }
    }
    
    return availableDates
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

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    const ampm = hours >= 12 ? 'PM' : 'AM'
    const displayHours = hours % 12 || 12
    return `${displayHours}:${mins.toString().padStart(2, '0')} ${ampm}`
  }

  const formatTimeForAPI = (minutes) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
  }

  const handleBooking = async () => {
    if (!selectedTimeSlot || !currentSession) return

    try {
      setBooking(true)
      const year = selectedDate.getFullYear()
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0')
      const day = String(selectedDate.getDate()).padStart(2, '0')
      const localDate = `${year}-${month}-${day}`
      
      const bookingData = {
        sessionId: currentSession.id,
        date: localDate,
        startTime: formatTimeForAPI(selectedTimeSlot.startTime),
        endTime: formatTimeForAPI(selectedTimeSlot.endTime),
        duration: parseInt(selectedDuration),
        expertUsername: expert.username
      }

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      })

      if (response.ok) {
        const result = await response.json()
        alert(`Booking confirmed successfully! Your session has been scheduled and added to your calendar. Meeting Link: ${result.booking.meetingLink}`)
        // Reset the form and refresh availability
        setSelectedTimeSlot(null)
        setSelectedDate(null)
        // Refresh availability to update existing bookings
        fetchExpertAvailability()
      } else {
        const error = await response.json()
        alert(`Booking failed: ${error.error}`)
      }
    } catch (error) {
      console.error('Error creating booking:', error)
      alert('An error occurred while creating your booking. Please try again.')
    } finally {
      setBooking(false)
    }
  }

  const similarExperts = []

  // If no sessions available, show fallback
  if (sessions.length === 0) {
    return (
      <Card className="mt-16 bg-gray-50 border border-gray-200 relative overflow-hidden">
        <CardContent className="p-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">No Sessions Available</h2>
            <p className="text-gray-600">This expert hasn't published any sessions yet.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
    <Card className="mt-16 bg-gray-50 border border-gray-200 relative overflow-hidden">
      <CardContent className="p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-left mb-8">
            <div className="flex items-center justify-between ">
              <div>
                <h2 className="text-4xl font-bold text-gray-900">{currentSession?.eventName || 'Book a Session'}</h2>
                <p className="text-gray-600 mt-2">
                  Get personalized, one-on-one guidance and expert insights from {expert.name}<br />
                  to help you achieve your goals and overcome challenges
                </p>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-gray-900">{currentSession?.currency || 'USD'} {currentPrice}</div>
                <p className="text-gray-500 text-xs">You will not be charged yet.</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              {/* Session Selection */}
              {sessions.length > 1 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Choose Session:</h3>
                  <div className="space-y-2">
                    {sessions.map((session) => (
                      <Button
                        key={session.id}
                        variant="outline"
                        onClick={() => setSelectedSession(session)}
                        className={`w-full text-left p-4 rounded-lg border transition-all justify-start h-auto ${
                          currentSession?.id === session.id
                            ? 'bg-blue-50 border-blue-300 text-blue-900'
                            : 'bg-white border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50'
                        }`}
                      >
                        <div className="font-medium text-sm">{session.eventName}</div>
                        <div className="text-xs text-gray-500 mt-1 capitalize">
                          {session.type.replace('-', ' ')} • {session.category}
                        </div>
                      </Button>
                    ))} 
                  </div>
                </div>
              )}

              {currentSession && (
                <>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Get Advice On:</h3>
                    <ul className="space-y-3">
                      {currentSession.advicePoints?.map((item, index) => (
                        <li key={index} className="flex items-start">
                          <div className="flex-shrink-0 w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                            <span className="text-xs font-bold text-green-600">{index + 1}</span>
                          </div>
                          <span className="text-gray-700 text-sm leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Duration</h3>
                    <div className="grid grid-cols-3 gap-3">
                      {Object.entries(sessionPricing).map(([duration, price]) => (
                        <Button
                          key={duration}
                          variant={selectedDuration === duration ? "default" : "outline"}
                          onClick={() => setSelectedDuration(duration)}
                          className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                            selectedDuration === duration
                              ? 'bg-blue-600 text-white'
                              : 'bg-white border border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50'
                          }`}
                        >
                          {duration === '15' ? 'Quick - 15 min' : duration === '30' ? 'Reg - 30 min' : 'Long - 1 hour'}
                        </Button>
                      ))}
                    </div>
                  </div>
                </>
              )}

            </div>
            
            <div className="space-y-6">
              {/* Step 1: Date Selection */}
              {!selectedDate && (
                <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="w-full">
                <Calendar
                  key={calendarKey}
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border-0 w-full hover:none"
                    modifiers={{
                      available: getAvailableDates(),
                      today: new Date()
                    }}
                    modifiersClassNames={{
                      available: "bg-blue-500 text-white hover:bg-blue-600 hover:text-white rounded-full",
                      today: "text-blue-500 font-semibold"
                    }}
                />
              </div>
                </div>
              )}

              {selectedDate && !selectedTimeSlot && (
                <div className="bg-white rounded-lg p-6 border border-gray-200 min-h-[400px]">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Select a Time</h3>
                      <p className="text-sm text-gray-600">
                        {selectedDate.toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedDate(null)}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      Change Date
                    </Button>
                  </div>
                  
                  {loadingAvailability ? (
                    <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                      {Array.from({ length: 9 }).map((_, index) => (
                        <div
                          key={index}
                          className="p-3 rounded-lg border border-gray-200 bg-gray-100 animate-pulse"
                        >
                          <div className="h-4 bg-gray-300 rounded"></div>
                        </div>
                      ))}
                    </div>
                  ) : availableSlots.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                      {availableSlots.map((slot, index) => (
                        <Button
                          key={index}
                          variant={selectedTimeSlot?.start === slot.start ? "default" : "outline"}
                          onClick={() => setSelectedTimeSlot(slot)}
                          className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                            selectedTimeSlot?.start === slot.start
                              ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700 hover:text-white'
                              : 'bg-white border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50 hover:text-gray-900'
                          }`}
                        >
                          <div className="flex items-center justify-center">
                            {slot.start}
                          </div>
                        </Button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-600 text-sm">
                        No available slots for this date
                      </p>
                      <p className="text-gray-500 text-xs mt-1">
                        Try selecting a different date or duration
                      </p>
                    </div>
                  )}
                </div>
              )}

              {selectedDate && selectedTimeSlot && (
                <div className="bg-white rounded-lg p-6 border border-gray-200 min-h-[400px]">
                  <div className="text-left mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Booking Summary</h3>
                    <p className="text-gray-600">Review your session details before booking</p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-6 space-y-4 max-h-64 overflow-y-auto">
                    <div className="gap-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center py-2 border-b border-gray-200">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-600 font-medium">Full Name:</span>
                          </div>
                          <span className="text-gray-900 text-sm">{user?.fullName || user?.firstName + ' ' + user?.lastName || 'User'}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-200">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-600 font-medium">Email:</span>
                          </div>
                          <span className="text-gray-900 text-sm">{user?.primaryEmailAddress?.emailAddress || 'user@example.com'}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-200">
                          <div className="flex items-center gap-2">
                            <CalendarIcon className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-600 font-medium">Date:</span>
                          </div>
                          <span className="text-gray-900 text-sm">{selectedDate.toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-200">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-600 font-medium">Time:</span>
                          </div>
                          <span className="text-gray-900 text-sm">
                            {selectedTimeSlot.start} - {formatTime(selectedTimeSlot.startTime + selectedTimeSlot.duration)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between items-center py-2 border-b border-gray-200">
                          <div className="flex items-center gap-2">
                            <Timer className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-600 font-medium">Duration:</span>
                          </div>
                          <span className="text-gray-900 text-sm">{selectedDuration} minutes</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-200">
                          <div className="flex items-center gap-2">
                            <Video className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-600 font-medium">Session Platform:</span>
                          </div>
                          <span className="text-gray-900 text-sm">
                            {currentSession?.platform === 'zoom' ? 'Zoom' : 
                             currentSession?.platform === 'google_meet' ? 'Google Meet' : 
                             'Zoom'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-200">
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-600 font-medium">Price:</span>
                          </div>
                          <span className="text-gray-900 text-sm text-lg">
                            {currentSession?.currency || 'USD'} {currentPrice}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                          <div className="flex items-center gap-2">
                            <UserCheck className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-600 font-medium">Expert:</span>
                          </div>
                          <span className="text-gray-900 text-sm">{expert?.name}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 mt-6">
                    <Button 
                      variant="outline"
                      className="flex-1" 
                      size="lg"
                      onClick={() => setSelectedTimeSlot(null)}
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Time Slot
                    </Button>
                    <Button 
                      className="flex-1 bg-blue-600 text-white hover:bg-blue-700 hover:text-white" 
                      size="lg"
                      onClick={handleBooking}
                      disabled={booking}
                    >
                      {booking ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Confirming Booking...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Confirm Your Booking
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    {/* Similar Experts Section - Only show when there are actual similar experts from database */}
    {similarExperts.length > 0 && (
    <div className="mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'var(--font-playfair)' }}>
            Similar Experts
          </h2>
          <p className="text-gray-600 text-lg" style={{ fontFamily: 'var(--font-switzer)' }}>
            Discover other top advisors who can help with your business challenges
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {similarExperts.map((similarExpert) => (
            <Link key={similarExpert.id} href={`/marketplace/${similarExpert.username}`}>
              <Card className="group hover:scale-105 transition-transform duration-300 hover:border-gray-200 cursor-pointer h-full overflow-hidden rounded-xl py-0">
                <CardContent className="p-0">
                  <div className="relative">
                    <NextImage
                      src={similarExpert.avatar}
                      alt={similarExpert.name}
                      width={400}
                      height={256}
                      quality={100}
                      className="w-full h-64 object-cover"
                      style={{ objectPosition: 'center top' }}
                    />
                    {similarExpert.isTopAdvisor && (
                      <Badge className="absolute top-4 right-4 bg-amber-500 hover:bg-amber-600 text-white border-0 shadow-lg transition-colors duration-200 flex items-center gap-1.5">
                        <Crown className="w-3 h-3" />
                        Top Advisor
                      </Badge>
                    )}
                  </div>
        
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="font-bold text-gray-900 text-lg leading-tight" style={{ fontFamily: 'var(--font-playfair)' }}>{similarExpert.name}</h3>
                      <div className="flex items-center bg-yellow-50 px-2 py-1 rounded-full">
                        <Star className="w-4 h-4 text-yellow-500 mr-1 fill-current" />
                        <span className="text-gray-900 text-sm font-semibold" style={{ fontFamily: 'var(--font-switzer)' }}>{similarExpert.rating}</span>
                      </div>
                    </div>

                    <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-2 h-10" style={{ fontFamily: 'var(--font-switzer)' }}>
                      {similarExpert.title}
                    </p>

                    <div className="flex items-baseline justify-between">
                      <div>
                        <span className="text-gray-900 font-bold text-2xl">${similarExpert.price}</span>
                        <span className="text-gray-500 text-xs ml-1" style={{ fontFamily: 'var(--font-switzer)' }}>per session</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
    )}
    </>
  )
}
