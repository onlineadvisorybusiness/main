import { PrismaClient } from '@prisma/client'
import { auth } from '@clerk/nextjs/server'
import { google } from 'googleapis'
import { z } from 'zod'
import { createCalendarEvent, isGoogleCalendarConnected } from '@/lib/google-calendar'

const prisma = new PrismaClient()

const bookingSchema = z.object({
  sessionId: z.string().min(1, 'Session ID is required'),
  date: z.string().min(1, 'Date is required'),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  duration: z.number().min(15).max(120, 'Duration must be between 15 and 120 minutes'),
  expertUsername: z.string().min(1, 'Expert username is required'),
  learnerTimezone: z.string().optional(),
  expertTimezone: z.string().optional(),
})

const getGoogleCalendarClient = async (accessToken) => {
  const oauth2Client = new google.auth.OAuth2()
  oauth2Client.setCredentials({ access_token: accessToken })
  
  return google.calendar({ version: 'v3', auth: oauth2Client })
}

const generateGoogleMeetLink = () => {
  const chars = 'abcdefghijklmnopqrstuvwxyz'

  let part1 = ''
  for (let i = 0; i < 3; i++) {
    part1 += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  
  let part2 = ''
  for (let i = 0; i < 4; i++) {
    part2 += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  
  let part3 = ''
  for (let i = 0; i < 3; i++) {
    part3 += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  
  const meetingId = `${part1}-${part2}-${part3}`
  return `https://meet.google.com/${meetingId}`
}

const generateICSFile = (eventData, meetingLink) => {
  const startDate = new Date(eventData.startDateTime)
  const endDate = new Date(eventData.endDateTime)
  
  const formatICSDate = (date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  }
  
  // Clean up description to avoid duplicate meeting links
  const cleanDescription = eventData.description.replace(/Meeting Link:.*$/gm, '').trim()
  
  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Online Advisory Business//Booking System//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:${Date.now()}-${Math.random().toString(36).substr(2, 9)}@onlineadvisorybusiness.com`,
    `DTSTART:${formatICSDate(startDate)}`,
    `DTEND:${formatICSDate(endDate)}`,
    `SUMMARY:${eventData.title}`,
    `DESCRIPTION:${cleanDescription}\\n\\nMeeting Link: ${meetingLink}`,
    `LOCATION:${meetingLink}`,
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    'TRANSP:OPAQUE',
    'BEGIN:VALARM',
    'TRIGGER:-PT10M',
    'ACTION:DISPLAY',
    'DESCRIPTION:Reminder',
    'END:VALARM',
    'BEGIN:VALARM',
    'TRIGGER:-PT1H',
    'ACTION:EMAIL',
    'DESCRIPTION:Meeting reminder',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n')
  
  return icsContent
}

const sendCalendarInviteEmail = async (email, eventData, meetingLink) => {
  try {
    const icsContent = generateICSFile(eventData, meetingLink)

    return { 
      success: true, 
      icsContent,
      downloadUrl: `data:text/calendar;charset=utf-8,${encodeURIComponent(icsContent)}`
    }
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to send calendar invite email'
    }
  }
}

const sendCancellationEmail = async (email, eventData, cancelledByName) => {
  try {
    const icsContent = generateCancellationICSFile(eventData, cancelledByName)

    return {
      success: true,
      downloadUrl: `data:text/calendar;charset=utf-8,${encodeURIComponent(icsContent)}`
    }
  } catch (error) {
    throw error
  }
}

const generateCancellationICSFile = (eventData, cancelledByName) => {
  const startDate = new Date(eventData.startDateTime)
  const endDate = new Date(eventData.endDateTime)
  
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    throw new Error('Invalid start or end date for cancellation ICS file')
  }
  
  const formatICSDate = (date) => {
    if (!date || isNaN(date.getTime())) {
      throw new Error('Invalid date provided to generateCancellationICSFile')
    }
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  }
  
  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Online Advisory Business//Cancellation System//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:CANCEL',
    'BEGIN:VEVENT',
    `UID:cancelled-${Date.now()}@onlineadvisorybusiness.com`,
    `DTSTAMP:${formatICSDate(new Date())}`,
    `DTSTART:${formatICSDate(startDate)}`,
    `DTEND:${formatICSDate(endDate)}`,
    `SUMMARY:${eventData.title}`,
    `DESCRIPTION:${eventData.description}\\n\\nCancelled by: ${cancelledByName}`,
    `LOCATION:${eventData.location}`,
    'STATUS:CANCELLED',
    'SEQUENCE:1',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\\r\\n')
  
  return icsContent
}

async function getZoomAccessToken() {
  try {
    const clientId = process.env.ZOOM_CLIENT_ID;
    const clientSecret = process.env.ZOOM_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
      throw new Error("Zoom OAuth credentials not configured")
    }
    
    const base64Credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64")
    const response = await fetch("https://zoom.us/oauth/token", {
      method: "POST",
        headers: {
          Authorization: `Basic ${base64Credentials}`,
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
          grant_type: "account_credentials",
          account_id: process.env.ZOOM_ACCOUNT_ID
        })
      })
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`Zoom OAuth error: ${errorData.message || response.statusText}`)
    }
    const tokenData = await response.json()
    return tokenData.access_token
  } catch (error) {
    throw error
  }
}


