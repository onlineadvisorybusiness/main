import { auth, createClerkClient } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function POST(request) {
  try {
    const { userId } = await auth()
    
    console.log('[SYNC-POST] Starting user sync for userId:', userId)
    
    if (!userId) {
      console.log('[SYNC-POST] Unauthorized: No userId found')
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if DATABASE_URL is configured
    if (!process.env.DATABASE_URL) {
      console.error('[SYNC-POST] Database not configured: DATABASE_URL missing')
      return Response.json({ 
        error: 'Database not configured',
        message: 'Please set up your DATABASE_URL environment variable'
      }, { status: 503 })
    }

    const body = await request.json()
    const { firstName, lastName, email, username, avatar, accountStatus, linkedinUrl } = body
    
    console.log('[SYNC-POST] Received data:', {
      userId,
      email,
      username,
      accountStatus,
      hasAvatar: !!avatar
    })

    // Check if user exists
    console.log('[SYNC-POST] Checking if user exists in database...')
    const existingUser = await prisma.user.findUnique({
      where: { clerkId: userId }
    })
    
    console.log('[SYNC-POST] User exists:', !!existingUser)

    if (existingUser) {
      console.log('[SYNC-POST] Updating existing user in database...')
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
      
      console.log('[SYNC-POST] User updated successfully:', {
        id: updatedUser.id,
        clerkId: updatedUser.clerkId,
        email: updatedUser.email,
        username: updatedUser.username,
        accountStatus: updatedUser.accountStatus,
        updatedAt: updatedUser.updatedAt
      })
      
      return Response.json({ 
        success: true, 
        user: updatedUser,
        message: 'User updated successfully' 
      })
    } else {
      // Create new user with default learner status
      console.log('[SYNC-POST] Creating new user in database...')
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
      
      console.log('[SYNC-POST] User created successfully:', {
        id: newUser.id,
        clerkId: newUser.clerkId,
        email: newUser.email,
        username: newUser.username,
        accountStatus: newUser.accountStatus,
        createdAt: newUser.createdAt
      })
      
      return Response.json({ 
        success: true, 
        user: newUser,
        message: 'User created successfully' 
      })
    }
  } catch (error) {
    console.error('[SYNC-POST] Error syncing user:', {
      error: error.message,
      code: error.code,
      name: error.name,
      stack: error.stack
    })
    
    // Handle specific database connection errors
    if (error.message.includes('Server selection timeout') || error.code === 'P2010' || error.message.includes('DNS resolution') || error.message.includes('fatal alert')) {
      console.error('[SYNC-POST] Database connection error detected:', {
        errorCode: error.code,
        hasTLS: error.message.includes('fatal alert') || error.message.includes('SSL') || error.message.includes('TLS'),
        hasTimeout: error.message.includes('timeout'),
        hasDNS: error.message.includes('DNS'),
        connectionString: process.env.DATABASE_URL ? `${process.env.DATABASE_URL.substring(0, 20)}...` : 'NOT SET'
      })
      
      const isTLSError = error.message.includes('fatal alert');
      console.error('[SYNC-POST] TLS Error troubleshooting:', {
        likelyCause: 'MongoDB Atlas Network Access blocking connections',
        action: 'Check MongoDB Atlas → Network Access → Add IP Address: Allow 0.0.0.0/0 for testing'
      });
      
      return Response.json({ 
        error: 'Database connection failed',
        message: 'Unable to connect to the database. Please check your connection settings.',
        details: isTLSError 
          ? 'SSL/TLS handshake failed - MongoDB Atlas is likely blocking the connection. Check Network Access settings.'
          : 'Database connection issue - check your MongoDB Atlas connection string and network connectivity',
        errorType: isTLSError ? 'SSL/TLS Error' : 'Connection Timeout',
        troubleshooting: isTLSError ? [
          'MongoDB Atlas → Network Access → Add IP Address → Allow 0.0.0.0/0 (or whitelist Vercel IP ranges)',
          'Verify connection string: mongodb+srv://user:pass@cluster.net/database?params',
          'Check MongoDB Atlas cluster is running and healthy',
          'Verify database user permissions'
        ] : []
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
    
    console.log('[SYNC-GET] Fetching user data for userId:', userId)
    
    if (!userId) {
      console.log('[SYNC-GET] Unauthorized: No userId found')
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if DATABASE_URL is configured
    if (!process.env.DATABASE_URL) {
      console.error('[SYNC-GET] Database not configured: DATABASE_URL missing')
      return Response.json({ 
        error: 'Database not configured',
        message: 'Please set up your DATABASE_URL environment variable'
      }, { status: 503 })
    }

    // Get user data
    console.log('[SYNC-GET] Querying database for user...')
    let user = await prisma.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user) {
      console.log('[SYNC-GET] User not found in database, creating from Clerk data...')
      // User doesn't exist, fetch their data from Clerk and create them
      try {
        const clerkClient = createClerkClient({
          secretKey: process.env.CLERK_SECRET_KEY
        })
        
        const clerkUser = await clerkClient.users.getUser(userId)
        console.log('[SYNC-GET] Fetched Clerk user data, creating in database...')
        
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
        
        console.log('[SYNC-GET] User created successfully:', {
          id: user.id,
          clerkId: user.clerkId,
          email: user.email,
          username: user.username,
          accountStatus: user.accountStatus,
          createdAt: user.createdAt
        })
       
      } catch (createError) {
        console.error('[SYNC-GET] Error creating user from Clerk:', {
          error: createError.message,
          code: createError.code
        })
        return Response.json({ 
          error: 'Failed to create user',
          details: createError.message 
        }, { status: 500 })
      }
    } else {
      console.log('[SYNC-GET] User found in database:', {
        id: user.id,
        clerkId: user.clerkId,
        email: user.email,
        username: user.username,
        accountStatus: user.accountStatus
      })
    }

    return Response.json({ 
      success: true, 
      user 
    })
  } catch (error) {
    console.error('[SYNC-GET] Error fetching user:', {
      error: error.message,
      code: error.code,
      name: error.name,
      stack: error.stack
    })
    
    // Handle specific database connection errors
    if (error.message.includes('Server selection timeout') || error.code === 'P2010' || error.message.includes('DNS resolution') || error.message.includes('fatal alert')) {
      console.error('[SYNC-GET] Database connection error detected:', {
        errorCode: error.code,
        hasTLS: error.message.includes('fatal alert') || error.message.includes('SSL') || error.message.includes('TLS'),
        hasTimeout: error.message.includes('timeout'),
        hasDNS: error.message.includes('DNS'),
        connectionString: process.env.DATABASE_URL ? `${process.env.DATABASE_URL.substring(0, 20)}...` : 'NOT SET'
      })
      
      const isTLSError = error.message.includes('fatal alert');
      console.error('[SYNC-GET] TLS Error troubleshooting:', {
        likelyCause: 'MongoDB Atlas Network Access blocking connections',
        action: 'Check MongoDB Atlas → Network Access → Add IP Address: Allow 0.0.0.0/0 for testing'
      });
      
      return Response.json({ 
        error: 'Database connection failed',
        message: 'Unable to connect to the database. Please check your connection settings.',
        details: isTLSError 
          ? 'SSL/TLS handshake failed - MongoDB Atlas is likely blocking the connection. Check Network Access settings.'
          : 'Database connection issue - check your MongoDB Atlas connection string and network connectivity',
        errorType: isTLSError ? 'SSL/TLS Error' : 'Connection Timeout',
        troubleshooting: isTLSError ? [
          'MongoDB Atlas → Network Access → Add IP Address → Allow 0.0.0.0/0 (or whitelist Vercel IP ranges)',
          'Verify connection string: mongodb+srv://user:pass@cluster.net/database?params',
          'Check MongoDB Atlas cluster is running and healthy',
          'Verify database user permissions'
        ] : []
      }, { status: 503 })
    }
    
    return Response.json({ 
      error: 'Failed to fetch user data',
      details: error.message 
    }, { status: 500 })
  }
}
