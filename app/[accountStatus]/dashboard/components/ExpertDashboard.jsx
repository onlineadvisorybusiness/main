'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Calendar, Users, DollarSign, TrendingUp, Clock, FileText, Download } from 'lucide-react'

export default function ExpertDashboard({ user }) {
  const [sessionsChartPeriod, setSessionsChartPeriod] = useState('7')

  const downloadCSV = (data, filename) => {
    const csvContent = convertToCSV(data)
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const downloadExcel = (data, filename) => {

    const csvContent = convertToCSV(data)
    const blob = new Blob([csvContent], { type: 'application/vnd.ms-excel;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const convertToCSV = (data) => {
    if (!data || data.length === 0) return ''
    
    const headers = Object.keys(data[0])
    const csvHeaders = headers.join(',')
    const csvRows = data.map(row => 
      headers.map(header => {
        const value = row[header]
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`
        }
        return value
      }).join(',')
    )
    
    return [csvHeaders, ...csvRows].join('\n')
  }

  const handleExportData = (format) => {
    const exportData = {
      sessions: sessionsChartData,
      todaysSessions: todaysSessionsData,
      summary: {
        totalEarnings: totalEarnings,
        past7DaysEarnings: past7DaysEarnings,
        totalSessions: pastMeetings.length + upcomingMeetings.length + todayMeetings.length + cancelledMeetings.length,
        upcomingSessions: upcomingMeetings.length,
        todaySessions: todayMeetings.length,
        pastSessions: pastMeetings.length,
        cancelledSessions: cancelledMeetings.length
      }
    }

    const timestamp = new Date().toISOString().split('T')[0]
    const filename = `expert-dashboard-data-${timestamp}.${format}`
    
    if (format === 'csv') {
      downloadCSV([exportData.summary], filename)
    } else if (format === 'xls') {
      downloadExcel([exportData.summary], filename)
    }
  }
  
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)

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

  const cancelledMeetings = user.meetings?.filter(meeting => 
    meeting.status === 'cancelled'
  ) || []

  const completedMeetings = pastMeetings

  const past7DaysMeetings = user.meetings?.filter(meeting => {
    const meetingDate = new Date(meeting.startTime)
    return meetingDate >= sevenDaysAgo && meetingDate < today && meeting.status === 'completed'
  }) || []

  const totalEarnings = completedMeetings.reduce((sum, meeting) => sum + (meeting.amount || 0), 0)
  const past7DaysEarnings = past7DaysMeetings.reduce((sum, meeting) => sum + (meeting.amount || 0), 0)

  const generateSessionsChartData = (period) => {
    const days = parseInt(period)
    const data = []
    
    const meetingsByPeriod = {}
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000)
      let periodKey
      
      if (period === '365') {
        if (i % 30 === 0) {
          periodKey = date.toLocaleDateString('en-US', { month: 'short' })
        }
      } else if (period === '90') {
        if (i % 7 === 0) {
          periodKey = `Week ${Math.floor((days - i) / 7) + 1}`
        }
      } else {
        periodKey = date.toLocaleDateString('en-US', { weekday: 'short' })
      }
      
      if (periodKey && !meetingsByPeriod[periodKey]) {
        meetingsByPeriod[periodKey] = { earnings: 0, sessions: 0 }
      }
    }
    
    completedMeetings.forEach(meeting => {
      const meetingDate = new Date(meeting.startTime)
      let periodKey
      
      if (period === '365') {
        periodKey = meetingDate.toLocaleDateString('en-US', { month: 'short' })
      } else if (period === '90') {
        const weekNumber = Math.floor((today - meetingDate) / (7 * 24 * 60 * 60 * 1000)) + 1
        periodKey = `Week ${weekNumber}`
      } else {
        periodKey = meetingDate.toLocaleDateString('en-US', { weekday: 'short' })
      }
      
      if (meetingsByPeriod[periodKey]) {
        meetingsByPeriod[periodKey].earnings += meeting.amount || 0
        meetingsByPeriod[periodKey].sessions += 1
      }
    })
    
    Object.entries(meetingsByPeriod).forEach(([period, stats]) => {
      data.push({
        period,
        earnings: stats.earnings,
        sessions: stats.sessions
      })
    })
    
    return data
  }

  const sessionsChartData = generateSessionsChartData(sessionsChartPeriod)
  

  const todaysSessionsData = todayMeetings.map(meeting => {
    const learnerName = `${meeting.participant?.firstName || ''} ${meeting.participant?.lastName || ''}`.trim()
    const learnerInitials = learnerName ? learnerName.split(' ').map(n => n[0]).join('') : 'L'
    
    return {
      id: meeting.id,
      title: meeting.title,
      time: new Date(meeting.startTime).toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      }),
      learnerName: learnerName || 'Unknown Learner',
      learnerEmail: meeting.participant?.email || 'No email',
      learnerAvatar: meeting.participant?.avatar || null,
      learnerInitials: learnerInitials,
      earnings: meeting.amount || 0,
      currency: meeting.currency || 'USD'
    } 
  })


  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user.firstName || 'Expert '}!
          </h1>
          <p className="text-gray-600 mt-1 text-sm">
            Here's what's happening with your advisory business today.
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => handleExportData('csv')}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          <Button 
            variant="outline" 
            onClick={() => handleExportData('xls')}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export Excel
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pastMeetings.length + upcomingMeetings.length + todayMeetings.length + cancelledMeetings.length}</div>
            <p className="text-xs text-muted-foreground">
              All time sessions
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
              Scheduled sessions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today Sessions</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayMeetings.length}</div>
            <p className="text-xs text-muted-foreground">
              Sessions today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Past Sessions</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
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
            <CardTitle className="text-sm font-medium">Cancelled Sessions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cancelledMeetings.length}</div>
            <p className="text-xs text-muted-foreground">
              Cancelled sessions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalEarnings}</div>
            <p className="text-xs text-muted-foreground">
              All time earnings
            </p>
          </CardContent>
        </Card>

      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Today's Sessions with Learners
            </CardTitle>
            <CardDescription>
              Your scheduled sessions for today with learner details
            </CardDescription>
          </CardHeader>
          <CardContent>
            {todaysSessionsData.length > 0 ? (
              <div className="max-h-96 overflow-y-auto space-y-4 pr-2">
                {todaysSessionsData.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={session.learnerAvatar} alt={session.learnerName} />
                        <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold">
                          {session.learnerInitials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium text-gray-900">{session.title}</h4>
                        <p className="text-sm text-gray-600">{session.learnerName}</p>
                        <p className="text-xs text-gray-500">{session.learnerEmail}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{session.time}</p>
                      <p className="flex items-center gap-1 text-sm text-green-600 font-medium">
                        <DollarSign className="h-3 w-3 text-green-600 mt-1" /> {session.earnings?.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No sessions scheduled for today</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
