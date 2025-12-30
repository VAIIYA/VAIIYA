import { NextRequest, NextResponse } from 'next/server';
import { storeTokenData, TokenData } from '../../../lib/githubOnlyStorage';

export const dynamic = 'force-dynamic';

/**
 * API route to store token data in GitHub
 * POST /api/github/store-token
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tokenData } = body;

    if (!tokenData) {
      return NextResponse.json({
        success: false,
        error: 'Token data is required'
      }, { status: 400 });
    }

    const result = await storeTokenData(tokenData as TokenData);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error storing token data:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
