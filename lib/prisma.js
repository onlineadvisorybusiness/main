import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis

// Helper function to normalize DATABASE_URL for MongoDB Atlas
function normalizeDatabaseUrl(url) {
  if (!url) return url
  
  // If it's already a MongoDB connection string, ensure it has proper SSL settings
  if (url.startsWith('mongodb://') || url.startsWith('mongodb+srv://')) {
    // Add connection parameters if not present
    if (!url.includes('?')) {
      url += '?retryWrites=true&w=majority'
    }
    
    // Ensure SSL settings are configured for Atlas
    if (url.startsWith('mongodb+srv://')) {
      // mongodb+srv already uses TLS by default
      if (!url.includes('retryWrites')) {
        url += (url.includes('?') ? '&' : '?') + 'retryWrites=true&w=majority'
      }
    }
  }
  
  return url
}

export const prisma = globalForPrisma.prisma || new PrismaClient({
  log: ['error', 'warn'], // Removed 'query' to reduce console noise
  errorFormat: 'pretty',
  datasources: {
    db: {
      url: normalizeDatabaseUrl(process.env.DATABASE_URL)
    }
  },
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Add connection retry logic with better error handling
export async function connectWithRetry(maxRetries = 3, retryDelay = 2000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await prisma.$connect()
      console.log('✅ Database connected successfully')
      return true
    } catch (error) {
      console.error(`❌ Database connection attempt ${i + 1}/${maxRetries} failed:`, error.message)
      
      if (i === maxRetries - 1) {
        console.error('❌ All database connection attempts failed')
        throw error
      }
      
      // Exponential backoff: 2s, 4s, 8s
      const delay = retryDelay * Math.pow(2, i)
      console.log(`⏳ Retrying connection in ${delay}ms...`)
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
