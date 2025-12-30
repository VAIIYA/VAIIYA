import { PublicKey } from '@solana/web3.js';
import { getMint } from '@solana/spl-token';
import ConnectionService from './connectionService';

export interface OnChainMetadata {
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
}

// Cache for metadata to avoid repeated RPC calls
const metadataCache = new Map<string, { data: OnChainMetadata; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Fetch token metadata from on-chain (Metaplex)
 * Uses caching to avoid repeated RPC calls
 * 
 * @param mintAddress - Token mint address
 * @param useCache - Whether to use cache (default: true)
 * @returns Metadata or null if not found
 */
export async function fetchTokenMetadataFromChain(
  mintAddress: string,
  useCache: boolean = true
): Promise<OnChainMetadata | null> {
  try {
    // Validate mint address format
    try {
      new PublicKey(mintAddress);
    } catch {
      console.error('Invalid mint address format:', mintAddress);
      return null;
    }

    // Check cache first
    if (useCache) {
      const cached = metadataCache.get(mintAddress);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        console.log(`Using cached metadata for ${mintAddress}`);
        return cached.data;
      }
    }

    const connection = ConnectionService.getConnection();
    const mintPublicKey = new PublicKey(mintAddress);
    
    // Get mint info (supply, decimals)
    const mintInfo = await getMint(connection, mintPublicKey);
    const totalSupply = (Number(mintInfo.supply) / Math.pow(10, mintInfo.decimals)).toString();
    
    // Try to fetch metadata using Metaplex
    let name = '';
    let symbol = '';
    
    try {
      const { Metaplex } = await import('@metaplex-foundation/js');
      const metaplex = Metaplex.make(connection);
      
      // Add timeout for Metaplex call
      const metadataPromise = metaplex.nfts().findByMint({ mintAddress: mintPublicKey });
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Metadata fetch timeout')), 10000)
      );
      
      const nft = await Promise.race([metadataPromise, timeoutPromise]);
      
      if (nft) {
        name = nft.name || '';
        symbol = nft.symbol || '';
      }
    } catch (metaplexError) {
      console.warn(`Could not fetch metadata via Metaplex for ${mintAddress}:`, metaplexError);
      // Metadata might not exist - this is okay for some tokens
    }
    
    const result: OnChainMetadata = {
      name: name || 'Unknown Token',
      symbol: symbol || 'UNK',
      decimals: mintInfo.decimals,
      totalSupply: totalSupply,
    };

    // Cache the result
    if (useCache) {
      metadataCache.set(mintAddress, {
        data: result,
        timestamp: Date.now(),
      });
    }

    return result;
  } catch (error) {
    console.error(`Error fetching on-chain metadata for ${mintAddress}:`, error);
    return null;
  }
}

/**
 * Clear metadata cache (useful for testing or forced refresh)
 */
export function clearMetadataCache(): void {
  metadataCache.clear();
}

/**
 * Get cache statistics
 */
export function getCacheStats(): { size: number; entries: string[] } {
  return {
    size: metadataCache.size,
    entries: Array.from(metadataCache.keys()),
  };
}
