import { NextRequest, NextResponse } from 'next/server';
import { Connection, Keypair, PublicKey, TransactionInstruction } from '@solana/web3.js';
import {
  getAssociatedTokenAddress,
  createTransferInstruction,
  TOKEN_PROGRAM_ID,
  getMint,
  getAccount,
  createAssociatedTokenAccountInstruction,
  ASSOCIATED_TOKEN_PROGRAM_ID
} from '@solana/spl-token';
import { Transaction } from '@solana/web3.js';
import { LOTTERY_CONFIG } from '../../lib/lottery-config';
import { heliusApi } from '../../lib/helius-api';
import { getEnvConfig } from '@/app/lib/core-env';
import { logger } from '@/app/lib/logger';

// Memo program address on Solana
const MEMO_PROGRAM_ID = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr');

// USDC mint address
const USDC_MINT = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');
// Bonus token (27) mint address
const BONUS_TOKEN_MINT = new PublicKey(LOTTERY_CONFIG.BONUS_TOKEN.MINT_ADDRESS);
const LOTTERY_HOUSE_WALLET = new PublicKey(LOTTERY_CONFIG.LOTTERY_HOUSE_WALLET);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { winnerAddress, amount } = body;

    // 1. Authentication Check
    const config = getEnvConfig();
    const authHeader = request.headers.get('x-api-token');

    if (!config.payoutApiToken || authHeader !== config.payoutApiToken) {
      logger.security('Unauthorized payout attempt', {
        winnerAddress,
        amount,
        ip: request.headers.get('x-forwarded-for')
      });
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!winnerAddress || !amount || amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid winner address or amount' },
        { status: 400 }
      );
    }

    console.log(`💸 Processing payout: ${amount} USDC + ${LOTTERY_CONFIG.BONUS_TOKEN.AMOUNT_PER_WINNER} ${LOTTERY_CONFIG.BONUS_TOKEN.MINT_ADDRESS.slice(0, 4)}... tokens to ${winnerAddress}`);

    // Get lottery house private key from environment variable
    // Check SERVER_WALLET_PRIVATE_KEY first (current setup), then fall back to LOTTERY_HOUSE_PRIVATE_KEY
    const lotteryHousePrivateKey = process.env.SERVER_WALLET_PRIVATE_KEY || process.env.LOTTERY_HOUSE_PRIVATE_KEY;

    if (!lotteryHousePrivateKey) {
      console.error('❌ SERVER_WALLET_PRIVATE_KEY or LOTTERY_HOUSE_PRIVATE_KEY environment variable is not set');
      return NextResponse.json(
        { success: false, error: 'Payout service not configured. Please set SERVER_WALLET_PRIVATE_KEY or LOTTERY_HOUSE_PRIVATE_KEY.' },
        { status: 500 }
      );
    }

    // Parse private key (can be JSON array string, base64 string, or comma-separated numbers)
    let keypair: Keypair;
    try {
      if (lotteryHousePrivateKey.startsWith('[')) {
        // JSON array format: [1,2,3,...]
        const keyArray = JSON.parse(lotteryHousePrivateKey);
        if (keyArray.length !== 64) {
          throw new Error('Invalid private key length. Expected 64 numbers.');
        }
        keypair = Keypair.fromSecretKey(new Uint8Array(keyArray));
      } else if (lotteryHousePrivateKey.includes(',')) {
        // Comma-separated format: "185,162,92,..."
        const keyArray = lotteryHousePrivateKey.split(',').map(num => parseInt(num.trim(), 10));
        if (keyArray.length !== 64) {
          throw new Error('Invalid private key length. Expected 64 numbers.');
        }
        keypair = Keypair.fromSecretKey(new Uint8Array(keyArray));
      } else {
        // Base64 string format
        const keyBytes = Buffer.from(lotteryHousePrivateKey, 'base64');
        if (keyBytes.length !== 64) {
          throw new Error('Invalid private key length. Expected 64 bytes (base64 encoded).');
        }
        keypair = Keypair.fromSecretKey(keyBytes);
      }
    } catch (error) {
      console.error('❌ Error parsing private key:', error);
      return NextResponse.json(
        {
          success: false,
          error: `Invalid private key format: ${error instanceof Error ? error.message : 'Unknown error'}. Expected comma-separated numbers, JSON array, or base64 string.`
        },
        { status: 500 }
      );
    }

    // Verify the keypair matches the lottery house wallet
    if (keypair.publicKey.toString() !== LOTTERY_HOUSE_WALLET.toString()) {
      console.error('❌ Private key does not match lottery house wallet');
      return NextResponse.json(
        { success: false, error: 'Private key mismatch' },
        { status: 500 }
      );
    }

    // Create connection using Helius RPC
    // Use the same RPC endpoint as the rest of the app
    const rpcUrl = config.heliusRpcUrlApi ||
      (config.heliusApiKey ? `https://mainnet.helius-rpc.com/?api-key=${config.heliusApiKey}` : config.solanaRpcUrl);

    const connection = new Connection(rpcUrl, 'confirmed');

    // Get USDC token accounts
    const lotteryHouseUsdcAccount = await getAssociatedTokenAddress(
      USDC_MINT,
      LOTTERY_HOUSE_WALLET
    );

    const winnerUsdcAccount = await getAssociatedTokenAddress(
      USDC_MINT,
      new PublicKey(winnerAddress)
    );

    // Get bonus token (27) token accounts
    const lotteryHouseBonusTokenAccount = await getAssociatedTokenAddress(
      BONUS_TOKEN_MINT,
      LOTTERY_HOUSE_WALLET
    );

    const winnerBonusTokenAccount = await getAssociatedTokenAddress(
      BONUS_TOKEN_MINT,
      new PublicKey(winnerAddress)
    );

    // Check if winner has a bonus token account, create if needed
    let winnerBonusTokenAccountExists = false;
    try {
      await getAccount(connection, winnerBonusTokenAccount);
      winnerBonusTokenAccountExists = true;
      console.log('✅ Winner bonus token account exists');
    } catch (error) {
      console.log('ℹ️ Winner bonus token account does not exist, will create it');
      winnerBonusTokenAccountExists = false;
    }

    // Get bonus token decimals (fetch from on-chain)
    let bonusTokenDecimals = LOTTERY_CONFIG.BONUS_TOKEN.DECIMALS;
    try {
      const mintInfo = await getMint(connection, BONUS_TOKEN_MINT);
      bonusTokenDecimals = mintInfo.decimals;
      console.log(`📊 Bonus token decimals: ${bonusTokenDecimals}`);
    } catch (error) {
      console.warn(`⚠️ Could not fetch bonus token decimals, using default: ${bonusTokenDecimals}`, error);
    }

    // Convert USDC amount to micro-USDC (6 decimals)
    const microUsdcAmount = Math.floor(amount * 1_000_000);

    // Convert bonus token amount to raw amount (using fetched decimals)
    const bonusTokenAmount = Math.floor(LOTTERY_CONFIG.BONUS_TOKEN.AMOUNT_PER_WINNER * Math.pow(10, bonusTokenDecimals));

    // Create USDC transfer instruction
    const usdcTransferInstruction = createTransferInstruction(
      lotteryHouseUsdcAccount,
      winnerUsdcAccount,
      LOTTERY_HOUSE_WALLET,
      microUsdcAmount,
      [],
      TOKEN_PROGRAM_ID
    );

    // Create bonus token transfer instruction
    const bonusTokenTransferInstruction = createTransferInstruction(
      lotteryHouseBonusTokenAccount,
      winnerBonusTokenAccount,
      LOTTERY_HOUSE_WALLET,
      bonusTokenAmount,
      [],
      TOKEN_PROGRAM_ID
    );

    // Create transaction
    const transaction = new Transaction();
    transaction.add(usdcTransferInstruction);

    // Add bonus token account creation instruction if needed
    if (!winnerBonusTokenAccountExists) {
      console.log('📝 Adding bonus token account creation instruction');
      const createAccountInstruction = createAssociatedTokenAccountInstruction(
        LOTTERY_HOUSE_WALLET, // payer
        winnerBonusTokenAccount, // associated token account
        new PublicKey(winnerAddress), // owner
        BONUS_TOKEN_MINT // mint
      );
      transaction.add(createAccountInstruction);
    }

    transaction.add(bonusTokenTransferInstruction);

    // Add memo instruction to identify this as a LUCKYHAUS payout
    const memoInstruction = new TransactionInstruction({
      keys: [
        {
          pubkey: LOTTERY_HOUSE_WALLET,
          isSigner: true,
          isWritable: false,
        },
      ],
      programId: MEMO_PROGRAM_ID,
      data: Buffer.from('LUCKYHAUS', 'utf8'),
    });
    transaction.add(memoInstruction);

    // Get recent blockhash
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = LOTTERY_HOUSE_WALLET;

    // Sign transaction
    transaction.sign(keypair);

    console.log('📤 Sending payout transaction to network...');

    // Send transaction
    const signature = await connection.sendRawTransaction(
      transaction.serialize(),
      {
        skipPreflight: false,
        preflightCommitment: 'confirmed'
      }
    );

    console.log(`✅ Payout transaction sent: ${signature}`);

    // Wait for confirmation
    try {
      const confirmation = await connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight
      }, 'confirmed');

      if (confirmation.value.err) {
        throw new Error(`Transaction failed: ${JSON.stringify(confirmation.value.err)}`);
      }

      console.log(`✅ Payout transaction confirmed: ${signature}`);

      return NextResponse.json({
        success: true,
        signature: signature,
        amount: amount,
        bonusTokenAmount: LOTTERY_CONFIG.BONUS_TOKEN.AMOUNT_PER_WINNER,
        bonusTokenMint: LOTTERY_CONFIG.BONUS_TOKEN.MINT_ADDRESS,
        winnerAddress: winnerAddress
      });
    } catch (confirmError) {
      console.error('❌ Transaction confirmation error:', confirmError);
      // Transaction was sent but confirmation failed - return signature anyway
      return NextResponse.json({
        success: true,
        signature: signature,
        amount: amount,
        bonusTokenAmount: LOTTERY_CONFIG.BONUS_TOKEN.AMOUNT_PER_WINNER,
        bonusTokenMint: LOTTERY_CONFIG.BONUS_TOKEN.MINT_ADDRESS,
        winnerAddress: winnerAddress,
        warning: 'Transaction sent but confirmation pending'
      });
    }

  } catch (error) {
    console.error('❌ Error processing payout:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error processing payout'
      },
      { status: 500 }
    );
  }
}

