import { NextRequest, NextResponse } from 'next/server';
import { listTokensFromMongoDB } from '../../lib/mongodbStorage';
import { TokenFromAPI } from '../../types/token';
import { fetchTokenMetadataFromChain } from '../../lib/onChainMetadata';

export const dynamic = 'force-dynamic';

// Helper to enrich token with on-chain metadata if missing
async function enrichTokenWithOnChainData(token: TokenFromAPI): Promise<TokenFromAPI> {
  // If token already has name and symbol, return as-is
  if (token.name && token.symbol && token.name !== 'Unknown Token' && token.symbol !== 'UNK') {
    return token;
  }

  const mintAddress = token.mintAddress || token.mint_address;
  if (!mintAddress) {
    return token; // Can't enrich without mint address
  }

  try {
    const onChainData = await fetchTokenMetadataFromChain(mintAddress);
    
    if (onChainData && onChainData.name !== 'Unknown Token' && onChainData.symbol !== 'UNK') {
      return {
        ...token,
        name: onChainData.name,
        symbol: onChainData.symbol,
        decimals: onChainData.decimals,
        totalSupply: token.totalSupply || onChainData.totalSupply,
      };
    }
  } catch (error) {
    console.error(`Error enriching token ${mintAddress}:`, error);
  }

  return token;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '0');
    const limit = parseInt(searchParams.get('limit') || '10');

    console.log('API: Fetching tokens from MongoDB (page:', page, 'limit:', limit, ')');

    // MongoDB-only storage - no GitHub fallback
    let allTokens: TokenFromAPI[] = [];
    
    try {
      allTokens = await listTokensFromMongoDB(100); // Get more tokens than needed for pagination
      
      if (allTokens && allTokens.length > 0) {
        console.log(`API: Fetched ${allTokens.length} tokens from MongoDB`);
      } else {
        console.log('API: MongoDB returned no tokens (this is normal if no tokens have been created yet)');
        allTokens = []; // Return empty array instead of throwing
      }
    } catch (mongoError) {
      console.error('API: MongoDB fetch failed:', mongoError);
      // Return empty array instead of throwing - allows UI to continue working
      allTokens = [];
    }
    
    // Apply pagination
    const startIndex = page * limit;
    const endIndex = startIndex + limit;
    const tokens = allTokens.slice(startIndex, endIndex);
    
    // Enrich tokens with on-chain metadata if missing name/symbol
    // Only enrich first few tokens to avoid rate limits, and limit concurrency
    const tokensToEnrich = tokens.slice(0, Math.min(10, tokens.length));
    
    // Enrich with limited concurrency to avoid rate limits
    const enrichedTokens: TokenFromAPI[] = [];
    for (let i = 0; i < tokensToEnrich.length; i++) {
      try {
        const enriched = await enrichTokenWithOnChainData(tokensToEnrich[i]);
        enrichedTokens.push(enriched);
        // Small delay between requests to avoid rate limits
        if (i < tokensToEnrich.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      } catch (error) {
        console.warn(`Failed to enrich token ${tokensToEnrich[i].mintAddress}:`, error);
        enrichedTokens.push(tokensToEnrich[i]); // Use original token if enrichment fails
      }
    }
    
    const remainingTokens = tokens.slice(tokensToEnrich.length);
    const allEnrichedTokens = [...enrichedTokens, ...remainingTokens];
    
    // Ensure tokens have both camelCase and snake_case for frontend compatibility
    const tokensWithBothFormats = allEnrichedTokens.map(token => {
      // Log imageUrl for debugging
      if (!token.imageUrl) {
        console.warn(`⚠️ Token ${token.symbol} (${token.mintAddress}) has no imageUrl`);
      }
      return {
        ...token,
        // Add snake_case versions for frontend compatibility
        mint_address: token.mintAddress,
        total_supply: token.totalSupply,
        creator_wallet: token.creatorWallet,
        token_account: token.tokenAccount,
        initial_price: token.initialPrice,
        vesting_period: token.vestingPeriod,
        community_fee: token.communityFee,
        image_url: token.imageUrl || undefined, // Ensure it's explicitly set
        metadata_uri: token.metadataUri,
        token_creation_signature: token.tokenCreationSignature,
        fee_transaction_signature: token.feeTransactionSignature,
        created_at: token.createdAt,
      };
    });
    
    console.log(`API: Returning ${tokensWithBothFormats.length} tokens from MongoDB (page ${page}, limit ${limit})`);

    // Calculate platform stats
    const stats = {
      totalTokens: allTokens.length,
      totalVolume: '0', // We don't track volume yet
      totalUsers: new Set(allTokens.map(token => token.creatorWallet || token.creator_wallet)).size
    };
    
    console.log('API: Platform stats:', stats);

    return NextResponse.json({
      success: true,
      tokens: tokensWithBothFormats,
      stats,
      pagination: {
        page,
        limit,
        total: stats.totalTokens
      },
      source: 'mongodb' // Always MongoDB
    });

  } catch (error) {
    console.error('API: Error fetching tokens from MongoDB:', error);
    
    // Return empty result gracefully - allows UI to continue working
    return NextResponse.json({
      success: true,
      tokens: [], // Empty array - normal if no tokens exist yet
      stats: {
        totalTokens: 0,
        totalVolume: '0',
        totalUsers: 0
      },
      pagination: {
        page: 0,
        limit: 10,
        total: 0
      },
      source: 'mongodb',
      error: error instanceof Error ? error.message : 'MongoDB connection issue'
    });
  }
}
