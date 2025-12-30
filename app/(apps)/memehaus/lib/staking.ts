import { 
  Connection, 
  PublicKey, 
  Transaction, 
  SystemProgram, 
  LAMPORTS_PER_SOL,
  TransactionInstruction,
  sendAndConfirmTransaction,
  Keypair,
  VersionedTransaction,
  TransactionMessage
} from '@solana/web3.js';
import { 
  TOKEN_PROGRAM_ID, 
  getAssociatedTokenAddress, 
  createAssociatedTokenAccountInstruction, 
  createTransferInstruction,
  getAccount,
  Account
} from '@solana/spl-token';

// Service fee wallet address (replace with actual wallet)
const SERVICE_FEE_WALLET = new PublicKey('11111111111111111111111111111111'); // Example - replace with actual fee wallet

// Staking pool configurations with their program IDs and addresses
export interface StakingPool {
  name: string;
  programId: PublicKey;
  poolAddress: PublicKey;
  tokenMint: PublicKey;
  tokenSymbol: string;
  logoURI: string;
  apiEndpoint?: string;
  apy: number;
  minStake: number;
  maxStake: number;
  lockupPeriod?: number; // in days
  validatorFee?: number; // percentage
}

export interface PoolInfo {
  pool: StakingPool;
  currentAPY: number;
  totalValueLocked: number;
  availableCapacity: number;
  lastUpdated: number;
}

export interface UserStakeData {
  walletAddress: PublicKey;
  stakedAmount: number;
  currentPool: StakingPool | null;
  rewardsEarned: number;
  totalValue: number;
  apy: number;
  serviceFeeEstimate: number;
  netRewards: number;
  stakingStartTime: number;
  canWithdraw: boolean;
  lockupEndTime?: number;
}

export interface StakeResult {
  success: boolean;
  signature?: string;
  error?: string;
  pool?: StakingPool;
  amount?: number;
}

export interface WithdrawResult {
  success: boolean;
  signature?: string;
  error?: string;
  amount?: number;
  rewards?: number;
  serviceFee?: number;
  netAmount?: number;
}

export class StakingService {
  private connection: Connection;
  private pools: StakingPool[] = [
    // Marinade Finance
    {
      name: 'Marinade Finance',
      programId: new PublicKey('MarBmsSgKXdrN1egZf5sqe1TMai9K1rChYNDJgjq7aD'),
      poolAddress: new PublicKey('8szGkuLTAux9XMgZ2vtY39jVSowEcpBf7mDc236ZUi59'),
      tokenMint: new PublicKey('mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So'),
      tokenSymbol: 'mSOL',
      logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So/logo.png',
      apiEndpoint: 'https://api.marinade.finance/v1/apy',
      apy: 0,
      minStake: 0.1,
      maxStake: 1000000,
      validatorFee: 0.06
    },
    // Lido
    {
      name: 'Lido',
      programId: new PublicKey('CrWpht4EcUf9bTfD9j1fVbPE2LmGD5zGtPz3GqGq2noL'),
      poolAddress: new PublicKey('CrX7kMhLC3cSsXJdT7JDgqrRVWGnUpX3gfEfxxU2NVLi'),
      tokenMint: new PublicKey('7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj'),
      tokenSymbol: 'stSOL',
      logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj/logo.png',
      apiEndpoint: 'https://api.lido.fi/v1/protocol/steth/apr/short',
      apy: 0,
      minStake: 0.1,
      maxStake: 1000000,
      validatorFee: 0.05
    },
    // Jito
    {
      name: 'Jito',
      programId: new PublicKey('J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn'),
      poolAddress: new PublicKey('J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn'),
      tokenMint: new PublicKey('J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn'),
      tokenSymbol: 'jitoSOL',
      logoURI: 'https://jup.ag/tokens/J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn',
      apiEndpoint: 'https://api.jito.network/v1/apy',
      apy: 0,
      minStake: 0.1,
      maxStake: 1000000,
      validatorFee: 0.04
    },
    // Socean
    {
      name: 'Socean',
      programId: new PublicKey('SPoo1Ku8WFXoNDMHPsrGSTSG1Y47rzgn41SLUNakuHy'),
      poolAddress: new PublicKey('SPoo1Ku8WFXoNDMHPsrGSTSG1Y47rzgn41SLUNakuHy'),
      tokenMint: new PublicKey('SPoo1Ku8WFXoNDMHPsrGSTSG1Y47rzgn41SLUNakuHy'),
      tokenSymbol: 'scnSOL',
      logoURI: 'https://jup.ag/tokens/SPoo1Ku8WFXoNDMHPsrGSTSG1Y47rzgn41SLUNakuHy',
      apiEndpoint: 'https://api.socean.fi/v1/apy',
      apy: 0,
      minStake: 0.1,
      maxStake: 1000000,
      validatorFee: 0.05
    }
  ];

