import { uploadTokenImage, uploadTokenMetadata, testLighthouseConnection } from './lighthouse';
import { 
  uploadTokenImageToGitHub, 
  uploadTokenMetadataToGitHub, 
  uploadTokenMetadataToGist,
  testGitHubConnection,
  TokenMetadata,
  GitHubUploadResult
} from './githubStorage';

export interface StorageProvider {
  name: string;
  uploadImage: (file: File, symbol: string) => Promise<{ success: boolean; url?: string; error?: string }>;
  uploadMetadata: (metadata: TokenMetadata, symbol: string) => Promise<{ success: boolean; url?: string; error?: string }>;
  testConnection: () => Promise<boolean>;
}

/**
 * Lighthouse Storage Provider
 */
export const lighthouseProvider: StorageProvider = {
  name: 'Lighthouse',
  uploadImage: async (file: File, symbol: string) => {
    try {
      const result = await uploadTokenImage(file, symbol);
      return {
        success: true,
        url: result,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
  uploadMetadata: async (metadata: TokenMetadata, symbol: string) => {
    try {
      const result = await uploadTokenMetadata(metadata, symbol);
      return {
        success: true,
        url: result,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
  testConnection: testLighthouseConnection,
};

/**
 * GitHub Repository Storage Provider
 */
export const githubRepoProvider: StorageProvider = {
  name: 'GitHub Repository',
  uploadImage: async (file: File, symbol: string) => {
    const result = await uploadTokenImageToGitHub(file, symbol);
    return {
      success: result.success,
      url: result.url,
      error: result.error,
    };
  },
  uploadMetadata: async (metadata: TokenMetadata, symbol: string) => {
    const result = await uploadTokenMetadataToGitHub(metadata, symbol);
    return {
      success: result.success,
      url: result.url,
      error: result.error,
    };
  },
  testConnection: testGitHubConnection,
};

/**
 * GitHub Gist Storage Provider
 */
export const githubGistProvider: StorageProvider = {
  name: 'GitHub Gist',
  uploadImage: async (file: File, symbol: string) => {
    // Gist doesn't support binary files, so we'll skip image upload
    return {
      success: false,
      error: 'GitHub Gist does not support binary file uploads',
    };
  },
  uploadMetadata: async (metadata: TokenMetadata, symbol: string) => {
    const result = await uploadTokenMetadataToGist(metadata, symbol);
    return {
      success: result.success,
      url: result.url,
      error: result.error,
    };
  },
  testConnection: testGitHubConnection,
};

/**
 * Available storage providers
 */
export const storageProviders: StorageProvider[] = [
  lighthouseProvider,
  githubRepoProvider,
  githubGistProvider,
];

/**
 * Get the best available storage provider
 * @returns Best available provider or null if none available
 */
export async function getBestStorageProvider(): Promise<StorageProvider | null> {
  console.log('🔍 Finding best storage provider...');
  
  for (const provider of storageProviders) {
    try {
      console.log(`   Testing ${provider.name}...`);
      const isAvailable = await provider.testConnection();
      
      if (isAvailable) {
        console.log(`✅ ${provider.name} is available`);
        return provider;
      } else {
        console.log(`❌ ${provider.name} is not available`);
      }
    } catch (error) {
      console.log(`❌ ${provider.name} test failed:`, error);
    }
  }
  
  console.log('❌ No storage providers available');
  return null;
}

/**
 * Upload token image with fallback providers
 * @param file - Image file to upload
 * @param symbol - Token symbol
 * @returns Upload result
 */
export async function uploadTokenImageWithFallback(
  file: File, 
  symbol: string
): Promise<{ success: boolean; url?: string; provider?: string; error?: string }> {
  console.log(`🔄 Uploading token image for ${symbol}...`);
  
  // Try providers in order of preference
  const preferredProviders = [lighthouseProvider, githubRepoProvider];
  
  for (const provider of preferredProviders) {
    try {
      console.log(`   Trying ${provider.name}...`);
      const result = await provider.uploadImage(file, symbol);
      
      if (result.success) {
        console.log(`✅ Image uploaded successfully with ${provider.name}`);
        return {
          success: true,
          url: result.url,
          provider: provider.name,
        };
      } else {
        console.log(`❌ ${provider.name} failed:`, result.error);
      }
    } catch (error) {
      console.log(`❌ ${provider.name} error:`, error);
    }
  }
  
  return {
    success: false,
    error: 'All storage providers failed',
  };
}

/**
 * Upload token metadata with fallback providers
 * @param metadata - Token metadata
 * @param symbol - Token symbol
 * @returns Upload result
 */
export async function uploadTokenMetadataWithFallback(
  metadata: TokenMetadata, 
  symbol: string
): Promise<{ success: boolean; url?: string; provider?: string; error?: string }> {
  console.log(`🔄 Uploading token metadata for ${symbol}...`);
  
  // Try providers in order of preference
  const preferredProviders = [lighthouseProvider, githubRepoProvider, githubGistProvider];
  
  for (const provider of preferredProviders) {
    try {
      console.log(`   Trying ${provider.name}...`);
      const result = await provider.uploadMetadata(metadata, symbol);
      
      if (result.success) {
        console.log(`✅ Metadata uploaded successfully with ${provider.name}`);
        return {
          success: true,
          url: result.url,
          provider: provider.name,
        };
      } else {
        console.log(`❌ ${provider.name} failed:`, result.error);
      }
    } catch (error) {
      console.log(`❌ ${provider.name} error:`, error);
    }
  }
  
  return {
    success: false,
    error: 'All storage providers failed',
  };
}

/**
 * Test all storage providers
 * @returns Test results for all providers
 */
export async function testAllStorageProviders(): Promise<{
  lighthouse: boolean;
  githubRepo: boolean;
  githubGist: boolean;
}> {
  console.log('🧪 Testing all storage providers...');
  
  const results = {
    lighthouse: false,
    githubRepo: false,
    githubGist: false,
  };
  
  // Test Lighthouse
  try {
    console.log('   Testing Lighthouse...');
    results.lighthouse = await lighthouseProvider.testConnection();
    console.log(`   Lighthouse: ${results.lighthouse ? '✅' : '❌'}`);
  } catch (error) {
    console.log('   Lighthouse: ❌', error);
  }
  
  // Test GitHub Repository
  try {
    console.log('   Testing GitHub Repository...');
    results.githubRepo = await githubRepoProvider.testConnection();
    console.log(`   GitHub Repository: ${results.githubRepo ? '✅' : '❌'}`);
  } catch (error) {
    console.log('   GitHub Repository: ❌', error);
  }
  
  // Test GitHub Gist
  try {
    console.log('   Testing GitHub Gist...');
    results.githubGist = await githubGistProvider.testConnection();
    console.log(`   GitHub Gist: ${results.githubGist ? '✅' : '❌'}`);
  } catch (error) {
    console.log('   GitHub Gist: ❌', error);
  }
  
  console.log('📊 Storage Provider Test Results:');
  console.log(`   Lighthouse: ${results.lighthouse ? '✅ Available' : '❌ Unavailable'}`);
  console.log(`   GitHub Repository: ${results.githubRepo ? '✅ Available' : '❌ Unavailable'}`);
  console.log(`   GitHub Gist: ${results.githubGist ? '✅ Available' : '❌ Unavailable'}`);
  
  return results;
}

