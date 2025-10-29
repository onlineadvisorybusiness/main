import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        avatar: true,
        accountStatus: true,
        username: true,
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
        createdAt: true,
        updatedAt: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    console.log('Profile data fetched from database:', {
      userId,
      user: user.id,
      hasProfileData: !!(user.aboutMe || user.position || user.company || user.bio)
    })

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        avatar: user.avatar,
        accountStatus: user.accountStatus,
        username: user.username,
        linkedinUrl: user.linkedinUrl,
        instagramUrl: user.instagramUrl,
        facebookUrl: user.facebookUrl,
        twitterUrl: user.twitterUrl,
        youtubeUrl: user.youtubeUrl,
        websiteUrl: user.websiteUrl,
        aboutMe: user.aboutMe,
        position: user.position,
        company: user.company,
        bio: user.bio,
        reviewsData: user.reviewsData,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    })

  } catch (error) {
    console.error('Get profile error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}
