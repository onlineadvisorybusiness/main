'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import { 
  Calendar, 
  Clock, 
  User, 
  Mail, 
  Video, 
  Trash2, 
  CheckCircle,
  AlertCircle,
  Users,
  Tag,
  Loader2
} from 'lucide-react'

function LearnerMeetings() {
  const { user } = useUser()
  const [meetings, setMeetings] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("today")
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [meetingToCancel, setMeetingToCancel] = useState(null)
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    if (user) {
      fetchMeetings()
    }
  }, [user])

  const fetchMeetings = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/meetings/learner')
      if (response.ok) {
        const data = await response.json()
        setMeetings(data.meetings || [])
      }
    } catch (error) {
    } finally {
      setLoading(false)
    }
  }

  const getMeetingsByStatus = (status) => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000)

    return meetings.filter(meeting => {
      const bookingDate = new Date(meeting.date)
      const bookingDateOnly = new Date(bookingDate.getFullYear(), bookingDate.getMonth(), bookingDate.getDate())
      const [hours, minutes] = meeting.startTime.split(':')
      const meetingDateTime = new Date(bookingDateOnly)
      meetingDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0)
      
      const meetingDateOnly = new Date(meetingDateTime.getFullYear(), meetingDateTime.getMonth(), meetingDateTime.getDate())
      
      switch (status) {
        case 'today':
          const isToday = meetingDateOnly.getTime() === today.getTime()
          const notCancelled = meeting.status !== 'cancelled'
          const isPastDate = meetingDateOnly < today
          const isCompleted = meeting.status === 'completed'
          const alreadyPast = (isPastDate || isCompleted) && notCancelled
          return isToday && notCancelled && !alreadyPast
        case 'upcoming':
          const isFuture = meetingDateOnly >= tomorrow
          return isFuture && meeting.status !== 'cancelled'
        case 'past':
          // Past = (past date OR completed) AND not cancelled
          const isPastDate2 = meetingDateOnly < today
          const isCompleted2 = meeting.status === 'completed'
          const notCancelled2 = meeting.status !== 'cancelled'
          return (isPastDate2 || isCompleted2) && notCancelled2
        case 'cancelled':
          return meeting.status === 'cancelled'
        default:
          return false
      }
    })
  }

  const handleJoinMeeting = (meetingLink) => {
    if (meetingLink) {
      // Ensure the link has proper protocol
      let link = meetingLink
      if (!link.startsWith('http://') && !link.startsWith('https://')) {
        link = 'https://' + link
      }
      window.open(link, '_blank')
    } else {
      alert('Meeting link not available')
    }
  }

  const handleCancelMeeting = (meeting) => {
    setMeetingToCancel(meeting)
    setCancelDialogOpen(true)
  }

  const confirmCancelMeeting = async () => {
    if (!meetingToCancel) return

    setCancelling(true)
    try {
      const response = await fetch(`/api/meetings/${meetingToCancel.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'cancelled' })
      })

      if (response.ok) {
        toast.success('Meeting cancelled successfully', {
          description: 'The meeting has been cancelled and removed from calendars.'
        })
        await fetchMeetings() // Refresh meetings
        setActiveTab('cancelled') // Switch to cancelled tab
      } else {
        const errorData = await response.json()
        toast.error('Failed to cancel meeting', {
          description: errorData.error || 'Please try again.'
        })
      }
    } catch (error) {
      toast.error('Error cancelling meeting', {
        description: 'Please try again later.'
      })
    } finally {
      setCancelling(false)
      setCancelDialogOpen(false)
      setMeetingToCancel(null)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'pending':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />
      case 'cancelled':
        return <Trash2 className="w-4 h-4 text-red-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 hover:bg-green-200'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
      case 'cancelled':
        return 'bg-red-100 text-red-800 hover:bg-red-200'
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200'
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        
        <div className="mb-6">
          <Skeleton className="h-10 w-full" />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[...Array(4)].map((_, index) => (
            <Card key={index} className="hover:shadow-lg transition-all duration-200">
              <CardContent className="p-6">
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-4" />
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-4" />
                      <Skeleton className="h-4 w-12" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-4" />
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-4" />
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-4" />
                      <Skeleton className="h-4 w-12" />
                      <Skeleton className="h-4 w-28" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-4" />
                      <Skeleton className="h-4 w-12" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3 pt-4 border-t">
                  <Skeleton className="h-9 flex-1" />
                  <Skeleton className="h-9 flex-1" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Meetings</h1>
        <p className="text-gray-600">Manage your scheduled meetings and sessions</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="today" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Today's Meetings
          </TabsTrigger>
          <TabsTrigger value="upcoming" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Upcoming
          </TabsTrigger>
          <TabsTrigger value="past" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Past Meetings
          </TabsTrigger>
          <TabsTrigger value="cancelled" className="flex items-center gap-2">
            <Trash2 className="w-4 h-4" />
            Cancelled
          </TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {getMeetingsByStatus('today').length > 0 ? (
              getMeetingsByStatus('today').map((meeting) => (
                <LearnerMeetingCard
                  key={meeting.id}
                  meeting={meeting}
                  onJoinMeeting={handleJoinMeeting}
                  onCancelMeeting={handleCancelMeeting}
                  formatDate={formatDate}
                  formatTime={formatTime}
                  getStatusIcon={getStatusIcon}
                  getStatusColor={getStatusColor}
                />
              ))
            ) : (
              <div className="col-span-full">
                <Card>
                  <CardContent className="p-8 text-center">
                    <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No meetings today</h3>
                    <p className="text-gray-600">You don't have any meetings scheduled for today.</p>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="upcoming" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {getMeetingsByStatus('upcoming').length > 0 ? (
              getMeetingsByStatus('upcoming').map((meeting) => (
                <LearnerMeetingCard
                  key={meeting.id}
                  meeting={meeting}
                  onJoinMeeting={handleJoinMeeting}
                  onCancelMeeting={handleCancelMeeting}
                  formatDate={formatDate}
                  formatTime={formatTime}
                  getStatusIcon={getStatusIcon}
                  getStatusColor={getStatusColor}
                />
              ))
            ) : (
              <div className="col-span-full">
                <Card>
                  <CardContent className="p-8 text-center">
                    <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No upcoming meetings</h3>
                    <p className="text-gray-600">You don't have any upcoming meetings scheduled.</p>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="past" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {getMeetingsByStatus('past').length > 0 ? (
              getMeetingsByStatus('past').map((meeting) => (
                <LearnerMeetingCard
                  key={meeting.id}
                  meeting={meeting}
                  onJoinMeeting={handleJoinMeeting}
                  onCancelMeeting={handleCancelMeeting}
                  formatDate={formatDate}
                  formatTime={formatTime}
                  getStatusIcon={getStatusIcon}
                  getStatusColor={getStatusColor}
                  isPast={true}
                />
              ))
            ) : (
              <div className="col-span-full">
                <Card>
                  <CardContent className="p-8 text-center">
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No past meetings</h3>
                    <p className="text-gray-600">You don't have any past meetings to display.</p>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="cancelled" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {getMeetingsByStatus('cancelled').length > 0 ? (
              getMeetingsByStatus('cancelled').map((meeting) => (
                <LearnerMeetingCard
                  key={meeting.id}
                  meeting={meeting}
                  onJoinMeeting={handleJoinMeeting}
                  onCancelMeeting={handleCancelMeeting}
                  formatDate={formatDate}
                  formatTime={formatTime}
                  getStatusIcon={getStatusIcon}
                  getStatusColor={getStatusColor}
                  isCancelled={true}
                />
              ))
            ) : (
              <div className="col-span-full">
                <Card>
                  <CardContent className="p-8 text-center">
                    <Trash2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No cancelled meetings</h3>
                    <p className="text-gray-600">You don't have any cancelled meetings.</p>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Cancellation Confirmation Dialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Meeting</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this meeting? This action cannot be undone or reactivated.
              <br /><br />
              <strong>Meeting:</strong> {meetingToCancel?.session?.eventName || 'Session'}
              <br />
              <strong>Date:</strong> {meetingToCancel ? formatDate(meetingToCancel.date) : ''}
              <br />
              <strong>Time:</strong> {meetingToCancel ? `${formatTime(meetingToCancel.startTime)} - ${formatTime(meetingToCancel.endTime)}` : ''}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cancelling}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmCancelMeeting}
              disabled={cancelling}
              className="bg-red-600 hover:bg-red-700"
            >
              {cancelling ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Cancelling...
                </>
              ) : (
                'Confirm Cancellation'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// Learner Meeting Card Component - Shows Expert Details
function LearnerMeetingCard({ 
  meeting, 
  onJoinMeeting, 
  onCancelMeeting, 
  formatDate, 
  formatTime, 
  getStatusIcon, 
  getStatusColor,
  isPast = false,
  isCancelled = false
}) {
  return (
    <Card className="hover:shadow-lg hover:bg-gray-50 transition-all duration-200">
      <CardContent className="p-6">
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-lg font-semibold text-gray-900 hover:text-gray-700 transition-colors">
              {meeting.session?.eventName || 'Session'}
            </h3>
            <Badge className={`${getStatusColor(meeting.status)} text-xs transition-colors`}>
              {meeting.status.charAt(0).toUpperCase() + meeting.status.slice(1)}
            </Badge>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">Expert:</span>
              <span className="text-sm font-medium text-gray-900">
                {meeting.expertUser?.firstName && meeting.expertUser?.lastName 
                  ? `${meeting.expertUser.firstName} ${meeting.expertUser.lastName}`
                  : meeting.expertUser?.email || 'N/A'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">Email:</span>
              <span className="text-sm text-gray-900">{meeting.expertUser?.email || 'N/A'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">Category:</span>
              <span className="text-sm text-gray-900">
                {meeting.session?.categories && meeting.session.categories.length > 0 
                  ? meeting.session.categories.map(cat => cat.charAt(0).toUpperCase() + cat.slice(1)).join(', ') 
                  : 'N/A'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Video className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">Platform:</span>
              <span className="text-sm text-gray-900 capitalize">
                {meeting.sessionPlatform === 'zoom' ? 'Zoom' : 
                 meeting.sessionPlatform === 'google_meet' ? 'Google Meet' : 
                 meeting.sessionPlatform}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">Date:</span>
              <span className="text-sm text-gray-900">{formatDate(meeting.date)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">Time:</span>
              <span className="text-sm text-gray-900">{formatTime(meeting.startTime)} - {formatTime(meeting.endTime)}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t">
          {isCancelled ? (
            <Button 
              disabled
              className="flex-1 bg-gray-100 text-gray-500 cursor-not-allowed"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Meeting Cancelled
            </Button>
          ) : isPast ? (
            <Button 
              disabled
              className="flex-1 bg-green-100 text-green-700 cursor-not-allowed"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Meeting Completed
            </Button>
          ) : (
            <>
              {meeting.meetingLink && (
                <Button 
                  onClick={() => onJoinMeeting(meeting.meetingLink)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 cursor-pointer"
                >
                  <Video className="w-4 h-4 mr-2" />
                  Join Meeting
                </Button>
              )}
              <Button 
                onClick={() => onCancelMeeting(meeting)}
                variant="outline"
                className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Cancel Meeting
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default LearnerMeetings
