import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { disconnectGoogleCalendar } from '@/lib/google-calendar'

export async function POST() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Disconnect Google Calendar from Clerk metadata
    await disconnectGoogleCalendar(userId)

    // Update database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        googleCalendarTokens: null,
        googleCalendarConnected: false
      }
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Google Calendar disconnected successfully' 
    })

  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to disconnect Google Calendar' 
    }, { status: 500 })
  }
}
