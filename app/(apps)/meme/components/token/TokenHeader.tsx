'use client';

import React from 'react';
import { ExternalLink, Copy, CheckCircle, Clock, User } from 'lucide-react';
import Link from 'next/link';

interface TokenHeaderProps {
  name: string;
  symbol: string;
  imageUrl?: string;
  creatorWallet: string;
  createdAt: string;
  mintAddress: string;
}

export const TokenHeader: React.FC<TokenHeaderProps> = ({
  name,
  symbol,
  imageUrl,
  creatorWallet,
  createdAt,
  mintAddress,
}) => {
  const [copied, setCopied] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const formatTimeAgo = (dateString: string) => {
    if (!dateString) {
      return 'Unknown';
    }

    const now = new Date();
    let date: Date;

    // Try to parse the date string
    // Handle different formats: ISO string, Unix timestamp (seconds or milliseconds), Date object string
    if (typeof dateString === 'string') {
      // Check if it's a Unix timestamp (numeric string)
      const numericValue = Number(dateString);
      if (!isNaN(numericValue) && numericValue > 0) {
        // If it's a reasonable timestamp (after 2000-01-01), assume it's in seconds if < 1e12, else milliseconds
        if (numericValue < 1e12) {
          date = new Date(numericValue * 1000); // Convert seconds to milliseconds
        } else {
          date = new Date(numericValue); // Already in milliseconds
        }
      } else {
        date = new Date(dateString);
      }
    } else {
      date = new Date(dateString);
    }
    
    // Validate date
    if (isNaN(date.getTime())) {
      console.warn('Invalid date string:', dateString);
      return 'Unknown';
    }

    // Check if date is unreasonably old (before 2000) or in the future
    const year2000 = new Date('2000-01-01').getTime();
    if (date.getTime() < year2000) {
      console.warn('Date is before 2000, likely invalid:', dateString, 'parsed as:', date.toISOString());
      return 'Unknown';
    }

    if (date.getTime() > now.getTime()) {
      return 'Just now';
    }

    const diffMs = now.getTime() - date.getTime();
    
    // Handle negative or zero differences
    if (diffMs <= 0) {
      return 'Just now';
    }

    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    if (diffYears > 0) {
      return `${diffYears}y ago`;
    } else if (diffMonths > 0) {
      return `${diffMonths}mo ago`;
    } else if (diffDays > 0) {
      return `${diffDays}d ago`;
    } else if (diffHours > 0) {
      return `${diffHours}h ago`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes}m ago`;
    } else {
      return 'Just now';
    }
  };

  return (
    <div className="bg-black/30 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 md:p-8 mb-6">
      <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
        {/* Token Image */}
        <div className="flex-shrink-0">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={name}
              className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-gray-700/50 object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null}
          <div
            className={`w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-neon-pink via-neon-purple to-neon-blue rounded-full flex items-center justify-center text-3xl md:text-4xl font-bold text-white border-4 border-gray-700/50 ${
              imageUrl ? 'hidden' : ''
            }`}
          >
            {symbol[0]?.toUpperCase() || '?'}
          </div>
        </div>

        {/* Token Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold font-inter mb-1">{name}</h1>
              <p className="text-xl md:text-2xl text-gray-400 font-mono">${symbol}</p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => copyToClipboard(mintAddress)}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                title="Copy mint address"
              >
                {copied ? (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                ) : (
                  <Copy className="w-5 h-5 text-gray-400" />
                )}
              </button>
              <a
                href={`https://solscan.io/token/${mintAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                title="View on Solscan"
              >
                <ExternalLink className="w-5 h-5 text-gray-400" />
              </a>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span>Created by:</span>
              <Link
                href={`/profile`}
                className="text-neon-cyan hover:text-neon-blue transition-colors font-mono"
              >
                {formatAddress(creatorWallet)}
              </Link>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>{mounted ? formatTimeAgo(createdAt) : '...'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-xs">{formatAddress(mintAddress)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

