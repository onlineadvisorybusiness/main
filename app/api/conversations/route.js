import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

// GET - Get user's conversations
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

    // Get conversations where user is a participant AND has completed bookings
    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [
          { participant1Id: user.id },
          { participant2Id: user.id }
        ]
      },
      include: {
        participant1: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            avatar: true,
            accountStatus: true
          }
        },
        participant2: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            avatar: true,
            accountStatus: true
          }
        },
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
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
        }
      },
      orderBy: { lastMessageAt: 'desc' }
    })

    // Format conversations with unread count and other participant info
    // Filter conversations to only include those with completed bookings
    const formattedConversations = await Promise.all(
      conversations.map(async (conversation) => {
        const otherParticipant = conversation.participant1Id === user.id 
          ? conversation.participant2 
          : conversation.participant1

        // Check if there's any booking between these users
        // Allow chats for: pending (scheduled), confirmed (scheduled), completed
        // Exclude: cancelled
        const hasBooking = await prisma.booking.findFirst({
          where: {
            AND: [
              {
                OR: [
                  {
                    learnerId: user.id,
                    expertId: otherParticipant.id
                  },
                  {
                    learnerId: otherParticipant.id,
                    expertId: user.id
                  }
                ]
              },
              {
                status: {
                  in: ['pending', 'confirmed', 'scheduled', 'completed']
                }
              }
            ]
          },
          select: {
            id: true,
            status: true
          }
        })

        // Only include conversation if there's a valid booking (not cancelled)
        if (!hasBooking) {
          return null
        }

        // Get unread message count
        const unreadCount = await prisma.message.count({
          where: {
            conversationId: conversation.id,
            senderId: { not: user.id },
            isRead: false
          }
        })

        return {
          id: conversation.id,
          otherParticipant,
          lastMessage: conversation.lastMessage,
          lastMessageAt: conversation.lastMessageAt,
          unreadCount,
          isActive: conversation.isActive,
          createdAt: conversation.createdAt
        }
      })
    )

    const validConversations = formattedConversations.filter(conv => conv !== null)

    return NextResponse.json({
      success: true,
      conversations: validConversations
    })

  } catch (error) {
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

// POST - Create or get existing conversation
export async function POST(request) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { otherUserId } = body

    if (!otherUserId) {
      return NextResponse.json({ 
        error: 'Other user ID is required' 
      }, { status: 400 })
    }

    // Get current user from database
    const currentUser = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const otherUser = await prisma.user.findUnique({
      where: { id: otherUserId }
    })

    if (!otherUser) {
      return NextResponse.json({ error: 'Other user not found' }, { status: 404 })
    }

    const allBookingsBetweenUsers = await prisma.booking.findMany({
      where: {
        AND: [
          {
            OR: [
              {
                AND: [
                  { learnerId: currentUser.id },
                  { expertId: otherUserId }
                ]
              },
              {
                AND: [
                  { learnerId: otherUserId },
                  { expertId: currentUser.id }
                ]
              }
            ]
          },
          {
            status: {
              in: ['pending', 'confirmed', 'scheduled', 'completed']
            }
          }
        ]
      },
      select: {
        id: true,
        status: true,
        learnerId: true,
        expertId: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    // Filter out corrupted bookings (where learnerId === expertId)
    // Also ensure the booking actually involves both users correctly
    const validBookings = allBookingsBetweenUsers.filter(booking => {
      // Reject if it's a self-booking (corrupted data)
      if (String(booking.learnerId) === String(booking.expertId)) {
        return false
      }
      
      // Ensure the booking actually involves both the current user and other user
      const involvesBothUsers = 
        (String(booking.learnerId) === String(currentUser.id) && String(booking.expertId) === String(otherUserId)) ||
        (String(booking.learnerId) === String(otherUserId) && String(booking.expertId) === String(currentUser.id))
      
      return involvesBothUsers
    })
    
    const hasBooking = validBookings.length > 0 ? validBookings[0] : null

    if (!hasBooking) {
      return NextResponse.json({ 
        error: 'You can only chat with experts after booking at least one meeting with them.'
      }, { status: 403 })
    } 
    
    // Check if conversation already exists
    let conversation = await prisma.conversation.findFirst({
      where: {
        OR: [
          {
            participant1Id: currentUser.id,
            participant2Id: otherUserId
          },
          {
            participant1Id: otherUserId,
            participant2Id: currentUser.id
          }
        ]
      },
      include: {
        participant1: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            avatar: true,
            accountStatus: true
          }
        },
        participant2: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            avatar: true,
            accountStatus: true
          }
        }
      }
    })

    // If conversation doesn't exist, create it
    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          participant1Id: currentUser.id,
          participant2Id: otherUserId
        },
        include: {
          participant1: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              username: true,
              avatar: true,
              accountStatus: true
            }
          },
          participant2: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              username: true,
              avatar: true,
              accountStatus: true
            }
          }
        }
      })
    }

    return NextResponse.json({
      success: true,
      conversation
    })

  } catch (error) {
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
