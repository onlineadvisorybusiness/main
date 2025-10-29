import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(request, { params }) {
  try {
    const resolvedParams = await params
    const username = resolvedParams.username

    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 })
    }

    const expert = await prisma.user.findUnique({
      where: { 
        username: username,
        accountStatus: 'expert'
      },
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true
      }
    })

    if (!expert) {
      return NextResponse.json({ error: 'Expert not found' }, { status: 404 })
    }

    const availabilities = await prisma.availability.findMany({
      where: { 
        expertId: expert.id,
        isActive: true
      },
      orderBy: [
        { dayOfWeek: 'asc' },
        { startTime: 'asc' }
      ]
    })

    const existingBookings = await prisma.booking.findMany({
      where: {
        expertId: expert.id,
        status: { in: ['pending', 'confirmed'] }
      },
      select: {
        date: true,
        startTime: true,
        endTime: true
      }
    })

    const groupedAvailabilities = {}
    availabilities.forEach(availability => {
      if (!groupedAvailabilities[availability.dayOfWeek]) {
        groupedAvailabilities[availability.dayOfWeek] = []
      }
      groupedAvailabilities[availability.dayOfWeek].push(availability)
    })

    const bookingsByDate = {}
    existingBookings.forEach(booking => {
      let bookingDateStr
      if (booking.date instanceof Date) {
        const year = booking.date.getFullYear()
        const month = String(booking.date.getMonth() + 1).padStart(2, '0')
        const day = String(booking.date.getDate()).padStart(2, '0')
        bookingDateStr = `${year}-${month}-${day}`
      } else {
        bookingDateStr = booking.date
      }
      
      if (!bookingsByDate[bookingDateStr]) {
        bookingsByDate[bookingDateStr] = []
      }
      bookingsByDate[bookingDateStr].push({
        startTime: booking.startTime,
        endTime: booking.endTime,
        date: bookingDateStr
      })
    })
    
    return NextResponse.json({ 
      success: true, 
      expert: {
        id: expert.id,
        username: expert.username,
        name: `${expert.firstName || ''} ${expert.lastName || ''}`.trim() || expert.username
      },
      availabilities: groupedAvailabilities,
      existingBookings: bookingsByDate
    })

  } catch (error) {
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