async function createZoomMeeting(bookingData, event, timezone = 'UTC') {
  try {
    
    const accessToken = await getZoomAccessToken()
    
    // Parse start and end times
    const [datePart, timePart] = bookingData.startTime.split('T')
    const [startHour, startMin] = timePart.split(':').map(Number)
    const [endHour, endMin] = bookingData.endTime.split('T')[1].split(':').map(Number)
    
    const [year, month, day] = datePart.split('-').map(Number)
    const startDateTime = new Date(year, month - 1, day, startHour, startMin)
    const endDateTime = new Date(year, month - 1, day, endHour, endMin)
    const durationMinutes = Math.round((endDateTime - startDateTime) / 60000)
    
    // Format start time in ISO format
    const formattedStartTime = startDateTime.toISOString()
    
    const response = await fetch("https://api.zoom.us/v2/users/me/meetings", {
      method: "POST",
      headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json"
      },
      body: JSON.stringify({
          topic: `Meeting with ${bookingData.name} - ${event.title}`,
        type: 2,
          start_time: formattedStartTime,
          duration: durationMinutes,
          timezone: timezone || "UTC", 
          agenda: bookingData.additionalInfo || "No additional info provided.",
        settings: {
          host_video: true,
          participant_video: true,
            join_before_host: true,
            mute_upon_entry: false,
            waiting_room: false,
            auto_recording: "none"
        }
      })
    })
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (jsonError) {
        const errorText = await response.text();
        errorMessage = `Zoom API error: ${errorText.substring(0, 200)}...`;
      }
      throw new Error(`Zoom API error: ${errorMessage}`);
    }
    
    const zoomMeeting = await response.json()
    return {
      meetLink: zoomMeeting.join_url,
      meetingId: zoomMeeting.id,
      password: zoomMeeting.password,
      hostUrl: zoomMeeting.start_url
    }
  } catch (error) {
    throw error
  }
}

const addToGoogleCalendar = async (accessToken, eventData) => {
  try {
    const calendar = await getGoogleCalendarClient(accessToken)
    
    const event = {
      summary: eventData.title,
      description: eventData.description,
      start: {
        dateTime: eventData.startDateTime,
        timeZone: 'UTC',
      },
      end: {
        dateTime: eventData.endDateTime,
        timeZone: 'UTC',
      },
      attendees: eventData.attendees,
      conferenceData: eventData.conferenceData,
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 },
          { method: 'popup', minutes: 10 },
        ],
      },
    }

    const response = await calendar.events.insert({
      calendarId: 'primary',
      resource: event,
      conferenceDataVersion: 1,
    })

    return response.data
  } catch (error) {
    throw new Error('Failed to add event to Google Calendar')
  }
}

