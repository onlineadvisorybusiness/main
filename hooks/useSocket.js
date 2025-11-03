import { useEffect, useRef, useState, useCallback } from 'react'
import { useUser } from '@clerk/nextjs'

export const useSocket = () => {
  const { user } = useUser()
  const [socket, setSocket] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [connectionError, setConnectionError] = useState(null)
  const [currentUser, setCurrentUser] = useState(null)
  const reconnectTimeoutRef = useRef(null)
  const reconnectAttempts = useRef(0)
  const maxReconnectAttempts = 5
  const socketRef = useRef(null)

  // Define attemptReconnect as a useCallback to avoid circular dependency
  const attemptReconnect = useCallback(() => {
    if (reconnectAttempts.current >= maxReconnectAttempts) {
      setConnectionError('Unable to connect to server. Please refresh the page.')
      return
    }

    reconnectAttempts.current += 1
    const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000) // Exponential backoff, max 30s
    
    reconnectTimeoutRef.current = setTimeout(() => {
      if (socketRef.current) {
        socketRef.current.connect()
      }
    }, delay)
  }, [maxReconnectAttempts])

  useEffect(() => {
    if (!user) return

    let cleanup = null

    const initializeSocket = async () => {
      try {
        // Dynamic import for socket.io-client to handle ES modules
        const { io } = await import('socket.io-client')

        const socketUrl = process.env.NODE_ENV === 'production' 
          ? process.env.NEXT_PUBLIC_SOCKET_URL || 'wss://your-domain.com'
          : 'http://localhost:3000'

        const newSocket = io(socketUrl, {
          transports: ['websocket', 'polling'],
          timeout: 20000,
          forceNew: true
        })

        // Store socket in ref for reconnection
        socketRef.current = newSocket

        newSocket.on('connect', () => {
          setIsConnected(true)
          setConnectionError(null)
          reconnectAttempts.current = 0

          // Join user to their personal room
          newSocket.emit('join', {
            userId: user.id,
            userType: user.publicMetadata?.accountStatus || 'learner'
          })
        })

        newSocket.on('disconnect', (reason) => {
          setIsConnected(false)
          
          if (reason === 'io server disconnect') {
            // Server disconnected, try to reconnect
            attemptReconnect()
          }
        })

        newSocket.on('connect_error', (error) => {
          setConnectionError(error.message)
          setIsConnected(false)
          attemptReconnect()
        })

        newSocket.on('error', (error) => {
          setConnectionError(error.message)
        })

        setSocket(newSocket)

        cleanup = () => {
          if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current)
          }
          newSocket.close()
          socketRef.current = null
        }
      } catch (error) {
        setConnectionError(error.message)
      }
    }

    initializeSocket()

    return () => {
      if (cleanup) {
        cleanup()
      }
    }
  }, [user, attemptReconnect])

  const joinConversation = useCallback((conversationId) => {
    if (socket && isConnected) {
      socket.emit('join_conversation', {
        conversationId: String(conversationId), // Ensure it's a string
        userId: user?.id
      })
    } else {
    }
  }, [socket, isConnected, user?.id])

  const leaveConversation = useCallback((conversationId) => {
    if (socket && isConnected) {
      socket.emit('leave_conversation', { conversationId })
    }
  }, [socket, isConnected])

  const sendMessage = useCallback((messageData) => {
    if (socket && isConnected) {
      socket.emit('send_message', messageData)
    }
  }, [socket, isConnected])

  const startTyping = useCallback((conversationId) => {
    if (socket && isConnected) {
      socket.emit('typing_start', {
        conversationId,
        userId: user?.id
      })
    }
  }, [socket, isConnected, user?.id])

  const stopTyping = useCallback((conversationId) => {
    if (socket && isConnected) {
      socket.emit('typing_stop', {
        conversationId,
        userId: user?.id
      })
    }
  }, [socket, isConnected, user?.id])

  const markMessageAsRead = useCallback((messageId) => {
    if (socket && isConnected) {
      socket.emit('mark_message_read', {
        messageId,
        userId: user?.id
      })
    }
  }, [socket, isConnected, user?.id])

  return {
    socket,
    isConnected,
    connectionError,
    joinConversation,
    leaveConversation,
    sendMessage,
    startTyping,
    stopTyping,
    markMessageAsRead
  }
}