  private userStakes: Map<string, UserStakeData> = new Map();

  constructor(connection: Connection) {
    this.connection = connection;
  }

  /**
   * Fetches live APY data from all staking pools and returns the highest APY option
   * @returns Promise<PoolInfo> - Information about the highest APY pool
   */
  async getHighestAPYPool(): Promise<PoolInfo> {
    try {
      console.log('Fetching live APY data from staking pools...');
      
      // Fetch APY data from all pools concurrently
      const apyPromises = this.pools.map(async (pool) => {
        try {
          const apy = await this.fetchPoolAPY(pool);
          return { ...pool, apy };
        } catch (error) {
          console.error(`Error fetching APY for ${pool.name}:`, error);
          return pool; // Return pool with default APY
        }
      });

      const updatedPools = await Promise.all(apyPromises);
      
      // Find the pool with the highest APY
      const highestAPYPool = updatedPools.reduce((best, current) => 
        current.apy > best.apy ? current : best
      );

      // Get additional pool information
      const poolInfo: PoolInfo = {
        pool: highestAPYPool,
        currentAPY: highestAPYPool.apy,
        totalValueLocked: await this.getPoolTVL(highestAPYPool),
        availableCapacity: await this.getPoolCapacity(highestAPYPool),
        lastUpdated: Date.now()
      };

      console.log(`Highest APY pool: ${poolInfo.pool.name} with ${poolInfo.currentAPY.toFixed(2)}% APY`);
      return poolInfo;
    } catch (error) {
      console.error('Error getting highest APY pool:', error);
      throw new Error('Failed to fetch staking pool data');
    }
  }

  /**
   * Stakes SOL to the highest APY pool automatically
   * @param amount - Amount of SOL to stake
   * @param wallet - User's wallet public key
   * @returns Promise<StakeResult> - Transaction result
   */
  async stakeSOL(amount: number, wallet: PublicKey): Promise<StakeResult> {
    try {
      console.log(`Staking ${amount} SOL for wallet: ${wallet.toString()}`);

      // Get the highest APY pool
      const poolInfo = await this.getHighestAPYPool();
      const pool = poolInfo.pool;

      // Validate stake amount
      if (amount < pool.minStake) {
        return {
          success: false,
          error: `Minimum stake amount is ${pool.minStake} SOL`
        };
      }

      if (amount > pool.maxStake) {
        return {
          success: false,
          error: `Maximum stake amount is ${pool.maxStake} SOL`
        };
      }

      // Check if user already has a stake
      const existingStake = this.userStakes.get(wallet.toString());
      if (existingStake && existingStake.stakedAmount > 0) {
        return {
          success: false,
          error: 'You already have an active stake. Please withdraw first or stake to a different pool.'
        };
      }

      // Create staking transaction based on pool type
      const transaction = await this.createStakingTransaction(pool, amount, wallet);
      
      // In a real implementation, you would sign and send the transaction here
      // For now, we'll simulate the transaction
      const signature = await this.simulateTransaction(transaction);

      // Update user stake data
      const userStakeData: UserStakeData = {
        walletAddress: wallet,
        stakedAmount: amount,
        currentPool: pool,
        rewardsEarned: 0,
        totalValue: amount,
        apy: pool.apy,
        serviceFeeEstimate: 0,
        netRewards: 0,
        stakingStartTime: Date.now(),
        canWithdraw: true,
        lockupEndTime: pool.lockupPeriod ? Date.now() + (pool.lockupPeriod * 24 * 60 * 60 * 1000) : undefined
      };

      this.userStakes.set(wallet.toString(), userStakeData);

      console.log(`Successfully staked ${amount} SOL to ${pool.name}`);
      
      return {
        success: true,
        signature,
        pool,
        amount
      };
    } catch (error) {
      console.error('Error staking SOL:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Staking failed'
      };
    }
  }

