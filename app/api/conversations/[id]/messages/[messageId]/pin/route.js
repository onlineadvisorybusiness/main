import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

// POST - Pin/Unpin a message
export async function POST(request, { params }) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: conversationId, messageId } = params
    const body = await request.json()
    const { action } = body // 'pin' or 'unpin'

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

    if (action === 'pin') {
      // Pin the message
      const updatedMessage = await prisma.message.update({
        where: { id: messageId },
        data: {
          isPinned: true,
          pinnedAt: new Date(),
          pinnedBy: user.id
        },
        include: {
          sender: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              username: true,
              avatar: true
            }
          }
        }
      })

      return NextResponse.json({
        success: true,
        message: updatedMessage,
        action: 'pinned'
      })
    } else if (action === 'unpin') {
      // Unpin the message
      const updatedMessage = await prisma.message.update({
        where: { id: messageId },
        data: {
          isPinned: false,
          pinnedAt: null,
          pinnedBy: null
        },
        include: {
          sender: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              username: true,
              avatar: true
            }
          }
        }
      })

      return NextResponse.json({
        success: true,
        message: updatedMessage,
        action: 'unpinned'
      })
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

  } catch (error) {
    console.error('Error pinning/unpinning message:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

// GET - Get pinned messages for a conversation
export async function GET(request, { params }) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: conversationId } = params

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

    // Get pinned messages
    const pinnedMessages = await prisma.message.findMany({
      where: {
        conversationId: conversationId,
        isPinned: true
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            avatar: true
          }
        }
      },
      orderBy: { pinnedAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      pinnedMessages
    })

  } catch (error) {
    console.error('Error fetching pinned messages:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
