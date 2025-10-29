import { auth } from '@clerk/nextjs/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { firstName, lastName, email, linkedinUrl } = body

    // Validate required fields
    if (!firstName || !lastName || !linkedinUrl) {
      return Response.json({ 
        error: 'Missing required fields: firstName, lastName, linkedinUrl' 
      }, { status: 400 })
    }

    const linkedinPattern = /^https:\/\/www\.linkedin\.com\/in\/[a-zA-Z0-9-]+\/?$/
    if (!linkedinPattern.test(linkedinUrl)) {
      return Response.json({ 
        error: 'Invalid LinkedIn URL format' 
      }, { status: 400 })
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    let updatedUser

    if (!existingUser) {
      // Create new user with expert status if they don't exist
      updatedUser = await prisma.user.create({
        data: {
          clerkId: userId,
          firstName,
          lastName,
          email: email || '', // Use provided email or empty string
          username: '', // Will be updated from Clerk metadata if needed
          avatar: '', // Will be updated from Clerk metadata if needed
          linkedinUrl,
          accountStatus: 'expert',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })
    } else {
      // Update existing user to expert status
      updatedUser = await prisma.user.update({
        where: { clerkId: userId },
        data: {
          firstName,
          lastName,
          linkedinUrl,
          accountStatus: 'expert',
          updatedAt: new Date()
        }
      })
    }

    return Response.json({ 
      success: true, 
      user: updatedUser,
      message: 'Successfully upgraded to expert status!' 
    })
  } catch (error) {
    console.error('Error updating to expert:', error)
    return Response.json({ 
      error: 'Failed to update expert status',
      details: error.message 
    }, { status: 500 })
  }
}