  /**
   * Withdraws staked SOL and handles service fee logic
   * @param wallet - User's wallet public key
   * @returns Promise<WithdrawResult> - Withdrawal result with fee calculations
   */
  async withdrawSOL(wallet: PublicKey): Promise<WithdrawResult> {
    try {
      console.log(`Processing withdrawal for wallet: ${wallet.toString()}`);

      const userStake = this.userStakes.get(wallet.toString());
      if (!userStake || userStake.stakedAmount === 0) {
        return {
          success: false,
          error: 'No active stake found'
        };
      }

      // Check if withdrawal is allowed (lockup period)
      if (!userStake.canWithdraw) {
        return {
          success: false,
          error: 'Stake is still in lockup period'
        };
      }

      // Calculate rewards earned
      const timeStaked = (Date.now() - userStake.stakingStartTime) / (1000 * 60 * 60 * 24 * 365); // years
      const rewardsEarned = userStake.stakedAmount * (userStake.apy / 100) * timeStaked;
      
      // Calculate service fee (0.01% of rewards only)
      const serviceFee = rewardsEarned * 0.0001; // 0.01%
      
      // Calculate net amount (principal + rewards - service fee)
      const netAmount = userStake.stakedAmount + rewardsEarned - serviceFee;

      // Create withdrawal transaction
      const transaction = await this.createWithdrawalTransaction(userStake.currentPool!, userStake.stakedAmount, wallet);
      
      // In a real implementation, you would sign and send the transaction here
      const signature = await this.simulateTransaction(transaction);

      // Transfer service fee to fee wallet
      if (serviceFee > 0) {
        await this.transferServiceFee(serviceFee, wallet);
      }

      // Clear user stake data
      this.userStakes.delete(wallet.toString());

      console.log(`Successfully withdrew ${netAmount.toFixed(4)} SOL (${serviceFee.toFixed(4)} SOL service fee)`);

      return {
        success: true,
        signature,
        amount: userStake.stakedAmount,
        rewards: rewardsEarned,
        serviceFee,
        netAmount
      };
    } catch (error) {
      console.error('Error withdrawing SOL:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Withdrawal failed'
      };
    }
  }

  /**
   * Gets current user stake information including balance, APY, rewards, and fee estimates
   * @param wallet - User's wallet public key
   * @returns Promise<UserStakeData> - Current stake information
   */
  async getUserStakeInfo(wallet: PublicKey): Promise<UserStakeData> {
    try {
      console.log(`Getting stake info for wallet: ${wallet.toString()}`);

      const userStake = this.userStakes.get(wallet.toString());
      
      if (!userStake || userStake.stakedAmount === 0) {
        // Return empty stake data
        return {
          walletAddress: wallet,
          stakedAmount: 0,
          currentPool: null,
          rewardsEarned: 0,
          totalValue: 0,
          apy: 0,
          serviceFeeEstimate: 0,
          netRewards: 0,
          stakingStartTime: 0,
          canWithdraw: true
        };
      }

      // Update rewards calculation
      const timeStaked = (Date.now() - userStake.stakingStartTime) / (1000 * 60 * 60 * 24 * 365);
      const rewardsEarned = userStake.stakedAmount * (userStake.apy / 100) * timeStaked;
      const serviceFeeEstimate = rewardsEarned * 0.0001; // 0.01%
      const netRewards = rewardsEarned - serviceFeeEstimate;
      const totalValue = userStake.stakedAmount + rewardsEarned;

      // Check if withdrawal is allowed
      const canWithdraw = userStake.lockupEndTime ? Date.now() >= userStake.lockupEndTime : true;

      const updatedStakeData: UserStakeData = {
        ...userStake,
        rewardsEarned,
        totalValue,
        serviceFeeEstimate,
        netRewards,
        canWithdraw
      };

      // Update stored data
      this.userStakes.set(wallet.toString(), updatedStakeData);

      return updatedStakeData;
    } catch (error) {
      console.error('Error getting user stake info:', error);
      throw new Error('Failed to get user stake information');
    }
  }

