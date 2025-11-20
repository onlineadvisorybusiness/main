import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import ExpertDashboard from './components/ExpertDashboard'
import LearnerDashboard from './components/LearnerDashboard'

export default async function DashboardPage({ params }) {
  const { userId } = await auth()
  
  if (!userId) {
    redirect('/auth/sign-in')
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: {
      sessions: {
        orderBy: { createdAt: 'desc' },
        take: 10
      },
      reviews: {
        orderBy: { createdAt: 'desc' },
        take: 10
      },
      learnerBookings: {
        include: {
          session: true,
          expertUser: {
            select: {
              firstName: true,
              lastName: true,
              username: true,
              avatar: true,
              email: true
            }
          }
        },
        orderBy: { date: 'desc' },
        take: 10
      },
      expertBookings: {
        include: {
          session: true,
          learner: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              avatar: true
            }
          }
        },
        orderBy: { date: 'desc' },
        take: 10
      }
    }
  })

  if (!user) {
    redirect('/auth/sign-in')
  }

  const { accountStatus } = await params
  if (!['learner', 'expert'].includes(accountStatus)) {
    redirect('/marketplace')
  }

  if (user.accountStatus !== accountStatus) {
    redirect(`/${user.accountStatus}/dashboard`)
  }

  // Transform bookings into meetings format for dashboard components
  const mapBookingStatus = (bookingStatus) => {
    switch (bookingStatus) {
      case 'pending':
      case 'confirmed':
        return 'scheduled'
      case 'completed':
        return 'completed'
      case 'cancelled':
        return 'cancelled'
      default:
        return 'scheduled'
    }
  }

  const meetings = accountStatus === 'expert' 
    ? user.expertBookings.map(booking => {
        // Use local date parsing to avoid timezone issues
        const bookingDate = new Date(booking.date)
        const bookingDateOnly = new Date(bookingDate.getFullYear(), bookingDate.getMonth(), bookingDate.getDate())
        const [hours, minutes] = booking.startTime.split(':')
        const startDateTime = new Date(bookingDateOnly)
        startDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0)
        
        const [endHours, endMinutes] = booking.endTime.split(':')
        const endDateTime = new Date(bookingDateOnly)
        endDateTime.setHours(parseInt(endHours), parseInt(endMinutes), 0, 0)
        
        return {
          id: booking.id,
          title: booking.session?.eventName || 'Meeting',
          startTime: startDateTime,
          endTime: endDateTime,
          status: mapBookingStatus(booking.status),
          participant: booking.learner,
          amount: booking.amount,
          currency: booking.currency
        }
      })
    : user.learnerBookings.map(booking => {
        // Use local date parsing to avoid timezone issues
        const bookingDate = new Date(booking.date)
        const bookingDateOnly = new Date(bookingDate.getFullYear(), bookingDate.getMonth(), bookingDate.getDate())
        const [hours, minutes] = booking.startTime.split(':')
        const startDateTime = new Date(bookingDateOnly)
        startDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0)
        
        const [endHours, endMinutes] = booking.endTime.split(':')
        const endDateTime = new Date(bookingDateOnly)
        endDateTime.setHours(parseInt(endHours), parseInt(endMinutes), 0, 0)
        
        return {
          id: booking.id,
          title: booking.session?.eventName || 'Meeting',
          startTime: startDateTime,
          endTime: endDateTime,
          status: mapBookingStatus(booking.status),
          participant: booking.expertUser,
          amount: booking.amount,
          currency: booking.currency
        }
      })

  // Add meetings property to user object
  user.meetings = meetings

  const now = new Date()
  // Use local dates to avoid timezone issues
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000)
  
  // Updated filtering logic - use date-only comparison to avoid time issues
  const pastMeetings = meetings.filter(meeting => {
    const meetingDateOnly = new Date(meeting.startTime.getFullYear(), meeting.startTime.getMonth(), meeting.startTime.getDate())
    const isPastDate = meetingDateOnly < today
    const isCompleted = meeting.status === 'completed'
    const notCancelled = meeting.status !== 'cancelled'  // Exclude cancelled meetings from past
    const isPast = (isPastDate || isCompleted) && notCancelled  // Past = (past date OR completed) AND not cancelled
    return isPast
  })
  
  const todayMeetings = meetings.filter(meeting => {
    const meetingDateOnly = new Date(meeting.startTime.getFullYear(), meeting.startTime.getMonth(), meeting.startTime.getDate())
    const isToday = meetingDateOnly.getTime() === today.getTime()
    const notCancelled = meeting.status !== 'cancelled'
    const isPastDate = meetingDateOnly < today
    const isCompleted = meeting.status === 'completed'
    const alreadyPast = (isPastDate || isCompleted) && notCancelled  // Updated to match past logic
    const qualifies = isToday && notCancelled && !alreadyPast
    return qualifies
  })
  
  const upcomingMeetings = meetings.filter(meeting => {
    const meetingDateOnly = new Date(meeting.startTime.getFullYear(), meeting.startTime.getMonth(), meeting.startTime.getDate())
    const isFuture = meetingDateOnly >= tomorrow
    const notCancelled = meeting.status !== 'cancelled'
    const qualifies = isFuture && notCancelled
    return qualifies
  })
  
  const cancelledMeetings = meetings.filter(meeting => {
    const isCancelled = meeting.status === 'cancelled'
    return isCancelled
  })

  return (
    <div className="space-y-6 h-full overflow-auto">
      {accountStatus === 'expert' ? (
        <ExpertDashboard user={user} />
      ) : (
        <LearnerDashboard user={user} />
      )}
    </div>
  )
}

export async function generateMetadata({ params }) {
  const { accountStatus } = await params
  
  const { userId } = await auth()
  let userFirstName = 'User'
  
  if (userId) {
    try {
      const user = await prisma.user.findUnique({
        where: { clerkId: userId },
        select: { firstName: true }
      })
      if (user?.firstName) {
        userFirstName = user.firstName
      }
    } catch (error) {
    }
  }
  
  return {
    title: `${userFirstName} || ${accountStatus.charAt(0).toUpperCase() + accountStatus.slice(1)} Dashboard`,
    description: `Manage your ${accountStatus} account and activities`
  }
}