import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function POST(request) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { 
      firstName, 
      lastName, 
      avatarUrl, 
      aboutMe, 
      position, 
      company, 
      bio, 
      linkedinUrl,
      instagramUrl,
      facebookUrl,
      twitterUrl,
      youtubeUrl,
      websiteUrl,
      reviews 
    } = await request.json()

    // Update user profile in database
    const updatedUser = await prisma.user.update({
      where: { clerkId: userId },
      data: {
        firstName: firstName || null,
        lastName: lastName || null,
        avatar: avatarUrl || null,
        aboutMe: aboutMe || null,
        position: position || null,
        company: company || null,
        bio: bio || null,
        linkedinUrl: linkedinUrl || null,
        instagramUrl: instagramUrl || null,
        facebookUrl: facebookUrl || null,
        twitterUrl: twitterUrl || null,
        youtubeUrl: youtubeUrl || null,
        websiteUrl: websiteUrl || null,
        reviewsData: reviews && Array.isArray(reviews) ? reviews : null
      }
    })

    if (reviews && Array.isArray(reviews)) {
      console.log('Reviews received and stored in database:', reviews.length, 'reviews')
    }

    console.log('Database profile updated successfully:', {
      userId,
      updatedUser: updatedUser.id,
      updatedFields: {
        firstName: firstName ? 'present' : 'empty',
        lastName: lastName ? 'present' : 'empty',
        avatarUrl: avatarUrl ? 'present' : 'empty',
        aboutMe: aboutMe ? 'present' : 'empty',
        position: position ? 'present' : 'empty',
        company: company ? 'present' : 'empty',
        bio: bio ? 'present' : 'empty',
        reviewsCount: reviews ? reviews.length : 0
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        avatar: updatedUser.avatar
      }
    })

  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}
