'use client';

import React, { memo } from 'react';

interface StatsCardProps {
  value: string | number;
  label: string;
  color: 'cyan' | 'pink' | 'purple';
  loading?: boolean;
}

const colorClasses = {
  cyan: 'text-neon-cyan',
  pink: 'text-neon-pink', 
  purple: 'text-neon-purple'
};

export const StatsCard = memo<StatsCardProps>(({ value, label, color, loading = false }) => {
  return (
    <div className="text-center p-6 bg-black/20 backdrop-blur-sm rounded-xl border border-gray-700/50">
      <div className={`text-3xl md:text-4xl font-orbitron font-bold ${colorClasses[color]} mb-2`}>
        {loading ? '...' : value}
      </div>
      <div className="text-gray-400 font-inter">{label}</div>
    </div>
  );
});

StatsCard.displayName = 'StatsCard';
