import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getLearnerBookings } from '@/actions/booking'

export async function GET() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const result = await getLearnerBookings(userId)
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        meetings: result.bookings
      })
    } else {
      return NextResponse.json({ 
        error: result.error || 'Failed to fetch meetings' 
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Error fetching learner meetings:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
