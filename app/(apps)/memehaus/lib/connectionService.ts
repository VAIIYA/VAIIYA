import { Connection } from '@solana/web3.js';

/**
 * Shared Connection service to reuse Solana RPC connections
 * Prevents creating multiple connections and hitting rate limits
 */
class ConnectionService {
  private static connection: Connection | null = null;
  private static rpcUrl: string | null = null;

  /**
   * Get or create a shared Connection instance
   * Reuses the same connection for all requests to improve performance
   */
  static getConnection(): Connection {
    const currentRpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
    
    // Recreate connection if RPC URL changed
    if (!this.connection || this.rpcUrl !== currentRpcUrl) {
      this.rpcUrl = currentRpcUrl;
      this.connection = new Connection(currentRpcUrl, {
        commitment: 'confirmed',
        confirmTransactionInitialTimeout: 30000,
        disableRetryOnRateLimit: false,
        httpHeaders: {
          'Content-Type': 'application/json',
        },
      });
    }
    
    return this.connection;
  }

  /**
   * Reset connection (useful for testing or when RPC URL changes)
   */
  static resetConnection(): void {
    this.connection = null;
    this.rpcUrl = null;
  }
}

export default ConnectionService;
