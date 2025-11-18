'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Calendar, BookOpen, Clock, Users, XCircle, DollarSign, Star, TrendingUp } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function LearnerDashboard({ user }) {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  const pastMeetings = user.meetings?.filter(meeting => {
    const meetingDateOnly = new Date(meeting.startTime.getFullYear(), meeting.startTime.getMonth(), meeting.startTime.getDate())
    const isPastDate = meetingDateOnly < today
    const isCompleted = meeting.status === 'completed'
    const notCancelled = meeting.status !== 'cancelled'
    return (isPastDate || isCompleted) && notCancelled
  }) || []

  const todayMeetings = user.meetings?.filter(meeting => {
    const meetingDateOnly = new Date(meeting.startTime.getFullYear(), meeting.startTime.getMonth(), meeting.startTime.getDate())
    const isToday = meetingDateOnly.getTime() === today.getTime()
    const notCancelled = meeting.status !== 'cancelled'
    const isPastDate = meetingDateOnly < today
    const isCompleted = meeting.status === 'completed'
    const alreadyPast = (isPastDate || isCompleted) && notCancelled
    return isToday && notCancelled && !alreadyPast
  }) || []

  const upcomingMeetings = user.meetings?.filter(meeting => {
    const meetingDateOnly = new Date(meeting.startTime.getFullYear(), meeting.startTime.getMonth(), meeting.startTime.getDate())
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000)
    const isFuture = meetingDateOnly >= tomorrow
    return isFuture && meeting.status !== 'cancelled'
  }) || []

  const calculateDuration = (startTime, endTime) => {
    try {
      const start = new Date(`2000-01-01T${startTime}:00`)
      const end = new Date(`2000-01-01T${endTime}:00`)
      const diffMs = end.getTime() - start.getTime()
      const diffMinutes = Math.round(diffMs / (1000 * 60))
      return diffMinutes
    } catch (error) {
      return 60 // Default to 60 minutes if calculation fails
    }
  }

  const cancelledMeetings = user.meetings?.filter(meeting => 
    meeting.status === 'cancelled'
  ) || []

  const completedMeetings = pastMeetings

  const totalSpent = pastMeetings.reduce((total, meeting) => {
    return total + (meeting.amount || 0)
  }, 0)

  const generateChartData = () => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    
    // Get last 6 months including current month
    const chartData = []
    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12
      const year = currentMonth - i < 0 ? currentYear - 1 : currentYear
      
      // Filter meetings for this specific month/year
      const monthMeetings = (user.meetings || []).filter(meeting => {
        const meetingDate = new Date(meeting.startTime)
        return meetingDate.getMonth() === monthIndex && meetingDate.getFullYear() === year
      })
      
      // Calculate sessions and investment for this month
      const sessionsCount = monthMeetings.filter(meeting => meeting.status === 'completed').length
      const monthlyInvestment = monthMeetings
        .filter(meeting => meeting.status === 'completed')
        .reduce((total, meeting) => total + (meeting.amount || 0), 0)
      
      chartData.push({
        month: monthNames[monthIndex],
        sessions: sessionsCount,
        investment: monthlyInvestment
      })
    }
    
    return chartData
  }
  
  const learningProgressData = generateChartData()

  return (
    <div className="space-y-6 max-w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user.firstName || 'Learner'}!
          </h1>
          <p className="text-gray-600 mt-1">
            Continue your learning journey with expert guidance.
          </p>
        </div>
        <Badge variant="secondary" className="text-sm">
          Learner Account
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

      <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pastMeetings.length + todayMeetings.length + upcomingMeetings.length + cancelledMeetings.length}</div>
            <p className="text-xs text-muted-foreground">
              All sessions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Sessions</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pastMeetings.length}</div>
            <p className="text-xs text-muted-foreground">
              Completed sessions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Sessions</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingMeetings.length}</div>
            <p className="text-xs text-muted-foreground">
              Future sessions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Investment</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalSpent}</div>
            <p className="text-xs text-muted-foreground">
              Learning investment
            </p>
          </CardContent>
        </Card>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Upcoming Sessions
            </CardTitle>
            <CardDescription>
              Your scheduled learning sessions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingMeetings.length > 0 ? (
              <div className="space-y-4">
                {upcomingMeetings.map((meeting) => {
                  const duration = calculateDuration(
                    meeting.startTime.toTimeString().slice(0, 5), 
                    meeting.endTime.toTimeString().slice(0, 5)
                  )
                  const expertName = `${meeting.participant?.firstName || ''} ${meeting.participant?.lastName || ''}`.trim()
                  const expertInitials = expertName ? expertName.split(' ').map(n => n[0]).join('') : 'EX'
                  
                  return (
                    <div key={meeting.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-3 flex-1">
                        {/* Expert Avatar */}
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={meeting.participant?.avatar} alt={expertName} />
                          <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold">
                            {expertInitials}
                          </AvatarFallback>
                        </Avatar>
                        
                        {/* Session Details */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-slate-900 truncate">
                            {meeting.title}
                          </h4>
                          <p className="text-sm text-slate-600 font-medium">
                            {expertName}
                          </p>
                          <p className="text-xs text-slate-500 truncate">
                            {meeting.participant?.email || 'No email'}
                          </p>
                          <p className="text-xs text-slate-500">
                            {meeting.startTime.toLocaleDateString()} at {meeting.startTime.toTimeString().slice(0, 5)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right space-y-1">
                        <div className="text-sm font-semibold text-slate-900">
                          {duration} min
                        </div>
                        <div className="flex items-center gap-1 text-sm font-bold text-emerald-600">
                          <DollarSign className="h-3 w-3 text-emerald-600 mt-1" /> {meeting.amount?.toFixed(2)}
                        </div>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${
                            meeting.status === 'scheduled' ? 'border-green-200 text-green-700 bg-green-50' :
                            'border-slate-200 text-slate-700 bg-slate-50'
                          }`}
                        >
                          {meeting.status === 'scheduled' ? 'Confirmed' : meeting.status}
                        </Badge>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No upcoming sessions scheduled</p>
                <Button className="mt-4" size="sm">
                  Book a Session
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Growth Progress
            </CardTitle>
            <CardDescription>
              Your growth journey over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={learningProgressData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'sessions' ? `${value} sessions` : `$${value}`,
                    name === 'sessions' ? 'Sessions' : 'Investment'
                  ]}
                />
                <Area 
                  type="monotone" 
                  dataKey="sessions" 
                  stackId="1"
                  stroke="#8884d8" 
                  fill="#8884d8" 
                  fillOpacity={0.6}
                />
                <Area 
                  type="monotone" 
                  dataKey="investment" 
                  stackId="2"
                  stroke="#82ca9d" 
                  fill="#82ca9d" 
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

      </div>

    </div>
  )
}
