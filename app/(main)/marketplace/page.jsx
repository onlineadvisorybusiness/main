import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Star, Crown, CircleArrowRight, Building2, TrendingUp, Laptop, DollarSign, Target, Users, Rocket, Smartphone, Handshake, Settings } from 'lucide-react'
import NextImage from 'next/image'
import { Button } from '@/components/ui/button'
import { prisma } from '@/lib/prisma'

export default async function MarketplacePage() {
  const { userId } = await auth()

  if (!userId) {
    redirect('/auth/sign-in')
  }

  let experts = []
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error('Database not configured')
    }
      
    const expertUsers = await prisma.user.findMany({
      where: { 
        accountStatus: 'expert'
      },
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        avatar: true,
        linkedinUrl: true,
        aboutMe: true,
        position: true,
        company: true,
        bio: true,
        reviewsData: true,
        topAdvisor: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { createdAt: 'desc' }
    })


    experts = await Promise.all(
      expertUsers.map(async (expert) => {
        const sessions = await prisma.session.findMany({
          where: { 
            expertId: expert.id,
            status: 'active'
          },
          select: {
            id: true,
            eventName: true,
            prices: true,
            currency: true,
            categories: true,
            type: true
          }
        })

        let averagePrice = 0
        if (sessions.length > 0) {
          const totalPrice = sessions.reduce((sum, session) => {
            let prices = session.prices
            if (typeof prices === 'string') {
              try {
                prices = JSON.parse(prices)
              } catch (e) {
                prices = {}
              }
            }
            const priceKeys = Object.keys(prices)
            if (priceKeys.length > 0) {
              const sessionAvg = Object.values(prices).reduce((s, price) => s + (parseFloat(price) || 0), 0) / priceKeys.length
              return sum + (sessionAvg || 0)
            }
            return sum
          }, 0)
          averagePrice = Math.round(totalPrice / sessions.length)
        }

        let averageRating = 5.0 // Default rating if no reviews
        if (expert.reviewsData && Array.isArray(expert.reviewsData) && expert.reviewsData.length > 0) {
          const totalStars = expert.reviewsData.reduce((sum, review) => sum + (review.stars || 5), 0)
          averageRating = Math.round((totalStars / expert.reviewsData.length) * 10) / 10 // Round to 1 decimal place
        }

        return {
          ...expert,
          name: `${expert.firstName || ''} ${expert.lastName || ''}`.trim() || expert.username,
          sessionsCount: sessions.length,
          averagePrice: averagePrice,
          averageRating: averageRating,
          categories: [...new Set(sessions.flatMap(s => s.categories || [s.category].filter(Boolean)))],
          sessionTypes: [...new Set(sessions.map(s => s.type))],
          title: expert.position || "Expert Advisor",
          company: expert.company || "",
          bio: expert.bio || "",
          aboutMe: expert.aboutMe || "",
          reviews: expert.reviewsData || []
        }
      }))

    experts = experts.filter(expert => expert.sessionsCount > 0)
      
  } catch (error) {
    if (error.message.includes('Server selection timeout') || error.message.includes('Database not configured') || error.message.includes('DNS resolution')) {
      experts = []
    }
  }

  const allCategories = [...new Set(experts.flatMap(expert => expert.categories || []))]
  
  const categoryDefinitions = {
    "business": {
      title: "Business Strategy",
      description: "Strategic planning, business development, and growth strategies.",
      icon: Building2
    },
    "career": {
      title: "Career Development", 
      description: "Career guidance, professional growth, and skill development.",
      icon: TrendingUp
    },
    "technology": {
      title: "Technology & Innovation",
      description: "Tech strategy, product development, and digital transformation.",
      icon: Laptop
    },
    "finance": {
      title: "Finance & Investment",
      description: "Financial planning, investment strategies, and funding advice.",
      icon: DollarSign
    },
    "marketing": {
      title: "Marketing & Growth",
      description: "Marketing strategies, brand building, and customer acquisition.",
      icon: Target
    },
    "leadership": {
      title: "Leadership & Management",
      description: "Team building, leadership development, and organizational growth.",
      icon: Users
    },
    "startup": {
      title: "Startup & Entrepreneurship",
      description: "Startup advice, fundraising, and entrepreneurial guidance.",
      icon: Rocket
    },
    "product": {
      title: "Product Management",
      description: "Product strategy, development, and management expertise.",
      icon: Smartphone
    },
    "sales": {
      title: "Sales & Business Development",
      description: "Sales strategies, business development, and revenue growth.",
      icon: Handshake
    },
    "operations": {
      title: "Operations & Management",
      description: "Operational efficiency, process optimization, and management.",
      icon: Settings
    }
  }

  // Build dynamic categories based on actual data from database
  const expertCategories = allCategories
    .map(categoryId => ({
      id: categoryId,
      title: categoryDefinitions[categoryId]?.title || categoryId.charAt(0).toUpperCase() + categoryId.slice(1),
      description: categoryDefinitions[categoryId]?.description || `Expert guidance in ${categoryId}`,
      icon: categoryDefinitions[categoryId]?.icon || Building2,
      experts: experts.filter(expert => expert.categories?.includes(categoryId))
    }))
    .filter(category => category.experts.length > 0) // Only show categories with experts
    .sort((a, b) => b.experts.length - a.experts.length) // Sort by number of experts

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="bg-gradient-to-r from-white via-gray-50/30 to-white border-b border-gray-200/50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="mb-8">
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 tracking-tight" style={{ fontFamily: 'var(--font-playfair)' }}>
                Find an Expert. <span className="text-blue-600">Book a Session.</span>
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed" style={{ fontFamily: 'var(--font-switzer)' }}>
                Connect with world-class advisors and get personalized guidance<br />
                for your business challenges.
              </p>
            </div>
            
            <div className="max-w-3xl mx-auto">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                  <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search by name, expertise, or industry..."
                  className="w-full pl-16 pr-6 py-5 text-lg border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all duration-200 shadow-sm hover:shadow-md"
                />
                <Button 
                  className=" text-lg absolute right-2 top-2 bottom-2 h-auto bg-blue-600 hover:bg-blue-700 text-white px-8 py-5 rounded-xl font-semibold transition-colors duration-200 shadow-lg hover:shadow-xl"
                >
                  Search
                </Button>
              </div>
            </div>
          </div>
            </div>
          </div>
          
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {expertCategories.length === 0 ? (
            <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No experts available</h3>
            <p className="text-gray-600">No experts have published sessions yet. Check back later!</p>
            </div>
        ) : (
          expertCategories.map((category, categoryIndex) => (
            <div key={category.id} className="mb-24">
              {/* Category Header */}
              <div className="mb-12">
              <div className="flex items-center justify-between">
                <div className="flex items-center group">
                  <div className="w-16 h-16 bg-gradient-to-br from-gray-50 to-white rounded-xl shadow-lg border border-gray-200/50 flex items-center justify-center mr-6 group-hover:shadow-xl transition-all duration-300">
                    <category.icon className="w-8 h-8 text-gray-800 group-hover:text-blue-600 transition-colors duration-300" />
                  </div>
                  <div>
                    <div className="flex items-center mb-2">
                      <h2 className="text-3xl font-bold text-gray-900 mr-3" style={{ fontFamily: 'var(--font-playfair)' }}>{category.title}</h2>
                    </div>
                    <p className="text-gray-600 text-lg max-w-2xl" style={{ fontFamily: 'var(--font-switzer)' }}>{category.description}</p>
                  </div>
                </div>
                <Button href={`/marketplace/category/${category.id}`} className="hidden md:flex items-center text-blue-600 hover:text-blue-700 font-semibold text-sm transition-colors cursor-pointer bg-gray-50 hover:bg-gray-50">
                  View all
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Button>
              </div>
            </div>
            
            {category.experts.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {category.experts.map((expert) => (
                    <Link key={expert.id} href={`/marketplace/${expert.username}`}>
                  <Card className="group hover:scale-105 transition-transform duration-300 hover:border-gray-200 cursor-pointer h-full overflow-hidden rounded-xl py-0">
                    <CardContent className="p-0">
                      <div className="relative">
                        <NextImage
                          src={expert.avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=256&fit=crop&crop=face"}
                          alt={expert.name}
                          width={400}
                          height={256}
                          quality={100}
                          className="w-full h-64 object-cover"
                          style={{ objectPosition: 'center top' }}
                        />
                          {expert.topAdvisor === "true" && (
                            <Badge className="absolute top-4 right-4 bg-amber-500 hover:bg-amber-600 text-white border-0 shadow-lg transition-colors duration-200 flex items-center gap-1.5">
                              <Crown className="w-3 h-3" />
                              Top Advisor
                            </Badge>
                          )}
                      </div>
            
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-gray-900 text-2xl leading-tight" style={{ fontFamily: 'var(--font-playfair)' }}>{expert.name}</h3>
                            {expert.isVerified === "true" && (
                              <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                            <div className="flex items-center bg-yellow-50 px-2 py-1 rounded-full">
                              <Star className="w-4 h-4 text-yellow-500 mr-1 fill-current" />
                               <span className="text-gray-900 text-sm font-semibold" style={{ fontFamily: 'var(--font-switzer)' }}>{expert.averageRating}</span>
                             </div>
                        </div>

                        {/* Bio */}
                   <p className="text-gray-700 text-xs leading-relaxed mb-1" style={{ fontFamily: 'var(--font-switzer)' }}>
                          {expert.bio || `${expert.title || 'Expert Advisor'}${expert.company ? ` at ${expert.company}` : ''}`}
                        </p>
                        
                        <p className="text-gray-600 text-xs leading-relaxed mb-2 line-clamp-2" style={{ fontFamily: 'var(--font-switzer)' }}>
                          {expert.aboutMe || 'Professional advisor with extensive experience in their field.'}
                        </p>

                        <div className="flex items-baseline justify-between">
                          <div>
                            <span className="text-gray-900 font-bold text-2xl">${expert.averagePrice || 100}</span>
                            <span className="text-gray-500 text-xs ml-1" style={{ fontFamily: 'var(--font-switzer)' }}>per 30 minute session</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link> 
                ))}
              </div>
            )}
            
            {category.experts.length > 0 && (
              <div className="text-center pt-4">
                <Link href={`/marketplace/category/${category.id}`} className="inline-flex items-center text-blue-600 hover:text-blue-700 font-semibold text-base transition-colors duration-200 group cursor-pointer">
                  View all experts in {category.title}
                  <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
            </div>
          )}
        </div>
          ))
        )}
      </div>
    </div>
  )
} 