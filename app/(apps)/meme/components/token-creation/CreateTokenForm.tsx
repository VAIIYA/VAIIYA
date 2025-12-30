'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import { TokenFormStep1 } from './TokenFormStep1';
import { TokenFormStep2 } from './TokenFormStep2';
import { TokenFormStep3 } from './TokenFormStep3';
import type { TokenFormData } from '../../lib/sanitize';

interface CreateTokenFormProps {
  formData: TokenFormData;
  onUpdate: (data: Partial<TokenFormData>) => void;
  onNext: () => void;
  onBack: () => void;
  currentStep: number;
  totalSteps: number;
}

export const CreateTokenForm: React.FC<CreateTokenFormProps> = React.memo(({
  formData,
  onUpdate,
  onNext,
  onBack,
  currentStep,
  totalSteps
}) => {
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});

  // Memoized validation state
  const isStepValid = useMemo(() => {
    switch (currentStep) {
      case 1:
        return !validationErrors.name && !validationErrors.symbol && !validationErrors.description && 
               formData.name.trim() && formData.symbol.trim();
      case 2:
        return true; // Social links are optional
      case 3:
        return !validationErrors.totalSupply && !validationErrors.initialPrice && 
               !validationErrors.communityFee &&
               formData.tokenomics.totalSupply && formData.tokenomics.initialPrice;
      default:
        return false;
    }
  }, [currentStep, validationErrors, formData]);

  // Handle form data updates
  const handleFormUpdate = useCallback((data: Partial<TokenFormData>) => {
    onUpdate(data);
  }, [onUpdate]);

  // Handle validation changes
  const handleValidationChange = useCallback((errors: {[key: string]: string}) => {
    setValidationErrors(prev => ({ ...prev, ...errors }));
  }, []);

  // Render current step
  const renderStep = useCallback(() => {
    switch (currentStep) {
      case 1:
        return (
          <TokenFormStep1
            formData={{
              name: formData.name,
              symbol: formData.symbol,
              description: formData.description,
              image: formData.image,
              imageUrl: formData.imageUrl
            }}
            onUpdate={handleFormUpdate}
            validationErrors={validationErrors}
            onValidationChange={handleValidationChange}
          />
        );
      case 2:
        return (
          <TokenFormStep2
            socialLinks={formData.socialLinks}
            onUpdate={(socialLinks) => handleFormUpdate({ socialLinks })}
            validationErrors={validationErrors}
            onValidationChange={handleValidationChange}
          />
        );
      case 3:
        return (
          <TokenFormStep3
            tokenomics={formData.tokenomics}
            onUpdate={(tokenomics) => handleFormUpdate({ tokenomics })}
            validationErrors={validationErrors}
            onValidationChange={handleValidationChange}
          />
        );
      default:
        return null;
    }
  }, [currentStep, formData, validationErrors, handleFormUpdate, handleValidationChange]);

  // Step titles
  const stepTitles = useMemo(() => [
    'Basic Information',
    'Social Links',
    'Tokenomics'
  ], []);

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-orbitron font-bold text-white">
            {stepTitles[currentStep - 1]}
          </h2>
          <span className="text-sm text-gray-400 font-inter">
            Step {currentStep} of {totalSteps}
          </span>
        </div>
        
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-neon-blue to-neon-cyan h-2 rounded-full transition-all duration-500"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
        
        <div className="flex justify-between mt-2">
          {Array.from({ length: totalSteps }, (_, i) => (
            <div
              key={i}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                i + 1 <= currentStep
                  ? 'bg-gradient-to-r from-neon-blue to-neon-cyan text-white'
                  : 'bg-gray-700 text-gray-400'
              }`}
            >
              {i + 1 < currentStep ? <CheckCircle className="w-4 h-4" /> : i + 1}
            </div>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <div className="bg-black/30 backdrop-blur-sm rounded-xl border border-gray-700/50 p-8">
        {renderStep()}
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <button
          onClick={onBack}
          disabled={currentStep === 1}
          className={`flex items-center px-6 py-3 rounded-lg font-inter font-semibold transition-all duration-300 ${
            currentStep === 1
              ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white'
          }`}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </button>

        <button
          onClick={onNext}
          disabled={!isStepValid}
          className={`flex items-center px-6 py-3 rounded-lg font-inter font-semibold transition-all duration-300 ${
            isStepValid
              ? 'bg-gradient-to-r from-neon-blue to-neon-cyan hover:shadow-glow-blue text-white'
              : 'bg-gray-700 text-gray-500 cursor-not-allowed'
          }`}
        >
          {currentStep === totalSteps ? 'Create Token' : 'Next'}
          {currentStep !== totalSteps && <ArrowRight className="w-4 h-4 ml-2" />}
        </button>
      </div>
    </div>
  );
});

CreateTokenForm.displayName = 'CreateTokenForm';
