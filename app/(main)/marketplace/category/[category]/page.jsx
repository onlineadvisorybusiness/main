import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Star, Crown, ArrowLeft, Building2, TrendingUp, Laptop, DollarSign, Target, Users, Rocket, Smartphone, Handshake, Settings } from 'lucide-react'
import NextImage from 'next/image'
import { prisma } from '@/lib/prisma'

export default async function CategoryPage({ params }) {
  const { userId } = await auth()

  if (!userId) {
    redirect('/auth/sign-in')
  }

  const resolvedParams = await params
  const categoryId = resolvedParams.category

  let experts = []
  let categoryTitle = categoryId.charAt(0).toUpperCase() + categoryId.slice(1)

  try {
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
            status: 'active',
            categories: { has: categoryId }
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

        if (sessions.length === 0) return null

        let averagePrice = 0
        let min15MinPrice = null
        if (sessions.length > 0) {
          const all15MinPrices = []
          const totalPrice = sessions.reduce((sum, session) => {
            let prices = session.prices
            if (typeof prices === 'string') {
              try {
                prices = JSON.parse(prices)
              } catch (e) {
                prices = {}
              }
            }
            // Get 15-minute price if available
            if (prices['15']) {
              all15MinPrices.push(parseFloat(prices['15']) || 0)
            }
            const sessionAvg = Object.values(prices).reduce((s, price) => s + (parseFloat(price) || 0), 0) / Object.keys(prices).length
            return sum + (sessionAvg || 0)
          }, 0)
          averagePrice = Math.round(totalPrice / sessions.length)
          // Get minimum 15-minute price
          if (all15MinPrices.length > 0) {
            min15MinPrice = Math.min(...all15MinPrices)
          }
        }

        let averageRating = 5.0
        if (expert.reviewsData && Array.isArray(expert.reviewsData) && expert.reviewsData.length > 0) {
          const totalStars = expert.reviewsData.reduce((sum, review) => sum + (review.stars || 5), 0)
          averageRating = Math.round((totalStars / expert.reviewsData.length) * 10) / 10
        }

        return {
          ...expert,
          name: `${expert.firstName || ''} ${expert.lastName || ''}`.trim() || expert.username,
          sessionsCount: sessions.length,
          averagePrice: averagePrice,
          min15MinPrice: min15MinPrice,
          averageRating: averageRating,
          categories: [...new Set(sessions.flatMap(s => s.categories || [s.category].filter(Boolean)))],
          sessionTypes: [...new Set(sessions.map(s => s.type))],
          title: expert.position || "Expert Advisor",
          company: expert.company || "",
          bio: expert.bio || "",
          aboutMe: expert.aboutMe || "",
          reviews: expert.reviewsData || []
        }
      })
    )

    experts = experts.filter(expert => expert !== null)

  } catch (error) {
    experts = []
  }

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

  const categoryInfo = categoryDefinitions[categoryId] || {
    title: categoryTitle,
    description: `Expert guidance in ${categoryId}`,
    icon: Building2
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="bg-gradient-to-r from-white via-gray-50/30 to-white border-b border-gray-200/50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-4 mb-8">
            <Link 
              href="/marketplace" 
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Marketplace
            </Link>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-50 to-white rounded-xl shadow-lg border border-gray-200/50 flex items-center justify-center mr-6">
                <categoryInfo.icon className="w-8 h-8 text-gray-800" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'var(--font-playfair)' }}>
                  {categoryInfo.title}
                </h1>
                <p className="text-gray-600 text-lg">
                  {categoryInfo.description}
                </p>
              </div>
            </div>
            
            <div className="text-gray-500 text-sm">
              {experts.length} expert{experts.length !== 1 ? 's' : ''} available
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {experts.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No experts available</h3>
            <p className="text-gray-600">No experts have published sessions in this category yet. Check back later!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {experts.map((expert) => (
              <Link key={expert.id} href={`/marketplace/${expert.username}`}>
                <Card className="group hover:scale-105 transition-transform duration-300 cursor-pointer h-full overflow-hidden rounded-xl py-0 border-0 !shadow-none">
                  <CardContent className="p-0">
                    <div className="relative rounded-t-xl overflow-hidden">
                      <NextImage
                        src={expert.avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=256&fit=crop&crop=face"}
                        alt={expert.name}
                        width={400}
                        height={256}
                        quality={100}
                        className="w-full h-64 object-cover rounded-t-xl"
                        style={{ objectPosition: 'center top' }}
                      />
                      {expert.topAdvisor === "true" && (
                        <Badge className="absolute top-4 right-4 bg-amber-500 hover:bg-amber-600 text-white border-0 shadow-lg transition-colors duration-200 flex items-center gap-1.5">
                          <Crown className="w-3 h-3" />
                          Top Advisor
                        </Badge>
                      )}
                    </div>
          
                    <div className="p-2">
                      <div className="flex items-start justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-gray-900 text-2xl leading-tight" style={{ fontFamily: 'var(--font-playfair)' }}>{expert.name}</h3>
                          {expert.isVerified === "true" && (
                            <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-500 mr-1 fill-current" />
                          <span className="text-gray-900 text-sm font-semibold">{(expert.averageRating || 5.0).toFixed(1)}</span>
                        </div>
                      </div>
                          
                      <p className="text-gray-700 text-xs leading-relaxed line-clamp-2 mb-1">
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
    </div>
  )
}