import { auth, createClerkClient } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function POST(request) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if DATABASE_URL is configured
    if (!process.env.DATABASE_URL) {
      return Response.json({ 
        error: 'Database not configured',
        message: 'Please set up your DATABASE_URL environment variable'
      }, { status: 503 })
    }

    const body = await request.json()
    const { firstName, lastName, email, username, avatar, accountStatus, linkedinUrl } = body

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (existingUser) {
      const updatedUser = await prisma.user.update({
        where: { clerkId: userId },
        data: {
          firstName,
          lastName,
          email,
          username,
          avatar,
          accountStatus: accountStatus || existingUser.accountStatus,
          linkedinUrl: linkedinUrl || existingUser.linkedinUrl,
          updatedAt: new Date()
        }
      })
      
      return Response.json({ 
        success: true, 
        user: updatedUser,
        message: 'User updated successfully' 
      })
    } else {
      // Create new user with default learner status
      const newUser = await prisma.user.create({
        data: {
          clerkId: userId,
          firstName,
          lastName,
          email,
          username,
          avatar,
          accountStatus: 'learner', // Default status for new users
          linkedinUrl: null
        }
      })
      
      return Response.json({ 
        success: true, 
        user: newUser,
        message: 'User created successfully' 
      })
    }
  } catch (error) {
    
    // Handle specific database connection errors
    if (error.message.includes('Server selection timeout') || error.code === 'P2010' || error.message.includes('DNS resolution')) {
      return Response.json({ 
        error: 'Database connection failed',
        message: 'Unable to connect to the database. Please check your connection settings.',
        details: 'Database connection issue - check your MongoDB Atlas connection string and network connectivity',
      }, { status: 503 })
    }
    
    return Response.json({ 
      error: 'Failed to sync user data',
      details: error.message 
    }, { status: 500 })
  }
}

export async function GET(request) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if DATABASE_URL is configured
    if (!process.env.DATABASE_URL) {
      return Response.json({ 
        error: 'Database not configured',
        message: 'Please set up your DATABASE_URL environment variable'
      }, { status: 503 })
    }

    // Get user data
    let user = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user) {
      // User doesn't exist, fetch their data from Clerk and create them
      try {
        const clerkClient = createClerkClient({
          secretKey: process.env.CLERK_SECRET_KEY
        })
        
        const clerkUser = await clerkClient.users.getUser(userId)
        
        user = await prisma.user.create({
          data: {
            clerkId: userId,
            email: clerkUser.emailAddresses[0]?.emailAddress || '',
            firstName: clerkUser.firstName || null,
            lastName: clerkUser.lastName || null,
            username: clerkUser.username || null,
            avatar: clerkUser.imageUrl || null,
            accountStatus: 'learner',
            linkedinUrl: null
          }
        })
       
      } catch (createError) {
        return Response.json({ 
          error: 'Failed to create user',
          details: createError.message 
        }, { status: 500 })
      }
    }

    return Response.json({ 
      success: true, 
      user 
    })
    } catch (error) {
    
    // Handle specific database connection errors
    if (error.message.includes('Server selection timeout') || error.code === 'P2010' || error.message.includes('DNS resolution')) {
      return Response.json({ 
        error: 'Database connection failed',
        message: 'Unable to connect to the database. Please check your connection settings.',
        details: 'Database connection issue - check your MongoDB Atlas connection string and network connectivity',
      }, { status: 503 })
    }
    
    return Response.json({ 
      error: 'Failed to fetch user data',
      details: error.message 
    }, { status: 500 })
  }
}