  /**
   * Fetches live APY data from a specific staking pool
   * @param pool - Staking pool configuration
   * @returns Promise<number> - Current APY percentage
   */
  private async fetchPoolAPY(pool: StakingPool): Promise<number> {
    try {
      if (!pool.apiEndpoint) {
        // Return default APY if no API endpoint
        return pool.apy;
      }

      const response = await fetch(pool.apiEndpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Add timeout to prevent hanging requests
        signal: AbortSignal.timeout(5000)
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      
      // Parse APY based on pool type
      let apy = 0;
      switch (pool.name) {
        case 'Marinade Finance':
          apy = data.apy || data.apr || 8.5;
          break;
        case 'Lido':
          apy = data.apr || data.apy || 7.2;
          break;
        case 'Jito':
          apy = data.apy || data.apr || 9.1;
          break;
        case 'Socean':
          apy = data.apy || data.apr || 7.8;
          break;
        default:
          apy = data.apy || data.apr || pool.apy;
      }

      return Math.max(0, apy); // Ensure APY is not negative
    } catch (error) {
      console.error(`Error fetching APY for ${pool.name}:`, error);
      return pool.apy; // Return default APY on error
    }
  }

  /**
   * Gets total value locked for a specific pool
   * @param pool - Staking pool configuration
   * @returns Promise<number> - TVL in SOL
   */
  private async getPoolTVL(pool: StakingPool): Promise<number> {
    try {
      // In a real implementation, you would fetch TVL from the pool's API
      // For now, return a mock value
      return Math.random() * 1000000 + 100000; // Random TVL between 100k and 1.1M SOL
    } catch (error) {
      console.error(`Error getting TVL for ${pool.name}:`, error);
      return 0;
    }
  }

  /**
   * Gets available capacity for a specific pool
   * @param pool - Staking pool configuration
   * @returns Promise<number> - Available capacity in SOL
   */
  private async getPoolCapacity(pool: StakingPool): Promise<number> {
    try {
      // In a real implementation, you would fetch capacity from the pool's API
      // For now, return a mock value
      return Math.random() * 100000 + 10000; // Random capacity between 10k and 110k SOL
    } catch (error) {
      console.error(`Error getting capacity for ${pool.name}:`, error);
      return 0;
    }
  }

  /**
   * Creates a staking transaction for the specified pool
   * @param pool - Staking pool configuration
   * @param amount - Amount to stake
   * @param wallet - User's wallet
   * @returns Promise<Transaction> - Prepared transaction
   */
  private async createStakingTransaction(pool: StakingPool, amount: number, wallet: PublicKey): Promise<Transaction> {
    const transaction = new Transaction();

    // Add pool-specific staking instructions
    switch (pool.name) {
      case 'Marinade Finance':
        transaction.add(await this.createMarinadeStakeInstruction(amount, wallet));
        break;
      case 'Lido':
        transaction.add(await this.createLidoStakeInstruction(amount, wallet));
        break;
      case 'Jito':
        transaction.add(await this.createJitoStakeInstruction(amount, wallet));
        break;
      case 'Socean':
        transaction.add(await this.createSoceanStakeInstruction(amount, wallet));
        break;
      default:
        // Generic staking instruction
        transaction.add(await this.createGenericStakeInstruction(pool, amount, wallet));
    }

    return transaction;
  }

  /**
   * Creates a withdrawal transaction for the specified pool
   * @param pool - Staking pool configuration
   * @param amount - Amount to withdraw
   * @param wallet - User's wallet
   * @returns Promise<Transaction> - Prepared transaction
   */
  private async createWithdrawalTransaction(pool: StakingPool, amount: number, wallet: PublicKey): Promise<Transaction> {
    const transaction = new Transaction();

    // Add pool-specific withdrawal instructions
    switch (pool.name) {
      case 'Marinade Finance':
        transaction.add(await this.createMarinadeWithdrawInstruction(amount, wallet));
        break;
      case 'Lido':
        transaction.add(await this.createLidoWithdrawInstruction(amount, wallet));
        break;
      case 'Jito':
        transaction.add(await this.createJitoWithdrawInstruction(amount, wallet));
        break;
      case 'Socean':
        transaction.add(await this.createSoceanWithdrawInstruction(amount, wallet));
        break;
      default:
        // Generic withdrawal instruction
        transaction.add(await this.createGenericWithdrawInstruction(pool, amount, wallet));
    }

    return transaction;
  }

  /**
   * Transfers service fee to the fee wallet
   * @param feeAmount - Amount of SOL to transfer as fee
   * @param fromWallet - User's wallet
   * @returns Promise<string> - Transaction signature
   */
  private async transferServiceFee(feeAmount: number, fromWallet: PublicKey): Promise<string> {
    try {
      const transaction = new Transaction();
      
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: fromWallet,
          toPubkey: SERVICE_FEE_WALLET,
          lamports: feeAmount * LAMPORTS_PER_SOL
        })
      );

