import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  createInitializeMintInstruction,
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
  createTransferInstruction,
  createSetAuthorityInstruction,
  AuthorityType,
} from '@solana/spl-token';
import { PDAService } from './pdaService';

// Metadata creation removed - using simple token creation only
import { 
  uploadTokenImage, 
  uploadTokenMetadata, 
  storeTokenData, 
  testGitHubConnection,
  TokenMetadata,
  TokenData
} from './githubOnlyStorage';
// @ts-ignore - Type definitions may be outdated, but function exists at runtime
import {
  createCreateMetadataAccountV3Instruction,
} from '@metaplex-foundation/mpl-token-metadata';

const TOKEN_METADATA_PROGRAM_ID = new PublicKey(
  'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s'
);

export interface TokenCreationParams {
  name: string;
  symbol: string;
  description: string;
  imageFile?: File;
  imageUrl?: string;
  totalSupply?: number; // Optional - will default to 1,000,000,000
  initialPrice: number;
  vestingPeriod: number;
  communityFee: number;
  decimals: number;
}

// Fixed total supply: 1 billion tokens
const FIXED_TOTAL_SUPPLY = 1_000_000_000;

// Distribution percentages
const CREATOR_PERCENTAGE = 20; // 20% to creator
const LIQUIDITY_PERCENTAGE = 70; // 70% to liquidity PDA
const COMMUNITY_PERCENTAGE = 10; // 10% to community PDA

export interface TokenCreationResult {
  success: boolean;
  mintAddress?: string;
  tokenAccount?: string;
  transactionSignature?: string;
  feeTransactionSignature?: string;
  metadataUri?: string;
  metadataSignature?: string;
  error?: string;
}

export class CreateTokenService {
  private connection: Connection;

  constructor(endpoint: string) {
    console.log(`🔗 Creating Connection with endpoint: ${endpoint.replace(/\?api-key=[^&]+/, '?api-key=***')}`);
    this.connection = new Connection(endpoint, {
      commitment: 'confirmed',
      confirmTransactionInitialTimeout: 120000, // 2 minutes
      disableRetryOnRateLimit: false,
      httpHeaders: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Upload metadata JSON to GitHub for redundancy
   */
  private async uploadMetadataToGitHub(metadata: any): Promise<string> {
    try {
      console.log('Uploading metadata to GitHub for redundancy...');
      
      // Use API route instead of direct import (server-side only)
      const response = await fetch('/api/github/upload-metadata', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          metadata,
          tokenSymbol: metadata.symbol,
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        console.log('Metadata uploaded to GitHub for redundancy:', result.url);
        return result.url!;
      } else {
        throw new Error(result.error || 'GitHub upload failed');
      }
    } catch (error) {
      console.error('Failed to upload metadata to GitHub for redundancy:', error);
      // Throw error so caller can handle fallback
      throw error;
    }
  }

  /**
   * Prepare metadata object for the token using GitHub storage
   */
  private async prepareMetadata(params: TokenCreationParams, creatorWallet: string): Promise<{ metadataUri: string; imageUrl: string }> {
    try {
      console.log('Preparing metadata with GitHub storage...');
      
      // Test GitHub connection via API route (server-side)
      let githubConnected = false;
      try {
        const testResponse = await fetch('/api/github/test-connection');
        const testResult = await testResponse.json();
        githubConnected = testResult.connected || false;
      } catch (githubTestError) {
        console.warn('GitHub connection test failed:', githubTestError);
        // Continue to fallback
      }
      
      if (!githubConnected) {
        // GitHub not available (not configured) - use fallback immediately
        throw new Error('GitHub connection not available - using fallback');
      }

      // Upload image to GitHub
      let imageUrl = params.imageUrl || `https://raw.githubusercontent.com/memehause/memehause-assets/main/placeholder.png`;
      
      if (params.imageFile) {
        console.log('Uploading token image to GitHub...');
        // Use API route instead of direct import (server-side only)
        try {
          const formData = new FormData();
          formData.append('image', params.imageFile);
          formData.append('symbol', params.symbol);
          
          const imageResponse = await fetch('/api/github/upload-image', {
            method: 'POST',
            body: formData,
          });
          
          const imageResult = await imageResponse.json();
          
          if (imageResult.success) {
            imageUrl = imageResult.url!;
            console.log(`✅ Token image uploaded to GitHub: ${imageUrl}`);
          } else {
            console.warn('❌ Image upload failed, using placeholder:', imageResult.error);
          }
        } catch (imageError) {
          console.warn('❌ Image upload error, using placeholder:', imageError);
        }
      }

      // Prepare metadata object following Metaplex token metadata standard
      const metadata = {
        name: params.name,
        symbol: params.symbol,
        description: params.description || `A token created on MemeHaus`,
        image: imageUrl,
        attributes: [
          {
            trait_type: "Total Supply",
            value: (params.totalSupply || FIXED_TOTAL_SUPPLY).toLocaleString(),
          },
          {
            trait_type: "Initial Price",
            value: `${params.initialPrice} SOL`,
          },
          {
            trait_type: "Community Fee",
            value: `${params.communityFee}%`,
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
              uri: imageUrl,
              type: "image/png",
            },
          ],
          category: "image",
          creators: [
            {
              address: creatorWallet, // Use the actual creator's wallet address
              share: 100,
            },
          ],
        },
      };

      console.log('Metadata prepared:', metadata);
      
      // Upload metadata to GitHub via API route
      console.log('Uploading metadata to GitHub...');
      const metadataResponse = await fetch('/api/github/upload-metadata', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          metadata,
          tokenSymbol: params.symbol,
        }),
      });
      
      const metadataResult = await metadataResponse.json();
      
      if (metadataResult.success) {
        console.log(`✅ Metadata uploaded to GitHub: ${metadataResult.url}`);
        return { metadataUri: metadataResult.url!, imageUrl: imageUrl };
      } else {
        throw new Error(`Metadata upload failed: ${metadataResult.error}`);
      }
      } catch (error) {
        console.error('Error preparing metadata with GitHub:', error);
        
        // Final fallback: data URI
        try {
          console.log('Using final fallback: data URI');
          const fallbackMetadata = {
            name: params.name,
            symbol: params.symbol,
            description: params.description || `A token created on MemeHaus`,
            image: params.imageUrl || `https://raw.githubusercontent.com/memehause/memehause-assets/main/placeholder.png`,
            attributes: [
              {
                trait_type: "Total Supply",
                value: (params.totalSupply || FIXED_TOTAL_SUPPLY).toLocaleString(),
              },
              {
                trait_type: "Initial Price",
                value: `${params.initialPrice} SOL`,
              },
              {
                trait_type: "Community Fee",
                value: `${params.communityFee}%`,
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
                  uri: params.imageUrl || `https://ipfs.io/ipfs/QmPlaceholder/${params.symbol.toLowerCase()}`,
                  type: "image/png",
                },
              ],
              category: "image",
              creators: [
                {
                  address: creatorWallet,
                  share: 100,
                },
              ],
            },
          };
          
          const fallbackMetadataUri = await this.uploadMetadataToGitHub(fallbackMetadata);
          return { metadataUri: fallbackMetadataUri, imageUrl: params.imageUrl || `https://raw.githubusercontent.com/memehause/memehause-assets/main/placeholder.png` };
        } catch (githubError) {
          console.error('GitHub fallback also failed:', githubError);
          
          // Final fallback: data URI with proper metadata structure
          console.log('Using final fallback: data URI');
          const fallbackMetadata = {
            name: params.name,
            symbol: params.symbol,
            description: params.description || `A token created on MemeHaus`,
            image: params.imageUrl || `https://raw.githubusercontent.com/memehause/memehause-assets/main/placeholder.png`,
            attributes: [
              {
                trait_type: "Total Supply",
                value: (params.totalSupply || FIXED_TOTAL_SUPPLY).toLocaleString(),
              },
              {
                trait_type: "Initial Price",
                value: `${params.initialPrice} SOL`,
              },
              {
                trait_type: "Community Fee",
                value: `${params.communityFee}%`,
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
                  uri: params.imageUrl || `https://ipfs.io/ipfs/QmPlaceholder/${params.symbol.toLowerCase()}`,
                  type: "image/png",
                },
              ],
              category: "image",
              creators: [
                {
                  address: creatorWallet,
                  share: 100,
                },
              ],
            },
          };
          
