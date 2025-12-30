import { NextRequest, NextResponse } from 'next/server';
import { getTokenDataFromMongoDB } from '../../../lib/mongodbStorage';
import { PriceService } from '../../../services/priceService';
import { PublicKey } from '@solana/web3.js';
import { fetchTokenMetadataFromChain } from '../../../lib/onChainMetadata';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { mintAddress: string } }
) {
  try {
    const { mintAddress } = params;

    if (!mintAddress) {
      return NextResponse.json(
        { success: false, error: 'Mint address is required' },
        { status: 400 }
      );
    }

    // Validate mint address format
    try {
      new PublicKey(mintAddress);
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid Solana address format' },
        { status: 400 }
      );
    }

    console.log('API: Fetching token data for:', mintAddress);

    // Get token data from MongoDB
    let tokenData = await getTokenDataFromMongoDB(mintAddress);

    // If MongoDB doesn't have the token or missing name/symbol, fetch from on-chain
    if (!tokenData || !tokenData.name || !tokenData.symbol || tokenData.name === 'Unknown Token' || tokenData.symbol === 'UNK') {
      console.log('API: Token not in MongoDB or missing metadata, fetching from on-chain...');
      const onChainData = await fetchTokenMetadataFromChain(mintAddress);
      
      if (onChainData) {
        // Merge on-chain data with MongoDB data (if exists) or create new token data
        tokenData = {
          id: tokenData?.id || `${onChainData.symbol.toLowerCase()}-${Date.now()}`,
          name: onChainData.name,
          symbol: onChainData.symbol,
          description: tokenData?.description || '',
          totalSupply: tokenData?.totalSupply || onChainData.totalSupply,
          creatorWallet: tokenData?.creatorWallet || '',
          mintAddress: mintAddress,
          tokenAccount: tokenData?.tokenAccount || '',
          initialPrice: tokenData?.initialPrice || 0,
          vestingPeriod: tokenData?.vestingPeriod || 0,
          communityFee: tokenData?.communityFee || 0,
          decimals: onChainData.decimals,
          imageUrl: tokenData?.imageUrl,
          metadataUri: tokenData?.metadataUri || '',
          tokenCreationSignature: tokenData?.tokenCreationSignature || '',
          feeTransactionSignature: tokenData?.feeTransactionSignature || '',
          createdAt: tokenData?.createdAt || new Date().toISOString(),
        };
      } else if (!tokenData) {
        // If we can't get on-chain data either, return error
        return NextResponse.json(
          { success: false, error: 'Token not found. The token may not exist on Solana.' },
          { status: 404 }
        );
      }
    }

    // Get current price and market data (non-blocking - continue even if price fetch fails)
    let priceData = null;
    try {
      const priceService = new PriceService();
      priceData = await priceService.getTokenPrice(mintAddress);
    } catch (priceError) {
      console.warn('Price fetch failed, continuing without price data:', priceError);
      // Continue without price - token data is still valid
    }

    // Get holder count
    let holders = 0;
    try {
      const holdersResponse = await fetch(
        `${request.nextUrl.origin}/api/token/holders?mintAddress=${mintAddress}`
      );
      const holdersData = await holdersResponse.json();
      if (holdersData.success && holdersData.holders !== undefined) {
        holders = holdersData.holders;
      }
    } catch (error) {
      console.error('Error fetching holders:', error);
    }

    // Calculate market cap if price is available
    let marketCap = 0;
    if (priceData && priceData.price > 0) {
      const supply = parseFloat(tokenData.totalSupply);
      marketCap = supply * priceData.price;
    }

    // Return token data with market information
    const response = {
      success: true,
      token: {
        ...tokenData,
        // Add both formats for compatibility
        mint_address: tokenData.mintAddress,
        total_supply: tokenData.totalSupply,
        creator_wallet: tokenData.creatorWallet,
        token_account: tokenData.tokenAccount,
        initial_price: tokenData.initialPrice,
        vesting_period: tokenData.vestingPeriod,
        community_fee: tokenData.communityFee,
        image_url: tokenData.imageUrl,
        metadata_uri: tokenData.metadataUri || '',
        token_creation_signature: tokenData.tokenCreationSignature,
        fee_transaction_signature: tokenData.feeTransactionSignature,
        created_at: tokenData.createdAt,
        // Market data
        price: priceData?.price || 0,
        priceChange24h: priceData?.priceChange24h || 0,
        volume24h: priceData?.volume24h || 0,
        marketCap: marketCap,
        holders: holders,
      },
    };

    console.log('API: Token data fetched successfully');
    return NextResponse.json(response);
  } catch (error) {
    console.error('API: Error fetching token data:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch token data',
      },
      { status: 500 }
    );
  }
}

