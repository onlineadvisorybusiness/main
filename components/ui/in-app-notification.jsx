'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from './avatar'
import { cn } from '@/lib/utils'

const notifications = []
const listeners = []
const notificationKeys = new Set() // Track notification keys to prevent duplicates

function dispatch(action) {
  switch (action.type) {
    case 'ADD_NOTIFICATION':
      notifications.push(action.notification)
      if (action.notification.key) {
        notificationKeys.add(action.notification.key)
      }
      break
    case 'REMOVE_NOTIFICATION':
      const index = notifications.findIndex(n => n.id === action.id)
      if (index > -1) {
        const notification = notifications[index]
        if (notification.key) {
          notificationKeys.delete(notification.key)
        }
        notifications.splice(index, 1)
      }
      break
  }

  const currentNotifications = [...notifications]
  listeners.forEach(listener => {
    try {
      listener(currentNotifications)
    } catch (error) {
    }
  })
}

export function showInAppNotification({ title, description, avatar, id, messageId }) {
  const notificationKey = messageId 
    ? `message-${messageId}` 
    : `notification-${title}-${description}`
  
  // Check if this notification already exists
  if (notificationKeys.has(notificationKey)) {  
    return null
  }
  
  const notificationId = id || `notification-${Date.now()}-${Math.random()}`
  
  const notification = {
    id: notificationId,
    key: notificationKey,
    title,
    description,
    avatar,
    timestamp: Date.now(),
    messageId
  }
  
  notifications.push(notification)
  notificationKeys.add(notificationKey)
  
  const currentNotifications = [...notifications]
  listeners.forEach(listener => {
    try {
      listener(currentNotifications)
    } catch (error) {
    }
  })
  
  setTimeout(() => {
    const index = notifications.findIndex(n => n.id === notificationId)
    if (index > -1) {
      const removed = notifications[index]
      if (removed.key) {
        notificationKeys.delete(removed.key)
      }
      notifications.splice(index, 1)
      
      const updatedNotifications = [...notifications]
      listeners.forEach(listener => {
        try {
          listener(updatedNotifications)
        } catch (error) {
        }
      })
    }
  }, 5000)

  return notificationId
}

export function InAppNotificationContainer() {
  const [notificationList, setNotificationList] = useState(() => {
    return [...notifications]
  })

  useEffect(() => {
    
    const listener = (newList) => {
      setNotificationList([...newList])
    }
    listeners.push(listener)
    
    const currentNotifications = [...notifications]
    if (currentNotifications.length > 0) {
      setNotificationList(currentNotifications)
      listeners.forEach(l => {
        try {
          l(currentNotifications)
        } catch (e) {
        }
      })
    } else {
      setNotificationList([])
    }
    
    return () => {
      const index = listeners.indexOf(listener)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [])

  useEffect(() => {
  }, [notificationList])

  const removeNotification = (id) => {
    dispatch({
      type: 'REMOVE_NOTIFICATION',
      id
    })
  }

  if (notificationList.length === 0) {
    return null
  }

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm">
      {notificationList.map((notification) => (
        <div
          key={notification.id}
          className={cn(
            "bg-background border border-border rounded-lg shadow-lg p-4",
            "flex items-start gap-3 animate-in slide-in-from-right",
            "hover:shadow-xl transition-shadow"
          )}
        >
          {notification.avatar && (
            <Avatar className="h-10 w-10 flex-shrink-0">
              <AvatarImage src={notification.avatar} alt={notification.title} />
              <AvatarFallback>
                {notification.title?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-foreground truncate">
              {notification.title}
            </p>
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {notification.description}
            </p>
          </div>
          <button
            onClick={() => removeNotification(notification.id)}
            className="flex-shrink-0 rounded-sm opacity-70 hover:opacity-100 transition-opacity"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  )
}

