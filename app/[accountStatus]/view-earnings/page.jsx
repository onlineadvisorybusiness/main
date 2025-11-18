import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CalendarDays, Clock, DollarSign, TrendingUp, Users, Zap } from 'lucide-react'

export default async function ViewEarningsPage({ params }) {
  const { userId } = await auth()
  if (!userId) {
    redirect('/auth/sign-in')
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId }
  })

  if (!user || user.accountStatus !== 'expert') {
    redirect('/auth/sign-in')
  }

  const bookings = await prisma.booking.findMany({
    where: {
      expertId: user.id,
      status: 'completed'
    },
    include: {
      session: true,
      learner: {
        select: {
          firstName: true,
          lastName: true,
          avatar: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  // Calculate earnings metrics for completed sessions only
  const totalEarnings = bookings.reduce((sum, booking) => sum + booking.amount, 0)
  const totalSessions = bookings.length
  
  // More accurate time calculation
  const totalMinutes = bookings.reduce((sum, booking) => {
    const startTime = new Date(`2000-01-01T${booking.startTime}`)
    const endTime = new Date(`2000-01-01T${booking.endTime}`)
    const durationMs = endTime.getTime() - startTime.getTime()
    const durationMinutes = durationMs / (1000 * 60)
    return sum + durationMinutes
  }, 0)
  
  const totalHours = totalMinutes / 60
  
  const averageEarningsPerHour = totalHours > 0 ? totalEarnings / totalHours : 0
  const averageEarningsPerSession = totalSessions > 0 ? totalEarnings / totalSessions : 0

  const recentBookings = bookings.slice(0, 10)

  // Calculate monthly earnings for the last 12 months (more comprehensive)
  const monthlyEarnings = []
  const currentDate = new Date()
  
  for (let i = 11; i >= 0; i--) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
    const monthStart = new Date(date.getFullYear(), date.getMonth(), 1)
    const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0)
    
    const monthBookings = bookings.filter(booking => {
      const bookingDate = new Date(booking.date)
      return bookingDate >= monthStart && bookingDate <= monthEnd
    })
    
    const monthEarnings = monthBookings.reduce((sum, booking) => sum + booking.amount, 0)
    const monthHours = monthBookings.reduce((sum, booking) => {
      const startTime = new Date(`2000-01-01T${booking.startTime}`)
      const endTime = new Date(`2000-01-01T${booking.endTime}`)
      const durationMs = endTime.getTime() - startTime.getTime()
      const durationHours = durationMs / (1000 * 60 * 60)
      return sum + durationHours
    }, 0)
    
    monthlyEarnings.push({
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      monthFull: date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      earnings: monthEarnings,
      sessions: monthBookings.length,
      hours: monthHours,
      avgPerHour: monthHours > 0 ? monthEarnings / monthHours : 0
    })
  }


  // Get session performance by category
  const sessionPerformance = {}
  bookings.forEach(booking => {
    booking.session.categories.forEach(category => {
      if (!sessionPerformance[category]) {
        sessionPerformance[category] = { earnings: 0, sessions: 0 }
      }
      sessionPerformance[category].earnings += booking.amount
      sessionPerformance[category].sessions += 1
    })
  })

  const topCategories = Object.entries(sessionPerformance)
    .map(([category, data]) => ({
      category,
      earnings: data.earnings,
      sessions: data.sessions,
      avgEarnings: data.earnings / data.sessions
    }))
    .sort((a, b) => b.earnings - a.earnings)
    .slice(0, 5)

  return (
    <div className="space-y-6 h-full overflow-auto p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Earnings Overview</h1>
          <p className="text-gray-600 mt-2">Track your expert session performance and earnings</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-green-600 border-green-200">
            <TrendingUp className="w-4 h-4 mr-1" />
            Active Expert
          </Badge>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${totalEarnings.toLocaleString()}
            </div>
            <p className="text-xs text-gray-600">
              From {totalSessions} completed sessions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Time Invested</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {totalHours.toFixed(1)}h
            </div>
            <p className="text-xs text-gray-600">
              {totalMinutes.toFixed(0)} minutes total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. per Hour</CardTitle>
            <Zap className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              ${averageEarningsPerHour.toFixed(0)}
            </div>
            <p className="text-xs text-gray-600">
              Hourly rate average
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. per Session</CardTitle>
            <Users className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              ${averageEarningsPerSession.toFixed(0)}
            </div>
            <p className="text-xs text-gray-600">
              Per session average
            </p>
          </CardContent>
        </Card>
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Earnings Chart */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Monthly Earnings Trend</CardTitle>
                <CardDescription>Your earnings over the last 12 months</CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-blue-600">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Auto-updating
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Simple Bar Chart */}
            <div className="h-[320px] w-full relative bg-gray-50 rounded-lg p-6">
              {/* Chart Title */}
              <div className="text-sm font-medium text-gray-700 mb-6">Monthly Earnings</div>
              
              {/* Chart Area */}
              <div className="h-[220px] relative">
                {/* Y-axis labels */}
                <div className="absolute left-0 top-0 h-full w-16 flex flex-col justify-between">
                  {(() => {
                    const maxEarnings = Math.max(...monthlyEarnings.map(m => m.earnings))
                    const steps = 4
                    const stepValue = maxEarnings > 0 ? maxEarnings / steps : 100
                    
                    return Array.from({ length: steps + 1 }, (_, i) => {
                      const value = stepValue * (steps - i)
                      return (
                        <div key={i} className="text-xs text-gray-500 text-right pr-2 flex items-center justify-end h-0">
                          ${value.toLocaleString()}
                        </div>
                      )
                    })
                  })()}
                </div>
                
                {/* Chart Bars */}
                <div className="ml-16 h-full flex items-end justify-between gap-1">
                  {monthlyEarnings.map((month, index) => {
                    const maxEarnings = Math.max(...monthlyEarnings.map(m => m.earnings))
                    const height = maxEarnings > 0 ? (month.earnings / maxEarnings) * 200 : 0
                    
                    return (
                      <div key={index} className="flex flex-col items-center group relative flex-1 max-w-[40px]">
                        {/* Bar */}
                        <div 
                          className="bg-gradient-to-t from-green-500 to-green-400 rounded-t-md w-full transition-all duration-300 hover:from-green-600 hover:to-green-500 cursor-pointer min-h-[2px]"
                          style={{ height: `${height}px` }}
                          title={`${month.monthFull}: $${month.earnings.toLocaleString()}`}
                        />
                        
                        {/* Tooltip */}
                        <div className="absolute bottom-full mb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white p-3 border rounded-lg shadow-lg z-10 min-w-[160px] pointer-events-none">
                          <div className="text-sm font-semibold text-gray-900">{month.monthFull}</div>
                          <div className="text-green-600 font-medium">${month.earnings.toLocaleString()}</div>
                          <div className="text-blue-600 text-xs">{month.sessions} sessions</div>
                          <div className="text-purple-600 text-xs">{month.hours.toFixed(1)}h</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
                
                {/* Month Labels - Below the chart area */}
                <div className="ml-16 mt-2 flex justify-between gap-1">
                  {monthlyEarnings.map((month, index) => (
                    <div key={index} className="flex-1 max-w-[40px] text-center">
                      <div className="text-xs text-gray-600 font-medium whitespace-nowrap">
                        {month.month}
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Grid lines */}
                <div className="absolute inset-0 ml-16">
                  {Array.from({ length: 5 }, (_, i) => (
                    <div 
                      key={i} 
                      className="absolute w-full border-t border-gray-200"
                      style={{ top: `${i * 20}%` }}
                    />
                  ))}
                </div>
                
                {/* Y-axis line */}
                <div className="absolute left-16 top-0 bottom-0 w-px bg-gray-300"></div>
                
                {/* X-axis line */}
                <div className="absolute left-16 right-0 bottom-0 h-px bg-gray-300"></div>
              </div>
            </div>
            
            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
              <div className="text-center">
                <div className="text-lg font-semibold text-green-600">
                  ${monthlyEarnings.reduce((sum, month) => sum + month.earnings, 0).toLocaleString()}
                </div>
                <div className="text-xs text-gray-600">Total (12 months)</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-blue-600">
                  {monthlyEarnings.reduce((sum, month) => sum + month.sessions, 0)}
                </div>
                <div className="text-xs text-gray-600">Total Sessions</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-purple-600">
                  {monthlyEarnings.reduce((sum, month) => sum + month.hours, 0).toFixed(1)}h
                </div>
                <div className="text-xs text-gray-600">Total Hours</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Categories */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Categories</CardTitle>
            <CardDescription>Your highest earning session categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topCategories.length > 0 ? (
                topCategories.map((category, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Badge variant="secondary" className="capitalize">
                        {category.category}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold">${category.earnings.toLocaleString()}</div>
                      <div className="text-xs text-gray-600">{category.sessions} sessions</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-sm font-medium text-gray-600 mb-2">No categories yet</p>
                  <p className="text-xs text-gray-500">
                    Categories will appear here once you complete sessions with different types
                  </p>
                  
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Bookings */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Completed Sessions</CardTitle>
          <CardDescription>Your latest completed earning sessions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentBookings.length > 0 ? (
              recentBookings.map((booking, index) => {
                const durationMs = new Date(`2000-01-01T${booking.endTime}`).getTime() - new Date(`2000-01-01T${booking.startTime}`).getTime()
                const durationMinutes = durationMs / (1000 * 60)
                
                return (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        {booking.learner.avatar ? (
                          <img 
                            src={booking.learner.avatar} 
                            alt={`${booking.learner.firstName} ${booking.learner.lastName}`}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-sm font-medium text-gray-600">
                            {booking.learner.firstName?.[0]}{booking.learner.lastName?.[0]}
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="font-medium">
                          {booking.learner.firstName} {booking.learner.lastName}
                        </div>
                        <div className="text-sm text-gray-600">
                          {booking.session.eventName}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(booking.date).toLocaleDateString()} • {booking.startTime} - {booking.endTime} ({durationMinutes}min)
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-lg font-semibold text-green-600">
                        <DollarSign className="h-4 w-4 text-green-600 mt-1" /> {booking.amount.toLocaleString()}
                      </div>
                      <Badge variant="default" className="mt-1">
                        Completed
                      </Badge>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="text-center py-8 text-gray-500">
                <CalendarDays className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No completed sessions yet</p>
                <p className="text-sm">Your earnings will appear here once you complete sessions</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}