export const config = {
  // Database
  database: {
    url: process.env.DATABASE_URL || process.env.MONGODB_URI || 'mongodb://localhost:27017/quran-reciter',
    mongodbUri: process.env.MONGODB_URI || process.env.DATABASE_URL || 'mongodb://localhost:27017/quran-reciter',
  },
  
  // API
  api: {
    baseUrl: process.env.API_BASE_URL || 'http://localhost:3003',
    backendUrl: process.env.BACKEND_API_URL || 'http://localhost:3003/api',
    port: parseInt(process.env.API_PORT || '3003'),
  },
  
  // Authentication
  auth: {
    jwtSecret: process.env.JWT_SECRET || 'default-jwt-secret',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    nextAuthSecret: process.env.NEXTAUTH_SECRET || 'default-nextauth-secret',
    nextAuthUrl: process.env.NEXTAUTH_URL || 'http://localhost:3002',
    adminEmail: process.env.ADMIN_EMAIL || 'admin@reciters.com',
    adminPassword: process.env.ADMIN_PASSWORD || 'admin123',
  },
  
  // CORS
  cors: {
    origins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3002'],
  },
  
  // Solana
  solana: {
    rpcUrl: process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com',
    network: process.env.SOLANA_NETWORK || 'devnet',
    privateKey: process.env.SOLANA_PRIVATE_KEY || '',
    publicKey: process.env.SOLANA_PUBLIC_KEY || '',
  },
  
  // File Upload
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB
    uploadDir: process.env.UPLOAD_DIR || './uploads',
    uploadPath: process.env.UPLOAD_PATH || '/opt/quran-reciter-app/uploads',
  },
  
  // Email
  email: {
    host: process.env.SMTP_HOST || '',
    port: parseInt(process.env.SMTP_PORT || '587'),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
  
  // Redis
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },
  
  // Rate Limiting
  rateLimit: {
    window: parseInt(process.env.RATE_LIMIT_WINDOW || '900000'), // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX || '100'),
  },
  
  // App
  app: {
    name: process.env.APP_NAME || 'Quran Reciter Admin',
    version: process.env.APP_VERSION || '1.0.0',
    port: parseInt(process.env.PORT || process.env.ADMIN_PORT || '3002'),
    nodeEnv: process.env.NODE_ENV || 'development',
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production',
  },
} as const