export async function createBooking(bookingData) {
  try {
    const { userId } = await auth()
    if (!userId) {
      throw new Error('User not authenticated')
    }

    const validatedData = bookingSchema.parse(bookingData)

    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user) {
      throw new Error('User not found')
    }

    const session = await prisma.session.findUnique({
      where: { id: validatedData.sessionId },
      include: { expert: true }
    })

    if (!session) {
      throw new Error('Session not found')
    }

    if (session.status !== 'active') {
      throw new Error('Session is not active')
    }

    const expert = await prisma.user.findUnique({
      where: { username: validatedData.expertUsername }
    })

    if (!expert) {
      throw new Error('Expert not found')
    }

    if (expert.accountStatus !== 'expert') {
      throw new Error('User is not an expert')
    }

    // Prevent self-booking (expert booking for themselves)
    if (user.id === expert.id) {
      throw new Error('You cannot book a session with yourself')
    }

    const [year, month, day] = validatedData.date.split('-').map(Number)
    const bookingDate = new Date(year, month - 1, day) // month is 0-indexed
    const dayOfWeek = bookingDate.getDay()
    
    if (!validatedData.endTime || validatedData.endTime.includes('NaN')) {
      throw new Error('Invalid booking time - please try selecting a different time slot')
    }

    const allAvailabilities = await prisma.availability.findMany({
      where: {
        expertId: expert.id,
        dayOfWeek: dayOfWeek,
        isActive: true
      }
    })

    if (allAvailabilities.length === 0) {
      throw new Error('No specific availability found for expert on this day')
    }

    const existingBooking = await prisma.booking.findFirst({
      where: {
        expertId: expert.id,
        date: bookingDate,
        OR: [
          {
            AND: [
              { startTime: { lte: validatedData.startTime } },
              { endTime: { gt: validatedData.startTime } }
            ]
          },
          {
            AND: [
              { startTime: { lt: validatedData.endTime } },
              { endTime: { gte: validatedData.endTime } }
            ]
          },
          {
            AND: [
              { startTime: { gte: validatedData.startTime } },
              { endTime: { lte: validatedData.endTime } }
            ]
          }
        ],
        status: { in: ['pending', 'confirmed'] }
      }
    })

    if (existingBooking) {
      throw new Error('Time slot is already booked')
    }

    const prices = session.prices
    let price = 0
    let currency = session.currency

    if (validatedData.duration === 15) {
      price = prices.fifteen || 0
    } else if (validatedData.duration === 30) {
      price = prices.thirty || 0
    } else if (validatedData.duration === 60) {
      price = prices.sixty || 0
    } else {
      throw new Error('Invalid duration')
    }

    const learnerTimezone = validatedData.learnerTimezone || user.timezone || 'UTC'
    const expertTimezone = validatedData.expertTimezone || expert.timezone || session.timezone || 'UTC'

    let meetingLink = null
    let meetingId = null
    let meetingPassword = null

    if (session.platform === 'zoom') {
        const [year, month, day] = validatedData.date.split('-').map(Number)
        const [startHour, startMin] = validatedData.startTime.split(':').map(Number)
        const startDateTime = new Date(year, month - 1, day, startHour, startMin)
        
        const startTimeISO = `${validatedData.date}T${validatedData.startTime}:00`
        const endTimeISO = `${validatedData.date}T${validatedData.endTime}:00`
        
      const bookingData = {
        name: `${user.firstName} ${user.lastName}`,
        startTime: startTimeISO,
        endTime: endTimeISO,
        timezone: expertTimezone,
        additionalInfo: `Session: ${session.eventName}`
      }
      const event = {
        title: session.eventName
      }
      const zoomMeeting = await createZoomMeeting(bookingData, event, expertTimezone)
      meetingLink = zoomMeeting.meetLink
        meetingId = zoomMeeting.meetingId
        meetingPassword = zoomMeeting.password
    } else if (session.platform === 'google-meet') {
      meetingLink = generateGoogleMeetLink()
    } else {
      throw new Error(`Unsupported meeting platform: ${session.platform}`)
    }

    // Validate IDs before creating booking
    if (!user.id || !expert.id) {
      throw new Error('Invalid user or expert ID')
    }
    
    if (user.id === expert.id) {
      throw new Error('Cannot create booking: learner and expert cannot be the same user')
    }
    
    const booking = await prisma.booking.create({
      data: {
        clerkId: userId,
        fullName: `${user.firstName} ${user.lastName}`.trim(),
        email: user.email,
        date: bookingDate,
        startTime: validatedData.startTime,
        endTime: validatedData.endTime,
        sessionPlatform: session.platform,
        expert: `${expert.firstName} ${expert.lastName}`.trim(),
        currency: currency,
        amount: price,
        accountType: user.accountStatus,
        meetingLink: meetingLink,
        learnerTimezone: learnerTimezone,
        expertTimezone: expertTimezone,
        status: 'confirmed',
        learnerId: user.id,  // Ensure this is the learner (person making the booking)
        expertId: expert.id,  // Ensure this is the expert (session owner)
        sessionId: session.id
      }
    })
    
    try {
      const [year, month, day] = validatedData.date.split('-').map(Number)
      const [startHour, startMin] = validatedData.startTime.split(':').map(Number)
      const [endHour, endMin] = validatedData.endTime.split(':').map(Number)
      
      const startDateTime = new Date(year, month - 1, day, startHour, startMin)
      const endDateTime = new Date(year, month - 1, day, endHour, endMin)
      
      const istStartDateTime = `${validatedData.date}T${validatedData.startTime}:00+05:30`
      const istEndDateTime = `${validatedData.date}T${validatedData.endTime}:00+05:30`
      
      const eventData = {
        title: `${session.eventName} with ${expert.firstName} ${expert.lastName}`,
        description: `Session: ${session.eventName}\nExpert: ${expert.firstName} ${expert.lastName}\nDuration: ${validatedData.duration} minutes\nMeeting Link: ${meetingLink}`,
        startDateTime: istStartDateTime,
        endDateTime: istEndDateTime,
        attendees: [
          { email: user.email, displayName: `${user.firstName} ${user.lastName}` },
          { email: expert.email, displayName: `${expert.firstName} ${expert.lastName}` }
        ],
        conferenceData: session.platform === 'google-meet' ? {
          createRequest: {
            requestId: `booking-${booking.id}`,
            conferenceSolutionKey: { type: 'hangoutsMeet' }
          }
        } : undefined
      }

      const learnerCalendarConnected = await isGoogleCalendarConnected(userId)
      if (learnerCalendarConnected) {
        try {
          const calendarResult = await createCalendarEvent(userId, eventData)
          if (calendarResult) {
          } else {
          }
        } catch (error) {
        }
      } else {
        try {
          await sendCalendarInviteEmail(user.email, eventData, meetingLink)
        } catch (error) {
        }
      }

      const expertCalendarConnected = await isGoogleCalendarConnected(expert.clerkId)
      if (expertCalendarConnected) {
        try {
          const calendarResult = await createCalendarEvent(expert.clerkId, eventData)
          if (calendarResult) {
          } else {
          }
        } catch (error) {
        }
      }

    } catch (error) {
    }

    return {
      success: true,
      booking: {
        id: booking.id,
        meetingLink: meetingLink,
        meetingId: meetingId,
        meetingPassword: meetingPassword,
        amount: price,
        currency: currency,
        status: booking.status
      }
    }

  } catch (error) {
    
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Validation error',
        details: error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
      }
    }

    return {
      success: false,
      error: error.message || 'Failed to create booking'
    }
  }
}

