'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Zap, 
  TrendingUp, 
  Wallet, 
  Coins, 
  Clock, 
  DollarSign,
  Percent,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  ChevronDown
} from 'lucide-react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletConnectButton } from '../components/WalletConnectButton';
import { NetworkIndicator } from '../components/NetworkIndicator';
import { StakingService, StakingPool, PoolInfo, UserStakeData, StakeResult, WithdrawResult } from '../lib/staking';

const availableTokens = [
  { symbol: 'SOL', name: 'Solana', logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111112/logo.png' },
  { symbol: 'mSOL', name: 'Marinade SOL', logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So/logo.png' },
  { symbol: 'stSOL', name: 'Lido Staked SOL', logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj/logo.png' },
  { symbol: 'USDC', name: 'USD Coin', logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png' }
];

export default function AutoStakePage() {
  const { connected, publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();
  
  const [stakingService] = useState(() => new StakingService(connection));
  const [selectedToken, setSelectedToken] = useState(availableTokens[0]);
  const [amount, setAmount] = useState('');
  const [stakingPools, setStakingPools] = useState<StakingPool[]>([]);
  const [bestPoolInfo, setBestPoolInfo] = useState<PoolInfo | null>(null);
  const [userStakeData, setUserStakeData] = useState<UserStakeData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showTokenSelector, setShowTokenSelector] = useState(false);

  // Load staking data
  const loadStakingData = useCallback(async () => {
    try {
      // Get the highest APY pool
      const poolInfo = await stakingService.getHighestAPYPool();
      setBestPoolInfo(poolInfo);
      
      // Get user stake info if wallet is connected
      if (publicKey) {
        const stakeData = await stakingService.getUserStakeInfo(publicKey);
        setUserStakeData(stakeData);
      }
    } catch (error) {
      console.error('Error loading staking data:', error);
    }
  }, [stakingService, publicKey]);

  // Load data on mount and wallet connect
  useEffect(() => {
    if (connected) {
      loadStakingData();
    }
  }, [connected, loadStakingData]);

  // Handle stake
  const handleStake = async () => {
    if (!connected || !publicKey || !amount || parseFloat(amount) <= 0) {
      setError('Please connect wallet and enter a valid amount');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result: StakeResult = await stakingService.stakeSOL(
        parseFloat(amount),
        publicKey
      );

      if (result.success) {
        setAmount('');
        setSuccess(`Successfully staked ${amount} SOL to ${result.pool?.name}`);
        // Reload user stake data
        await loadStakingData();
      } else {
        setError(result.error || 'Staking failed');
      }
    } catch (error) {
      setError('Staking failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle withdrawal
  const handleWithdraw = async () => {
    if (!connected || !publicKey) {
      setError('Please connect wallet');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result: WithdrawResult = await stakingService.withdrawSOL(publicKey);

      if (result.success) {
        setSuccess(`Successfully withdrew ${result.netAmount?.toFixed(4)} SOL (${result.serviceFee?.toFixed(4)} SOL service fee)`);
        // Reload user stake data
        await loadStakingData();
      } else {
        setError(result.error || 'Withdrawal failed');
      }
    } catch (error) {
      setError('Withdrawal failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Check if user is not connected
  if (!connected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 text-white">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto">
              <Wallet className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold">Connect Your Wallet</h1>
            <p className="text-gray-400 max-w-md">
              You need to connect your wallet to use the Auto-Stake Optimizer. Connect your Solana wallet to get started.
            </p>
            <WalletConnectButton />
            <Link href="/" className="inline-flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 text-white">
      {/* Header */}
      <header className="px-4 py-6 md:px-8">
        <nav className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2 md:space-x-3">
            <Link href="/" className="flex items-center space-x-2 md:space-x-3 hover:opacity-80 transition-opacity">
              <Zap className="w-6 h-6 md:w-8 md:h-8 text-neon-cyan" />
              <h1 className="text-lg md:text-2xl font-orbitron font-bold bg-gradient-to-r from-neon-pink to-neon-blue bg-clip-text text-transparent">
                MemeHaus
              </h1>
            </Link>
            <div className="hidden sm:block">
              <NetworkIndicator />
            </div>
          </div>
          
          {/* Navigation Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-gray-300 hover:text-white transition-colors font-inter font-medium">
              Home
            </Link>
            <Link href="/swap" className="text-gray-300 hover:text-white transition-colors font-inter font-medium">
              Swap
            </Link>
            <Link href="/create" className="text-gray-300 hover:text-white transition-colors font-inter font-medium">
              Create
            </Link>
            <Link href="/liquidity" className="text-gray-300 hover:text-white transition-colors font-inter font-medium">
              Liquidity
            </Link>
            <Link href="/autostake" className="text-gray-300 hover:text-white transition-colors font-inter font-medium">
              Auto-Stake
            </Link>
            <Link href="/profile" className="text-gray-300 hover:text-white transition-colors font-inter font-medium">
              Profile
            </Link>
            <a 
              href="https://luckyhaus.vercel.app/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-white transition-colors font-inter font-medium"
            >
              LuckyHaus
            </a>
            <a 
              href="https://x.com/i/communities/1955936302764855712" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-white transition-colors font-inter font-medium flex items-center space-x-1"
            >
              <span>Community</span>
              <span>→</span>
            </a>
          </div>
          
          <WalletConnectButton />
        </nav>
      </header>

      {/* Main Content */}
      <main className="px-4 md:px-8 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-orbitron font-bold mb-4">Auto-Stake Optimizer</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Deposit SOL or SPL tokens and automatically route them to the highest-yield staking pools on Solana.
            </p>
            <div className="mt-4 px-4 py-2 bg-neon-green/20 border border-neon-green/30 rounded-full inline-block">
              <span className="text-neon-green font-inter font-semibold text-sm">
                Coming Soon
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 opacity-50">
            {/* Left Column - Deposit/Withdraw */}
            <div className="lg:col-span-2 space-y-6">
              {/* Staking Card */}
              <div className="bg-black/30 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
                                 <h3 className="text-xl font-orbitron font-bold mb-6 flex items-center space-x-2">
                   <TrendingUp className="w-5 h-5 text-gray-500" />
                   <span className="text-gray-500">Stake SOL</span>
                 </h3>

                                 {/* Best Pool Info */}
                 {bestPoolInfo && (
                   <div className="mb-6 p-4 bg-gradient-to-r from-neon-cyan/10 to-neon-blue/10 border border-neon-cyan/30 rounded-lg">
                     <div className="flex items-center justify-between">
                       <div>
                         <div className="font-semibold text-neon-cyan">Best APY Pool</div>
                         <div className="text-sm text-gray-400">{bestPoolInfo.pool.name}</div>
                       </div>
                       <div className="text-right">
                         <div className="text-2xl font-bold text-neon-cyan">{bestPoolInfo.currentAPY.toFixed(2)}%</div>
                         <div className="text-sm text-gray-400">Current APY</div>
                       </div>
                     </div>
                   </div>
                 )}

                                 {/* Amount Input */}
                 <div className="mb-6">
                   <label className="block text-sm font-inter font-semibold mb-2">SOL Amount</label>
                   <input
                     type="number"
                     placeholder="0.0"
                     value={amount}
                     onChange={(e) => setAmount(e.target.value)}
                     className="w-full px-4 py-3 bg-black/30 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-neon-cyan focus:outline-none transition-colors"
                   />
                 </div>

                                 {/* Action Buttons */}
                 <div className="flex space-x-4">
                   <button
                     onClick={handleStake}
                     disabled={loading || !amount || parseFloat(amount) <= 0 || (userStakeData?.stakedAmount || 0) > 0}
                     className="flex-1 px-6 py-3 bg-gradient-to-r from-neon-blue to-neon-cyan rounded-lg font-inter font-semibold hover:shadow-glow-blue transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                   >
                     {loading ? 'Processing...' : (userStakeData?.stakedAmount || 0) > 0 ? 'Already Staked' : 'Stake SOL'}
                   </button>
                   <button
                     onClick={handleWithdraw}
                     disabled={loading || !userStakeData?.stakedAmount || (userStakeData?.stakedAmount || 0) === 0}
                     className="flex-1 px-6 py-3 border-2 border-neon-pink rounded-lg font-inter font-semibold hover:bg-neon-pink hover:shadow-glow-pink transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                   >
                     {loading ? 'Processing...' : 'Withdraw All'}
                   </button>
                 </div>

                {/* Status Messages */}
                {error && (
                  <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 text-red-400" />
                    <span className="text-red-400">{error}</span>
                  </div>
                )}
                {success && (
                  <div className="mt-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-green-400">{success}</span>
                  </div>
                )}
              </div>

                             {/* Available Pools */}
               <div className="bg-black/30 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
                 <h3 className="text-xl font-orbitron font-bold mb-6 flex items-center space-x-2">
                   <Coins className="w-5 h-5 text-gray-500" />
                   <span className="text-gray-500">Available Pools</span>
                 </h3>
                 <div className="space-y-4">
                   {bestPoolInfo && (
                     <div className="flex items-center justify-between p-4 bg-gradient-to-r from-neon-cyan/10 to-neon-blue/10 rounded-lg border border-neon-cyan/30">
                       <div className="flex items-center space-x-3">
                         <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                           {bestPoolInfo.pool.tokenSymbol[0]}
                         </div>
                         <div>
                           <div className="font-semibold">{bestPoolInfo.pool.name}</div>
                           <div className="text-sm text-gray-400">{bestPoolInfo.pool.tokenSymbol}</div>
                         </div>
                       </div>
                       <div className="text-right">
                         <div className="text-lg font-bold text-neon-cyan">{bestPoolInfo.currentAPY.toFixed(2)}%</div>
                         <div className="text-sm text-gray-400">Best APY</div>
                       </div>
                     </div>
                   )}
                   <div className="text-center text-gray-400 text-sm">
                     Auto-routed to highest yield pool
                   </div>
                 </div>
               </div>
            </div>

                         {/* Right Column - Stats */}
             <div className="space-y-6">
               {/* Current Stats */}
               <div className="bg-black/30 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
                 <h3 className="text-xl font-orbitron font-bold mb-6 flex items-center space-x-2">
                   <DollarSign className="w-5 h-5 text-neon-purple" />
                   <span>Your Stake</span>
                 </h3>
                 <div className="space-y-4">
                   <div className="flex justify-between">
                     <span className="text-gray-400">Staked Amount</span>
                     <span className="font-semibold">{userStakeData?.stakedAmount.toFixed(4) || '0.0000'} SOL</span>
                   </div>
                   <div className="flex justify-between">
                     <span className="text-gray-400">Rewards Earned</span>
                     <span className="font-semibold text-green-400">{userStakeData?.rewardsEarned.toFixed(4) || '0.0000'} SOL</span>
                   </div>
                   <div className="flex justify-between">
                     <span className="text-gray-400">Service Fee (0.01%)</span>
                     <span className="font-semibold text-red-400">-{userStakeData?.serviceFeeEstimate.toFixed(4) || '0.0000'} SOL</span>
                   </div>
                   <div className="border-t border-gray-700 pt-4">
                     <div className="flex justify-between">
                       <span className="text-gray-400 font-semibold">Net Rewards</span>
                       <span className="font-bold text-neon-cyan">{userStakeData?.netRewards.toFixed(4) || '0.0000'} SOL</span>
                     </div>
                   </div>
                   <div className="border-t border-gray-700 pt-4">
                     <div className="flex justify-between">
                       <span className="text-gray-400 font-semibold">Total Value</span>
                       <span className="font-bold text-neon-green">{userStakeData?.totalValue.toFixed(4) || '0.0000'} SOL</span>
                     </div>
                   </div>
                 </div>
               </div>

               {/* Current Pool */}
               {userStakeData?.currentPool && (
                 <div className="bg-black/30 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
                   <h3 className="text-xl font-orbitron font-bold mb-6 flex items-center space-x-2">
                     <TrendingUp className="w-5 h-5 text-neon-green" />
                     <span>Current Pool</span>
                   </h3>
                   <div className="text-center">
                     <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                       {userStakeData.currentPool.tokenSymbol[0]}
                     </div>
                     <div className="font-bold text-lg">{userStakeData.currentPool.name}</div>
                     <div className="text-gray-400 mb-2">{userStakeData.currentPool.tokenSymbol}</div>
                     <div className="text-2xl font-bold text-neon-cyan">{userStakeData.apy.toFixed(2)}%</div>
                     <div className="text-sm text-gray-400">Current APY</div>
                   </div>
                 </div>
               )}

               {/* Staking Info */}
               {userStakeData?.stakingStartTime && (
                 <div className="bg-black/30 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
                   <h3 className="text-xl font-orbitron font-bold mb-6 flex items-center space-x-2">
                     <Clock className="w-5 h-5 text-neon-blue" />
                     <span>Staking Info</span>
                   </h3>
                   <div className="space-y-3">
                     <div className="flex justify-between">
                       <span className="text-gray-400">Started</span>
                       <span className="text-sm">{new Date(userStakeData.stakingStartTime).toLocaleDateString()}</span>
                     </div>
                     <div className="flex justify-between">
                       <span className="text-gray-400">Can Withdraw</span>
                       <span className={`text-sm ${userStakeData.canWithdraw ? 'text-green-400' : 'text-red-400'}`}>
                         {userStakeData.canWithdraw ? 'Yes' : 'No'}
                       </span>
                     </div>
                     {userStakeData.lockupEndTime && (
                       <div className="flex justify-between">
                         <span className="text-gray-400">Lockup Ends</span>
                         <span className="text-sm">{new Date(userStakeData.lockupEndTime).toLocaleDateString()}</span>
                       </div>
                     )}
                   </div>
                 </div>
               )}
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}
