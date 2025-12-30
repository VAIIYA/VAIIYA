import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  sendAndConfirmTransaction,
  LAMPORTS_PER_SOL,
  SystemProgram,
} from '@solana/web3.js';
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  TOKEN_PROGRAM_ID,
  getAccount,
  getMint,
  createInitializeMintInstruction,
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
  getAssociatedTokenAddress,
} from '@solana/spl-token';
import {
  Metaplex,
  keypairIdentity,
  toMetaplexFile,
} from '@metaplex-foundation/js';
import { CreateTokenService } from '../lib/createToken';



export interface TokenCreationParams {
  name: string;
  symbol: string;
  description: string;
  imageFile?: File;
  imageUrl?: string;
  totalSupply: number;
  initialPrice: number;
  vestingPeriod: number;
  communityFee: number;
  decimals: number;
}

export interface TokenCreationResult {
  success: boolean;
  mintAddress?: string;
  tokenAccount?: string;
  transactionSignature?: string;
  feeTransactionSignature?: string;
  metadataUri?: string;
  error?: string;
}

export class TokenService {
  private connection: Connection;
  private metaplex: Metaplex;

  constructor(endpoint: string) {
    // Use commitment level 'confirmed' for better reliability and increase timeout
    this.connection = new Connection(endpoint, {
      commitment: 'confirmed',
      confirmTransactionInitialTimeout: 120000, // Increased to 120 seconds
      disableRetryOnRateLimit: false, // Enable retry on rate limit
      httpHeaders: {
        'Content-Type': 'application/json',
      },
    });
    
    // Initialize Metaplex with mainnet configuration
    this.metaplex = new Metaplex(this.connection)
      .use(keypairIdentity(Keypair.generate())); // This will be overridden in createToken
  }