export async function getUserBookings(userId) {
  try {
    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user) {
      throw new Error('User not found')
    }

    const bookings = await prisma.booking.findMany({
      where: { learnerId: user.id },
      include: {
        session: true,
        expertUser: {
          select: {
            firstName: true,
            lastName: true,
            username: true,
            avatar: true
          }
        }
      },
      orderBy: { date: 'desc' }
    })

    return {
      success: true,
      bookings: bookings
    }
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to fetch bookings'
    }
  }
}

export async function getExpertBookings(userId) {
  try {
    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user) {
      throw new Error('User not found')
    }

    const bookings = await prisma.booking.findMany({
      where: { expertId: user.id },
      include: {
        session: true,
        learner: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            avatar: true
          }
        }
      },
      orderBy: { date: 'desc' }
    })

    return {
      success: true,
      bookings: bookings
    }
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to fetch bookings'
    }
  }
}

export async function getLearnerBookings(userId) {
  try {
    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user) {
      throw new Error('User not found')
    }

    // Fetch all bookings where the user is the learner (by learnerId)
    // Also check bookings by clerkId as a fallback (in case learnerId was incorrectly set)
    const bookingsByLearnerId = await prisma.booking.findMany({
      where: { learnerId: user.id },
      include: {
        session: true,
        expertUser: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            avatar: true
          }
        }
      },
      orderBy: { date: 'desc' }
    })

    // Fallback: Also check bookings by clerkId (in case learnerId was incorrectly set)
    // This catches bookings where the user made the booking (clerkId matches) but learnerId was set incorrectly
    const bookingsByClerkId = await prisma.booking.findMany({
      where: { 
        clerkId: userId,
        expertId: { not: user.id } // User should not be the expert in their own bookings
      },
      include: {
        session: true,
        expertUser: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            avatar: true
          }
        }
      },
      orderBy: { date: 'desc' },
      take: 20 // Limit to avoid too many results
    })

    // Additional fallback: Check by email (in case clerkId was also incorrectly set)
    const bookingsByEmail = await prisma.booking.findMany({
      where: {
        email: user.email,
        expertId: { not: user.id } // User should not be the expert in their own bookings
      },
      include: {
        session: true,
        expertUser: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            avatar: true
          }
        }
      },
      orderBy: { date: 'desc' },
      take: 20
    })

    // Deduplicate bookings by ID (in case same booking appears in multiple queries)
    const bookingsMap = new Map()
    const allBookingsArray = bookingsByLearnerId.concat(bookingsByClerkId).concat(bookingsByEmail)
    allBookingsArray.forEach(booking => {
      if (!bookingsMap.has(booking.id)) {
        bookingsMap.set(booking.id, booking)
      }
    })
    const allBookings = Array.from(bookingsMap.values())

    // Also check for any bookings involving this user (in case of data corruption)
    // This is for debugging to understand what bookings exist
    const allUserBookings = await prisma.booking.findMany({
      where: {
        OR: [
          { learnerId: user.id },
          { expertId: user.id },
          { clerkId: userId }
        ]
      },
      select: {
        id: true,
        learnerId: true,
        expertId: true,
        status: true,
        date: true,
        clerkId: true,
        fullName: true,
        email: true
      },
      take: 20
    })

    // Also check all bookings in the database (limited) for debugging
    const debugBookings = await prisma.booking.findMany({
      select: {
        id: true,
        learnerId: true,
        expertId: true,
        status: true,
        date: true,
        clerkId: true,
        fullName: true,
        email: true
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    // Filter out corrupted bookings (where learnerId === expertId)
    // Also ensure bookings are actually for this learner (check clerkId or learnerId)
    const validBookings = allBookings.filter(booking => {
      // Reject if it's a self-booking (corrupted)
      if (String(booking.learnerId) === String(booking.expertId)) {
        return false
      }
      
      // Check if user is the expert - if so, exclude it (should only show in expert bookings)
      const isExpert = String(booking.expertId) === String(user.id)
      if (isExpert) {
        return false
      }
      
      // Include if:
      // 1. learnerId matches user.id (normal case), OR
      // 2. clerkId matches userId (user made the booking, even if learnerId was set incorrectly), OR
      // 3. email matches user.email (additional fallback for data corruption)
      const isLearnerByLearnerId = String(booking.learnerId) === String(user.id)
      const isLearnerByClerkId = booking.clerkId === userId
      const isLearnerByEmail = booking.email === user.email
      
      return isLearnerByLearnerId || isLearnerByClerkId || isLearnerByEmail
    })

    // Log if we found corrupted bookings
    const corruptedBookings = allBookings.filter(
      booking => String(booking.learnerId) === String(booking.expertId)
    )
    return {
      success: true,
      bookings: validBookings
    }
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to fetch bookings'
    }
  }
}

