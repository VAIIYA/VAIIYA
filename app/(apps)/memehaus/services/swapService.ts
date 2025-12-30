import { Connection, PublicKey, Transaction, VersionedTransaction } from '@solana/web3.js';
import { PriceService, SwapQuote } from './priceService';
import { TokenService } from './tokenService';

export interface SwapParams {
  inputMint: string;
  outputMint: string;
  inputAmount: string;
  slippageBps: number;
  userPublicKey: string;
}

export interface SwapResult {
  success: boolean;
  transactionSignature?: string;
  error?: string;
  quote?: SwapQuote;
}

export class SwapService {
  private connection: Connection;
  private priceService: PriceService;

  constructor(endpoint: string) {
    this.connection = new Connection(endpoint, 'confirmed');
    this.priceService = new PriceService();
  }

  async executeSwap(
    params: SwapParams,
    signTransaction: (transaction: Transaction | VersionedTransaction) => Promise<Transaction | VersionedTransaction>
  ): Promise<SwapResult> {
    try {
      console.log('Starting swap execution...', params);

      // Step 1: Get swap quote
      const quote = await this.priceService.getSwapQuote(
        params.inputMint,
        params.outputMint,
        params.inputAmount,
        params.slippageBps
      );

      if (!quote) {
        return {
          success: false,
          error: 'Failed to get swap quote'
        };
      }

      console.log('Swap quote received:', quote);

      // Step 2: Get swap transaction
      const swapTransaction = await this.priceService.getSwapTransaction(quote);
      
      if (!swapTransaction) {
        return {
          success: false,
          error: 'Failed to get swap transaction'
        };
      }

      console.log('Swap transaction received');

      // Step 3: Deserialize and sign transaction
      const transaction = VersionedTransaction.deserialize(
        Buffer.from(swapTransaction, 'base64')
      );

      // Step 4: Sign the transaction
      const signedTransaction = await signTransaction(transaction);

      console.log('Transaction signed, sending to network...');

      // Step 5: Send transaction
      const signature = await this.connection.sendTransaction(signedTransaction as VersionedTransaction, {
        skipPreflight: false,
        preflightCommitment: 'confirmed',
        maxRetries: 3
      });

      console.log('Transaction sent, signature:', signature);

      // Step 6: Wait for confirmation using robust polling
      const confirmed = await TokenService.confirmTransactionRobust(this.connection, signature, 30);
      
      if (!confirmed) {
        return {
          success: false,
          error: 'Transaction was not confirmed within the timeout period',
          quote
        };
      }

      console.log('Swap completed successfully!');

      return {
        success: true,
        transactionSignature: signature,
        quote
      };

    } catch (error) {
      console.error('Swap execution failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async getSwapPreview(params: SwapParams): Promise<SwapQuote | null> {
    try {
      return await this.priceService.getSwapQuote(
        params.inputMint,
        params.outputMint,
        params.inputAmount,
        params.slippageBps
      );
    } catch (error) {
      console.error('Error getting swap preview:', error);
      return null;
    }
  }

  async getExchangeRate(inputMint: string, outputMint: string): Promise<number> {
    return await this.priceService.getExchangeRate(inputMint, outputMint);
  }

  // Validate swap parameters
  validateSwapParams(params: SwapParams): { valid: boolean; error?: string } {
    if (!params.inputMint || !params.outputMint) {
      return { valid: false, error: 'Input and output mints are required' };
    }

    if (params.inputMint === params.outputMint) {
      return { valid: false, error: 'Input and output tokens must be different' };
    }

    if (!params.inputAmount || parseFloat(params.inputAmount) <= 0) {
      return { valid: false, error: 'Input amount must be greater than 0' };
    }

    if (!params.userPublicKey) {
      return { valid: false, error: 'User public key is required' };
    }

    if (params.slippageBps < 1 || params.slippageBps > 10000) {
      return { valid: false, error: 'Slippage must be between 0.01% and 100%' };
    }

    return { valid: true };
  }

  // Calculate price impact
  calculatePriceImpact(quote: SwapQuote): number {
    if (!quote || parseFloat(quote.inputAmount) === 0) {
      return 0;
    }

    return Math.abs(quote.priceImpact);
  }

  // Format slippage from basis points to percentage
  formatSlippage(slippageBps: number): string {
    return (slippageBps / 100).toFixed(2);
  }

  // Convert percentage to basis points
  percentageToBps(percentage: number): number {
    return Math.round(percentage * 100);
  }
} 