import { PublicKey, Keypair } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { createHash } from 'crypto';

/**
 * Get MemeHaus vault seed from environment
 * Works both client-side and server-side
 * 
 * Note: On client-side, we fetch from API route since env vars aren't available
 * On server-side, we can access process.env directly
 */
async function getVaultSeed(): Promise<string> {
  // Check if we're on server-side (has process.env access)
  if (typeof window === 'undefined') {
    // Server-side: access env directly
    return process.env.MEMEHAUS_VAULT_SEED || 'memehaus-liquidity-community-vault-seed-2025';
  }
  
  // Client-side: fetch from API route
  try {
    const response = await fetch('/api/vault-seed');
    if (response.ok) {
      const data = await response.json();
      if (data.seed) {
        return data.seed;
      }
    }
  } catch (error) {
    console.warn('Failed to fetch vault seed from API:', error);
  }
  
  // Fallback to default (will show warning in production)
  const defaultSeed = 'memehaus-liquidity-community-vault-seed-2025';
  if (process.env.NODE_ENV === 'production') {
    console.warn('⚠️  Using fallback vault seed in production. Set MEMEHAUS_VAULT_SEED!');
  }
  return defaultSeed;
}

// Cache for seed to avoid repeated API calls
let cachedSeed: string | null = null;
let seedPromise: Promise<string> | null = null;

/**
 * PDA Service for deriving deterministic vault addresses
 * Uses deterministic keypairs derived from seeds (hash-based)
 * 
 * Note: True PDAs require a Solana program. This uses deterministic keypairs
 * which work similarly but don't require a program.
 */
export class PDAService {
  /**
   * Derive deterministic keypair from seed using SHA256
   * @param seed - Seed string
   * @returns Keypair
   */
  private static deriveKeypairFromSeed(seed: string): Keypair {
    // Use SHA256 to create deterministic 32-byte seed
    const hash = createHash('sha256').update(seed).digest();
    return Keypair.fromSeed(hash.slice(0, 32));
  }

  /**
   * Get vault seed (async to support client-side API calls)
   */
  private static async getSeed(): Promise<string> {
    if (cachedSeed) {
      return cachedSeed;
    }
    
    if (!seedPromise) {
      seedPromise = getVaultSeed();
    }
    
    cachedSeed = await seedPromise;
    return cachedSeed;
  }

  /**
   * Derive liquidity vault keypair for a token
   * @param mintAddress - Token mint address
   * @returns Keypair for liquidity vault
   */
  static async deriveLiquidityVaultKeypair(mintAddress: PublicKey): Promise<Keypair> {
    const seed = await this.getSeed();
    const fullSeed = `${seed}:liquidity:${mintAddress.toBase58()}`;
    return this.deriveKeypairFromSeed(fullSeed);
  }

  /**
   * Derive community vault keypair for a token
   * @param mintAddress - Token mint address
   * @returns Keypair for community vault
   */
  static async deriveCommunityVaultKeypair(mintAddress: PublicKey): Promise<Keypair> {
    const seed = await this.getSeed();
    const fullSeed = `${seed}:community:${mintAddress.toBase58()}`;
    return this.deriveKeypairFromSeed(fullSeed);
  }

  /**
   * Get liquidity vault public key
   * @param mintAddress - Token mint address
   * @returns Public key for liquidity vault
   */
  static async getLiquidityVaultPublicKey(mintAddress: PublicKey): Promise<PublicKey> {
    const keypair = await this.deriveLiquidityVaultKeypair(mintAddress);
    return keypair.publicKey;
  }

  /**
   * Get community vault public key
   * @param mintAddress - Token mint address
   * @returns Public key for community vault
   */
  static async getCommunityVaultPublicKey(mintAddress: PublicKey): Promise<PublicKey> {
    const keypair = await this.deriveCommunityVaultKeypair(mintAddress);
    return keypair.publicKey;
  }

  /**
   * Get liquidity vault token account address
   * @param mintAddress - Token mint address
   * @returns Associated token account address for liquidity vault
   */
  static async getLiquidityVaultTokenAccount(mintAddress: PublicKey): Promise<PublicKey> {
    const liquidityVaultPubkey = await this.getLiquidityVaultPublicKey(mintAddress);
    const { getAssociatedTokenAddress } = await import('@solana/spl-token');
    return getAssociatedTokenAddress(
      mintAddress,
      liquidityVaultPubkey,
      false,
      TOKEN_PROGRAM_ID
    );
  }

  /**
   * Get community vault token account address
   * @param mintAddress - Token mint address
   * @returns Associated token account address for community vault
   */
  static async getCommunityVaultTokenAccount(mintAddress: PublicKey): Promise<PublicKey> {
    const communityVaultPubkey = await this.getCommunityVaultPublicKey(mintAddress);
    const { getAssociatedTokenAddress } = await import('@solana/spl-token');
    return getAssociatedTokenAddress(
      mintAddress,
      communityVaultPubkey,
      false,
      TOKEN_PROGRAM_ID
    );
  }

  /**
   * Get liquidity vault keypair (for signing transactions)
   * @param mintAddress - Token mint address
   * @returns Keypair for liquidity vault
   */
  static async getLiquidityVaultKeypair(mintAddress: PublicKey): Promise<Keypair> {
    return this.deriveLiquidityVaultKeypair(mintAddress);
  }

  /**
   * Get community vault keypair (for signing transactions)
   * @param mintAddress - Token mint address
   * @returns Keypair for community vault
   */
  static async getCommunityVaultKeypair(mintAddress: PublicKey): Promise<Keypair> {
    return this.deriveCommunityVaultKeypair(mintAddress);
  }
}

