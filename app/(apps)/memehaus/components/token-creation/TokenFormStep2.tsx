'use client';

import React, { useCallback } from 'react';
import { Twitter, MessageCircle, Globe, AlertCircle } from 'lucide-react';
import { sanitizeUrl, sanitizeTwitterHandle, sanitizeTelegramHandle } from '../../lib/sanitize';

interface TokenFormStep2Props {
  socialLinks: {
    twitter: string;
    telegram: string;
    website: string;
  };
  onUpdate: (socialLinks: TokenFormStep2Props['socialLinks']) => void;
  validationErrors: { [key: string]: string };
  onValidationChange: (errors: { [key: string]: string }) => void;
}

export const TokenFormStep2: React.FC<TokenFormStep2Props> = ({
  socialLinks,
  onUpdate,
  validationErrors,
  onValidationChange
}) => {
  // Validation functions
  const validateTwitter = useCallback((twitter: string) => {
    if (!twitter) return null; // Optional field
    if (twitter.length > 15) return 'Twitter handle must be less than 15 characters';
    if (!/^[a-zA-Z0-9_]+$/.test(twitter)) return 'Twitter handle can only contain letters, numbers, and underscores';
    return null;
  }, []);

  const validateTelegram = useCallback((telegram: string) => {
    if (!telegram) return null; // Optional field
    if (telegram.length > 32) return 'Telegram handle must be less than 32 characters';
    if (!/^[a-zA-Z0-9_]+$/.test(telegram)) return 'Telegram handle can only contain letters, numbers, and underscores';
    return null;
  }, []);

  const validateWebsite = useCallback((website: string) => {
    if (!website) return null; // Optional field
    try {
      const url = new URL(website);
      if (!['http:', 'https:'].includes(url.protocol)) {
        return 'Website must use HTTP or HTTPS protocol';
      }
      return null;
    } catch {
      return 'Please enter a valid website URL';
    }
  }, []);

  // Handle input changes with validation
  const handleTwitterChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = sanitizeTwitterHandle(e.target.value);
    onUpdate({ ...socialLinks, twitter: sanitized });
    
    const error = validateTwitter(sanitized);
    onValidationChange({ ...validationErrors, twitter: error || '' });
  }, [onUpdate, onValidationChange, validationErrors, socialLinks, validateTwitter]);

  const handleTelegramChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = sanitizeTelegramHandle(e.target.value);
    onUpdate({ ...socialLinks, telegram: sanitized });
    
    const error = validateTelegram(sanitized);
    onValidationChange({ ...validationErrors, telegram: error || '' });
  }, [onUpdate, onValidationChange, validationErrors, socialLinks, validateTelegram]);

  const handleWebsiteChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = sanitizeUrl(e.target.value);
    onUpdate({ ...socialLinks, website: sanitized });
    
    const error = validateWebsite(sanitized);
    onValidationChange({ ...validationErrors, website: error || '' });
  }, [onUpdate, onValidationChange, validationErrors, socialLinks, validateWebsite]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-2xl font-orbitron font-bold text-white mb-2">
          Social Links
        </h3>
        <p className="text-gray-400 font-inter">
          Add your social media links to help people discover your token (optional)
        </p>
      </div>

      {/* Twitter */}
      <div>
        <label className="block text-sm font-inter font-semibold text-gray-300 mb-2">
          <Twitter className="w-4 h-4 inline mr-2" />
          Twitter Handle
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 font-inter">
            @
          </span>
          <input
            type="text"
            value={socialLinks.twitter}
            onChange={handleTwitterChange}
            placeholder="your_twitter_handle"
            className={`w-full pl-8 pr-4 py-3 bg-black/30 backdrop-blur-sm border rounded-lg font-inter text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all duration-300 ${
              validationErrors.twitter 
                ? 'border-red-500 focus:ring-red-500/50' 
                : 'border-gray-600 focus:ring-neon-blue/50 focus:border-neon-blue'
            }`}
          />
        </div>
        {validationErrors.twitter && (
          <div className="flex items-center mt-2 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 mr-2" />
            {validationErrors.twitter}
          </div>
        )}
        <p className="text-xs text-gray-500 mt-1">
          Enter your Twitter handle without the @ symbol
        </p>
      </div>

      {/* Telegram */}
      <div>
        <label className="block text-sm font-inter font-semibold text-gray-300 mb-2">
          <MessageCircle className="w-4 h-4 inline mr-2" />
          Telegram Handle
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 font-inter">
            @
          </span>
          <input
            type="text"
            value={socialLinks.telegram}
            onChange={handleTelegramChange}
            placeholder="your_telegram_handle"
            className={`w-full pl-8 pr-4 py-3 bg-black/30 backdrop-blur-sm border rounded-lg font-inter text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all duration-300 ${
              validationErrors.telegram 
                ? 'border-red-500 focus:ring-red-500/50' 
                : 'border-gray-600 focus:ring-neon-blue/50 focus:border-neon-blue'
            }`}
          />
        </div>
        {validationErrors.telegram && (
          <div className="flex items-center mt-2 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 mr-2" />
            {validationErrors.telegram}
          </div>
        )}
        <p className="text-xs text-gray-500 mt-1">
          Enter your Telegram handle without the @ symbol
        </p>
      </div>

      {/* Website */}
      <div>
        <label className="block text-sm font-inter font-semibold text-gray-300 mb-2">
          <Globe className="w-4 h-4 inline mr-2" />
          Website URL
        </label>
        <input
          type="url"
          value={socialLinks.website}
          onChange={handleWebsiteChange}
          placeholder="https://your-website.com"
          className={`w-full px-4 py-3 bg-black/30 backdrop-blur-sm border rounded-lg font-inter text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all duration-300 ${
            validationErrors.website 
              ? 'border-red-500 focus:ring-red-500/50' 
              : 'border-gray-600 focus:ring-neon-blue/50 focus:border-neon-blue'
          }`}
        />
        {validationErrors.website && (
          <div className="flex items-center mt-2 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 mr-2" />
            {validationErrors.website}
          </div>
        )}
        <p className="text-xs text-gray-500 mt-1">
          Enter your project website URL
        </p>
      </div>

      {/* Info Box */}
      <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-white text-xs font-bold">i</span>
          </div>
          <div>
            <h4 className="text-blue-400 font-inter font-semibold mb-1">
              Social Links Are Optional
            </h4>
            <p className="text-blue-300 text-sm font-inter">
              Adding social links helps build trust and community around your token. 
              You can always add them later if you don't have them ready now.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};