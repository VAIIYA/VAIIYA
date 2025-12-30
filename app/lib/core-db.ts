import { MongoClient, MongoClientOptions, Db, Collection } from 'mongodb';
import { attachDatabasePool } from '@vercel/functions';
import { getEnvConfig } from './core-env';

// Create Mongo Config from Core Env
function getMongoConfig() {
    const env = getEnvConfig();
    return {
        uri: env.mongoDbUri,
    };
}

// Global state for connection caching (Vercel optimization)
let mongoClient: MongoClient | null = null;
let mongoDb: Db | null = null;

/**
 * Get the Singleton MongoDB Client
 */
export async function getMongoClient(): Promise<MongoClient | null> {
    const config = getMongoConfig();

    if (!config.uri) {
        console.error('❌ MongoDB URI is missing in environment variables');
        return null;
    }

    // Reuse existing client if available
    if (mongoClient) {
        return mongoClient;
    }

    try {
        const options: MongoClientOptions = {
            appName: "vaiiya-super-app",
            maxIdleTimeMS: 5000,
        };

        mongoClient = new MongoClient(config.uri, options);

        // Attach the client to ensure proper cleanup on function suspension (Vercel pattern)
        attachDatabasePool(mongoClient);

        await mongoClient.connect();

        console.log('✅ VAIIYA Core: MongoDB client connected');
        return mongoClient;
    } catch (error) {
        console.error('❌ VAIIYA Core: Failed to connect to MongoDB:', error);
        return null;
    }
}

/**
 * Get the Database instance.
 * Defaults to 'vaiiya' unless specified otherwise in the URI (but typically we just get the default db)
 * We can also strictly enforce 'vaiiya' if we want.
 * For now let's support legacy names by being flexible or enforce a standard.
 * Let's prefer 'vaiiya' but LuckyHaus was using default and MemeHaus was using 'memehaus'.
 * 
 * STRATEGY: 
 * - LuckyHaus was implicitly using the db from URI or 'test' if not specified.
 * - MemeHaus was explicitly doing `client.db('memehaus')`.
 * 
 * To Unify: We should move towards a single DB 'vaiiya' with collections:
 * - 'tokens' (MemeHaus)
 * - 'users' (Shared)
 * - 'rounds' (LuckyHaus)
 * - 'tickets' (LuckyHaus)
 */
export async function getMongoDatabase(dbName?: string): Promise<Db | null> {
    const client = await getMongoClient();
    if (!client) {
        return null;
    }

    // If we already have a focused db instance and no name was requested, return it?
    // Actually, standardizing on a single db is best.
    // BUT to avoid breaking current data, we might need to respect legacy db names if they are different.
    // LuckyHaus and MemeHaus likely used different DBs if the URI didn't specify one.
    // HOWEVER, the standard MONGODB_URI in Vercel usually specifies a default DB.

    // Best practice: Use the default db from connection string, or fallback to 'vaiiya'
    if (!mongoDb) {
        if (dbName) {
            return client.db(dbName);
        }
        // Default to 'vaiiya' if not specified in URI
        mongoDb = client.db('vaiiya');
    }

    return dbName ? client.db(dbName) : mongoDb;
}

/**
 * Helper to get a collection directly
 */
export async function getCollection<T extends Document>(collectionName: string, dbName?: string): Promise<Collection<T> | null> {
    const db = await getMongoDatabase(dbName);
    if (!db) return null;
    return db.collection<T>(collectionName);
}

/**
 * Test Connection
 */
export async function testCoreMongoDBConnection(): Promise<boolean> {
    try {
        const db = await getMongoDatabase();
        if (!db) return false;
        await db.admin().ping();
        return true;
    } catch (error) {
        console.error('❌ Core DB Connection Test Failed:', error);
        return false;
    }
}
