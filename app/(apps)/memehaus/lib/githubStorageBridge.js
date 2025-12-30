const { Octokit } = require('@octokit/rest');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_OWNER = process.env.GITHUB_OWNER || 'memehause';
const GITHUB_REPO = process.env.GITHUB_REPO || 'memehause-assets';

const octokit = new Octokit({
  auth: GITHUB_TOKEN,
});

async function testGitHubConnection() {
  try {
    if (!GITHUB_TOKEN) {
      console.error('❌ GitHub token not configured');
      return false;
    }

    const { data } = await octokit.repos.get({
      owner: GITHUB_OWNER,
      repo: GITHUB_REPO,
    });

    console.log('✅ GitHub connection successful');
    console.log(`   Repository: ${data.full_name}`);
    console.log(`   Default branch: ${data.default_branch}`);
    console.log(`   Private: ${data.private}`);

    return true;
  } catch (error) {
    console.error('❌ GitHub connection failed:', error);
    return false;
  }
}

async function getGitHubRepoInfo() {
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

module.exports = {
  testGitHubConnection,
  getGitHubRepoInfo,
};

