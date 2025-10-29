import { prisma } from '@/lib/prisma'
import { auth } from '@clerk/nextjs/server'

export async function GET() {
  // Protect test endpoint in production
  if (process.env.NODE_ENV === 'production') {
    const { userId } = await auth()
    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }
  
  try {
    if (!process.env.DATABASE_URL) {
      return Response.json({
        success: false,
        error: 'DATABASE_URL environment variable is not set',
        message: 'Database not configured'
      }, { status: 503 })
    }

    // Test the connection
    await prisma.$connect()

    // Test a simple query
    const userCount = await prisma.user.count()

    return Response.json({
      success: true,
      message: 'Database connection successful',
      userCount: userCount,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    let troubleshooting = []
    
    if (error.message.includes('Server selection timeout')) {
      troubleshooting.push('Check your MongoDB Atlas cluster status and network access settings')
      troubleshooting.push('Verify your IP address is whitelisted in MongoDB Atlas Network Access')
    }
    
    if (error.message.includes('InternalError')) {
      troubleshooting.push('This is likely an SSL/TLS configuration issue')
      troubleshooting.push('Try updating your connection string with ssl=true&authSource=admin')
    }

    return Response.json({
      success: false,
      error: error.message,
      message: 'Database connection failed',
      troubleshooting: troubleshooting
    }, { status: 503 })
  } finally {
    await prisma.$disconnect()
  }
}
