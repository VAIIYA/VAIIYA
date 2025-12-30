'use client';

import React, { useState, useCallback } from 'react';
import { Upload, X, AlertCircle } from 'lucide-react';
import { sanitizeTokenName, sanitizeTokenSymbol, sanitizeString } from '../../lib/sanitize';

interface TokenFormStep1Props {
  formData: {
    name: string;
    symbol: string;
    description: string;
    image: File | null;
    imageUrl?: string;
  };
  onUpdate: (data: Partial<TokenFormStep1Props['formData']>) => void;
  validationErrors: { [key: string]: string };
  onValidationChange: (errors: { [key: string]: string }) => void;
}

export const TokenFormStep1: React.FC<TokenFormStep1Props> = ({
  formData,
  onUpdate,
  validationErrors,
  onValidationChange
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  // Validation functions
  const validateTokenName = useCallback((name: string) => {
    if (!name.trim()) return 'Token name is required';
    if (name.length < 3) return 'Token name must be at least 3 characters';
    if (name.length > 32) return 'Token name must be less than 32 characters';
    if (!/^[a-zA-Z0-9\s]+$/.test(name)) return 'Token name can only contain letters, numbers, and spaces';
    return null;
  }, []);

  const validateTokenSymbol = useCallback((symbol: string) => {
    if (!symbol.trim()) return 'Token symbol is required';
    if (symbol.length < 2) return 'Token symbol must be at least 2 characters';
    if (symbol.length > 10) return 'Token symbol must be less than 10 characters';
    if (!/^[a-zA-Z0-9]+$/.test(symbol)) return 'Token symbol can only contain letters and numbers';
    return null;
  }, []);

  const validateDescription = useCallback((description: string) => {
    if (description.length > 500) return 'Description must be less than 500 characters';
    return null;
  }, []);

  // Handle input changes with validation
  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = sanitizeTokenName(e.target.value);
    onUpdate({ name: sanitized });
    
    const error = validateTokenName(sanitized);
    onValidationChange({ ...validationErrors, name: error || '' });
  }, [onUpdate, onValidationChange, validationErrors, validateTokenName]);

  const handleSymbolChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = sanitizeTokenSymbol(e.target.value);
    onUpdate({ symbol: sanitized });
    
    const error = validateTokenSymbol(sanitized);
    onValidationChange({ ...validationErrors, symbol: error || '' });
  }, [onUpdate, onValidationChange, validationErrors, validateTokenSymbol]);

  const handleDescriptionChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const sanitized = sanitizeString(e.target.value, 500);
    onUpdate({ description: sanitized });
    
    const error = validateDescription(sanitized);
    onValidationChange({ ...validationErrors, description: error || '' });
  }, [onUpdate, onValidationChange, validationErrors, validateDescription]);

  // Image handling
  const handleFileUpload = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      onValidationChange({ ...validationErrors, image: 'Please select a valid image file' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      onValidationChange({ ...validationErrors, image: 'Image size must be less than 5MB' });
      return;
    }

    // Clear previous validation error
    onValidationChange({ ...validationErrors, image: '' });

    // Create preview
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    onUpdate({ image: file });

    // Clean up old preview
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
  }, [onUpdate, onValidationChange, validationErrors, previewUrl]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  }, [handleFileUpload]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  }, [handleFileUpload]);

  const removeImage = useCallback(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl('');
    onUpdate({ image: null });
    onValidationChange({ ...validationErrors, image: '' });
  }, [previewUrl, onUpdate, onValidationChange, validationErrors]);

  return (
    <div className="space-y-8">
      {/* Token Name */}
      <div>
        <label className="block text-sm font-inter font-semibold text-gray-300 mb-2">
          Token Name *
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={handleNameChange}
          placeholder="e.g., My Awesome Token"
          className={`w-full px-4 py-3 bg-black/30 backdrop-blur-sm border rounded-lg font-inter text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all duration-300 ${
            validationErrors.name 
              ? 'border-red-500 focus:ring-red-500/50' 
              : 'border-gray-600 focus:ring-neon-blue/50 focus:border-neon-blue'
          }`}
        />
        {validationErrors.name && (
          <div className="flex items-center mt-2 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 mr-2" />
            {validationErrors.name}
          </div>
        )}
      </div>

      {/* Token Symbol */}
      <div>
        <label className="block text-sm font-inter font-semibold text-gray-300 mb-2">
          Token Symbol *
        </label>
        <input
          type="text"
          value={formData.symbol}
          onChange={handleSymbolChange}
          placeholder="e.g., MAT"
          className={`w-full px-4 py-3 bg-black/30 backdrop-blur-sm border rounded-lg font-inter text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all duration-300 ${
            validationErrors.symbol 
              ? 'border-red-500 focus:ring-red-500/50' 
              : 'border-gray-600 focus:ring-neon-blue/50 focus:border-neon-blue'
          }`}
        />
        {validationErrors.symbol && (
          <div className="flex items-center mt-2 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 mr-2" />
            {validationErrors.symbol}
          </div>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-inter font-semibold text-gray-300 mb-2">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={handleDescriptionChange}
          placeholder="Describe your token..."
          rows={4}
          className={`w-full px-4 py-3 bg-black/30 backdrop-blur-sm border rounded-lg font-inter text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition-all duration-300 resize-none ${
            validationErrors.description 
              ? 'border-red-500 focus:ring-red-500/50' 
              : 'border-gray-600 focus:ring-neon-blue/50 focus:border-neon-blue'
          }`}
        />
        {validationErrors.description && (
          <div className="flex items-center mt-2 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 mr-2" />
            {validationErrors.description}
          </div>
        )}
      </div>

      {/* Image Upload */}
      <div>
        <label className="block text-sm font-inter font-semibold text-gray-300 mb-2">
          Token Image
        </label>
        
        {previewUrl ? (
          <div className="relative">
            <img
              src={previewUrl}
              alt="Token preview"
              className="w-32 h-32 object-cover rounded-lg border border-gray-600"
            />
            <button
              onClick={removeImage}
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        ) : (
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ${
              dragActive 
                ? 'border-neon-blue bg-neon-blue/10' 
                : 'border-gray-600 hover:border-neon-blue/50'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400 font-inter">
              Drag and drop an image here, or{' '}
              <label className="text-neon-blue cursor-pointer hover:text-neon-cyan">
                browse files
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileInput}
                  className="hidden"
                />
              </label>
            </p>
            <p className="text-xs text-gray-500 mt-2">
              PNG, JPG, GIF up to 5MB
            </p>
          </div>
        )}
        
        {validationErrors.image && (
          <div className="flex items-center mt-2 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4 mr-2" />
            {validationErrors.image}
          </div>
        )}
      </div>
    </div>
  );
};
