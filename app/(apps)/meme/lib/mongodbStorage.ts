import { MongoClient, MongoClientOptions, Db, Collection } from 'mongodb';
import { attachDatabasePool } from '@vercel/functions';
import { TokenData } from './githubOnlyStorage';

// MongoDB configuration - read at runtime
function getMongoConfig() {
  return {
    uri: process.env.MONGODB_URI,
  };
}

// Create MongoDB client (Vercel-optimized pattern)
let mongoClient: MongoClient | null = null;
let mongoDb: Db | null = null;

async function getMongoClient(): Promise<MongoClient | null> {
  const config = getMongoConfig();
  
  if (!config.uri) {
    return null;
  }

  // Reuse existing client if available
  if (mongoClient) {
    return mongoClient;
  }

  try {
    const options: MongoClientOptions = {
      appName: "memehaus-token-storage",
      maxIdleTimeMS: 5000,
    };
    
    mongoClient = new MongoClient(config.uri, options);
    
    // Attach the client to ensure proper cleanup on function suspension (Vercel pattern)
    attachDatabasePool(mongoClient);
    
    await mongoClient.connect();
    
    console.log('✅ MongoDB client connected');
    return mongoClient;
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error);
    return null;
  }
}

async function getMongoDatabase(): Promise<Db | null> {
  const client = await getMongoClient();
  if (!client) {
    return null;
  }

  if (!mongoDb) {
    mongoDb = client.db('memehaus');
  }

  return mongoDb;
}

export interface MongoStorageResult {
  success: boolean;
  error?: string;
  id?: string;
}

/**
 * Store token data in MongoDB (backup storage)
 * @param tokenData - Token data to store
 * @returns Storage result
 */