export async function completePayment(bookingId, paymentData) {
  try {
    const { userId } = await auth()
    if (!userId) {
      throw new Error('User not authenticated')
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        session: true,
        learner: true,
        expertUser: true
      }
    })

    if (!booking) {
      throw new Error('Booking not found')
    }

    if (booking.status !== 'pending') {
      throw new Error('Booking is not in pending status')
    }

    let meetingLink = null
    let meetingId = null
    let meetingPassword = null

    if (booking.sessionPlatform === 'google-meet') {
      meetingLink = generateGoogleMeetLink()
    } else if (booking.sessionPlatform === 'zoom') {
      const startDateTime = new Date(`${booking.date.toISOString().split('T')[0]}T${booking.startTime}:00Z`)
      const endDateTime = new Date(`${booking.date.toISOString().split('T')[0]}T${booking.endTime}:00Z`)
      const duration = Math.round((endDateTime - startDateTime) / (1000 * 60))
      
      const bookingData = {
        name: booking.fullName,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        additionalInfo: `Session: ${booking.session.eventName}`
      }
      const event = {
        title: booking.session.eventName
      }
      const zoomMeeting = await createZoomMeeting(bookingData, event)
      meetingLink = zoomMeeting.meetLink
      meetingId = zoomMeeting.meetingId
      meetingPassword = zoomMeeting.password
    } else {
      throw new Error(`Unsupported meeting platform: ${booking.sessionPlatform}`)
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: 'confirmed',
        paymentId: paymentData.paymentId || null,
        orderId: paymentData.orderId || null,
        meetingLink: meetingLink
      },
      include: {
        session: true,
        learner: true,
        expertUser: true
      }
    })

    try {
      const startDateTime = new Date(`${booking.date.toISOString().split('T')[0]}T${booking.startTime}:00Z`)
      const endDateTime = new Date(`${booking.date.toISOString().split('T')[0]}T${booking.endTime}:00Z`)
      
      const eventData = {
        title: `${booking.session.eventName} with ${booking.expert}`,
        description: `One-on-one session with ${booking.expert}\n\nMeeting Link: ${meetingLink}`,
        startDateTime: startDateTime.toISOString(),
        endDateTime: endDateTime.toISOString(),
        attendees: [
          { email: booking.email, displayName: booking.fullName },
          { email: booking.expertUser.email, displayName: booking.expert }
        ],
        conferenceData: booking.sessionPlatform === 'google-meet' ? {
          createRequest: {
            requestId: Math.random().toString(36).substring(2, 15),
            conferenceSolutionKey: { type: 'hangoutsMeet' }
          }
        } : undefined
      }

      const expertHasCalendar = await isGoogleCalendarConnected(booking.expertUser.clerkId)
      
      if (expertHasCalendar) {
        // Create calendar event for expert
        const expertCalendarResult = await createCalendarEvent(booking.expertUser.clerkId, eventData)
        if (expertCalendarResult) {
        } else {
        }
      }

      // Check if learner has Google Calendar connected
      const learnerHasCalendar = await isGoogleCalendarConnected(booking.learner.clerkId)
      
      if (learnerHasCalendar) {
        // Create calendar event for learner
        const learnerCalendarResult = await createCalendarEvent(booking.learner.clerkId, eventData)
        if (learnerCalendarResult) {
        } else {
        }
      }

    } catch (error) {
    }

    return {
      success: true,
      booking: {
        id: updatedBooking.id,
        status: updatedBooking.status,
        meetingLink: meetingLink,
        meetingId: meetingId,
        meetingPassword: meetingPassword
      }
    }

  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to complete payment'
    }
  }
}

