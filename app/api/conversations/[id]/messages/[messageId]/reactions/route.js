import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function POST(request, { params }) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { emoji } = await request.json()
    const { id: conversationId, messageId } = params

    if (!emoji || !messageId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get current user from database
    const currentUser = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Verify the message exists and belongs to the conversation
    const message = await prisma.message.findFirst({
      where: {
        id: messageId,
        conversationId: conversationId
      }
    })

    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 })
    }

    // Check if user already reacted with this emoji
    const existingReaction = await prisma.messageReaction.findFirst({
      where: {
        messageId: messageId,
        userId: currentUser.id,
        emoji: emoji
      }
    })

    if (existingReaction) {
      // Remove the reaction if it already exists
      await prisma.messageReaction.delete({
        where: { id: existingReaction.id }
      })
    } else {
      // Add the reaction
      await prisma.messageReaction.create({
        data: {
          messageId: messageId,
          userId: currentUser.id,
          emoji: emoji
        }
      })
    }

    // Get all reactions for this message grouped by emoji
    const reactions = await prisma.messageReaction.findMany({
      where: { messageId: messageId },
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
    })

    // Group reactions by emoji
    const groupedReactions = reactions.reduce((acc, reaction) => {
      if (!acc[reaction.emoji]) {
        acc[reaction.emoji] = []
      }
      acc[reaction.emoji].push(reaction.userId)
      return acc
    }, {})

    return NextResponse.json({
      success: true,
      reactions: groupedReactions
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request, { params }) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { messageId } = params

    const reactions = await prisma.messageReaction.findMany({
      where: { messageId: messageId },
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
    })

    const groupedReactions = reactions.reduce((acc, reaction) => {
      if (!acc[reaction.emoji]) {
        acc[reaction.emoji] = []
      }
      acc[reaction.emoji].push(reaction.userId)
      return acc
    }, {})

    return NextResponse.json({
      success: true,
      reactions: groupedReactions
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
