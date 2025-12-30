import { Octokit } from '@octokit/rest';

// GitHub configuration - read at runtime to ensure env vars are available
function getGitHubConfig() {
  return {
    token: process.env.GITHUB_TOKEN,
    owner: process.env.GITHUB_OWNER || 'memehause',
    repo: process.env.GITHUB_REPO || 'memehause-assets',
    branch: process.env.GITHUB_BRANCH || 'main',
  };
}

// Initialize Octokit - create new instance each time to ensure fresh env vars
function getOctokit() {
  const config = getGitHubConfig();
  return new Octokit({
    auth: config.token,
  });
}

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

export interface TokenData {
  id: string;
  name: string;
  symbol: string;
  description: string;
  totalSupply: string;
  creatorWallet: string;
  mintAddress: string;
  tokenAccount: string;
  initialPrice: number;
  vestingPeriod: number;
  communityFee: number;
  decimals: number;
  imageUrl?: string;
  metadataUri: string;
  tokenCreationSignature: string;
  feeTransactionSignature: string;
  createdAt: string;
}

/**
 * Upload token image to GitHub repository
 * @param imageFile - Image file to upload
 * @param tokenSymbol - Token symbol for filename
 * @returns GitHub upload result
 */
export async function uploadTokenImage(
  imageFile: File,
  tokenSymbol: string
): Promise<GitHubUploadResult> {
  try {
    console.log(`🔄 Uploading token image to GitHub for ${tokenSymbol}...`);
    
    const config = getGitHubConfig();
    const octokitInstance = getOctokit();
    
    if (!config.token) {
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
    const { data } = await octokitInstance.repos.createOrUpdateFileContents({
      owner: config.owner,
      repo: config.repo,
      path: filename,
      message: `Add token image for ${tokenSymbol}`,
      content: base64Content,
      branch: config.branch,
    });

    // Generate public URL
    const imageUrl = `https://raw.githubusercontent.com/${config.owner}/${config.repo}/${config.branch}/${filename}`;
    
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
export async function uploadTokenMetadata(
  metadata: TokenMetadata,
  tokenSymbol: string
): Promise<GitHubUploadResult> {
  try {
    console.log(`🔄 Uploading token metadata to GitHub for ${tokenSymbol}...`);
    
    const config = getGitHubConfig();
    const octokitInstance = getOctokit();
    
    if (!config.token) {
      throw new Error('GitHub token not configured');
    }

    // Convert metadata to JSON string
    const jsonContent = JSON.stringify(metadata, null, 2);
    const base64Content = Buffer.from(jsonContent).toString('base64');
    
    // Generate filename
    const timestamp = Date.now();
    const filename = `metadata/${tokenSymbol.toLowerCase()}-${timestamp}.json`;
    
    // Upload to GitHub
    const { data } = await octokitInstance.repos.createOrUpdateFileContents({
      owner: config.owner,
      repo: config.repo,
      path: filename,
      message: `Add token metadata for ${tokenSymbol}`,
      content: base64Content,
      branch: config.branch,
    });

    // Generate public URL
    const metadataUrl = `https://raw.githubusercontent.com/${config.owner}/${config.repo}/${config.branch}/${filename}`;
    
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
 * Store token data in GitHub repository
 * @param tokenData - Token data to store
 * @returns GitHub upload result
 */
/**
 * Ensure directory exists in GitHub repository (create if needed)
 */
async function ensureDirectoryExists(
  octokit: Octokit,
  config: ReturnType<typeof getGitHubConfig>,
  directory: string
): Promise<boolean> {
  try {
    // Try to get the directory
    await octokit.repos.getContent({
      owner: config.owner,
      repo: config.repo,
      path: directory,
      ref: config.branch,
    });
    // Directory exists
    return true;
  } catch (error: any) {
    if (error.status === 404) {
      // Directory doesn't exist, create it with a .gitkeep file
      try {
        const gitkeepContent = Buffer.from('# This file ensures the directory exists in Git\n').toString('base64');
        await octokit.repos.createOrUpdateFileContents({
          owner: config.owner,
          repo: config.repo,
          path: `${directory}/.gitkeep`,
          message: `Create ${directory} directory`,
          content: gitkeepContent,
          branch: config.branch,
        });
        console.log(`✅ Created directory: ${directory}`);
        return true;
      } catch (createError) {
        console.warn(`⚠️ Could not create directory ${directory}:`, createError);
        // Continue anyway - GitHub API can create directories on the fly
        return true;
      }
    }
    // Other error - might be permissions or repo doesn't exist
    console.warn(`⚠️ Error checking directory ${directory}:`, error);
    return false;
  }
}

export async function storeTokenData(
  tokenData: TokenData
): Promise<GitHubUploadResult> {
  try {
    console.log(`🔄 Storing token data in GitHub for ${tokenData.symbol}...`);
    
    // Read env vars at runtime (not module load time)
    const config = getGitHubConfig();
    const octokitInstance = getOctokit();
    
    // Debug logging (don't log the actual token)
    console.log(`📋 GitHub config: owner=${config.owner}, repo=${config.repo}, branch=${config.branch}`);
    console.log(`🔑 GitHub token present: ${config.token ? 'YES' : 'NO'}`);
    
    if (!config.token) {
      console.error('❌ GITHUB_TOKEN environment variable is not set');
      console.error('   Available env vars:', Object.keys(process.env).filter(k => k.includes('GITHUB')).join(', ') || 'none');
      throw new Error('GitHub token not configured. Please set GITHUB_TOKEN environment variable in Vercel.');
    }

    // Ensure tokens directory exists
    await ensureDirectoryExists(octokitInstance, config, 'tokens');

    // Convert token data to JSON string
    const jsonContent = JSON.stringify(tokenData, null, 2);
    const base64Content = Buffer.from(jsonContent).toString('base64');
    
    // Generate filename
    const filename = `tokens/${tokenData.symbol.toLowerCase()}-${tokenData.id}.json`;
    
    // Upload to GitHub with retry logic
    let data;
    let lastError;
    const maxRetries = 3;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await octokitInstance.repos.createOrUpdateFileContents({
          owner: config.owner,
          repo: config.repo,
          path: filename,
          message: `Add token data for ${tokenData.symbol}`,
          content: base64Content,
          branch: config.branch,
        });
        data = result.data;
        break; // Success, exit retry loop
      } catch (error: any) {
        lastError = error;
        if (error.status === 404) {
          // Repository or path doesn't exist
          const errorMsg = error.message || 'Not Found';
          console.error(`❌ GitHub API 404 error (attempt ${attempt}/${maxRetries}):`, errorMsg);
          console.error(`   Repository: ${config.owner}/${config.repo}`);
          console.error(`   Path: ${filename}`);
          console.error(`   Branch: ${config.branch}`);
          console.error(`   Possible causes:`);
          console.error(`   - Repository doesn't exist: https://github.com/${config.owner}/${config.repo}`);
          console.error(`   - Token doesn't have write access to the repository`);
          console.error(`   - Branch "${config.branch}" doesn't exist`);
          
          if (attempt < maxRetries) {
            console.log(`   Retrying in ${attempt} second(s)...`);
            await new Promise(resolve => setTimeout(resolve, attempt * 1000));
            continue;
          }
        }
        
        // For other errors or last attempt, throw
        if (attempt === maxRetries) {
          throw error;
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, attempt * 1000));
      }
    }

    if (!data) {
      throw lastError || new Error('Failed to upload after retries');
    }

    // Generate public URL
    const dataUrl = `https://raw.githubusercontent.com/${config.owner}/${config.repo}/${config.branch}/${filename}`;
    
    console.log(`✅ Token data stored in GitHub: ${dataUrl}`);
    
    return {
      success: true,
      url: dataUrl,
      sha: data.content?.sha || '',
    };
    
  } catch (error: any) {
    console.error('❌ Error storing token data in GitHub:', error);
    
    // Provide helpful error message
    let errorMessage = error instanceof Error ? error.message : 'Unknown error';
    if (error.status === 404) {
      errorMessage = `Repository or path not found. Please verify:
- Repository exists: https://github.com/${getGitHubConfig().owner}/${getGitHubConfig().repo}
- Token has write access
- Branch "${getGitHubConfig().branch}" exists`;
    }
    
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Get token data from GitHub repository
 * @param tokenSymbol - Token symbol to retrieve
 * @returns Token data or null if not found
 */
export async function getTokenData(tokenSymbol: string): Promise<TokenData | null> {
  try {
    console.log(`🔄 Retrieving token data for ${tokenSymbol}...`);
    
    const config = getGitHubConfig();
    const octokitInstance = getOctokit();
    
    if (!config.token) {
      throw new Error('GitHub token not configured');
    }

    // List files in tokens directory
    const { data } = await octokitInstance.repos.getContent({
      owner: config.owner,
      repo: config.repo,
      path: 'tokens',
    });

    if (Array.isArray(data)) {
      // Find the token file
      const tokenFile = data.find(file => 
        file.name.startsWith(tokenSymbol.toLowerCase()) && 
        file.name.endsWith('.json')
      );

      if (tokenFile && 'download_url' in tokenFile && tokenFile.download_url) {
        // Download the file content
        const response = await fetch(tokenFile.download_url);
        const tokenData = await response.json();
        
        console.log(`✅ Token data retrieved for ${tokenSymbol}`);
        return tokenData;
      }
    }

    console.log(`❌ Token data not found for ${tokenSymbol}`);
    return null;
    
  } catch (error) {
    console.error('❌ Error retrieving token data from GitHub:', error);
    return null;
  }
}

/**
 * List all tokens from GitHub repository
 * @param limit - Maximum number of tokens to retrieve
 * @returns Array of token data
 */
/**
 * @deprecated This function is deprecated. Use MongoDB storage instead via /api/tokens endpoint.
 * This function is kept only for migration purposes.
 */
export async function listTokens(limit: number = 50): Promise<TokenData[]> {
  try {
    console.log(`🔄 [DEPRECATED] Listing tokens from GitHub (use MongoDB instead)...`);
    
    const config = getGitHubConfig();
    const octokitInstance = getOctokit();
    
    if (!config.token) {
      console.warn('⚠️ GitHub token not configured - this is expected if using MongoDB-only storage');
      return []; // Return empty array instead of throwing
    }

    // List files in tokens directory
    const { data } = await octokitInstance.repos.getContent({
      owner: config.owner,
      repo: config.repo,
      path: 'tokens',
    });

    if (Array.isArray(data)) {
      const tokenFiles = data
        .filter(file => file.name.endsWith('.json'))
        .slice(0, limit);

      const tokens: TokenData[] = [];
      
      for (const file of tokenFiles) {
        if ('download_url' in file && file.download_url) {
          try {
            const response = await fetch(file.download_url);
            const tokenData = await response.json();
            tokens.push(tokenData);
          } catch (error) {
            console.error(`Error loading token file ${file.name}:`, error);
          }
        }
      }

      // Sort by creation date (newest first)
      tokens.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      console.log(`✅ Retrieved ${tokens.length} tokens from GitHub`);
      return tokens;
    }

    return [];
    
  } catch (error) {
    console.error('❌ Error listing tokens from GitHub:', error);
    return [];
  }
}

/**
 * Test GitHub connection and permissions
 * @returns Connection test result
 */
export async function testGitHubConnection(): Promise<boolean> {
  try {
    console.log('🧪 Testing GitHub connection...');
    
    const config = getGitHubConfig();
    const octokitInstance = getOctokit();
    
    if (!config.token) {
      console.error('❌ GitHub token not configured');
      return false;
    }

    // Test repository access
    const { data } = await octokitInstance.repos.get({
      owner: config.owner,
      repo: config.repo,
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
    const config = getGitHubConfig();
    const octokitInstance = getOctokit();
    
    const { data } = await octokitInstance.repos.get({
      owner: config.owner,
      repo: config.repo,
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
 * Creator list interface
 */
export interface CreatorList {
  creators: string[]; // Array of unique wallet addresses
  lastUpdated: string; // ISO timestamp
  totalCreators: number;
}

/**
 * Get the list of previous token creators from GitHub
 * @returns Creator list or empty list if not found
 */
export async function getCreatorList(): Promise<CreatorList> {
  try {
    console.log('📋 Fetching creator list from GitHub...');
    
    const config = getGitHubConfig();
    const octokitInstance = getOctokit();
    
    if (!config.token) {
      console.warn('⚠️ GitHub token not configured, returning empty creator list');
      return {
        creators: [],
        lastUpdated: new Date().toISOString(),
        totalCreators: 0
      };
    }

    try {
      // Try to get the creator list file
      const { data } = await octokitInstance.repos.getContent({
        owner: config.owner,
        repo: config.repo,
        path: 'creators.json',
      });

      if ('content' in data && data.content) {
        // Decode base64 content
        const content = Buffer.from(data.content, 'base64').toString('utf-8');
        const creatorList: CreatorList = JSON.parse(content);
        
        console.log(`✅ Retrieved ${creatorList.totalCreators} creators from GitHub`);
        return creatorList;
      }
    } catch (error: any) {
      // File doesn't exist yet, return empty list
      if (error.status === 404) {
        console.log('ℹ️ Creator list not found, starting fresh');
        return {
          creators: [],
          lastUpdated: new Date().toISOString(),
          totalCreators: 0
        };
      }
      throw error;
    }

    return {
      creators: [],
      lastUpdated: new Date().toISOString(),
      totalCreators: 0
    };
  } catch (error) {
    console.error('❌ Error fetching creator list:', error);
    return {
      creators: [],
      lastUpdated: new Date().toISOString(),
      totalCreators: 0
    };
  }
}

/**
 * Add a creator wallet to the list (if not already present)
 * @param creatorWallet - Wallet address to add
 * @returns Success status and updated creator list
 */
export async function addCreatorToList(creatorWallet: string): Promise<{
  success: boolean;
  creatorList: CreatorList;
  wasNew: boolean;
  error?: string;
}> {
  try {
    console.log(`➕ Adding creator ${creatorWallet} to list...`);
    
    const config = getGitHubConfig();
    const octokitInstance = getOctokit();
    
    if (!config.token) {
      return {
        success: false,
        creatorList: {
          creators: [],
          lastUpdated: new Date().toISOString(),
          totalCreators: 0
        },
        wasNew: false,
        error: 'GitHub token not configured'
      };
    }

    // Get current list
    const currentList = await getCreatorList();
    
    // Check if creator already exists
    const exists = currentList.creators.includes(creatorWallet);
    
    if (exists) {
      console.log(`ℹ️ Creator ${creatorWallet} already in list`);
      return {
        success: true,
        creatorList: currentList,
        wasNew: false
      };
    }

    // Add new creator
    const updatedCreators = [...currentList.creators, creatorWallet];
    const updatedList: CreatorList = {
      creators: updatedCreators,
      lastUpdated: new Date().toISOString(),
      totalCreators: updatedCreators.length
    };

    // Convert to JSON and base64
    const jsonContent = JSON.stringify(updatedList, null, 2);
    const base64Content = Buffer.from(jsonContent).toString('base64');

    // Get current file SHA if it exists (for update)
    let sha: string | undefined;
    try {
      const { data } = await octokitInstance.repos.getContent({
        owner: config.owner,
        repo: config.repo,
        path: 'creators.json',
      });
      if ('sha' in data && data.sha) {
        sha = data.sha;
      }
    } catch (error: any) {
      // File doesn't exist, that's okay - we'll create it
      if (error.status !== 404) {
        throw error;
      }
    }

    // Upload to GitHub with retry logic
    let lastError;
    const maxRetries = 3;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await octokitInstance.repos.createOrUpdateFileContents({
          owner: config.owner,
          repo: config.repo,
          path: 'creators.json',
          message: `Add creator ${creatorWallet} to creator list`,
          content: base64Content,
          branch: config.branch,
          ...(sha ? { sha } : {}), // Include SHA if updating existing file
        });
        break; // Success, exit retry loop
      } catch (error: any) {
        lastError = error;
        if (error.status === 404) {
          console.error(`❌ GitHub API 404 error (attempt ${attempt}/${maxRetries}):`, error.message);
          console.error(`   Repository: ${config.owner}/${config.repo}`);
          console.error(`   Path: creators.json`);
          console.error(`   Branch: ${config.branch}`);
          
          if (attempt < maxRetries) {
            console.log(`   Retrying in ${attempt} second(s)...`);
            await new Promise(resolve => setTimeout(resolve, attempt * 1000));
            continue;
          }
        }
        
        // For other errors or last attempt, throw
        if (attempt === maxRetries) {
          throw error;
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, attempt * 1000));
      }
    }

    console.log(`✅ Creator ${creatorWallet} added to list (total: ${updatedList.totalCreators})`);

    return {
      success: true,
      creatorList: updatedList,
      wasNew: true
    };
  } catch (error) {
    console.error('❌ Error adding creator to list:', error);
    return {
      success: false,
      creatorList: {
        creators: [],
        lastUpdated: new Date().toISOString(),
        totalCreators: 0
      },
      wasNew: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
