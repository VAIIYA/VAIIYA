import { NextRequest, NextResponse } from 'next/server';
import { getAllCreatorsFromMongoDB } from '../../../lib/mongodbStorage';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    console.log('API: Fetching creators from MongoDB...');
    
    const creators = await getAllCreatorsFromMongoDB();
    
    console.log(`API: Found ${creators.length} creators in MongoDB`);
    
    return NextResponse.json({
      success: true,
      creators,
      totalCreators: creators.length,
      lastUpdated: new Date().toISOString(),
    });
    
  } catch (error) {
    console.error('API: Error fetching creators from MongoDB:', error);
    
    return NextResponse.json({
      success: false,
      creators: [],
      totalCreators: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
