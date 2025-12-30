'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Zap, Ticket, Clock } from 'lucide-react';
import { WalletConnectButton } from '@/app/components/shared/WalletConnectButton';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { SolanaTransactionService } from './lib/solana-transactions';
import { LOTTERY_CONFIG, getTicketPrice, getCurrencySymbol, getHouseCommission, calculateCommission, calculatePotContribution, getSolFee } from './lib/lottery-config';
import { heliusApi } from './lib/helius-api';
import { TransactionHistory } from './components/TransactionHistory';
import { RecentWinners } from './components/RecentWinners';
import { Navigation } from './components/Navigation';
import confetti from 'canvas-confetti';

// VERSION: 3.1.1 - REAL SOLANA TRANSACTIONS WITH WALLET SIGNING + GITHUB GIST STORAGE
export default function SimpleLottery() {
  const { connected, publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();
  const [timeLeft, setTimeLeft] = useState('24:00:00');
  const [tickets, setTickets] = useState<string[]>([]);
  const [userTickets, setUserTickets] = useState(0);
  const [pot, setPot] = useState(0);
  const [round, setRound] = useState(1);
  const [buying, setBuying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentRoundId, setCurrentRoundId] = useState<string | null>(null);
  const [amsterdamTime, setAmsterdamTime] = useState<string>('');
  const [ticketQuantity, setTicketQuantity] = useState(1);

  const walletAddress = publicKey?.toString();

  // Initialize lottery data from GitHub Gist storage
  useEffect(() => {
    console.log('🎰 LuckyHaus v3.1.1 - Real Solana Transactions + GitHub Gist Storage - Loading...');

    const initializeLottery = async () => {
      try {
        setLoading(true);

        // Get current round
        const roundResponse = await fetch('/luckyhaus/api/lottery?action=current-round');
        const roundData = await roundResponse.json();

        if (roundData.success && roundData.round) {
          const round = roundData.round;
          setCurrentRoundId(round.id);
          setRound(round.roundNumber);
          setPot(round.potSize);
          setTickets(Array(round.totalTickets).fill('')); // Placeholder for ticket count

          // Calculate time remaining
          const now = Date.now();
          const remaining = round.endTime - now;

          if (remaining <= 0) {
            setTimeLeft('DRAW COMPLETE');
            // Round should be ended
            await endRound();
          } else {
            const hours = Math.floor(remaining / (1000 * 60 * 60));
            const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
            setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
          }
        } else {
          // Fallback: Create a default round if no data is available
          console.log('No round data available, creating default round');
          const defaultRound = {
            id: 'round-1',
            roundNumber: 1,
            potSize: 0,
            totalTickets: 0,
            endTime: Date.now() + (24 * 60 * 60 * 1000) // 24 hours from now
          };
          setCurrentRoundId(defaultRound.id);
          setRound(defaultRound.roundNumber);
          setPot(defaultRound.potSize);
          setTickets([]);
          setTimeLeft('24:00:00');
        }


        setLoading(false);
      } catch (error) {
        console.error('Error initializing lottery:', error);
        // Set default values on error
        setCurrentRoundId('round-1');
        setRound(1);
        setPot(0);
        setTickets([]);
        setTimeLeft('24:00:00');
        setLoading(false);
      }
    };

    initializeLottery();
  }, []); // Remove dependencies to prevent re-renders

  // Separate effect for user tickets when wallet changes
  useEffect(() => {
    const fetchUserTickets = async () => {
      if (walletAddress && currentRoundId) {
        try {
          const ticketsResponse = await fetch(`/luckyhaus/api/lottery?action=user-tickets&wallet=${walletAddress}&roundId=${currentRoundId}`);
          const ticketsData = await ticketsResponse.json();

          if (ticketsData.success) {
            const actualCount = ticketsData.tickets.length;
            setUserTickets(actualCount);
            console.log('📊 User tickets fetched from server:', actualCount);
          }
        } catch (error) {
          console.error('Error fetching user tickets:', error);
        }
      } else {
        setUserTickets(0);
      }
    };

    fetchUserTickets();

    // Refresh user tickets every 10 seconds to keep count accurate
    const interval = setInterval(fetchUserTickets, 10000);
    return () => clearInterval(interval);
  }, [walletAddress, currentRoundId]);

  // Timer effect - use a simple countdown that doesn't fetch from API every second
  useEffect(() => {
    let endTime: number | null = null;
    let hasEnded = false; // Prevent multiple end-round calls

    // Get the initial end time once
    const getInitialEndTime = async () => {
      try {
        const roundResponse = await fetch('/luckyhaus/api/lottery?action=current-round');
        const roundData = await roundResponse.json();
        if (roundData.success && roundData.round) {
          endTime = roundData.round.endTime;
        }
      } catch (error) {
        console.error('Error getting initial end time:', error);
      }
    };

    getInitialEndTime();

    const updateTimer = () => {
      // Update Amsterdam time display
      const now = new Date();
      const amsterdamTimeString = now.toLocaleString('en-US', {
        timeZone: 'Europe/Amsterdam',
        hour12: false,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      setAmsterdamTime(amsterdamTimeString);

      if (endTime) {
        const remaining = endTime - now.getTime();

        if (remaining <= 0 && !hasEnded) {
          hasEnded = true; // Prevent multiple calls
          setTimeLeft('DRAW COMPLETE');
          // Round should be ended - call endRound and let it handle the transition
          endRound();
        } else if (remaining > 0) {
          const hours = Math.floor(remaining / (1000 * 60 * 60));
          const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
          setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
        }
      }
    };

    const timerInterval = setInterval(updateTimer, 1000);
    return () => clearInterval(timerInterval);
  }, [currentRoundId]);

  // End round function
  const endRound = async () => {
    console.log('🎯 Automatic round ending triggered');

    if (!currentRoundId) {
      console.error('❌ No current round ID available');
      return;
    }

    console.log('🎯 Ending round:', currentRoundId, 'Pot:', pot);

    try {
      const response = await fetch('/luckyhaus/api/lottery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'end-round',
          roundId: currentRoundId,
          totalPot: pot
        })
      });

      const data = await response.json();
      console.log('🎯 End round response:', data);

      if (data.success) {
        console.log('🎯 End round success response:', data);

        // Show winner notification if there was a winner
        if (data.winner) {
          console.log('🏆 Winner data:', data.winner);
          alert(`🎉 ROUND ${round} WINNER! 🎉\n\n🏆 Winner: ${data.winner.walletAddress.slice(0, 8)}...${data.winner.walletAddress.slice(-8)}\n💰 Prize: ${data.winner.prizeAmount} USDC\n\n🎰 New round started!`);
        } else {
          console.log('⚠️ No winner found in response');
          alert(`🎰 Round ${round} ended with no tickets sold.\n\n🎰 New round started!`);
        }

        // Update state with new round data
        if (data.newRound) {
          setCurrentRoundId(data.newRound.id);
          setRound(data.newRound.roundNumber);
          setPot(0);
          setTickets([]);
          setUserTickets(0);

          // Start countdown for new round
          const newEndTime = data.newRound.endTime;
          const now = new Date().getTime();
          const remaining = newEndTime - now;

          if (remaining > 0) {
            const hours = Math.floor(remaining / (1000 * 60 * 60));
            const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
            setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
          } else {
            setTimeLeft('DRAW COMPLETE');
          }
        }
      }
    } catch (error) {
      console.error('Error ending round:', error);
    }
  };

  // Buy ticket with real Solana transactions
  const buyTicket = useCallback(async () => {
    if (!connected || !publicKey || !signTransaction || !currentRoundId) {
      alert('Please connect your wallet to buy tickets.');
      return;
    }

    try {
      setBuying(true);
      console.log(`Buying ${ticketQuantity} tickets for wallet: ${publicKey.toString()}`);

      // Initialize transaction service
      const transactionService = new SolanaTransactionService(connection);
      const ticketPrice = getTicketPrice();
      const currency = getCurrencySymbol();
      const totalAmount = ticketPrice * ticketQuantity;

      // Check balance first
      let balance: number;
      if (LOTTERY_CONFIG.CURRENCY === 'USDC') {
        console.log('🔍 Checking USDC balance...');
        balance = await transactionService.checkUsdcBalance(publicKey);
        console.log(`💰 USDC Balance: ${balance}`);
        console.log(`🎫 Total Cost: ${totalAmount} ${currency}`);
        console.log(`✅ Sufficient balance: ${balance >= totalAmount}`);
      } else {
        balance = await transactionService.checkSolBalance(publicKey);
        console.log(`SOL Balance: ${balance}`);
      }

      if (balance < totalAmount) {
        alert(`Insufficient ${currency} balance. You have ${balance.toFixed(4)} ${currency}, but need ${totalAmount} ${currency} for ${ticketQuantity} ticket${ticketQuantity > 1 ? 's' : ''}.`);
        return;
      }

      // Create and execute Solana transaction
      let result;
      if (LOTTERY_CONFIG.CURRENCY === 'USDC') {
        // For USDC tickets, we need to send both USDC and SOL fee
        result = await transactionService.createTicketPurchaseTransaction(
          publicKey,
          new PublicKey(LOTTERY_CONFIG.LOTTERY_HOUSE_WALLET),
          totalAmount,
          signTransaction,
          getSolFee() // Include SOL fee for server wallet funding
        );
      } else {
        result = await transactionService.createSolTransferTransaction(
          publicKey,
          new PublicKey(LOTTERY_CONFIG.LOTTERY_HOUSE_WALLET),
          totalAmount,
          signTransaction
        );
      }

      if (!result.success) {
        throw new Error(result.error || 'Transaction failed');
      }

      console.log(`${ticketQuantity} tickets purchased successfully. Transaction: ${result.signature}`);

      // Verify transaction with Helius API (only if signature exists)
      let verification = null;
      if (result.signature) {
        console.log('🔍 Verifying transaction with Helius API...');
        verification = await heliusApi.verifyTicketPurchase(result.signature, totalAmount);

        if (!verification.isValid) {
          console.warn('⚠️ Transaction verification failed:', verification.error);
          // Continue anyway - the transaction was successful on-chain
        } else {
          console.log('✅ Transaction verified successfully with Helius API');
        }
      } else {
        console.warn('⚠️ No transaction signature available for verification');
      }

      // Now record the ticket in GitHub Gist storage via API
      const response = await fetch('/luckyhaus/api/lottery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'buy-ticket',
          roundId: currentRoundId,
          walletAddress: publicKey.toString(),
          ticketNumber: pot + 1, // Next ticket number
          amount: totalAmount.toString(),
          quantity: ticketQuantity,
          transactionSignature: result.signature
        })
      });

      const data = await response.json();

      if (data.success) {
        // Update local state
        setPot(prev => prev + totalAmount);
        setTickets(prev => [...prev, ...Array(ticketQuantity).fill('ticket')]); // Add tickets to the array

        console.log(`${ticketQuantity} tickets recorded in storage successfully. Total pot:`, pot + totalAmount);

        // Refresh current round data to get accurate ticket count
        try {
          const roundResponse = await fetch('/luckyhaus/api/lottery?action=current-round');
          const roundData = await roundResponse.json();
          if (roundData.success && roundData.round) {
            setTickets(Array(roundData.round.totalTickets).fill('ticket'));
            setPot(roundData.round.potSize);
            console.log('📊 Updated tickets count from server:', roundData.round.totalTickets);
          }
        } catch (error) {
          console.error('Error refreshing round data:', error);
        }

        // Refresh user tickets count from server to get accurate count
        if (walletAddress && currentRoundId) {
          try {
            const ticketsResponse = await fetch(`/luckyhaus/api/lottery?action=user-tickets&wallet=${walletAddress}&roundId=${currentRoundId}`);
            const ticketsData = await ticketsResponse.json();

            if (ticketsData.success) {
              const actualTicketCount = ticketsData.tickets.length;
              setUserTickets(actualTicketCount);
              console.log('📊 Updated user tickets count from server:', actualTicketCount);
            }
          } catch (error) {
            console.error('Error refreshing user tickets:', error);
            // Fallback to local increment if fetch fails
            setUserTickets(prev => prev + ticketQuantity);
          }
        } else {
          // Fallback to local increment if no wallet/roundId
          setUserTickets(prev => prev + ticketQuantity);
        }

        // Show success with confetti
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });

        // Enhanced success message with transaction details
        const transactionDetails = verification?.transaction ?
          heliusApi.formatTransactionForDisplay(verification.transaction) : null;

        // Get final user ticket count for success message
        let finalUserTicketCount = userTickets + ticketQuantity;
        if (walletAddress && currentRoundId) {
          try {
            const finalTicketsResponse = await fetch(`/luckyhaus/api/lottery?action=user-tickets&wallet=${walletAddress}&roundId=${currentRoundId}`);
            const finalTicketsData = await finalTicketsResponse.json();
            if (finalTicketsData.success) {
              finalUserTicketCount = finalTicketsData.tickets.length;
            }
          } catch (error) {
            console.error('Error fetching final ticket count:', error);
          }
        }

        const successMessage = `🎉 ${ticketQuantity} ticket${ticketQuantity > 1 ? 's' : ''} purchased successfully! 🎰\n\n💰 Cost: ${totalAmount} ${currency}\n🎫 Your tickets: ${finalUserTicketCount}\n💎 Pot: ${(pot + totalAmount).toFixed(2)} ${currency}\n\n📝 Transaction: ${result.signature?.slice(0, 8)}...\n\n${transactionDetails ? `⏰ Time: ${transactionDetails.timestamp}\n✅ Status: ${transactionDetails.status}` : ''}`;

        alert(successMessage);
      } else {
        throw new Error(data.error || 'Failed to record ticket in storage');
      }

    } catch (error) {
      console.error('Error buying ticket:', error);

      // Handle specific error types
      if (error instanceof Error) {
        if (error.message.includes('User rejected')) {
          alert('Transaction was cancelled. Please try again if you want to purchase a ticket.');
        } else if (error.message.includes('Insufficient')) {
          alert(`Insufficient balance. Please ensure you have enough ${getCurrencySymbol()} in your wallet.`);
        } else if (error.message.includes('403') || error.message.includes('Forbidden')) {
          alert('RPC endpoint access denied. Please check your API key or try again later. For testing, you can use the official Solana RPC endpoint.');
        } else {
          alert(`Error purchasing ticket: ${error.message}. Please try again.`);
        }
      } else {
        alert('Unknown error occurred. Please try again.');
      }
    } finally {
      setBuying(false);
    }
  }, [connected, publicKey, signTransaction, connection, currentRoundId, pot, userTickets, ticketQuantity]);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading LuckyHaus v3.1.1...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 text-white">
      {/* Header */}
      <header className="px-3 sm:px-4 py-4 sm:py-6">
        <nav className="max-w-6xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-shrink">
            <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-cyan-400 flex-shrink-0" />
            <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-pink-400 to-blue-400 bg-clip-text text-transparent truncate">
              LuckyHaus v3.1.1
            </h1>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
            <Navigation />
            <WalletConnectButton />
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="px-3 sm:px-4 py-8 sm:py-16">
        <div className="max-w-4xl mx-auto text-center">
          {/* Title */}
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4 sm:mb-6 bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
            Daily Lottery 🎰
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-300 mb-8 sm:mb-12 px-2">
            The Haus is open. Buy your {getCurrencySymbol()} tickets. When the round ends, one wallet wins the pot
          </p>


          {/* Timer */}
          <div className="mb-8 sm:mb-12">
            <div className="inline-block p-4 sm:p-6 md:p-8 bg-gray-900/50 border border-gray-700 rounded-xl sm:rounded-2xl">
              <div className="text-xs sm:text-sm text-gray-400 mb-2">NEXT DRAW IN</div>
              <div className="text-2xl sm:text-3xl md:text-4xl font-mono font-bold text-blue-400">
                {timeLeft}
              </div>
              <div className="text-xs text-gray-500 mt-2 px-2">
                Round #{round} • Draws daily at midnight Amsterdam time
              </div>
              {amsterdamTime && (
                <div className="text-xs text-gray-400 mt-1 px-2">
                  Amsterdam time: {amsterdamTime}
                </div>
              )}
            </div>
          </div>

          {/* Ticket Quantity Selector */}
          <div className="mb-6 sm:mb-8">
            <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-4 sm:p-6 max-w-md mx-auto">
              <h3 className="text-base sm:text-lg font-semibold text-white mb-4 text-center">Select Quantity</h3>

              <div className="flex items-center justify-center space-x-3 sm:space-x-4 mb-4">
                <button
                  onClick={() => setTicketQuantity(Math.max(1, ticketQuantity - 1))}
                  disabled={ticketQuantity <= 1}
                  className="bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-2 px-3 sm:px-4 rounded-lg transition-all duration-200 text-lg"
                >
                  -
                </button>

                <div className="bg-gray-800 border border-gray-600 rounded-lg px-4 sm:px-6 py-2 sm:py-3 min-w-[60px] sm:min-w-[80px] text-center">
                  <span className="text-xl sm:text-2xl font-bold text-white">{ticketQuantity}</span>
                </div>

                <button
                  onClick={() => setTicketQuantity(ticketQuantity + 1)}
                  className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-3 sm:px-4 rounded-lg transition-all duration-200 text-lg"
                >
                  +
                </button>
              </div>

              <div className="text-center">
                <div className="text-xs sm:text-sm text-gray-400 mb-2">
                  {ticketQuantity} ticket{ticketQuantity > 1 ? 's' : ''} × {getTicketPrice()} {getCurrencySymbol()}
                </div>
                <div className="text-lg sm:text-xl font-bold text-green-400">
                  Total: {(ticketQuantity * getTicketPrice()).toFixed(2)} {getCurrencySymbol()}
                </div>
                <div className="text-xs text-gray-500 mt-1 px-2">
                  💰 {(getHouseCommission() * 100).toFixed(0)}% house commission • {calculatePotContribution(ticketQuantity * getTicketPrice()).toFixed(2)} {getCurrencySymbol()} to pot
                </div>
              </div>
            </div>
          </div>

          {/* Buy Ticket Button */}
          <div className="mb-8 sm:mb-12">
            <button
              onClick={buyTicket}
              disabled={buying || !connected}
              className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 sm:py-4 px-4 sm:px-8 rounded-xl flex items-center space-x-2 sm:space-x-3 mx-auto transition-all duration-200 transform hover:scale-105 text-sm sm:text-base"
            >
              <Ticket className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="whitespace-nowrap">{buying ? 'Signing...' : `Buy ${ticketQuantity} Ticket${ticketQuantity > 1 ? 's' : ''} (${(ticketQuantity * getTicketPrice()).toFixed(2)} ${getCurrencySymbol()})`}</span>
            </button>

            {!connected && (
              <p className="text-yellow-400 text-xs sm:text-sm mt-3 sm:mt-4 px-2">
                🔗 Please connect your wallet to buy tickets
              </p>
            )}

          </div>


          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mb-8 sm:mb-12">
            <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-4 sm:p-6">
              <div className="text-2xl sm:text-3xl font-bold text-green-400 mb-2">
                {pot.toFixed(2)} {getCurrencySymbol()}
              </div>
              <div className="text-sm sm:text-base text-gray-400">Current Pot</div>
            </div>

            <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-4 sm:p-6">
              <div className="text-2xl sm:text-3xl font-bold text-purple-400 mb-2">
                {tickets.length}
              </div>
              <div className="text-sm sm:text-base text-gray-400">Tickets Sold</div>
            </div>

            <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-4 sm:p-6">
              <div className="text-2xl sm:text-3xl font-bold text-pink-400 mb-2">
                {userTickets}
              </div>
              <div className="text-sm sm:text-base text-gray-400">Your Tickets</div>
            </div>
          </div>


          {/* Transaction History - Always visible for transparency */}
          <div className="mb-8 sm:mb-12">
            <TransactionHistory />
          </div>

          {/* Recent Winners Section */}
          <div className="mb-8 sm:mb-12">
            <RecentWinners />
          </div>
        </div>
      </main>
    </div>
  );
}
