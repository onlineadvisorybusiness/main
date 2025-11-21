import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(request) {
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

    const presence = await prisma.userPresence.findUnique({
      where: { userId: user.id }
    })

    return NextResponse.json({
      success: true,
      presence: presence || {
        isOnline: false,
        lastSeenAt: new Date(),
        status: 'available',
        typingIn: null
      }
    })

  } catch (error) {
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

export async function PATCH(request) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { status } = body

    if (!status || !['available', 'busy', 'away', 'invisible'].includes(status)) {
      return NextResponse.json({ 
        error: 'Valid status is required (available, busy, away, invisible)' 
      }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const presence = await prisma.userPresence.upsert({
      where: { userId: user.id },
      update: {
        status,
        lastSeenAt: new Date()
      },
      create: {
        userId: user.id,
        isOnline: true,
        status,
        lastSeenAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      presence
    })

  } catch (error) {
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
