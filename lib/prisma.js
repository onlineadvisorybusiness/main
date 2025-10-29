import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis

// Helper function to normalize DATABASE_URL for MongoDB Atlas + Prisma (serverless optimized)
function normalizeDatabaseUrl(url) {
  if (!url) {
    console.error('❌ DEBUG [Prisma]: DATABASE_URL is empty or undefined')
    return url
  }
  
  const maskedUrl = url.replace(/:[^:@]+@/, ':****@')
  console.log(`🔍 DEBUG [Prisma]: Processing connection string: ${maskedUrl.substring(0, 50)}...`)
  console.log(`🔍 DEBUG [Prisma]: Connection string type: ${url.startsWith('mongodb+srv://') ? 'mongodb+srv' : url.startsWith('mongodb://') ? 'mongodb' : 'unknown'}`)
  
  // If it's already a MongoDB connection string, ensure it has proper SSL settings
  if (url.startsWith('mongodb://') || url.startsWith('mongodb+srv://')) {
    const originalUrl = url
    
    try {
      // Use URL parsing for proper parameter handling
      const urlObj = new URL(url);
      const params = urlObj.searchParams;
      
      // Verify database name is present (REQUIRED by Prisma)
      const pathname = urlObj.pathname;
      const databaseName = pathname && pathname !== '/' ? pathname.substring(1) : null;
      
      if (!databaseName || databaseName.trim() === '') {
        console.error('❌ DEBUG [Prisma]: CRITICAL: Database name is MISSING from connection string!');
        console.error('❌ DEBUG [Prisma]: Prisma REQUIRES a database name for MongoDB');
        console.error('❌ DEBUG [Prisma]: Current format: mongodb+srv://user:pass@cluster.net');
        console.error('❌ DEBUG [Prisma]: REQUIRED format: mongodb+srv://user:pass@cluster.net/DATABASE_NAME?params');
        console.error('❌ DEBUG [Prisma]: Please update your DATABASE_URL environment variable to include the database name');
        console.error('❌ DEBUG [Prisma]: This is likely causing the TLS/connection errors you are experiencing');
      } else {
        console.log(`✅ DEBUG [Prisma]: Database name detected: ${databaseName}`);
      }
      
      // MongoDB Atlas + Prisma recommended parameters (per documentation)
      if (!params.has('retryWrites')) {
        params.set('retryWrites', 'true');
      }
      if (!params.has('w')) {
        params.set('w', 'majority');
      }
      
      // Timeout settings for serverless environments (Vercel/similar)
      if (!params.has('serverSelectionTimeoutMS')) {
        params.set('serverSelectionTimeoutMS', '30000');
      }
      if (!params.has('socketTimeoutMS')) {
        params.set('socketTimeoutMS', '30000');
      }
      if (!params.has('connectTimeoutMS')) {
        params.set('connectTimeoutMS', '30000');
      }
      
      // Connection pooling for serverless (critical for Prisma + MongoDB Atlas)
      // Reduced pool size for serverless to avoid TLS issues
      if (!params.has('maxPoolSize')) {
        params.set('maxPoolSize', '5'); // Reduced for serverless (was 10)
      }
      if (!params.has('minPoolSize')) {
        params.set('minPoolSize', '0'); // Allow pool to shrink to 0 in serverless
      }
      if (!params.has('maxIdleTimeMS')) {
        params.set('maxIdleTimeMS', '10000'); // Reduced idle time (was 30000)
      }
      
      // Connection lifetime for serverless (prevents stale connections)
      if (!params.has('maxConnecting')) {
        params.set('maxConnecting', '2'); // Limit simultaneous connection attempts
      }
      
      if (url.startsWith('mongodb+srv://')) {
        if (!params.has('tlsAllowInvalidCertificates')) {
        }
      }
      
      // Heartbeat settings to detect dead connections faster
      if (!params.has('heartbeatFrequencyMS')) {
        params.set('heartbeatFrequencyMS', '10000'); // Check connection health more frequently
      }
      
      // Additional parameters that can help with TLS issues in serverless
      if (!params.has('directConnection')) {
      }
      
      if (!params.has('appName')) {
        params.set('appName', 'onlineadvisorybusiness');
      }      
      urlObj.search = params.toString();
      url = urlObj.toString();
      
      if (originalUrl !== url) {
        const maskedNewUrl = url.replace(/:[^:@]+@/, ':****@')
        console.log(`✅ DEBUG [Prisma]: Normalized connection string with MongoDB Atlas best practices`)
        console.log(`✅ DEBUG [Prisma]: Added: retryWrites, w=majority, timeouts, connection pooling`)
      } else {
        console.log(`✅ DEBUG [Prisma]: Connection string already has all recommended parameters`)
      }
    } catch (parseError) {
      console.warn('⚠️ DEBUG [Prisma]: URL parsing failed, using fallback method:', parseError.message);
      
      if (!url.includes('?')) {
        url += '?retryWrites=true&w=majority&serverSelectionTimeoutMS=30000&socketTimeoutMS=30000&connectTimeoutMS=30000&maxPoolSize=10&minPoolSize=1&maxIdleTimeMS=30000'
        console.log('🔍 DEBUG [Prisma]: Added connection parameters (fallback method)')
      } else {
        const paramsToAdd = [];
        if (!url.includes('serverSelectionTimeoutMS')) paramsToAdd.push('serverSelectionTimeoutMS=30000');
        if (!url.includes('socketTimeoutMS')) paramsToAdd.push('socketTimeoutMS=30000');
        if (!url.includes('connectTimeoutMS')) paramsToAdd.push('connectTimeoutMS=30000');
        if (!url.includes('retryWrites')) paramsToAdd.push('retryWrites=true');
        if (!url.includes('w=majority')) paramsToAdd.push('w=majority');
        if (!url.includes('maxPoolSize')) paramsToAdd.push('maxPoolSize=10');
        if (!url.includes('minPoolSize')) paramsToAdd.push('minPoolSize=1');
        if (!url.includes('maxIdleTimeMS')) paramsToAdd.push('maxIdleTimeMS=30000');
        
        if (paramsToAdd.length > 0) {
          url += '&' + paramsToAdd.join('&');
          console.log('🔍 DEBUG [Prisma]: Enhanced existing connection parameters (fallback)')
        }
      }
      
      if (url.startsWith('mongodb+srv://')) {
        console.log('✅ DEBUG [Prisma]: Using mongodb+srv (TLS enabled by default)')
      } else if (url.startsWith('mongodb://')) {
        if (!url.includes('tls=true') && !url.includes('ssl=true')) {
          url += (url.includes('?') ? '&' : '?') + 'tls=true'
          console.log('⚠️ DEBUG [Prisma]: Added TLS=true to mongodb:// connection')
        }
      }
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
    : ['error', 'warn', 'query'],
  errorFormat: 'pretty',
  datasources: {
    db: {
      url: databaseUrl
    }
  },
  transactionOptions: {
    maxWait: 20000,
    timeout: 30000,
  },
  __internal: {
    engine: {
      binaryTargets: ['native'],
    },
  }
})

console.log(`✅ DEBUG [Prisma]: PrismaClient initialized (${process.env.NODE_ENV || 'development'})`)

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
} else {
  globalForPrisma.prisma = prisma;
  
  console.log('[PRISMA] Initializing Prisma client for production');
  console.log('[PRISMA] DATABASE_URL configured:', !!process.env.DATABASE_URL);
  
  prisma.$connect().then(() => {
    console.log('[PRISMA] Successfully connected to database');
  }).catch((error) => {
    console.error('[PRISMA] Initial connection failed:', {
      code: error.code,
      message: error.message?.substring(0, 200),
      hasTLS: error.message?.includes('fatal alert') || error.message?.includes('SSL') || error.message?.includes('TLS')
    });
  });
}

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

// Graceful shutdown handlers
if (!globalForPrisma.prismaCleanupAdded) {
  globalForPrisma.prismaCleanupAdded = true;
  
  if (typeof process !== 'undefined') {
  process.on('beforeExit', async () => {
      await prisma.$disconnect();
  });

  process.on('SIGINT', async () => {
      await prisma.$disconnect();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
      await prisma.$disconnect();
    process.exit(0);
  });
  }
}
