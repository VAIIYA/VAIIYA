/**
 * VAIIYA Core Environment Configuration
 * Unifies environment variables for LuckyHaus and MemeHaus
 */

interface EnvConfig {
    // Core
    solanaRpcUrl: string;
    network: string;
    nodeEnv: string;

    // Database
    mongoDbUri: string;
    mongoDbUriLuckyHaus?: string;
    mongoDbUriMemeHaus?: string;

    // LuckyHaus Specific
    heliusApiKey?: string;
    lotteryHouseWallet?: string;

    // MemeHaus Specific
    vaultSeed: string;
    lighthouseApiKey?: string;
    githubToken?: string;
    githubOwner: string;
    githubRepo: string;
    githubBranch: string;

    // Platform Fees
    devWalletSn: string;
    devWalletMg: string;
    serverWallet: string;
}

// Required environment variables
const REQUIRED_ENV_VARS = [
    'NEXT_PUBLIC_SOLANA_RPC_URL',
    'NEXT_PUBLIC_NETWORK',
    'MONGODB_URI'
] as const;

// Optional environment variables with defaults
const OPTIONAL_ENV_VARS = {
    GITHUB_TOKEN: undefined,
    GITHUB_OWNER: 'memehause',
    GITHUB_REPO: 'memehause-assets',
    GITHUB_BRANCH: 'main',
    NEXT_PUBLIC_LIGHTHOUSE_API_KEY: undefined,
    NODE_ENV: 'development',
    MEMEHAUS_VAULT_SEED: 'memehaus-liquidity-community-vault-seed-2025', // Fallback for development
    HELIUS_API_KEY: undefined,
    LOTTERY_HOUSE_WALLET: undefined,
    MONGODB_URI_LUCKYHAUS: undefined,
    MONGODB_URI_MEMEHAUS: undefined,
    DEV_WALLET_SN: 'EpfmoiBoNFEofbACjZo1vpyqXUy5Fq9ZtPrGVwok5fb3',
    DEV_WALLET_MG: '2DmYGqwgbm2Axygs6jHj63kxYT24eE72XoqLaJe4mS9e',
    SERVER_WALLET: '7UhwWmw1r15fqLKcbYEDVFjqiz2G753MsyDksFAjfT3e'
} as const;

/**
 * Validates and returns environment configuration
 */
export function getEnvConfig(): EnvConfig {
    // Check required environment variables
    const missingVars: string[] = [];

    for (const envVar of REQUIRED_ENV_VARS) {
        if (!process.env[envVar]) {
            missingVars.push(envVar);
        }
    }

    if (missingVars.length > 0) {
        throw new Error(
            `Missing required environment variables: ${missingVars.join(', ')}\n` +
            'Please check your .env.local file and ensure all required variables are set.'
        );
    }

    // Validate RPC URL format
    const rpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC_URL!;
    if (!rpcUrl.startsWith('http://') && !rpcUrl.startsWith('https://')) {
        throw new Error('NEXT_PUBLIC_SOLANA_RPC_URL must be a valid HTTP/HTTPS URL');
    }

    // Validate network
    const network = process.env.NEXT_PUBLIC_NETWORK!;
    const validNetworks = ['mainnet-beta', 'devnet', 'testnet'];
    if (!validNetworks.includes(network)) {
        throw new Error(`NEXT_PUBLIC_NETWORK must be one of: ${validNetworks.join(', ')}`);
    }

    // Get vault seed with warning in production
    const vaultSeed = process.env.MEMEHAUS_VAULT_SEED || OPTIONAL_ENV_VARS.MEMEHAUS_VAULT_SEED;

    const nodeEnv = process.env.NODE_ENV || OPTIONAL_ENV_VARS.NODE_ENV;
    if (nodeEnv === 'production' && vaultSeed === OPTIONAL_ENV_VARS.MEMEHAUS_VAULT_SEED) {
        console.warn('⚠️  WARNING: Using default vault seed in production!');
        console.warn('   Set MEMEHAUS_VAULT_SEED environment variable for security.');
    }

    return {
        solanaRpcUrl: rpcUrl,
        network,
        nodeEnv,

        // Database
        mongoDbUri: process.env.MONGODB_URI!,
        mongoDbUriLuckyHaus: process.env.MONGODB_URI_LUCKYHAUS || OPTIONAL_ENV_VARS.MONGODB_URI_LUCKYHAUS,
        mongoDbUriMemeHaus: process.env.MONGODB_URI_MEMEHAUS || OPTIONAL_ENV_VARS.MONGODB_URI_MEMEHAUS,

        // LuckyHaus
        heliusApiKey: process.env.HELIUS_API_KEY || OPTIONAL_ENV_VARS.HELIUS_API_KEY,
        lotteryHouseWallet: process.env.LOTTERY_HOUSE_WALLET || OPTIONAL_ENV_VARS.LOTTERY_HOUSE_WALLET,

        // MemeHaus
        vaultSeed,
        lighthouseApiKey: process.env.NEXT_PUBLIC_LIGHTHOUSE_API_KEY,
        githubToken: process.env.GITHUB_TOKEN,
        githubOwner: process.env.GITHUB_OWNER || OPTIONAL_ENV_VARS.GITHUB_OWNER,
        githubRepo: process.env.GITHUB_REPO || OPTIONAL_ENV_VARS.GITHUB_REPO,
        githubBranch: process.env.GITHUB_BRANCH || OPTIONAL_ENV_VARS.GITHUB_BRANCH,

        // Platform Fees
        devWalletSn: process.env.DEV_WALLET_SN || OPTIONAL_ENV_VARS.DEV_WALLET_SN,
        devWalletMg: process.env.DEV_WALLET_MG || OPTIONAL_ENV_VARS.DEV_WALLET_MG,
        serverWallet: process.env.SERVER_WALLET || OPTIONAL_ENV_VARS.SERVER_WALLET,
    };
}

/**
 * Validates environment variables on app startup
 */
export function validateEnvironment(): void {
    try {
        getEnvConfig();
        console.log('✅ VAIIYA Environment variables validated successfully');
    } catch (error) {
        console.error('❌ Environment validation failed:', error);
        throw error;
    }
}

/**
 * Gets a safe environment variable with fallback
 */
export function getEnvVar(key: string, fallback?: string): string {
    const value = process.env[key];
    if (!value && fallback === undefined) {
        throw new Error(`Environment variable ${key} is required but not set`);
    }
    return value || fallback!;
}

/**
 * Checks if we're in development mode
 */
export function isDevelopment(): boolean {
    return getEnvConfig().nodeEnv === 'development';
}

/**
 * Checks if we're in production mode
 */
export function isProduction(): boolean {
    return getEnvConfig().nodeEnv === 'production';
}
