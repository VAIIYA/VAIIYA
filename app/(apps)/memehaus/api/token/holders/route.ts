import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// In-memory cache for holder data (in production, use Redis or a database)
const holderCache = new Map<string, { holders: number; timestamp: number }>();

// Cache duration: 24 hours in milliseconds
const CACHE_DURATION = 24 * 60 * 60 * 1000;

/**
 * Fetch holder count from Solscan public page
 * This scrapes the public Solscan page since Pro API requires a key
 */
async function fetchHoldersFromSolscan(mintAddress: string): Promise<number | null> {
  try {
    const url = `https://solscan.io/token/${mintAddress}`;
    
    // Fetch the HTML page
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      console.error(`Failed to fetch Solscan page: ${response.status}`);
      return null;
    }

    const html = await response.text();
    
    // Try to extract holder count from the HTML
    // Solscan displays holders in the Market Overview section
    // Look for patterns like "Holders: 2" or similar
    const holderMatch = html.match(/Holders[:\s]*(\d+)/i);
    if (holderMatch && holderMatch[1]) {
      return parseInt(holderMatch[1], 10);
    }

    // Alternative: Look for JSON data in script tags
    const jsonMatch = html.match(/"holders"[:\s]*(\d+)/i);
    if (jsonMatch && jsonMatch[1]) {
      return parseInt(jsonMatch[1], 10);
    }

    // Try to find holder count in various formats
    const patterns = [
      /"holderCount"[:\s]*(\d+)/i,
      /"totalHolders"[:\s]*(\d+)/i,
      /Holders[:\s]*<[^>]*>(\d+)/i,
    ];

    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match && match[1]) {
        return parseInt(match[1], 10);
      }
    }

    console.log('Could not find holder count in Solscan HTML');
    return null;
  } catch (error) {
    console.error('Error fetching holders from Solscan:', error);
    return null;
  }
}

/**
 * Alternative: Use Solscan Pro API if API key is available
 * Set SOLSCAN_API_KEY environment variable to use this
 */
async function fetchHoldersFromAPI(mintAddress: string): Promise<number | null> {
  const apiKey = process.env.SOLSCAN_API_KEY;
  
  if (!apiKey) {
    return null; // No API key, fall back to scraping
  }

  try {
    const url = `https://pro-api.solscan.io/v2.0/token/holders?address=${mintAddress}&page=1&page_size=1`;
    
    const response = await fetch(url, {
      headers: {
        'accept': 'application/json',
        'token': apiKey
      }
    });

    if (!response.ok) {
      console.error(`Solscan API error: ${response.status}`);
      return null;
    }

    const data = await response.json();
    
    // The API returns total count in the response
    if (data.data && typeof data.data.total === 'number') {
      return data.data.total;
    }
    
    // Or count the holders array
    if (Array.isArray(data.data) && data.data.length > 0) {
      // If we only get one page, we might need to check pagination
      // For now, return the count of holders in the response
      return data.data.length;
    }

    return null;
  } catch (error) {
    console.error('Error fetching holders from Solscan API:', error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mintAddress = searchParams.get('mintAddress');

    if (!mintAddress) {
      return NextResponse.json(
        { success: false, error: 'mintAddress is required' },
        { status: 400 }
      );
    }

    // Check cache first
    const cached = holderCache.get(mintAddress);
    const now = Date.now();

    if (cached && (now - cached.timestamp) < CACHE_DURATION) {
      console.log(`Returning cached holder count for ${mintAddress}: ${cached.holders}`);
      return NextResponse.json({
        success: true,
        holders: cached.holders,
        cached: true
      });
    }

    console.log(`Fetching fresh holder count for ${mintAddress}`);

    // Try API first if key is available, then fall back to scraping
    let holders = await fetchHoldersFromAPI(mintAddress);
    
    if (holders === null) {
      holders = await fetchHoldersFromSolscan(mintAddress);
    }

    if (holders === null) {
      // If we can't fetch, return cached value even if expired, or return 0
      if (cached) {
        console.log(`Using expired cache for ${mintAddress}: ${cached.holders}`);
        return NextResponse.json({
          success: true,
          holders: cached.holders,
          cached: true,
          expired: true
        });
      }
      
      return NextResponse.json({
        success: false,
        error: 'Could not fetch holder count',
        holders: 0
      });
    }

    // Update cache
    holderCache.set(mintAddress, { holders, timestamp: now });

    return NextResponse.json({
      success: true,
      holders,
      cached: false
    });

  } catch (error) {
    console.error('Error in holders API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        holders: 0
      },
      { status: 500 }
    );
  }
}
