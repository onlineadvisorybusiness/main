'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { TimezoneSelect } from '@/components/ui/timezone-select'
import { DatePickerSheet } from '@/components/DatePickerSheet'
import { convertTime, getCurrentTimeInTimezone, timezones } from '@/lib/timezone'
import { Star, Crown, Clock, CheckCircle, Timer, Video, DollarSign, VerifiedIcon, User, Mail, Calendar as CalendarIcon, ArrowLeft, CreditCard, BadgeCheck } from 'lucide-react'
import NextImage from 'next/image'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'

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
  const [timezone, setTimezone] = useState('Asia/Kolkata')
  
  const defaultSession = sessions.length > 0 ? sessions[0] : null
  const currentSession = selectedSession || defaultSession
  
  const initialExpertTimezone = currentSession?.timezone || expert?.timezone || 'UTC'
  const [expertTimezone, setExpertTimezone] = useState(initialExpertTimezone)

  const getSessionPricing = (session) => {
    if (!session || !session.prices) return {}
    
    let prices = session.prices
    if (typeof prices === 'string') {
      try {
        prices = JSON.parse(prices)
      } catch (e) {
        prices = {}
      }
    }
    
    return prices
  }
  
  const sessionPricing = getSessionPricing(currentSession)
  const currentPrice = sessionPricing[selectedDuration] || 0

  useEffect(() => {
    if (expert?.username) {
      fetchExpertAvailability()
    }
  }, [expert?.username, currentSession?.timezone])
  
  // Update expert timezone when session changes or when expert prop changes
  useEffect(() => {
    // Prefer session timezone over expert timezone (session is more specific)
    if (currentSession?.timezone) {
      setExpertTimezone(currentSession.timezone)
    } else if (expert?.timezone) {
      setExpertTimezone(expert.timezone)
    }
  }, [currentSession?.timezone, expert?.timezone])

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

  // Store available dates in state to avoid recalculating
  const [availableDatesList, setAvailableDatesList] = useState([])

  // Define getAvailableDates before useEffect that uses it
  const getAvailableDates = useCallback(() => {
    const availableDates = []
    const today = new Date()
    today.setHours(0, 0, 0, 0) 
      
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
  }, [expertAvailability, existingBookings, selectedDuration])

  // Update available dates and auto-select first available date whenever dependencies change
  useEffect(() => {
    if (Object.keys(expertAvailability).length > 0) {
      const dates = getAvailableDates()
      setAvailableDatesList(dates)
      
      // Auto-select first available date if none selected and generate slots for it
      if (!selectedDate && dates.length > 0) {
        const firstAvailableDate = dates[0]
        setSelectedDate(firstAvailableDate)
        // Generate slots will be triggered by the effect below when selectedDate changes
      }
    }
  }, [expertAvailability, existingBookings, selectedDuration, getAvailableDates, selectedDate])

  const generateAvailableSlots = useCallback((date = selectedDate) => {
    // Use provided date or fall back to first available date
    const dateToUse = date || (availableDatesList.length > 0 ? availableDatesList[0] : null)
    
    if (!dateToUse || !expertAvailability) {
      setAvailableSlots([])
      return
    }

    const year = dateToUse.getFullYear()
    const month = String(dateToUse.getMonth() + 1).padStart(2, '0')
    const day = String(dateToUse.getDate()).padStart(2, '0')
    const selectedDateStr = `${year}-${month}-${day}`
    
    const dayOfWeek = dateToUse.getDay()
    const dayAvailability = expertAvailability[dayOfWeek] || []
    const dayBookings = existingBookings[selectedDateStr] || []

    // ========== DEBUG LOGGING ==========
    console.group('🔍 [DEBUG] generateAvailableSlots called')
    console.log('Date:', selectedDateStr)
    console.log('Day of Week:', dayOfWeek)
    console.log('expertTimezone state:', expertTimezone)
    console.log('currentSession?.timezone:', currentSession?.timezone)
    console.log('expert?.timezone:', expert?.timezone)
    // ===================================
    
    const expertTz = currentSession?.timezone || expertTimezone || expert?.timezone || 'UTC'
    const learnerTz = timezone || 'Asia/Kolkata'
    
    // ========== DEBUG LOGGING ==========
    console.log('Final expertTz:', expertTz)
    console.log('Learner Timezone:', learnerTz)
    console.log('Expert Availability (RAW):', dayAvailability.map(av => `${av.startTime} - ${av.endTime}`).join(', '))
    console.log('Existing Bookings:', dayBookings.map(b => `${b.startTime} - ${b.endTime}`).join(', ') || 'None')
    console.groupEnd()
    // ===================================
        
    if (dayAvailability.length === 0) {
      console.log('⚠️ [DEBUG] No availability for day', dayOfWeek)
      setAvailableSlots([])
      return
    }

    const slots = []
    const duration = parseInt(selectedDuration)

    dayAvailability.forEach((availability, idx) => {
      // Get times in expert's timezone
      const expertStartTime = availability.startTime
      const expertEndTime = availability.endTime
      
      // ========== DEBUG LOGGING ==========
      console.group(`🔍 [DEBUG] Processing availability ${idx + 1}`)
      console.log('Expert Time (in ' + expertTz + '):', expertStartTime, '-', expertEndTime)
      console.log('Learner Timezone:', learnerTz)
      // ===================================
      
      // Convert to learner's timezone if different
      // Always pass the date to ensure accurate DST handling
      const learnerStartTime = expertTz !== learnerTz 
        ? convertTime(expertStartTime, expertTz, learnerTz, dateToUse)
        : expertStartTime
      const learnerEndTime = expertTz !== learnerTz
        ? convertTime(expertEndTime, expertTz, learnerTz, dateToUse)
        : expertEndTime
      
      // ========== DEBUG LOGGING ==========
      console.log('BEFORE CONVERSION - Expert:', expertStartTime, '-', expertEndTime, '(in', expertTz + ')')
      console.log('AFTER CONVERSION - Learner:', learnerStartTime, '-', learnerEndTime, '(in', learnerTz + ')')
      console.log('Conversion Applied:', expertTz !== learnerTz ? 'YES' : 'NO (same timezone)')
      // ===================================
      
      const startTime = parseTime(learnerStartTime)
      const endTime = parseTime(learnerEndTime)
      
      // ========== DEBUG LOGGING ==========
      console.log('Parsed to minutes - Start:', startTime, 'End:', endTime, 'Duration:', duration)
      console.groupEnd()
      // ===================================
      
      let currentTime = startTime
      let slotCount = 0
      while (currentTime <= endTime) {
        const canFit = currentTime + duration <= endTime
        if (canFit) {
          // Check bookings in expert's timezone
          const isBooked = dayBookings.some(booking => {
            const bookingStart = parseTime(booking.startTime)
            const bookingEnd = parseTime(booking.endTime)
            
            // Convert booking times to learner timezone for comparison
            // Always pass the date to ensure accurate DST handling
            const bookingStartLearner = expertTz !== learnerTz
              ? parseTime(convertTime(formatTimeForAPI(bookingStart), expertTz, learnerTz, dateToUse))
              : bookingStart
            const bookingEndLearner = expertTz !== learnerTz
              ? parseTime(convertTime(formatTimeForAPI(bookingEnd), expertTz, learnerTz, dateToUse))
              : bookingEnd
            
            const slotStart = currentTime
            const slotEnd = currentTime + duration
            
            const timeOverlap = (slotStart < bookingEndLearner && slotEnd > bookingStartLearner)
            return timeOverlap
          })

          if (!isBooked) {
            // Convert back to get expert time for storage
            const expertTimeMinutes = expertTz !== learnerTz
              ? parseTime(convertTime(formatTimeForAPI(currentTime), learnerTz, expertTz, dateToUse))
              : currentTime
            
            const slot = {
              start: formatTime(currentTime),
              startTime: currentTime,
              endTime: currentTime + duration,
              duration: duration,
              expertStartTime: expertTimeMinutes, // Store original expert time for booking
              expertEndTime: expertTimeMinutes + duration
            }
            
            slots.push(slot)
            slotCount++
            
            // ========== DEBUG LOGGING ==========
            if (slotCount <= 5) { // Log first 5 slots
              console.log(`✅ Slot ${slotCount}:`, {
                'Display (Learner)': slot.start,
                'Learner Minutes': currentTime,
                'Expert Minutes': expertTimeMinutes,
                'Expert Time': formatTimeForAPI(expertTimeMinutes) + ' (in ' + expertTz + ')'
              })
            }
            // ===================================
          }
        }
        currentTime += duration 
      }
    })

    // Sort slots by time
    slots.sort((a, b) => a.startTime - b.startTime)
    
    // ========== DEBUG LOGGING ==========
    console.group('📊 [DEBUG] Final Slots Summary')
    console.log('Total Slots Generated:', slots.length)
    console.log('Expert Timezone:', expertTz)
    console.log('Learner Timezone:', learnerTz)
    if (slots.length > 0) {
      console.table(slots.slice(0, 10).map(s => ({
        'Display Time (Learner)': s.start,
        'Learner Minutes': s.startTime,
        'Expert Minutes': s.expertStartTime,
        'Expert Time': formatTimeForAPI(s.expertStartTime)
      })))
    } else {
      console.warn('⚠️ No slots generated!')
    }
    console.groupEnd()
    // ===================================
    
    setAvailableSlots(slots)
    // Reset selected slot if date changed or if slots were regenerated
    if (dateToUse !== selectedDate) {
      setSelectedTimeSlot(null)
    }
  }, [selectedDate, selectedDuration, expertAvailability, existingBookings, availableDatesList, expertTimezone, timezone, currentSession, expert])

  useEffect(() => {
    // Generate slots when selectedDate changes, timezone changes, or when availability data is loaded
    if (selectedDate && Object.keys(expertAvailability).length > 0) {
      generateAvailableSlots(selectedDate)
    } else if (!selectedDate && availableDatesList.length > 0 && Object.keys(expertAvailability).length > 0) {
      const firstDate = availableDatesList[0]
      generateAvailableSlots(firstDate)
    }
  }, [selectedDate, generateAvailableSlots, expertAvailability, availableDatesList, timezone, expertTimezone])
  
  // Reset selected slot when timezone changes
  useEffect(() => {
    if (timezone) {
      const dateStr = selectedDate ? `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}` : 'None'
      console.group('🕐 [DEBUG] Timezone Changed')
      console.log('New Learner Timezone:', timezone)
      console.log('Expert Timezone:', expertTimezone)
      console.log('Selected Date:', dateStr)
      console.log('Available Slots Before Reset:', availableSlots.length)
      console.groupEnd()
      setSelectedTimeSlot(null)
    }
  }, [timezone])
  
  // Log initial state
  useEffect(() => {
    const dateStr = selectedDate ? `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}` : 'None'
    console.group('🚀 [DEBUG] BookingSection Initialized')
    console.log('Expert Timezone:', expertTimezone || 'UTC')
    console.log('Learner Timezone:', timezone || 'UTC')
    console.log('Selected Date:', dateStr)
    console.log('Expert Availability:', Object.keys(expertAvailability).length > 0 ? 'Loaded' : 'Not loaded')
    console.log('Existing Bookings:', Object.keys(existingBookings).length)
    console.groupEnd()
  }, [])


  const fetchExpertAvailability = async () => {
    try {
      setLoadingAvailability(true)
      const response = await fetch(`/api/availability/expert/${expert.username}`)
      if (response.ok) {
        const data = await response.json()
        setExpertAvailability(data.availabilities || {})
        setExistingBookings(data.existingBookings || {})
        // Set expert timezone from API response, session, or expert prop (priority order)
        // API response has highest priority, then session, then expert prop
        if (data.expert?.timezone) {
          setExpertTimezone(data.expert.timezone)
        } else if (currentSession?.timezone) {
          setExpertTimezone(currentSession.timezone)
        } else if (expert?.timezone) {
          setExpertTimezone(expert.timezone)
        }
      }
    } catch (error) {
    } finally {
      setLoadingAvailability(false)
    }
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
      
      // Convert selected time back to expert timezone for storage
      const expertStartTime = selectedTimeSlot.expertStartTime !== undefined
        ? formatTimeForAPI(selectedTimeSlot.expertStartTime)
        : formatTimeForAPI(selectedTimeSlot.startTime)
      const expertEndTime = selectedTimeSlot.expertEndTime !== undefined
        ? formatTimeForAPI(selectedTimeSlot.expertEndTime)
        : formatTimeForAPI(selectedTimeSlot.endTime)
      
      const bookingData = {
        sessionId: currentSession.id,
        date: localDate,
        startTime: expertStartTime, // Store in expert's timezone
        endTime: expertEndTime, // Store in expert's timezone
        duration: parseInt(selectedDuration),
        expertUsername: expert.username,
        learnerTimezone: timezone || 'UTC',
        expertTimezone: expertTimezone || 'UTC'
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
        toast.success('Booking confirmed successfully!', {
          description: `Your session has been scheduled and added to your calendar. Meeting Link: ${result.booking.meetingLink}`,
          duration: 5000,
        })
        // Reset the form and refresh availability
        setSelectedTimeSlot(null)
        setSelectedDate(null)
        // Refresh availability to update existing bookings
        fetchExpertAvailability()
      } else {
        const error = await response.json()
        toast.error('Booking failed', {
          description: error.error || 'Please try again.',
        })
      }
    } catch (error) {
      toast.error('An error occurred', {
        description: 'Please try again later.',
      })
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
    <Card className="mt-8 bg-white relative overflow-hidden border-0 shadow-none p-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 p-4">
        <div className="lg:col-span-2 relative hidden lg:block rounded-2xl overflow-hidden shadow-xl border-2 border-gray-200">
          <div className="w-full h-full relative rounded-2xl overflow-hidden">
            <NextImage
              src={expert.avatar}
              alt={expert.name}
              width={400}
              height={600}
              quality={100}
              className="w-full h-full object-cover object-center"
              style={{ objectPosition: 'center top' }}
            />

            {/* Top Advisor Badge - Top Left */}
            {expert.isTopAdvisor && (
              <div className="absolute top-4 left-4 z-20">
                <Badge className="bg-amber-500 hover:bg-amber-600 text-white border-0 shadow-lg transition-colors duration-200 flex items-center gap-1.5 px-3 py-1.5">
                  <Crown className="w-4 h-4" />
                  <span className="text-sm font-medium">Top Advisor</span>
                </Badge>
              </div>
            )}

            <div className="absolute bottom-0 left-0 right-0 h-56 bg-gradient-to-t from-black/80 to-transparent rounded-b-2xl pointer-events-none"></div>
              
            <div className="absolute bottom-0 left-0 right-0 p-8 pb-10 rounded-b-2xl z-10">
              <div className="flex items-center gap-1.5 mb-3">
                <h3 className="text-white text-4xl font-bold leading-tight tracking-tight">{expert.name}</h3>
                {expert.isVerified && (
                  <div className="flex-shrink-0">
                    <BadgeCheck className="hover-rotate-icon w-7 h-7 text-blue-400 fill-blue-500 stroke-white stroke-[1.5] mt-2 cursor-pointer" />
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
              {expert.bio && (
                  <p className="text-white/95 text-sm leading-relaxed line-clamp-2 font-normal">
                    {expert.bio}
                  </p>
              )}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 p-4">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Book a 1:1 Video Call</h2>

            {(() => {
              let averageRating = 0
              let totalReviews = 0
              
              if (expert?.reviews && Array.isArray(expert.reviews) && expert.reviews.length > 0) {
                const validReviews = expert.reviews.filter(review => {
                  if (!review || typeof review !== 'object') return false
                  const stars = review.stars
                  return stars !== null && stars !== undefined && !isNaN(parseInt(stars)) && parseInt(stars) >= 1 && parseInt(stars) <= 5
                })
                
                if (validReviews.length > 0) {
                  totalReviews = validReviews.length
                  const totalStars = validReviews.reduce((sum, review) => {
                    const stars = parseInt(review.stars) || 0
                    return sum + stars
                  }, 0)
                  averageRating = totalStars / totalReviews
                }
              }
              
              // Don't display rating section if no reviews or rating is 0
              if (totalReviews === 0 || averageRating === 0) {
                return null
              }
              
              const displayRatingValue = Math.round(averageRating * 10) / 10
              
              const fullStars = Math.floor(averageRating)
              const remainder = averageRating - fullStars
              const hasHalfStar = remainder >= 0.25 && remainder < 0.75
              const hasFullStarAtPosition = remainder >= 0.75
              
              const stars = []
              for (let i = 0; i < 5; i++) {
                if (i < fullStars) {
                  stars.push(
                    <svg key={i} className="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                  )
                } else if (i === fullStars && hasFullStarAtPosition) {
                  stars.push(
                    <svg key={i} className="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                  )
                } else if (i === fullStars && hasHalfStar) {
                  stars.push(
                    <div key={i} className="relative w-6 h-6 inline-block">
                      <svg className="w-6 h-6 text-gray-300 absolute inset-0" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                      </svg>
                      <div className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}>
                        <svg className="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                        </svg>
                      </div>
                    </div>
                  )
                } else {
                  stars.push(
                    <svg key={i} className="w-6 h-6 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                  )
                }
              }
              
              return (
                <div className="mb-4 inline-flex items-center gap-2">
                  <div className="inline-flex items-center gap-0.5">
                    {stars}
                  </div>
                  <span className="text-gray-800 text-lg">
                    ({displayRatingValue.toFixed(1)})
                  </span>
            </div>
              )
            })()}
            
            <div className="text-left mb-8">
              {sessions.length > 1 && (
                <div className="mb-6">
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
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2 ">Get Advice On:</h3>
                    <ul className="space-y-3">
                      {currentSession.advicePoints?.map((item, index) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle className="flex-shrink-0 w-4 h-4 text-gray-800 mr-3 mt-1" />
                          <span className="text-gray-700 text-sm leading-relaxed capitalize">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Duration : </h3>
                    <div className="grid grid-cols-3 gap-3">
                      {Object.entries(sessionPricing).map(([duration, price]) => (
                        <Button
                          key={duration}
                          variant={selectedDuration === duration ? "default" : "outline"}
                          onClick={() => {
                            // Clear date and time slot when duration changes since slots are duration-specific
                            if (selectedDuration !== duration) {
                              setSelectedDate(null)
                              setSelectedTimeSlot(null)
                            }
                            setSelectedDuration(duration)
                          }}
                          className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                            selectedDuration === duration
                              ? 'bg-blue-600 text-white hover:bg-blue-700 hover:text-white'
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
            
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Date & Hour</h3>              
              <DatePickerSheet
                selectedDate={selectedDate}
                onSelectDate={(date) => {
                  setSelectedDate(date)
                  // Slots will be regenerated by the generateAvailableSlots effect
                }}
                selectedTimeSlot={selectedTimeSlot}
                onSelectTimeSlot={setSelectedTimeSlot}
                availableDates={availableDatesList}
                availableSlots={availableSlots}
                loadingAvailability={loadingAvailability}
                expert={expert}
                sessions={sessions}
                selectedSession={currentSession}
                timezone={timezone}
                onTimezoneChange={(value) => {
                  const dateStr = selectedDate ? `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}` : 'None'
                  console.group('🔄 [DEBUG] Timezone Selector Changed')
                  console.log('FROM:', timezone, '→ TO:', value)
                  console.log('Expert Timezone:', expertTimezone)
                  console.log('Selected Date:', dateStr)
                  console.groupEnd()
                  setTimezone(value)
                  setSelectedTimeSlot(null) // Reset selected slot when timezone changes
                }}
              />
              
              {timezone && (
                <div className="mt-3 text-sm text-gray-600 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>
                    Selected Timezone: <span className="font-semibold text-gray-900">
                      {timezones.find(tz => tz.value === timezone)?.label || timezone}
                    </span>
                  </span>
                </div>
              )}
            </div>            

            <Separator className="my-4 bg-gray-900 h-px w-full" />
            
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Total</h3>
                <p className="text-gray-500 text-xs mt-1">You will not be charged yet.</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-semibold text-gray-900">
                  ${currentPrice}
                </div>
              </div>
            </div>
            
            <Button 
              className="w-full bg-blue-600 text-white hover:bg-blue-700 hover:text-white" 
              size="lg"
              onClick={handleBooking}
              disabled={booking || !selectedDate || !selectedTimeSlot}
            >
              {booking ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Confirming Booking...
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4 mr-2" />
                  Confirm Booking & Pay
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </Card>

    {similarExperts.length > 0 && (
    <div className="mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Similar Advisors
          </h2>
          <p className="text-gray-600 text-lg">
            Discover other top advisors who can help with your goals and challenges
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
                        <span className="text-gray-900 text-sm font-semibold">{(similarExpert.rating || 5.0).toFixed(1)}</span>
                      </div>
                    </div>

                    <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-2 h-10">
                      {similarExpert.title}
                    </p>

                    <div className="flex items-baseline justify-between">
                      <div>
                        <span className="text-gray-900 font-bold text-2xl">${similarExpert.price}</span>
                        <span className="text-gray-500 text-xs ml-1">per session</span>
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
