# RPC Endpoint Setup Guide

## Current Issue
The application is experiencing 403 Forbidden errors from RPC endpoints because:
1. **Ankr RPC** requires an API key (even the free tier)
2. **Official Solana RPC** has rate limits and restrictions
3. **Alchemy demo** has CORS issues

## Solution: Get a Free RPC API Key

### Option 1: Helius (Recommended - Free Tier)
1. Go to [Helius Dashboard](https://dashboard.helius.xyz/)
2. Sign up for free
3. Create a new project
4. Copy your API key
5. Set environment variable: `NEXT_PUBLIC_SOLANA_RPC_URL=https://mainnet.helius-rpc.com/?api-key=YOUR_API_KEY`

### Option 2: GenesysGo (Free Tier - No Credit Card Required)
1. Go to [GenesysGo](https://genesysgo.com/)
2. Sign up for free (no credit card required)
3. Create a Solana mainnet endpoint
4. Copy your endpoint URL
5. Set environment variable: `NEXT_PUBLIC_SOLANA_RPC_URL=YOUR_GENESYSGO_URL`

### Option 3: Alchemy (Free Tier)
1. Go to [Alchemy](https://www.alchemy.com/)
2. Sign up for free
3. Create a Solana mainnet app
4. Copy your API key
5. Set environment variable: `NEXT_PUBLIC_SOLANA_RPC_URL=https://solana-mainnet.g.alchemy.com/v2/YOUR_API_KEY`

### Option 4: Bypass Balance Check for Testing
If you want to test without RPC issues, you can bypass balance checking:
1. Set environment variable: `NEXT_PUBLIC_BYPASS_BALANCE_CHECK=true`
2. This will assume you have sufficient balance for testing
3. **Note**: This is only for testing - transactions will still require real balance

## Environment Variable Setup

Create a `.env.local` file in your project root:

```bash
# Add your RPC endpoint here (choose one)
NEXT_PUBLIC_SOLANA_RPC_URL=https://mainnet.helius-rpc.com/?api-key=YOUR_API_KEY

# OR bypass balance check for testing (temporary solution)
NEXT_PUBLIC_BYPASS_BALANCE_CHECK=true

# GitHub Gist configuration (optional)
GITHUB_TOKEN=your_github_token_here
LOTTERY_GIST_ID=your_gist_id_here
```

## Fallback Endpoints

If no custom RPC endpoint is provided, the app will use:
1. Official Solana RPC (may have rate limits)
2. Project Serum RPC (community maintained)

## Testing

After setting up your RPC endpoint:
1. Restart the development server: `npm run dev`
2. Check the browser console for RPC errors
3. Test wallet connection and balance checking
4. Try purchasing a ticket

## Production Recommendations

For production, consider:
- **Helius**: Reliable, good free tier, excellent documentation
- **QuickNode**: Enterprise-grade, good free tier
- **GenesysGo**: Fast, reliable, good free tier
- **Alchemy**: Premium service, requires paid plan for production

## Troubleshooting

### 403 Forbidden Error
- Check if your API key is correct
- Verify the RPC endpoint URL
- Ensure the endpoint supports the required methods

### CORS Error
- Use a RPC provider that supports CORS
- Helius, QuickNode, and GenesysGo all support CORS

### Rate Limit Error
- Upgrade to a paid plan for higher rate limits
- Implement request caching to reduce API calls
- Use multiple RPC endpoints with failover logic
