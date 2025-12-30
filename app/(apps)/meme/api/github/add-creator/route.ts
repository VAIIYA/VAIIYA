import { NextRequest, NextResponse } from 'next/server';
import { addCreatorToList } from '../../../lib/githubOnlyStorage';

export const dynamic = 'force-dynamic';

/**
 * API route to add a creator to the creator list in GitHub
 * POST /api/github/add-creator
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { creatorWallet } = body;

    if (!creatorWallet) {
      return NextResponse.json({
        success: false,
        error: 'Creator wallet address is required'
      }, { status: 400 });
    }

    const result = await addCreatorToList(creatorWallet);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error adding creator to list:', error);
    return NextResponse.json({
      success: false,
      creatorList: {
        creators: [],
        lastUpdated: new Date().toISOString(),
        totalCreators: 0
      },
      wasNew: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
