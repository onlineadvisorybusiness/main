import { createClerkClient } from '@clerk/nextjs/server'
import { google } from 'googleapis'


export async function getGoogleCalendarTokens(userId) {
  try {
    const clerkClient = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY
    })
    const user = await clerkClient.users.getUser(userId)
    const tokens = user.privateMetadata?.googleCalendarTokens
    
    if (!tokens) {
      throw new Error('No Google Calendar tokens found')
    }

    return tokens
  } catch (error) {
    throw new Error('Failed to retrieve Google Calendar tokens')
  }
}

// Check if user has Google Calendar connected
export async function isGoogleCalendarConnected(userId) {
  try {
    const clerkClient = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY
    })
    const user = await clerkClient.users.getUser(userId)
    return user.publicMetadata?.googleCalendarConnected === true
  } catch (error) {
    return false
  }
}

// Get Google Calendar client with user's tokens
export async function getGoogleCalendarClient(userId) {
  try {
    const tokens = await getGoogleCalendarTokens(userId)
    
    // Initialize OAuth2 client with proper credentials
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000'
    )
    oauth2Client.setCredentials(tokens)
    
    return google.calendar({ version: 'v3', auth: oauth2Client })
  } catch (error) {
    throw new Error('Failed to create Google Calendar client')
  }
}

export async function refreshGoogleCalendarTokens(userId) {
  try {
    const tokens = await getGoogleCalendarTokens(userId)
    
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000'
    )
    oauth2Client.setCredentials(tokens)
    
    if (tokens.expiry_date && Date.now() >= tokens.expiry_date) {
      const { credentials } = await oauth2Client.refreshAccessToken()
      
      const newTokenData = {
        access_token: credentials.access_token,
        refresh_token: credentials.refresh_token || tokens.refresh_token,
        scope: credentials.scope,
        token_type: credentials.token_type,
        expiry_date: credentials.expiry_date,
        connected_at: tokens.connected_at
      }

      const clerkClient = createClerkClient({
        secretKey: process.env.CLERK_SECRET_KEY
      })
      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: {
          googleCalendarTokens: newTokenData
        }
      })

      return newTokenData
    }

    return tokens
  } catch (error) {
    throw new Error('Failed to refresh Google Calendar tokens')
  }
}

export async function createCalendarEvent(userId, eventData) {
  try {
    const calendar = await getGoogleCalendarClient(userId)
    
    const startDateTime = new Date(eventData.startDateTime)
    const endDateTime = new Date(eventData.endDateTime)
    
    const event = {
      summary: eventData.title,
      description: eventData.description || '',
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: 'Asia/Kolkata',
      },
      end: {
        dateTime: endDateTime.toISOString(),
        timeZone: 'Asia/Kolkata',
      },
    }

    if (eventData.attendees && eventData.attendees.length > 0) {
      event.attendees = eventData.attendees
    }

    event.reminders = {
      useDefault: false,
      overrides: [
        { method: 'email', minutes: 24 * 60 },
        { method: 'popup', minutes: 10 },
      ],
    }

    if (eventData.conferenceData) {
      event.conferenceData = eventData.conferenceData
    }

    const response = calendar.events.insert({
      calendarId: 'primary',
      resource: event,
      ...(event.conferenceData && { conferenceDataVersion: 1 })
    })

    return response.data
  } catch (error) {
    return null
  }
}
  
export async function disconnectGoogleCalendar(userId) {
  try {
    const clerkClient = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY
    })
    await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: {
        googleCalendarConnected: false,
        googleCalendarDisconnectedAt: new Date().toISOString()
      },
      privateMetadata: {
        googleCalendarTokens: null
      }
    })

    return { success: true }
  } catch (error) {
    throw new Error('Failed to disconnect Google Calendar')
  }
}
