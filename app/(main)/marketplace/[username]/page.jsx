import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BookingSection } from '@/components/BookingSection'
import { AboutAndReviews } from '@/components/AboutAndReviews'
import { Crown } from 'lucide-react'
import BackButton from './BackButton'
import { prisma } from '@/lib/prisma'

export default async function ExpertProfilePage({ params }) {
  const { userId } = await auth()

  if (!userId) {
    redirect('/auth/sign-in')
  }

  const resolvedParams = await params
  const username = resolvedParams.username

  
  let expert = null
  let sessions = []
  let expertInfo = null
  let clerkUser = null

  try {
    
    expertInfo = await prisma.user.findUnique({
      where: { 
        username: username,
        accountStatus: 'expert'
      },
      select: {
        id: true,
        username: true,
        firstName: true,
        lastName: true,
        avatar: true,
        linkedinUrl: true,
        instagramUrl: true,
        facebookUrl: true,
        twitterUrl: true,
        youtubeUrl: true,
        websiteUrl: true,
        aboutMe: true,
        position: true,
        company: true,
        bio: true,
        reviewsData: true,
        timezone: true,
        reviews: {
          select: {
            id: true,
            reviewerName: true,
            reviewerAvatar: true,
            position: true,
            company: true,
            message: true,
            stars: true,
            source: true,
            feedbackDate: true,
            createdAt: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        isVerified: true,
        topAdvisor: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if (!expertInfo) {
    } else {
      
      try {
        clerkUser = {
          firstName: expertInfo.firstName,
          lastName: expertInfo.lastName,
          imageUrl: expertInfo.avatar,
          publicMetadata: expertInfo.publicMetadata || {}
        }
      } catch (clerkError) {
      }

      sessions = await prisma.session.findMany({
        where: { 
          expertId: expertInfo.id,
          status: 'active'
        },
        select: {
          id: true,
          eventName: true,
          type: true,
          platform: true,
          categories: true,
          prices: true,
          currency: true,
          advicePoints: true,
          status: true,
          timezone: true,
          createdAt: true,
          updatedAt: true
        },
        orderBy: { createdAt: 'desc' }
      })

    }
  } catch (error) {
  }

  
  if (!expertInfo) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Expert not found</h1>
          <p className="text-gray-600 mt-2">The expert you're looking for doesn't exist or hasn't published any sessions yet.</p>
        </div>
      </div>
    )
  } else {
    
    const allCategories = [...new Set(sessions.flatMap(s => s.categories || [s.category].filter(Boolean)))]

    expert = {
      id: expertInfo.id,
      username: expertInfo.username,
      name: `${expertInfo.firstName || ''} ${expertInfo.lastName || ''}`.trim() || expertInfo.username,
      title: expertInfo.position || "", 
      company: expertInfo.company || "",
      bio: expertInfo.bio || "",
      rating: 5.0, 
      price: 75, 
      avatar: expertInfo.avatar || "",
      isTopAdvisor: expertInfo.topAdvisor === true || expertInfo.topAdvisor === "true" || expertInfo.topAdvisor === 1, 
      isVerified: expertInfo.isVerified === true || expertInfo.isVerified === "true" || expertInfo.isVerified === 1,   
      aboutMe: expertInfo.aboutMe || "",
      linkedinUrl: expertInfo.linkedinUrl || "",
      instagramUrl: expertInfo.instagramUrl || "",
      facebookUrl: expertInfo.facebookUrl || "",
      twitterUrl: expertInfo.twitterUrl || "",
      youtubeUrl: expertInfo.youtubeUrl || "",
      websiteUrl: expertInfo.websiteUrl || "",
      timezone: expertInfo.timezone || 'UTC',
      categories: allCategories,
      expertise: ["Business Strategy", "Career Development", "Personal Growth"],
      adviceOn: [],
      reviews: (expertInfo.reviews && Array.isArray(expertInfo.reviews) && expertInfo.reviews.length > 0) 
        ? expertInfo.reviews 
        : (Array.isArray(expertInfo.reviewsData) ? expertInfo.reviewsData : []) 
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        <div className="mb-8">
          <BackButton />
        </div>

        <BookingSection expert={expert} sessions={sessions} />

        <AboutAndReviews expert={expert} />
        
        
      </div>
    </div>
  )
}
