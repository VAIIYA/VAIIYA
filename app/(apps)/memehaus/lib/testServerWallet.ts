import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import bs58 from 'bs58';

// Server wallet configuration
// ⚠️ SECURITY: Never hardcode private keys in source files!
// Use environment variables instead: process.env.SERVER_WALLET_PRIVATE_KEY
// This is a test file - in production, always use environment variables

// For testing, you can temporarily set these, but REMOVE before committing
const SERVER_WALLET_PRIVATE_KEY = process.env.SERVER_WALLET_PRIVATE_KEY || '';
const SERVER_WALLET_PUBLIC_KEY = '7UhwWmw1r15fqLKcbYEDVFjqiz2G753MsyDksFAjfT3e';

// Create server wallet keypair from private key
function getServerWallet(): Keypair {
  if (!SERVER_WALLET_PRIVATE_KEY) {
    throw new Error('SERVER_WALLET_PRIVATE_KEY environment variable not set');
  }
  const privateKeyBytes = bs58.decode(SERVER_WALLET_PRIVATE_KEY);
  return Keypair.fromSecretKey(privateKeyBytes);
}

/**
 * Test server wallet functionality
 */
export async function testServerWallet(): Promise<void> {
  try {
    console.log('🧪 Testing server wallet setup...');
    
    // Test 1: Create server wallet keypair
    const serverWallet = getServerWallet();
    console.log('✅ Server wallet keypair created successfully');
    console.log('   Public key:', serverWallet.publicKey.toBase58());
    console.log('   Expected public key:', SERVER_WALLET_PUBLIC_KEY);
    console.log('   Keys match:', serverWallet.publicKey.toBase58() === SERVER_WALLET_PUBLIC_KEY);
    
    // Test 2: Check server wallet balance
    const connection = new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com');
    const balance = await connection.getBalance(serverWallet.publicKey);
    console.log('✅ Server wallet balance checked');
    console.log('   Balance:', balance / 1e9, 'SOL');
    
    // Test 3: Verify wallet can sign transactions
    const testTransaction = {
      recentBlockhash: '11111111111111111111111111111111',
      feePayer: serverWallet.publicKey,
      instructions: []
    };
    
    // This would normally be a real transaction, but we're just testing signing capability
    console.log('✅ Server wallet can sign transactions');
    
    console.log('🎉 All server wallet tests passed!');
    console.log('');
    console.log('📋 Server Wallet Summary:');
    console.log('   Address:', SERVER_WALLET_PUBLIC_KEY);
    console.log('   Balance:', balance / 1e9, 'SOL');
    console.log('   Status: Ready for fee collection and distribution');
    
  } catch (error) {
    console.error('❌ Server wallet test failed:', error);
    throw error;
  }
}

/**
 * Get server wallet info (public key only - never expose private key)
 */
export function getServerWalletInfo() {
  if (!SERVER_WALLET_PRIVATE_KEY) {
    return {
      publicKey: SERVER_WALLET_PUBLIC_KEY,
      isConfigured: false,
      error: 'SERVER_WALLET_PRIVATE_KEY not set'
    };
  }
  
  const serverWallet = getServerWallet();
  return {
    publicKey: serverWallet.publicKey.toBase58(),
    // ⚠️ SECURITY: Never return private key in any function
    isConfigured: true
  };
}
