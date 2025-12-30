# Lottery Data Persistence Setup

## 🎯 Problem
Every time we push code to GitHub, the purchased tickets are lost because the `LOTTERY_GIST_ID` environment variable is not set in the deployment.

## 🔧 Solution
We need to set up a persistent Gist ID that survives deployments.

## 📋 Setup Instructions

### 1. Create a GitHub Gist for Lottery Data

1. Go to [GitHub Gists](https://gist.github.com)
2. Create a new public gist with this content:

```json
{
  "currentRound": {
    "id": "round-1",
    "roundNumber": 1,
    "potSize": 0,
    "totalTickets": 0,
    "endTime": 1734567890000,
    "status": "active"
  },
  "tickets": [],
  "winners": []
}
```

3. Save the gist and copy the Gist ID from the URL (e.g., `abc123def456`)

### 2. Set Environment Variables

Add these to your deployment platform (Vercel, Netlify, etc.):

```bash
GITHUB_TOKEN=your_github_token_here
LOTTERY_GIST_ID=your_gist_id_here
```

### 3. Local Development

Create a `.env.local` file:

```bash
GITHUB_TOKEN=your_github_token_here
LOTTERY_GIST_ID=your_gist_id_here
```

## 🎯 How It Works

- **Fixed Gist ID**: The same Gist is used across all deployments
- **Persistent Data**: Tickets and winners are stored in the same Gist
- **No Data Loss**: Deployments don't affect existing data
- **Automatic Fallback**: If Gist fails, uses memory storage

## 🔍 Verification

After setup, the lottery should:
1. ✅ Keep tickets across deployments
2. ✅ Preserve winner history
3. ✅ Maintain pot size
4. ✅ Continue rounds properly

## 🚨 Troubleshooting

### "No lottery data found"
- Check `GITHUB_TOKEN` is valid
- Verify `LOTTERY_GIST_ID` is correct
- Ensure gist is public

### "Failed to fetch data"
- Check gist exists and is accessible
- Verify token has read permissions
- Check network connectivity

### "Failed to update data"
- Check token has write permissions
- Verify gist ID is correct
- Check for rate limiting
