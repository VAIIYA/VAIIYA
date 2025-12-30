export interface TokenPrice {
  symbol: string;
  price: number;
  priceChange24h: number;
  volume24h: number;
  marketCap: number;
}

export interface JupiterRoute {
  inputMint: string;
  outputMint: string;
  inAmount: string;
  outAmount: string;
  priceImpactPct?: number;
  otherAmountThreshold?: string;
  swapMode?: string;
  priceImpact?: number;
}

export interface SwapQuote {
  inputMint: string;
  outputMint: string;
  inputAmount: string;
  outputAmount: string;
  priceImpact: number;
  fee: number;
  routes: JupiterRoute[];
  swapTransaction: string;
}

export interface JupiterQuoteResponse {
  inputMint: string;
  outputMint: string;
  inputAmount: string;
  outputAmount: string;
  priceImpactPct: number;
  fee: number;
  routes: JupiterRoute[];
  swapTransaction: string;
}

export class PriceService {
  private baseUrl = 'https://price.jup.ag/v4';

  async getTokenPrice(mintAddress: string): Promise<TokenPrice | null> {
    try {
      const response = await fetch(`${this.baseUrl}/price?ids=${mintAddress}`);
      const data = await response.json();
      
      if (data.data && data.data[mintAddress]) {
        const tokenData = data.data[mintAddress];
        return {
          symbol: tokenData.symbol || 'Unknown',
          price: tokenData.price,
          priceChange24h: tokenData.priceChange24h || 0,
          volume24h: tokenData.volume24h || 0,
          marketCap: tokenData.marketCap || 0
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching token price:', error);
      return null;
    }
  }

  async getMultipleTokenPrices(mintAddresses: string[]): Promise<Map<string, TokenPrice>> {
    try {
      const ids = mintAddresses.join(',');
      const response = await fetch(`${this.baseUrl}/price?ids=${ids}`, {
        // Add timeout to prevent hanging
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });
      
      if (!response.ok) {
        throw new Error(`Price API returned ${response.status}`);
      }
      
      const data = await response.json();
      
      const prices = new Map<string, TokenPrice>();
      
      if (data.data) {
        Object.entries(data.data).forEach(([mint, tokenData]: [string, any]) => {
          prices.set(mint, {
            symbol: tokenData.symbol || 'Unknown',
            price: tokenData.price,
            priceChange24h: tokenData.priceChange24h || 0,
            volume24h: tokenData.volume24h || 0,
            marketCap: tokenData.marketCap || 0
          });
        });
      }
      
      return prices;
    } catch (error) {
      console.error('Error fetching multiple token prices:', error);
      // Return empty map but don't throw - allow UI to continue with price = 0
      return new Map();
    }
  }

  async getSwapQuote(
    inputMint: string,
    outputMint: string,
    inputAmount: string,
    slippageBps: number = 50
  ): Promise<SwapQuote | null> {
    try {
      const url = `https://quote-api.jup.ag/v6/quote?inputMint=${inputMint}&outputMint=${outputMint}&inputAmount=${inputAmount}&slippageBps=${slippageBps}`;
      
      const response = await fetch(url, {
        // Add timeout to prevent hanging
        signal: AbortSignal.timeout(15000) // 15 second timeout
      });
      
      if (!response.ok) {
        throw new Error(`Quote API returned ${response.status}: ${response.statusText}`);
      }
      
      const data: JupiterQuoteResponse = await response.json();
      
      if (!data || !data.outputAmount) {
        throw new Error('Invalid quote response from Jupiter API');
      }
      
      return {
        inputMint: data.inputMint,
        outputMint: data.outputMint,
        inputAmount: data.inputAmount,
        outputAmount: data.outputAmount,
        priceImpact: data.priceImpactPct,
        fee: data.fee,
        routes: data.routes,
        swapTransaction: data.swapTransaction
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error fetching swap quote:', errorMessage);
      
      // Check if it's a network/DNS error
      if (errorMessage.includes('ERR_NAME_NOT_RESOLVED') || errorMessage.includes('Failed to fetch')) {
        console.error('Jupiter API is unreachable. This may be a network or DNS issue.');
      }
      
      return null;
    }
  }

  async getSwapTransaction(quoteResponse: SwapQuote): Promise<string | null> {
    try {
      const response = await fetch('https://quote-api.jup.ag/v6/swap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quoteResponse,
          userPublicKey: '', // Will be set by the caller
          wrapUnwrapSOL: true
        }),
      });
      
      const data = await response.json();
      return data.swapTransaction;
    } catch (error) {
      console.error('Error getting swap transaction:', error);
      return null;
    }
  }

  // Get exchange rate between two tokens
  async getExchangeRate(inputMint: string, outputMint: string): Promise<number> {
    try {
      const quote = await this.getSwapQuote(inputMint, outputMint, '1000000000'); // 1 SOL in lamports
      if (quote) {
        const inputAmount = parseFloat(quote.inputAmount);
        const outputAmount = parseFloat(quote.outputAmount);
        return outputAmount / inputAmount;
      }
      return 0;
    } catch (error) {
      console.error('Error getting exchange rate:', error);
      return 0;
    }
  }

  // Format price with appropriate decimals
  formatPrice(price: number, decimals: number = 6): string {
    if (price === 0) return '0.00';
    
    if (price < 0.000001) {
      return price.toExponential(2);
    } else if (price < 0.01) {
      return price.toFixed(6);
    } else if (price < 1) {
      return price.toFixed(4);
    } else if (price < 100) {
      return price.toFixed(2);
    } else {
      return price.toFixed(2);
    }
  }

  // Format balance with appropriate decimals
  formatBalance(balance: number, decimals: number = 6): string {
    if (balance === 0) return '0.00';
    
    if (balance < 0.000001) {
      return balance.toExponential(2);
    } else if (balance < 0.01) {
      return balance.toFixed(6);
    } else if (balance < 1) {
      return balance.toFixed(4);
    } else if (balance < 1000) {
      return balance.toFixed(2);
    } else {
      return balance.toLocaleString('en-US', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
      });
    }
  }
}
