import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

// POST - Star/Unstar a message
export async function POST(request, { params }) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: conversationId, messageId } = params
    const body = await request.json()
    const { action } = body // 'star' or 'unstar'

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Verify user is part of the conversation
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        OR: [
          { participant1Id: user.id },
          { participant2Id: user.id }
        ]
      }
    })

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    // Get the message
    const message = await prisma.message.findFirst({
      where: {
        id: messageId,
        conversationId: conversationId
      }
    })

    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 })
    }

    if (action === 'star') {
      // Check if already starred
      const existingStar = await prisma.starredMessage.findUnique({
        where: {
          messageId_userId: {
            messageId: messageId,
            userId: user.id
          }
        }
      })

      if (existingStar) {
        return NextResponse.json({
          success: true,
          action: 'already_starred',
          isStarred: true
        })
      }

      // Star the message
      await prisma.starredMessage.create({
        data: {
          messageId: messageId,
          userId: user.id,
          conversationId: conversationId
        }
      })

      return NextResponse.json({
        success: true,
        action: 'starred',
        isStarred: true
      })
    } else if (action === 'unstar') {
      // Unstar the message
      await prisma.starredMessage.deleteMany({
        where: {
          messageId: messageId,
          userId: user.id
        }
      })

      return NextResponse.json({
        success: true,
        action: 'unstarred',
        isStarred: false
      })
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

  } catch (error) {
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

// GET - Check if message is starred by user
export async function GET(request, { params }) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { messageId } = params

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if message is starred
    const starredMessage = await prisma.starredMessage.findUnique({
      where: {
        messageId_userId: {
          messageId: messageId,
          userId: user.id
        }
      }
    })

    return NextResponse.json({
      success: true,
      isStarred: !!starredMessage
    })

  } catch (error) {
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
