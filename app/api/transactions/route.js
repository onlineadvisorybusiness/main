import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

// GET - Fetch user's transaction history
export async function GET(request) {
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

    // Get URL parameters for filtering
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const category = searchParams.get('category')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const limit = parseInt(searchParams.get('limit')) || 50
    const offset = parseInt(searchParams.get('offset')) || 0

    // Build where clause for filtering
    const whereClause = {
      OR: [
        { learnerId: user.id },
        { expertId: user.id }
      ]
    }

    // Add status filter
    if (status && status !== 'all') {
      whereClause.status = status
    }

    // Add date range filter
    if (startDate || endDate) {
      whereClause.date = {}
      if (startDate) {
        whereClause.date.gte = new Date(startDate)
      }
      if (endDate) {
        whereClause.date.lte = new Date(endDate)
      }
    }

    // Fetch bookings with related data
    const bookings = await prisma.booking.findMany({
      where: whereClause,
      select: {
        id: true,
        startTime: true,
        endTime: true,
        amount: true,
        currency: true,
        paymentId: true,
        orderId: true,
        status: true,
        createdAt: true,
        learnerId: true,
        expertId: true,
        sessionId: true,
        sessionPlatform: true,
        meetingLink: true,
        date: true,
        session: {
          select: {
            eventName: true,
            categories: true,
            type: true,
            platform: true
          }
        },
        learner: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            avatar: true
          }
        },
        expertUser: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            avatar: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    })

    // Transform bookings to transaction format
    const transactions = bookings.map((booking, index) => {
      const isLearner = booking.learnerId === user.id
      const expert = booking.expertUser
      const learner = booking.learner
      
      // Get the first category from the categories array, or use a default
      const primaryCategory = booking.session.categories && booking.session.categories.length > 0 
        ? booking.session.categories[0] 
        : 'General'
      
      // Calculate duration from start and end times
      const calculateDuration = (startTime, endTime) => {
        try {
              // Handle different time formats
          let start, end
          
          if (typeof startTime === 'string' && typeof endTime === 'string') {
            // If times are in HH:MM format
            if (startTime.includes(':') && endTime.includes(':')) {
              start = new Date(`2000-01-01T${startTime}:00`)
              end = new Date(`2000-01-01T${endTime}:00`)
            } else {
              // If times are in HHMM format
              const startHour = startTime.substring(0, 2)
              const startMin = startTime.substring(2, 4)
              const endHour = endTime.substring(0, 2)
              const endMin = endTime.substring(2, 4)
              start = new Date(`2000-01-01T${startHour}:${startMin}:00`)
              end = new Date(`2000-01-01T${endHour}:${endMin}:00`)
            }
          } else {
            // If times are Date objects
            start = new Date(startTime)
            end = new Date(endTime)
          }
          
          const diffMs = end.getTime() - start.getTime()
          const diffMinutes = Math.round(diffMs / (1000 * 60))
          return diffMinutes
        } catch (error) {
          console.error('Error calculating duration:', error, { startTime, endTime })
          return 60 // Default to 60 minutes if calculation fails
        }
      }
      
      const duration = calculateDuration(booking.startTime, booking.endTime)
      
      // Determine the best platform value
      const platformValue = booking.sessionPlatform || booking.session?.platform || 'N/A'
      
      // Calculate fees and taxes (you can adjust these rates)
      const serviceFeeRate = 0.03 // 3% service fee
      const taxRate = 0.08 // 8% tax rate
      
      const serviceFee = booking.amount * serviceFeeRate
      const tax = booking.amount * taxRate
      const netAmount = booking.amount - serviceFee - tax

      return {
        id: booking.id,
        serialId: offset + index + 1,
        // Always show expert information regardless of user role
        expertName: `${expert.firstName} ${expert.lastName}`,
        expertEmail: expert.email,
        learnerName: `${learner.firstName} ${learner.lastName}`,
        learnerEmail: learner.email,
        paymentId: booking.paymentId || null,
        orderId: booking.orderId || null,
        amount: isLearner ? booking.amount : -booking.amount, 
        currency: booking.currency,
        paymentDate: booking.createdAt,
        status: booking.status, 
        paymentStatus: booking.status, 
        sessionTitle: booking.session.eventName, 
        sessionType: booking.session.eventName,
        duration: duration, 
        category: primaryCategory, 
        categories: booking.session.categories || [], 
        sessionTypeDetail: booking.session.type, 
        platform: platformValue,
        tax: isLearner ? tax : -tax,
        serviceFee: isLearner ? serviceFee : -serviceFee, 
        netAmount: isLearner ? netAmount : -netAmount, 
        invoiceNumber: booking.status === 'success' ? `INV-${booking.id.slice(-8).toUpperCase()}` : null, 
        meetingLink: booking.meetingLink, 
        date: booking.date, 
        startTime: booking.startTime, 
        endTime: booking.endTime, 
        isLearner: isLearner 
      }
    })

    // Get summary statistics based on payment status
    const totalSpent = bookings
      .filter(b => b.learnerId === user.id && b.status === 'success' && b.amount > 0)
      .reduce((sum, b) => sum + b.amount, 0)

    const totalEarned = bookings
      .filter(b => b.expertId === user.id && b.status === 'success' && b.amount > 0)
      .reduce((sum, b) => sum + b.amount, 0)

    const pendingAmount = bookings
      .filter(b => b.status === 'pending')
      .reduce((sum, b) => sum + (b.learnerId === user.id ? b.amount : 0), 0)

    const refundedAmount = bookings
      .filter(b => b.status === 'failed')
      .reduce((sum, b) => sum + (b.learnerId === user.id ? b.amount : 0), 0)

    const totalTransactions = bookings.length

    return NextResponse.json({
      success: true,
      transactions,
      summary: {
        totalSpent,
        totalEarned,
        pendingAmount,
        refundedAmount,
        totalTransactions
      },
      pagination: {
        limit,
        offset,
        total: bookings.length
      }
    })

  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 })
  }
}

// POST - Create a new transaction (for refunds, adjustments, etc.)
export async function POST(request) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { bookingId, type, amount, reason, description } = body

    if (!bookingId || !type || !amount) {
      return NextResponse.json({ 
        error: 'Missing required fields: bookingId, type, amount' 
      }, { status: 400 })
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Find the original booking
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        session: true,
        learner: true,
        expertUser: true
      }
    })

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Verify user has permission to create transaction for this booking
    if (booking.learnerId !== user.id && booking.expertId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Create adjustment transaction
    const adjustmentBooking = await prisma.booking.create({
      data: {
        clerkId: userId,
        fullName: booking.fullName,
        email: booking.email,
        date: booking.date,
        startTime: booking.startTime,
        endTime: booking.endTime,
        sessionPlatform: booking.sessionPlatform,
        expert: booking.expert,
        currency: booking.currency,
        amount: type === 'refund' ? -Math.abs(amount) : Math.abs(amount),
        paymentId: `ADJ_${Date.now()}`,
        orderId: `ADJ_${bookingId.slice(-8)}_${Date.now()}`,
        accountType: user.accountStatus,
        status: type === 'refund' ? 'refunded' : 'completed',
        learnerId: booking.learnerId,
        expertId: booking.expertId,
        sessionId: booking.sessionId,
        meetingLink: null // No meeting link for adjustments
      }
    })

    return NextResponse.json({
      success: true,
      transaction: adjustmentBooking,
      message: `${type} transaction created successfully`
    })

  } catch (error) {
    console.error('Error creating transaction:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error.message 
    }, { status: 500 })
  }
}
