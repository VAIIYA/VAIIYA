import { NextRequest, NextResponse } from 'next/server';
import { storeTokenDataInMongoDB, storeCreatorWalletInMongoDB } from '../../../lib/mongodbStorage';
import { TokenData } from '../../../lib/githubOnlyStorage';

export const dynamic = 'force-dynamic';

/**
 * API route to store token data in MongoDB (backup storage)
 * POST /api/mongodb/store-token
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tokenData, creatorWallet } = body;

    if (!tokenData) {
      return NextResponse.json({
        success: false,
        error: 'Token data is required'
      }, { status: 400 });
    }

    // Store token data
    const tokenResult = await storeTokenDataInMongoDB(tokenData as TokenData);
    
    // Also store creator wallet if provided
    let creatorResult = null;
    if (creatorWallet && tokenData.mintAddress) {
      creatorResult = await storeCreatorWalletInMongoDB(
        creatorWallet,
        tokenData.mintAddress
      );
    }
    
    return NextResponse.json({
      success: tokenResult.success,
      tokenId: tokenResult.id,
      creatorStored: creatorResult?.success || false,
      error: tokenResult.error
    });
  } catch (error) {
    console.error('Error storing token data in MongoDB:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
