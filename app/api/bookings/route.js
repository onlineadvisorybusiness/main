import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { createBooking, getUserBookings, getExpertBookings, updateBookingStatus, completePayment } from '@/actions/booking'

export async function POST(request) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      sessionId, 
      date, 
      startTime, 
      endTime, 
      duration, 
      expertUsername 
    } = body

    // Use the new booking action
    const result = await createBooking({
      sessionId,
      date,
      startTime,
      endTime,
      duration,
      expertUsername
    })

    if (!result.success) {
      return NextResponse.json({ 
        error: result.error,
        details: result.details 
      }, { status: 400 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Booking created successfully',
      booking: result.booking
    })

  } catch (error) { 
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

// GET - Fetch user's bookings
export async function GET(request) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'learner' // 'learner' or 'expert'

    let result
    if (type === 'expert') {
      result = await getExpertBookings(userId)
    } else {
      result = await getUserBookings(userId)
    }

    if (!result.success) {
      return NextResponse.json({ 
        error: result.error 
      }, { status: 400 })
    }

    return NextResponse.json({ 
      success: true, 
      bookings: result.bookings 
    })

  } catch (error) {
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

export async function PUT(request) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { bookingId, status, paymentData, action } = body

    if (!bookingId) {
      return NextResponse.json({ 
        error: 'Missing bookingId' 
      }, { status: 400 })
    }

    let result

    if (action === 'complete_payment') {
      if (!paymentData) {
        return NextResponse.json({ 
          error: 'Missing payment data' 
        }, { status: 400 })
      }

      result = await completePayment(bookingId, paymentData)
    } else {
      if (!status) {
        return NextResponse.json({ 
          error: 'Missing status' 
        }, { status: 400 })
      }

      result = await updateBookingStatus(bookingId, status)
    }

    if (!result.success) {
      return NextResponse.json({ 
        error: result.error 
      }, { status: 400 })
    }

    return NextResponse.json({ 
      success: true, 
      message: action === 'complete_payment' ? 'Payment completed successfully' : 'Booking status updated successfully',
      booking: result.booking 
    })

  } catch (error) {
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