export async function storeTokenDataInMongoDB(
  tokenData: TokenData
): Promise<MongoStorageResult> {
  try {
    console.log(`🔄 Storing token data in MongoDB for ${tokenData.symbol}...`);
    
    const db = await getMongoDatabase();
    
    if (!db) {
      const config = getMongoConfig();
      console.warn('⚠️ MongoDB not configured:', {
        hasUri: !!config.uri,
      });
      return {
        success: false,
        error: 'MongoDB not configured. Missing MONGODB_URI environment variable',
      };
    }

    const tokensCollection: Collection = db.collection('tokens');
    
    // Log imageUrl before storing
    console.log(`📸 Storing imageUrl for ${tokenData.symbol}:`, tokenData.imageUrl);
    
    // Insert token data (upsert to handle duplicates)
    const result = await tokensCollection.updateOne(
      { mint_address: tokenData.mintAddress },
      {
        $set: {
          id: tokenData.id,
          name: tokenData.name,
          symbol: tokenData.symbol,
          description: tokenData.description,
          total_supply: tokenData.totalSupply,
          creator_wallet: tokenData.creatorWallet,
          mint_address: tokenData.mintAddress,
          token_account: tokenData.tokenAccount,
          initial_price: tokenData.initialPrice,
          vesting_period: tokenData.vestingPeriod,
          community_fee: tokenData.communityFee,
          decimals: tokenData.decimals,
          image_url: tokenData.imageUrl || null, // Explicitly set to null if undefined
          metadata_uri: tokenData.metadataUri,
          token_creation_signature: tokenData.tokenCreationSignature,
          fee_transaction_signature: tokenData.feeTransactionSignature,
          created_at: new Date(tokenData.createdAt),
          updated_at: new Date(),
        },
      },
      { upsert: true }
    );

    console.log(`✅ Token data stored in MongoDB: ${tokenData.mintAddress}, imageUrl: ${tokenData.imageUrl || 'NOT SET'}`);
    
    return {
      success: true,
      id: tokenData.id,
    };
    
  } catch (error) {
    console.error('❌ Error storing token data in MongoDB:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Store creator/wallet data in MongoDB (important for early creator rewards)
 * @param walletAddress - Creator wallet address
 * @param tokenMint - Token mint address they created
 * @returns Storage result
 */
export async function storeCreatorWalletInMongoDB(
  walletAddress: string,
  tokenMint: string
): Promise<MongoStorageResult> {
  try {
    console.log(`🔄 Storing creator wallet in MongoDB: ${walletAddress}...`);
    
    const db = await getMongoDatabase();
    
    if (!db) {
      return {
        success: false,
        error: 'MongoDB not configured',
      };
    }

    const creatorsCollection: Collection = db.collection('creators');
    
    // Update creator record (upsert to handle new creators)
    const result = await creatorsCollection.updateOne(
      { wallet_address: walletAddress },
      {
        $set: {
          wallet_address: walletAddress,
          updated_at: new Date(),
        },
        $addToSet: {
          created_tokens: tokenMint, // Add token to list if not already present
        },
        $setOnInsert: {
          first_token_created_at: new Date(), // Only set on first insert
          total_tokens_created: 1,
        },
      },
      { upsert: true }
    );

    // Update token count
    if (result.upsertedCount === 0) {
      // Creator already exists, increment token count
      await creatorsCollection.updateOne(
        { wallet_address: walletAddress },
        { $inc: { total_tokens_created: 1 } }
      );
    }

    console.log(`✅ Creator wallet stored in MongoDB: ${walletAddress}`);
    
    return {
      success: true,
      id: walletAddress,
    };
    
  } catch (error) {
    console.error('❌ Error storing creator wallet in MongoDB:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get token data from MongoDB
 * @param mintAddress - Token mint address
 * @returns Token data or null if not found
 */
export async function getTokenDataFromMongoDB(
  mintAddress: string
): Promise<TokenData | null> {
  try {
    const db = await getMongoDatabase();
    
    if (!db) {
      return null;
    }

    const tokensCollection: Collection = db.collection('tokens');
    const token = await tokensCollection.findOne({ mint_address: mintAddress });

    if (!token) {
      return null;
    }

    // Convert MongoDB format to TokenData format
    return {
      id: token.id,
      name: token.name,
      symbol: token.symbol,
      description: token.description,
      totalSupply: token.total_supply,
      creatorWallet: token.creator_wallet,
      mintAddress: token.mint_address,
      tokenAccount: token.token_account,
      initialPrice: token.initial_price,
      vestingPeriod: token.vesting_period,
      communityFee: token.community_fee,
      decimals: token.decimals,
      imageUrl: token.image_url || undefined, // Convert null to undefined
      metadataUri: token.metadata_uri,
      tokenCreationSignature: token.token_creation_signature,
      feeTransactionSignature: token.fee_transaction_signature,
      createdAt: (() => {
        if (!token.created_at) {
          return new Date().toISOString();
        }
        // Handle MongoDB Date object or ISO string
        if (token.created_at instanceof Date) {
          return token.created_at.toISOString();
        }
        // If it's already a string, validate it
        if (typeof token.created_at === 'string') {
          const date = new Date(token.created_at);
          if (!isNaN(date.getTime())) {
            return date.toISOString();
          }
        }
        // Fallback to current date if all else fails
        console.warn('Invalid created_at date in MongoDB, using current date:', token.created_at);
        return new Date().toISOString();
      })(),
    };
  } catch (error) {
    console.error('❌ Error retrieving token data from MongoDB:', error);
    return null;
  }
}

/**
 * Get creator data from MongoDB
 * @param walletAddress - Creator wallet address
 * @returns Creator data or null if not found
 */
export async function getCreatorDataFromMongoDB(
  walletAddress: string
): Promise<{
  wallet_address: string;
  created_tokens: string[];
  total_tokens_created: number;
  first_token_created_at: Date;
  updated_at: Date;
} | null> {
  try {
    const db = await getMongoDatabase();
    
    if (!db) {
      return null;
    }

    const creatorsCollection: Collection = db.collection('creators');
    const creator = await creatorsCollection.findOne({ wallet_address: walletAddress });

    return creator as any;
  } catch (error) {
    console.error('❌ Error retrieving creator data from MongoDB:', error);
    return null;
  }
}

/**
 * List all tokens from MongoDB
 * @param limit - Maximum number of tokens to retrieve
 * @returns Array of token data
 */
export async function listTokensFromMongoDB(
  limit: number = 50
): Promise<TokenData[]> {
  try {
    const db = await getMongoDatabase();
    
    if (!db) {
      return [];
    }

    const tokensCollection: Collection = db.collection('tokens');
    const tokens = await tokensCollection
      .find({})
      .sort({ created_at: -1 })
      .limit(limit)
      .toArray();

    // Convert MongoDB format to TokenData format
    return tokens.map((token: any) => ({
      id: token.id,
      name: token.name,
      symbol: token.symbol,
      description: token.description,
      totalSupply: token.total_supply,
      creatorWallet: token.creator_wallet,
      mintAddress: token.mint_address,
      tokenAccount: token.token_account,
      initialPrice: token.initial_price,
      vestingPeriod: token.vesting_period,
      communityFee: token.community_fee,
      decimals: token.decimals,
      imageUrl: token.image_url || undefined, // Convert null to undefined
      metadataUri: token.metadata_uri,
      tokenCreationSignature: token.token_creation_signature,
      feeTransactionSignature: token.fee_transaction_signature,
      createdAt: (() => {
        if (!token.created_at) {
          return new Date().toISOString();
        }
        // Handle MongoDB Date object or ISO string
        if (token.created_at instanceof Date) {
          return token.created_at.toISOString();
        }
        // If it's already a string, validate it
        if (typeof token.created_at === 'string') {
          const date = new Date(token.created_at);
          if (!isNaN(date.getTime())) {
            return date.toISOString();
          }
        }
        // Fallback to current date if all else fails
        console.warn('Invalid created_at date in MongoDB, using current date:', token.created_at);
        return new Date().toISOString();
      })(),
    }));
  } catch (error) {
    console.error('❌ Error listing tokens from MongoDB:', error);
    return [];
  }
}

/**
 * Get all creators from MongoDB (for fee distribution)
 * @returns Array of creator wallet addresses
 */
export async function getAllCreatorsFromMongoDB(): Promise<string[]> {
  try {
    const db = await getMongoDatabase();
    
    if (!db) {
      return [];
    }

    const creatorsCollection: Collection = db.collection('creators');
    const creators = await creatorsCollection
      .find({})
      .project({ wallet_address: 1, _id: 0 })
      .toArray();

    return creators.map((c: any) => c.wallet_address);
  } catch (error) {
    console.error('❌ Error retrieving creators from MongoDB:', error);
    return [];
  }
}

/**
 * Test MongoDB connection
 * @returns Connection test result
 */
export async function testMongoDBConnection(): Promise<boolean> {
  try {
    const db = await getMongoDatabase();
    
    if (!db) {
      console.error('❌ MongoDB not configured');
      return false;
    }

    // Test by pinging the database
    await db.admin().ping();
    
    console.log('✅ MongoDB connection successful');
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    return false;
  }
}
