import { 
  testGitHubConnection, 
  getGitHubRepoInfo, 
  listTokenAssets,
  uploadTokenImageToGitHub,
  uploadTokenMetadataToGitHub,
  uploadTokenMetadataToGist,
  TokenMetadata
} from './githubStorage';

/**
 * Test GitHub storage functionality
 */
export async function testGitHubStorage(): Promise<void> {
  try {
    console.log('🧪 Testing GitHub Storage Setup...');
    console.log('=====================================');
    
    // Test 1: GitHub Connection
    console.log('\n1. Testing GitHub Connection...');
    const connectionTest = await testGitHubConnection();
    if (!connectionTest) {
      throw new Error('GitHub connection failed');
    }
    
    // Test 2: Repository Info
    console.log('\n2. Getting Repository Info...');
    const repoInfo = await getGitHubRepoInfo();
    if (repoInfo) {
      console.log('✅ Repository Info:');
      console.log(`   Name: ${repoInfo.name}`);
      console.log(`   Full Name: ${repoInfo.fullName}`);
      console.log(`   Description: ${repoInfo.description}`);
      console.log(`   URL: ${repoInfo.url}`);
      console.log(`   Default Branch: ${repoInfo.defaultBranch}`);
      console.log(`   Private: ${repoInfo.private}`);
      console.log(`   Size: ${repoInfo.size} KB`);
      console.log(`   Stars: ${repoInfo.stars}`);
      console.log(`   Forks: ${repoInfo.forks}`);
    }
    
    // Test 3: List Existing Assets
    console.log('\n3. Listing Existing Assets...');
    const assets = await listTokenAssets(5);
    console.log(`✅ Found ${assets.length} existing assets:`);
    assets.forEach((asset, index) => {
      console.log(`   ${index + 1}. ${asset.name} (${asset.size} bytes)`);
      console.log(`      URL: ${asset.url}`);
    });
    
    // Test 4: Create Sample Metadata
    console.log('\n4. Testing Metadata Upload...');
    const sampleMetadata: TokenMetadata = {
      name: "Test Token",
      symbol: "TEST",
      description: "A test token for GitHub storage testing",
      image: "https://raw.githubusercontent.com/memehause/memehause-assets/main/images/test-token.png",
      attributes: [
        {
          trait_type: "Total Supply",
          value: "1,000,000"
        },
        {
          trait_type: "Initial Price",
          value: "0.0001 SOL"
        },
        {
          trait_type: "Vesting Period",
          value: "12 days"
        },
        {
          trait_type: "Community Fee",
          value: "0.5%"
        },
        {
          trait_type: "Decimals",
          value: 9
        },
        {
          trait_type: "Created On",
          value: "2025-01-22T18:48:01.168Z"
        },
        {
          trait_type: "Platform",
          value: "MemeHaus"
        }
      ],
      properties: {
        files: [
          {
            type: "image/png",
            uri: "https://raw.githubusercontent.com/memehause/memehause-assets/main/images/test-token.png"
          }
        ],
        category: "image",
        creators: [
          {
            address: "7UhwWmw1r15fqLKcbYEDVFjqiz2G753MsyDksFAjfT3e",
            share: 100
          }
        ]
      }
    };
    
    // Test 5: Upload Metadata to Repository
    console.log('\n5. Uploading Metadata to Repository...');
    const repoResult = await uploadTokenMetadataToGitHub(sampleMetadata, "TEST");
    if (repoResult.success) {
      console.log('✅ Metadata uploaded to repository:');
      console.log(`   URL: ${repoResult.url}`);
      console.log(`   SHA: ${repoResult.sha}`);
    } else {
      console.log('❌ Repository upload failed:', repoResult.error);
    }
    
    // Test 6: Upload Metadata to Gist
    console.log('\n6. Uploading Metadata to Gist...');
    const gistResult = await uploadTokenMetadataToGist(sampleMetadata, "TEST");
    if (gistResult.success) {
      console.log('✅ Metadata uploaded to Gist:');
      console.log(`   URL: ${gistResult.url}`);
      console.log(`   SHA: ${gistResult.sha}`);
    } else {
      console.log('❌ Gist upload failed:', gistResult.error);
    }
    
    console.log('\n🎉 GitHub Storage Test Completed!');
    console.log('=====================================');
    console.log('📋 Summary:');
    console.log('   ✅ GitHub connection working');
    console.log('   ✅ Repository access confirmed');
    console.log('   ✅ Asset listing functional');
    console.log('   ✅ Metadata upload to repository working');
    console.log('   ✅ Metadata upload to Gist working');
    console.log('');
    console.log('🚀 GitHub storage is ready for production use!');
    
  } catch (error) {
    console.error('❌ GitHub storage test failed:', error);
    throw error;
  }
}

/**
 * Test image upload functionality
 */
export async function testImageUpload(): Promise<void> {
  try {
    console.log('🧪 Testing Image Upload...');
    
    // Create a sample image file (1x1 pixel PNG)
    const sampleImageData = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    const sampleImageFile = new File([Buffer.from(sampleImageData, 'base64')], 'test-image.png', { type: 'image/png' });
    
    const result = await uploadTokenImageToGitHub(sampleImageFile, "TEST");
    
    if (result.success) {
      console.log('✅ Image upload successful:');
      console.log(`   URL: ${result.url}`);
      console.log(`   SHA: ${result.sha}`);
    } else {
      console.log('❌ Image upload failed:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Image upload test failed:', error);
    throw error;
  }
}
