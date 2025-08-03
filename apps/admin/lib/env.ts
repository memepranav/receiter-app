import { z } from 'zod'

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().optional(),
  MONGODB_URI: z.string().optional(),
  REDIS_URL: z.string().optional(),
  
  // JWT
  JWT_SECRET: z.string().optional(),
  JWT_EXPIRES_IN: z.string().optional(),
  
  // Next.js
  NEXTAUTH_SECRET: z.string().optional(),
  NEXTAUTH_URL: z.string().url().optional(),
  
  // API
  API_BASE_URL: z.string().url().optional(),
  BACKEND_API_URL: z.string().url().optional(),
  API_PORT: z.string().optional(),
  ADMIN_PORT: z.string().optional(),
  
  // CORS
  CORS_ORIGINS: z.string().optional(),
  
  // Authentication
  ADMIN_EMAIL: z.string().email().optional(),
  ADMIN_PASSWORD: z.string().optional(),
  
  // Solana
  SOLANA_RPC_URL: z.string().url().optional(),
  SOLANA_NETWORK: z.string().optional(),
  SOLANA_PRIVATE_KEY: z.string().optional(),
  SOLANA_PUBLIC_KEY: z.string().optional(),
  
  // File Upload
  MAX_FILE_SIZE: z.string().optional(),
  UPLOAD_DIR: z.string().optional(),
  UPLOAD_PATH: z.string().optional(),
  
  // Email
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  
  // Rate Limiting
  RATE_LIMIT_WINDOW: z.string().optional(),
  RATE_LIMIT_MAX: z.string().optional(),
  
  // App
  NODE_ENV: z.enum(['development', 'production', 'test']).optional(),
  PORT: z.string().optional(),
  APP_NAME: z.string().optional(),
  APP_VERSION: z.string().optional(),
})

export function validateEnv() {
  try {
    return envSchema.parse(process.env)
  } catch (error) {
    console.error('❌ Invalid environment variables:', error)
    throw new Error('Invalid environment variables')
  }
}

export function getEnvVar(key: keyof z.infer<typeof envSchema>, defaultValue?: string): string {
  const value = process.env[key] || defaultValue
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
  return value
}

export function getOptionalEnvVar(key: keyof z.infer<typeof envSchema>, defaultValue?: string): string | undefined {
  return process.env[key] || defaultValue
}