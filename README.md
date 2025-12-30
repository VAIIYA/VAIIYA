# VAIIYA 🎰

A **lightning-fast, simple lottery dApp** built on Solana. Buy tickets, watch the pot grow, and win big!

## ✨ Features

- **🚀 Ultra-Fast**: Client-side timer with localStorage persistence
- **💨 Instant Updates**: Dynamic ticket buying with real-time UI refresh
- **🎯 Simple**: One-page application with minimal dependencies
- **💾 GitHub Gist Storage**: Lottery data stored in GitHub Gists (completely free)
- **⚡ Hybrid Approach**: localStorage for speed + GitHub Gist for persistence
- **🎨 Beautiful UI**: Modern gradient design with confetti animations

## 🏗️ Architecture

### Simple & Fast
- **Client-Side Timer**: No server dependencies, runs in browser
- **localStorage**: Fast ticket buying and round management
- **GitHub Gist**: Persistent lottery data storage (completely free)
- **Real-Time Updates**: Instant UI refresh after ticket purchases
- **Minimal Dependencies**: Only essential packages for maximum speed

### Removed Complexity
- ❌ No Supabase database (legacy removed)
- ❌ No complex smart contract operations
- ❌ No heavy server-side transactions
- ❌ No unnecessary API routes
- ✅ **Kept**: GitHub Gist for lottery data persistence
- ✅ **Kept**: Simple API for GitHub Gist operations

## 🚀 Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure GitHub Gist Storage (Optional)**:
   The app works out of the box with fallback logic, but for full functionality:
   
   Create a `.env.local` file:
   ```bash
   GITHUB_TOKEN=your_github_token_here
   LOTTERY_GIST_ID=
   ```
   
   Get a GitHub token at: https://github.com/settings/tokens (select 'gist' scope)

3. **Run development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser**:
   Navigate to `http://localhost:3000`

## 🔧 Fallback Mode

If GitHub Gist storage is not configured, the app automatically falls back to:
- ✅ **Timezone-based lottery** with daily draws at midnight Amsterdam time
- ✅ **Consistent round management** that doesn't reset on page refresh
- ✅ **Local state management** for tickets and pot
- ✅ **Full lottery functionality** without external storage
- ✅ **Automatic round management** with fallback logic

## 🌍 Timezone-Based Lottery

The lottery now uses Amsterdam timezone for consistent daily draws:
- **Daily Draws**: Every day at midnight Amsterdam time
- **Consistent Rounds**: Round numbers and IDs are based on Amsterdam dates
- **No Reset on Refresh**: Timer continues from the same draw time regardless of page refresh
- **Global Access**: Works consistently for users worldwide

## 🎮 How It Works

1. **Connect Wallet**: Connect your Solana wallet
2. **Buy Tickets**: Click "Buy Ticket" to purchase for 1 USDC
3. **Watch Timer**: See the 24-hour countdown
4. **Win Big**: Automatic winner selection when timer ends

## 📁 Project Structure

```
app/
├── components/          # UI components
│   ├── WalletConnectButton.tsx
│   ├── NetworkIndicator.tsx
│   └── WalletNotification.tsx
├── lib/
│   ├── simple-timer.ts           # Fast client-side timer
│   └── github-gist-storage.ts    # GitHub Gist storage for lottery data
├── api/
│   └── lottery/
│       └── route.ts              # Simple API for GitHub Gist operations
├── hooks/
│   └── useWalletConnection.ts
├── page.tsx            # Main lottery page
└── layout.tsx          # App layout
```

## 🔧 Core Components

### SimpleTimerService (Client-Side)
- **getCurrentRound()**: Get active lottery round
- **buyTicket()**: Purchase ticket with instant UI update
- **getTimeRemaining()**: Real-time countdown
- **checkAndEndRound()**: Automatic round ending

### GitHubGistStorageService (Server-Side)
- **getData()**: Fetch lottery data from GitHub Gist
- **addTicket()**: Save ticket to GitHub Gist
- **updateRound()**: Update round data in GitHub Gist
- **getUserTickets()**: Get user tickets from GitHub Gist

### Features
- **24-Hour Rounds**: Daily lottery with automatic reset
- **Instant Feedback**: Confetti animations and real-time updates
- **Hybrid Storage**: localStorage for speed + GitHub Gist for persistence
- **Winner Selection**: Random winner selection when round ends

## 🎯 Performance

- **⚡ Lightning Fast**: Client-side timer with minimal server calls
- **💾 Lightweight**: Minimal bundle size with essential dependencies only
- **🔄 Real-Time**: Instant UI updates for ticket buying
- **💾 Persistent**: Lottery data survives page refreshes via GitHub Gist storage
- **📱 Responsive**: Works on all devices

## 🛠️ Development

The app is now **lean, mean, and speedy**:

- **Removed**: Supabase legacy code and complex smart contract operations
- **Simplified**: Hybrid approach - localStorage for speed + GitHub Gist for persistence
- **Optimized**: Minimal dependencies and fast loading
- **Enhanced**: Dynamic ticket buying with instant refresh
- **Preserved**: GitHub Gist storage for lottery data persistence

## 🚀 Deployment

Deploy to Vercel, Netlify, or any static hosting:

```bash
npm run build
npm start
```

## 📝 License

MIT License - Feel free to use and modify!

---

**VAIIYA** - The fastest lottery on Solana! 🍀
# GitHub Gist Storage Active
