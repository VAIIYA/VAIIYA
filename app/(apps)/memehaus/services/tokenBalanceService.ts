import { Connection, PublicKey } from '@solana/web3.js';
import {
  getAssociatedTokenAddress,
  getAccount,
  TOKEN_PROGRAM_ID,
  AccountLayout,
  getMint
} from '@solana/spl-token';

export interface TokenAccount {
  mint: string;
  balance: string;
  decimals: number;
  symbol?: string;
  name?: string;
}

export interface TokenMetadata {
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
}

export class TokenBalanceService {
  private connection: Connection;
  private tokenList: Map<string, TokenMetadata> = new Map();

  constructor(endpoint: string) {
    this.connection = new Connection(endpoint, 'confirmed');
  }

  private async ensureInitialized() {
    if (this.tokenList.size > 0) return;
    await this.initializeTokenList();
  }

  private async initializeTokenList() {
    try {
      // Fetch verified Solana tokens from Jupiter token list
      const response = await fetch('https://tokens.jup.ag/tokens?tags=verified', {
        next: { revalidate: 3600 } // Add Next.js cache config
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`);
      }

      const tokens = await response.json();

      if (Array.isArray(tokens)) {
        tokens.forEach((token: { address: string; symbol?: string; name?: string; decimals?: number; logoURI?: string }) => {
          // Note: Jupiter API returns 'address' not 'mint'
          if (token.symbol && token.name && token.decimals !== undefined) {
            this.tokenList.set(token.address, {
              symbol: token.symbol,
              name: token.name,
              decimals: token.decimals,
              logoURI: token.logoURI
            });
          }
        });
      }
    } catch (error) {
      console.warn('Failed to fetch token list, utilizing fallback:', error);
      // Fallback to common tokens
      this.setFallbackTokens();
    }
  }

  private setFallbackTokens() {
    const fallbackTokens = [
      { address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', symbol: 'USDC', name: 'USD Coin', decimals: 6 },
      { address: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', symbol: 'USDT', name: 'Tether', decimals: 6 },
      { address: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263', symbol: 'BONK', name: 'Bonk', decimals: 5 },
      { address: '7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr', symbol: 'WEN', name: 'WEN', decimals: 5 },
    ];

    fallbackTokens.forEach(token => {
      this.tokenList.set(token.address, {
        symbol: token.symbol,
        name: token.name,
        decimals: token.decimals
      });
    });
  }

  async getTokenAccounts(walletAddress: string): Promise<TokenAccount[]> {
    await this.ensureInitialized();
    try {
      const wallet = new PublicKey(walletAddress);

      // Get all token accounts for the wallet
      const tokenAccounts = await this.connection.getParsedTokenAccountsByOwner(wallet, {
        programId: TOKEN_PROGRAM_ID,
      });

      const accounts: TokenAccount[] = [];

      for (const { account } of tokenAccounts.value) {
        const accountInfo = account.data.parsed.info;
        const mintAddress = accountInfo.mint;
        const balance = accountInfo.tokenAmount.uiAmount;

        if (balance > 0) {
          const metadata = this.tokenList.get(mintAddress);

          accounts.push({
            mint: mintAddress,
            balance: balance.toString(),
            decimals: accountInfo.tokenAmount.decimals,
            symbol: metadata?.symbol,
            name: metadata?.name
          });
        }
      }

      return accounts;
    } catch (error) {
      console.error('Error fetching token accounts:', error);
      return [];
    }
  }

  async getTokenBalance(walletAddress: string, mintAddress: string): Promise<string> {
    // No need to initialize token list for balance check, but good practice if we want metadata later
    try {
      const wallet = new PublicKey(walletAddress);
      const mint = new PublicKey(mintAddress);

      const tokenAccount = await getAssociatedTokenAddress(mint, wallet);

      try {
        const accountInfo = await getAccount(this.connection, tokenAccount);
        const mintInfo = await getMint(this.connection, mint);

        const balance = Number(accountInfo.amount) / Math.pow(10, mintInfo.decimals);
        return balance.toString();
      } catch {
        // Token account doesn't exist
        return '0';
      }
    } catch (error) {
      console.error('Error fetching token balance:', error);
      return '0';
    }
  }

  getTokenMetadata(mintAddress: string): TokenMetadata | undefined {
    return this.tokenList.get(mintAddress);
  }

  async getSOLBalance(walletAddress: string): Promise<string> {
    const rpcEndpoints = [
      this.connection.rpcEndpoint,
      'https://solana-api.projectserum.com',
      'https://api.mainnet-beta.solana.com',
      'https://rpc.ankr.com/solana'
    ];

    for (const endpoint of rpcEndpoints) {
      try {
        console.log('Fetching SOL balance for:', walletAddress, 'using endpoint:', endpoint);
        const connection = new Connection(endpoint, 'confirmed');
        const wallet = new PublicKey(walletAddress);
        const balance = await connection.getBalance(wallet);
        const solBalance = (balance / 1e9).toString();
        console.log('Raw balance (lamports):', balance, 'SOL balance:', solBalance);
        return solBalance;
      } catch (error) {
        console.error('Error fetching SOL balance with endpoint', endpoint, ':', error);
        continue;
      }
    }

    console.error('All RPC endpoints failed for SOL balance');
    return '0';
  }
}
