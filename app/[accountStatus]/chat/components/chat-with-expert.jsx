'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useUser } from '@clerk/nextjs'
import { useSocket } from '@/hooks/useSocket'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger } from '@/components/ui/context-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { Send, MessageSquare, Users, Clock, Filter, MoreVertical, Search, Info, Paperclip, Smile, Mic, Check, CheckCheck, Image, FileText, X, Download, Eye, Edit, Trash2, Play, Pause, Square, Star, Reply, Forward, Copy, Trash, Pin, PinOff } from 'lucide-react'
import NextImage from 'next/image'
import { showInAppNotification, InAppNotificationContainer } from '@/components/ui/in-app-notification'

export default function ChatWithExpert() {
  const { user } = useUser()
  const { socket, isConnected, connectionError, joinConversation, leaveConversation, sendMessage: socketSendMessage, startTyping, stopTyping, markMessageAsRead } = useSocket()
  const [selectedExpert, setSelectedExpert] = useState(null)
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([])
  const [experts, setExperts] = useState([])
  const [loading, setLoading] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [filter, setFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [attachments, setAttachments] = useState([])
  const [onlineUsers, setOnlineUsers] = useState(new Set())
  const [editingMessage, setEditingMessage] = useState(null)
  const [editText, setEditText] = useState('')
  const [deleteDialog, setDeleteDialog] = useState({ open: false, messageId: null, type: null })
  const [recordingTime, setRecordingTime] = useState(0)
  const [audioBlob, setAudioBlob] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playingMessageId, setPlayingMessageId] = useState(null)
  const [audioProgress, setAudioProgress] = useState(0)
  const [audioDuration, setAudioDuration] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [pausedTime, setPausedTime] = useState(0)
  const [messageDurations, setMessageDurations] = useState({})
  const [typingUsers, setTypingUsers] = useState(new Set())
  const [isUserTyping, setIsUserTyping] = useState(false)
  const [messageReactions, setMessageReactions] = useState({})
  const [showSearchModal, setShowSearchModal] = useState(false)
  const [searchResults, setSearchResults] = useState([])
  const [messageSearchQuery, setMessageSearchQuery] = useState('')
  const [searchFilters, setSearchFilters] = useState({
    type: 'all', // all, text, image, document, audio
    sender: 'all', // all, me, them
    dateRange: 'all' // all, today, week, month
  })
  const [isSearching, setIsSearching] = useState(false)
  // WhatsApp-style reply state
  const [replyingTo, setReplyingTo] = useState(null)
  // WhatsApp-style state
  const [hoveredMessage, setHoveredMessage] = useState(null)
  // Pinned and starred messages state
  const [pinnedMessages, setPinnedMessages] = useState([])
  const [starredMessages, setStarredMessages] = useState(new Set())
  const [showPinnedMessages, setShowPinnedMessages] = useState(false)
  const [showStarredMessages, setShowStarredMessages] = useState(false)
  // Message grouping state
  const [groupedMessages, setGroupedMessages] = useState({})
  // Client-side only state for test button
  const [isClient, setIsClient] = useState(false)
  const typingTimeoutRef = useRef(null)
  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)
  const imageInputRef = useRef(null)
  const mediaRecorderRef = useRef(null)
  const audioRef = useRef(null)
  const recordingIntervalRef = useRef(null)
  const notifiedMessagesRef = useRef(new Set()) // Track notified message IDs to prevent duplicates

  // Mark all messages as read when conversation is opened
  const markAllMessagesAsRead = useCallback(async () => {
    if (selectedExpert?.conversationId && currentUser) {
      try {
        const response = await fetch(`/api/conversations/${selectedExpert.conversationId}/messages/mark-read`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: currentUser.id  
          })
        })
        
        if (response.ok) {
          // Update local message state to show as read
          setMessages(prev => prev.map(msg => ({
            ...msg,
            seen: true,
            seenTime: new Date()
          })))
        } else {
        }
      } catch (error) {
      }
    }
  }, [selectedExpert?.conversationId, currentUser])

  // Fetch current user's profile to get database ID
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch('/api/users/get-profile')
        const data = await response.json()
        
        if (data.success) {
          setCurrentUser(data.user)
        } else {
        }
      } catch (error) {
      }
    }
    
    if (user) {
      fetchCurrentUser()
    }
  }, [user])

  // Set client-side flag to prevent hydration mismatch
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Request notification permission on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission().then(() => {
        })
      }
    }
  }, [])

  // Hybrid notification helper - shows in-app toast when tab is focused, browser notification when not
  const showHybridNotification = (title, body, icon = null, messageId = null) => {
    // Check if we've already notified for this message to prevent duplicates
    if (messageId && notifiedMessagesRef.current.has(messageId)) {  
      return
    }

    // Mark this message as notified
    if (messageId) {
      notifiedMessagesRef.current.add(messageId)
    }

    const isTabFocused = typeof document !== 'undefined' && document.hasFocus()
    
    if (isTabFocused) {
      // Tab is focused - show in-app toast notification
      showInAppNotification({
        title,
        description: body,
        avatar: icon,
        messageId
      })
    } else {
      // Tab is not focused - show browser/OS notification
      showBrowserNotification(title, body, icon)
    }
  }

  // Helper function to show browser notification
  const showBrowserNotification = (title, body, icon = null) => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return
    }

    if (Notification.permission === 'granted') {
      try {
        // Use unique tag for each notification so multiple can show
        const notificationId = `notification-${Date.now()}-${Math.random()}`
        
        const iconUrl = icon || '/logo.png'
        const notificationOptions = {
          body: body,
          icon: iconUrl,
          badge: '/logo.png',
          tag: notificationId, // Unique tag for each notification
          requireInteraction: false, // Set to true if you want user to click to dismiss
          silent: false, // Play sound
          dir: 'ltr',
          image: iconUrl, // Large image (supported in some browsers)
          timestamp: Date.now(),
          data: { 
            url: window.location.href,
            timestamp: Date.now()
          }
        }

        const notification = new Notification(title, notificationOptions)
        
        // Store reference to prevent garbage collection
        if (!window.activeNotifications || !(window.activeNotifications instanceof Map)) {
          window.activeNotifications = new Map()
        }
        // Store the notification object itself, not just the ID
        window.activeNotifications.set(notificationId, notification)

        setTimeout(() => {
          if (notification && notification.close) {
            notification.close()
          }
          if (window.activeNotifications) {
            window.activeNotifications.delete(notificationId)
          }
        }, 10000)

        notification.onclick = (event) => {
          event.preventDefault()
          if (notification && notification.close) {
            notification.close()
          }
          if (window.activeNotifications) {
            window.activeNotifications.delete(notificationId)
          }
          window.focus()
        }

        notification.onerror = (error) => {
          if (window.activeNotifications) {
            window.activeNotifications.delete(notificationId)
          }
        }

        notification.onclose = () => {
          if (window.activeNotifications) {
            window.activeNotifications.delete(notificationId)
          }
        }
      } catch (error) {
      }
    } else if (Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          // Retry showing the notification
          showBrowserNotification(title, body, icon)
        }
      })  
    }
  }

  useEffect(() => {
    const loadExperts = async () => {
      try {
        setLoading(true)
        
        await new Promise(resolve => setTimeout(resolve, 100))
        
        const conversationsResponse = await fetch('/api/conversations')
        
        if (!conversationsResponse.ok) {
          if (conversationsResponse.status === 401) {
            await new Promise(resolve => setTimeout(resolve, 500))
            const retryResponse = await fetch('/api/conversations')
            const retryData = await retryResponse.json()
            
            if (retryData.success) {
              const expertsFromConversations = retryData.conversations.map(conv => ({
                id: conv.otherParticipant.id,
                name: `${conv.otherParticipant.firstName || ''} ${conv.otherParticipant.lastName || ''}`.trim() || conv.otherParticipant.username,
                username: conv.otherParticipant.username,
                avatar: conv.otherParticipant.avatar || '/default-avatar.png',
                industry: conv.otherParticipant.accountStatus === 'expert' ? 'Expert' : 'Learner',
                lastMessage: conv.lastMessageAt ? new Date(conv.lastMessageAt).toLocaleString() : 'No messages',
                online: false, 
                unreadCount: conv.unreadCount,
                lastMessagePreview: conv.lastMessage || 'No messages yet',
                conversationId: conv.id
              }))
              
              setExperts(expertsFromConversations)
              return
            } else {
              setExperts([])
              return
            }
          }
          
          setExperts([])
          return
        }
        
        const conversationsData = await conversationsResponse.json()
        
        
        if (conversationsData.success) {
          const expertsFromConversations = conversationsData.conversations.map(conv => ({
            id: conv.otherParticipant.id,
            name: `${conv.otherParticipant.firstName || ''} ${conv.otherParticipant.lastName || ''}`.trim() || conv.otherParticipant.username,
            username: conv.otherParticipant.username,
            avatar: conv.otherParticipant.avatar || '/default-avatar.png',
            industry: conv.otherParticipant.accountStatus === 'expert' ? 'Expert' : 'Learner',
            lastMessage: conv.lastMessageAt ? new Date(conv.lastMessageAt).toLocaleString() : 'No messages',
            online: false, 
            unreadCount: conv.unreadCount,
            lastMessagePreview: conv.lastMessage || 'No messages yet',
            conversationId: conv.id
          }))
          
          if (expertsFromConversations.length === 0) {
            try {
              const expertsResponse = await fetch('/api/experts')
              const expertsData = await expertsResponse.json()
              
              if (expertsData.success) {
                const availableExperts = expertsData.experts.map(expert => ({
                  id: expert.id,
                  name: expert.name,
                  username: expert.username,
                  avatar: expert.avatar || '/default-avatar.png',
                  industry: 'Expert',
                  lastMessage: 'No messages',
          online: false,
          unreadCount: 0,
                  lastMessagePreview: 'Start a conversation',
                  conversationId: null 
                }))
                
                setExperts(availableExperts)
              } else {
                setExperts([])
              }
            } catch (error) {
              setExperts([])
            }
          } else {
            setExperts(expertsFromConversations)
          }
        } else {
          setExperts([])
        }
      } catch (error) {
        setExperts([])
      } finally {
      setLoading(false)
      }
    }
    
    if (user) {
      loadExperts()
    }
  }, [user])

  useEffect(() => {
    const loadMessages = async () => {
      if (selectedExpert && selectedExpert.conversationId) {
        try {
          const response = await fetch(`/api/conversations/${selectedExpert.conversationId}/messages`)
          const data = await response.json()
          
          if (data.success) {
            const formattedMessages = data.messages.map(msg => ({
              id: msg.id,
              senderId: msg.senderId,
              senderName: `${msg.sender.firstName || ''} ${msg.sender.lastName || ''}`.trim() || msg.sender.username,
              content: msg.content,
              timestamp: new Date(msg.createdAt),
              isExpert: String(msg.senderId) === String(currentUser?.id), // If sender is current user (learner), message goes on right
              seen: msg.isRead,
              seenTime: msg.readAt ? new Date(msg.readAt) : null,
              type: msg.messageType,
              mediaUrl: msg.mediaUrl,
              audioDuration: msg.audioDuration,
              replyTo: msg.replyToMessage ? {
                id: msg.replyToMessage.id,
                content: msg.replyToMessage.content,
                senderName: `${msg.replyToMessage.sender.firstName || ''} ${msg.replyToMessage.sender.lastName || ''}`.trim() || msg.replyToMessage.sender.username
              } : null
            }))
            
            setMessages(formattedMessages)

            // Process reactions data
            if (data.messages.length > 0) {
              const reactionsData = {}
              data.messages.forEach(msg => {
                if (msg.reactions && msg.reactions.length > 0) {
                  const groupedReactions = msg.reactions.reduce((acc, reaction) => {
                    if (!acc[reaction.emoji]) {
                      acc[reaction.emoji] = []
                    }
                    acc[reaction.emoji].push(reaction.userId)
                    return acc
                  }, {})
                  reactionsData[msg.id] = groupedReactions
                }
              })
              setMessageReactions(reactionsData)
            }
            
            // Mark all messages as read when conversation is opened (with a small delay to ensure messages are rendered)
            setTimeout(() => {
              markAllMessagesAsRead()
            }, 100)

            // Group messages by date
            const grouped = groupMessagesByDate(formattedMessages)
            setGroupedMessages(grouped)
          } else {
            setMessages([])
            setGroupedMessages({})
          }
        } catch (error) {
          setMessages([])
          setGroupedMessages({})
        }
      } else {
        setMessages([])
        setGroupedMessages({})
      }
    }
    
    loadMessages()
  }, [selectedExpert, currentUser])

  // Load pinned messages when conversation is selected
  useEffect(() => {
    const loadPinnedMessages = async () => {
      if (selectedExpert?.conversationId) {
        try {
          const response = await fetch(`/api/conversations/${selectedExpert.conversationId}/messages/pinned`)
          
          if (!response.ok) {
            return
          }
          
          const data = await response.json()
          
          if (data.success) {
            setPinnedMessages(data.pinnedMessages)
          }
        } catch (error) {
        }
      }
    }

    loadPinnedMessages()
  }, [selectedExpert?.conversationId])

  // Load starred messages when conversation is selected
  useEffect(() => {
    const loadStarredMessages = async () => {
      if (selectedExpert?.conversationId) {
        try {
          const response = await fetch(`/api/users/starred-messages?conversationId=${selectedExpert.conversationId}`)
          const data = await response.json()
          
          if (data.success) {
            const starredIds = new Set(data.starredMessages.map(starred => starred.message.id))
            setStarredMessages(starredIds)
          }
        } catch (error) {
        }
      }
    }

    loadStarredMessages()
  }, [selectedExpert?.conversationId])

  // Socket.io real-time messaging
  useEffect(() => {
    if (!socket || !isConnected) {
      return
    }

    const handleNewMessage = (data) => {
      const normalizedConversationId = String(data.conversationId)
      const normalizedSelectedConversationId = String(selectedExpert?.conversationId || '')

      const isCurrentConversation = normalizedConversationId === normalizedSelectedConversationId
      
      const isFromOtherUser = String(data.message?.senderId) !== String(currentUser?.id)
      
      const senderName = `${data.message?.sender?.firstName || ''} ${data.message?.sender?.lastName || ''}`.trim() || data.message?.sender?.username || 'Someone'
      
      let expertInfo = null
      let conversationName = senderName
      
      setExperts(prev => {
        const updated = prev.map(expert => {
          const normalizedExpertConversationId = String(expert.conversationId || '')
          if (normalizedExpertConversationId === normalizedConversationId) {
            expertInfo = expert
            conversationName = expert.name || senderName
            return {
              ...expert,
              lastMessagePreview: data.message?.content || (data.message?.messageType === 'image' ? 'Image' : data.message?.messageType === 'document' ? 'Document' : 'Message'),
              lastMessage: new Date().toLocaleString(),
              unreadCount: isCurrentConversation ? 0 : (String(data.message?.senderId) === String(currentUser?.id) ? expert.unreadCount : expert.unreadCount + 1)
            }
          }
          return expert
        })
        return updated
      })
      
      if (isFromOtherUser && data.message && !isCurrentConversation) {
        const messagePreview = data.message.content || 
          (data.message.messageType === 'image' ? '📷 Image' : 
           data.message.messageType === 'document' ? '📄 Document' : 
           data.message.messageType === 'audio' ? '🎤 Audio' : 
           'New message')
        
        setTimeout(() => {
          showHybridNotification(
            conversationName,
            messagePreview, 
            expertInfo?.avatar || '/logo.png',
            data.message?.id
          )
        }, 0)
      }
      
      if (isCurrentConversation) {
        const newMessage = {
          id: data.message.id,
          senderId: data.message.senderId,
          senderName: `${data.message.sender?.firstName || ''} ${data.message.sender?.lastName || ''}`.trim() || data.message.sender?.username || 'Unknown',
          content: data.message.content,
          timestamp: new Date(data.message.createdAt),
          isExpert: String(data.message.senderId) === String(currentUser?.id), 
          seen: data.message.isRead || false,
          seenTime: data.message.readAt ? new Date(data.message.readAt) : null,
          type: data.message.messageType || 'text',
          mediaUrl: data.message.mediaUrl,
          audioDuration: data.message.audioDuration,
          replyTo: data.message.replyToMessage ? {
            id: data.message.replyToMessage.id,
            content: data.message.replyToMessage.content,
            senderName: `${data.message.replyToMessage.sender?.firstName || ''} ${data.message.replyToMessage.sender?.lastName || ''}`.trim() || data.message.replyToMessage.sender?.username || 'Unknown'
          } : null
        }
        
        setMessages(prev => {
          const messageExists = prev.some(msg => String(msg.id) === String(newMessage.id))
          if (messageExists) {
            return prev.map(msg => {
              if (String(msg.id) === String(newMessage.id) || (msg.id?.startsWith('temp-') && String(msg.senderId) === String(newMessage.senderId) && msg.content === newMessage.content)) {
                return newMessage
              }
              return msg
            })
          }
          
          const filtered = prev.filter(msg => {
            if (msg.id?.startsWith('temp-') && String(msg.senderId) === String(newMessage.senderId)) {
              return false
            }
            return true
          })
          
          if (String(newMessage.senderId) !== String(currentUser?.id)) {
            setTimeout(() => {
              markAllMessagesAsRead()
            }, 500)
          }
          
          const updated = [...filtered, newMessage].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
          setGroupedMessages(groupMessagesByDate(updated))
          
          setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
          }, 100)
          
          return updated
        })
      }
    }

    const handleMessageNotification = (data) => {
      const isFromOtherUser = String(data.message?.senderId) !== String(currentUser?.id)
      
      const senderName = `${data.message?.sender?.firstName || ''} ${data.message?.sender?.lastName || ''}`.trim() || data.message?.sender?.username || 'Someone'
      
      setExperts(prev => prev.map(expert => {
        const isCurrentConversation = String(expert.conversationId) === String(data.conversationId)
        
        if (isCurrentConversation) {
          if (isFromOtherUser && data.message) {
            const messagePreview = data.message.content || 
              (data.message.messageType === 'image' ? '📷 Image' : 
               data.message.messageType === 'document' ? '📄 Document' : 
               data.message.messageType === 'audio' ? '🎤 Audio' : 
               'New message')
            
            setTimeout(() => {
              showHybridNotification(
                expert.name || senderName,
                messagePreview, 
                expert.avatar || '/logo.png', 
                data.message?.id
              )
            }, 0)
          }
          
          return { 
            ...expert, 
            lastMessagePreview: data.message.content,
            lastMessage: new Date().toLocaleString(),
            unreadCount: String(selectedExpert?.conversationId) === String(data.conversationId) ? 0 : expert.unreadCount + 1
          }
        }
        return expert
      }))
      
      if (String(selectedExpert?.conversationId) === String(data.conversationId)) {
        const newMessage = {
          id: data.message.id,
          senderId: data.message.senderId,
          senderName: `${data.message.sender?.firstName || ''} ${data.message.sender?.lastName || ''}`.trim() || data.message.sender?.username || 'Unknown',
          content: data.message.content,
          timestamp: new Date(data.message.createdAt),
          isExpert: String(data.message.senderId) === String(currentUser?.id), 
          seen: data.message.isRead || false,
          seenTime: data.message.readAt ? new Date(data.message.readAt) : null,
          type: data.message.messageType || 'text',
          mediaUrl: data.message.mediaUrl,
          audioDuration: data.message.audioDuration,
          replyTo: data.message.replyToMessage ? {
            id: data.message.replyToMessage.id,
            content: data.message.replyToMessage.content,
            senderName: `${data.message.replyToMessage.sender?.firstName || ''} ${data.message.replyToMessage.sender?.lastName || ''}`.trim() || data.message.replyToMessage.sender?.username || 'Unknown'
          } : null
        }
        
        setMessages(prev => {
          const messageExists = prev.some(msg => String(msg.id) === String(newMessage.id))
          if (!messageExists) {
            const updated = [...prev, newMessage].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
            setGroupedMessages(groupMessagesByDate(updated))
            
            // Mark messages as read if received from other user
            if (String(newMessage.senderId) !== String(currentUser?.id)) {
              setTimeout(() => {
                markAllMessagesAsRead()
              }, 500)
            }
            
            // Scroll to bottom when new message arrives
            setTimeout(() => {
              messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
            }, 100)
            
            return updated
          }
          return prev
        })
      }
    }

    const handleMessagesRead = (data) => {
      // Normalize conversation IDs to string for comparison
      if (String(data.conversationId) === String(selectedExpert?.conversationId)) {
        // Update message status to show as read
        setMessages(prev => prev.map(msg => 
          data.messageIds.includes(msg.id)
            ? { ...msg, seen: true, seenTime: new Date(data.readAt) }
            : msg
        ))
      }
    }

    const handleTypingStart = (data) => {
      // Normalize conversation IDs to string for comparison
      if (String(data.conversationId) === String(selectedExpert?.conversationId) && String(data.userId) !== String(currentUser?.id)) {
        setTypingUsers(prev => new Set([...prev, data.userId]))
      }
    }

    const handleTypingStop = (data) => {
      // Normalize conversation IDs to string for comparison
      if (String(data.conversationId) === String(selectedExpert?.conversationId)) {
        setTypingUsers(prev => {
          const newSet = new Set(prev)
          newSet.delete(data.userId)
          return newSet
        })
      }
    }

    const handleMessageReaction = (data) => {
      // Normalize conversation IDs to string for comparison
      if (String(data.conversationId) === String(selectedExpert?.conversationId)) {
        setMessageReactions(prev => ({
          ...prev,
          [data.messageId]: data.reactions
        }))
      }
    }

    socket.on('new_message', handleNewMessage)
    socket.on('message_notification', handleMessageNotification)
    socket.on('messages_read', handleMessagesRead)
    socket.on('typing_start', handleTypingStart)
    socket.on('typing_stop', handleTypingStop)
    socket.on('message_reaction', handleMessageReaction)

    return () => {
      socket.off('new_message', handleNewMessage)
      socket.off('message_notification', handleMessageNotification)
      socket.off('messages_read', handleMessagesRead)
      socket.off('typing_start', handleTypingStart)
      socket.off('typing_stop', handleTypingStop)
      socket.off('message_reaction', handleMessageReaction)
    }
  }, [socket, isConnected, selectedExpert, currentUser])

  // Join/leave conversation when expert is selected
  useEffect(() => {
    if (selectedExpert?.conversationId && isConnected && socket) {
      joinConversation(selectedExpert.conversationId)
      
      const handleJoinedConversation = (data) => {}
      socket.on('joined_conversation', handleJoinedConversation)
      
      const handleReconnect = () => {
        if (selectedExpert?.conversationId) {
          joinConversation(selectedExpert.conversationId)
        }
      }
      
      socket.on('connect', handleReconnect)

      return () => {
        socket.off('connect', handleReconnect)
        socket.off('joined_conversation', handleJoinedConversation)
        if (selectedExpert?.conversationId && isConnected) {
          leaveConversation(selectedExpert.conversationId)
        }
      }
    }
  }, [selectedExpert?.conversationId, isConnected, socket, joinConversation, leaveConversation])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])



  useEffect(() => {
    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
      }
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop()
      }
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    setIsPlaying(false)
    setPlayingMessageId(null)
    setAudioProgress(0)
    setAudioDuration(0)
  }, [selectedExpert])

  useEffect(() => {
    const preloadDurations = async () => {
      const audioMessages = messages.filter(msg => msg.type === 'audio' && msg.audioBlob)
      
      for (const msg of audioMessages) {
        if (!messageDurations[msg.id] && !msg.duration) {
          try {
            const audioUrl = URL.createObjectURL(msg.audioBlob)
            const audio = new Audio(audioUrl)
            
            audio.onloadedmetadata = () => {
              setMessageDurations(prev => ({
                ...prev,
                [msg.id]: audio.duration
              }))
              URL.revokeObjectURL(audioUrl)
            }
            
            audio.onerror = () => {
              URL.revokeObjectURL(audioUrl)
            }
          } catch (error) {
          }
        }
      }
    }
    
    if (messages.length > 0) {
      preloadDurations()
    }
  }, [messages, messageDurations])

  const handleSendMessage = async () => {
    const trimmedMessage = message.trim()
    
    if ((trimmedMessage || attachments.length > 0) && selectedExpert && selectedExpert.conversationId) {
      try {
        let mediaUrl = null
        
        // Upload files if there are any attachments
        if (attachments.length > 0) {
          for (const attachment of attachments) {
            if ((attachment.type === 'image' || attachment.type === 'document') && attachment.file) {
              const formData = new FormData()
              formData.append('file', attachment.file)
              
              const uploadResponse = await fetch('/api/upload', {
                method: 'POST',
                body: formData
              })
              
              const uploadData = await uploadResponse.json()
              
              if (uploadData.success) {
                mediaUrl = uploadData.url
                break // For now, only send the first file
              } else {  
              }
            }
          }
        }

        // Determine message type and content based on attachment
        let messageType = 'text'
        let messageContent = trimmedMessage
        
        if (mediaUrl && attachments.length > 0) {
          const attachment = attachments[0]
          if (attachment.type === 'image') {
            messageType = 'image'
            messageContent = trimmedMessage || 'Image'
          } else if (attachment.type === 'document') {
            messageType = 'document'
            messageContent = trimmedMessage || attachment.name
          }
        }
        
        // Send via API first to ensure persistence and get message ID
        if (messageContent || mediaUrl) {
          const response = await fetch(`/api/conversations/${selectedExpert.conversationId}/messages`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              content: messageContent,
              messageType: messageType,
              mediaUrl: mediaUrl,
              replyToMessageId: replyingTo?.id || null,
              audioDuration: attachments.find(a => a.type === 'audio')?.duration || null
            })
          })
        
          const data = await response.json()
          
          if (data.success) {
            setMessage('')
            setAttachments([])
            setShowEmojiPicker(false)
            setReplyingTo(null)
            
            const newMessage = {
              id: data.message.id,
              senderId: data.message.senderId,
              senderName: `${data.message.sender?.firstName || ''} ${data.message.sender?.lastName || ''}`.trim() || data.message.sender?.username || 'You',
              content: data.message.content,
              timestamp: new Date(data.message.createdAt),
              isExpert: true, 
              seen: false,
              type: data.message.messageType,
              mediaUrl: data.message.mediaUrl,
              audioDuration: data.message.audioDuration,
              replyTo: data.message.replyToMessage ? {
                id: data.message.replyToMessage.id,
                content: data.message.replyToMessage.content,
                senderName: `${data.message.replyToMessage.sender?.firstName || ''} ${data.message.replyToMessage.sender?.lastName || ''}`.trim() || data.message.replyToMessage.sender?.username || 'Unknown'
              } : null
            }
            
            setMessages(prev => {
              const messageExists = prev.some(msg => String(msg.id) === String(newMessage.id))
              if (!messageExists) {
                const updated = [...prev, newMessage].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
                setGroupedMessages(groupMessagesByDate(updated))
                return updated
              }
              return prev
            })
            
            setExperts(prev => prev.map(expert => 
              String(expert.conversationId) === String(selectedExpert.conversationId)
                ? { 
                    ...expert, 
                    lastMessagePreview: messageContent || (messageType === 'image' ? 'Image' : messageType === 'document' ? 'Document' : 'Message'),
                    lastMessage: new Date().toLocaleString(),
                    unreadCount: 0 
                  }
                : expert
            ))
            
            setTimeout(() => {
              messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
            }, 100)

          }
        }
      } catch (error) {
      }
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleTyping = () => {
    if (!selectedExpert?.conversationId || !isConnected) return

    if (!isUserTyping) {
      setIsUserTyping(true)
      startTyping(selectedExpert.conversationId)
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

     typingTimeoutRef.current = setTimeout(() => {
       setIsUserTyping(false)
       stopTyping(selectedExpert.conversationId)
     }, 5000)
  }

  const handleReplyToMessage = (message) => {
    setReplyingTo(message)
    const inputElement = document.querySelector('input[placeholder="Type a message"]')
    if (inputElement) {
      inputElement.focus()
    }
  }

  const cancelReply = () => {
    setReplyingTo(null)
  }

  const handleReaction = async (messageId, emoji) => {
    if (!selectedExpert?.conversationId || !currentUser) return

    try {
      const response = await fetch(`/api/conversations/${selectedExpert.conversationId}/messages/${messageId}/reactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ emoji })
      })

      const data = await response.json()

      if (data.success) {
        setMessageReactions(prev => ({
          ...prev,
          [messageId]: data.reactions
        }))

        if (isConnected) {
          socket.emit('message_reaction', {
            conversationId: selectedExpert.conversationId,
            messageId,
            emoji,
            userId: currentUser?.id,
            reactions: data.reactions
          })
        }
      }
    } catch (error) {
    }
  }

  const getReactionCount = (messageId, emoji) => {
    return messageReactions[messageId]?.[emoji]?.length || 0
  }

  const hasUserReacted = (messageId, emoji) => {
    return messageReactions[messageId]?.[emoji]?.includes(currentUser?.id) || false
  }

  const handlePinMessage = async (messageId, action) => {
    if (!selectedExpert?.conversationId || !currentUser) return

    try {
      const response = await fetch(`/api/conversations/${selectedExpert.conversationId}/messages/${messageId}/pin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action })
      })

      const data = await response.json()

      if (data.success) {
        setMessages(prev => prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, isPinned: action === 'pin', pinnedAt: action === 'pin' ? new Date() : null }
            : msg
        ))

        if (action === 'pin') {
          setPinnedMessages(prev => [data.message, ...prev])
        } else {
          setPinnedMessages(prev => prev.filter(msg => msg.id !== messageId))
        }
      }
    } catch (error) {
    }
  }

  const handleStarMessage = async (messageId, action) => {
    if (!selectedExpert?.conversationId || !currentUser) return

    try {
      const response = await fetch(`/api/conversations/${selectedExpert.conversationId}/messages/${messageId}/star`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action })
      })

      const data = await response.json()

      if (data.success) {
        setStarredMessages(prev => {
          const newSet = new Set(prev)
          if (action === 'star') {
            newSet.add(messageId)
          } else {
            newSet.delete(messageId)
          }
          return newSet
        })
      }
    } catch (error) {
    }
  }

  const groupMessagesByDate = (messages) => {
    const groups = {}
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    messages.forEach(message => {
      const messageDate = new Date(message.timestamp)
      const dateKey = messageDate.toDateString()
      
      let groupLabel
      if (dateKey === today.toDateString()) {
        groupLabel = 'Today'
      } else if (dateKey === yesterday.toDateString()) {
        groupLabel = 'Yesterday'
      } else {
        groupLabel = messageDate.toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })
      }

      if (!groups[groupLabel]) {
        groups[groupLabel] = []
      }
      groups[groupLabel].push(message)
    })

    return groups
  }

  const handleSearch = async () => {
    if (!messageSearchQuery.trim() || !selectedExpert?.conversationId) return

    setIsSearching(true)
    try {
      const params = new URLSearchParams({
        q: messageSearchQuery,
        type: searchFilters.type,
        sender: searchFilters.sender,
        dateRange: searchFilters.dateRange
      })

      const response = await fetch(`/api/conversations/${selectedExpert.conversationId}/messages/search?${params}`)
      const data = await response.json()

      if (data.success) {
        setSearchResults(data.messages)
      } else {
        setSearchResults([])
      }
    } catch (error) {
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const scrollToMessage = (messageId) => {
    const messageElement = document.querySelector(`[data-message-id="${messageId}"]`)
    if (messageElement) {
      messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
      messageElement.classList.add('bg-yellow-100')
      setTimeout(() => {
        messageElement.classList.remove('bg-yellow-100')
      }, 2000)
    }
    setShowSearchModal(false)
  }

  const highlightSearchTerm = (text, searchTerm) => {
    if (!searchTerm || !text) return text
    const regex = new RegExp(`(${searchTerm})`, 'gi')
    return text.replace(regex, '<mark class="bg-yellow-200">$1</mark>')
  }


  const markAsRead = (expertId) => {
    setExperts(prev => prev.map(expert => 
      expert.id === expertId 
        ? { ...expert, unreadCount: 0 }
        : expert
    ))
  }

  const updateOnlineStatus = (expertId, isOnline) => {
    setExperts(prev => prev.map(expert => 
      expert.id === expertId 
        ? { ...expert, online: isOnline }
        : expert  
    ))
  }

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files)
    const newAttachments = files.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      type: 'document',
      size: file.size,
      file: file
    }))
    setAttachments(prev => [...prev, ...newAttachments])
    e.target.value = ''
  }

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files)
    const newAttachments = files.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      type: 'image',
      size: file.size,
      file: file,
      preview: URL.createObjectURL(file)
    }))
    setAttachments(prev => [...prev, ...newAttachments])    
    e.target.value = ''
  }

  const removeAttachment = (attachmentId) => {
    setAttachments(prev => prev.filter(att => att.id !== attachmentId))
  }

  const handleEmojiSelect = (emoji) => {
    setMessage(prev => prev + emoji)
    setShowEmojiPicker(false)
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      
      const audioChunks = []
      
      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data)
      }
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' })
        setAudioBlob(audioBlob)
        stream.getTracks().forEach(track => track.stop())
      }
      
      mediaRecorder.start()
      setIsRecording(true)
      setIsPaused(false)
      setRecordingTime(0)
      setPausedTime(0)
      
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
      
    } catch (error) {
      alert('Unable to access microphone. Please check your permissions.')
    }
  }
  
  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording && !isPaused) {
      mediaRecorderRef.current.pause()
      setIsPaused(true)
      setPausedTime(recordingTime)
      clearInterval(recordingIntervalRef.current)
    }
  }
  
  const resumeRecording = () => {
    if (mediaRecorderRef.current && isRecording && isPaused) {
      mediaRecorderRef.current.resume()
      setIsPaused(false)
      setRecordingTime(pausedTime)
      
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
    }
  }
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setIsPaused(false)
      clearInterval(recordingIntervalRef.current)
    }
  }
  
  const handleMicrophoneClick = () => {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }
  
  const sendAudioMessage = () => {
    if (audioBlob && selectedExpert) {
      const newMessage = {
        id: messages.length + 1,
        senderId: user?.id,
        senderName: user?.fullName || 'You',
        content: '',
        audioBlob: audioBlob,
        timestamp: new Date(),
        isExpert: true, 
        type: 'audio'
      }
      setMessages([...messages, newMessage])
      setAudioBlob(null)
      setRecordingTime(0)
    }
  }
  
  const playAudio = (audioBlob, messageId) => {
    
    if (isPlaying && playingMessageId === messageId && audioRef.current) {
      audioRef.current.pause()
      setIsPlaying(false)
      setPlayingMessageId(null)
      return
    }

    if (audioRef.current && playingMessageId !== messageId) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    
    const audioUrl = URL.createObjectURL(audioBlob)
    const audio = new Audio(audioUrl)
    audioRef.current = audio
    
    audio.onloadedmetadata = () => {
      setAudioDuration(audio.duration)
      setMessageDurations(prev => ({
        ...prev,
        [messageId]: audio.duration
      }))
    }
    
    audio.ontimeupdate = () => {
      setAudioProgress(audio.currentTime)
    }
    
    audio.onended = () => {
      setIsPlaying(false)
      setPlayingMessageId(null)
      setAudioProgress(0)
      URL.revokeObjectURL(audioUrl)
    }
    
    audio.onpause = () => {
      setIsPlaying(false)
      setPlayingMessageId(null)
    }
    
    audio.onplay = () => {
      setIsPlaying(true)
      setPlayingMessageId(messageId)
    }
    
    audio.onerror = (error) => {
      setIsPlaying(false)
      setPlayingMessageId(null)
    }
    
    audio.play().catch(error => {
      setIsPlaying(false)
      setPlayingMessageId(null)
    })
  }
  
  const formatRecordingTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatAudioTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const createMockAudioBlob = (duration = 3) => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      const sampleRate = audioContext.sampleRate
      const length = sampleRate * duration
      const buffer = audioContext.createBuffer(1, length, sampleRate)
      const data = buffer.getChannelData(0)
      
      for (let i = 0; i < length; i++) {
        data[i] = Math.sin(2 * Math.PI * 440 * i / sampleRate) * 0.1
      }
      
      const wavBuffer = new ArrayBuffer(44 + length * 2)
      const view = new DataView(wavBuffer)
      
      const writeString = (offset, string) => {
        for (let i = 0; i < string.length; i++) {
          view.setUint8(offset + i, string.charCodeAt(i))
        }
      }
      
      writeString(0, 'RIFF')
      view.setUint32(4, 36 + length * 2, true)
      writeString(8, 'WAVE')
      writeString(12, 'fmt ')
      view.setUint32(16, 16, true)
      view.setUint16(20, 1, true)
      view.setUint16(22, 1, true)
      view.setUint32(24, sampleRate, true)
      view.setUint32(28, sampleRate * 2, true)
      view.setUint16(32, 2, true)
      view.setUint16(34, 16, true)
      writeString(36, 'data')
      view.setUint32(40, length * 2, true)
      
      let offset = 44
      for (let i = 0; i < length; i++) {
        const sample = Math.max(-1, Math.min(1, data[i]))
        view.setInt16(offset, sample * 0x7FFF, true)
        offset += 2
      }
      
      return new Blob([wavBuffer], { type: 'audio/wav' })
    } catch (error) {
      return new Blob(['mock audio'], { type: 'audio/wav' })
    }
  }

  const EqualizerBars = ({ isPlaying, messageId, isExpert = false }) => {
    const [barHeights, setBarHeights] = useState([4, 4, 4, 4, 4])
    
    useEffect(() => {
      let interval
      const isCurrentlyPlaying = isPlaying && playingMessageId === messageId
      
      if (isCurrentlyPlaying) {
        interval = setInterval(() => {
          setBarHeights([
            Math.random() * 12 + 4,
            Math.random() * 12 + 4,
            Math.random() * 12 + 4,
            Math.random() * 12 + 4,
            Math.random() * 12 + 4
          ])
        }, 150)
      } else {
        setBarHeights([4, 4, 4, 4, 4])
      }
      
      return () => {
        if (interval) {
          clearInterval(interval)
        }
      }
    }, [isPlaying, playingMessageId, messageId])

    const isCurrentlyPlaying = isPlaying && playingMessageId === messageId

    return (
      <div className="flex items-end gap-1 h-4">
        {barHeights.map((height, i) => (
          <div
            key={i}
            className={`w-1 rounded-full transition-all duration-150 ${
              isCurrentlyPlaying 
                ? (isExpert ? 'bg-white/80' : 'bg-blue-500') 
                : (isExpert ? 'bg-white/40' : 'bg-gray-300')
            }`}
            style={{ height: `${height}px` }}
          />
        ))}
      </div>
    )
  }

  const handleDownload = (attachment) => {
    const link = document.createElement('a')
    link.href = URL.createObjectURL(attachment.file)
    link.download = attachment.name
    link.style.display = 'none'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(link.href)
  }

  const handleOpen = (attachment) => {
    const blobUrl = URL.createObjectURL(attachment.file)
    
    const link = document.createElement('a')
    link.href = blobUrl
    link.target = '_blank'
    link.style.display = 'none'
    document.body.appendChild(link)
    
    link.click()
        
    document.body.removeChild(link)
    setTimeout(() => URL.revokeObjectURL(blobUrl), 1000)
  }


  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase()
    switch (extension) {
      case 'pdf':
        return '📄'
      case 'doc':
      case 'docx':
        return '📝'
      case 'txt':
        return '📃'
      case 'xls':
      case 'xlsx':
        return '📊'
      case 'ppt':
      case 'pptx':
        return '📽️'
      default:
        return '📎'
    }
  }

  const getDocumentPreview = (fileName, fileUrl) => {
    const extension = fileName.split('.').pop().toLowerCase()
    let name = fileName.split('.')[0]
    
    // Remove "Document: " prefix if it exists
    if (name.startsWith('Document: ')) {
      name = name.replace('Document: ', '')
    }
    
    const getFileTypeIcon = (ext) => {
      switch (ext) {
        case 'pdf':
          return (
            <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center">
              <div className="text-red-600 font-bold text-lg">PDF</div>
            </div>
          )
        case 'doc':
        case 'docx':
          return (
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <div className="text-blue-600 font-bold text-lg">DOC</div>
            </div>
          )
        case 'txt':
          return (
            <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center">
              <div className="text-gray-600 font-bold text-lg">TXT</div>
            </div>
          )
        case 'xls':
        case 'xlsx':
          return (
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
              <div className="text-green-600 font-bold text-lg">XLS</div>
            </div>
          )
        case 'ppt':
        case 'pptx':
          return (
            <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
              <div className="text-orange-600 font-bold text-lg">PPT</div>
            </div>
          )
        default:
          return (
            <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center">
              <div className="text-gray-600 font-bold text-lg">FILE</div>
            </div>
          )
      }
    }
    
    return (
      <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="flex-shrink-0">
          {getFileTypeIcon(extension)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{name}</p>
          <p className="text-xs text-gray-400 mt-1">Click to view or download</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.open(fileUrl, '_blank')}
            className="h-8 px-2 text-blue-600 hover:text-blue-700"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const link = document.createElement('a')
              link.href = fileUrl
              link.download = fileName
              link.target = '_blank'
              document.body.appendChild(link)
              link.click()
              document.body.removeChild(link)
            }}
            className="h-8 px-2 text-green-600 hover:text-green-700"
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>
    )
  }

  const canEditOrDelete = (message) => {
    if (!message.isExpert) return false
    
    const now = new Date()
    const messageTime = new Date(message.timestamp)
    const timeDiff = now - messageTime
    const twentyFourHours = 24 * 60 * 60 * 1000
    
    return timeDiff < twentyFourHours
  }

  const handleEditMessage = (message) => {
    setEditingMessage(message.id)
    setEditText(message.content)
  }

  const handleSaveEdit = () => {
    if (editText.trim()) {
      setMessages(prev => prev.map(msg => 
        msg.id === editingMessage 
          ? { ...msg, content: editText.trim(), edited: true, editTime: new Date() }
          : msg
      ))
    }
    setEditingMessage(null)
    setEditText('')
  }

  const handleCancelEdit = () => {
    setEditingMessage(null)
    setEditText('')
  }

  const showDeleteDialog = (messageId, type) => {
    setDeleteDialog({ open: true, messageId, type })
  }

  const handleDeleteFromMe = (messageId) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, deletedForSender: true }
        : msg
    ))
    setDeleteDialog({ open: false, messageId: null, type: null })
  }

  const handleDeleteFromEveryone = (messageId) => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId))
    setDeleteDialog({ open: false, messageId: null, type: null })
  }

  const confirmDelete = () => {
    if (deleteDialog.type === 'me') {
      handleDeleteFromMe(deleteDialog.messageId)
    } else if (deleteDialog.type === 'everyone') {
      handleDeleteFromEveryone(deleteDialog.messageId)
    }
  }

  const markMessageAsSeen = (messageId) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, seen: true, seenTime: new Date() }
        : msg
    ))
  }

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const getFilteredExperts = () => {
    let filtered = experts

    if (searchQuery.trim()) {
      filtered = filtered.filter(expert => 
        expert.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        expert.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        expert.industry.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    switch (filter) {
      case 'online':
        return filtered.filter(expert => expert.online)
      case 'unread':
        return filtered.filter(expert => expert.unreadCount > 0)
      case 'recent':
        return filtered.filter(expert => expert.lastMessage.includes('minute') || expert.lastMessage.includes('hour'))
      default:
        return filtered
    }
  }

  if (loading) {
    return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto h-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 h-full">
            <div className="lg:col-span-1 bg-white border-r border-gray-200">
              <div className="h-full flex flex-col">
                <div className="flex-shrink-0 p-4 border-b border-gray-300 bg-green-50">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-8 w-32" />
                  </div>
                </div>
                <div className="flex-1 min-h-0 overflow-auto">
                  <div className="space-y-0">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="p-4 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-12 w-12 rounded-full" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-3 w-16" />
                            <Skeleton className="h-3 w-20" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 bg-white">
              <div className="h-full flex items-center justify-center bg-gray-50">
                <div className="text-center space-y-4">
                  <Skeleton className="h-16 w-16 mx-auto rounded-full" />
                  <Skeleton className="h-6 w-48 mx-auto" />
                  <Skeleton className="h-4 w-64 mx-auto" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[470px] bg-gray-100 flex justify-center items-center">
      <div className="w-full max-w-6xl mx-auto bg-white flex h-full">
        <div className="w-1/3 border-r border-gray-300 flex flex-col bg-white">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-300 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user?.imageUrl} alt={user?.fullName} />
                <AvatarFallback className="bg-blue-500 text-white">
                  {user?.fullName?.split(' ').map(n => n[0]).join('') || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="font-semibold text-gray-800">{user?.fullName || 'User'}</h2>
                <p className="text-xs text-gray-500">Online</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="p-3 bg-white border-b border-gray-200">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search experts..."
                  className="pl-10 h-8"
                />
              </div>
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-32 h-8">
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="unread">Unread</SelectItem>
                  <SelectItem value="recent">Recent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto max-h-[250px]">
            {getFilteredExperts().length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <MessageSquare className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No Chat Available</h3>
                <p className="text-sm text-gray-500 max-w-sm">
                  You can only chat with experts after booking at least one meeting with them. 
                  Book a session first to start chatting!
                </p>
              </div>
            ) : (
              getFilteredExperts().map((expert) => (
              <div
                key={expert.id}
                onClick={async () => {
                  if (selectedExpert?.id === expert.id) {
                    setSelectedExpert(null)
                    return
                  }
                  
                  if (!expert.conversationId) {
                    try {
                      setLoading(true)
                      const response = await fetch('/api/conversations', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                          otherUserId: expert.id
                        })
                      })
                      
                      const data = await response.json()
                      
                      if (data.success) {
                        // Update the expert with the new conversation ID
                        const updatedExpert = {
                          ...expert,
                          conversationId: data.conversation.id
                        }
                        setSelectedExpert(updatedExpert)
                        
                        // Update the experts list
                        setExperts(prev => prev.map(e => 
                          e.id === expert.id 
                            ? { ...e, conversationId: data.conversation.id }
                            : e
                        ))  
                      } else {
                        // Show error message to user
                        const errorMessage = data.error || 'Failed to start conversation'
                        const errorDetails = data.details || ''
                        
                        if (response.status === 403) {
                          // Booking required error
                          alert(`${errorMessage}\n\n${errorDetails}\n\nPlease complete a booking with this expert first to start chatting.`)
                        } else {
                          alert(`${errorMessage}\n\n${errorDetails}`)
                        }
                      }
                    } catch (error) {
                      alert(`Failed to start conversation. Please try again later.\n\nError: ${error.message}`)
                    } finally {
                      setLoading(false)
                    }
                  } else {
                    setSelectedExpert(expert)
                    markAsRead(expert.id)
                  }
                }}
                className={`p-3 cursor-pointer transition-colors border-b border-gray-100 hover:bg-gray-50 ${
                  selectedExpert?.id === expert.id ? 'bg-gray-100' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={expert.avatar} alt={expert.name} />
                      <AvatarFallback className="bg-blue-500 text-white font-semibold">
                        {expert.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    {expert.online && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                    )}

                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900 truncate">{expert.name}</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">{expert.lastMessageTime}</span>
                        {expert.unreadCount > 0 && (
                          <div className="bg-blue-500 text-white text-xs h-5 w-5 rounded-full flex items-center justify-center">
                            {expert.unreadCount}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600 truncate flex-1">{expert.lastMessagePreview}</p>
                      {expert.unreadCount > 0 && (
                        <div className="ml-2">
                          <CheckCheck className="h-4 w-4 text-blue-500" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              ))
            )}
            </div>
          </div>

        <div className="flex-1 flex flex-col bg-white">
          {selectedExpert ? (
            <>
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-300 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={selectedExpert.avatar} alt={selectedExpert.name} />
                    <AvatarFallback className="bg-blue-500 text-white">
                      {selectedExpert.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-gray-900">{selectedExpert.name}</h3>
                     <div className="flex items-center gap-2">
                     <p className="text-xs text-gray-500">
                       {typingUsers.size > 0 ? (
                         <span className="flex items-center gap-1">
                           <span>typing</span>
                           <span className="flex gap-1">
                             <span className="animate-bounce">.</span>
                             <span className="animate-bounce" style={{animationDelay: '0.1s'}}>.</span>
                             <span className="animate-bounce" style={{animationDelay: '0.2s'}}>.</span>
                           </span>
                         </span>
                       ) : (
                         selectedExpert.online ? 'Online' : 'Last seen recently'
                       )}
                     </p>
                       {typingUsers.size === 0 && (
                         <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} title={isConnected ? 'Real-time connected' : 'Real-time disconnected'} />
                       )}
                     </div>
                  </div>
                </div>
                 <div className="flex items-center gap-2">
                   <Button 
                     variant="ghost" 
                     size="icon" 
                     className="h-8 w-8"
                     onClick={() => setShowSearchModal(true)}
                     title="Search messages"
                   >
                     <Search className="h-4 w-4" />
                   </Button>
                   <Button 
                     variant="ghost" 
                     size="icon" 
                     className="h-8 w-8"
                     onClick={() => {
                       if (selectedExpert?.username) {
                         window.open(`/marketplace/${selectedExpert.username}`, '_blank')
                       }
                     }}
                     title="View expert profile"
                   >
                     <Info className="h-4 w-4" />
                   </Button>
                   <Button 
                     variant="ghost" 
                     size="icon" 
                     className="h-8 w-8"
                     onClick={() => setSelectedExpert(null)}
                     title="Close chat"
                   >
                     <X className="h-4 w-4" />
                   </Button>
                 </div>
              </div>
                
              {pinnedMessages.length > 0 && (
                <div className="bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 px-4 py-2 border-b border-gray-400">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Pin className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        {pinnedMessages.length} Pinned Message{pinnedMessages.length > 1 ? 's' : ''}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-800 hover:text-gray-900 hover:bg-gray-400/20 h-6 px-2"
                      onClick={() => setShowPinnedMessages(!showPinnedMessages)}
                    >
                      {showPinnedMessages ? 'Hide' : 'View'}
                    </Button>
                  </div>
                  {showPinnedMessages && (
                    <div className="mt-2 space-y-1 max-h-24 overflow-y-auto">
                      {pinnedMessages.map((pinnedMsg) => (
                        <div
                          key={pinnedMsg.id}
                          className="bg-white backdrop-blur-sm rounded p-2 cursor-pointer hover:bg-white/50 transition-colors"
                          onClick={() => {
                            const messageElement = document.querySelector(`[data-message-id="${pinnedMsg.id}"]`)
                            if (messageElement) {
                              messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
                              messageElement.classList.add('bg-yellow-100')
                              setTimeout(() => {
                                messageElement.classList.remove('bg-yellow-100')
                              }, 2000)
                            }
                            setShowPinnedMessages(false)
                          }}
                        >
                          <div className="flex items-start gap-2">
                            <Avatar className="h-5 w-5">
                              <AvatarImage src={pinnedMsg.sender?.avatar} />
                              <AvatarFallback className="bg-gray-500 text-white text-xs">
                                {pinnedMsg.sender?.firstName?.[0] || pinnedMsg.sender?.username?.[0] || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-medium text-gray-800">
                                  {pinnedMsg.sender?.firstName} {pinnedMsg.sender?.lastName}
                                </span>
                                <span className="text-xs text-gray-600">
                                  {new Date(pinnedMsg.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-xs text-gray-700 truncate">
                                {pinnedMsg.content || `${pinnedMsg.messageType} message`}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="flex-1 overflow-auto bg-gray-100 p-4" style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23f0f0f0" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="1"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'}}>

                {Object.keys(groupedMessages).length > 0 ? (
                  Object.entries(groupedMessages).map(([dateGroup, groupMessages]) => (
                    <div key={dateGroup} className="mb-6">
                      <div className="flex items-center justify-center mb-4">
                        <div className="flex-1 h-px bg-gray-300"></div>
                        <div className="mx-4 bg-white px-3 py-1 rounded-full shadow-sm border">
                          <span className="text-xs font-medium text-gray-600">{dateGroup}</span>   
                        </div>
                        <div className="flex-1 h-px bg-gray-300"></div>
                      </div>  
                      {groupMessages.map((msg) => {
                        if (msg.deletedForSender && msg.isExpert) return null
                        
                        return (
                   <div
                     key={msg.id}
                     data-message-id={msg.id}
                       className={`mb-3 group relative transition-colors`}
                       onMouseEnter={() => setHoveredMessage(msg.id)}
                       onMouseLeave={() => setHoveredMessage(null)}
                     >

                      <div className={`flex ${msg.isExpert ? 'justify-end' : 'justify-start'} gap-2`}>
                        {!msg.isExpert && (
                          <Avatar className="h-8 w-8 flex-shrink-0">
                            <AvatarImage src={selectedExpert?.avatar} alt={selectedExpert?.name} />
                            <AvatarFallback className="bg-blue-500 text-white text-xs">
                              {selectedExpert?.name?.split(' ').map(n => n[0]).join('') || 'E'}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        
                        <div className="flex flex-col max-w-xs lg:max-w-md relative">
                        {!msg.isExpert && (
                          <span className="text-xs text-gray-500 mb-1 px-1">{msg.senderName}</span>
                        )}
                        <ContextMenu>
                          <ContextMenuTrigger asChild>
                            <div
                              className={`px-3 py-2 rounded-lg shadow-sm cursor-context-menu ${
                            msg.isExpert
                                  ? 'bg-blue-500 text-white'
                              : 'bg-white text-gray-900'
                          }`}
                          style={{
                            borderRadius: msg.isExpert ? '18px 18px 4px 18px' : '18px 18px 18px 4px'
                          }}
                            >
                          {msg.replyTo && (
                            <div className={`mb-2 p-2 rounded border-l-4 ${
                              msg.isExpert 
                                ? 'bg-blue-400/20 border-blue-200' 
                                : 'bg-gray-100 border-gray-400'
                            }`}>
                              <div className={`text-xs font-medium mb-1 ${
                                msg.isExpert ? 'text-blue-100' : 'text-gray-600'
                              }`}>
                                {msg.replyTo.senderName}
                              </div>
                              <div className={`text-xs ${
                                msg.isExpert ? 'text-blue-100' : 'text-gray-500'
                              }`}>
                                {msg.replyTo.content?.length > 50 
                                  ? msg.replyTo.content.substring(0, 50) + '...' 
                                  : msg.replyTo.content}
                              </div>
                            </div>
                          )}
                          {editingMessage === msg.id ? (
                            <div className="space-y-2">
                              <Input
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                className="w-full bg-transparent border-none p-0 text-sm"
                                autoFocus
                              />
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  className="h-6 px-2 text-xs"
                                  onClick={handleSaveEdit}
                                >
                                  Save
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 px-2 text-xs"
                                  onClick={handleCancelEdit}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <>
                              {msg.mediaUrl && msg.type === 'image' ? (
                                <div className="space-y-2">
                                  <img 
                                    src={msg.mediaUrl} 
                                    alt="Shared image" 
                                    className="max-w-full h-auto rounded-lg"
                                    style={{ maxHeight: '300px' }}
                                  />
                                  {msg.content && msg.content !== 'Image' && (
                                <p className="text-sm leading-relaxed">
                                  {msg.content}
                                  {msg.edited && (
                                    <span className="text-xs opacity-70 ml-1">(edited)</span>
                                  )}
                                </p>
                                  )}
                                </div>
                              ) : msg.mediaUrl && msg.type === 'document' ? (
                                <div className="space-y-2">
                                  {getDocumentPreview(
                                    msg.content || 'document.pdf', 
                                    msg.mediaUrl
                                  )}
                                  {msg.content && !msg.content.includes('.') && (
                                    <p className="text-sm leading-relaxed">
                                      {msg.content}
                                      {msg.edited && (
                                        <span className="text-xs opacity-70 ml-1">(edited)</span>
                                      )}
                                    </p>
                                  )}
                                </div>
                              ) : (
                                msg.content && (
                                  <p className="text-sm leading-relaxed">
                                    {msg.content}
                                    {msg.edited && (
                                      <span className="text-xs opacity-70 ml-1">(edited)</span>
                                    )}
                                  </p>
                                )
                              )}
                              {msg.type === 'audio' && msg.audioBlob && (
                                <div className="flex items-center gap-3 mt-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className={`h-8 w-8 p-0 rounded-full flex items-center justify-center ${
                                      msg.isExpert 
                                        ? 'bg-white/20 hover:bg-white/30 text-white hover:text-white' 
                                        : 'bg-blue-500 hover:bg-blue-600 text-white hover:text-white'
                                    }`}
                                    onClick={() => playAudio(msg.audioBlob, msg.id)}
                                  >
                                    {isPlaying && playingMessageId === msg.id ? (
                                      <Pause className="h-4 w-4" />
                                    ) : (
                                      <Play className="h-4 w-4 ml-0.5" />
                                    )}
                                  </Button>
                                  <div className="flex-1">
                                    <div className={`text-sm font-medium mb-1 ${
                                      msg.isExpert ? 'text-white' : 'text-gray-900'
                                    }`}>
                                      Voice message
                                    </div>
                                    <EqualizerBars isPlaying={isPlaying} messageId={msg.id} isExpert={msg.isExpert} />
                                    {isPlaying && playingMessageId === msg.id && (
                                      <div className="mt-2">
                                        <div className={`w-full rounded-full h-1 ${
                                          msg.isExpert ? 'bg-white/30' : 'bg-gray-200'
                                        }`}>
                                          <div 
                                            className={`h-1 rounded-full transition-all duration-100 ${
                                              msg.isExpert ? 'bg-white' : 'bg-blue-500'
                                            }`}
                                            style={{ 
                                              width: `${audioDuration > 0 ? (audioProgress / audioDuration) * 100 : 0}%` 
                                            }}
                                          />
                                        </div>
                                        <div className={`flex justify-between text-xs mt-1 ${
                                          msg.isExpert ? 'text-white/80' : 'text-gray-500'
                                        }`}>
                                          <span>{formatAudioTime(audioProgress)}</span>
                                          <span>{formatAudioTime(audioDuration)}</span>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                  <span className={`text-xs ${
                                    msg.isExpert ? 'text-white/80' : 'text-gray-500'
                                  }`}>
                                    {messageDurations[msg.id] 
                                      ? formatAudioTime(messageDurations[msg.id])
                                      : (msg.duration 
                                          ? formatAudioTime(msg.duration)
                                          : (isPlaying && playingMessageId === msg.id 
                                              ? formatAudioTime(audioDuration) 
                                              : '0:00'))
                                    }
                                  </span>
                                </div>
                              )}
                              {msg.attachments && msg.attachments.length > 0 && (
                                <div className="mt-2 space-y-2">
                                  {msg.attachments.map((attachment) => (
                                    <div key={attachment.id} className="p-3 rounded-lg border border-gray-200 bg-white">
                                      {attachment.type === 'image' && attachment.preview ? (
                                        <div className="space-y-2">
                                          <img src={attachment.preview} alt={attachment.name} className="h-32 w-full rounded object-cover" />
                                          <div className="flex items-center justify-between">
                                            <span className="text-xs text-gray-600 truncate flex-1">{attachment.name}</span>
                                            <div className="flex gap-1">
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 px-3 text-xs flex items-center justify-center text-gray-700 hover:text-gray-900"
                                                onClick={() => handleDownload(attachment)}
                                              >
                                                <Download className="h-3 w-3 mr-1" />
                                                Download
                                              </Button>
                                            </div>
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="space-y-2">
                                          <div className="flex items-center gap-3">
                                            <div className="text-2xl">{getFileIcon(attachment.name)}</div>
                                            <div className="flex-1 min-w-0">
                                              <p className="text-sm font-medium text-gray-900 truncate">{attachment.name}</p>
                                              <p className="text-xs text-gray-500">{formatFileSize(attachment.size)}</p>
                                              <p className="text-xs text-gray-400 mt-1">Download to view document</p>
                                            </div>
                                          </div>
                                          <div className="flex gap-2">
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              className="h-8 px-3 text-xs flex-1 flex items-center justify-center text-gray-700 hover:text-gray-900"
                                              onClick={() => handleDownload(attachment)}
                                            >
                                              <Download className="h-3 w-3 mr-1" />
                                              Download
                                            </Button>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              className="h-8 px-3 text-xs flex-1 flex items-center justify-center text-gray-700 hover:text-gray-900"
                                              onClick={() => handleOpen(attachment)}
                                            >
                                              <Eye className="h-3 w-3 mr-1" />
                                              Open
                                            </Button>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </>
                          )}
                           <div className="flex items-center justify-end gap-1 mt-1">
                             {starredMessages.has(msg.id) && (
                               <Star className={`h-3 w-3 fill-yellow-400 text-yellow-400`} />
                             )}
                             <span className={`text-xs ${msg.isExpert ? 'text-blue-100' : 'text-gray-500'}`}>
                               {formatTime(msg.timestamp)}
                             </span>
                             {msg.isExpert && (
                               <CheckCheck className={`h-3 w-3 ${msg.seen ? 'text-blue-500' : 'text-gray-400'}`} />
                             )}
                           </div>

                            </div>
                          </ContextMenuTrigger>
                          <ContextMenuContent className="w-48">
                            <ContextMenuItem onClick={() => handleReplyToMessage(msg)}>
                              <Reply className="mr-2 h-4 w-4" />
                              Reply
                            </ContextMenuItem>
                            <ContextMenuItem onClick={() => {
                              const isStarred = starredMessages.has(msg.id)
                              handleStarMessage(msg.id, isStarred ? 'unstar' : 'star')
                            }}>
                              <Star className={`mr-2 h-4 w-4 ${starredMessages.has(msg.id) ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                              {starredMessages.has(msg.id) ? 'Unstar' : 'Star'}
                            </ContextMenuItem>
                            <ContextMenuItem onClick={() => {
                              const isPinned = msg?.isPinned
                              handlePinMessage(msg.id, isPinned ? 'unpin' : 'pin')
                            }}>
                              {msg?.isPinned ? <PinOff className="mr-2 h-4 w-4" /> : <Pin className="mr-2 h-4 w-4" />}
                              {msg?.isPinned ? 'Unpin' : 'Pin'}
                            </ContextMenuItem>
                            <ContextMenuItem onClick={() => {
                              if (msg?.content) {
                                navigator.clipboard.writeText(msg.content)
                              }
                            }}>
                              <Copy className="mr-2 h-4 w-4" />
                              Copy
                            </ContextMenuItem>
                            {msg?.isExpert && canEditOrDelete(msg) && (
                              <>
                                <ContextMenuSeparator />
                                <ContextMenuItem onClick={() => handleEditMessage(msg)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit message
                                </ContextMenuItem>
                                <ContextMenuItem 
                                  variant="destructive"
                                  onClick={() => showDeleteDialog(msg.id, 'me')}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete for me
                                </ContextMenuItem>
                                <ContextMenuItem 
                                  variant="destructive"
                                  onClick={() => showDeleteDialog(msg.id, 'everyone')}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete for everyone
                                </ContextMenuItem>
                              </>
                            )}
                          </ContextMenuContent>
                        </ContextMenu>

                         {/* WhatsApp-style Hover Reaction Picker */}
                         {hoveredMessage === msg.id && (
                           <div className={`absolute ${msg.isExpert ? 'right-0' : 'left-0'} -top-2 flex gap-1 bg-white border rounded-lg shadow-lg p-1 z-10`}>
                             {['👍', '❤️', '🔥', '😂', '😮', '😢'].map((emoji) => (
                               <button
                                 key={emoji}
                                 onClick={() => handleReaction(msg.id, emoji)}
                                 className="hover:bg-gray-100 rounded p-1 text-lg transition-colors"
                                 title={`React with ${emoji}`}
                               >
                                 {emoji}
                               </button>
                             ))}
                           </div>
                         )}
                        </div>

                        {msg.isExpert && (
                          <Avatar className="h-8 w-8 flex-shrink-0">
                            <AvatarImage src={user?.imageUrl} alt={user?.fullName} />
                            <AvatarFallback className="bg-blue-500 text-white text-xs">
                              {user?.fullName?.split(' ').map(n => n[0]).join('') || 'E'}
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>

                      {/* WhatsApp-style Reactions Display - Below the entire message row */}
                      {messageReactions[msg.id] && Object.keys(messageReactions[msg.id]).length > 0 && (
                        <div className={`flex flex-wrap gap-1 mt-2 ${msg.isExpert ? 'justify-end pr-10' : 'justify-start pl-10'}`}>
                          {Object.entries(messageReactions[msg.id]).map(([emoji, userIds]) => (
                            <button
                              key={emoji}
                              onClick={() => handleReaction(msg.id, emoji)}
                              className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs border transition-colors shadow-sm ${
                                hasUserReacted(msg.id, emoji)
                                  ? 'bg-blue-100 border-blue-300 text-blue-700'
                                  : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                              }`}
                            >
                              <span>{emoji}</span>
                              <span className="text-xs">{getReactionCount(msg.id, emoji)}</span>
                            </button>
                          ))}
                        </div>
                      )}
                        </div>
                        )
                      })}
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No messages yet</p>
                      <p className="text-sm text-gray-400">Start a conversation!</p>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="bg-gray-50 px-4 py-3 border-t border-gray-300">
                {/* WhatsApp-style Reply Preview */}
                {replyingTo && (
                  <div className="mb-3 bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Reply className="h-4 w-4 text-blue-500" />
                          <span className="text-sm font-medium text-gray-700">
                            Replying to {replyingTo.senderName}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 bg-gray-50 rounded p-2 border-l-4 border-blue-500">
                          {replyingTo.content?.length > 100 
                            ? replyingTo.content.substring(0, 100) + '...' 
                            : replyingTo.content}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full h-8 w-8 p-0 flex items-center justify-center ml-2"
                        onClick={cancelReply}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {isRecording && (
                  <div className="mb-3 bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                          <span className="text-sm text-gray-600 font-medium">
                            {isPaused ? 'Recording paused' : 'Recording...'}
                          </span>
                        </div>
                        <div className="text-lg font-mono text-gray-800 bg-gray-100 px-3 py-1 rounded-lg">
                          {formatRecordingTime(recordingTime)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {isPaused ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-full h-8 w-8 p-0 flex items-center justify-center"
                            onClick={resumeRecording}
                          >
                            <Play className="h-4 w-4 ml-0.5" />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-full h-8 w-8 p-0 flex items-center justify-center"
                            onClick={pauseRecording}
                          >
                            <Pause className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full h-8 w-8 p-0 flex items-center justify-center"
                          onClick={stopRecording}
                        >
                          <Square className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {audioBlob && !isRecording && (
                  <div className="mb-3 bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 bg-blue-500 hover:bg-blue-600 text-white hover:text-white rounded-full flex items-center justify-center"
                          onClick={() => playAudio(audioBlob, 'preview')}
                        >
                          {isPlaying && playingMessageId === 'preview' ? (
                            <Pause className="h-4 w-4" />
                          ) : (
                            <Play className="h-4 w-4 ml-0.5" />
                          )}
                        </Button>
                        <div className="flex-1">
                          <div className="text-sm text-gray-900 font-medium mb-1">Voice message</div>
                          <div className="text-xs text-gray-500">{formatRecordingTime(recordingTime)}</div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full h-8 w-8 p-0 flex items-center justify-center"
                        onClick={() => setAudioBlob(null)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="mt-3">
                      <EqualizerBars isPlaying={isPlaying} messageId="preview" />
                      {isPlaying && playingMessageId === 'preview' && (
                        <div className="mt-2">
                          <div className="w-full bg-gray-200 rounded-full h-1">
                            <div 
                              className="bg-blue-500 h-1 rounded-full transition-all duration-100" 
                              style={{ 
                                width: `${audioDuration > 0 ? (audioProgress / audioDuration) * 100 : 0}%` 
                              }}
                            />
                          </div>
                          <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>{formatAudioTime(audioProgress)}</span>
                            <span>{formatAudioTime(audioDuration)}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
        
                {attachments.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-2">
                    {attachments.map((attachment) => (
                      <div key={attachment.id} className="flex items-center gap-2 bg-white rounded-lg p-2 border">
                        {attachment.type === 'image' && attachment.preview ? (
                          <img src={attachment.preview} alt={attachment.name} className="h-8 w-8 rounded object-cover" />
                        ) : (
                          <div className="text-lg">{getFileIcon(attachment.name)}</div>
                        )}
                        <div className="flex-1 min-w-0">
                          <span className="text-xs text-gray-600 truncate block">{attachment.name}</span>
                          <span className="text-xs text-gray-400">{formatFileSize(attachment.size)}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 p-0"
                          onClick={() => removeAttachment(attachment.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => fileInputRef.current?.click()}
                    >
                    <Paperclip className="h-4 w-4" />
                  </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.txt"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>

                  <div className="relative">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => imageInputRef.current?.click()}
                    >
                      <Image className="h-4 w-4" />
                    </Button>
                    <input
                      ref={imageInputRef}
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>

                  <div className="flex-1 relative">
                    <Input
                      value={message}
                      onChange={(e) => {
                        setMessage(e.target.value)
                        handleTyping()
                      }}
                      onKeyPress={handleKeyPress}
                      placeholder="Type a message"
                      className="w-full bg-white border-gray-300 rounded-full px-4 py-2 pr-12"
                    />
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    >
                      <Smile className="h-4 w-4" />
                    </Button>
                  </div>

                  {showEmojiPicker && (
                    <div className="absolute bottom-16 right-4 bg-white border rounded-lg shadow-lg p-2 grid grid-cols-6 gap-1 max-h-32 overflow-y-auto">
                      {['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟'].map((emoji) => (
                        <button
                          key={emoji}
                          className="text-lg hover:bg-gray-100 rounded p-1"
                          onClick={() => handleEmojiSelect(emoji)}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}

                  {message.trim() || attachments.length > 0 || audioBlob ? (
                    <Button 
                      onClick={audioBlob ? sendAudioMessage : handleSendMessage}
                      className="rounded-full h-8 w-8 p-0 bg-blue-600 hover:bg-blue-700"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className={`h-8 w-8 ${isRecording ? 'bg-red-500 text-white' : ''}`}
                      onClick={handleMicrophoneClick}
                    >
                      <Mic className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Select an Expert</h3>
                <p className="text-gray-500 max-w-sm">
                  Choose an expert from the list to start a conversation.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>


       <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}>
         <AlertDialogContent>
           <AlertDialogHeader>
             <AlertDialogTitle>Delete Message</AlertDialogTitle>
             <AlertDialogDescription>
               {deleteDialog.type === 'me' 
                 ? "Are you sure you want to delete this message? It will only be removed from your view."
                 : "Are you sure you want to delete this message? It will be removed for everyone and cannot be undone."
               }
             </AlertDialogDescription>
           </AlertDialogHeader>
           <AlertDialogFooter>
             <AlertDialogCancel>Cancel</AlertDialogCancel>
             <AlertDialogAction 
               onClick={confirmDelete}
               className="bg-red-600 hover:bg-red-700"
             >
               Delete
             </AlertDialogAction>
           </AlertDialogFooter>
         </AlertDialogContent>
       </AlertDialog>

       {/* Search Modal */}
       <AlertDialog open={showSearchModal} onOpenChange={setShowSearchModal}>
        <AlertDialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
          <AlertDialogHeader>
            <div className="flex items-center justify-between">
              <AlertDialogTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Search Messages
              </AlertDialogTitle>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 rounded-full hover:bg-gray-100"
                onClick={() => setShowSearchModal(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </AlertDialogHeader>
           
           <div className="space-y-4">
             {/* Search Input */}
             <div className="flex gap-2">
               <Input
                 value={messageSearchQuery}
                 onChange={(e) => setMessageSearchQuery(e.target.value)}
                 placeholder="Search messages..."
                 className="flex-1"
                 onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
               />
               <Button onClick={handleSearch} disabled={isSearching || !messageSearchQuery.trim()}>
                 {isSearching ? 'Searching...' : 'Search'}
               </Button>
             </div>

             {/* Search Filters */}
             <div className="flex gap-4 text-sm">
               <Select value={searchFilters.type} onValueChange={(value) => setSearchFilters(prev => ({ ...prev, type: value }))}>
                 <SelectTrigger className="w-32">
                   <SelectValue />
                 </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="all">All Types</SelectItem>
                   <SelectItem value="text">Text</SelectItem>
                   <SelectItem value="image">Images</SelectItem>
                   <SelectItem value="document">Documents</SelectItem>
                   <SelectItem value="audio">Audio</SelectItem>
                 </SelectContent>
               </Select>

               <Select value={searchFilters.sender} onValueChange={(value) => setSearchFilters(prev => ({ ...prev, sender: value }))}>
                 <SelectTrigger className="w-32">
                   <SelectValue />
                 </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="all">All Senders</SelectItem>
                   <SelectItem value="me">My Messages</SelectItem>
                   <SelectItem value="them">Their Messages</SelectItem>
                 </SelectContent>
               </Select>

               <Select value={searchFilters.dateRange} onValueChange={(value) => setSearchFilters(prev => ({ ...prev, dateRange: value }))}>
                 <SelectTrigger className="w-32">
                   <SelectValue />
                 </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="all">All Time</SelectItem>
                   <SelectItem value="today">Today</SelectItem>
                   <SelectItem value="week">This Week</SelectItem>
                   <SelectItem value="month">This Month</SelectItem>
                 </SelectContent>
               </Select>
             </div>

             {/* Search Results */}
             <div className="max-h-96 overflow-y-auto border rounded-lg">
               {searchResults.length > 0 ? (
                 <div className="space-y-2 p-4">
                   {searchResults.map((result) => (
                     <div
                       key={result.id}
                       onClick={() => scrollToMessage(result.id)}
                       className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                     >
                       <div className="flex items-start gap-3">
                         <Avatar className="h-8 w-8">
                           <AvatarImage src={result.sender.avatar} />
                           <AvatarFallback className="bg-blue-500 text-white text-xs">
                             {result.sender.firstName?.[0] || result.sender.username?.[0] || 'U'}
                           </AvatarFallback>
                         </Avatar>
                         <div className="flex-1 min-w-0">
                           <div className="flex items-center gap-2 mb-1">
                             <span className="font-medium text-sm">
                               {result.sender.firstName} {result.sender.lastName} 
                             </span>
                             <span className="text-xs text-gray-500">
                               {new Date(result.createdAt).toLocaleDateString()}
                             </span>
                             {result.messageType !== 'text' && (
                               <Badge variant="secondary" className="text-xs">
                                 {result.messageType}
                               </Badge>
                             )}
                           </div>
                           <p 
                             className="text-sm text-gray-700 truncate"
                             dangerouslySetInnerHTML={{ 
                               __html: highlightSearchTerm(result.content || `${result.messageType} message`, messageSearchQuery) 
                             }}
                           />
                         </div>
                       </div>
                     </div>
                   ))}
                 </div>
               ) : messageSearchQuery && !isSearching ? (
                 <div className="p-8 text-center text-gray-500">
                   <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                   <p>No messages found matching your search.</p>
                 </div>
               ) : !messageSearchQuery ? (
                 <div className="p-8 text-center text-gray-500">
                   <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                   <p>Enter a search term to find messages.</p>
                 </div>
               ) : null}
             </div>
           </div>

           <AlertDialogFooter>
             <AlertDialogCancel>Close</AlertDialogCancel>
           </AlertDialogFooter>
         </AlertDialogContent>
      </AlertDialog>

      <InAppNotificationContainer />

    </div>
  )
}
