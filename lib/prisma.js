import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis

// Helper function to normalize DATABASE_URL for MongoDB Atlas
function normalizeDatabaseUrl(url) {
  if (!url) {
    console.error('❌ DEBUG [Prisma]: DATABASE_URL is empty or undefined')
    return url
  }
  
  // Log connection string info (masked for security)
  const maskedUrl = url.replace(/:[^:@]+@/, ':****@')
  console.log(`🔍 DEBUG [Prisma]: Processing connection string: ${maskedUrl.substring(0, 50)}...`)
  console.log(`🔍 DEBUG [Prisma]: Connection string type: ${url.startsWith('mongodb+srv://') ? 'mongodb+srv' : url.startsWith('mongodb://') ? 'mongodb' : 'unknown'}`)
  
  // If it's already a MongoDB connection string, ensure it has proper SSL settings
  if (url.startsWith('mongodb://') || url.startsWith('mongodb+srv://')) {
    const originalUrl = url
    
    // Add connection parameters if not present
    if (!url.includes('?')) {
      url += '?retryWrites=true&w=majority&serverSelectionTimeoutMS=30000&socketTimeoutMS=30000'
      console.log('🔍 DEBUG [Prisma]: Added connection parameters (no existing query params)')
    } else {
      // Add missing parameters
      if (!url.includes('serverSelectionTimeoutMS')) {
        url += '&serverSelectionTimeoutMS=30000'
      }
      if (!url.includes('socketTimeoutMS')) {
        url += '&socketTimeoutMS=30000'
      }
      if (!url.includes('retryWrites')) {
        url += '&retryWrites=true'
      }
      if (!url.includes('w=majority')) {
        url += '&w=majority'
      }
      console.log('🔍 DEBUG [Prisma]: Enhanced existing connection parameters')
    }
    
    // Ensure SSL settings are configured for Atlas
    if (url.startsWith('mongodb+srv://')) {
      // mongodb+srv already uses TLS by default
      console.log('✅ DEBUG [Prisma]: Using mongodb+srv (TLS enabled by default)')
      if (!url.includes('retryWrites')) {
        url += (url.includes('?') ? '&' : '?') + 'retryWrites=true&w=majority'
      }
    } else if (url.startsWith('mongodb://')) {
      // For standard mongodb://, ensure TLS is enabled
      if (!url.includes('tls=true') && !url.includes('ssl=true')) {
        url += (url.includes('?') ? '&' : '?') + 'tls=true'
        console.log('⚠️ DEBUG [Prisma]: Added TLS=true to mongodb:// connection')
      }
    }
    
    if (originalUrl !== url) {
      const maskedNewUrl = url.replace(/:[^:@]+@/, ':****@')
      console.log(`✅ DEBUG [Prisma]: Normalized connection string: ${maskedNewUrl.substring(0, 60)}...`)
    }
  } else {
    console.warn('⚠️ DEBUG [Prisma]: Connection string does not start with mongodb:// or mongodb+srv://')
  }
  
  return url
}

const databaseUrl = normalizeDatabaseUrl(process.env.DATABASE_URL)

if (!databaseUrl) {
  console.error('❌ DEBUG [Prisma]: DATABASE_URL is not set in environment variables')
  console.error('❌ DEBUG [Prisma]: Environment:', process.env.NODE_ENV)
  console.error('❌ DEBUG [Prisma]: Available env vars:', Object.keys(process.env).filter(k => k.includes('DATABASE')))
}

export const prisma = globalForPrisma.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'production' 
    ? ['error', 'warn'] 
    : ['error', 'warn', 'query'], // Enable query logging in dev
  errorFormat: 'pretty',
  datasources: {
    db: {
      url: databaseUrl
    }
  },
})

console.log(`✅ DEBUG [Prisma]: PrismaClient initialized (${process.env.NODE_ENV || 'development'})`)

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Add connection retry logic with better error handling
export async function connectWithRetry(maxRetries = 3, retryDelay = 2000) {
  const env = process.env.NODE_ENV || 'development'
  const timestamp = new Date().toISOString()
  
  console.log(`🔍 DEBUG [Prisma]: Attempting database connection (${env}) at ${timestamp}`)
  console.log(`🔍 DEBUG [Prisma]: DATABASE_URL present: ${!!process.env.DATABASE_URL}`)
  
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set in environment variables')
  }
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      console.log(`🔍 DEBUG [Prisma]: Connection attempt ${i + 1}/${maxRetries} starting...`)
      const startTime = Date.now()
      
      await prisma.$connect()
      
      const connectionTime = Date.now() - startTime
      console.log(`✅ DEBUG [Prisma]: Database connected successfully in ${connectionTime}ms`)
      console.log(`✅ DEBUG [Prisma]: Connection established at ${new Date().toISOString()}`)
      
      // Test a simple query to verify connection
      try {
        await prisma.$queryRaw`SELECT 1`
        console.log(`✅ DEBUG [Prisma]: Connection verified with test query`)
      } catch (queryError) {
        console.warn(`⚠️ DEBUG [Prisma]: Connection established but test query failed:`, queryError.message)
      }
      
      return true
    } catch (error) {
      const errorDetails = {
        message: error.message,
        code: error.code,
        name: error.name,
        attempt: i + 1,
        maxRetries,
        timestamp: new Date().toISOString(),
        environment: env
      }
      
      console.error(`❌ DEBUG [Prisma]: Database connection attempt ${i + 1}/${maxRetries} failed:`, errorDetails)
      
      // Log specific error types
      if (error.message?.includes('Server selection timeout')) {
        console.error('❌ DEBUG [Prisma]: Server selection timeout - MongoDB Atlas may be unreachable')
        console.error('❌ DEBUG [Prisma]: Check: 1) Network Access in MongoDB Atlas, 2) Connection string format')
      }
      if (error.message?.includes('InternalError') || error.message?.includes('fatal alert')) {
        console.error('❌ DEBUG [Prisma]: SSL/TLS handshake failed')
        console.error('❌ DEBUG [Prisma]: Check: 1) Connection string uses mongodb+srv://, 2) Network firewall allows TLS')
      }
      if (error.message?.includes('authentication failed')) {
        console.error('❌ DEBUG [Prisma]: Authentication failed - check username/password in connection string')
      }
      
      if (i === maxRetries - 1) {
        console.error('❌ DEBUG [Prisma]: All database connection attempts failed')
        console.error('❌ DEBUG [Prisma]: Final error details:', JSON.stringify(errorDetails, null, 2))
        throw error
      }
      
      // Exponential backoff: 2s, 4s, 8s
      const delay = retryDelay * Math.pow(2, i)
      console.log(`⏳ DEBUG [Prisma]: Retrying connection in ${delay}ms... (exponential backoff)`)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  return false
}

// Graceful shutdown
if (typeof process !== 'undefined') {
  process.on('beforeExit', async () => {
    await prisma.$disconnect()
  })
}
