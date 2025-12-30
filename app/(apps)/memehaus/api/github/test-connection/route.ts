import { NextRequest, NextResponse } from 'next/server';
import { testGitHubConnection } from '../../../lib/githubOnlyStorage';

export const dynamic = 'force-dynamic';

/**
 * API route to test GitHub connection
 * GET /api/github/test-connection
 */
export async function GET(request: NextRequest) {
  try {
    const connected = await testGitHubConnection();
    
    return NextResponse.json({
      success: connected,
      connected
    });
  } catch (error) {
    console.error('Error testing GitHub connection:', error);
    return NextResponse.json({
      success: false,
      connected: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

