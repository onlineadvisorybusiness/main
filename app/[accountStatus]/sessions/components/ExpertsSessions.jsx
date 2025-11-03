
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import NextImage from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar, Clock, User, Video, Phone, MapPin, Filter, Search, MoreVertical, ChevronDown, Plus, TrendingUp, Users, CheckCircle, XCircle, AlertCircle, X, Briefcase, MessageSquare, Target, Lightbulb, BookOpen, Zap, ClipboardPenLine, Loader2, DollarSign, Euro, PoundSterling, JapaneseYen, IndianRupee, RussianRuble, BadgeTurkishLira, SwissFranc} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useSearchParams } from 'next/navigation'

export default function ExpertsSessions({ user }) {
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const [filterStatus, setFilterStatus] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [googleCalendarConnected, setGoogleCalendarConnected] = useState(user?.googleCalendarConnected || false)
  const [connectingGoogle, setConnectingGoogle] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [sessions, setSessions] = useState([])
  const [isLoadingSessions, setIsLoadingSessions] = useState(true)
  const [activatingSessionId, setActivatingSessionId] = useState(null)
  const [deactivatingSessionId, setDeactivatingSessionId] = useState(null)
  const [editingSession, setEditingSession] = useState(null)
  const [showEditForm, setShowEditForm] = useState(false)

    // Handle URL parameters for Google Calendar connection
  useEffect(() => {
    const success = searchParams.get('success')
    const error = searchParams.get('error')

    if (success === 'google_calendar_connected') {
      setGoogleCalendarConnected(true)
      toast({
        title: "Google Calendar Connected",
        description: "Your Google Calendar has been successfully connected!",
      })
    } else if (error) {
      let errorMessage = "Failed to connect Google Calendar"
      switch (error) {
        case 'google_auth_failed':
          errorMessage = "Google authentication failed"
          break
        case 'no_auth_code':
          errorMessage = "No authorization code received"
          break
        case 'user_not_found':
          errorMessage = "User not found"
          break
        case 'token_exchange_failed':
          errorMessage = "Failed to exchange authorization code"
          break
        case 'callback_failed':
          errorMessage = "Callback processing failed"
          break
      }
      toast({
        title: "Connection Failed",
        description: errorMessage,
        variant: "destructive"
      })
    }
  }, [searchParams, toast])

  // Handle Google Calendar connection
  const handleConnectGoogleCalendar = async () => {
    try {
      setConnectingGoogle(true)
      
      const response = await fetch('/api/auth/google')
      const data = await response.json()
      
      if (data.success && data.authUrl) {
        // Redirect to Google OAuth
        window.location.href = data.authUrl
      } else {
        throw new Error(data.error || 'Failed to get auth URL')
      }
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Failed to initiate Google Calendar connection",
        variant: "destructive"
      })
    } finally {
      setConnectingGoogle(false)
    }
  }

  const handleDisconnectGoogleCalendar = async () => {
    try {
      setConnectingGoogle(true)
      
      const response = await fetch('/api/auth/google/disconnect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      const data = await response.json()
      
      if (data.success) {
        setGoogleCalendarConnected(false)
        toast({
          title: "Google Calendar Disconnected",
          description: "Your Google Calendar has been successfully disconnected!",
        })
      } else {
        throw new Error(data.error || 'Failed to disconnect Google Calendar')
      }
    } catch (error) {
      toast({
        title: "Disconnection Failed",
        description: "Failed to disconnect Google Calendar",
        variant: "destructive"
      })
    } finally {
      setConnectingGoogle(false)
    }
  }
  
  const [formData, setFormData] = useState({
    eventName: '',
    type: '',
    platform: '',
    categories: [],
    prices: {
      '15': '',
      '30': '',
      '60': ''
    },
    currency: 'USD',
    advicePoints: ['', '', '', '', '', '']
  })

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleCategoryToggle = (category) => {
    setFormData(prev => {
      const currentCategories = prev.categories || []
      if (currentCategories.includes(category)) {
        // Remove category
        return {
          ...prev,
          categories: currentCategories.filter(c => c !== category)
        }
      } else if (currentCategories.length < 4) {
        // Add category (max 4)
        return {
          ...prev,
          categories: [...currentCategories, category]
        }
      }
      return prev   
    })
  }

  const handlePriceChange = (duration, value) => {
    setFormData(prev => ({
      ...prev,
      prices: {
        ...prev.prices,
        [duration]: value
      }
    }))
  }

  const handleAdvicePointChange = (index, value) => {
    setFormData(prev => ({
      ...prev,
      advicePoints: prev.advicePoints.map((point, i) => i === index ? value : point)
    }))
  }

  const fetchSessions = async () => {
    try {
      setIsLoadingSessions(true)
      
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 3000) // 3 second timeout
      
      const response = await fetch('/api/sessions', {
        signal: controller.signal
      })
      const result = await response.json()
      
      clearTimeout(timeoutId)
      
      
      if (response.ok && result.success) {
        setSessions(result.sessions || [])
      } else {
        setSessions([])
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        setSessions([])
      } else {
        setSessions([])
      }
    } finally {
      setIsLoadingSessions(false)
    }
  }

  useEffect(() => {
    fetchSessions()
  }, [])

  const currencies = [
    { code: 'USD', name: 'US Dollar', icon: DollarSign },
    { code: 'EUR', name: 'Euro', icon: Euro },
    { code: 'GBP', name: 'British Pound', icon: PoundSterling },
    { code: 'JPY', name: 'Japanese Yen', icon: JapaneseYen },
    { code: 'INR', name: 'Indian Rupee', icon: IndianRupee },
    { code: 'RUB', name: 'Russian Ruble', icon: RussianRuble },
    { code: 'TRY', name: 'Turkish Lira', icon: BadgeTurkishLira },
    { code: 'CHF', name: 'Swiss Franc', icon: SwissFranc },
  ]

  const isFormValid = () => {
      if (!formData.eventName || !formData.type || 
          !formData.platform || formData.categories.length === 0) {
      return false    
      }

      const hasPrice = Object.values(formData.prices).some(price => price && price.trim() !== '')
      if (!hasPrice) {
      return false
      }

      const emptyAdvicePoints = formData.advicePoints.filter(point => !point.trim())
      if (emptyAdvicePoints.length > 0) {
      return false
    }

    return true
  }

  const handleCreateSession = async () => {
    if (!isFormValid()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      })
      return
    }

    setIsCreating(true)
    
    try {
      
      const sessionData = {
        eventName: formData.eventName,
        type: formData.type,
        platform: formData.platform,
        categories: formData.categories,  
        prices: formData.prices, 
        currency: formData.currency,
        advicePoints: formData.advicePoints
      }
      

      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sessionData)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create session')
      }

      toast({
        title: "Success",
        description: "Session created successfully!",
      })
      
      if (result.session) {
        setSessions(prevSessions => [result.session, ...prevSessions])  
      }
      
      setShowCreateForm(false)
      setFormData({
        eventName: '',
        type: '',
        platform: '',
        categories: [],
        prices: {
          '15': '',
          '30': '',
          '60': ''
        },
        currency: 'USD',
        advicePoints: ['', '', '', '', '', '']
      })

    } catch (error) {
      toast({
        title: "Error",
        description: `Error creating session: ${error.message}`,
        variant: "destructive"
      })
    } finally {
      setIsCreating(false)
    }
  }

  const handleActivateSession = async (sessionId) => {
    setActivatingSessionId(sessionId)
    try {
      
      const response = await fetch(`/api/sessions/${sessionId}/activate`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to activate session')
      }

      const result = await response.json()

      // Update the session in the sessions state
      setSessions(prevSessions => 
        prevSessions.map(session => 
          session.id === sessionId 
            ? { ...session, status: 'active' }
            : session
        )
      )

      toast({
        title: "Success",
        description: "Session activated successfully!",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: 'Error activating session: ' + error.message,
        variant: "destructive"
      })
    } finally {
      setActivatingSessionId(null)
    }
  }

  const handleDeactivateSession = async (sessionId) => {
    setDeactivatingSessionId(sessionId)
    try {
      
      const response = await fetch(`/api/sessions/${sessionId}/deactivate`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to deactivate session')
      }

      const result = await response.json()

      // Update the session in the sessions state
      setSessions(prevSessions => 
        prevSessions.map(session => 
          session.id === sessionId 
            ? { ...session, status: 'inactive' }
            : session
        )
      )

      toast({
        title: "Success",
        description: "Session deactivated successfully!",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: 'Error deactivating session: ' + error.message,
        variant: "destructive"
      })
    } finally {
      setDeactivatingSessionId(null)
    }
  }

  const handleEditSession = (session) => {
    setEditingSession(session)
    setFormData({
      eventName: session.eventName,
      type: session.type,
      platform: session.platform,
      categories: session.categories || [session.category].filter(Boolean), 
      prices: session.prices,
      currency: session.currency,
      advicePoints: session.advicePoints
    })
    setShowEditForm(true)
    setShowCreateForm(false)
  }

  const handleUpdateSession = async () => {
    if (!isFormValid()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      })
      return
    }

    setIsCreating(true)
    try {
      
      const sessionData = {
        eventName: formData.eventName,
        type: formData.type,
        platform: formData.platform,
        categories: formData.categories,
        prices: formData.prices,
        currency: formData.currency,
        advicePoints: formData.advicePoints
      }
      
      const response = await fetch(`/api/sessions/${editingSession.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sessionData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update session')
      }

      const result = await response.json()

      setSessions(prevSessions => 
        prevSessions.map(session => 
          session.id === editingSession.id 
            ? { ...session, ...result.session }
            : session
        )
      )

      toast({
        title: "Success",
        description: "Session updated successfully! Please reactivate to make it live.",
      })
      setShowEditForm(false)
      setEditingSession(null)
      
      // Reset form
    setFormData({
      eventName: '',
      type: '',
      platform: '',
      categories: [],
        prices: { '15': '', '30': '', '60': '' },
        currency: 'USD',
        advicePoints: ['', '', '', '', '', '']
      })
    } catch (error) {
      toast({
        title: "Error",
        description: 'Error updating session: ' + error.message,
        variant: "destructive"
      })
    } finally {
      setIsCreating(false)
    }
  }

  const handleCancel = () => {
    setShowCreateForm(false)
    setShowEditForm(false)
    setEditingSession(null)
    setFormData({
      eventName: '',
      type: '',
      platform: '',
      categories: [],
      prices: {
        '15': '',
        '30': '',
        '60': ''
      },
      currency: 'USD',
      advicePoints: ['', '', '', '', '', '']
    })
  }

  const filteredSessions = sessions.filter(session => {
    const matchesStatus = filterStatus === 'all' || session.status === filterStatus
    const sessionCategories = session.categories || [session.category].filter(Boolean) // Handle both formats
    const matchesSearch = session.eventName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sessionCategories.some(cat => cat.toLowerCase().includes(searchTerm.toLowerCase()))
    return matchesStatus && matchesSearch
  })

  const getStatusBadge = (status) => {
    const statusConfig = {
      draft: {
        bg: 'bg-slate-100',
        text: 'text-slate-700',
        border: 'border-slate-200',
        icon: <Clock className="h-3 w-3" />
      },
      inactive: {
        bg: 'bg-gray-50',
        text: 'text-gray-700',
        border: 'border-gray-200',
        icon: <XCircle className="h-3 w-3" />
      },
      archived: {
        bg: 'bg-red-50',
        text: 'text-red-700',
        border: 'border-red-200',
        icon: <XCircle className="h-3 w-3" />
      },
      active: {
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-200',
        icon: <AlertCircle className="h-3 w-3" />
      }
    }

    const config = statusConfig[status] || statusConfig.draft

    return (
      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}>
        {config.icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </div>
    )
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'one-on-one':
        return <User className="h-4 w-4" />
      default:
        return <User className="h-4 w-4" />
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50/30 to-slate-100/20">
      <div className="space-y-8 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 via-gray-800 to-slate-700 bg-clip-text text-transparent">
              Session Management
            </h1>
            <p className="text-slate-600 text-sm max-w-xl">
              Monitor and manage your advisory sessions with advanced analytics and insights
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={() => {  
                setShowCreateForm(true)
              }}
              className="bg-gradient-to-r from-slate-700 to-gray-800 hover:from-slate-800 hover:to-gray-900 text-white px-8 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 group"
            >
              <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
              Create Session
            </Button>
            <Button 
              variant="outline" 
              onClick={googleCalendarConnected ? handleDisconnectGoogleCalendar : handleConnectGoogleCalendar}
              disabled={connectingGoogle}
              className={`border-2 px-6 py-3 rounded-2xl transition-all duration-200 flex items-center gap-2 ${
                googleCalendarConnected 
                  ? 'border-red-200 bg-red-50 text-red-700 hover:border-red-300 hover:bg-red-100' 
                  : 'border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {connectingGoogle ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <NextImage src="/google-icon.png" alt="Google Calendar" width={16} height={16} />
              )}
              <span className="text-sm font-medium">
                {connectingGoogle 
                  ? (googleCalendarConnected ? 'Disconnecting...' : 'Connecting...')
                  : googleCalendarConnected 
                    ? 'Disconnect Google Calendar' 
                    : 'Connect Google Calendar'
                }
              </span>
            </Button>
          </div> 
        </div>

        {(showCreateForm || showEditForm) && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4 h-full w-full">
            <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <ClipboardPenLine className="h-6 w-6" />
                    <CardTitle className="text-2xl font-bold text-slate-900">
                      {showEditForm ? 'Edit Session' : 'Create New Session'}
                    </CardTitle>
                  </div>
                  <p className="text-slate-600 text-sm">
                    {showEditForm ? 'Update the session details below' : 'Set up a new advisory session with your learners'}
                  </p>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancel}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="eventName" className="text-sm font-medium text-slate-700">
                    Session Title *
                    </Label>
                    <Input
                      id="eventName"
                      placeholder="Enter session title"
                      value={formData.eventName}
                      onChange={(e) => handleInputChange('eventName', e.target.value)}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700"> Session Type *</Label>
                    <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="one-on-one">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            One-on-One Session
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">Session Platform *</Label>
                    <Select value={formData.platform} onValueChange={(value) => handleInputChange('platform', value)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select platform" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="google-meet">
                          <div className="flex items-center gap-2">
                            <NextImage src="/google-meet.png" alt="Google Meet" width={16} height={16} />
                            Google Meet
                          </div>
                        </SelectItem>
                        <SelectItem value="zoom">
                          <div className="flex items-center gap-2">
                            <NextImage src="/zoom-icon.png" alt="Zoom" width={16} height={16} />
                            Zoom
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">
                      Session Categories * (Select up to 4)
                    </Label>
                    <Select 
                      value="" 
                      onValueChange={(value) => {
                        if (value && !formData.categories.includes(value) && formData.categories.length < 4) {
                          handleCategoryToggle(value)
                        }
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Add a category..." />
                      </SelectTrigger>
                      <SelectContent>
                        {[
                          { value: 'business', label: 'Business Strategy', icon: Briefcase },
                          { value: 'career', label: 'Career Development', icon: Target },
                          { value: 'technology', label: 'Technology', icon: Zap },
                          { value: 'marketing', label: 'Marketing', icon: MessageSquare },
                          { value: 'finance', label: 'Finance', icon: DollarSign },
                          { value: 'education', label: 'Education', icon: BookOpen }
                        ]
                        .filter(category => !formData.categories.includes(category.value))
                        .map((category) => {
                          const IconComponent = category.icon
                          const isDisabled = formData.categories.length >= 4
                          
                          return (
                            <SelectItem 
                              key={category.value} 
                              value={category.value}
                              disabled={isDisabled}
                            >
                          <div className="flex items-center gap-2">
                                <IconComponent className="h-4 w-4" />
                                {category.label}
                          </div>
                        </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                    
                    {formData.categories.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-600 mb-2">
                          Selected: {formData.categories.length}/4 categories
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {formData.categories.map((category) => {
                            const categoryInfo = [
                              { value: 'business', label: 'Business Strategy', icon: Briefcase },
                              { value: 'career', label: 'Career Development', icon: Target },
                              { value: 'technology', label: 'Technology', icon: Zap },
                              { value: 'marketing', label: 'Marketing', icon: MessageSquare },
                              { value: 'finance', label: 'Finance', icon: DollarSign },
                              { value: 'education', label: 'Education', icon: BookOpen }
                            ].find(c => c.value === category)
                            
                            const IconComponent = categoryInfo?.icon || Briefcase
                            
                            return (
                              <span
                                key={category}
                                className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-md border border-blue-200"
                              >
                                <IconComponent className="h-3 w-3" />
                                {categoryInfo?.label || category}
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon-sm"
                                  onClick={() => handleCategoryToggle(category)}
                                  className="hover:text-blue-900 ml-1 text-xs h-auto w-auto p-0"
                                >
                                  ×
                                </Button>
                              </span>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 w-full">
                    <Label className="text-sm font-medium text-slate-700">Session Prices *</Label>
                    <div className="space-y-3">
                      <div className="flex gap-2 items-center w-full">
                        <Label className="text-sm text-slate-600 w-20 flex-shrink-0">15 min:</Label>
                        <Input
                          type="number"
                          placeholder="0"
                          value={formData.prices['15']}
                          onChange={(e) => handlePriceChange('15', e.target.value)}
                          className="flex-1"
                        />
                        <Select value={formData.currency} onValueChange={(value) => handleInputChange('currency', value)}>
                          <SelectTrigger className="w-26 flex-shrink-0">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {currencies.map((currency) => {
                              const IconComponent = currency.icon
                              return (
                                <SelectItem key={currency.code} value={currency.code}>
                              <div className="flex items-center gap-2">
                                    <IconComponent className="h-4 w-4" />
                                    {currency.code}
                              </div>
                            </SelectItem>
                              )
                            })}
                          </SelectContent>
                        </Select>
                      </div>
                      
                        <div className="flex gap-2 items-center w-full">
                          <Label className="text-sm text-slate-600 w-20 flex-shrink-0">30 min:</Label>
                          <Input
                            type="number"
                            placeholder="0"
                            value={formData.prices['30']}
                            onChange={(e) => handlePriceChange('30', e.target.value)}
                            className="flex-1"
                          />
                          <Select value={formData.currency} onValueChange={(value) => handleInputChange('currency', value)}>
                            <SelectTrigger className="w-26 flex-shrink-0">
                              <SelectValue />
                            </SelectTrigger>
                          <SelectContent>
                            {currencies.map((currency) => {
                              const IconComponent = currency.icon
                              return (
                                <SelectItem key={currency.code} value={currency.code}>
                              <div className="flex items-center gap-2">
                                    <IconComponent className="h-4 w-4" />
                                    {currency.code}
                              </div>
                            </SelectItem>
                              )
                            })}
                          </SelectContent>
                        </Select>
                      </div>
                      

                        <div className="flex gap-2 items-center w-full">
                          <Label className="text-sm text-slate-600 w-20 flex-shrink-0">1 hour:</Label>
                          <Input
                            type="number"
                            placeholder="0"
                            value={formData.prices['60']}
                            onChange={(e) => handlePriceChange('60', e.target.value)}
                            className="flex-1"
                          />
                          <Select value={formData.currency} onValueChange={(value) => handleInputChange('currency', value)}>
                            <SelectTrigger className="w-26 flex-shrink-0">
                              <SelectValue />
                            </SelectTrigger>
                              <SelectContent>
                            {currencies.map((currency) => {
                              const IconComponent = currency.icon
                              return (
                                <SelectItem key={currency.code} value={currency.code}>
                              <div className="flex items-center gap-2">
                                    <IconComponent className="h-4 w-4" />
                                    {currency.code}
                              </div>
                            </SelectItem>
                              )
                            })}
                          </SelectContent>
                        </Select> 
                      </div>
                    </div>
                  </div>
                </div>
          
                <div className="space-y-4">
                  <Label className="text-sm font-medium text-slate-700">Get Advice On (6 points) *</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {formData.advicePoints.map((point, index) => (
                      <div key={index} className="space-y-2">
                        <Label className="text-sm font-medium text-slate-600 flex items-center gap-2">
                          <span className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center text-xs font-bold text-slate-700">
                            {index + 1}
                          </span>
                          Point {index + 1}
                        </Label>
                        <Input
                          placeholder={`Enter advice point ${index + 1}`}
                          value={point}
                          onChange={(e) => handleAdvicePointChange(index, e.target.value)}
                          className="w-full"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4 pt-6 border-t">
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    className="flex-1 w-1/2"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={showEditForm ? handleUpdateSession : handleCreateSession}
                    disabled={!isFormValid() || isCreating}
                    className="flex-1 w-1/2 bg-slate-700 hover:bg-slate-800 text-white disabled:bg-slate-400 disabled:cursor-not-allowed"
                  >
                    {isCreating ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {showEditForm ? 'Updating...' : 'Creating...'}
                      </>
                    ) : (
                      <>
                    <Plus className="h-4 w-4" />
                        {showEditForm ? 'Update Session' : 'Create Session'}
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search by learner name, session title, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 bg-white text-slate-900 placeholder-slate-500"
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <span className="text-sm font-medium text-slate-700 whitespace-nowrap">Filter by status:</span>
              <div className="flex flex-wrap gap-2">
                {['all', 'draft', 'active', 'inactive', 'archived'].map((status) => (
                  <Button
                    key={status}
                    variant={filterStatus === status ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFilterStatus(status)}
                    className={`capitalize px-4 py-2 rounded-lg font-medium ${
                      filterStatus === status 
                        ? 'bg-slate-700 text-white' 
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {status === 'all' ? 'All' : status}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Professional Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-600 uppercase tracking-wide">Total Sessions</p>
                <p className="text-2xl font-bold text-slate-900">{sessions.length}</p>
                <p className="text-xs text-slate-500">All time</p>
              </div>
              <div className="p-2 bg-slate-100 rounded-lg">
                <Calendar className="h-5 w-5 text-slate-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-600 uppercase tracking-wide">Active</p>
                <p className="text-2xl font-bold text-slate-900">
                  {sessions.filter(s => s.status === 'active').length}
                </p>
                <p className="text-xs text-slate-500">Live sessions</p>
              </div>
              <div className="p-2 bg-slate-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-slate-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-600 uppercase tracking-wide">Draft</p>
                <p className="text-2xl font-bold text-slate-900">
                  {sessions.filter(s => s.status === 'draft').length}
                </p>
                <p className="text-xs text-slate-500">In progress</p>
              </div>
              <div className="p-2 bg-slate-100 rounded-lg">
                <Clock className="h-5 w-5 text-slate-600" />
              </div>
              </div>
            </div>
          </div>

        {/* Professional Sessions List */}
        <div className="space-y-4">
          {isLoadingSessions ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm animate-pulse">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="h-6 bg-slate-200 rounded w-48"></div>
                        <div className="h-5 bg-slate-200 rounded-full w-16"></div>
              </div>
                      
                      <div className="flex items-center gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <div className="h-4 w-4 bg-slate-200 rounded"></div>
                          <div className="h-4 bg-slate-200 rounded w-20"></div>
              </div>
                        <div className="flex items-center gap-2">
                          <div className="h-4 w-4 bg-slate-200 rounded"></div>
                          <div className="h-4 bg-slate-200 rounded w-24"></div>
            </div>
                        <div className="flex items-center gap-2">
                          <div className="h-4 w-4 bg-slate-200 rounded"></div>
                          <div className="h-4 bg-slate-200 rounded w-16"></div>
          </div>
        </div>

                      <div className="mb-4">
                        <div className="h-5 bg-slate-200 rounded w-32 mb-3"></div>
                        <div className="flex gap-3">
                          <div className="h-16 bg-slate-200 rounded w-24"></div>
                          <div className="h-16 bg-slate-200 rounded w-24"></div>
                          <div className="h-16 bg-slate-200 rounded w-24"></div>
                        </div>
                        </div>

                      <div>
                        <div className="h-5 bg-slate-200 rounded w-40 mb-3"></div>
                        <div className="grid grid-cols-2 gap-2">
                          {[1, 2, 3, 4, 5, 6].map((j) => (
                            <div key={j} className="flex items-center gap-2">
                              <div className="h-4 w-4 bg-slate-200 rounded-full"></div>
                              <div className="h-4 bg-slate-200 rounded w-32"></div>
                      </div>
                          ))}
                            </div>
                          </div>
                        </div>
                        
                    <div className="flex items-center gap-3">
                      <div className="h-10 bg-slate-200 rounded w-24"></div>
                      <div className="h-10 bg-slate-200 rounded w-28"></div>
                            </div>
                            </div>
                </div>
              ))}
            </div>
          ) : filteredSessions.length > 0 ? (
            filteredSessions.map((session) => (
              <div key={session.id} className="bg-white rounded-lg border border-slate-200 shadow-sm">
                <div className="p-6">
                  <div className="flex flex-col xl:flex-row xl:items-start gap-6">
                    <div className="flex-1 space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="text-lg font-semibold text-slate-900 leading-tight">
                            {session.eventName}
                          </h3>
                          {session.status !== 'active' && getStatusBadge(session.status)}
                          </div>
                          
                        <div className="flex items-center gap-4 text-sm text-slate-600">
                          <div className="flex items-center gap-2">
                            {getTypeIcon(session.type)}
                            <span className="capitalize">{session.type.replace('-', ' ')}</span>
                            </div>
                          <div className="flex items-center gap-2">
                            <Video className="h-4 w-4" />
                            <span className="capitalize">{session.platform.replace('-', ' ')}</span>
                            </div>
                          <div className="flex items-center gap-2">
                            <Briefcase className="h-4 w-4" />
                            <div className="flex flex-wrap gap-1">
                              {(session.categories || [session.category].filter(Boolean)).map((category, index) => (
                                <span key={index} className="capitalize text-xs bg-slate-100 px-2 py-1 rounded">
                                  {category}
                                </span>
                              ))}
                          </div>
                            </div>
                            </div>
                          </div>
                          
                      <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                        <h4 className="text-sm font-medium text-slate-700 mb-3">Session Pricing</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {(() => {
                            let prices = session.prices
                            if (typeof prices === 'string') {
                              try {
                                prices = JSON.parse(prices)
                              } catch (e) {
                                prices = {}
                              }
                              }
                                                        
                            const priceEntries = Object.entries(prices || {}).filter(([duration, price]) => 
                              price && price.toString().trim() !== ''
                            )
                            
                            if (priceEntries.length === 0) {
                              return (
                                <div className="col-span-full text-center py-4">
                                  <p className="text-slate-500 text-sm">No pricing information available</p>
                            </div>
                              )
                            }
                            
                            return priceEntries.map(([duration, price]) => (
                              <div key={duration} className="bg-white rounded-lg p-3 border border-slate-200 text-center">
                                <p className="text-lg font-bold text-slate-900">{session.currency} {price}</p>
                                <p className="text-xs text-slate-500">per {duration} min</p>
                            </div>
                            ))
                          })()}
                            </div>
                          </div>
                          
                      <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                        <h4 className="text-sm font-medium text-slate-700 mb-3">What You'll Get Advice On</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {session.advicePoints?.map((point, index) => (
                            <div key={index} className="flex items-start gap-2 text-sm">
                              <div className="w-5 h-5 bg-slate-200 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-xs font-bold text-slate-600">{index + 1}</span>
                            </div>
                              <span className="text-slate-600 leading-relaxed">{point}</span>
                            </div>
                          ))}
                          </div>
                        </div>
                        
                      <div className="text-xs text-slate-500">
                        Created: {formatDate(session.createdAt)}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 xl:min-w-[200px] justify-end">
                      {session.status === 'draft' && (
                        <Button 
                          onClick={() => handleActivateSession(session.id)}
                          disabled={activatingSessionId === session.id}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 h-10 disabled:bg-green-400 disabled:cursor-not-allowed"
                        >
                          {activatingSessionId === session.id ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Activating...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4" />
                              Activate
                            </>
                          )}
                        </Button>
                      )}
                      {session.status === 'inactive' && (
                        <Button 
                          onClick={() => handleActivateSession(session.id)}
                          disabled={activatingSessionId === session.id}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 h-10 disabled:bg-green-400 disabled:cursor-not-allowed"
                        >
                          {activatingSessionId === session.id ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Activating...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4" />
                              Activate
                            </>
                          )}
                        </Button>
                      )}
                      {session.status === 'archived' && (
                        <Button 
                          onClick={() => handleActivateSession(session.id)}
                          disabled={activatingSessionId === session.id}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 h-10 disabled:bg-green-400 disabled:cursor-not-allowed"
                        >
                          {activatingSessionId === session.id ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Activating...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4" />
                              Activate
                            </>
                          )}
                        </Button>
                      )}
                      {session.status === 'inactive' && (
                        <Button variant="outline" className="border border-gray-200 hover:border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg flex items-center gap-2 h-10">
                          <XCircle className="h-4 w-4" />
                          Inactive
                        </Button>
                      )}
                      {session.status === 'archived' && (
                        <Button variant="outline" className="border border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-lg flex items-center gap-2 h-10">
                          <XCircle className="h-4 w-4" />
                          Archived
                        </Button>
                      )}
                      
                      {session.status === 'active' && (
                        <Button 
                          onClick={() => handleDeactivateSession(session.id)}
                          disabled={deactivatingSessionId === session.id}
                          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 h-10 disabled:bg-red-400 disabled:cursor-not-allowed"
                        >
                          {deactivatingSessionId === session.id ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Deactivating...
                            </>
                          ) : (
                            <>
                              <XCircle className="h-4 w-4" />
                              Deactivate Session
                            </>
                          )}
                        </Button>
                      )}
                        
                      <Button 
                        onClick={() => handleEditSession(session)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 h-10"
                      >
                        <ClipboardPenLine className="h-4 w-4" />
                        Edit Session
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-lg border border-slate-200 p-12 text-center shadow-sm">
              <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-slate-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No sessions found</h3>
              <p className="text-slate-600 max-w-md mx-auto">
                {searchTerm || filterStatus !== 'all' 
                  ? 'Try adjusting your search or filter criteria to find sessions.'
                  : 'You don\'t have any sessions yet. Create your first session to get started.'
                }
              </p>
              {!searchTerm && filterStatus === 'all' && (
                <Button 
                  onClick={() => setShowCreateForm(true)}
                  className="mt-6 bg-slate-700 hover:bg-slate-800 text-white px-6 py-2 rounded-lg flex items-center gap-2 mx-auto"
                >
                  <Plus className="h-4 w-4" />
                  Create Your First Session
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

