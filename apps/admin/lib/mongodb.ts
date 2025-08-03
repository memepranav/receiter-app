import { MongoClient, Db } from 'mongodb'

// MongoDB connection configuration
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017'
const MONGODB_DB = process.env.MONGODB_DB || 'quran_reciter'

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable')
}

if (!MONGODB_DB) {
  throw new Error('Please define the MONGODB_DB environment variable')
}

interface CachedConnection {
  client: MongoClient
  db: Db
}

// In development, the MongoDB connection is cached on the global object
// to prevent creating multiple connections during hot reloads
let cached: CachedConnection | null = null

if (process.env.NODE_ENV === 'development') {
  if (!(global as any)._mongoClientPromise) {
    (global as any)._mongoClientPromise = null
  }
}

export async function connectToDatabase(): Promise<CachedConnection> {
  if (cached) {
    return cached
  }

  if (!cached) {
    const client = new MongoClient(MONGODB_URI, {
      // Connection options
    })

    await client.connect()
    const db = client.db(MONGODB_DB)

    cached = {
      client,
      db,
    }
  }

  return cached
}

export async function getDatabase(): Promise<Db> {
  const { db } = await connectToDatabase()
  return db
}