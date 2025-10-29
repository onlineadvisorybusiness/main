import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(request, { params }) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const resolvedParams = await params
    const conversationId = resolvedParams.id
    
    if (!conversationId) {
      return NextResponse.json({ error: 'Conversation ID is required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

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

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 50
    const skip = (page - 1) * limit

    const messages = await prisma.message.findMany({
      where: {
        conversationId: conversationId,
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
        },
        replyToMessage: { 
          include: {
            sender: {
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
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    })

    const totalMessages = await prisma.message.count({
      where: {
        conversationId: conversationId,
        isDeleted: false
      }
    })

    await prisma.message.updateMany({
      where: {
        conversationId: conversationId,
        senderId: { not: user.id },
        isRead: false
      },
      data: {
        isRead: true,
        readAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      messages: messages.reverse(),
      pagination: {
        page,
        limit,
        total: totalMessages,
        totalPages: Math.ceil(totalMessages / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

// POST - Send a new message
export async function POST(request, { params }) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const resolvedParams = await params
    const conversationId = resolvedParams.id
    
    if (!conversationId) {
      return NextResponse.json({ error: 'Conversation ID is required' }, { status: 400 })
    }

    const body = await request.json()
    const { content, messageType, mediaUrl, audioDuration, parentMessageId, replyToMessageId } = body

    if (!content && !mediaUrl) {
      return NextResponse.json({ 
        error: 'Message content or media is required' 
      }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

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

    // Get the other participant
    const otherParticipantId = conversation.participant1Id === user.id 
      ? conversation.participant2Id 
      : conversation.participant1Id

    // Check if there's any booking between these users (any status)
    const hasBooking = await prisma.booking.findFirst({
      where: {
        OR: [
          {
            learnerId: user.id,
            expertId: otherParticipantId
          },
          {
            learnerId: otherParticipantId,
            expertId: user.id
          }
        ]
      }
    })

    if (!hasBooking) {
      return NextResponse.json({ 
        error: 'You can only send messages after booking at least one meeting with this expert.' 
      }, { status: 403 })
    }

    const message = await prisma.message.create({
      data: {
        conversationId: conversationId,
        senderId: user.id,
        content,
        messageType: messageType || 'text',
        mediaUrl,
        audioDuration,
        parentMessageId: parentMessageId || null,
        replyToMessageId: replyToMessageId || null
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
        replyToMessage: {
          include: {
            sender: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                username: true
              }
            }
          }
        }
      }
    })

    // If this is a thread reply, update the parent message's thread count
    if (parentMessageId) {
      await prisma.message.update({
        where: { id: parentMessageId },
        data: {
          threadCount: {
            increment: 1
          }
        }
      })
    }

    await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        lastMessage: content,
        lastMessageAt: message.createdAt
      }
    })

    return NextResponse.json({
      success: true,
      message
    })

  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