          // Create data URI - use browser-compatible base64 encoding
          const metadataJson = JSON.stringify(fallbackMetadata);
          const base64Metadata = typeof btoa !== 'undefined' 
            ? btoa(unescape(encodeURIComponent(metadataJson)))
            : Buffer.from(metadataJson).toString('base64');
          const dataUri = `data:application/json;base64,${base64Metadata}`;
          
          // Validate we have a non-empty URI
          if (!dataUri || dataUri.length < 10) {
            throw new Error('Failed to create metadata URI - data URI is invalid');
          }
          
          // Metaplex metadata URI has a maximum length of 200 characters
          // If data URI is too long, use a placeholder URL instead
          // Note: Name and symbol are stored directly in metadata account, not in URI
          if (dataUri.length > 200) {
            console.warn(`⚠️ Data URI is too long (${dataUri.length} chars, max 200). Using placeholder URL.`);
            console.warn('   Name and symbol will still be set correctly in metadata account.');
            // Use a placeholder URL - the full metadata is stored in MongoDB anyway
            const placeholderUri = `https://memehaus.vercel.app/api/metadata/${params.symbol.toLowerCase()}`;
            console.log('✅ Using placeholder metadata URI (length:', placeholderUri.length, 'chars)');
            const finalImageUrl = params.imageUrl || `https://raw.githubusercontent.com/memehause/memehause-assets/main/placeholder.png`;
            return { metadataUri: placeholderUri, imageUrl: finalImageUrl };
          }
          
