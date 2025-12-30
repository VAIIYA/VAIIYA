'use client';

import React, { useState, useCallback, useMemo, useEffect } from 'react';

export const dynamic = 'force-dynamic';
import { ArrowLeft, Zap } from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletConnectButton } from '../components/WalletConnectButton';
import { NetworkIndicator } from '../components/NetworkIndicator';
import { TokenCreationModal } from '../components/TokenCreationModal';
import { CreateTokenForm } from '../components/token-creation/CreateTokenForm';
import { sanitizeTokenFormData, TokenFormData } from '../lib/sanitize';
import Link from 'next/link';

export default function CreateToken() {
  const { connected } = useWallet();
  const [mounted, setMounted] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [showTokenModal, setShowTokenModal] = useState(false);
  
  // Track if component is mounted to prevent hydration mismatches
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Memoized initial form data
  const initialFormData = useMemo(() => {
    if (mounted && typeof window !== 'undefined') {
      const saved = localStorage.getItem('memehaus_token_form');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          return sanitizeTokenFormData(
            { ...parsed, image: null },
            undefined,
            { preserveBinaryFields: true }
          );
        } catch (e) {
          console.log('Failed to parse saved form data');
        }
      }
    }
    
    return sanitizeTokenFormData({}, undefined, { preserveBinaryFields: true });
  }, [mounted]);

  const [formData, setFormData] = useState<TokenFormData>(initialFormData);

  // Memoized form handlers
  const handleFormUpdate = useCallback((data: Partial<TokenFormData>) => {
    setFormData(prev => {
      const sanitizedData = sanitizeTokenFormData({ ...prev, ...data }, prev);
      
      if (typeof window !== 'undefined') {
        const { image: _image, ...storageSafeData } = sanitizedData;
        localStorage.setItem('memehaus_token_form', JSON.stringify(storageSafeData));
      }

      return sanitizedData;
    });
  }, []);

  const handleNext = useCallback(() => {
    if (currentStep < 3) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Final step - show token creation modal
      setShowTokenModal(true);
    }
  }, [currentStep]);

  const handleBack = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  // Memoized step titles
  const stepTitles = useMemo(() => [
    'Basic Information',
    'Social Links', 
    'Tokenomics'
  ], []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 text-white">
      {/* Header */}
      <header className="px-4 py-6 md:px-8">
        <nav className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2 md:space-x-3">
            <Link href="/" className="flex items-center space-x-2">
              <ArrowLeft className="w-6 h-6 text-gray-300 hover:text-white transition-colors" />
              <Zap className="w-6 h-6 md:w-8 md:h-8 text-neon-cyan" />
              <h1 className="text-lg md:text-2xl font-orbitron font-bold bg-gradient-to-r from-neon-pink to-neon-blue bg-clip-text text-transparent">
                MemeHaus
              </h1>
            </Link>
            <div className="hidden sm:block">
              <NetworkIndicator />
            </div>
          </div>
          
          <WalletConnectButton />
        </nav>
      </header>

      {/* Main Content */}
      <main className="px-4 py-8 md:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-orbitron font-black mb-6">
              <span className="bg-gradient-to-r from-neon-pink via-neon-purple to-neon-blue bg-clip-text text-transparent">
                Create Token
              </span>
            </h1>
            <p className="text-xl text-gray-300 font-inter max-w-2xl mx-auto">
              Launch your memecoin on Solana in just 3 simple steps. 
              {!connected && (
                <span className="block mt-2 text-neon-yellow">
                  Connect your wallet to get started
                </span>
              )}
            </p>
          </div>

          {/* Wallet Connection Required */}
          {!connected && (
            <div className="max-w-md mx-auto text-center">
              <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-6 mb-8">
                <h3 className="text-lg font-inter font-semibold text-yellow-400 mb-2">
                  Wallet Required
                </h3>
                <p className="text-yellow-300 text-sm">
                  Please connect your wallet to create a token
                </p>
              </div>
            </div>
          )}

          {/* Token Creation Form */}
          {connected && (
            <CreateTokenForm
              formData={formData}
              onUpdate={handleFormUpdate}
              onNext={handleNext}
              onBack={handleBack}
              currentStep={currentStep}
              totalSteps={3}
            />
          )}
        </div>
      </main>

      {/* Token Creation Modal */}
      {showTokenModal && (
        <TokenCreationModal
          isOpen={showTokenModal}
          onClose={() => setShowTokenModal(false)}
          tokenParams={{
            name: formData.name,
            symbol: formData.symbol,
            description: formData.description,
            image: formData.image,
            imageUrl: formData.imageUrl,
            socialLinks: formData.socialLinks,
            tokenomics: formData.tokenomics
          }}
        />
      )}
    </div>
  );
}
