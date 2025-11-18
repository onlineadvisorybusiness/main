import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { Building2, TrendingUp, Laptop, DollarSign, Target, Users, Rocket, Smartphone, Handshake, Settings } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { MarketplaceContent } from './MarketplaceContent'

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
            const priceKeys = Object.keys(prices)
            if (priceKeys.length > 0) {
              const sessionAvg = Object.values(prices).reduce((s, price) => s + (parseFloat(price) || 0), 0) / priceKeys.length
              return sum + (sessionAvg || 0)
            }
            return sum
          }, 0)
          averagePrice = Math.round(totalPrice / sessions.length)
          // Get minimum 15-minute price
          if (all15MinPrices.length > 0) {
            min15MinPrice = Math.min(...all15MinPrices)
          }
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
      iconName: categoryId, 
      experts: experts.filter(expert => expert.categories?.includes(categoryId))
    }))
    .filter(category => category.experts.length > 0) // Only show categories with experts
    .sort((a, b) => b.experts.length - a.experts.length) // Sort by number of experts

  return <MarketplaceContent expertCategories={expertCategories} />
} 