'use client';

import React from 'react';
import { UniversalLoader } from './UniversalLoader';

type PageLoaderProps = {
  message?: string;
  primaryColor?: string;
  backgroundColor?: string;
};

export function PageLoader({
  message = 'Loading...',
  primaryColor = '#000000',
  backgroundColor = '#f5f5f7'
}: PageLoaderProps) {
  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ backgroundColor }}
    >
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>
      <div className="relative z-10">
        <UniversalLoader
          size="lg"
          primaryColor={primaryColor}
          backgroundColor={backgroundColor}
          message={message}
        />
      </div>
    </div>
  );
}