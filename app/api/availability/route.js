import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: {
        id: true,
        accountStatus: true,
        timezone: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (user.accountStatus !== 'expert') {
      return NextResponse.json({ error: 'Only experts can manage availability' }, { status: 403 })
    }

    const availabilities = await prisma.availability.findMany({
      where: { expertId: user.id },
      orderBy: [
        { dayOfWeek: 'asc' },
        { startTime: 'asc' }
      ]
    })

    // Log for debugging
    console.log('🔍 [DEBUG] API GET - User timezone:', user.timezone)

    return NextResponse.json({ 
      success: true, 
      availabilities,
      expert: {
        timezone: user.timezone || 'UTC'
      }
    })

  } catch (error) {
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (user.accountStatus !== 'expert') {
      return NextResponse.json({ error: 'Only experts can manage availability' }, { status: 403 })
    }

    const body = await request.json()
    const { availabilities } = body

    if (!availabilities || !Array.isArray(availabilities)) {
      return NextResponse.json({ 
        error: 'Invalid availability data' 
      }, { status: 400 })
    }

    for (const availability of availabilities) {
      if (typeof availability.dayOfWeek !== 'number' || 
          availability.dayOfWeek < 0 || 
          availability.dayOfWeek > 6) {
        return NextResponse.json({ 
          error: 'Invalid day of week' 
        }, { status: 400 })
      }

      if (!availability.startTime || !availability.endTime) {
        return NextResponse.json({ 
          error: 'Start time and end time are required' 
        }, { status: 400 })
      }

      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
      if (!timeRegex.test(availability.startTime) || !timeRegex.test(availability.endTime)) {
        return NextResponse.json({ 
          error: 'Invalid time format. Use HH:MM format' 
        }, { status: 400 })
      }

      if (availability.startTime >= availability.endTime) {
        return NextResponse.json({ 
          error: 'End time must be after start time' 
        }, { status: 400 })
      }
    }

    await prisma.availability.deleteMany({
      where: { expertId: user.id }
    })

    const availabilityData = availabilities.map(availability => ({
      expertId: user.id,
      sessionId: availability.sessionId || null,
      dayOfWeek: availability.dayOfWeek,
      startTime: availability.startTime,
      endTime: availability.endTime,
      isActive: availability.isActive !== false,
      timezone: availability.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone
    }))

    const createdAvailabilities = await prisma.availability.createMany({
      data: availabilityData
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Availability schedule updated successfully',
      count: createdAvailabilities.count
    })

  } catch (error) {
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

export async function DELETE() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (user.accountStatus !== 'expert') {
      return NextResponse.json({ error: 'Only experts can manage availability' }, { status: 403 })
    }

    await prisma.availability.deleteMany({
      where: { expertId: user.id }
    })

    return NextResponse.json({ 
      success: true, 
      message: 'All availability cleared successfully'
    })

  } catch (error) {
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
