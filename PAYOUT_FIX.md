# Payout System Fixes

## Issues Fixed

### 1. Duplicate Winners Prevention ✅
- **Problem**: The same round could be ended multiple times, creating duplicate winner entries
- **Fix**: Added a check in `end-round` to verify if a round has already been ended before processing
- **Location**: `app/api/lottery/route.ts` (lines 195-209)

### 2. Multiple End-Round Calls Prevention ✅
- **Problem**: The timer could trigger `endRound()` multiple times when the countdown reached zero
- **Fix**: Added a `hasEnded` flag in the timer effect to prevent multiple calls
- **Location**: `app/page.tsx` (line 130)

### 3. Payout API URL Fix ✅
- **Problem**: Payout API was using environment variables that might not be set correctly in Vercel
- **Fix**: Changed to use the request URL to determine the base URL dynamically
- **Location**: `app/api/lottery/route.ts` (lines 235-240) and `app/api/retry-payout/route.ts`

### 4. Better Error Handling ✅
- **Problem**: Payout errors were not being logged or stored properly
- **Fix**: Added detailed error logging and storing `payoutError` in winner records
- **Location**: `app/api/lottery/route.ts` (lines 230-265)

### 5. Duplicate Winner Cleanup ✅
- **Problem**: If duplicates existed, retry-payout would only update one winner
- **Fix**: Updated retry-payout to update all matching winners
- **Location**: `app/api/retry-payout/route.ts` (lines 59-78)

## How to Retry Pending Payouts

### Option 1: Use the Admin Endpoint (Recommended)

**List all pending payouts:**
```bash
curl https://your-app.vercel.app/api/admin/retry-pending-payouts
```

**Retry a specific pending payout:**
```bash
curl -X POST https://your-app.vercel.app/api/admin/retry-pending-payouts \
  -H "Content-Type: application/json" \
  -d '{
    "roundId": "round-2024-12-22",
    "winnerAddress": "HK7aLFrSXgUhaTPCJpEBDS6kgfwG9kJUBUqThFhX5PMG"
  }'
```

### Option 2: Use the Retry Payout Endpoint

```bash
curl -X POST https://your-app.vercel.app/api/retry-payout \
  -H "Content-Type: application/json" \
  -d '{
    "winnerAddress": "HK7aLFrSXgUhaTPCJpEBDS6kgfwG9kJUBUqThFhX5PMG",
    "roundId": "round-2024-12-22",
    "amount": 1.04
  }'
```

## For the Current Pending Winner

To retry the payout for `HK7aLFrSXgUhaTPCJpEBDS6kgfwG9kJUBUqThFhX5PMG`:

1. **Find the round ID**: Check the winners page or database to find which round this winner belongs to
2. **Find the prize amount**: Check the prize amount for that round
3. **Call the retry endpoint** with the correct `roundId` and `amount`

Example (replace with actual values):
```bash
curl -X POST https://your-app.vercel.app/api/admin/retry-pending-payouts \
  -H "Content-Type: application/json" \
  -d '{
    "roundId": "round-2024-12-22",
    "winnerAddress": "HK7aLFrSXgUhaTPCJpEBDS6kgfwG9kJUBUqThFhX5PMG"
  }'
```

## What Happens Now

1. ✅ **Duplicate Prevention**: Rounds can only be ended once
2. ✅ **Single End-Round Call**: Timer will only trigger end-round once
3. ✅ **Correct API URLs**: Payout API will be called with the correct URL
4. ✅ **Better Error Logging**: All payout errors are logged and stored
5. ✅ **Easy Retry**: Use admin endpoints to retry failed payouts

## Next Steps

1. **Deploy the fixes** to Vercel
2. **Retry the pending payout** for `HK7aLFrSXgUhaTPCJpEBDS6kgfwG9kJUBUqThFhX5PMG` using one of the endpoints above
3. **Monitor the next round** to ensure payouts work automatically

## Troubleshooting

**If payout still fails:**
1. Check Vercel logs for detailed error messages
2. Verify `SERVER_WALLET_PRIVATE_KEY` is set correctly in Vercel
3. Verify the lottery house wallet has sufficient USDC balance
4. Check that the winner's wallet address is valid

**If you see duplicate winners:**
- The duplicate prevention will prevent new duplicates
- Old duplicates can be manually cleaned up from the database
- The retry endpoint will update all matching winners with the payout signature

