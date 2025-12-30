import { NextRequest, NextResponse } from 'next/server';
import { getCreatorList } from '../../../lib/githubOnlyStorage';

export const dynamic = 'force-dynamic';

/**
 * API route to get the creator list from GitHub
 * GET /api/github/get-creators
 */
export async function GET(request: NextRequest) {
  try {
    const creatorList = await getCreatorList();
    
    return NextResponse.json({
      success: true,
      ...creatorList
    });
  } catch (error) {
    console.error('Error getting creator list:', error);
    return NextResponse.json({
      success: false,
      creators: [],
      lastUpdated: new Date().toISOString(),
      totalCreators: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
