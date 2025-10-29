import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

// GET - Get all starred messages for the current user
export async function GET(request) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get('conversationId')

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Build where clause
    const whereClause = {
      userId: user.id
    }

    // Filter by conversation if specified
    if (conversationId) {
      whereClause.conversationId = conversationId
    }

    // Get starred messages
    const starredMessages = await prisma.starredMessage.findMany({
      where: whereClause,
      include: {
        message: {
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
            conversation: {
              select: {
                id: true,
                participant1: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    username: true,
                    avatar: true
                  }
                },
                participant2: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    username: true,
                    avatar: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Format the response
    const formattedMessages = starredMessages.map(starred => ({
      id: starred.id,
      starredAt: starred.createdAt,
      message: {
        id: starred.message.id,
        content: starred.message.content,
        messageType: starred.message.messageType,
        mediaUrl: starred.message.mediaUrl,
        createdAt: starred.message.createdAt,
        sender: starred.message.sender,
        conversationId: starred.message.conversationId,
        conversation: {
          id: starred.message.conversation.id,
          otherParticipant: starred.message.conversation.participant1.id === user.id 
            ? starred.message.conversation.participant2 
            : starred.message.conversation.participant1
        }
      }
    }))

    return NextResponse.json({
      success: true,
      starredMessages: formattedMessages
    })

  } catch (error) {
    console.error('Error fetching starred messages:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
