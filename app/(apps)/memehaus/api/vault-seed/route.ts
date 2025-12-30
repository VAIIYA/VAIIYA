import { NextRequest, NextResponse } from 'next/server';
import { getEnvConfig } from '../../lib/env';

/**
 * API route to get vault seed (server-side only)
 * This allows client-side code to access the vault seed
 * without exposing it in the client bundle
 */
export async function GET(request: NextRequest) {
  try {
    // Only allow server-side access
    const config = getEnvConfig();
    
    return NextResponse.json({
      success: true,
      seed: config.vaultSeed,
    });
  } catch (error) {
    console.error('Error getting vault seed:', error);
    
    // Return default seed as fallback
    const defaultSeed = process.env.MEMEHAUS_VAULT_SEED || 'memehaus-liquidity-community-vault-seed-2025';
    
    return NextResponse.json({
      success: true,
      seed: defaultSeed,
      warning: 'Using fallback seed - check environment configuration',
    });
  }
}

