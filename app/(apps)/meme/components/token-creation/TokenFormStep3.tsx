'use client';

import React, { useCallback, useMemo } from 'react';
import { TrendingUp, DollarSign, Percent, AlertCircle, Calculator } from 'lucide-react';
import { sanitizeNumber } from '../../lib/sanitize';

interface TokenFormStep3Props {
  tokenomics: {
    totalSupply: string;
    initialPrice: string;
    communityFee: string;
  };
  onUpdate: (tokenomics: TokenFormStep3Props['tokenomics']) => void;
  validationErrors: { [key: string]: string };
  onValidationChange: (errors: { [key: string]: string }) => void;
}

export const TokenFormStep3: React.FC<TokenFormStep3Props> = ({
  tokenomics,
  onUpdate,
  validationErrors,
  onValidationChange
}) => {
  // Helper function to format numbers with commas
  const formatNumber = useCallback((num: string) => {
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }, []);

  // Validation functions
  const validateTotalSupply = useCallback((supply: string) => {
    const num = parseFloat(supply);
    if (isNaN(num) || num <= 0) return 'Total supply must be a positive number';
    if (num > 1000000000000) return 'Total supply cannot exceed 1 trillion';
    if (num < 1000) return 'Total supply must be at least 1,000';
    return null;
  }, []);

  const validateInitialPrice = useCallback((price: string) => {
    const num = parseFloat(price);
    if (isNaN(num) || num < 0) return 'Initial price must be a positive number';
    if (num > 1000) return 'Initial price cannot exceed 1000 SOL';
    if (num < 0.000001) return 'Initial price must be at least 0.000001 SOL';
    return null;
  }, []);

  // Handle input changes with validation
  const handleTotalSupplyChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/,/g, '');
    const sanitized = sanitizeNumber(rawValue, 1000000000000).toString();
    onUpdate({ ...tokenomics, totalSupply: sanitized });
    
    const error = validateTotalSupply(sanitized);
    onValidationChange({ ...validationErrors, totalSupply: error || '' });
  }, [onUpdate, onValidationChange, validationErrors, tokenomics, validateTotalSupply]);

  const handleInitialPriceChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = sanitizeNumber(e.target.value, 1000).toString();
    onUpdate({ ...tokenomics, initialPrice: sanitized });
    
    const error = validateInitialPrice(sanitized);
    onValidationChange({ ...validationErrors, initialPrice: error || '' });
  }, [onUpdate, onValidationChange, validationErrors, tokenomics, validateInitialPrice]);

  // Calculate market cap
  const marketCap = useMemo(() => {
    const supply = parseFloat(tokenomics.totalSupply) || 0;
    const price = parseFloat(tokenomics.initialPrice) || 0;
    return (supply * price).toFixed(2);
  }, [tokenomics.totalSupply, tokenomics.initialPrice]);

  // Calculate fees
  const feeCalculation = useMemo(() => {
    const totalSupply = BigInt(tokenomics.totalSupply || '0');
    const serviceFeeAmount = (totalSupply * BigInt(1)) / BigInt(1000); // 0.1%
    const communityFeeAmount = (totalSupply * BigInt(100)) / BigInt(1000); // 10%
    const totalFeeAmount = serviceFeeAmount + communityFeeAmount;
    const netTokenAmount = totalSupply - totalFeeAmount;

    return {
      totalSupply: tokenomics.totalSupply,
      serviceFeeAmount: serviceFeeAmount.toString(),
      communityFeeAmount: communityFeeAmount.toString(),
      totalFeeAmount: totalFeeAmount.toString(),
      netTokenAmount: netTokenAmount.toString()
    };
  }, [tokenomics.totalSupply]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-2xl font-orbitron font-bold text-white mb-2">
          Tokenomics
        </h3>
        <p className="text-gray-400 font-inter">
          Configure your token's economic parameters
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Form */}
        <div className="space-y-6">
          {/* Total Supply */}
          <div>
            <label className="block text-sm font-inter font-semibold text-gray-300 mb-2">
              <TrendingUp className="w-4 h-4 inline mr-2" />
              Total Supply *
            </label>
            <input
              type="text"
              value={formatNumber(tokenomics.totalSupply)}
              onChange={handleTotalSupplyChange}
              placeholder="1,000,000,000"
              className={`w-full px-4 py-3 bg-black/30 backdrop-blur-sm border rounded-lg font-inter text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all duration-300 ${
                validationErrors.totalSupply 
                  ? 'border-red-500 focus:ring-red-500/50' 
                  : 'border-gray-600 focus:ring-neon-blue/50 focus:border-neon-blue'
              }`}
            />
            {validationErrors.totalSupply && (
              <div className="flex items-center mt-2 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 mr-2" />
                {validationErrors.totalSupply}
              </div>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Total number of tokens to be created
            </p>
          </div>

          {/* Initial Price */}
          <div>
            <label className="block text-sm font-inter font-semibold text-gray-300 mb-2">
              <DollarSign className="w-4 h-4 inline mr-2" />
              Initial Price (SOL) *
            </label>
            <input
              type="number"
              step="0.000001"
              value={tokenomics.initialPrice}
              onChange={handleInitialPriceChange}
              placeholder="0.0001"
              className={`w-full px-4 py-3 bg-black/30 backdrop-blur-sm border rounded-lg font-inter text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all duration-300 ${
                validationErrors.initialPrice 
                  ? 'border-red-500 focus:ring-red-500/50' 
                  : 'border-gray-600 focus:ring-neon-blue/50 focus:border-neon-blue'
              }`}
            />
            {validationErrors.initialPrice && (
              <div className="flex items-center mt-2 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 mr-2" />
                {validationErrors.initialPrice}
              </div>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Starting price per token in SOL
            </p>
          </div>

          {/* Community Fee */}
          <div>
            <label className="block text-sm font-inter font-semibold text-gray-300 mb-2">
              <Percent className="w-4 h-4 inline mr-2" />
              Community Fee
            </label>
            <input
              type="text"
              value="10%"
              readOnly
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">
              Fixed at 10% - Distributed to all previous token creators
            </p>
          </div>
        </div>

        {/* Right Column - Preview */}
        <div className="space-y-6">
          {/* Token Preview */}
          <div className="bg-black/20 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50">
            <h4 className="text-lg font-orbitron font-bold mb-4 flex items-center">
              <Calculator className="w-5 h-5 mr-2" />
              Token Preview
            </h4>
            
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-400">Total Supply:</span>
                <span className="font-semibold">{formatNumber(tokenomics.totalSupply || '0')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Initial Price:</span>
                <span className="font-semibold">{tokenomics.initialPrice || '0'} SOL</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Market Cap:</span>
                <span className="font-semibold text-neon-cyan">
                  {marketCap} SOL
                </span>
              </div>
            </div>
          </div>

          {/* Fee Breakdown */}
          <div className="bg-black/20 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50">
            <h4 className="text-lg font-orbitron font-bold mb-4">Fee Breakdown</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Total Supply:</span>
                <span className="font-semibold">{formatNumber(feeCalculation.totalSupply)}</span>
              </div>
              <div className="flex justify-between border-t border-gray-700 pt-2">
                <span className="text-gray-400">Service Fee (0.1%):</span>
                <span className="font-semibold text-neon-pink">-{formatNumber(feeCalculation.serviceFeeAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Community Fee (10%):</span>
                <span className="font-semibold text-neon-blue">-{formatNumber(feeCalculation.communityFeeAmount)}</span>
              </div>
              <div className="flex justify-between border-t border-gray-700 pt-2">
                <span className="text-gray-400">Total Fees:</span>
                <span className="font-semibold text-red-400">-{formatNumber(feeCalculation.totalFeeAmount)}</span>
              </div>
              <div className="flex justify-between border-t border-neon-green pt-2">
                <span className="text-gray-400 font-semibold">Net Tokens:</span>
                <span className="font-semibold text-neon-green">{formatNumber(feeCalculation.netTokenAmount)}</span>
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-black text-xs font-bold">!</span>
              </div>
              <div>
                <h4 className="text-yellow-400 font-inter font-semibold mb-1">
                  Important Notes
                </h4>
                <ul className="text-yellow-300 text-sm font-inter space-y-1">
                  <li>• Token parameters cannot be changed after creation</li>
                  <li>• Service fee goes to platform maintenance</li>
                  <li>• Community fee is distributed to previous creators</li>
                  <li>• You'll receive the net token amount</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};