export async function updateBookingStatus(bookingId, status) {
  try {
    const { userId } = await auth()
    if (!userId) {
      throw new Error('User not authenticated')
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { 
        session: true,
        learner: true, 
        expertUser: true 
      }
    })

    if (!booking) {
      throw new Error('Booking not found')
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (booking.learnerId !== user.id && booking.expertId !== user.id) {
      throw new Error('Unauthorized to update this booking')
    }

    // Update booking status
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: status },
      include: {
        session: true,
        learner: true,
        expertUser: true
      }
    })

    // If cancelling, handle calendar removal and send cancellation email
    if (status === 'cancelled') {
      const cancelledByName = user.firstName && user.lastName 
        ? `${user.firstName} ${user.lastName}` 
        : user.email

      // Remove from Google Calendar if connected
      try {
        if (booking.learner.googleCalendarConnected && booking.learner.googleCalendarTokens) {
          const tokens = JSON.parse(booking.learner.googleCalendarTokens)
          const calendar = await getGoogleCalendarClient(tokens.access_token)
          
          // Find and delete the calendar event
          const events = await calendar.events.list({
            calendarId: 'primary',
            timeMin: new Date(booking.date).toISOString(),
            timeMax: new Date(new Date(booking.date).getTime() + 24 * 60 * 60 * 1000).toISOString(),
            singleEvents: true,
            orderBy: 'startTime'
          })

          const eventToDelete = events.data.items?.find(event => 
            event.summary?.includes(booking.session.eventName) ||
            event.description?.includes(booking.meetingLink)
          )

          if (eventToDelete) {
            await calendar.events.delete({
              calendarId: 'primary',
              eventId: eventToDelete.id
            })
          }
        }
      } catch (calendarError) {
      }

      // Send cancellation email with ICS file
      try {
        const bookingDate = new Date(booking.date)
        const startTime = booking.startTime || '00:00'
        const endTime = booking.endTime || '01:00'
        
        const startDateTime = new Date(`${bookingDate.toISOString().split('T')[0]}T${startTime}`)
        const endDateTime = new Date(`${bookingDate.toISOString().split('T')[0]}T${endTime}`)
        
        if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
          throw new Error('Invalid date format for cancellation email')
        }
        
        const eventData = {
          title: `CANCELLED: ${booking.session.eventName}`,
          description: `This meeting has been cancelled by ${cancelledByName}.`,
          startDateTime: startDateTime,
          endDateTime: endDateTime,
          location: booking.meetingLink || 'Online Meeting'
        }

        await sendCancellationEmail(booking.learner.email, eventData, cancelledByName)
      } catch (emailError) {
      }
    }

    return {
      success: true,
      booking: updatedBooking
    }
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to update booking status'
    }
  }
}
