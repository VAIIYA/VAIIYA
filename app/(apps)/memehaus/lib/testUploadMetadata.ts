import { uploadMetadata, getMetadataUri, testLighthouseConnection, TokenCreationParams } from './uploadMetadata';

/**
 * Example usage of the uploadMetadata function
 */
export async function testUploadMetadata() {
  console.log('🧪 Testing uploadMetadata function...');

  // Test Lighthouse connection first
  const isConnected = await testLighthouseConnection();
  console.log('Lighthouse connection status:', isConnected ? '✅ Connected' : '❌ Failed');

  // Example token creation parameters
  const tokenParams: TokenCreationParams = {
    name: "Hello Friend",
    symbol: "FRIEND",
    description: "Oh I don't know, is it that we collectively thought Steve Jobs was a great man even when we knew he made billions off the backs of children?",
    imageUrl: "https://gateway.lighthouse.storage/ipfs/QmExampleImageCID",
    totalSupply: 1000000000,
    initialPrice: 0.0001,
    vestingPeriod: 12,
    communityFee: 10,
    decimals: 9
  };

  // Example creator wallet address
  const creatorWallet = "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM";

  try {
    console.log('\n📤 Uploading metadata...');
    const metadataUri = await uploadMetadata(tokenParams, creatorWallet);
    
    console.log('\n✅ Upload completed successfully!');
    console.log('Metadata URI:', metadataUri);
    
    if (metadataUri.startsWith('https://gateway.lighthouse.storage/ipfs/')) {
      console.log('🎉 Successfully uploaded to Lighthouse.storage!');
    } else if (metadataUri.startsWith('data:')) {
      console.log('⚠️ Using fallback data URI');
    }
    
    return metadataUri;
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  }
}

/**
 * Test the wrapper function
 */
export async function testGetMetadataUri() {
  console.log('\n🧪 Testing getMetadataUri wrapper function...');
  
  const tokenParams: TokenCreationParams = {
    name: "Test Token",
    symbol: "TEST",
    description: "A test token for demonstration",
    totalSupply: 1000000,
    initialPrice: 0.001,
    vestingPeriod: 30,
    communityFee: 1.0,
    decimals: 6
  };

  const creatorWallet = "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM";

  try {
    const metadataUri = await getMetadataUri(tokenParams, creatorWallet);
    console.log('✅ getMetadataUri completed successfully!');
    console.log('Metadata URI:', metadataUri);
    return metadataUri;
  } catch (error) {
    console.error('❌ getMetadataUri test failed:', error);
    throw error;
  }
}

// Example of how to use the function in your code:
/*
import { uploadMetadata, TokenCreationParams } from './lib/uploadMetadata';

const tokenParams: TokenCreationParams = {
  name: "My Token",
  symbol: "MTK",
  description: "My awesome token",
  imageUrl: "https://example.com/image.png",
  totalSupply: 1000000,
  initialPrice: 0.01,
  vestingPeriod: 7,
  communityFee: 2.5,
  decimals: 9
};

const creatorWallet = "your-wallet-address-here";

try {
  const metadataUri = await uploadMetadata(tokenParams, creatorWallet);
  console.log('Metadata uploaded successfully:', metadataUri);
  
  // Use this metadataUri in your Metaplex metadata account creation
  // createCreateMetadataAccountV3Instruction({
  //   // ... other parameters
  //   data: {
  //     uri: metadataUri, // Use the returned URI here
  //     // ... other data
  //   }
  // });
  
} catch (error) {
  console.error('Failed to upload metadata:', error);
}
*/
