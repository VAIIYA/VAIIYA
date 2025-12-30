'use client';

import React, { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

export const WalletNotification: React.FC = () => {
  const { connected, publicKey } = useWallet();
  const [showNotification, setShowNotification] = useState(false);
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'success' | 'error' | 'info'>('info');

  useEffect(() => {
    if (connected && publicKey) {
      setMessage(`Wallet connected: ${publicKey.toString().slice(0, 4)}...${publicKey.toString().slice(-4)}`);
      setType('success');
      setShowNotification(true);
      
      // Auto-hide after 3 seconds
      setTimeout(() => {
        setShowNotification(false);
      }, 3000);
    }
  }, [connected, publicKey]);

  if (!showNotification) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className={`flex items-center space-x-3 p-4 rounded-lg border backdrop-blur-sm transition-all duration-300 ${
        type === 'success' 
          ? 'bg-green-500/20 border-green-500/30 text-green-400' 
          : type === 'error'
          ? 'bg-red-500/20 border-red-500/30 text-red-400'
          : 'bg-blue-500/20 border-blue-500/30 text-blue-400'
      }`}>
        {type === 'success' && <CheckCircle className="w-5 h-5" />}
        {type === 'error' && <AlertCircle className="w-5 h-5" />}
        <span className="font-inter text-sm">{message}</span>
        <button 
          onClick={() => setShowNotification(false)}
          className="ml-2 hover:opacity-70 transition-opacity"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}; 