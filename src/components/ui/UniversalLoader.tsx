'use client';

import React from 'react';
import Lottie from 'lottie-react';
import loadingAnimation from '../../../public/loading-animation.json';

type UniversalLoaderProps = {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  primaryColor?: string;
  backgroundColor?: string;
  fullscreen?: boolean;
  message?: string;
};

export function UniversalLoader({ 
  size = 'md', 
  primaryColor = '#000000',
  backgroundColor = '#ffffff',
  fullscreen = false,
  message = ''
}: UniversalLoaderProps) {
  const sizeMap = {
    sm: 80,
    md: 120,
    lg: 160,
    xl: 200
  };

  const loaderSize = sizeMap[size];

  const loaderContent = (
    <div className="flex flex-col items-center justify-center gap-4">
      <div 
        style={{ 
          width: loaderSize, 
          height: loaderSize,
          filter: `hue-rotate(${getHueRotation(primaryColor)}deg)`
        }}
      >
        <Lottie 
          animationData={loadingAnimation} 
          loop={true}
          style={{ width: '100%', height: '100%' }}
        />
      </div>
      {message && (
        <p 
          className="text-sm font-medium animate-pulse"
          style={{ color: primaryColor }}
        >
          {message}
        </p>
      )}
    </div>
  );

  if (fullscreen) {
    return (
      <div
        className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-sm"
        style={{ backgroundColor: backgroundColor + 'f5' }}
      >
        {loaderContent}
      </div>
    );
  }

  return loaderContent;
}

// Helper function to adjust hue based on color
function getHueRotation(color: string): number {
  // Convert hex to RGB
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Calculate hue
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  if (delta === 0) return 0;

  let hue = 0;
  if (max === r) {
    hue = ((g - b) / delta) % 6;
  } else if (max === g) {
    hue = (b - r) / delta + 2;
  } else {
    hue = (r - g) / delta + 4;
  }

  hue = Math.round(hue * 60);
  if (hue < 0) hue += 360;

  // Default animation is blue (~220deg), so rotate to target hue
  return hue - 220;
}