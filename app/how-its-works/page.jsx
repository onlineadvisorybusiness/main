'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Users, 
  Calendar, 
  DollarSign, 
  Star, 
  MessageCircle, 
  Video, 
  Clock, 
  CheckCircle, 
  ArrowRight, 
  BookOpen, 
  TrendingUp, 
  Shield, 
  Zap,
  Target,
  Lightbulb,
  Rocket,
  Handshake,
  Settings,
  BarChart3,
  FileText,
  Search,
  CreditCard,
  Globe,
  Smartphone,
  Mail,
  UserCheck,
  Building2,
  GraduationCap,
  Briefcase,
  Heart,
  Award,
  ChevronRight,
  Play,
  Pause,
  Volume2,
  Crown,
  Gem,
  Banknote,
  PieChart,
  Activity,
  TrendingDown,
  Lock,
  Network,
  BriefcaseBusiness,
  Scale,
  Eye,
  Brain,
  Sparkles,
  Zap as Lightning,
  Layers,
  Database,
  Server,
  Cloud,
  Wifi,
  Smartphone as Mobile,
  Monitor,
  Laptop,
  Tablet
} from 'lucide-react'
import NextImage from 'next/image'
import Link from 'next/link'


export default function HowItWorksPage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [activeStep, setActiveStep] = useState(0)

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Globe },
    { id: 'expert', label: 'For Experts', icon: GraduationCap },
    { id: 'learner', label: 'For Learners', icon: BookOpen },
    { id: 'features', label: 'Platform Features', icon: Settings }
  ]

  const expertSteps = [
    {
      step: 1,
      title: "Create Your Profile",
      description: "Set up your professional advisor profile with your expertise and experience",
      details: [
        "Complete your professional background and credentials",
        "Add your areas of expertise and specializations",
        "Upload a professional photo and portfolio",
        "Set your hourly rates and session types"
      ],
      icon: UserCheck,
      color: "blue",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop&crop=face"
    },
    {
      step: 2,
      title: "Set Your Availability",
      description: "Configure your schedule and availability for client bookings",
      details: [
        "Set your available time slots and working hours",
        "Configure time zones for global clients",
        "Add buffer time between sessions",
        "Manage your calendar integration"
      ],
      icon: Calendar,
      color: "green",
      image: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=400&h=300&fit=crop"
    },
    {
      step: 3,
      title: "Get Discovered",
      description: "Clients find and book sessions with you based on your expertise",
      details: [
        "Appear in search results for your expertise areas",
        "Receive booking requests and notifications",
        "Review client profiles and session requirements",
        "Accept or decline session bookings"
      ],
      icon: Handshake,
      color: "purple",
      image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop"
    },
    {
      step: 4,
      title: "Conduct Sessions",
      description: "Deliver valuable advisory sessions through video calls",
      details: [
        "Join video sessions through our platform",
        "Share screen and collaborate with clients",
        "Provide personalized guidance and advice",
        "Use chat features for ongoing communication"
      ],
      icon: Video,
      color: "orange",
      image: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=400&h=300&fit=crop"
    },
    {
      step: 5,
      title: "Build Your Practice",
      description: "Grow your advisory business and track your success",
      details: [
        "Receive payments automatically after sessions",
        "Track your earnings and session history",
        "Build your reputation through client reviews",
        "Expand your client base and offerings"
      ],
      icon: TrendingUp,
      color: "emerald",
      image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=300&fit=crop"
    }
  ]

  const learnerSteps = [
    {
      step: 1,
      title: "Find the Right Expert",
      description: "Browse and discover professionals with expertise in your specific needs",
      details: [
        "Search by industry, expertise, or specific challenges",
        "Read expert profiles and client reviews",
        "Compare pricing and availability",
        "View session types and descriptions"
      ],
      icon: Search,
      color: "blue",
      image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=300&fit=crop"
    },
    {
      step: 2,
      title: "Book Your Session",
      description: "Schedule a session that fits your schedule and needs",
      details: [
        "Choose your preferred time slot",
        "Select session type and duration",
        "Provide context about your goals",
        "Complete secure payment"
      ],
      icon: Calendar,
      color: "green",
      image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop"
    },
    {
      step: 3,
      title: "Prepare for Your Session",
      description: "Get ready for your advisory session",
      details: [
        "Receive calendar invite and reminders",
        "Prepare questions and materials",
        "Test your video/audio setup",
        "Use chat to communicate with your expert"
      ],
      icon: Video,
      color: "purple",
      image: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=400&h=300&fit=crop"
    },
    {
      step: 4,
      title: "Get Expert Guidance",
      description: "Receive personalized advice and strategic insights",
      details: [
        "One-on-one video sessions with experts",
        "Ask specific questions about your challenges",
        "Get actionable advice and strategies",
        "Access session recordings and notes"
      ],
      icon: Lightbulb,
      color: "orange",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop"
    },
    {
      step: 5,
      title: "Apply and Follow Up",
      description: "Implement learnings and continue your growth journey",
      details: [
        "Apply expert advice to your situation",
        "Use chat for follow-up questions",
        "Book additional sessions as needed",
        "Track your progress and achievements"
      ],
      icon: Target,
      color: "emerald",
      image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop"
    }
  ]

  const platformFeatures = [
    {
      category: "Expert Tools",
      icon: GraduationCap,
      features: [
        {
          title: "Profile Management",
          description: "Create and manage your professional advisor profile",
          icon: UserCheck,
          details: ["Professional profiles", "Expertise areas", "Portfolio showcase", "Client reviews"]
        },
        {
          title: "Availability Management",
          description: "Set and manage your schedule and availability",
          icon: Calendar,
          details: ["Calendar integration", "Time zone management", "Buffer time settings", "Availability rules"]
        },
        {
          title: "Session Management",
          description: "Manage your advisory sessions and client interactions",
          icon: Video,
          details: ["Video sessions", "Screen sharing", "Session recording", "Client communication"]
        },
        {
          title: "Earnings Tracking",
          description: "Track your income and session performance",
          icon: BarChart3,
          details: ["Earnings dashboard", "Payment tracking", "Session history", "Performance metrics"]
        }
      ]
    },
    {
      category: "Client Experience",
      icon: BookOpen,
      features: [
        {
          title: "Expert Discovery",
          description: "Find the right expert for your specific needs",
          icon: Search,
          details: ["Search by expertise", "Filter by industry", "Read profiles", "Compare options"]
        },
        {
          title: "Easy Booking",
          description: "Simple and secure session booking process",
          icon: CreditCard,
          details: ["Real-time availability", "Secure payments", "Instant confirmation", "Calendar integration"]
        },
        {
          title: "Video Sessions",
          description: "High-quality video sessions with experts",
          icon: Video,
          details: ["HD video calls", "Screen sharing", "Session recording", "Chat features"]
        },
        {
          title: "Communication",
          description: "Stay connected with experts before and after sessions",
          icon: MessageCircle,
          details: ["Pre-session chat", "Follow-up discussions", "Document sharing", "Message history"]
        }
      ]
    },
    {
      category: "Platform Features",
      icon: Settings,
      features: [
        {
          title: "Secure Platform",
          description: "Safe and reliable platform for all interactions",
          icon: Shield,
          details: ["Secure payments", "Data protection", "Privacy controls", "Reliable service"]
        },
        {
          title: "Mobile Access",
          description: "Access the platform from any device",
          icon: Smartphone,
          details: ["Mobile responsive", "Cross-platform", "Push notifications", "Offline access"]
        },
        {
          title: "Calendar Integration",
          description: "Sync with your existing calendar systems",
          icon: Calendar,
          details: ["Google Calendar", "Outlook integration", "Apple Calendar", "Sync capabilities"]
        },
        {
          title: "Support System",
          description: "Comprehensive support and help resources",
          icon: Heart,
          details: ["Live chat support", "Help center", "Video tutorials", "Community forum"]
        }
      ]
    }
  ]

  const stats = [
    { label: "Verified Experts", value: "200+", icon: Building2, description: "Industry professionals and advisors" },
    { label: "Average Session Value", value: "$200+", icon: DollarSign, description: "Professional advisory sessions" },
    { label: "Active Clients", value: "500+", icon: Users, description: "Business professionals and entrepreneurs" },
    { label: "Sessions Completed", value: "5,000+", icon: TrendingUp, description: "Successful advisory sessions" },
    { label: "Client Satisfaction", value: "95%", icon: Target, description: "Positive feedback and ratings" },
    { label: "Countries Served", value: "25+", icon: Globe, description: "Global reach and accessibility" }
  ]


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-indigo-900/20 opacity-20"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-medium mb-6">
              <Building2 className="w-4 h-4 mr-2" />
               Advisory Platform
            </div>
            <h1 className="text-6xl md:text-7xl font-bold mb-8 tracking-tight bg-gradient-to-r from-white via-blue-100 to-indigo-200 bg-clip-text text-transparent">
              How It Works
            </h1>
            <p className="text-2xl md:text-3xl text-blue-100 max-w-4xl mx-auto leading-relaxed mb-8">
              Connect with experienced professionals and industry experts for personalized guidance and business growth
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-lg text-blue-200">
              <div className="flex items-center">
                <Award className="w-5 h-5 mr-2" />
                Verified Experts
              </div>
              <div className="flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Secure Platform
              </div>
              <div className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Proven Results
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-16"
          >
            {/* Platform Stats */}
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Professional Advisory Platform</h2>
              <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
                Connect with verified industry professionals and experienced advisors for personalized guidance, 
                strategic insights, and business growth opportunities.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="text-center hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50">
                    <CardContent className="p-8">
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                        <stat.icon className="w-10 h-10 text-white" />
                      </div>
                      <div className="text-4xl font-bold text-gray-900 mb-2">{stat.value}</div>
                      <div className="text-lg font-semibold text-gray-800 mb-2">{stat.label}</div>
                      <div className="text-sm text-gray-600">{stat.description}</div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* How It Works Diagram */}
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-2xl p-12 border border-gray-200">
              <h3 className="text-3xl font-bold text-center mb-12 text-gray-900">How Our Platform Works</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                <div className="text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <Search className="w-12 h-12 text-white" />
                  </div>
                  <h4 className="text-xl font-semibold mb-4 text-gray-900">1. Find Experts</h4>
                  <p className="text-gray-600 leading-relaxed">Browse and discover verified professionals with expertise in your specific industry or challenge area.</p>
                </div>
                <div className="text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <Handshake className="w-12 h-12 text-white" />
                  </div>
                  <h4 className="text-xl font-semibold mb-4 text-gray-900">2. Book Sessions</h4>
                  <p className="text-gray-600 leading-relaxed">Schedule one-on-one sessions with experts based on their availability and your preferred timing.</p>
                </div>
                <div className="text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <Rocket className="w-12 h-12 text-white" />
                  </div>
                  <h4 className="text-xl font-semibold mb-4 text-gray-900">3. Get Guidance</h4>
                  <p className="text-gray-600 leading-relaxed">Receive personalized advice, strategic insights, and actionable recommendations for your business.</p>
                </div>
              </div>
            </div>

            {/* Platform Value Proposition */}
            <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-3xl p-12 border border-gray-200">
              <h3 className="text-3xl font-bold text-center mb-8 text-gray-900">Professional Advisory Platform</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold mb-2 text-gray-900">Secure Platform</h4>
                  <p className="text-gray-600 text-sm">Secure communication and data protection for confidential business discussions</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Building2 className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold mb-2 text-gray-900">Verified Experts</h4>
                  <p className="text-gray-600 text-sm">Access to verified professionals with proven industry experience and expertise</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <TrendingUp className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold mb-2 text-gray-900">Proven Results</h4>
                  <p className="text-gray-600 text-sm">Track record of successful advisory sessions and positive client outcomes</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Globe className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold mb-2 text-gray-900">Global Access</h4>
                  <p className="text-gray-600 text-sm">Connect with experts worldwide with flexible scheduling across time zones</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Expert Tab */}
        {activeTab === 'expert' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-16"
          >
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">For Professional Advisors</h2>
              <p className="text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
                Share your expertise and help other professionals grow their businesses while building your advisory practice.
              </p>
              <div className="mt-8 inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full text-lg font-semibold">
                <DollarSign className="w-6 h-6 mr-2" />
                Set your own rates and earn from your expertise
              </div>
            </div>

            {/* Expert Journey Steps */}
            <div className="space-y-12">
              {expertSteps.map((step, index) => (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-8`}
                >
                  <div className="flex-1">
                    <Card className="h-full">
                      <CardContent className="p-8">
                        <div className="flex items-center mb-6">
                          <div className={`w-12 h-12 bg-${step.color}-100 rounded-full flex items-center justify-center mr-4`}>
                            <step.icon className={`w-6 h-6 text-${step.color}-600`} />
                          </div>
                          <div>
                            <Badge variant="outline" className="mb-2">Step {step.step}</Badge>
                            <h3 className="text-2xl font-bold text-gray-900">{step.title}</h3>
                          </div>
                        </div>
                        <p className="text-lg text-gray-600 mb-6">{step.description}</p>
                        <ul className="space-y-3">
                          {step.details.map((detail, detailIndex) => (
                            <li key={detailIndex} className="flex items-center text-gray-700">
                              <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                              {detail}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                  <div className="flex-1">
                    <div className="relative rounded-2xl overflow-hidden shadow-lg">
                      <NextImage
                        src={step.image}
                        alt={step.title}
                        width={500}
                        height={400}
                        className="w-full h-80 object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      <div className="absolute bottom-4 left-4 text-white">
                        <h4 className="text-lg font-semibold">{step.title}</h4>
                        <p className="text-sm opacity-90">{step.description}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Availability Management Section */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl p-12 border border-blue-200">
              <h3 className="text-3xl font-bold text-center mb-12 text-gray-900">Advanced Availability Management</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div>
                  <h4 className="text-2xl font-semibold mb-6 text-gray-900">Smart Calendar Integration</h4>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4 mt-1">
                        <Calendar className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <h5 className="font-semibold text-gray-900 mb-2">Multi-Calendar Sync</h5>
                        <p className="text-gray-600">Seamlessly integrate with Google Calendar, Outlook, and Apple Calendar for real-time availability updates</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-4 mt-1">
                        <Clock className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <h5 className="font-semibold text-gray-900 mb-2">Flexible Time Zones</h5>
                        <p className="text-gray-600">Automatically handle multiple time zones for global client base with intelligent scheduling</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-4 mt-1">
                        <Settings className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <h5 className="font-semibold text-gray-900 mb-2">Custom Availability Rules</h5>
                        <p className="text-gray-600">Set advanced rules for different session types, client tiers, and emergency availability</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-2xl font-semibold mb-6 text-gray-900">Premium Scheduling Features</h4>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-4 mt-1">
                        <Zap className="w-4 h-4 text-orange-600" />
                      </div>
                      <div>
                        <h5 className="font-semibold text-gray-900 mb-2">Instant Booking</h5>
                        <p className="text-gray-600">Clients can book sessions instantly based on your real-time availability with automatic confirmations</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-4 mt-1">
                        <Shield className="w-4 h-4 text-red-600" />
                      </div>
                      <div>
                        <h5 className="font-semibold text-gray-900 mb-2">Buffer Time Management</h5>
                        <p className="text-gray-600">Automatically add buffer time between sessions and manage preparation time for high-stakes engagements</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center mr-4 mt-1">
                        <TrendingUp className="w-4 h-4 text-teal-600" />
                      </div>
                      <div>
                        <h5 className="font-semibold text-gray-900 mb-2">Revenue Optimization</h5>
                        <p className="text-gray-600">AI-powered suggestions for optimal pricing and availability to maximize your advisory revenue</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Expert Benefits */}
            <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 rounded-3xl p-12 text-white">
              <h3 className="text-3xl font-bold text-center mb-12">Why Join Our Elite Advisory Network?</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <Banknote className="w-10 h-10 text-white" />
                  </div>
                  <h4 className="text-xl font-semibold mb-4">Premium Revenue Potential</h4>
                  <p className="text-blue-100 mb-4">Earn $500K+ annually with our high-value client base</p>
                  <ul className="text-sm text-blue-200 space-y-2">
                    <li>• $500-$5,000+ per hour rates</li>
                    <li>• Enterprise retainer agreements</li>
                    <li>• Equity participation opportunities</li>
                  </ul>
                </div>
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <Building2 className="w-10 h-10 text-white" />
                  </div>
                  <h4 className="text-xl font-semibold mb-4">Fortune 500 Network</h4>
                  <p className="text-blue-100 mb-4">Access to C-suite executives and board members</p>
                  <ul className="text-sm text-blue-200 space-y-2">
                    <li>• Direct CEO and board connections</li>
                    <li>• Strategic partnership opportunities</li>
                    <li>• Industry thought leadership platform</li>
                  </ul>
                </div>
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <TrendingUp className="w-10 h-10 text-white" />
                  </div>
                  <h4 className="text-xl font-semibold mb-4">Scalable Practice</h4>
                  <p className="text-blue-100 mb-4">Build a multi-million dollar advisory business</p>
                  <ul className="text-sm text-blue-200 space-y-2">
                    <li>• Automated client acquisition</li>
                    <li>• Advanced analytics and insights</li>
                    <li>• Revenue optimization tools</li>
                  </ul>
                </div>
              </div>
              
              {/* Revenue Calculator */}
              <div className="mt-16 bg-white/10 backdrop-blur-sm rounded-2xl p-8">
                <h4 className="text-2xl font-bold text-center mb-8">Revenue Potential Calculator</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-emerald-400 mb-2">$2.5M</div>
                    <div className="text-lg font-semibold mb-2">Annual Revenue Potential</div>
                    <div className="text-sm text-blue-200">Based on 20 hours/week at $2,500/hour</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-blue-400 mb-2">95%</div>
                    <div className="text-lg font-semibold mb-2">Client Retention Rate</div>
                    <div className="text-sm text-blue-200">Premium clients maintain long-term relationships</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-purple-400 mb-2">300%</div>
                    <div className="text-lg font-semibold mb-2">Average ROI</div>
                    <div className="text-sm text-blue-200">Client investment returns from advisory services</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Learner Tab */}
        {activeTab === 'learner' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-16"
          >
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">For Business Professionals</h2>
              <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
                Get personalized guidance from experienced professionals to accelerate your business growth and overcome challenges.
              </p>
              <div className="mt-8 inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-full text-lg font-semibold">
                <Target className="w-6 h-6 mr-2" />
                Get expert advice tailored to your needs
              </div>
            </div>

            {/* Learner Journey Steps */}
            <div className="space-y-12">
              {learnerSteps.map((step, index) => (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-8`}
                >
                  <div className="flex-1">
                    <Card className="h-full">
                      <CardContent className="p-8">
                        <div className="flex items-center mb-6">
                          <div className={`w-12 h-12 bg-${step.color}-100 rounded-full flex items-center justify-center mr-4`}>
                            <step.icon className={`w-6 h-6 text-${step.color}-600`} />
                          </div>
                          <div>
                            <Badge variant="outline" className="mb-2">Step {step.step}</Badge>
                            <h3 className="text-2xl font-bold text-gray-900">{step.title}</h3>
                          </div>
                        </div>
                        <p className="text-lg text-gray-600 mb-6">{step.description}</p>
                        <ul className="space-y-3">
                          {step.details.map((detail, detailIndex) => (
                            <li key={detailIndex} className="flex items-center text-gray-700">
                              <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                              {detail}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                  <div className="flex-1">
                    <div className="relative rounded-2xl overflow-hidden shadow-lg">
                      <NextImage
                        src={step.image}
                        alt={step.title}
                        width={500}
                        height={400}
                        className="w-full h-80 object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      <div className="absolute bottom-4 left-4 text-white">
                        <h4 className="text-lg font-semibold">{step.title}</h4>
                        <p className="text-sm opacity-90">{step.description}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Chat & Communication Section */}
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-3xl p-12 border border-emerald-200">
              <h3 className="text-3xl font-bold text-center mb-12 text-gray-900">Advanced Communication & Chat Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div>
                  <h4 className="text-2xl font-semibold mb-6 text-gray-900">Chat with Expert</h4>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center mr-4 mt-1">
                        <MessageCircle className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div>
                        <h5 className="font-semibold text-gray-900 mb-2">Pre-Session Preparation</h5>
                        <p className="text-gray-600">Communicate with your advisor before sessions to share context, documents, and specific questions</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4 mt-1">
                        <FileText className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <h5 className="font-semibold text-gray-900 mb-2">Secure Document Sharing</h5>
                        <p className="text-gray-600">Share confidential business documents, financial statements, and strategic materials securely</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-4 mt-1">
                        <Lightbulb className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <h5 className="font-semibold text-gray-900 mb-2">Follow-up Discussions</h5>
                        <p className="text-gray-600">Continue strategic discussions and get clarification on implementation strategies after sessions</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-2xl font-semibold mb-6 text-gray-900">Chat with Learner</h4>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mr-4 mt-1">
                        <Users className="w-4 h-4 text-orange-600" />
                      </div>
                      <div>
                        <h5 className="font-semibold text-gray-900 mb-2">Client Relationship Management</h5>
                        <p className="text-gray-600">Build and maintain long-term relationships with executive clients through ongoing communication</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-4 mt-1">
                        <Shield className="w-4 h-4 text-red-600" />
                      </div>
                      <div>
                        <h5 className="font-semibold text-gray-900 mb-2">Confidential Messaging</h5>
                        <p className="text-gray-600">Enterprise-grade encrypted messaging for sensitive business discussions and strategic planning</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center mr-4 mt-1">
                        <TrendingUp className="w-4 h-4 text-teal-600" />
                      </div>
                      <div>
                        <h5 className="font-semibold text-gray-900 mb-2">Progress Tracking</h5>
                        <p className="text-gray-600">Monitor implementation progress and provide ongoing strategic guidance between formal sessions</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Communication Features */}
              <div className="mt-12 bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
                <h4 className="text-2xl font-bold text-center mb-8 text-gray-900">Enterprise Communication Features</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <Lock className="w-8 h-8 text-white" />
                    </div>
                    <h5 className="text-lg font-semibold mb-2 text-gray-900">End-to-End Encryption</h5>
                    <p className="text-sm text-gray-600">All messages and documents are encrypted with military-grade security</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <Clock className="w-8 h-8 text-white" />
                    </div>
                    <h5 className="text-lg font-semibold mb-2 text-gray-900">Real-Time Messaging</h5>
                    <p className="text-sm text-gray-600">Instant messaging with read receipts and delivery confirmations</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <FileText className="w-8 h-8 text-white" />
                    </div>
                    <h5 className="text-lg font-semibold mb-2 text-gray-900">Document Collaboration</h5>
                    <p className="text-sm text-gray-600">Share and collaborate on strategic documents with version control</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <MessageCircle className="w-8 h-8 text-white" />
                    </div>
                    <h5 className="text-lg font-semibold mb-2 text-gray-900">Message History</h5>
                    <p className="text-sm text-gray-600">Complete conversation history with searchable archives for reference</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Learner Benefits */}
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-3xl p-12 border border-emerald-200">
              <h3 className="text-3xl font-bold text-center mb-12 text-gray-900">Why Choose Our Executive Advisory Platform?</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <Target className="w-10 h-10 text-white" />
                  </div>
                  <h4 className="text-xl font-semibold mb-4 text-gray-900">Strategic Impact</h4>
                  <p className="text-gray-600 mb-4">Transform your business with proven strategies from industry leaders</p>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li>• 300% average ROI on advisory investments</li>
                    <li>• Measurable business growth metrics</li>
                    <li>• Strategic transformation frameworks</li>
                  </ul>
                </div>
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <Building2 className="w-10 h-10 text-white" />
                  </div>
                  <h4 className="text-xl font-semibold mb-4 text-gray-900">Elite Network Access</h4>
                  <p className="text-gray-600 mb-4">Connect with Fortune 500 executives and industry titans</p>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li>• Former CEOs and board members</li>
                    <li>• Industry-specific expertise</li>
                    <li>• Strategic partnership opportunities</li>
                  </ul>
                </div>
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <Shield className="w-10 h-10 text-white" />
                  </div>
                  <h4 className="text-xl font-semibold mb-4 text-gray-900">Enterprise Security</h4>
                  <p className="text-gray-600 mb-4">Bank-level security and confidentiality for sensitive discussions</p>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li>• 256-bit encryption and SOC 2 compliance</li>
                    <li>• Confidentiality agreements and NDAs</li>
                    <li>• Secure document sharing and storage</li>
                  </ul>
                </div>
              </div>
              
              {/* ROI Calculator */}
              <div className="mt-16 bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
                <h4 className="text-2xl font-bold text-center mb-8 text-gray-900">ROI Calculator for Executive Advisory</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-emerald-600 mb-2">$2M</div>
                    <div className="text-lg font-semibold mb-2 text-gray-800">Average Revenue Increase</div>
                    <div className="text-sm text-gray-600">From strategic advisory implementations</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">18 months</div>
                    <div className="text-lg font-semibold mb-2 text-gray-800">Average Payback Period</div>
                    <div className="text-sm text-gray-600">Time to see measurable business impact</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600 mb-2">85%</div>
                    <div className="text-lg font-semibold mb-2 text-gray-800">Strategy Success Rate</div>
                    <div className="text-sm text-gray-600">Successful implementation of advisory recommendations</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600 mb-2">$50K</div>
                    <div className="text-lg font-semibold mb-2 text-gray-800">Average Investment</div>
                    <div className="text-sm text-gray-600">Typical advisory engagement value</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Features Tab */}
        {activeTab === 'features' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-16"
          >
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Platform Features</h2>
              <p className="text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
                Comprehensive tools and features designed to enhance your advisory experience and help you connect with the right professionals.
              </p>
            </div>

            {platformFeatures.map((category, categoryIndex) => (
              <motion.div
                key={category.category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: categoryIndex * 0.1 }}
                className="space-y-8"
              >
                <div className="flex items-center mb-8">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                    <category.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">{category.category}</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {category.features.map((feature, featureIndex) => (
                    <Card key={feature.title} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start mb-4">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                            <feature.icon className="w-5 h-5 text-gray-600" />
                          </div>
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h4>
                            <p className="text-gray-600 mb-4">{feature.description}</p>
                          </div>
                        </div>
                        <ul className="space-y-2">
                          {feature.details.map((detail, detailIndex) => (
                            <li key={detailIndex} className="flex items-center text-sm text-gray-700">
                              <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                              {detail}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </motion.div>
            ))}
            
            {/* Security & Privacy Section */}
            <div className="bg-gradient-to-r from-slate-900 via-gray-800 to-slate-900 rounded-3xl p-12 text-white">
              <h3 className="text-3xl font-bold text-center mb-12">Security & Privacy</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <Shield className="w-10 h-10 text-white" />
                  </div>
                  <h4 className="text-xl font-semibold mb-4">Secure Platform</h4>
                  <p className="text-gray-300 text-sm">Industry-standard security measures to protect your data and communications</p>
                </div>
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <Lock className="w-10 h-10 text-white" />
                  </div>
                  <h4 className="text-xl font-semibold mb-4">Data Protection</h4>
                  <p className="text-gray-300 text-sm">Your personal and business information is protected with encryption</p>
                </div>
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <FileText className="w-10 h-10 text-white" />
                  </div>
                  <h4 className="text-xl font-semibold mb-4">Privacy Controls</h4>
                  <p className="text-gray-300 text-sm">Control who can see your information and how it's used</p>
                </div>
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <CheckCircle className="w-10 h-10 text-white" />
                  </div>
                  <h4 className="text-xl font-semibold mb-4">Reliable Service</h4>
                  <p className="text-gray-300 text-sm">Consistent uptime and reliable service for all your advisory needs</p>
                </div>
              </div>
              
              <div className="mt-16 bg-white/10 backdrop-blur-sm rounded-2xl p-8">
                <h4 className="text-2xl font-bold text-center mb-8">Your Privacy Matters</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-emerald-400 mb-2">100%</div>
                    <div className="text-lg font-semibold mb-2">Confidential Sessions</div>
                    <div className="text-sm text-blue-200">All advisory sessions are private and confidential</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-400 mb-2">Secure</div>
                    <div className="text-lg font-semibold mb-2">Data Handling</div>
                    <div className="text-sm text-blue-200">Your data is handled with industry-standard security</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-400 mb-2">24/7</div>
                    <div className="text-lg font-semibold mb-2">Platform Monitoring</div>
                    <div className="text-sm text-blue-200">Continuous monitoring to ensure platform security</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
      {/* Call to Action */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-indigo-900/20 opacity-20"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative">
          <div className="text-center">
            <div className="inline-flex items-center px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full text-lg font-medium mb-8">
              <Crown className="w-6 h-6 mr-2" />
              Professional Advisory Platform
            </div>
            <h2 className="text-5xl font-bold mb-8 bg-gradient-to-r from-white via-blue-100 to-indigo-200 bg-clip-text text-transparent">
              Ready to Get Started?
            </h2>
            <p className="text-2xl text-blue-100 mb-12 max-w-4xl mx-auto leading-relaxed">
              Join our platform and connect with experienced professionals to accelerate your business growth and share your expertise.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
              <Link href="/become-an-expert">
                <Button size="lg" className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300">
                  <GraduationCap className="w-6 h-6 mr-2" />
                  Become an Expert
                </Button>
              </Link>
              <Link href="/marketplace">
                <Button size="lg" variant="outline" className="border-2 border-white text-gray-800 hover:bg-white hover:text-slate-900 px-8 py-4 text-lg font-semibold rounded-xl backdrop-blur-sm transition-all duration-300">
                  <Search className="w-6 h-6 mr-2" />
                  Find an Expert
                </Button>
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-400 mb-2">200+</div>
                <div className="text-lg font-semibold mb-2">Verified Experts</div>
                <div className="text-sm text-blue-200">Industry professionals ready to help</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400 mb-2">95%</div>
                <div className="text-lg font-semibold mb-2">Client Satisfaction</div>
                <div className="text-sm text-blue-200">Positive feedback and ratings</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400 mb-2">5,000+</div>
                <div className="text-lg font-semibold mb-2">Sessions Completed</div>
                <div className="text-sm text-blue-200">Successful advisory sessions</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 