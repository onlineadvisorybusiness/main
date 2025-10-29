import { useState, useEffect, useCallback, useRef } from 'react'
import { useUser } from '@clerk/nextjs'
import { useSocket } from './useSocket'

export const useChat = () => {
  const { user } = useUser()
  const { socket, isConnected, joinConversation, leaveConversation, sendMessage, startTyping, stopTyping } = useSocket()
  
  const [conversations, setConversations] = useState([])
  const [currentConversation, setCurrentConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [typingUsers, setTypingUsers] = useState(new Set())
  const [onlineUsers, setOnlineUsers] = useState(new Set())
  
  const typingTimeoutRef = useRef(null)
  const messagesEndRef = useRef(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  useEffect(() => {
    if (!socket) return

    const handleNewMessage = (data) => {
      const { message, conversationId } = data
      
      if (currentConversation?.id === conversationId) {
        setMessages(prev => [...prev, message])
      }
      
      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversationId 
            ? {
                ...conv,
                lastMessage: message.content,
                lastMessageAt: message.createdAt,
                unreadCount: message.senderId !== user?.id ? conv.unreadCount + 1 : conv.unreadCount
              }
            : conv
        )
      )
    }

    const handleUserTyping = (data) => {
      const { userId, conversationId, isTyping } = data
      
      if (currentConversation?.id === conversationId) {
        setTypingUsers(prev => {
          const newSet = new Set(prev)
          if (isTyping) {
            newSet.add(userId)
          } else {
            newSet.delete(userId)
          }
          return newSet
        })
      }
    }

    const handleContactStatusChange = (data) => {
      const { userId, isOnline } = data
      setOnlineUsers(prev => {
        const newSet = new Set(prev)
        if (isOnline) {
          newSet.add(userId)
        } else {
          newSet.delete(userId)
        }
        return newSet
      })
    }

    const handleMessageNotification = (data) => {
      const { message, conversationId, senderId } = data
      
      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversationId 
            ? {
                ...conv,
                lastMessage: message.content,
                lastMessageAt: message.createdAt,
                unreadCount: conv.unreadCount + 1
              }
            : conv
        )
      )
      
      if (currentConversation?.id !== conversationId) {
        // You can add a toast notification here
      }
    }

    socket.on('new_message', handleNewMessage)
    socket.on('user_typing', handleUserTyping)
    socket.on('contact_status_change', handleContactStatusChange)
    socket.on('message_notification', handleMessageNotification)

    return () => {
      socket.off('new_message', handleNewMessage)
      socket.off('user_typing', handleUserTyping)
      socket.off('contact_status_change', handleContactStatusChange)
      socket.off('message_notification', handleMessageNotification)
    }
  }, [socket, currentConversation, user])

  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/conversations')
      const data = await response.json()
      
      if (data.success) {
        setConversations(data.conversations)
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError('Failed to fetch conversations')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchMessages = useCallback(async (conversationId, page = 1) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/conversations/${conversationId}/messages?page=${page}&limit=50`)
      const data = await response.json()
      
      if (data.success) {
        if (page === 1) {
          setMessages(data.messages)
        } else {
          setMessages(prev => [...data.messages, ...prev])
        }
        return data.pagination
      } else {
        setError(data.error)
        return null
      }
    } catch (err) {
      setError('Failed to fetch messages')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const createConversation = useCallback(async (otherUserId) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ otherUserId })
      })
      
      const data = await response.json()
      
      if (data.success) {
        return data.conversation
      } else {
        setError(data.error)
        return null
      }
    } catch (err) {
      setError('Failed to create conversation')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const sendChatMessage = useCallback(async (content, messageType = 'text', mediaUrl = null, audioDuration = null) => {
    if (!currentConversation || !content && !mediaUrl) return

    try {
      const tempMessage = {
        id: `temp-${Date.now()}`,
        content,
        messageType,
        mediaUrl,
        audioDuration,
        senderId: user.id,
        sender: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          username: user.username,
          avatar: user.imageUrl
        },
        createdAt: new Date(),
        isRead: false
      }

      setMessages(prev => [...prev, tempMessage])

      if (isConnected) {
        sendMessage({
          conversationId: currentConversation.id,
          content,
          messageType,
          mediaUrl,
          audioDuration
        })
      } else {
        const response = await fetch(`/api/conversations/${currentConversation.id}/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            content,
            messageType,
            mediaUrl,
            audioDuration
          })
        })

        const data = await response.json()
        
        if (data.success) {
          setMessages(prev => 
            prev.map(msg => 
              msg.id === tempMessage.id ? data.message : msg
            )
          )
        } else {
          setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id))
          setError(data.error)
        }
      }
    } catch (err) {
      setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id))
      setError('Failed to send message')
    }
  }, [currentConversation, user, isConnected, sendMessage])

  const handleTyping = useCallback((isTyping) => {
    if (!currentConversation) return

    if (isTyping) {
      startTyping(currentConversation.id)
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
      
      typingTimeoutRef.current = setTimeout(() => {
        stopTyping(currentConversation.id)
      }, 3000)
    } else {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
      stopTyping(currentConversation.id)
    }
  }, [currentConversation, startTyping, stopTyping])

  const selectConversation = useCallback(async (conversation) => {
    if (currentConversation) {
      leaveConversation(currentConversation.id)
    }

    setCurrentConversation(conversation)
    setMessages([])
    setTypingUsers(new Set())

    if (isConnected) {
      joinConversation(conversation.id)
    }

    await fetchMessages(conversation.id)

    setConversations(prev => 
      prev.map(conv => 
        conv.id === conversation.id 
          ? { ...conv, unreadCount: 0 }
          : conv
      )
    )
  }, [currentConversation, isConnected, joinConversation, leaveConversation, fetchMessages])

  const isUserOnline = useCallback((userId) => {
    return onlineUsers.has(userId)
  }, [onlineUsers])

  const getTypingUsers = useCallback(() => {
    if (!currentConversation) return []
    
    return Array.from(typingUsers).filter(userId => userId !== user?.id)
  }, [typingUsers, currentConversation, user])

  return {
    conversations,
    currentConversation,
    messages,
    loading,
    error,
    typingUsers: getTypingUsers(),
    isConnected,

    fetchConversations,
    fetchMessages,
    createConversation,
    sendMessage: sendChatMessage,
    selectConversation,
    handleTyping,
    isUserOnline,
    messagesEndRef
  }
}
