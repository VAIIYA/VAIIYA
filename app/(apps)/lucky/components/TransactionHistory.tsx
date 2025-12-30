'use client';

import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { heliusApi, ParsedTransaction } from '../lib/helius-api';
import { LOTTERY_CONFIG } from '../lib/lottery-config';

interface TransactionHistoryProps {
  className?: string;
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({ className = '' }) => {
  const { publicKey } = useWallet();
  const [transactions, setTransactions] = useState<ParsedTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadLotteryTransactions = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('🎰 Loading all lottery transactions from house wallet...');
      // Load transactions from the lottery house wallet (all lottery transactions)
      const lotteryTransactions = await heliusApi.getLotteryTransactions(LOTTERY_CONFIG.LOTTERY_HOUSE_WALLET);
      setTransactions(lotteryTransactions);
      console.log(`✅ Loaded ${lotteryTransactions.length} lottery transactions`);
    } catch (err) {
      console.error('Error loading lottery transactions:', err);
      setError('Failed to load transaction history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Load transactions on mount and whenever wallet changes
    loadLotteryTransactions();
  }, [publicKey]); // Still include publicKey to refresh when user connects

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">🎰 Lottery History</h2>
          <p className="text-sm text-gray-500 mt-1">All lottery transactions for transparency</p>
        </div>
        <button
          onClick={loadLotteryTransactions}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-500">Loading transaction history...</p>
        </div>
      )}

      {!loading && transactions.length === 0 && !error && (
        <div className="text-center py-8">
          <p className="text-gray-500">No lottery transactions found</p>
          <p className="text-sm text-gray-400 mt-2">All lottery transactions will appear here for transparency</p>
        </div>
      )}

      {!loading && transactions.length > 0 && (
        <div className="space-y-4">
          {transactions.map((transaction, index) => {
            const display = heliusApi.formatTransactionForDisplay(transaction);
            return (
              <div
                key={transaction.signature}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      transaction.success 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {display.status}
                    </span>
                    <span className="text-sm text-gray-500">{display.type}</span>
                  </div>
                  <span className="text-sm text-gray-500">{display.timestamp}</span>
                </div>
                
                <div className="mb-2">
                  <p className="text-sm text-gray-600">{display.description}</p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <span className="text-gray-500">Amount: </span>
                    <span className="font-medium text-gray-900">{display.amount}</span>
                  </div>
                  <a
                    href={`https://solscan.io/tx/${transaction.signature}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    View on Solscan →
                  </a>
                </div>

                <div className="mt-2 text-xs text-gray-400 font-mono">
                  {transaction.signature.slice(0, 8)}...{transaction.signature.slice(-8)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
