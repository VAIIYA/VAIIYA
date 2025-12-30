export interface JupiterToken {
  address: string;
  chainId: number;
  decimals: number;
  name: string;
  symbol: string;
  logoURI?: string;
  tags?: string[];
  extensions?: {
    coingeckoId?: string;
    website?: string;
    twitter?: string;
  };
}

export interface TokenSearchResult {
  tokens: JupiterToken[];
  loading: boolean;
  error: string | null;
}

export class TokenSearchService {
  private tokenList: JupiterToken[] = [];
  private lastFetch: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  async fetchTokenList(): Promise<JupiterToken[]> {
    const now = Date.now();
    
    // Return cached data if still valid
    if (this.tokenList.length > 0 && now - this.lastFetch < this.CACHE_DURATION) {
      return this.tokenList;
    }

    try {
      console.log('Fetching Jupiter token list...');
      
      // Fetch from Jupiter's token list API
      const response = await fetch('https://token.jup.ag/all');
      if (!response.ok) {
        throw new Error(`Failed to fetch token list: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Jupiter API response:', data);
      this.tokenList = data.tokens || [];
      this.lastFetch = now;
      
      console.log(`Fetched ${this.tokenList.length} tokens from Jupiter`);
      return this.tokenList;
    } catch (error) {
      console.error('Error fetching token list:', error);
      
      // Fallback to a smaller curated list if Jupiter API fails
      return this.getFallbackTokenList();
    }
  }

  async searchTokens(
    query: string, 
    userTokens: JupiterToken[] = [], 
    limit: number = 50
  ): Promise<JupiterToken[]> {
    console.log('TokenSearchService.searchTokens called with query:', query);
    
    if (!query.trim()) {
      // Return user tokens first, then popular tokens
      const popularTokens = await this.getPopularTokens();
      console.log('Empty query - returning popular tokens:', popularTokens.length);
      return [...userTokens, ...popularTokens].slice(0, limit);
    }

    let allTokens: JupiterToken[] = [];
    
    try {
      allTokens = await this.fetchTokenList();
      console.log('Total tokens available from API:', allTokens.length);
    } catch (error) {
      console.error('Error fetching token list, using fallback:', error);
      allTokens = this.getFallbackTokenList();
      console.log('Using fallback tokens:', allTokens.length);
    }
    
    const searchTerm = query.toLowerCase().trim();
    console.log('Searching for term:', searchTerm);
    
    // Filter tokens based on search query
    const filteredTokens = allTokens.filter(token => {
      const symbolMatch = token.symbol.toLowerCase().includes(searchTerm);
      const nameMatch = token.name.toLowerCase().includes(searchTerm);
      const addressMatch = token.address.toLowerCase().includes(searchTerm);
      
      return symbolMatch || nameMatch || addressMatch;
    });

    console.log('Filtered tokens:', filteredTokens.length);

    // Sort by relevance: exact matches first, then partial matches
    const sortedTokens = filteredTokens.sort((a, b) => {
      const aSymbol = a.symbol.toLowerCase();
      const bSymbol = b.symbol.toLowerCase();
      const aName = a.name.toLowerCase();
      const bName = b.name.toLowerCase();
      
      // Exact symbol match gets highest priority
      if (aSymbol === searchTerm && bSymbol !== searchTerm) return -1;
      if (bSymbol === searchTerm && aSymbol !== searchTerm) return 1;
      
      // Symbol starts with search term gets second priority
      if (aSymbol.startsWith(searchTerm) && !bSymbol.startsWith(searchTerm)) return -1;
      if (bSymbol.startsWith(searchTerm) && !aSymbol.startsWith(searchTerm)) return 1;
      
      // Name starts with search term gets third priority
      if (aName.startsWith(searchTerm) && !bName.startsWith(searchTerm)) return -1;
      if (bName.startsWith(searchTerm) && !aName.startsWith(searchTerm)) return 1;
      
      // Otherwise sort alphabetically
      return aSymbol.localeCompare(bSymbol);
    });

    const result = sortedTokens.slice(0, limit);
    console.log('Final result:', result.length, 'tokens');
    return result;
  }

  async getPopularTokens(): Promise<JupiterToken[]> {
    const popularSymbols = [
      'SOL', 'USDC', 'USDT', 'BONK', 'JUP', 'GUAC', 'WEN', 'Fartcoin', 'MPH', 'FISH',
      'SS', 'MONEY', 'SECRETS', 'RAY', 'SRM', 'ORCA', 'MNGO', 'SAMO', 'COPE', 'FIDA'
    ];

    try {
      const allTokens = await this.fetchTokenList();
      const filtered = allTokens.filter(token => 
        popularSymbols.includes(token.symbol)
      ).slice(0, 20);
      
      if (filtered.length > 0) {
        return filtered;
      }
    } catch (error) {
      console.error('Error getting popular tokens from API:', error);
    }
    
    // Fallback to hardcoded popular tokens
    console.log('Using fallback popular tokens');
    return this.getFallbackTokenList();
  }

  private getFallbackTokenList(): JupiterToken[] {
    // Fallback list of popular Solana tokens
    return [
      {
        address: 'So11111111111111111111111111111111112',
        chainId: 101,
        decimals: 9,
        name: 'Solana',
        symbol: 'SOL',
        logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111112/logo.png'
      },
      {
        address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        chainId: 101,
        decimals: 6,
        name: 'USD Coin',
        symbol: 'USDC',
        logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png'
      },
      {
        address: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
        chainId: 101,
        decimals: 6,
        name: 'Tether USD',
        symbol: 'USDT',
        logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB/logo.png'
      },
      {
        address: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
        chainId: 101,
        decimals: 5,
        name: 'Bonk',
        symbol: 'BONK',
        logoURI: 'https://arweave.net/hQB3hJ7QNvH8TxArf8yLfw9J7rQjH5kHYzJ-JzFDUSE'
      },
      {
        address: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN',
        chainId: 101,
        decimals: 6,
        name: 'Jupiter',
        symbol: 'JUP',
        logoURI: 'https://arweave.net/8Yv8bSUFqQ1DnOT89a5MnH7bpzQDkq1JWndf3Tfwj-4'
      },
      {
        address: 'AZsHEMXd36Bj1EMNXhowJajpUXzrKcK57wW4ZGXVa7yR',
        chainId: 101,
        decimals: 6,
        name: 'GUAC',
        symbol: 'GUAC',
        logoURI: 'https://jup.ag/tokens/AZsHEMXd36Bj1EMNXhowJajpUXzrKcK57wW4ZGXVa7yR'
      },
      {
        address: 'WENWENvqqNya429ubCdR81ZmD69brwQaaBYY6p3LCpk',
        chainId: 101,
        decimals: 5,
        name: 'WEN',
        symbol: 'WEN',
        logoURI: 'https://jup.ag/tokens/WENWENvqqNya429ubCdR81ZmD69brwQaaBYY6p3LCpk'
      },
      {
        address: '9BB6NFEcjBCtnNLFko2FqVQBq8HHM13kCyYcdQbgpump',
        chainId: 101,
        decimals: 6,
        name: 'Fartcoin',
        symbol: 'Fartcoin',
        logoURI: 'https://jup.ag/tokens/9BB6NFEcjBCtnNLFko2FqVQBq8HHM13kCyYcdQbgpump'
      },
      {
        address: '6gCdT4Y8JACCHLE8gs2Y3BEdoFFQT7yd78YNEbn5jups',
        chainId: 101,
        decimals: 6,
        name: 'MPH',
        symbol: 'MPH',
        logoURI: 'https://jup.ag/tokens/6gCdT4Y8JACCHLE8gs2Y3BEdoFFQT7yd78YNEbn5jups'
      },
      {
        address: '4grGMfn7wHsYsGSSYrRCT6ZUbYUuuMA3Z7SWviUpjups',
        chainId: 101,
        decimals: 6,
        name: 'FISH',
        symbol: 'FISH',
        logoURI: 'https://jup.ag/tokens/4grGMfn7wHsYsGSSYrRCT6ZUbYUuuMA3Z7SWviUpjups'
      },
      {
        address: 'BkAUSA24JZpdutfo2UfRnbhz3ZinNTB91eHMkyWujups',
        chainId: 101,
        decimals: 6,
        name: 'SS',
        symbol: 'SS',
        logoURI: 'https://jup.ag/tokens/BkAUSA24JZpdutfo2UfRnbhz3ZinNTB91eHMkyWujups'
      },
      {
        address: 'AwxN7Yah5idxZ52agJ7xm5aWsAQocKsjZYeLXPJrjups',
        chainId: 101,
        decimals: 6,
        name: 'MONEY',
        symbol: 'MONEY',
        logoURI: 'https://jup.ag/tokens/AwxN7Yah5idxZ52agJ7xm5aWsAQocKsjZYeLXPJrjups'
      },
      {
        address: '2nEoopvk6xYRXj24R8uMyLzFXr73PHFDqMjwYwCwjups',
        chainId: 101,
        decimals: 6,
        name: 'SECRETS',
        symbol: 'SECRETS',
        logoURI: 'https://jup.ag/tokens/2nEoopvk6xYRXj24R8uMyLzFXr73PHFDqMjwYwCwjups'
      },
      {
        address: '7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj',
        chainId: 101,
        decimals: 6,
        name: 'stSOL',
        symbol: 'stSOL',
        logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj/logo.png'
      },
      {
        address: 'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So',
        chainId: 101,
        decimals: 9,
        name: 'Marinade staked SOL',
        symbol: 'mSOL',
        logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So/logo.png'
      },
      {
        address: '7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr',
        chainId: 101,
        decimals: 6,
        name: 'PEPE',
        symbol: 'PEPE',
        logoURI: 'https://arweave.net/8Yv8bSUFqQ1DnOT89a5MnH7bpzQDkq1JWndf3Tfwj-4'
      }
    ];
  }

  // Convert Jupiter token to SwapToken format
  convertToSwapToken(jupiterToken: JupiterToken, balance: string = '0', price: number = 0): {
    mint: string;
    symbol: string;
    name: string;
    balance: string;
    price: number;
    priceChange24h: number;
    decimals: number;
    logoURI?: string;
  } {
    return {
      mint: jupiterToken.address,
      symbol: jupiterToken.symbol,
      name: jupiterToken.name,
      balance,
      price,
      priceChange24h: 0,
      decimals: jupiterToken.decimals,
      logoURI: jupiterToken.logoURI
    };
  }
}