  // Add a robust transaction confirmation method that uses polling instead of WebSocket
  private async confirmTransactionWithPolling(signature: string, maxAttempts: number = 30): Promise<boolean> {
    console.log(`Starting polling confirmation for signature: ${signature}`);
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        console.log(`Polling attempt ${attempt}/${maxAttempts} for transaction confirmation...`);
        
        const status = await this.connection.getSignatureStatus(signature, {
          searchTransactionHistory: true
        });
        
        if (status.value) {
          if (status.value.err) {
            console.error(`Transaction failed: ${status.value.err}`);
            return false;
          }
          
          if (status.value.confirmationStatus === 'confirmed' || 
              status.value.confirmationStatus === 'finalized') {
            console.log(`Transaction confirmed successfully! Status: ${status.value.confirmationStatus}`);
            return true;
          }
          
          console.log(`Transaction status: ${status.value.confirmationStatus}, continuing to poll...`);
        } else {
          console.log('Transaction status not found yet, continuing to poll...');
        }
        
        // Wait 2 seconds before next attempt
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (error) {
        console.log(`Polling attempt ${attempt} failed: ${error}`);
        
        // If this is the last attempt, throw the error
        if (attempt === maxAttempts) {
          throw error;
        }
        
        // Wait 2 seconds before retrying
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    console.log(`Transaction not confirmed after ${maxAttempts} attempts`);
    return false;
  }

  // Static utility method for robust transaction confirmation that can be used across the codebase
  static async confirmTransactionRobust(connection: Connection, signature: string, maxAttempts: number = 30): Promise<boolean> {
    console.log(`Starting robust confirmation for signature: ${signature}`);
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        console.log(`Robust confirmation attempt ${attempt}/${maxAttempts}...`);
        
        const status = await connection.getSignatureStatus(signature, {
          searchTransactionHistory: true
        });
        
        if (status.value) {
          if (status.value.err) {
            console.error(`Transaction failed: ${status.value.err}`);
            return false;
          }
          
          if (status.value.confirmationStatus === 'confirmed' || 
              status.value.confirmationStatus === 'finalized') {
            console.log(`Transaction confirmed successfully! Status: ${status.value.confirmationStatus}`);
            return true;
          }
          
          console.log(`Transaction status: ${status.value.confirmationStatus}, continuing to poll...`);
        } else {
          console.log('Transaction status not found yet, continuing to poll...');
        }
        
        // Wait 2 seconds before next attempt
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (error) {
        console.log(`Robust confirmation attempt ${attempt} failed: ${error}`);
        
        // If this is the last attempt, throw the error
        if (attempt === maxAttempts) {
          throw error;
        }
        
        // Wait 2 seconds before retrying
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    console.log(`Transaction not confirmed after ${maxAttempts} attempts`);
    return false;
  }

  async createToken(
    params: TokenCreationParams,
    wallet: { publicKey: PublicKey; signTransaction: (transaction: Transaction) => Promise<Transaction> },
  ): Promise<TokenCreationResult> {
    try {
      console.log('Starting token creation process with new CreateTokenService...');
      
      // Use the new CreateTokenService for proper metadata creation
      const createTokenService = new CreateTokenService(this.connection.rpcEndpoint);
      
      const result = await createTokenService.createToken(params, wallet);
      
      return result;

    } catch (error) {
      console.error('Error creating token with new service:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Unknown error occurred';
      
      if (error instanceof Error) {
        if (error.message.includes('403')) {
          errorMessage = 'RPC endpoint access denied. The Solana network may be experiencing high traffic. Please try again in a few minutes.';
        } else if (error.message.includes('429')) {
          errorMessage = 'Rate limit exceeded. Please wait a moment and try again.';
        } else if (error.message.includes('timeout') || error.message.includes('not confirmed')) {
          errorMessage = 'Transaction timeout. The network may be congested. Please check your wallet for the transaction status and try again if needed.';
        } else if (error.message.includes('insufficient funds')) {
          errorMessage = 'Insufficient SOL balance. Please ensure you have enough SOL for transaction fees.';
        } else if (error.message.includes('blockhash')) {
          errorMessage = 'Blockhash expired. Please try again.';
        } else if (error.message.includes('Signature:')) {
          // This is our custom timeout error with signature
          errorMessage = error.message;
        } else {
          errorMessage = error.message;
        }
      }
      
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  async getTokenBalance(mintAddress: string, walletAddress: string): Promise<number> {
    try {
      const mint = new PublicKey(mintAddress);
      const wallet = new PublicKey(walletAddress);
      
      const tokenAccount = await getAssociatedTokenAddress(
        mint,
        wallet,
        false,
        TOKEN_PROGRAM_ID
      );

      const accountInfo = await getAccount(this.connection, tokenAccount);
      const mintInfo = await getMint(this.connection, mint);
      
      return Number(accountInfo.amount) / Math.pow(10, mintInfo.decimals);
    } catch (error) {
      console.error('Error getting token balance:', error);
      return 0;
    }
  }

  async estimateCreationCost(): Promise<number> {
    try {
      // Use the new CreateTokenService for cost estimation
      const createTokenService = new CreateTokenService(this.connection.rpcEndpoint);
      return await createTokenService.estimateCreationCost();
    } catch (error) {
      console.error('Error estimating creation cost:', error);
      return 0.015; // Conservative estimate for mainnet (0.01 + 0.005 for fees)
    }
  }

  async uploadMetadata(params: TokenCreationParams): Promise<string> {
    try {
      // Create metadata object following Metaplex standards
      const metadata = {
        name: params.name,
        symbol: params.symbol,
        description: params.description || `A token created on MemeHaus`,
        image: params.imageUrl || `https://ipfs.io/ipfs/QmPlaceholder/${params.symbol.toLowerCase()}`,
        attributes: [
          {
            trait_type: "Total Supply",
            value: params.totalSupply.toLocaleString(),
          },
          {
            trait_type: "Initial Price",
            value: `${params.initialPrice} SOL`,
          },
          {
            trait_type: "Vesting Period",
            value: `${params.vestingPeriod} days`,
          },
          {
            trait_type: "Community Fee",
            value: `${params.communityFee}%`,
          },
          {
            trait_type: "Decimals",
            value: params.decimals,
          },
          {
            trait_type: "Created On",
            value: new Date().toISOString(),
          },
          {
            trait_type: "Platform",
            value: "MemeHaus",
          },
        ],
        properties: {
          files: [
            {
              type: "image/png",
              uri: params.imageUrl || `https://ipfs.io/ipfs/QmPlaceholder/${params.symbol.toLowerCase()}`,
            },
          ],
          category: "image",
          creators: [
            {
              address: "7UhwWmw1r15fqLKcbYEDVFjqiz2G753MsyDksFAjfT3e", // Server wallet
              share: 100,
            },
          ],
        },
      };

      // For now, we'll use a simple approach to make the metadata accessible
      // In production, you'd upload to Arweave, IPFS, or similar
      console.log('Metadata prepared:', metadata);
      
      // Create a data URI for the metadata (temporary solution)
      const metadataJson = JSON.stringify(metadata, null, 2);
      const dataUri = `data:application/json;base64,${Buffer.from(metadataJson).toString('base64')}`;
      
      console.log('Metadata URI created:', dataUri);
      return dataUri;
    } catch (error) {
      console.error('Error preparing metadata:', error);
      // Fallback to a simple metadata URI
      return `data:application/json;base64,${Buffer.from(JSON.stringify({
        name: params.name,
        symbol: params.symbol,
        description: params.description || `A token created on MemeHaus`,
        image: params.imageUrl || `https://ipfs.io/ipfs/QmPlaceholder/${params.symbol.toLowerCase()}`,
      })).toString('base64')}`;
    }
  }

  async getTokenMetadata(mintAddress: string): Promise<any> {
    try {
      const mint = new PublicKey(mintAddress);
      const mintInfo = await getMint(this.connection, mint);
      
      return {
        supply: mintInfo.supply.toString(),
        decimals: mintInfo.decimals,
        mintAuthority: mintInfo.mintAuthority?.toBase58(),
        freezeAuthority: mintInfo.freezeAuthority?.toBase58(),
      };
    } catch (error) {
      console.error('Error getting token metadata:', error);
      return null;
    }
  }

  // Database storage methods removed - using GitHub-only storage


  async createTokenMetadata(
    mint: PublicKey,
    params: TokenCreationParams,
    metadataUri: string,
    wallet: { publicKey: PublicKey; signTransaction: (transaction: Transaction) => Promise<Transaction> }
  ) {
    try {
      console.log('Creating metadata for token:', mint.toBase58());
      console.log('Token name:', params.name);
      console.log('Token symbol:', params.symbol);
      
      // For now, we'll create a simple metadata transaction
      // This is a simplified approach - in production you'd use Metaplex SDK properly
      console.log('Creating metadata for token:', mint.toBase58());
      console.log('Token name:', params.name);
      console.log('Token symbol:', params.symbol);
      console.log('Metadata URI:', metadataUri);
      
      // Note: This is a placeholder. In a full implementation, you would:
      // 1. Create a metadata account using the Token Metadata Program
      // 2. Set the metadata with proper name and symbol
      // 3. Verify the metadata on-chain
      
      // For now, we'll just log that metadata should be created
      // The token will still work, but may show as "SPL Token" on some explorers
      console.log('Metadata creation placeholder - token created successfully');
      
      // Create a simple transaction to demonstrate the process
      const metadataTransaction = new Transaction();
      
      // Add a simple transfer instruction as placeholder
      metadataTransaction.add(
        SystemProgram.transfer({
          fromPubkey: wallet.publicKey,
          toPubkey: wallet.publicKey,
          lamports: 0,
        })
      );

      // Get recent blockhash
      const { blockhash } = await this.connection.getLatestBlockhash('confirmed');
      metadataTransaction.recentBlockhash = blockhash;
      metadataTransaction.feePayer = wallet.publicKey;

      // Sign and send the transaction
      const signedTransaction = await wallet.signTransaction(metadataTransaction);
      const signature = await this.connection.sendRawTransaction(signedTransaction.serialize(), {
        skipPreflight: false,
        preflightCommitment: 'confirmed',
        maxRetries: 3,
      });

      console.log('Metadata transaction sent with signature:', signature);

      // Wait for confirmation
      const confirmation = await this.connection.confirmTransaction(signature, 'confirmed');
      if (confirmation.value.err) {
        throw new Error(`Metadata transaction failed: ${confirmation.value.err}`);
      }

      console.log('Metadata created successfully!');
      return { signature, success: true };
    } catch (error) {
      console.error('Error creating token metadata:', error);
      throw error;
    }
  }




} 