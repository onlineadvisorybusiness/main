import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function POST(request, { params }) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: conversationId } = await params
    const { userId: requestUserId } = await request.json()

    // Get the current user from database
    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Verify the user has access to this conversation
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

    // Mark all messages in this conversation as read for the current user
    await prisma.message.updateMany({
      where: {
        conversationId: conversationId,
        senderId: { not: user.id }, // Don't mark own messages as read
        isRead: false
      },
      data: {
        isRead: true,
        readAt: new Date()
      }
    })

    // Notify senders that their messages were read (via Socket.io)
    try {
      const { socketManager } = await import('@/lib/socket.js')
      await socketManager.notifyMessageRead(conversationId, user.id)
    } catch (error) {
      console.error('Error notifying message read:', error)
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Messages marked as read' 
    })

  } catch (error) {
    console.error('Error marking messages as read:', error)
    return NextResponse.json(
      { error: 'Failed to mark messages as read' },
      { status: 500 }
    )
  }
}
