# VAIIYA Super App 💎

**The Ultimate Solana Super App Experience**

VAIIYA is a unified "Super App" built on Solana, combining premium entertainment and decentralized finance into a single, seamless experience. It hosts multiple sub-applications under one roof, sharing a unified design system, authentication state, and "Leading Database" infrastructure.

---

## 🚀 The Ecosystem

### 🎰 LuckyHaus
**The Daily Solana Lottery**
*   **Provably Fair**: Daily draws centered around Amsterdam midnight time.
*   **Instant Play**: Fast ticket purchasing with real-time UI updates.
*   **Secure**: Helius API transaction verification ensures every ticket is valid.
*   **Transparency**: Full transaction history and winner tracking.

### 🐸 MemeHaus
**The Premier Meme Launchpad** (Inspired by pump.fun & moonshot)
*   **Fair Launch**: Bonding curve mechanism for instant liquidity.
*   **Creator Friendly**: Launch a token in seconds with metadata and image uploads.
*   **Community First**: 1% transaction fees, with rewards for creators.
*   **Robust Data**: Powered by a unified MongoDB backend for reliable token tracking.

---

## 🏗️ Architecture

VAIIYA uses a modern **Next.js 14** architecture with **Route Groups** to manage distinct applications while sharing core resources.

### 📂 Project Structure
```bash
app/
├── (apps)/
│   ├── lucky/          # LuckyHaus Application
│   │   ├── api/        # Lottery-specific API routes
│   │   └── page.tsx    # Lottery frontend
│   │
│   └── meme/           # MemeHaus Application
│       ├── api/        # Token launchpad API routes
│       └── page.tsx    # MemeHaus frontend
│
├── components/         # Shared UI components (Sidebar, Wallet, etc.)
└── globals.css         # Unified Design System (Tailwind)
```

### 💾 Unified Infrastructure
*   **Leading Database**: A single, unified **MongoDB** instance (`MONGODB_URI`) powers both applications, ensuring data consistency and reliability across the platform.
*   **Unified Wallet**: Shared wallet connection state provided by `@solana/wallet-adapter-react`.
*   **Helius RPC**: High-performance RPC nodes for fast transaction indexing and verification.

---

## 🛠️ Getting Started

### Prerequisites
*   Node.js 18+
*   npm or yarn
*   A MongoDB Database (Atlas or local)
*   Helius API Key

### Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/VAIIYA/VAIIYA.git
    cd VAIIYA
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Environment Setup**:
    Create a `.env.local` file in the root directory. This is critical for the "Leading Database" connection.

    ```env
    # Core Configuration
    MONGODB_URI=mongodb+srv://...               # The Unified "Leading Database" URI
    NEXT_PUBLIC_NETWORK=mainnet-beta            # mainnet-beta, devnet, or testnet
    NEXT_PUBLIC_SOLANA_RPC_URL=https://...      # Your Helius RPC URL

    # LuckyHaus Specific
    HELIUS_API_KEY=...
    LOTTERY_HOUSE_WALLET=...

    # MemeHaus Specific
    MEMEHAUS_VAULT_SEED=...
    NEXT_PUBLIC_LIGHTHOUSE_API_KEY=...
    ```

4.  **Run the Super App**:
    ```bash
    npm run dev
    ```
    Visit `http://localhost:3000` to access the portal.

---

## 🎨 Design Philosophy
VAIIYA features a premium **Glassmorphism** aesthetic with rich gradients, smooth animations, and a unified dark mode theme. We prioritize:
*   **Visual Excellence**: "Wow" factor on first load.
*   **Speed**: Optimized rendering and state management.
*   **Responsiveness**: Flawless experience on mobile and desktop.

---

## 📜 License
MIT License. Built by the VAIIYA Team.
