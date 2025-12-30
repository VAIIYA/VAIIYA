import { Connection, PublicKey } from '@solana/web3.js';

const TOKEN_METADATA_PROGRAM_ID = new PublicKey(
  'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s'
);

function deriveMetadataAccount(mint: PublicKey): PublicKey {
  const [metadataAccount] = PublicKey.findProgramAddressSync(
    [
      Buffer.from('metadata'),
      TOKEN_METADATA_PROGRAM_ID.toBuffer(),
      mint.toBuffer(),
    ],
    TOKEN_METADATA_PROGRAM_ID
  );

  return metadataAccount;
}

/**
 * Test function to verify metadata account derivation
 */
export function testMetadataDerivation() {
  console.log('Testing metadata account derivation...');
  
  // Test with a sample mint address
  const sampleMint = new PublicKey('11111111111111111111111111111111');
  const metadataAccount = deriveMetadataAccount(sampleMint);
  
  console.log('Sample mint:', sampleMint.toBase58());
  console.log('Derived metadata account:', metadataAccount.toBase58());
  
  return metadataAccount;
}

/**
 * Verify that a metadata account exists for a given mint
 */
export async function verifyMetadataAccount(
  connection: Connection,
  mintAddress: string
): Promise<boolean> {
  try {
    const mint = new PublicKey(mintAddress);
    const metadataAccount = deriveMetadataAccount(mint);
    
    console.log('Verifying metadata account for mint:', mintAddress);
    console.log('Expected metadata account:', metadataAccount.toBase58());
    
    // Check if the metadata account exists
    const accountInfo = await connection.getAccountInfo(metadataAccount);
    
    if (accountInfo) {
      console.log('✅ Metadata account exists!');
      console.log('Account size:', accountInfo.data.length, 'bytes');
      return true;
    } else {
      console.log('❌ Metadata account does not exist');
      return false;
    }
  } catch (error) {
    console.error('Error verifying metadata account:', error);
    return false;
  }
}

/**
 * Get metadata account info for a given mint
 */
export async function getMetadataAccountInfo(
  connection: Connection,
  mintAddress: string
) {
  try {
    const mint = new PublicKey(mintAddress);
    const metadataAccount = deriveMetadataAccount(mint);
    
    const accountInfo = await connection.getAccountInfo(metadataAccount);
    
    if (accountInfo) {
      console.log('Metadata account info:');
      console.log('- Address:', metadataAccount.toBase58());
      console.log('- Size:', accountInfo.data.length, 'bytes');
      console.log('- Owner:', accountInfo.owner.toBase58());
      console.log('- Lamports:', accountInfo.lamports);
      return accountInfo;
    } else {
      console.log('No metadata account found for mint:', mintAddress);
      return null;
    }
  } catch (error) {
    console.error('Error getting metadata account info:', error);
    return null;
  }
}
