import { NextRequest, NextResponse } from 'next/server';
import { listTokens } from '../../../lib/githubOnlyStorage';
import { storeTokenDataInMongoDB, storeCreatorWalletInMongoDB } from '../../../lib/mongodbStorage';

export const dynamic = 'force-dynamic';

/**
 * Migration endpoint to fetch all tokens from GitHub and store them in MongoDB
 * This should be run once after switching MongoDB to first priority
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Starting migration from GitHub to MongoDB...');
    
    // Fetch all tokens from GitHub
    console.log('📥 Fetching tokens from GitHub...');
    const githubTokens = await listTokens(1000); // Get up to 1000 tokens
    
    if (!githubTokens || githubTokens.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No tokens found in GitHub to migrate',
        migrated: 0,
        errors: []
      });
    }
    
    console.log(`📦 Found ${githubTokens.length} tokens in GitHub`);
    
    const results = {
      migrated: 0,
      skipped: 0,
      errors: [] as Array<{ token: string; error: string }>,
      creators: 0
    };
    
    // Migrate each token to MongoDB
    for (const token of githubTokens) {
      try {
        // Store token data in MongoDB
        const tokenResult = await storeTokenDataInMongoDB(token);
        
        if (tokenResult.success) {
          results.migrated++;
          console.log(`✅ Migrated token: ${token.symbol} (${token.mintAddress})`);
          
          // Also store creator wallet if available
          if (token.creatorWallet) {
            try {
              const creatorResult = await storeCreatorWalletInMongoDB(
                token.creatorWallet,
                token.mintAddress
              );
              
              if (creatorResult.success) {
                results.creators++;
                console.log(`✅ Stored creator wallet: ${token.creatorWallet}`);
              }
            } catch (creatorError) {
              console.warn(`⚠️ Failed to store creator wallet for ${token.symbol}:`, creatorError);
              // Don't fail the migration for creator storage errors
            }
          }
        } else {
          results.skipped++;
          results.errors.push({
            token: token.symbol || token.mintAddress,
            error: tokenResult.error || 'Unknown error'
          });
          console.warn(`⚠️ Failed to migrate token ${token.symbol}:`, tokenResult.error);
        }
      } catch (error) {
        results.skipped++;
        results.errors.push({
          token: token.symbol || token.mintAddress || 'unknown',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        console.error(`❌ Error migrating token ${token.symbol}:`, error);
      }
    }
    
    console.log(`✅ Migration complete!`);
    console.log(`   Migrated: ${results.migrated}`);
    console.log(`   Skipped: ${results.skipped}`);
    console.log(`   Creators stored: ${results.creators}`);
    
    return NextResponse.json({
      success: true,
      message: `Migration complete: ${results.migrated} tokens migrated, ${results.skipped} skipped`,
      total: githubTokens.length,
      migrated: results.migrated,
      skipped: results.skipped,
      creators: results.creators,
      errors: results.errors
    });
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      migrated: 0,
      errors: []
    }, { status: 500 });
  }
}

/**
 * GET endpoint to check migration status
 */
export async function GET(request: NextRequest) {
  try {
    const { listTokensFromMongoDB } = await import('../../../lib/mongodbStorage');
    
    // Check how many tokens are in MongoDB
    const mongoTokens = await listTokensFromMongoDB(1000);
    
    // Check how many tokens are in GitHub
    const githubTokens = await listTokens(1000);
    
    return NextResponse.json({
      success: true,
      mongodb: {
        count: mongoTokens.length,
        tokens: mongoTokens.map(t => ({
          symbol: t.symbol,
          mintAddress: t.mintAddress,
          createdAt: t.createdAt
        }))
      },
      github: {
        count: githubTokens.length,
        tokens: githubTokens.map(t => ({
          symbol: t.symbol,
          mintAddress: t.mintAddress,
          createdAt: t.createdAt
        }))
      },
      needsMigration: githubTokens.length > mongoTokens.length
    });
    
  } catch (error) {
    console.error('Error checking migration status:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