      return await this.simulateTransaction(transaction);
    } catch (error) {
      console.error('Error transferring service fee:', error);
      throw error;
    }
  }

  /**
   * Simulates a transaction (in real implementation, this would sign and send)
   * @param transaction - Transaction to simulate
   * @returns Promise<string> - Mock transaction signature
   */
  private async simulateTransaction(transaction: Transaction): Promise<string> {
    try {
      // In a real implementation, you would:
      // 1. Get the latest blockhash
      // 2. Sign the transaction with the user's wallet
      // 3. Send and confirm the transaction
      
      // For now, we'll simulate the transaction
      const mockSignature = `mock_signature_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      console.log(`Transaction simulated successfully: ${mockSignature}`);
      return mockSignature;
    } catch (error) {
      console.error('Error simulating transaction:', error);
      throw error;
    }
  }

  // Pool-specific instruction creators (simplified implementations)
  private async createMarinadeStakeInstruction(amount: number, wallet: PublicKey): Promise<TransactionInstruction> {
    // Marinade stake instruction would go here
    return new TransactionInstruction({
      keys: [],
      programId: new PublicKey('MarBmsSgKXdrN1egZf5sqe1TMai9K1rChYNDJgjq7aD'),
      data: Buffer.from([])
    });
  }

  private async createLidoStakeInstruction(amount: number, wallet: PublicKey): Promise<TransactionInstruction> {
    // Lido stake instruction would go here
    return new TransactionInstruction({
      keys: [],
      programId: new PublicKey('CrWpht4EcUf9bTfD9j1fVbPE2LmGD5zGtPz3GqGq2noL'),
      data: Buffer.from([])
    });
  }

  private async createJitoStakeInstruction(amount: number, wallet: PublicKey): Promise<TransactionInstruction> {
    // Jito stake instruction would go here
    return new TransactionInstruction({
      keys: [],
      programId: new PublicKey('J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn'),
      data: Buffer.from([])
    });
  }

  private async createSoceanStakeInstruction(amount: number, wallet: PublicKey): Promise<TransactionInstruction> {
    // Socean stake instruction would go here
    return new TransactionInstruction({
      keys: [],
      programId: new PublicKey('SPoo1Ku8WFXoNDMHPsrGSTSG1Y47rzgn41SLUNakuHy'),
      data: Buffer.from([])
    });
  }

  private async createGenericStakeInstruction(pool: StakingPool, amount: number, wallet: PublicKey): Promise<TransactionInstruction> {
    // Generic stake instruction
    return new TransactionInstruction({
      keys: [],
      programId: pool.programId,
      data: Buffer.from([])
    });
  }

  // Withdrawal instruction creators
  private async createMarinadeWithdrawInstruction(amount: number, wallet: PublicKey): Promise<TransactionInstruction> {
    return new TransactionInstruction({
      keys: [],
      programId: new PublicKey('MarBmsSgKXdrN1egZf5sqe1TMai9K1rChYNDJgjq7aD'),
      data: Buffer.from([])
    });
  }

  private async createLidoWithdrawInstruction(amount: number, wallet: PublicKey): Promise<TransactionInstruction> {
    return new TransactionInstruction({
      keys: [],
      programId: new PublicKey('CrWpht4EcUf9bTfD9j1fVbPE2LmGD5zGtPz3GqGq2noL'),
      data: Buffer.from([])
    });
  }

  private async createJitoWithdrawInstruction(amount: number, wallet: PublicKey): Promise<TransactionInstruction> {
    return new TransactionInstruction({
      keys: [],
      programId: new PublicKey('J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn'),
      data: Buffer.from([])
    });
  }

  private async createSoceanWithdrawInstruction(amount: number, wallet: PublicKey): Promise<TransactionInstruction> {
    return new TransactionInstruction({
      keys: [],
      programId: new PublicKey('SPoo1Ku8WFXoNDMHPsrGSTSG1Y47rzgn41SLUNakuHy'),
      data: Buffer.from([])
    });
  }

  private async createGenericWithdrawInstruction(pool: StakingPool, amount: number, wallet: PublicKey): Promise<TransactionInstruction> {
    return new TransactionInstruction({
      keys: [],
      programId: pool.programId,
      data: Buffer.from([])
    });
  }
}
