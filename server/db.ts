import { MongoClient, Db, ServerApiVersion } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mobilemaster';
let db: Db | null = null;
let client: MongoClient | null = null;

export const connectDB = async (): Promise<Db> => {
  if (db) {
    return db;
  }

  try {
    client = new MongoClient(MONGODB_URI, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      }
    });
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log('✅ Connected to MongoDB successfully');
    
    // Extract database name from URI or use default
    // For Atlas, the DB name might not be in the URI path, so we default to 'mobilemaster' if not found
    const uriPath = MONGODB_URI.split('/').pop()?.split('?')[0];
    const dbName = (uriPath && uriPath !== 'mongodb.net') ? uriPath : 'mobilemaster';
    
    db = client.db(dbName);
    
    // Create indexes for better performance
    await db.collection('products').createIndex({ category: 1 });
    await db.collection('products').createIndex({ featured: 1 });
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    
    return db;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
};

export const getDB = (): Db => {
  if (!db) {
    throw new Error('Database not initialized. Call connectDB first.');
  }
  return db;
};

export const closeDB = async (): Promise<void> => {
  if (client) {
    await client.close();
    db = null;
    client = null;
    console.log('MongoDB connection closed');
  }
};
