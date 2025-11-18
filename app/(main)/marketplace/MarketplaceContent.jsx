'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Star, Crown, CircleArrowRight, BadgeCheck } from 'lucide-react'
import NextImage from 'next/image'
import { Button } from '@/components/ui/button'
import { SearchInput } from './SearchInput'
import { useState, useMemo } from 'react'

export function MarketplaceContent({ expertCategories: initialCategories }) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredCategories = useMemo(() => {
    if (!searchQuery) {
      return initialCategories
    }

    const query = searchQuery.toLowerCase().trim()
    
    return initialCategories
      .map(category => {
        const filteredExperts = category.experts.filter(expert => {
          const name = expert.name?.toLowerCase() || ''
          const bio = expert.bio?.toLowerCase() || ''
          const company = expert.company?.toLowerCase() || ''
          const aboutMe = expert.aboutMe?.toLowerCase() || ''
          const title = expert.title?.toLowerCase() || ''
          const categories = expert.categories?.join(' ').toLowerCase() || ''
          
          return name.includes(query) ||
                 bio.includes(query) ||
                 company.includes(query) ||
                 aboutMe.includes(query) ||
                 title.includes(query) ||
                 categories.includes(query)
        })
        
        return {
          ...category,
          experts: filteredExperts
        }
      })
      .filter(category => category.experts.length > 0)
  }, [searchQuery, initialCategories])

  return (
    <div className="min-h-screen bg-white">
      <div>
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-16">
          <div className="text-center">
            <div className="mb-10">
              <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-6 tracking-tight">
                Find an Expert. Book a Session.
              </h1>
            </div>
            
            <div className="max-w-3xl mx-auto">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                  <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <SearchInput onSearch={setSearchQuery} />
              </div>
            </div>
          </div>
        </div>
      </div>
          
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-12">
        {filteredCategories.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchQuery ? 'No experts found' : 'No experts available'}
            </h3>
            <p className="text-gray-600">
              {searchQuery 
                ? `No experts match your search "${searchQuery}". Try a different search term.`
                : 'No experts have published sessions yet. Check back later!'}
            </p>
          </div>
        ) : (
          filteredCategories.map((category) => (
            <div key={category.id} className="mb-6">
              <div className="mb-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center group">
                    <div>
                      <div className="flex items-center">
                            <div className="flex items-center mb-1">
                                <h2 className="text-2xl font-semibold text-gray-900 mr-3">{category.title}</h2>
                            </div>
                            <Link 
                              href={`/marketplace/category/${category.id}`}
                              className="cursor-pointer hover:opacity-80 transition-opacity focus:outline-none inline-flex"
                            >
                                <CircleArrowRight className="w-6 h-6 text-gray-800 hover:text-blue-600 transition-colors duration-300" />
                            </Link>
                        </div>
                      <p className="text-gray-600 text-lg max-w-2xl">{category.description}</p>
                    </div>                    
                  </div>
                </div>
              </div>
            
              {category.experts.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                  {category.experts.map((expert) => (
                    <Link key={expert.id} href={`/marketplace/${expert.username}`}>
                      <Card className="group hover:scale-105 transition-transform duration-300 cursor-pointer h-full overflow-hidden py-0 border-0 !shadow-none">
                        <CardContent className="p-0">
                          <div className="relative rounded-2xl overflow-hidden border-2 border-gray-200">
                            <NextImage
                              src={expert.avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=256&fit=crop&crop=face"}
                              alt={expert.name}
                              width={400}
                              height={256}
                              quality={100}
                              className="w-full h-56 object-cover rounded-xl"
                              style={{ objectPosition: 'center top' }}
                            />
                            {(expert.topAdvisor === true || expert.topAdvisor === "true" || expert.topAdvisor === 1) && (
                              <div className="absolute top-2 left-2 z-20">
                                <Badge className="bg-amber-500 hover:bg-amber-600 text-white border-0 shadow-lg transition-colors duration-200 flex items-center gap-1.5 px-2 py-1">
                                  <Crown className="w-3 h-3" />
                                  <span className="text-xs text-white font-semibold">Top Advisor</span>
                                </Badge>
                              </div>
                            )}  
                          </div>
            
                          <div className="p-2">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-2">
                                <h3 className="text-gray-900 font-semibold text-lg leading-tight">{expert.name}</h3>
                                {expert.isVerified === "true" && (
                                  <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                  </svg>
                                )}
                              </div>
                            </div>

                            <p className="text-gray-700 text-sm leading-relaxed line-clamp-2 mb-1">
                            {expert.bio || `${expert.title || 'Expert Advisor'}${expert.company ? ` at ${expert.company}` : ''}`}
                            </p>
                            
                            <div className="flex items-baseline justify-between">
                              <div>
                                <span className="text-gray-900 font-bold text-2xl">${expert.min15MinPrice || expert.averagePrice || 100}</span>
                                <span className="text-gray-500 text-xs ml-1">Starting from</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link> 
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

