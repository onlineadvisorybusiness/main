'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { DollarSign, TrendingUp } from 'lucide-react'

export function EarningsCharts({ bookings }) {
  const [earningsChartPeriod, setEarningsChartPeriod] = useState('7')
  const [trendChartPeriod, setTrendChartPeriod] = useState('7')

  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  
  const completedBookings = bookings.filter(booking => booking.status === 'completed')

  const generateEarningsChartData = (period) => {
    const days = parseInt(period)
    const data = []
    const bookingsByPeriod = {}
    
    // Initialize periods with zero values
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
      
      if (periodKey && !bookingsByPeriod[periodKey]) {
        bookingsByPeriod[periodKey] = { earnings: 0, sessions: 0 }
      }
    }
    
    // Count actual bookings and calculate earnings
    completedBookings.forEach(booking => {
      const bookingDate = new Date(booking.date)
      let periodKey
      
      if (period === '365') {
        periodKey = bookingDate.toLocaleDateString('en-US', { month: 'short' })
      } else if (period === '90') {
        const weekNumber = Math.floor((today - bookingDate) / (7 * 24 * 60 * 60 * 1000)) + 1
        periodKey = `Week ${weekNumber}`
      } else {
        periodKey = bookingDate.toLocaleDateString('en-US', { weekday: 'short' })
      }
      
      if (bookingsByPeriod[periodKey]) {
        bookingsByPeriod[periodKey].earnings += booking.amount || 0
        bookingsByPeriod[periodKey].sessions += 1
      }
    })
    
    // Convert to array format
    Object.entries(bookingsByPeriod).forEach(([period, stats]) => {
      data.push({
        period,
        earnings: stats.earnings,
        sessions: stats.sessions
      })
    })
    
    return data
  }

  const generateTrendChartData = (period) => {
    const days = parseInt(period)
    const data = []
    const bookingsByPeriod = {}
    
    // Initialize periods with zero values
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
      
      if (periodKey && !bookingsByPeriod[periodKey]) {
        bookingsByPeriod[periodKey] = { earnings: 0, sessions: 0 }
      }
    }
    
    // Count actual bookings and calculate earnings
    completedBookings.forEach(booking => {
      const bookingDate = new Date(booking.date)
      let periodKey
      
      if (period === '365') {
        periodKey = bookingDate.toLocaleDateString('en-US', { month: 'short' })
      } else if (period === '90') {
        const weekNumber = Math.floor((today - bookingDate) / (7 * 24 * 60 * 60 * 1000)) + 1
        periodKey = `Week ${weekNumber}`
      } else {
        periodKey = bookingDate.toLocaleDateString('en-US', { weekday: 'short' })
      }
      
      if (bookingsByPeriod[periodKey]) {
        bookingsByPeriod[periodKey].earnings += booking.amount || 0
        bookingsByPeriod[periodKey].sessions += 1
      }
    })
    
    // Convert to array format
    Object.entries(bookingsByPeriod).forEach(([period, stats]) => {
      data.push({
        period,
        earnings: stats.earnings,
        sessions: stats.sessions
      })
    })
    
    return data
  }

  const earningsChartData = generateEarningsChartData(earningsChartPeriod)
  const trendChartData = generateTrendChartData(trendChartPeriod)

  const DayFilter = ({ selectedPeriod, setSelectedPeriod }) => (
    <div className="flex gap-2 mb-4">
      {[
        { value: '7', label: '7 Days' },
        { value: '14', label: '14 Days' },
        { value: '28', label: '28 Days' },
        { value: '90', label: '90 Days' },
        { value: '365', label: '365 Days' }
      ].map((option) => (
        <Button
          key={option.value}
          variant={selectedPeriod === option.value ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedPeriod(option.value)}
          className={selectedPeriod === option.value ? 'bg-gray-800 hover:bg-gray-700' : ''}
        >
          {option.label}
        </Button>
      ))}
    </div>
  )

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Earnings Overview
          </CardTitle>
          <CardDescription>
            Earnings from completed sessions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DayFilter selectedPeriod={earningsChartPeriod} setSelectedPeriod={setEarningsChartPeriod} />
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={earningsChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="period" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                formatter={(value, name) => [`$${value}`, name === 'earnings' ? 'Earnings' : 'Sessions']}
                labelStyle={{ color: '#374151' }}
                contentStyle={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb' }}
              />
              <Bar dataKey="earnings" fill="#374151" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Earnings Trend
          </CardTitle>
          <CardDescription>
            Earnings trend over selected period
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DayFilter selectedPeriod={trendChartPeriod} setSelectedPeriod={setTrendChartPeriod} />
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="period" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip 
                formatter={(value) => [`$${value}`, 'Earnings']}
                labelStyle={{ color: '#374151' }}
                contentStyle={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb' }}
              />
              <Line 
                type="monotone" 
                dataKey="earnings" 
                stroke="#374151" 
                strokeWidth={3}
                dot={{ fill: '#374151', strokeWidth: 2, r: 6 }}
                activeDot={{ r: 8, fill: '#374151' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}

