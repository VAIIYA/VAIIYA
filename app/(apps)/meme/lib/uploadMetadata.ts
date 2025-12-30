import lighthouse from '@lighthouse-web3/sdk';
import { uploadTokenMetadataWithFallback, testAllStorageProviders } from './storageService';

// Lighthouse API key
const LIGHTHOUSE_API_KEY = '1eee22b1.3238b8b9eb13459e89e7ff5f2d94a14d';

// Token creation parameters interface
export interface TokenCreationParams {
  name: string;
  symbol: string;
  description: string;
  imageUrl?: string;
  totalSupply: number;
  initialPrice: number;
  vestingPeriod: number;
  communityFee: number;
  decimals: number;
}

/**
 * Upload metadata JSON to Lighthouse.storage and return the metadata URI
 * @param params - Token creation parameters
 * @param creatorWallet - Creator's wallet address
 * @returns Promise<string> - Metadata URI (Lighthouse URL or fallback data URI)
 */
export async function uploadMetadata(
  params: TokenCreationParams,
  creatorWallet: string
): Promise<string> {
  try {
    console.log('🚀 Starting metadata upload with multiple storage providers...');
    console.log('Token name:', params.name);
    console.log('Token symbol:', params.symbol);
    console.log('Creator wallet:', creatorWallet);

    // Test all storage providers
    const storageResults = await testAllStorageProviders();
    console.log('Storage provider availability:', storageResults);

    // Build metadata object following Metaplex token metadata standard
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

    console.log('📋 Metadata object prepared:', metadata);

    // Upload metadata with fallback providers
    console.log('📤 Uploading metadata with fallback providers...');
    const result = await uploadTokenMetadataWithFallback(metadata, params.symbol);
    
    if (result.success) {
      console.log(`✅ Metadata uploaded successfully with ${result.provider}!`);
      console.log('Metadata URI:', result.url);
      return result.url!;
    } else {
      throw new Error(`Metadata upload failed: ${result.error}`);
    }

  } catch (error) {
    console.error('❌ Failed to upload metadata to Lighthouse.storage:', error);
    
    // Fallback: Create base64-encoded data URI
    console.log('🔄 Falling back to base64 data URI...');
    
    try {
      // Build the same metadata object for fallback
      const fallbackMetadata = {
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

      // Convert to base64 data URI
      const jsonString = JSON.stringify(fallbackMetadata, null, 2);
      const base64Data = Buffer.from(jsonString).toString('base64');
      const dataUri = `data:application/json;base64,${base64Data}`;

      console.log('✅ Fallback data URI created successfully');
      console.log('Data URI length:', dataUri.length, 'characters');

      return dataUri;

    } catch (fallbackError) {
      console.error('❌ Fallback data URI creation also failed:', fallbackError);
      
      // Final fallback: minimal metadata
      const minimalMetadata = {
        name: params.name,
        symbol: params.symbol,
        description: params.description || `A token created on MemeHaus`,
        image: params.imageUrl || `https://ipfs.io/ipfs/QmPlaceholder/${params.symbol.toLowerCase()}`,
      };

      const jsonString = JSON.stringify(minimalMetadata);
      const base64Data = Buffer.from(jsonString).toString('base64');
      const dataUri = `data:application/json;base64,${base64Data}`;

      console.log('⚠️ Using minimal fallback data URI');
      return dataUri;
    }
  }
}

/**
 * Test Lighthouse connection
 * @returns Promise<boolean> - True if connection is successful
 */
export async function testLighthouseConnection(): Promise<boolean> {
  try {
    console.log('🔍 Testing storage providers...');
    
    // Test all storage providers
    const storageResults = await testAllStorageProviders();
    
    // Return true if at least one provider is available
    const hasAvailableProvider = storageResults.lighthouse || storageResults.githubRepo || storageResults.githubGist;
    
    if (hasAvailableProvider) {
      console.log('✅ At least one storage provider is available');
      return true;
    } else {
      console.error('❌ No storage providers available');
      return false;
    }
  } catch (error) {
    console.error('❌ Storage provider test failed:', error);
    return false;
  }
}

/**
 * Get metadata URI for a token (wrapper function)
 * @param params - Token creation parameters
 * @param creatorWallet - Creator's wallet address
 * @returns Promise<string> - Metadata URI
 */
export async function getMetadataUri(
  params: TokenCreationParams,
  creatorWallet: string
): Promise<string> {
  console.log('🎯 Getting metadata URI for token:', params.symbol);
  
  // Test connection first
  const isConnected = await testLighthouseConnection();
  if (!isConnected) {
    console.log('⚠️ Lighthouse connection failed, using fallback');
  }
  
  return await uploadMetadata(params, creatorWallet);
}
