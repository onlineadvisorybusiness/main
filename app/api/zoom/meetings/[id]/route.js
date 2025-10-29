import { NextResponse } from 'next/server'
import { getZoomMeeting, updateZoomMeeting, deleteZoomMeeting } from '../../../../../lib/zoom'

export async function GET(request, { params }) {
  try {
    const { id } = params
    const meeting = await getZoomMeeting(id)
    return NextResponse.json(meeting)
  } catch (error) {
    console.error('Error fetching Zoom meeting:', error)
    return NextResponse.json(
      { error: 'Failed to fetch meeting' },
      { status: 500 }
    )
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params
    const updateData = await request.json()
    const meeting = await updateZoomMeeting(id, updateData)
    
    return NextResponse.json({
      success: true,
      meeting
    })
  } catch (error) {
    console.error('Error updating Zoom meeting:', error)
    return NextResponse.json(
      { error: 'Failed to update meeting' },
      { status: 500 }
    )
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params
    await deleteZoomMeeting(id)
    
    return NextResponse.json({
      success: true,
      message: 'Meeting deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting Zoom meeting:', error)
    return NextResponse.json(
      { error: 'Failed to delete meeting' },
      { status: 500 }
    )
  }
}
