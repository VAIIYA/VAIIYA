import { PublicKey } from '@solana/web3.js';

export interface FeeBreakdown {
  developerFee: number;
  developerFeeAmount: number;
  totalFee: number;
  netAmount: number;
}

export class FeeService {
  private static readonly DEVELOPER_FEE_RATE = 0.001; // 0.1%
  private static readonly DEVELOPER_WALLET = 'EpfmoiBoNFEofbACjZo1vpyqXUy5Fq9ZtPrGVwok5fb3';

  /**
   * Calculate the developer fee and return fee breakdown
   * @param amount - The input amount for the swap
   * @param tokenDecimals - The number of decimals for the token
   * @returns FeeBreakdown object with all fee calculations
   */
  static calculateDeveloperFee(amount: number, tokenDecimals: number = 6): FeeBreakdown {
    const developerFeeAmount = amount * this.DEVELOPER_FEE_RATE;
    const netAmount = amount - developerFeeAmount;
    const totalFee = developerFeeAmount;

    return {
      developerFee: this.DEVELOPER_FEE_RATE * 100, // Convert to percentage for display
      developerFeeAmount,
      totalFee,
      netAmount,
    };
  }

  /**
   * Get the developer wallet address
   * @returns PublicKey of the developer wallet
   */
  static getDeveloperWallet(): PublicKey {
    return new PublicKey(this.DEVELOPER_WALLET);
  }

  /**
   * Get the developer fee rate as a percentage
   * @returns Developer fee rate as a percentage
   */
  static getDeveloperFeeRate(): number {
    return this.DEVELOPER_FEE_RATE * 100;
  }

  /**
   * Format fee amount for display
   * @param amount - The fee amount
   * @param decimals - Number of decimal places to show
   * @returns Formatted fee string
   */
  static formatFeeAmount(amount: number, decimals: number = 6): string {
    return amount.toFixed(decimals);
  }

  /**
   * Calculate the fee for a specific token amount
   * @param tokenAmount - The token amount
   * @param tokenPrice - The token price in USD
   * @returns Fee amount in USD
   */
  static calculateFeeUSD(tokenAmount: number, tokenPrice: number): number {
    return tokenAmount * tokenPrice * this.DEVELOPER_FEE_RATE;
  }
}
