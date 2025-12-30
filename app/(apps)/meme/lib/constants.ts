/**
 * Application-wide constants
 */

// Solana native SOL mint address
export const SOL_MINT_ADDRESS = 'So11111111111111111111111111111111111111112';

// Token creation constants
export const FIXED_TOTAL_SUPPLY = 1_000_000_000;
export const CREATOR_PERCENTAGE = 20;
export const LIQUIDITY_PERCENTAGE = 70;
export const COMMUNITY_PERCENTAGE = 10;

// Metadata constants
export const METADATA_URI_MAX_LENGTH = 200;
export const METADATA_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// RPC and API timeouts
export const RPC_TIMEOUT = 10000; // 10 seconds
export const API_TIMEOUT = 30000; // 30 seconds
export const METADATA_FETCH_TIMEOUT = 10000; // 10 seconds

// Rate limiting
export const MAX_CONCURRENT_RPC_CALLS = 3;
export const RPC_CALL_DELAY = 100; // 100ms between calls

// Token defaults
export const DEFAULT_DECIMALS = 9;
export const DEFAULT_VESTING_PERIOD = 0; // No vesting

// Service fees
export const SERVICE_FEE_SOL = 0.001; // 0.001 SOL

// Server wallet address
export const SERVER_WALLET_ADDRESS = '7UhwWmw1r15fqLKcbYEDVFjqiz2G753MsyDksFAjfT3e';
