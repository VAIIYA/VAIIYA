import { Connection, PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
import { 
  getAssociatedTokenAddress, 
  createTransferInstruction, 
  TOKEN_PROGRAM_ID,
  getOrCreateAssociatedTokenAccount
} from '@solana/spl-token';
import { TokenData } from '../lib/githubOnlyStorage';
import { getAllCreatorsFromMongoDB } from '../lib/mongodbStorage';

export interface CommunityFeeDistribution {
  recipientWallet: string;
  amount: bigint;
  share: number; // Percentage share (e.g., 33.33 for 1/3)
}

export interface DistributionResult {
  success: boolean;
  distributions: CommunityFeeDistribution[];
  totalRecipients: number;
  totalAmount: bigint;
  error?: string;
}

/**
 * Service for distributing community fees to previous token creators
 */
export class CommunityFeeService {
  private connection: Connection;
  private serverWallet: PublicKey;

  constructor(connection: Connection, serverWallet: string = '7UhwWmw1r15fqLKcbYEDVFjqiz2G753MsyDksFAjfT3e') {
    this.connection = connection;
    this.serverWallet = new PublicKey(serverWallet);
  }

  /**
   * Get all unique previous token creators from MongoDB
   * @param excludeWallet - Wallet address to exclude (current creator)
   * @returns Array of unique creator wallet addresses
   */
  async getPreviousCreators(excludeWallet?: string): Promise<string[]> {
    try {
      console.log('📋 Fetching previous token creators from MongoDB...');
      
      // Get all creators from MongoDB
      const allCreators = await getAllCreatorsFromMongoDB();
      
      // Filter out excluded wallet
      const previousCreators = excludeWallet 
        ? allCreators.filter(addr => addr !== excludeWallet)
        : allCreators;
      
      console.log(`✅ Found ${previousCreators.length} unique previous creators`);
      
      return previousCreators;
    } catch (error) {
      console.error('❌ Error fetching previous creators from MongoDB:', error);
      return [];
    }
  }

  /**
   * Calculate distribution amounts for each previous creator
   * @param totalCommunityFee - Total community fee amount (in token base units)
   * @param previousCreators - Array of previous creator wallet addresses
   * @returns Distribution breakdown
   */
  calculateDistribution(
    totalCommunityFee: bigint,
    previousCreators: string[]
  ): DistributionResult {
    try {
      if (previousCreators.length === 0) {
        return {
          success: true,
          distributions: [],
          totalRecipients: 0,
          totalAmount: totalCommunityFee
        };
      }

      // Split equally among all previous creators
      const sharePerCreator = totalCommunityFee / BigInt(previousCreators.length);
      const remainder = totalCommunityFee % BigInt(previousCreators.length);
      
      const distributions: CommunityFeeDistribution[] = previousCreators.map((wallet, index) => {
        // Add remainder to first creator to handle rounding
        const amount = index === 0 ? sharePerCreator + remainder : sharePerCreator;
        const share = (100 / previousCreators.length);
        
        return {
          recipientWallet: wallet,
          amount,
          share
        };
      });

      console.log(`📊 Distribution calculated:`);
      console.log(`   Total recipients: ${distributions.length}`);
      console.log(`   Amount per recipient: ${sharePerCreator.toString()}`);
      console.log(`   Total amount: ${totalCommunityFee.toString()}`);

      return {
        success: true,
        distributions,
        totalRecipients: distributions.length,
        totalAmount: totalCommunityFee
      };
    } catch (error) {
      console.error('❌ Error calculating distribution:', error);
      return {
        success: false,
        distributions: [],
        totalRecipients: 0,
        totalAmount: totalCommunityFee,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Create distribution transactions for community fees
   * @param tokenMint - Token mint address
   * @param totalCommunityFee - Total community fee amount
   * @param excludeWallet - Current creator wallet to exclude
   * @returns Array of distribution transactions
   */
  async createDistributionTransactions(
    tokenMint: PublicKey,
    totalCommunityFee: bigint,
    excludeWallet?: string
  ): Promise<{
    success: boolean;
    transactions: Transaction[];
    distributions: CommunityFeeDistribution[];
    error?: string;
  }> {
    try {
      // Get previous creators
      const previousCreators = await this.getPreviousCreators(excludeWallet);
      
      if (previousCreators.length === 0) {
        console.log('ℹ️ No previous creators found, skipping distribution');
        return {
          success: true,
          transactions: [],
          distributions: []
        };
      }

      // Calculate distribution
      const distributionResult = this.calculateDistribution(totalCommunityFee, previousCreators);
      
      if (!distributionResult.success) {
        return {
          success: false,
          transactions: [],
          distributions: [],
          error: distributionResult.error
        };
      }

      // Get server wallet token account
      const serverTokenAccount = await getOrCreateAssociatedTokenAccount(
        this.connection,
        { publicKey: this.serverWallet } as any, // Fee payer (server wallet)
        tokenMint,
        this.serverWallet
      );

      // Create transactions (batch into groups of 10 to avoid transaction size limits)
      const transactions: Transaction[] = [];
      const BATCH_SIZE = 10;
      
      for (let i = 0; i < distributionResult.distributions.length; i += BATCH_SIZE) {
        const batch = distributionResult.distributions.slice(i, i + BATCH_SIZE);
        const transaction = new Transaction();
        
        for (const distribution of batch) {
          const recipientWallet = new PublicKey(distribution.recipientWallet);
          
          // Get or create recipient token account
          const recipientTokenAccount = await getOrCreateAssociatedTokenAccount(
            this.connection,
            { publicKey: this.serverWallet } as any,
            tokenMint,
            recipientWallet
          );

          // Add transfer instruction
          transaction.add(
            createTransferInstruction(
              serverTokenAccount.address,
              recipientTokenAccount.address,
              this.serverWallet, // Owner (server wallet holds the fees)
              distribution.amount,
              [],
              TOKEN_PROGRAM_ID
            )
          );
        }

        transactions.push(transaction);
      }

      console.log(`✅ Created ${transactions.length} distribution transaction(s) for ${distributionResult.distributions.length} recipients`);

      return {
        success: true,
        transactions,
        distributions: distributionResult.distributions
      };
    } catch (error) {
      console.error('❌ Error creating distribution transactions:', error);
      return {
        success: false,
        transactions: [],
        distributions: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get distribution summary for display
   * @param tokenMint - Token mint address
   * @param totalCommunityFee - Total community fee amount
   * @param excludeWallet - Current creator wallet to exclude
   * @returns Distribution summary
   */
  async getDistributionSummary(
    tokenMint: string,
    totalCommunityFee: bigint,
    excludeWallet?: string
  ): Promise<DistributionResult> {
    const previousCreators = await this.getPreviousCreators(excludeWallet);
    return this.calculateDistribution(totalCommunityFee, previousCreators);
  }
}

