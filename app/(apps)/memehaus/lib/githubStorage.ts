import { Octokit } from '@octokit/rest';

// GitHub configuration
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_OWNER = process.env.GITHUB_OWNER || 'memehause';
const GITHUB_REPO = process.env.GITHUB_REPO || 'memehause-assets';
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main';

// Initialize Octokit
const octokit = new Octokit({
  auth: GITHUB_TOKEN,
});

export interface GitHubUploadResult {
  success: boolean;
  url?: string;
  sha?: string;
  error?: string;
}

export interface TokenMetadata {
  name: string;
  symbol: string;
  description: string;
  image: string;
  attributes: Array<{
    trait_type: string;
    value: string | number;
  }>;
  properties: {
    files: Array<{
      type: string;
      uri: string;
    }>;
    category: string;
    creators: Array<{
      address: string;
      share: number;
    }>;
  };
}

/**
 * Upload token image to GitHub repository
 * @param imageFile - Image file to upload
 * @param tokenSymbol - Token symbol for filename
 * @returns GitHub upload result
 */
export async function uploadTokenImageToGitHub(
  imageFile: File,
  tokenSymbol: string
): Promise<GitHubUploadResult> {
  try {
    console.log(`🔄 Uploading token image to GitHub for ${tokenSymbol}...`);
    
    if (!GITHUB_TOKEN) {
      throw new Error('GitHub token not configured');
    }

    // Convert file to base64
    const arrayBuffer = await imageFile.arrayBuffer();
    const base64Content = Buffer.from(arrayBuffer).toString('base64');
    
    // Generate filename
    const timestamp = Date.now();
    const fileExtension = imageFile.name.split('.').pop() || 'png';
    const filename = `images/${tokenSymbol.toLowerCase()}-${timestamp}.${fileExtension}`;
    
    // Upload to GitHub
    const { data } = await octokit.repos.createOrUpdateFileContents({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      path: filename,
      message: `Add token image for ${tokenSymbol}`,
      content: base64Content,
      branch: GITHUB_BRANCH,
    });

    // Generate public URL
    const imageUrl = `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/${GITHUB_BRANCH}/${filename}`;
    
    console.log(`✅ Token image uploaded to GitHub: ${imageUrl}`);
    
    return {
      success: true,
      url: imageUrl,
      sha: data.content?.sha || '',
    };
    
  } catch (error) {
    console.error('❌ Error uploading token image to GitHub:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Upload token metadata to GitHub repository
 * @param metadata - Token metadata object
 * @param tokenSymbol - Token symbol for filename
 * @returns GitHub upload result
 */
export async function uploadTokenMetadataToGitHub(
  metadata: TokenMetadata,
  tokenSymbol: string
): Promise<GitHubUploadResult> {
  try {
    console.log(`🔄 Uploading token metadata to GitHub for ${tokenSymbol}...`);
    
    if (!GITHUB_TOKEN) {
      throw new Error('GitHub token not configured');
    }

    // Convert metadata to JSON string
    const jsonContent = JSON.stringify(metadata, null, 2);
    const base64Content = Buffer.from(jsonContent).toString('base64');
    
    // Generate filename
    const timestamp = Date.now();
    const filename = `metadata/${tokenSymbol.toLowerCase()}-${timestamp}.json`;
    
    // Upload to GitHub
    const { data } = await octokit.repos.createOrUpdateFileContents({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      path: filename,
      message: `Add token metadata for ${tokenSymbol}`,
      content: base64Content,
      branch: GITHUB_BRANCH,
    });

    // Generate public URL
    const metadataUrl = `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/${GITHUB_BRANCH}/${filename}`;
    
    console.log(`✅ Token metadata uploaded to GitHub: ${metadataUrl}`);
    
    return {
      success: true,
      url: metadataUrl,
      sha: data.content?.sha || '',
    };
    
  } catch (error) {
    console.error('❌ Error uploading token metadata to GitHub:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Upload token data to GitHub Gist (alternative approach)
 * @param metadata - Token metadata object
 * @param tokenSymbol - Token symbol for filename
 * @returns GitHub Gist upload result
 */
export async function uploadTokenMetadataToGist(
  metadata: TokenMetadata,
  tokenSymbol: string
): Promise<GitHubUploadResult> {
  try {
    console.log(`🔄 Uploading token metadata to GitHub Gist for ${tokenSymbol}...`);
    
    if (!GITHUB_TOKEN) {
      throw new Error('GitHub token not configured');
    }

    // Convert metadata to JSON string
    const jsonContent = JSON.stringify(metadata, null, 2);
    
    // Create Gist
    const { data } = await octokit.gists.create({
      description: `Token metadata for ${tokenSymbol}`,
      public: true,
      files: {
        [`${tokenSymbol.toLowerCase()}-metadata.json`]: {
          content: jsonContent,
        },
      },
    });

    // Generate public URL
    const gistUrl = `https://gist.githubusercontent.com/${GITHUB_OWNER}/${data.id}/raw/${tokenSymbol.toLowerCase()}-metadata.json`;
    
    console.log(`✅ Token metadata uploaded to GitHub Gist: ${gistUrl}`);
    
    return {
      success: true,
      url: gistUrl,
      sha: data.id,
    };
    
  } catch (error) {
    console.error('❌ Error uploading token metadata to GitHub Gist:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Test GitHub connection and permissions
 * @returns Connection test result
 */
export async function testGitHubConnection(): Promise<boolean> {
  try {
    console.log('🧪 Testing GitHub connection...');
    
    if (!GITHUB_TOKEN) {
      console.error('❌ GitHub token not configured');
      return false;
    }

    // Test repository access
    const { data } = await octokit.repos.get({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
    });

    console.log(`✅ GitHub connection successful`);
    console.log(`   Repository: ${data.full_name}`);
    console.log(`   Default branch: ${data.default_branch}`);
    console.log(`   Private: ${data.private}`);
    
    return true;
    
  } catch (error) {
    console.error('❌ GitHub connection failed:', error);
    return false;
  }
}

/**
 * Get GitHub repository info
 * @returns Repository information
 */
export async function getGitHubRepoInfo() {
  try {
    const { data } = await octokit.repos.get({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
    });

    return {
      name: data.name,
      fullName: data.full_name,
      description: data.description,
      url: data.html_url,
      cloneUrl: data.clone_url,
      defaultBranch: data.default_branch,
      private: data.private,
      size: data.size,
      stars: data.stargazers_count,
      forks: data.forks_count,
    };
  } catch (error) {
    console.error('Error getting GitHub repo info:', error);
    return null;
  }
}

/**
 * List recent token assets
 * @param limit - Number of assets to retrieve
 * @returns Array of asset information
 */
export async function listTokenAssets(limit: number = 10) {
  try {
    const { data } = await octokit.repos.getContent({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      path: 'images',
    });

    if (Array.isArray(data)) {
      return data
        .filter(item => item.type === 'file')
        .slice(0, limit)
        .map(item => ({
          name: item.name,
          path: item.path,
          url: item.download_url,
          sha: item.sha,
          size: item.size,
        }));
    }

    return [];
  } catch (error) {
    console.error('Error listing token assets:', error);
    return [];
  }
}

/**
 * Delete token asset from GitHub
 * @param path - Path to the asset to delete
 * @param sha - SHA of the file to delete
 * @returns Deletion result
 */
export async function deleteTokenAsset(path: string, sha: string): Promise<GitHubUploadResult> {
  try {
    console.log(`🔄 Deleting token asset: ${path}...`);
    
    await octokit.repos.deleteFile({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
      path: path,
      message: `Delete token asset: ${path}`,
      sha: sha,
      branch: GITHUB_BRANCH,
    });

    console.log(`✅ Token asset deleted: ${path}`);
    
    return {
      success: true,
    };
    
  } catch (error) {
    console.error('❌ Error deleting token asset:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

