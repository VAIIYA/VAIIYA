'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Zap, Ticket, Trophy, Clock } from 'lucide-react';
import { WalletConnectButton } from './components/WalletConnectButton';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { SolanaTransactionService, LOTTERY_HOUSE_WALLET } from './lib/solana-transactions';
import confetti from 'canvas-confetti';

// VERSION: 3.1.0 - REAL SOLANA TRANSACTIONS WITH WALLET SIGNING (SOL VERSION)
export default function SimpleLotterySol() {
  const { connected, publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();
  const [timeLeft, setTimeLeft] = useState('24:00:00');
  const [tickets, setTickets] = useState<string[]>([]);
  const [userTickets, setUserTickets] = useState(0);
  const [pot, setPot] = useState(0);
  const [round, setRound] = useState(1);
  const [winners, setWinners] = useState<Array<{address: string, amount: number, round: number}>>([]);
  const [buying, setBuying] = useState(false);

  const walletAddress = publicKey?.toString();

  // Simple 24-hour timer
  useEffect(() => {
    const startTime = localStorage.getItem('lottery_start_time');
    const savedTickets = localStorage.getItem('lottery_tickets');
    const savedWinners = localStorage.getItem('lottery_winners');
    const savedRound = localStorage.getItem('lottery_round');
    
    if (savedTickets) {
      const ticketList = JSON.parse(savedTickets);
      setTickets(ticketList);
      setPot(ticketList.length);
    }
    
    if (savedWinners) {
      setWinners(JSON.parse(savedWinners));
    }
    
    if (savedRound) {
      setRound(parseInt(savedRound));
    }

    if (!startTime) {
      const now = Date.now();
      localStorage.setItem('lottery_start_time', now.toString());
    }

    const updateTimer = () => {
      const start = parseInt(localStorage.getItem('lottery_start_time') || '0');
      const now = Date.now();
      const elapsed = now - start;
      const remaining = 24 * 60 * 60 * 1000 - elapsed; // 24 hours in ms

      if (remaining <= 0) {
        // Time's up! Draw winner
        drawWinner();
      } else {
        const hours = Math.floor(remaining / (1000 * 60 * 60));
        const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
        setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  // Update user tickets when wallet changes
  useEffect(() => {
    if (walletAddress) {
      const userTicketCount = tickets.filter(addr => addr === walletAddress).length;
      setUserTickets(userTicketCount);
    } else {
      setUserTickets(0);
    }
  }, [walletAddress, tickets]);

  const drawWinner = () => {
    if (tickets.length === 0) {
      // No tickets, start new round
      startNewRound();
      return;
    }

    // Pick random winner
    const winnerIndex = Math.floor(Math.random() * tickets.length);
    const winnerAddress = tickets[winnerIndex];
    const prizeAmount = pot;

    // Add to winners list
    const newWinner = {
      address: winnerAddress,
      amount: prizeAmount,
      round: round
    };
    
    const updatedWinners = [newWinner, ...winners.slice(0, 4)]; // Keep last 5 winners
    setWinners(updatedWinners);
    localStorage.setItem('lottery_winners', JSON.stringify(updatedWinners));

    // Show winner notification
    alert(`🎉 ROUND ${round} WINNER! 🎉\n\n🏆 Winner: ${winnerAddress.slice(0, 8)}...${winnerAddress.slice(-8)}\n💰 Prize: ${prizeAmount.toFixed(2)} SOL\n\n🎰 Starting new round...`);

    // Start new round
    startNewRound();
  };

  const startNewRound = () => {
    setTickets([]);
    setPot(0);
    setRound(prev => prev + 1);
    setTimeLeft('24:00:00');
    
    // Reset timer
    const now = Date.now();
    localStorage.setItem('lottery_start_time', now.toString());
    localStorage.setItem('lottery_tickets', JSON.stringify([]));
    localStorage.setItem('lottery_round', (round + 1).toString());
  };

  const buyTicket = useCallback(async () => {
    if (!connected || !publicKey || !signTransaction) {
      alert('Please connect your wallet to buy tickets.');
      return;
    }

    try {
      setBuying(true);
      console.log(`Buying ticket for wallet: ${publicKey.toString()}`);

      // Initialize transaction service
      const transactionService = new SolanaTransactionService(connection);

      // Check SOL balance first
      const solBalance = await transactionService.checkSolBalance(publicKey);
      console.log(`SOL Balance: ${solBalance}`);

      const ticketPriceSol = 0.01; // 0.01 SOL per ticket (adjust as needed)
      if (solBalance < ticketPriceSol) {
        alert(`Insufficient SOL balance. You have ${solBalance.toFixed(4)} SOL, but need ${ticketPriceSol} SOL for a ticket.`);
        return;
      }

      // Create and execute SOL transfer transaction
      const result = await transactionService.createSolTransferTransaction(
        publicKey,
        LOTTERY_HOUSE_WALLET,
        ticketPriceSol,
        signTransaction
      );

      if (!result.success) {
        throw new Error(result.error || 'Transaction failed');
      }

      console.log(`Ticket purchased successfully. Transaction: ${result.signature}`);

      // Add ticket to local pool (for UI display)
      const newTickets = [...tickets, publicKey.toString()];
      setTickets(newTickets);
      setPot(prev => prev + ticketPriceSol);
      
      // Save to localStorage
      localStorage.setItem('lottery_tickets', JSON.stringify(newTickets));

      // Update user ticket count
      const userTicketCount = newTickets.filter(addr => addr === publicKey.toString()).length;
      setUserTickets(userTicketCount);

      // Show success with confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      alert(`🎉 Ticket purchased successfully! 🎰\n\n💰 Cost: ${ticketPriceSol} SOL\n🎫 Your tickets: ${userTicketCount}\n💎 Pot: ${newTickets.length.toFixed(2)} SOL\n\n📝 Transaction: ${result.signature?.slice(0, 8)}...`);

    } catch (error) {
      console.error('Error buying ticket:', error);
      alert(`Error purchasing ticket: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`);
    } finally {
      setBuying(false);
    }
  }, [connected, publicKey, signTransaction, connection, tickets]);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 text-white">
      {/* Header */}
      <header className="px-4 py-6">
        <nav className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Zap className="w-8 h-8 text-cyan-400" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-400 to-blue-400 bg-clip-text text-transparent">
              LuckyHaus v3.1.0 (SOL)
            </h1>
          </div>
          <WalletConnectButton />
        </nav>
      </header>

      {/* Main Content */}
      <main className="px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          {/* Title */}
          <h2 className="text-5xl font-black mb-6 bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
            Simple Lottery 🎰
          </h2>
          <p className="text-xl text-gray-300 mb-12">
            Buy tickets with SOL, wait 24 hours, win the pot!
          </p>

          {/* Timer */}
          <div className="mb-12">
            <div className="inline-block p-8 bg-gray-900/50 border border-gray-700 rounded-2xl">
              <div className="text-sm text-gray-400 mb-2">NEXT DRAW IN</div>
              <div className="text-4xl font-mono font-bold text-blue-400">
                {timeLeft}
              </div>
              <div className="text-xs text-gray-500 mt-2">Round #{round}</div>
            </div>
          </div>

          {/* Buy Ticket Button */}
          <div className="mb-12">
            <button 
              onClick={buyTicket}
              disabled={buying || !connected}
              className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 px-8 rounded-xl flex items-center space-x-3 mx-auto transition-all duration-200 transform hover:scale-105"
            >
              <Ticket className="w-6 h-6" />
              <span>{buying ? 'Signing Transaction...' : 'Buy Ticket (0.01 SOL)'}</span>
            </button>
            
            {!connected && (
              <p className="text-yellow-400 text-sm mt-4">
                🔗 Please connect your wallet to buy tickets
              </p>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-6">
              <div className="text-3xl font-bold text-green-400 mb-2">
                {pot.toFixed(2)} SOL
              </div>
              <div className="text-gray-400">Current Pot</div>
            </div>
            
            <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-6">
              <div className="text-3xl font-bold text-purple-400 mb-2">
                {tickets.length}
              </div>
              <div className="text-gray-400">Tickets Sold</div>
            </div>
            
            <div className="bg-gray-900/50 border border-gray-700 rounded-xl p-6">
              <div className="text-3xl font-bold text-pink-400 mb-2">
                {userTickets}
              </div>
              <div className="text-gray-400">Your Tickets</div>
            </div>
          </div>

          {/* Recent Winners */}
          <div className="text-left">
            <h3 className="text-2xl font-bold mb-6 text-center">Recent Winners</h3>
            
            {winners.length > 0 ? (
              <div className="space-y-4">
                {winners.map((winner, index) => (
                  <div key={index} className="bg-gray-900/50 border border-gray-700 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Trophy className="w-5 h-5 text-yellow-500" />
                        <span className="font-mono text-green-400">
                          {formatAddress(winner.address)}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-pink-400 font-bold">
                          {winner.amount.toFixed(2)} SOL
                        </div>
                        <div className="text-xs text-gray-500">
                          Round #{winner.round}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No winners yet. Be the first!</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

