import React from 'react';
import { Zap } from 'lucide-react';

export const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex items-center justify-center space-x-2">
      <Zap className="w-6 h-6 text-neon-cyan animate-pulse" />
      <span className="font-inter font-semibold text-neon-cyan">Loading...</span>
    </div>
  );
}; 