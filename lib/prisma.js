import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis

export const prisma = globalForPrisma.prisma || new PrismaClient({
  log: ['error', 'warn'],
  errorFormat: 'pretty',
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  },
  // Add connection pool settings for better reliability
  __internal: {
    engine: {
      connectTimeout: 60000,
      pool_timeout: 60000,
    }
  }
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Add connection retry logic
export async function connectWithRetry(maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await prisma.$connect()
      return true
    } catch (error) {
      if (i === maxRetries - 1) {
        throw error
      }
      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000))
    }
  }
  return false
}
