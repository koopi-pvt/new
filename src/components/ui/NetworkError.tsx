'use client';

import React from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';

export default function NetworkError() {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 bg-white z-[100] flex items-center justify-center">
      <div className="text-center">
        <WifiOff className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Connection Error</h1>
        <p className="text-gray-600 mb-6">
          Please check your internet connection and try again.
        </p>
        <button
          onClick={handleRetry}
          className="flex items-center gap-2 px-5 py-2.5 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-900 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>
      </div>
    </div>
  );
}