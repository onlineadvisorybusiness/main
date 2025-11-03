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
    const messageId = resolvedParams.id
    
    if (!messageId) {
      return NextResponse.json({ error: 'Message ID is required' }, { status: 400 })
    }

    const body = await request.json()
    const { action, content } = body

    if (!action) {
      return NextResponse.json({ 
        error: 'Action is required (edit, delete_for_me, delete_for_everyone)' 
      }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const message = await prisma.message.findFirst({
      where: {
        id: messageId,
        senderId: user.id
      },
      include: {
        conversation: true
      }
    })

    if (!message) {
      return NextResponse.json({ error: 'Message not found or access denied' }, { status: 404 })
    }

    let updatedMessage

    switch (action) {
      case 'edit':
        if (!content) {
          return NextResponse.json({ 
            error: 'Content is required for editing' 
          }, { status: 400 })
        }

        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
        if (message.createdAt < oneHourAgo || message.isRead) {
          return NextResponse.json({ 
            error: 'Message cannot be edited (too old or already read)' 
          }, { status: 400 })
        }

        updatedMessage = await prisma.message.update({
          where: { id: messageId },
          data: {
            content,
            isEdited: true,
            editedAt: new Date()
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
        break

      case 'delete_for_me':
        updatedMessage = await prisma.message.update({
          where: { id: messageId },
          data: {
            isDeleted: true,
            deletedAt: new Date()
          }
        })
        break

      case 'delete_for_everyone':
        const oneHourAgoDelete = new Date(Date.now() - 60 * 60 * 1000)
        if (message.createdAt < oneHourAgoDelete || message.isRead) {
          return NextResponse.json({ 
            error: 'Message cannot be deleted (too old or already read)' 
          }, { status: 400 })
        }

        updatedMessage = await prisma.message.update({
          where: { id: messageId },
          data: {
            isDeleted: true,
            deletedAt: new Date()
          }
        })
        break

      default:
        return NextResponse.json({ 
          error: 'Invalid action' 
        }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: updatedMessage
    })

  } catch (error) {
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const resolvedParams = await params
    const messageId = resolvedParams.id
    
    if (!messageId) {
      return NextResponse.json({ error: 'Message ID is required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const message = await prisma.message.findFirst({
      where: {
        id: messageId,
        senderId: user.id
      }
    })

    if (!message) {
      return NextResponse.json({ error: 'Message not found or access denied' }, { status: 404 })
    }

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    if (message.createdAt < oneHourAgo) {
      return NextResponse.json({ 
        error: 'Message cannot be deleted (too old)' 
      }, { status: 400 })
    }

    await prisma.message.delete({
      where: { id: messageId }
    })

    return NextResponse.json({
      success: true,
      message: 'Message deleted successfully'
    })

  } catch (error) {
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