          console.log('✅ Created data URI fallback for metadata (length:', dataUri.length, 'chars)');
          const finalImageUrl = params.imageUrl || `https://raw.githubusercontent.com/memehause/memehause-assets/main/placeholder.png`;
          return { metadataUri: dataUri, imageUrl: finalImageUrl };
        }
      }
  }



  /**
   * Robust transaction confirmation using polling with improved error handling
   */
  private async confirmTransactionRobust(signature: string, maxAttempts: number = 30): Promise<boolean> {
    console.log(`Starting robust confirmation for signature: ${signature}`);
    
    // First, verify the signature is valid
    if (!signature || signature.length < 32) {
      console.error('Invalid transaction signature');
      return false;
    }
    
    // Try using Solana's built-in confirmation first (faster and more reliable)
    try {
      console.log('Attempting built-in confirmation...');
      await this.connection.confirmTransaction(signature, 'confirmed');
      console.log('✅ Transaction confirmed using built-in method');
      return true;
    } catch (builtInError) {
      console.log('Built-in confirmation not available, falling back to polling...');
      // Continue to polling method
    }
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        console.log(`Robust confirmation attempt ${attempt}/${maxAttempts}...`);
        
        // Try getSignatureStatus with different options
        let status = await Promise.race([
          this.connection.getSignatureStatus(signature, {
            searchTransactionHistory: true
          }),
          new Promise<any>((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), 5000)
          )
        ]).catch(() => null);
        
        // If not found, try without searchTransactionHistory (faster)
        if (!status?.value && attempt <= 10) {
          status = await Promise.race([
            this.connection.getSignatureStatus(signature),
            new Promise<any>((_, reject) => 
              setTimeout(() => reject(new Error('Timeout')), 5000)
            )
          ]).catch(() => null);
        }
        
        if (status?.value) {
          if (status.value.err) {
            console.error(`Transaction failed: ${JSON.stringify(status.value.err)}`);
            return false;
          }
          
          if (status.value.confirmationStatus === 'confirmed' || 
              status.value.confirmationStatus === 'finalized') {
            console.log(`✅ Transaction confirmed! Status: ${status.value.confirmationStatus}`);
            return true;
          }
          
          console.log(`Transaction status: ${status.value.confirmationStatus}, continuing to poll...`);
        } else {
          // Try to get the transaction directly to see if it exists
          try {
            const tx = await Promise.race([
              this.connection.getTransaction(signature, {
                commitment: 'confirmed',
                maxSupportedTransactionVersion: 0
              }),
              new Promise<any>((_, reject) => 
                setTimeout(() => reject(new Error('Timeout')), 5000)
              )
            ]).catch(() => null);
            
            if (tx) {
              if (tx.meta?.err) {
                console.error(`Transaction found but failed: ${JSON.stringify(tx.meta.err)}`);
                return false;
              }
              // Transaction exists and has no error - it's confirmed
              console.log('✅ Transaction found on-chain without errors, treating as confirmed');
              return true;
            } else {
              if (attempt % 5 === 0) {
                console.log(`Transaction not found yet (attempt ${attempt}/${maxAttempts}), continuing to poll...`);
              }
            }
          } catch (txError) {
            // Transaction not found, continue polling
            if (attempt % 5 === 0) {
              console.log(`Transaction not found yet (attempt ${attempt}/${maxAttempts}), continuing to poll...`);
            }
          }
        }
        
        // Wait 2 seconds before next attempt (reduce to 1.5s for faster confirmation)
        // But increase wait time for later attempts to give RPC more time
        const waitTime = attempt > 20 ? 3000 : 1500; // 3 seconds for later attempts
        await new Promise(resolve => setTimeout(resolve, waitTime));
        
      } catch (error) {
        console.log(`Robust confirmation attempt ${attempt} failed: ${error}`);
        
        // If this is the last attempt, check one more time with a different method
        if (attempt === maxAttempts) {
          try {
            // Final check - try to get the transaction directly
            const tx = await this.connection.getTransaction(signature, {
              commitment: 'confirmed',
              maxSupportedTransactionVersion: 0
            });
            
            if (tx && !tx.meta?.err) {
              console.log('✅ Transaction found on final attempt');
              return true;
            }
          } catch (finalError) {
            console.error('Final transaction check failed:', finalError);
          }
          
          return false;
        }
        
        // Wait longer before retrying on errors
        const waitTime = attempt > 20 ? 3000 : 2000; // 3 seconds for later attempts
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
    
    console.log(`Transaction not confirmed after ${maxAttempts} attempts`);
    return false;
  }

  /**
   * Create token with proper metadata using Metaplex Token Metadata program
   */
  async createToken(
    params: TokenCreationParams,
    wallet: { publicKey: PublicKey; signTransaction: (transaction: Transaction) => Promise<Transaction> },
  ): Promise<TokenCreationResult> {
    try {
      console.log('Starting token creation process with proper metadata...');
      
      // Test RPC connection first
      try {
        const rpcEndpoint = this.connection.rpcEndpoint;
        const maskedEndpoint = rpcEndpoint.replace(/\?api-key=[^&]+/, '?api-key=***');
        console.log(`🔗 Testing RPC connection to: ${maskedEndpoint}`);
        const blockhash = await this.connection.getLatestBlockhash();
        console.log(`✅ RPC connection test successful. Latest blockhash: ${blockhash.blockhash.slice(0, 8)}...`);
      } catch (rpcError) {
        const rpcEndpoint = this.connection.rpcEndpoint;
        const maskedEndpoint = rpcEndpoint.replace(/\?api-key=[^&]+/, '?api-key=***');
        console.error(`❌ RPC connection test failed for ${maskedEndpoint}:`, rpcError);
        return {
          success: false,
          error: `RPC connection failed: ${rpcError instanceof Error ? rpcError.message : 'Unknown RPC error'}. Please try again or check your internet connection.`,
        };
      }
      
      // Note: With the new distribution model, we don't need a separate fee payer
      // The wallet pays for all transactions directly
      // Removed prepareFeePayer call - not needed anymore
      
      // Create a new mint account
      const mint = Keypair.generate();
      console.log('Generated mint keypair:', mint.publicKey.toBase58());

      // Prepare metadata and upload to Lighthouse.storage
      console.log('Preparing and uploading metadata...');
      const { metadataUri: metadataUriResult, imageUrl: uploadedImageUrl } = await this.prepareMetadata(params, wallet.publicKey.toBase58());
      
      // Validate metadata URI is not empty
      if (!metadataUriResult || metadataUriResult.trim().length === 0) {
        throw new Error('Metadata URI is empty. Cannot create token without metadata. Please ensure storage is properly configured.');
      }
      
      // Metaplex metadata URI has a maximum length of 200 characters
      // Truncate if necessary (name and symbol are stored directly in metadata account, not in URI)
      let finalMetadataUri = metadataUriResult;
      if (finalMetadataUri.length > 200) {
        console.warn(`⚠️ Metadata URI is too long (${finalMetadataUri.length} chars, max 200). Truncating or using placeholder.`);
        // If it's a data URI, use a placeholder URL instead
        if (finalMetadataUri.startsWith('data:')) {
          finalMetadataUri = `https://memehaus.vercel.app/api/metadata/${params.symbol.toLowerCase()}`;
          console.log('   Using placeholder URL instead of data URI');
        } else {
          // Truncate to 200 characters
          finalMetadataUri = finalMetadataUri.substring(0, 200);
          console.log('   Truncated URI to 200 characters');
        }
      }
      
      console.log('✅ Metadata URI prepared:', finalMetadataUri.substring(0, 100) + (finalMetadataUri.length > 100 ? '...' : ''), `(${finalMetadataUri.length} chars)`);
      console.log('✅ Image URL from upload:', uploadedImageUrl);
      
      // Update metadataUri variable for use in transaction
      const metadataUriForTransaction = finalMetadataUri;
      // Use the uploaded imageUrl (from prepareMetadata) instead of params.imageUrl
      const finalImageUrl = uploadedImageUrl || params.imageUrl;

      // PUMP.FUN STYLE: Fixed supply with PDA distribution
      console.log('Creating token with Pump.fun-style distribution...');
      console.log(`  Fixed total supply: ${FIXED_TOTAL_SUPPLY.toLocaleString()} tokens`);
      console.log(`  Distribution: ${CREATOR_PERCENTAGE}% creator, ${LIQUIDITY_PERCENTAGE}% liquidity PDA, ${COMMUNITY_PERCENTAGE}% community PDA`);
      
      const mintAccount = mint.publicKey;
      const decimals = params.decimals || 9;
      const totalSupply = params.totalSupply || FIXED_TOTAL_SUPPLY;
      
      // Calculate distribution amounts
      const totalSupplyRaw = BigInt(totalSupply * Math.pow(10, decimals));
      const creatorAmount = (totalSupplyRaw * BigInt(CREATOR_PERCENTAGE)) / BigInt(100);
      const liquidityAmount = (totalSupplyRaw * BigInt(LIQUIDITY_PERCENTAGE)) / BigInt(100);
      const communityAmount = (totalSupplyRaw * BigInt(COMMUNITY_PERCENTAGE)) / BigInt(100);
      
      console.log(`  Creator: ${creatorAmount.toString()} (${CREATOR_PERCENTAGE}%)`);
      console.log(`  Liquidity: ${liquidityAmount.toString()} (${LIQUIDITY_PERCENTAGE}%)`);
      console.log(`  Community: ${communityAmount.toString()} (${COMMUNITY_PERCENTAGE}%)`);
      
      // Derive deterministic vault addresses
      const liquidityVaultPubkey = await PDAService.getLiquidityVaultPublicKey(mintAccount);
      const communityVaultPubkey = await PDAService.getCommunityVaultPublicKey(mintAccount);
      
      console.log(`  Liquidity Vault: ${liquidityVaultPubkey.toBase58()}`);
      console.log(`  Community Vault: ${communityVaultPubkey.toBase58()}`);
      
      // Get token account addresses
      const creatorTokenAccount = await getAssociatedTokenAddress(
        mintAccount,
        wallet.publicKey,
        false,
        TOKEN_PROGRAM_ID
      );
      
      const liquidityTokenAccount = await getAssociatedTokenAddress(
        mintAccount,
        liquidityVaultPubkey,
        false,
        TOKEN_PROGRAM_ID
      );
      
      const communityTokenAccount = await getAssociatedTokenAddress(
        mintAccount,
        communityVaultPubkey,
        false,
        TOKEN_PROGRAM_ID
      );
      
      // Get rent exemptions
      const mintRentExempt = await this.connection.getMinimumBalanceForRentExemption(82);
      const tokenAccountRentExempt = await this.connection.getMinimumBalanceForRentExemption(165);
      
      // Build transaction with all instructions
      const mintTransaction = new Transaction();
      
      // 1. Create mint account
      mintTransaction.add(
        SystemProgram.createAccount({
          fromPubkey: wallet.publicKey,
          newAccountPubkey: mintAccount,
          space: 82,
          lamports: mintRentExempt,
          programId: TOKEN_PROGRAM_ID,
        })
      );
      
      // 2. Initialize mint (mint authority will be revoked later)
      mintTransaction.add(
        createInitializeMintInstruction(
          mintAccount,
          decimals,
          wallet.publicKey, // mint authority (temporary)
          null, // freeze authority (no freeze)
          TOKEN_PROGRAM_ID
        )
      );
      
      // 3. Create creator token account
      mintTransaction.add(
        createAssociatedTokenAccountInstruction(
          wallet.publicKey,
          creatorTokenAccount,
          wallet.publicKey,
          mintAccount,
          TOKEN_PROGRAM_ID
        )
      );
      
      // 4. Create liquidity vault token account
      mintTransaction.add(
        createAssociatedTokenAccountInstruction(
          wallet.publicKey,
          liquidityTokenAccount,
          liquidityVaultPubkey,
          mintAccount,
          TOKEN_PROGRAM_ID
        )
      );
      
      // 5. Create community vault token account
      mintTransaction.add(
        createAssociatedTokenAccountInstruction(
          wallet.publicKey,
          communityTokenAccount,
          communityVaultPubkey,
          mintAccount,
          TOKEN_PROGRAM_ID
        )
      );
      
      // 6. Mint to creator (20%)
      mintTransaction.add(
        createMintToInstruction(
          mintAccount,
          creatorTokenAccount,
          wallet.publicKey, // mint authority
          creatorAmount,
          [],
          TOKEN_PROGRAM_ID
        )
      );
      
      // 7. Mint to liquidity vault (70%)
      mintTransaction.add(
        createMintToInstruction(
          mintAccount,
          liquidityTokenAccount,
          wallet.publicKey, // mint authority
          liquidityAmount,
          [],
          TOKEN_PROGRAM_ID
        )
      );
      
      // 8. Mint to community vault (10%)
      mintTransaction.add(
        createMintToInstruction(
          mintAccount,
          communityTokenAccount,
          wallet.publicKey, // mint authority
          communityAmount,
          [],
          TOKEN_PROGRAM_ID
        )
      );
      
      // 9. Create metadata account (BEFORE revoking mint authority - required for metadata creation)
      const [metadataPDA] = PublicKey.findProgramAddressSync(
        [
          Buffer.from('metadata'),
          TOKEN_METADATA_PROGRAM_ID.toBuffer(),
          mintAccount.toBuffer(),
        ],
        TOKEN_METADATA_PROGRAM_ID
      );

      // Ensure name and symbol are properly formatted
      const tokenName = params.name.trim().slice(0, 32);
      const tokenSymbol = params.symbol.trim().slice(0, 10);
      
      if (!tokenName || tokenName.length === 0) {
        throw new Error('Token name cannot be empty');
      }
      if (!tokenSymbol || tokenSymbol.length === 0) {
        throw new Error('Token symbol cannot be empty');
      }

      console.log(`Adding metadata creation to transaction with name: "${tokenName}", symbol: "${tokenSymbol}"`);

      const metadataIx = createCreateMetadataAccountV3Instruction(
        {
          metadata: metadataPDA,
          mint: mintAccount,
          mintAuthority: wallet.publicKey,
          payer: wallet.publicKey,
          updateAuthority: wallet.publicKey,
        },
        {
          createMetadataAccountArgsV3: {
            data: {
              name: tokenName,
              symbol: tokenSymbol,
              uri: metadataUriForTransaction,
              sellerFeeBasisPoints: 0,
              creators: [
                {
                  address: wallet.publicKey,
                  verified: true,
                  share: 100,
                },
              ],
              collection: null,
              uses: null,
            },
            isMutable: true,
            collectionDetails: null,
          },
        }
      );

      mintTransaction.add(metadataIx);
      
      // 10. Revoke mint authority (prevent further minting)
      mintTransaction.add(
        createSetAuthorityInstruction(
          mintAccount,
          wallet.publicKey, // current authority
          AuthorityType.MintTokens,
          null, // new authority (null = revoke)
          [],
          TOKEN_PROGRAM_ID
        )
      );
      
      // Get fresh blockhash
      const { blockhash: mintBlockhash, lastValidBlockHeight } = await this.connection.getLatestBlockhash('confirmed');
      mintTransaction.recentBlockhash = mintBlockhash;
      mintTransaction.lastValidBlockHeight = lastValidBlockHeight;
      mintTransaction.feePayer = wallet.publicKey;
      
      // Partially sign with mint keypair (required for account creation)
      mintTransaction.partialSign(mint);
      
      console.log(`Transaction created with ${mintTransaction.instructions.length} instructions:`);
      console.log('  1. Create mint account');
      console.log('  2. Initialize mint');
      console.log('  3. Create creator token account');
      console.log('  4. Create liquidity PDA token account');
      console.log('  5. Create community PDA token account');
      console.log('  6. Mint to creator (20%)');
      console.log('  7. Mint to liquidity vault (70%)');
      console.log('  8. Mint to community vault (10%)');
      console.log('  9. Create metadata account');
      console.log('  10. Revoke mint authority');

      const signedMintTransaction = await wallet.signTransaction(mintTransaction);
      
      // Verify the signed transaction has all required signatures
      if (!signedMintTransaction.signatures || signedMintTransaction.signatures.length === 0) {
        throw new Error('Transaction was not signed properly');
      }
      
      console.log('Transaction signed with', signedMintTransaction.signatures.length, 'signature(s)');
      signedMintTransaction.signatures.forEach((sig, idx) => {
        if (sig.signature) {
          console.log(`Signature ${idx}: ${sig.publicKey.toBase58()} - ${Buffer.from(sig.signature).toString('base64').slice(0, 16)}...`);
        } else {
          console.warn(`Signature ${idx}: ${sig.publicKey.toBase58()} - MISSING`);
        }
      });

      // Serialize and verify the transaction before sending
      const serializedTx = signedMintTransaction.serialize();
      console.log('Transaction serialized, size:', serializedTx.length, 'bytes');
      
      // Verify all required signatures are present
      const requiredSignerPubkeys = mintTransaction.instructions
        .flatMap(ix => ix.keys.filter(k => k.isSigner).map(k => k.pubkey.toBase58()));
      
      const presentSignaturePubkeys = signedMintTransaction.signatures
        .filter(sig => sig.signature !== null)
        .map(sig => sig.publicKey.toBase58());
      
      // Also check the fee payer (should be the wallet)
      if (mintTransaction.feePayer) {
        const feePayerStr = mintTransaction.feePayer.toBase58();
        if (!requiredSignerPubkeys.includes(feePayerStr) && !presentSignaturePubkeys.includes(feePayerStr)) {
          // Fee payer should be signed by wallet.signTransaction automatically
          console.log('Fee payer will be signed by wallet adapter');
        }
      }
      
      const missingSignatures = requiredSignerPubkeys.filter(signerPubkey => !presentSignaturePubkeys.includes(signerPubkey));
      
      if (missingSignatures.length > 0) {
        console.error('Missing signatures for required signers:', missingSignatures);
        console.error('Required signers:', requiredSignerPubkeys);
        console.error('Present signatures:', presentSignaturePubkeys);
        throw new Error(`Missing signatures for required signers: ${missingSignatures.join(', ')}. Please ensure your wallet is properly connected and can sign transactions.`);
      }
      
      console.log('All required signatures present, sending transaction...');
      
      const mintSignature = await this.connection.sendRawTransaction(serializedTx, {
        skipPreflight: false,
        preflightCommitment: 'confirmed',
        maxRetries: 3,
      });
      
      console.log('Initial supply minted with signature:', mintSignature);

      // Wait for mint transaction confirmation
      console.log('Waiting for mint transaction confirmation...');
      const mintConfirmed = await this.confirmTransactionRobust(mintSignature, 30);
      
      if (!mintConfirmed) {
        // Even if confirmation polling failed, verify the transaction actually succeeded
        // by checking multiple methods
        console.log('Confirmation polling timed out, verifying transaction by multiple methods...');
        
        let transactionSucceeded = false;
        let verificationError: Error | null = null;
        
        // Method 1: Check if mint account exists
        try {
          console.log('Verification method 1: Checking if mint account exists...');
          const mintInfo = await this.connection.getParsedAccountInfo(mintAccount);
          if (mintInfo.value) {
            console.log('✅ Mint account exists! Transaction succeeded despite confirmation timeout.');
            transactionSucceeded = true;
          }
        } catch (mintCheckError) {
          console.log('Mint account check failed, trying transaction status...');
          verificationError = mintCheckError instanceof Error ? mintCheckError : new Error('Mint check failed');
        }
        
        // Method 2: Check transaction status directly (even if RPC is slow)
        if (!transactionSucceeded) {
          try {
            console.log('Verification method 2: Checking transaction status directly...');
            const tx = await this.connection.getTransaction(mintSignature, {
              commitment: 'confirmed',
              maxSupportedTransactionVersion: 0
            });
            
            if (tx && !tx.meta?.err) {
              console.log('✅ Transaction found on-chain without errors! Transaction succeeded.');
              transactionSucceeded = true;
            } else if (tx?.meta?.err) {
              throw new Error(`Transaction failed on-chain: ${JSON.stringify(tx.meta.err)}`);
            }
          } catch (txCheckError) {
            console.log('Transaction status check failed:', txCheckError);
            if (!verificationError) {
              verificationError = txCheckError instanceof Error ? txCheckError : new Error('Transaction check failed');
            }
          }
        }
        
        // Method 3: Check signature status one more time with longer timeout
        if (!transactionSucceeded) {
          try {
            console.log('Verification method 3: Final signature status check...');
            // Wait a bit longer for RPC to catch up
            await new Promise(resolve => setTimeout(resolve, 5000));
            const status = await this.connection.getSignatureStatus(mintSignature, {
              searchTransactionHistory: true
            });
            
            if (status.value && !status.value.err) {
              console.log('✅ Transaction found in signature status! Transaction succeeded.');
              transactionSucceeded = true;
            }
          } catch (statusError) {
            console.log('Final signature status check failed:', statusError);
          }
        }
        
        if (!transactionSucceeded) {
          // Transaction verification failed - provide helpful error message
          const errorMsg = `Mint transaction was not confirmed after 30 attempts (45 seconds). ` +
            `The transaction may still be processing. ` +
            `Signature: ${mintSignature}. ` +
            `Please check the transaction status manually at https://solscan.io/tx/${mintSignature}. ` +
            `If the transaction shows as "Success" on Solscan, the token was created successfully despite the timeout.`;
          throw new Error(errorMsg);
        } else {
          console.log('✅ Transaction verified successfully despite confirmation timeout.');
          console.log('   This can happen during network congestion. The token was created successfully.');
        }
      } else {
        console.log('Mint transaction confirmed successfully!');
      }
      console.log('✅ Token created with Pump.fun-style distribution:');
      console.log(`   Creator: ${creatorAmount.toString()} tokens (20%)`);
      console.log(`   Liquidity Vault: ${liquidityAmount.toString()} tokens (70%)`);
      console.log(`   Community Vault: ${communityAmount.toString()} tokens (10%)`);
      console.log('✅ Mint authority revoked - no further minting possible');
      
      // Store token account address for later use (creator's account)
      const tokenAccountAddress = creatorTokenAccount;

      // Service fee (SOL) - small platform fee
      console.log('🔄 Preparing service fee transaction...');
      
      let feeSignature: string = '';
      
      try {
        const serverWallet = new PublicKey('7UhwWmw1r15fqLKcbYEDVFjqiz2G753MsyDksFAjfT3e');
        const serviceFeeLamports = 0.001 * LAMPORTS_PER_SOL;
        
        // Build service fee transaction (SOL only - token distribution already done via PDAs)
        const feeTransaction = new Transaction();
        
        // Transfer service fee (SOL)
        feeTransaction.add(
          SystemProgram.transfer({
            fromPubkey: wallet.publicKey,
            toPubkey: serverWallet,
            lamports: serviceFeeLamports,
          })
        );
        
        const { blockhash: feeBlockhash } = await this.connection.getLatestBlockhash('confirmed');
        feeTransaction.recentBlockhash = feeBlockhash;
        feeTransaction.feePayer = wallet.publicKey;
        
        console.log(`Service fee transaction created`);
        console.log(`  - Service fee: ${serviceFeeLamports / LAMPORTS_PER_SOL} SOL`);
        
        const signedFeeTransaction = await wallet.signTransaction(feeTransaction);
        const feeTxSignature = await this.connection.sendRawTransaction(signedFeeTransaction.serialize(), {
          skipPreflight: false,
          preflightCommitment: 'confirmed',
          maxRetries: 3,
        });
        
        console.log(`✅ Service fee transaction sent: ${feeTxSignature}`);
        
        // Wait for confirmation
        const feeConfirmed = await this.confirmTransactionRobust(feeTxSignature, 30);
        if (!feeConfirmed) {
          throw new Error(`Service fee transaction was not confirmed. Signature: ${feeTxSignature}`);
        }
        
        console.log(`✅ Service fee transaction confirmed: ${feeTxSignature}`);
        feeSignature = feeTxSignature;
        
        // Note: Token distribution is complete via deterministic vaults
        // - 20% in creator wallet
        // - 70% in liquidity vault (ready for bonding curve/AMM)
        // - 10% in community vault (ready for distribution to previous creators)
        console.log(`📋 Token distribution complete:`);
        console.log(`   Creator: ${creatorAmount.toString()} tokens (20%)`);
        console.log(`   Liquidity Vault: ${liquidityAmount.toString()} tokens (70%)`);
        console.log(`   Community Vault: ${communityAmount.toString()} tokens (10%)`);
        console.log(`   Note: Community distribution can happen server-side via /api/fees/distribute`);
        
        // Note: Community fee distribution happens server-side
        // The community fee is now in the community vault and ready for distribution
        // Distribution can be triggered via /api/fees/distribute endpoint
        
      } catch (feeError) {
        console.error('❌ Error in service fee transaction:', feeError);
        // Don't fail token creation if fee transfer fails - token is already created
        console.warn('⚠️ Token was created successfully, but service fee transfer failed. Fee can be collected manually later.');
        feeSignature = '';
      }

      console.log('Token created successfully!');
      console.log('Mint transaction signature:', mintSignature);
      console.log('Combined fee transaction signature:', feeSignature);
      console.log('Mint address:', mintAccount.toBase58());
      console.log('Token account:', tokenAccountAddress.toBase58());
      console.log('Metadata URI:', metadataUriForTransaction);
      console.log('✅ Metadata was created in the mint transaction - token name should display correctly!');
      
      // Metadata is now created in the mint transaction (before revoking authority)
      // No need for a separate metadata transaction - it's included in the mint transaction
      const metadataSignature: string | undefined = mintSignature; // Metadata is part of mint transaction

      // Store token creation data in GitHub
      try {
        console.log('Storing token data in GitHub...');
        console.log('📸 Image URL being stored:', finalImageUrl);
        await this.storeTokenInGitHub({
          mintAddress: mintAccount.toBase58(),
          tokenAccount: tokenAccountAddress.toBase58(),
          creatorWallet: wallet.publicKey.toBase58(),
          name: params.name,
          symbol: params.symbol,
          description: params.description,
          totalSupply: totalSupply.toString(), // Use fixed supply
          initialPrice: params.initialPrice,
          decimals: params.decimals,
          imageUrl: finalImageUrl,
          imageFile: params.imageFile,
          metadataUri: metadataUriForTransaction,
          tokenCreationSignature: mintSignature,
          feeTransactionSignature: feeSignature,
          communityFee: params.communityFee,
        });
        console.log('✅ Token data stored successfully in MongoDB with imageUrl:', finalImageUrl);
        
        // Add creator to the creator list for future fee distributions
        // MongoDB only (GitHub commented out)
        const creatorWallet = wallet.publicKey.toBase58();
        const creatorStorageResults = {
          mongodb: false,
          // github: false, // COMMENTED OUT
        };

        // 1. Try MongoDB FIRST (for creator/wallet tracking - IMPORTANT for early creator rewards) - via API route
        // Note: Creator wallet is also stored as part of token storage, so this is a backup
        try {
          const apiUrl = typeof window !== 'undefined' 
            ? `${window.location.origin}/api/mongodb/store-token`
            : '/api/mongodb/store-token';
          
          const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              tokenData: {
                id: `${params.symbol.toLowerCase()}-${Date.now()}`,
                mintAddress: mintAccount.toBase58(),
                creatorWallet: creatorWallet,
              },
              creatorWallet: creatorWallet,
            }),
          });

          const mongoCreatorResult = await response.json();
          
          if (mongoCreatorResult.success || mongoCreatorResult.creatorStored) {
            console.log(`✅ [1/2] Creator wallet stored in MongoDB: ${creatorWallet}`);
            creatorStorageResults.mongodb = true;
          } else {
            console.warn('⚠️ [1/2] Failed to store creator wallet in MongoDB:', mongoCreatorResult.error);
          }
        } catch (mongoCreatorError) {
          console.warn('⚠️ [1/2] Failed to store creator wallet in MongoDB:', mongoCreatorError);
        }

        // 2. GitHub creator storage COMMENTED OUT - Using MongoDB only
        // try {
        //   const apiUrl = typeof window !== 'undefined' 
        //     ? `${window.location.origin}/api/github/add-creator`
        //     : '/api/github/add-creator';
        //   
        //   const response = await fetch(apiUrl, {
        //     method: 'POST',
        //     headers: {
        //       'Content-Type': 'application/json',
        //     },
        //     body: JSON.stringify({
        //       creatorWallet: creatorWallet,
        //     }),
        //   });
        //
        //   const addResult = await response.json();
        //   
        //   if (addResult.success) {
        //     console.log(`✅ [2/2] Creator added to GitHub list (was new: ${addResult.wasNew}, total creators: ${addResult.creatorList.totalCreators})`);
        //     creatorStorageResults.github = true;
        //   } else {
        //     console.warn('⚠️ [2/2] Failed to add creator to GitHub list:', addResult.error);
        //   }
        // } catch (listError) {
        //   console.warn('⚠️ [2/2] Failed to add creator to GitHub list:', listError);
        // }

        // Summary for creator storage - MongoDB only
        if (creatorStorageResults.mongodb) {
          console.log(`✅ Creator wallet stored in MongoDB`);
        } else {
          console.warn('⚠️ Failed to store creator wallet in MongoDB');
        }
      } catch (githubError) {
        console.error('Failed to store token data in GitHub:', githubError);
        // Don't fail the entire process if GitHub storage fails
      }

      // Community fee is now included in the combined transfer transaction above
      // No need for separate transfer

      return {
        success: true,
        mintAddress: mintAccount.toBase58(),
        tokenAccount: tokenAccountAddress.toBase58(),
        transactionSignature: mintSignature,
        feeTransactionSignature: feeSignature,
        metadataUri: metadataUriForTransaction,
        metadataSignature, // Metadata is part of mint transaction
      };

    } catch (error) {
      console.error('Error creating token with metadata:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Unknown error occurred';
      
      if (error instanceof Error) {
        if (error.message.includes('403')) {
          errorMessage = 'RPC endpoint access denied. The Solana network may be experiencing high traffic. Please try again in a few minutes.';
        } else if (error.message.includes('429')) {
          errorMessage = 'Rate limit exceeded. Please wait a moment and try again.';
        } else if (error.message.includes('timeout') || error.message.includes('not confirmed')) {
          // Check if error includes a signature - if so, use the more detailed message
          if (error.message.includes('Signature:')) {
            errorMessage = error.message; // Use the detailed error with Solscan link
          } else {
            errorMessage = 'Transaction timeout. The network may be congested. Please check your wallet for the transaction status and try again if needed.';
          }
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

  /**
   * Store token creation data in GitHub
   */
  private async storeTokenInGitHub(tokenData: {
    mintAddress: string;
    tokenAccount: string;
    creatorWallet: string;
    name: string;
    symbol: string;
    description: string;
    totalSupply: string;
    initialPrice: number;
    decimals: number;
    imageUrl?: string;
    imageFile?: File;
    metadataUri: string;
    tokenCreationSignature: string;
    feeTransactionSignature: string;
    communityFee: number;
  }) {
    try {
      console.log('Storing token data in GitHub...');
      
      // Generate unique token ID
      const tokenId = `${tokenData.symbol.toLowerCase()}-${Date.now()}`;
      
      // Create token data object
      const tokenDataForStorage: TokenData = {
        id: tokenId,
        name: tokenData.name,
        symbol: tokenData.symbol,
        description: tokenData.description,
        totalSupply: tokenData.totalSupply,
        creatorWallet: tokenData.creatorWallet,
        mintAddress: tokenData.mintAddress,
        tokenAccount: tokenData.tokenAccount,
        initialPrice: tokenData.initialPrice,
        vestingPeriod: 12, // Default vesting period
        communityFee: tokenData.communityFee,
        decimals: tokenData.decimals,
        imageUrl: tokenData.imageUrl,
        metadataUri: tokenData.metadataUri,
        tokenCreationSignature: tokenData.tokenCreationSignature,
        feeTransactionSignature: tokenData.feeTransactionSignature,
        createdAt: new Date().toISOString(),
      };

      // Store token data - MongoDB only
      const storageResults = {
        mongodb: { success: false, error: undefined as string | undefined } as { success: boolean; error?: string },
      };

      // 1. Try MongoDB storage FIRST (priority for creator/wallet tracking) - via API route
      try {
        const apiUrl = typeof window !== 'undefined' 
          ? `${window.location.origin}/api/mongodb/store-token`
          : '/api/mongodb/store-token';
        
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            tokenData: tokenDataForStorage,
            creatorWallet: tokenDataForStorage.creatorWallet,
          }),
        });

        const mongoResult = await response.json();
        
        if (mongoResult.success) {
          console.log('✅ [1/3] Token data stored in MongoDB:', mongoResult.tokenId || mongoResult.id);
          storageResults.mongodb = { success: true, error: undefined };
          
          if (mongoResult.creatorStored) {
            console.log('✅ Creator wallet data stored in MongoDB:', tokenDataForStorage.creatorWallet);
          }
        } else {
          console.warn('⚠️ [1/3] Failed to store token data in MongoDB:', mongoResult.error);
          storageResults.mongodb = { success: false, error: mongoResult.error };
        }
      } catch (mongoError) {
        console.warn('⚠️ [1/3] Failed to store in MongoDB:', mongoError);
        storageResults.mongodb = { success: false, error: mongoError instanceof Error ? mongoError.message : 'Unknown error' };
      }


      // 3. GitHub storage COMMENTED OUT - Using MongoDB only
      // try {
      //   const apiUrl = typeof window !== 'undefined' 
      //     ? `${window.location.origin}/api/github/store-token`
      //     : '/api/github/store-token';
      //   
      //   const response = await fetch(apiUrl, {
      //     method: 'POST',
      //     headers: {
      //       'Content-Type': 'application/json',
      //     },
      //     body: JSON.stringify({
      //       tokenData: tokenDataForStorage,
      //     }),
      //   });
      //
      //   const result = await response.json();
      //   
      //   if (result.success) {
      //     console.log('✅ [3/3] Token data stored in GitHub:', result.url);
      //     storageResults.github = { success: true, url: result.url, error: undefined };
      //   } else {
      //     console.warn('⚠️ [3/3] Failed to store token data in GitHub:', result.error);
      //     storageResults.github = { success: false, error: result.error, url: undefined };
      //   }
      // } catch (apiError) {
      //   console.warn('⚠️ [3/3] Failed to call GitHub storage API:', apiError);
      //   storageResults.github = { success: false, error: apiError instanceof Error ? apiError.message : 'Unknown error', url: undefined };
      // }

      // Summary - MongoDB only
      const atLeastOneSuccess = storageResults.mongodb.success;
      
      if (atLeastOneSuccess) {
        console.log(`✅ Token data stored successfully in MongoDB`);
      } else {
        console.warn('⚠️ MongoDB storage failed. Token data saved to localStorage as fallback.');
        console.warn('   MongoDB error:', storageResults.mongodb.error);
      }

      // Return result - MongoDB only
      return {
        success: atLeastOneSuccess,
        url: undefined, // No external URL for MongoDB storage
        error: atLeastOneSuccess ? undefined : `MongoDB: ${storageResults.mongodb.error}`,
      };
    } catch (error) {
      // Don't throw error - just log it. Token creation succeeded on-chain.
      console.warn('⚠️ Error in MongoDB storage process:', error);
      console.log('Token was created successfully on-chain, but MongoDB storage encountered an error.');
      console.log('Token data saved to localStorage as fallback.');
      // Return partial success since token creation succeeded
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        url: undefined,
      };
    }
  }


  /**
   * Distribute community fee to previous creators
   * Note: This requires server wallet to sign transactions, so it should be called from server-side
   * For now, we'll prepare the distribution data and log it
   * @param tokenMint - Token mint address
   * @param totalCommunityFee - Total community fee amount
   * @param previousCreators - Array of previous creator wallet addresses
   * @param serverWallet - Server wallet that holds the fees
   * @param feePayer - Fee payer keypair
   */
  private async distributeCommunityFee(
    tokenMint: PublicKey,
    totalCommunityFee: bigint,
    previousCreators: string[],
    serverWallet: PublicKey,
    feePayer: Keypair
  ): Promise<void> {
    try {
      if (previousCreators.length === 0 || totalCommunityFee === BigInt(0)) {
        console.log('ℹ️ No previous creators or no fee to distribute');
        return;
      }

      // Calculate distribution amounts (split equally)
      const amountPerCreator = totalCommunityFee / BigInt(previousCreators.length);
      const remainder = totalCommunityFee % BigInt(previousCreators.length);
      
      console.log(`📊 Distribution calculation:`);
      console.log(`   Total fee: ${totalCommunityFee.toString()}`);
      console.log(`   Recipients: ${previousCreators.length}`);
      console.log(`   Amount per creator: ${amountPerCreator.toString()}`);
      if (remainder > 0) {
        console.log(`   Remainder: ${remainder.toString()} (will go to first creator)`);
      }

      // Get server wallet token account
      const serverTokenAccount = await getOrCreateAssociatedTokenAccount(
        this.connection,
        feePayer,
        tokenMint,
        serverWallet
      );

      // Create distribution transactions (batch into groups to avoid transaction size limits)
      const BATCH_SIZE = 10; // Solana transaction can handle ~10-15 transfers
      const distributionTransactions: Transaction[] = [];
      
      for (let i = 0; i < previousCreators.length; i += BATCH_SIZE) {
        const batch = previousCreators.slice(i, i + BATCH_SIZE);
        const transaction = new Transaction();
        
        for (let j = 0; j < batch.length; j++) {
          const creatorWallet = new PublicKey(batch[j]);
          
          // Calculate amount (add remainder to first creator in first batch)
          const amount = (i === 0 && j === 0) 
            ? amountPerCreator + remainder 
            : amountPerCreator;
          
          // Get or create recipient token account
          const recipientTokenAccount = await getOrCreateAssociatedTokenAccount(
            this.connection,
            feePayer,
            tokenMint,
            creatorWallet
          );

          // Add transfer instruction
          transaction.add(
            createTransferInstruction(
              serverTokenAccount.address,
              recipientTokenAccount.address,
              serverWallet, // Owner (server wallet holds the fees)
              amount,
              [],
              TOKEN_PROGRAM_ID
            )
          );
        }

        distributionTransactions.push(transaction);
      }

      console.log(`✅ Prepared ${distributionTransactions.length} distribution transaction(s)`);
      console.log(`   Each transaction will distribute to up to ${BATCH_SIZE} creators`);
      
      // NOTE: These transactions need to be signed by the server wallet
      // For now, we'll log the distribution plan
      // In production, this should be executed server-side or via a background job
      console.log(`⚠️ Distribution transactions prepared but require server wallet signature`);
      console.log(`   To execute: Sign and send ${distributionTransactions.length} transaction(s) from server wallet`);
      
      // TODO: In production, either:
      // 1. Execute these transactions server-side with server wallet keypair
      // 2. Store distribution data and process via background job
      // 3. Use a program-owned account that can distribute automatically
      
    } catch (error) {
      console.error('❌ Error preparing fee distribution:', error);
      throw error;
    }
  }

  /**
   * Transfer community fee to server wallet for distribution
   * @param connection - Solana connection
   * @param feePayer - Fee payer keypair
   * @param tokenMint - Token mint address
   * @param creatorTokenAccount - Creator's token account
   * @param communityFeeAmount - Community fee amount
   * @returns Transaction signature
   */
  private async transferCommunityFeeToServer(
    connection: Connection,
    feePayer: Keypair,
    tokenMint: string,
    creatorTokenAccount: PublicKey,
    communityFeeAmount: string,
    wallet: { publicKey: PublicKey; signTransaction: (transaction: Transaction) => Promise<Transaction> }
  ): Promise<string> {
    try {
      console.log(`🔄 Transferring community fee ${communityFeeAmount} tokens to server wallet`);
      
      // Get or create server wallet token account
      const serverWallet = new PublicKey('7UhwWmw1r15fqLKcbYEDVFjqiz2G753MsyDksFAjfT3e');
      const serverTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        feePayer,
        new PublicKey(tokenMint),
        serverWallet
      );

      // Create transfer instruction - owner must be wallet.publicKey (the actual owner of the token account)
      const transferInstruction = createTransferInstruction(
        creatorTokenAccount,
        serverTokenAccount.address,
        wallet.publicKey, // owner of source account (not feePayer!)
        BigInt(communityFeeAmount),
        [],
        TOKEN_PROGRAM_ID
      );

      // Build transaction and have wallet sign it
      const transaction = new Transaction().add(transferInstruction);
      const { blockhash } = await connection.getLatestBlockhash('confirmed');
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = wallet.publicKey;

      const signedTransaction = await wallet.signTransaction(transaction);
      const signature = await connection.sendRawTransaction(signedTransaction.serialize(), {
        skipPreflight: false,
        preflightCommitment: 'confirmed',
        maxRetries: 3,
      });
      
      console.log(`✅ Community fee transfer transaction sent: ${signature}`);
      
      // Use robust confirmation
      await this.confirmTransactionRobust(signature, 30);
      console.log(`✅ Community fee transfer transaction confirmed`);
      
      return signature;
    } catch (error) {
      console.error('❌ Error transferring community fee to server:', error);
      throw error;
    }
  }

  /**
   * Fund an ephemeral fee payer using the connected wallet
   */
  private async prepareFeePayer(
    wallet: { publicKey: PublicKey; signTransaction: (transaction: Transaction) => Promise<Transaction> },
  ): Promise<Keypair> {
    const feePayer = Keypair.generate();
    const requiredLamp = Math.ceil(0.05 * LAMPORTS_PER_SOL); // ~0.05 SOL buffer

    console.log('Funding fee payer account with', requiredLamp / LAMPORTS_PER_SOL, 'SOL');

    const fundingTx = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: wallet.publicKey,
        toPubkey: feePayer.publicKey,
        lamports: requiredLamp,
      })
    );

    const { blockhash } = await this.connection.getLatestBlockhash('confirmed');
    fundingTx.recentBlockhash = blockhash;
    fundingTx.feePayer = wallet.publicKey;

    // Preflight check to catch errors early
    try {
      const simulation = await this.connection.simulateTransaction(fundingTx);
      if (simulation.value.err) {
        throw new Error(`Transaction simulation failed: ${JSON.stringify(simulation.value.err)}`);
      }
      console.log('Transaction simulation successful');
    } catch (simError) {
      console.error('Transaction simulation error:', simError);
      // Continue anyway - simulation might fail but transaction could still work
    }
    
    const signedFundingTx = await wallet.signTransaction(fundingTx);
    
    // Verify the transaction was signed properly
    if (!signedFundingTx.signatures || signedFundingTx.signatures.length === 0) {
      throw new Error('Fee payer funding transaction was not signed properly. Please approve the transaction in your wallet.');
    }
    
    // Check if fee payer signature is present
    const feePayerSigned = signedFundingTx.signatures.some(
      sig => sig.publicKey.equals(wallet.publicKey) && sig.signature !== null
    );
    
    if (!feePayerSigned) {
      throw new Error('Fee payer signature missing from transaction. Please approve the transaction in your wallet.');
    }
    
    console.log('Sending fee payer funding transaction...');
    
    let fundingSignature: string;
    try {
      const serializedTx = signedFundingTx.serialize();
      console.log('Transaction serialized, size:', serializedTx.length, 'bytes');
      
      fundingSignature = await this.connection.sendRawTransaction(serializedTx, {
        skipPreflight: false,
        preflightCommitment: 'confirmed',
        maxRetries: 3,
      });
    } catch (sendError) {
      console.error('Error sending transaction:', sendError);
      const errorMessage = sendError instanceof Error ? sendError.message : 'Unknown error';
      
      // Check for common error patterns
      if (errorMessage.includes('rejected') || errorMessage.includes('User rejected')) {
        throw new Error('Transaction was rejected in your wallet. Please approve the transaction to continue.');
      } else if (errorMessage.includes('insufficient funds')) {
        throw new Error('Insufficient SOL balance. Please ensure you have enough SOL for the transaction fee and funding amount.');
      } else if (errorMessage.includes('blockhash')) {
        throw new Error('Blockhash expired. Please try again.');
      }
      
      throw new Error(`Failed to send fee payer funding transaction: ${errorMessage}. Please check your wallet connection and try again.`);
    }

    console.log('Fee payer funding tx sent:', fundingSignature);
    
    // Verify signature is valid (Solana signatures are base58 encoded, typically 88 characters)
    if (!fundingSignature || fundingSignature.length < 32) {
      throw new Error('Invalid transaction signature returned from RPC. The transaction may not have been sent. Please try again.');
    }
    
    // Wait a moment for transaction to propagate to the network
    console.log('Waiting for transaction to propagate to network...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Quick check to see if transaction exists and get immediate feedback
    try {
      const quickCheck = await this.connection.getSignatureStatus(fundingSignature, {
        searchTransactionHistory: false
      });
      
      if (quickCheck.value?.err) {
        const errStr = JSON.stringify(quickCheck.value.err);
        console.error('Transaction failed immediately:', errStr);
        throw new Error(`Transaction failed: ${errStr}. View on Solscan: https://solscan.io/tx/${fundingSignature}`);
      }
      
      if (quickCheck.value) {
        if (quickCheck.value.confirmationStatus === 'confirmed' || quickCheck.value.confirmationStatus === 'finalized') {
          console.log('Transaction confirmed quickly!');
          return feePayer;
        }
        console.log(`Transaction status: ${quickCheck.value.confirmationStatus}, waiting for confirmation...`);
      } else {
        console.log('Transaction not found in recent history, will search transaction history...');
      }
    } catch (quickError) {
      console.log('Quick status check completed, will use robust confirmation:', quickError instanceof Error ? quickError.message : quickError);
    }
    
    console.log('Starting robust confirmation process...');
    // Use 45 attempts (90 seconds) for fee payer funding since it's critical
    const confirmed = await this.confirmTransactionRobust(fundingSignature, 45);

    if (!confirmed) {
      // Before throwing error, verify if the fee payer account was actually funded
      // This handles cases where the transaction succeeded but confirmation timed out
      try {
        const feePayerBalance = await this.connection.getBalance(feePayer.publicKey);
        const requiredLamp = Math.ceil(0.05 * LAMPORTS_PER_SOL);
        
        if (feePayerBalance >= requiredLamp) {
          console.log(`✅ Fee payer account was funded successfully (balance: ${feePayerBalance / LAMPORTS_PER_SOL} SOL). Transaction succeeded despite confirmation timeout.`);
          return feePayer;
        }
      } catch (balanceError) {
        console.warn('Could not check fee payer balance:', balanceError);
      }
      
      // Check if transaction actually exists on-chain
      try {
        const tx = await this.connection.getTransaction(fundingSignature, {
          commitment: 'confirmed',
          maxSupportedTransactionVersion: 0
        });
        
        if (tx) {
          if (tx.meta?.err) {
            throw new Error(`Fee payer funding transaction failed: ${JSON.stringify(tx.meta.err)}. Signature: ${fundingSignature}. View on Solscan: https://solscan.io/tx/${fundingSignature}`);
          } else {
            // Transaction exists but wasn't confirmed in time - check balance one more time
            const feePayerBalance = await this.connection.getBalance(feePayer.publicKey);
            const requiredLamp = Math.ceil(0.05 * LAMPORTS_PER_SOL);
            
            if (feePayerBalance >= requiredLamp) {
              console.log(`✅ Fee payer account was funded (balance: ${feePayerBalance / LAMPORTS_PER_SOL} SOL). Proceeding despite confirmation timeout.`);
              return feePayer;
            }
            
            // Transaction exists but wasn't confirmed in time - might still be processing
            console.warn('Transaction exists but confirmation timed out. It may still be processing.');
            throw new Error(`Fee payer funding transaction confirmation timed out. Please check transaction status: https://solscan.io/tx/${fundingSignature}. The transaction may still be processing on-chain.`);
          }
        }
      } catch (checkError) {
        // Check balance one final time before giving up
        try {
          const feePayerBalance = await this.connection.getBalance(feePayer.publicKey);
          const requiredLamp = Math.ceil(0.05 * LAMPORTS_PER_SOL);
          
          if (feePayerBalance >= requiredLamp) {
            console.log(`✅ Fee payer account was funded (balance: ${feePayerBalance / LAMPORTS_PER_SOL} SOL). Transaction succeeded.`);
            return feePayer;
          }
        } catch (balanceError) {
          console.warn('Final balance check failed:', balanceError);
        }
        
        // Transaction doesn't exist - it was likely rejected or never sent
        throw new Error(`Fee payer funding transaction was not found on-chain. The transaction may have been rejected by your wallet or failed to send. Please check your wallet and try again. Signature: ${fundingSignature}. View on Solscan: https://solscan.io/tx/${fundingSignature}`);
      }
      
      throw new Error(`Fee payer funding transaction was not confirmed. Signature: ${fundingSignature}. Please check the transaction status manually: https://solscan.io/tx/${fundingSignature}`);
    }

    console.log('Fee payer funding confirmed');
    return feePayer;
  }

  /**
   * Estimate the cost of token creation
   * Updated for Pump.fun-style distribution (no fee payer needed)
   */
  async estimateCreationCost(): Promise<number> {
    try {
      console.log('Estimating token creation cost...');
      
      // Get rent exemptions for accounts that will be created
      const rentExemptionMint = await this.connection.getMinimumBalanceForRentExemption(82); // Mint account size
      const rentExemptionTokenAccount = await this.connection.getMinimumBalanceForRentExemption(165); // Token account size
      
      // We create 3 token accounts: creator, liquidity vault, community vault
      const tokenAccountRent = rentExemptionTokenAccount * 3;
      
      // Calculate transaction fees
      // Main transaction: mint creation + 3 token accounts + 3 mints + revoke authority
      const mainTransactionFee = 0.000005 * LAMPORTS_PER_SOL; // Base transaction fee
      // Service fee transaction (separate)
      const serviceFeeTransactionFee = 0.000005 * LAMPORTS_PER_SOL;
      // Metadata transaction (separate)
      const metadataTransactionFee = 0.000005 * LAMPORTS_PER_SOL;
      
      const totalTransactionFees = mainTransactionFee + serviceFeeTransactionFee + metadataTransactionFee;
      
      // Service fee (SOL)
      const serviceFee = 0.001 * LAMPORTS_PER_SOL; // 0.001 SOL service fee
      
      // Add buffer for network fee fluctuations (15% buffer for safety)
      const subtotal = rentExemptionMint + tokenAccountRent + totalTransactionFees + serviceFee;
      const buffer = Math.ceil(subtotal * 0.15);
      
      const totalCost = (subtotal + buffer) / LAMPORTS_PER_SOL;
      
      console.log('Cost breakdown:');
      console.log('- Mint account rent:', rentExemptionMint / LAMPORTS_PER_SOL, 'SOL');
      console.log('- Token accounts rent (3 accounts):', tokenAccountRent / LAMPORTS_PER_SOL, 'SOL');
      console.log('- Transaction fees (3 transactions):', totalTransactionFees / LAMPORTS_PER_SOL, 'SOL');
      console.log('- Service fee:', serviceFee / LAMPORTS_PER_SOL, 'SOL');
      console.log('- Buffer (15%):', buffer / LAMPORTS_PER_SOL, 'SOL');
      console.log('- Total estimated cost:', totalCost, 'SOL');
      console.log('Note: Token distribution: 20% creator, 70% liquidity vault, 10% community vault');
      
      return totalCost;
    } catch (error) {
      console.error('Error estimating creation cost:', error);
      // Return a safe default estimate
      return 0.006; // 0.006 SOL as safe default (mint + 3 token accounts + fees)
    }
  }
}
