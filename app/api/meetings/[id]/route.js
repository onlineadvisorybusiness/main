import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { updateBookingStatus } from '@/actions/booking'

export async function PATCH(request, { params }) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const resolvedParams = await params
    const meetingId = resolvedParams.id
    
    if (!meetingId) {
      return NextResponse.json({ error: 'Meeting ID is required' }, { status: 400 })
    }

    const body = await request.json()
    const { status } = body

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 })
    }

    const result = await updateBookingStatus(meetingId, status)
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        meeting: result.booking
      })
    } else {
      return NextResponse.json({ 
        error: result.error || 'Failed to update meeting status' 
      }, { status: 500 })
    }
  } catch (error) {
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
