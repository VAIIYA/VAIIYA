'use client';

import React, { memo } from 'react';

interface LoadingSkeletonProps {
  count?: number;
}

export const LoadingSkeleton = memo<LoadingSkeletonProps>(({ count = 4 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div 
          key={index}
          className="bg-black/30 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50 animate-pulse"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gray-700 rounded-full"></div>
              <div>
                <div className="h-6 bg-gray-700 rounded w-32 mb-2"></div>
                <div className="h-4 bg-gray-700 rounded w-20"></div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-6">
              <div className="h-4 bg-gray-700 rounded w-16"></div>
              <div className="h-4 bg-gray-700 rounded w-16"></div>
              <div className="h-4 bg-gray-700 rounded w-16"></div>
              <div className="h-4 bg-gray-700 rounded w-16"></div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
});

LoadingSkeleton.displayName = 'LoadingSkeleton';
