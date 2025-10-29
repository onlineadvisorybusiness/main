'use client'

import { usePathname } from 'next/navigation'

export default function DynamicHeader() {
  const pathname = usePathname()
  
  const getPageName = (path) => {
    const segments = path.split('/').filter(Boolean)
    
    if (segments.length >= 2) {
      const page = segments[1] // Get the page after accountStatus
      switch (page) {
        case 'dashboard':
          return 'Dashboard'
        case 'sessions':
          return 'Sessions'
        case 'availability':
          return 'Availability'
        case 'meetings':
          return 'Meetings'
        case 'earnings':
          return 'Earnings'
        case 'chat-expert':
          return 'Chat with Expert'
        case 'chat-learner':
          return 'Chat with Learner'
        case 'settings':
          return 'Account Settings'
        case 'transactions':
          return 'Billing & Transactions'
        case 'notifications':
          return 'Notifications'
        case 'help':
          return 'Help & Support'
        case 'feedback':
          return 'Feedback'
        case 'integrations':
          return 'Integrations'
        case 'view-earnings':
          return 'View Earnings'
        default:
          return 'Dashboard'
      }
    }
    return 'Dashboard'
  }

  const currentPageName = getPageName(pathname)

  return (
    <h1 className="text-lg font-semibold">
      {currentPageName}
    </h1>
  )
}
