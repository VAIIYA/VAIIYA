import { Connection, PublicKey } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, getAccount } from '@solana/spl-token';

export interface TokenBalance {
  symbol: string;
  address: string;
  balance: number;
  decimals: number;
  uiAmount: number;
}

export class BalanceService {
  private static connection: Connection | null = null;

  /**
   * Initialize connection to Solana network
   * @param endpoint - RPC endpoint
   */
  static initialize(endpoint: string) {
    this.connection = new Connection(endpoint, 'confirmed');
  }

  /**
   * Get SOL balance for a wallet
   * @param walletAddress - Wallet public key
   * @returns Promise<number>
   */
  static async getSolBalance(walletAddress: string): Promise<number> {
    try {
      if (!this.connection) {
        throw new Error('Connection not initialized');
      }

      console.log('Fetching SOL balance for:', walletAddress);
      const publicKey = new PublicKey(walletAddress);
      const balance = await this.connection.getBalance(publicKey);
      
      // Convert lamports to SOL (1 SOL = 1e9 lamports)
      const solBalance = balance / 1e9;
      console.log('SOL balance (lamports):', balance, 'SOL:', solBalance);
      
      return solBalance;
    } catch (error) {
      console.error('Error fetching SOL balance:', error);
      return 0;
    }
  }

  /**
   * Get token balance for a specific token
   * @param walletAddress - Wallet public key
   * @param tokenAddress - Token mint address
   * @param decimals - Token decimals
   * @returns Promise<number>
   */
  static async getTokenBalance(
    walletAddress: string,
    tokenAddress: string,
    decimals: number
  ): Promise<number> {
    try {
      if (!this.connection) {
        throw new Error('Connection not initialized');
      }

      console.log('Fetching token balance for:', tokenAddress, 'wallet:', walletAddress);
      const walletPublicKey = new PublicKey(walletAddress);
      const tokenPublicKey = new PublicKey(tokenAddress);

      // Get all token accounts for the wallet
      const tokenAccounts = await this.connection.getParsedTokenAccountsByOwner(
        walletPublicKey,
        { mint: tokenPublicKey }
      );

      console.log('Found token accounts:', tokenAccounts.value.length);

      if (tokenAccounts.value.length === 0) {
        console.log('No token accounts found for:', tokenAddress);
        return 0;
      }

      // Sum up all token account balances
      let totalBalance = 0;
      for (const account of tokenAccounts.value) {
        const accountInfo = account.account.data.parsed.info;
        const balance = parseFloat(accountInfo.tokenAmount.uiAmount);
        console.log('Account balance:', balance);
        totalBalance += balance;
      }

      console.log('Total token balance:', totalBalance);
      return totalBalance;
    } catch (error) {
      console.error('Error fetching token balance:', error);
      return 0;
    }
  }

  /**
   * Get balances for multiple tokens
   * @param walletAddress - Wallet public key
   * @param tokens - Array of token info
   * @returns Promise<TokenBalance[]>
   */
  static async getTokenBalances(
    walletAddress: string,
    tokens: Array<{ symbol: string; address: string; decimals: number }>
  ): Promise<TokenBalance[]> {
    const balances: TokenBalance[] = [];

    // Get SOL balance first
    const solBalance = await this.getSolBalance(walletAddress);
    balances.push({
      symbol: 'SOL',
      address: 'So11111111111111111111111111111111112',
      balance: solBalance,
      decimals: 9,
      uiAmount: solBalance,
    });

    // Get token balances in parallel
    const tokenBalancePromises = tokens
      .filter(token => token.symbol !== 'SOL') // SOL already handled above
      .map(async (token) => {
        const balance = await this.getTokenBalance(
          walletAddress,
          token.address,
          token.decimals
        );

        return {
          symbol: token.symbol,
          address: token.address,
          balance,
          decimals: token.decimals,
          uiAmount: balance,
        };
      });

    const tokenBalances = await Promise.all(tokenBalancePromises);
    balances.push(...tokenBalances);

    return balances;
  }

  /**
   * Format balance for display
   * @param balance - Balance amount
   * @param decimals - Token decimals
   * @param symbol - Token symbol
   * @returns Formatted balance string
   */
  static formatBalance(balance: number, decimals: number, symbol: string): string {
    if (balance === 0) return '0.00';
    
    // Handle different decimal places
    if (symbol === 'SOL') {
      return balance.toFixed(4);
    } else if (symbol === 'BONK') {
      return balance.toFixed(0);
    } else {
      return balance.toFixed(2);
    }
  }

  /**
   * Get mock balances for development/testing
   * @param walletAddress - Wallet address
   * @returns Promise<TokenBalance[]>
   */
  static async getMockBalances(walletAddress: string): Promise<TokenBalance[]> {
    // Simulate some delay
    await new Promise(resolve => setTimeout(resolve, 500));

    return [
      {
        symbol: 'SOL',
        address: 'So11111111111111111111111111111111112',
        balance: 2.5,
        decimals: 9,
        uiAmount: 2.5,
      },
      {
        symbol: 'USDC',
        address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        balance: 150.75,
        decimals: 6,
        uiAmount: 150.75,
      },
      {
        symbol: 'USDT',
        address: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
        balance: 75.25,
        decimals: 6,
        uiAmount: 75.25,
      },
      {
        symbol: 'BONK',
        address: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
        balance: 500000,
        decimals: 5,
        uiAmount: 500000,
      },
    ];
  }
}
