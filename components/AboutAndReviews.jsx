'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Star, DollarSign, Rocket, TrendingUp, Briefcase, User, Code, Megaphone, Wallet, BookOpen, ChevronRight, ChevronLeft } from 'lucide-react'
import { Button } from './ui/button'

export function AboutAndReviews({ expert }) {
  const [showFullAbout, setShowFullAbout] = useState(false)
  const [expandedReviews, setExpandedReviews] = useState({})
  const [currentPage, setCurrentPage] = useState(1)
  
  // Mock review data for UI testing
  const mockReviews = [
    {
      id: 'mock-1',
      reviewerName: 'Sarah Johnson',
      reviewerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
      position: 'CEO',
      company: 'Tech Innovations Inc.',
      message: 'Exceptional guidance and insights! The session was incredibly valuable and helped me make critical decisions for my startup. The expert provided actionable advice that I could implement immediately.',
      stars: 5,
      feedbackDate: new Date('2024-01-15'),
      source: 'direct'
    },
    {
      id: 'mock-2',
      reviewerName: 'Michael Chen',
      reviewerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
      position: 'Product Manager',
      company: 'Digital Solutions',
      message: 'Outstanding mentorship session. The expert has deep industry knowledge and provided strategic insights that transformed our approach to product development.',
      stars: 5,
      feedbackDate: new Date('2024-02-20'),
      source: 'direct'
    },
    {
      id: 'mock-3',
      reviewerName: 'Emily Rodriguez',
      reviewerAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
      position: 'Marketing Director',
      company: 'Growth Marketing Co.',
      message: 'Highly recommend! The expert helped me refine my marketing strategy and provided valuable feedback on our campaigns. The session was well-structured and focused.',
      stars: 4,
      feedbackDate: new Date('2024-03-10'),
      source: 'direct'
    },
    {
      id: 'mock-4',
      reviewerName: 'David Thompson',
      reviewerAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
      position: 'Founder',
      company: 'Startup Ventures',
      message: 'This was exactly what I needed. The expert provided clarity on complex business challenges and helped me prioritize my initiatives. The advice was practical and immediately applicable.',
      stars: 5,
      feedbackDate: new Date('2024-03-25'),
      source: 'direct'
    },
    {
      id: 'mock-5',
      reviewerName: 'Lisa Anderson',
      reviewerAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop',
      position: 'Operations Lead',
      company: 'ScaleUp Industries',
      message: 'Great session with actionable insights. The expert understood our challenges quickly and provided strategic recommendations that we\'re already implementing. Would definitely book again!',
      stars: 5,
      feedbackDate: new Date('2024-04-05'),
      source: 'direct'
    },
    {
      id: 'mock-6',
      reviewerName: 'James Wilson',
      reviewerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
      position: 'CTO',
      company: 'Innovation Labs',
      message: 'Excellent mentorship! The expert has a wealth of experience and shared valuable insights on technology strategy and team leadership. The session exceeded my expectations and provided a clear roadmap for our technical initiatives.',
      stars: 5,
      feedbackDate: new Date('2024-04-18'),
      source: 'direct'
    },
    {
      id: 'mock-7',
      reviewerName: 'James Wilson',
      reviewerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
      position: 'CTO',
      company: 'Innovation Labs',
      message: 'Excellent mentorship! The expert has a wealth of experience and shared valuable insights on technology strategy and team leadership. The session exceeded my expectations and provided a clear roadmap for our technical initiatives.',
      stars: 5,
      feedbackDate: new Date('2024-04-18'),
      source: 'direct'
    },
    {
      id: 'mock-8',
      reviewerName: 'James Wilson',
      reviewerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
      position: 'CTO',
      company: 'Innovation Labs',
      message: 'Excellent mentorship! The expert has a wealth of experience and shared valuable insights on technology strategy and team leadership. The session exceeded my expectations and provided a clear roadmap for our technical initiatives.',
      stars: 5,
      feedbackDate: new Date('2024-04-18'),
      source: 'direct'
    },
    {
      id: 'mock-9',
      reviewerName: 'James Wilson',
      reviewerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
      position: 'CTO',
      company: 'Innovation Labs',
      message: 'Excellent mentorship! The expert has a wealth of experience and shared valuable insights on technology strategy and team leadership. The session exceeded my expectations and provided a clear roadmap for our technical initiatives.',
      stars: 5,
      feedbackDate: new Date('2024-04-18'),
      source: 'direct'
    },
    {
      id: 'mock-10',
      reviewerName: 'James Wilson',
      reviewerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
      position: 'CTO',
      company: 'Innovation Labs',
      message: 'Excellent mentorship! The expert has a wealth of experience and shared valuable insights on technology strategy and team leadership. The session exceeded my expectations and provided a clear roadmap for our technical initiatives.',
      stars: 5,
      feedbackDate: new Date('2024-04-18'),
      source: 'direct'
    }
  ]
  
  // Use mock reviews if expert.reviews is empty or doesn't exist, otherwise use real reviews
  const reviews = expert.reviews && expert.reviews.length > 0 ? expert.reviews : mockReviews
  
  const reviewsPerPage = 6
  const totalPages = Math.ceil(reviews.length / reviewsPerPage)
  const startIndex = (currentPage - 1) * reviewsPerPage
  const endIndex = startIndex + reviewsPerPage
  const currentReviews = reviews.slice(startIndex, endIndex)

  const toggleReview = (reviewId) => {
    setExpandedReviews(prev => ({
      ...prev,
      [reviewId]: !prev[reviewId]
    }))
  }

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 transition-all ${
          i < rating 
            ? 'fill-yellow-400 text-yellow-400 drop-shadow-sm' 
            : 'text-gray-300 fill-gray-200'
        }`}
      />
    ))
  }

  const aboutMeParts = (expert.aboutMe || '').split('\n\n')

  return (
    <div className="p-4 space-y-6">
      <Card className="bg-gradient-to-br from-gray-50 to-white border-0 shadow-lg">
        <CardContent className="p-8">
          {/* Header Section */}
          <div className="mb-4 pb-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-1 h-8 bg-gradient-to-b from-blue-600 to-indigo-600 rounded-full"></div>
                <h2 className="text-3xl font-bold text-gray-900">About Me</h2>
              </div>
              {expert.linkedinUrl && expert.linkedinUrl !== "#" && (
                <a 
                  href={expert.linkedinUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center justify-center w-10 h-10 hover:bg-[#0077b5] transition-all duration-200 rounded-lg border-2 border-[#0077b5] hover:border-[#0077b5] shadow-sm hover:shadow-lg group bg-white"
                >
                  <svg className="w-5 h-5 transition-all group-hover:scale-110" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" fill="#0077b5" className="group-hover:fill-white transition-colors"/>
                  </svg>
                </a>
              )}
            </div>
          </div>

          <div className="prose prose-lg prose-gray max-w-none mb-8">
            <p className="text-gray-700 leading-relaxed mb-6 text-base">
              {aboutMeParts[0]}
            </p>
            
            {showFullAbout && (
              <>
                <div className="mb-6">
                  {aboutMeParts[1]?.split('\n').map((line, index) => (
                    <p key={index} className="text-gray-700 leading-relaxed mb-3 text-base">
                      {line}
                    </p>
                  ))}
                </div>
                <p className="text-gray-700 leading-relaxed mb-6 text-base">
                  {aboutMeParts[2]}
                </p>
              </>
            )}
            
            {(aboutMeParts[1] || aboutMeParts[2]) && (
              <button 
                onClick={() => setShowFullAbout(!showFullAbout)}
                className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm transition-all bg-transparent hover:bg-blue-50 px-4 py-2 rounded-md -ml-4"
              >
                {showFullAbout ? 'See less' : 'See more'}
                <ChevronRight className={`w-4 h-4 ml-1 transition-transform duration-300 ${showFullAbout ? 'rotate-90' : ''}`} />
              </button>
            )}
          </div>

          {expert.categories && expert.categories.length > 0 && (
            <div className="mt-10 pt-6 border-t border-gray-200">
              <div className="mb-4">
                <h3 className="text-xl font-bold text-gray-900 mb-1">Expertise & Specializations</h3>
                <p className="text-gray-600 text-sm">Areas of expertise and specialization</p>
              </div>
              <div className="flex flex-wrap gap-3">
                {expert.categories.map((category, index) => {
                  const categoryInfo = {
                    'fundraising': { label: 'Fundraising 101', icon: DollarSign, color: 'from-teal-500 to-cyan-600' },
                    'idea-to-launch': { label: 'Idea to Launch', icon: Rocket, color: 'from-violet-500 to-purple-600' },
                    'sales-growth': { label: 'Sales & Growth', icon: TrendingUp, color: 'from-blue-500 to-blue-600' },
                    'business': { label: 'Business Strategy', icon: Briefcase, color: 'from-indigo-500 to-indigo-600' },
                    'career': { label: 'Career Development', icon: User, color: 'from-amber-500 to-orange-500' },
                    'technology': { label: 'Technology', icon: Code, color: 'from-blue-600 to-indigo-600' },
                    'marketing': { label: 'Marketing', icon: Megaphone, color: 'from-pink-500 to-rose-500' },
                    'finance': { label: 'Finance', icon: Wallet, color: 'from-green-700 to-emerald-600' },
                    'education': { label: 'Education', icon: BookOpen, color: 'from-teal-500 to-cyan-500' }
                  }
                  
                  const info = categoryInfo[category] || { label: category, color: 'from-gray-500 to-gray-600' }
                  const IconComponent = info.icon
                  
                  const gradientClasses = {
                    'from-emerald-500 to-green-600': 'bg-gradient-to-r from-emerald-500 to-green-600',
                    'from-violet-500 to-purple-600': 'bg-gradient-to-r from-violet-500 to-purple-600',
                    'from-blue-500 to-blue-600': 'bg-gradient-to-r from-blue-500 to-blue-600',
                    'from-indigo-500 to-indigo-600': 'bg-gradient-to-r from-indigo-500 to-indigo-600',
                    'from-amber-500 to-orange-500': 'bg-gradient-to-r from-amber-500 to-orange-500',
                    'from-blue-600 to-indigo-600': 'bg-gradient-to-r from-blue-600 to-indigo-600',
                    'from-pink-500 to-rose-500': 'bg-gradient-to-r from-pink-500 to-rose-500',
                    'from-green-700 to-emerald-600': 'bg-gradient-to-r from-green-700 to-emerald-600',
                    'from-teal-500 to-cyan-600': 'bg-gradient-to-r from-teal-500 to-cyan-600',
                    'from-teal-500 to-cyan-500': 'bg-gradient-to-r from-teal-500 to-cyan-500',
                    'from-gray-500 to-gray-600': 'bg-gradient-to-r from-gray-500 to-gray-600'
                  }
                  
                  const gradientClass = gradientClasses[info.color] || gradientClasses['from-gray-500 to-gray-600']
                  
                  return (
                    <span 
                      key={index} 
                      className={`group relative px-5 py-2.5 rounded-full text-sm font-semibold text-white ${gradientClass} shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2 border-2 border-transparent cursor-default`}
                    >
                      {IconComponent && (
                        <IconComponent className="w-4 h-4" />
                      )}
                      {info.label}
                    </span>
                  )
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {reviews.length > 0 && (
      <Card className="bg-gradient-to-br from-gray-50 to-white border-0 shadow-lg">
        <CardContent className="p-8">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 pb-6 border-b border-gray-200">
            <div className="mb-4 sm:mb-0">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-1 h-8 bg-gradient-to-b from-blue-600 to-indigo-600 rounded-full"></div>
                <h2 className="text-3xl font-bold text-gray-900">Voices of Excellence</h2>
              </div>
              <p className="text-gray-600 ml-4">
                {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'} from verified clients
              </p>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200">
                <span className="text-sm font-medium text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>
              </div>
            )}
          </div>

          {/* Reviews Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {currentReviews.map((review) => {
              const isExpanded = expandedReviews[review.id]
              const displayText = isExpanded ? review.message : 
                (review.message && review.message.length > 200 ? `${review.message.substring(0, 200)}...` : review.message)
              
              return (
                <Card 
                  key={review.id} 
                  className="bg-white border border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300 group overflow-hidden relative"
                >
                  {/* Decorative gradient overlay on hover */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  <CardContent className="p-6 pt-7">
                    {/* Reviewer Info */}
                    <div className="flex items-start mb-5">
                      {review.reviewerAvatar ? (
                        <div className="relative">
                          <img
                            src={review.reviewerAvatar}
                            alt={review.reviewerName}
                            className="w-16 h-16 rounded-full object-cover border-3 border-white shadow-md ring-2 ring-gray-100 group-hover:ring-blue-200 transition-all duration-300"
                          />
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                      ) : (
                        <div className="relative">
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 flex items-center justify-center shadow-md ring-2 ring-gray-100 group-hover:ring-blue-200 transition-all duration-300">
                            <span className="text-white font-bold text-xl">{review.reviewerName?.charAt(0) || 'U'}</span>
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                      )}
                      <div className="flex-1 ml-4">
                        <h4 className="font-bold text-gray-900 text-lg mb-1 group-hover:text-blue-600 transition-colors">
                          {review.reviewerName}
                        </h4>
                        {(review.position || review.company) && (
                          <p className="text-sm text-gray-600 mb-2">
                            {review.position}{review.position && review.company ? ' at ' : ''}{review.company}
                          </p>
                        )}
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-0.5">
                            {renderStars(review.stars)}
                          </div>
                          <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                            {review.stars}.0
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="relative">
                      <p className="text-gray-700 leading-relaxed text-base mb-4">
                        {displayText}
                      </p>
                      {review.message && review.message.length > 200 && (
                        <Button 
                          onClick={() => toggleReview(review.id)}
                          className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm mt-2 transition-all bg-transparent hover:bg-blue-50 px-3 py-1.5 rounded-md -ml-3"
                        >
                          {isExpanded ? 'Show less' : 'Read more'}
                          <ChevronRight className={`w-4 h-4 ml-1 transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`} />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
            
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-10 pt-6 border-t border-gray-200">
              <Button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`flex items-center px-5 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                  currentPage === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-50'
                    : 'bg-white border-2 border-gray-200 text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 shadow-sm hover:shadow-md'
                }`}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              
              <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-10 h-10 rounded-lg font-semibold transition-all duration-200 ${
                      currentPage === page
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg scale-105'
                        : 'bg-white border-2 border-gray-200 text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 shadow-sm hover:shadow-md'
                    }`}
                  >
                    {page}
                  </Button>
                ))}
              </div>
              
              <Button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`flex items-center px-5 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                  currentPage === totalPages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-50'
                    : 'bg-white border-2 border-gray-200 text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 shadow-sm hover:shadow-md'
                }`}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      )}
    </div>
  )
}
