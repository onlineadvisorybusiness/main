import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function PATCH(request, { params }) {
  try {

    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const resolvedParams = await params
    const sessionId = resolvedParams.id

    const currentUser = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (!currentUser) {
      return NextResponse.json({ 
        error: 'User not found' 
      }, { status: 404 })
    }

    const session = await prisma.session.findUnique({
      where: { id: sessionId }
    })

    if (!session) {
      return NextResponse.json({ 
        error: 'Session not found' 
      }, { status: 404 })
    }

    if (session.expertId.toString() !== currentUser.id.toString()) {
      return NextResponse.json({ 
        error: 'Unauthorized - You can only edit your own sessions' 
      }, { status: 403 })
    }

    const body = await request.json()
    const {
      eventName,
      type,
      platform,
      category,
      categories,
      prices,
      currency,
      advicePoints,
      timezone
    } = body

    if (!eventName || !type || !platform || (!categories && !category) || !prices || !currency) {
      return NextResponse.json({ 
        error: 'All fields are required' 
      }, { status: 400 }) 
    }

    // Validate that at least one price is set
    const hasValidPrice = Object.values(prices).some(price => price && price.trim() !== '' && !isNaN(parseFloat(price)))
    if (!hasValidPrice) {
      return NextResponse.json({ 
        error: 'At least one price must be set' 
      }, { status: 400 })
    }

    // Validate price values
    for (const [duration, price] of Object.entries(prices)) {
      if (price && price.trim() !== '') {
        const priceNumber = parseFloat(price)
        if (isNaN(priceNumber) || priceNumber <= 0) {
          return NextResponse.json({ 
            error: `Invalid price for ${duration} minutes. Must be a positive number.` 
          }, { status: 400 })
        }
      }
    }

    // Update session and set status to draft (needs reactivation)
    const updatedSession = await prisma.session.update({
      where: { id: sessionId },
      data: {
        eventName: eventName.trim(),
        type,
        platform,
        categories: categories || [category].filter(Boolean), // Use categories array or fallback to single category
        prices: prices,
        currency,
        advicePoints: advicePoints.map(point => point.trim()),
        timezone: timezone || currentUser.timezone || 'UTC',
        status: 'draft', // Set to draft after editing
        updatedAt: new Date()
      }
    })


    return NextResponse.json({ 
      success: true, 
      session: updatedSession,
      message: 'Session updated successfully. Please reactivate to make it live.'
    })

  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to update session',
      details: error.message 
    }, { status: 500 })
  }
}
