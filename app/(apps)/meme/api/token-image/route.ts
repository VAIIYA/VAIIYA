import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol') || 'TOKEN';
    const name = searchParams.get('name') || symbol;
    
    // Create a simple SVG token image
    const svg = `
      <svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#ff6b6b;stop-opacity:1" />
            <stop offset="50%" style="stop-color:#4ecdc4;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#45b7d1;stop-opacity:1" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge> 
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        <!-- Background circle -->
        <circle cx="100" cy="100" r="90" fill="url(#grad1)" filter="url(#glow)"/>
        
        <!-- Token symbol -->
        <text x="100" y="120" font-family="Arial, sans-serif" font-size="48" font-weight="bold" 
              text-anchor="middle" fill="white" filter="url(#glow)">
          ${symbol.toUpperCase().slice(0, 4)}
        </text>
        
        <!-- Token name -->
        <text x="100" y="150" font-family="Arial, sans-serif" font-size="16" 
              text-anchor="middle" fill="white" opacity="0.8">
          ${name}
        </text>
        
        <!-- Decorative elements -->
        <circle cx="50" cy="50" r="8" fill="white" opacity="0.3"/>
        <circle cx="150" cy="50" r="6" fill="white" opacity="0.3"/>
        <circle cx="50" cy="150" r="6" fill="white" opacity="0.3"/>
        <circle cx="150" cy="150" r="8" fill="white" opacity="0.3"/>
      </svg>
    `;

    return new NextResponse(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Error generating token image:', error);
    return new NextResponse('Error generating image', { status: 500 });
  }
} 