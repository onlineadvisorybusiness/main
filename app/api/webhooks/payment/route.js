import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { google } from 'googleapis'
import { z } from 'zod'
import { createCalendarEvent, isGoogleCalendarConnected } from '@/lib/google-calendar'

const prisma = new PrismaClient()

// Payment webhook validation schema
const paymentWebhookSchema = z.object({
  bookingId: z.string().min(1, 'Booking ID is required'),
  paymentId: z.string().min(1, 'Payment ID is required'),
  orderId: z.string().min(1, 'Order ID is required'),
  status: z.enum(['completed', 'failed', 'cancelled']),
  amount: z.number().positive('Amount must be positive'),
  currency: z.string().min(1, 'Currency is required'),
})

// Google Calendar API setup
const getGoogleCalendarClient = async (accessToken) => {
  const oauth2Client = new google.auth.OAuth2()
  oauth2Client.setCredentials({ access_token: accessToken })
  
  return google.calendar({ version: 'v3', auth: oauth2Client })
}

// Generate Google Meet link
const generateGoogleMeetLink = () => {
  const meetingId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  return `https://meet.google.com/${meetingId}`
}

// Create Zoom meeting
const createZoomMeeting = async (meetingData) => {
  try {
    const response = await fetch('https://api.zoom.us/v2/users/me/meetings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.ZOOM_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        topic: meetingData.title,
        type: 2, // Scheduled meeting
        start_time: meetingData.startTime,
        duration: meetingData.duration,
        timezone: 'UTC',
        settings: {
          host_video: true,
          participant_video: true,
          join_before_host: false,
          mute_upon_entry: true,
          waiting_room: true,
        }
      })
    })

    if (!response.ok) {
      throw new Error(`Zoom API error: ${response.statusText}`)
    }

    const data = await response.json()
    return {
      meetingId: data.id,
      meetingUrl: data.join_url,
      password: data.password
    }
  } catch (error) {
    console.error('Error creating Zoom meeting:', error)
    throw new Error('Failed to create Zoom meeting')
  }
}

// Add event to Google Calendar
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
          { method: 'email', minutes: 24 * 60 }, // 1 day before
          { method: 'popup', minutes: 10 }, // 10 minutes before
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
    console.error('Error adding to Google Calendar:', error)
    throw new Error('Failed to add event to Google Calendar')
  }
}

// Main payment webhook handler
export async function POST(request) {
  try {
    const body = await request.json()
    
    // Validate webhook data
    const validatedData = paymentWebhookSchema.parse(body)
    
    // Find the booking
    const booking = await prisma.booking.findUnique({
      where: { id: validatedData.bookingId },
      include: {
        session: true,
        learner: true,
        expertUser: true
      }
    })

    if (!booking) {
      console.error('Booking not found:', validatedData.bookingId)
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Only process completed payments
    if (validatedData.status !== 'completed') {
      // Update booking status to failed/cancelled
      await prisma.booking.update({
        where: { id: validatedData.bookingId },
        data: { 
          status: validatedData.status === 'failed' ? 'cancelled' : 'cancelled',
          paymentId: validatedData.paymentId,
          orderId: validatedData.orderId
        }
      })
      
      return NextResponse.json({ 
        success: true, 
        message: `Payment ${validatedData.status}, booking updated` 
      })
    }

    // Verify payment amount matches booking amount
    if (validatedData.amount !== booking.amount || validatedData.currency !== booking.currency) {
      console.error('Payment amount mismatch:', {
        expected: { amount: booking.amount, currency: booking.currency },
        received: { amount: validatedData.amount, currency: validatedData.currency }
      })
      return NextResponse.json({ error: 'Payment amount mismatch' }, { status: 400 })
    }

    // Generate meeting link based on platform
    let meetingLink = null
    let meetingId = null
    let meetingPassword = null

    if (booking.sessionPlatform === 'google-meet') {
      meetingLink = generateGoogleMeetLink()
    } else if (booking.sessionPlatform === 'zoom') {
      const startDateTime = new Date(`${booking.date.toISOString().split('T')[0]}T${booking.startTime}:00Z`)
      const endDateTime = new Date(`${booking.date.toISOString().split('T')[0]}T${booking.endTime}:00Z`)
      const duration = Math.round((endDateTime - startDateTime) / (1000 * 60)) // duration in minutes
      
      const zoomMeeting = await createZoomMeeting({
        title: `${booking.session.eventName} - ${booking.fullName}`,
        startTime: startDateTime.toISOString(),
        duration: duration
      })
      meetingLink = zoomMeeting.meetingUrl
      meetingId = zoomMeeting.meetingId
      meetingPassword = zoomMeeting.password
    }

    // Update booking with payment details and meeting link
    const updatedBooking = await prisma.booking.update({
      where: { id: validatedData.bookingId },
      data: {
        status: 'confirmed',
        paymentId: validatedData.paymentId,
        orderId: validatedData.orderId,
        meetingLink: meetingLink
      },
      include: {
        session: true,
        learner: true,
        expertUser: true
      }
    })

    // Add to Google Calendar for both users
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

      // Check if expert has Google Calendar connected
      const expertHasCalendar = await isGoogleCalendarConnected(booking.expertUser.clerkId)
      
      if (expertHasCalendar) {
        // Create calendar event for expert
        await createCalendarEvent(booking.expertUser.clerkId, eventData)
        console.log('Calendar event created for expert:', booking.expertUser.email)
      }

      // Check if learner has Google Calendar connected
      const learnerHasCalendar = await isGoogleCalendarConnected(booking.learner.clerkId)
      
      if (learnerHasCalendar) {
        // Create calendar event for learner
        await createCalendarEvent(booking.learner.clerkId, eventData)
        console.log('Calendar event created for learner:', booking.learner.email)
      }

      console.log('Google Calendar integration completed:', {
        expertConnected: expertHasCalendar,
        learnerConnected: learnerHasCalendar,
        meetingLink: meetingLink
      })

    } catch (error) {
      console.error('Google Calendar integration error:', error)
      // Don't fail the payment processing if calendar integration fails
    }

    // Send confirmation emails (you can implement this later)
    console.log('Payment completed successfully:', {
      bookingId: validatedData.bookingId,
      meetingLink: meetingLink,
      meetingId: meetingId,
      meetingPassword: meetingPassword
    })

    return NextResponse.json({
      success: true,
      message: 'Payment processed successfully',
      booking: {
        id: updatedBooking.id,
        status: updatedBooking.status,
        meetingLink: meetingLink,
        meetingId: meetingId,
        meetingPassword: meetingPassword
      }
    })

  } catch (error) {
    console.error('Payment webhook error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation error',
        details: error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
      }, { status: 400 })
    }

    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
