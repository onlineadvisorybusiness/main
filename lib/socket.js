import { Server } from 'socket.io'
import { prisma } from './prisma.js'

class SocketManager {
  constructor() {
    this.io = null
    this.connectedUsers = new Map() 
  }

  initialize(server) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.NODE_ENV === 'production' 
          ? process.env.NEXT_PUBLIC_APP_URL 
          : "http://localhost:3000",
        methods: ["GET", "POST"]
      }
    })

    this.setupEventHandlers()
    return this.io
  }

  // Helper function to convert Clerk ID to database user ID
  async getDatabaseUserId(clerkId) {
    try {
      const user = await prisma.user.findUnique({
        where: { clerkId },
        select: { id: true }
      })
      return user?.id || null
    } catch (error) {
      return null
    }
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {

      // Handle user authentication and join
      socket.on('join', async (data) => {
        try {
          const { userId: clerkId, userType } = data
          
          if (!clerkId) {
            socket.emit('error', { message: 'User ID is required' })
            return
          }

          // Convert Clerk ID to database user ID
          const databaseUserId = await this.getDatabaseUserId(clerkId)
          if (!databaseUserId) {
            socket.emit('error', { message: 'User not found in database' })
            return
          }

          // Store user connection (using database ID for internal operations)
          this.connectedUsers.set(databaseUserId, socket.id)
          socket.userId = databaseUserId
          socket.clerkId = clerkId
          socket.userType = userType

          // Join user to their personal room (using database ID)
          socket.join(`user:${databaseUserId}`)

          // Update user presence
          await this.updateUserPresence(databaseUserId, true)

          // Notify user's contacts about online status
          await this.notifyContactsOnlineStatus(databaseUserId, true)

          socket.emit('joined', { success: true, userId: databaseUserId })

        } catch (error) {
          socket.emit('error', { message: 'Failed to join' })
        }
      })

      // Handle joining a conversation
      socket.on('join_conversation', async (data) => {
        try {
          const { conversationId, userId: clerkId } = data
          
          if (!conversationId || !clerkId) {
            socket.emit('error', { message: 'Conversation ID and User ID are required' })
            return
          }

          // Convert Clerk ID to database user ID
          const databaseUserId = await this.getDatabaseUserId(clerkId)
          if (!databaseUserId) {
            socket.emit('error', { message: 'User not found in database' })
            return
          }

          // Verify user has access to this conversation
          const hasAccess = await this.verifyConversationAccess(conversationId, databaseUserId)
          if (!hasAccess) {
            socket.emit('error', { message: 'Access denied to conversation' })
            return
          }

          socket.join(`conversation:${conversationId}`)
          socket.emit('joined_conversation', { conversationId })

        } catch (error) {
          socket.emit('error', { message: 'Failed to join conversation' })
        }
      })

      // Handle leaving a conversation
      socket.on('leave_conversation', async (data) => {
        try {
          const { conversationId } = data
          
          if (!conversationId) {
            return
          }

          socket.leave(`conversation:${conversationId}`)

        } catch (error) {
        }
      })

      // Handle sending messages
      socket.on('send_message', async (data) => {
        try {
          const { conversationId, content, messageType, mediaUrl, audioDuration } = data
          
          if (!socket.userId) {
            socket.emit('error', { message: 'User not authenticated' })
            return
          }

    // Validate message content (allow empty content for media messages)
    if ((!content || !content.trim()) && !mediaUrl) {
      socket.emit('error', { message: 'Message content or media is required' })
      return
    }

    // Determine default content based on message type
    let defaultContent = ''
    if (mediaUrl) {
      if (messageType === 'image') {
        defaultContent = 'Image'
      } else if (messageType === 'document') {
        defaultContent = 'Document'
      } else {
        defaultContent = 'File'
      }
    }

    // Save message to database
    const message = await this.saveMessage({
      conversationId,
      senderId: socket.userId,
      content: content ? content.trim() : defaultContent,
      messageType: messageType || 'text',
      mediaUrl,
      audioDuration
    })

          if (!message) {
            socket.emit('error', { message: 'Failed to save message' })
            return
          }

          // Update conversation last message
          await this.updateConversationLastMessage(conversationId, content, message.createdAt)

          // Emit message to all users in the conversation
          this.io.to(`conversation:${conversationId}`).emit('new_message', {
            message,
            conversationId
          })

          // Notify other participant if they're not in the conversation room
          const conversation = await this.getConversation(conversationId)
          const otherParticipantId = conversation.participant1Id === socket.userId 
            ? conversation.participant2Id 
            : conversation.participant1Id

          this.io.to(`user:${otherParticipantId}`).emit('message_notification', {
            message,
            conversationId,
            senderId: socket.userId
          })

        } catch (error) {
          socket.emit('error', { message: 'Failed to send message' })
        }
      })

      // Handle typing indicators
      socket.on('typing_start', async (data) => {
        try {
          const { conversationId, userId: clerkId } = data
          
          if (!conversationId || !clerkId) {
            return
          }

          // Convert Clerk ID to database user ID
          const databaseUserId = await this.getDatabaseUserId(clerkId)
          if (!databaseUserId) {
            return
          }

          // Update typing status in database
          await this.updateTypingStatus(databaseUserId, conversationId, true)

          // Notify other participants
          socket.to(`conversation:${conversationId}`).emit('typing_start', {
            userId: databaseUserId,
            conversationId
          })

        } catch (error) {
        }
      })

      socket.on('typing_stop', async (data) => {
        try {
          const { conversationId, userId: clerkId } = data
          
          if (!conversationId || !clerkId) {
            return
          }

          // Convert Clerk ID to database user ID
          const databaseUserId = await this.getDatabaseUserId(clerkId)
          if (!databaseUserId) {
            return
          }

          // Update typing status in database
          await this.updateTypingStatus(databaseUserId, conversationId, false)

          // Notify other participants
          socket.to(`conversation:${conversationId}`).emit('typing_stop', {
            userId: databaseUserId,
            conversationId
          })

        } catch (error) {
        }
      })

      // Handle message reactions
      socket.on('message_reaction', async (data) => {
        try {
          const { conversationId, messageId, emoji, userId, reactions } = data
          
          if (!conversationId || !messageId || !emoji || !userId) {
            return
          }

          // Broadcast reaction to other participants in the conversation
          socket.to(`conversation:${conversationId}`).emit('message_reaction', {
            conversationId,
            messageId,
            emoji,
            userId,
            reactions
          })
        } catch (error) {
        }
      })

      // Handle message read status
      socket.on('mark_message_read', async (data) => {
        try {
          const { messageId, userId: clerkId } = data
          
          if (!messageId || !clerkId) {
            return
          }

          // Convert Clerk ID to database user ID
          const databaseUserId = await this.getDatabaseUserId(clerkId)
          if (!databaseUserId) {
            return
          }

          await this.markMessageAsRead(messageId, databaseUserId)

        } catch (error) {
        }
      })

      // Handle disconnection
      socket.on('disconnect', async () => {
        try {
          if (socket.userId) {
            // Remove user from connected users
            this.connectedUsers.delete(socket.userId)
            
            // Update user presence
            await this.updateUserPresence(socket.userId, false)
            
            // Notify contacts about offline status
            await this.notifyContactsOnlineStatus(socket.userId, false)
          }
        } catch (error) {
        }
      })
    })
  }

  // Notify sender when messages are read
  async notifyMessageRead(conversationId, readerId) {
    try {
      // Get all unread messages in this conversation from other users
      const unreadMessages = await prisma.message.findMany({
        where: {
          conversationId,
          senderId: { not: readerId },
          isRead: false
        },
        include: {
          sender: {
            select: { id: true, clerkId: true }
          }
        }
      })

      // Notify each sender that their messages were read
      for (const message of unreadMessages) {
        const senderSocketId = this.connectedUsers.get(message.senderId)
        if (senderSocketId) {
          this.io.to(senderSocketId).emit('messages_read', {
            conversationId,
            messageIds: unreadMessages.map(m => m.id),
            readBy: readerId,
            readAt: new Date()
          })
        }
      }
    } catch (error) {
    }
  }

  // Database helper methods
  async saveMessage(messageData) {
    try {
      const message = await prisma.message.create({
        data: {
          conversationId: messageData.conversationId,
          senderId: messageData.senderId,
          content: messageData.content,
          messageType: messageData.messageType,
          mediaUrl: messageData.mediaUrl,
          audioDuration: messageData.audioDuration
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

      return message
    } catch (error) {
      return null
    }
  }

  async updateConversationLastMessage(conversationId, content, timestamp) {
    try {
      await prisma.conversation.update({
        where: { id: conversationId },
        data: {
          lastMessage: content,
          lastMessageAt: timestamp
        }
      })
    } catch (error) {
    }
  }

  async getConversation(conversationId) {
    try {
      return await prisma.conversation.findUnique({
        where: { id: conversationId }
      })
    } catch (error) {
      return null
    }
  }

  async verifyConversationAccess(conversationId, userId) {
    try {
      const conversation = await prisma.conversation.findFirst({
        where: {
          id: conversationId,
          OR: [
            { participant1Id: userId },
            { participant2Id: userId }
          ]
        }
      })
      return !!conversation
    } catch (error) {
      return false
    }
  }

  async updateUserPresence(userId, isOnline) {
    try {
      await prisma.userPresence.upsert({
        where: { userId },
        update: {
          isOnline,
          lastSeenAt: new Date()
        },
        create: {
          userId,
          isOnline,
          lastSeenAt: new Date()
        }
      })
    } catch (error) {
    }
  }

  async updateTypingStatus(userId, conversationId, isTyping) {
    try {
      await prisma.userPresence.update({
        where: { userId },
        data: {
          typingIn: isTyping ? conversationId : null
        }
      })
    } catch (error) {
    }
  }

  async markMessageAsRead(messageId, userId) {
    try {
      await prisma.message.update({
        where: { id: messageId },
        data: {
          isRead: true,
          readAt: new Date()
        }
      })
    } catch (error) {
    }
  }

  async notifyContactsOnlineStatus(userId, isOnline) {
    try {
      // Get all conversations for this user
      const conversations = await prisma.conversation.findMany({
        where: {
          OR: [
            { participant1Id: userId },
            { participant2Id: userId }
          ]
        }
      })

      // Notify each conversation participant
      for (const conversation of conversations) {
        const otherParticipantId = conversation.participant1Id === userId 
          ? conversation.participant2Id 
          : conversation.participant1Id

        const otherUserSocket = this.connectedUsers.get(otherParticipantId)
        if (otherUserSocket) {
          this.io.to(otherUserSocket).emit('contact_status_change', {
            userId,
            isOnline,
            conversationId: conversation.id
          })
        }
      }
    } catch (error) {
    }
  }

  // Public methods for external use
  getIO() {
    return this.io
  }

  isUserOnline(userId) {
    return this.connectedUsers.has(userId)
  }

  getUserSocket(userId) {
    return this.connectedUsers.get(userId)
  }
}

// Export singleton instance
export const socketManager = new SocketManager()
export default socketManager
