import { NextRequest, NextResponse } from 'next/server';
import { uploadTokenMetadata, TokenMetadata } from '../../../lib/githubOnlyStorage';

export const dynamic = 'force-dynamic';

/**
 * API route to upload token metadata to GitHub
 * POST /api/github/upload-metadata
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { metadata, tokenSymbol } = body;

    if (!metadata || !tokenSymbol) {
      return NextResponse.json({
        success: false,
        error: 'Metadata and token symbol are required'
      }, { status: 400 });
    }

    const result = await uploadTokenMetadata(metadata as TokenMetadata, tokenSymbol);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error uploading metadata:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

