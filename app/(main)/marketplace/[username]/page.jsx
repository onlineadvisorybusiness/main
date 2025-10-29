import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BookingSection } from '@/components/BookingSection'
import { AboutAndReviews } from '@/components/AboutAndReviews'
import { Crown, CheckCircle, ArrowLeft } from 'lucide-react'
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
      isTopAdvisor: expertInfo.topAdvisor === "true", 
      isVerified: expertInfo.isVerified === "true",   
      aboutMe: expertInfo.aboutMe || "",
      linkedinUrl: expertInfo.linkedinUrl || "",
      instagramUrl: expertInfo.instagramUrl || "",
      facebookUrl: expertInfo.facebookUrl || "",
      twitterUrl: expertInfo.twitterUrl || "",
      youtubeUrl: expertInfo.youtubeUrl || "",
      websiteUrl: expertInfo.websiteUrl || "",
      categories: allCategories,
      expertise: ["Business Strategy", "Career Development", "Personal Growth"],
      adviceOn: [],
      reviews: expertInfo.reviewsData || [] 
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        <div className="mb-8">
          <BackButton />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          <div className="lg:col-span-1">
            <Card className="bg-white shadow-lg border-0 sticky top-8">
              <CardContent className="p-0">

                <div className="relative -mt-6">
                  <div className={`h-40 relative overflow-hidden rounded-t-lg ${
                    expert.isTopAdvisor 
                      ? 'bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500' 
                      : expert.isVerified 
                        ? 'bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600'
                        : 'bg-gradient-to-br from-green-500 via-emerald-600 to-teal-600'
                  }`}>

                    <div className="absolute inset-0 opacity-20">
                      <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent"></div>
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full -translate-y-16 translate-x-16"></div>
                      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/20 rounded-full translate-y-12 -translate-x-12"></div>
                    </div>
                    

                    <div className="absolute inset-0 flex items-center justify-center">
                    </div>
                  </div>
                  
                  <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
                    <img
                      src={expert.avatar}
                      alt={expert.name}
                      className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-white shadow-lg"
                    />
                  </div>
                </div>

                <div className="pt-20 pb-8 px-8 text-center">
                  <div className="flex items-center justify-center mb-1">
                    <h1 className="text-2xl font-bold text-gray-900">{expert.name}</h1>
                    <div className="flex items-center ml-2 mt-2">
                      {expert.isVerified && (
                        <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                      {expert.isTopAdvisor && (                        
                        <div 
                          className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center ml-1 cursor-help"
                          title="Top Advisor"
                        >
                          <Crown className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {expert.bio && (
                    <div className="mb-4 text-center">
                      <p className="text-gray-700 text-sm leading-relaxed px-4">
                        {expert.bio}
                      </p>
                    </div>
                  )}
                  
                    {(() => {
                      const socialLinks = [
                        expert.linkedinUrl && expert.linkedinUrl !== "#",
                        expert.instagramUrl && expert.instagramUrl !== "#",
                        expert.facebookUrl && expert.facebookUrl !== "#",
                        expert.twitterUrl && expert.twitterUrl !== "#",
                        expert.youtubeUrl && expert.youtubeUrl !== "#",
                        expert.websiteUrl && expert.websiteUrl !== "#"
                      ].filter(Boolean);
                      
                      if (socialLinks.length === 0) return null;
                      
                      return (
                        <div className="mb-6">
                          <div className="relative">
                            <div className="absolute inset-0"></div>
                            <div className="relative p-6">
                              <div className="text-center mb-6">
                                <h3 className="text-lg font-semibold text-gray-900" style={{ fontFamily: 'var(--font-playfair)' }}>
                                  Connect me through -
                                </h3>
                              </div>
                                                    
                              <div className={`grid gap-4 ${
                                socialLinks.length === 1 ? 'grid-cols-1 justify-items-center' :
                                socialLinks.length === 2 ? 'grid-cols-2' :
                                socialLinks.length === 3 ? 'grid-cols-3' :
                                socialLinks.length === 4 ? 'grid-cols-2' :
                                socialLinks.length === 5 ? 'grid-cols-3' :
                                socialLinks.length === 6 ? 'grid-cols-3' :
                                'grid-cols-3'
                              }`}>
                            {expert.linkedinUrl && expert.linkedinUrl !== "#" && (
                            <a href={expert.linkedinUrl} target="_blank" rel="noopener noreferrer" className="group relative">
                              <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 hover:from-blue-100 hover:to-blue-200/70 border border-blue-200/30 hover:border-blue-300/50 rounded-xl p-4 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 hover:-translate-y-0.5">
                                <div className="flex flex-col items-center space-y-2">
                                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                                    </svg>
                                  </div>
                                  <span className="text-xs font-medium text-gray-700 group-hover:text-blue-700 transition-colors">LinkedIn</span>
                                </div>
                              </div>
                            </a>
                            )}

                            {expert.instagramUrl && expert.instagramUrl !== "#" && (
                            <a href={expert.instagramUrl} target="_blank" rel="noopener noreferrer" className="group relative">
                              <div className="bg-gradient-to-br from-pink-50 to-purple-100/50 hover:from-pink-100 hover:to-purple-200/70 border border-pink-200/30 hover:border-pink-300/50 rounded-xl p-4 transition-all duration-300 hover:shadow-lg hover:shadow-pink-500/10 hover:-translate-y-0.5">
                                <div className="flex flex-col items-center space-y-2">
                                  <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                                    </svg>
                                  </div>
                                  <span className="text-xs font-medium text-gray-700 group-hover:text-pink-700 transition-colors">Instagram</span>
                                </div>
                              </div>
                            </a>
                            )}

                            {expert.facebookUrl && expert.facebookUrl !== "#" && (
                            <a href={expert.facebookUrl} target="_blank" rel="noopener noreferrer" className="group relative">
                              <div className="bg-gradient-to-br from-blue-50 to-indigo-100/50 hover:from-blue-100 hover:to-indigo-200/70 border border-blue-200/30 hover:border-blue-300/50 rounded-xl p-4 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 hover:-translate-y-0.5">
                                <div className="flex flex-col items-center space-y-2">
                                  <div className="w-8 h-8 bg-blue-700 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                    </svg>
                                  </div>
                                  <span className="text-xs font-medium text-gray-700 group-hover:text-blue-700 transition-colors">Facebook</span>
                                </div>
                              </div>
                            </a>
                            )}

                            {expert.twitterUrl && expert.twitterUrl !== "#" && (
                            <a href={expert.twitterUrl} target="_blank" rel="noopener noreferrer" className="group relative">
                              <div className="bg-gradient-to-br from-gray-100 to-slate-100/50 hover:from-gray-100 hover:to-slate-200/70 border border-gray-200/30 hover:border-gray-300/50 rounded-xl p-4 transition-all duration-300 hover:shadow-lg hover:shadow-gray-500/10 hover:-translate-y-0.5">
                                <div className="flex flex-col items-center space-y-2">
                                  <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                                    </svg>
                                  </div>
                                  <span className="text-xs font-medium text-gray-700 group-hover:text-gray-800 transition-colors">X</span>
                                </div>
                              </div>
                            </a>
                            )}

                            {expert.youtubeUrl && expert.youtubeUrl !== "#" && (
                            <a href={expert.youtubeUrl} target="_blank" rel="noopener noreferrer" className="group relative">
                              <div className="bg-gradient-to-br from-red-50 to-rose-100/50 hover:from-red-100 hover:to-rose-200/70 border border-red-200/30 hover:border-red-300/50 rounded-xl p-4 transition-all duration-300 hover:shadow-lg hover:shadow-red-500/10 hover:-translate-y-0.5">
                                <div className="flex flex-col items-center space-y-2">
                                  <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                                    </svg>
                                  </div>
                                  <span className="text-xs font-medium text-gray-700 group-hover:text-red-700 transition-colors">YouTube</span>
                                </div>
                              </div>
                            </a>
                            )}

                            {expert.websiteUrl && expert.websiteUrl !== "#" && (
                            <a href={expert.websiteUrl} target="_blank" rel="noopener noreferrer" className="group relative">
                              <div className="bg-gradient-to-br from-emerald-50 to-teal-100/50 hover:from-emerald-100 hover:to-teal-200/70 border border-emerald-200/30 hover:border-emerald-300/50 rounded-xl p-4 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/10 hover:-translate-y-0.5">
                                <div className="flex flex-col items-center space-y-2">
                                  <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                                    </svg>
                                  </div>
                                  <span className="text-xs font-medium text-gray-700 group-hover:text-emerald-700 transition-colors">Website</span>
                                </div>
                              </div>
                            </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    );
                    })()}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <AboutAndReviews expert={expert} />
          </div>
        </div>

        <BookingSection expert={expert} sessions={sessions} />
      </div>
    </div>
  )
}
