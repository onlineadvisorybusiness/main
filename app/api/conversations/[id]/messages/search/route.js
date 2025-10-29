import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function GET(request, { params }) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const type = searchParams.get('type') || 'all'
    const sender = searchParams.get('sender') || 'all'
    const dateRange = searchParams.get('dateRange') || 'all'
    const { id: conversationId } = params

    if (!query || !conversationId) {
      return NextResponse.json({ error: 'Missing search query or conversation ID' }, { status: 400 })
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

    // Build search filters
    const searchFilters = {
      conversationId: conversationId,
      isDeleted: false
    }

    // Content search (case-insensitive)
    if (query.trim()) {
      searchFilters.content = {
        contains: query.trim(),
        mode: 'insensitive'
      }
    }

    // Message type filter
    if (type !== 'all') {
      searchFilters.messageType = type
    }

    // Sender filter
    if (sender === 'me') {
      searchFilters.senderId = currentUser.id
    } else if (sender === 'them') {
      searchFilters.senderId = {
        not: currentUser.id
      }
    }

    // Date range filter
    if (dateRange !== 'all') {
      const now = new Date()
      let startDate

      switch (dateRange) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
          break
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1)
          break
      }

      if (startDate) {
        searchFilters.createdAt = {
          gte: startDate
        }
      }
    }

    // Execute search
    const messages = await prisma.message.findMany({
      where: searchFilters,
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
      orderBy: {
        createdAt: 'desc'
      },
      take: 50 // Limit results to prevent performance issues
    })

    return NextResponse.json({
      success: true,
      messages: messages,
      count: messages.length
    })

  } catch (error) {
    console.error('Error searching messages:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
