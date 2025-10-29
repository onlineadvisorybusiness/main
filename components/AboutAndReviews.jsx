'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Star, CircleUser, Briefcase, Target, Zap, MessageSquare, DollarSign, BookOpen } from 'lucide-react'
import { Button } from './ui/button'

export function AboutAndReviews({ expert }) {
  const [showFullAbout, setShowFullAbout] = useState(false)
  const [expandedReviews, setExpandedReviews] = useState({})
  const [currentPage, setCurrentPage] = useState(1)
  
  const reviewsPerPage = 6
  const totalPages = Math.ceil(expert.reviews.length / reviewsPerPage)
  const startIndex = (currentPage - 1) * reviewsPerPage
  const endIndex = startIndex + reviewsPerPage
  const currentReviews = expert.reviews.slice(startIndex, endIndex)

  const toggleReview = (reviewId) => {
    setExpandedReviews(prev => ({
      ...prev,
      [reviewId]: !prev[reviewId]
    }))
  }

  const renderStars = (rating) => {
    const stars = []
    
    for (let i = 0; i < rating; i++) {
      stars.push(
        <svg key={i} className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
        </svg>
      )
    }
    
    return stars
  }

  const aboutMeParts = expert.aboutMe.split('\n\n')
  const displayedAbout = showFullAbout ? expert.aboutMe : aboutMeParts.slice(0, 3).join('\n\n')

  return (
    <div className="space-y-12">
      <Card className="bg-white shadow-sm border-0">
        <CardContent className="p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">About Me</h2>
            <a href={expert.linkedinUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              LinkedIn
            </a>
          </div>
          
          <div className="prose prose-lg prose-gray max-w-none">
            {showFullAbout ? (
              <div>
                <p className="text-gray-700 leading-relaxed mb-6 text-lg">
                  {aboutMeParts[0]}
                </p>
                <div className="mb-8">
                  {aboutMeParts[1]?.split('\n').map((line, index) => (
                    <p key={index} className="text-gray-700 leading-relaxed mb-3 text-lg">
                      {line}
                    </p>
                  ))}
                </div>
                <p className="text-gray-700 leading-relaxed mb-8 text-lg">
                  {aboutMeParts[2]}
                </p>
              </div>
            ) : (
              <div>
                <p className="text-gray-700 leading-relaxed mb-6 text-lg">
                  {aboutMeParts[0]}
                </p>
                <div className="mb-8">
                  {aboutMeParts[1]?.split('\n').map((line, index) => (
                    <p key={index} className="text-gray-700 leading-relaxed mb-3 text-lg">
                      {line}
                    </p>
                  ))}
                </div>
                <p className="text-gray-700 leading-relaxed mb-8 text-lg">
                  {aboutMeParts[2]}
                </p>
              </div>
            )}
            
            <Button 
              onClick={() => setShowFullAbout(!showFullAbout)}
              className="inline-flex items-center text-blue-600 hover:text-blue-700 font-semibold text-sm transition-colors bg-transparent hover:bg-transparent"
            >
              {showFullAbout ? 'Show less' : 'Read more'}
              <svg className={`w-4 h-4 ml-1 transition-transform ${showFullAbout ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Button>
          </div>

          {/* Selected Categories */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Areas of Expertise</h3>
            <div className="flex flex-wrap gap-3">
              {expert.categories && expert.categories.length > 0 ? (
                expert.categories.map((category, index) => {
                  // Map category values to display names and icons
                  const categoryInfo = {
                    'business': { label: 'Business Strategy', icon: Briefcase, color: 'from-blue-50 to-indigo-50 text-blue-700 border-blue-200' },
                    'career': { label: 'Career Development', icon: Target, color: 'from-green-50 to-emerald-50 text-green-700 border-green-200' },
                    'technology': { label: 'Technology', icon: Zap, color: 'from-purple-50 to-violet-50 text-purple-700 border-purple-200' },
                    'marketing': { label: 'Marketing', icon: MessageSquare, color: 'from-orange-50 to-amber-50 text-orange-700 border-orange-200' },
                    'finance': { label: 'Finance', icon: DollarSign, color: 'from-yellow-50 to-lime-50 text-yellow-700 border-yellow-200' },
                    'education': { label: 'Education', icon: BookOpen, color: 'from-pink-50 to-rose-50 text-pink-700 border-pink-200' }
                  }
                  
                  const info = categoryInfo[category] || { label: category, icon: Briefcase, color: 'from-gray-50 to-slate-50 text-gray-700 border-gray-200' }
                  const IconComponent = info.icon
                  
                  return (
                    <span key={index} className={`bg-gradient-to-r ${info.color} text-sm font-semibold px-4 py-2 rounded-full border flex items-center gap-2`}>
                      <IconComponent className="h-4 w-4" />
                      {info.label}
                    </span>
                  )
                })
              ) : (
                <span className="text-gray-500 text-sm">No categories selected</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reviews Section */}
      <Card className="bg-white shadow-sm border-0">
        <CardContent className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
                <Star className="flex items-center gap-2 w-5 h-5 text-yellow-500 fill-current" />
                <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-900"> Voices of Excellence ({expert.reviews.length})</h2>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              {expert.reviews.length > 6 && (
              <Button className="inline-flex items-center text-blue-600 hover:text-blue-700 font-semibold transition-colors bg-transparent hover:bg-transparent">
                View All 
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {currentReviews.map((review) => {
              const isExpanded = expandedReviews[review.id]
              const displayText = isExpanded ? review.message : 
                (review.message && review.message.length > 200 ? `${review.message.substring(0, 200)}...` : review.message)
              
              return (
                <Card key={review.id} className="bg-gray-50 border-0 hover:shadow-md transition-all duration-200">
                  <CardContent className="p-6">
                    <div className="flex items-start mb-4">
                      {review.reviewerAvatar ? (
                        <img
                          src={review.reviewerAvatar}
                          alt={review.reviewerName}
                          className="w-14 h-14 rounded-full mr-4 object-cover border-2 border-white shadow-sm"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center mr-4 border-2 border-white shadow-sm">
                          <span className="text-blue-600 font-bold text-lg">{review.reviewerName?.charAt(0) || 'U'}</span>
                        </div>
                      )}
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900 text-base mb-1">{review.reviewerName}</h4>
                        <div className="flex items-center mb-2">
                          <div className="flex items-center gap-1">
                            {renderStars(review.stars)}
                          </div>
                          <span className="text-gray-500 text-sm ml-3">
                            {new Date(review.feedbackDate).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-700 leading-relaxed text-base">
                      {displayText}
                    </p>
                    {review.message && review.message.length > 200 && (
                      <Button 
                        onClick={() => toggleReview(review.id)}
                        className="inline-flex items-center text-blue-600 hover:text-blue-700 font-semibold mt-3 transition-colors bg-transparent hover:bg-transparent"
                      >
                        {isExpanded ? 'Show less' : 'Read more'}
                        <svg className={`w-3 h-3 ml-1 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-8">
              <Button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentPage === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Previous
              </Button>
              
              <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded-lg font-medium transition-colors ${
                      currentPage === page
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </Button>
                ))}
              </div>
              
              <Button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentPage === totalPages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Next
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
