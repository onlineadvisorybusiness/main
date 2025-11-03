import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis

function normalizeDatabaseUrl(url) {  
  
  if (url.startsWith('mongodb://') || url.startsWith('mongodb+srv://')) {
    const originalUrl = url
    
    try {
      const urlObj = new URL(url);
      const params = urlObj.searchParams;
      
      const pathname = urlObj.pathname;
      const databaseName = pathname && pathname !== '/' ? pathname.substring(1) : null;
            
      if (!params.has('retryWrites')) {
        params.set('retryWrites', 'true');
      }
      if (!params.has('w')) {
        params.set('w', 'majority');
      }
      
      if (!params.has('serverSelectionTimeoutMS')) {
        params.set('serverSelectionTimeoutMS', '30000');
      }
      if (!params.has('socketTimeoutMS')) {
        params.set('socketTimeoutMS', '30000');
      }
      if (!params.has('connectTimeoutMS')) {
        params.set('connectTimeoutMS', '30000');
      }
      
      if (!params.has('maxPoolSize')) {
        params.set('maxPoolSize', '5'); 
      }
      if (!params.has('minPoolSize')) {
        params.set('minPoolSize', '0'); 
      }
      if (!params.has('maxIdleTimeMS')) {
        params.set('maxIdleTimeMS', '10000'); 
      }
      
      if (!params.has('maxConnecting')) {
        params.set('maxConnecting', '2'); 
      }
      
      if (url.startsWith('mongodb+srv://')) {
        if (!params.has('tlsAllowInvalidCertificates')) {
        }
      }
      
      if (!params.has('heartbeatFrequencyMS')) {
        params.set('heartbeatFrequencyMS', '10000'); 
      }
      
      if (!params.has('directConnection')) {
      }
      
      if (!params.has('appName')) {
        params.set('appName', 'onlineadvisorybusiness');
      }      
      urlObj.search = params.toString();
      url = urlObj.toString();
      
      if (originalUrl !== url) {
        const maskedNewUrl = url.replace(/:[^:@]+@/, ':****@')
      } 
    } catch (parseError) {      
      if (!url.includes('?')) {
        url += '?retryWrites=true&w=majority&serverSelectionTimeoutMS=30000&socketTimeoutMS=30000&connectTimeoutMS=30000&maxPoolSize=10&minPoolSize=1&maxIdleTimeMS=30000'
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
        }
      }
      
      if (url.startsWith('mongodb+srv://')) {
        } else if (url.startsWith('mongodb://')) {
        if (!url.includes('tls=true') && !url.includes('ssl=true')) {
          url += (url.includes('?') ? '&' : '?') + 'tls=true'
        }
      }
    }
  } else {
  }
  
  return url
}

const databaseUrl = normalizeDatabaseUrl(process.env.DATABASE_URL)

export const prisma = globalForPrisma.prisma || new PrismaClient({
  log: ['error', 'warn'],
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

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
} else {
  globalForPrisma.prisma = prisma;
  
  prisma.$connect().then(() => {
  }).catch((error) => {
  });
}

export async function connectWithRetry(maxRetries = 3, retryDelay = 2000) {
  const env = process.env.NODE_ENV || 'development'
  
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set in environment variables')
  }
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      const startTime = Date.now()
      
      await prisma.$connect()
      
      const connectionTime = Date.now() - startTime         
      
      
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
                  
      const delay = retryDelay * Math.pow(2, i) 
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  return false
}

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
