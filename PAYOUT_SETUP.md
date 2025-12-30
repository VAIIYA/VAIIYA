# 🎰 Payout Setup Guide - Why It Didn't Work & How to Fix It

## 📖 Simple Explanation (Like You're 5)

**Why the payout didn't work:**

Imagine the lottery system is like a piggy bank with a lock. When someone wins, the system needs a **key** to open the piggy bank and give them their prize money.

Right now, the system doesn't have the key! So when the round ended:
1. ✅ The system picked a winner (HK7aLFrSXgUhaTPCJpEBDS6kgfwG9kJUBUqThFhX5PMG)
2. ✅ It recorded the winner in the database
3. ❌ It tried to send the money but couldn't because it didn't have the key
4. 😢 The winner didn't get paid automatically

**The "key" is called a "private key"** - it's like a password that lets the lottery wallet send money.

## 🔧 How to Fix It (Make It Automatic)

### Step 1: Get Your Private Key

You need the private key for the lottery house wallet: `7UhwWmw1r15fqLKcbYEDVFjqiz2G753MsyDksFAjfT3e`

**If you have the wallet in Phantom/Solflare:**
- You can export the private key from your wallet (be very careful with this!)

**If you created the wallet programmatically:**
- You should have saved the private key when you created it

### Step 2: Convert to Base64 Format

The private key needs to be in base64 format. Here's how to convert it:

**Option A: If you have it as a JSON array `[1,2,3,...]`:**
```javascript
// In Node.js or browser console
const keyArray = [1,2,3,...]; // Your actual key array
const base64Key = Buffer.from(new Uint8Array(keyArray)).toString('base64');
console.log(base64Key);
```

**Option B: If you have it as a Uint8Array or Buffer:**
```javascript
const base64Key = Buffer.from(privateKeyBytes).toString('base64');
console.log(base64Key);
```

### Step 3: Add to Vercel Environment Variables

1. Go to your Vercel project settings
2. Navigate to **Environment Variables**
3. Add a new variable:
   - **Name:** `SERVER_WALLET_PRIVATE_KEY` (or `LOTTERY_HOUSE_PRIVATE_KEY`)
   - **Value:** Your private key in one of these formats:
     - Comma-separated: `185,162,92,86,163,95,...` (64 numbers)
     - JSON array: `[185,162,92,86,163,95,...]` (64 numbers)
     - Base64 string: `base64encodedstring...`
   - **Environment:** Production, Preview, and Development (check all)
4. Click **Save**

**Note:** The code checks for `SERVER_WALLET_PRIVATE_KEY` first, then falls back to `LOTTERY_HOUSE_PRIVATE_KEY`.

### Step 4: Redeploy

After adding the environment variable, you need to redeploy:
- Vercel will automatically redeploy, OR
- Go to Deployments and click "Redeploy"

### Step 5: Test It

The next time a round ends, the payout should work automatically! 🎉

## 🔄 Retry Payout for Previous Winner

If you need to send the payout to the previous winner manually, you can use the retry endpoint:

**Option 1: Using curl**
```bash
curl -X POST https://your-app.vercel.app/api/retry-payout \
  -H "Content-Type: application/json" \
  -d '{
    "winnerAddress": "HK7aLFrSXgUhaTPCJpEBDS6kgfwG9kJUBUqThFhX5PMG",
    "roundId": "round-2024-12-20",
    "amount": 1.90
  }'
```

**Option 2: Create a simple admin page** (recommended for future use)

## ⚠️ Security Warnings

1. **NEVER commit the private key to git** - it's already in `.gitignore`
2. **NEVER share the private key** - anyone with it can drain your wallet
3. **Only store it in Vercel environment variables** - they're encrypted
4. **Use a separate wallet** - don't use your main wallet's private key

## ✅ What Happens After Setup

Once `LOTTERY_HOUSE_PRIVATE_KEY` is set:
1. ✅ Round ends automatically
2. ✅ Winner is selected
3. ✅ **Payout is sent automatically** (no manual work needed!)
4. ✅ Transaction signature is saved
5. ✅ Winner appears in Recent Winners with transaction link

## 🐛 Troubleshooting

**"Payout service not configured" error:**
- Check that `LOTTERY_HOUSE_PRIVATE_KEY` is set in Vercel
- Make sure you redeployed after adding it

**"Invalid private key format" error:**
- Make sure it's base64 encoded
- Check that it's 64 bytes when decoded

**"Transaction failed" error:**
- Check that the lottery wallet has enough USDC
- Check that the lottery wallet has enough SOL for transaction fees
- Verify the winner's wallet address is correct

## 📝 Quick Checklist

- [ ] Got the private key for wallet `7UhwWmw1r15fqLKcbYEDVFjqiz2G753MsyDksFAjfT3e`
- [ ] Converted it to base64 format
- [ ] Added `LOTTERY_HOUSE_PRIVATE_KEY` to Vercel environment variables
- [ ] Redeployed the application
- [ ] Tested with a small amount (optional)
- [ ] Sent payout to previous winner manually (if needed)

Once this is set up, all future payouts will be **100% automatic**! 🚀

