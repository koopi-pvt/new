'use client';

import React from 'react';

type StoreSkeletonLoaderProps = {
  primaryColor?: string;
  backgroundColor?: string;
};

export function StoreSkeletonLoader({ 
  primaryColor = '#000000',
  backgroundColor = '#ffffff'
}: StoreSkeletonLoaderProps) {
  return (
    <div className="min-h-screen" style={{ backgroundColor }}>
      {/* Header skeleton */}
      <div className="border-b sticky top-0 z-50 backdrop-blur-sm" style={{ borderColor: primaryColor + '20', backgroundColor: backgroundColor + 'f0' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse"></div>
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
            <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Hero section skeleton */}
      <section className="relative py-12 sm:py-16 md:py-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl">
            <div className="h-12 w-3/4 bg-gray-200 rounded animate-pulse mb-4"></div>
            <div className="h-6 w-full bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="h-6 w-2/3 bg-gray-200 rounded animate-pulse mb-8"></div>
            <div className="h-10 w-32 bg-gray-200 rounded-full animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* About section skeleton */}
      <section className="py-12 sm:py-16 px-4 sm:px-6" style={{ backgroundColor: primaryColor + '05' }}>
        <div className="max-w-7xl mx-auto">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-6"></div>
          <div className="space-y-3">
            <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-5/6 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-4/6 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Products section skeleton */}
      <section className="py-12 sm:py-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="h-8 w-32 bg-gray-200 rounded animate-pulse mb-6"></div>
          
          {/* Product filter skeleton */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="h-10 flex-1 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
          </div>
          
          {/* Product grid skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
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
      </section>

      {/* Footer skeleton */}
      <footer className="border-t py-6 sm:py-8 px-4 sm:px-6" style={{ borderColor: primaryColor + '20' }}>
        <div className="max-w-7xl mx-auto text-center">
          <div className="h-4 w-64 bg-gray-200 rounded animate-pulse mx-auto"></div>
        </div>
      </footer>
    </div>
  );
}