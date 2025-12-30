/**
 * Type definitions for token-related data structures
 */

export interface TokenFromAPI {
  // CamelCase (primary)
  mintAddress: string;
  tokenAccount?: string;
  creatorWallet: string;
  name: string;
  symbol: string;
  description?: string;
  totalSupply: string;
  initialPrice?: number;
  decimals: number;
  imageUrl?: string;
  metadataUri?: string;
  tokenCreationSignature?: string;
  feeTransactionSignature?: string;
  communityFee?: number;
  vestingPeriod?: number;
  createdAt?: string;
  
  // Snake_case (for compatibility)
  mint_address?: string;
  token_account?: string;
  creator_wallet?: string;
  total_supply?: string;
  initial_price?: number;
  image_url?: string;
  metadata_uri?: string;
  token_creation_signature?: string;
  fee_transaction_signature?: string;
  community_fee?: number;
  vesting_period?: number;
  created_at?: string;
}

export interface TokenResponse {
  success: boolean;
  tokens: TokenFromAPI[];
  stats?: {
    totalTokens: number;
    totalVolume: string;
    totalUsers: number;
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
  };
  source?: string;
  error?: string;
}

export interface JupiterRoute {
  inputMint: string;
  outputMint: string;
  inAmount: string;
  outAmount: string;
  priceImpactPct?: number;
  otherAmountThreshold?: string;
  swapMode?: string;
  priceImpact?: number;
}

export interface SwapTransaction {
  swapTransaction: string;
}

