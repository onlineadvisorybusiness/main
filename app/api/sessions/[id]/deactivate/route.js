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

    // First, find the current user in the database
    const currentUser = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (!currentUser) {
      return NextResponse.json({ 
        error: 'User not found' 
      }, { status: 404 })
    }


    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: { expert: true }
    })

    if (!session) {
      return NextResponse.json({ 
        error: 'Session not found' 
      }, { status: 404 })
    }
          
    if (session.expertId.toString() !== currentUser.id.toString()) {
      return NextResponse.json({ 
        error: 'Unauthorized - You can only deactivate your own sessions' 
      }, { status: 403 })
    }

    const updatedSession = await prisma.session.update({
      where: { id: sessionId },
      data: { 
        status: 'inactive',
        updatedAt: new Date()
      }
    })


    return NextResponse.json({ 
      success: true, 
      session: updatedSession,
      message: 'Session deactivated successfully'
    })

  } catch (error) { 
    return NextResponse.json({ 
      error: 'Failed to deactivate session',
      details: error.message 
    }, { status: 500 })
  }
}
