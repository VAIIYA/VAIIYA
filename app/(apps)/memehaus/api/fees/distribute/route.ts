import { NextRequest, NextResponse } from 'next/server';
import { Connection, PublicKey, Transaction, Keypair } from '@solana/web3.js';
import { 
  getOrCreateAssociatedTokenAccount,
  createTransferInstruction,
  TOKEN_PROGRAM_ID
} from '@solana/spl-token';
import bs58 from 'bs58';
import { getAllCreatorsFromMongoDB } from '../../../lib/mongodbStorage';

export const dynamic = 'force-dynamic';

// Server wallet - in production, load from secure environment variable
const SERVER_WALLET_PRIVATE_KEY = process.env.SERVER_WALLET_PRIVATE_KEY;
const SERVER_WALLET_ADDRESS = '7UhwWmw1r15fqLKcbYEDVFjqiz2G753MsyDksFAjfT3e';

/**
 * API endpoint to distribute community fees to previous creators
 * This requires server wallet private key to sign transactions
 * 
 * POST /api/fees/distribute
 * Body: {
 *   tokenMint: string,
 *   excludeWallet?: string (current creator to exclude)
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Check if server wallet key is configured
    if (!SERVER_WALLET_PRIVATE_KEY) {
      return NextResponse.json({
        success: false,
        error: 'Server wallet private key not configured. This endpoint requires server-side execution.'
      }, { status: 500 });
    }

    const body = await request.json();
    const { tokenMint, excludeWallet } = body;

    if (!tokenMint) {
      return NextResponse.json({
        success: false,
        error: 'tokenMint is required'
      }, { status: 400 });
    }

    // Get RPC endpoint
    const rpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
    const connection = new Connection(rpcUrl, 'confirmed');

    // Load server wallet keypair
    // Support both base58 (native Solana format) and base64 formats
    let serverWalletKeypair: Keypair;
    try {
      // Try base58 first (native Solana format)
      const privateKeyBytes = bs58.decode(SERVER_WALLET_PRIVATE_KEY);
      serverWalletKeypair = Keypair.fromSecretKey(privateKeyBytes);
    } catch (base58Error) {
      // If base58 fails, try base64
      try {
        const privateKeyBytes = Buffer.from(SERVER_WALLET_PRIVATE_KEY, 'base64');
        serverWalletKeypair = Keypair.fromSecretKey(privateKeyBytes);
      } catch (base64Error) {
        return NextResponse.json({
          success: false,
          error: 'Invalid private key format. Expected base58 or base64 encoded Solana private key.'
        }, { status: 400 });
      }
    }
    
    // Verify the keypair matches the expected public key
    const serverWallet = new PublicKey(SERVER_WALLET_ADDRESS);
    if (!serverWalletKeypair.publicKey.equals(serverWallet)) {
      return NextResponse.json({
        success: false,
        error: 'Private key does not match expected server wallet address. Please verify the key is correct.'
      }, { status: 400 });
    }

    // Get previous creators from MongoDB (excluding current creator)
    const allCreators = await getAllCreatorsFromMongoDB();
    const previousCreators = allCreators.filter(
      addr => !excludeWallet || addr !== excludeWallet
    );

    if (previousCreators.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No previous creators to distribute fees to',
        distributions: []
      });
    }

    // Get server wallet token account balance
    const tokenMintPubkey = new PublicKey(tokenMint);
    const serverTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      serverWalletKeypair,
      tokenMintPubkey,
      serverWallet
    );

    // Get current balance
    const balance = await connection.getTokenAccountBalance(serverTokenAccount.address);
    const availableBalance = BigInt(balance.value.amount);

    if (availableBalance === BigInt(0)) {
      return NextResponse.json({
        success: false,
        error: 'No community fees available to distribute'
      }, { status: 400 });
    }

    // Calculate distribution amounts (split equally)
    const amountPerCreator = availableBalance / BigInt(previousCreators.length);
    const remainder = availableBalance % BigInt(previousCreators.length);

    console.log(`📊 Distributing ${availableBalance.toString()} tokens to ${previousCreators.length} creators`);
    console.log(`   Amount per creator: ${amountPerCreator.toString()}`);

    // Create distribution transactions (batch into groups)
    const BATCH_SIZE = 10;
    const distributionResults = [];
    
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
          connection,
          serverWalletKeypair,
          tokenMintPubkey,
          creatorWallet
        );

        // Add transfer instruction
        transaction.add(
          createTransferInstruction(
            serverTokenAccount.address,
            recipientTokenAccount.address,
            serverWallet, // Owner (server wallet)
            amount,
            [],
            TOKEN_PROGRAM_ID
          )
        );
      }

      // Sign and send transaction
      const { blockhash } = await connection.getLatestBlockhash('confirmed');
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = serverWallet;
      transaction.sign(serverWalletKeypair);

      const signature = await connection.sendRawTransaction(transaction.serialize(), {
        skipPreflight: false,
        preflightCommitment: 'confirmed',
        maxRetries: 3,
      });

      // Wait for confirmation
      await connection.confirmTransaction(signature, 'confirmed');

      distributionResults.push({
        transactionSignature: signature,
        recipients: batch,
        amountPerRecipient: amountPerCreator.toString(),
        totalAmount: (amountPerCreator * BigInt(batch.length) + (i === 0 ? remainder : BigInt(0))).toString()
      });

      console.log(`✅ Distribution batch ${Math.floor(i / BATCH_SIZE) + 1} completed: ${signature}`);
    }

    return NextResponse.json({
      success: true,
      message: `Distributed fees to ${previousCreators.length} creators`,
      totalRecipients: previousCreators.length,
      totalAmount: availableBalance.toString(),
      distributions: distributionResults
    });

  } catch (error) {
    console.error('❌ Error distributing fees:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}

/**
 * GET endpoint to check distribution status
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tokenMint = searchParams.get('tokenMint');

    if (!tokenMint) {
      return NextResponse.json({
        success: false,
        error: 'tokenMint query parameter is required'
      }, { status: 400 });
    }

    // Get creator list from MongoDB
    const creators = await getAllCreatorsFromMongoDB();

    return NextResponse.json({
      success: true,
      totalCreators: creators.length,
      creators: creators,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error getting distribution status:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}

