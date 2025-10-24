'use client';

import React from 'react';

type ProductListSkeletonProps = {
  theme: {
    primaryColor: string;
    backgroundColor: string;
    textColor: string;
  };
};

export function ProductListSkeleton({ theme }: ProductListSkeletonProps) {
  return (
    <div className="space-y-8">
      {/* Filter skeleton */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="h-10 flex-1 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
      </div>
      
      {/* Product grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, index) => (
          <div 
            key={index} 
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
            style={{ backgroundColor: theme.backgroundColor }}
          >
            <div className="aspect-square bg-gray-200 animate-pulse"></div>
            <div className="p-4">
              <div className="h-5 w-3/4 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse mb-3"></div>
              <div className="h-8 w-full bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}