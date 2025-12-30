# GitHub Gist Storage Setup

This project now uses **GitHub Gists** for free, persistent storage instead of Vercel Blob.

## 🚀 Setup Instructions

### 1. Create a GitHub Personal Access Token

1. Go to [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Give it a name like "VAIIYA Lottery"
4. Select scopes: `gist` (to create and manage gists)
5. Click "Generate token"
6. Copy the token (you won't see it again!)

### 2. Set Environment Variables

Add these to your deployment platform (Vercel, Netlify, etc.):

```bash
GITHUB_TOKEN=your_github_token_here
LOTTERY_GIST_ID=  # Leave empty to auto-create
```

### 3. Local Development

Create a `.env.local` file:

```bash
GITHUB_TOKEN=your_github_token_here
LOTTERY_GIST_ID=
```

## 🎯 How It Works

- **Free**: GitHub Gists are completely free
- **Persistent**: Data survives deployments and restarts
- **Public**: Gists are public by default (perfect for lottery transparency)
- **API**: Uses GitHub's REST API (no rate limits for public gists)
- **Backup**: Data is automatically backed up to GitHub

## 📊 Data Structure

The lottery data is stored as JSON in a GitHub Gist:

```json
{
  "currentRound": {
    "id": "round-1",
    "roundNumber": 1,
    "potSize": 0.01,
    "totalTickets": 1,
    "endTime": 1234567890,
    "status": "active"
  },
  "tickets": [
    {
      "id": "ticket-123",
      "walletAddress": "ABC123...",
      "roundId": "round-1",
      "timestamp": 1234567890,
      "transactionSignature": "5J7K8L9M..."
    }
  ],
  "winners": [
    {
      "roundId": "round-1",
      "walletAddress": "ABC123...",
      "prizeAmount": 0.01,
      "timestamp": 1234567890
    }
  ]
}
```

## 🔧 Benefits Over Vercel Blob

- ✅ **Completely Free** (no usage limits)
- ✅ **No Rate Limits** for public gists
- ✅ **Transparent** (public gists for lottery transparency)
- ✅ **Backup** (automatically backed up to GitHub)
- ✅ **Version History** (GitHub tracks all changes)
- ✅ **No Dependencies** (just GitHub API)

## 🚨 Troubleshooting

### "Failed to create gist"
- Check your `GITHUB_TOKEN` is valid
- Ensure token has `gist` scope
- Check network connectivity

### "Failed to fetch data"
- Verify the gist exists
- Check if gist is public
- Ensure token has read permissions

### "Failed to update data"
- Check token has write permissions
- Verify gist ID is correct
- Check for network issues

## 📝 Migration from Vercel Blob

The migration is automatic! The app will:
1. Create a new GitHub Gist on first run
2. Store all lottery data in the gist
3. Continue working without any data loss

No manual migration needed! 🎉
