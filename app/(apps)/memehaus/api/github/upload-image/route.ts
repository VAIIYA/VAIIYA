import { NextRequest, NextResponse } from 'next/server';
import { uploadTokenImage } from '../../../lib/githubOnlyStorage';

export const dynamic = 'force-dynamic';

/**
 * API route to upload token image to GitHub
 * POST /api/github/upload-image
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get('image') as File;
    const tokenSymbol = formData.get('symbol') as string;

    if (!imageFile || !tokenSymbol) {
      return NextResponse.json({
        success: false,
        error: 'Image file and token symbol are required'
      }, { status: 400 });
    }

    const result = await uploadTokenImage(imageFile, tokenSymbol);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

