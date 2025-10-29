import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function GET(request, { params }) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: conversationId, messageId } = params

    if (!conversationId || !messageId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }

    // Get current user from database
    const currentUser = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Verify user has access to this conversation
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        OR: [
          { participant1Id: currentUser.id },
          { participant2Id: currentUser.id }
        ]
      }
    })

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found or access denied' }, { status: 404 })
    }

    // Verify the parent message exists
    const parentMessage = await prisma.message.findFirst({
      where: {
        id: messageId,
        conversationId: conversationId
      }
    })

    if (!parentMessage) {
      return NextResponse.json({ error: 'Parent message not found' }, { status: 404 })
    }

    // Get all replies to this message
    const replies = await prisma.message.findMany({
      where: {
        parentMessageId: messageId,
        isDeleted: false
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
        },
        reactions: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                username: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    return NextResponse.json({
      success: true,
      replies: replies,
      count: replies.length
    })

  } catch (error) {
    console.error('Error fetching thread replies:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
